import type { MarkdownRendererProps } from '../../types';
/**
 * Markdown → HTML 変換・表示コンポーネント
 * - .mdリンク → onLinkClick（PiP内遷移）
 * - app:/...リンク → onAppLinkClick（メイン画面遷移）
 * - その他 → 新しいタブで開く
 */
export declare function MarkdownRenderer({ content, className, onLinkClick, onAppLinkClick, }: MarkdownRendererProps): import("react/jsx-runtime").JSX.Element;
