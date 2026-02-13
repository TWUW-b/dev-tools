# セットアップガイド

本ドキュメントは `@twuw-b/dev-tools` を利用するプロジェクト向けのセットアップ手順です。
インフラ固有のデプロイ手順は `docs/operation/` を参照。

## 目次

0. [ローカル開発環境（Docker）](#0-ローカル開発環境docker)
1. [フロントエンド設定](#1-フロントエンド設定)
2. [バックエンド（API）デプロイ](#2-バックエンドapiデプロイ)
3. [動作確認](#3-動作確認)

---

## 0. ローカル開発環境（Docker）

ライブラリ開発・動作確認用のDocker環境。

### 必要条件

- Docker Desktop
- Node.js 18+

### サーバー要件（デプロイ時）

- PHP 8.4
- PDO SQLite 拡張
- mod_rewrite（Apache）

### 起動手順

```bash
# リポジトリをクローン
git clone https://github.com/twuw-b/dev-tools.git
cd dev-tools

# 依存関係インストール
npm install

# API 設定ファイル作成
cp api/config.example.php api/config.php

# Docker で API 起動（PHP 8.4）
npm run docker:up

# サンプルアプリ起動
npm run sample

# ブラウザでアクセス
open http://localhost:3000#debug
```

### Docker コマンド

| コマンド | 説明 |
|----------|------|
| `npm run docker:up` | API コンテナ起動（バックグラウンド） |
| `npm run docker:down` | API コンテナ停止 |
| `npm run docker:logs` | API ログをフォロー表示 |
| `npm run docker:build` | イメージ再ビルド（キャッシュなし） |

### 構成

```
localhost:3000  → フロントエンド（Vite サンプルアプリ）
localhost:8081  → API（PHP 8.4 / Docker）
```

> **Note**: 利用側プロジェクトでは通常 `localhost:5173`（Vite デフォルト）で起動します。

---

## 1. フロントエンド設定

### インストール

#### GitHub Packages から

```bash
# .npmrc をプロジェクトルートに作成
echo "@twuw-b:registry=https://npm.pkg.github.com" > .npmrc

# インストール
npm install @twuw-b/dev-tools
```

> GitHub Packages からインストールするには、GitHub の Personal Access Token（`read:packages` 権限）が必要。
> `~/.npmrc` に `//npm.pkg.github.com/:_authToken=ghp_xxxx` を設定する。

#### ローカルパスから（開発時）

```bash
# 相対パス指定
npm install ../path/to/dev-tools

# 絶対パス指定
npm install /Users/gen/dev/library/dev-tools

# または package.json に直接記載
{
  "dependencies": {
    "@twuw-b/dev-tools": "file:../path/to/dev-tools"
  }
}
```

> **Note**: ローカルインストール時はライブラリ側で `npm run build` を事前に実行しておく必要があります。

### React 重複インスタンス問題（重要）

ローカルパスからインストールした場合、以下のエラーが発生することがあります:

```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
```

**原因**: ライブラリの `node_modules/react` とアプリの `node_modules/react` が別インスタンスになる。

**解決策**: アプリ側の `vite.config.ts` に `dedupe` を追加:

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // ...
});
```

これにより Vite が React を単一インスタンスに統一します。

### 環境変数

`.env.development` / `.env.test` に API URL を設定。

```env
# .env.development
VITE_DEBUG_API_URL=https://your-domain.com/__debug/api
VITE_FEEDBACK_API_URL=https://your-domain.com/__manual/api
VITE_FEEDBACK_ADMIN_KEY=your-admin-key

# .env.test
VITE_DEBUG_API_URL=https://test.your-domain.com/__debug/api
VITE_FEEDBACK_API_URL=https://test.your-domain.com/__manual/api
VITE_FEEDBACK_ADMIN_KEY=your-admin-key
```

### アプリへの組み込み

```typescript
// main.tsx または App.tsx
import {
  setDebugApiBaseUrl,
  createLogCapture,
  DebugPanel,
  useDebugMode,
  parseTestCaseMd,
} from '@twuw-b/dev-tools';

// API URL を設定
const debugApiUrl = import.meta.env.VITE_DEBUG_API_URL;
if (debugApiUrl) {
  setDebugApiBaseUrl(debugApiUrl);
}

// ログキャプチャ初期化（アプリ起動時に1回、DebugPanelマウント前に実行）
const logCapture = createLogCapture({
  console: true,                  // error 30件 + warn/log 30件（合計60件）
  network: ['/api/**'],           // /api/ 配下を監視
});

function App() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      <YourApp />
      {isDebugMode && (
        <DebugPanel
          logCapture={logCapture}
        />
      )}
    </>
  );
}
```

### 管理画面（DebugAdmin）

```typescript
import { DebugAdmin } from '@twuw-b/dev-tools';

