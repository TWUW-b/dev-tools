# セットアップガイド

本ドキュメントは `@genlib/debug-notes` を利用するプロジェクト向けのセットアップ手順です。

## 目次

0. [ローカル開発環境（Docker）](#0-ローカル開発環境docker)
1. [フロントエンド設定](#1-フロントエンド設定)
2. [バックエンド（API）デプロイ](#2-バックエンドapiデプロイ)
3. [Xserver 固有の設定](#3-xserver-固有の設定)
4. [動作確認](#4-動作確認)
5. [GitHub Actions デプロイ](#5-github-actions-デプロイ)

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
git clone https://github.com/your-org/debug-notes.git
cd debug-notes

# 依存関係インストール
npm install

# API 設定ファイル作成
cp api/config.example.php api/config.php

# Docker で API 起動（PHP 8.4）
npm run docker:up

# サンプルアプリ起動
npm run sample

# ブラウザでアクセス
open http://localhost:3000?mode=debug
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

#### npm レジストリから（公開後）

```bash
npm install @genlib/debug-notes
```

#### ローカルパスから（開発時）

```bash
# 相対パス指定
npm install ../path/to/debug-notes

# 絶対パス指定
npm install /Users/gen/dev/library/debug-notes

# または package.json に直接記載
{
  "dependencies": {
    "@genlib/debug-notes": "file:../path/to/debug-notes"
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

# .env.test
VITE_DEBUG_API_URL=https://test.your-domain.com/__debug/api
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
} from '@genlib/debug-notes';

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
    // captureRequestBody, captureResponseBody は無視される（常に全取得）
    // POST/PUT/DELETE/PATCH のボディは自動添付
    // GET レスポンスは DebugPanel の添付オプションでフィルタ
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
import { parseTestCaseMd } from '@genlib/debug-notes';

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
  import('@genlib/debug-notes').then(({ setDebugApiBaseUrl }) => {
    setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);
  });
}
```

---

## 2. バックエンド（API）デプロイ

### 2.1 ファイルのコピー

`api/` ディレクトリをサーバーにコピー。

```bash
# 例: Xserver の場合
scp -r api/ user@svXXXX.xserver.jp:/home/username/your-project/debug-api/
```

### 2.2 設定ファイルの作成

```bash
cd /home/username/your-project/debug-api/
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
        'https://dev.your-domain.com',
        'http://localhost:5173',  // ローカル開発用
    ],
    'api_key' => null,
];
```

### 2.3 データディレクトリの作成

```bash
mkdir -p data
chmod 755 data
```

`data/.htaccess` を作成（Apache 2.4 対応）:

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

---

## 3. Xserver 固有の設定

### 3.1 ディレクトリ構成

Xserver では `public_html` 内にAPIを配置し、`.htaccess` でルーティングする。

```
/home/username/
├── public_html/              # 公開ディレクトリ
│   ├── .htaccess             # ★ ルーティング設定を追加
│   ├── index.html            # フロントエンド
│   └── assets/
│
└── your-project/
    └── debug-api/            # API（public_html 外に配置も可）
        ├── index.php
        ├── config.php
        └── data/
```

### 3.2 .htaccess の設定（重要）

`public_html/.htaccess` に以下を追加し、`/__debug/api` へのリクエストを API に転送する。

```apache
# /__debug/api へのリクエストを debug-api/ に転送
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/__debug/api
RewriteRule ^__debug/api/(.*)$ /home/username/your-project/debug-api/index.php [QSA,L]
```

#### 代替案: public_html 内に配置する場合

```
/home/username/
└── public_html/
    ├── .htaccess
    ├── index.html
    └── __debug/
        └── api/              # ここに配置
            ├── .htaccess
            ├── index.php
            └── data/
```

この場合、`public_html/.htaccess` の追加設定は不要。
`__debug/api/.htaccess` が URL リライトを処理する。

### 3.3 セキュリティ注意事項

1. **data/.htaccess**: `Deny from all` で SQLite への直接アクセスを拒否
2. **config.php**: Git にコミットしない（`.gitignore` に追加）
3. **CORS**: `allowed_origins` に許可するドメインのみ記載

---

## 4. 動作確認

### API テスト

```bash
# 一覧取得
curl "https://your-domain.com/__debug/api/notes?env=dev"

# 新規作成
curl -X POST "https://your-domain.com/__debug/api/notes?env=dev" \
  -H "Content-Type: application/json" \
  -d '{"title":"テスト","content":"動作確認"}'
```

### フロントエンドテスト

1. 開発サーバーを起動: `npm run dev`
2. `http://localhost:5173?mode=debug` にアクセス
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

```bash
cat data/.htaccess
# 出力: Deny from all
```

### useState エラー（React 重複インスタンス）

```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
```

ローカルパスからインストールした場合に発生。
「React 重複インスタンス問題」セクションの `dedupe` 設定を確認。

---

## 5. GitHub Actions デプロイ

CI/CD パイプラインでデプロイする場合の設定例。

### API ファイルの管理方法

| 方法 | メリット | デメリット |
|------|----------|------------|
| **コピー（推奨）** | シンプル、依存なし | 更新時に手動コピー |
| Submodule | 単一ソース | 複雑、更新手順が増える |
| npm install | バージョン管理 | API は npm 配布しない |

### コピー方式の構成

```
your-project/
├── frontend/
├── backend/
└── debug-notes-api/        # API files をコピー
    ├── index.php
    ├── Database.php
    ├── NotesController.php
    ├── .htaccess
    └── data/
        └── .htaccess
```

### deploy.yml 例

```yaml
    # Debug Notes API（dev環境のみ）
    - name: Deploy Debug Notes API
      if: inputs.environment == 'dev'
      run: |
        # APIファイルをデプロイ
        rsync -avz \
          -e "ssh -p ${{ secrets.SSH_PORT }}" \
          --exclude='.DS_Store' \
          --exclude='data/*.sqlite' \
          debug-notes-api/ \
          ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:~/public_html/__debug/api/

        # config.php を自動生成
        ssh -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'REMOTEOF'
        mkdir -p ~/public_html/__debug/api/data
        chmod 755 ~/public_html/__debug/api/data
        cat > ~/public_html/__debug/api/config.php << 'PHPEOF'
        <?php
        return [
            'db' => [
                'dev'  => __DIR__ . '/data/debug-dev.sqlite',
                'test' => __DIR__ . '/data/debug-test.sqlite',
            ],
            'allowed_origins' => [
                'https://dev.example.com',
                'http://localhost:5173',
            ],
            'api_key' => null,
        ];
        PHPEOF
        REMOTEOF
```

### API ファイル更新手順

debug-notes ライブラリを更新した場合:

```bash
# debug-notes から API ファイルをコピー
cp /path/to/debug-notes/api/index.php ./debug-notes-api/
cp /path/to/debug-notes/api/Database.php ./debug-notes-api/
cp /path/to/debug-notes/api/NotesController.php ./debug-notes-api/
cp /path/to/debug-notes/api/.htaccess ./debug-notes-api/
cp /path/to/debug-notes/api/data/.htaccess ./debug-notes-api/data/
```

### 本番環境での除外

- `if: inputs.environment == 'dev'` 条件でデプロイを制限
- `.env.prod` には `VITE_DEBUG_API_URL` を設定しない

---

## 環境変数一覧

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_DEBUG_API_URL` | デバッグ API の URL | `https://example.com/__debug/api` |
