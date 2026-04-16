import type { DebugPanelProps } from '../types';
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
 * デバッグパネル（PiP）
 */
export declare function DebugPanel({ apiBaseUrl, env, onSave, onClose, initialSize, testCases, logCapture, manualItems, manualDefaultPath, onManualNavigate, onManualAppNavigate, environmentsMd, triggerOffset, }: DebugPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
