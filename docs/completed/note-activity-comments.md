# ノート・アクティビティ（コメント機能）

**Status:** draft

---

## 1. 現状の問題

### 修正箇所がテスターに伝わらない

`PATCH /notes/{id}/status` はステータス値を変えるだけ。

- 開発者がノートを `fixed` にしても、**何を直したか**の記述がない
- テスターはどの画面のどの機能が変わったか分からない
- 再テスト対象が不明確で、手戻りが発生する

### 過去の経緯

v5 で `note_status_history` テーブルを削除済み（`rejected` ステータスで代替したため）。
しかし単なるステータス履歴ではなく、**コメント付きのアクティビティログ**が必要。

---

## 2. 設計方針

- ノートに対するアクティビティ（コメント、ステータス変更）を時系列で記録
- `fixed` への変更時はコメント必須（何を直したか、どこを再テストすべきか）
- 既存の `PATCH /notes/{id}/status` API に `comment` フィールドを追加（後方互換）
- DebugAdmin の詳細パネルにアクティビティタイムラインを表示

---

## 3. 実装詳細

### 3.1 DB スキーマ（v8 または v9）

`Database.php` の `initSchema()` に追加:

```sql
CREATE TABLE IF NOT EXISTS note_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL REFERENCES notes(id),
    action TEXT NOT NULL,       -- 'comment' | 'status_change'
    content TEXT,               -- コメント本文（任意）
    old_status TEXT,            -- status_change 時の旧ステータス
    new_status TEXT,            -- status_change 時の新ステータス
    author TEXT,                -- 作成者名（任意）
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activities_note_id ON note_activities(note_id);
```

> スクリーンショット添付機能と同時実装の場合は v8 に統合。単独なら v8。

#### データ例

```
| id | note_id | action        | content                           | old_status | new_status | author | created_at          |
|----|---------|---------------|-----------------------------------|------------|------------|--------|---------------------|
| 1  | 42      | status_change | null                              | null       | open       | null   | 2026-02-13 10:00:00 |
| 2  | 42      | comment       | 再現手順を追記しました              | null       | null       | テスター | 2026-02-13 11:00:00 |
| 3  | 42      | status_change | ログインバリデーション修正。/loginで再テスト | open       | fixed      | 開発者  | 2026-02-13 14:00:00 |
| 4  | 42      | status_change | 確認OK                            | fixed      | resolved   | テスター | 2026-02-13 15:00:00 |
```

### 3.2 API エンドポイント

#### `GET /notes/{id}/activities`

