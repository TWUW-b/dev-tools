import type { ParsedTestCase, Environment, LogCaptureInstance } from '../../types';
export interface TestTabHandle {
    refresh: () => Promise<void>;
}
interface TestTabProps {
    testCases: ParsedTestCase[];
    env: Environment;
    logCapture?: LogCaptureInstance;
    onNotesRefresh: () => void;
}
export declare const TestTab: import("react").ForwardRefExoticComponent<TestTabProps & import("react").RefAttributes<TestTabHandle>>;
export {};
