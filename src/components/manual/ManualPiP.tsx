import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FeedbackForm } from './FeedbackForm';
import { ManualTableOfContents } from './ManualTableOfContents';
import { useManualLoader } from '../../hooks/useManualLoader';
import { useManualDownload } from '../../hooks/useManualDownload';
import { MATERIAL_SYMBOLS_CDN, materialSymbolsStyle } from '../../styles/material-symbols';
import type { ManualPiPProps } from '../../types';
import { MANUAL_COLORS as COLORS } from '../../styles/colors';

/** 目次パネルからページ遷移後、スクロールすべき見出しの保留情報 */
interface PendingScrollTarget {
  path: string;
  headingId: string;
}

// Document Picture-in-Picture API 型定義
interface DocumentPictureInPictureOptions {
  width?: number;
  height?: number;
}

interface DocumentPictureInPicture extends EventTarget {
  requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
  window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
    // PiP ウィンドウは別の document/window コンテキストなので、そちら側の
    // IntersectionObserver コンストラクタを明示的に型付けして使う
    // （lib.dom.d.ts の Window インターフェースには含まれていないため）。
    IntersectionObserver: typeof IntersectionObserver;
  }
}

/**
 * PiP（Picture-in-Picture）フローティングウィンドウ
 * Document Picture-in-Picture API を使用して別ウィンドウで表示
 */
