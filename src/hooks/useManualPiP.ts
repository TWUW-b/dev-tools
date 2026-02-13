import { useState, useCallback } from 'react';
import type { UseManualPiPReturn } from '../types';

/** 別タブ用のベースURL（呼び出し側で設定） */
let tabBaseUrl = '/manual';

/**
 * 別タブ用のベースURLを設定
 * @param url ベースURL（例: '/manual', '/docs/view'）
 */
export function setManualTabBaseUrl(url: string): void {
  tabBaseUrl = url;
}

/**
 * PiP / 別タブ 開閉状態管理フック
 */
export function useManualPiP(): UseManualPiPReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  const openPiP = useCallback((path: string) => {
    setCurrentPath(path);
    setIsOpen(true);
  }, []);

  const openTab = useCallback((path: string) => {
    // 別タブでマニュアルページを開く
    // NOTE: noopenerを削除して、子ウィンドウからwindow.openerでアクセス可能にする
    const url = `${tabBaseUrl}?path=${encodeURIComponent(path)}`;
    window.open(url, '_blank', 'noreferrer');
  }, []);

  const closePiP = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setPath = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  return {
    isOpen,
    currentPath,
    openPiP,
    openTab,
    closePiP,
    setPath,
  };
}
