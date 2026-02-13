# ログキャプチャ・UI再設計

## 概要

`docs/done/log-capture-and-api.md` の実装に対する追加変更。

- コンソールログのバッファ分離（error専用 + log/warn混合）
- ネットワークログの必須/オプション項目整理
- PiP記録タブのUI変更（再現手順削除、添付オプション追加）
- 環境変数による件数設定

---

## 変更一覧

| # | 変更内容 | 影響範囲 |
|---|---------|---------|
| 1 | コンソールログのバッファ分離 | logCapture.ts |
| 2 | ネットワークログの必須/オプション分離 | logCapture.ts, DebugPanel.tsx |
| 3 | 環境変数による件数設定 | logCapture.ts, ドキュメント |
| 4 | 記録タブUI変更（再現手順削除、添付オプション追加） | DebugPanel.tsx |
| 5 | 型定義更新 | types/index.ts |

---

## 1. コンソールログのバッファ分離

### 仕様

| バッファ | 含むレベル | 上限 | 環境変数 |
|----------|-----------|------|----------|
| errorLogs | `error` + `onerror` + `unhandledrejection` | 30件 | `VITE_DEBUG_ERROR_LOG_MAX` |
| generalLogs | `warn` + `log` | 30件 | `VITE_DEBUG_LOG_MAX` |

- 合計最大60件
- error は絶対に取りこぼさない
- log もなるべく取得
- warn は少ないので log と同じバッファで十分

### 実装変更

**`src/utils/logCapture.ts`**

```typescript
const DEFAULT_ERROR_MAX = 30;
const DEFAULT_LOG_MAX = 30;

export function createLogCapture(config: LogCaptureConfig): LogCaptureInstance {
  // バッファ分離
  const errorLogs: ConsoleLogEntry[] = [];   // error専用
  const generalLogs: ConsoleLogEntry[] = []; // warn + log

  const errorMax = config.console && typeof config.console === 'object'
    ? config.console.maxErrorEntries ?? DEFAULT_ERROR_MAX
    : DEFAULT_ERROR_MAX;

  const logMax = config.console && typeof config.console === 'object'
    ? config.console.maxLogEntries ?? DEFAULT_LOG_MAX
    : DEFAULT_LOG_MAX;

  // Console Capture
  if (config.console) {
    const levels: Array<'error' | 'warn' | 'log'> = ['error', 'warn', 'log'];

    for (const level of levels) {
      const original = console[level] as (...args: unknown[]) => void;

      console[level] = (...args: unknown[]) => {
        const message = args.map(a => {
          if (typeof a === 'object') {
            try { return JSON.stringify(a); }
            catch { return String(a); }
          }
          return String(a);
        }).join(' ');

        const entry: ConsoleLogEntry = {
          timestamp: new Date().toISOString(),
          level,
          message: maskSensitive(message),
        };

        if (level === 'error') {
          if (errorLogs.length >= errorMax) errorLogs.shift();
          errorLogs.push(entry);
        } else {
          // warn, log は generalLogs へ
          if (generalLogs.length >= logMax) generalLogs.shift();
          generalLogs.push(entry);
        }

        original.apply(console, args);
      };
    }

    // window.onerror → errorLogs
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

    // unhandledrejection → errorLogs
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

    // cleanup...
  }

  return {
    getConsoleLogs: () => {
      // errorを先に、generalを後に。時系列でソート
      return [...errorLogs, ...generalLogs].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    },
    // ...
  };
}
```

---

## 2. ネットワークログの必須/オプション分離

### 仕様

**必須（常に自動添付）**

| 項目 | GET | POST/PUT/DELETE |
|------|-----|-----------------|
| URL | ✅ | ✅ |
| メソッド | ✅ | ✅ |
| ステータスコード | ✅ | ✅ |
| リクエストボディ | - | ✅ |
| レスポンスボディ | ❌ | ✅ |

**オプション（UIで選択）**

| 項目 | デフォルト |
|------|-----------|
| GETのレスポンスボディ | OFF |
| 所要時間 | OFF |
| ヘッダー | OFF |

### 実装変更

**`src/utils/logCapture.ts`** — ネットワークキャプチャ部分

