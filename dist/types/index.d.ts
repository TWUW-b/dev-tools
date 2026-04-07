/** 重要度 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';
/** ステータス（open → fixed → resolved の順。遷移制約なし） */
export type Status = 'open' | 'resolved' | 'rejected' | 'fixed';
/** 環境 */
export type Environment = 'dev' | 'test';
/** ノートアクティビティ */
export interface NoteActivity {
    id: number;
    note_id: number;
    action: 'status_change' | 'comment';
    content: string | null;
    old_status: Status | null;
    new_status: Status | null;
    author: string | null;
    created_at: string;
}
/** ノート添付ファイル */
export interface NoteAttachment {
    id: number;
    note_id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
    created_at: string;
}
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
    /** @deprecated test_case_ids を使用 */
    test_case_id?: number | null;
    test_case_ids?: number[];
    attachment_count?: number;
    attachments?: NoteAttachment[];
    activities?: NoteActivity[];
    latest_comment?: string | null;
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
    testCaseIds?: number[];
}
/** 環境情報ドキュメント */
export interface EnvironmentInfoDoc {
    title?: string;
    warning?: string;
    projects: EnvironmentProject[];
    /** frontmatter 以外で H1 より前に書かれた自由記述 Markdown */
    preamble?: string;
}
export interface EnvironmentProject {
    name: string;
    phase?: string;
    /** env ごとにグルーピングされたセクション */
    envs: EnvironmentGroup[];
    /** env を持たない共通セクション（`##` にスラッシュ無しのもの） */
    common: EnvironmentSection[];
    /** 「前提・注意点」「Notes」等のノートブロック（生 MD） */
    notes?: string;
}
export interface EnvironmentGroup {
    env: string;
    sections: EnvironmentSection[];
}
export interface EnvironmentSection {
    label: string;
    entries: EnvironmentKV[];
    table?: EnvironmentTable;
    /** セクション内のその他自由記述 Markdown */
    extraMd?: string;
}
export interface EnvironmentKV {
    key: string;
    value: string;
    /** パーサが推定した種別（UI でアイコン/マスク/リンク化に使用） */
    kind: 'url' | 'email' | 'password' | 'user' | 'text';
}
export interface EnvironmentTable {
    headers: string[];
    rows: string[][];
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
    filter?: (message: string) => boolean;
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
    initialSize?: {
        width: number;
        height: number;
    };
    testCases?: ParsedTestCase[];
    logCapture?: LogCaptureInstance;
    /** マニュアル項目リスト。指定時に「マニュアル」タブが表示される */
    manualItems?: ManualItem[];
    /** マニュアルのデフォルト表示パス */
    manualDefaultPath?: string;
    /** マニュアル内リンク遷移時のハンドラ */
    onManualNavigate?: (path: string) => void;
    /** マニュアル内 app: リンク遷移時のハンドラ */
    onManualAppNavigate?: (path: string) => void;
    /** 環境情報 MD 文字列（指定時に「環境」タブ表示） */
    environmentsMd?: string;
}
/** DebugAdmin プロパティ */
export interface DebugAdminProps {
    apiBaseUrl?: string;
    env?: Environment;
    /** フィードバックAPIのベースURL。feedbackAdminKey と共に指定時にフィードバックタブが表示 */
    feedbackApiBaseUrl?: string;
    /** フィードバック管理用の管理者キー */
    feedbackAdminKey?: string;
}
/** useDebugNotes 戻り値 */
export interface UseDebugNotesReturn {
    notes: Note[];
    loading: boolean;
    error: Error | null;
    createNote: (input: NoteInput) => Promise<Note | null>;
    updateStatus: (id: number, status: Status, options?: {
        comment?: string;
        author?: string;
    }) => Promise<boolean>;
    updateSeverity: (id: number, severity: Severity | null) => Promise<boolean>;
    deleteNote: (id: number) => Promise<boolean>;
    refresh: () => void;
}
/** useDebugMode 戻り値 */
export interface UseDebugModeReturn {
    isDebugMode: boolean;
}
/** マニュアル項目 */
export interface ManualItem {
    /** 一意のID */
    id: string;
    /** 表示タイトル */
    title: string;
    /** MDファイルへのパス */
    path: string;
    /** カテゴリ（オプション） */
    category?: string;
    /** 表示順（オプション） */
    order?: number;
}
/** PiP状態 */
export interface PiPState {
    /** 開いているか */
    isOpen: boolean;
    /** 現在表示中のパス */
    currentPath: string | null;
    /** ウィンドウ位置 */
    position: {
        x: number;
        y: number;
    };
    /** ウィンドウサイズ */
    size: {
        width: number;
        height: number;
    };
}
/** 表示モード */
export type ManualViewMode = 'pip' | 'tab';
/** PiPフック戻り値 */
export interface UseManualPiPReturn {
    /** 開いているか */
    isOpen: boolean;
    /** 現在表示中のパス */
    currentPath: string | null;
    /** PiPを開く */
    openPiP: (path: string) => void;
    /** 別タブで開く */
    openTab: (path: string) => void;
    /** PiPを閉じる */
    closePiP: () => void;
    /** パスを変更 */
    setPath: (path: string) => void;
}
/** ManualTabPage プロパティ */
export interface ManualTabPageProps {
    /** サイドバーに表示するMDファイルパス。指定時にサイドバーが開く */
    sidebarPath?: string | null;
    /** サイドバー内の .md リンククリック時 */
    onSidebarNavigate?: (path: string) => void;
    /** サイドバー内の app: リンククリック時 */
    onSidebarAppNavigate?: (path: string) => void;
    /** サイドバー初期幅（px）デフォルト: 400 */
    sidebarDefaultWidth?: number;
    /** サイドバー最小幅（px）デフォルト: 250 */
    sidebarMinWidth?: number;
    /** サイドバー最大幅（px）デフォルト: 800 */
    sidebarMaxWidth?: number;
    /** フィードバックAPIのベースURL。指定時にフィードバック機能が有効化 */
    feedbackApiBaseUrl?: string;
    /** ユーザー種別（自動付与） */
    feedbackUserType?: string;
    /** アプリバージョン（自動付与） */
    feedbackAppVersion?: string;
    /** フィードバック管理画面URL（隠しコマンド時の遷移先） */
    feedbackAdminUrl?: string;
    /** フィードバック領域の初期高さ（px）デフォルト: 350 */
    feedbackDefaultHeight?: number;
    /** フィードバック領域の最小高さ（px）デフォルト: 200 */
    feedbackMinHeight?: number;
    /** フィードバック領域の最大高さ（px）デフォルト: 600 */
    feedbackMaxHeight?: number;
    /** 送信成功時コールバック */
    onFeedbackSubmitSuccess?: (feedback: Feedback) => void;
    /** 送信エラー時コールバック */
    onFeedbackSubmitError?: (error: Error) => void;
    /** Default document path when URL has no ?path= parameter */
    defaultDocPath?: string;
}
/** マニュアルローダー戻り値 */
export interface UseManualLoaderReturn {
    /** Markdownコンテンツ */
    content: string | null;
    /** 読み込み中 */
    loading: boolean;
    /** エラー */
    error: Error | null;
    /** 再読み込み */
    reload: () => void;
}
/** MarkdownRenderer プロパティ */
export interface MarkdownRendererProps {
    /** Markdownコンテンツ */
    content: string;
    /** 追加のクラス名 */
    className?: string;
    /** マークダウン内リンククリック時のハンドラ（.mdリンク用） */
    onLinkClick?: (path: string) => void;
    /** アプリリンククリック時のハンドラ（app:/...リンク用） */
    onAppLinkClick?: (path: string) => void;
}
/** ManualPiP プロパティ */
export interface ManualPiPProps {
    /** 開いているか */
    isOpen: boolean;
    /** MDファイルへのパス */
    docPath: string | null;
    /** 閉じるハンドラ */
    onClose: () => void;
    /** マークダウン内リンククリック時のハンドラ（.mdリンク用、PiP内遷移） */
    onNavigate?: (path: string) => void;
    /** アプリリンククリック時のハンドラ（app:/...リンク用、メイン画面遷移） */
    onAppNavigate?: (path: string) => void;
    /** 初期位置（オプション） */
    initialPosition?: {
        x: number;
        y: number;
    };
    /** 初期サイズ（オプション） */
    initialSize?: {
        width: number;
        height: number;
    };
    /** ダウンロードボタンを表示するか（デフォルト: false） */
    showDownloadButton?: boolean;
    /** フィードバックAPIのベースURL */
    feedbackApiBaseUrl?: string;
    /** ユーザー種別 */
    feedbackUserType?: string;
    /** アプリバージョン */
    feedbackAppVersion?: string;
    /** 送信成功時コールバック */
    onFeedbackSubmitSuccess?: (feedback: Feedback) => void;
    /** 送信エラー時コールバック */
    onFeedbackSubmitError?: (error: Error) => void;
    /** フィードバック領域の初期高さ（px）デフォルト: 200 */
    feedbackDefaultHeight?: number;
    /** フィードバック領域の最小高さ（px）デフォルト: 150 */
    feedbackMinHeight?: number;
    /** フィードバック領域の最大高さ（px）デフォルト: 400 */
    feedbackMaxHeight?: number;
}
/** ManualSidebar プロパティ */
export interface ManualSidebarProps {
    /** マニュアル項目リスト */
    items: ManualItem[];
    /** 選択ハンドラ */
    onSelect: (path: string) => void;
    /** 現在選択中のパス（オプション） */
    activePath?: string;
    /** 追加のクラス名 */
    className?: string;
    /** PiPで開くハンドラ（オプション） */
    onPiP?: (path: string) => void;
    /** 新しいタブで開くハンドラ（オプション） */
    onNewTab?: (path: string) => void;
}
/** ManualLink プロパティ */
export interface ManualLinkProps {
    /** MDファイルへのパス */
    path: string;
    /** クリックハンドラ */
    onClick: (path: string) => void;
    /** 子要素 */
    children: React.ReactNode;
    /** 追加のクラス名 */
    className?: string;
}
/** ManualPage プロパティ */
export interface ManualPageProps {
    /** MDファイルへのパス */
    docPath: string;
    /** 追加のクラス名 */
    className?: string;
}
/** フィードバック種別 */
export type FeedbackKind = 'bug' | 'question' | 'request' | 'share' | 'other';
/** フィードバック対象 */
export type FeedbackTarget = 'app' | 'manual';
/** フィードバックステータス */
export type FeedbackStatus = 'open' | 'in_progress' | 'closed';
/** ログキャプチャインスタンス（Feedback用） */
export interface FeedbackLogCapture {
    getConsoleLogs: () => ConsoleLogEntry[];
    getNetworkLogs: () => NetworkLogEntry[];
    clear: () => void;
    destroy: () => void;
}
/** ログキャプチャ設定（Feedback用） */
export interface FeedbackLogCaptureConfig {
    maxConsoleLogs?: number;
    maxNetworkLogs?: number;
    /** キャプチャ対象URLパターン */
    networkInclude?: string[];
    /** キャプチャ除外URLパターン */
    networkExclude?: string[];
}
/** フィードバックデータ */
export interface Feedback {
    id: number;
    kind: FeedbackKind;
    target?: FeedbackTarget | null;
    customTag?: string | null;
    message: string;
    pageUrl?: string | null;
    userType?: string | null;
    environment?: Record<string, string> | null;
    appVersion?: string | null;
    consoleLogs?: ConsoleLogEntry[] | null;
    networkLogs?: NetworkLogEntry[] | null;
    status: FeedbackStatus;
    createdAt: string;
    updatedAt: string;
    attachmentCount?: number;
    attachments?: NoteAttachment[];
}
/** フィードバック送信入力 */
export interface FeedbackInput {
    kind: FeedbackKind;
    target?: FeedbackTarget;
    message: string;
}
/** FeedbackAdmin プロパティ */
export interface FeedbackAdminProps {
    apiBaseUrl: string;
    adminKey: string;
}
