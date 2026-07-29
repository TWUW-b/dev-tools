/**
 * リリースノートの取得と未読管理（@TWUWB-003）。
 *
 * ナビに「更新情報 ●3」のようなバッジを出せるよう、最後に見た号を localStorage に持つ。
 * 号の id は AUTOINCREMENT で単調増加するため、公開日ではなく id で新旧を判定する
 * （過去日付の号を後から足しても「未読」が湧かない）。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchReleaseNotesFeed } from '../utils/releaseNotesApi';
import type { ReleaseNote } from '../types';

const DEFAULT_STORAGE_KEY = 'devtools:release-notes:lastSeenId';

export interface UseReleaseNotesOptions {
  /** GET /release-notes/feed/{token} の URL */
  feedUrl: string;
  /** 未読管理のキー。同一オリジンに複数アプリを載せる場合に分ける */
  storageKey?: string;
  /** false の間は取得しない（表示前に読みたくない場合） */
  enabled?: boolean;
}

export interface UseReleaseNotesReturn {
  notes: ReleaseNote[];
  loading: boolean;
  error: string | null;
  /** 最後に見た号より新しい号の数 */
  unreadCount: number;
  /** 全部読んだことにする（バッジを消す） */
  markAllRead: () => void;
  refresh: () => void;
}

function readLastSeen(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw === null ? 0 : Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    // プライベートモード等で localStorage が使えなくても機能は止めない
    return 0;
  }
}

export function useReleaseNotes({
  feedUrl,
  storageKey = DEFAULT_STORAGE_KEY,
  enabled = true,
}: UseReleaseNotesOptions): UseReleaseNotesReturn {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSeenId, setLastSeenId] = useState<number>(() => readLastSeen(storageKey));
  const [reloadKey, setReloadKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !feedUrl) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchReleaseNotesFeed(feedUrl, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setNotes(data);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : '更新情報の取得に失敗しました');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [feedUrl, enabled, reloadKey]);

  const unreadCount = useMemo(
    () => notes.filter((n) => n.id > lastSeenId).length,
    [notes, lastSeenId],
  );

  const markAllRead = useCallback(() => {
    const maxId = notes.reduce((max, n) => (n.id > max ? n.id : max), 0);
    if (maxId <= lastSeenId) return;
    setLastSeenId(maxId);
    try {
      window.localStorage.setItem(storageKey, String(maxId));
    } catch {
      // 保存できなくてもバッジが再表示されるだけなので握りつぶす
    }
  }, [notes, lastSeenId, storageKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return { notes, loading, error, unreadCount, markAllRead, refresh };
}
