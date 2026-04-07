# Changelog

すべての特筆すべき変更はこのファイルに記載されます。

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
