# @genlib/dev-tools 問題点一覧

## CRITICAL — 公開前に必ず修正

### 1. ~~依存関係がバンドル済みなのに dependencies にも宣言されている~~ [DONE]

`react-markdown`, `rehype-raw`, `remark-gfm`, `jszip` を `rollupOptions.external` に追加。
dist から除外され、`dependencies` 経由で消費者がインストールする正しい形に修正。

### 2. ~~react-draggable は幽霊依存~~ [DONE]

`package.json` の `dependencies` から削除済み。

### 3. ~~README がパッケージ名を間違えている~~ [DONE]

README.md を全面書き直し。`@genlib/dev-tools` に統一、マニュアル・フィードバック機能の使い方、API バックエンド、インポートパス一覧を追加。

---

## HIGH — 修正すべき

### 4. ~~Environment 型が export されていない~~ [DONE]

`src/index.ts` の type export に `Environment` を追加。

### 5. ~~src/utils/index.ts の export 漏れ~~ [DONE]

`parseTestCaseMd` と `createLogCapture` を `src/utils/index.ts` に追加。

### 6. ~~フィードバック API バックエンドが存在しない~~ [DONE]

`api/feedback/` に manual-viewer の PHP バックエンドをコピー。
`FeedbackController.php`, `Database.php`, `index.php`, `config.example.php` を配置。
`.gitignore` に `api/feedback/config.php` と `api/feedback/data/*.sqlite` を追加。

### 7. ~~新機能のテストがゼロ~~ [PARTIAL]

`feedbackLogCapture.test.ts`（14テスト）と `feedbackApi.test.ts`（10テスト）を追加。
合計 88 テスト全パス。

残作業:
- `useManualLoader.test.ts` / `useManualPiP.test.ts`（hooks）
- `MarkdownRenderer.test.tsx` / `ManualSidebar.test.tsx`（コンポーネント）
- `DebugPanel.test.tsx` / `DebugAdmin.test.tsx`（コア UI）

---

## MEDIUM — 品質のために修正すべき

### 8. ~~material-symbols.ts の JSDoc が旧パッケージ名を参照~~ [DONE]

`@genlib/manual-viewer` → `@genlib/dev-tools` に更新。

### 9. ~~LICENSE ファイルがない~~ [DONE]

MIT LICENSE ファイルをルートに作成。

### 10. ~~マニュアル・フィードバック機能のドキュメントがゼロ~~ [DONE]

README.md に統合済み（#3 で対応）。

---

## LOW — あると良い

### 11. サンプルアプリはソースを参照している

dist ではなく `@/index` からインポートしているため、実際のパッケージ出力の検証にならない。

**対応**: サンプルアプリのインポートを `@genlib/dev-tools` に変更し、`package.json` に `"@genlib/dev-tools": "file:.."` を追加して dist を参照するようにする。

**関連ファイル**:
- `sample/vite.config.ts`
- `sample/App.tsx`

### 12. FeedbackFormProps が意図的に非 export

消費者がラッパーコンポーネントを型付きで作成できない。

**対応**: `FeedbackFormProps` を `types/index.ts` に移動して export する。

**関連ファイル**:
- `src/components/manual/FeedbackForm.tsx`（現在の定義場所）
- `src/types/index.ts`
