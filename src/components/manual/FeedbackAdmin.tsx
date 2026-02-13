import { useState, useCallback, useRef, useEffect } from 'react';
import { useFeedbackAdmin } from '../../hooks/useFeedbackAdmin';
import { getFeedbackDetail, deleteFeedbackAttachment } from '../../utils/feedbackApi';
import { loadMaterialSymbols, isAutoLoadDisabled } from '../../styles/material-symbols';
import type { FeedbackAdminProps, Feedback, FeedbackKind, FeedbackTarget, FeedbackStatus, NoteAttachment } from '../../types';

const KIND_LABELS: Record<string, { label: string; color: string }> = {
  bug: { label: '不具合', color: '#DC2626' },
  question: { label: '質問', color: '#2563EB' },
  request: { label: '要望', color: '#059669' },
  share: { label: '共有', color: '#6B7280' },
  other: { label: 'その他', color: '#9333EA' },
};

const TARGET_LABELS: Record<string, string> = {
  app: 'アプリ',
  manual: 'マニュアル',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'open', color: '#F59E0B' },
  in_progress: { label: '対応中', color: '#2563EB' },
  closed: { label: '完了', color: '#059669' },
};

export function FeedbackAdmin({ apiBaseUrl, adminKey }: FeedbackAdminProps) {
  const {
    feedbacks, total, page, limit, loading, error, filters, customTags,
    setFilters, setPage, updateStatus, remove, refresh,
  } = useFeedbackAdmin({ apiBaseUrl, adminKey });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Feedback | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const requestCounterRef = useRef(0);

  // Material Symbols フォントを読み込む（自動読み込みが無効化されていない場合）
  useEffect(() => {
    if (!isAutoLoadDisabled()) {
      loadMaterialSymbols();
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleRowClick = useCallback(async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    const requestId = ++requestCounterRef.current;
    try {
      const d = await getFeedbackDetail({ apiBaseUrl, adminKey, id });
      if (requestCounterRef.current !== requestId) return;
      setDetail(d);
    } catch {
      if (requestCounterRef.current !== requestId) return;
      setDetail(null);
    }
    if (requestCounterRef.current === requestId) {
      setDetailLoading(false);
    }
  }, [expandedId, apiBaseUrl, adminKey]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('削除しますか？')) return;
    await remove(id);
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
    }
  }, [remove, expandedId]);

  const handleDeleteAttachment = useCallback(async (feedbackId: number, attachmentId: number) => {
    if (!confirm('この画像を削除しますか？')) return;
    try {
      await deleteFeedbackAttachment({ apiBaseUrl, adminKey, feedbackId, attachmentId });
      setDetail(prev => {
        if (!prev || prev.id !== feedbackId) return prev;
        return {
          ...prev,
          attachments: prev.attachments?.filter(a => a.id !== attachmentId),
        };
      });
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  }, [apiBaseUrl, adminKey]);

  const getAttachmentUrl = useCallback((filename: string) => {
    try {
      const parsed = new URL(apiBaseUrl);
      return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}/attachments/${filename}`;
    } catch {
      return `${apiBaseUrl}/attachments/${filename}`;
    }
  }, [apiBaseUrl]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>フィードバック管理</h2>

      {/* フィルター */}
      <div style={styles.filterRow}>
        <select
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value as FeedbackStatus | '' })}
          style={styles.select}
          aria-label="ステータスフィルター"
        >
          <option value="">全ステータス</option>
          <option value="open">open</option>
          <option value="in_progress">対応中</option>
          <option value="closed">完了</option>
        </select>
        <select
          value={filters.kind}
          onChange={e => setFilters({ kind: e.target.value as FeedbackKind | '' })}
          style={styles.select}
          aria-label="種別フィルター"
        >
          <option value="">全種別</option>
          <option value="bug">不具合</option>
          <option value="question">質問</option>
          <option value="request">要望</option>
          <option value="share">共有</option>
        </select>
        <select
          value={filters.target}
          onChange={e => setFilters({ target: e.target.value as FeedbackTarget | '' })}
          style={styles.select}
          aria-label="対象フィルター"
        >
          <option value="">全対象</option>
          <option value="app">アプリ</option>
          <option value="manual">マニュアル</option>
        </select>
        {customTags.length > 0 && (
          <select
            value={filters.customTag}
            onChange={e => setFilters({ customTag: e.target.value })}
            style={styles.select}
            aria-label="タグフィルター"
          >
            <option value="">全タグ</option>
            {customTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <button onClick={refresh} style={styles.refreshBtn} aria-label="更新">
          <span style={styles.iconSmall}>refresh</span>
        </button>
      </div>

      {/* エラー */}
      {error && (
        <div style={styles.error} role="alert">{error.message.slice(0, 200)}</div>
      )}

      {/* テーブル */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>日時</th>
            <th style={styles.th}>種別</th>
            <th style={styles.th}>対象</th>
            <th style={{ ...styles.th, width: '40%' }}>メッセージ</th>
            <th style={styles.th}>状態</th>
            <th style={{ ...styles.th, width: '30px' }}></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={6} style={styles.loadingCell}>読み込み中...</td></tr>
          )}
          {!loading && feedbacks.length === 0 && (
            <tr><td colSpan={6} style={styles.loadingCell}>データなし</td></tr>
          )}
          {feedbacks.map(fb => {
            const kindInfo = KIND_LABELS[fb.kind] ?? { label: fb.kind, color: '#6B7280' };
            const statusInfo = STATUS_LABELS[fb.status] ?? { label: fb.status, color: '#6B7280' };
            const isExpanded = expandedId === fb.id;
            return (
              <tr key={fb.id}>
                <td style={styles.td}>
                  <button
                    onClick={() => handleRowClick(fb.id)}
                    style={styles.rowButton}
                    aria-expanded={isExpanded}
                    aria-controls={isExpanded ? `feedback-detail-${fb.id}` : undefined}
                  >
                    {fb.createdAt?.slice(5, 16).replace('T', ' ')}
                  </button>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: kindInfo.color }}>{kindInfo.label}</span>
                </td>
                <td style={styles.td}>{fb.target ? (TARGET_LABELS[fb.target] ?? fb.target) : '-'}</td>
                <td style={{ ...styles.td, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fb.message.slice(0, 80)}
                </td>
                <td style={styles.td}>
                  <span style={{ color: statusInfo.color, fontWeight: 600, fontSize: '12px' }}>{statusInfo.label}</span>
                </td>
                <td style={styles.td}>
                  {(fb.attachmentCount ?? 0) > 0 && (
                    <span style={{ ...styles.iconSmall, fontSize: '14px', color: '#6B7280' }} title={`${fb.attachmentCount}枚`}>image</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 詳細展開 */}
      {expandedId !== null && (
        <div style={styles.detailPanel} id={`feedback-detail-${expandedId}`} role="region" aria-label="フィードバック詳細">
          {detailLoading ? (
            <div>読み込み中...</div>
          ) : detail ? (
            <>
              <div style={styles.detailGrid}>
                <div><strong>種別:</strong> {KIND_LABELS[detail.kind]?.label}</div>
                <div><strong>対象:</strong> {detail.target ? TARGET_LABELS[detail.target] : '-'}</div>
                <div><strong>URL:</strong> {detail.pageUrl ?? '-'}</div>
                <div><strong>ユーザー:</strong> {detail.userType ?? '-'}</div>
                {detail.environment && (
                  <div><strong>環境:</strong> {Object.values(detail.environment).slice(0, 2).join(' / ')}</div>
                )}
                <div><strong>バージョン:</strong> {detail.appVersion ?? '-'}</div>
                {detail.customTag && <div><strong>タグ:</strong> {detail.customTag}</div>}
                <div><strong>日時:</strong> {detail.createdAt}</div>
              </div>

              <div style={styles.detailMessage}>
                <strong>メッセージ:</strong>
                <pre style={styles.messagePre}>{detail.message}</pre>
              </div>

              {detail.consoleLogs && detail.consoleLogs.length > 0 && (
                <details style={styles.logSection}>
                  <summary>コンソールログ ({detail.consoleLogs.length}件)</summary>
                  <pre style={styles.logPre}>{JSON.stringify(detail.consoleLogs, null, 2)}</pre>
                </details>
              )}

              {detail.networkLogs && detail.networkLogs.length > 0 && (
                <details style={styles.logSection}>
                  <summary>ネットワークログ ({detail.networkLogs.length}件)</summary>
                  <pre style={styles.logPre}>{JSON.stringify(detail.networkLogs, null, 2)}</pre>
                </details>
              )}

              {detail.attachments && detail.attachments.length > 0 && (
                <div style={styles.attachmentSection}>
                  <strong>添付画像 ({detail.attachments.length}件):</strong>
                  <div style={styles.attachmentGrid}>
                    {detail.attachments.map((att: NoteAttachment) => (
                      <div key={att.id} style={styles.attachmentThumb}>
                        <img
                          src={getAttachmentUrl(att.filename)}
                          alt={att.original_name}
                          style={styles.attachmentImg}
                          onClick={() => setEnlargedImage(getAttachmentUrl(att.filename))}
                        />
                        <button
                          onClick={() => handleDeleteAttachment(detail.id, att.id)}
                          style={styles.attachmentRemoveBtn}
                          aria-label="画像を削除"
                        >
                          <span style={{ ...styles.iconSmall, fontSize: '14px' }}>close</span>
                        </button>
                        <div style={styles.attachmentInfo}>
                          {att.original_name.length > 12 ? att.original_name.slice(0, 12) + '...' : att.original_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enlargedImage && (
                <div style={styles.overlay} onClick={() => setEnlargedImage(null)}>
                  <img src={enlargedImage} alt="拡大画像" style={styles.enlargedImg} />
                </div>
              )}

              <div style={styles.detailActions}>
                <select
                  value={detail.status}
                  onChange={e => updateStatus(detail.id, e.target.value as FeedbackStatus)}
                  style={styles.select}
                  aria-label="ステータス変更"
                >
                  <option value="open">open</option>
                  <option value="in_progress">対応中</option>
                  <option value="closed">完了</option>
                </select>
                <button onClick={() => handleDelete(detail.id)} style={styles.deleteBtn}>削除</button>
              </div>
            </>
          ) : (
            <div>詳細の取得に失敗しました</div>
          )}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} style={styles.pageBtn} aria-label="前のページ">&#9664;</button>
          <span style={styles.pageInfo}>{page} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} style={styles.pageBtn} aria-label="次のページ">&#9654;</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '14px',
    color: '#374151',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#043E80',
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  select: {
    padding: '6px 10px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#fff',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
  },
  iconSmall: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '18px',
    lineHeight: 1,
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '13px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '2px solid #D1D5DB',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B7280',
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #F3F4F6',
    fontSize: '13px',
  },
  rowButton: {
    background: 'none',
    border: 'none',
    color: '#2563EB',
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
    textDecoration: 'underline',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 600,
  },
  loadingCell: {
    textAlign: 'center',
    padding: '24px',
    color: '#6B7280',
  },
  detailPanel: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    fontSize: '13px',
    marginBottom: '12px',
  },
  detailMessage: {
    marginBottom: '12px',
  },
  messagePre: {
    whiteSpace: 'pre-wrap',
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    marginTop: '4px',
  },
  logSection: {
    marginBottom: '8px',
    fontSize: '13px',
  },
  logPre: {
    whiteSpace: 'pre-wrap',
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #E5E7EB',
    fontSize: '11px',
    maxHeight: '200px',
    overflow: 'auto',
    marginTop: '4px',
  },
  detailActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #E5E7EB',
  },
  deleteBtn: {
    padding: '6px 16px',
    backgroundColor: '#DC2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  pageBtn: {
    padding: '4px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#6B7280',
  },
  attachmentSection: {
    marginBottom: '12px',
    fontSize: '13px',
  },
  attachmentGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginTop: '8px',
  },
  attachmentThumb: {
    position: 'relative' as const,
    width: '80px',
    height: '80px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
  },
  attachmentImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  attachmentRemoveBtn: {
    position: 'absolute' as const,
    top: '2px',
    right: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  attachmentInfo: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '2px 4px',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: '9px',
    textAlign: 'center' as const,
  },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    cursor: 'pointer',
  },
  enlargedImg: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
};
