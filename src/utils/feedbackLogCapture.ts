import type { ConsoleLogEntry, NetworkLogEntry, FeedbackLogCapture, FeedbackLogCaptureConfig } from '../types';
import { maskSensitive } from './maskSensitive';

// デフォルト値定数
const DEFAULT_MAX_CONSOLE_LOGS = 15;
const DEFAULT_MAX_NETWORK_LOGS = 15;

// Singleton guard for StrictMode / HMR double-mount
let activeCapture: FeedbackLogCapture | null = null;
let activeCaptureRefCount = 0;

/**
 * フィードバック用ログキャプチャ
 *
 * console.log/warn/error と fetch をmonkey-patchし、
 * 直前N件をリングバッファで保持する。
 *
 * StrictMode対応: 二重マウントされた場合は同一インスタンスを返す。
 */
export function createFeedbackLogCapture(config?: FeedbackLogCaptureConfig): FeedbackLogCapture {
  // SSR guard
  if (typeof window === 'undefined') {
    return {
      getConsoleLogs: () => [],
      getNetworkLogs: () => [],
      clear: () => {},
      destroy: () => {},
    };
  }

  // If already active, return existing instance with ref counting
  if (activeCapture !== null) {
    activeCaptureRefCount++;
    const existing = activeCapture;
    return {
      getConsoleLogs: existing.getConsoleLogs,
      getNetworkLogs: existing.getNetworkLogs,
      clear: existing.clear,
      destroy: () => {
        activeCaptureRefCount = Math.max(0, activeCaptureRefCount - 1);
        if (activeCaptureRefCount === 0) {
          existing.destroy();
        }
      },
    };
  }

  const maxConsole = config?.maxConsoleLogs ?? DEFAULT_MAX_CONSOLE_LOGS;
  const maxNetwork = config?.maxNetworkLogs ?? DEFAULT_MAX_NETWORK_LOGS;
  const networkInclude = config?.networkInclude ?? null;
  const networkExclude = config?.networkExclude ?? null;

  // 2系統バッファ: error専用 + general（warn/log）
  const errorLogs: ConsoleLogEntry[] = [];
  const generalLogs: ConsoleLogEntry[] = [];
  const networkLogs: NetworkLogEntry[] = [];

  // --- Console capture ---
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  function captureConsole(level: ConsoleLogEntry['level'], args: unknown[]): void {
    const message = args.map(a => {
      try {
        return typeof a === 'string' ? a : JSON.stringify(a);
      } catch {
        return String(a);
      }
    }).join(' ');

    const entry: ConsoleLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: maskSensitive(message),
    };

    if (level === 'error' && args[0] instanceof Error && args[0].stack) {
      entry.stack = maskSensitive(args[0].stack);
    }

    // levelに応じて振り分け
    if (level === 'error') {
      errorLogs.push(entry);
      if (errorLogs.length > maxConsole) {
        errorLogs.shift();
      }
    } else {
      generalLogs.push(entry);
      if (generalLogs.length > maxConsole) {
        generalLogs.shift();
      }
    }
  }

  console.log = (...args: unknown[]) => { captureConsole('log', args); originalLog.apply(console, args); };
  console.warn = (...args: unknown[]) => { captureConsole('warn', args); originalWarn.apply(console, args); };
  console.error = (...args: unknown[]) => { captureConsole('error', args); originalError.apply(console, args); };

  // --- window.onerror ---
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    captureConsole('error', [String(message) + (source ? ` at ${source}:${lineno}:${colno}` : '')]);
    if (typeof originalOnError === 'function') {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // --- unhandledrejection ---
  const handleRejection = (e: PromiseRejectionEvent) => {
    captureConsole('error', [`Unhandled rejection: ${e.reason}`]);
  };
  window.addEventListener('unhandledrejection', handleRejection);

  // --- Fetch capture ---
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Include/Exclude判定
    const shouldCapture = (() => {
      // Excludeチェック（優先）- 前方一致で判定
      if (networkExclude && networkExclude.some(pattern => url.startsWith(pattern))) {
        return false;
      }
      // Includeチェック - 部分一致で判定
      if (networkInclude && !networkInclude.some(pattern => url.includes(pattern))) {
        return false;
      }
      return true;
    })();

    if (!shouldCapture) {
      return originalFetch.call(window, input, init);
    }

    const start = Date.now();
    try {
      const response = await originalFetch.call(window, input, init);
      networkLogs.push({
        timestamp: new Date().toISOString(),
        method: init?.method ?? 'GET',
        url: maskSensitive(url),
        status: response.status,
        duration: Date.now() - start,
      });
      if (networkLogs.length > maxNetwork) {
        networkLogs.shift();
      }
      return response;
    } catch (err) {
      networkLogs.push({
        timestamp: new Date().toISOString(),
        method: init?.method ?? 'GET',
        url: maskSensitive(url),
        status: 0,
        duration: Date.now() - start,
      });
      if (networkLogs.length > maxNetwork) {
        networkLogs.shift();
      }
      throw err;
    }
  };

  const capture: FeedbackLogCapture = {
    getConsoleLogs: () => {
      // errorLogs + generalLogs をマージしてtimestampでソート（最大30件）
      return [...errorLogs, ...generalLogs].sort((a, b) =>
        a.timestamp.localeCompare(b.timestamp)
      );
    },
    getNetworkLogs: () => [...networkLogs],
    clear: () => {
      errorLogs.length = 0;
      generalLogs.length = 0;
      networkLogs.length = 0;
    },
    destroy: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      window.onerror = originalOnError;
      window.removeEventListener('unhandledrejection', handleRejection);
      window.fetch = originalFetch;
      errorLogs.length = 0;
      generalLogs.length = 0;
      networkLogs.length = 0;
      activeCapture = null;
      activeCaptureRefCount = 0;
    },
  };

  activeCapture = capture;
  activeCaptureRefCount = 1;

  return capture;
}
