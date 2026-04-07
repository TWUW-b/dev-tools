# Changelog

すべての特筆すべき変更はこのファイルに記載されます。

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
