import type { CaseSummary } from '../../types';
interface CapabilityVisual {
    capability: string;
    total: number;
    passed: number;
    failed: number;
    untested: number;
    openIssues: number;
    status: 'passed' | 'fail' | 'retest' | 'incomplete';
    cases: CaseSummary[];
}
export interface DomainVisual {
    domain: string;
    total: number;
    passed: number;
    failed: number;
    untested: number;
    hasIssues: boolean;
    capabilities: CapabilityVisual[];
}
interface Colors {
    bg: string;
    bgSecondary: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
}
interface TestOverviewProps {
    domains: DomainVisual[];
    colors: Colors;
    isDarkMode: boolean;
}
export declare function TestOverview({ domains, colors, isDarkMode }: TestOverviewProps): import("react/jsx-runtime").JSX.Element;
export {};
