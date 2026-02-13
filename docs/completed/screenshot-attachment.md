# スクリーンショット・画像添付機能

**Status:** draft

---

## 1. 現状の問題

バグ報告（RecordTab / TestTab）はテキストベースのデータのみ:
- content（内容）、user_log（補足メモ）
- console_log、network_log、environment（自動キャプチャ）

**画像を添付する手段がない。** テスターが視覚的なバグ（レイアウト崩れ、表示不正など）を報告する際、テキストだけでは伝わらない。

---

## 2. 方針

### Phase 1: ファイルアップロード + クリップボード貼付

即効性が高く、確実に動作する。

- ノート作成後に画像を添付（1ノートに複数画像可）
- `Ctrl+V` / `Cmd+V` でクリップボードからスクショ貼付
- ドラッグ&ドロップ / ファイル選択にも対応
- 画像はファイルシステムに保存（SQLite BLOB ではない）

### Phase 2: 要素ピッカー + html2canvas（将来拡張）

Phase 1 完了後に検討。ブラウザ DevTools のインスペクトモードのように要素を選択してキャプチャ。
`html2canvas` の CSS 再現精度に限界があるため、Phase 1 のクリップボード貼付で十分なケースが多い。

---

## 3. Phase 1 実装詳細

### 3.1 DB スキーマ（v8）

`Database.php` の `initSchema()` に追加:

```sql
CREATE TABLE IF NOT EXISTS note_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL REFERENCES notes(id),
    filename TEXT NOT NULL,        -- 保存ファイル名（UUID.ext）
    original_name TEXT NOT NULL,   -- 元のファイル名
    mime_type TEXT NOT NULL,       -- image/png, image/jpeg, image/webp
    size INTEGER NOT NULL,         -- バイト数
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON note_attachments(note_id);
```

#### 制約

| 項目 | 値 |
|------|-----|
| 1ファイル最大サイズ | 5MB |
| 1ノートあたり最大枚数 | 5 |
| 許可 MIME | `image/png`, `image/jpeg`, `image/webp`, `image/gif` |
| ストレージディレクトリ | `api/data/attachments/` |

### 3.2 API エンドポイント

#### `POST /notes/{id}/attachments`

画像アップロード。`multipart/form-data` で送信。

**Request:**
```
POST /notes/42/attachments?env=dev
Content-Type: multipart/form-data

file: (binary)
```

**Response (201):**
```json
{
  "success": true,
  "attachment": {
    "id": 1,
    "note_id": 42,
    "filename": "a1b2c3d4.png",
    "original_name": "screenshot.png",
    "mime_type": "image/png",
    "size": 123456,
    "url": "/attachments/a1b2c3d4.png",
    "created_at": "2026-02-13T12:00:00"
  }
}
```

**エラー:**
- 413: ファイルサイズ超過
- 400: 不正な MIME タイプ / 枚数上限
- 404: ノートが存在しない

#### `GET /notes/{id}/attachments`

ノートに紐づく添付画像一覧。

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "a1b2c3d4.png",
      "original_name": "screenshot.png",
      "mime_type": "image/png",
      "size": 123456,
      "url": "/attachments/a1b2c3d4.png",
      "created_at": "2026-02-13T12:00:00"
    }
  ]
}
```

#### `DELETE /notes/{id}/attachments/{attachmentId}`

添付画像を削除（ファイルも物理削除）。

#### `GET /attachments/{filename}`

画像ファイルの直接配信。`Content-Type` ヘッダーを適切に返す。

### 3.3 PHP バックエンド

#### `api/AttachmentController.php`（新規）

```php
class AttachmentController
{
    private Database $db;
    private string $uploadDir;

    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private const MAX_ATTACHMENTS_PER_NOTE = 5;
    private const ALLOWED_TYPES = [
        'image/png', 'image/jpeg', 'image/webp', 'image/gif'
    ];

