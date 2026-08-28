import { useState, useEffect, useCallback, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FeedbackForm } from './FeedbackForm';
import { ManualTableOfContents } from './ManualTableOfContents';
import { useManualLoader } from '../../hooks/useManualLoader';
import { useResizable } from '../../hooks/useResizable';
import { useFeedbackAdminMode } from '../../hooks/useFeedbackAdminMode';
import { loadMaterialSymbols, isAutoLoadDisabled } from '../../styles/material-symbols';
import type { ManualTabPageProps } from '../../types';
import { MANUAL_COLORS as COLORS } from '../../styles/colors';

/** 目次サイドバーからページ遷移後、スクロールすべき見出しの保留情報 */
interface PendingScrollTarget {
  path: string;
  headingId: string;
}

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
  /* items 指定時のみ container/body が height:100vh + overflow:hidden で固定されるため、
     印刷時はページネーションできるよう高さ制約を解除する（items 未指定時はそもそも
     この制約が付かないため無害な上書きになる）。 */
  .manual-tab-page { height: auto !important; overflow: visible !important; }
  .manual-tab-page > header { display: none !important; }
  .manual-tab-page .manual-body { height: auto !important; overflow: visible !important; }
  .manual-tab-page main { max-width: 100% !important; height: auto !important; overflow: visible !important; }
  .manual-tab-page .manual-resize-handle,
  .manual-tab-page .manual-v-resize-handle,
  .manual-tab-page aside { display: none !important; }
  /* モバイル向けハンバーガーボタン・オーバーレイ目次パネルも印刷時は不要 */
  .manual-tab-page .manual-menu-btn,
  .manual-tab-page .manual-toc-backdrop,
  .manual-tab-page .manual-toc-panel { display: none !important; }
}

/* ハンバーガーメニュー（モバイル幅での目次パネル開閉） */
.manual-menu-btn:hover {
  background: ${COLORS.tertiary};
}

.manual-menu-btn:focus {
  outline: 2px solid ${COLORS.secondary};
  outline-offset: 2px;
}

/* 目次パネル背景オーバーレイ（モバイル幅） */
.manual-toc-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 4;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.manual-toc-backdrop-open {
  opacity: 1;
  pointer-events: auto;
}

/* 目次パネル本体（左からスライドイン、モバイル幅） */
.manual-toc-panel {
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

.manual-toc-panel-open {
  transform: translateX(0);
  pointer-events: auto;
}

.manual-toc-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${COLORS.gray300};
  background: ${COLORS.gray100};
  flex-shrink: 0;
}

.manual-toc-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: ${COLORS.tertiary};
}

.manual-toc-panel-close {
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

.manual-toc-panel-close:hover {
  background: ${COLORS.gray100};
}

.manual-toc-panel-content {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}

/* Markdown スタイル
   .manual-tab-page でスコープする: MarkdownRenderer 自身が持つ :where(.manual-markdown ...)
   フォールバック（詳細度0）より確実に優先させるため、また DebugPanel の同名セレクタと
   両者が同時にマウントされた場合に DOM 順序次第で優先順位が不定になるのを避けるため。 */
.manual-tab-page .manual-markdown {
  color: ${COLORS.gray700};
}

.manual-tab-page .manual-markdown h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${COLORS.primary};
  border-bottom: 2px solid ${COLORS.secondary};
  padding-bottom: 8px;
}

.manual-tab-page .manual-markdown h2 {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${COLORS.tertiary};
}

.manual-tab-page .manual-markdown h3 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${COLORS.gray700};
}

.manual-tab-page .manual-markdown p {
  margin-bottom: 12px;
}

.manual-tab-page .manual-markdown ul,
.manual-tab-page .manual-markdown ol {
  margin-bottom: 12px;
  padding-left: 24px;
}

.manual-tab-page .manual-markdown li {
  margin-bottom: 4px;
}

.manual-tab-page .manual-markdown a {
  color: ${COLORS.primary};
  text-decoration: underline;
  cursor: pointer;
}

.manual-tab-page .manual-markdown a:hover {
  color: ${COLORS.tertiary};
}

