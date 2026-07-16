const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const ENV = "test";
const ADMIN_KEY = process.env.API_ADMIN_KEY ?? "dev-admin-key-change-in-production";

// notes 系は X-Admin-Key 必須（api/index.php の方針A / @TWUWB-002）。
// /notes パスへ自動付与し、既存の多数の呼び出しを一括で認証済みにする。
// 鍵無し/誤鍵を検証したいテストは options.headers で上書きできる（下記スプレッド順）。
function notesAdminHeader(path: string): Record<string, string> {
  return path.startsWith("/notes") ? { "X-Admin-Key": ADMIN_KEY } : {};
}

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
      ...notesAdminHeader(path),
      ...rest.headers,
    },
    ...(json !== undefined && { body: JSON.stringify(json) }),
  });
}

/**
 * multipart/form-data リクエスト（ファイルアップロード用）
 * Content-Type は fetch が自動設定するため明示しない
 */
export async function apiUpload(
  path: string,
  formData: FormData,
  options?: { headers?: Record<string, string> },
) {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${separator}env=${ENV}`;

  return fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      ...notesAdminHeader(path),
      ...options?.headers,
    },
  });
}
