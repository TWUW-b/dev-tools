import { useState, useEffect, useCallback, useRef } from 'react';
import type { UseManualLoaderReturn } from '../types';

/**
 * MD ファイル読み込みフック
 *
 * @param path MDファイルへのパス
 */
export function useManualLoader(path: string | null): UseManualLoaderReturn {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!path) {
      setContent(null);
      setLoading(false);
      setError(null);
      return;
    }

    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(path, { signal: abortController.signal });

        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
        }

        let text = await response.text();

        // app: プロトコルを #app: に変換（react-markdownが削除するのを防ぐ）
        // [text](app:/path) → [text](#app:/path)
        text = text.replace(/\]\(app:/g, '](#app:');

        if (!abortController.signal.aborted) {
          setContent(text);
          setLoading(false);
        }
      } catch (err) {
        if (abortController.signal.aborted) {
          return;
        }

        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        setError(err instanceof Error ? err : new Error(String(err)));
        setContent(null);
        setLoading(false);
      }
    };

    loadContent();

    // クリーンアップ: コンポーネントアンマウント時にリクエストをキャンセル
    return () => {
      abortController.abort();
    };
  }, [path, reloadTrigger]);

  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  return {
    content,
    loading,
    error,
    reload,
  };
}
