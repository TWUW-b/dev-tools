import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useManualHeadings } from '../../hooks/useManualHeadings';
import type { ManualItem, ManualTableOfContentsProps } from '../../types';
import { MANUAL_COLORS as COLORS } from '../../styles/colors';

interface CategoryGroup {
  category: string;
  items: ManualItem[];
}

/** カテゴリでグループ化（ManualSidebar.tsx のロジックを踏襲。順序は order でソート） */
function groupByCategory(items: ManualItem[]): { groups: CategoryGroup[]; uncategorized: ManualItem[] } {
  const groupMap: Record<string, ManualItem[]> = {};
  const uncategorized: ManualItem[] = [];
  const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const item of sortedItems) {
    if (item.category) {
      if (!groupMap[item.category]) {
        groupMap[item.category] = [];
      }
      groupMap[item.category].push(item);
    } else {
      uncategorized.push(item);
    }
  }

  const groups = Object.entries(groupMap).map(([category, categoryItems]) => ({
    category,
    items: categoryItems,
  }));

  return { groups, uncategorized };
}

function findCategoryForPath(items: ManualItem[], path?: string | null): string | null {
  if (!path) return null;
  return items.find((item) => item.path === path)?.category ?? null;
}

/** DOM id として安全な文字列に変換（空白文字を除去） */
function toDomId(value: string): string {
  return value.replace(/\s+/g, '-');
}

/**
 * マニュアル階層目次（カテゴリ → ページ → 見出し）。
 * ManualPiP（オーバーレイパネル内）・ManualTabPage（常設サイドバー内）の両方から使う。
 * 特定の document には依存しない作りにしてある。
 */
