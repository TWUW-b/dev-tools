// Components
export { DebugPanel } from './components/DebugPanel';
export { DebugAdmin } from './components/DebugAdmin';
export { DevTools } from './components/DevTools';
export type { DevToolsProps } from './components/DevTools';

// Release Notes（@TWUWB-003）
export { ReleaseNotes } from './components/ReleaseNotes';
export { useReleaseNotes } from './hooks/useReleaseNotes';
export type { UseReleaseNotesOptions, UseReleaseNotesReturn } from './hooks/useReleaseNotes';
export { releaseNotesApi, fetchReleaseNotesFeed } from './utils/releaseNotesApi';
export type { ReleaseNotesApiConfig } from './utils/releaseNotesApi';
// 管理タブ（@TWUWB-005）。DebugAdmin を丸ごと載せられないホスト（他タブの API を持たない、
// 独自の管理画面がある等）でも、リリースノートの公開制御だけを置けるように単体で公開する。
export { ReleaseNotesTab } from './components/admin/ReleaseNotesTab';
export type { ReleaseNotesTabProps } from './components/admin/ReleaseNotesTab';
export { LIGHT_COLORS, DARK_COLORS } from './components/adminColors';
export type { AdminColors } from './components/adminColors';

// Manual Components
export {
  MarkdownRenderer,
  ManualPiP,
  ManualSidebar,
  ManualLink,
  ManualPage,
  ManualTabPage,
  FeedbackAdmin,
  FeedbackForm,
} from './components/manual';

// Hooks
export { useDebugMode } from './hooks/useDebugMode';
export { useDebugNotes } from './hooks/useDebugNotes';
export { useManualPiP, setManualTabBaseUrl } from './hooks/useManualPiP';
export { useManualLoader } from './hooks/useManualLoader';
export { useManualDownload } from './hooks/useManualDownload';
export type { DownloadFile, UseManualDownloadReturn } from './hooks/useManualDownload';
export { useResizable } from './hooks/useResizable';
export type { UseResizableOptions, UseResizableReturn } from './hooks/useResizable';
export { useFeedback } from './hooks/useFeedback';
export type { UseFeedbackOptions, UseFeedbackReturn } from './hooks/useFeedback';
export { useFeedbackAdmin } from './hooks/useFeedbackAdmin';
export type { UseFeedbackAdminOptions, FeedbackFilters, UseFeedbackAdminReturn } from './hooks/useFeedbackAdmin';
export { useFeedbackAdminMode } from './hooks/useFeedbackAdminMode';

// Utils
export { setDebugApiBaseUrl, setAuthTokenProvider, setDebugAdminKey, type AuthTokenProvider, type DebugAdminKeyProvider } from './utils/api';
export { maskSensitive } from './utils/maskSensitive';
export { parseTestCaseMd } from './utils/parseTestCaseMd';
export { parseEnvironmentsMd } from './utils/parseEnvironmentsMd';
export { createLogCapture } from './utils/logCapture';
export { createFeedbackLogCapture } from './utils/feedbackLogCapture';

// Styles
export { loadMaterialSymbols, isAutoLoadDisabled, MATERIAL_SYMBOLS_CDN, materialSymbolsStyle } from './styles/material-symbols';
export { DEBUG_COLORS, MANUAL_COLORS } from './styles/colors';

// Types
export type {
  // Debug types
  Note,
  NoteInput,
  NotesResponse,
  ApiConfig,
  Severity,
  Status,
  ParsedTestCase,
  CaseSummary,
  CapabilitySummary,
  DomainTree,
  TestRunInput,
  TestRunResponse,
  ConsoleLogEntry,
  NetworkLogEntry,
  Environment,
  EnvironmentInfo,
  ConsoleLogConfig,
  NetworkLogConfig,
  LogCaptureConfig,
  LogCaptureInstance,
  DebugPanelProps,
  DebugAdminProps,
  EnvironmentInfoDoc,
  EnvironmentProject,
  EnvironmentGroup,
  EnvironmentSection,
  EnvironmentKV,
  EnvironmentTable,
  UseDebugNotesReturn,
  UseDebugModeReturn,
  // Manual types
  ManualItem,
  ManualViewMode,
  PiPState,
  UseManualPiPReturn,
  UseManualLoaderReturn,
  MarkdownRendererProps,
  ManualPiPProps,
  ManualSidebarProps,
  ManualLinkProps,
  ManualPageProps,
  ManualTabPageProps,
  // Feedback types
  FeedbackKind,
  FeedbackTarget,
  FeedbackStatus,
  FeedbackLogCapture,
  FeedbackLogCaptureConfig,
  Feedback,
  FeedbackInput,
  FeedbackAdminProps,
  // Release notes types
  ReleaseCategory,
  ReleaseNoteStatus,
  ReleaseNote,
  ReleaseNoteItem,
  ReleaseNoteMedia,
  ReleaseNoteInput,
  ReleaseNoteItemInput,
  ReleaseNoteTokenInfo,
  ReleaseNoteTokens,
  ReleaseNotesProps,
} from './types';
