import { useState } from 'react';
import { useManualLoader } from '../../hooks/useManualLoader';
import { MarkdownRenderer } from '../manual/MarkdownRenderer';
import type { ManualItem } from '../../types';

interface ManualTabContentProps {
  items: ManualItem[];
  defaultPath?: string;
  onNavigate?: (path: string) => void;
  onAppNavigate?: (path: string) => void;
}

export function ManualTabContent({
  items,
  defaultPath,
  onNavigate,
  onAppNavigate,
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
          />
        )}
      </div>
    </div>
  );
}
