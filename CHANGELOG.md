# Changelog

すべての特筆すべき変更はこのファイルに記載されます。

## [1.4.3] - 2026-08-28

### Fixed

- **[1.4.2 の訂正] ManualPiP の初期表示位置は制御不可能と判明、`moveTo` 実装を削除**:
  1.4.2 で `pip.moveTo()` により PiP ウィンドウを画面右下に配置する実装を追加したが、
  Document Picture-in-Picture API の仕様上、**サイト側から PiP ウィンドウの位置を
  設定することはできない**（なりすまし防止のための意図的な制限）。
  仕様書に明記: "The website cannot set the position of the PiP window."
  （https://wicg.github.io/document-picture-in-picture/）。Chrome の API 実装者も
  同様に確認している（https://github.com/WICG/document-picture-in-picture/issues/34）。
  そのため `pip.moveTo()` は Chrome では黙って無視され、実質的に何も行わないコードだった。
  `initialPosition` prop・`computePipPosition`（`src/utils/pipPosition.ts`）・関連の
  単体テストを削除し、死んだコードを除去。**サイズ（`initialSize`）はサイト側から指定
  可能で、こちらは引き続き有効。** 位置については、ブラウザが前回閉じた位置を記憶して
  次回再現する挙動（`preferInitialWindowPlacement` のデフォルト動作）に委ねる他ない。

## [1.4.2] - 2026-08-28

### Fixed

- **ManualPiP の初期表示位置**: Document Picture-in-Picture API の `requestWindow()` は
  width/height のみ受け付け、位置（x/y）は指定できない仕様のため、常に画面左上に開いていた。
  型定義のみ存在し実装に配線されていなかった `initialPosition` prop を接続し、
  `requestWindow()` 完了後に `pip.moveTo()` で明示的に位置調整するよう修正。
  `initialPosition` 指定時はそれを優先、未指定時はデフォルトで画面右下（端から20pxマージン）
  に配置する。位置計算は `computePipPosition`（`src/utils/pipPosition.ts`）に純粋関数として
  切り出し、単体テストで検証（Document PiP 自体は CDP 自動化ブラウザでは開けず実機検証不可のため）。

## [1.4.1] - 2026-08-28

### Fixed

- **マニュアル目次の複数ハイライトバグ**: `ManualTableOfContents` の `isActiveHeading` 判定が
  `heading.id` のみで比較しており、どのページの見出しかを見ていなかった。
  `useManualHeadings` は呼び出し毎に新しい `GithubSlugger` インスタンスで id を振るため、
  複数ページに同名見出し（例: 「手順」「関連」）があると同じ id になり、展開中の全ページの
  同名見出しが同時にハイライトされていた。`activePath` と一致するページの見出しのみを
  ハイライト対象にするよう修正。
- **PiP と別ページ表示（ManualTabPage）のデザイン不一致**: h1/h2/h3 の配色・余白
  （`.manual-markdown` 系 CSS）は元々一致していたが、外枠側で3点の差分があった。
  ヘッダータイトルの font-size（16px→18px に統一）、ヘッダー左アイコンの色
  （PiP のみ `secondary` 色に明示上書きされていたのを削除し、両者とも白に統一）、
  本文の line-height（1.6→1.7 に統一）。本文の padding（PiP 24px / 別ページ 32px）は
  PiP がより狭いフローティングウィンドウであるための意図的な差分として維持。

## [1.4.0] - 2026-08-28

### Added

- **マニュアル画像アップロードAPI（RFC 002 / @TWUWB-005）**: `ManualItem`（マニュアルページ）に
  画像を添付・配信するバックエンドAPIを追加。`POST/GET /manual/items/{itemId}/media`、
  `GET /manual/items`（横断一覧・監査用）、`DELETE /manual/media/{id}`、
  `GET /manual/media/{token}`（認証なし配信）。`ReleaseNotesController` のメディア設計
  （トークン配信・Range対応・MIME実体検証・物理削除）を踏襲しつつ、画像のみ(10MB上限・
  30枚/項目・全item横断500MB上限)、親エンティティ無しの2階層構成に単純化。
  フロントエンド実装は対象外（`docs/rfc/002-manual-media-upload-api.md` 参照）。
