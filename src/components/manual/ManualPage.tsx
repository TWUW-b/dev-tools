import { MarkdownRenderer } from './MarkdownRenderer';
import { useManualLoader } from '../../hooks/useManualLoader';
import type { ManualPageProps } from '../../types';

/**
 * 全画面表示用マニュアルページ
 *
 * 別タブや専用ページでマニュアルを表示する場合に使用
 */
export function ManualPage({ docPath, className = '' }: ManualPageProps) {
  const { content, loading, error, reload } = useManualLoader(docPath);

  return (
    <article
      className={`manual-page ${className}`}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          読み込み中...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            color: '#c62828',
          }}
        >
          <p style={{ margin: 0 }}>
            マニュアルの読み込みに失敗しました: {error.message}
          </p>
          <button
            onClick={reload}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              border: '1px solid #c62828',
              borderRadius: '4px',
              background: 'transparent',
              color: '#c62828',
              cursor: 'pointer',
            }}
          >
            再試行
          </button>
        </div>
      )}

      {content && <MarkdownRenderer content={content} />}
    </article>
  );
}
