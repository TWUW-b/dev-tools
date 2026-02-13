# Feedback 画像添付機能

**Status:** draft
**依存:** `screenshot-attachment.md`（Phase 1 実装済み）

---

## 1. 現状の問題

Feedback フォーム（`FeedbackForm.tsx`）はテキスト + 自動ログキャプチャのみ。
ユーザーがスクリーンショットを添付する手段がなく、視覚的な問題（レイアウト崩れ、表示不正）の報告が困難。

---

## 2. 方針

Debug Notes 向けに実装済みの画像添付インフラ（`AttachmentController.php`、`ImageDropZone.tsx`）を Feedback にも適用する。

**既存資産の再利用:**
- `AttachmentController` は `note_attachments` テーブル専用 → Feedback 用に `feedback_attachments` テーブルを追加
- `ImageDropZone` コンポーネントはそのまま再利用可能
- ファイル保存先は共有（`api/data/attachments/`）、ファイル名が UUID なので衝突しない

---

## 3. 実装詳細

### 3.1 DB スキーマ（v9）

`Database.php` の `initSchema()` に v9 ブロックを追加:

```sql
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_id INTEGER NOT NULL REFERENCES feedbacks(id),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fb_attachments_feedback_id ON feedback_attachments(feedback_id);
```

### 3.2 FeedbackController 拡張

既存の `FeedbackController.php` にメソッド追加:

```php
public function uploadAttachment(int $feedbackId): array;
public function listAttachments(int $feedbackId): array;
public function deleteAttachment(int $feedbackId, int $attachmentId): array;
```

ロジックは `AttachmentController` とほぼ同一。共通化するかはコード量次第だが、
各コントローラ 50 行程度なのでコピーで十分（不要な抽象化を避ける）。

**制約:**
| 項目 | 値 |
|------|-----|
| 1ファイル最大サイズ | 5MB |
| 1フィードバックあたり最大枚数 | 3（Notes の 5 より少なく、公開フォームなので制限を厳しく） |
| 許可 MIME | `image/png`, `image/jpeg`, `image/webp`, `image/gif` |

### 3.3 ルート追加（`api/index.php`）

Feedback ルートセクションに追加:

```
POST   /feedbacks/{id}/attachments       → uploadAttachment($id)  ※レート制限対象
GET    /feedbacks/{id}/attachments        → listAttachments($id)   ※管理者認証
DELETE /feedbacks/{id}/attachments/{aId}  → deleteAttachment($id, $aId) ※管理者認証
```

**注意:** `POST /feedbacks/{id}/attachments` は公開エンドポイント。
ただしフィードバック作成直後（数秒以内）にしか呼ばれない想定なので、
既存のレート制限（`checkRateLimit()`）を適用する。

`GET /attachments/{filename}` は既存ルートをそのまま利用（Notes と共有）。

### 3.4 フロー

```
[ユーザー]
  1. FeedbackForm で種別・メッセージ入力
  2. ImageDropZone で画像をドロップ/貼付/選択
  3. 送信ボタン
     ↓
  4. POST /feedbacks → feedback.id 取得
  5. attachFiles.forEach → POST /feedbacks/{id}/attachments
  6. 全完了 → 成功トースト
```

Notes の RecordTab と同じパターン（作成 → 後送信）。

### 3.5 TypeScript 型

```typescript
// Feedback インターフェースに追加
export interface Feedback {
  // ... 既存フィールド
  attachment_count?: number;    // 一覧用
  attachments?: NoteAttachment[];  // 詳細用（型は共通）
}
```

`NoteAttachment` を `Attachment` にリネームするか？ → しない。
型の実体は同じ（id, filename, original_name, mime_type, size, url, created_at）なので、
名前が `NoteAttachment` でも Feedback 側で使って問題ない。

### 3.6 feedbackApi.ts

```typescript
async uploadFeedbackAttachment(feedbackId: number, file: File): Promise<NoteAttachment>;
async deleteFeedbackAttachment(feedbackId: number, attachmentId: number, adminKey: string): Promise<void>;
```

`uploadFeedbackAttachment` は認証不要（公開フォームから送信）。
`deleteFeedbackAttachment` は管理者キーが必要。

### 3.7 FeedbackForm.tsx

- `ImageDropZone` を import
- `attachFiles` state 追加
- メッセージ textarea の下、送信ボタンの上に配置
- `maxFiles={3}`（公開フォームなので控えめ）
- `handleSubmit` を修正: フィードバック作成後に画像を順次アップロード

```
┌─────────────────────────┐
│  [bug] [質問] [要望] ... │
│                          │
│  メッセージ *             │
│  [textarea]              │
│                          │
│  📎 画像添付（0/3）      │  ← 追加
│  [ドロップゾーン]         │
│  [thumb] [thumb]         │
│                          │
│  ▸ 詳細情報              │
│                          │
│         [送信]           │
└─────────────────────────┘
```

### 3.8 FeedbackAdmin.tsx

展開された詳細パネルに画像ギャラリーを追加:

- `getFeedbackDetail()` のレスポンスに `attachments` を含める
- サムネイルグリッド（DebugAdmin と同様のパターン）
- クリックで拡大表示
- 削除ボタン（管理者認証付き）

### 3.9 FeedbackController::get() 拡張

```php
public function get(int $id): array
{
    // ... 既存の feedback 取得
    $feedback['attachments'] = $this->db->query(
        'SELECT id, filename, original_name, mime_type, size, created_at
         FROM feedback_attachments WHERE feedback_id = ?',
        [$id]
    );
    // ...
}
```

`list()` には `attachment_count` サブクエリを追加。

---

## 4. 変更ファイル一覧

| ファイル | 変更 |
|----------|------|
| `api/Database.php` | v9 マイグレーション追加 |
| `api/FeedbackController.php` | 添付メソッド 3 つ追加、get() / list() 拡張 |
| `api/index.php` | Feedback 添付ルート 3 つ追加 |
| `src/types/index.ts` | `Feedback` に `attachment_count`, `attachments` 追加 |
| `src/utils/feedbackApi.ts` | 添付 API メソッド追加 |
| `src/components/manual/FeedbackForm.tsx` | `ImageDropZone` 追加、送信フロー修正 |
| `src/components/manual/FeedbackAdmin.tsx` | 詳細に画像ギャラリー追加 |

---

## 5. Notes 側との違い

| | Debug Notes | Feedback |
|---|---|---|
| 最大枚数 | 5 | 3 |
| アップロード認証 | なし（内部ツール） | レート制限（公開フォーム） |
| 削除認証 | なし | 管理者キー必須 |
| DB テーブル | `note_attachments` | `feedback_attachments` |
| ファイル保存先 | `api/data/attachments/`（共有） | 同左 |
| 配信ルート | `GET /attachments/{filename}`（共有） | 同左 |

---

## 6. セキュリティ考慮

- レート制限: 画像アップロードにも既存の IP ベースレート制限を適用
- ファイルサイズ: PHP `upload_max_filesize` + アプリ側の二重チェック
- MIME 検証: `finfo_file()` でバイナリ検査（Notes 側と同じ）
- 公開フォームからのアップロードなので、枚数制限を 3 に絞る
- フィードバック作成直後のみアップロード可能（時間制限は未実装、必要なら後日）
