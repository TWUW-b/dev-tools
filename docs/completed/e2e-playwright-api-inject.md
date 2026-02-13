# Playwright E2E テスト導入（API注入方式）

**Status:** implemented

---

## 前提

このプロジェクトはライブラリであり、テスト対象は `sample/App.tsx` のサンプルアプリ。
フロントエンドは native `fetch()` を使用しており、`page.route()` による API 注入と相性が良い。

ユーザー認証は存在しない。デバッグモードは `localStorage('debug-notes-mode')` または `#debug` ハッシュで有効化される。
テストでは `addInitScript` で `localStorage` を設定する方式を採用。
Feedback Admin は `X-Admin-Key` ヘッダーで保護されているが、これもサンプルアプリ経由では直接テストしない。

## 2レーン戦略

### レーン1: UI回帰E2E（API注入 / 本数多め）

| 項目 | 内容 |
|---|---|
| 認証 | なし（`localStorage` で `debug-notes-mode=1` を設定） |
| データ | `page.route()` で全API応答を注入 |
| 対象 | CRUD全操作、エラー表示、空状態、タブ切替 |
| 狙い | UI操作→API呼出→レスポンス→UI更新の経路保証 |

### レーン2: 統合E2E（少数精鋭）

| 項目 | 内容 |
|---|---|
| 認証 | なし |
| API | 実通信（Docker の PHP + SQLite） |
| 対象 | ノート作成→一覧反映→ステータス変更の一連フロー |
| 狙い | フロント⇔バックエンド間の実通信保証 |

レーン2 は `docker compose up` で PHP API が起動している前提。CI では Docker 起動ステップを追加。

---

## 対象APIエンドポイント一覧

### Debug API（ベース: `http://localhost:8081`）

| メソッド | パス | 用途 |
|---|---|---|
| `GET` | `/notes?env=dev&status=&q=&includeDeleted=0` | ノート一覧 |
| `POST` | `/notes?env=dev` | ノート作成 |
| `GET` | `/notes/{id}?env=dev` | ノート詳細 |
| `PATCH` | `/notes/{id}/status?env=dev` | ステータス更新 |
| `PATCH` | `/notes/{id}/severity?env=dev` | 重要度更新 |
| `DELETE` | `/notes/{id}?env=dev` | ノート削除（論理） |
| `POST` | `/test-cases/import` | テストケースインポート |
| `GET` | `/test-cases/tree?env=dev` | テストツリー取得 |
| `POST` | `/test-runs?env=dev` | テスト結果一括送信 |

### Feedback API（ベース: 任意）

| メソッド | パス | 用途 |
|---|---|---|
| `POST` | `/feedbacks` | フィードバック送信 |
| `GET` | `/feedbacks?page=1&limit=20` | フィードバック一覧（Admin） |
| `GET` | `/feedbacks/{id}` | フィードバック詳細（Admin） |
| `PATCH` | `/feedbacks/{id}/status` | ステータス更新（Admin） |
| `DELETE` | `/feedbacks/{id}` | フィードバック削除（Admin） |

---

## テストケース設計（レーン1）

### 1. デバッグモード有効化

```
ファイル: tests/debug-mode.spec.ts
```

| # | テスト名 | 注入API | 検証内容 |
|---|---|---|---|
| 1-1 | `#debug` ハッシュでパネルトリガー表示 | なし | トリガーボタンが表示される |
| 1-2 | `localStorage` でデバッグモード維持 | なし | ページリロード後もトリガーが表示される |
| 1-3 | デバッグモードOFFでトリガー非表示 | なし | `/` アクセスでトリガーが存在しない |

### 2. DebugPanel — 記録タブ（Create）

```
ファイル: tests/debug-panel-record.spec.ts
```

| # | テスト名 | 注入API | 検証内容 |
|---|---|---|---|
| 2-1 | バグ報告の送信（正常系） | `POST /notes` → 201 | 入力→送信→成功メッセージ表示、送信payloadに `content` / `severity` 含む |
| 2-2 | バグ報告の送信（エラー） | `POST /notes` → 500 | エラーメッセージが表示される |
| 2-3 | 空入力で送信不可 | なし | 送信ボタンが disabled または送信されない |
| 2-4 | 重要度の選択 | `POST /notes` → 201 | payload の `severity` が選択値と一致 |

### 3. DebugPanel — 管理タブ（Read / Update）

```
ファイル: tests/debug-panel-manage.spec.ts
```

