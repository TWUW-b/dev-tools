<?php

declare(strict_types=1);

class FeedbackController
{
    private Database $db;
    private string $uploadDir;

    private const VALID_KINDS = ['bug', 'question', 'request', 'share', 'other'];
    private const VALID_TARGETS = ['app', 'manual'];
    private const VALID_STATUSES = ['open', 'in_progress', 'closed'];
    private const MAX_MESSAGE_LENGTH = 4000;
    private const MAX_CUSTOM_TAG_LENGTH = 50;
    private const MAX_LOG_ENTRIES = 15;
    private const MAX_LOG_JSON_SIZE = 512000; // 500KB
    private const MAX_PAGE_URL_LENGTH = 2000;
    private const MAX_USER_TYPE_LENGTH = 100;
    private const MAX_APP_VERSION_LENGTH = 50;

    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private const MAX_ATTACHMENTS_PER_FEEDBACK = 3;
    private const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    private const EXTENSION_MAP = [
        'image/png' => '.png',
        'image/jpeg' => '.jpg',
        'image/webp' => '.webp',
        'image/gif' => '.gif',
    ];

    public function __construct(Database $db, string $uploadDir = '')
    {
        $this->db = $db;
        $this->uploadDir = $uploadDir ? rtrim($uploadDir, '/') : __DIR__ . '/data/attachments';

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function create(array $data): array
    {
        $kind = $data['kind'] ?? null;
        if (!in_array($kind, self::VALID_KINDS, true)) {
            return $this->error('Invalid kind', 400);
        }

        $target = $data['target'] ?? null;
        if ($target !== null && !in_array($target, self::VALID_TARGETS, true)) {
            return $this->error('Invalid target', 400);
        }

        $message = trim($data['message'] ?? '');
        if ($message === '' || mb_strlen($message) > self::MAX_MESSAGE_LENGTH) {
            return $this->error('Message is required (max ' . self::MAX_MESSAGE_LENGTH . ' chars)', 400);
        }

        $customTag = $data['customTag'] ?? null;
        if ($customTag !== null && mb_strlen($customTag) > self::MAX_CUSTOM_TAG_LENGTH) {
            return $this->error('Custom tag too long (max ' . self::MAX_CUSTOM_TAG_LENGTH . ' chars)', 400);
        }

        $pageUrl = $data['pageUrl'] ?? null;
        if ($pageUrl !== null) {
            if (!is_string($pageUrl) || mb_strlen($pageUrl) > self::MAX_PAGE_URL_LENGTH) {
                return $this->error('pageUrl too long (max ' . self::MAX_PAGE_URL_LENGTH . ' chars)', 400);
            }
            if ($pageUrl !== '' && !preg_match('#^https?://#i', $pageUrl)) {
                return $this->error('pageUrl must be a valid HTTP(S) URL', 400);
            }
        }

        $userType = $data['userType'] ?? null;
        if ($userType !== null && (!is_string($userType) || mb_strlen($userType) > self::MAX_USER_TYPE_LENGTH)) {
            return $this->error('userType too long (max ' . self::MAX_USER_TYPE_LENGTH . ' chars)', 400);
        }

        $appVersion = $data['appVersion'] ?? null;
        if ($appVersion !== null && (!is_string($appVersion) || mb_strlen($appVersion) > self::MAX_APP_VERSION_LENGTH)) {
            return $this->error('appVersion too long (max ' . self::MAX_APP_VERSION_LENGTH . ' chars)', 400);
        }

        $consoleLogs = $data['consoleLogs'] ?? null;
        if ($consoleLogs !== null) {
            if (!is_array($consoleLogs)) {
                return $this->error('consoleLogs must be an array', 400);
            }
            if (count($consoleLogs) > self::MAX_LOG_ENTRIES) {
                $consoleLogs = array_slice($consoleLogs, -self::MAX_LOG_ENTRIES);
            }
            $consoleJson = json_encode($consoleLogs);
            if ($consoleJson === false) {
                return $this->error('consoleLogs contains invalid data', 400);
            }
            if (strlen($consoleJson) > self::MAX_LOG_JSON_SIZE) {
                return $this->error('consoleLogs JSON too large (max 500KB)', 400);
            }
        }

        $networkLogs = $data['networkLogs'] ?? null;
        if ($networkLogs !== null) {
            if (!is_array($networkLogs)) {
                return $this->error('networkLogs must be an array', 400);
            }
            if (count($networkLogs) > self::MAX_LOG_ENTRIES) {
                $networkLogs = array_slice($networkLogs, -self::MAX_LOG_ENTRIES);
            }
            $networkJson = json_encode($networkLogs);
            if ($networkJson === false) {
                return $this->error('networkLogs contains invalid data', 400);
            }
            if (strlen($networkJson) > self::MAX_LOG_JSON_SIZE) {
                return $this->error('networkLogs JSON too large (max 500KB)', 400);
            }
        }

        $environment = $data['environment'] ?? null;
        $envJson = null;
        if ($environment !== null) {
            $envJson = json_encode($environment);
            if ($envJson === false) {
                return $this->error('environment contains invalid data', 400);
            }
        }

        $this->db->execute(
            "INSERT INTO feedbacks (kind, target, custom_tag, message, page_url, user_type, environment, app_version, console_log, network_log)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $kind,
                $target,
                $customTag,
                $message,
                $pageUrl,
                $userType,
                $envJson,
                $appVersion,
                $consoleLogs !== null ? json_encode($consoleLogs) : null,
                $networkLogs !== null ? json_encode($networkLogs) : null,
            ]
        );

        $id = $this->db->lastInsertId();
        $row = $this->db->fetchOne("SELECT * FROM feedbacks WHERE id = ?", [$id]);

        http_response_code(201);
        return ['success' => true, 'data' => $this->formatRow($row, false)];
    }

