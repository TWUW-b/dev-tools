import { useState, useCallback, useEffect, useRef } from 'react';

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
export function useResizable(options: UseResizableOptions): UseResizableReturn {
  const { defaultSize, minSize, maxSize, direction = 'horizontal', minAdjacentSize = 300, enabled = true } = options;

  const isVertical = direction === 'vertical';

  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);
  const sizeRef = useRef(size);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      e.preventDefault();
      startPosRef.current = isVertical ? e.clientY : e.clientX;
      startSizeRef.current = sizeRef.current;
      setIsResizing(true);
    },
    [isVertical, enabled]
  );

  useEffect(() => {
    if (!isResizing || !enabled) return;

    const cursor = isVertical ? 'row-resize' : 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      const clientPos = isVertical ? e.clientY : e.clientX;
      const delta = startPosRef.current - clientPos;
      const viewportSize = isVertical ? window.innerHeight : window.innerWidth;
      const effectiveMax = Math.min(maxSize, viewportSize - minAdjacentSize);
      const newSize = Math.max(minSize, Math.min(effectiveMax, startSizeRef.current + delta));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isVertical, minSize, maxSize, minAdjacentSize, enabled]);

  const KEYBOARD_STEP = 10;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled) return;
      // horizontal: ArrowLeft=拡大, ArrowRight=縮小
      // vertical: ArrowUp=拡大, ArrowDown=縮小
      const expandKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const shrinkKey = isVertical ? 'ArrowDown' : 'ArrowRight';

      if (e.key !== expandKey && e.key !== shrinkKey) return;
      e.preventDefault();

      const delta = e.key === expandKey ? KEYBOARD_STEP : -KEYBOARD_STEP;
      setSize(prev => {
        const viewportSize = isVertical ? window.innerHeight : window.innerWidth;
        const effectiveMax = Math.min(maxSize, viewportSize - minAdjacentSize);
        return Math.max(minSize, Math.min(effectiveMax, prev + delta));
      });
    },
    [isVertical, enabled, minSize, maxSize, minAdjacentSize]
  );

  return { size, isResizing, handleMouseDown, handleKeyDown };
}
