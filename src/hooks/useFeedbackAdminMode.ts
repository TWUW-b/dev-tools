import { useState, useEffect } from 'react';

function checkAdminParam(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('feedback') === 'admin';
}

/**
 * URLパラメータ ?feedback=admin を検知する hook
 *
 * popstate + pushState/replaceState の両方を監視する。
 */
export function useFeedbackAdminMode(): boolean {
  const [isAdmin, setIsAdmin] = useState(checkAdminParam);

  useEffect(() => {
    const update = () => setIsAdmin(checkAdminParam());

    // pushState / replaceState をラップして変更を検知
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState(...args);
      update();
    };
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState(...args);
      update();
    };

    window.addEventListener('popstate', update);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', update);
    };
  }, []);

  return isAdmin;
}