- **マニュアル階層目次（@TWUWB-007）**: `ManualTableOfContents` を新設し、
  「カテゴリ→ページ→見出し」の階層目次を `ManualTabPage`（PC想定・常時サイドバー、
  モバイル幅767px以下では自動的にハンバーガーメニュー+オーバーレイパネルに切替）と
  `ManualPiP`（ハンバーガーメニュー開閉）に追加。見出し(h2/h3)はページごとに遅延フェッチ・
  キャッシュし、`rehype-slug` で実DOMに付与された id と一致するよう github-slugger 準拠で
  スラッグ化。スクロールスパイ（`IntersectionObserver`）で現在の見出しを目次側にハイライト。
  `items` prop 未指定時は既存の見た目・挙動を一切変えない後方互換を維持。

### Fixed

- **`.manual-markdown` の CSS 優先順位バグ（@TWUWB-008）**: `.manual-markdown` の CSS 定義が
  `DebugPanel` / `ManualTabPage` / `ManualPiP` の3箇所に重複しており、いずれも「そのコンポー
  ネント自身がマウントされた時のみ `<style>` を注入する」設計だったため、`ManualSidebar` +
  `MarkdownRenderer` を単体で使う画面では CSS が一切当たらなかった。`MarkdownRenderer` 自身に
  `:where()`（詳細度ゼロ）のフォールバックCSSを追加して解消。さらに、`ManualTabPage` 表示中に
  `DebugPanel` を同時に開くと両者の同名セレクタが同じ CSS 詳細度で DOM 順序次第で優先順位が
  不定になる別の潜在バグも発見し、各コンポーネントのルートクラスでスコープを追加して解消。
- **マニュアル目次のレイアウトバグ**: サイドバーがスクロールに追従しない根本原因は、
  `ManualTabPage` のコンテナが `minHeight:100vh`（`overflow` 指定なし）だったため、コンテンツ
  増加でページ全体がスクロールし目次サイドバーが画面外に流れる不具合だった。`items` 指定時のみ
  `height:100vh + overflow:hidden` に固定して解消（`items` 未指定時は従来の挙動を維持）。
- 印刷時に `height:100vh + overflow:hidden` でコンテンツがクリップされる問題を `@media print`
  でリセット。
- 別ページへの遷移直後、stale content レースでスクロールスパイが前ページの見出しを一瞬誤って
  ハイライトする問題（PC/PiP両方）。
- 手動で閉じた見出しリストがスクロールで勝手に再展開される問題。
- モバイルのハンバーガーパネル: ブレークポイント往復で開閉状態がリセットされない、
  ブラウザの戻る/進む(popstate)で閉じない、背景が inert 化されずキーボードフォーカスが漏れる
  問題を修正。
- アクセシビリティ属性（`aria-expanded`/`aria-controls`、装飾アイコンの `aria-hidden`）の
  欠落を複数箇所で追加。

### Tests

- Unit: 122 / API: 135 passed + 1 skipped / E2E: 43

## [1.3.2] - 2026-07-31

### Added

- **`ReleaseNotesTab` を単体で export（@TWUWB-005）**: 1.3.0 の「管理タブは配線不要」は
  `DebugAdmin` を丸ごと載せているホストにしか成立しなかった。`ReleaseNotesTab` は
  `src/index.ts` に無く、`exports` にワイルドカードも無いため deep import も塞がれており、
  **独自の管理画面を持つホスト（Requirement Hub 等）からは一切使えなかった**。

  他タブの API（notes の更新系・添付・test-cases・export）を持たないホストが `DebugAdmin` を
  載せると壊れたボタンが並ぶため、リリースノートの公開制御だけを置けるようにした。

  - `colors` と `refreshKey` を**省略可**にした（既定はライトモード / 0）。ホストは
    `<ReleaseNotesTab apiBaseUrl={...} env="dev" adminKey={key} />` だけで置ける。
  - パレット（`LIGHT_COLORS` / `DARK_COLORS` / 型 `AdminColors`）を `DebugAdmin.tsx` から
    `components/adminColors.ts` へ切り出して公開。実体は 1 箇所のままで、`DebugAdmin` も
    ここから読む。ホストがダークモードや自前の色を渡せる。
  - `ReleaseNotesTabProps` も型として公開。

## [1.3.1] - 2026-07-31

### Fixed

- **API テストヘルパの X-Admin-Key 付与範囲（@TWUWB-004）**: v1.2.16 で `api/index.php` のガードを
  `#^/(notes|export|test-runs|test-cases)(/|$)#` へ広げたとき、`tests/api/helpers/client.ts` の判定が
  `path.startsWith('/notes')` のままだったため、`/test-runs`・`/test-cases` を叩くテストに鍵が付かず
  11 件が 401 で落ちていた。プロダクトコードは正常で**テストだけが赤い**状態だったため、
  実害はテスト結果の信頼性のみ。配布物（dist / api）に変更は無い。

