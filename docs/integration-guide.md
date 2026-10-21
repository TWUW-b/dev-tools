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

> ⚠️ **管理キーはブラウザ用とサーバー間用で分けてください（v1.7.0+）。**
>
> | 鍵 | 置き場所 | dev / test | 本番 |
> |---|---|---|---|
> | ブラウザ用（`VITE_DEBUG_ADMIN_KEY` → `setDebugAdminKey()`） | フロントのバンドル（**平文で公開される**） | 使ってよい | **設定しない**。管理画面は Firebase ログイン（`Authorization: Bearer`）で使う |
> | 全範囲の鍵（`feedback_admin_key`） | サーバーの config | 使ってよい | **空にする** |
> | 範囲付きの鍵（`admin_keys`） | サーバーの config と、投入する機械の環境変数 | 使ってよい | 機械に必要な範囲だけを付けて置く（例: リリースノートの投入 = `release-notes`） |
>
> `feedback_admin_key` は 1 本で notes・feedback・リリースノート・テストケース・`/export`（データ全体の書き出し）が
> すべて開きます。ブラウザ用の鍵と同じ値を範囲付きの鍵に使い回さないでください（バンドルから読めるため）。
> 範囲の一覧と書き方は `api/config.example.php` の `admin_keys` を参照。

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

### notes API 認証（v1.2.15+・必須）

v1.2.15 から **notes API（`/notes` 系）は `X-Admin-Key` 必須**になりました（それ以前は無認証）。
DevTools の record タブや DebugAdmin の notes 機能を使う場合、アプリ初期化時に一度
`setDebugAdminKey()` を呼び、notes 呼び出しへ `X-Admin-Key` を自動付与してください。
**未設定だと notes API が 401 になります**。

```typescript
import { setDebugAdminKey } from '@twuw-b/dev-tools';

// feedbackAdminKey と同じ鍵（VITE_DEBUG_ADMIN_KEY）でよい。モジュール初期化時に一度呼ぶ。
setDebugAdminKey(feedbackAdminKey);

// 鍵を後から解決したい場合はプロバイダ（同期/非同期どちらも可）:
// setDebugAdminKey(() => getAdminKey());
```

補足:
- `DebugAdmin` の `feedbackAdminKey` prop は **feedback** 用の鍵送出にのみ使われます。
  notes には別途この `setDebugAdminKey()` が必要です（同じ鍵で構いません）。
- 鍵を渡す先はブラウザに露出するため、`/__debug` は Basic 認証やネットワーク制限と
  併用してください。
- **ブラウザ用の鍵は dev / test 環境専用です。本番では `setDebugAdminKey()` を呼ばず、`VITE_DEBUG_ADMIN_KEY` も設定しないでください**
  （本番の管理画面は Firebase ログインで認証する。Step 2 の注意を参照）。
- ブラウザ用の鍵にも範囲を付けられます（`admin_keys` に `['notes', 'test-cases', 'feedbacks']` など）。
  バンドルから読める鍵で DB 丸ごとの書き出しまで開かないよう、dev / test でも範囲付きにしておくと安全です。

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

## オプション: リリースノート（クライアントへの更新告知・v1.3.0+）

「直したことを利用者に知らせる」面。**追加の配線をしなくても、API をコピーした時点で使える**。
公開ページは PHP が単独で返すので、アプリのビルド・ルーティング・認証ガードには一切触れない。

### 面は3つある

| 面 | 誰が読むか | 出し方 |
|----|-----------|--------|
| 公開ページ | クライアント（ログイン不要） | `GET /release-notes/p/{token}` が HTML を返す。URL を送るだけ |
| アプリ内 | ログイン中の利用者 | `<ReleaseNotes feedUrl={...} />` を好きな場所に置く |
| 管理 | 開発側 | `/__admin` の「リリースノート」タブ（配線不要） |

号ごとに 2 つの軸で可視性を決める。**社内向けの更新を外に出さないため、`is_public` は明示的に
ON にしたときだけ公開される**。

