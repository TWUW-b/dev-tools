# プロジェクト統合: dev-tools / debug-notes / manual-viewer

**Status:** draft

---

## 概要

`/Users/gen/dev/library` 配下に3つのプロジェクトが存在し、コードが手動コピーで重複管理されている。バグ修正が片方にしか適用されないリスクが常にある。

## 現状の問題

| プロジェクト | バージョン | 問題 |
|---|---|---|
| `dev-tools` | 1.0.0 | メイン。manual-viewer機能を `src/components/manual/` に内包 |
| `debug-notes` | 1.0.0 | dev-tools のサブセット（manual/feedback機能なし）。共通部分は同一コード |
| `manual-viewer` | 0.1.0 | dev-tools の manual コンポーネントを切り出した未完成ライブラリ |

### 具体的な重複箇所

1. **dev-tools vs debug-notes**
   - `src/utils/maskSensitive.ts` — 完全同一（文字単位で一致）
   - `src/hooks/useDebugNotes.ts`, `useDebugMode.ts` — 実質同一
   - `src/utils/logCapture.ts`, `api.ts` — 実質同一
   - `src/components/DebugPanel.tsx` — dev-tools版は1737行、debug-notes版は1530行。dev-tools版にはManualTabContent (約200行) が追加されている
   - `src/components/DebugAdmin.tsx` — 同一
   - debug-notes はソースファイル23個、dev-tools は44個。debug-notes は manual/feedback 機能を持たない

2. **dev-tools vs manual-viewer**
   - `dev-tools/src/components/manual/ManualPage.tsx` ≒ `manual-viewer/src/components/ManualPage.tsx`
   - `dev-tools/src/components/manual/ManualSidebar.tsx` ≒ `manual-viewer/src/components/ManualSidebar.tsx`
   - `dev-tools/src/components/manual/ManualLink.tsx` ≒ `manual-viewer/src/components/ManualLink.tsx`
   - import パスが異なるだけで中身はほぼ同一

## 選択肢

### A. モノレポ化 (推奨)

```
library/
├── packages/
│   ├── core/          # 共通ユーティリティ (logCapture, maskSensitive, api)
│   ├── debug-panel/   # DebugPanel, DebugAdmin
│   ├── manual-viewer/ # Manual系コンポーネント
│   └── dev-tools/     # 統合パッケージ (core + debug-panel + manual-viewer)
├── api/               # PHP バックエンド (1つ)
└── package.json       # ワークスペース設定
```

- npm workspaces または pnpm workspaces で管理
- 各パッケージが独立して公開可能
- 共通コードの一元管理

### B. debug-notes を廃止、dev-tools に統合

- debug-notes リポジトリを archive
- dev-tools を唯一の正として運用
- manual-viewer は dev-tools のサブパスエクスポートとして提供

### C. 現状維持 + 自動同期スクリプト

- 非推奨。根本解決にならない

## 影響範囲

- `package.json` (全プロジェクト)
- `tsconfig.json` (パス解決)
- `vite.config.ts` (ビルドエントリ)
- import パス (全ソースファイル)
- npm 公開設定

## 判断基準

| 基準 | A. モノレポ | B. 統合 |
|------|-----------|---------|
| 作業量 | 大 | 中 |
| 保守性 | 最良 | 良 |
| 柔軟性 | 高（個別公開可） | 中（単一パッケージ） |
| 複雑性 | ワークスペース設定必要 | 低 |
