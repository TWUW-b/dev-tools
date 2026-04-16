/**
 * トリガーボタンのスタイルを生成
 * @param offset 利用側アプリのボトムナビ等を避けるためのオフセット
 */
export declare function getTriggerButtonStyle(offset?: {
    bottom?: string | number;
    right?: string | number;
}): React.CSSProperties;
/** 後方互換: 既定オフセットでのトリガーボタンスタイル */
export declare const triggerButtonStyle: React.CSSProperties;
/** フォールバック用スタイル */
export declare const fallbackStyles: Record<string, React.CSSProperties>;
/**
 * `.debug-*` クラス系スタイル（PiP / fallback 両対応）
 * 利用側アプリに注入しても `.debug-*` プレフィックス付きクラスのみなので副作用なし
 */
export declare function getPanelStyles(): string;
/**
 * PiPウィンドウ用スタイル（PIP_RESET + panel 全部）
 */
export declare function getPipStyles(): string;
