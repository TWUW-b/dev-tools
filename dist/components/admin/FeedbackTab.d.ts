interface Colors {
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    border: string;
    borderLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    link: string;
    error: string;
    errorBg: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
}
interface FeedbackTabProps {
    apiBaseUrl: string;
    adminKey: string;
    colors: Colors;
    isDarkMode: boolean;
    refreshKey: number;
}
export declare function FeedbackTab({ apiBaseUrl, adminKey, colors, isDarkMode, refreshKey }: FeedbackTabProps): import("react/jsx-runtime").JSX.Element;
export {};
