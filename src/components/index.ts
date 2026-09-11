export { DebugPanel } from './DebugPanel';
export { DebugAdmin } from './DebugAdmin';
export { DevTools } from './DevTools';
export type { DevToolsProps } from './DevTools';

// Release notes（アプリ内表示用。公開ページは PHP 側が返すので不要）
export { ReleaseNotes } from './ReleaseNotes';

// 画像の拡大表示（MarkdownRenderer / ReleaseNotes が内部で使う。単体でも使える）
export { ImageLightbox } from './ImageLightbox';

// Manual components
export {
  MarkdownRenderer,
  ManualPiP,
  ManualSidebar,
  ManualTableOfContents,
  ManualLink,
  ManualPage,
  ManualTabPage,
  FeedbackAdmin,
  FeedbackForm,
} from './manual';
