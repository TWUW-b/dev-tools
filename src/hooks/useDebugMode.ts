import { useState, useEffect } from 'react';
import type { UseDebugModeReturn } from '../types';

const STORAGE_KEY = 'debug-notes-mode';

/**
 * デバッグモード検出フック
 *
 * - localStorage に保持（ブラウザを閉じても維持、再度3連打で解除）
 * - z キーを 500ms 以内に 3回連打でトグル
 * - #debug ハッシュでも有効化（localStorage に保存）
 * - 他タブでの変更を storage イベントで同期
 */
export function useDebugMode(): UseDebugModeReturn {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem(STORAGE_KEY) === '1') return true;
    if (window.location.hash === '#debug') {
      localStorage.setItem(STORAGE_KEY, '1');
      return true;
    }
    return false;
  });

  useEffect(() => {
    // #debug ハッシュでのアクセス時にlocalStorageに保存
    if (window.location.hash === '#debug' && !isDebugMode) {
      localStorage.setItem(STORAGE_KEY, '1');
      setIsDebugMode(true);
    }

    // z×3 / 500ms 検知
    const REQUIRED = 3;
    const WINDOW = 400;
    let presses: number[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      if (e.key.toLowerCase() !== 'z') { presses = []; return; }

      const now = Date.now();
      presses.push(now);
      presses = presses.filter(t => now - t < WINDOW);

      if (presses.length >= REQUIRED) {
        presses = [];
        setIsDebugMode(prev => {
          const next = !prev;
          if (next) {
            localStorage.setItem(STORAGE_KEY, '1');
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
          // 他タブへ通知
          window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: next ? '1' : null,
          }));
          return next;
        });
      }
    };

    // 他タブでの変更を検知
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setIsDebugMode(e.newValue === '1');
      }
    };

    // hashchange でも検知（URL直接変更時）
    const handleHashChange = () => {
      if (window.location.hash === '#debug') {
        localStorage.setItem(STORAGE_KEY, '1');
        setIsDebugMode(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isDebugMode]);

  return { isDebugMode };
}
