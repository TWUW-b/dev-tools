# @twuw-b/dev-tools

開発・テスト環境向けの統合デベロッパーツール。

デバッグノート記録、テストフロー管理、マニュアル表示、フィードバック収集を1つのライブラリに統合。

## 特徴

- **デバッグノート**: PiP ウィンドウで不具合・違和感を最小入力で記録
- **テストフロー**: Domain/Capability/Case 階層のチェックリスト実行
- **マニュアル表示**: Markdown ドキュメントの PiP / サイドバー / タブ表示
- **フィードバック**: ユーザーからのバグ報告・要望・質問を収集
- コンソール・ネットワークログの自動キャプチャ
- dev / test 環境ごとにデータ分離
- PHP + SQLite のシンプルなバックエンド

## インストール

> **Private パッケージ**: GitHub Packages（private registry）から配布。npmjs.com には公開されていないため、認証設定が必要。

### 1. プロジェクトの `.npmrc` を作成

```
@twuw-b:registry=https://npm.pkg.github.com
```

### 2. 認証トークンを設定

GitHub Personal Access Token（`read:packages` 権限）が必要。

#### 方法 A: `~/.npmrc` に設定（ローカル開発）

```
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx
```

> トークンの作成: GitHub → Settings → Developer settings → Personal access tokens → `read:packages` 権限で生成

#### 方法 B: 環境変数で設定（CI/CD）

プロジェクトの `.npmrc` を以下に変更:

```
@twuw-b:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

GitHub Actions の場合:

```yaml
- name: Install dependencies
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GH_PACKAGES_TOKEN }}
  run: npm ci
```

### 3. インストール

```bash
npm install @twuw-b/dev-tools
```

## インポートパス

| パス | 内容 |
|------|------|
| `@twuw-b/dev-tools` | 全機能（デバッグ + マニュアル + フィードバック） |
| `@twuw-b/dev-tools/components` | コンポーネントのみ |
| `@twuw-b/dev-tools/hooks` | フックのみ |
| `@twuw-b/dev-tools/manual` | マニュアル系コンポーネントのみ |

## クイックスタート

### デバッグパネル（デバッグノート + テストフロー + マニュアル）

```typescript
import {
  DebugPanel,
  useDebugMode,
  setDebugApiBaseUrl,
  createLogCapture,
} from '@twuw-b/dev-tools';

// API URL を設定
setDebugApiBaseUrl('https://your-domain.com/__debug/api');

// ログキャプチャ初期化（アプリ起動時に1回）
const logCapture = createLogCapture({
  console: true,
  network: ['/api/**'],
});

// マニュアル項目
const manualItems = [
  { id: 'guide', title: '使い方ガイド', path: '/docs/guide.md' },
  { id: 'faq', title: 'よくある質問', path: '/docs/faq.md' },
];

function App() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      <YourApp />
      {isDebugMode && (
        <DebugPanel
          logCapture={logCapture}
          manualItems={manualItems}
        />
      )}
    </>
  );
}
```

デバッグモードの起動:
- URL: `#debug`
- キーボード: `z` キーを素早く3回押す（トグル）

### マニュアル PiP（単体使用）

```typescript
import { ManualPiP, useManualPiP } from '@twuw-b/dev-tools/manual';

function App() {
  const { isOpen, currentPath, openPiP, closePiP, setPath } = useManualPiP();

  return (
    <>
      <button onClick={() => openPiP('/docs/guide.md')}>ヘルプ</button>
      <ManualPiP
        isOpen={isOpen}
        docPath={currentPath}
        onClose={closePiP}
        onNavigate={setPath}
      />
    </>
  );
}
```

### フィードバック

```typescript
import { FeedbackForm } from '@twuw-b/dev-tools/manual';

// FeedbackForm は ManualPiP / ManualTabPage 内で自動表示される
// feedbackApiBaseUrl を指定すると有効化
<ManualPiP
  feedbackApiBaseUrl="https://your-domain.com/__feedback/api"
  feedbackUserType="developer"
  feedbackAppVersion="1.0.0"
/>
```

## API バックエンド

PHP + SQLite のバックエンド。ノート記録・テストフロー・フィードバック収集を `api/` に統合。

### セットアップ

```bash
cp api/config.example.php api/config.php

# Docker で起動（PHP 8.4）
npm run docker:up
```

## ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [使用方法ガイド](./docs/usage.md) | コンポーネント・フック・API リファレンス |
| [セットアップガイド](./docs/setup.md) | 導入・デプロイ手順 |
| [仕様書](./docs/requirement.md) | 詳細仕様 |
| [PiP実装ガイド](./docs/pip-implementation.md) | Document PiP API の実装詳細 |

## 構成

```
dev-tools/
├── src/
│   ├── components/        # UI コンポーネント
│   │   ├── manual/        # マニュアル・フィードバック系
│   │   └── admin/         # 管理画面系
│   ├── hooks/             # React フック
│   ├── utils/             # ユーティリティ
│   ├── styles/            # スタイル定義
│   └── types/             # 型定義
├── api/                   # API（PHP + SQLite）
├── sample/                # 開発用サンプルアプリ
└── docs/                  # ドキュメント
```

## 開発

```bash
# API 設定
cp api/config.example.php api/config.php

# Docker で API 起動（PHP 8.4）
npm run docker:up

# サンプルアプリ起動
npm run sample

# ブラウザでアクセス
# http://localhost:3000#debug

# テスト実行
npm run test

# 型チェック
npm run typecheck

# ビルド
npm run build

# Docker 停止
npm run docker:down
```

## パッケージ公開

```bash
# GitHub に認証（初回のみ）
npm login --registry=https://npm.pkg.github.com

# テスト + ビルド + publish（prepublishOnly で自動実行）
npm publish
```

バージョン更新:

```bash
npm version patch  # 1.0.0 → 1.0.1
npm publish
```

## ライセンス

MIT
