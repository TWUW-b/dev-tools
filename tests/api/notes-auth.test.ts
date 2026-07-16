// notes API の認証必須化（方針A / @TWUWB-002）を検証する。
// 通常の CRUD は helpers/client の api() が /notes に X-Admin-Key を自動付与するため、
// ここでは鍵の有無による 401/200 を raw fetch で明示的に確認する。

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const ADMIN_KEY = process.env.API_ADMIN_KEY ?? "dev-admin-key-change-in-production";
const url = (p: string) => `${BASE_URL}${p}${p.includes("?") ? "&" : "?"}env=test`;

test("GET /notes は X-Admin-Key 無しで 401", async () => {
  const res = await fetch(url("/notes"));
  expect(res.status).toBe(401);
});

test("GET /notes は誤った X-Admin-Key で 401", async () => {
  const res = await fetch(url("/notes"), { headers: { "X-Admin-Key": "wrong-key" } });
  expect(res.status).toBe(401);
});

test("GET /notes は正しい X-Admin-Key で 200", async () => {
  const res = await fetch(url("/notes"), { headers: { "X-Admin-Key": ADMIN_KEY } });
  expect(res.status).toBe(200);
});

test("GET /notes/:id 詳細も無認証で 401", async () => {
  const res = await fetch(url("/notes/1"));
  expect(res.status).toBe(401);
});
