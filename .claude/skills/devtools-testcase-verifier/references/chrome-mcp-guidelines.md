# Chrome MCP 操作ガイドライン (G1-G10)

このドキュメントは Chrome MCP を用いた自動検証の共通ルールです。
特定の MCP 実装（chrome-devtools / chrome-workspace / playwright-mcp 等）に依存しない抽象的な記述にしています。コマンド名は代表例で括弧書きしています。

---

## G1. ページ遷移は UI 操作のみ（URL 直接入力禁止）

- URL 直打ち（`navigate_page`）は **初回アクセスとログインページのみ許可**
- それ以外のページ遷移は必ずボタン・リンクのクリックで行う
- **理由**: URL 直打ちはルーティングガードやミドルウェアをバイパスする可能性がある。テストケースが「画面から遷移できる」ことを検証しているため、UI 経路を通す必要がある
- **例外**: G7 の認証切れリカバリ時の再ログイン

---

## G2. ブラウザ標準ダイアログ（alert / confirm / prompt）の対応

Chrome MCP はブラウザ標準ダイアログを自動認識できないことが多い。以下の手順で対応する:

1. **操作前にハンドラを仕込む**: ダイアログが出ると予測できる操作（削除ボタン等）の **前に** ダイアログハンドラ（`handle_dialog` 等）で `accept` または `dismiss` を設定
2. **操作がタイムアウトしたらダイアログを疑う**: click 等が応答しない場合、まずダイアログハンドラを実行してから再試行
3. **闇雲なリトライ禁止**: ダイアログを処理せずに同じ操作を繰り返さない
4. **confirm の戻り値が必要な場合**: ハンドラの結果を記録に含める

```
[操作フロー]
handle_dialog accept   ← 先に仕込む
click "削除"            ← ダイアログが出る操作
wait_for "削除完了"     ← 結果を待つ
take_screenshot         ← evidence 撮影
```

---

## G3. 待機戦略（操作間の同期）

- **ページ遷移後**: `wait_for` で遷移先の特徴的な要素が出現するまで待つ
- **API 呼び出し後**: `wait_for` でローディング解除またはレスポンス反映を待つ
- **`wait_for` なしで次の操作に進まない**（タイミング依存の失敗を防ぐ）
- **トースト・通知の確認**: 表示後すぐ消える要素は `take_screenshot` を即座に実行
- 固定 sleep (`setTimeout`) は最終手段。基本は要素ベース待機

---

## G4. 特殊 UI コンポーネントの識別と対応

MCP 自動操作が困難な UI 部品に遭遇した場合:

| コンポーネント | 問題 | 対応 |
|---|---|---|
| カレンダー / 日付ピッカー | ポップアップ内のクリック不可 | ❓ OTHER `[MCP-LIMIT]` → 人間操作に委譲 |
| カスタムドロップダウン | セレクタが不安定 | `evaluate_script` で直接値設定を試行。不可なら OTHER |
| ファイルアップロード | `input[type=file]` の操作 | `upload_file` ツールを使用 |
| iframe 内要素 | フレーム切り替え必要 | `evaluate_script` でフレーム内 DOM を操作 |
| ドラッグ&ドロップ | マウス座標制御 | `evaluate_script` でイベント合成、不可なら OTHER |
| WebSocket 依存 UI | リアルタイム更新 | `wait_for` + 十分な待機、不可なら OTHER |

- **無理に操作して壊さない** — 3 回試行して不可なら OTHER 記録して次へ
- MCP 固有の失敗を IMPL_BUG と断定しない

---

## G5. スクリーンショット撮影ルール

| タイミング | 目的 | 必須/任意 |
|---|---|---|
| 操作前 | 初期状態の記録 | 任意（複雑な操作時） |
| 操作後 | 結果の記録（判定根拠） | **必須** |
| エラー発生時 | エラー状態の記録 | **必須** |
| バグ発見時 | 再現 evidence | **必須**（複数アングル推奨） |

