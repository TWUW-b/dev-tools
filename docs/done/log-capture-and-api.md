# ログキャプチャ・API拡張・ドキュメント更新

## 変更一覧

| # | 変更内容 | 影響範囲 | DB変更 |
|---|---------|---------|--------|
| 1 | DBスキーマv2（console_log, network_log, environment カラム追加） | Database.php | あり |
| 2 | `createLogCapture` — console/networkバッファリング | 新規モジュール | なし |
| 3 | `GET /notes/{id}` 詳細エンドポイント追加 | API | なし |
| 4 | `GET /notes` 一覧からログ系カラム除外 | API | なし |
| 5 | createNote APIでログ系カラム受付 | API, api.ts, 型 | なし |
| 6 | environment 自動付与 | DebugPanel | なし |
| 7 | 手動ログのラベル変更（「ログ」→「補足」） | DebugPanel | なし |
| 8 | ドキュメント更新 | setup.md, usage.md, requirement.md, pip-implementation.md | なし |

---

## 1. DBスキーマv2

### マイグレーション

**`api/Database.php`** — `initSchema()` に追加

```php
if ((int)$version < 2) {
    $this->pdo->exec('ALTER TABLE notes ADD COLUMN console_log TEXT');
    $this->pdo->exec('ALTER TABLE notes ADD COLUMN network_log TEXT');
    $this->pdo->exec('ALTER TABLE notes ADD COLUMN environment TEXT');
    $this->pdo->exec("UPDATE meta SET value = '2' WHERE key = 'schemaVersion'");
}
```

### カラム定義

| カラム | 型 | 内容 |
|--------|-----|------|
| `console_log` | TEXT (JSON) | `ConsoleLogEntry[]` |
| `network_log` | TEXT (JSON) | `NetworkLogEntry[]` |
| `environment` | TEXT (JSON) | `EnvironmentInfo` |

既存行は全てNULL。後方互換性の問題なし。

---

## 2. `createLogCapture` — ログバッファリングモジュール

### 方針
- アプリ起動時に初期化し、DebugPanelマウント前からキャプチャ開始
- メモリ上のリングバッファに保持
- DebugPanelはバッファへの参照を受け取るだけ

### 型定義

**`src/types/index.ts`** — 追加

```ts
/** Console ログエントリ */
export interface ConsoleLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'log' | 'info';
  message: string;
  stack?: string;
}

/** Network ログエントリ */
export interface NetworkLogEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestBody?: unknown;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

/** 環境情報 */
export interface EnvironmentInfo {
  userAgent: string;
  viewport: string;
  url: string;
  timestamp: string;
}

/** Console キャプチャ設定 */
export interface ConsoleLogConfig {
  levels?: Array<'error' | 'warn' | 'log' | 'info'>;
  filter?: (message: string) => boolean;
  maxEntries?: number;
}

/** Network キャプチャ設定 */
export interface NetworkLogConfig {
  include: string[];
  exclude?: string[];
  errorOnly?: boolean;
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
  captureHeaders?: boolean;
  maxEntries?: number;
}

/** LogCapture 設定 */
export interface LogCaptureConfig {
  console?: boolean | ConsoleLogConfig;
  network?: string[] | NetworkLogConfig;
}

/** LogCapture インスタンス */
export interface LogCaptureInstance {
  getConsoleLogs: () => ConsoleLogEntry[];
  getNetworkLogs: () => NetworkLogEntry[];
  clear: () => void;
  destroy: () => void;
}
```

### 実装

**`src/utils/logCapture.ts`** — 新規ファイル

