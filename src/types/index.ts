/** 重要度 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

/** ステータス（open → in_progress → fixed の主系。resolved/rejected/closed も可。遷移制約なし） */
export type Status = 'open' | 'in_progress' | 'resolved' | 'rejected' | 'fixed' | 'closed';

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
  /** 紐付いたテストケースの詳細情報 */
  test_cases?: NoteTestCase[];
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
  env: string; // 'dev' | 'staging' | 'prod' | 任意文字列
  sections: EnvironmentSection[];
}

export interface EnvironmentSection {
  label: string; // 'ルートアカウント' | 'Basic認証' 等
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

/** ノートに紐付いたテストケース情報 */
export interface NoteTestCase {
  id: number;
  case_key: string | null;
  domain: string | null;
  capability: string | null;
  title: string | null;
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
  /** 初期サイズ。width/height の指定値と実際の描画サイズの関係は
   * ManualPiPProps.initialSize の NOTE を参照（同じ Document Picture-in-Picture
   * API を使用しているため同様の制約が適用される）。 */
  initialSize?: { width: number; height: number };
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
  /**
   * トリガーボタン（バグ記録ボタン）の画面端からのオフセット。
   * ボトムナビ等のある利用側アプリで、ボタンが重ならないよう位置をずらすために使用する。
   * 未指定時は safe-area-inset-bottom/right + 24px。
   */
  triggerOffset?: {
    bottom?: string | number;
    right?: string | number;
  };
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
  updateStatus: (id: number, status: Status, options?: { comment?: string; author?: string }) => Promise<boolean>;
  updateSeverity: (id: number, severity: Severity | null) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  refresh: () => void;
}

/** useDebugMode 戻り値 */
export interface UseDebugModeReturn {
  isDebugMode: boolean;
}

// ============================================
// Manual Viewer 型定義
// ============================================

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
  position: { x: number; y: number };
  /** ウィンドウサイズ */
  size: { width: number; height: number };
}

/** マニュアル見出し（ページ内の h2/h3 一つ分） */
export interface ManualHeading {
  /** 見出し要素の id（rehype-slug が振る id と一致させる） */
  id: string;
  /** 見出しテキスト（インライン記法を除去済み） */
  text: string;
  /** 見出しレベル（h2 または h3 のみ対象） */
  level: 2 | 3;
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
  // --- サイドバー ---
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

  // --- フィードバック ---
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

  // --- デフォルト表示 ---
  /** Default document path when URL has no ?path= parameter */
  defaultDocPath?: string;

  // --- 目次サイドバー ---
  /** マニュアル項目リスト。指定時のみ左側に階層目次サイドバーが常時表示される（未指定時は既存の見た目・挙動のまま） */
  items?: ManualItem[];
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
  /** 初期サイズ（オプション）
   * NOTE: 初期位置（x/y）は指定不可。Document Picture-in-Picture API の仕様上、
   * サイト側から PiP ウィンドウの位置を制御することはできない（なりすまし防止のための
   * 意図的な制限。https://wicg.github.io/document-picture-in-picture/ 参照）。
   *
   * NOTE: width/height の指定値と実際の描画サイズは一致しない（Chrome 実機で実測・
   * 詳細は CHANGELOG [1.4.6] 参照）。
   * - width: 240px 未満を指定すると 240px にクランプされる（Chromium の PiP 最小幅）。
   *   240px 以上はそのまま反映される。
   * - height: 実際の viewport 高さ（innerHeight）は「指定値 − 56px」になる
   *   （PiP ヘッダー分のオーバーヘッドと推定）。欲しい viewport 高さを得るには
   *   `height = 欲しい高さ + 56` を指定する。極端に小さい値（52px 付近）や
   *   大きい値（画面サイズに近い値）ではこの単純な計算式から外れる。 */
  initialSize?: { width: number; height: number };
  /** ダウンロードボタンを表示するか（デフォルト: false） */
  showDownloadButton?: boolean;
  /**
   * ホストページの stylesheet（<style>/<link rel="stylesheet">）を PiP ウィンドウにもコピーするか
   * （デフォルト: true）。PiP は Document Picture-in-Picture API で独立した document を持つため、
   * ホスト側の CSS（利用側アプリが追加するマニュアル用カスタムクラス等）は自動では一切反映されない。
   * 既定でホストの stylesheet を丸ごとコピーすることで、dev-tools 側に個別のクラスを
   * 登録しなくても、利用側アプリが追加した任意のマニュアル用スタイルが PiP 内でも有効になる。
   * ホストの stylesheet が極端に大きい・PiP 内で意図せず他の CSS と衝突する等の理由で
   * 無効化したい場合は false を指定する。
   */
  copyHostStyles?: boolean;

  // --- フィードバック ---
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

