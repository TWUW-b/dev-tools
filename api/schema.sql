-- Debug Notes Schema
-- このファイルは参照用です。実際のスキーマは Database.php で自動作成されます。

CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route TEXT NOT NULL,
    screen_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_log TEXT,
    steps TEXT,
    severity TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    deleted_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

INSERT OR IGNORE INTO meta (key, value) VALUES ('schemaVersion', '1');