## [1.3.0] - 2026-07-29

### Added

- **リリースノート機能（@TWUWB-003）**: 「直したことを利用者・クライアントに知らせる」面を追加。
  notes / feedbacks が報告を集める側なのに対し、こちらは告知する側。

  面は3つ。**公開ページと管理タブは追加の配線なしで使える**。

  | 面 | 読者 | 出し方 |
  |----|------|--------|
  | 公開ページ | クライアント（ログイン不要） | `GET /release-notes/p/{token}` が自己完結の HTML を返す |
  | アプリ内 | ログイン中の利用者 | `<ReleaseNotes feedUrl={...} />` をホストが好きな場所に置く |
  | 管理 | 開発側 | `/__admin` の「リリースノート」タブ |

  - 公開ページは PHP が単独で返すため、ホストアプリのビルド・ルーティング・認証ガードに
    一切依存しない（統合先ごとに認証除外を設定する必要がない）。
  - 号ごとに `status`(draft|published) と `is_public`(社外公開の可否) を**別の軸**で持つ。
    社内向けの更新を公開 URL に混ぜないため、`is_public` は明示的に ON にしたときだけ公開される。
  - 公開トークンは2本（public / internal）。漏れたときは `POST /release-notes/tokens/rotate` で失効。
  - API 形状は参照実装（Requirement Hub REQUIR-178）と揃えてあり、feedback-fix の
    リリースノート画面から設定 URL の差し替えだけで投入できる。
- `ReleaseNotes` コンポーネント / `useReleaseNotes` フック（未読バッジ用）/
  `releaseNotesApi`・`fetchReleaseNotesFeed` を公開。スタイルはインラインのみでホスト CSS に非依存。
- DB スキーマ v13: `release_notes` / `release_note_items` / `release_note_images`。

### Fixed（新機能に最初から入れた対策）

参照実装で実際に踏んだ、**curl では通るのにブラウザで壊れる**問題を最初から潰してある。

- `<img>` / `<video>` は Authorization を送れないため、メディア配信は認証ではなく
  URL 中の推測不能トークンで守る（認証必須にするとブラウザで 401 になり何も表示されない）。
- 動画配信は Range(206) 対応。未対応だと全部落とし終えるまで再生できずシークもできない。
- `application/octet-stream` で飛んできた添付を拡張子から補正（そのままだと `<video>` で描けない）。
- 動画は `#t=0.1` 付きで読み込み、再生前でも冒頭フレームを表示する。
- 号・項目の削除でメディアの行と**ファイル実体**を片付ける（論理削除だけだと孤児が残る）。
- SVG はスクリプトを埋め込めるため添付を許可しない。

### 設定

- `config.php` に `release_notes_dir`（既定 `api/data/release-notes`）と
  `release_notes_max_upload`（既定 50MB）を追加。いずれも任意。
  動画を扱う場合は PHP の `upload_max_filesize` / `post_max_size` も合わせて上げること
  （超えると `$_FILES` が空で飛んでくる）。

## [1.2.16] - 2026-07-17

### Security

- **notes/feedback 管理 API に Firebase IDトークン認証を追加（X-Admin-Key との OR 受理）**
  - `config.php` の `firebase_project_id` 設定時、`Authorization: Bearer <Firebase IDトークン>`
    または `X-Admin-Key` のどちらかで許可（`api/FirebaseAuth.php`。RS256 固定・Google 公開鍵で
    署名検証・aud/iss/exp/iat/sub 検証）。未設定なら従来どおり X-Admin-Key のみ（後方互換）。
    フロントは `setDebugAdminKey` で送出。
- **[重要] 無認証データ窃取の修正**: `GET /export/json`（全ノート）と `GET /export/sqlite`
  （DB 丸ごと＝feedbacks 含む）が **1.2.15 以前は無認証**で全データ取得できた。管理者認証を必須化。
- **notes への無認証注入の修正**: `POST /test-runs` が fail note 経由で notes テーブルへ
  無認証 INSERT でき、`POST /notes` ガードを迂回できた。`/test-runs`・`/test-cases` も認証必須に。
- 公開鍵キャッシュを共有 `/tmp` からアプリ専有ディレクトリへ移し、所有者/権限を検証
  （共有ホスティングでのキャッシュ汚染 CWE-377 対策）。

### 破壊的変更

