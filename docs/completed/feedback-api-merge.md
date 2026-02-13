# Feedback API 統合

## 概要

`api/feedback/`（独立サブアプリケーション）をメインAPI（`api/index.php`）に統合した。

### 統合の理由

- `Database.php` が2つ存在（ほぼ同一のスキーマ管理パターン）
- `config.php` が2系統（`allowed_origins` の二重管理）
- ルーターのCORS処理がコピペ
- `api/feedback/config.php` 未作成でも気づけない（500エラーの原因）
- テスト対象として発見されない（APIテスト設計時にfeedback APIが完全に見落とされた）
- 全体1500行程度の小規模プロジェクトにサブアプリケーション分離は不釣り合い

### 統合後の構成

```
api/
├── index.php              # 全ルート統合
├── Database.php           # スキーマ v7: feedbacks + rate_limits 追加
├── config.php             # feedback_admin_key 追加
├── config.example.php     # 同上
├── NotesController.php    # 変更なし
├── TestController.php     # 変更なし
└── FeedbackController.php # feedback/ から移動、Database wrapper に適合
```

削除済み:
```
api/feedback/              # ディレクトリごと削除
├── index.php
├── Database.php
├── FeedbackController.php
├── config.example.php
└── data/feedback.sqlite
```

---

## 変更内容

### 1. Database.php — スキーマ v7 追加

`feedbacks` テーブルと `rate_limits` テーブルをメインDBに統合。

```sql
-- feedbacks
CREATE TABLE feedbacks (
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
);

-- rate_limits（IPベースのレート制限）
CREATE TABLE rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);
```

### 2. FeedbackController.php — Database wrapper に適合

`PDO` 直接操作から `Database` wrapper に書き換え。

| 旧（PDO直接） | 新（Database wrapper） |
|------|--------|
| `$this->pdo->prepare($sql)->execute($params)` | `$this->db->execute($sql, $params)` |
| `$stmt->fetch()` | `$this->db->fetchOne($sql, $params)` |
| `$stmt->fetchAll()` | `$this->db->query($sql, $params)` |
| `$this->pdo->lastInsertId()` | `$this->db->lastInsertId()` |
| `$stmt->fetchColumn()` | `$this->db->fetchOne()` + `$row['cnt']` |
| `$stmt->fetchAll(PDO::FETCH_COLUMN)` | `$this->db->query()` + `array_column()` |

`checkRateLimit()` はグローバル関数からコントローラのメソッドに移動:

```php
public function checkRateLimit(int $maxRequests = 10, int $windowSeconds = 60): bool
```

### 3. config — feedback_admin_key 追加

`config.example.php`:
```php
'feedback_admin_key' => 'CHANGE_ME_BEFORE_DEPLOY',
```

`config.php`（開発用）:
```php
'feedback_admin_key' => 'dev-admin-key-change-in-production',
```

### 4. index.php — 変更箇所

- `require_once` に `FeedbackController.php` 追加
- `$feedbackController = new FeedbackController($db)` 初期化
- CORS ヘッダーに `X-Admin-Key` 追加
- `requireFeedbackAdmin()` 認証関数追加
- 5ルート追加（404の手前に配置）

#### エンドポイント一覧

| メソッド | パス | 認証 | 備考 |
|----------|------|------|------|
| POST | `/feedbacks` | なし（公開） | レート制限あり（10req/60s） |
| GET | `/feedbacks` | `X-Admin-Key` | 一覧（ページネーション、フィルタ） |
| GET | `/feedbacks/:id` | `X-Admin-Key` | 詳細 |
| PATCH | `/feedbacks/:id/status` | `X-Admin-Key` | ステータス更新 |
| DELETE | `/feedbacks/:id` | `X-Admin-Key` | 物理削除 |

### 5. 既存データ

`api/feedback/data/feedback.sqlite` のデータは0件だったため移行不要。

### 6. api/feedback/ 削除済み

### 7. フロントエンド影響

`src/utils/feedbackApi.ts` は `apiBaseUrl` をprops経由で外部から受け取る設計のため、リポジトリ内のコード変更は不要。

利用側のアプリで `feedbackApiBaseUrl` の値を変更する:

| 変更前 | 変更後 |
|--------|--------|
| `http://localhost:8081/feedback` | `http://localhost:8081` |

パス自体（`/feedbacks`, `/feedbacks/:id` 等）は変わらない。

---

## APIテスト

`tests/api/feedbacks.test.ts` — 17テスト

| カテゴリ | テスト数 | 内容 |
|----------|----------|------|
| CRUD lifecycle | 1 | POST → GET → PATCH status → DELETE → GET 404 |
| List / Filter | 4 | 一覧取得、status/kindフィルタ、customTags |
| Authentication | 5 | 401（キーなし/不正）、POST は認証不要 |
| Validation | 4 | invalid kind, message空/超過, invalid status |
| Not found | 3 | 404（GET/DELETE/PATCH） |

### レート制限とテストの共存

`rate_limits` テーブルはテスト実行間で永続化されるため、連続実行時にレート制限に到達する。
`tests/api/helpers/seed.ts` に `clearRateLimits()` を追加し、`feedbacks.test.ts` の `beforeAll` で呼び出して対処。

```ts
// seed.ts
export function clearRateLimits(): void {
  execSync(`sqlite3 "${TEST_DB_PATH}" "DELETE FROM rate_limits"`, {
    cwd: process.env.API_PROJECT_ROOT ?? process.cwd(),
  });
}
```

---

## テスト結果

```
Tests  47 passed | 1 skipped (48)

  feedbacks.test.ts   17 tests
  notes.test.ts       13 tests (1 skipped: 検索API SQLiteバグ)
  test-cases.test.ts   7 tests
  test-runs.test.ts    8 tests
  routing.test.ts      3 tests
```

---

## 副次的改善

- Feedback も `?env=test` でテスト用DBに自動分離される（旧構成ではテスト分離なし）
- `config.php` 1ファイルで全設定管理（`allowed_origins` の二重管理解消）
- APIテストスイートで全エンドポイントをカバー
