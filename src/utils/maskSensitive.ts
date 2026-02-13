/**
 * 機密情報をマスクする
 *
 * マスク対象:
 * - Authorization / Cookie / Set-Cookie ヘッダー
 * - JWT 形式トークン
 * - メールアドレス
 * - 電話番号形式
 */
export function maskSensitive(text: string): string {
  let result = text;

  // Authorization ヘッダー
  result = result.replace(
    /(Authorization:\s*)(Bearer\s+)?[^\s\n]+/gi,
    '$1$2[MASKED]'
  );

  // Cookie / Set-Cookie ヘッダー
  result = result.replace(
    /((?:Set-)?Cookie:\s*)[^\n]+/gi,
    '$1[MASKED]'
  );

  // JWT トークン (xxxxx.xxxxx.xxxxx 形式)
  result = result.replace(
    /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    '[JWT_MASKED]'
  );

  // Bearer トークン (単体)
  result = result.replace(
    /(Bearer\s+)[^\s\n"']+/gi,
    '$1[MASKED]'
  );

  // メールアドレス
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL_MASKED]'
  );

  // 電話番号 (日本形式)
  result = result.replace(
    /(?:0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}|\d{3}[-\s]?\d{4}[-\s]?\d{4})/g,
    '[PHONE_MASKED]'
  );

  return result;
}
