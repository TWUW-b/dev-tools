# API 仕様書

`@twuw-b/dev-tools` のバックエンド API リファレンス。

API は 2 つのデプロイ形態で動作する:

| デプロイ | パス | 用途 | 認証 |
|---------|------|------|------|
| Debug Notes API | `/__debug/api` | ノート・テスト・フィードバック全機能 | `X-Admin-Key`（Feedback のみ） |
| Feedback API | `/__manual/api` | フィードバック機能のみ | `X-Admin-Key`（管理操作） |

共通仕様:
- レスポンス: `application/json; charset=utf-8`（エクスポート・添付配信を除く）
- CORS: `config.php` の `allowed_origins` に基づく
- リクエストサイズ上限: 1MB
- DB: SQLite（`Database.php` が自動マイグレーション）

---

## 目次

1. [Notes（デバッグノート）](#1-notesデバッグノート)
2. [Note Activities（コメント・履歴）](#2-note-activitiesコメント履歴)
3. [Note Attachments（ノート添付）](#3-note-attachmentsノート添付)
4. [Test Cases（テストケース）](#4-test-casesテストケース)
5. [Test Runs（テスト実行）](#5-test-runsテスト実行)
6. [Feedbacks（フィードバック）](#6-feedbacksフィードバック)
7. [Feedback Attachments（フィードバック添付）](#7-feedback-attachmentsフィードバック添付)
8. [Export（エクスポート）](#8-exportエクスポート)
9. [共通エラー](#9-共通エラー)
10. [制約一覧](#10-制約一覧)
11. [DB スキーマ](#11-db-スキーマ)

---

## 1. Notes（デバッグノート）

全エンドポイントに `?env=dev|test` クエリパラメータが必要。

### GET /notes

ノート一覧取得。

**クエリパラメータ:**

| パラメータ | 型 | デフォルト | 説明 |
|-----------|---|----------|------|
| `env` | string | `dev` | `dev` \| `test` |
| `status` | string | - | `open` \| `resolved` \| `rejected` \| `fixed` |
| `q` | string | - | title / content の全文検索 |
| `includeDeleted` | `0` \| `1` | `0` | 削除済みを含む |

**レスポンス 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "route": "/settings",
      "screen_name": "設定画面",
      "title": "保存ボタンが反応しない",
      "content": "保存ボタンをクリックしても...",
      "severity": "high",
      "status": "open",
      "source": "manual",
      "created_at": "2026-02-13T10:00:00",
      "deleted_at": null,
      "attachment_count": 2,
      "latest_comment": "再現手順を確認中",
      "test_case_ids": [1, 3]
    }
  ]
}
```

### GET /notes/{id}

ノート詳細取得。添付ファイルとアクティビティを含む。

**レスポンス 200:**

```json
{
  "success": true,
  "note": {
    "id": 1,
    "route": "/settings",
    "screen_name": "設定画面",
    "title": "保存ボタンが反応しない",
    "content": "保存ボタンをクリックしても反応がない",
    "user_log": "操作ログ...",
    "steps": ["1. 設定画面を開く", "2. 値を変更", "3. 保存をクリック"],
    "severity": "high",
    "status": "open",
    "source": "manual",
    "test_case_id": null,
    "test_case_ids": [1, 3],
    "console_log": [{"level": "error", "message": "..."}],
    "network_log": [{"url": "/api/save", "status": 500}],
    "environment": {"userAgent": "...", "viewport": "1920x1080"},
    "deleted_at": null,
    "created_at": "2026-02-13T10:00:00",
    "attachments": [
      {
        "id": 1,
        "filename": "a1b2c3d4.png",
        "original_name": "screenshot.png",
        "mime_type": "image/png",
        "size": 45678,
        "created_at": "2026-02-13T10:00:00"
      }
    ],
    "activities": [
      {
        "id": 1,
        "note_id": 1,
        "action": "status_change",
        "content": null,
        "old_status": "open",
        "new_status": "fixed",
        "author": "admin",
        "created_at": "2026-02-13T12:00:00"
      }
    ]
  }
}
```

**エラー 404:** `{"success": false, "error": "Note not found"}`

### POST /notes

ノート作成。

**リクエストボディ:**

| フィールド | 型 | 必須 | 制約 |
|-----------|---|------|------|
| `content` | string | Yes | 最大 4,000 文字 |
| `title` | string | No | 省略時は content 先頭行から自動生成（80 文字） |
| `route` | string | No | |
| `screenName` | string | No | |
| `severity` | string | No | `critical` \| `high` \| `medium` \| `low` \| `null` |
| `userLog` | string | No | 最大 20,000 文字 |
| `steps` | array | No | JSON、最大 500KB |
| `consoleLogs` | array | No | JSON、最大 500KB |
| `networkLogs` | array | No | JSON、最大 500KB |
| `environment` | object | No | JSON、最大 500KB |
| `source` | string | No | `manual`（デフォルト） \| `test` |
| `testCaseIds` | array\<int\> | No | テストケース ID の配列 |

**レスポンス 201:**

```json
{
  "success": true,
  "note": {
    "id": 1,
    "title": "保存ボタンが反応しない",
    "status": "open",
    "created_at": "2026-02-13T10:00:00"
  }
}
```

**エラー 400:** `content is required` / `content exceeds maximum length` / `Maximum notes count reached`

### PATCH /notes/{id}/status

ステータス更新。

**リクエストボディ:**

| フィールド | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `status` | string | Yes | `open` \| `resolved` \| `rejected` \| `fixed` |
| `comment` | string | No | 最大 2,000 文字 |
| `author` | string | No | 最大 100 文字 |

**レスポンス 200:** `{"success": true}`

### PATCH /notes/{id}/severity

重要度更新。

**リクエストボディ:**

| フィールド | 型 | 必須 |
|-----------|---|------|
| `severity` | string \| null | No | `critical` \| `high` \| `medium` \| `low` \| `null` |

**レスポンス 200:** `{"success": true}`

### DELETE /notes/{id}

ノート論理削除（`deleted_at` を設定）。

**レスポンス 200:** `{"success": true}`

---

## 2. Note Activities（コメント・履歴）

### GET /notes/{id}/activities

アクティビティ一覧。

**レスポンス 200:**

```json
{
  "success": true,
  "activities": [
    {
      "id": 1,
      "note_id": 1,
      "action": "comment",
      "content": "再現しました",
      "old_status": null,
      "new_status": null,
      "author": "tester",
      "created_at": "2026-02-13T12:00:00"
    }
  ]
}
```

### POST /notes/{id}/activities

コメント追加。

**リクエストボディ:**

| フィールド | 型 | 必須 | 制約 |
|-----------|---|------|------|
| `content` | string | Yes | 最大 2,000 文字、空文字不可 |
| `author` | string | No | 最大 100 文字 |

**レスポンス 201:**

```json
{
  "success": true,
  "activity": {
    "id": 2,
    "note_id": 1,
    "action": "comment",
    "content": "再現しました",
    "author": "tester",
    "created_at": "2026-02-13T12:00:00"
  }
}
```

---

## 3. Note Attachments（ノート添付）

### POST /notes/{id}/attachments

画像アップロード。`multipart/form-data` で送信。

**リクエスト:** `file` フィールドに画像ファイル

| 制約 | 値 |
|------|---|
| 最大サイズ | 5MB |
| 許可 MIME | `image/png`, `image/jpeg`, `image/webp`, `image/gif` |
| 最大数/ノート | 5 |

**レスポンス 201:**

```json
{
  "success": true,
  "attachment": {
    "id": 1,
    "note_id": 1,
    "filename": "a1b2c3d4e5f6...png",
    "original_name": "screenshot.png",
    "mime_type": "image/png",
    "size": 45678,
    "created_at": "2026-02-13T10:00:00"
  }
}
```

### GET /notes/{id}/attachments

添付一覧。

**レスポンス 200:**

```json
{
  "success": true,
  "attachments": [...]
}
```

### DELETE /notes/{id}/attachments/{attachmentId}

添付削除（ファイルも削除）。

**レスポンス 200:** `{"success": true}`

### GET /attachments/{filename}

添付ファイルのバイナリ配信。JSON ではなく画像バイナリを返す。

**レスポンスヘッダー:**

```
Content-Type: image/png
Content-Length: 45678
Cache-Control: public, max-age=86400
```

**エラー 400:** パストラバーサル検出時（`/`, `\`, `..` を含む filename）

---

## 4. Test Cases（テストケース）

### GET /test-cases

テストケース一覧。

**レスポンス 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "domain": "認証",
      "capability": "ログイン",
      "title": "正しい認証情報でログインできる",
      "created_at": "2026-02-13T10:00:00"
    }
  ]
}
```

### POST /test-cases/import

テストケース一括インポート。重複は無視（`INSERT OR IGNORE`）。

**リクエストボディ:**

```json
{
  "cases": [
    {
      "domain": "認証",
      "capability": "ログイン",
      "title": "正しい認証情報でログインできる"
    }
  ]
}
```

| 制約 | 値 |
|------|---|
| `domain` | 最大 200 文字 |
| `capability` | 最大 200 文字 |
| `title` | 最大 500 文字 |
| 最大件数/リクエスト | 1,000 |

**レスポンス 200:** `{"success": true, "total": 42}`

### DELETE /test-cases

テストケース一括削除。関連する test_runs、note_test_cases も連動削除。

**リクエストボディ:**

```json
{
  "ids": [1, 2, 3]
}
```

最大 100 件/リクエスト。

**レスポンス 200:** `{"success": true, "deleted": 3}`

### GET /test-cases/tree

テストツリー取得。domain → capability → cases の階層構造で、テスト結果と未解決ノート数を集計。

**レスポンス 200:**

```json
{
  "success": true,
  "data": [
    {
      "domain": "認証",
      "capabilities": [
        {
          "capability": "ログイン",
          "total": 5,
          "passed": 3,
          "failed": 1,
          "status": "fail",
          "openIssues": 2,
          "cases": [
            {
              "caseId": 1,
              "title": "正しい認証情報でログインできる",
              "last": "pass",
              "openIssues": 0
            }
          ]
        }
      ]
    }
  ]
}
```

**capability.status の決定ロジック:**

| 条件 | status |
|------|--------|
| fail あり + open ノートあり | `fail` |
| fail あり + open ノートなし | `retest` |
| 全 pass（1件以上） | `passed` |
| テスト未実行 | `null` |

---

## 5. Test Runs（テスト実行）

### POST /test-runs

テスト結果を一括送信。

**リクエストボディ:**

```json
{
  "runs": [
    {
      "caseId": 1,
      "result": "pass"
    },
    {
      "caseId": 2,
      "result": "fail",
      "note": {
        "content": "ボタンが反応しない",
        "severity": "high",
        "consoleLogs": [],
        "networkLogs": [],
        "environment": {}
      }
    }
  ],
  "failNote": {
    "content": "複数のケースで共通の問題",
    "severity": "medium"
  }
}
```

| フィールド | 説明 |
|-----------|------|
| `runs[].result` | `pass` \| `fail` \| `skip` |
| `runs[].note` | fail 時の個別ノート（任意） |
| `failNote` | fail 全体の共通ノート（`note` 未指定の fail ケースに適用） |

**重複排除**: 同じ `caseId` が複数回ある場合、`fail` が優先。

**レスポンス 200:**

```json
{
  "success": true,
  "results": [
    {"caseId": 1, "runId": 10, "result": "pass"},
    {"caseId": 2, "runId": 11, "result": "fail", "noteId": 5}
  ],
  "capability": {
    "capability": "ログイン",
    "total": 5,
    "passed": 3,
    "failed": 1,
    "status": "fail",
    "openIssues": 2,
    "cases": [...]
  }
}
```

---

## 6. Feedbacks（フィードバック）

### POST /feedbacks

フィードバック送信。**認証不要**（公開エンドポイント）。レート制限あり。

**リクエストボディ:**

| フィールド | 型 | 必須 | 制約 |
|-----------|---|------|------|
| `kind` | string | Yes | `bug` \| `question` \| `request` \| `share` \| `other` |
| `target` | string | No | `app` \| `manual` \| `null` |
| `message` | string | Yes | 最大 4,000 文字 |
| `customTag` | string | No | 最大 50 文字 |
| `pageUrl` | string | No | HTTP(S) URL、最大 2,000 文字 |
| `userType` | string | No | 最大 100 文字 |
| `appVersion` | string | No | 最大 50 文字 |
| `consoleLogs` | array | No | 最大 15 件、JSON 最大 512KB |
| `networkLogs` | array | No | 最大 15 件、JSON 最大 512KB |
| `environment` | object | No | |

**レスポンス 201:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "kind": "bug",
    "target": "app",
    "customTag": null,
    "message": "ログインできません",
    "status": "open",
    "createdAt": "2026-02-13T10:00:00",
    "updatedAt": "2026-02-13T10:00:00",
    "attachmentCount": 0
  }
}
```

**エラー 429:** `Too many requests`（10 req / 60 sec / IP）

### GET /feedbacks 🔐

フィードバック一覧（管理者）。

**ヘッダー:** `X-Admin-Key: {admin_key}`

**クエリパラメータ:**

| パラメータ | 型 | デフォルト | 説明 |
|-----------|---|----------|------|
| `status` | string | - | `open` \| `in_progress` \| `closed` |
| `kind` | string | - | `bug` \| `question` \| `request` \| `share` \| `other` |
| `target` | string | - | `app` \| `manual` |
| `custom_tag` | string | - | 完全一致 |
| `page` | int | `1` | ページ番号（1〜） |
| `limit` | int | `20` | 件数（1〜100） |

**レスポンス 200:**

```json
{
  "success": true,
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "customTags": ["機能A", "機能B"]
}
```

### GET /feedbacks/{id} 🔐

フィードバック詳細。添付・ログを含む。

**レスポンス 200:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "kind": "bug",
    "target": "app",
    "customTag": null,
    "message": "ログインできません",
    "status": "open",
    "pageUrl": "https://example.com/login",
    "userType": "管理者",
    "appVersion": "1.0.0",
    "environment": {"userAgent": "..."},
    "consoleLogs": [...],
    "networkLogs": [...],
    "createdAt": "2026-02-13T10:00:00",
    "updatedAt": "2026-02-13T10:00:00",
    "attachments": [...]
  }
}
```

### PATCH /feedbacks/{id}/status 🔐

ステータス更新。

**リクエストボディ:**

```json
{"status": "in_progress"}
```

値: `open` | `in_progress` | `closed`

**レスポンス 200:**

```json
{
  "success": true,
  "data": {"id": 1, "status": "in_progress", "updatedAt": "2026-02-13T12:00:00"}
}
```

### DELETE /feedbacks/{id} 🔐

フィードバック削除。関連する添付ファイルも削除。

**レスポンス 200:** `{"success": true}`

---

## 7. Feedback Attachments（フィードバック添付）

### POST /feedbacks/{id}/attachments

画像アップロード。`multipart/form-data`。**認証不要**。レート制限あり。

| 制約 | 値 |
|------|---|
| 最大サイズ | 5MB |
| 許可 MIME | `image/png`, `image/jpeg`, `image/webp`, `image/gif` |
| 最大数/フィードバック | 3 |

**レスポンス 201:**

```json
{
  "success": true,
  "attachment": {
    "id": 1,
    "filename": "a1b2c3d4...png",
    "original_name": "screenshot.png",
    "mime_type": "image/png",
    "size": 45678,
    "created_at": "2026-02-13T10:00:00"
  }
}
```

### GET /feedbacks/{id}/attachments 🔐

添付一覧。

### DELETE /feedbacks/{id}/attachments/{attachmentId} 🔐

添付削除。

---

## 8. Export（エクスポート）

### Notes エクスポート

| エンドポイント | 形式 | Content-Type |
|--------------|------|-------------|
| `GET /export/json` | JSON | `application/json` |
| `GET /export/sqlite` | SQLite DB ファイル | `application/octet-stream` |

ファイル名: `debug-notes-{env}-YYYYMMDD.{ext}`

JSON の構造:

```json
{
  "exportedAt": "2026-02-13T10:00:00+09:00",
  "env": "dev",
  "version": "1.0.0",
  "notes": [...],
  "testCases": [...],
  "testRuns": [...]
}
```

### Feedbacks エクスポート 🔐

| エンドポイント | 形式 | Content-Type |
|--------------|------|-------------|
| `GET /feedbacks/export/json` | JSON | `application/json` |
| `GET /feedbacks/export/csv` | CSV (UTF-8 BOM) | `text/csv` |
| `GET /feedbacks/export/sqlite` | SQLite DB ファイル | `application/octet-stream` |

ファイル名: `feedbacks-YYYYMMDD.{ext}`

CSV カラム: ID, 種別, 対象, タグ, メッセージ, ステータス, ページURL, ユーザー種別, バージョン, 添付数, 作成日時, 更新日時

---

## 9. 共通エラー

| HTTP | 意味 | 例 |
|------|------|---|
| 400 | バリデーションエラー | `{"success": false, "error": "content is required"}` |
| 401 | 認証失敗 | `{"success": false, "error": "Unauthorized"}` |
| 403 | CORS 拒否 | `{"success": false, "error": "Origin not allowed"}` |
| 404 | リソース不存在 | `{"success": false, "error": "Not found"}` |
| 413 | リクエスト過大 | `{"success": false, "error": "Request body too large"}` |
| 429 | レート制限 | `{"success": false, "error": "Too many requests"}` + `Retry-After: 60` |
| 500 | サーバーエラー | `{"success": false, "error": "Internal server error"}` |

---

## 10. 制約一覧

### Notes

| 項目 | 制約 |
|------|------|
| content | 最大 4,000 文字 |
| userLog | 最大 20,000 文字 |
| JSON カラム（console/network/steps/env） | 各最大 500KB |
| ノート総数 | 最大 500 件（削除済み除く） |
| 添付数/ノート | 最大 5 |
| severity | `critical` \| `high` \| `medium` \| `low` \| `null` |
| status | `open` \| `resolved` \| `rejected` \| `fixed` |

### Activities

| 項目 | 制約 |
|------|------|
| content | 最大 2,000 文字 |
| author | 最大 100 文字 |
| action | `status_change` \| `comment` |

### Test Cases

| 項目 | 制約 |
|------|------|
| domain | 最大 200 文字 |
| capability | 最大 200 文字 |
| title | 最大 500 文字 |
| インポート上限 | 1,000 件/リクエスト |
| 削除上限 | 100 件/リクエスト |

### Feedbacks

| 項目 | 制約 |
|------|------|
| message | 最大 4,000 文字 |
| customTag | 最大 50 文字 |
| pageUrl | HTTP(S) URL、最大 2,000 文字 |
| userType | 最大 100 文字 |
| appVersion | 最大 50 文字 |
| consoleLogs / networkLogs | 各最大 15 件、JSON 最大 512KB |
| 添付数/フィードバック | 最大 3 |
| レート制限 | 10 req / 60 sec / IP |
| kind | `bug` \| `question` \| `request` \| `share` \| `other` |
| target | `app` \| `manual` \| `null` |
| status | `open` \| `in_progress` \| `closed` |

### 添付ファイル（共通）

| 項目 | 制約 |
|------|------|
| 最大サイズ | 5MB |
| 許可 MIME | `image/png`, `image/jpeg`, `image/webp`, `image/gif` |
| ファイル名形式 | ランダム hex 32 文字 + 拡張子 |
| MIME 判定 | `finfo`（拡張子ではなくバイナリ解析） |

---

## 11. DB スキーマ

スキーマバージョン: **10**（`Database.php` が自動マイグレーション）。

### テーブル一覧

| テーブル | 用途 | バージョン |
|---------|------|----------|
| `meta` | スキーマバージョン管理 | v1 |
| `notes` | デバッグノート | v1（v2-v6 で拡張） |
| `test_cases` | テストケース定義 | v3 |
| `test_runs` | テスト実行結果 | v3 |
| `note_test_cases` | ノート↔テストケース紐付け | v6 |
| `feedbacks` | フィードバック | v7 |
| `rate_limits` | IP レート制限 | v7 |
| `note_attachments` | ノート添付ファイル | v8 |
| `feedback_attachments` | フィードバック添付ファイル | v9 |
| `note_activities` | ノートコメント・履歴 | v10 |

### config.php

#### Debug Notes API 用

```php
<?php
return [
    'db' => [
        'dev'  => __DIR__ . '/data/debug-dev.sqlite',
        'test' => __DIR__ . '/data/debug-test.sqlite',
    ],
    'allowed_origins' => [
        'https://your-domain.com',
        'http://localhost:5173',
    ],
    'api_key' => null,
    'feedback_admin_key' => 'your-admin-key',
    'upload_dir' => __DIR__ . '/data/attachments',
];
```

#### Feedback API 用

```php
<?php
return [
    'db' => __DIR__ . '/data/feedback.sqlite',
    'allowed_origins' => [
        'https://your-domain.com',
        'http://localhost:5173',
    ],
    'admin_key' => 'your-admin-key',
];
```

> `db` の型が異なる: Debug Notes は環境別の連想配列、Feedback は単一パスの文字列。
