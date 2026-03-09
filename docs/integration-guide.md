# @twuw-b/dev-tools 統合ガイド

既存プロジェクト (PHP + React/Vite) に dev-tools を統合するための手順書。
Claude Code が本ファイルを読めば、1回の指示で全ステップを実行できる。

## 前提条件

- React + Vite フロントエンド
- PHP バックエンド (Apache)
- Docker Compose 開発環境
- `@twuw-b/dev-tools` インストール済み

## 構成概要

```
project-root/
├── backend/
│   ├── public/
│   │   ├── index.php          ← ルーティングバイパス追加
│   │   └── __debug/           ← API ファイルコピー先
│   │       ├── index.php
│   │       ├── Database.php
│   │       ├── NotesController.php
│   │       ├── TestController.php
│   │       ├── FeedbackController.php
│   │       ├── AttachmentController.php
│   │       └── config.php     ← 環境別に作成
│   └── storage/debug/         ← SQLite + 添付ファイル保存先
├── frontend/
│   ├── .env.development       ← VITE_DEBUG_API_URL 追加
│   ├── vite.config.ts         ← fs.allow 追加
│   └── src/
│       ├── App.tsx            ← DebugPanel + DebugAdmin 追加
│       └── debug/
│           └── testCases.ts   ← テストケースローダー
├── docs/test-cases/           ← テストケース MD
│   ├── import.js              ← インポートスクリプト
│   └── *.md
└── docker-compose.yml         ← volume mount 追加
```

---

## Step 1: API ファイルをバックエンドにコピー

```bash
# npm パッケージからコピー
cp -r frontend/node_modules/@twuw-b/dev-tools/api/ backend/public/__debug/

# または ローカルパスからコピー
# cp -r /path/to/dev-tools/api/ backend/public/__debug/

# config.php は除外して再作成
rm backend/public/__debug/config.php
```

## Step 2: config.php を作成

`backend/public/__debug/config.php`:

```php
<?php
// Docker 環境ではコンテナ内のパスを指定
$storagePath = '/var/www/private/storage/debug';

// ローカル環境ではプロジェクト内のパスを指定
// $storagePath = __DIR__ . '/../../storage/debug';

return [
    'db' => [
        'dev'  => $storagePath . '/debug-dev.sqlite',
        'test' => $storagePath . '/debug-test.sqlite',
    ],
    'allowed_origins' => [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:8082',  // Backend direct access
    ],
    'api_key' => null,
    'feedback_admin_key' => $_ENV['DEBUG_ADMIN_KEY'] ?? 'dev-admin-key-change-me',
    'upload_dir' => $storagePath . '/attachments',
];
```

**注意**: `$storagePath` はプロジェクトの Docker 構成に合わせて調整する。

## Step 3: PHP ルーティングバイパス

バックエンドの `public/index.php` の**先頭** (フレームワーク bootstrap の前) に追加:

```php
// dev-tools API: __debug/ パスを検出して直接ルーティング
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (preg_match('#/__debug(/|$)#', $requestUri)) {
    $debugIndex = __DIR__ . '/__debug/index.php';
    if (file_exists($debugIndex)) {
        $_SERVER['SCRIPT_NAME'] = '/__debug/index.php';
        require $debugIndex;
        exit;
    }
}
```

**重要**: `SCRIPT_NAME` の値はプロジェクトの URL 構造に合わせる。
- `/api/` 配下の場合: `$_SERVER['SCRIPT_NAME'] = '/api/__debug/index.php';`
- ルート直下の場合: `$_SERVER['SCRIPT_NAME'] = '/__debug/index.php';`

dev-tools の API ルーターは `SCRIPT_NAME` から相対パスを計算するため、この値が正しくないと「Not found」エラーになる。

## Step 4: Docker volume mount

`docker-compose.yml` のバックエンドサービスに追加:

```yaml
services:
  backend:
    volumes:
      # 既存の volume...
      - ./backend/storage/debug:/var/www/private/storage/debug
```