<DebugAdmin
  apiBaseUrl={import.meta.env.VITE_DEBUG_API_URL}
  env="dev"
  feedbackApiBaseUrl={import.meta.env.VITE_FEEDBACK_API_URL}
  feedbackAdminKey={import.meta.env.VITE_FEEDBACK_ADMIN_KEY}
/>
```

### ログキャプチャ設定

```typescript
// 最小設定
const logCapture = createLogCapture({
  console: true,        // error 30件 + warn/log 30件（合計60件）
  network: ['/api/**'], // パターンマッチでURL指定
});

// 詳細設定
const logCapture = createLogCapture({
  console: {
    // levels は廃止（error, warn, log 固定）
    maxErrorEntries: 30,   // error専用バッファ上限（デフォルト: 30）
    maxLogEntries: 30,     // warn+log バッファ上限（デフォルト: 30）
    filter: (msg) => !msg.includes('[HMR]'),
  },
  network: {
    include: ['/api/**'],
    exclude: ['/api/health'],
    errorOnly: false,
    captureHeaders: true,  // Authorization等は自動マスク
    maxEntries: 30,
  },
});
```

### テストケースMD

テストケースを Markdown で定義し、PiPのテストタブで使用できます。

**形式**: `domain:` frontmatter + `#` Capability + `##` グルーピング（任意） + `-` Case

```markdown
---
domain: admin
---

# A1 事務所登録

## 正常系
- 必須項目のみで登録できる
- 全項目入力して登録できる

## バリデーション
- 必須項目未入力でエラーが表示される
- 文字数上限超過でエラーが表示される

# A2 事務所編集

## 正常系
- 既存データを編集して保存できる
```

#### パースルール

| MD要素 | 解釈 |
|--------|------|
| frontmatter `domain:` | Domain 名 |
| `# 見出し` | Capability 名 |
| `## 見出し` | 視覚的グルーピング（**データとして保持しない**） |
| `- テキスト` | Case（テストケース） |

`##` 見出しはMDファイルの可読性のためだけに存在し、パース時にはCaseのみ抽出される。

```typescript
import { parseTestCaseMd } from '@twuw-b/dev-tools';

const testCases = parseTestCaseMd(mdString);
// ParsedTestCase[] = [
//   { domain: 'admin', capability: 'A1 事務所登録', title: '必須項目のみで登録できる' },
//   { domain: 'admin', capability: 'A1 事務所登録', title: '全項目入力して登録できる' },
//   { domain: 'admin', capability: 'A1 事務所登録', title: '必須項目未入力でエラーが表示される' },
// ]

<DebugPanel testCases={testCases} logCapture={logCapture} />
```

### 本番ビルドからの除外

本番環境では import しないようにする。

```typescript
// main.tsx
if (import.meta.env.MODE !== 'production') {
  import('@twuw-b/dev-tools').then(({ setDebugApiBaseUrl }) => {
    setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);
  });
}
```

---

## 2. バックエンド（API）デプロイ

### 2.1 API ファイルの管理

利用側プロジェクトでは `api/` ディレクトリのファイルをコピーして使う。

