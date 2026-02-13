import { useState, useCallback, useRef, useEffect } from 'react';
import { useFeedbackAdmin } from '../../hooks/useFeedbackAdmin';
import { getFeedbackDetail, deleteFeedbackAttachment, exportFeedbacks } from '../../utils/feedbackApi';
import type { Feedback, FeedbackKind, FeedbackStatus, FeedbackTarget, ConsoleLogEntry, NetworkLogEntry, NoteAttachment } from '../../types';
import { Icon, Spinner } from '../shared';

interface Colors {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  link: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
}

interface FeedbackTabProps {
  apiBaseUrl: string;
  adminKey: string;
  colors: Colors;
  isDarkMode: boolean;
  refreshKey: number;
}

const KIND_LABELS: Record<FeedbackKind, { label: string; icon: string }> = {
  bug: { label: '不具合', icon: 'bug_report' },
  question: { label: '質問', icon: 'help' },
  request: { label: '要望', icon: 'lightbulb' },
  share: { label: '共有', icon: 'share' },
  other: { label: 'その他', icon: 'more_horiz' },
};

const KIND_COLORS: Record<FeedbackKind, string> = {
  bug: '#EF4444',
  question: '#3B82F6',
  request: '#10B981',
  share: '#6B7280',
  other: '#8B5CF6',
};

const TARGET_LABELS: Record<string, string> = {
  app: 'アプリ',
  manual: 'マニュアル',
};

const STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: '対応中' },
  { value: 'closed', label: '完了' },
];

function getKindBadgeStyle(kind: FeedbackKind): React.CSSProperties {
  const color = KIND_COLORS[kind] ?? '#6B7280';
  return {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: `${color}15`,
    color,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };
}

function getStatusBadgeStyle(status: FeedbackStatus, colors: Colors): React.CSSProperties {
  let bg: string;
  let fg: string;
  switch (status) {
    case 'open':
      bg = colors.warningBg;
      fg = colors.warning;
      break;
    case 'in_progress':
      bg = colors.primaryLight;
      fg = colors.primary;
      break;
    case 'closed':
      bg = colors.successBg;
      fg = colors.success;
      break;
  }
  return {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: bg,
    color: fg,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };
}

