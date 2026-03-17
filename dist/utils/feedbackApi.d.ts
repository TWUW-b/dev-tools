import type { Feedback, FeedbackStatus, NoteAttachment } from '../types';
interface PostFeedbackParams {
    apiBaseUrl: string;
    body: Record<string, unknown>;
    signal?: AbortSignal;
}
interface AdminRequestParams {
    apiBaseUrl: string;
    adminKey: string;
    signal?: AbortSignal;
}
export declare function postFeedback({ apiBaseUrl, body, signal }: PostFeedbackParams): Promise<Feedback>;
export declare function getFeedbacks(params: AdminRequestParams & {
    query?: Record<string, string>;
}): Promise<{
    data: Feedback[];
    total: number;
    page: number;
    limit: number;
    customTags: string[];
}>;
export declare function getFeedbackDetail(params: AdminRequestParams & {
    id: number;
}): Promise<Feedback>;
export declare function updateFeedbackStatus(params: AdminRequestParams & {
    id: number;
    status: FeedbackStatus;
}): Promise<{
    id: number;
    status: FeedbackStatus;
    updatedAt: string;
}>;
export declare function deleteFeedback(params: AdminRequestParams & {
    id: number;
}): Promise<void>;
export declare function uploadFeedbackAttachment(params: {
    apiBaseUrl: string;
    feedbackId: number;
    file: File;
}): Promise<NoteAttachment>;
export declare function deleteFeedbackAttachment(params: AdminRequestParams & {
    feedbackId: number;
    attachmentId: number;
}): Promise<void>;
export declare function exportFeedbacks(params: {
    apiBaseUrl: string;
    adminKey: string;
    format: 'json' | 'csv' | 'sqlite';
}): Promise<void>;
export {};
