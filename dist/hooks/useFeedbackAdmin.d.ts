import type { Feedback, FeedbackKind, FeedbackTarget, FeedbackStatus } from '../types';
export interface UseFeedbackAdminOptions {
    apiBaseUrl: string;
    adminKey: string;
}
export interface FeedbackFilters {
    status: FeedbackStatus | '';
    kind: FeedbackKind | '';
    target: FeedbackTarget | '';
    customTag: string;
}
export interface UseFeedbackAdminReturn {
    feedbacks: Feedback[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    error: Error | null;
    filters: FeedbackFilters;
    customTags: string[];
    setFilters: (filters: Partial<FeedbackFilters>) => void;
    setPage: (page: number) => void;
    updateStatus: (id: number, status: FeedbackStatus) => Promise<boolean>;
    remove: (id: number) => Promise<boolean>;
    refresh: () => void;
}
export declare function useFeedbackAdmin(options: UseFeedbackAdminOptions): UseFeedbackAdminReturn;
