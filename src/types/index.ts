/** 重要度 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

/** ステータス */
export type Status = 'open' | 'resolved' | 'rejected' | 'fixed';

/** 環境 */
export type Environment = 'dev' | 'test';


/** ノート */
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
  console_log?: ConsoleLogEntry[] | null;
  network_log?: NetworkLogEntry[] | null;
  environment?: EnvironmentInfo | null;
  source?: 'manual' | 'test';
  test_case_id?: number | null;
  test_case_ids?: number[];
}

/** ノート作成入力 */
export interface NoteInput {
  title?: string;
  content: string;
  userLog?: string;
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

/** パース済みテストケース */
export interface ParsedTestCase {
  domain: string;
  capability: string;
  title: string;
}

/** Case集計 */
export interface CaseSummary {
  caseId: number;
  title: string;
  last: 'pass' | 'fail' | 'skip' | null;
  openIssues: number;
}

/** Capability集計 */
export interface CapabilitySummary {
  capability: string;
  total: number;
  passed: number;
  failed: number;
  status: 'passed' | 'fail' | 'retest' | null;
  openIssues: number;
  cases: CaseSummary[];
}

/** ドメインツリー */
export interface DomainTree {
  domain: string;
  capabilities: CapabilitySummary[];
}

/** テスト実行入力 */
export interface TestRunInput {
  caseId: number;
  result: 'pass' | 'fail' | 'skip';
  note?: {
    content: string;
    severity?: Severity;
    consoleLogs?: ConsoleLogEntry[];
    networkLogs?: NetworkLogEntry[];
    environment?: EnvironmentInfo;
  };
}

/** テスト実行レスポンス */
export interface TestRunResponse {
  results: Array<{
    caseId: number;
    runId: number;
    result: string;
    noteId?: number;
  }>;
  capability: CapabilitySummary;
}

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
  duration?: number;
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
  /** @deprecated 無視される。error, warn, log を固定キャプチャ */
  levels?: Array<'error' | 'warn' | 'log' | 'info'>;
  filter?: (message: string) => boolean;
  /** @deprecated maxErrorEntries / maxLogEntries を使用 */
  maxEntries?: number;
  maxErrorEntries?: number;
  maxLogEntries?: number;
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

/** API レスポンス */
export interface NotesResponse {
  success: boolean;
  data?: Note[];
  note?: Note;
  error?: string;
}

/** API 設定 */
export interface ApiConfig {
  baseUrl: string;
  env: Environment;
}

/** DebugPanel プロパティ */
export interface DebugPanelProps {
  apiBaseUrl?: string;
  env?: Environment;
  onSave?: (note: Note) => void;
  onClose?: () => void;
  initialSize?: { width: number; height: number };
  testCases?: ParsedTestCase[];
  logCapture?: LogCaptureInstance;
}

/** DebugAdmin プロパティ */
export interface DebugAdminProps {
  apiBaseUrl?: string;
  env?: Environment;
}

/** useDebugNotes 戻り値 */
export interface UseDebugNotesReturn {
  notes: Note[];
  loading: boolean;
  error: Error | null;
  createNote: (input: NoteInput) => Promise<Note | null>;
  updateStatus: (id: number, status: Status) => Promise<boolean>;
  updateSeverity: (id: number, severity: Severity | null) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  refresh: () => void;
}

/** useDebugMode 戻り値 */
export interface UseDebugModeReturn {
  isDebugMode: boolean;
}