| # | テスト名 | 注入API | 検証内容 |
|---|---|---|---|
| 3-1 | ノート一覧表示 | `GET /notes` → ノート3件 | 全件が表示される |
| 3-2 | ノート一覧が空 | `GET /notes` → 空配列 | 「対応中のノートはありません」表示 |
| 3-3 | ステータスフィルタ切替 | `GET /notes` → 各ステータス混在 | フィルタ操作で表示件数が変化 |
| 3-4 | ステータス変更 | `PATCH /notes/{id}/status` → 200 | ボタン押下でAPI呼出、UIに反映 |

### 4. DebugPanel — テストタブ（Test）

```
ファイル: tests/debug-panel-test.spec.ts
```

| # | テスト名 | 注入API | 検証内容 |
|---|---|---|---|
| 4-1 | テストツリー表示 | `POST /test-cases/import` → 200, `GET /test-cases/tree` → ツリー | ドメイン→ケースの階層表示 |
| 4-2 | テスト結果送信（全pass） | `POST /test-runs` → 200 | チェック→送信→成功メッセージ |
| 4-3 | テスト結果送信（fail + バグ報告） | `POST /test-runs` → 200（noteId含む） | fail時にバグ報告フォーム表示、送信payload検証 |

### 5. DebugAdmin — 管理画面

```
ファイル: tests/debug-admin.spec.ts
```

| # | テスト名 | 注入API | 検証内容 |
|---|---|---|---|
| 5-1 | ノート一覧表示（管理画面） | `GET /notes` → ノート一覧 | テーブル形式で表示 |
| 5-2 | ノート詳細表示 | `GET /notes/{id}` → 詳細 | クリックで詳細パネル展開 |
| 5-3 | ステータス/重要度の変更 | `PATCH` 各種 → 200 | UI上で即反映 |
| 5-4 | テストステータスタブ | `GET /test-cases/tree` → ツリー | タブ切替でテスト概況表示 |
| 5-5 | API エラー時 | `GET /notes` → 500 | エラー表示、クラッシュしない |

### 6. FeedbackForm（将来、サンプルアプリに組み込み時）

```
ファイル: tests/feedback-form.spec.ts
```

| # | テスト名 | 注入API | 検証内容 |
|---|---|---|---|
| 6-1 | フィードバック送信（正常系） | `POST /feedbacks` → 201 | 種別選択→入力→送信→トースト表示 |
| 6-2 | フィードバック送信（エラー） | `POST /feedbacks` → 429 | レート制限エラーメッセージ |
| 6-3 | 必須フィールド未入力 | なし | 送信ボタンが無効 |

---

## fixture 設計

### `tests/fixtures/notes.ts`

```ts
import type { Note } from '../../src/types';

export const NOTE_FIXTURES = {
  ok: {
    items: [
      {
        id: 1,
        route: '/users',
        screen_name: 'ユーザー一覧',
        title: '',
        content: 'ボタンが反応しない',
        user_log: null,
        steps: null,
        severity: 'high' as const,
        status: 'open' as const,
        deleted_at: null,
        created_at: '2026-01-15T10:00:00Z',
        source: 'manual' as const,
      },
      {
        id: 2,
        route: '/settings',
        screen_name: '設定',
        title: '',
        content: 'レイアウト崩れ',
        user_log: null,
        steps: null,
        severity: 'medium' as const,
        status: 'resolved' as const,
        deleted_at: null,
        created_at: '2026-01-14T09:00:00Z',
        source: 'manual' as const,
      },
      {
        id: 3,
        route: '/dashboard',
        screen_name: 'ダッシュボード',
        title: '',
        content: 'テストケース: ナビゲーションが表示される',
        user_log: null,
        steps: null,
        severity: null,
        status: 'open' as const,
        deleted_at: null,
        created_at: '2026-01-13T08:00:00Z',
        source: 'test' as const,
        test_case_ids: [1],
      },
    ] satisfies Note[],
  },
  empty: {
    items: [] as Note[],
  },
  error: {
    status: 500,
    body: { success: false, error: 'Internal Server Error' },
  },
};
```

### `tests/fixtures/test-tree.ts`

```ts
import type { DomainTree } from '../../src/types';

export const TEST_TREE_FIXTURE: DomainTree[] = [
  {
    domain: 'sample',
    capabilities: [
      {
        capability: 'S1 基本表示',
        total: 3,
        passed: 2,
        failed: 1,
        status: 'fail',
        openIssues: 1,
        cases: [
          { caseId: 1, title: 'ナビゲーションが表示される', last: 'pass', openIssues: 0 },
          { caseId: 2, title: '「アプリ画面」ボタンが表示される', last: 'pass', openIssues: 0 },
          { caseId: 3, title: '「管理画面」ボタンが表示される', last: 'fail', openIssues: 1 },
        ],
      },
    ],
  },
];
```

