import type { ParsedTestCase, Environment, LogCaptureInstance } from '../../types';
export interface TestTabHandle {
    refresh: () => Promise<void>;
}
interface TestTabProps {
    testCases: ParsedTestCase[];
    env: Environment;
    logCapture?: LogCaptureInstance;
    onNotesRefresh: () => void;
    /** 現在「実行中」のテストケース ID が変化したときに呼ばれる。展開中の capability の全 case ID の和集合 */
    onRunningCasesChange?: (caseIds: number[]) => void;
}
export declare const TestTab: import("react").ForwardRefExoticComponent<TestTabProps & import("react").RefAttributes<TestTabHandle>>;
export {};