- `/notes`・`/test-cases`・`/test-runs`・`/export` は管理者認証（X-Admin-Key または Firebase）必須。
  DevTools/DebugAdmin パネルは `setDebugAdminKey` で自動対応。**CLI のテストケース取り込み等は
  X-Admin-Key の送出が必要**。

## [1.2.15] - 2026-07-16

### Security

- **notes API を X-Admin-Key 認証必須化**（参照実装の無認証 read を封鎖）。`GET /notes` 等の
  全 notes ルートに管理者認証を要求。フロントに `setDebugAdminKey()` を追加し notes 呼び出しへ
  `X-Admin-Key` を自動付与。

### Added

- notes ステータスに **`in_progress`** を追加。

## [1.2.14] - 2026-06-08

### Fixed

- **管理画面で自動更新中に詳細画面の添付画像が消える不具合を修正**
  - notes 一覧の同期処理が、自動更新（`refresh`）のたびに `selectedNote` を一覧データで全置換していた
  - 一覧 API は `attachments`（画像本体）を返さないため、詳細（`getNote`）で取得済みの添付が消えていた
  - 同期時に詳細専用フィールド（attachments / activities / console_log / network_log / environment）を前回値から温存するマージに変更

## [1.2.13] - 2026-06-01

### Added

- **ステータス `closed`（クローズ）** を追加
  - 登録内容が質問だった / テストケース自体の誤りだった場合に使う完了系ステータス
  - `resolved` 同様にコメント任意。一覧フィルタ・ステータス変更・統計に対応
- **ノート詳細でテストケースの階層情報を直接表示**
  - 紐付くテストケースの Domain / Capability / Title（+ case_key）を hover 依存せず読める形に改善
- 日時表示・エクスポートユーティリティ `src/utils/datetime.ts` を追加

### Fixed

- **テスト失敗報告ノートの「ページURL」「ページタイトル」が `/`・`(不明)` 固定になる不具合を修正**
  - `submitTestRuns` の failNote に現在ページの route / screen_name を付与
  - `TestController` → `NotesController::create` へ route / screenName（camelCase）を転送
- **保存日時が UTC のまま表示されていた問題を JST 表示に修正**
  - DB は UTC 保存のまま、フロント表示（DebugAdmin / FeedbackTab）と JSON/CSV エクスポートを JST(+09:00) に変換

## [1.2.12] - 2026-05-28

### Fixed

- **PiP ウィンドウで Material Symbols フォントが読み込まれずアイコンが文字列のまま表示される問題を修正**
  - CSS `@import url('...Material+Symbols...')` だけでは PiP コンテキストで
    フォント取得が失敗するケースがあったため、`requestWindow()` で開いた直後に
    `<link rel="stylesheet" href="MATERIAL_SYMBOLS_CDN">` を PiP の `<head>` に
    明示的に append するよう変更。`.debug-icon` 経由のアイコンが確実にリガチャ展開される

## [1.2.11] - 2026-05-28

### Added

- **`setAuthTokenProvider(provider)` API を追加**
  - 各 admin API リクエスト前に登録済みプロバイダを呼び出し、戻り値の文字列を
    `Authorization: Bearer {token}` ヘッダとして自動付与する
  - ホスト側で Firebase Authentication 等の認証ゲートを通すために使用
  - 型: `AuthTokenProvider = () => Promise<string|null|undefined> | string|null|undefined`
- **`extractErrorMessage(data, fallback)` を内部追加**
  - バックエンドが返す `{ error: { code, message } }` / `{ error: "..." }` /
    `{ message: "..." }` のいずれの形式でも適切にメッセージを抽出する。
    過去にエラー時の画面表示が "[object Object]" になっていた問題を根本対応
- **`dbgFetch(input, init)` ラッパー**
  - 全 admin API fetch を内部でラップし、自動で AuthHeader を付与する

### Fixed

- **TestTree のアイコンが "chevron_right" 等の文字列で表示されていた問題を修正**
  - `.debug-icon` クラスに Material Symbols 標準の `font-feature-settings: 'liga'`
    と表示安定化系プロパティを追加。リガチャが効くようになり、`<span class="debug-icon">chevron_right</span>`
    が正しくアイコン描画されるようになった
- **PiP ウィンドウでデバッグノートのテストケース紐付けが多いときに送信ボタンに到達できない問題を修正**
  - PIP_RESET_CSS の `body { overflow: hidden }` を `overflow: auto` に変更し、
    PiP ウィンドウ自体をスクロール可能化

## [1.2.10] - 2026-04-17

### Fixed