| status | is_public | 管理画面 | アプリ内 | 公開 URL |
|--------|-----------|---------|---------|---------|
| draft | - | ○ | × | × |
| published | false | ○ | ○ | × |
| published | true | ○ | ○ | ○ |

### 1. 公開 URL を確認する

`/__admin` →「リリースノート」タブ。上部に 2 本の URL が出る。

- **社外公開（クライアント向け）** … クライアントに送る URL
- **アプリ内表示用（feedUrl）** … 次の手順でコンポーネントに渡す URL

漏れた場合は「再発行」でトークンを作り直す（それまでに配った URL は開けなくなる）。

### 2. アプリ内に置く（任意）

```typescript
import { ReleaseNotes } from '@twuw-b/dev-tools';

const feedUrl = import.meta.env.VITE_RELEASE_NOTES_FEED_URL; // 上でコピーした feedUrl

<Route path="/release-notes" element={<ReleaseNotes feedUrl={feedUrl} />} />
```

ナビに未読バッジを出す場合:

```typescript
import { useReleaseNotes } from '@twuw-b/dev-tools';

const { unreadCount } = useReleaseNotes({ feedUrl });
// <Link to="/release-notes">更新情報 {unreadCount > 0 && <span>{unreadCount}</span>}</Link>
```

未読の判定は「最後に見た号より新しい号」で、`localStorage` に持つ。
`<ReleaseNotes />` を表示した時点で既読になる。

#### 自作の画面で出す場合（見本: `sample/CustomReleaseNotes.tsx`。パッケージにも同梱）

`<ReleaseNotes />` を使わず、アプリのデザインシステムで更新情報ページを作るときは、
`sample/CustomReleaseNotes.tsx` を写して下敷きにする（`node_modules/@twuw-b/dev-tools/sample/CustomReleaseNotes.tsx`。依存は React と本パッケージだけ・インライン style。データは同じ `ReleaseNote[]`）。
サンプルアプリ（`npm run sample`）の「Release Notes」→「自作の画面の見本」で動く形を見られる。
Tailwind 版の実例は toho_matching の `frontend/src/pages/release-notes/ReleaseNotesPage.tsx`。

見た目の決まり（利用者が迷わないため。toho_matching で UI/UX レビューを通した形）:

1. 号は開閉できるカード。見出しは「日付 · 号 / タイトル / 開閉の矢印」だけにし、補足文を常に出さない
2. 号の中は「要約 → 変更点 N 件 → この号の画像・動画」。件数を先に出す
3. 変更点は 1 件 = 番号付きの 1 枚のカード。カードの間に切れ目を作る
4. 変更前（`kind: before`）の画像は「これまで」、変更後（`after`）は「これから」の欄の中に置く。欄が役割を言うので札は出さない
5. 使い方・全体像（`howto` / `overview`）は、何の画像かを画像の上に、見どころ（`description`）を下に書く
6. 号全体の画像（`item_id` が null）は変更点と同じカードにしない（番号の無い 3 件目に見える）。区切り線と見出しで分ける
7. 元の報告（`sources`）はカードの下端に区切って置き、開ける人（管理者）にだけ出す。別タブで開く
8. 青はリンクだけに使い、押せない札は灰色にする

アプリ独自の API（ログイン中の利用者に返す一覧など）から読む場合も、`ReleaseNote[]` の形で返せばこの見本がそのまま使える。
その API が社外公開と同じ絞り込みの号を返すときは、`sources` を含めるかどうかを API 側で決める（社外向けには出さない）。

### 3. PHP のアップロード上限を上げる（動画を載せる場合）

動作の変化は動画でしか示せないため、既定の上限は 50MB にしてある。
**PHP 側の上限が小さいと `$_FILES` が空で飛んでくる**ので、合わせて上げておく。

```apache
# backend/public/__debug/.htaccess もしくは php.ini
php_value upload_max_filesize 64M
php_value post_max_size 64M
```

`config.php` で変えたい場合:

```php
'release_notes_max_upload' => 52428800, // 50MB
'release_notes_dir' => __DIR__ . '/data/release-notes',
```

### 4. 文面を投入する

