import { useState } from 'react';
import { useManualLoader } from '../../hooks/useManualLoader';
import { MarkdownRenderer } from '../manual/MarkdownRenderer';
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

export function ManualTabContent({
  items,
  defaultPath,
  onNavigate,
  onAppNavigate,
  icons,
}: ManualTabContentProps) {
  const [selectedPath, setSelectedPath] = useState<string>(defaultPath || items[0]?.path || '');
  const { content, loading, error } = useManualLoader(selectedPath);

  const handleSelect = (path: string) => {
    setSelectedPath(path);
    onNavigate?.(path);
  };

  return (
    <div className="debug-manual-tab">
      <div className="debug-manual-sidebar">
        {items.map(item => (
          <button
            key={item.id}
            className={`debug-manual-item ${selectedPath === item.path ? 'active' : ''}`}
            onClick={() => handleSelect(item.path)}
            title={item.title}
          >
            {item.icon && (
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }} aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.title}
          </button>
        ))}
      </div>
      <div className="debug-manual-content">
        {loading && <div className="debug-empty">読み込み中...</div>}
        {error && <div className="debug-message debug-message-error">{error.message}</div>}
        {content && (
          <MarkdownRenderer
            content={content}
            onLinkClick={(path) => {
              setSelectedPath(path);
              onNavigate?.(path);
            }}
            onAppLinkClick={onAppNavigate}
            icons={icons}
          />
        )}
      </div>
    </div>
  );
}