ノートのアクティビティ一覧を取得。

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "note_id": 42,
      "action": "status_change",
      "content": "ログインバリデーション修正。/login で再テスト",
      "old_status": "open",
      "new_status": "fixed",
      "author": "開発者A",
      "created_at": "2026-02-13T14:00:00"
    },
    {
      "id": 2,
      "note_id": 42,
      "action": "comment",
      "content": "確認しました。問題なし。",
      "old_status": null,
      "new_status": null,
      "author": "テスターB",
      "created_at": "2026-02-13T15:00:00"
    }
  ]
}
```

#### `POST /notes/{id}/activities`

コメントを追加。

**Request:**
```json
{
  "content": "再現手順を追記しました",
  "author": "テスターA"
}
```

**Response (201):**
```json
{
  "success": true,
  "activity": {
    "id": 5,
    "note_id": 42,
    "action": "comment",
    "content": "再現手順を追記しました",
    "author": "テスターA",
    "created_at": "2026-02-13T16:00:00"
  }
}
```

#### `PATCH /notes/{id}/status`（既存 API の拡張）

**変更前:**
```json
{ "status": "fixed" }
```

**変更後:**
```json
{
  "status": "fixed",
  "comment": "ログインバリデーション修正。/login で再テスト",
  "author": "開発者A"
}
```

- `comment` と `author` はオプション（後方互換）
- ただし **`fixed` への変更時のみ `comment` 必須**（フロントエンドで強制 + サーバーでも検証）
- ステータス変更時に `note_activities` に `action: 'status_change'` のレコードを自動挿入

### 3.3 PHP バックエンド

#### `api/NotesController.php` の変更

**`updateStatus()` の拡張:**

```php
public function updateStatus(int $id, array $input): array
{
    $status = $input['status'] ?? null;
    $comment = trim($input['comment'] ?? '');
    $author = trim($input['author'] ?? '');

    // ... 既存のバリデーション ...

    // fixed への変更時はコメント必須
    if ($status === 'fixed' && $comment === '') {
        return ['success' => false, 'error' => 'Comment is required when setting status to fixed'];
    }

    // ... 既存の UPDATE 処理 ...

    // アクティビティ記録
    $this->db->execute(
        'INSERT INTO note_activities (note_id, action, content, old_status, new_status, author)
         VALUES (?, ?, ?, ?, ?, ?)',
        [$id, 'status_change', $comment ?: null, $oldStatus, $status, $author ?: null]
    );

    return ['success' => true];
}
```

**`show()` の拡張:**

ノート詳細取得時にアクティビティも返す:

```php
public function show(int $id): array
{
    // ... 既存のノート取得 ...

    // アクティビティ取得
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
```

#### `api/index.php` ルート追加

```php
// GET /notes/{id}/activities
if ($method === 'GET' && preg_match('#^/notes/(\d+)/activities/?$#', $relativePath, $matches)) {
    $id = (int) $matches[1];
    $result = $controller->getActivities($id);
    echo json_encode($result);
    exit;
}

// POST /notes/{id}/activities
if ($method === 'POST' && preg_match('#^/notes/(\d+)/activities/?$#', $relativePath, $matches)) {
    $id = (int) $matches[1];
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $result = $controller->addActivity($id, $input);
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);
    exit;
}
```

### 3.4 TypeScript 型定義

`src/types/index.ts` に追加:

```typescript
/** ノート・アクティビティ */
export interface NoteActivity {
  id: number;
  note_id: number;
  action: 'comment' | 'status_change';
  content: string | null;
  old_status: Status | null;
  new_status: Status | null;
  author: string | null;
  created_at: string;
}
```

`Note` インターフェースに追加:

```typescript
export interface Note {
  // ... 既存フィールド ...
  /** アクティビティ一覧（詳細取得時のみ） */
  activities?: NoteActivity[];
}
```

### 3.5 API クライアント

`src/utils/api.ts` に追加:

```typescript
/** アクティビティ一覧取得 */
async getActivities(env: Environment, noteId: number): Promise<NoteActivity[]> { ... }

/** コメント追加 */
async addActivity(env: Environment, noteId: number, input: {
  content: string;
  author?: string;
}): Promise<NoteActivity> { ... }

/** ステータス更新（コメント付き） */
async updateStatus(env: Environment, id: number, status: Status, options?: {
  comment?: string;
  author?: string;
}): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/notes/${id}/status?env=${env}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, ...options }),
  });
  // ...
}
```

### 3.6 useDebugNotes フック変更

`updateStatus` のシグネチャを拡張:

```typescript
// Before
updateStatus: (id: number, status: Status) => Promise<boolean>;

