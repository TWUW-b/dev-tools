// Components
export { DebugPanel } from './components/DebugPanel';
export { DebugAdmin } from './components/DebugAdmin';

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
export { setDebugApiBaseUrl } from './utils/api';
export { maskSensitive } from './utils/maskSensitive';
export { parseTestCaseMd } from './utils/parseTestCaseMd';
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
} from './types';
