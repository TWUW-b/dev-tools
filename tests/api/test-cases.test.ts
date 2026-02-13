import { api } from "./helpers/client";

// ─── Lifecycle: import → list → tree → delete（1テストに統合） ───

describe("Test Cases lifecycle", () => {
  // afterAll で確実にクリーンアップ（途中失敗時のゴミ防止）
  afterAll(async () => {
    const res = await api("/test-cases");
    const body = await res.json();
    const ids = body.data
      .filter((c: any) => c.domain === "ApiTest_Auth")
      .map((c: any) => c.id);
    if (ids.length > 0) {
      await api("/test-cases", { method: "DELETE", json: { ids } });
    }
  });

  test("import → list → tree → delete → verify gone", async () => {
    const cases = [
      { domain: "ApiTest_Auth", capability: "Login", title: "Valid login" },
      { domain: "ApiTest_Auth", capability: "Login", title: "Invalid password" },
      { domain: "ApiTest_Auth", capability: "Logout", title: "Logout clears session" },
    ];

    // Import
    const importRes = await api("/test-cases/import", {
      method: "POST",
      json: { cases },
    });
    expect(importRes.status).toBe(200);
    const importBody = await importRes.json();
    expect(importBody.success).toBe(true);
    expect(importBody.total).toBeGreaterThanOrEqual(3);

    // List
    const listRes = await api("/test-cases");
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    const matched = listBody.data.filter((c: any) => c.domain === "ApiTest_Auth");
    expect(matched.length).toBe(3);
    const importedIds = matched.map((c: any) => c.id);

    // Tree
    const treeRes = await api("/test-cases/tree");
    expect(treeRes.status).toBe(200);
    const treeBody = await treeRes.json();
    expect(Array.isArray(treeBody.data)).toBe(true);
    const authDomain = treeBody.data.find((d: any) => d.domain === "ApiTest_Auth");
    expect(authDomain).toBeDefined();
    expect(authDomain.capabilities.length).toBeGreaterThanOrEqual(2);

    // Delete
    const delRes = await api("/test-cases", {
      method: "DELETE",
      json: { ids: importedIds },
    });
    expect(delRes.status).toBe(200);
    expect((await delRes.json()).success).toBe(true);

    // Verify gone
    const verifyRes = await api("/test-cases");
    const verifyBody = await verifyRes.json();
    const remaining = verifyBody.data.filter((c: any) => c.domain === "ApiTest_Auth");
    expect(remaining.length).toBe(0);
  });
});

// ─── Import: idempotent ───

describe("Test Cases import idempotency", () => {
  afterAll(async () => {
    const res = await api("/test-cases");
    const body = await res.json();
    const ids = body.data
      .filter((c: any) => c.domain === "ApiTest_Idempotent")
      .map((c: any) => c.id);
    if (ids.length > 0) {
      await api("/test-cases", { method: "DELETE", json: { ids } });
    }
  });

  test("importing same case twice does not duplicate", async () => {
    const cases = [
      { domain: "ApiTest_Idempotent", capability: "Cap", title: "Same case" },
    ];
    await api("/test-cases/import", { method: "POST", json: { cases } });
    await api("/test-cases/import", { method: "POST", json: { cases } });

    const res = await api("/test-cases");
    const body = await res.json();
    const matched = body.data.filter((c: any) => c.domain === "ApiTest_Idempotent");
    expect(matched.length).toBe(1);
  });
});

// ─── Validation errors ───

describe("Test Cases validation errors", () => {
  test("POST /test-cases/import → 400 when cases empty", async () => {
    const res = await api("/test-cases/import", {
      method: "POST",
      json: { cases: [] },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("cases is required");
  });

  test("POST /test-cases/import → 400 when cases exceed 1000", async () => {
    const cases = Array.from({ length: 1001 }, (_, i) => ({
      domain: "D",
      capability: "C",
      title: `T${i}`,
    }));
    const res = await api("/test-cases/import", {
      method: "POST",
      json: { cases },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Too many cases");
  });

  test("POST /test-cases/import → skips cases with missing fields", async () => {
    const res = await api("/test-cases/import", {
      method: "POST",
      json: {
        cases: [
          { domain: "", capability: "C", title: "T" },
          { domain: "D", capability: "", title: "T" },
          { domain: "D", capability: "C", title: "" },
        ],
      },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("No valid cases");
  });

  test("DELETE /test-cases → 400 when ids empty", async () => {
    const res = await api("/test-cases", {
      method: "DELETE",
      json: { ids: [] },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("ids is required");
  });

  test("DELETE /test-cases → 400 when ids exceed 100", async () => {
    const ids = Array.from({ length: 101 }, (_, i) => i + 1);
    const res = await api("/test-cases", {
      method: "DELETE",
      json: { ids },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Too many ids");
  });
});