```ts
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
  levels: ['error', 'warn'],
  maxEntries: 50,
};

const DEFAULT_NETWORK_MAX_ENTRIES = 30;
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];

/**
 * ログキャプチャを初期化
 * アプリ起動時に呼び出し、DebugPanelに渡す
 */
export function createLogCapture(config: LogCaptureConfig): LogCaptureInstance {
  const consoleLogs: ConsoleLogEntry[] = [];
  const networkLogs: NetworkLogEntry[] = [];
  const cleanups: Array<() => void> = [];

  // --- Console Capture ---
  if (config.console) {
    const consoleConfig: ConsoleLogConfig =
      config.console === true ? DEFAULT_CONSOLE : { ...DEFAULT_CONSOLE, ...config.console };
    const maxEntries = consoleConfig.maxEntries ?? 50;

    const originalMethods: Partial<Record<string, (...args: unknown[]) => void>> = {};
    const levels = consoleConfig.levels ?? ['error', 'warn'];

    for (const level of levels) {
      const original = console[level as keyof Console] as (...args: unknown[]) => void;
      originalMethods[level] = original;

      (console as Record<string, unknown>)[level] = (...args: unknown[]) => {
        const message = args.map(a =>
          typeof a === 'object' ? JSON.stringify(a) : String(a)
        ).join(' ');

        if (!consoleConfig.filter || consoleConfig.filter(message)) {
          if (consoleLogs.length >= maxEntries) consoleLogs.shift();
          consoleLogs.push({
            timestamp: new Date().toISOString(),
            level: level as ConsoleLogEntry['level'],
            message: maskSensitive(message),
          });
        }

        original.apply(console, args);
      };
    }

    // window.onerror
    const onError = (event: ErrorEvent) => {
      if (consoleLogs.length >= maxEntries) consoleLogs.shift();
      consoleLogs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: maskSensitive(event.message),
        stack: event.error?.stack,
      });
    };
    window.addEventListener('error', onError);

    // unhandledrejection
    const onRejection = (event: PromiseRejectionEvent) => {
      if (consoleLogs.length >= maxEntries) consoleLogs.shift();
      consoleLogs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: maskSensitive(`Unhandled Promise Rejection: ${event.reason}`),
        stack: event.reason?.stack,
      });
    };
    window.addEventListener('unhandledrejection', onRejection);

    cleanups.push(() => {
      for (const [level, original] of Object.entries(originalMethods)) {
        if (original) (console as Record<string, unknown>)[level] = original;
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

      if (!matchesPatterns(url, networkConfig.include, networkConfig.exclude)) {
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

          if (networkConfig.captureRequestBody && init?.body) {
            try { entry.requestBody = JSON.parse(String(init.body)); }
            catch { entry.requestBody = String(init.body); }
          }

          if (networkConfig.captureResponseBody) {
            try { entry.responseBody = await response.clone().json(); }
            catch { /* non-JSON response */ }
          }

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

  return {
    getConsoleLogs: () => [...consoleLogs],
    getNetworkLogs: () => [...networkLogs],
    clear: () => {
      consoleLogs.length = 0;
      networkLogs.length = 0;
    },
    destroy: () => {
      cleanups.forEach(fn => fn());
      consoleLogs.length = 0;
      networkLogs.length = 0;
    },
  };
}

/** URLパターンマッチ（簡易glob） */
function matchesPatterns(url: string, include: string[], exclude?: string[]): boolean {
  const path = new URL(url, window.location.origin).pathname;
  const matches = include.some(pattern => globMatch(path, pattern));
  if (!matches) return false;
  if (exclude?.some(pattern => globMatch(path, pattern))) return false;
  return true;
}

/** 簡易globマッチ（** = 任意パス） */
function globMatch(str: string, pattern: string): boolean {
  const regex = pattern
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
```

### エクスポート

**`src/index.ts`** — 追加
```ts
export { createLogCapture } from './utils/logCapture';
```

### 利用例

```ts
// main.tsx（アプリ起動時）
import { createLogCapture } from 'debug-notes';

const logCapture = createLogCapture({
  console: true,                    // デフォルト: error + warn, 50件
  network: ['/api/**'],             // /api/ 配下, デフォルト設定
});

// App.tsx
<DebugPanel
  apiBaseUrl="/api"
  env="dev"
  logCapture={logCapture}
/>
```

```ts
// 細かい設定
const logCapture = createLogCapture({
  console: {
    levels: ['error', 'warn', 'log'],
    filter: (msg) => !msg.includes('[HMR]'),
    maxEntries: 100,
  },
  network: {
    include: ['/api/**'],
    exclude: ['/api/health'],
    errorOnly: false,
    captureRequestBody: true,
    captureResponseBody: true,
    captureHeaders: true,
    maxEntries: 50,
  },
});
```

---

## 3. `GET /notes/{id}` 詳細エンドポイント追加

### API

