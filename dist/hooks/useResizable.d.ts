export interface UseResizableOptions {
    /** 初期サイズ（px） */
    defaultSize: number;
    /** 最小サイズ（px） */
    minSize: number;
    /** 最大サイズ（px） */
    maxSize: number;
    /** リサイズ方向。デフォルト: 'horizontal' */
    direction?: 'horizontal' | 'vertical';
    /** 隣接ペインの最小サイズ（px）デフォルト: 300 */
    minAdjacentSize?: number;
    /** 無効時はイベントリスナー・カーソル変更などの副作用を抑止する。デフォルト: true */
    enabled?: boolean;
}
export interface UseResizableReturn {
    /** 現在のサイズ */
    size: number;
    /** ドラッグ中か */
    isResizing: boolean;
    /** リサイズハンドルの mousedown ハンドラ */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** リサイズハンドルの keydown ハンドラ（矢印キーによるサイズ変更） */
    handleKeyDown: (e: React.KeyboardEvent) => void;
}
/**
 * リサイズ用hook
 *
 * horizontal: 右サイドバーを想定（左へドラッグ = 幅拡大）
 * vertical: 下パネルを想定（上へドラッグ = 高さ拡大）
 */
export declare function useResizable(options: UseResizableOptions): UseResizableReturn;
