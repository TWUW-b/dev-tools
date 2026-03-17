/**
 * URLパラメータ ?feedback=admin を検知する hook
 *
 * popstate + pushState/replaceState の両方を監視する。
 */
export declare function useFeedbackAdminMode(): boolean;
