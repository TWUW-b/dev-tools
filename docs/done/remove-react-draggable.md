# react-draggable 削除

## 背景

- `react-draggable` v4.x は内部で `ReactDOM.findDOMNode()` を使用しており、React 19 で削除された API に依存している
- このライブラリの `src/` 配下でどこからも import されていない（未使用の依存）
- ドキュメントにフォールバック案として記載があるのみで、実装は存在しない

## 変更一覧

### 1. package.json

`dependencies` から `react-draggable` を削除。

```diff
- "dependencies": {
-   "react-draggable": "^4.4.6"
- },
```

`dependencies` セクション自体が空になるため、セクションごと削除。

### 2. npm install

```bash
npm install
```

`package-lock.json` から react-draggable を除去。

### 3. docs/pip-implementation.md

#### L13: フォールバック言及を削除

```
現: - フォールバックとして react-draggable による DOM 内フローティングも検討可能
削除
```

#### L274-298: フォールバックセクションを削除

「## フォールバック（非対応ブラウザ用）」セクション全体を削除。

### 4. docs/requirement.md

#### L48: 技術スタック表

```
現: | ドラッグ機能 | react-draggable |
削除
```

#### L112: 依存関係

```
現: - `react-draggable` ^4.4.6
削除
```

dependencies 見出し（`**dependencies（ライブラリ同梱）**`）自体も不要になるため削除。

#### L146: PiP実装セクション

```
現: - 非対応ブラウザでは react-draggable によるフォールバック
削除
```

### 5. ビルド検証

```bash
npm run build
npm run test
```
