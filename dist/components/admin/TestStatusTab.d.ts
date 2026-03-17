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
    link: string;
    error: string;
    errorBg: string;
}
interface TestStatusTabProps {
    env: Environment;
    colors: Colors;
    isDarkMode: boolean;
    onNavigateToNote: (caseId: number) => void;
    refreshKey: number;
}
export declare function TestStatusTab({ env, colors, isDarkMode, onNavigateToNote, refreshKey }: TestStatusTabProps): import("react/jsx-runtime").JSX.Element;
export {};
