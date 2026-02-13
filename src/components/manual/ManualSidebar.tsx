import { useMemo, useEffect } from 'react';
import { loadMaterialSymbols, isAutoLoadDisabled } from '../../styles/material-symbols';
import type { ManualSidebarProps, ManualItem } from '../../types';

/**
 * サイドバー用マニュアルリスト
 */
export function ManualSidebar({
  items,
  onSelect,
  activePath,
  className = '',
  onPiP,
  onNewTab,
}: ManualSidebarProps) {
  // Material Symbols フォントを読み込む（自動読み込みが無効化されていない場合）
  useEffect(() => {
    if (!isAutoLoadDisabled()) {
      loadMaterialSymbols();
    }
  }, []);

  // カテゴリでグループ化
  const groupedItems = useMemo(() => {
    const groups: Record<string, ManualItem[]> = {};
    const uncategorized: ManualItem[] = [];

    const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (const item of sortedItems) {
      if (item.category) {
        if (!groups[item.category]) {
          groups[item.category] = [];
        }
        groups[item.category].push(item);
      } else {
        uncategorized.push(item);
      }
    }

    return { groups, uncategorized };
  }, [items]);

  return (
    <nav className={`manual-sidebar ${className}`}>
      {/* カテゴリなし */}
      {groupedItems.uncategorized.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {groupedItems.uncategorized.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activePath === item.path}
              onSelect={onSelect}
              onPiP={onPiP}
              onNewTab={onNewTab}
            />
          ))}
        </ul>
      )}

      {/* カテゴリ別 */}
      {Object.entries(groupedItems.groups).map(([category, categoryItems]) => (
        <div key={category} style={{ marginTop: '16px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#666',
              textTransform: 'uppercase',
              padding: '8px 12px',
            }}
          >
            {category}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categoryItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activePath === item.path}
                onSelect={onSelect}
                onPiP={onPiP}
                onNewTab={onNewTab}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

interface SidebarItemProps {
  item: ManualItem;
  isActive: boolean;
  onSelect: (path: string) => void;
  onPiP?: (path: string) => void;
  onNewTab?: (path: string) => void;
}

function SidebarItem({ item, isActive, onSelect, onPiP, onNewTab }: SidebarItemProps) {
  const COLORS = {
    primary: '#043E80',
    gray100: '#F3F4F6',
    gray500: '#6B7280',
  };

  const styles = {
    itemRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      width: '100%',
    } as React.CSSProperties,
    itemButton: {
      display: 'block',
      flex: 1,
      padding: '8px 12px',
      border: 'none',
      background: isActive ? '#e3f2fd' : 'transparent',
      textAlign: 'left' as const,
      cursor: 'pointer',
      fontSize: '14px',
      color: isActive ? '#1976d2' : '#333',
      borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
    } as React.CSSProperties,
    actionButtons: {
      display: 'flex',
      gap: '2px',
      flexShrink: 0,
      paddingRight: '4px',
    } as React.CSSProperties,
    actionBtn: {
      background: 'none',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      color: COLORS.gray500,
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '2px',
      transition: 'background-color 0.15s ease, color 0.15s ease',
    } as React.CSSProperties,
    icon: {
      fontFamily: 'Material Symbols Outlined',
      fontSize: '16px',
      fontWeight: 'normal',
      fontStyle: 'normal',
      lineHeight: 1,
      letterSpacing: 'normal',
      textTransform: 'none' as const,
      display: 'inline-block',
      whiteSpace: 'nowrap' as const,
      wordWrap: 'normal' as const,
      direction: 'ltr' as const,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility' as const,
      fontFeatureSettings: "'liga'",
    } as React.CSSProperties,
  };

  return (
    <li>
      <div style={styles.itemRow}>
        <button
          onClick={() => onSelect(item.path)}
          style={styles.itemButton}
        >
          {item.title}
        </button>
        <div style={styles.actionButtons}>
          {onPiP && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPiP(item.path);
              }}
              style={styles.actionBtn}
              title="PiPで開く"
              aria-label="PiPで開く"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.gray100;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.gray500;
              }}
            >
              <span style={styles.icon}>picture_in_picture_alt</span>
            </button>
          )}
          {onNewTab && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewTab(item.path);
              }}
              style={styles.actionBtn}
              title="新しいタブで開く"
              aria-label="新しいタブで開く"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.gray100;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.gray500;
              }}
            >
              <span style={styles.icon}>open_in_new</span>
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