| 方法 | メリット | デメリット |
|------|----------|------------|
| **コピー（推奨）** | シンプル、依存なし | 更新時に手動コピー |
| Submodule | 単一ソース | 複雑、更新手順が増える |
| npm install | バージョン管理 | API は npm 配布しない |

### 2.2 設定ファイルの作成

```bash
cp config.example.php config.php
```

`config.php` を編集：

```php
<?php
return [
    'db' => [
        'dev'  => __DIR__ . '/data/debug-dev.sqlite',
        'test' => __DIR__ . '/data/debug-test.sqlite',
    ],
    'allowed_origins' => [
        'https://your-domain.com',
        'http://localhost:5173',
    ],
    'api_key' => null,
    'feedback_admin_key' => 'your-admin-key',
    'upload_dir' => __DIR__ . '/data/attachments',
];
```

### 2.3 データディレクトリの作成

```bash
mkdir -p data
chmod 755 data
```

`data/.htaccess` を作成（Apache）:

```apache
# Apache 2.4+
Require all denied

# Apache 2.2 (フォールバック)
<IfModule !mod_authz_core.c>
    Deny from all
</IfModule>
```

### 2.4 データベースの初期化

**手動での初期化は不要です。** API への初回アクセス時に `Database.php` が自動でスキーマを作成します。

参考用のスキーマ定義は `schema.sql` にあります。

### 2.5 API ファイル更新手順

ライブラリ更新時に API ファイルを再コピーする。

```bash
LIB=/path/to/dev-tools/api

# Debug Notes API（全ファイル）
cp $LIB/index.php $LIB/Database.php $LIB/NotesController.php \
   $LIB/TestController.php $LIB/FeedbackController.php \
   $LIB/AttachmentController.php $LIB/.htaccess \
   ./debug-notes-api/

# Feedback API（必要なファイルのみ）
cp $LIB/index.php $LIB/Database.php \
   $LIB/FeedbackController.php $LIB/AttachmentController.php \
   $LIB/.htaccess \
   ./frontend/public/__manual/api/
```

---

## 3. 動作確認

### API テスト

```bash
# Debug Notes: 一覧取得
curl "https://your-domain.com/__debug/api/notes?env=dev"

# Debug Notes: 新規作成
curl -X POST "https://your-domain.com/__debug/api/notes?env=dev" \
  -H "Content-Type: application/json" \
  -d '{"title":"テスト","content":"動作確認"}'

# Feedback: 一覧取得（管理者）
curl "https://your-domain.com/__manual/api/feedbacks" \
  -H "X-Admin-Key: your-admin-key"
```

### フロントエンドテスト

1. 開発サーバーを起動: `npm run dev`
2. `http://localhost:5173#debug` にアクセス
3. デバッグパネルが表示されることを確認
4. ノートを作成して保存できることを確認

---

## トラブルシューティング

### CORS エラーが出る

`config.php` の `allowed_origins` にフロントエンドのオリジンを追加。

```php
'allowed_origins' => [
    'http://localhost:5173',  // 追加
],
```

### 500 エラーが出る

1. PHP エラーログを確認
2. `data/` ディレクトリの権限を確認（755）
3. SQLite ファイルが作成されているか確認

### SQLite ファイルに直接アクセスできてしまう

`data/.htaccess` が正しく設置されているか確認。

### useState エラー（React 重複インスタンス）

```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
```

ローカルパスからインストールした場合に発生。
「React 重複インスタンス問題」セクションの `dedupe` 設定を確認。

---

## 環境変数一覧

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_DEBUG_API_URL` | Debug Notes API の URL | `https://example.com/__debug/api` |
| `VITE_FEEDBACK_API_URL` | Feedback API の URL | `https://example.com/__manual/api` |
| `VITE_FEEDBACK_ADMIN_KEY` | Feedback 管理者キー | `dev-feedback-admin-2026` |

---

## インフラ別デプロイガイド

| インフラ | ドキュメント |
|---------|-------------|
| Xserver | [docs/operation/xserver/deploy.md](operation/xserver/deploy.md) |