### `tests/fixtures/feedbacks.ts`

```ts
import type { Feedback } from '../../src/types';

export const FEEDBACK_FIXTURES = {
  ok: {
    items: [
      {
        id: 1,
        kind: 'bug' as const,
        target: 'app' as const,
        customTag: null,
        message: '画面が真っ白になる',
        pageUrl: '/dashboard',
        userType: 'admin',
        environment: null,
        appVersion: '1.0.0',
        consoleLogs: null,
        networkLogs: null,
        status: 'open' as const,
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      },
    ] satisfies Feedback[],
  },
};
```

---

## ヘルパー設計

### `tests/helpers/routes.ts` — 共通 route 注入

```ts
import { Page } from '@playwright/test';
import { NOTE_FIXTURES } from '../fixtures/notes';

const API_BASE = 'http://localhost:8081';

/**
 * ノート一覧 GET を注入
 */
export async function mockGetNotes(page: Page, fixture: 'ok' | 'empty' | 'error' = 'ok') {
  if (fixture === 'error') {
    await page.route(`${API_BASE}/notes?**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(NOTE_FIXTURES.error.body),
        });
      } else {
        await route.continue();
      }
    });
    return;
  }

  const items = fixture === 'empty' ? [] : NOTE_FIXTURES.ok.items;
  await page.route(`${API_BASE}/notes?**`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: items }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * ノート作成 POST を注入
 */
export async function mockCreateNote(
  page: Page,
  opts: { status?: number; response?: Record<string, unknown> } = {},
) {
  const { status = 200, response } = opts;
  await page.route(`${API_BASE}/notes?**`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const body = await route.request().postDataJSON();
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        response ?? {
          success: true,
          note: {
            id: 99,
            content: body.content,
            severity: body.severity,
            status: 'open',
            route: body.route || '/',
            screen_name: body.screenName || '',
            title: '',
            user_log: null,
            steps: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
            source: body.source || 'manual',
          },
        },
      ),
    });
  });
}

/**
 * ステータス更新 PATCH を注入
 */
export async function mockUpdateStatus(page: Page) {
  await page.route(`${API_BASE}/notes/*/status?**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * テストケース import + tree を注入
 */
export async function mockTestCaseRoutes(page: Page, tree: unknown[]) {
  await page.route(`${API_BASE}/test-cases/import`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, total: 5 }),
    });
  });

  await page.route(`${API_BASE}/test-cases/tree?**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: tree }),
    });
  });
}
```

---

## テストコード例

### 2-1: バグ報告の送信（正常系）

```ts
// tests/debug-panel-record.spec.ts
import { test, expect } from '@playwright/test';
import { mockGetNotes, mockCreateNote } from './helpers/routes';

