import { api } from "./helpers/client";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

describe("Routing and common", () => {
  test("GET /nonexistent → 404", async () => {
    const res = await api("/nonexistent");
    expect(res.status).toBe(404);
    expect((await res.json()).error).toContain("Not found");
  });

  test("invalid env parameter → 400", async () => {
    // env パラメータはclient.tsで自動付与されるため、直接fetchする
    const res = await fetch(`${BASE_URL}/notes?env=invalid`);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid env parameter");
  });

  test("OPTIONS /notes → 204 (preflight)", async () => {
    const res = await fetch(`${BASE_URL}/notes?env=test`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
      },
    });
    expect(res.status).toBe(204);
  });
});

/**
 * api/index.php のガード範囲と helpers/client.ts の X-Admin-Key 自動付与範囲がずれると、
 * プロダクトは正常なのにテストだけが 401 で落ちる。実際に v1.2.16 でガードを notes 以外へ
 * 広げたときこれが起き、11 件が赤いまま放置された（@TWUWB-004）。
 *
 * 片方だけ直しても気づけるように、両者を実挙動で突き合わせておく。
 */
describe("管理者ガードとテストヘルパの範囲が一致している（@TWUWB-004 再発防止）", () => {
  const guarded = [
    "/notes",
    "/notes?status=open",
    "/test-cases",
    "/test-cases/tree",
    "/test-runs",
    "/export/json",
  ];

  test.each(guarded)("%s は鍵なしなら 401、client 経由なら 401 にならない", async (path) => {
    const separator = path.includes("?") ? "&" : "?";
    const bare = await fetch(`${BASE_URL}${path}${separator}env=test`);
    expect(bare.status, `${path} がガードされていない`).toBe(401);

    // client が鍵を付けていれば 401 以外になる（404/405 でもよい。認証を通ったことが分かればよい）
    const viaClient = await api(path);
    expect(viaClient.status, `${path} に client が X-Admin-Key を付けていない`).not.toBe(401);
  });

  test("公開ルートは鍵なしで 401 にならない", async () => {
    // POST /feedbacks（一般利用者の投稿口）とバイナリ配信はガードの外にある
    const feedback = await fetch(`${BASE_URL}/feedbacks?env=test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "request", message: "ガード範囲の確認" }),
    });
    expect(feedback.status).not.toBe(401);
  });
});
