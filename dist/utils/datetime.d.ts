/**
 * 日時の表示ユーティリティ。
 *
 * DB(SQLite) の `CURRENT_TIMESTAMP` は "YYYY-MM-DD HH:MM:SS" 形式の **UTC** で、
 * タイムゾーン表記を持たない。これをそのまま `new Date()` に渡すとローカル時刻として
 * 誤解釈され、JST 環境では実際より 9 時間ずれて表示される。
 *
 * ここでは保存値は UTC のまま扱い、**表示時に JST へ変換**する。
 */
/**
 * DB 由来の日時文字列を Date に変換する。
 * - タイムゾーン表記(Z / ±hh:mm)付きの ISO 文字列はそのまま解釈する。
 * - "YYYY-MM-DD HH:MM:SS"(SQLite, TZ なし)は UTC とみなして解釈する。
 */
export declare function parseDbDate(dateStr: string | null | undefined): Date;
/** JST で "YYYY年M月D日 HH:MM" 相当(ja-JP ロケール)を返す。 */
export declare function formatJstDateTime(dateStr: string | null | undefined): string;
/** JST で "M/D HH:MM" を返す。 */
export declare function formatJstShort(dateStr: string | null | undefined): string;