- **DebugPanel 入力フォームの文字色が親アプリのテーマ色（ダーク）を継承してしまう問題を修正**
  - `.debug-panel` に `color: gray900; background: white` を明示
  - `.debug-field input/textarea/select` にも `color` と `background` を明示
- **DebugAdmin がモバイルで崩れる問題を修正**
  - 2カラム（サイドバー380px + 詳細）のままモバイルでも表示していたのを縦積みに変更
  - モバイル（`max-width: 768px`）でノートを選択するとサイドバーを非表示にして詳細を全画面表示、一覧へ戻るボタンを追加
  - ヘッダー・フィルターの padding/gap をモバイル用に縮小
  - ヘッダーに `flex-wrap: wrap` を適用

## [1.2.9] - 2026-04-17

### Fixed

- **モバイル UI 崩れ対応**
  - `DebugPanel` のトリガーボタンが `position: fixed; bottom: 24px; right: 24px` 固定で、ボトムナビを持つアプリでは z-index 9999 で上に被さりナビを隠していた問題を修正
  - fallback パネル（PiP 非対応ブラウザ時の画面内表示）が `width: 400px` 固定で、モバイル幅で画面外にはみ出す問題を修正
  - モバイル（`max-width: 768px`）では PiP ウィンドウを開かず、画面内オーバーレイを強制する
  - fallback 時に `.debug-*` クラスのスタイルが親 document に注入されずレイアウト崩れしていた問題を修正

### Added

- `DebugPanel` / `DevTools` に `triggerOffset?: { bottom?, right? }` prop を追加。ボトムナビのあるアプリで利用側から位置をずらせる
- `getTriggerButtonStyle(offset?)` を styles.ts から export（既定値は `calc(env(safe-area-inset-bottom, 0px) + 24px)`）
- `getPanelStyles()` を styles.ts から export（`.debug-*` クラスのみ、body/html reset を含まず fallback で安全に注入可能）

### Changed

- fallback panel は `width: min(400px, 92vw)` に変更
- `.debug-panel` の `height: 100vh` → `height: 100%` に変更（親コンテナのサイズに追従、fallback でも正しく表示される）

## [1.2.7] - 2026-04-11

### Added

- **`devtools-testcase-verifier` skill を新設**（testcase-author と対になる検証専用スキル）
  - 5 バケット (OK / TC_WRONG / IMPL_BUG / OTHER / SKIP) で振り分け
  - Chrome MCP ガイドライン G1〜G10 + 禁止事項 + 判定ルールを references/ に
  - テンプレート: CLAUDE.md / 00_plan.md / 01_checklist.md / report-role.md / report-summary.md
  - スクリプト: init-verification-round / fetch-test-cases / update-checklist / generate-reports / sync-to-devtools
  - ドメイン別のロール別レポート + 全体サマリを自動生成

- **PreToolUse hook で API 直叩きを物理ブロック** (`check-evaluate-script.sh`)
  - `mcp__chrome__evaluate_script` の入力を検査し、`fetch()` / `XMLHttpRequest` / `axios` / `sendBeacon` / `$.ajax` を含む場合は exit 2 で却下
  - 前セッション b5380ac5 解析で「API 直叩きで怒られる」問題が多発していた事例への対策
  - Claude にブロック理由と代替手段（UI 操作 / list_network_requests / OTHER 記録）を feedback

- **SessionStart hook で復帰時の記憶劣化を防止** (`session-start.sh`)
  - ラウンドディレクトリ配下での起動・resume 時に CLAUDE.md + 進捗サマリ + 最新 log を自動注入
  - context 圧縮後の「前のステップでやったはず」問題への対策

- **strict settings.json を init 時に生成**
  - allow: chrome MCP UI 操作系 + `list_network_requests` / `get_network_request` + TaskCreate/Update
  - ask: `evaluate_script` / `Write` / `Edit` / `Bash`（hook で内容検査 + 承認制）
  - deny: `rm -rf` / `git push --force` / `reset --hard` / `WebFetch`

- **init-verification-round.mjs を対話モード + 自動推測対応**
  - `package.json.name` → project, `docs/test-cases/*.md` の `role_code` → roles, 既存 round 番号 → 次 round を自動推測
  - `--interactive` で readline prompt モード
  - Claude Code 会話経由で「検証ラウンドを作って」と言えば、AskUserQuestion で不足情報を確認して Bash 実行する運用が可能に

### Changed

- **CLAUDE.md テンプレート 50 行化** (78 → 57 行)
  - 冒頭に「セッション復帰時の必読手順」セクション追加
  - 詳細を references/ に移譲し、context 圧縮後の再読込コストを低減

