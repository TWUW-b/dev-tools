---
title: test_cases に安定キー(case_key)を導入し、タイトル変更で履歴を失わないようにする
status: draft
---

# 背景

現状の `test_cases` は `(domain, capability, title)` が実質の識別キーになっており、`importCases` は `INSERT OR IGNORE` のみ。これにより:

1. MD 側でタイトルを 1 文字でも書き換えると、新しい id で行が生成される
2. 旧行を `DELETE /test-cases` で purge すると、`TestController.php:224` の cascade で `test_runs` が物理削除される(実績: 2026-04-09 に kumonos dev で発生、実行履歴が全消失)
3. 結果として「MD 修正 → 再 import」の通常運用ができない

`UPDATE` 系エンドポイントも存在しないため、title 修正は事実上不可能。

# 方針

`test_cases` に **不変の安定キー** `case_key` を導入し、importCases を UPSERT 化する。

## スキーマ変更

```sql
ALTER TABLE test_cases ADD COLUMN case_key TEXT;
CREATE UNIQUE INDEX idx_test_cases_case_key ON test_cases(case_key);

-- 既存行には暫定 case_key をバックフィル(例: 'LEGACY-' || id)
UPDATE test_cases SET case_key = 'LEGACY-' || id WHERE case_key IS NULL;
```

- `Database.php` のマイグレーションブロックに追加
- NOT NULL はバックフィル完了後にアプリ層で enforce(SQLite の都合)

## importCases 改修

```php
INSERT INTO test_cases (case_key, domain, capability, title)
VALUES (?, ?, ?, ?)
ON CONFLICT(case_key) DO UPDATE SET
  domain = excluded.domain,
  capability = excluded.capability,
  title = excluded.title;
```

入力 payload に `case_key` 必須化。未指定はエラー。

## 廃止ケースの扱い

物理削除は禁止。`archived_at TIMESTAMP NULL` 列を追加し、ソフトデリートへ切り替える:

```sql
ALTER TABLE test_cases ADD COLUMN archived_at TEXT;
```

- 一覧取得 API デフォルトは `archived_at IS NULL`
- `?includeArchived=1` で全件
- `DELETE /test-cases` は **archive** 動作に変更(`UPDATE test_cases SET archived_at = CURRENT_TIMESTAMP`)。`test_runs` / `note_test_cases` には一切触れない
- 物理削除が必要な場合は別途 `POST /test-cases/purge-archived` のような明示的エンドポイントを用意し、古い archived 行のみ対象

# 影響範囲

- `api/Database.php` マイグレーション
- `api/TestController.php` importCases / listCases / deleteCases
- `api/openapi.yaml` 更新
- `tests/api/test-cases.test.ts` 更新(case_key 必須化)
- 管理画面 SPA: case_key 表示(一覧/詳細に薄く出す程度)
- 外部 import スクリプト(kumonos-devtools-deploy の `import-test-cases.js` 等): case_key を MD から抽出して送信する対応が必要 → 別 draft で管理

# 未解決事項

- `case_key` の採番ルールは呼び出し側(MD)の責務にする想定。dev-tools は一意性のみ保証
- 既存 `LEGACY-*` を移行するためのリナンバリング API を用意するか
