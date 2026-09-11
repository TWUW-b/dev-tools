import { useCallback, useMemo, useState } from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import type { MarkdownRendererProps } from '../../types';
import type { Components } from 'react-markdown';
import { MANUAL_COLORS as COLORS } from '../../styles/colors';
import { ImageLightbox } from '../ImageLightbox';

/**
 * アプリ画面遷移を表す独自スキームのプレフィックス。
 *
 * `#app:` は useManualLoader が Markdown 記法 `](app:` を書き換えた形式。
 * react-markdown の URL サニタイズを避けるための既存の回避策で、MD 本文に直接
 * 書かれることもあるため両方を受け付ける。
 */
const APP_LINK_PREFIXES = ['#app:', 'app:'] as const;

/** app リンクなら遷移先パスを、そうでなければ null を返す */
function resolveAppLinkPath(href: string): string | null {
  for (const prefix of APP_LINK_PREFIXES) {
    if (href.startsWith(prefix)) return href.slice(prefix.length);
  }
  return null;
}

/**
 * react-markdown の defaultUrlTransform は未知スキームの href を空文字に落とす。
 * `app:` はマニュアル内の独自スキームなので素通しし、それ以外は既定のサニタイズに
 * 委ねる（`javascript:` 等は従来どおり除去される）。
 *
 * NOTE: これが無いと生 HTML 直書きの `<a href="app:/properties">` が `<a href="">` に
 * なり、下の app 分岐に入らず「外部リンク」フォールバック（`target="_blank"`）へ落ちる。
 * その結果 PiP 内なのに新しいタブが開き、空 href がホスト SPA のルートへ解決されて
 * 無関係な画面に飛ぶ（v1.4.7 までの不具合）。
 */
function manualUrlTransform(url: string): string {
  return url.startsWith('app:') ? url : defaultUrlTransform(url);
}

/**
 * .manual-markdown の基底スタイル（詳細度ゼロの :where() で定義）。
 *
 * .manual-markdown 用の CSS は元々 DebugPanel（src/components/debug/styles.ts）・
 * ManualTabPage・ManualPiP の3箇所に重複定義されており、いずれも「そのコンポーネント自身が
 * マウントされたときだけ <style> として DOM に注入する」設計だった。そのため
 * ManualSidebar + MarkdownRenderer を単体で使う（DebugPanel/ManualTabPage/ManualPiP の
 * どれもマウントしない）画面では、.manual-markdown に対応する CSS が一切存在せず、見出しの
 * 色・ボーダー、テーブルの罫線、コードブロックの背景等がすべて素の HTML 表示になっていた。
 *
 * :where() は詳細度を 0 にするため、DebugPanel 等の既存の `.manual-markdown h1 {...}`
 * （詳細度 0,0,2,0）は今まで通りこの基底スタイルを上書きする。つまりこの CSS は「他に何も
 * 無いときの最終フォールバック」としてのみ働き、既存コンポーネントの見た目には影響しない。
 */
const BASE_MARKDOWN_CSS = `
:where(.manual-markdown) {
  color: ${COLORS.gray700};
}

:where(.manual-markdown h1) {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${COLORS.primary};
  border-bottom: 2px solid ${COLORS.secondary};
  padding-bottom: 8px;
}

:where(.manual-markdown h2) {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${COLORS.tertiary};
}

:where(.manual-markdown h3) {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${COLORS.gray700};
}

:where(.manual-markdown p) {
  margin-bottom: 12px;
}

:where(.manual-markdown ul),
:where(.manual-markdown ol) {
  margin-bottom: 12px;
  padding-left: 24px;
}

:where(.manual-markdown li) {
  margin-bottom: 4px;
}

:where(.manual-markdown a) {
  color: ${COLORS.primary};
  text-decoration: underline;
  cursor: pointer;
}

:where(.manual-markdown a:hover) {
  color: ${COLORS.tertiary};
}

:where(.manual-markdown code) {
  background: ${COLORS.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

:where(.manual-markdown pre) {
  background: ${COLORS.gray100};
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

:where(.manual-markdown pre code) {
  background: transparent;
  padding: 0;
}

:where(.manual-markdown table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

:where(.manual-markdown th),
:where(.manual-markdown td) {
  border: 1px solid ${COLORS.gray300};
  padding: 8px 12px;
  text-align: left;
}

:where(.manual-markdown th) {
  background: ${COLORS.gray100};
  font-weight: 600;
}

:where(.manual-markdown hr) {
  border: none;
  border-top: 1px solid ${COLORS.gray300};
  margin: 24px 0;
}

:where(.manual-markdown blockquote) {
  border-left: 4px solid ${COLORS.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${COLORS.gray500};
}

:where(.manual-markdown img) {
  max-width: 100%;
  height: auto;
}

/*
 * クリックで拡大できる画像。
 *
 * NOTE: <img> を <button> 等で包まない。ホストアプリのマニュアル用 CSS は
 * .manual-shot img { width: 100% } のように「コンテナの直下の img」を前提に
 * 書かれており（toho_matching TOHOMA-338 の手順ステップ表示など）、間に要素を
 * 挟むと画像幅の基準が変わって、画像の上に重ねた注記マーカーの位置がずれる。
 * 拡大の当たり判定は img 自身に持たせ、DOM 構造は従来のままにする。
 */
:where(.manual-markdown img[data-zoomable]) {
  cursor: zoom-in;
}

/*
 * <app-icon name="..."> の描画枠。
 * 行の中で文字と並べたときにベースラインが揃うよう、inline-flex + 微調整のみを当てる。
 * 大きさ・色はホストが渡すノード側（lucide の size/className 等）に任せる。
 */
:where(.manual-markdown .manual-icon) {
  display: inline-flex;
  align-items: center;
  vertical-align: -0.15em;
}
`;

