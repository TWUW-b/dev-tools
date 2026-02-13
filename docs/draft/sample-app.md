# サンプルアプリ全機能デモ

**Status:** draft

---

## 概要

`sample/` ディレクトリのサンプルアプリを全機能カバーに拡張。Consumer がライブラリ導入時にリファレンスとして使える状態にする。

---

## ビュー構成

| ビュー | コンポーネント | 機能 |
|--------|---------------|------|
| App | `DebugPanel` | バグ報告・テスト実行・マニュアル（PiP から開く） |
| Admin | `DebugAdmin` | ノート管理・ステータス変更・テスト概要 |
| Manual (Tab) | `ManualTabPage` | タブ表示・リサイズサイドバー・フィードバック統合 |
| Manual (Sidebar) | `ManualSidebar` + `MarkdownRenderer` + `useManualLoader` | サイドバー選択・ページ表示・PiP/新タブで開く |
| Feedback | `FeedbackAdmin` | フィードバック一覧・フィルタ・ステータス管理 |
| Utils | — | `maskSensitive`・`parseTestCaseMd`・`createLogCapture`・`createFeedbackLogCapture`・`useFeedbackAdminMode` |

---

## 使用コンポーネント・フック・ユーティリティ一覧

### コンポーネント

| コンポーネント | 使用ビュー | 用途 |
|---------------|-----------|------|
| `DebugPanel` | App (debug mode時) | PiP デバッグパネル。Record/Manage/Test/Manual タブ |
| `DebugAdmin` | Admin | ノート管理画面。テスト概要・ステータスバッジ |
| `ManualTabPage` | Manual (Tab) | フルページマニュアル表示。サイドバー・フィードバック統合 |
| `ManualSidebar` | Manual (Sidebar) | カテゴリ別マニュアル項目リスト。PiP/新タブボタン |
| `ManualPiP` | 全ビュー共通 | PiP フローティングウィンドウ。ダウンロード・フィードバック対応 |
| `MarkdownRenderer` | Manual (Sidebar) | Markdown レンダリング。リンクハンドラ・app: プロトコル対応 |
| `FeedbackAdmin` | Feedback | フィードバック管理画面。フィルタ・ステータス更新・削除 |

### フック

| フック | 使用箇所 | 用途 |
|--------|---------|------|
| `useDebugMode` | App (root) | デバッグモード検知（URL/キーボード/localStorage） |
| `useManualPiP` | App (root) | PiP 開閉状態管理。`openPiP`/`openTab`/`closePiP`/`setPath` |
| `useManualLoader` | Manual (Sidebar) | Markdown ファイル fetch。loading/error/content |
| `useFeedbackAdminMode` | Utils | `?feedback=admin` パラメータ検知 |
| `setManualTabBaseUrl` | 初期化 | 別タブ表示用のベース URL 設定 |

### ユーティリティ

| ユーティリティ | 使用箇所 | 用途 |
|---------------|---------|------|
| `setDebugApiBaseUrl` | 初期化 | Debug API の接続先設定 |
| `createLogCapture` | 初期化 | console/network ログの自動キャプチャ |
| `createFeedbackLogCapture` | 初期化 | フィードバック用軽量ログキャプチャ |
| `parseTestCaseMd` | 初期化 | Markdown → テストケース解析 |
| `maskSensitive` | Utils | 個人情報・認証情報の自動マスク |
| `loadMaterialSymbols` | 初期化 | Material Symbols フォント読み込み |

---

## サンプルドキュメント

`sample/public/docs/` に配置:

| ファイル | 内容 |
|----------|------|
| `index.md` | 目次。`app:` プロトコルリンクのテスト含む |
| `guide.md` | 使い方ガイド。各機能の説明 |
| `faq.md` | FAQ。トラブルシューティング |
| `api.md` | API リファレンス。エンドポイント仕様 |

---

## 起動方法

```bash
# API 起動
npm run docker:up

# サンプル起動
npm run sample

# アクセス
open http://localhost:3000
open http://localhost:3000#debug        # デバッグモード
open http://localhost:3000?feedback=admin     # フィードバック管理モード
```

---

## デモで確認できるフロー

1. **デバッグ記録フロー**: App → `#debug` → パネル表示 → Record タブ → 内容入力 → 送信
2. **テスト実行フロー**: App → パネル → Test タブ → ケース選択 → pass/fail → ノート自動紐付け
3. **マニュアル表示フロー**: Manual (Tab) → サイドバーリンク → ドキュメント表示 → リンク遷移
4. **PiP フロー**: 任意のビュー → Nav の PiP ボタン → フローティングウィンドウ表示 → ダウンロード
5. **フィードバックフロー**: Manual (Tab) → フィードバックフォーム → 送信 → Feedback ビューで確認
6. **ユーティリティ確認**: Utils → maskSensitive 実行 → logCapture 状態確認 → ログテスト

---

## 変更ファイル

| ファイル | 変更 |
|----------|------|
| `sample/App.tsx` | 全面書き直し。6ビュー構成 |
| `sample/index.html` | タイトル更新 |
| `sample/public/docs/index.md` | 新規。目次 |
| `sample/public/docs/guide.md` | 新規。使い方ガイド |
| `sample/public/docs/faq.md` | 新規。FAQ |
| `sample/public/docs/api.md` | 新規。API リファレンス |

---

## 未使用のエクスポート

以下はサンプルで直接使用していないが、内部で使用されている:

| エクスポート | 理由 |
|-------------|------|
| `ManualPage` | `ManualTabPage` が内部で同等機能を提供 |
| `ManualLink` | `MarkdownRenderer` が内部でリンク処理 |
| `FeedbackForm` | `ManualPiP`/`ManualTabPage` が内部で統合 |
| `useDebugNotes` | `DebugPanel` が内部で使用 |
| `useFeedback` | `FeedbackForm` が内部で使用 |
| `useFeedbackAdmin` | `FeedbackAdmin` が内部で使用 |
| `useResizable` | `ManualTabPage` が内部で使用 |
| `useManualDownload` | `ManualPiP` が内部で使用 |
| `postFeedback` 等 | フック経由で使用 |
| `DEBUG_COLORS`/`MANUAL_COLORS` | コンポーネント内部で使用 |
