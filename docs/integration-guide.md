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

## Step 8: App.tsx に DevTools + DebugAdmin を追加

**推奨**: `<DevTools>` 1 コンポーネントで PiP 配線が完了します。
`setDebugApiBaseUrl` / `createLogCapture` / `useDebugMode` の手動配線は不要です。

```typescript
import { DevTools, DebugAdmin } from '@twuw-b/dev-tools';
import { allTestCases } from '@/debug/testCases';
// 環境情報 MD を raw 文字列で取り込み（任意）
import environmentsMd from '@/../docs/environments.md?raw';

const debugApiUrl = import.meta.env.VITE_DEBUG_API_URL;
const feedbackAdminKey = import.meta.env.VITE_DEBUG_ADMIN_KEY || 'dev-admin-key-change-me';

function AppContent() {
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

      {/* PiP デバッグパネル（DevTools が内部で logCapture / useDebugMode を管理） */}
      <DevTools
        apiBaseUrl={debugApiUrl}
        env="dev"
        testCases={allTestCases}
        environmentsMd={environmentsMd}
      />
    </>
  );
}
```

**`<DevTools>` の挙動**:

- `apiBaseUrl` を内部で `setDebugApiBaseUrl()` に渡し、`createLogCapture({ console: true, network: ['/api/**'] })` を自動生成
- `useDebugMode()` を購読し、debug mode ON で `DebugPanel`(PiP) をレンダ
- **`/__admin` ルート滞在中は debug mode を強制 ON 扱い**し、管理ダッシュボードと PiP を同時に表示
- `testCases` を渡すと **test タブで展開中の capability の全ケース ID が「実行中」扱い**となり、
  record タブでバグを保存すると `test_case_ids` に自動紐付けされる（record タブ上部にバッジ表示）

ログ設定を変えたい場合は `logCaptureConfig` prop を渡すか、`disableLogCapture` で無効化可能。

### 環境情報タブ（任意）

`environmentsMd` に Markdown 文字列を渡すと PiP に「環境」タブが追加され、
各プロジェクト・環境ごとの URL / ログイン情報 / Basic 認証 / 注意点を一覧できます。

**MD フォーマット規約**:

```markdown
---
title: アプリケーション アカウント情報
warning: 取り扱い注意
---

# 共通

## Basic認証

- user: demo_user
- pass: REDACTED_BASIC_AUTH

# trinos

phase: Phase 1

## dev / ルートアカウント

- url: https://d1example-dev.cloudfront.net/admin/login/
- email: admin@example.com
- pass: REDACTED_PASSWORD_ROOT_DEV

## dev / その他アカウント

| ロール | メール | パスワード |
|---|---|---|
| 閲覧 | viewer@example.com | REDACTED_PASSWORD_USER |

## staging / ルートアカウント

- url: https://d2example-stg.cloudfront.net/admin/login/
- email: staging@example.com
- pass: REDACTED_PASSWORD_ROOT_STG

## 前提・注意点

- staging は毎週月曜リセット
- prod は書き込み厳禁
```

**規約**:

| 記法 | 意味 |
|---|---|
| frontmatter `title` / `warning` | タブ上部に表示 |
| `# プロジェクト名` | 折り畳みブロック |
| `phase: xxx`（H1 直下の行） | phase バッジ |
| `## env / ラベル` | env タブ付きセクション（`dev` / `staging` / `prod` 等） |
| `## ラベル` | 共通セクション（env 無し） |
| `## dev環境` 等 | 末尾の「環境」を除去して env として解釈 |
| `- key: value` | KV カード（`url` / `email` / `pass` 等を自動判定） |
| パイプテーブル | 表として表示（`パスワード` カラムは自動マスク） |
| `## 前提・注意点` / `## Notes` 等 | 折り畳み可能な注意事項として分離 |
| その他（段落・コードブロック等） | 生 Markdown としてそのままレンダ |

**UI 機能**:
- パスワードはデフォルトマスク + 目アイコンで表示切替
- URL は `[🔗 開く]` ボタンで新タブ、コピーボタン付き
- メール・ユーザー名もクリップボードコピー可能
- `## 前提・注意点` セクションは折り畳みブロックで表示

**セキュリティ注意**: `environments.md` に実パスワードを書く場合は必ず `.gitignore` に登録してください。
推奨はパスワードマネージャー参照 ID のみ記載する運用です。

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

