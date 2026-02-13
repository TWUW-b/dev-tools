# APIエンドポイントテスト設計書

## 概要

dev-tools の PHP API（SQLite）に対する Vitest + fetch によるブラックボックスAPIテスト。
Docker環境（`localhost:8081`）の実APIに対してHTTPリクエストで検証する。

## 前提

- テスト用env: `?env=test`（`debug-test.sqlite` を使用、devデータを汚染しない）
- 認証: 現時点でAPIキー未使用（config.php `api_key => null`）。認証テストは将来追加時に対応
- CORS: テストではOriginヘッダー不要（直接fetch）

## セットアップ

### ファイル構成

```
tests/api/
├── helpers/
│   ├── client.ts       # fetch ラッパー
│   └── seed.ts         # テストデータ投入/クリーンアップ
├── notes.test.ts       # /notes エンドポイント
├── test-cases.test.ts  # /test-cases エンドポイント
├── test-runs.test.ts   # /test-runs エンドポイント
└── routing.test.ts     # ルーティング/共通
```

### vitest.config.ts への追加

```ts
// vitest.config.api.ts（既存のjsdom設定と分離）
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // jsdomではなくnode
    include: ['tests/api/**/*.test.ts'],
    testTimeout: 10000,
    fileParallelism: false, // 共有DB（SQLite）のためファイル間は直列実行
  },
});
```

### helpers/client.ts

```ts
const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const ENV = "test";

export async function api(
  path: string,
  options?: RequestInit & { json?: unknown },
) {
  const { json, ...rest } = options ?? {};
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${separator}env=${ENV}`;

  return fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...(json !== undefined && { body: JSON.stringify(json) }),
  });
}
```

### helpers/seed.ts

```ts
import { api } from "./client";

/** テスト用ノートを作成し、idを返す */
export async function createNote(
  overrides?: Record<string, unknown>,
): Promise<{ id: number }> {
  const res = await api("/notes", {
    method: "POST",
    json: {
      content: "Test note content",
      route: "/test",
      screenName: "TestScreen",
      ...overrides,
    },
  });
  const body = await res.json();
  return { id: body.note.id };
}

/** テスト用テストケースをインポートし、IDを取得 */
export async function importTestCases(
  cases: { domain: string; capability: string; title: string }[],
): Promise<void> {
  await api("/test-cases/import", {
    method: "POST",
    json: { cases },
  });
}