ディレクトリを作成:

```bash
mkdir -p backend/storage/debug
```

## Step 5: .gitignore 追加

```gitignore
# dev-tools
backend/storage/debug/
backend/public/__debug/config.php
```

## Step 6: フロントエンド環境変数

`frontend/.env.development` に追加:

```env
VITE_DEBUG_API_URL=/api/__debug
VITE_DEBUG_ADMIN_KEY=dev-admin-key-change-me
```

**注意**: `VITE_DEBUG_API_URL` の値はバックエンドの URL 構造に合わせる。
Vite の proxy 設定で `/api` を backend に転送している場合は `/api/__debug` とする。

## Step 7: vite.config.ts に fs.allow 追加

テストケース MD がフロントエンドディレクトリの外にある場合に必要:

```typescript
import path from 'path'

export default defineConfig({
  // ...
  server: {
    // ...
    fs: {
      allow: [
        path.resolve(__dirname, '..'), // プロジェクトルート
      ],
    },
  },
})
```

## Step 8: App.tsx に DebugPanel + DebugAdmin を追加

```typescript
import {
  DebugPanel,
  DebugAdmin,
  useDebugMode,
  setDebugApiBaseUrl,
  createLogCapture,
} from '@twuw-b/dev-tools';
import { allTestCases } from '@/debug/testCases';

// dev-tools 初期化 (モジュールレベル)
const debugApiUrl = import.meta.env.VITE_DEBUG_API_URL;
if (debugApiUrl) {
  setDebugApiBaseUrl(debugApiUrl);
}

const logCapture = debugApiUrl
  ? createLogCapture({ console: true, network: ['/api/**'] })
  : null;

const feedbackAdminKey = import.meta.env.VITE_DEBUG_ADMIN_KEY || 'dev-admin-key-change-me';

function AppContent() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      <Routes>
        {/* dev-tools 管理ダッシュボード */}
        {debugApiUrl && (
          <Route
            path="/__admin"
            element={
              <DebugAdmin
                env="dev"
                feedbackApiBaseUrl={debugApiUrl}
                feedbackAdminKey={feedbackAdminKey}
              />
            }
          />
        )}

        {/* 既存のルート */}
        <Route element={<MainLayout />}>
          {/* ... */}
        </Route>
      </Routes>

      {/* PiP デバッグパネル */}
      {debugApiUrl && isDebugMode && logCapture && (
        <DebugPanel logCapture={logCapture} testCases={allTestCases} />
      )}
    </>
  );
}
```

## Step 9: テストケースローダーを作成

`frontend/src/debug/testCases.ts`:

```typescript
import { parseTestCaseMd, type ParsedTestCase } from '@twuw-b/dev-tools';

// テストケース MD をビルド時にバンドル
// パスはプロジェクト構造に合わせて調整 (ソースファイルからの相対パス)
const testCaseMds: Record<string, string> = import.meta.glob(
  '../../../docs/test-cases/*.md',
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>;

export const allTestCases: ParsedTestCase[] = Object.values(testCaseMds).flatMap(
  (md) => parseTestCaseMd(md),
);
```

**glob パスの計算方法**:
- ソースファイル: `frontend/src/debug/testCases.ts`
- ターゲット: `docs/test-cases/*.md` (プロジェクトルート)
- 相対パス: `../../../docs/test-cases/*.md`

## Step 10: サイドバーに Dev Admin リンク追加

レイアウトコンポーネントにデバッグモード時のみ表示するリンクを追加:

```typescript
import { useDebugMode } from '@twuw-b/dev-tools';
import { Bug } from 'lucide-react'; // または任意のアイコン

const debugApiUrl = import.meta.env.VITE_DEBUG_API_URL;

export function MainLayout() {
  const { isDebugMode } = useDebugMode();

  return (
    <aside>
      <nav>
        {/* 既存のナビゲーション */}

        {/* デバッグモード時のみ表示 */}
        {debugApiUrl && isDebugMode && (
          <Link to="/__admin">
            <Bug />
            Dev Admin
          </Link>
        )}
      </nav>
    </aside>
  );
}
```

