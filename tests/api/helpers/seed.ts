import { execSync } from "child_process";
import { api } from "./client";

const TEST_DB_PATH = process.env.TEST_DB_PATH ?? "api/data/debug-test.sqlite";

/** rate_limits テーブルをクリア（テスト間のレート制限干渉を防止） */
export function clearRateLimits(): void {
  execSync(`sqlite3 "${TEST_DB_PATH}" "DELETE FROM rate_limits"`, {
    cwd: process.env.API_PROJECT_ROOT ?? process.cwd(),
  });
}

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
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`createNote failed: ${res.status} ${JSON.stringify(body)}`);
  }
  const body = await res.json();
  return { id: body.note.id };
}

/** ノートを論理削除 */
export async function deleteNote(id: number): Promise<void> {
  const res = await api(`/notes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`deleteNote(${id}) failed: ${res.status} ${JSON.stringify(body)}`);
  }
}

/** テスト用フィードバックを作成し、idを返す */
export async function createFeedback(
  overrides?: Record<string, unknown>,
): Promise<{ id: number }> {
  const res = await api("/feedbacks", {
    method: "POST",
    json: {
      kind: "bug",
      message: "Test feedback",
      ...overrides,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`createFeedback failed: ${res.status} ${JSON.stringify(body)}`);
  }
  const body = await res.json();
  return { id: body.data.id };
}

/** フィードバックを削除（管理者） */
export async function deleteFeedback(id: number): Promise<void> {
  const adminHeaders = { "X-Admin-Key": "dev-admin-key-change-in-production" };
  const res = await api(`/feedbacks/${id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`deleteFeedback(${id}) failed: ${res.status} ${JSON.stringify(body)}`);
  }
}

/** テスト用の小さなPNG画像のBlobを生成 */
export function createTestPngBlob(): Blob {
  // 1x1 pixel PNG
  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
    0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  return new Blob([pngBytes], { type: "image/png" });
}
