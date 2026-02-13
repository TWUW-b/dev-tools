import { useState, useEffect, useCallback, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FeedbackForm } from './FeedbackForm';
import { useManualLoader } from '../../hooks/useManualLoader';
import { useResizable } from '../../hooks/useResizable';
import { useFeedbackAdminMode } from '../../hooks/useFeedbackAdminMode';
import { loadMaterialSymbols, isAutoLoadDisabled } from '../../styles/material-symbols';
import type { ManualTabPageProps } from '../../types';
import { MANUAL_COLORS as COLORS } from '../../styles/colors';

// モジュールレベルで定義し、毎レンダーの再生成を回避
const GLOBAL_CSS = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.manual-resize-handle {
  background-color: ${COLORS.gray300};
}

.manual-resize-handle:hover,
.manual-resize-handle.resizing {
  background-color: ${COLORS.secondary};
}

.manual-v-resize-handle {
  background-color: ${COLORS.gray300};
}

.manual-v-resize-handle:hover,
.manual-v-resize-handle.resizing {
  background-color: ${COLORS.secondary};
}

@media print {
  .manual-tab-page > header { display: none !important; }
  .manual-tab-page main { max-width: 100% !important; }
  .manual-tab-page .manual-resize-handle,
  .manual-tab-page .manual-v-resize-handle,
  .manual-tab-page aside { display: none !important; }
}

/* Markdown スタイル */
.manual-markdown {
  color: ${COLORS.gray700};
}

.manual-markdown h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${COLORS.primary};
  border-bottom: 2px solid ${COLORS.secondary};
  padding-bottom: 8px;
}

.manual-markdown h2 {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${COLORS.tertiary};
}

.manual-markdown h3 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${COLORS.gray700};
}

.manual-markdown p {
  margin-bottom: 12px;
}

.manual-markdown ul,
.manual-markdown ol {
  margin-bottom: 12px;
  padding-left: 24px;
}

.manual-markdown li {
  margin-bottom: 4px;
}

.manual-markdown a {
  color: ${COLORS.primary};
  text-decoration: underline;
  cursor: pointer;
}

.manual-markdown a:hover {
  color: ${COLORS.tertiary};
}

