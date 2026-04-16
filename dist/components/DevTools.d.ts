import type { Environment, ParsedTestCase, ManualItem, LogCaptureConfig, Note } from '../types';
export interface DevToolsProps {
    /** デバッグ API のベース URL（未指定時は DevTools 全体が非表示） */
    apiBaseUrl?: string;
    /** 環境 */
    env?: Environment;
    /** テストケース一覧（指定時に test タブを有効化 + 実行中ケースの自動紐付けが有効） */
    testCases?: ParsedTestCase[];
    /** マニュアル項目 */
    manualItems?: ManualItem[];
    /** マニュアルのデフォルトパス */
    manualDefaultPath?: string;
    /** マニュアル内リンク遷移ハンドラ */
    onManualNavigate?: (path: string) => void;
    /** マニュアル内 app: リンク遷移ハンドラ */
    onManualAppNavigate?: (path: string) => void;
    /** 環境情報 MD 文字列（指定時に「環境」タブを表示） */
    environmentsMd?: string;
    /** ノート保存時コールバック */
    onSave?: (note: Note) => void;
    /** PiP の初期サイズ */
    initialSize?: {
        width: number;
        height: number;
    };
    /** logCapture の設定（既定: console + /api/** ネットワーク） */
    logCaptureConfig?: LogCaptureConfig;
    /** logCapture を完全に無効化 */
    disableLogCapture?: boolean;
    /**
     * DebugAdmin を表示する pathname。この path にいる間は debug mode を強制 ON 扱いし PiP を常時表示する。
     * 既定: '/__admin'
     */
    adminRoutePath?: string;
    /**
     * トリガーボタン（バグ記録ボタン）の画面端からのオフセット。
     * ボトムナビ等のある利用側アプリで、ボタンが重ならないよう位置をずらすために使用する。
     * 未指定時は safe-area-inset-bottom/right + 24px。
     */
    triggerOffset?: {
        bottom?: string | number;
        right?: string | number;
    };
}
/**
 * dev-tools のワンストップ統合コンポーネント。
 *
 * - `apiBaseUrl` を内部で `setDebugApiBaseUrl()` に渡す
 * - `logCapture` を内部生成
 * - `useDebugMode()` を購読し `DebugPanel`(PiP) をレンダ
 * - `adminRoutePath` 滞在中は強制的に PiP を表示
 *
 * 利用側は Routes の外（AppContent 直下等）に 1 つ置くだけで OK。
 * 管理ダッシュボードは従来通り `<Route path="/__admin" element={<DebugAdmin .../>} />` で別途配線する。
 */
export declare function DevTools({ apiBaseUrl, env, testCases, manualItems, manualDefaultPath, onManualNavigate, onManualAppNavigate, environmentsMd, onSave, initialSize, logCaptureConfig, disableLogCapture, adminRoutePath, triggerOffset, }: DevToolsProps): import("react/jsx-runtime").JSX.Element | null;
