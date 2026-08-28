import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import type { MarkdownRendererProps } from '../../types';
import type { Components } from 'react-markdown';
import { MANUAL_COLORS as COLORS } from '../../styles/colors';

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
`;

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
}: MarkdownRendererProps) {
  // カスタムリンクコンポーネント
  const components: Components = {
    a: ({ href, children, ...props }) => {
      // app:リンクの場合はonAppLinkClickで処理（メイン画面遷移）
      // NOTE: <a>タグではなく<span>を使用してブラウザのデフォルト動作を回避
      // PiPウィンドウ内で<a>タグを使うと、別ウィンドウコンテキストでの処理により
      // ブラウザが勝手に新しいタブを開いてしまう問題を回避
      if (href && href.startsWith('app:') && onAppLinkClick) {
        const appPath = href.replace('app:', '');
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
  };

  return (
    <div className={`manual-markdown ${className}`}>
      <style>{BASE_MARKDOWN_CSS}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
