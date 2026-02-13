// Components
export { DebugPanel } from './components/DebugPanel';
export { DebugAdmin } from './components/DebugAdmin';

// Hooks
export { useDebugMode } from './hooks/useDebugMode';
export { useDebugNotes } from './hooks/useDebugNotes';

// Utils
export { setDebugApiBaseUrl } from './utils/api';
export { maskSensitive } from './utils/maskSensitive';
export { parseTestCaseMd } from './utils/parseTestCaseMd';
export { createLogCapture } from './utils/logCapture';

// Types
export type {
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
  EnvironmentInfo,
  ConsoleLogConfig,
  NetworkLogConfig,
  LogCaptureConfig,
  LogCaptureInstance,
} from './types';
