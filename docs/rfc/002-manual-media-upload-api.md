# RFC 002: マニュアル画像アップロードAPI

| 項目 | 値 |
|---|---|
| **Status** | **Accepted**（仕様合意済み・実装未着手） |
| Created | 2026-08-26 |
| Updated | 2026-08-26 |
| Target Version | 未定 |
| Related | `api/ReleaseNotesController.php`（メディア配信の参照実装）, `api/AttachmentController.php`（notes添付の参照実装）, ADR-002（pm-server 記録済み） |

> ⚠ この RFC は仕様合意まで完了した段階で、実装はまだ着手していない。
> 着手時は `docs/draft/` に実装計画 MD を作成してから進める想定（本RFCのREADME運用に準拠）。
> **本RFCのスコープは API のみ**。フロントエンド（`MarkdownRenderer` の画像パス解決、`ManualItem` 型拡張、管理画面UI等）は対象外。

---

## 背景

マニュアル機能（`ManualPiP` / `ManualSidebar` / `MarkdownRenderer`）は `.md` をホストアプリの静的ファイルとして配信する前提で作られており、画像・動画などのメディアを扱う仕組みが無い。

調査で判明した現状:

- `ManualItem` 型（`src/types/index.ts:326`）は `id / title / path / category? / order?` のみで、メディア用フィールドは無い
- `MarkdownRenderer.tsx` は `react-markdown` + `rehype-raw` により `<img>`/`<video>` タグの**表示自体は可能**（相対パス解決の仕組みは無いため絶対パス/外部URL必須）
- マニュアル専用のアップロード・配信APIは存在しない
- `api/AttachmentController.php` は `notes` テーブル専用（画像のみ・5MB）で、他エンティティへの汎用流用は設計上不可（Feedback添付追加時も同様の理由でコピー実装した前例あり）

一方、`api/ReleaseNotesController.php`（@TWUWB-003）には画像・動画メディアのフルスタック実装が既にあり、実装時に踏んだ落とし穴（`<img>`/`<video>` は Authorization ヘッダを送れない、Range 未対応だと再生・シークできない、論理削除だけだと実体が孤児化する等）を潰した設計になっている。これを参考実装として流用する。

## 要件（ユーザー確認済み）

1. マニュアルページに画像をアップロードできるようにする
2. **フロントエンド実装は今回のスコープ外**（`MarkdownRenderer` の改修、管理画面UI等は含まない）
3. **APIレベルの設計のみ**。実装はまだ行わない
4. 動画は対象外（画像のみ）

## 現状整理

### マニュアルの構造的制約

`ManualItem` は dev-tools の DB に実体を持たない（ホストアプリが配列として渡す）。そのため feedback/release-notes のような「親テーブルへの外部キー」は張れない。`manual_item_id` は自由入力の文字列として受け取り、`ManualItem.id` と対応させる運用をアプリ側に委ねる。

### 粒度

`ManualItem` 1件 = マニュアル1ページ（1つの `.md` ファイル）。リリースノートの「号→項目→メディア」の3階層と異なり、マニュアルには「号」に相当する上位概念が無いため「ページ→メディア」の2階層になる。ページ内の手順単位でのメディア分類は行わない（執筆者がアップロード後のURLをMarkdown本文の該当箇所に手動で貼る運用）。

## 検討した案

| 案 | 内容 | 採否 |
|---|---|---|
| A. `AttachmentController.php` を流用 | `note_attachments` に `manual_item_id` カラムを足して汎用化 | ✗ 既存のnotes専用設計に他エンティティの意味を混ぜると責務が曖昧になる。Feedback添付追加時も同じ理由でコピー実装を選んだ前例に倣う |
| B. `ReleaseNotesController.php` のメディア部分を参考に新規実装 | 新規テーブル `manual_media` + 新規コントローラ | ✓ 採用。トークン配信・Range対応・MIME検証・物理削除の設計をそのまま踏襲できる |

## 設計（確定）

### スキーマ（schemaVersion v14 で追加）

```sql
CREATE TABLE manual_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manual_item_id TEXT NOT NULL,   -- ManualItem.id と対応（例: 'guide'）。外部キー制約なし
    token TEXT NOT NULL,            -- 配信用トークン（<img> は Authorization を送れないため）
    stored_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_manual_media_item ON manual_media(manual_item_id);
CREATE UNIQUE INDEX idx_manual_media_token ON manual_media(token);
```

