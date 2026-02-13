<?php

declare(strict_types=1);

class Database
{
    private PDO $pdo;

    public function __construct(string $dbPath)
    {
        $dir = dirname($dbPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $this->pdo = new PDO('sqlite:' . $dbPath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $this->pdo->exec('PRAGMA journal_mode=WAL');
        $this->pdo->exec('PRAGMA foreign_keys=ON');
        $this->initSchema();
    }

    public function getPdo(): PDO
    {
        return $this->pdo;
    }

    private function initSchema(): void
    {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS meta (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ");

        $stmt = $this->pdo->prepare('SELECT value FROM meta WHERE key = ?');
        $stmt->execute(['schemaVersion']);
        $version = $stmt->fetchColumn();

        if ($version === false) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec("
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
                        status TEXT NOT NULL DEFAULT 'open',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ");

                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status)");
                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_feedbacks_kind ON feedbacks(kind)");
                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at)");

                // Rate limiting table
                $this->pdo->exec("
                    CREATE TABLE IF NOT EXISTS rate_limits (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        ip TEXT NOT NULL,
                        created_at INTEGER NOT NULL,
                        expires_at INTEGER NOT NULL
                    )
                ");
                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip, created_at)");
                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at)");

                $stmt = $this->pdo->prepare('INSERT INTO meta (key, value) VALUES (?, ?)');
                $stmt->execute(['schemaVersion', '3']);

                $this->pdo->commit();
            } catch (Throwable $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        } elseif ((int) $version < 2) {
            // Migration v1 -> v2: add rate_limits table
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec("
                    CREATE TABLE IF NOT EXISTS rate_limits (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        ip TEXT NOT NULL,
                        created_at INTEGER NOT NULL,
                        expires_at INTEGER NOT NULL
                    )
                ");
                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip, created_at)");
                $this->pdo->exec("CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at)");

                $this->pdo->prepare('UPDATE meta SET value = ? WHERE key = ?')->execute(['2', 'schemaVersion']);

                $this->pdo->commit();
            } catch (Throwable $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        } elseif ((int) $version < 3) {
            // Migration v2 -> v3: make target column nullable
            $this->pdo->beginTransaction();
            try {
                // 1. 新しいテーブルを作成（target TEXT に変更）
                $this->pdo->exec("
                    CREATE TABLE feedbacks_new (
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
                        status TEXT NOT NULL DEFAULT 'open',
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                ");

                // 2. データ件数を取得（P2-1）
                $oldCount = (int) $this->pdo->query("SELECT COUNT(*) FROM feedbacks")->fetchColumn();

                // 3. データをコピー（P0-2: カラム名を明示的に指定）
                $this->pdo->exec("
                    INSERT INTO feedbacks_new (
                        id, kind, target, custom_tag, message, page_url,
                        user_type, environment, app_version, console_log,
                        network_log, status, created_at, updated_at
                    )
                    SELECT
                        id, kind, target, custom_tag, message, page_url,
                        user_type, environment, app_version, console_log,
                        network_log, status, created_at, updated_at
                    FROM feedbacks
                ");

                // 4. コピー後の件数を確認（P2-1）
                $newCount = (int) $this->pdo->query("SELECT COUNT(*) FROM feedbacks_new")->fetchColumn();
                if ($oldCount !== $newCount) {
                    throw new RuntimeException("Migration failed: data count mismatch (old: $oldCount, new: $newCount)");
                }

                // 5. 古いテーブルをリネーム（P0-1: 削除ではなく退避）
                $this->pdo->exec("ALTER TABLE feedbacks RENAME TO feedbacks_old");

                // 6. 新しいテーブルをリネーム
                $this->pdo->exec("ALTER TABLE feedbacks_new RENAME TO feedbacks");

                // 7. インデックスを再作成（P1-1: IF NOT EXISTS を削除）
                $this->pdo->exec("CREATE INDEX idx_feedbacks_status ON feedbacks(status)");
                $this->pdo->exec("CREATE INDEX idx_feedbacks_kind ON feedbacks(kind)");
                $this->pdo->exec("CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at)");

                // 8. スキーマバージョンを更新
                $this->pdo->prepare('UPDATE meta SET value = ? WHERE key = ?')->execute(['3', 'schemaVersion']);

                // 9. トランザクション成功後に旧テーブルを削除（P0-1）
                $this->pdo->exec("DROP TABLE feedbacks_old");

                $this->pdo->commit();
            } catch (Throwable $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }
    }
}
