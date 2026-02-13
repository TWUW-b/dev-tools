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
    headers: options?.headers,
  });
}
