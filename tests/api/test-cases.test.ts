import { api } from "./helpers/client";

// ─── Lifecycle: import → list → tree → delete（1テストに統合） ───

describe("Test Cases lifecycle", () => {
  // afterAll で確実にクリーンアップ（途中失敗時のゴミ防止）
  afterAll(async () => {
    const res = await api("/test-cases?includeArchived=1");
    const body = await res.json();
    const ids = body.data
      .filter((c: any) => c.domain === "ApiTest_Auth")
      .map((c: any) => c.id);
    if (ids.length > 0) {
      await api("/test-cases", { method: "DELETE", json: { ids } });
    }
  });

  test("import → list → tree → delete → verify archived", async () => {
    const cases = [
      { case_key: "ApiTest-AUTH-001", domain: "ApiTest_Auth", capability: "Login", title: "Valid login" },
      { case_key: "ApiTest-AUTH-002", domain: "ApiTest_Auth", capability: "Login", title: "Invalid password" },
      { case_key: "ApiTest-AUTH-003", domain: "ApiTest_Auth", capability: "Logout", title: "Logout clears session" },
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

    // Delete (soft)
    const delRes = await api("/test-cases", {
      method: "DELETE",
      json: { ids: importedIds },
    });
    expect(delRes.status).toBe(200);
    expect((await delRes.json()).success).toBe(true);

    // Verify archived (not visible by default)
    const verifyRes = await api("/test-cases");
    const verifyBody = await verifyRes.json();
    const remaining = verifyBody.data.filter((c: any) => c.domain === "ApiTest_Auth");
    expect(remaining.length).toBe(0);

    // But visible with includeArchived
    const archivedRes = await api("/test-cases?includeArchived=1");
    const archivedBody = await archivedRes.json();
    const archived = archivedBody.data.filter((c: any) => c.domain === "ApiTest_Auth");
    expect(archived.length).toBe(3);
    expect(archived.every((c: any) => c.archived_at !== null)).toBe(true);
  });
});

// ─── Import: upsert by case_key ───

describe("Test Cases import upsert", () => {
  afterAll(async () => {
    const res = await api("/test-cases?includeArchived=1");
    const body = await res.json();
    const ids = body.data
      .filter((c: any) => c.domain === "ApiTest_Upsert" || c.domain === "ApiTest_Upsert_Renamed")
      .map((c: any) => c.id);
    if (ids.length > 0) {
      await api("/test-cases", { method: "DELETE", json: { ids } });
    }
  });

  test("importing same case_key twice does not duplicate", async () => {
    const cases = [
      { case_key: "ApiTest-UP-001", domain: "ApiTest_Upsert", capability: "Cap", title: "Same case" },
    ];
    await api("/test-cases/import", { method: "POST", json: { cases } });
    await api("/test-cases/import", { method: "POST", json: { cases } });

    const res = await api("/test-cases");
    const body = await res.json();
    const matched = body.data.filter((c: any) => c.case_key === "ApiTest-UP-001");
    expect(matched.length).toBe(1);
  });

  test("title change updates existing row (id preserved)", async () => {
    const key = "ApiTest-UP-002";
    await api("/test-cases/import", {
      method: "POST",
      json: { cases: [{ case_key: key, domain: "ApiTest_Upsert", capability: "Cap", title: "Original" }] },
    });
    const before = await (await api("/test-cases")).json();
    const row1 = before.data.find((c: any) => c.case_key === key);
    expect(row1).toBeDefined();

    await api("/test-cases/import", {
      method: "POST",
      json: { cases: [{ case_key: key, domain: "ApiTest_Upsert_Renamed", capability: "Cap2", title: "Renamed" }] },
    });
    const after = await (await api("/test-cases")).json();
    const row2 = after.data.find((c: any) => c.case_key === key);
    expect(row2).toBeDefined();
    expect(row2.id).toBe(row1.id);
    expect(row2.title).toBe("Renamed");
    expect(row2.domain).toBe("ApiTest_Upsert_Renamed");
    expect(row2.capability).toBe("Cap2");
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
      case_key: `ApiTest-X-${i}`,
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
          { case_key: "", domain: "D", capability: "C", title: "T" },
          { case_key: "K", domain: "", capability: "C", title: "T" },
          { case_key: "K2", domain: "D", capability: "", title: "T" },
          { case_key: "K3", domain: "D", capability: "C", title: "" },
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