`deleted_at` は持たない。`release_note_images` と同じ理由（実ファイルと1:1のため、論理削除だけでは実体が孤児化する。削除時にDB行と実ファイルを同時に消す）。

### 制約値

| 項目 | 確定値 | 根拠 |
|---|---|---|
| MIME許可 | `image/png`, `image/jpeg`, `image/webp`, `image/gif` | `AttachmentController` 踏襲。SVGはスクリプト混入リスクで除外（`ReleaseNotesController` と同じ理由） |
| サイズ上限 | 10MB | notes添付(5MB)はバグ報告スクリーンショット想定。マニュアルは全画面キャプチャ等で大きくなりやすいため広め |
| 枚数上限 | 30枚/項目 | `release_note_images` の `MAX_MEDIA_PER_NOTE` と同数 |
| Range(206)対応 | あり | `ReleaseNotesController::parseRange`/`streamRange` をそのまま流用。画像のみでも将来の動画対応を見込みコストが低いため実装しておく |
| `manual_item_id` 文字種 | `^[A-Za-z0-9_-]{1,128}$` | 実例（`sample/App.tsx` の `id: 'guide'` 等）に合わせ、URLパスセグメントとして安全な範囲に制限。不一致は400 |
| 削除方式 | 物理削除（DB行+実ファイル） | `release_note_images` と同じ |

### コントローラ: `ManualMediaController.php`（Transaction Script）

| メソッド | 内容 |
|---|---|
| `uploadImage(string $manualItemId): array` | multipart upload。MIME実体検査（`finfo`）、サイズ上限、枚数上限チェック |
| `list(string $manualItemId): array` | 項目単位の一覧 |
| `deleteImage(int $mediaId): array` | DB行 + 実ファイルを同一トランザクション内で削除 |
| `serveMedia(string $token): void` | 認証なし配信。トークン一致のみで判定。Range(206)対応。パストラバーサル対策（`realpath` チェック） |

`release-notes` と異なり `status=published` のような公開状態の概念が無い（マニュアルはアプリ内表示前提）ため、`serveMedia` はトークン一致のみで配信可否を判定する。

### ルーティング（`api/index.php`）

```
POST   /manual/items/{itemId}/media   … アップロード（要 X-Admin-Key）
GET    /manual/items/{itemId}/media   … 一覧（要 X-Admin-Key）
DELETE /manual/media/{id}             … 削除（要 X-Admin-Key）
GET    /manual/media/{token}          … 配信（認証なし）
```

- `{itemId}` は `[A-Za-z0-9_-]{1,128}` にマッチする正規表現でルーティング（既存の `(\d+)` パターンと異なり文字列ID）
- `/manual/media/{token}` は既存の `/release-notes/(p|feed|media)/...` と同じ「公開の名前空間」として、`requireFeedbackAdmin` の認証ガード除外リストに追加する
- それ以外の `/manual/...` は管理者操作として `requireFeedbackAdmin($config)` を通す

## トレードオフ・オープン課題

- **動画は対象外**：要件で画像のみと確定。将来動画を扱う場合、MIME許可リストと `resolveMime`（拡張子フォールバック）の追加、フロント側の `<video>` 表示（`#t=0.1` 対策等）が別途必要
- **ページ内の手順単位の細分化は非対応**：`manual_item_id` はページ単位。手順ごとにメディアを分けたい要望が出た場合は `ManualItem` 側の設計変更を伴うため別RFCとする
- **`manual_item_id` の存在検証はできない**：`ManualItem` がDB上に実体を持たないため、アップロード時に「そのページが実在するか」はAPI側では検証不可。誤った `manual_item_id` でアップロードされても弾けない（運用上の注意点として残る）
- **フロント側の相対パス解決・サムネイル表示は本RFCの対象外**：`MarkdownRenderer.tsx` の改修、`ManualSidebar` でのサムネイル表示等は別途検討

## 決定

上記設計で確定。実装（`Database.php` へのマイグレーション追加、`ManualMediaController.php` 新規作成、`index.php` ルート追加）は別セッションで着手する。

---

## 変更履歴

- 2026-08-26: RFC作成・仕様合意（Accepted）