**`api/NotesController.php`** — メソッド追加
```php
/**
 * 詳細取得
 */
public function show(int $id): array
{
    $note = $this->db->fetchOne(
        'SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL',
        [$id]
    );

    if (!$note) {
        return ['success' => false, 'error' => 'Note not found'];
    }

    // JSON文字列をデコード
    if ($note['console_log']) {
        $note['console_log'] = json_decode($note['console_log'], true);
    }
    if ($note['network_log']) {
        $note['network_log'] = json_decode($note['network_log'], true);
    }
    if ($note['environment']) {
        $note['environment'] = json_decode($note['environment'], true);
    }
    if ($note['steps']) {
        $note['steps'] = json_decode($note['steps'], true);
    }

    return [
        'success' => true,
        'note' => $note,
    ];
}
```

**`api/index.php`** — ルート追加（DELETE の前に配置）
```php
// GET /notes/{id}
if ($method === 'GET' && preg_match('#^/notes/(\d+)/?$#', $relativePath, $matches)) {
    $id = (int) $matches[1];
    $result = $controller->show($id);
    if (!$result['success']) {
        http_response_code(404);
    }
    echo json_encode($result);
    exit;
}
```

### フロントエンド

**`src/utils/api.ts`** — メソッド追加
```ts
/**
 * ノート詳細を取得
 */
async getNote(env: Environment, id: number): Promise<Note> {
  const response = await fetch(`${apiBaseUrl}/notes/${id}?env=${env}`);
  const data: NotesResponse = await response.json();

  if (!data.success || !data.note) {
    throw new Error(data.error || 'Failed to fetch note');
  }

  return data.note;
},
```

---

## 4. `GET /notes` 一覧からログ系カラム除外

### API

**`api/NotesController.php`** — `index` メソッド修正

```php
// 変更前
$sql = 'SELECT * FROM notes WHERE 1=1';

// 変更後
$sql = 'SELECT id, route, screen_name, title, content, user_log, steps, severity, status, deleted_at, created_at FROM notes WHERE 1=1';
```

`console_log`, `network_log`, `environment` を明示的に除外。
一覧では不要な重いデータを返さない。

---

## 5. createNote APIでログ系カラム受付

### API

**`api/NotesController.php`** — `create` メソッド修正

```php
// 変更前
$this->db->execute(
    'INSERT INTO notes (route, screen_name, title, content, user_log, steps, severity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [...]
);

// 変更後
$this->db->execute(
    'INSERT INTO notes (route, screen_name, title, content, user_log, steps, severity, status, console_log, network_log, environment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
        $input['route'] ?? '',
        $input['screenName'] ?? '',
        $input['title'],
        $input['content'],
        $input['userLog'] ?? null,
        $steps,
        $input['severity'] ?? null,
        in_array($input['status'] ?? '', ['open', 'verified'], true)
            ? $input['status']
            : 'open',
        !empty($input['consoleLogs']) ? json_encode($input['consoleLogs'], JSON_UNESCAPED_UNICODE) : null,
        !empty($input['networkLogs']) ? json_encode($input['networkLogs'], JSON_UNESCAPED_UNICODE) : null,
        !empty($input['environment']) ? json_encode($input['environment'], JSON_UNESCAPED_UNICODE) : null,
    ]
);
```

### 型定義

**`src/types/index.ts`** — `NoteInput` 修正

```ts
export interface NoteInput {
  title: string;
  content: string;
  userLog?: string;
  steps?: string[];
  severity?: Severity;
  route?: string;
  screenName?: string;
  status?: 'open' | 'verified';
  consoleLogs?: ConsoleLogEntry[];    // 追加
  networkLogs?: NetworkLogEntry[];    // 追加
  environment?: EnvironmentInfo;      // 追加
}
```

**`src/types/index.ts`** — `Note` 修正

```ts
export interface Note {
  id: number;
  route: string;
  screen_name: string;
  title: string;
  content: string;
  user_log: string | null;
  steps: string | null;
  severity: Severity | null;
  status: Status;
  deleted_at: string | null;
  created_at: string;
  console_log: ConsoleLogEntry[] | null;    // 追加
  network_log: NetworkLogEntry[] | null;    // 追加
  environment: EnvironmentInfo | null;      // 追加
}
```

### api.ts

**`src/utils/api.ts`** — `createNote` 修正

