const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const ENV = "test";
const ADMIN_KEY = process.env.API_ADMIN_KEY ?? "dev-admin-key-change-in-production";

/**
 * 管理者認証が必要なパス。**api/index.php のガードと同じ範囲に保つこと**（@TWUWB-004）。
 *
 *   #^/(notes|export|test-runs|test-cases)(/|$)#
 *
 * v1.2.16 でガードを notes 以外へ広げたとき、ここが `/notes` 判定のままだったため
 * /test-runs・/test-cases のテストが 11 件まとめて 401 で落ちていた。プロダクト側は
 * 正常なのにテストだけが赤くなるので、本物の退行を見落とす状態になる。
 *
 * `?` を許すのはクエリ付き（/notes?status=open）で呼ぶテストがあるため。
 */
const ADMIN_GUARDED_PATH = /^\/(notes|export|test-runs|test-cases)([/?]|$)/;

// 該当パスへ X-Admin-Key を自動付与し、多数の呼び出しを一括で認証済みにする。
// 鍵無し/誤鍵を検証したいテストは options.headers で上書きできる（下記スプレッド順）。
function adminGuardHeader(path: string): Record<string, string> {
  return ADMIN_GUARDED_PATH.test(path) ? { "X-Admin-Key": ADMIN_KEY } : {};
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
      ...adminGuardHeader(path),
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
      ...adminGuardHeader(path),
      ...options?.headers,
    },
  });
}
