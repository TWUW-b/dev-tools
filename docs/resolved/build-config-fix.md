# ビルド設定の不整合修正

**Status:** done

---

## 概要

`package.json` の exports パス、`tsconfig` のテスト除外パターンが不整合を起こしている。npm パッケージとして配布した場合、import が壊れる可能性がある。

## 問題1: TypeScript 設定の不整合 [DONE]

### 現状

**`tsconfig.json`**:
```json
"exclude": ["node_modules", "**/*.test.ts", "**/*.test.tsx"]
```

**`tsconfig.build.json`**:
```json
"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
```

`tsconfig.json` はプロジェクト全体から除外。`tsconfig.build.json` は `src/` 配下のみ限定で `node_modules` を明示的に除外していない。パターンが不統一。

### 修正

```json
// tsconfig.build.json
"exclude": ["node_modules", "src/**/*.test.ts", "src/**/*.test.tsx", "sample/**"]
```

## 問題2: barrel exports の欠落 [DONE]

### 現状

`package.json` の exports に `./utils` パスが登録されていない。

`src/utils/index.ts` には以下がエクスポートされている:
```ts
export { api, setDebugApiBaseUrl, getDebugApiBaseUrl } from './api';
export { maskSensitive } from './maskSensitive';
export { parseTestCaseMd } from './parseTestCaseMd';
export { createLogCapture } from './logCapture';
export { createFeedbackLogCapture } from './feedbackLogCapture';
export { postFeedback, getFeedbacks, ... } from './feedbackApi';
```

しかし `vite.config.ts` の entry にも `package.json` の exports にも `./utils` が存在しない。`@genlib/dev-tools/utils` での import が不可能。

### 修正

**`vite.config.ts`** のエントリに追加:
```ts
entry: {
  index: resolve(__dirname, 'src/index.ts'),
  components: resolve(__dirname, 'src/components/index.ts'),
  hooks: resolve(__dirname, 'src/hooks/index.ts'),
  utils: resolve(__dirname, 'src/utils/index.ts'),              // 追加
  'components/manual': resolve(__dirname, 'src/components/manual/index.ts'),
}
```

**`package.json`** の exports に追加:
```json
"./utils": {
  "types": "./dist/utils/index.d.ts",
  "import": "./dist/utils.js"
}
```

## 検証手順

```bash
npm run build
npm pack --dry-run    # 出力ファイル一覧を確認
```
