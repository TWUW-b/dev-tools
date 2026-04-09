<?php
/**
 * Debug Notes API - Database Class
 */

declare(strict_types=1);

class Database
{
    private PDO $pdo;

    public function __construct(string $dbPath)
    {
        // ディレクトリが存在しない場合は作成
        $dir = dirname($dbPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $this->pdo = new PDO("sqlite:$dbPath", null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $this->pdo->exec('PRAGMA foreign_keys = ON');

        // スキーマ初期化
        $this->initSchema();
    }

    /**
     * スキーマを初期化
     */
    private function initSchema(): void
    {
        // meta テーブル
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS meta (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ');

        // スキーマバージョン確認
        $stmt = $this->pdo->prepare('SELECT value FROM meta WHERE key = ?');
        $stmt->execute(['schemaVersion']);
        $version = $stmt->fetchColumn();

        if ($version === false) {
            // 初期スキーマ作成
            $this->pdo->exec('
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    route TEXT NOT NULL,
                    screen_name TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    user_log TEXT,
                    steps TEXT,
                    severity TEXT,
                    status TEXT NOT NULL DEFAULT "open",
                    deleted_at DATETIME,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            ');

            // インデックス
            $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status)');
            $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at)');

            // バージョン記録
            $stmt = $this->pdo->prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
            $stmt->execute(['schemaVersion', '1']);
            $version = '1';
        }

        // v2: ログキャプチャ用カラム追加
        if ((int)$version < 2) {
            // カラムが既に存在するかチェック（部分適用からのリカバリ）
            $columns = $this->pdo->query('PRAGMA table_info(notes)')->fetchAll();
            $existingCols = array_column($columns, 'name');

            if (!in_array('console_log', $existingCols, true)) {
                $this->pdo->exec('ALTER TABLE notes ADD COLUMN console_log TEXT');
            }
            if (!in_array('network_log', $existingCols, true)) {
                $this->pdo->exec('ALTER TABLE notes ADD COLUMN network_log TEXT');
            }
            if (!in_array('environment', $existingCols, true)) {
                $this->pdo->exec('ALTER TABLE notes ADD COLUMN environment TEXT');
            }
            $this->pdo->exec("UPDATE meta SET value = '2' WHERE key = 'schemaVersion'");
            $version = '2';
        }

        // v3: テストフロー機能（test_cases, test_runs, notes拡張）
        if ((int)$version < 3) {
            $this->pdo->beginTransaction();
            try {
                // test_cases テーブル
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS test_cases (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        domain TEXT NOT NULL,
                        capability TEXT NOT NULL,
                        title TEXT NOT NULL,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_test_cases_domain ON test_cases(domain)');
                $this->pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_test_cases_unique ON test_cases(domain, capability, title)');

                // test_runs テーブル
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS test_runs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        case_id INTEGER NOT NULL REFERENCES test_cases(id),
                        result TEXT NOT NULL,
                        note_id INTEGER,
                        env TEXT NOT NULL DEFAULT \'dev\',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_test_runs_case_id ON test_runs(case_id)');

                // notes テーブル拡張
                $columns = $this->pdo->query('PRAGMA table_info(notes)')->fetchAll();
                $existingCols = array_column($columns, 'name');

                if (!in_array('source', $existingCols, true)) {
                    $this->pdo->exec("ALTER TABLE notes ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'");
                }
                if (!in_array('test_case_id', $existingCols, true)) {
                    $this->pdo->exec('ALTER TABLE notes ADD COLUMN test_case_id INTEGER REFERENCES test_cases(id)');
                }

                // verified → open に変換
                $this->pdo->exec("UPDATE notes SET status = 'open' WHERE status = 'verified'");

                $this->pdo->exec("UPDATE meta SET value = '3' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
            $version = '3';
        }

        // v4: no-op（履歴テーブルは v5 で削除済み）
        if ((int)$version < 4) {
            $this->pdo->exec("UPDATE meta SET value = '4' WHERE key = 'schemaVersion'");
            $version = '4';
        }

        // v5: note_status_history テーブル削除（rejected ステータスで代替）
        if ((int)$version < 5) {
            $this->pdo->exec('DROP TABLE IF EXISTS note_status_history');
            $this->pdo->exec("UPDATE meta SET value = '5' WHERE key = 'schemaVersion'");
            $version = '5';
        }

        // v6: note_test_cases 中間テーブル（1ノート → 複数テストケース）
        if ((int)$version < 6) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS note_test_cases (
                        note_id INTEGER NOT NULL REFERENCES notes(id),
                        case_id INTEGER NOT NULL REFERENCES test_cases(id),
                        PRIMARY KEY (note_id, case_id)
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_ntc_case_id ON note_test_cases(case_id)');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_ntc_note_id ON note_test_cases(note_id)');

                // 既存データ移行
                $this->pdo->exec('
                    INSERT OR IGNORE INTO note_test_cases (note_id, case_id)
                    SELECT id, test_case_id FROM notes WHERE test_case_id IS NOT NULL
                ');

                $this->pdo->exec("UPDATE meta SET value = '6' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }

        // v7: feedback 機能統合（api/feedback/ からの移行）
        if ((int)$version < 7) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS feedbacks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        kind TEXT NOT NULL,
                        target TEXT,
                        custom_tag TEXT,
                        message TEXT NOT NULL,
                        page_url TEXT,
                        user_type TEXT,
                        environment TEXT,
                        app_version TEXT,
                        console_log TEXT,
                        network_log TEXT,
                        status TEXT NOT NULL DEFAULT \'open\',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status)');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_feedbacks_kind ON feedbacks(kind)');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at)');

                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS rate_limits (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        ip TEXT NOT NULL,
                        created_at INTEGER NOT NULL,
                        expires_at INTEGER NOT NULL
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip, created_at)');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at)');

                $this->pdo->exec("UPDATE meta SET value = '7' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
            $version = '7';
        }

        // v8: 画像添付機能（note_attachments テーブル）
        if ((int)$version < 8) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS note_attachments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        note_id INTEGER NOT NULL REFERENCES notes(id),
                        filename TEXT NOT NULL,
                        original_name TEXT NOT NULL,
                        mime_type TEXT NOT NULL,
                        size INTEGER NOT NULL,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON note_attachments(note_id)');

                $this->pdo->exec("UPDATE meta SET value = '8' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }

        // v9: フィードバック画像添付機能（feedback_attachments テーブル）
        if ((int)$version < 9) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS feedback_attachments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        feedback_id INTEGER NOT NULL REFERENCES feedbacks(id),
                        filename TEXT NOT NULL,
                        original_name TEXT NOT NULL,
                        mime_type TEXT NOT NULL,
                        size INTEGER NOT NULL,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_fb_attachments_feedback_id ON feedback_attachments(feedback_id)');

                $this->pdo->exec("UPDATE meta SET value = '9' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }

        // v10: ノートアクティビティ（コメント・ステータス変更ログ）
        if ((int)$version < 10) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec('
                    CREATE TABLE IF NOT EXISTS note_activities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        note_id INTEGER NOT NULL REFERENCES notes(id),
                        action TEXT NOT NULL,
                        content TEXT,
                        old_status TEXT,
                        new_status TEXT,
                        author TEXT,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_activities_note_id ON note_activities(note_id)');

                $this->pdo->exec("UPDATE meta SET value = '10' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }

        // v11: test_cases に case_key(不変ID) と archived_at(ソフトデリート) を追加
        if ((int)$version < 11) {
            $this->pdo->beginTransaction();
            try {
                $columns = $this->pdo->query('PRAGMA table_info(test_cases)')->fetchAll();
                $existingCols = array_column($columns, 'name');

                if (!in_array('case_key', $existingCols, true)) {
                    $this->pdo->exec('ALTER TABLE test_cases ADD COLUMN case_key TEXT');
                    // 既存行に暫定キーをバックフィル（LEGACY-<id>）
                    $this->pdo->exec("UPDATE test_cases SET case_key = 'LEGACY-' || id WHERE case_key IS NULL");
                    $this->pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_test_cases_case_key ON test_cases(case_key)');
                }
                if (!in_array('archived_at', $existingCols, true)) {
                    $this->pdo->exec('ALTER TABLE test_cases ADD COLUMN archived_at DATETIME');
                    $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_test_cases_archived_at ON test_cases(archived_at)');
                }

                $this->pdo->exec("UPDATE meta SET value = '11' WHERE key = 'schemaVersion'");
                $this->pdo->commit();
            } catch (\Exception $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }
    }

    /**
     * クエリを実行（SELECT）
     */
    public function query(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * クエリを実行（INSERT/UPDATE/DELETE）
     */
    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * 最後に挿入した ID を取得
     */
    public function lastInsertId(): int
    {
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * トランザクション開始
     */
    public function beginTransaction(): void
    {
        $this->pdo->beginTransaction();
    }

    /**
     * コミット
     */
    public function commit(): void
    {
        $this->pdo->commit();
    }

    /**
     * ロールバック
     */
    public function rollBack(): void
    {
        $this->pdo->rollBack();
    }

    /**
     * 1行取得
     */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