- **SKILL.md (verifier) に TaskCreate/TaskUpdate 必須化を明記**
  - 1 ケース = 1 Task の運用で context 圧縮後も進捗復元可能に

- **SKILL.md (author) に verifier への相互リンク追加**
  - 作成 → 検証のパイプライン化

### Tests

- Unit: 98 / API: 84 / E2E: 36 (全パス)

## [1.2.6] - 2026-04-09

### Added

- **DebugAdmin 詳細パネルにテストケース紐付け表示**
  - メタ情報エリアに case_key バッジ (TC-XX-NNN) を表示
  - hover で domain/capability/title、クリックでフィルタ
  - NotesController.php の show() に test_cases JOIN を追加

### Changed

- **PiP 管理タブ: 一覧/確認手順を統合**
  - ビュー切替ボタン (一覧 / 確認手順) を廃止
  - 各カードにステータスセレクト + チェックリスト + resolved ボタンを統合
  - デフォルト閉じ、ヘッダークリックで開閉

### Fixed

- **PiP テストタブ初回読込が「読み込み中」のまま止まる問題**
  - importTestCases 失敗時も getTestTree を必ず呼ぶように変更

### Tests

- Unit: 98 / API: 84 / E2E: 36

## [1.2.5] - 2026-04-09

### Added

- **`POST /test-cases/import` に sync モード追加** (`api/TestController.php`)
  - payload に `"sync": true` を含めると、payload に存在しない既存 case_key を自動 archive（soft delete）
  - LEGACY-* 行は除外（旧バックフィル対象）
  - レスポンスに `archived` カウントを追加
  - MD 編集 → import だけで画面から古いケースが消える完全同期フローが実現

- **`devtools-testcase-author` skill v2**
  - case_key 命名規則（`TC-{role_code}-{連番}`、不変 ID）を skill に組み込み
  - `role_code` frontmatter 必須化、接頭辞の自動検証
  - アンチパターン A: **UI で検証できないテストを書かない**
    - NG: `DB に正しく反映される` / OK: `メンバー一覧に表示される`
  - アンチパターン B: **認可境界テストを通常ロール MD に混ぜない**
    - `access-control.md` (`role_code: AC`) を新設して集約
  - `import-test-cases.mjs`: `[TC-XX-NNN]` パーサ / role_code 検証 / 重複検知 / purge 廃止 / `--auto-archive` フラグ
  - `references/case-key-guide.md`: 命名規則・アンチパターン詳細・PR レビューチェックリスト
  - 6 テンプレート (guest/user/client/admin/app-admin/access-control) を case_key 形式に全面更新
  - プロジェクト固有情報を「タスク管理 SaaS」サンプルに汎用化

### Tests

- Unit: 98 passed / API: 84 passed / E2E: 36 passed

## [1.2.4] - 2026-04-08

### Security

- **git 履歴の認証情報を完全除去**
  - v1.2.0 で `docs/integration-guide.md` / `docs/usage.md` / `CHANGELOG.md` /
    `src/utils/parseEnvironmentsMd.test.ts` に埋め込まれていたサンプル認証情報
    （flc-design.jp ドメインのダミー email + password など）を `git filter-repo`
    で全コミット履歴から purge
  - タグ `v1.2.0` / `v1.2.1` / `v1.2.2` / `v1.2.3` を書き換え後のハッシュに force-push
  - GitHub Packages 上の v1.2.0〜v1.2.3 は削除済み
  - **該当認証情報はダミー・テスト環境のもので実害なし**
  - 利用者は `npm install @twuw-b/dev-tools@1.2.4` 以降を使用してください

### Added

- **`scripts/release/security-check.sh`** — リリース前セキュリティ検査の独立スクリプト
  - gitignore 追跡検知 / 禁止ファイル名 / サービストークン / git 履歴スキャン
  - **同梱 MD 内の KV credential (`- pass: xxx` 形式) 検出**
    値が placeholder-whitelist (`REDACTED_*` / `YOUR_*` / `<...>` 等) でなければ停止
  - `--tgz` オプションで publish 前 tgz の中身を検査
  - パターン定義: `scripts/release/secret-patterns.txt`
  - 許可リスト: `scripts/release/placeholder-whitelist.txt`

### Changed

- **`.claude/commands/release.md` を再構成**（525 → 307 行、-42%）
  - Step 番号を 0.X 混在から 1-13 のフラット構造に整理
  - セキュリティ検査を `scripts/release/security-check.sh` 呼び出しに統一
  - 差分ガードの 3 分類ロジックを Step 2 に集約
  - 禁止事項を Git / バージョン / セキュリティ / スコープでカテゴリ分け
