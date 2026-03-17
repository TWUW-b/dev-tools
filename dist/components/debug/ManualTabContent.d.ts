import type { ManualItem } from '../../types';
interface ManualTabContentProps {
    items: ManualItem[];
    defaultPath?: string;
    onNavigate?: (path: string) => void;
    onAppNavigate?: (path: string) => void;
}
export declare function ManualTabContent({ items, defaultPath, onNavigate, onAppNavigate, }: ManualTabContentProps): import("react/jsx-runtime").JSX.Element;
export {};