export function FeedbackTab({ apiBaseUrl, adminKey, colors, isDarkMode, refreshKey }: FeedbackTabProps) {
  const {
    feedbacks, total, page, limit, loading, error, filters, customTags,
    setFilters, setPage, updateStatus, remove, refresh,
  } = useFeedbackAdmin({ apiBaseUrl, adminKey });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Feedback | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'json' | 'csv' | 'sqlite' | null>(null);
  const requestCounterRef = useRef(0);

  // DebugAdmin ヘッダーの更新ボタン連動
  const prevRefreshKey = useRef(refreshKey);
  useEffect(() => {
    if (refreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = refreshKey;
      refresh();
    }
  }, [refreshKey, refresh]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSelect = useCallback(async (id: number) => {
    if (selectedId === id) return;
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
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
  }, [selectedId, apiBaseUrl, adminKey]);

  const handleStatusChange = useCallback(async (id: number, status: FeedbackStatus) => {
    const ok = await updateStatus(id, status);
    if (ok && detail?.id === id) {
      setDetail(prev => prev ? { ...prev, status } : null);
    }
  }, [updateStatus, detail?.id]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('このフィードバックを削除しますか？')) return;
    const ok = await remove(id);
    if (ok && selectedId === id) {
      setSelectedId(null);
      setDetail(null);
    }
  }, [remove, selectedId]);

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

  const handleExport = useCallback(async (format: 'json' | 'csv' | 'sqlite') => {
    setExporting(format);
    try {
      await exportFeedbacks({ apiBaseUrl, adminKey, format });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  }, [apiBaseUrl, adminKey]);

  // 統計
  const stats = {
    open: feedbacks.filter(f => f.status === 'open').length,
    inProgress: feedbacks.filter(f => f.status === 'in_progress').length,
    closed: feedbacks.filter(f => f.status === 'closed').length,
  };

  const logBg = isDarkMode ? '#0D1117' : '#1E293B';
  const logBorder = isDarkMode ? '#21262D' : '#2D3748';

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* サイドバー（一覧） */}
      <aside style={{
        width: '380px',
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgSecondary,
      }}>
        {/* フィルター */}
        <div style={{
          padding: '16px',
          display: 'flex',
          gap: '10px',
          borderBottom: `1px solid ${colors.border}`,
          flexWrap: 'wrap',
        }}>
          <select
            value={filters.status}
            onChange={e => setFilters({ status: e.target.value as FeedbackStatus | '' })}
            style={{
              padding: '10px 14px',
              border: 'none',
              borderRadius: '10px',
              background: colors.bg,
              color: colors.text,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: `0 1px 3px ${colors.border}`,
            }}
          >
            <option value="">全ステータス</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.kind}
            onChange={e => setFilters({ kind: e.target.value as FeedbackKind | '' })}
            style={{
              padding: '10px 14px',
              border: 'none',
              borderRadius: '10px',
              background: colors.bg,
              color: colors.text,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: `0 1px 3px ${colors.border}`,
            }}
          >
            <option value="">全種別</option>
            <option value="bug">不具合</option>
            <option value="question">質問</option>
            <option value="request">要望</option>
            <option value="share">共有</option>
            <option value="other">その他</option>
          </select>
          <select
            value={filters.target}
            onChange={e => setFilters({ target: e.target.value as FeedbackTarget | '' })}
            style={{
              padding: '10px 14px',
              border: 'none',
              borderRadius: '10px',
              background: colors.bg,
              color: colors.text,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: `0 1px 3px ${colors.border}`,
            }}
          >
            <option value="">全対象</option>
            <option value="app">アプリ</option>
            <option value="manual">マニュアル</option>
          </select>
          {customTags.length > 0 && (
            <select
              value={filters.customTag}
              onChange={e => setFilters({ customTag: e.target.value })}
              style={{
                padding: '10px 14px',
                border: 'none',
                borderRadius: '10px',
                background: colors.bg,
                color: colors.text,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: `0 1px 3px ${colors.border}`,
              }}
            >
              <option value="">全タグ</option>
              {customTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        {/* 一覧 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
              <Spinner size={24} color={colors.primary} />
              <div style={{ marginTop: '8px' }}>読み込み中...</div>
            </div>
          )}
          {error && (
            <div style={{
              padding: '16px',
              background: colors.errorBg,
              color: colors.error,
              borderRadius: '12px',
              margin: '8px',
              fontSize: '13px',
            }}>{error.message}</div>
          )}
          {!loading && feedbacks.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
              <Icon name="inbox" size={40} />
              <div style={{ marginTop: '12px' }}>フィードバックがありません</div>
            </div>
          )}
          {feedbacks.map(fb => {
            const kindInfo = KIND_LABELS[fb.kind] ?? { label: fb.kind, icon: 'help' };
            const isSelected = selectedId === fb.id;
            return (
              <div
                key={fb.id}
                style={{
                  padding: '16px',
                  background: colors.bg,
                  borderRadius: '14px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${colors.primary}` : '2px solid transparent',
                  boxShadow: isSelected ? `0 4px 12px ${colors.primary}30` : `0 1px 3px ${colors.border}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => handleSelect(fb.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: 'monospace' }}>#{fb.id}</span>
                  <span style={getKindBadgeStyle(fb.kind)}>
                    <Icon name={kindInfo.icon} size={12} />
                    {kindInfo.label}
                  </span>
                  <span style={getStatusBadgeStyle(fb.status, colors)}>
                    {fb.status === 'open' ? 'Open' : fb.status === 'in_progress' ? '対応中' : '完了'}
                  </span>
                  {fb.target && (
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      background: colors.bgTertiary,
                      color: colors.textSecondary,
                      fontWeight: 500,
                    }}>{TARGET_LABELS[fb.target] ?? fb.target}</span>
                  )}
                  {fb.customTag && (
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      background: `${colors.primary}15`,
                      color: colors.primary,
                      fontWeight: 500,
                    }}>{fb.customTag}</span>
                  )}
                </div>
                <div style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: colors.text,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{fb.message.split('\n')[0].slice(0, 80)}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: colors.textMuted,
                }}>
                  <span>{formatDate(fb.createdAt)}</span>
                  {fb.pageUrl && (
                    <>
                      <span style={{ margin: '0 2px' }}>·</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        background: colors.bgTertiary,
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px',
                      }}>
                        <Icon name="link" size={12} />
                        {fb.pageUrl}
                      </span>
                    </>
                  )}
                  {(fb.attachmentCount ?? 0) > 0 && (
                    <>
                      <span style={{ margin: '0 2px' }}>·</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        color: colors.textMuted,
                      }}>
                        <Icon name="image" size={12} />
                        {fb.attachmentCount}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '8px',
                background: colors.bg,
                color: page <= 1 ? colors.textMuted : colors.text,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                boxShadow: `0 1px 3px ${colors.border}`,
              }}
            >
              <Icon name="chevron_left" size={16} />
            </button>
            <span style={{ fontSize: '13px', color: colors.textSecondary }}>{page} / {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '8px',
                background: colors.bg,
                color: page >= totalPages ? colors.textMuted : colors.text,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                boxShadow: `0 1px 3px ${colors.border}`,
              }}
            >
              <Icon name="chevron_right" size={16} />
            </button>
          </div>
        )}

        {/* 統計 */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '12px',
          color: colors.textMuted,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="description" size={16} />
            {total} 件
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="error" size={16} color={colors.warning} />
            {stats.open} Open
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="pending" size={16} color={colors.primary} />
            {stats.inProgress} 対応中
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="check_circle" size={16} color={colors.success} />
            {stats.closed} 完了
          </span>
        </div>
      </aside>

      {/* 詳細ペイン */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px',
        background: colors.bg,
      }}>
        {selectedId && detailLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textMuted }}>
            <Spinner size={32} color={colors.primary} />
            <div style={{ marginTop: '12px' }}>読み込み中...</div>
          </div>
        )}

        {selectedId && !detailLoading && detail && (
          <div style={{ maxWidth: '800px' }}>
            {/* ヘッダー */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={getKindBadgeStyle(detail.kind)}>
                    <Icon name={KIND_LABELS[detail.kind]?.icon ?? 'help'} size={14} />
                    {KIND_LABELS[detail.kind]?.label ?? detail.kind}
                  </span>
                  <span style={getStatusBadgeStyle(detail.status, colors)}>
                    {detail.status === 'open' ? 'Open' : detail.status === 'in_progress' ? '対応中' : '完了'}
                  </span>
                  {detail.target && (
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: colors.bgTertiary,
                      color: colors.textSecondary,
                      fontWeight: 500,
                    }}>{TARGET_LABELS[detail.target] ?? detail.target}</span>
                  )}
                  {detail.customTag && (
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: `${colors.primary}15`,
                      color: colors.primary,
                      fontWeight: 600,
                    }}>{detail.customTag}</span>
                  )}
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  margin: 0,
                  color: colors.text,
                  lineHeight: 1.3,
                  letterSpacing: '-0.025em',
                }}>#{detail.id} フィードバック</h2>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={detail.status}
                  onChange={e => handleStatusChange(detail.id, e.target.value as FeedbackStatus)}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '10px',
                    background: colors.bgSecondary,
                    color: colors.text,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                  onClick={() => handleDelete(detail.id)}
                  style={{
                    padding: '10px 16px',
                    background: colors.errorBg,
                    border: 'none',
                    borderRadius: '10px',
                    color: colors.error,
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="delete" size={16} />
                  削除
                </button>
              </div>
            </div>

            {/* メタ情報グリッド */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              <MetaCard icon="category" label="種別" value={KIND_LABELS[detail.kind]?.label ?? detail.kind} colors={colors} />
              <MetaCard icon="ads_click" label="対象" value={detail.target ? (TARGET_LABELS[detail.target] ?? detail.target) : '-'} colors={colors} />
              <MetaCard icon="schedule" label="日時" value={formatDateTime(detail.createdAt)} colors={colors} />
              {detail.pageUrl && <MetaCard icon="link" label="URL" value={detail.pageUrl} isLink colors={colors} />}
              {detail.userType && <MetaCard icon="person" label="ユーザー" value={detail.userType} colors={colors} />}
              {detail.appVersion && <MetaCard icon="inventory_2" label="バージョン" value={detail.appVersion} colors={colors} />}
            </div>

            {/* メッセージ */}
            <Section icon="chat" title="メッセージ" colors={colors}>
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                color: colors.text,
              }}>{detail.message}</div>
            </Section>

            {/* 環境情報 */}
            {detail.environment && Object.keys(detail.environment).length > 0 && (
              <Section icon="devices" title="環境情報" colors={colors}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                }}>
                  {Object.entries(detail.environment).map(([key, val]) => (
                    <MetaCard key={key} icon="info" label={key} value={String(val)} colors={colors} />
                  ))}
                </div>
              </Section>
            )}

            {/* コンソールログ */}
            {detail.consoleLogs && detail.consoleLogs.length > 0 && (
              <Section icon="terminal" title={`コンソールログ (${detail.consoleLogs.length}件)`} colors={colors}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', background: logBg }}>
                  {(detail.consoleLogs as ConsoleLogEntry[]).map((entry, i) => (
                    <div key={i} style={{
                      padding: '8px 16px',
                      borderBottom: `1px solid ${logBorder}`,
                      fontSize: '12px',
                      fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                    }}>
                      <span style={{
                        color: entry.level === 'error' ? '#F87171' : entry.level === 'warn' ? '#FBBF24' : '#94A3B8',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: entry.level === 'error' ? '#7F1D1D40' : entry.level === 'warn' ? '#78350F40' : '#33415540',
                        flexShrink: 0,
                        marginTop: '1px',
                      }}>{entry.level}</span>
                      <span style={{ color: '#E2E8F0', lineHeight: 1.5, wordBreak: 'break-all' }}>{entry.message}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ネットワークログ */}
            {detail.networkLogs && detail.networkLogs.length > 0 && (
              <Section icon="wifi" title={`ネットワークログ (${detail.networkLogs.length}件)`} colors={colors}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', background: logBg }}>
                  {(detail.networkLogs as NetworkLogEntry[]).map((entry, i) => (
                    <div key={i} style={{
                      padding: '8px 16px',
                      borderBottom: `1px solid ${logBorder}`,
                      fontSize: '12px',
                      fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 600, color: '#94A3B8', width: '40px', flexShrink: 0 }}>{entry.method}</span>
                      <span style={{ color: entry.status >= 400 ? '#F87171' : '#34D399', fontWeight: 600, flexShrink: 0 }}>{entry.status}</span>
                      <span style={{ color: '#E2E8F0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.url}</span>
                      <span style={{ color: '#64748B', flexShrink: 0 }}>{entry.duration != null ? `${entry.duration}ms` : '-'}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 添付画像 */}
            {detail.attachments && detail.attachments.length > 0 && (
              <Section icon="image" title={`添付画像 (${detail.attachments.length}件)`} colors={colors}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  {detail.attachments.map((att: NoteAttachment) => (
                    <div key={att.id} style={{
                      position: 'relative',
                      width: '120px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${colors.border}`,
                      background: colors.bgSecondary,
                    }}>
                      <img
                        src={getAttachmentUrl(att.filename)}
                        alt={att.original_name}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          display: 'block',
                        }}
                        onClick={() => setEnlargedImage(getAttachmentUrl(att.filename))}
                      />
                      <button
                        onClick={() => handleDeleteAttachment(detail.id, att.id)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        title="画像を削除"
                      >
                        <Icon name="close" size={14} />
                      </button>
                      <div style={{
                        padding: '6px 8px',
                        fontSize: '11px',
                        color: colors.textMuted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {att.original_name}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 画像拡大表示 */}
            {enlargedImage && (
              <div
                onClick={() => setEnlargedImage(null)}
                style={{
                  position: 'fixed',
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
                }}
              >
                <img
                  src={enlargedImage}
                  alt="拡大画像"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {selectedId && !detailLoading && !detail && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textMuted }}>
            <Icon name="error_outline" size={48} />
            <div style={{ marginTop: '12px', fontSize: '16px' }}>詳細の取得に失敗しました</div>
          </div>
        )}

        {!selectedId && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: colors.textMuted,
            gap: '24px',
          }}>
            {/* エクスポートバー */}
            <div style={{
              padding: '24px 32px',
              background: colors.bgSecondary,
              borderRadius: '16px',
              textAlign: 'center',
              maxWidth: '480px',
              width: '100%',
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.textSecondary,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <Icon name="analytics" size={18} />
                フィードバック概要
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                fontSize: '13px',
                color: colors.textSecondary,
                marginBottom: '20px',
              }}>
                <span><strong style={{ fontSize: '20px', color: colors.text }}>{total}</strong> 件</span>
                <span><strong style={{ fontSize: '20px', color: colors.warning }}>{stats.open}</strong> Open</span>
                <span><strong style={{ fontSize: '20px', color: colors.primary }}>{stats.inProgress}</strong> 対応中</span>
                <span><strong style={{ fontSize: '20px', color: colors.success }}>{stats.closed}</strong> 完了</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
              }}>
                {(['json', 'csv', 'sqlite'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    disabled={exporting !== null}
                    style={{
                      padding: '8px 14px',
                      background: colors.bg,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: exporting !== null ? 'not-allowed' : 'pointer',
                      color: colors.text,
                      fontWeight: 500,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: exporting !== null && exporting !== format ? 0.5 : 1,
                      boxShadow: `0 1px 3px ${colors.border}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    {exporting === format
                      ? <Spinner size={14} color={colors.text} />
                      : <Icon name="download" size={16} />
                    }
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Icon name="arrow_back" size={48} />
              <div style={{ fontSize: '16px', fontWeight: 500, marginTop: '12px' }}>フィードバックを選択してください</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>左のリストから選択すると詳細が表示されます</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MetaCard({ icon, label, value, isLink, colors }: {
  icon: string;
  label: string;
  value: string;
  isLink?: boolean;
  colors: Colors;
}) {
  return (
    <div style={{
      padding: '16px',
      background: colors.bgSecondary,
      borderRadius: '12px',
    }}>
      <div style={{
        fontSize: '12px',
        color: colors.textMuted,
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <Icon name={icon} size={16} />
        {label}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: isLink ? colors.link : colors.text,
        fontFamily: isLink ? '"Fira Code", monospace' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value}
      </div>
    </div>
  );
}

function Section({ icon, title, children, colors }: {
  icon: string;
  title: string;
  children: React.ReactNode;
  colors: Colors;
}) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: colors.textSecondary,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Icon name={icon} size={18} />
        {title}
      </h3>
      {children}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
