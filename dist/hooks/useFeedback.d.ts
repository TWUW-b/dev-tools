import type { Feedback, FeedbackInput, ConsoleLogEntry, NetworkLogEntry } from '../types';
export interface UseFeedbackOptions {
    apiBaseUrl: string;
    userType?: string;
    appVersion?: string;
}
export interface UseFeedbackReturn {
    submitting: boolean;
    error: Error | null;
    submitFeedback: (input: FeedbackInput, logs?: {
        consoleLogs?: ConsoleLogEntry[];
        networkLogs?: NetworkLogEntry[];
    }) => Promise<{
        data: Feedback | null;
        error: Error | null;
    }>;
}
export declare function useFeedback(options: UseFeedbackOptions): UseFeedbackReturn;
