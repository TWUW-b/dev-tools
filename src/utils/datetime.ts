/**
 * 日時の表示ユーティリティ。
 *
 * DB(SQLite) の `CURRENT_TIMESTAMP` は "YYYY-MM-DD HH:MM:SS" 形式の **UTC** で、
 * タイムゾーン表記を持たない。これをそのまま `new Date()` に渡すとローカル時刻として
 * 誤解釈され、JST 環境では実際より 9 時間ずれて表示される。
 *
 * ここでは保存値は UTC のまま扱い、**表示時に JST へ変換**する。
 */

const JST_TIME_ZONE = 'Asia/Tokyo';

/**
 * DB 由来の日時文字列を Date に変換する。
 * - タイムゾーン表記(Z / ±hh:mm)付きの ISO 文字列はそのまま解釈する。
 * - "YYYY-MM-DD HH:MM:SS"(SQLite, TZ なし)は UTC とみなして解釈する。
 */
export function parseDbDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(NaN);
  // 既にタイムゾーン情報を含む(Z もしくは +09:00 等)場合はそのまま
  if (/[Zz]$/.test(dateStr) || /[+-]\d{2}:?\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }
  // SQLite の "YYYY-MM-DD HH:MM:SS"(UTC) を ISO(UTC) に正規化
  return new Date(dateStr.replace(' ', 'T') + 'Z');
}

/** JST で "YYYY年M月D日 HH:MM" 相当(ja-JP ロケール)を返す。 */
export function formatJstDateTime(dateStr: string | null | undefined): string {
  const date = parseDbDate(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('ja-JP', {
    timeZone: JST_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** JST で "M/D HH:MM" を返す。 */
export function formatJstShort(dateStr: string | null | undefined): string {
  const date = parseDbDate(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('ja-JP', {
    timeZone: JST_TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