```typescript
// 常に取得
const entry: NetworkLogEntry = {
  timestamp: new Date().toISOString(),
  method: init?.method || 'GET',
  url,
  status: response.status,
};

// 必須: POST/PUT/DELETE のリクエストボディ
const method = (init?.method || 'GET').toUpperCase();
if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && init?.body) {
  try { entry.requestBody = JSON.parse(String(init.body)); }
  catch { entry.requestBody = String(init.body); }
}

// 必須: POST/PUT/DELETE のレスポンスボディ
if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
  try { entry.responseBody = await response.clone().json(); }
  catch { /* non-JSON */ }
}

// オプション: GETレスポンス（送信時に制御）
// オプション: duration（送信時に制御）
// オプション: headers（送信時に制御）

// 常に duration は計算しておく（送信時にフィルタ可能にするため）
entry.duration = Math.round(performance.now() - start);

// ヘッダーも取得しておく（送信時にフィルタ可能にするため）
if (networkConfig.captureHeaders) {
  entry.requestHeaders = maskHeaders(...);
  entry.responseHeaders = maskHeaders(...);
}
```

送信時のフィルタは DebugPanel 側で行う（Section 4 参照）。

---

## 3. 環境変数による件数設定

### 環境変数

```env
# .env.development
VITE_DEBUG_ERROR_LOG_MAX=30    # errorログの最大件数（デフォルト: 30）
VITE_DEBUG_LOG_MAX=30          # warn+logの最大件数（デフォルト: 30）
VITE_DEBUG_NETWORK_LOG_MAX=30  # ネットワークログの最大件数（デフォルト: 30）
```

### 利用側での初期化

```typescript
const logCapture = createLogCapture({
  console: {
    maxErrorEntries: Number(import.meta.env.VITE_DEBUG_ERROR_LOG_MAX) || 30,
    maxLogEntries: Number(import.meta.env.VITE_DEBUG_LOG_MAX) || 30,
  },
  network: {
    include: ['/api/**'],
    maxEntries: Number(import.meta.env.VITE_DEBUG_NETWORK_LOG_MAX) || 30,
  },
});
```

---

## 4. 記録タブUI変更

### 変更点

1. **再現手順フィールドを削除** — 内容・補足メモに統合
2. **添付オプションを追加** — 折りたたみトグル

### UI

```
┌─ 記録 ─────────────────────────────────────┐
│                                            │
│  重要度: [medium ▼]                        │
│                                            │
│  内容 * [___________________________]      │
│                                            │
│  補足メモ [_________________________]      │
│                                            │
│  ▶ 添付オプション                           │
│                                            │
├────────────────────────────────────────────┤
│           [クリア]    [保存]               │
└────────────────────────────────────────────┘

↓ 添付オプションを展開

│  ▼ 添付オプション                           │
│  ┌────────────────────────────────────┐    │
│  │ ☐ GETレスポンスを含める             │    │
│  │ ☐ 通信時間を含める                  │    │
│  │ ☐ ヘッダーを含める                  │    │
│  └────────────────────────────────────┘    │
```

### 自動添付される内容（UIに表示しない）

- コンソールログ（error 30件 + warn/log 30件）
- ネットワークログ（URL, メソッド, ステータス, POST等のボディ）
- 環境情報（userAgent, viewport, URL, timestamp）

### 実装

**`src/components/DebugPanel.tsx`**

```tsx
// 状態追加
const [showAttachOptions, setShowAttachOptions] = useState(false);
const [attachGetResponse, setAttachGetResponse] = useState(false);
const [attachDuration, setAttachDuration] = useState(false);
const [attachHeaders, setAttachHeaders] = useState(false);

// 再現手順関連を削除
// const [steps, setSteps] = useState('');
// const [showSteps, setShowSteps] = useState(false);

// JSX（記録タブ）
{activeTab === 'record' && (
  <>
    <div className="debug-field">
      <label htmlFor="debug-severity">重要度（任意）</label>
      <select ...>...</select>
    </div>

    <div className="debug-field">
      <label htmlFor="debug-content">内容 *</label>
      <textarea ... />
    </div>

    <div className="debug-field">
      <label htmlFor="debug-log">補足メモ（任意）</label>
      <textarea ... />
      <span className="debug-hint">機密情報は自動でマスクされます</span>
    </div>

    {/* 添付オプション（トグル） */}
    <div className="debug-toggle">
      <button
        type="button"
        onClick={() => setShowAttachOptions(!showAttachOptions)}
        className="debug-toggle-btn"
      >
        <span className="debug-icon" style={{ fontSize: '18px' }}>
          {showAttachOptions ? 'expand_less' : 'expand_more'}
        </span>
        添付オプション
      </button>
    </div>

    {showAttachOptions && (
      <div className="debug-attach-options">
        <label className="debug-attach-option">
          <input
            type="checkbox"
            checked={attachGetResponse}
            onChange={(e) => setAttachGetResponse(e.target.checked)}
          />
          GETレスポンスを含める
        </label>
        <label className="debug-attach-option">
          <input
            type="checkbox"
            checked={attachDuration}
            onChange={(e) => setAttachDuration(e.target.checked)}
          />
          通信時間を含める
        </label>
        <label className="debug-attach-option">
          <input
            type="checkbox"
            checked={attachHeaders}
            onChange={(e) => setAttachHeaders(e.target.checked)}
          />
          ヘッダーを含める
        </label>
      </div>
    )}
  </>
)}
```

