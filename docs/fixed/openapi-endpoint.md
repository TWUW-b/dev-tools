# OpenAPI 仕様書エンドポイント追加

**ステータス**: Draft
**作成日**: 2026-02-16
**優先度**: Medium

---

## 概要

`api/openapi.yaml`（OpenAPI 3.0.3）を API 仕様の単一ソースとし、
`GET /openapi.yaml` エンドポイントで配信する。

`docs/api.md` は削除し、openapi.yaml に一本化する。

---

## docs/api.md の廃止

### 理由

openapi.yaml と api.md の二重管理は内容の乖離を招く。
OpenAPI は機械可読かつ人間可読なので、単一ソースとして十分。

### api.md にしかない情報の移行先

| 情報 | 移行先 |
|------|--------|
| エンドポイント仕様（全体） | `api/openapi.yaml` |
| config.php の構造差異（Debug Notes vs Feedback） | `docs/setup.md`（既に記載あり、重複だった） |
| DB スキーマ・テーブル一覧 | `api/openapi.yaml` の `info.description` |
| 制約一覧（文字数上限等） | `api/openapi.yaml` の各スキーマの `maxLength` / `maximum` |
| 共通エラーコード | `api/openapi.yaml` の `components/responses` |

### 関連ドキュメントの更新

| ファイル | 変更内容 |
|---------|---------|
| `CLAUDE.md` | `docs/api.md` → `api/openapi.yaml` に参照変更 |
| `docs/setup.md` | 変更なし（API 仕様への直接参照なし） |
| `docs/usage.md` | 変更なし（フロントエンド API 関数のリファレンス） |
| `docs/migration.md` | 変更なし（API ファイルコピー手順のみ） |
| `docs/operation/xserver/deploy.md` | 変更なし（デプロイ手順のみ） |

---

## 変更内容

### 1. api/openapi.yaml 作成

OpenAPI 3.0.3 形式。主要セクション:

```yaml
openapi: 3.0.3
info:
  title: Debug Notes API
  version: 1.0.0
  description: |
    @twuw-b/dev-tools バックエンド API

    ## デプロイ形態
    - Debug Notes API (`/__debug/api`): 全機能
    - Feedback API (`/__manual/api`): フィードバック機能のみ

    ## DB
    SQLite。Database.php が自動マイグレーション（スキーマバージョン: 10）。

    ### テーブル一覧
    | テーブル | 用途 |
    |---------|------|
    | notes | デバッグノート |
    | note_activities | コメント・履歴 |
    | note_attachments | ノート添付ファイル |
    | test_cases | テストケース定義 |
    | test_runs | テスト実行結果 |
    | note_test_cases | ノート↔テストケース紐付け |
    | feedbacks | フィードバック |
    | feedback_attachments | フィードバック添付 |
    | rate_limits | IP レート制限 |

paths:
  /notes:
    get: ...
    post: ...
  /notes/{id}:
    get: ...
    delete: ...
  /notes/{id}/status:
    patch: ...
  /notes/{id}/severity:
    patch: ...
  /notes/{id}/activities:
    get: ...
    post: ...
  /notes/{id}/attachments:
    get: ...
    post: ...
  /notes/{id}/attachments/{attachmentId}:
    delete: ...
  /attachments/{filename}:
    get: ...
  /test-cases:
    get: ...
    delete: ...
  /test-cases/import:
    post: ...
  /test-cases/tree:
    get: ...
  /test-runs:
    post: ...
  /feedbacks:
    get: ...
    post: ...
  /feedbacks/export/{format}:
    get: ...
  /feedbacks/{id}:
    get: ...
    delete: ...
  /feedbacks/{id}/status:
    patch: ...
  /feedbacks/{id}/attachments:
    get: ...
    post: ...
  /feedbacks/{id}/attachments/{attachmentId}:
    delete: ...
  /export/json:
    get: ...
  /export/sqlite:
    get: ...
  /openapi.yaml:
    get: ...

components:
  schemas:
    Note: ...
    NoteDetail: ...
    Feedback: ...
    FeedbackDetail: ...
    TestCase: ...
    TestRun: ...
    Activity: ...
    Attachment: ...
    Error:
      type: object
      properties:
        success:
          type: boolean
          enum: [false]
        error:
          type: string
  securitySchemes:
    AdminKey:
      type: apiKey
      in: header
      name: X-Admin-Key
  parameters:
    env:
      name: env
      in: query
      required: true
      schema:
        type: string
        enum: [dev, test]
```

### 2. index.php にルート追加

```php
// GET /openapi.yaml
if ($method === 'GET' && preg_match('#^/openapi\.yaml/?$#', $relativePath)) {
    $yamlPath = __DIR__ . '/openapi.yaml';
    if (!file_exists($yamlPath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'OpenAPI spec not found']);
        exit;
    }
    header_remove('Content-Type');
    header('Content-Type: application/yaml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    readfile($yamlPath);
    exit;
}
```

ルーターの先頭（Notes ルートの前）に配置。CORS 処理の後、認証不要。

### 3. .htaccess に RewriteRule 追加

openapi.yaml は実ファイルとして存在するため、デフォルトでは Apache が直接配信する（CORS ヘッダーなし）。
index.php 経由にして CORS を付与する:

```apache
# openapi.yaml を index.php 経由にする（CORS 付与のため）
RewriteRule ^openapi\.yaml$ index.php [L]
```

既存の `RewriteCond %{REQUEST_FILENAME} !-f` の前に配置。

### 4. docs/api.md 削除

```bash
git rm docs/api.md
```

### 5. CLAUDE.md 更新

```diff
  | ファイル | 内容 |
  |----------|------|
  | `docs/usage.md` | コンポーネント・フック・API リファレンス |
  | `docs/setup.md` | 利用側プロジェクトのセットアップ手順 |
- | `docs/api.md` | バックエンド API 仕様書（全エンドポイント・制約・スキーマ） |
+ | `api/openapi.yaml` | バックエンド API 仕様書（OpenAPI 3.0.3） |
  | `docs/migration.md` | 旧ライブラリからの移行ガイド |
```

---

## 対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `api/openapi.yaml` | **新規作成** — OpenAPI 3.0.3 仕様書（単一ソース） |
| `api/index.php` | `GET /openapi.yaml` ルート追加 |
| `api/.htaccess` | RewriteRule 追加（openapi.yaml → index.php） |
| `docs/api.md` | **削除** |
| `CLAUDE.md` | ドキュメント参照を更新 |

---

## 確認項目

- [ ] `curl http://localhost:8081/openapi.yaml` で YAML が返る
- [ ] Content-Type が `application/yaml` である
- [ ] CORS ヘッダーが付与される（`Access-Control-Allow-Origin`）
- [ ] docs/api.md が削除されている
- [ ] CLAUDE.md の参照が `api/openapi.yaml` になっている
- [ ] openapi.yaml の内容が旧 api.md と一致する（情報の欠落なし）
