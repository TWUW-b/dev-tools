import type {
  LogCaptureConfig,
  LogCaptureInstance,
  ConsoleLogConfig,
  NetworkLogConfig,
  ConsoleLogEntry,
  NetworkLogEntry,
} from '../types';
import { maskSensitive } from './maskSensitive';

const DEFAULT_CONSOLE: ConsoleLogConfig = {
  maxErrorEntries: 30,
  maxLogEntries: 30,
};

const DEFAULT_NETWORK_MAX_ENTRIES = 30;
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];

let activeInstance: LogCaptureInstance | null = null;

/**
 * ログキャプチャを初期化
 * アプリ起動時に呼び出し、DebugPanelに渡す
 *
 * 既にインスタンスが存在する場合は自動で destroy してから新規作成する。
 * これにより monkey-patch の破損を防ぐ。
 */
export function createLogCapture(config: LogCaptureConfig): LogCaptureInstance {
  // SSR ガード: window がない環境ではno-opインスタンスを返す
  if (typeof window === 'undefined') {
    return {
      getConsoleLogs: () => [],
      getNetworkLogs: () => [],
      clear: () => {},
      destroy: () => {},
    };
  }

  // 既存インスタンスを安全に破棄（monkey-patch 破損防止）
  if (activeInstance) {
    activeInstance.destroy();
  }

  const errorLogs: ConsoleLogEntry[] = [];
  const generalLogs: ConsoleLogEntry[] = [];
  const networkLogs: NetworkLogEntry[] = [];
  const cleanups: Array<() => void> = [];

  // --- Console Capture ---
  if (config.console) {
    const consoleConfig: ConsoleLogConfig =
      config.console === true ? DEFAULT_CONSOLE : config.console;

    const errorMax = consoleConfig.maxErrorEntries ?? DEFAULT_CONSOLE.maxErrorEntries!;
    const logMax = consoleConfig.maxLogEntries ?? DEFAULT_CONSOLE.maxLogEntries!;

    const originalMethods: Partial<Record<string, (...args: unknown[]) => void>> = {};
    const levels: Array<'error' | 'warn' | 'log'> = ['error', 'warn', 'log'];

    for (const level of levels) {
      const original = console[level as keyof Console] as (...args: unknown[]) => void;
      originalMethods[level] = original;

      (console as unknown as Record<string, unknown>)[level] = (...args: unknown[]) => {
        const message = args.map(a => {
          if (typeof a === 'object') {
            try { return JSON.stringify(a); }
            catch { return String(a); }
          }
          return String(a);
        }).join(' ');

        if (!consoleConfig.filter || consoleConfig.filter(message)) {
          const entry: ConsoleLogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: maskSensitive(message),
          };
          if (level === 'error') {
            if (errorLogs.length >= errorMax) errorLogs.shift();
            errorLogs.push(entry);
          } else {
            if (generalLogs.length >= logMax) generalLogs.shift();
            generalLogs.push(entry);
          }
        }

        original.apply(console, args);
      };
    }

    // window.onerror
    const onError = (event: ErrorEvent) => {
      if (errorLogs.length >= errorMax) errorLogs.shift();
      errorLogs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: maskSensitive(event.message),
        stack: event.error?.stack,
      });
    };
    window.addEventListener('error', onError);

    // unhandledrejection
    const onRejection = (event: PromiseRejectionEvent) => {
      if (errorLogs.length >= errorMax) errorLogs.shift();
      errorLogs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: maskSensitive(`Unhandled Promise Rejection: ${event.reason}`),
        stack: event.reason?.stack,
      });
    };
    window.addEventListener('unhandledrejection', onRejection);

    cleanups.push(() => {
      for (const [level, original] of Object.entries(originalMethods)) {
        if (original) (console as unknown as Record<string, unknown>)[level] = original;
      }
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    });
  }

  // --- Network Capture ---
  if (config.network) {
    const networkConfig: NetworkLogConfig = Array.isArray(config.network)
      ? { include: config.network }
      : config.network;
    const maxEntries = networkConfig.maxEntries ?? DEFAULT_NETWORK_MAX_ENTRIES;

    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input
        : input instanceof URL ? input.href
        : input.url;

      let shouldCapture: boolean;
      try {
        shouldCapture = matchesPatterns(url, networkConfig.include, networkConfig.exclude);
      } catch {
        return originalFetch(input, init);
      }
      if (!shouldCapture) {
        return originalFetch(input, init);
      }

      const start = performance.now();
      try {
        const response = await originalFetch(input, init);
        const duration = Math.round(performance.now() - start);

        if (!networkConfig.errorOnly || !response.ok) {
          const entry: NetworkLogEntry = {
            timestamp: new Date().toISOString(),
            method: init?.method || 'GET',
            url,
            status: response.status,
            duration,
          };

          // 常にbodyを取得（フィルタはDebugPanel側で行う）
          if (init?.body) {
            try { entry.requestBody = JSON.parse(String(init.body)); }
            catch { entry.requestBody = String(init.body); }
          }

          try { entry.responseBody = await response.clone().json(); }
          catch { /* non-JSON response */ }

          if (networkConfig.captureHeaders) {
            entry.requestHeaders = maskHeaders(
              Object.fromEntries(new Headers(init?.headers).entries())
            );
            entry.responseHeaders = maskHeaders(
              Object.fromEntries(response.headers.entries())
            );
          }

          if (networkLogs.length >= maxEntries) networkLogs.shift();
          networkLogs.push(entry);
        }

        return response;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        if (networkLogs.length >= maxEntries) networkLogs.shift();
        networkLogs.push({
          timestamp: new Date().toISOString(),
          method: init?.method || 'GET',
          url,
          status: 0,
          duration,
        });
        throw err;
      }
    };

    cleanups.push(() => {
      window.fetch = originalFetch;
    });
  }

  const instance: LogCaptureInstance = {
    getConsoleLogs: () => [...errorLogs, ...generalLogs].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    ),
    getNetworkLogs: () => [...networkLogs],
    clear: () => {
      errorLogs.length = 0;
      generalLogs.length = 0;
      networkLogs.length = 0;
    },
    destroy: () => {
      cleanups.forEach(fn => fn());
      errorLogs.length = 0;
      generalLogs.length = 0;
      networkLogs.length = 0;
      if (activeInstance === instance) {
        activeInstance = null;
      }
    },
  };

  activeInstance = instance;
  return instance;
}

/** URLパターンマッチ（簡易glob） */
function matchesPatterns(url: string, include: string[], exclude?: string[]): boolean {
  const parsed = new URL(url, window.location.origin);
  const path = parsed.pathname;
  const fullUrl = parsed.href;

  const matchTarget = (pattern: string) => {
    // パターンが http(s) で始まる場合はフルURL比較
    if (pattern.startsWith('http://') || pattern.startsWith('https://')) {
      return globMatch(fullUrl, pattern);
    }
    return globMatch(path, pattern);
  };

  const matches = include.some(matchTarget);
  if (!matches) return false;
  if (exclude?.some(matchTarget)) return false;
  return true;
}

/** 簡易globマッチ（** = 任意パス） */
function globMatch(str: string, pattern: string): boolean {
  const regex = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '___DOUBLE___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE___/g, '.*');
  return new RegExp(`^${regex}$`).test(str);
}

/** 機密ヘッダーをマスク */
function maskHeaders(headers: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    masked[key] = SENSITIVE_HEADERS.includes(key.toLowerCase())
      ? '***MASKED***'
      : value;
  }
  return masked;
}