.manual-markdown code {
  background: ${COLORS.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

.manual-markdown pre {
  background: ${COLORS.gray100};
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.manual-markdown pre code {
  background: transparent;
  padding: 0;
}

.manual-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.manual-markdown th,
.manual-markdown td {
  border: 1px solid ${COLORS.gray300};
  padding: 8px 12px;
  text-align: left;
}

.manual-markdown th {
  background: ${COLORS.gray100};
  font-weight: 600;
}

.manual-markdown hr {
  border: none;
  border-top: 1px solid ${COLORS.gray300};
  margin: 24px 0;
}

.manual-markdown blockquote {
  border-left: 4px solid ${COLORS.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${COLORS.gray500};
}
`;

/** 相対パスを解決し、../や./を正規化する */
function resolveDocPath(path: string, currentPath: string | null): string {
  if (path.startsWith('/')) return path;
  const basePath = currentPath ? currentPath.substring(0, currentPath.lastIndexOf('/') + 1) : '/docs/';
  // URL APIで../や./を正規化
  try {
    const resolved = new URL(path, 'http://d' + basePath);
    return resolved.pathname;
  } catch {
    return basePath + path;
  }
}

/**
 * 別タブ用マニュアル表示ページ
 * URLクエリパラメータ `?path=/docs/xxx.md` でマニュアルを表示
 * `sidebarPath` を指定するとリサイズ可能なサイドバーが開く
 * `feedbackApiBaseUrl` を指定するとフィードバック機能が有効化
 */
export function ManualTabPage({
  defaultDocPath,
  sidebarPath,
  onSidebarNavigate,
  onSidebarAppNavigate,
  sidebarDefaultWidth = 400,
  sidebarMinWidth = 250,
  sidebarMaxWidth = 800,
  feedbackApiBaseUrl,
  feedbackUserType,
  feedbackAppVersion,
  feedbackAdminUrl,
  feedbackDefaultHeight = 350,
  feedbackMinHeight = 200,
  feedbackMaxHeight = 600,
  onFeedbackSubmitSuccess,
  onFeedbackSubmitError,
}: ManualTabPageProps = {}) {
  const [docPath, setDocPath] = useState<string | null>(null);
  const { content, loading, error } = useManualLoader(docPath);

  // フィードバック表示制御
  const [feedbackVisible, setFeedbackVisible] = useState(true);
  const [tocHeight, setTocHeight] = useState(400);

  // サイドバー用（内部state管理）
  const [internalSidebarPath, setInternalSidebarPath] = useState<string | null>(sidebarPath ?? null);

  // sidebarPath propsが変わったら内部stateをリセット（Uncontrolled時のみ）
  useEffect(() => {
    if (onSidebarNavigate === undefined) {
      setInternalSidebarPath(sidebarPath ?? null);
    }
  }, [sidebarPath, onSidebarNavigate]);

  // Controlled（onSidebarNavigateあり）かUncontrolled（なし）かを判定
  const isControlledSidebar = onSidebarNavigate !== undefined;
  const currentSidebarPath = isControlledSidebar ? (sidebarPath ?? null) : internalSidebarPath;

  const {
    content: sidebarContent,
    loading: sidebarLoading,
    error: sidebarError,
  } = useManualLoader(currentSidebarPath);

  const { size: sidebarWidth, isResizing, handleMouseDown, handleKeyDown: handleSidebarKeyDown } = useResizable({
    defaultSize: sidebarDefaultWidth,
    minSize: sidebarMinWidth,
    maxSize: sidebarMaxWidth,
  });

  // 縦リサイズ（TOC/フィードバック境界）
  const hasBothPanels = sidebarPath != null && feedbackApiBaseUrl != null;
  const tocSectionRef = useRef<HTMLDivElement>(null);

  const {
    size: tocHeightResizable,
    isResizing: isFeedbackResizing,
    handleMouseDown: handleFeedbackResizeMouseDown,
    handleKeyDown: handleFeedbackKeyDown,
  } = useResizable({
    defaultSize: feedbackDefaultHeight,
    minSize: feedbackMinHeight,
    maxSize: feedbackMaxHeight,
    direction: 'vertical',
    enabled: hasBothPanels && feedbackVisible,
  });

  // tocHeightをuseResizableの結果で更新
  useEffect(() => {
    if (hasBothPanels && feedbackVisible) {
      setTocHeight(tocHeightResizable);
    }
  }, [tocHeightResizable, hasBothPanels, feedbackVisible]);

  // 隠しコマンド
  const showAdminButton = useFeedbackAdminMode();

  const sidebarContentRef = useRef<HTMLDivElement>(null);

  // Material Symbols フォントを読み込む（自動読み込みが無効化されていない場合）
  useEffect(() => {
    if (!isAutoLoadDisabled()) {
      loadMaterialSymbols();
    }
  }, []);

  // サイドバーパス変更時にスクロール位置をリセット
  useEffect(() => {
    if (sidebarContentRef.current) {
      sidebarContentRef.current.scrollTop = 0;
    }
  }, [currentSidebarPath]);

  const showSidebar = sidebarPath != null || feedbackApiBaseUrl != null;

  // URLからパスを取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get('path');
    if (path) {
      setDocPath(path);
    } else if (defaultDocPath) {
      setDocPath(defaultDocPath);
    }
  }, [defaultDocPath]);

  // マークダウン内リンククリック（同じタブ内で遷移）
  const handleLinkClick = useCallback(
    (path: string) => {
      const resolvedPath = resolveDocPath(path, docPath);

      // URLを更新して再読み込み
      const newUrl = `${window.location.pathname}?path=${encodeURIComponent(resolvedPath)}`;
      window.history.pushState({}, '', newUrl);
      setDocPath(resolvedPath);
    },
    [docPath]
  );

  // アプリリンククリック（親ウィンドウに通知）
  const handleAppLinkClick = useCallback((path: string) => {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'manual-app-navigate', path }, window.location.origin);
    }
  }, []);

  // サイドバー内リンククリック
  const handleSidebarLinkClick = useCallback(
    (path: string) => {
      const resolvedPath = resolveDocPath(path, currentSidebarPath);

      if (isControlledSidebar) {
        // Controlled: 親に委譲（既存動作）
        onSidebarNavigate!(resolvedPath);
      } else {
        // Uncontrolled: 内部で自動遷移
        setInternalSidebarPath(resolvedPath);
      }
    },
    [isControlledSidebar, onSidebarNavigate, currentSidebarPath]
  );

  // サイドバー内アプリリンククリック
  const handleSidebarAppLinkClick = useCallback(
    (path: string) => {
      onSidebarAppNavigate?.(path);
    },
    [onSidebarAppNavigate]
  );

  // ブラウザの戻る/進むに対応
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const path = params.get('path');
      if (path) {
        setDocPath(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="manual-tab-page" style={styles.container}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.icon}>menu_book</span>
          <span style={styles.title}>マニュアル</span>
        </div>
        <div style={styles.headerRight}>
          {/* 隠しコマンド: 管理画面ボタン */}
          {showAdminButton && feedbackAdminUrl && (
            <button
              onClick={() => window.open(feedbackAdminUrl, '_blank')}
              style={styles.headerButton}
              title="フィードバック管理"
            >
              <span style={styles.icon}>admin_panel_settings</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            style={styles.headerButton}
            title="印刷"
          >
            <span style={styles.icon}>print</span>
          </button>
        </div>
      </header>

      {/* メイン + サイドバー */}
      <div style={styles.body}>
        {/* メインペイン */}
        <main style={styles.mainPane}>
          <div style={styles.mainContent}>
            {loading && (
              <div style={styles.loading}>
                <span style={{ ...styles.icon, animation: 'spin 1s linear infinite' }}>
                  progress_activity
                </span>
                <span>読み込み中...</span>
              </div>
            )}

            {error && (
              <div style={styles.error}>
                <span style={styles.icon}>warning</span>
                <div>
                  <div style={styles.errorTitle}>エラーが発生しました</div>
                  <div style={styles.errorDetail}>{error.message}</div>
                </div>
              </div>
            )}

            {content && (
              <MarkdownRenderer
                content={content}
                onLinkClick={handleLinkClick}
                onAppLinkClick={handleAppLinkClick}
              />
            )}

            {!loading && !error && !content && !docPath && (
              <div style={styles.empty}>
                <span style={{ ...styles.icon, fontSize: '64px', opacity: 0.5 }}>description</span>
                <span>マニュアルが指定されていません</span>
              </div>
            )}
          </div>
        </main>

        {/* リサイズハンドル + サイドバー */}
        {showSidebar && (
          <>
            <div
              className={`manual-resize-handle${isResizing ? ' resizing' : ''}`}
              onMouseDown={handleMouseDown}
              onKeyDown={handleSidebarKeyDown}
              style={styles.resizeHandle}
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={sidebarWidth}
              aria-valuemin={sidebarMinWidth}
              aria-valuemax={sidebarMaxWidth}
              aria-label="サイドバーのリサイズ"
              tabIndex={0}
            />
            <aside style={{ ...styles.sidebarPane, width: sidebarWidth }}>
              {/* TOC Section */}
              {sidebarPath != null && (
                <div
                  ref={tocSectionRef}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: feedbackApiBaseUrl && feedbackVisible ? `0 0 ${tocHeight}px` : 1,
                    minHeight: 0,
                  }}
                >
                  <div style={styles.sidebarHeader}>
                    {/* 戻るボタン（Uncontrolled時、初期ページと異なる場合のみ表示） */}
                    {!isControlledSidebar && internalSidebarPath !== sidebarPath && (
                      <button
                        onClick={() => setInternalSidebarPath(sidebarPath ?? null)}
                        style={styles.backButton}
                        title="初期ページに戻る"
                      >
                        <span style={{ ...styles.icon, fontSize: '20px' }}>home</span>
                      </button>
                    )}
                    <span style={{ ...styles.icon, fontSize: '20px', color: COLORS.tertiary }}>
                      auto_stories
                    </span>
                    <span style={styles.sidebarTitle}>参照</span>
                  </div>
                  <div
                    ref={sidebarContentRef}
                    style={styles.sidebarContent}
                  >
                    {sidebarLoading && (
                      <div style={styles.loading}>
                        <span style={{ ...styles.icon, animation: 'spin 1s linear infinite' }}>
                          progress_activity
                        </span>
                        <span>読み込み中...</span>
                      </div>
                    )}

                    {sidebarError && (
                      <div style={styles.error}>
                        <span style={styles.icon}>warning</span>
                        <div>
                          <div style={styles.errorTitle}>エラー</div>
                          <div style={styles.errorDetail}>{sidebarError.message}</div>
                        </div>
                      </div>
                    )}

                    {sidebarContent && (
                      <MarkdownRenderer
                        content={sidebarContent}
                        onLinkClick={handleSidebarLinkClick}
                        onAppLinkClick={handleSidebarAppLinkClick}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 縦リサイズハンドル（TOC と Feedback の間） */}
              {sidebarPath && feedbackApiBaseUrl && feedbackVisible && (
                <div
                  className={`manual-v-resize-handle${isFeedbackResizing ? ' resizing' : ''}`}
                  onMouseDown={handleFeedbackResizeMouseDown}
                  onKeyDown={handleFeedbackKeyDown}
                  style={styles.vResizeHandle}
                  role="separator"
                  aria-orientation="horizontal"
                  aria-valuenow={tocHeight}
                  aria-valuemin={150}
                  aria-valuemax={800}
                  aria-label="TOC領域のリサイズ"
                  tabIndex={0}
                />
              )}

              {/* Feedback Section */}
              {feedbackApiBaseUrl != null && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: feedbackVisible
                      ? (sidebarPath ? 'auto' : '100%')
                      : 'auto',
                    flex: feedbackVisible && !sidebarPath ? 1 : feedbackVisible ? '1 1 0' : '0 0 auto',
                    minHeight: 0,
                  }}
                >
                  <div style={styles.feedbackHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ ...styles.icon, fontSize: '20px', color: COLORS.tertiary }}>
                        rate_review
                      </span>
                      <span style={styles.sidebarTitle}>フィードバック</span>
                    </div>
                    <button
                      onClick={() => setFeedbackVisible(!feedbackVisible)}
                      style={styles.toggleBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.gray100;
                        e.currentTarget.style.borderColor = COLORS.gray700;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = COLORS.gray300;
                      }}
                      aria-label={feedbackVisible ? 'フィードバックを閉じる' : 'フィードバックを開く'}
                      title={feedbackVisible ? 'フィードバックを閉じる' : 'フィードバックを開く'}
                    >
                      <span style={{ ...styles.icon, fontSize: '18px' }}>
                        {feedbackVisible ? 'expand_less' : 'expand_more'}
                      </span>
                      <span>{feedbackVisible ? '閉じる' : '開く'}</span>
                    </button>
                  </div>
                  {feedbackVisible && (
                    <div style={styles.feedbackContent}>
                      <FeedbackForm
                        apiBaseUrl={feedbackApiBaseUrl}
                        userType={feedbackUserType}
                        appVersion={feedbackAppVersion}
                        onSubmitSuccess={onFeedbackSubmitSuccess}
                        onSubmitError={onFeedbackSubmitError}
                      />
                    </div>
                  )}
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {/* スタイル */}
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  icon: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '24px',
    lineHeight: 1,
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: COLORS.white,
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  mainPane: {
    flex: 1,
    overflow: 'auto',
    minWidth: 0,
  },
  mainContent: {
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    lineHeight: 1.7,
  },
  resizeHandle: {
    width: '6px',
    cursor: 'col-resize',
    flexShrink: 0,
    transition: 'background-color 0.15s ease',
  },
  sidebarPane: {
    overflow: 'hidden',
    flexShrink: 0,
    borderLeft: `1px solid ${COLORS.gray300}`,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: `1px solid ${COLORS.gray300}`,
    backgroundColor: COLORS.gray100,
    flexShrink: 0,
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.tertiary,
  },
  sidebarTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.tertiary,
  },
  sidebarContent: {
    padding: '24px 16px',
    lineHeight: 1.7,
    flex: 1,
    overflow: 'auto',
  },
  vResizeHandle: {
    height: '6px',
    cursor: 'row-resize',
    flexShrink: 0,
    transition: 'background-color 0.15s ease',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `1px solid ${COLORS.gray300}`,
    borderBottom: `1px solid ${COLORS.gray300}`,
    backgroundColor: COLORS.gray100,
    flexShrink: 0,
  },
  toggleBtn: {
    background: 'transparent',
    border: `1px solid ${COLORS.gray300}`,
    padding: '8px 12px',
    cursor: 'pointer',
    color: COLORS.gray700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    minHeight: '36px',
  },
  feedbackContent: {
    flex: 1,
    overflow: 'auto',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: COLORS.gray500,
    fontSize: '16px',
  },
  error: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: COLORS.errorBg,
    border: '1px solid #FECACA',
    borderRadius: '12px',
    color: COLORS.error,
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  errorDetail: {
    fontSize: '14px',
    marginTop: '8px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '12px',
    color: COLORS.gray500,
    fontSize: '14px',
  },
};
