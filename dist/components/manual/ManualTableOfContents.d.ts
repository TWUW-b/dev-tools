import type { ManualTableOfContentsProps } from '../../types';
/**
 * マニュアル階層目次（カテゴリ → ページ → 見出し）。
 * ManualPiP（オーバーレイパネル内）・ManualTabPage（常設サイドバー内）の両方から使う。
 * 特定の document には依存しない作りにしてある。
 */
export declare function ManualTableOfContents({ items, activePath, onSelectPage, onSelectHeading, activeHeadingId, className, }: ManualTableOfContentsProps): import("react/jsx-runtime").JSX.Element;
