import type { FeedbackLogCapture, FeedbackLogCaptureConfig } from '../types';
/**
 * フィードバック用ログキャプチャ
 *
 * console.log/warn/error と fetch をmonkey-patchし、
 * 直前N件をリングバッファで保持する。
 *
 * StrictMode対応: 二重マウントされた場合は同一インスタンスを返す。
 */
export declare function createFeedbackLogCapture(config?: FeedbackLogCaptureConfig): FeedbackLogCapture;