```ts
body: JSON.stringify({
  title: input.title,
  content: input.content,
  userLog: input.userLog || null,
  steps: input.steps || null,
  severity: input.severity || null,
  route: input.route || (window.location.pathname + window.location.search + window.location.hash),
  screenName: input.screenName || document.title,
  status: input.status || 'open',
  consoleLogs: input.consoleLogs || null,     // 追加
  networkLogs: input.networkLogs || null,     // 追加
  environment: input.environment || null,     // 追加
}),
```

### DebugPanel — 保存時にログを自動添付

**`src/components/DebugPanel.tsx`** — `handleSave` 修正

```ts
const handleSave = useCallback(async () => {
  if (!content.trim()) {
    setMessage({ type: 'error', text: '内容は必須です' });
    return;
  }

  setSaving(true);
  setMessage(null);

  const firstLine = content.trim().split('\n')[0];
  const autoTitle = firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine;

  const stepsArray = steps.trim()
    ? steps.trim().split('\n').filter(s => s.trim())
    : undefined;

  const input: NoteInput = {
    title: autoTitle,
    content: content.trim(),
    userLog: userLog ? maskSensitive(userLog) : undefined,
    severity: severity || undefined,
    steps: stepsArray,
    // ログキャプチャから自動添付
    consoleLogs: logCapture?.getConsoleLogs(),
    networkLogs: logCapture?.getNetworkLogs(),
    environment: {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
  };

  const note = await createNote(input);
  // ...以下既存
}, [content, userLog, severity, steps, createNote, onSave, resetForm, logCapture]);
```

### DebugPanelProps

**`src/types/index.ts`** — 修正

```ts
export interface DebugPanelProps {
  apiBaseUrl?: string;
  env?: Environment;
  onSave?: (note: Note) => void;
  onClose?: () => void;
  initialSize?: { width: number; height: number };
  testCases?: TestCase[];
  logCapture?: LogCaptureInstance;  // 追加
}
```

---

## 6. environment 自動付与

#5 の `handleSave` 内で自動生成。設定不要。

```ts
environment: {
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  url: window.location.href,
  timestamp: new Date().toISOString(),
}
```

DebugAdmin の詳細ビューに environment セクションを追加して表示。

---

## 7. 手動ログのラベル変更

**`src/components/DebugPanel.tsx`**

```tsx
// 変更前
<label htmlFor="debug-log">ログ（任意）</label>
<textarea placeholder="エラーログやコンソール出力" />

// 変更後
<label htmlFor="debug-log">補足メモ（任意）</label>
<textarea placeholder="状況や気づいたことを自由に記入" />
```

`getPipStyles()` 内のクラス名変更は不要（`debug-log` IDはそのまま）。

---

## 8. ドキュメント更新

### `docs/requirement.md`
追記内容:
- ログ自動キャプチャ機能（console, network）
- `createLogCapture` によるアプリ起動時初期化
- environment 自動付与
- DBスキーマv2（console_log, network_log, environment）
- `GET /notes/{id}` 詳細API
- テストフロータブ（verified ステータス）
- テストケースMDインポート

### `docs/setup.md`
追記内容:
- `createLogCapture` の初期化方法
- `logCapture` props の渡し方
- logCapture 設定オプション一覧（console, network）
- テストケースMDの作成方法とフォーマット

### `docs/usage.md`
追記内容:
- ログキャプチャの利用フロー
- PiP 3タブの操作方法（記録/管理/テスト）
- テストフローの操作手順
- 管理画面の新機能（severity編集、verifiedフィルタ）

### `docs/pip-implementation.md`
追記内容:
- 3タブ構成の仕様
- 管理タブ（openのみ、Fixedボタン）
- テストタブ（チェックリスト、問題なし/バグ報告）
- logCapture 連携

---

## 実装順序

```
1. DBスキーマv2（#1）
2. createLogCapture モジュール（#2）
3. GET /notes/{id} 詳細API（#3）
4. GET /notes 一覧からログ除外（#4）
5. createNote APIでログ受付（#5）
6. DebugPanel にlogCapture連携 + environment自動付与（#6）
7. 手動ログのラベル変更（#7）
8. ドキュメント更新（#8）
```

#1 が全ての前提。#2 はフロントエンド単独で進められる。#3〜#5 はAPI層で並行可能。
