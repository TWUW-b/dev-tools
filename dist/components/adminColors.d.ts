/**
 * 管理 UI のカラーパレット（@TWUWB-005）。
 *
 * もともと DebugAdmin.tsx の中に閉じていた。ReleaseNotesTab を単体で export したとき、
 * ホスト側が colors を組み立てられないと使えないので、ここへ出して公開する。
 * DebugAdmin もここから import するので、パレットの実体は 1 箇所のまま。
 */
/** ライトモード カラー定義 */
export declare const LIGHT_COLORS: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    border: string;
    borderLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    error: string;
    errorBg: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    link: string;
};
/** ダークモード カラー定義 */
export declare const DARK_COLORS: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    border: string;
    borderLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    error: string;
    errorBg: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    link: string;
};
/** 管理 UI のパレット型。ホストが自前の色を渡すときの形。 */
export type AdminColors = typeof LIGHT_COLORS;