/** ノートを論理削除 */
export async function deleteNote(id: number): Promise<void> {
  await api(`/notes/${id}`, { method: "DELETE" });
}
```

---

## テストケース一覧

### 1. Notes API（`/notes`）

#### 1.1 CRUD一巡テスト

| # | 操作 | エンドポイント | 期待 |
|---|------|---------------|------|
| 1 | POST /notes | 201 + `success: true` + `note.id` が存在 |
| 2 | GET /notes/:id | 200 + `note.content` が一致 |
| 3 | PATCH /notes/:id/severity | 200 + `success: true` |
| 4 | PATCH /notes/:id/status | 200 + `success: true` |
| 5 | DELETE /notes/:id | 200 + `success: true` |
| 6 | GET /notes/:id | 404（論理削除後） |

```ts
describe("Notes CRUD lifecycle", () => {
  let noteId: number;

  test("POST /notes → 201", async () => {
    const res = await api("/notes", {
      method: "POST",
      json: { content: "E2E test note", route: "/e2e", screenName: "E2EScreen" },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.note.id).toBeDefined();
    noteId = body.note.id;
  });

  test("GET /notes/:id → 200", async () => {
    const res = await api(`/notes/${noteId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.note.content).toBe("E2E test note");
  });

  test("PATCH /notes/:id/severity → 200", async () => {
    const res = await api(`/notes/${noteId}/severity`, {
      method: "PATCH",
      json: { severity: "high" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  test("PATCH /notes/:id/status → 200", async () => {
    const res = await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "resolved" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  test("DELETE /notes/:id → 200", async () => {
    const res = await api(`/notes/${noteId}`, { method: "DELETE" });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  test("GET /notes/:id → 404 after delete", async () => {
    const res = await api(`/notes/${noteId}`);
    expect(res.status).toBe(404);
  });
});
```

#### 1.2 一覧取得（フィルタ/検索）

| # | テスト | 期待 |
|---|--------|------|
| 1 | GET /notes | 200 + `data` が配列 |
| 2 | GET /notes?status=open | openのみ返る |
| 3 | GET /notes?q=keyword | 検索結果に keyword を含むノートが返る |
| 4 | GET /notes?includeDeleted=1 | 論理削除済みも含む |

#### 1.3 バリデーションエラー（400）

| # | テスト | 期待 |
|---|--------|------|
| 1 | POST /notes（content 空） | 400 + `error` に "content is required" |
| 2 | POST /notes（content 4001文字超） | 400 + `error` に "exceeds maximum length" |
| 3 | PATCH /notes/:id/status（invalid status） | 400 + `error` に "Invalid status" |
| 4 | PATCH /notes/:id/severity（invalid severity） | 400 + `error` に "Invalid severity" |

```ts
test("POST /notes → 400 when content empty", async () => {
  const res = await api("/notes", {
    method: "POST",
    json: { route: "/test", screenName: "Test" },
  });
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error).toContain("content is required");
});

test("PATCH /notes/:id/status → 400 with invalid status", async () => {
  const { id } = await createNote();
  const res = await api(`/notes/${id}/status`, {
    method: "PATCH",
    json: { status: "invalid_status" },
  });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toContain("Invalid status");
});
```

#### 1.4 存在しないリソース（404）

| # | テスト | 期待 |
|---|--------|------|
| 1 | GET /notes/99999 | 404 |
| 2 | DELETE /notes/99999 | 400（affected=0 → `success: false`） |
| 3 | PATCH /notes/99999/severity | 400（affected=0） |

#### 1.5 リクエストサイズ上限（413）

| # | テスト | 期待 |
|---|--------|------|
| 1 | POST /notes（1MB超のbody） | 413 + "Request body too large" |

---

### 2. Test Cases API（`/test-cases`）

#### 2.1 インポート → 一覧 → ツリー → 削除

| # | 操作 | エンドポイント | 期待 |
|---|------|---------------|------|
| 1 | POST /test-cases/import | 200 + `success: true` + `total` |
| 2 | GET /test-cases | 200 + `data` にインポートしたケースが含まれる |
| 3 | GET /test-cases/tree | 200 + domain/capability ツリー構造 |
| 4 | DELETE /test-cases | 200 + `deleted` 件数 |
| 5 | GET /test-cases | インポートしたケースが消えている |

```ts
describe("Test Cases lifecycle", () => {
  const cases = [
    { domain: "Auth", capability: "Login", title: "Valid login" },
    { domain: "Auth", capability: "Login", title: "Invalid password" },
    { domain: "Auth", capability: "Logout", title: "Logout clears session" },
  ];

  test("POST /test-cases/import → 200", async () => {
    const res = await api("/test-cases/import", {
      method: "POST",
      json: { cases },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(3);
  });

  test("GET /test-cases → 200 + imported cases", async () => {
    const res = await api("/test-cases");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(3);
  });

  test("GET /test-cases/tree → 200 + tree structure", async () => {
    const res = await api("/test-cases/tree");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
    const authDomain = body.data.find((d: any) => d.domain === "Auth");
    expect(authDomain).toBeDefined();
    expect(authDomain.capabilities.length).toBeGreaterThanOrEqual(2);
  });

  test("DELETE /test-cases → 200", async () => {
    const listRes = await api("/test-cases");
    const ids = (await listRes.json()).data.map((c: any) => c.id);
    const res = await api("/test-cases", {
      method: "DELETE",
      json: { ids },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
```

#### 2.2 バリデーションエラー

| # | テスト | 期待 |
|---|--------|------|
| 1 | POST /test-cases/import（cases 空） | 400 + "cases is required" |
| 2 | POST /test-cases/import（1001件超） | 400 + "Too many cases" |
| 3 | POST /test-cases/import（必須フィールド欠落） | 200 + `total: 0` にはならない（スキップされる） |
| 4 | DELETE /test-cases（ids 空） | 400 + "ids is required" |
| 5 | DELETE /test-cases（101件超） | 400 + "Too many ids" |

---

### 3. Test Runs API（`/test-runs`）

#### 3.1 テスト実行記録

| # | テスト | 期待 |
|---|--------|------|
| 1 | POST /test-runs（pass） | 200 + `results` にrunId |
| 2 | POST /test-runs（fail + failNote） | 200 + `results` にnoteId |
| 3 | POST /test-runs（fail + 個別note） | 200 + 各runにnoteId |
| 4 | GET /test-cases/tree で結果反映 | `last_result` が更新されている |

```ts
describe("Test Runs", () => {
  let caseId: number;

  beforeAll(async () => {
    await api("/test-cases/import", {
      method: "POST",
      json: {
        cases: [{ domain: "RunTest", capability: "Submit", title: "Basic run" }],
      },
    });
    const listRes = await api("/test-cases");
    const cases = (await listRes.json()).data;
    caseId = cases.find((c: any) => c.domain === "RunTest").id;
  });

  test("POST /test-runs (pass) → 200", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: { runs: [{ caseId, result: "pass" }] },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.results[0].result).toBe("pass");
  });

  test("POST /test-runs (fail + failNote) → 200 with noteId", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: {
        runs: [{ caseId, result: "fail" }],
        failNote: { content: "Something broke", severity: "high" },
      },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].noteId).toBeDefined();
  });

  test("tree reflects last_result", async () => {
    const res = await api("/test-cases/tree");
    const body = await res.json();
    const domain = body.data.find((d: any) => d.domain === "RunTest");
    const cap = domain.capabilities.find((c: any) => c.capability === "Submit");
    expect(cap.cases[0].last).toBe("fail");
  });
});
```

#### 3.2 バリデーションエラー

| # | テスト | 期待 |
|---|--------|------|
| 1 | POST /test-runs（runs 空） | 400 + "runs is required" |
| 2 | POST /test-runs（存在しないcaseId） | 200 + results 空（スキップ） |
| 3 | POST /test-runs（invalid result） | 200 + 該当runがスキップ |

---

### 4. ルーティング/共通

| # | テスト | 期待 |
|---|--------|------|
| 1 | GET /nonexistent | 404 + "Not found" |
| 2 | GET /notes?env=invalid | 400 + "Invalid env parameter" |
| 3 | OPTIONS /notes | 204（プリフライト） |

---

## 実行方法

```bash
# Docker APIサーバー起動
docker compose up -d

# APIテスト実行
npx vitest run --config vitest.config.api.ts

# 特定ファイルのみ
npx vitest run tests/api/notes.test.ts --config vitest.config.api.ts
```

## 既知のAPIバグ（テスト実装中に発見）

- **GET /notes?q= の検索が500エラー**: `NotesController.php` の `ESCAPE ?` がSQLiteでパラメータバインド不可。ESCAPE句はリテラルにする必要がある。該当テストは `test.skip` で保留中。

## npm scripts（追加）

```json
{
  "test:api": "vitest run --config vitest.config.api.ts",
  "test:api:watch": "vitest --config vitest.config.api.ts"
}
```