    public function upload(int $noteId): array { ... }
    public function list(int $noteId): array { ... }
    public function delete(int $noteId, int $attachmentId): array { ... }
    public function serve(string $filename): void { ... }
}
```

**ファイル保存:**
- ファイル名: `bin2hex(random_bytes(16))` + 拡張子
- 保存先: `api/data/attachments/{filename}`
- MIME 検証: `finfo_file()` で実バイナリを検査（拡張子偽装対策）

#### `api/index.php` ルート追加

```php
// POST /notes/{id}/attachments
// GET /notes/{id}/attachments
// DELETE /notes/{id}/attachments/{attachmentId}
// GET /attachments/{filename}
```

### 3.4 Docker 対応

`docker-compose.yml` のボリュームマウントに追記:

```yaml
volumes:
  - ./api:/var/www/api
  # attachments はデフォルトで api/data/ 配下なので既存マウントでカバー
```

`api/data/attachments/` ディレクトリの書き込み権限を確保:

```dockerfile
RUN mkdir -p /var/www/api/data/attachments && \
    chown -R www-data:www-data /var/www/api/data
```

### 3.5 TypeScript 型定義

`src/types/index.ts` に追加:

```typescript
/** 添付画像 */
export interface NoteAttachment {
  id: number;
  note_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}
```

### 3.6 API クライアント

`src/utils/api.ts` に追加:

```typescript
/** 画像をアップロード */
async uploadAttachment(env: Environment, noteId: number, file: File): Promise<NoteAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${apiBaseUrl}/notes/${noteId}/attachments?env=${env}`,
    { method: 'POST', body: formData }
    // Content-Type は FormData が自動設定（boundary 付き）
  );

  const data = await parseResponse<{ success: boolean; attachment: NoteAttachment; error?: string }>(response);
  if (!data.success) throw new Error(data.error || 'Failed to upload');
  return data.attachment;
}

/** 添付画像一覧取得 */
async getAttachments(env: Environment, noteId: number): Promise<NoteAttachment[]> { ... }

/** 添付画像削除 */
async deleteAttachment(env: Environment, noteId: number, attachmentId: number): Promise<void> { ... }

/** 添付画像 URL を構築 */
getAttachmentUrl(filename: string): string {
  return `${apiBaseUrl}/attachments/${filename}`;
}
```

### 3.7 フロントエンド UI

#### RecordTab（DebugPanel.tsx 内）への追加

保存ボタンの上に画像添付エリアを追加:

```
┌─────────────────────────────┐
│  内容 *                      │
│  [textarea]                  │
│                              │
│  補足メモ（任意）             │
│  [textarea]                  │
│                              │
│  📎 画像添付                 │  ← 新規追加
│  ┌───────────────────────┐  │
│  │  ここにドラッグ or      │  │
│  │  クリックして選択        │  │
│  │  Ctrl+V で貼付          │  │
│  └───────────────────────┘  │
│  [thumb] [thumb] [thumb]    │  ← プレビュー
│                              │
│  [クリア]  [保存]            │
└─────────────────────────────┘
```

**実装方針:**
- ノート保存 → 成功時に note.id 取得 → 各画像を `uploadAttachment()` で順次送信
- PiP ウィンドウ内での動作を考慮: `pipWindow.document` にイベントリスナーをバインド
- 画像はローカル state で `File[]` として保持、プレビューは `URL.createObjectURL()`

#### クリップボード貼付

```typescript
// PiP ウィンドウまたはメインドキュメントの paste イベント
document.addEventListener('paste', (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        addAttachment(file); // File[] state に追加
      }
    }
  }
});
```

#### DebugAdmin 詳細パネルでの画像表示

ノート詳細の「内容」セクション直下に画像ギャラリーを追加:

```
┌─ 添付画像 (2件) ──────────────────┐
│  [image1.png]  [image2.png]       │
│  クリックで拡大                    │
│  各画像に ✕ 削除ボタン            │
└───────────────────────────────────┘
```

- サムネイル表示（200px 幅に縮小）
- クリックでモーダル拡大表示
- 削除ボタン付き

