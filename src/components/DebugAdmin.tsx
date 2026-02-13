import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useDebugNotes } from '../hooks/useDebugNotes';
import { setDebugApiBaseUrl, api } from '../utils/api';
import type { DebugAdminProps, Note, Status, Severity, EnvironmentInfo, ConsoleLogEntry, NetworkLogEntry } from '../types';
import { Icon, Spinner } from './shared';
import { TestStatusTab } from './admin/TestStatusTab';

// ライトモード カラー定義
const LIGHT_COLORS = {
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  primaryDark: '#4F46E5',
  accent: '#EC4899',
  bg: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  critical: '#7C2D12',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
  link: '#6366F1',
};

// ダークモード カラー定義
const DARK_COLORS = {
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  primaryDark: '#A5B4FC',
  accent: '#F472B6',
  bg: '#0F172A',
  bgSecondary: '#1E293B',
  bgTertiary: '#334155',
  border: '#334155',
  borderLight: '#475569',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  error: '#F87171',
  errorBg: '#450A0A',
  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningBg: '#78350F',
  critical: '#FB923C',
  high: '#F87171',
  medium: '#FBBF24',
  low: '#60A5FA',
  link: '#818CF8',
};

// 自動更新間隔（ミリ秒）
const AUTO_REFRESH_INTERVAL = 30000;


/**
 * デバッグノート管理画面
 */
