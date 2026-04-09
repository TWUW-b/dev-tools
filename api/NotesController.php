<?php
/**
 * Debug Notes API - Notes Controller
 */

declare(strict_types=1);

class NotesController
{
    private Database $db;

    // 上限
    private const MAX_CONTENT_LENGTH = 4000;
    private const MAX_USER_LOG_LENGTH = 20000;
    private const MAX_LOG_JSON_LENGTH = 500000; // 500KB
    private const MAX_NOTES_COUNT = 500;
    private const MAX_COMMENT_LENGTH = 2000;
    private const MAX_AUTHOR_LENGTH = 100;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    /**
     * 一覧取得
     */
    public function index(array $params): array
    {
        $sql = 'SELECT id, route, screen_name, title, content, user_log, steps, severity, status, deleted_at, created_at, source, test_case_id, (SELECT COUNT(*) FROM note_attachments WHERE note_id = notes.id) as attachment_count, (SELECT content FROM note_activities WHERE note_id = notes.id AND content IS NOT NULL AND content != \'\' ORDER BY id DESC LIMIT 1) as latest_comment FROM notes WHERE 1=1';
        $bindings = [];

        // 削除済み除外
        if (empty($params['includeDeleted'])) {
            $sql .= ' AND deleted_at IS NULL';
        }

        // ステータスフィルタ
        if (!empty($params['status'])) {
            $sql .= ' AND status = ?';
            $bindings[] = $params['status'];
        }

        // 検索
        if (!empty($params['q'])) {
            $sql .= " AND (title LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\')";
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $params['q']);
            $q = '%' . $escaped . '%';
            $bindings[] = $q;
            $bindings[] = $q;
        }

        $sql .= ' ORDER BY created_at DESC';

        $notes = $this->db->query($sql, $bindings);

        // test_case_ids + test_cases 情報を一括取得
        $noteIds = array_column($notes, 'id');
        if (!empty($noteIds)) {
            $placeholders = implode(',', array_fill(0, count($noteIds), '?'));
            $mappings = $this->db->query(
                "SELECT ntc.note_id, ntc.case_id, tc.case_key, tc.domain, tc.capability, tc.title
                 FROM note_test_cases ntc
                 LEFT JOIN test_cases tc ON tc.id = ntc.case_id
                 WHERE ntc.note_id IN ($placeholders)",
                $noteIds
            );

            $caseIdMap = [];
            $caseInfoMap = [];
            foreach ($mappings as $m) {
                $caseIdMap[$m['note_id']][] = (int)$m['case_id'];
                $caseInfoMap[$m['note_id']][] = [
                    'id' => (int)$m['case_id'],
                    'case_key' => $m['case_key'] ?? null,
                    'domain' => $m['domain'] ?? null,
                    'capability' => $m['capability'] ?? null,
                    'title' => $m['title'] ?? null,
                ];
            }

            foreach ($notes as &$note) {
                $note['test_case_ids'] = $caseIdMap[$note['id']] ?? [];
                $note['test_cases'] = $caseInfoMap[$note['id']] ?? [];
            }
        }