## Step 11: テストケース MD を作成

`docs/test-cases/` にドメインごとの MD ファイルを作成。
テンプレートは `node_modules/@twuw-b/dev-tools/docs/test-case-template.md` を参照。

フォーマット:

```markdown
---
domain: ドメイン名
---

# 機能名
- テストケース1
- テストケース2

# 別の機能名
- テストケース3
```

## Step 12: テストケースを API に登録

`docs/test-cases/import.js` を作成:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const API_URL = process.argv[2] || 'http://localhost:8082/api/__debug';

function parseTestCaseMd(md) {
  const lines = md.split('\n');
  const results = [];
  let domain = '', capability = '', inFm = false, fmDone = false;

  for (const line of lines) {
    const t = line.trim();
    if (t === '---' && !fmDone) {
      if (inFm) { inFm = false; fmDone = true; } else { inFm = true; }
      continue;
    }
    if (inFm) {
      const m = t.match(/^domain:\s*(.+)$/);
      if (m) domain = m[1].trim();
      continue;
    }
    if (t.startsWith('# ') && !t.startsWith('## ')) {
      capability = t.slice(2).trim();
      continue;
    }
    if (t.startsWith('## ')) continue;
    if (t.startsWith('- ') && capability) {
      const text = t.slice(2).trim().replace(/^\[[ x]\]\s*/, '');
      if (text) results.push({ domain, capability, title: text });
    }
  }
  return results;
}

const dir = path.join(__dirname);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
const allCases = [];

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const cases = parseTestCaseMd(content);
  allCases.push(...cases);
  console.log(`  ${f}: ${cases.length} cases`);
}

console.log(`\nTotal: ${allCases.length} cases`);
console.log(`Importing to ${API_URL}/test-cases/import ...`);

fetch(`${API_URL}/test-cases/import`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cases: allCases }),
})
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      console.log(`OK: ${data.total} cases in DB`);
    } else {
      console.error('Error:', data.error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fetch error:', err.message);
    process.exit(1);
  });
```

実行:

```bash
node docs/test-cases/import.js http://localhost:8082/api/__debug
```

## Step 13: 動作確認

1. Docker コンテナを再起動 (`docker compose up -d`)
2. API 疎通確認: `curl http://localhost:8082/api/__debug/notes?env=dev`
3. フロントエンド起動: `cd frontend && npm run dev`
4. `http://localhost:5173#debug` にアクセス → PiP パネル表示
5. PiP パネルの「テスト」タブにテストケースが表示される
6. `http://localhost:5173/__admin` で管理ダッシュボード表示

---

## デバッグモードの起動方法

| 方法 | 操作 |
|------|------|
| キーボード | `z` キーを400ms以内に3回押す (トグル) |
| URL ハッシュ | `http://localhost:5173#debug` でアクセス |
| localStorage | `debug-notes-mode` を `1` に設定 |

## トラブルシューティング

### API が「Not found」を返す

`SCRIPT_NAME` の設定が正しくない。Step 3 のルーティングバイパスで `$_SERVER['SCRIPT_NAME']` を確認。

### `Failed to construct 'URL': Invalid URL`

`feedbackApiBaseUrl` に相対パス (`/api/__debug`) を渡している場合、ライブラリ v1.1.4 以降に更新する。v1.1.3 以前は絶対URL のみ対応。

### テストケースが PiP に表示されない

1. `vite.config.ts` の `fs.allow` でプロジェクトルートを許可しているか確認
2. `testCases.ts` の glob パスがソースファイルからの正しい相対パスか確認
3. ビルドしてバンドルサイズが増えているか確認 (MD が含まれている証拠)

### CORS エラー

`config.php` の `allowed_origins` にフロントエンドのオリジンを追加。

### SQLite 書き込みエラー

`backend/storage/debug/` ディレクトリの権限と Docker volume mount を確認。
