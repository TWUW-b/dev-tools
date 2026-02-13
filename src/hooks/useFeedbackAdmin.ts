import { useState, useEffect, useCallback } from 'react';
import { getFeedbacks, updateFeedbackStatus, deleteFeedback } from '../utils/feedbackApi';
import type { Feedback, FeedbackKind, FeedbackTarget, FeedbackStatus } from '../types';

export interface UseFeedbackAdminOptions {
  apiBaseUrl: string;
  adminKey: string;
}

export interface FeedbackFilters {
  status: FeedbackStatus | '';
  kind: FeedbackKind | '';
  target: FeedbackTarget | '';
  customTag: string;
}

export interface UseFeedbackAdminReturn {
  feedbacks: Feedback[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: Error | null;
  filters: FeedbackFilters;
  customTags: string[];
  setFilters: (filters: Partial<FeedbackFilters>) => void;
  setPage: (page: number) => void;
  updateStatus: (id: number, status: FeedbackStatus) => Promise<boolean>;
  remove: (id: number) => Promise<boolean>;
  refresh: () => void;
}

export function useFeedbackAdmin(options: UseFeedbackAdminOptions): UseFeedbackAdminReturn {
  const { apiBaseUrl, adminKey } = options;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<FeedbackFilters>({
    status: '',
    kind: '',
    target: '',
    customTag: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const setFilters = useCallback((partial: Partial<FeedbackFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const query: Record<string, string> = { page: String(page) };
    if (filters.status) query.status = filters.status;
    if (filters.kind) query.kind = filters.kind;
    if (filters.target) query.target = filters.target;
    if (filters.customTag) query.custom_tag = filters.customTag;

    getFeedbacks({ apiBaseUrl, adminKey, query, signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        setFeedbacks(result.data);
        setTotal(result.total);
        setLimit(result.limit);
        setCustomTags(result.customTags);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => { controller.abort(); };
  }, [apiBaseUrl, adminKey, page, filters, refreshKey]);

  const updateStatusFn = useCallback(
    async (id: number, status: FeedbackStatus): Promise<boolean> => {
      try {
        await updateFeedbackStatus({ apiBaseUrl, adminKey, id, status });
        refresh();
        return true;
      } catch {
        return false;
      }
    },
    [apiBaseUrl, adminKey, refresh]
  );

  const removeFn = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await deleteFeedback({ apiBaseUrl, adminKey, id });
        refresh();
        return true;
      } catch {
        return false;
      }
    },
    [apiBaseUrl, adminKey, refresh]
  );

  return {
    feedbacks, total, page, limit, loading, error, filters, customTags,
    setFilters, setPage,
    updateStatus: updateStatusFn,
    remove: removeFn,
    refresh,
  };
}