- `docs/integration-guide.md` / `docs/usage.md` / `CHANGELOG.md` / test fixtures の
  サンプル値を placeholder 形式（`admin@example.com` / `REDACTED_PASSWORD_*`）に置換

### Fixed

- `docs/draft/pip-autosetup-and-testcase-link.md`（v1.2.0 で実装済み）を `docs/done/` に移動

### Tests

- Unit: 98 passed / API: 83 passed / E2E: 36 passed

## [1.2.3] - 2026-04-07

### Added

- **`devtools-testcase-author` Claude Code skill を npm パッケージに同梱**
  - `.claude/skills/devtools-testcase-author/**` を `package.json.files` に追加
  - 利用者は `npm install @twuw-b/dev-tools` で skill 一式（`SKILL.md` / `assets/templates/*.md` / `scripts/import-test-cases.mjs`）を取得可能
  - 導入手順: `cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-author .claude/skills/`
  - 機能: ロール軸（guest / user / client / admin / app-admin）でテストケース MD を自動生成し、`/__debug/api/test-cases/import` へ purge → import → verify まで実行

### Docs

- `docs/integration-guide.md` Step 11 に skill の導入手順と使い方を追記
- `docs/integration-guide.md` テストケース MD 作成ルールを「1 ファイル = 1 ユーザーロール」（ロール軸）と明示
- `docs/test-case-template.md` にロール軸テンプレートの説明を追記

### Tooling (internal)

- `/release` slash command の判定ロジックを改善:
  - 前タグ差分ガード（空リリース防止）
  - 次バージョンプレビューとユーザー承認
  - 変更ファイルの 3 分類（コード / 同梱 / 非同梱）とケース別 bump 強制
  - `.claude/skills/devtools-testcase-author/**` を同梱分類に追加
- `docs/rfc/001-environment-switching.md` を Proposed で起票（実装検討中・仕様未確定）

### Tests

- Unit: 98 passed / API: 83 passed / E2E: 36 passed

## [1.2.2] - 2026-04-07

### Fixed

- **環境タブのコピーボタンが PiP 内で動作しない問題を修正**
  - PiP 子ウィンドウでは `navigator.clipboard.writeText()` がフォーカス/権限要件により
    失敗することがあった。
  - `src/utils/clipboard.ts` に `copyToClipboard()` ヘルパーを新規追加し、
    (1) PiP window の navigator.clipboard → (2) メインウィンドウ → (3) PiP document 内の
    textarea + `execCommand('copy')` の 3 段階フォールバックで確実にコピーできるようにした。
  - コピー成功時に 1.2 秒間 ✓ アイコン + success カラーでフィードバック表示。

## [1.2.1] - 2026-04-07

### Fixed