- 命名: `<caseId>_<slug>.png` （例: `TC-CA-032_invite_success.png`）
- 1 ケース最低 1 枚、BUG 判定時は複数枚
- フルページ推奨（viewport 内のみだと重要部分が切れる場合がある）

---

## G6. API レスポンス取得

ネットワーク監視が必要なケースでは `evaluate_script` で fetch を実行し、レスポンスを記録する:

```javascript
// evaluate_script で実行
const res = await fetch('/api/endpoint', {
  method: 'GET',
  credentials: 'include'
});
const data = await res.json();
JSON.stringify({ status: res.status, data }, null, 2);
```

- 結果は `evidence/<caseId>_<method>_<endpoint>.json` に保存
- 認可テスト（他企業アクセス等）では必ず **ステータスコード** を記録
- POST/PUT/DELETE は副作用があるため、検証用リソースでのみ実行

---

## G7. 認証切れ時のリカバリ

- 操作中に `/login` にリダイレクトされたらセッション切れ
- **対応**:
  1. 該当アカウントで再ログイン
  2. 中断したケースから再開
- **再ログイン時は `navigate_page` での URL 入力を許可**（G1 の例外）
- 再ログイン後に `take_screenshot` で認証状態を確認してから再開
- 同じアカウントで 2 回以上認証切れが起きる場合は `❓ OTHER [AUTH-EXPIRED]` 記録

---

## G8. 複数ページ/タブの管理

- `new_page` でタブを開いた場合、操作対象の切り替えは必ず `select_page` で明示
- 不要になったタブは `close_page` で閉じる（タブ増殖防止）
- **2 アカウント検証（越境テスト等）**: アカウントごとにタブを分け、`select_page` で切り替え
  - 例: タブ A = T01 管理者 / タブ B = T04 別企業ユーザー
  - 切り替え時に必ず `take_screenshot` で現在のアカウントを確認

---

## G9. コンソールエラー監視

- 各 Step 開始時に `list_console_messages` で JS エラーを確認
- 画面上正常でもコンソールにエラーがある場合は evidence として記録
- `error` レベルのメッセージは判定に含める（`warn` は参考情報）
- 記録先: `evidence/<caseId>_console.txt`

---

## G10. 操作失敗時のリトライルール

| 失敗タイプ | 対応 | 上限 |
|---|---|---|
| 要素が見つからない | `wait_for` → リトライ | 2 回 |
| クリックが反応しない | ダイアログ確認 → `handle_dialog` → リトライ | 2 回 |
| タイムアウト | ページリロード → リトライ | 1 回 |
| 3 回失敗 | ❓ OTHER 記録、失敗状態の screenshot を保存して次へ | — |

- **同一操作を 4 回以上繰り返さない**
- 失敗原因が明らかに MCP 制約の場合は即 OTHER `[MCP-LIMIT]`
- リトライ前に必ず「何を変えるか」を言語化する（盲目的リトライ禁止）

---

## 実装別の MCP コマンド対応表（参考）

| 抽象操作 | chrome-devtools MCP | playwright-mcp | 備考 |
|---|---|---|---|
| ページ移動 | `navigate_page` | `browser_navigate` | G1 準拠 |
| クリック | `click` | `browser_click` | |
| 待機 | `wait_for` | `browser_wait_for` | G3 準拠 |
| スクリーンショット | `take_screenshot` | `browser_take_screenshot` | G5 準拠 |
| ダイアログ処理 | `handle_dialog` | `browser_handle_dialog` | G2 準拠 |
| スクリプト実行 | `evaluate_script` | `browser_evaluate` | G6 準拠 |
| ファイルアップロード | `upload_file` | `browser_file_upload` | |
| コンソール取得 | `list_console_messages` | `browser_console_messages` | G9 準拠 |
| タブ管理 | `new_page` / `select_page` / `close_page` | `browser_tabs` | G8 準拠 |

利用可能な MCP 実装にあわせてコマンド名を読み替える。抽象操作のセマンティクスは共通。