#### TestTab バグ報告フォームへの追加

TestTab のバグ報告フォーム内にも同様の画像添付エリアを追加。
ただし TestTab の場合、`submitTestRuns` でノートが自動作成されるため、
フローが異なる:

1. テスト結果送信 → レスポンスに `noteId` が含まれる
2. `noteId` を使って画像を後送信

### 3.8 `notes` の一覧レスポンスへの添付情報追加

`NotesController::index()` で `note_attachments` のカウントを含める:

```sql
SELECT n.*, (SELECT COUNT(*) FROM note_attachments WHERE note_id = n.id) as attachment_count
FROM notes n WHERE ...
```

一覧では画像データ自体は不要、件数だけで十分。
`NotesController::show()` では添付一覧も返す。

---

## 4. 変更ファイル一覧

| ファイル | 変更 |
|----------|------|
| `api/Database.php` | v8 マイグレーション追加 |
| `api/AttachmentController.php` | **新規**。アップロード・配信・削除 |
| `api/index.php` | 添付系ルート追加 |
| `api/NotesController.php` | show() に添付一覧追加、index() に件数追加 |
| `docker/php/Dockerfile` | attachments ディレクトリ作成 |
| `src/types/index.ts` | `NoteAttachment` 型追加、`Note` に `attachment_count` 追加 |
| `src/utils/api.ts` | 添付 API メソッド追加 |
| `src/components/DebugPanel.tsx` | RecordTab に画像添付 UI 追加 |
| `src/components/debug/TestTab.tsx` | バグ報告フォームに画像添付 UI 追加 |
| `src/components/DebugAdmin.tsx` | 詳細パネルに画像ギャラリー追加 |
| `src/components/debug/styles.ts` | 添付エリア・ギャラリーのスタイル追加 |

---

## 5. PiP ウィンドウでの注意点

DebugPanel は Document PiP API で別ウィンドウに描画される。

- `<input type="file">` は PiP ウィンドウ内で正常に動作する
- `clipboardData` は PiP ウィンドウの `document` にバインドする必要がある
- ドラッグ&ドロップも PiP ウィンドウ側の `document` にリスナーを追加
- `URL.createObjectURL()` は PiP 側ではなくメインウィンドウの `URL` を使用

---

## 6. Phase 2: 要素ピッカー（将来拡張メモ）

**前提:** Phase 1 完了後。コスト対効果を再評価してから着手。

### コンセプト

1. DebugPanel にインスペクトモードボタンを追加
2. クリックすると **メインウィンドウ側** に透明オーバーレイを展開
3. `mousemove` → `document.elementFromPoint()` → 要素をハイライト
4. クリックで要素を確定 → `html2canvas(element)` でキャプチャ
5. キャプチャ結果を `File` オブジェクトに変換 → Phase 1 のアップロードフローに合流

### html2canvas の既知の制限

- `backdrop-filter`, `mix-blend-mode` は再現不可
- Cross-origin 画像は `allowTaint: true` または CORS 対応が必要
- `<canvas>`, WebGL 要素は tainted canvas になる場合がある
- Shadow DOM 内の要素は部分的にしか対応していない
- `position: fixed` 要素の座標がずれる場合がある

### 代替案: 矩形選択

html2canvas で **ページ全体** をキャプチャ後、Canvas 上で矩形ドラッグ → クロップ。
要素ピッカーより汎用的だが、ページ全体のレンダリングに時間がかかる（大きなページで 1-3 秒）。

---

## 7. セキュリティ考慮

- MIME タイプは `finfo_file()` で実バイナリを検証（拡張子偽装対策）
- ファイル名はサーバー側で UUID 生成（パストラバーサル防止）
- 画像配信時は `Content-Type` をDB記録値から返す（ブラウザスニッフィング防止）
- アップロードサイズは PHP の `upload_max_filesize` + アプリ側の二重チェック
- `api/data/attachments/` の `.htaccess` で PHP 実行を禁止（Apache の場合）
