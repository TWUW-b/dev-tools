# DebugPanel.tsx 分割リファクタリング

**Status:** done

---

## 概要

`src/components/DebugPanel.tsx` が1720行の巨大コンポーネントになっていた。タブ単位で分割し、可読性・保守性を改善。

## 実施した分割

### Before: 1ファイル 1720行

### After: 5ファイル

| ファイル | 行数 | 内容 |
|---|---|---|
| `DebugPanel.tsx` | 462 | コンテナ（PiP制御, タブ切替, 記録タブ, フッター） |
| `debug/styles.ts` | 757 | PiPウィンドウCSS, トリガーボタン, フォールバックスタイル |
| `debug/TestTab.tsx` | 413 | テスト実行タブ（自己完結: state + handlers + JSX） |
| `debug/ManageTab.tsx` | 80 | ノート管理タブ（自己完結: filter state + JSX） |
| `debug/ManualTabContent.tsx` | 57 | マニュアルタブ（既存の独立コンポーネントを外部ファイルに移動） |

### ドラフトからの差分

- **RecordTab は DebugPanel にインライン** — フッター（`<main>` 外の `<footer>`）との密結合、タブ切替時のフォーム state 保持が必要なため、外部化すると props drilling が過剰になる
- **PiPContainer は不要** — PiP制御はDebugPanelの本質的責務
- **カスタムフック（useBugForm, useTestExecution）は未作成** — TestTab が自己完結で state を管理しており、1箇所でしか使わないフックは過剰な抽象化
- **constants.ts → styles.ts にリネーム** — COLORS は既に `src/styles/colors.ts` に集約済み。ここは PiP CSS のみ
- **TestTab は forwardRef + useImperativeHandle** — ヘッダーのリフレッシュボタンから TestTab.refresh() を呼ぶため

## 変更方針（実際の適用）

- **機能変更なし** — 見た目と動作は完全に現状維持
- **記録タブの state は DebugPanel に残留** — タブ切替時にフォーム入力が消えない
- **ManageTab / TestTab は自己完結** — 独自の state を持ち、必要最小限の props のみ受け取る
- **冗長な `<style>` タグ削除** — `@keyframes spin` は `getPipStyles()` に既に定義済みだった