`docs/test-cases/` に **ユーザーロールごと** の MD ファイルを作成する。
テンプレートは `node_modules/@twuw-b/dev-tools/docs/test-case-template.md` を参照。

### ルール: 1 ファイル = 1 ユーザーロール

テスターは「自分はこのロール」と決めて1ファイルを上から順に試す。
**ファイルは機能軸ではなくロール軸で分ける**。ロールごとに独立した MD を作り、
その中にそのロールが触る機能（capability）を並べる。

- `domain`: ユーザーロール名（`guest` / `user` / `client` / `admin` / `app-admin` 等）
- `#` (H1): そのロールが触る機能グループ（capability）
- `-` (list): 実際に試す検証項目（case）

推奨ファイル構成:

```
docs/test-cases/
├── guest.md       ← 未ログインユーザー
├── user.md        ← 一般ユーザー
├── admin.md       ← 管理者
└── app-admin.md   ← アプリ管理者
```

フォーマット例（`docs/test-cases/user.md`）:

```markdown
---
domain: user
---

# ログイン・アカウント
- メールアドレスとパスワードでログインできる
- パスワードリセットメールを受け取れる

# ダッシュボード
- ログイン直後にダッシュボードが表示される
- 未読通知の件数が表示される
```

NG: `認証.md` / `ユーザー管理.md` のように機能軸で分割し、1ファイルに複数ロールを混在させること。

### Claude Code skill のセットアップ（任意・推奨）

npm パッケージに **2 つの Claude Code skill** を同梱しています。以下の 1 コマンドで導入:

```bash
# 2 つの skill を一括コピー（dev-tools インストール後）
mkdir -p .claude/skills
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-author .claude/skills/
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-verifier .claude/skills/
```

skill の更新（dev-tools アップデート後）:

```bash
npm update @twuw-b/dev-tools
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-author .claude/skills/
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-verifier .claude/skills/
```

### skill 1: `devtools-testcase-author`（テストケース作成）

Claude Code がロール軸でテストケース MD を自動生成し、
`/__debug/api/test-cases/import` への同期まで実施します。

コピー後、Claude Code の会話で `devtools-testcase-author を使って` または
`テストケースを作って` と指示するとスキルが起動します。スキルは以下を自動化します:

- ロール別テンプレート (`guest.md` / `user.md` / `client.md` / `admin.md` / `app-admin.md`) を提示
- Domain → Capability → Case の 3 階層スキーマに準拠した MD 生成
- `scripts/import-test-cases.mjs` で purge → import → verify まで実行

スキルの更新があれば、`npm update @twuw-b/dev-tools` 後に同じコピー操作で最新版を取り込めます。

### skill 2: `devtools-testcase-verifier`（テストケース検証）

作成した MD を Chrome MCP で実際にブラウザ操作して検証するスキルです。
testcase-author と対になる検証専用 skill。

プロジェクトへの導入:

```bash
mkdir -p .claude/skills
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-verifier .claude/skills/
```

前提条件:
- Chrome MCP (chrome-devtools / chrome-workspace / playwright-mcp いずれか) が利用可能
- `docs/test-cases/` に case_key 付き MD が投入済み（testcase-author 側で実行済み）

検証ラウンドの開始:

```bash
# ラウンド初期化
node .claude/skills/devtools-testcase-verifier/scripts/init-verification-round.mjs \
  --name=round-1 \
  --api=http://localhost:8082/api/__debug \
  --env=dev \
  --frontend=http://localhost:3000 \
  --project="My Project" \
  --roles=AD,US,AC
```

Claude Code の会話で「round-1 の検証を始めて」と指示するとスキルが起動し、以下を自動化します:

- `docs/test-verifications/round-1/` に作業ディレクトリ生成（CLAUDE.md / 00_plan.md / 01_checklist.md / evidence/ / log/ / reports/）
- dev-tools API から対象 TC を取得して checklist に展開
- Chrome MCP ガイドライン G1〜G10 に従ってブラウザ操作
- evidence (screenshot + network dump) を必須で保存
- 5 バケット (OK / TC_WRONG / IMPL_BUG / OTHER / SKIP) に振り分け
- 全ケース完了後にロール別レポート + 全体サマリを生成
- （オプション）🐛 IMPL_BUG を dev-tools の notes API に投入して一元管理

詳細は `.claude/skills/devtools-testcase-verifier/SKILL.md` および `references/` を参照。

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