/**
 * 「アイコンとして置かれた画像」とみなす最大辺（px）。
 * これ以下のサイズを明示している画像はクリック拡大の対象から外す
 * （18px のアイコンが全画面ライトボックスで開くのを防ぐ）。
 */
const ICON_IMAGE_MAX_SIZE = 48;

/** width/height 属性から、アイコンとして扱うべき小さい画像かどうかを判定する */
function isIconSizedImage(props: Record<string, unknown>): boolean {
  const toPx = (v: unknown): number | null => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && /^\d+(\.\d+)?(px)?$/.test(v.trim())) return parseFloat(v);
    return null;
  };
  const w = toPx(props.width);
  const h = toPx(props.height);
  if (w === null && h === null) return false;
  return (w ?? 0) <= ICON_IMAGE_MAX_SIZE && (h ?? 0) <= ICON_IMAGE_MAX_SIZE;
}

/**
 * Markdown → HTML 変換・表示コンポーネント
 * - .mdリンク → onLinkClick（PiP内遷移）
 * - app:/...リンク → onAppLinkClick（メイン画面遷移）
 * - その他 → 新しいタブで開く
 */
export function MarkdownRenderer({
  content,
  className = '',
  onLinkClick,
  onAppLinkClick,
  disableImageZoom = false,
  icons,
}: MarkdownRendererProps) {
  const [zoomedImage, setZoomedImage] = useState<
    { src: string; alt: string; caption: string | null; overlaySource: HTMLElement | null } | null
  >(null);
  const closeZoom = useCallback(() => setZoomedImage(null), []);

  /*
   * NOTE: components は必ず useMemo で固定する。
   * ここに書く関数は react-markdown から見るとコンポーネントの「型」そのものなので、
   * 毎レンダーで新しい関数を渡すと React が別コンポーネントとみなし、本文ツリー全体が
   * アンマウント→再マウントされる。そうなると拡大表示を開閉するたびに、開いていた
   * <details> が閉じる・フォーカスが失われる、といった副作用が出る。
   */
  const components: Components = useMemo(() => {
    const map: Components = {
    a: ({ href, children, ...props }) => {
      // app:リンクの場合はonAppLinkClickで処理（メイン画面遷移）
      // NOTE: <a>タグではなく<span>を使用してブラウザのデフォルト動作を回避
      // PiPウィンドウ内で<a>タグを使うと、別ウィンドウコンテキストでの処理により
      // ブラウザが勝手に新しいタブを開いてしまう問題を回避
      const appPath = href ? resolveAppLinkPath(href) : null;
      if (appPath !== null && onAppLinkClick) {
        return (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAppLinkClick(appPath);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAppLinkClick(appPath);
              }
            }}
            style={{
              color: '#043E80',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            {...props}
          >
            {children}
          </span>
        );
      }
      // .mdリンクの場合はonLinkClickで処理（PiP内遷移）
      // advanced.md#faq のようなアンカー付きも対応
      if (href && /\.md(#|$|\?)/.test(href) && onLinkClick) {
        return (
          <a
            href={href}
            onClick={(e) => {
              e.preventDefault();
              onLinkClick(href);
            }}
            style={{
              color: '#043E80',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            {...props}
          >
            {children}
          </a>
        );
      }
      // 外部リンクは新しいタブで開く
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#043E80' }}
          {...props}
        >
          {children}
        </a>
      );
    },
    // 画像はクリックで拡大表示する（マニュアルの画像はスクリーンショットが主で、
    // 本文中の幅では画面内の文字が読めないことが多いため）
    img: ({ node, src, alt, title, ...props }) => {
      void node; // react-markdown が渡す hast ノード。DOM 要素には渡さない
      const url = typeof src === 'string' ? src : '';
      /*
       * アイコンとして置かれた画像は拡大しない。
       * 18px のアイコンをライトボックスで全画面表示しても意味がないため、
       * サイズを明示している小さい画像と、明示的に外した画像を対象から除く。
       */
      const rest = props as Record<string, unknown>;
      const noZoom = disableImageZoom || rest['data-no-zoom'] !== undefined || isIconSizedImage(rest);
      if (!url || noZoom) {
        return <img {...props} src={url || undefined} alt={alt ?? ''} title={title} />;
      }
      /*
       * 画像の親に「絶対配置の兄弟要素」がある場合は、それを注記（ここを押す、の囲み等）と
       * みなして拡大表示にも引き継ぐ。囲みが消えた拡大画像は、どこを指しているのか分からず
       * 拡大の意味が半減するため。
       */
      const findOverlaySource = (image: HTMLImageElement): HTMLElement | null => {
        const host = image.parentElement;
        const view = image.ownerDocument.defaultView;
        if (!host || !view) return null;
        const hasOverlay = Array.from(host.children).some(
          (child) => child !== image && view.getComputedStyle(child).position === 'absolute'
        );
        return hasOverlay ? host : null;
      };
      const open = (image: HTMLImageElement) =>
        setZoomedImage({
          src: url,
          alt: alt ?? '',
          caption: title ?? alt ?? null,
          overlaySource: findOverlaySource(image),
        });
      return (
        <img
          {...props}
          src={url}
          alt={alt ?? ''}
          title={title}
          data-zoomable="true"
          // 画像そのものを操作対象にする（ラッパー要素を足さない理由は上の CSS のコメント参照）。
          // role/aria-label を付けないと「クリックできる画像」であることが読み上げられない。
          role="button"
          tabIndex={0}
          aria-label={alt ? `${alt}（クリックで拡大）` : '画像を拡大表示'}
          onClick={(e) => {
            // 画像がリンクの中にある場合（[![alt](img)](url)）はリンク遷移を優先し、
            // 拡大表示には入らない
            if (e.currentTarget.closest('a')) return;
            e.preventDefault();
            e.stopPropagation();
            open(e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            if (e.currentTarget.closest('a')) return;
            e.preventDefault();
            open(e.currentTarget);
          }}
        />
      );
    },
    };

    /*
     * `<app-icon name="building"></app-icon>` をホストから渡されたノードに差し替える。
     * react-markdown の components はタグ名で引くので、独自要素もここに登録すれば
     * rehype-raw が作った hast 要素をそのまま受け取れる（Components 型は
     * HTML 標準要素しか持たないため、組み立ててから cast している）。
     *
     * NOTE: MD には必ず閉じタグ付きで書くこと。`<app-icon … />` は HTML の
     * パース規則上「開始タグ」になり、以降の行がアイコンの子要素になってしまう。
     */
    // Components 型は HTML 標準要素しか持たないので、独自タグを足すときだけ型を広げる
    const withCustomTags = map as Components & Record<string, unknown>;
    withCustomTags['app-icon'] = ({ name, label, className }: { name?: string; label?: string; className?: string }) => {
      const node = typeof name === 'string' ? icons?.[name] : undefined;
      if (node === undefined || node === null) return null;
      const cls = className ? `manual-icon ${className}` : 'manual-icon';
      // 文章に添えるアイコンは装飾なので既定では読み上げから外す。
      // 単独で意味を持たせたい場合だけ label を指定してもらう。
      return label ? (
        <span className={cls} role="img" aria-label={label}>{node}</span>
      ) : (
        <span className={cls} aria-hidden="true">{node}</span>
      );
    };

    return withCustomTags;
  }, [onLinkClick, onAppLinkClick, disableImageZoom, icons]);

  return (
    <div className={`manual-markdown ${className}`}>
      <style>{BASE_MARKDOWN_CSS}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        urlTransform={manualUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
      {zoomedImage && (
        <ImageLightbox
          src={zoomedImage.src}
          alt={zoomedImage.alt}
          caption={zoomedImage.caption}
          overlaySource={zoomedImage.overlaySource}
          onClose={closeZoom}
        />
      )}
    </div>
  );
}
