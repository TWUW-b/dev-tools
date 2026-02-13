import { api } from "./helpers/client";

// ─── Test Runs ───

describe("Test Runs", () => {
  let caseId: number;

  beforeAll(async () => {
    await api("/test-cases/import", {
      method: "POST",
      json: {
        cases: [{ domain: "ApiTest_RunTest", capability: "Submit", title: "Basic run" }],
      },
    });
    const listRes = await api("/test-cases");
    const cases = (await listRes.json()).data;
    const found = cases.find((c: any) => c.domain === "ApiTest_RunTest");
    if (!found) throw new Error("Seed data 'ApiTest_RunTest' not found in test_cases");
    caseId = found.id;
  });

  afterAll(async () => {
    // クリーンアップ: テストケースを削除（関連 test_runs も cascade される）
    if (caseId) {
      await api("/test-cases", { method: "DELETE", json: { ids: [caseId] } });
    }
  });

  test("POST /test-runs (pass) → 200", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: { runs: [{ caseId, result: "pass" }] },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.results.length).toBe(1);
    expect(body.results[0].result).toBe("pass");
    expect(body.results[0].runId).toBeDefined();
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
    expect(body.success).toBe(true);
    expect(body.results[0].noteId).toBeDefined();
  });

  test("POST /test-runs (fail + individual note) → 200 with noteId", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: {
        runs: [{
          caseId,
          result: "fail",
          note: { content: "Individual failure note", severity: "medium" },
        }],
      },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].noteId).toBeDefined();
  });

  test("POST /test-runs (skip) → 200", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: { runs: [{ caseId, result: "skip" }] },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].result).toBe("skip");
  });

  test("tree reflects test runs", async () => {
    const res = await api("/test-cases/tree");
    const body = await res.json();
    const domain = body.data.find((d: any) => d.domain === "ApiTest_RunTest");
    expect(domain).toBeDefined();
    const cap = domain.capabilities.find((c: any) => c.capability === "Submit");
    expect(cap).toBeDefined();
    expect(cap.total).toBe(1);
    // last_result は created_at ソートで同一秒内の順序が不定のため、
    // null でないこと（=runが記録されていること）のみ検証
    expect(cap.cases[0].last).not.toBeNull();
  });
});

// ─── Validation errors ───

describe("Test Runs validation errors", () => {
  test("POST /test-runs → 400 when runs empty", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: { runs: [] },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("runs is required");
  });

  test("POST /test-runs → skips nonexistent caseId", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: { runs: [{ caseId: 999999, result: "pass" }] },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBe(0);
  });

  test("POST /test-runs → skips invalid result", async () => {
    const res = await api("/test-runs", {
      method: "POST",
      json: { runs: [{ caseId: 1, result: "invalid" }] },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.length).toBe(0);
  });
});