test.describe('DebugPanel 記録タブ', () => {
  test('バグ報告を送信できる', async ({ page }) => {
    // API 注入
    await mockGetNotes(page, 'ok');
    await mockCreateNote(page);

    // payload 検証用
    let capturedPayload: Record<string, unknown> | null = null;
    await page.route('**/notes?env=dev', async (route) => {
      if (route.request().method() === 'POST') {
        capturedPayload = await route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            note: {
              id: 99,
              content: capturedPayload!.content,
              severity: capturedPayload!.severity,
              status: 'open',
              route: '/',
              screen_name: '',
              title: '',
              user_log: null,
              steps: null,
              deleted_at: null,
              created_at: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // デバッグモードでアクセス
    await page.goto('http://localhost:3000/?mode=debug');

    // トリガーボタンをクリック（PiP非対応環境ではフォールバックモーダル）
    await page.getByRole('button', { name: /bug/i }).click();

    // 記録タブで入力
    const textarea = page.locator('textarea');
    await textarea.fill('ボタンが反応しない');

    // 送信
    await page.getByRole('button', { name: /送信|保存|save/i }).click();

    // 成功メッセージ
    await expect(page.getByText(/保存|送信|saved/i)).toBeVisible();

    // payload 検証
    expect(capturedPayload).toBeTruthy();
    expect(capturedPayload!.content).toBe('ボタンが反応しない');
  });
});
```

### 3-1: ノート一覧表示

```ts
// tests/debug-panel-manage.spec.ts
import { test, expect } from '@playwright/test';
import { mockGetNotes, mockUpdateStatus } from './helpers/routes';

test.describe('DebugPanel 管理タブ', () => {
  test('ノート一覧が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('http://localhost:3000/?mode=debug');

    // パネルを開く
    await page.getByRole('button', { name: /bug/i }).click();

    // 管理タブに切替
    await page.getByText('管理').click();

    // ノートが表示される
    await expect(page.getByText('ボタンが反応しない')).toBeVisible();
    await expect(page.getByText('レイアウト崩れ')).toBeVisible();
  });

  test('空状態のメッセージが表示される', async ({ page }) => {
    await mockGetNotes(page, 'empty');
    await page.goto('http://localhost:3000/?mode=debug');

    await page.getByRole('button', { name: /bug/i }).click();
    await page.getByText('管理').click();

    await expect(page.getByText('対応中のノートはありません')).toBeVisible();
  });
});
```

### 5-1: DebugAdmin ノート一覧

```ts
// tests/debug-admin.spec.ts
import { test, expect } from '@playwright/test';
import { mockGetNotes } from './helpers/routes';

test.describe('DebugAdmin 管理画面', () => {
  test('管理画面にノート一覧が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('http://localhost:3000/');

    // 管理画面に切替
    await page.getByRole('button', { name: '管理画面' }).click();

    // ノートが表示される
    await expect(page.getByText('ボタンが反応しない')).toBeVisible();
  });

  test('APIエラー時にクラッシュしない', async ({ page }) => {
    await mockGetNotes(page, 'error');
    await page.goto('http://localhost:3000/');

    await page.getByRole('button', { name: '管理画面' }).click();

    // エラー表示 or 空状態（クラッシュしていないことが重要）
    await expect(page.locator('body')).toBeVisible();
  });
});
```

---

## セットアップ

### 必要パッケージ

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### `playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.ts',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run sample',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

### `package.json` scripts 追加

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## ディレクトリ構成

```
tests/
├── fixtures/
│   ├── notes.ts          # ノート fixture（ok / empty / error）
│   ├── test-tree.ts      # テストツリー fixture
│   └── feedbacks.ts      # フィードバック fixture
├── helpers/
│   └── routes.ts         # page.route() 共通ヘルパー
├── debug-mode.spec.ts
├── debug-panel-record.spec.ts
├── debug-panel-manage.spec.ts
├── debug-panel-test.spec.ts
├── debug-admin.spec.ts
└── feedback-form.spec.ts     # FeedbackForm 組込後
```

---

## 注意事項

### PiP（Document Picture-in-Picture）の制約

DebugPanel は PiP API を使うが、Playwright の Chromium では PiP が動作しない可能性が高い。
フォールバックのモーダル表示（`createPortal` によるオーバーレイ）をテスト対象とする。

PiP が使えるかどうかは `window.documentPictureInPicture` の有無で分岐しているため、
テスト時はこの API を意図的に `undefined` にする:

```ts
await page.addInitScript(() => {
  delete (window as Record<string, unknown>).documentPictureInPicture;
});
```

### route 条件の具体化

`page.route()` はパスだけでなくメソッドも検証すること。同一パスに GET / POST が共存するため、
メソッドチェックなしでは意図しないレスポンスを返す:

```ts
// NG: GET も POST も同じ応答になる
await page.route('**/notes?**', handler);

// OK: メソッドで分岐
await page.route('**/notes?**', async (route) => {
  if (route.request().method() === 'GET') { /* ... */ }
  else if (route.request().method() === 'POST') { /* ... */ }
  else { await route.continue(); }
});
```

---

## 実装優先度

| 優先度 | ファイル | 理由 |
|---|---|---|
| 1 | `debug-admin.spec.ts` | 最も利用頻度が高い画面。API注入のみで完結 |
| 2 | `debug-panel-record.spec.ts` | Create フローの保証。payload 検証で回帰防止 |
| 3 | `debug-panel-manage.spec.ts` | フィルタ/ステータス変更の UI 回帰 |
| 4 | `debug-mode.spec.ts` | 小テスト。URL パラメータによるモード切替 |
| 5 | `debug-panel-test.spec.ts` | テストケース操作。fixture が複雑なため後回し |
| 6 | `feedback-form.spec.ts` | サンプルアプリへの FeedbackForm 組込後 |

## レーン2（統合E2E）の対象

少数精鋭。Docker で PHP API を起動し、実DBで一連フローを検証:

| # | フロー | 検証内容 |
|---|---|---|
| I-1 | ノート作成→一覧反映→ステータス変更 | CRUD 一連が実データで動作 |
| I-2 | テストケースインポート→実行→結果反映 | テスト機能の端から端まで |

```bash
# レーン2実行
docker compose up -d
npx playwright test --project=integration
```