    public function list(array $params): array
    {
        $where = [];
        $binds = [];

        if (!empty($params['status']) && in_array($params['status'], self::VALID_STATUSES, true)) {
            $where[] = 'status = ?';
            $binds[] = $params['status'];
        }
        if (!empty($params['kind']) && in_array($params['kind'], self::VALID_KINDS, true)) {
            $where[] = 'kind = ?';
            $binds[] = $params['kind'];
        }
        if (!empty($params['target']) && in_array($params['target'], self::VALID_TARGETS, true)) {
            $where[] = 'target = ?';
            $binds[] = $params['target'];
        }
        if (!empty($params['custom_tag'])) {
            $where[] = 'custom_tag = ?';
            $binds[] = $params['custom_tag'];
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $row = $this->db->fetchOne("SELECT COUNT(*) as cnt FROM feedbacks f $whereClause", $binds);
        $total = (int)($row['cnt'] ?? 0);

        $page = max(1, (int) ($params['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $rows = $this->db->query(
            "SELECT f.*, (SELECT COUNT(*) FROM feedback_attachments WHERE feedback_id = f.id) AS attachment_count
             FROM feedbacks f $whereClause ORDER BY f.created_at DESC LIMIT ? OFFSET ?",
            [...$binds, $limit, $offset]
        );

        $tagRows = $this->db->query(
            "SELECT DISTINCT custom_tag FROM feedbacks WHERE custom_tag IS NOT NULL AND custom_tag != '' ORDER BY custom_tag"
        );
        $customTags = array_column($tagRows, 'custom_tag');

        return [
            'success' => true,
            'data' => array_map(fn($r) => $this->formatRow($r, false), $rows),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'customTags' => $customTags,
        ];
    }

    public function get(int $id): array
    {
        $row = $this->db->fetchOne("SELECT * FROM feedbacks WHERE id = ?", [$id]);
        if (!$row) {
            return $this->error('Not found', 404);
        }
        $data = $this->formatRow($row, true);

        $attachments = $this->db->query(
            'SELECT id, filename, original_name, mime_type, size, created_at FROM feedback_attachments WHERE feedback_id = ? ORDER BY created_at ASC',
            [$id]
        );
        $data['attachments'] = $attachments;

        return ['success' => true, 'data' => $data];
    }

    public function updateStatus(int $id, array $data): array
    {
        $status = $data['status'] ?? null;
        if (!in_array($status, self::VALID_STATUSES, true)) {
            return $this->error('Invalid status', 400);
        }

        $row = $this->db->fetchOne("SELECT * FROM feedbacks WHERE id = ?", [$id]);
        if (!$row) {
            return $this->error('Not found', 404);
        }

        $this->db->execute(
            "UPDATE feedbacks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [$status, $id]
        );

        $updated = $this->db->fetchOne("SELECT * FROM feedbacks WHERE id = ?", [$id]);

        return [
            'success' => true,
            'data' => [
                'id' => $id,
                'status' => $status,
                'updatedAt' => $updated['updated_at'],
            ],
        ];
    }

    public function delete(int $id): array
    {
        $row = $this->db->fetchOne("SELECT * FROM feedbacks WHERE id = ?", [$id]);
        if (!$row) {
            return $this->error('Not found', 404);
        }

        // 関連添付ファイルを削除
        $attachments = $this->db->query(
            'SELECT filename FROM feedback_attachments WHERE feedback_id = ?',
            [$id]
        );
        foreach ($attachments as $att) {
            $filePath = $this->uploadDir . '/' . $att['filename'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        $this->db->execute("DELETE FROM feedback_attachments WHERE feedback_id = ?", [$id]);

        $this->db->execute("DELETE FROM feedbacks WHERE id = ?", [$id]);

        return ['success' => true];
    }

    /**
     * 画像アップロード
     */
    public function uploadAttachment(int $feedbackId): array
    {
        $feedback = $this->db->fetchOne('SELECT id FROM feedbacks WHERE id = ?', [$feedbackId]);
        if (!$feedback) {
            return $this->error('Feedback not found', 404);
        }

        if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $errorCode = $_FILES['file']['error'] ?? -1;
            return $this->error("File upload failed (code: $errorCode)", 400);
        }

        $file = $_FILES['file'];

        if ($file['size'] > self::MAX_FILE_SIZE) {
            return $this->error('File too large (max 5MB)', 400);
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            return $this->error("Invalid file type: $mimeType", 400);
        }

        $count = $this->db->fetchOne(
            'SELECT COUNT(*) as cnt FROM feedback_attachments WHERE feedback_id = ?',
            [$feedbackId]
        );
        if ($count && (int)$count['cnt'] >= self::MAX_ATTACHMENTS_PER_FEEDBACK) {
            return $this->error('Maximum attachments per feedback reached (max 3)', 400);
        }

        $ext = self::EXTENSION_MAP[$mimeType] ?? '.bin';
        $filename = bin2hex(random_bytes(16)) . $ext;
        $destPath = $this->uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            return $this->error('Failed to save file', 500);
        }

        $originalName = $file['name'] ?: ('upload' . $ext);
        $this->db->execute(
            'INSERT INTO feedback_attachments (feedback_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?)',
            [$feedbackId, $filename, $originalName, $mimeType, $file['size']]
        );

        $id = $this->db->lastInsertId();
        $attachment = $this->db->fetchOne(
            'SELECT id, filename, original_name, mime_type, size, created_at FROM feedback_attachments WHERE id = ?',
            [$id]
        );

        http_response_code(201);
        return ['success' => true, 'attachment' => $attachment];
    }

    /**
     * 添付一覧
     */
    public function listAttachments(int $feedbackId): array
    {
        $attachments = $this->db->query(
            'SELECT id, filename, original_name, mime_type, size, created_at FROM feedback_attachments WHERE feedback_id = ? ORDER BY created_at ASC',
            [$feedbackId]
        );

        return ['success' => true, 'attachments' => $attachments];
    }

    /**
     * 添付削除
     */
    public function deleteAttachment(int $feedbackId, int $attachmentId): array
    {
        $attachment = $this->db->fetchOne(
            'SELECT id, filename FROM feedback_attachments WHERE id = ? AND feedback_id = ?',
            [$attachmentId, $feedbackId]
        );

        if (!$attachment) {
            return $this->error('Attachment not found', 404);
        }

        $filePath = $this->uploadDir . '/' . $attachment['filename'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $this->db->execute('DELETE FROM feedback_attachments WHERE id = ?', [$attachmentId]);

        return ['success' => true];
    }

    /**
     * JSON エクスポート
     */
    public function exportJson(): void
    {
        $feedbacks = $this->db->query(
            'SELECT * FROM feedbacks ORDER BY created_at DESC'
        );

        $allAttachments = $this->db->query(
            'SELECT id, feedback_id, filename, original_name, mime_type, size, created_at
             FROM feedback_attachments ORDER BY feedback_id, created_at ASC'
        );
        $attachmentMap = [];
        foreach ($allAttachments as $att) {
            $attachmentMap[$att['feedback_id']][] = [
                'id' => (int) $att['id'],
                'filename' => $att['filename'],
                'originalName' => $att['original_name'],
                'mimeType' => $att['mime_type'],
                'size' => (int) $att['size'],
            ];
        }

        $formatted = array_map(function ($row) use ($attachmentMap) {
            $data = $this->formatRow($row, true);
            $data['attachments'] = $attachmentMap[$row['id']] ?? [];
            return $data;
        }, $feedbacks);

        $data = [
            'exportedAt' => date('c'),
            'version' => '1.0.0',
            'total' => count($formatted),
            'feedbacks' => $formatted,
        ];

        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="feedbacks-' . date('Ymd') . '.json"');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    /**
     * CSV エクスポート
     */
    public function exportCsv(): void
    {
        $feedbacks = $this->db->query(
            'SELECT f.*, (SELECT COUNT(*) FROM feedback_attachments WHERE feedback_id = f.id) AS attachment_count
             FROM feedbacks f ORDER BY f.created_at DESC'
        );

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="feedbacks-' . date('Ymd') . '.csv"');

        $out = fopen('php://output', 'w');

        // BOM（Excel UTF-8 対応）
        fwrite($out, "\xEF\xBB\xBF");

        fputcsv($out, [
            'ID', '種別', '対象', 'タグ', 'メッセージ', 'ステータス',
            'ページURL', 'ユーザー種別', 'バージョン', '添付数', '作成日時', '更新日時',
        ]);

        foreach ($feedbacks as $row) {
            fputcsv($out, [
                $row['id'],
                $row['kind'],
                $row['target'] ?? '',
                $row['custom_tag'] ?? '',
                $row['message'],
                $row['status'],
                $row['page_url'] ?? '',
                $row['user_type'] ?? '',
                $row['app_version'] ?? '',
                $row['attachment_count'] ?? 0,
                $row['created_at'],
                $row['updated_at'],
            ]);
        }

        fclose($out);
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

        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="feedbacks-' . date('Ymd') . '.sqlite"');
        header('Content-Length: ' . filesize($dbPath));
        readfile($dbPath);
    }

    /**
     * IPベースのレート制限チェック
     * @return bool true=許可、false=制限超過
     */
    public function checkRateLimit(int $maxRequests = 10, int $windowSeconds = 60): bool
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $now = time();

        $this->db->execute("DELETE FROM rate_limits WHERE expires_at < ?", [$now]);

        $row = $this->db->fetchOne(
            "SELECT COUNT(*) as cnt FROM rate_limits WHERE ip = ? AND created_at > ?",
            [$ip, $now - $windowSeconds]
        );
        if ((int)($row['cnt'] ?? 0) >= $maxRequests) {
            return false;
        }

        $this->db->execute(
            "INSERT INTO rate_limits (ip, created_at, expires_at) VALUES (?, ?, ?)",
            [$ip, $now, $now + $windowSeconds]
        );
        return true;
    }

    private function formatRow(array $row, bool $full): array
    {
        $result = [
            'id' => (int) $row['id'],
            'kind' => $row['kind'],
            'target' => $row['target'],
            'customTag' => $row['custom_tag'],
            'message' => $row['message'],
            'status' => $row['status'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];

        if (isset($row['attachment_count'])) {
            $result['attachmentCount'] = (int) $row['attachment_count'];
        }

        if ($full) {
            $result['pageUrl'] = $row['page_url'];
            $result['userType'] = $row['user_type'];
            $result['environment'] = $row['environment'] ? json_decode($row['environment'], true) : null;
            $result['appVersion'] = $row['app_version'];
            $result['consoleLogs'] = $row['console_log'] ? json_decode($row['console_log'], true) : null;
            $result['networkLogs'] = $row['network_log'] ? json_decode($row['network_log'], true) : null;
        }

        return $result;
    }

    private function error(string $message, int $code): array
    {
        http_response_code($code);
        return ['success' => false, 'error' => $message];
    }
}
