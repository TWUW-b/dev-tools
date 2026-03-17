/**
 * 機密情報をマスクする
 *
 * マスク対象:
 * - Authorization / Cookie / Set-Cookie ヘッダー
 * - JWT 形式トークン
 * - メールアドレス
 * - 電話番号形式
 */
export declare function maskSensitive(text: string): string;