export function ManualPiP({
  isOpen,
  docPath,
  onClose,
  onNavigate,
  onAppNavigate,
  initialSize = { width: 420, height: 550 },
  showDownloadButton = false,
  items,
  feedbackApiBaseUrl,
  feedbackUserType,
  feedbackAppVersion,
  onFeedbackSubmitSuccess,
  onFeedbackSubmitError,
  feedbackDefaultHeight: _feedbackDefaultHeight = 200,
  feedbackMinHeight: _feedbackMinHeight = 150,
  feedbackMaxHeight: _feedbackMaxHeight = 400,
}: ManualPiPProps) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const { content, loading, error } = useManualLoader(docPath);
  const { downloadMd } = useManualDownload();
  const isOpeningRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // フィードバック表示制御
  const showFeedbackPanel = feedbackApiBaseUrl != null;
  const [feedbackVisible, setFeedbackVisible] = useState(true);

  // 目次パネル表示制御（items が指定されている場合のみ）
  const [isTocOpen, setIsTocOpen] = useState(false);
  const pendingScrollRef = useRef<PendingScrollTarget | null>(null);
  // pending スクロール対象への遷移中、実際に該当パスのフェッチが開始（loading=true）されたのを
  // 一度でも観測したかどうか。useManualLoader は path 変更時に content を null リセットしないため、
  // docPath 切替直後の再レンダーでは content が前ページの内容のまま残ることがある。
  // loading=true を経由したことを確認してからでないと、前ページの DOM に対して誤ってスクロールを
  // 試みてしまう（stale content レース）。
  const hasSeenLoadingForPendingRef = useRef(false);
  const tocPanelRef = useRef<HTMLDivElement | null>(null);

  // スクロールスパイ: pip-content 内の現在表示中の見出し id（目次パネルのハイライトに使用）
  const pipContentRef = useRef<HTMLElement | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  // 現在の docPath に対して実際に fetch が開始（loading=true）されたのを一度でも観測したか。
  // useManualLoader は docPath 変更時に content を null リセットしないため、docPath 切替直後の
  // 再レンダーでは content が前ページの内容のまま残ることがある（stale content レース）。
  // pending-scroll エフェクト（hasSeenLoadingForPendingRef）と同じ手法で、スクロールスパイ側にも
  // 同等のガードを設ける。
  const hasSeenLoadingForCurrentDocRef = useRef(false);

  // PiPウィンドウを開く
  const openPipWindow = useCallback(async () => {
    if (!window.documentPictureInPicture) {
      console.warn('Document Picture-in-Picture API is not supported');
      return;
    }

    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    try {
      // フィードバックがある場合はウィンドウ幅を広げる
      const pipWidth = showFeedbackPanel ? 650 : initialSize.width;
      const pipHeight = initialSize.height;

      const pip = await window.documentPictureInPicture.requestWindow({
        width: pipWidth,
        height: pipHeight,
      });

      // スタイルを追加
      const style = pip.document.createElement('style');
      style.textContent = getPipStyles();
      pip.document.head.appendChild(style);

      // コンテナを作成
      const container = pip.document.createElement('div');
      container.id = 'manual-pip-root';
      pip.document.body.appendChild(container);

      setPipWindow(pip);
      setPipContainer(container);

      // ウィンドウが閉じられたときの処理
      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
        setPipContainer(null);
        onClose();
      });
    } catch (err) {
      console.error('Failed to open PiP window:', err);
    } finally {
      isOpeningRef.current = false;
    }
  }, [initialSize.width, initialSize.height, onClose]);

  // PiPウィンドウを閉じる
  const closePipWindow = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      setPipContainer(null);
    }
  }, [pipWindow]);

  // isOpenが変更されたときにウィンドウを開閉
  useEffect(() => {
    if (isOpen && !pipWindow) {
      openPipWindow();
    } else if (!isOpen && pipWindow) {
      closePipWindow();
    }
  }, [isOpen, pipWindow, openPipWindow, closePipWindow]);

  // マークダウンリンククリック
  const handleLinkClick = useCallback(
    (path: string) => {
      if (onNavigate) {
        const basePath = docPath ? docPath.substring(0, docPath.lastIndexOf('/') + 1) : '/docs/';
        const resolvedPath = path.startsWith('/') ? path : basePath + path;
        onNavigate(resolvedPath);
      }
    },
    [docPath, onNavigate]
  );

  // rehypeRaw で処理された生のHTMLリンク（<details>内など）に手動でイベントリスナーを追加
  // PiPウィンドウは別のブラウジングコンテキストなので、pipWindow.documentにリスナーを追加
  useEffect(() => {
    if (!pipWindow || pipWindow.closed || !onAppNavigate) return;

    const handleAppLink = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;

      if (link) {
        const href = link.getAttribute('href');
        console.log('[ManualPiP] Link clicked', {
          href,
          text: link.textContent?.substring(0, 30),
          startsWithHashApp: href?.startsWith('#app:')
        });

        // #app:/path 形式を検出（マークダウン前処理で app: → #app: に変換済み）
        if (href && href.startsWith('#app:')) {
          console.log('[ManualPiP] App link detected! Preventing default');
          e.preventDefault();
          e.stopPropagation();
          const appPath = href.replace('#app:', '');
          console.log('[ManualPiP] Calling onAppNavigate', { appPath });
          onAppNavigate(appPath);
        }
      }
    };

    // トグル開閉の監視
    const handleToggle = (e: Event) => {
      const details = e.target as HTMLDetailsElement;
      const summary = details.querySelector('summary')?.textContent || 'unknown';
      console.log('[ManualPiP] Details toggle', {
        open: details.open,
        summary,
      });

      if (details.open) {
        // 少し遅延してから検索（DOMレンダリング待ち）
        setTimeout(() => {
          // トグルが開かれたときに、中のapp:リンクをスキャン
          const appLinks = details.querySelectorAll('a[href^="app:"]');
          const allLinks = details.querySelectorAll('a');
          const allHrefs = Array.from(allLinks).map(link => ({
            href: link.getAttribute('href'),
            text: link.textContent?.substring(0, 20)
          }));
          console.log('[ManualPiP] Links in opened details', {
            totalLinks: allLinks.length,
            appLinksCount: appLinks.length,
            allHrefs: allHrefs
          });
        }, 100);
      }
    };

    // PiPウィンドウのdocumentにイベントリスナーを追加（キャプチャフェーズ）
    pipWindow.document.addEventListener('click', handleAppLink, true);
    pipWindow.document.addEventListener('toggle', handleToggle, true);
    return () => {
      // クリーンアップ実行時点で PiP ウィンドウが既に閉じられている可能性があるため、
      // pipWindow.document へアクセスする前に closed を確認する
      if (pipWindow.closed) return;
      pipWindow.document.removeEventListener('click', handleAppLink, true);
      pipWindow.document.removeEventListener('toggle', handleToggle, true);
    };
  }, [pipWindow, onAppNavigate]);

  // 目次パネル: ページ選択
  const handleTocSelectPage = useCallback(
    (path: string) => {
      setIsTocOpen(false);
      onNavigate?.(path);
    },
    [onNavigate]
  );

  // 目次パネル: 見出し選択
  const handleTocSelectHeading = useCallback(
    (path: string, headingId: string) => {
      setIsTocOpen(false);

      if (path === docPath) {
        // 表示中のページなら即座にスクロール
        if (pipWindow && !pipWindow.closed) {
          const el = pipWindow.document.getElementById(headingId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // 別ページなら遷移した上で、コンテンツ反映後にスクロールする
      pendingScrollRef.current = { path, headingId };
      onNavigate?.(path);
    },
    [docPath, pipWindow, onNavigate]
  );

  // 目次パネル: ページ遷移後の保留スクロールを解決する
  // 見出し要素がまだ DOM に反映されていない可能性があるため requestAnimationFrame で数回リトライする
  //
  // 注意: useManualLoader は docPath が変わっても content を null リセットしないため、
  // docPath が新しいパスに切り替わった直後の再レンダーでは content が前ページのものである
  // ことがある（stale content レース）。pending 対象パスへのフェッチが実際に開始されたこと
  // （loading=true を経由したこと）を確認してから content を信用するようにする。
  useEffect(() => {
    const pending = pendingScrollRef.current;

    if (!pending || pending.path !== docPath) {
      hasSeenLoadingForPendingRef.current = false;
      return;
    }

    if (loading) {
      // 対象パスのフェッチが開始された = これ以降に確定する content は新ページのもの
      hasSeenLoadingForPendingRef.current = true;
      return;
    }

    if (!hasSeenLoadingForPendingRef.current) {
      // まだ新ページのフェッチ開始を観測していない → content は前ページの stale な値の
      // 可能性があるため、この時点ではスクロールを実行しない
      return;
    }

    if (!pipWindow || pipWindow.closed || !content) return;

    let cancelled = false;
    let rafId: number;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled || pipWindow.closed) return;
      const el = pipWindow.document.getElementById(pending.headingId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        pendingScrollRef.current = null;
        return;
      }
      attempts += 1;
      if (attempts < 30) {
        rafId = pipWindow.requestAnimationFrame(tryScroll);
      } else {
        pendingScrollRef.current = null;
      }
    };

    rafId = pipWindow.requestAnimationFrame(tryScroll);

    return () => {
      cancelled = true;
      // クリーンアップ実行時点で PiP ウィンドウが既に閉じられている可能性があるため、
      // pipWindow.cancelAnimationFrame を呼ぶ前に closed を確認する
      if (!pipWindow.closed) {
        pipWindow.cancelAnimationFrame(rafId);
      }
    };
  }, [content, docPath, loading, pipWindow]);

  // docPath が変わるたびに「まだこの docPath のフェッチ開始を観測していない」状態にリセットする。
  useEffect(() => {
    hasSeenLoadingForCurrentDocRef.current = false;
  }, [docPath]);

  // 対象パスのフェッチが開始された（loading=true）ことを観測したら、以降の content は
  // この docPath に対して信用できるとマークする。
  useEffect(() => {
    if (loading) {
      hasSeenLoadingForCurrentDocRef.current = true;
    }
  }, [loading]);

  // スクロールスパイ: pip-content 内の見出し（h1/h2/h3、rehype-slug が id を付与）を
  // IntersectionObserver で監視し、現在ビューポート上部付近に見えている見出しを
  // activeHeadingId として保持する（目次パネルのハイライトに使う）。
  // PiP ウィンドウは別の document/window コンテキストのため、通常の window.IntersectionObserver
  // ではなく pipWindow.IntersectionObserver（そちら側のコンストラクタ）を使う必要がある。
  // content（docPath）が変わるたびに見出し要素が再レンダリングされるため、observer も作り直す。
  useEffect(() => {
    if (!pipWindow || pipWindow.closed || !content || !hasSeenLoadingForCurrentDocRef.current) {
      setActiveHeadingId(null);
      return;
    }

    const container = pipContentRef.current;
    if (!container) {
      setActiveHeadingId(null);
      return;
    }

    const headingElements = Array.from(
      container.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id]')
    );

    if (headingElements.length === 0) {
      setActiveHeadingId(null);
      return;
    }

    const visibleIds = new Set<string>();

    const observer = new pipWindow.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) {
            visibleIds.add(id);
          } else {
            visibleIds.delete(id);
          }
        }

        if (visibleIds.size === 0) return;

        const topMost = headingElements.find((el) => visibleIds.has(el.id));
        if (topMost) {
          setActiveHeadingId((prev) => (prev === topMost.id ? prev : topMost.id));
        }
      },
      {
        root: container,
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    setActiveHeadingId(headingElements[0].id);

    return () => {
      observer.disconnect();
    };
  }, [content, docPath, pipWindow, loading]);

  // 目次パネル: Escapeキーで閉じる（PiPウィンドウは別documentなのでそちら側にリスナーを追加）
  useEffect(() => {
    if (!pipWindow || pipWindow.closed || !isTocOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTocOpen(false);
      }
    };

    pipWindow.document.addEventListener('keydown', handleKeyDown);
    return () => {
      // クリーンアップ実行時点で PiP ウィンドウが既に閉じられている可能性があるため、
      // pipWindow.document へアクセスする前に closed を確認する
      if (pipWindow.closed) return;
      pipWindow.document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pipWindow, isTocOpen]);

  // 目次パネル: 閉じている間はパネル内のボタン（閉じるボタン・目次の各項目）を
  // キーボードフォーカス・AT の両方から除外する（inert）。
  // CSS の transform/pointer-events だけでは Tab キーでオフキャンバスの要素に
  // フォーカスが移動してしまうため（WCAG 4.1.2 / aria-hidden-focus 相当の問題）。
  useEffect(() => {
    if (tocPanelRef.current) {
      tocPanelRef.current.inert = !isTocOpen;
    }
  }, [isTocOpen]);

  // ダウンロードハンドラ
  const handleDownload = useCallback(async () => {
    if (!docPath) return;
    setIsDownloading(true);
    try {
      await downloadMd(docPath);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [docPath, downloadMd]);

  // PiPウィンドウが開いていない場合は何も表示しない
  if (!pipContainer) {
    return null;
  }

  // PiPウィンドウにコンテンツをレンダリング
  return createPortal(
    <div className="pip-container">
      {/* ヘッダー */}
      <header className="pip-header">
        <div className="pip-header-left">
          {items && (
            <button
              onClick={() => setIsTocOpen((prev) => !prev)}
              className="pip-menu-btn"
              aria-label={isTocOpen ? '目次を閉じる' : '目次を開く'}
              aria-expanded={isTocOpen}
            >
              <span className="pip-icon">menu</span>
            </button>
          )}
          <span className="pip-icon">menu_book</span>
          <span className="pip-title">マニュアル</span>
        </div>
        <div className="pip-header-right">
          {showDownloadButton && docPath && (
            <button
              onClick={handleDownload}
              className="pip-download-btn"
              aria-label="ダウンロード"
              disabled={isDownloading}
            >
              <span className={`pip-icon ${isDownloading ? 'pip-spin' : ''}`}>
                {isDownloading ? 'progress_activity' : 'download'}
              </span>
            </button>
          )}
          <button
            onClick={closePipWindow}
            className="pip-close-btn"
            aria-label="閉じる"
          >
            <span className="pip-icon">close</span>
          </button>
        </div>
      </header>

      {/* ボディ（メインコンテンツ + サイドバー） */}
      <div className="pip-body">
        {/* 目次パネル（オーバーレイ/スライドイン） */}
        {items && (
          <>
            <div
              className={`pip-toc-backdrop${isTocOpen ? ' pip-toc-backdrop-open' : ''}`}
              onClick={() => setIsTocOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={tocPanelRef}
              className={`pip-toc-panel${isTocOpen ? ' pip-toc-panel-open' : ''}`}
              role="dialog"
              aria-label="目次"
              aria-hidden={!isTocOpen}
            >
              <div className="pip-toc-panel-header">
                <span className="pip-toc-panel-title">目次</span>
                <button
                  onClick={() => setIsTocOpen(false)}
                  className="pip-toc-panel-close"
                  aria-label="目次を閉じる"
                >
                  <span className="pip-icon" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>
              <div className="pip-toc-panel-content">
                <ManualTableOfContents
                  items={items}
                  activePath={docPath}
                  onSelectPage={handleTocSelectPage}
                  onSelectHeading={handleTocSelectHeading}
                  activeHeadingId={activeHeadingId}
                />
              </div>
            </div>
          </>
        )}

        {/* メインコンテンツ */}
        <main className="pip-content" ref={pipContentRef}>
          {loading && (
            <div className="pip-loading">
              <span className="pip-icon pip-spin">progress_activity</span>
              <span>読み込み中...</span>
            </div>
          )}

          {error && (
            <div className="pip-error">
              <span className="pip-icon">warning</span>
              <div className="pip-error-text">
                <div className="pip-error-title">エラーが発生しました</div>
                <div className="pip-error-detail">{error.message}</div>
              </div>
            </div>
          )}

          {content && (
            <MarkdownRenderer
              content={content}
              onLinkClick={handleLinkClick}
              onAppLinkClick={onAppNavigate}
            />
          )}

          {!loading && !error && !content && (
            <div className="pip-empty">
              <span className="pip-icon pip-icon-large">description</span>
              <span>マニュアルを選択してください</span>
            </div>
          )}
        </main>

        {/* Feedback Section */}
        {showFeedbackPanel && (
          <aside className="pip-sidebar" style={{ width: '300px' }}>
            {feedbackApiBaseUrl != null && (
              <div
                className="pip-feedback-section"
                style={{
                  height: feedbackVisible ? '100%' : 'auto',
                  flex: feedbackVisible ? 1 : '0 0 auto',
                }}
              >
                <div className="pip-feedback-header">
                  <div className="pip-feedback-header-left">
                    <span className="pip-icon pip-icon-small">rate_review</span>
                    <span className="pip-sidebar-title">フィードバック</span>
                  </div>
                  <button
                    onClick={() => setFeedbackVisible(!feedbackVisible)}
                    className="pip-toggle-btn"
                    aria-label={feedbackVisible ? 'フィードバックを閉じる' : 'フィードバックを開く'}
                  >
                    <span className="pip-icon" style={{ fontSize: '18px' }}>
                      {feedbackVisible ? 'expand_less' : 'expand_more'}
                    </span>
                    <span>{feedbackVisible ? '閉じる' : '開く'}</span>
                  </button>
                </div>
                {feedbackVisible && (
                  <div className="pip-feedback-content">
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
        )}
      </div>
    </div>,
    pipContainer
  );
}

/**
 * PiPウィンドウ用のスタイル
 */
function getPipStyles(): string {
  return `
    @import url('${MATERIAL_SYMBOLS_CDN}');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${COLORS.white};
      overflow: hidden;
    }

    ${materialSymbolsStyle}

    .pip-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
    }

    .pip-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* ヘッダー */
    .pip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .pip-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pip-header-left .pip-icon {
      color: ${COLORS.secondary};
    }

    .pip-title {
      font-size: 16px;
      font-weight: 700;
    }

    .pip-header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pip-download-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: ${COLORS.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-download-btn:hover:not(:disabled) {
      background: ${COLORS.tertiary};
    }

    .pip-download-btn:focus {
      outline: 2px solid ${COLORS.secondary};
      outline-offset: 2px;
    }

    .pip-download-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .pip-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: ${COLORS.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-close-btn:hover {
      background: ${COLORS.tertiary};
    }

    .pip-close-btn:focus {
      outline: 2px solid ${COLORS.secondary};
      outline-offset: 2px;
    }

    /* ハンバーガーメニュー（目次パネル開閉） */
    .pip-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-menu-btn:hover {
      background: ${COLORS.tertiary};
    }

    .pip-menu-btn:focus {
      outline: 2px solid ${COLORS.secondary};
      outline-offset: 2px;
    }

    /* ボディ */
    .pip-body {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* 目次パネル背景オーバーレイ */
    .pip-toc-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 4;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .pip-toc-backdrop-open {
      opacity: 1;
      pointer-events: auto;
    }

    /* 目次パネル本体（左からスライドイン） */
    .pip-toc-panel {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      max-width: 85%;
      background: ${COLORS.white};
      border-right: 1px solid ${COLORS.gray300};
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
      z-index: 5;
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform 0.2s ease;
      pointer-events: none;
    }

    .pip-toc-panel-open {
      transform: translateX(0);
      pointer-events: auto;
    }

    .pip-toc-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid ${COLORS.gray300};
      background: ${COLORS.gray100};
      flex-shrink: 0;
    }

    .pip-toc-panel-title {
      font-size: 14px;
      font-weight: 700;
      color: ${COLORS.tertiary};
    }

    .pip-toc-panel-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: ${COLORS.gray700};
      cursor: pointer;
    }

    .pip-toc-panel-close:hover {
      background: ${COLORS.gray100};
    }

    .pip-toc-panel-content {
      flex: 1;
      overflow: auto;
      padding: 8px 0;
    }

    /* コンテンツエリア */
    .pip-content {
      flex: 1;
      overflow: auto;
      padding: 24px;
      line-height: 1.6;
      min-width: 0;
    }

    /* サイドバー（フィードバック用） */
    .pip-sidebar {
      overflow: hidden;
      flex-shrink: 0;
      border-left: 1px solid ${COLORS.gray300};
      display: flex;
      flex-direction: column;
    }

    /* サイドバーヘッダー（フィードバック用） */
    .pip-sidebar-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid ${COLORS.gray300};
      background-color: ${COLORS.gray100};
      flex-shrink: 0;
    }

    .pip-icon-small {
      font-size: 20px;
      color: ${COLORS.tertiary};
    }

    .pip-sidebar-title {
      font-size: 14px;
      font-weight: 600;
      color: ${COLORS.tertiary};
    }

    /* Feedback Section */
    .pip-feedback-section {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .pip-feedback-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid ${COLORS.gray300};
      border-bottom: 1px solid ${COLORS.gray300};
      background-color: ${COLORS.gray100};
      flex-shrink: 0;
    }

    .pip-feedback-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pip-toggle-btn {
      background: transparent;
      border: 1px solid ${COLORS.gray300};
      padding: 8px 12px;
      cursor: pointer;
      color: ${COLORS.gray700};
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      min-height: 36px;
    }

    .pip-toggle-btn:hover {
      background-color: ${COLORS.gray100};
      border-color: ${COLORS.gray700};
    }

    .pip-toggle-btn:active {
      background-color: ${COLORS.gray700};
      color: ${COLORS.white};
    }

    .pip-feedback-content {
      flex: 1;
      overflow: auto;
    }

    /* ローディング */
    .pip-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      color: ${COLORS.gray500};
      font-size: 16px;
    }

    .pip-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* エラー */
    .pip-error {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: ${COLORS.errorBg};
      border: 1px solid #FECACA;
      border-radius: 12px;
      color: ${COLORS.error};
    }

    .pip-error .pip-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .pip-error-title {
      font-size: 16px;
      font-weight: 600;
    }

    .pip-error-detail {
      font-size: 14px;
      margin-top: 8px;
    }

    /* 空状態 */
    .pip-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: ${COLORS.gray500};
      font-size: 14px;
    }

    .pip-icon-large {
      font-size: 64px;
      opacity: 0.5;
    }

    /* Markdown スタイル
       .pip-container でスコープする。PiP ウィンドウは別 document なので他コンポーネントの
       CSS とはそもそも衝突しないが、命名・詳細度の方針を他2箇所（ManualTabPage/DebugPanel）
       と揃えるため同様にスコープする。 */
    .pip-container .manual-markdown {
      color: ${COLORS.gray700};
    }

    .pip-container .manual-markdown h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${COLORS.primary};
      border-bottom: 2px solid ${COLORS.secondary};
      padding-bottom: 8px;
    }

    .pip-container .manual-markdown h2 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      color: ${COLORS.tertiary};
    }

    .pip-container .manual-markdown h3 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 8px;
      color: ${COLORS.gray700};
    }

    .pip-container .manual-markdown p {
      margin-bottom: 12px;
    }

    .pip-container .manual-markdown ul,
    .pip-container .manual-markdown ol {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    .pip-container .manual-markdown li {
      margin-bottom: 4px;
    }

    .pip-container .manual-markdown a {
      color: ${COLORS.primary};
      text-decoration: underline;
      cursor: pointer;
    }

    .pip-container .manual-markdown a:hover {
      color: ${COLORS.tertiary};
    }

    .pip-container .manual-markdown code {
      background: ${COLORS.gray100};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 14px;
    }

    .pip-container .manual-markdown pre {
      background: ${COLORS.gray100};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 12px;
    }

    .pip-container .manual-markdown pre code {
      background: transparent;
      padding: 0;
    }

    .pip-container .manual-markdown table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }

    .pip-container .manual-markdown th,
    .pip-container .manual-markdown td {
      border: 1px solid ${COLORS.gray300};
      padding: 8px 12px;
      text-align: left;
    }

    .pip-container .manual-markdown th {
      background: ${COLORS.gray100};
      font-weight: 600;
    }

    .pip-container .manual-markdown hr {
      border: none;
      border-top: 1px solid ${COLORS.gray300};
      margin: 24px 0;
    }

    .pip-container .manual-markdown blockquote {
      border-left: 4px solid ${COLORS.secondary};
      padding-left: 16px;
      margin: 12px 0;
      color: ${COLORS.gray500};
    }
  `;
}
