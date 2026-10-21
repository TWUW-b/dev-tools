---
status: Accepted
created: 2026-10-21
updated: 2026-10-21
target-version: 1.6.0
ticket: R-010
---

# RFC 003: リリースノートの画像・動画の説明と作成フロー

## 背景

dev-tools には v1.3.0（@TWUWB-003）からリリースノート機能がある。号 → 項目（headline / where / before / after）→ メディア（画像・動画）の 3 層で、管理 API、公開 HTML、JSON フィード、Range 対応のメディア配信、`<ReleaseNotes>` 表示部品、公開制御だけの `ReleaseNotesTab` がそろっている。

それでも、取り込んだ先で「画像と動画の説明が無い」リリースノートしか書けていない。原因は保存の仕組みではなく、その周りにある。

### toho_matching で足りなかったこと（調査結果）

| # | 足りないこと | 根拠 |
|---|---|---|
| 1 | メディアの説明が `caption` 1 つしか持てない。変更前／変更後／使い方の区別、alt、「動画のどこを見ればよいか」の説明が無い | `release_note_images` のカラム |
| 2 | メディアの説明や並び、紐付け先の項目を後から直す API（PATCH）が無い | 管理 API に `PATCH /:id/images/:imageId` が無い |
| 3 | 作成・アップロードの手段が curl の手組みだけ。`ReleaseNotesTab` は公開制御のみ | toho `docs/release-notes/writing-process.txt`、`ReleaseNotesTab.tsx` |
| 4 | 撮る対象・撮り方・説明の書き方の決まりが無い。実データでは画像 4 枚が全部 `item_id: null`（どの変更の画像か不明）、caption は「説明用サンプル」 | toho `docs/release-notes/2026-10-14-local-release.json` |
| 5 | アプリ内表示がメディアを項目に紐付けず号の末尾に並べる。動画は再生前が黒い箱 | toho `ReleaseNotesPage.tsx`（独自実装で dev-tools 部品を使っていない） |
| 6 | 作成スキルが無い | toho / dev-tools / `~/.claude/skills` のどこにも無い |

### Requirement_Hub から取り入れること

Requirement_Hub は同じデータモデルの元実装（REQUIR-178）で、メディアの運用はこちらが進んでいる。

- 動画を一級扱いにする。バグは「どう直ったか」、新機能は「どう使うか」を動画で見せる。
- 動画は 1 本 10〜18 秒、状態の変化 1 つだけを映す。解像度は落とさず CRF で圧縮し、1 本 250KB 前後を目安にする（`prod-feedback-fix-loop` Phase 3、`verify-record-review`）。
- キャプションは「修正後: 担当者が正しく表示されます」のように変化後の状態を 1 文で書く。画像は写っているものを説明する文にする。
- 本文は利用者の言葉で書き、内部 ID・enum・ファイル名を出さない。
- 実データが写った録画は社外に出さない。
- draft で投入 → ユーザーに見せる → published の順を守る。デプロイ時にフックで執筆を促す。

一方で Requirement_Hub も、撮影手順と説明の書き方は別スキルに散っていて、リリースノートとしての決まりにはなっていない。投入側（feedback-fix）もこの Mac には無い。本 RFC で dev-tools 側にまとめる。

## 提案

### (1) リリースノート機能（API・データ）

スキーマ v15 で `release_note_images` に列を足す。既存データはそのまま読める（すべて NULL 許容）。

| 列 | 内容 |
|---|---|
| `kind` | `before`（変更前）/ `after`（変更後）/ `howto`（使い方）/ `overview`（全体像）。NULL は従来どおり区別なし |
| `alt` | 画像の代替テキスト。未指定なら caption を使う（従来の動作） |
| `description` | 見どころの説明。動画なら「0:04 で保存を押すと一覧に戻り、件数が 1 増えます」のように、どこを見ればよいかを書く |

API の追加:

- `PATCH /release-notes/:id/images/:imageId` … `item_id` / `kind` / `caption` / `alt` / `description` / `sort_order` を後から直せる
- `POST /:id/images` で `kind` / `alt` / `description` も受け付ける

公開 HTML（`renderPage`）も同じ表示規則に合わせる（(4) 参照）。`openapi.yaml`、型、`releaseNotesApi` を更新し、`tests/api/release-notes.test.ts` に PATCH・新列・published のテストを足す。

### (2) 画像の配置

置き場所を 2 段にする。

1. **原稿（ホストアプリのリポジトリ）**: `docs/release-notes/<YYYY-MM-DD>-<短い名前>/`
   - `release.json` … 号・項目・メディアの説明をすべて書いた原稿（マニフェスト）
   - `media/<項目番号>-<kind>[-n].<拡張子>` … 例 `02-before.png`、`02-after.mp4`、`03-howto.mp4`
   - 原稿があるので、ローカルで書いたものを本番へそのまま投入し直せる（toho で困っていた「本番で一から書き直し」を解消）
