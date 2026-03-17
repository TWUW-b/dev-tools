import type { LogCaptureConfig, LogCaptureInstance } from '../types';
/**
 * ログキャプチャを初期化
 * アプリ起動時に呼び出し、DebugPanelに渡す
 *
 * 既にインスタンスが存在する場合は自動で destroy してから新規作成する。
 * これにより monkey-patch の破損を防ぐ。
 */
export declare function createLogCapture(config: LogCaptureConfig): LogCaptureInstance;
