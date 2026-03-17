import type { ManualPiPProps } from '../../types';
interface DocumentPictureInPictureOptions {
    width?: number;
    height?: number;
}
interface DocumentPictureInPicture extends EventTarget {
    requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
    window: Window | null;
}
declare global {
    interface Window {
        documentPictureInPicture?: DocumentPictureInPicture;
    }
}
/**
 * PiP（Picture-in-Picture）フローティングウィンドウ
 * Document Picture-in-Picture API を使用して別ウィンドウで表示
 */
export declare function ManualPiP({ isOpen, docPath, onClose, onNavigate, onAppNavigate, initialSize, showDownloadButton, feedbackApiBaseUrl, feedbackUserType, feedbackAppVersion, onFeedbackSubmitSuccess, onFeedbackSubmitError, feedbackDefaultHeight: _feedbackDefaultHeight, feedbackMinHeight: _feedbackMinHeight, feedbackMaxHeight: _feedbackMaxHeight, }: ManualPiPProps): import("react").ReactPortal | null;
export {};