2. **配信（サーバー）**: 従来どおり API 経由で `api/data/release-notes/{noteId}/` に保存し、トークン URL で配信する。原稿のファイル名は `original_name` に残る。

マニフェスト内でメディアは項目にぶら下げて書くので、どの変更の画像かが必ず決まる。項目に属さない号全体の画像は `cover` に書く。

### (3) リリースノート作成スキル

`devtools-testcase-*` と同じく、リポジトリに同梱する（`.claude/skills/devtools-release-notes/`）。

- **Phase 1 変更を集める**: 前号以降の git log・マージ済みの修正・フィードバック番号から、利用者に見える変更だけを拾う
- **Phase 2 文面**: 1 変更 = 1 項目。区分は 3 つ（直したこと / 使いやすくしたこと / 新しくできること）。headline は「〜しました」、where・これまで・これからを 1〜2 文。内部 ID・ファイル名を書かない
- **Phase 3 メディア計画**: 区分ごとの既定
  - 直したこと: `after` の動画（必要なら `before` も）
  - 使いやすくしたこと: `before` と `after` の静止画
  - 新しくできること: `howto` の動画
  - どのメディアにも caption（1 文）と description（見どころ）を必ず書く
- **Phase 4 撮影**: chrome-devtools-mcp で撮る。静止画はスクリーンショット、動画は CDP screencast → ffmpeg（10〜18 秒・状態の変化 1 つ・解像度は落とさない）。テストデータだけを写す
- **Phase 5 投入**: 同梱スクリプト `scripts/push-release-note.mjs` が `release.json` を読み、draft の号を作って項目とメディアをアップロードする。`scripts/check-release-note.mjs` が「全メディアに caption・description がある」「項目に属さないメディアが無い（cover を除く）」「本文に内部 ID らしき文字列が無い」を事前に検査する
- **Phase 6 確認と公開**: `scripts/preview-release-note.mjs` で原稿から下見 HTML を作ってユーザーに見せ（下書きの号のメディアはサーバが配信しないため）、承認後に下書きで投入して `scripts/publish-release-note.mjs` で公開する。社外公開（`is_public`）は別に確認する

### (4) UI

- **表示 `<ReleaseNotes>`**: メディアを項目の下に出す。`before` と `after` がそろえば左右（狭い画面では上下）に並べ、「変更前」「変更後」の札を付ける。各メディアの下に caption、その下に description。動画は `#t=0.1` で冒頭フレームを出し、`playsinline`。号のカバー画像を一覧に出す。公開 HTML も同じ規則にする
- **`ReleaseNotesTab`**: 従来どおり公開制御だけにする（作成・編集画面は付けない。2026-10-21 決定）
- `sample/` に両方を載せ、Playwright で確認する

### (5) 元の報告との紐付け（2026-10-21 追加）

各変更が、どの feedback / note を受けて直したものかを、ID・タイトル・アプリ内のリンクで示す。

- データ: `release_note_item_sources`（item_id, source_type = feedback / note, source_id, title, sort_order）。
  1 つの変更が複数の報告に対応するため、項目の `feedback_id` 1 列とは別に持つ。既存の `feedback_id` は移す
- API: 項目の POST / PATCH に `sources`。タイトルは省けば元の報告から引く。存在しない報告は拒否
- 表示: 社内向け（アプリ内・internal の公開ページ）に「対応: フィードバック #24 タイトル」。社外向けには出さない
  （内部の管理番号と、利用者の書いた原文のため）
- リンク: `config.php` の `release_notes_source_urls` の `{id}` を置き換えた URL。`<ReleaseNotes>` は
  `sourceHref` / `onSourceClick` で上書きできる。`DebugAdmin` / `FeedbackAdmin` は `?note=` / `?feedback=` で該当項目を開く
- スキル: 原稿の項目に `sources` を書く

## 対象外（別依頼にする）

- toho_matching への取り込み。toho は PHP をフォークしているので手でマージが要る。アプリ内ページを `<ReleaseNotes>` に置き換えるかも含めて、別の依頼で扱う
- Requirement_Hub への取り込み
- デプロイ時のリマインドフック（スキル側に手順として書くだけにする）

## オープン課題

なし（決定を参照）

## 決定

- 2026-10-21: `ReleaseNotesTab` に作成・編集画面は付けない（gen）
- 2026-10-21: 原稿の `media/` はホストアプリのリポジトリにコミットする（gen）。`preview.html` と `pushed.*.json` はコミットしない
- 2026-10-21: 各変更に元の feedback / note の ID・タイトル・アプリ内リンクを付ける（gen の追加指示）。社外向けには出さない
- 2026-10-21: toho が独自に足した `GET /release-notes/published`（利用者の認証で公開済みを返す）は取り込まない。上流には「管理者以外のログイン利用者」という認証の区分が無く、アプリ内表示は internal トークンの feed で足りるため
