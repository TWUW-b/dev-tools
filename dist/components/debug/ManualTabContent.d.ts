import type { ManualItem } from '../../types';
import type { ReactNode } from 'react';
interface ManualTabContentProps {
    items: ManualItem[];
    defaultPath?: string;
    onNavigate?: (path: string) => void;
    onAppNavigate?: (path: string) => void;
    /** 本文中の `<app-icon name="...">` を解決するアイコン */
    icons?: Record<string, ReactNode>;
}
export declare function ManualTabContent({ items, defaultPath, onNavigate, onAppNavigate, icons, }: ManualTabContentProps): import("react/jsx-runtime").JSX.Element;
export {};