### 保存時のフィルタ処理

```typescript
const handleSave = useCallback(async () => {
  // ...

  // ネットワークログをフィルタ
  let networkLogs = logCapture?.getNetworkLogs() ?? [];
  networkLogs = networkLogs.map(log => {
    const filtered: NetworkLogEntry = {
      timestamp: log.timestamp,
      method: log.method,
      url: log.url,
      status: log.status,
    };

    const method = log.method.toUpperCase();
    const isModifying = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    // 必須: POST等のリクエスト/レスポンスボディ
    if (isModifying) {
      if (log.requestBody !== undefined) filtered.requestBody = log.requestBody;
      if (log.responseBody !== undefined) filtered.responseBody = log.responseBody;
    }

    // オプション: GETレスポンス
    if (!isModifying && attachGetResponse && log.responseBody !== undefined) {
      filtered.responseBody = log.responseBody;
    }

    // オプション: 通信時間
    if (attachDuration && log.duration !== undefined) {
      filtered.duration = log.duration;
    }

    // オプション: ヘッダー
    if (attachHeaders) {
      if (log.requestHeaders) filtered.requestHeaders = log.requestHeaders;
      if (log.responseHeaders) filtered.responseHeaders = log.responseHeaders;
    }

    return filtered;
  });

  const input: NoteInput = {
    content: content.trim(),
    userLog: userLog ? maskSensitive(userLog) : undefined,
    severity: severity || undefined,
    // steps を削除
    consoleLogs: logCapture?.getConsoleLogs(),
    networkLogs,
    environment: {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
  };

  // ...
}, [content, userLog, severity, logCapture, attachGetResponse, attachDuration, attachHeaders]);
```

### スタイル追加

**`getPipStyles()`** に追加

```css
.debug-attach-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${COLORS.gray100};
  border-radius: 8px;
}

.debug-attach-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${COLORS.gray700};
  cursor: pointer;
}

.debug-attach-option input[type="checkbox"] {
  accent-color: ${COLORS.primary};
}
```

---

## 5. 型定義更新

**`src/types/index.ts`**

```typescript
/** Console キャプチャ設定 */
export interface ConsoleLogConfig {
  maxErrorEntries?: number;  // error専用バッファの上限（デフォルト: 30）
  maxLogEntries?: number;    // warn+log バッファの上限（デフォルト: 30）
  filter?: (message: string) => boolean;
}

// levels は削除（error, warn, log 固定）
```

```typescript
/** NoteInput から steps を削除 */
export interface NoteInput {
  title?: string;
  content: string;
  userLog?: string;
  // steps?: string[];  ← 削除
  severity?: Severity;
  route?: string;
  screenName?: string;
  status?: 'open';
  consoleLogs?: ConsoleLogEntry[];
  networkLogs?: NetworkLogEntry[];
  environment?: EnvironmentInfo;
  source?: 'manual' | 'test';
  testCaseId?: number;
}
```

---

## 6. 他ドキュメントへの影響

### `docs/requirement.md`

- Section 5.1 notes テーブル: `steps` カラムは残すが、UIからは削除された旨を注記
- Section 7.1 PIP パネル: 入力項目から「再現手順」を削除

### `docs/usage.md`

- DebugPanel 入力項目: 「再現手順」を削除
- ログキャプチャ設定: `levels` 廃止、`maxErrorEntries` / `maxLogEntries` に変更
- 添付オプションの説明を追加

### `docs/setup.md`

- ログキャプチャ設定例を更新
- 環境変数の説明を追加

---

## 実装順序

```
1. 型定義更新（ConsoleLogConfig から levels 削除、maxErrorEntries/maxLogEntries 追加）
2. logCapture.ts 修正（バッファ分離、ネットワーク必須項目対応）
3. DebugPanel.tsx 修正（再現手順削除、添付オプション追加、保存時フィルタ）
4. ドキュメント更新
```
