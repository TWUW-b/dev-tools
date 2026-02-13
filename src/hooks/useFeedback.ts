import { useState, useCallback, useRef, useEffect } from 'react';
import { postFeedback } from '../utils/feedbackApi';
import type { Feedback, FeedbackInput, ConsoleLogEntry, NetworkLogEntry } from '../types';

export interface UseFeedbackOptions {
  apiBaseUrl: string;
  userType?: string;
  appVersion?: string;
}

export interface UseFeedbackReturn {
  submitting: boolean;
  error: Error | null;
  submitFeedback: (
    input: FeedbackInput,
    logs?: { consoleLogs?: ConsoleLogEntry[]; networkLogs?: NetworkLogEntry[] },
  ) => Promise<{ data: Feedback | null; error: Error | null }>;
}

export function useFeedback(options: UseFeedbackOptions): UseFeedbackReturn {
  const { apiBaseUrl, userType, appVersion } = options;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const submitFeedback = useCallback(
    async (
      input: FeedbackInput,
      logs?: { consoleLogs?: ConsoleLogEntry[]; networkLogs?: NetworkLogEntry[] },
    ): Promise<{ data: Feedback | null; error: Error | null }> => {
      setSubmitting(true);
      setError(null);

      try {
        const environment = typeof window !== 'undefined' ? {
          // navigator.platform は deprecated だが、userAgentData 未対応ブラウザへのフォールバックとして残す
          os: (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? 'unknown',
          browser: navigator.userAgent,
          screen: `${screen.width}x${screen.height}`,
          language: navigator.language,
        } : undefined;

        const body: Record<string, unknown> = {
          kind: input.kind,
          message: input.message,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          userType,
          appVersion,
          environment,
        };

        if (input.target) {
          body.target = input.target;
        }

        if (logs?.consoleLogs) {
          body.consoleLogs = logs.consoleLogs;
        }
        if (logs?.networkLogs) {
          body.networkLogs = logs.networkLogs;
        }

        const result = await postFeedback({ apiBaseUrl, body });
        if (mountedRef.current) {
          setSubmitting(false);
        }
        return { data: result, error: null };
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(e);
          setSubmitting(false);
        }
        return { data: null, error: e };
      }
    },
    [apiBaseUrl, userType, appVersion]
  );

  return { submitting, error, submitFeedback };
}