  // --- 目次パネル ---
  /** マニュアル項目リスト。指定時のみヘッダーにハンバーガーメニューが表示され、トグルで階層目次パネルを開閉できる（未指定時は既存の見た目・挙動のまま） */
  items?: ManualItem[];
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

/** ManualTableOfContents プロパティ */
export interface ManualTableOfContentsProps {
  /** マニュアル項目リスト */
  items: ManualItem[];
  /** 現在表示中のページパス（指定時、そのページを含むカテゴリを初期状態で開く） */
  activePath?: string | null;
  /** ページ選択ハンドラ（ページタイトルクリック時） */
  onSelectPage: (path: string) => void;
  /** 見出し選択ハンドラ（見出しクリック時） */
  onSelectHeading: (path: string, headingId: string) => void;
  /** 現在ビューポート内で読まれている見出しの id（スクロールスパイ用。指定時にハイライトする） */
  activeHeadingId?: string | null;
  /** 追加のクラス名 */
  className?: string;
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

// --- フィードバック ---

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

// ─── リリースノート（@TWUWB-003）───
//
// フィールド名はバックエンドの列名（snake_case）をそのまま通している。
// 投入側（feedback-fix）と API 形状を揃える必要があり、途中で camelCase に
// 変換すると仕様書・API・型の3箇所で名前が食い違うため。

/** リリースノート項目の区分。この3つ以外を増やさない（読者が分類を覚えられなくなる） */
export type ReleaseCategory = 'fix' | 'improve' | 'feature';

/** 号の公開状態。社外公開の可否は is_public で別に持つ */
export type ReleaseNoteStatus = 'draft' | 'published';

/** 1つの変更点。必ず「これまで(before) → これから(after)」の対で読ませる */
export interface ReleaseNoteItem {
  id: number;
  release_note_id: number;
  sort_order: number;
  category: ReleaseCategory;
  /** 「〜を直しました」「〜できるようにしました」の形 */
  headline: string;
  /** 画面上の場所（例: 案件 > MTGログ） */
  where_text: string | null;
  before_text: string | null;
  after_text: string | null;
  /** 元になったフィードバック ID。投入側が二重掲載を検出する正本 */
  feedback_id: number | null;
}

/** 添付メディア。動作の変化は動画、見た目の変化は静止画で示す */
export interface ReleaseNoteMedia {
  id: number;
  release_note_id: number;
  /** null なら号全体の代表メディア（一覧カードに出る） */
  item_id: number | null;
  original_name: string;
  mime_type: string;
  size: number;
  caption: string | null;
  sort_order: number;
  /** 配信 URL。トークンを含むため認証なしで参照できる（<img>/<video> 用） */
  url: string;
}

/** リリースノート1号 */
export interface ReleaseNote {
  id: number;
  /** 第N号 */
  version: string;
  title: string;
  summary: string | null;
  /** YYYY-MM-DD */
  released_on: string;
  previous_release_id: number | null;
  /** 「前回（○月○日 第N号）からの変更」を出すための最小情報 */
  previous: { id: number; version: string; released_on: string } | null;
  cover_image_id: number | null;
  status: ReleaseNoteStatus;
  /** true で公開 URL にも出る。false なら published でもアプリ内だけ */
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items: ReleaseNoteItem[];
  images: ReleaseNoteMedia[];
}

/** 号の作成・更新に渡す値 */
export interface ReleaseNoteInput {
  version?: string;
  title?: string;
  summary?: string | null;
  released_on?: string;
  previous_release_id?: number | null;
  cover_image_id?: number | null;
  status?: ReleaseNoteStatus;
  is_public?: boolean;
}

/** 項目の作成・更新に渡す値 */
export interface ReleaseNoteItemInput {
  category?: ReleaseCategory;
  headline?: string;
  where_text?: string | null;
  before_text?: string | null;
  after_text?: string | null;
  feedback_id?: number | null;
  sort_order?: number;
}

/** 公開トークン1本ぶんの情報 */
export interface ReleaseNoteTokenInfo {
  token: string;
  /** クライアントに送る HTML ページの URL */
  pageUrl: string;
  /** アプリ内コンポーネントが読む JSON の URL */
  feedUrl: string;
}

/**
 * 2種類のトークン。
 * public   … クライアントに配る。published かつ is_public の号だけ見える
 * internal … アプリ内に埋める。published を全件見せる（社内向けの号を含む）
 */
export interface ReleaseNoteTokens {
  public: ReleaseNoteTokenInfo;
  internal: ReleaseNoteTokenInfo;
}

/** ReleaseNotes コンポーネントのプロパティ */
export interface ReleaseNotesProps {
  /** フィードの URL（GET /release-notes/feed/{token}）。tokens API が返す feedUrl をそのまま渡す */
  feedUrl: string;
  /** 見出し。既定「更新情報」 */
  title?: string;
  /** 見出し下の説明文 */
  description?: string;
  /** 既定で開く号の数。既定 1（最新のみ） */
  initialOpenCount?: number;
  /** 区分の絞り込み UI を出すか。既定 true */
  showFilter?: boolean;
  /** 未読管理のキー。複数アプリを同一オリジンに載せる場合に分ける */
  storageKey?: string;
  /** 読み込み完了時（未読件数の反映などに使う） */
  onLoaded?: (notes: ReleaseNote[]) => void;
  className?: string;
  style?: React.CSSProperties;
}
