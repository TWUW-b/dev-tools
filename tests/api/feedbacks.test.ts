import { api, apiUpload } from "./helpers/client";
import { clearRateLimits, createFeedback, deleteFeedback, createTestPngBlob } from "./helpers/seed";

const ADMIN_KEY = "dev-admin-key-change-in-production";
const adminHeaders = { "X-Admin-Key": ADMIN_KEY };

beforeAll(() => {
  clearRateLimits();
});

// ── CRUD lifecycle ──

test("Feedbacks CRUD: POST → GET → PATCH status → DELETE → GET 404", async () => {
  // POST (public, no admin key)
  const createRes = await api("/feedbacks", {
    method: "POST",
    json: { kind: "bug", message: "CRUD lifecycle test" },
  });
  expect(createRes.status).toBe(201);
  const createBody = await createRes.json();
  expect(createBody.success).toBe(true);
  expect(createBody.data.id).toBeDefined();
  const id = createBody.data.id;

  // GET single (admin)
  const getRes = await api(`/feedbacks/${id}`, { headers: adminHeaders });
  expect(getRes.status).toBe(200);
  const getBody = await getRes.json();
  expect(getBody.data.message).toBe("CRUD lifecycle test");
  expect(getBody.data.kind).toBe("bug");

  // PATCH status (admin)
  const patchRes = await api(`/feedbacks/${id}/status`, {
    method: "PATCH",
    json: { status: "closed" },
    headers: adminHeaders,
  });
  expect(patchRes.status).toBe(200);
  expect((await patchRes.json()).data.status).toBe("closed");

  // DELETE (admin)
  const delRes = await api(`/feedbacks/${id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  expect(delRes.status).toBe(200);
  expect((await delRes.json()).success).toBe(true);

  // GET after delete → 404
  const goneRes = await api(`/feedbacks/${id}`, { headers: adminHeaders });
  expect(goneRes.status).toBe(404);
});

// ── List / Filter ──

describe("Feedbacks list and filter", () => {
  let feedbackId: number;

  beforeAll(async () => {
    const res = await api("/feedbacks", {
      method: "POST",
      json: { kind: "request", target: "app", message: "Filter test", customTag: "test-tag" },
    });
    const body = await res.json();
    feedbackId = body.data.id;
  });

  afterAll(async () => {
    await api(`/feedbacks/${feedbackId}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
  });

  test("GET /feedbacks → 200 + data array", async () => {
    const res = await api("/feedbacks", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  test("GET /feedbacks?status=open → only open", async () => {
    const res = await api("/feedbacks?status=open", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const fb of body.data) {
      expect(fb.status).toBe("open");
    }
  });

  test("GET /feedbacks?kind=request → filter by kind", async () => {
    const res = await api("/feedbacks?kind=request", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const fb of body.data) {
      expect(fb.kind).toBe("request");
    }
  });

  test("GET /feedbacks returns customTags", async () => {
    const res = await api("/feedbacks", { headers: adminHeaders });
    const body = await res.json();
    expect(Array.isArray(body.customTags)).toBe(true);
    expect(body.customTags).toContain("test-tag");
  });
});

// ── Authentication (401) ──

describe("Feedbacks authentication", () => {
  test("GET /feedbacks → 401 without admin key", async () => {
    const res = await api("/feedbacks");
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Unauthorized");
  });

  test("GET /feedbacks → 401 with wrong admin key", async () => {
    const res = await api("/feedbacks", {
      headers: { "X-Admin-Key": "wrong-key" },
    });
    expect(res.status).toBe(401);
  });

  test("PATCH /feedbacks/1/status → 401 without admin key", async () => {
    const res = await api("/feedbacks/1/status", {
      method: "PATCH",
      json: { status: "closed" },
    });
    expect(res.status).toBe(401);
  });

  test("DELETE /feedbacks/1 → 401 without admin key", async () => {
    const res = await api("/feedbacks/1", { method: "DELETE" });
    expect(res.status).toBe(401);
  });

  test("POST /feedbacks → no auth required (public)", async () => {
    const res = await api("/feedbacks", {
      method: "POST",
      json: { kind: "other", message: "Public post test" },
    });
    expect(res.status).toBe(201);
    // cleanup
    const id = (await res.json()).data.id;
    await api(`/feedbacks/${id}`, { method: "DELETE", headers: adminHeaders });
  });
});

// ── Validation errors (400) ──

describe("Feedbacks validation errors", () => {
  test("POST /feedbacks → 400 with invalid kind", async () => {
    const res = await api("/feedbacks", {
      method: "POST",
      json: { kind: "invalid", message: "test" },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid kind");
  });

  test("POST /feedbacks → 400 without message", async () => {
    const res = await api("/feedbacks", {
      method: "POST",
      json: { kind: "bug" },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Message is required");
  });

  test("POST /feedbacks → 400 with message exceeding max length", async () => {
    const res = await api("/feedbacks", {
      method: "POST",
      json: { kind: "bug", message: "x".repeat(4001) },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Message is required");
  });

  test("PATCH /feedbacks/:id/status → 400 with invalid status", async () => {
    const createRes = await api("/feedbacks", {
      method: "POST",
      json: { kind: "bug", message: "For status validation" },
    });
    const id = (await createRes.json()).data.id;

    try {
      const res = await api(`/feedbacks/${id}/status`, {
        method: "PATCH",
        json: { status: "invalid_status" },
        headers: adminHeaders,
      });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain("Invalid status");
    } finally {
      await api(`/feedbacks/${id}`, { method: "DELETE", headers: adminHeaders });
    }
  });
});

// ── Not found (404) ──

describe("Feedbacks not found", () => {
  test("GET /feedbacks/99999 → 404", async () => {
    const res = await api("/feedbacks/99999", { headers: adminHeaders });
    expect(res.status).toBe(404);
  });

  test("DELETE /feedbacks/99999 → 404", async () => {
    const res = await api("/feedbacks/99999", {
      method: "DELETE",
      headers: adminHeaders,
    });
    expect(res.status).toBe(404);
  });

  test("PATCH /feedbacks/99999/status → 404", async () => {
    const res = await api("/feedbacks/99999/status", {
      method: "PATCH",
      json: { status: "closed" },
      headers: adminHeaders,
    });
    expect(res.status).toBe(404);
  });
});

// ── Attachments ──

describe("Feedback attachments", () => {
  let feedbackId: number;

  beforeAll(async () => {
    clearRateLimits();
    const { id } = await createFeedback({ message: "Attachment test" });
    feedbackId = id;
  });

  afterAll(async () => {
    await deleteFeedback(feedbackId);
  });

  test("POST /feedbacks/{id}/attachments → 201 upload image", async () => {
    const formData = new FormData();
    formData.append("file", new File([createTestPngBlob()], "test.png", { type: "image/png" }));

    const res = await apiUpload(`/feedbacks/${feedbackId}/attachments`, formData);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.attachment).toBeDefined();
    expect(body.attachment.filename).toMatch(/^[a-f0-9]+\.png$/);
    expect(body.attachment.original_name).toBe("test.png");
    expect(body.attachment.mime_type).toBe("image/png");
  });

  test("GET /feedbacks/{id} → includes attachments array", async () => {
    const res = await api(`/feedbacks/${feedbackId}`, { headers: adminHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.attachments).toBeDefined();
    expect(Array.isArray(body.data.attachments)).toBe(true);
    expect(body.data.attachments.length).toBeGreaterThanOrEqual(1);
    expect(body.data.attachments[0].filename).toMatch(/^[a-f0-9]+\.png$/);
  });

  test("GET /feedbacks → includes attachmentCount", async () => {
    const res = await api("/feedbacks", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    const fb = body.data.find((f: { id: number }) => f.id === feedbackId);
    expect(fb).toBeDefined();
    expect(fb.attachmentCount).toBeGreaterThanOrEqual(1);
  });

  test("GET /feedbacks/{id}/attachments → 200 list", async () => {
    const res = await api(`/feedbacks/${feedbackId}/attachments`, { headers: adminHeaders });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.attachments)).toBe(true);
    expect(body.attachments.length).toBeGreaterThanOrEqual(1);
  });

  test("DELETE /feedbacks/{id}/attachments/{aId} → 200", async () => {
    // まず一覧取得
    const listRes = await api(`/feedbacks/${feedbackId}/attachments`, { headers: adminHeaders });
    const listBody = await listRes.json();
    const attachmentId = listBody.attachments[0].id;

    const res = await api(`/feedbacks/${feedbackId}/attachments/${attachmentId}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    // 削除後の一覧で消えていることを確認
    const afterRes = await api(`/feedbacks/${feedbackId}/attachments`, { headers: adminHeaders });
    const afterBody = await afterRes.json();
    const found = afterBody.attachments.find((a: { id: number }) => a.id === attachmentId);
    expect(found).toBeUndefined();
  });

  test("POST /feedbacks/{id}/attachments → max 3 enforced", async () => {
    clearRateLimits();
    // 3枚アップロード
    for (let i = 0; i < 3; i++) {
      const formData = new FormData();
      formData.append("file", new File([createTestPngBlob()], `img${i}.png`, { type: "image/png" }));
      const res = await apiUpload(`/feedbacks/${feedbackId}/attachments`, formData);
      expect(res.status).toBe(201);
    }

    // 4枚目 → 400
    const formData = new FormData();
    formData.append("file", new File([createTestPngBlob()], "overflow.png", { type: "image/png" }));
    const res = await apiUpload(`/feedbacks/${feedbackId}/attachments`, formData);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("max 3");
  });
});

// ── Attachment authentication ──

describe("Feedback attachment authentication", () => {
  beforeAll(() => clearRateLimits());
  test("GET /feedbacks/{id}/attachments → 401 without admin key", async () => {
    const res = await api("/feedbacks/1/attachments");
    expect(res.status).toBe(401);
  });

  test("DELETE /feedbacks/1/attachments/1 → 401 without admin key", async () => {
    const res = await api("/feedbacks/1/attachments/1", { method: "DELETE" });
    expect(res.status).toBe(401);
  });

  test("POST /feedbacks/{id}/attachments → no auth required (public)", async () => {
    const { id } = await createFeedback({ message: "Auth test attachment" });
    const formData = new FormData();
    formData.append("file", new File([createTestPngBlob()], "noauth.png", { type: "image/png" }));

    const res = await apiUpload(`/feedbacks/${id}/attachments`, formData);
    expect(res.status).toBe(201);

    await deleteFeedback(id);
  });
});

// ── Attachment not found ──

describe("Feedback attachment not found", () => {
  beforeAll(() => clearRateLimits());
  test("POST /feedbacks/99999/attachments → 404", async () => {
    const formData = new FormData();
    formData.append("file", new File([createTestPngBlob()], "nofb.png", { type: "image/png" }));
    const res = await apiUpload("/feedbacks/99999/attachments", formData);
    expect(res.status).toBe(404);
  });

  test("DELETE /feedbacks/99999/attachments/1 → 404", async () => {
    const res = await api("/feedbacks/99999/attachments/1", {
      method: "DELETE",
      headers: adminHeaders,
    });
    expect(res.status).toBe(404);
  });
});

// ── Export ──

describe("Feedback export", () => {
  let feedbackId: number;

  beforeAll(async () => {
    clearRateLimits();
    const { id } = await createFeedback({ kind: "bug", message: "Export test data" });
    feedbackId = id;
  });

  afterAll(async () => {
    await deleteFeedback(feedbackId);
  });

  test("GET /feedbacks/export/json → 200 + JSON download", async () => {
    const res = await api("/feedbacks/export/json", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type");
    expect(contentType).toContain("application/json");
    const disposition = res.headers.get("content-disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain("feedbacks-");
    const body = await res.json();
    expect(body.version).toBe("1.0.0");
    expect(body.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.feedbacks)).toBe(true);
    expect(body.feedbacks[0].id).toBeDefined();
    expect(body.feedbacks[0].message).toBeDefined();
    expect(body.exportedAt).toBeDefined();
  });

  test("GET /feedbacks/export/csv → 200 + CSV download", async () => {
    const res = await api("/feedbacks/export/csv", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type");
    expect(contentType).toContain("text/csv");
    const disposition = res.headers.get("content-disposition");
    expect(disposition).toContain("attachment");
    const text = await res.text();
    // BOM + ヘッダー行
    expect(text).toContain("ID");
    expect(text).toContain("Export test data");
  });

  test("GET /feedbacks/export/sqlite → 200 + binary download", async () => {
    const res = await api("/feedbacks/export/sqlite", { headers: adminHeaders });
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type");
    expect(contentType).toContain("application/octet-stream");
    const disposition = res.headers.get("content-disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain(".sqlite");
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(0);
    // SQLite magic header
    const magic = new Uint8Array(buf.slice(0, 6));
    expect(String.fromCharCode(...magic)).toBe("SQLite");
  });

  test("GET /feedbacks/export/json → 401 without admin key", async () => {
    const res = await api("/feedbacks/export/json");
    expect(res.status).toBe(401);
  });

  test("GET /feedbacks/export/csv → 401 without admin key", async () => {
    const res = await api("/feedbacks/export/csv");
    expect(res.status).toBe(401);
  });

  test("GET /feedbacks/export/sqlite → 401 without admin key", async () => {
    const res = await api("/feedbacks/export/sqlite");
    expect(res.status).toBe(401);
  });

  test("GET /feedbacks/export/json → includes attachments array", async () => {
    const res = await api("/feedbacks/export/json", { headers: adminHeaders });
    const body = await res.json();
    const fb = body.feedbacks.find((f: { id: number }) => f.id === feedbackId);
    expect(fb).toBeDefined();
    expect(Array.isArray(fb.attachments)).toBe(true);
  });
});

// ── Feedback delete cascades attachments ──

test("DELETE /feedbacks/{id} → also removes attachments", async () => {
  clearRateLimits();
  const { id } = await createFeedback({ message: "Cascade test" });

  // アップロード
  const formData = new FormData();
  formData.append("file", new File([createTestPngBlob()], "cascade.png", { type: "image/png" }));
  const uploadRes = await apiUpload(`/feedbacks/${id}/attachments`, formData);
  expect(uploadRes.status).toBe(201);
  const { attachment } = await uploadRes.json();

  // フィードバック削除
  await deleteFeedback(id);

  // 添付ファイル配信 → 404（ファイルも削除済み）
  const fileRes = await api(`/attachments/${attachment.filename}`);
  expect(fileRes.status).toBe(404);
});