- **notes 検索の LIKE ESCAPE をリテラル化** (`api/NotesController.php`)
  - SQLite は ESCAPE 句にプレースホルダバインドを許容しないため、
    旧実装 `AND (title LIKE ? OR content LIKE ?) ESCAPE ?` + `bind '\\'` では
    検索 API がエラーとなり動作しなかった。
  - 各 LIKE に `ESCAPE '\\'` をリテラル付与する形に修正。
  - `%` / `_` / `\` を含む検索クエリが正しくエスケープされるようになる。
  - **影響**: npm パッケージに `api/*.php` が同梱されているため、
    `npm install @twuw-b/dev-tools@1.2.1` で利用側は初期設定時点から修正版を入手できる。

## [1.2.0] - 2026-04-07

### Added

#### `<DevTools>` ワンストップ統合コンポーネント (#pip-autosetup)

従来、利用側プロジェクトで `DebugPanel` / `logCapture` / `useDebugMode` / `setDebugApiBaseUrl` を
手動配線する必要があったが、`<DevTools>` 1 コンポーネントに集約。

```tsx
// Before（15行程度の配線）
import { DebugPanel, useDebugMode, setDebugApiBaseUrl, createLogCapture } from '@twuw-b/dev-tools';
setDebugApiBaseUrl(debugApiUrl);
const logCapture = createLogCapture({ console: true, network: ['/api/**'] });
function AppContent() {
  const { isDebugMode } = useDebugMode();
  return <>{isDebugMode && <DebugPanel logCapture={logCapture} testCases={allTestCases} />}</>;
}

// After（1 行）
import { DevTools } from '@twuw-b/dev-tools';
<DevTools apiBaseUrl={debugApiUrl} testCases={allTestCases} />
```

- `apiBaseUrl` を内部で `setDebugApiBaseUrl()` に渡す
- `createLogCapture({ console: true, network: ['/api/**'] })` を自動生成（`logCaptureConfig` / `disableLogCapture` で上書き可）
- `useDebugMode()` を購読し、debug mode ON で PiP を自動表示
- **`/__admin` ルート滞在中は debug mode を強制 ON 扱い**し、管理ダッシュボードと PiP を同時表示
  （`adminRoutePath` prop でカスタマイズ可）

#### record タブでの「実行中テストケース」自動紐付け

test タブで capability を展開している間、そのケース ID が「実行中」扱いとなり、
record タブに切り替えて保存すると `test_case_ids` に自動で紐付けられる。

- record タブ上部に「実行中: #12, #15 [解除]」バッジを表示
- バッジの [解除] で任意にクリア可能
- 既存の `note_test_cases` 中間テーブルを使用（DB スキーマ変更なし）

#### 新タブ「環境」 — 環境情報ビューア

`<DevTools environmentsMd={...} />` に Markdown 文字列を渡すと、
PiP に新タブ「環境」が追加され、プロジェクト・環境ごとの URL / 認証情報 / Basic 認証 /
前提・注意点を構造化 UI で表示。

**UI 機能**:
- 警告バナー（frontmatter `warning`）
- プロジェクト折り畳み + phase バッジ
- env タブ切替（dev / staging / prod）
- KV カード: パスワード自動マスク + 表示トグル、URL 開く、全項目クリップボードコピー
- 表セル: `パスワード` カラム自動マスク、URL 自動リンク化、セルコピー
- 前提・注意点は `<details>` 折り畳み

**MD フォーマット（規約 + パススルー）**:
```markdown
---
title: アプリケーション アカウント情報
warning: 取り扱い注意
---

# trinos

phase: Phase 1

## dev / ルートアカウント

- url: https://d1example-dev.cloudfront.net/admin/login/
- email: admin@example.com
- pass: REDACTED_PASSWORD_ROOT_DEV

## 前提・注意点

- staging は毎週月曜リセット
```

規約に合わない要素（段落・コードブロック・`###` 以降の見出し等）は
`MarkdownRenderer` でそのまま描画されるため柔軟。

**セキュリティ**: 機密情報を含む `environments.md` は必ず `.gitignore` に登録すること。
推奨はパスワードマネージャー参照 ID のみ記載する運用。

### New Exports

- `DevTools` / `DevToolsProps` — ワンストップ統合コンポーネント
- `parseEnvironmentsMd(md: string): EnvironmentInfoDoc` — 環境情報パーサ
- 型: `EnvironmentInfoDoc` / `EnvironmentProject` / `EnvironmentGroup` / `EnvironmentSection` / `EnvironmentKV` / `EnvironmentTable`

### Changed

- `DebugPanel` のタブが 4 → **5 タブ** に（記録 / 管理 / テスト / マニュアル / **環境**）
- `DebugPanelProps` に `environmentsMd?: string` を追加
- `TestTab` に `onRunningCasesChange?: (caseIds: number[]) => void` prop を追加
- `docs/integration-guide.md` Step 8 を `<DevTools>` 1 行配線に書き換え

### Migration

既存の `<DebugPanel>` 直接配線は引き続き動作するため破壊的変更はありません。
新規プロジェクトおよび簡素化を希望する既存プロジェクトは `<DevTools>` への移行を推奨。

```diff
- import { DebugPanel, useDebugMode, setDebugApiBaseUrl, createLogCapture } from '@twuw-b/dev-tools';
- setDebugApiBaseUrl(debugApiUrl);
- const logCapture = createLogCapture({ console: true, network: ['/api/**'] });
- function AppContent() {
-   const { isDebugMode } = useDebugMode();
-   return <>{isDebugMode && <DebugPanel logCapture={logCapture} testCases={allTestCases} />}</>;
- }
+ import { DevTools } from '@twuw-b/dev-tools';
+ <DevTools apiBaseUrl={debugApiUrl} testCases={allTestCases} />
```

### Tests

- Unit: 94 tests passed（+8: `parseEnvironmentsMd`）
- API: 83 tests passed（変更なし）
- E2E: 36 tests passed（変更なし）

---

## [1.1.x] 以前

GitHub の commit 履歴を参照してください: <https://github.com/TWUW-b/dev-tools/commits/main>
