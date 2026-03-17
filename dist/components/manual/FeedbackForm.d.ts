import type { Feedback } from '../../types';
/** FeedbackForm 内部プロパティ（exportしない） */
interface FeedbackFormProps {
    apiBaseUrl: string;
    userType?: string;
    appVersion?: string;
    onSubmitSuccess?: (feedback: Feedback) => void;
    onSubmitError?: (error: Error) => void;
}
export declare function FeedbackForm({ apiBaseUrl, userType, appVersion, onSubmitSuccess, onSubmitError, }: FeedbackFormProps): import("react/jsx-runtime").JSX.Element;
export {};
