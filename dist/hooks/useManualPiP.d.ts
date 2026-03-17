import type { UseManualPiPReturn } from '../types';
/**
 * 別タブ用のベースURLを設定
 * @param url ベースURL（例: '/manual', '/docs/view'）
 */
export declare function setManualTabBaseUrl(url: string): void;
/**
 * PiP / 別タブ 開閉状態管理フック
 */
export declare function useManualPiP(): UseManualPiPReturn;
