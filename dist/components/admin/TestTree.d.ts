import type { DomainTree } from '../../types';
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
}
interface TestTreeProps {
    tree: DomainTree[];
    colors: Colors;
    isDarkMode: boolean;
    onNavigateToNote: (caseId: number) => void;
}
export declare function TestTree({ tree, colors, isDarkMode, onNavigateToNote }: TestTreeProps): import("react/jsx-runtime").JSX.Element | null;
export {};