.manual-tab-page .manual-markdown code {
  background: ${COLORS.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

.manual-tab-page .manual-markdown pre {
  background: ${COLORS.gray100};
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.manual-tab-page .manual-markdown pre code {
  background: transparent;
  padding: 0;
}

.manual-tab-page .manual-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.manual-tab-page .manual-markdown th,
.manual-tab-page .manual-markdown td {
  border: 1px solid ${COLORS.gray300};
  padding: 8px 12px;
  text-align: left;
}

.manual-tab-page .manual-markdown th {
  background: ${COLORS.gray100};
  font-weight: 600;
}

.manual-tab-page .manual-markdown hr {
  border: none;
  border-top: 1px solid ${COLORS.gray300};
  margin: 24px 0;
}

.manual-tab-page .manual-markdown blockquote {
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
  items,
}: ManualTabPageProps = {}) {
  const [docPath, setDocPath] = useState<string | null>(null);
  const { content, loading, error } = useManualLoader(docPath);
  const pendingScrollRef = useRef<PendingScrollTarget | null>(null);
  // pending スクロール対象への遷移中、実際に該当パスのフェッチが開始（loading=true）されたのを
  // 一度でも観測したかどうか。useManualLoader は path 変更時に content を null リセットしないため、
  // docPath 切替直後の再レンダーでは content が前ページの内容のまま残ることがある。
  // loading=true を経由したことを確認してからでないと、前ページの DOM に対して誤ってスクロールを
  // 試みてしまう（stale content レース）。
  const hasSeenLoadingForPendingRef = useRef(false);

  // モバイル判定（767px以下）: 常時サイドバー(tocPane)の代わりに
  // ハンバーガーメニュー + オーバーレイ目次パネルに切り替える
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // モバイル目次パネル（オーバーレイ、items 指定時のみ）表示制御
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const mobileTocPanelRef = useRef<HTMLDivElement | null>(null);
  const mobileHeaderRef = useRef<HTMLElement | null>(null);
  const mobileContentWrapRef = useRef<HTMLDivElement | null>(null);

  // isMobileViewport がブレークポイントをまたいで切り替わるたびに、モバイル目次パネルの
  // 開閉状態を常に閉に戻す。パネル本体(backdrop/panel)は `items && isMobileViewport` の
  // 条件で mount/unmount されるため、開いたまま PC 幅へリサイズ→モバイル幅へ戻ると
  // isMobileTocOpen が true のまま残り、ユーザー操作なしにパネルが開いた状態で再マウント
  // されてしまう。
  useEffect(() => {
    setIsMobileTocOpen(false);
  }, [isMobileViewport]);

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

  // スクロールスパイ: メインペイン内の現在表示中の見出し id（目次サイドバーのハイライトに使用）
  const mainPaneRef = useRef<HTMLElement>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  // 現在の docPath に対して実際に fetch が開始（loading=true）されたのを一度でも観測したか。
  // useManualLoader は docPath 変更時に content を null リセットしないため、docPath 切替直後の
  // 再レンダーでは content が前ページの内容のまま残ることがある（stale content レース）。
  // pending-scroll エフェクト（hasSeenLoadingForPendingRef）と同じ手法で、スクロールスパイ側にも
  // 同等のガードを設ける。
  const hasSeenLoadingForCurrentDocRef = useRef(false);

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

  // スクロールスパイ: メインペイン内の見出し（h1/h2/h3、rehype-slug が id を付与）を
  // IntersectionObserver で監視し、現在ビューポート上部付近に見えている見出しを
  // activeHeadingId として保持する（目次サイドバーのハイライトに使う）。
  // content（docPath）が変わるたびに見出し要素が再レンダリングされるため、
  // observer も作り直す。
  useEffect(() => {
    const container = mainPaneRef.current;
    if (!container || !content || !hasSeenLoadingForCurrentDocRef.current) {
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

    const observer = new IntersectionObserver(
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

        // DOM順（＝文書順）で最初に見つかったものを「最も上にある見出し」として採用
        const topMost = headingElements.find((el) => visibleIds.has(el.id));
        if (topMost) {
          setActiveHeadingId((prev) => (prev === topMost.id ? prev : topMost.id));
        }
      },
      {
        root: container,
        // ビューポート上部付近（上30%のライン）を基準に「読んでいる見出し」を判定する
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    // 初期表示時点で先頭の見出しをアクティブにしておく（スクロールするまで空のままにしない）
    setActiveHeadingId(headingElements[0].id);

    return () => {
      observer.disconnect();
    };
  }, [content, docPath, loading]);

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

  // URLクエリパラメータ(path)を更新しつつ docPath を切り替える共通処理
  const applyDocPath = useCallback((resolvedPath: string) => {
    const newUrl = `${window.location.pathname}?path=${encodeURIComponent(resolvedPath)}`;
    window.history.pushState({}, '', newUrl);
    setDocPath(resolvedPath);
  }, []);

  // マークダウン内リンククリック（同じタブ内で遷移）
  const handleLinkClick = useCallback(
    (path: string) => {
      applyDocPath(resolveDocPath(path, docPath));
    },
    [docPath, applyDocPath]
  );

  // 目次サイドバー: ページ選択（ManualItem.path は絶対パス想定なので解決不要）
  // モバイル時はオーバーレイパネル経由の選択もありうるため、選択と同時にパネルを閉じる
  // （PC幅の常時サイドバーではパネル自体が非表示のため無害）
  const handleTocSelectPage = useCallback(
    (path: string) => {
      setIsMobileTocOpen(false);
      applyDocPath(path);
    },
    [applyDocPath]
  );

  // 目次サイドバー: 見出し選択
  const handleTocSelectHeading = useCallback(
    (path: string, headingId: string) => {
      setIsMobileTocOpen(false);

      if (path === docPath) {
        // 表示中のページなら即座にスクロール
        document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // 別ページなら遷移した上で、コンテンツ反映後にスクロールする
      pendingScrollRef.current = { path, headingId };
      applyDocPath(path);
    },
    [docPath, applyDocPath]
  );

  // 目次サイドバー: ページ遷移後の保留スクロールを解決する
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

    if (!content) return;

    let cancelled = false;
    let rafId: number;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(pending.headingId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        pendingScrollRef.current = null;
        return;
      }
      attempts += 1;
      if (attempts < 30) {
        rafId = requestAnimationFrame(tryScroll);
      } else {
        pendingScrollRef.current = null;
      }
    };

    rafId = requestAnimationFrame(tryScroll);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [content, docPath, loading]);

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
      // モバイル目次パネルを開いたまま戻る/進むで遷移した場合、パネル選択時
      // （handleTocSelectPage/Heading）と同様にパネルを閉じて新しいページを見せる。
      setIsMobileTocOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // モバイル目次パネル: Escapeキーで閉じる
  useEffect(() => {
    if (!isMobileTocOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileTocOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileTocOpen]);

  // モバイル目次パネル: 閉じている間はパネル内のボタン（閉じるボタン・目次の各項目）を
  // キーボードフォーカス・AT の両方から除外する（inert）。
  // CSS の transform/pointer-events だけでは Tab キーでオフキャンバスの要素に
  // フォーカスが移動してしまうため（WCAG 4.1.2 / aria-hidden-focus 相当の問題）。
  // パネル自体が isMobileViewport 切替時に mount/unmount されるため、isMobileTocOpen が
  // 変化していない mount 直後（PC幅→モバイル幅をまたいだリサイズ時）にも inert を
  // 反映できるよう isMobileViewport も依存配列に含める。
  useEffect(() => {
    if (mobileTocPanelRef.current) {
      mobileTocPanelRef.current.inert = !isMobileTocOpen;
    }
  }, [isMobileTocOpen, isMobileViewport]);

  // モバイル目次パネル: 開いている間はヘッダー・メインペイン（+ 参照サイドバー）を inert 化し、
  // キーボード操作（Tab）がパネル背後の要素へ抜けないようにする。
  // 併せてパネルを開いた瞬間にフォーカスをパネル内へ移動する（初期状態でどこにもフォーカスが
  // 無いと、直前にフォーカスしていたハンバーガーボタン等から Tab で背後へ抜けてしまうため）。
  useEffect(() => {
    const shouldInertBackground = Boolean(items) && isMobileViewport && isMobileTocOpen;
    if (mobileHeaderRef.current) {
      mobileHeaderRef.current.inert = shouldInertBackground;
    }
    if (mobileContentWrapRef.current) {
      mobileContentWrapRef.current.inert = shouldInertBackground;
    }
    if (shouldInertBackground) {
      mobileTocPanelRef.current?.focus();
    }
  }, [items, isMobileViewport, isMobileTocOpen]);

  return (
    <div
      className="manual-tab-page"
      style={{
        ...styles.container,
        // items 未指定時は既存の見た目・挙動を一切変えない（docs/usage.md の互換性保証）。
        // items 指定時のみ container を height:100vh + overflow:hidden に固定し、
        // 常設サイドバー(tocPane)がビューポート内で独立スクロールできるようにする。
        ...(items ? styles.containerWithToc : styles.containerLegacy),
      }}
    >
      {/* ヘッダー */}
      <header ref={mobileHeaderRef} style={styles.header}>
        <div style={styles.headerLeft}>
          {/* モバイル幅（767px以下）かつ items 指定時のみ: 目次パネル開閉のハンバーガーボタン */}
          {items && isMobileViewport && (
            <button
              onClick={() => setIsMobileTocOpen((prev) => !prev)}
              className="manual-menu-btn"
              style={styles.headerButton}
              aria-label={isMobileTocOpen ? '目次を閉じる' : '目次を開く'}
              aria-expanded={isMobileTocOpen}
            >
              <span style={styles.icon}>menu</span>
            </button>
          )}
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
      <div className="manual-body" style={styles.body}>
        {/* 目次サイドバー（PC幅の常時表示、items 指定時のみ。モバイル幅ではハンバーガーメニュー経由の
            オーバーレイパネルに切り替わるためここには表示しない） */}
        {items && !isMobileViewport && (
          <aside style={styles.tocPane}>
            <div style={styles.tocHeader}>
              <span style={{ ...styles.icon, fontSize: '20px', color: COLORS.tertiary }}>toc</span>
              <span style={styles.sidebarTitle}>目次</span>
            </div>
            <div style={styles.tocContent}>
              <ManualTableOfContents
                items={items}
                activePath={docPath}
                onSelectPage={handleTocSelectPage}
                onSelectHeading={handleTocSelectHeading}
                activeHeadingId={activeHeadingId}
              />
            </div>
          </aside>
        )}

        {/* 目次パネル（モバイル幅のオーバーレイ/スライドイン、items 指定時のみ） */}
        {items && isMobileViewport && (
          <>
            <div
              className={`manual-toc-backdrop${isMobileTocOpen ? ' manual-toc-backdrop-open' : ''}`}
              onClick={() => setIsMobileTocOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={mobileTocPanelRef}
              className={`manual-toc-panel${isMobileTocOpen ? ' manual-toc-panel-open' : ''}`}
              role="dialog"
              aria-label="目次"
              aria-hidden={!isMobileTocOpen}
              tabIndex={-1}
            >
              <div className="manual-toc-panel-header">
                <span className="manual-toc-panel-title">目次</span>
                <button
                  onClick={() => setIsMobileTocOpen(false)}
                  className="manual-toc-panel-close"
                  aria-label="目次を閉じる"
                >
                  <span style={{ ...styles.icon, fontSize: '20px' }}>close</span>
                </button>
              </div>
              <div className="manual-toc-panel-content">
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

        {/* メインペイン + 参照サイドバー（モバイル目次パネルオープン中は inert 化する対象を
            まとめて一括制御できるよう display:contents でラップする。レイアウトには影響しない） */}
        <div ref={mobileContentWrapRef} style={{ display: 'contents' }}>
        {/* メインペイン */}
        <main ref={mainPaneRef} style={styles.mainPane}>
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
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  // items 未指定時（既存利用者向け）: 従来通り minHeight のみ・overflow 指定なし。
  // コンテンツが1画面を超える場合はコンテナごと伸び、ウィンドウレベルでスクロールする
  // （bugではあるが、items 未採用の既存ホストの挙動を変えないため意図的に維持する）。
  containerLegacy: {
    minHeight: '100vh',
  },
  // items 指定時: height を 100vh に固定し overflow:hidden にすることで、
  // 子要素（tocPane/mainPane）の overflow:auto が正しく機能し、tocPane が
  // ビューポート内で独立スクロールできるようにする。
  containerWithToc: {
    height: '100vh',
    overflow: 'hidden',
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
    position: 'relative',
  },
  tocPane: {
    width: '260px',
    flexShrink: 0,
    borderRight: `1px solid ${COLORS.gray300}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tocHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: `1px solid ${COLORS.gray300}`,
    backgroundColor: COLORS.gray100,
    flexShrink: 0,
  },
  tocContent: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 0',
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
