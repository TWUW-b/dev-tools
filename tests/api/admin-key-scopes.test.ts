/**
 * 範囲付きの管理キー（R-025）。
 *
 * 鍵 1 本で notes・feedback・リリースノート・書き出しがすべて開く状態だと、本番で機械に
 * リリースノートだけを投入させることができない。範囲付きの鍵が範囲の外へ出ないこと、
 * 従来の feedback_admin_key は今までどおり全部に通ることを固定する。
 *
 * 鍵の値はローカルの api/config.php の admin_keys に置いてある（config.php は git 管理外）。
 *   test-scoped-release-notes-key … ['release-notes']
 *   test-scoped-feedbacks-key     … ['feedbacks']
 *   test-scoped-all-key           … ['*']
 *   test-scoped-broken-key        … ['release-notes', 'no-such-scope']（知らない範囲 → 鍵ごと無効）
 */
import { test, expect, describe } from "vitest";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const LEGACY_KEY = process.env.API_ADMIN_KEY ?? "dev-admin-key-change-in-production";
const RELEASE_NOTES_KEY = "test-scoped-release-notes-key";
const FEEDBACKS_KEY = "test-scoped-feedbacks-key";
const ALL_KEY = "test-scoped-all-key";
const BROKEN_KEY = "test-scoped-broken-key";

const url = (p: string) => `${BASE_URL}${p}${p.includes("?") ? "&" : "?"}env=test`;

async function status(path: string, key: string): Promise<number> {
  const res = await fetch(url(path), { headers: { "X-Admin-Key": key } });
  await res.arrayBuffer();
  return res.status;
}

describe("リリースノート専用の鍵", () => {
  test("リリースノートの管理 API には通る", async () => {
    expect(await status("/release-notes", RELEASE_NOTES_KEY)).toBe(200);
  });

  test.each([
    "/notes",
    "/export/json",
    "/export/sqlite",
    "/test-cases",
    "/feedbacks",
    "/feedbacks/export/json",
    "/feedbacks/export/sqlite",
    "/manual/items",
  ])("%s は 403", async (path) => {
    expect(await status(path, RELEASE_NOTES_KEY)).toBe(403);
  });
});

describe("フィードバック専用の鍵", () => {
  test("フィードバックの一覧と json 書き出しには通る", async () => {
    expect(await status("/feedbacks", FEEDBACKS_KEY)).toBe(200);
    expect(await status("/feedbacks/export/json", FEEDBACKS_KEY)).toBe(200);
  });

  test("DB 丸ごとの書き出しは範囲に含まれないので 403", async () => {
    expect(await status("/feedbacks/export/sqlite", FEEDBACKS_KEY)).toBe(403);
  });

  test("リリースノートと notes は 403", async () => {
    expect(await status("/release-notes", FEEDBACKS_KEY)).toBe(403);
    expect(await status("/notes", FEEDBACKS_KEY)).toBe(403);
  });
});

describe("全範囲の鍵", () => {
  test.each([
    ["admin_keys の '*'", ALL_KEY],
    ["従来の feedback_admin_key", LEGACY_KEY],
  ])("%s は DB 丸ごとの書き出しまで通る", async (_label, key) => {
    expect(await status("/notes", key)).toBe(200);
    expect(await status("/release-notes", key)).toBe(200);
    expect(await status("/feedbacks", key)).toBe(200);
    expect(await status("/export/sqlite", key)).toBe(200);
  });
});

describe("無効な鍵", () => {
  test("知らない範囲を含む鍵は、範囲内でも 401（書き間違いで広く開かない）", async () => {
    expect(await status("/release-notes", BROKEN_KEY)).toBe(401);
  });

  test("誤った鍵は 401 のまま（403 と区別する）", async () => {
    expect(await status("/release-notes", "wrong-key")).toBe(401);
  });
});