export function ManualTableOfContents({
  items,
  activePath,
  onSelectPage,
  onSelectHeading,
  activeHeadingId = null,
  className = '',
}: ManualTableOfContentsProps) {
  const { groups, uncategorized } = useMemo(() => groupByCategory(items), [items]);
  const { getHeadings, loadHeadings, isLoading, getError } = useManualHeadings();

  // カテゴリの開閉状態。デフォルトは activePath を含むカテゴリのみ開く
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const activeCategory = findCategoryForPath(items, activePath);
    const initial: Record<string, boolean> = {};
    for (const group of groups) {
      initial[group.category] = group.category === activeCategory;
    }
    return initial;
  });

  // activePath が変化した際、そのページを含むカテゴリを開く（既存の開閉状態は維持し、
  // 該当カテゴリのみ追加で開く）。
  // ManualTabPage の docPath は useEffect で遅れて確定するため（初回マウント直後は null）、
  // 上の useState 初期化子は activePath=null の時点で1度だけ評価され、後から
  // defaultDocPath が反映されても再計算されない。これを追跡して確実に開く。
  useEffect(() => {
    const activeCategory = findCategoryForPath(items, activePath);
    if (!activeCategory) return;
    setOpenCategories((prev) => (prev[activeCategory] ? prev : { ...prev, [activeCategory]: true }));
  }, [activePath, items]);

  // ページごとの見出し展開状態
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  // ユーザーが明示的に閉じた（＝スクロールスパイによる自動再展開を望んでいない）ページの集合。
  // ページタイトルクリック・トグルボタンのどちらで閉じても対象になる。再度開けば解除される。
  const manuallyCollapsedRef = useRef<Set<string>>(new Set());

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const togglePageHeadings = useCallback(
    (path: string) => {
      setExpandedPages((prev) => {
        const next = !(prev[path] ?? false);
        if (next) {
          loadHeadings(path);
          manuallyCollapsedRef.current.delete(path);
        } else {
          manuallyCollapsedRef.current.add(path);
        }
        return { ...prev, [path]: next };
      });
    },
    [loadHeadings]
  );

  // スクロールスパイ: activeHeadingId が指すページ（＝現在表示中のページ）の見出しリストが
  // 閉じている場合は自動的に展開する（でないとハイライトが見えないため）。
  // ただし、ユーザーが明示的に閉じたページ（manuallyCollapsedRef）は対象外にする。
  // でないと、閉じた直後に次の見出しへスクロールしただけで再展開されてしまい、
  // 「クリックする度に開閉が切り替わるトグル動作」（要件3）が維持できない。
  useEffect(() => {
    if (!activeHeadingId || !activePath) return;
    if (manuallyCollapsedRef.current.has(activePath)) return;
    loadHeadings(activePath);
    setExpandedPages((prev) => (prev[activePath] ? prev : { ...prev, [activePath]: true }));
  }, [activeHeadingId, activePath, loadHeadings]);

  const renderPage = (item: ManualItem) => {
    const isActive = activePath === item.path;
    const isExpanded = expandedPages[item.path] ?? false;
    const headings = getHeadings(item.path);
    const loading = isLoading(item.path);
    const error = getError(item.path);
    const headingsListId = `manual-toc-headings-${toDomId(item.id)}`;

    return (
      <li key={item.id}>
        <div style={styles.pageRow}>
          <button
            type="button"
            onClick={() => {
              onSelectPage(item.path);
              togglePageHeadings(item.path);
            }}
            aria-expanded={isExpanded}
            aria-controls={headingsListId}
            style={{
              ...styles.pageButton,
              background: isActive ? '#e3f2fd' : 'transparent',
              color: isActive ? COLORS.primary : COLORS.gray700,
              borderLeft: isActive ? `3px solid ${COLORS.primary}` : '3px solid transparent',
            }}
          >
            {item.title}
          </button>
          <button
            type="button"
            onClick={() => togglePageHeadings(item.path)}
            style={styles.toggleHeadingsButton}
            aria-expanded={isExpanded}
            aria-controls={headingsListId}
            aria-label={isExpanded ? `${item.title} の見出しを閉じる` : `${item.title} の見出しを開く`}
            title={isExpanded ? '見出しを閉じる' : '見出しを開く'}
          >
            <span style={styles.chevronIcon}>{isExpanded ? 'expand_less' : 'expand_more'}</span>
          </button>
        </div>

        {isExpanded && (
          <ul id={headingsListId} style={styles.headingList} role="group">
            {loading && <li style={styles.headingStatus}>読み込み中...</li>}
            {!loading && error && <li style={{ ...styles.headingStatus, color: COLORS.error }}>見出しの読み込みに失敗しました</li>}
            {!loading && !error && headings && headings.length === 0 && (
              <li style={styles.headingStatus}>見出しなし</li>
            )}
            {!loading &&
              !error &&
              headings?.map((heading) => {
                const isSubHeading = heading.level === 3;
                // heading.id は useManualHeadings が呼び出し毎に新しい GithubSlugger インスタンスで
                // 生成するため、ページをまたいで一意ではない（例: 複数ページの「手順」見出しが
                // どちらも id="手順" になる）。activeHeadingId だけで比較すると、展開中の
                // 全ページの同名見出しが同時にハイライトされてしまうため、必ず isActive
                // （= このページが現在表示中かどうか）も条件に含める。
                const isActiveHeading = isActive && activeHeadingId === heading.id;

                return (
                  <li key={heading.id}>
                    <button
                      type="button"
                      onClick={() => onSelectHeading(item.path, heading.id)}
                      style={{
                        ...styles.headingButton,
                        paddingLeft: isSubHeading ? '38px' : '20px',
                        fontSize: isSubHeading ? '12px' : '13px',
                        color: isActiveHeading ? COLORS.primary : isSubHeading ? COLORS.gray500 : COLORS.gray700,
                        background: isActiveHeading ? '#e3f2fd' : 'transparent',
                        borderLeft: isActiveHeading ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                        fontWeight: isActiveHeading ? 600 : 400,
                      }}
                    >
                      <span
                        style={{
                          ...styles.headingDot,
                          ...(isSubHeading ? styles.headingDotSub : null),
                          ...(isActiveHeading ? { background: COLORS.primary } : null),
                        }}
                      />
                      <span style={styles.headingText}>{heading.text}</span>
                    </button>
                  </li>
                );
              })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className={`manual-toc ${className}`} aria-label="マニュアル目次" style={styles.nav}>
      {uncategorized.length > 0 && (
        <ul style={styles.list}>{uncategorized.map(renderPage)}</ul>
      )}

      {groups.map((group, index) => {
        const isOpen = openCategories[group.category] ?? false;
        const categoryListId = `manual-toc-category-${index}`;

        return (
          <div key={group.category} style={styles.categoryBlock}>
            <button
              type="button"
              onClick={() => toggleCategory(group.category)}
              style={styles.categoryButton}
              aria-expanded={isOpen}
              aria-controls={categoryListId}
            >
              <span style={styles.categoryChevron} aria-hidden="true">{isOpen ? 'expand_more' : 'chevron_right'}</span>
              <span>{group.category}</span>
            </button>
            {isOpen && (
              <ul id={categoryListId} style={styles.list}>
                {group.items.map(renderPage)}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  categoryBlock: {
    marginBottom: '2px',
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    color: COLORS.gray700,
    textTransform: 'uppercase',
  },
  categoryChevron: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '18px',
    lineHeight: 1,
    flexShrink: 0,
  },
  pageRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  pageButton: {
    display: 'block',
    flex: 1,
    padding: '8px 8px 8px 12px',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
  },
  toggleHeadingsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    flexShrink: 0,
    marginRight: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: COLORS.gray500,
    borderRadius: '4px',
  },
  chevronIcon: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '18px',
    lineHeight: 1,
  },
  headingList: {
    listStyle: 'none',
    margin: '0 0 4px 20px',
    padding: 0,
    borderLeft: `1px solid ${COLORS.gray300}`,
  },
  headingButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '6px 10px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '13px',
    color: COLORS.gray700,
  },
  headingDot: {
    flexShrink: 0,
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: COLORS.gray300,
  },
  headingDotSub: {
    width: '4px',
    height: '4px',
    background: COLORS.gray300,
    opacity: 0.7,
  },
  headingText: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headingStatus: {
    padding: '6px 24px',
    fontSize: '12px',
    color: COLORS.gray500,
  },
};
