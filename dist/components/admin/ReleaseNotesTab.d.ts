import type { Environment } from '../../types';
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
interface ReleaseNotesTabProps {
    apiBaseUrl: string;
    env: Environment;
    adminKey?: string;
    colors: Colors;
    refreshKey: number;
}
export declare function ReleaseNotesTab({ apiBaseUrl, env, adminKey, colors, refreshKey }: ReleaseNotesTabProps): import("react/jsx-runtime").JSX.Element;
export {};