export function DebugAdmin({ apiBaseUrl, env = 'dev' }: DebugAdminProps) {
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [sourceFilter, setSourceFilter] = useState<'manual' | 'test' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'test-status'>('notes');
  const [testCaseIdFilter, setTestCaseIdFilter] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  // API URL 設定
  useEffect(() => {
    if (apiBaseUrl) {
      setDebugApiBaseUrl(apiBaseUrl);
    }
  }, [apiBaseUrl]);

  // システムのダークモード設定を監視
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const { notes, loading, error, updateStatus, updateSeverity, deleteNote, refresh } = useDebugNotes(env);

  // refreshのloading完了を監視してloadingActionをクリア
  useEffect(() => {
    if (!loading && loadingAction === 'refresh') {
      setLoadingAction(null);
    }
  }, [loading, loadingAction]);

  // notes 更新時に selectedNote を同期
  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated) {
        setSelectedNote(updated);
      } else {
        setSelectedNote(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // 自動更新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  // テストケースからノート一覧への遷移
  const handleNavigateToNote = useCallback((caseId: number) => {
    setTestCaseIdFilter(caseId);
    setStatusFilter('open');
    setActiveTab('notes');
  }, []);

  // フィルタリング
  const filteredNotes = useMemo(() => notes.filter((note) => {
    if (statusFilter && note.status !== statusFilter) return false;
    if (sourceFilter && (note.source || 'manual') !== sourceFilter) return false;
    if (testCaseIdFilter != null) {
      const caseIds = note.test_case_ids ?? (note.test_case_id ? [note.test_case_id] : []);
      if (!caseIds.includes(testCaseIdFilter)) return false;
    }
    if (searchQuery) {
      const idMatch = searchQuery.match(/^#([1-9]\d*)$/);
      if (idMatch) {
        if (note.id !== Number(idMatch[1])) return false;
      } else {
        const query = searchQuery.toLowerCase();
        if (!note.title.toLowerCase().includes(query) && !note.content.toLowerCase().includes(query)) return false;
      }
    }
    return true;
  }), [notes, statusFilter, sourceFilter, testCaseIdFilter, searchQuery]);

  // ステータス更新
  const handleStatusChange = useCallback(async (id: number, status: Status) => {
    setLoadingAction(`status-${id}`);
    try {
      await updateStatus(id, status);
      if (selectedNote?.id === id) {
        setSelectedNote((prev) => prev ? { ...prev, status } : null);
      }
    } finally {
      setLoadingAction(null);
    }
  }, [updateStatus, selectedNote?.id]);

  // 重要度更新
  const handleSeverityChange = useCallback(async (id: number, severity: Severity | null) => {
    setLoadingAction(`severity-${id}`);
    try {
      await updateSeverity(id, severity);
      if (selectedNote?.id === id) {
        setSelectedNote((prev) => prev ? { ...prev, severity } : null);
      }
    } finally {
      setLoadingAction(null);
    }
  }, [updateSeverity, selectedNote?.id]);

  // ノート選択（詳細APIで全カラム取得）
  const handleSelectNote = useCallback(async (note: Note) => {
    setSelectedNote(note); // まず一覧データで即表示
    try {
      const detail = await api.getNote(env, note.id);
      setSelectedNote(detail);
    } catch {
      // 詳細取得失敗時は一覧データのまま表示
    }
  }, [env]);

  // 削除
  const handleDelete = useCallback(async (id: number) => {
    if (confirm('このノートを削除しますか？')) {
      setLoadingAction(`delete-${id}`);
      try {
        await deleteNote(id);
        if (selectedNote?.id === id) {
          setSelectedNote(null);
        }
      } finally {
        setLoadingAction(null);
      }
    }
  }, [deleteNote, selectedNote?.id]);

  // 再現手順をパース
  const parseSteps = (steps: string | null): string[] => {
    if (!steps) return [];
    try {
      const parsed = JSON.parse(steps);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return steps.split('\n').filter(s => s.trim());
    }
  };

  return (
    <div style={getContainerStyle(colors)}>
      {/* Material Icons 読み込み */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />

      {/* ヘッダー */}
      <header style={getHeaderStyle(colors)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
            }}>
              <Icon name="bug_report" size={24} color="#FFF" />
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 700,
                margin: 0,
                color: colors.text,
                letterSpacing: '-0.025em',
              }}>Debug Notes</h1>
              <span style={{
                fontSize: '12px',
                color: colors.textMuted,
              }}>バグ管理ダッシュボード</span>
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            padding: '4px 10px',
            background: colors.primary,
            color: '#FFFFFF',
            borderRadius: '20px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>{env}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: colors.textSecondary,
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            background: autoRefresh ? colors.successBg : 'transparent',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: autoRefresh ? colors.success : colors.textMuted,
              animation: autoRefresh ? 'pulse 2s infinite' : 'none',
            }} />
            自動更新
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colors.bgSecondary,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              color: colors.text,
            }}
            title={isDarkMode ? 'ライトモード' : 'ダークモード'}
          >
            <Icon name={isDarkMode ? 'light_mode' : 'dark_mode'} size={20} />
          </button>
          <button
            onClick={() => {
              setLoadingAction('refresh');
              refresh();
              setRefreshKey(k => k + 1);
            }}
            disabled={loadingAction !== null}
            style={{
              padding: '10px 20px',
              background: colors.primary,
              border: 'none',
              borderRadius: '10px',
              cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
              color: '#FFF',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loadingAction !== null ? 0.6 : 1,
            }}
          >
            {loadingAction === 'refresh'
              ? <Spinner size={18} color="#FFF" />
              : <Icon name="refresh" size={18} color="#FFF" />
            }
            更新
          </button>
        </div>
      </header>

      {/* タブバー */}
      <nav style={{
        display: 'flex',
        gap: '0',
        padding: '0 24px',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.bg,
      }}>
        {(['notes', 'test-status'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'test-status') setTestCaseIdFilter(null);
            }}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${colors.primary}` : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab ? colors.primary : colors.textSecondary,
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'notes' ? 'ノート一覧' : 'テスト状況'}
          </button>
        ))}
      </nav>

      {activeTab === 'test-status' ? (
        <TestStatusTab
          env={env}
          colors={colors}
          isDarkMode={isDarkMode}
          onNavigateToNote={handleNavigateToNote}
          refreshKey={refreshKey}
        />
      ) : (
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
          }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | '')}
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
              <option value="">すべて</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="fixed">Fixed</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'manual' | 'test' | '')}
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
              <option value="">全source</option>
              <option value="manual">Manual</option>
              <option value="test">Test</option>
            </select>
            <div style={{
              flex: 1,
              position: 'relative',
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  border: 'none',
                  borderRadius: '10px',
                  background: colors.bg,
                  color: colors.text,
                  fontSize: '13px',
                  boxShadow: `0 1px 3px ${colors.border}`,
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textMuted,
              }}>
                <Icon name="search" size={18} />
              </span>
            </div>
          </div>

          {/* testCaseId フィルタチップ */}
          {testCaseIdFilter != null && (
            <div style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: `${colors.primary}15`,
                color: colors.primary,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                テストケース #{testCaseIdFilter}
                <button
                  onClick={() => setTestCaseIdFilter(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: colors.primary,
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: '14px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          {/* ノート一覧 */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          }}>
            {loading && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: colors.textMuted,
              }}>
                <Icon name="hourglass_empty" size={32} />
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
            {!loading && filteredNotes.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: colors.textMuted,
              }}>
                <Icon name="inbox" size={40} />
                <div style={{ marginTop: '12px' }}>ノートがありません</div>
              </div>
            )}
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: '16px',
                  background: colors.bg,
                  borderRadius: '14px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  border: selectedNote?.id === note.id
                    ? `2px solid ${colors.primary}`
                    : '2px solid transparent',
                  boxShadow: selectedNote?.id === note.id
                    ? `0 4px 12px ${colors.primary}30`
                    : `0 1px 3px ${colors.border}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => handleSelectNote(note)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: colors.textMuted,
                    fontFamily: 'monospace',
                  }}>#{note.id}</span>
                  <span style={getSeverityBadge(note.severity, colors)}>
                    <Icon name={getSeverityIcon(note.severity)} size={14} />
                    <span style={{ marginLeft: '4px' }}>{note.severity || 'none'}</span>
                  </span>
                  <span style={getStatusBadge(note.status, colors)}>
                    <Icon name={getStatusIcon(note.status)} size={14} />
                    <span style={{ marginLeft: '4px' }}>{note.status}</span>
                  </span>
                  {note.source === 'test' && (
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      background: `${colors.medium}15`,
                      color: colors.medium,
                      fontWeight: 600,
                    }}>🧪 test</span>
                  )}
                </div>
                <div style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: colors.text,
                  lineHeight: 1.4,
                }}>{getContentPreview(note.content)}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: colors.textMuted,
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    background: colors.bgTertiary,
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}>
                    <Icon name="link" size={12} />
                    {note.route || '/'}
                  </span>
                  <span style={{ margin: '0 2px' }}>·</span>
                  <span>{formatDate(note.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

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
              {notes.length} 件
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon name="error" size={16} color={colors.error} />
              {notes.filter(n => n.status === 'open').length} Open
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon name="autorenew" size={16} color={colors.warning} />
              {notes.filter(n => n.status === 'resolved').length} Resolved
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon name="undo" size={16} color={colors.error} />
              {notes.filter(n => n.status === 'rejected').length} Rejected
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon name="check_circle" size={16} color={colors.success} />
              {notes.filter(n => n.status === 'fixed').length} Fixed
            </span>
          </div>
        </aside>

        {/* 詳細 */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px',
          background: colors.bg,
        }}>
          {selectedNote ? (
            <div style={{ maxWidth: '800px' }}>
              {/* ヘッダー */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '32px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                  }}>
                    <span style={getSeverityBadge(selectedNote.severity, colors)}>
                      <Icon name={getSeverityIcon(selectedNote.severity)} size={14} />
                      <span style={{ marginLeft: '4px' }}>{selectedNote.severity || 'none'}</span>
                    </span>
                    <span style={getStatusBadge(selectedNote.status, colors)}>
                      <Icon name={getStatusIcon(selectedNote.status)} size={14} />
                      <span style={{ marginLeft: '4px' }}>{selectedNote.status}</span>
                    </span>
                    {selectedNote.source === 'test' && (
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        background: `${colors.medium}15`,
                        color: colors.medium,
                        fontWeight: 600,
                      }}>🧪 test</span>
                    )}
                  </div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    margin: 0,
                    color: colors.text,
                    lineHeight: 1.3,
                    letterSpacing: '-0.025em',
                  }}>{getContentPreview(selectedNote.content)}</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={selectedNote.severity || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleSeverityChange(selectedNote.id, val ? val as Severity : null);
                    }}
                    disabled={loadingAction !== null}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '10px',
                      background: colors.bgSecondary,
                      color: colors.text,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                      opacity: loadingAction !== null ? 0.6 : 1,
                    }}
                  >
                    <option value="">未設定</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  {loadingAction === `severity-${selectedNote.id}` && <Spinner size={16} color={colors.primary} />}
                  <select
                    value={selectedNote.status}
                    onChange={(e) => handleStatusChange(selectedNote.id, e.target.value as Status)}
                    disabled={loadingAction !== null}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '10px',
                      background: colors.bgSecondary,
                      color: colors.text,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                      opacity: loadingAction !== null ? 0.6 : 1,
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {loadingAction === `status-${selectedNote.id}` && <Spinner size={16} color={colors.primary} />}
                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    disabled={loadingAction !== null}
                    style={{
                      padding: '10px 16px',
                      background: colors.errorBg,
                      border: 'none',
                      borderRadius: '10px',
                      color: colors.error,
                      cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
                      fontWeight: 500,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: loadingAction !== null ? 0.6 : 1,
                    }}
                  >
                    {loadingAction === `delete-${selectedNote.id}`
                      ? <Spinner size={16} color={colors.error} />
                      : <Icon name="delete" size={16} />
                    }
                    削除
                  </button>
                </div>
              </div>

              {/* メタ情報 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}>
                <MetaCard
                  icon="link"
                  label="ページURL"
                  value={selectedNote.route || '/'}
                  isLink
                  colors={colors}
                />
                <MetaCard
                  icon="article"
                  label="ページタイトル"
                  value={selectedNote.screen_name || '(不明)'}
                  colors={colors}
                />
                <MetaCard
                  icon="schedule"
                  label="作成日時"
                  value={formatDateTime(selectedNote.created_at)}
                  colors={colors}
                />
              </div>

              {/* 内容 */}
              <Section icon="notes" title="内容" colors={colors}>
                <div style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                  color: colors.text,
                }}>{selectedNote.content}</div>
              </Section>

              {/* 再現手順 */}
              {selectedNote.steps && (
                <Section icon="format_list_numbered" title="再現手順" colors={colors}>
                  <ol style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: colors.text,
                  }}>
                    {parseSteps(selectedNote.steps).map((step, i) => (
                      <li key={i} style={{
                        padding: '8px 0',
                        borderBottom: `1px solid ${colors.borderLight}`,
                      }}>{step}</li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* 補足メモ */}
              {selectedNote.user_log && (
                <Section icon="sticky_note_2" title="補足メモ" colors={colors}>
                  <pre style={{
                    padding: '16px',
                    background: isDarkMode ? '#0D1117' : '#1E293B',
                    color: '#E2E8F0',
                    borderRadius: '12px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>{selectedNote.user_log}</pre>
                </Section>
              )}

              {/* 環境情報 */}
              {selectedNote.environment && (
                <Section icon="devices" title="環境情報" colors={colors}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                  }}>
                    <MetaCard icon="public" label="URL" value={(selectedNote.environment as EnvironmentInfo).url || ''} isLink colors={colors} />
                    <MetaCard icon="aspect_ratio" label="Viewport" value={(selectedNote.environment as EnvironmentInfo).viewport || ''} colors={colors} />
                    <MetaCard icon="computer" label="User Agent" value={(selectedNote.environment as EnvironmentInfo).userAgent || ''} colors={colors} />
                    <MetaCard icon="schedule" label="記録日時" value={(selectedNote.environment as EnvironmentInfo).timestamp || ''} colors={colors} />
                  </div>
                </Section>
              )}

              {/* コンソールログ */}
              {selectedNote.console_log && (selectedNote.console_log as ConsoleLogEntry[]).length > 0 && (
                <Section icon="terminal" title={`コンソールログ (${(selectedNote.console_log as ConsoleLogEntry[]).length}件)`} colors={colors}>
                  <div style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: isDarkMode ? '#0D1117' : '#1E293B',
                  }}>
                    {(selectedNote.console_log as ConsoleLogEntry[]).map((entry, i) => (
                      <div key={i} style={{
                        padding: '8px 16px',
                        borderBottom: `1px solid ${isDarkMode ? '#21262D' : '#2D3748'}`,
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
              {selectedNote.network_log && (selectedNote.network_log as NetworkLogEntry[]).length > 0 && (
                <Section icon="wifi" title={`ネットワークログ (${(selectedNote.network_log as NetworkLogEntry[]).length}件)`} colors={colors}>
                  <div style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: isDarkMode ? '#0D1117' : '#1E293B',
                  }}>
                    {(selectedNote.network_log as NetworkLogEntry[]).map((entry, i) => (
                      <div key={i} style={{
                        padding: '8px 16px',
                        borderBottom: `1px solid ${isDarkMode ? '#21262D' : '#2D3748'}`,
                        fontSize: '12px',
                        fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}>
                        <span style={{
                          fontWeight: 600,
                          color: '#94A3B8',
                          width: '40px',
                          flexShrink: 0,
                        }}>{entry.method}</span>
                        <span style={{
                          color: entry.status >= 400 ? '#F87171' : '#34D399',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>{entry.status}</span>
                        <span style={{
                          color: '#E2E8F0',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{entry.url}</span>
                        <span style={{
                          color: '#64748B',
                          flexShrink: 0,
                        }}>{entry.duration != null ? `${entry.duration}ms` : '-'}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: colors.textMuted,
            }}>
              <Icon name="arrow_back" size={64} />
              <div style={{ fontSize: '18px', fontWeight: 500, marginTop: '16px' }}>ノートを選択してください</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>左のリストからノートを選択すると詳細が表示されます</div>
            </div>
          )}
        </main>
      </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// メタ情報カード
function MetaCard({ icon, label, value, isLink, colors }: {
  icon: string;
  label: string;
  value: string;
  isLink?: boolean;
  colors: typeof LIGHT_COLORS;
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

// セクション
function Section({ icon, title, children, colors }: {
  icon: string;
  title: string;
  children: ReactNode;
  colors: typeof LIGHT_COLORS;
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

function getContentPreview(content: string, maxLength = 60): string {
  const firstLine = content.split('\n')[0];
  return firstLine.length > maxLength ? firstLine.slice(0, maxLength) + '...' : firstLine;
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

function getStatusIcon(status: Status): string {
  switch (status) {
    case 'open': return 'error';
    case 'resolved': return 'autorenew';
    case 'rejected': return 'undo';
    case 'fixed': return 'check_circle';
  }
}

function getSeverityIcon(severity: Severity | null): string {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'priority_high';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'remove';
  }
}

function getSeverityBadge(severity: Severity | null, colors: typeof LIGHT_COLORS): React.CSSProperties {
  const color = severity ? colors[severity] : colors.textMuted;
  return {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: `${color}15`,
    color: color,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    display: 'inline-flex',
    alignItems: 'center',
  };
}

function getStatusBadge(status: Status, colors: typeof LIGHT_COLORS): React.CSSProperties {
  let bg: string;
  let fg: string;

  switch (status) {
    case 'open':
      bg = colors.primaryLight;
      fg = colors.primary;
      break;
    case 'resolved':
      bg = colors.warningBg;
      fg = colors.warning;
      break;
    case 'rejected':
      bg = colors.errorBg;
      fg = colors.error;
      break;
    case 'fixed':
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
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    display: 'inline-flex',
    alignItems: 'center',
  };
}

function getContainerStyle(colors: typeof LIGHT_COLORS): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSize: '14px',
    color: colors.text,
    background: colors.bg,
  };
}

function getHeaderStyle(colors: typeof LIGHT_COLORS): React.CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.border}`,
    background: colors.bg,
  };
}