**同梱スキル `devtools-release-notes` を使う（v1.6.0+・推奨）。** 原稿を
`docs/release-notes/<YYYY-MM-DD>-<名前>/`（`release.json` と `media/`）としてアプリのリポジトリに置き、
検査 → 下見 → 下書きで投入 → ユーザー確認 → 公開、の順で進める。手順は
`.claude/skills/devtools-release-notes/SKILL.md`。スキルを使うには、このフォルダをアプリの
`.claude/skills/` にコピーする（`node_modules/@twuw-b/dev-tools/.claude/skills/devtools-release-notes`）。

原稿の画像・動画には必ず役割（`kind`: 変更前 / 変更後 / 使い方 / 全体像）・`caption`（何が写っているか）・
`description`（どこを見ればよいか）を付ける。検査スクリプトが、説明の無いメディアや項目に紐付かない
メディアを止める。`.gitignore` には次を足す:

```
docs/release-notes/**/preview.html
docs/release-notes/**/pushed.*.json
```

feedback-fix から投入する場合は、feedback-fix のリリースノート画面から行う（マージ済み・本番反映済みのカードから
AI が下書き → 人が確認 → 投入）。設定の F 群に次を入れる。

| 設定 | 値 |
|------|-----|
| `releaseNoteUrl` | `https://<host>/api/__debug/release-notes` |
| `releaseNoteAuth` | `admin-key` |
| `releaseNoteToken` | `release-notes` だけを範囲に持つ鍵（`admin_keys`）。ブラウザ用の鍵（`VITE_DEBUG_ADMIN_KEY`）は使わない |
| `releaseNotePageUrl` | 管理タブに出ている「社外公開」の URL |

> 本番へ機械から投入するときも、この `release-notes` 範囲の鍵を使います。この鍵で notes・feedback・書き出しは開きません（403）。

API を直接叩く場合は `POST /release-notes` → `POST /:id/items` → `POST /:id/images` の順。
メディアの説明は `POST /:id/images` の `kind` / `caption` / `alt` / `description` で付け、後から
`PATCH /:id/images/:imageId` で直せる（v1.6.0+）。詳細は `api/openapi.yaml` の ReleaseNotes セクションを参照。

### 5. 元の報告へのリンク（任意・v1.6.0+）

各変更に紐付けた feedback / note を、社内向けの表示からアプリ内で開けるようにする。
`config.php` に開く先の URL を書く（`{id}` が報告の ID に置き換わる）。公開ページ（internal）は
API のオリジンで開くので、アプリのオリジンを含む絶対 URL で書く。

```php
'release_notes_source_urls' => [
    'feedback' => 'https://app.example.com/__admin?feedback={id}',
    'note' => 'https://app.example.com/__admin?note={id}',
],
```

`DebugAdmin`（`/__admin`）は `?note=` と `?feedback=`、`FeedbackAdmin` は `?feedback=` で該当項目を開く。
社外公開（public トークン）のページとフィードには、報告の ID もタイトルも出ない。

### 6. API をフォークしている場合（v1.6.0 への更新）

`ReleaseNotesController.php` を手で改変して取り込んでいるアプリは、次をマージする。

- `Database.php` の v15（`release_note_images` に `kind` / `alt` / `description` 列を追加）と
  v16（`release_note_item_sources` テーブル。既存の `feedback_id` を移す）
- `ReleaseNotesController.php` の `MEDIA_KINDS`、`uploadImage` の新しい項目、`updateImage`、`formatImage`、
  `SOURCE_TYPES` と sources まわり（`resolveSources` / `replaceSources` / `sourcesByItem` / `formatSource`、
  `addItem` / `updateItem` / `deleteItem` の変更、`collect` で public には出さない処理）、
  公開ページの描画（`renderFigure` / `renderSources` / カバーの説明）
- `index.php` の `PATCH /release-notes/{id}/images/{imageId}` と `setSourceUrlTemplates`

### 7. 必ずブラウザで確認する

**API が 200 を返すことと、画面に出ることは別**。特に添付は curl では気づけない。
公開 URL を開いて、画像が表示され、動画が再生でき、シークできるところまで見る。

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
