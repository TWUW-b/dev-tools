import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { MarkdownRendererProps } from '../../types';
import type { Components } from 'react-markdown';

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
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
