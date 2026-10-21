---
name: devtools-release-notes
description: |
  @twuw-b/dev-tools 統合プロジェクトで、利用者向けのリリースノートを 1 号ぶん作るスキル。
  変更を集めて「これまで → これから」の文面を書き、変更ごとに画像・動画を撮って
  役割（変更前／変更後／使い方）・キャプション・見どころの説明を付け、原稿フォルダ
  （docs/release-notes/<日付>-<名前>/release.json + media/）にまとめる。検査と下見を通してから
  dev-tools API に下書きで投入し、ユーザーの確認後に公開する。説明の無い画像・動画は載せない。
  Use when: (1)「リリースノートを書いて」「更新情報を作って」「今回のリリースの告知」
  (2) デプロイ前後に利用者へ変更を知らせたい (3) 直したバグや新機能を画像・動画つきで説明したい
  (4) ローカルで書いたリリースノートを本番に入れ直したい
---

# devtools-release-notes

## 前提

- ホストアプリが `@twuw-b/dev-tools` v1.6.0 以降を統合済みで、`/__debug/api` の
  リリースノート API が使える（メディアの `kind` / `description` は v1.6.0 から）。
- 管理 API の鍵（X-Admin-Key）がある。値はメッセージやファイルに書かず、環境変数
  `DEVTOOLS_ADMIN_KEY` で渡す。
- 撮影に chrome-devtools-mcp、動画の圧縮に ffmpeg を使う。

スクリプトはこのスキルの `scripts/` にある（以下 `$S`）。npm で入れた場合は
`node_modules/@twuw-b/dev-tools/.claude/skills/devtools-release-notes/scripts`。

## 流れ

### Phase 1 変更を集める

1. 管理 API の一覧（`GET /release-notes`）で前号の番号・公開日・載せ済みの `feedback_id` を確かめる。
2. 前号の公開日以降のマージ済みの変更（git log、PR、直したフィードバック）を集める。
3. **利用者に見える変更だけ**を残す。内部の整理やテストの追加は載せない。
   まだ本番に出ていない変更は載せない。

### Phase 2 文面を書く

`references/writing-guide.md` に従う。要点:

- 1 変更 = 1 項目。区分は 直したこと（fix）/ 使いやすくしたこと（improve）/ 新しくできること（feature）の 3 つだけ。
- headline は「〜しました」。where（場所）、before（これまで）、after（これから）を 1〜2 文ずつ、必ず対で。
- ファイル名・列名・チケット ID などを書かない。

`assets/templates/release.json` を原稿フォルダにコピーして書き換える:

```
docs/release-notes/<YYYY-MM-DD>-<短い名前>/release.json
```

### Phase 3 メディアを決める

`references/media-guide.md` の表で、項目ごとに撮るものを決める。

| 区分 | 既定 |
|---|---|
| 直したこと | `after` の動画 |
| 使いやすくしたこと | `before` と `after` の静止画 |
| 新しくできること | `howto` の動画 |

どのメディアにも `caption`（何が写っているか 1 文）と `description`（どこを見ればよいか）を書く。
画像には `alt` も書く。画面で見て分からない変更だけ、`media_waived` に理由を書いてメディアを省く。

### Phase 4 撮る

- **テストデータだけを写す。** 本番データ・実在の人や会社が写ったものは使わない。
- 静止画は `take_screenshot`、動画は `screencast_start` / `screencast_stop`。
- 動画は 10〜18 秒・変化 1 つ。ffmpeg で圧縮する（解像度は落とさない）。コマンドは media-guide.md。
- `media/<項目番号 2 桁>-<kind>.<拡張子>` の名前で原稿フォルダに置く。

### Phase 5 検査と下見

```bash
node $S/check-release-note.mjs docs/release-notes/2026-10-21-xxx
node $S/preview-release-note.mjs docs/release-notes/2026-10-21-xxx
```

- error が 0 になるまで直す。warning は内容を見て、直すか理由をユーザーに伝える。
- `preview.html` をブラウザで開き、項目ごとにメディアと説明が合っているかを自分で確かめる。

### Phase 6 ユーザーに確認してもらう

`preview.html`（またはそのスクリーンショット）をユーザーに見せ、次をはっきり聞く:

1. この内容で投入してよいか
2. 社外（公開 URL）にも出すか、アプリ内だけか

**承認が無いまま投入・公開しない。**

### Phase 7 投入と公開

```bash
# 下書きで投入（検査も自動で走る）。pushed.<env>.json に号 id が記録される
node $S/push-release-note.mjs <API_BASE_URL> docs/release-notes/2026-10-21-xxx --env=<env>

# ユーザーが承認したら公開。社外にも出すときだけ --public
node $S/publish-release-note.mjs <API_BASE_URL> docs/release-notes/2026-10-21-xxx --env=<env> [--public]
```

- 下書きの号のメディアはサーバが配信しない。公開前の確認は Phase 6 の下見で行う。
- 同じ env に二度投入しようとすると止まる。作り直すときは管理画面で号を消し、`pushed.<env>.json` を消してから再実行する。
- ローカルで投入した号はデプロイしても本番に移らない。本番には同じ原稿フォルダを本番の API に投入する。
- 公開後、アプリ内の更新情報（`<ReleaseNotes>`）か公開 URL で表示を確かめる。

### Phase 8 コミット

原稿フォルダ（`release.json` と `media/`）をホストアプリのリポジトリにコミットする。
`preview.html` と `pushed.*.json` はコミットしない。初回は .gitignore に次を足す:

```
docs/release-notes/**/preview.html
docs/release-notes/**/pushed.*.json
```

## してはいけないこと

- 説明（caption・description）の無い画像・動画を載せる
- どの項目にも紐付かない画像を並べる（号全体の画像は `cover` に 1 枚だけ）
- 本番データが写った画像・動画を使う
- ユーザーの確認なしに公開する／社外公開にする