// After
updateStatus: (id: number, status: Status, options?: {
  comment?: string;
  author?: string;
}) => Promise<boolean>;
```

後方互換: `options` は省略可能。

### 3.7 フロントエンド UI

#### DebugAdmin: アクティビティタイムライン

ノート詳細パネルの末尾にアクティビティタイムラインを表示:

```
┌─ アクティビティ ──────────────────────────────┐
│                                                │
│  ● open → fixed  [開発者A]  2/13 14:00        │
│    ログインバリデーション修正。                  │
│    /login で再テスト                           │
│                                                │
│  ○ コメント  [テスターB]  2/13 15:00           │
│    確認しました。問題なし。                      │
│                                                │
│  ● fixed → resolved  [テスターB]  2/13 15:30  │
│    再テスト完了                                 │
│                                                │
│  ┌─────────────────────────────────┐           │
│  │ コメントを追加...                │  [送信]   │
│  └─────────────────────────────────┘           │
└────────────────────────────────────────────────┘
```

**表示ルール:**
- `status_change`: ● アイコン + 旧→新ステータス + コメント（あれば）
- `comment`: ○ アイコン + コメント本文
- 時系列昇順（古い方が上）
- 最下部にコメント入力欄

#### DebugAdmin: ステータス変更時のコメント入力

ステータス select を変更した際:

1. `fixed` に変更 → コメント入力モーダル/インライン表示（必須）
2. `resolved` / `rejected` に変更 → コメント入力インライン表示（任意）
3. `open` に変更 → コメントなしで即変更

```
┌─ 修正内容を入力 ─────────────────┐
│                                   │
│  コメント *                       │
│  [textarea: 何を修正したか、      │
│   どこを再テストすべきか]         │
│                                   │
│  名前（任意）                     │
│  [input: 開発者名]               │
│                                   │
│  [キャンセル]  [変更を保存]       │
└───────────────────────────────────┘
```

#### ManageTab（PiP 内）: 簡易対応

ManageTab はスペースが限られるため、フル機能は不要:

- `fixed` に変更 → コメント入力を促す小さな textarea を展開
- コメントが空のまま `fixed` に変更しようとした場合、エラーメッセージ表示
- ステータス変更時に author は省略（PiP からの操作）

```
┌─ #42  ● ログインが失敗する ───────┐
│  [fixed ▼]                        │
│  ┌─────────────────────────────┐  │
│  │ 修正内容を入力（必須）       │  │
│  └─────────────────────────────┘  │
│  [確定]                           │
└───────────────────────────────────┘
```

#### ノート一覧のヒント

DebugAdmin のノート一覧カードに最新アクティビティのプレビューを追加:

```
#42  ● critical  ● fixed  🧪 test
ログインが失敗する
/login · 2/13 14:00
💬 「ログインバリデーション修正...」  ← 最新コメントの冒頭
```

`notes` 一覧 API で最新アクティビティのコメントを1件だけ返す:

```sql
SELECT n.*,
  (SELECT content FROM note_activities
   WHERE note_id = n.id AND content IS NOT NULL
   ORDER BY created_at DESC LIMIT 1) as latest_comment
FROM notes n WHERE ...
```

---

## 4. 変更ファイル一覧

| ファイル | 変更 |
|----------|------|
| `api/Database.php` | v8/v9 マイグレーション追加（`note_activities` テーブル） |
| `api/NotesController.php` | `updateStatus()` 拡張、`show()` にアクティビティ追加、`index()` に最新コメント追加、`getActivities()` / `addActivity()` 新規メソッド |
| `api/index.php` | アクティビティ系ルート追加 |
| `src/types/index.ts` | `NoteActivity` 型追加、`Note` に `activities` / `latest_comment` 追加 |
| `src/utils/api.ts` | `updateStatus()` シグネチャ変更、`getActivities()` / `addActivity()` 追加 |
| `src/hooks/useDebugNotes.ts` | `updateStatus()` にオプション引数追加 |
| `src/components/DebugAdmin.tsx` | アクティビティタイムライン表示、ステータス変更時コメント入力UI、ノート一覧に最新コメント表示 |
| `src/components/debug/ManageTab.tsx` | `fixed` 変更時のコメント入力UI追加 |

---

## 5. ステータス変更フローの整理

```
開発者                              テスター
───────                            ────────
                                   バグ発見 → ノート作成 (open)
                                      ↓ (コメント: 再現手順)
ノート確認
   ↓
修正実施
   ↓
fixed に変更 ← コメント必須
  「○○を修正。/login で再テスト」
                                      ↓
                                   再テスト実施
                                      ↓
                                   OK → resolved (コメント任意)
                                   NG → open に戻す (コメント: 再現した旨)
```

---

## 6. 後方互換性

- `PATCH /notes/{id}/status` の `comment` / `author` は省略可能
- **例外:** `fixed` への変更時のみ `comment` 必須
- 既存のクライアント（`comment` を送らない古い版）が `fixed` に変更しようとすると 400 エラー
- useDebugNotes の `updateStatus` は `options` 省略可能（型レベルで後方互換）
- DB マイグレーションは既存データに影響なし（新テーブル追加のみ）

---

## 7. 制約

| 項目 | 値 |
|------|-----|
| コメント最大文字数 | 2,000 |
| 作者名最大文字数 | 100 |
| 1ノートあたりアクティビティ上限 | なし（実用上 50 件を超えることは稀） |