        return [
            'success' => true,
            'data' => $notes,
        ];
    }

    /**
     * 詳細取得
     */
    public function show(int $id): array
    {
        $note = $this->db->fetchOne(
            'SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL',
            [$id]
        );

        if (!$note) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        // test_case_ids を取得
        $mappings = $this->db->query(
            'SELECT case_id FROM note_test_cases WHERE note_id = ?',
            [$id]
        );
        $note['test_case_ids'] = array_map(fn($m) => (int)$m['case_id'], $mappings);

        // 添付ファイル一覧
        $attachments = $this->db->query(
            'SELECT id, filename, original_name, mime_type, size, created_at FROM note_attachments WHERE note_id = ?',
            [$id]
        );
        $note['attachments'] = $attachments;

        // アクティビティ一覧
        $activities = $this->db->query(
            'SELECT * FROM note_activities WHERE note_id = ? ORDER BY created_at ASC',
            [$id]
        );
        $note['activities'] = $activities;

        return [
            'success' => true,
            'note' => $this->hydrateNote($note),
        ];
    }

    /**
     * 新規作成
     */
    public function create(array $input): array
    {
        // バリデーション
        $errors = $this->validateCreate($input);
        if (!empty($errors)) {
            return ['success' => false, 'error' => implode(', ', $errors)];
        }

        // 件数チェック
        $count = $this->db->fetchOne('SELECT COUNT(*) as cnt FROM notes WHERE deleted_at IS NULL');
        if ($count && (int) $count['cnt'] >= self::MAX_NOTES_COUNT) {
            return ['success' => false, 'error' => 'Maximum notes count reached'];
        }

        // steps を JSON 文字列に変換
        $steps = null;
        if (!empty($input['steps']) && is_array($input['steps'])) {
            $steps = json_encode($input['steps'], JSON_UNESCAPED_UNICODE);
        }

        // ログ系カラムのバリデーション + エンコード
        $consoleLogs = $this->encodeLogColumn($input['consoleLogs'] ?? null, true);
        $networkLogs = $this->encodeLogColumn($input['networkLogs'] ?? null, true);
        $environment = $this->encodeLogColumn($input['environment'] ?? null, false);

        // title が未指定の場合は content の1行目から自動生成
        $title = $input['title'] ?? '';
        if (empty(trim($title))) {
            $firstLine = strtok(trim($input['content']), "\n") ?: '';
            $title = mb_strlen($firstLine) > 80 ? mb_substr($firstLine, 0, 80) . '...' : $firstLine;
        }

        // source / test_case_id(s)
        $source = in_array($input['source'] ?? '', ['manual', 'test'], true)
            ? $input['source']
            : 'manual';

        // testCaseIds 配列対応（旧 testCaseId 単一も互換）
        $testCaseIds = [];
        if (!empty($input['testCaseIds']) && is_array($input['testCaseIds'])) {
            $testCaseIds = array_map('intval', $input['testCaseIds']);
        } elseif (isset($input['testCaseId'])) {
            $testCaseIds = [(int)$input['testCaseId']];
        }

        // caseIds の存在チェック
        $validCaseIds = [];
        foreach ($testCaseIds as $caseId) {
            if ($caseId > 0) {
                $exists = $this->db->fetchOne('SELECT id FROM test_cases WHERE id = ?', [$caseId]);
                if ($exists) {
                    $validCaseIds[] = $caseId;
                }
            }
        }

        // notes.test_case_id は先頭のIDを格納（後方互換）
        $testCaseId = !empty($validCaseIds) ? $validCaseIds[0] : null;

        // 挿入
        $this->db->execute(
            'INSERT INTO notes (route, screen_name, title, content, user_log, steps, severity, status, console_log, network_log, environment, source, test_case_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $input['route'] ?? '',
                $input['screenName'] ?? '',
                $title,
                $input['content'],
                $input['userLog'] ?? null,
                $steps,
                $input['severity'] ?? null,
                'open',
                $consoleLogs,
                $networkLogs,
                $environment,
                $source,
                $testCaseId,
            ]
        );

        $id = $this->db->lastInsertId();

        // note_test_cases に全リンクを INSERT
        foreach ($validCaseIds as $caseId) {
            $this->db->execute(
                'INSERT OR IGNORE INTO note_test_cases (note_id, case_id) VALUES (?, ?)',
                [$id, $caseId]
            );
        }

        $note = $this->db->fetchOne('SELECT * FROM notes WHERE id = ?', [$id]);

        return [
            'success' => true,
            'note' => $note ? $this->hydrateNote($note) : $note,
        ];
    }

    /**
     * ステータス更新
     */
    public function updateStatus(int $id, array $input): array
    {
        $status = $input['status'] ?? null;
        if (!in_array($status, ['open', 'resolved', 'rejected', 'fixed'], true)) {
            return ['success' => false, 'error' => 'Invalid status'];
        }

        $comment = isset($input['comment']) ? trim((string)$input['comment']) : '';
        $author = isset($input['author']) ? trim((string)$input['author']) : '';

        // バリデーション
        if ($comment !== '' && mb_strlen($comment) > self::MAX_COMMENT_LENGTH) {
            return ['success' => false, 'error' => 'Comment exceeds maximum length'];
        }
        if ($author !== '' && mb_strlen($author) > self::MAX_AUTHOR_LENGTH) {
            return ['success' => false, 'error' => 'Author exceeds maximum length'];
        }

        // fixed / rejected はコメント必須
        if (in_array($status, ['fixed', 'rejected'], true) && $comment === '') {
            return [
                'success' => false,
                'error' => $status === 'fixed'
                    ? 'Comment is required when setting status to fixed'
                    : 'Reason is required when rejecting',
            ];
        }

        $note = $this->db->fetchOne(
            'SELECT status FROM notes WHERE id = ? AND deleted_at IS NULL',
            [$id]
        );
        if (!$note) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        $oldStatus = $note['status'];
        if ($oldStatus === $status) {
            return ['success' => true]; // 同一ステータス、no-op
        }

        $this->db->execute(
            'UPDATE notes SET status = ? WHERE id = ? AND deleted_at IS NULL',
            [$status, $id]
        );

        // アクティビティ記録
        $this->db->execute(
            'INSERT INTO note_activities (note_id, action, content, old_status, new_status, author) VALUES (?, ?, ?, ?, ?, ?)',
            [$id, 'status_change', $comment !== '' ? $comment : null, $oldStatus, $status, $author !== '' ? $author : null]
        );

        return ['success' => true];
    }

    /**
     * 重要度更新
     */
    public function updateSeverity(int $id, array $input): array
    {
        $severity = $input['severity'] ?? null;
        if ($severity !== null && !in_array($severity, ['critical', 'high', 'medium', 'low'], true)) {
            return ['success' => false, 'error' => 'Invalid severity'];
        }

        $affected = $this->db->execute(
            'UPDATE notes SET severity = ? WHERE id = ? AND deleted_at IS NULL',
            [$severity, $id]
        );

        if ($affected === 0) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        return ['success' => true];
    }

    /**
     * 削除（論理削除）
     */
    public function delete(int $id): array
    {
        $affected = $this->db->execute(
            'UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
            [$id]
        );

        if ($affected === 0) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        return ['success' => true];
    }

    /**
     * アクティビティ一覧取得
     */
    public function getActivities(int $id): array
    {
        $note = $this->db->fetchOne(
            'SELECT id FROM notes WHERE id = ? AND deleted_at IS NULL',
            [$id]
        );
        if (!$note) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        $activities = $this->db->query(
            'SELECT * FROM note_activities WHERE note_id = ? ORDER BY created_at ASC',
            [$id]
        );

        return ['success' => true, 'activities' => $activities];
    }

    /**
     * コメント追加
     */
    public function addActivity(int $id, array $input): array
    {
        $content = isset($input['content']) ? trim((string)$input['content']) : '';
        if ($content === '') {
            return ['success' => false, 'error' => 'Content is required'];
        }
        if (mb_strlen($content) > self::MAX_COMMENT_LENGTH) {
            return ['success' => false, 'error' => 'Content exceeds maximum length'];
        }

        $author = isset($input['author']) ? trim((string)$input['author']) : '';
        if ($author !== '' && mb_strlen($author) > self::MAX_AUTHOR_LENGTH) {
            return ['success' => false, 'error' => 'Author exceeds maximum length'];
        }

        $note = $this->db->fetchOne(
            'SELECT id FROM notes WHERE id = ? AND deleted_at IS NULL',
            [$id]
        );
        if (!$note) {
            return ['success' => false, 'error' => 'Note not found'];
        }

        $this->db->execute(
            'INSERT INTO note_activities (note_id, action, content, author) VALUES (?, ?, ?, ?)',
            [$id, 'comment', $content, $author !== '' ? $author : null]
        );

        $activity = $this->db->fetchOne(
            'SELECT * FROM note_activities WHERE id = ?',
            [$this->db->lastInsertId()]
        );

        return ['success' => true, 'activity' => $activity];
    }

    /**
     * JSON エクスポート
     */
    public function exportJson(string $env): void
    {
        $notes = $this->db->query(
            'SELECT * FROM notes WHERE deleted_at IS NULL ORDER BY created_at DESC'
        );

        // ノートのJSON文字列カラムをデコード
        $notes = array_map(fn($n) => $this->hydrateNote($n), $notes);

        // test_case_ids を一括取得
        $noteIds = array_column($notes, 'id');
        if (!empty($noteIds)) {
            $placeholders = implode(',', array_fill(0, count($noteIds), '?'));
            $mappings = $this->db->query(
                "SELECT note_id, case_id FROM note_test_cases WHERE note_id IN ($placeholders)",
                $noteIds
            );
            $caseIdMap = [];
            foreach ($mappings as $m) {
                $caseIdMap[$m['note_id']][] = (int)$m['case_id'];
            }
            foreach ($notes as &$note) {
                $note['test_case_ids'] = $caseIdMap[$note['id']] ?? [];
            }
        }

        $testCases = $this->db->query('SELECT * FROM test_cases ORDER BY domain, capability, title');
        $testRuns = $this->db->query(
            'SELECT * FROM test_runs WHERE env = ? ORDER BY created_at DESC',
            [$env]
        );

        $data = [
            'exportedAt' => date('c'),
            'env' => $env,
            'version' => '1.0.0',
            'notes' => $notes,
            'testCases' => $testCases,
            'testRuns' => $testRuns,
        ];

        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="debug-notes-' . $env . '-' . date('Ymd') . '.json"');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    /**
     * SQLite エクスポート
     */
    public function exportSqlite(string $dbPath): void
    {
        if (!file_exists($dbPath)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Database file not found']);
            return;
        }

        $env = basename($dbPath, '.sqlite');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="debug-notes-' . $env . '-' . date('Ymd') . '.sqlite"');
        header('Content-Length: ' . filesize($dbPath));
        readfile($dbPath);
    }

    /**
     * 作成時バリデーション
     */
    private function validateCreate(array $input): array
    {
        $errors = [];

        if (empty($input['content'])) {
            $errors[] = 'content is required';
        } elseif (mb_strlen($input['content']) > self::MAX_CONTENT_LENGTH) {
            $errors[] = 'content exceeds maximum length';
        }

        if (!empty($input['userLog']) && mb_strlen($input['userLog']) > self::MAX_USER_LOG_LENGTH) {
            $errors[] = 'userLog exceeds maximum length';
        }

        if (!empty($input['severity']) && !in_array($input['severity'], ['critical', 'high', 'medium', 'low'], true)) {
            $errors[] = 'Invalid severity';
        }

        return $errors;
    }

    /**
     * ログ系カラムをバリデーション・エンコードする
     * @param mixed $data 入力データ
     * @param bool $expectArray true=配列を期待、false=オブジェクトを期待
     * @return string|null JSON文字列またはnull
     */
    private function encodeLogColumn(mixed $data, bool $expectArray): ?string
    {
        if (empty($data)) {
            return null;
        }

        if ($expectArray && !is_array($data)) {
            return null;
        }

        if (!$expectArray && !is_array($data)) {
            return null;
        }

        $json = json_encode($data, JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            return null;
        }

        // サイズ制限チェック
        if (strlen($json) > self::MAX_LOG_JSON_LENGTH) {
            return null;
        }

        return $json;
    }

    /**
     * ノートのJSON文字列カラムをデコードする
     */
    private function hydrateNote(array $note): array
    {
        foreach (['console_log', 'network_log', 'environment'] as $col) {
            if (!empty($note[$col]) && is_string($note[$col])) {
                $note[$col] = json_decode($note[$col], true);
            }
        }
        if (!empty($note['steps']) && is_string($note['steps'])) {
            $note['steps'] = json_decode($note['steps'], true);
        }
        return $note;
    }
}
