import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDebugNotes } from '../hooks/useDebugNotes';
import { setDebugApiBaseUrl, api } from '../utils/api';
import { maskSensitive } from '../utils/maskSensitive';
import type { DebugPanelProps, Severity, NoteInput, NetworkLogEntry, DomainTree, CapabilitySummary, CaseSummary, TestRunInput, Status, ManualItem } from '../types';
import { useManualLoader } from '../hooks/useManualLoader';
import { MarkdownRenderer } from './manual/MarkdownRenderer';

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
  }
}

// カラー定義
const COLORS = {
  primary: '#1E40AF',
  primaryHover: '#1E3A8A',
  secondary: '#F59E0B',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  success: '#059669',
  successBg: '#D1FAE5',
};

type PipTab = 'record' | 'manage' | 'test' | 'manual';

/**
 * マニュアルタブコンテンツ（hooks の条件呼び出し回避用）
 */
function ManualTabContent({
  items,
  defaultPath,
  onNavigate,
  onAppNavigate,
}: {
  items: ManualItem[];
  defaultPath?: string;
  onNavigate?: (path: string) => void;
  onAppNavigate?: (path: string) => void;
}) {
  const [selectedPath, setSelectedPath] = useState<string>(defaultPath || items[0]?.path || '');
  const { content, loading, error } = useManualLoader(selectedPath);

  const handleSelect = (path: string) => {
    setSelectedPath(path);
    onNavigate?.(path);
  };

  return (
    <div className="debug-manual-tab">
      <div className="debug-manual-sidebar">
        {items.map(item => (
          <button
            key={item.id}
            className={`debug-manual-item ${selectedPath === item.path ? 'active' : ''}`}
            onClick={() => handleSelect(item.path)}
            title={item.title}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="debug-manual-content">
        {loading && <div className="debug-empty">読み込み中...</div>}
        {error && <div className="debug-message debug-message-error">{error.message}</div>}
        {content && (
          <MarkdownRenderer
            content={content}
            onLinkClick={(path) => {
              setSelectedPath(path);
              onNavigate?.(path);
            }}
            onAppLinkClick={onAppNavigate}
          />
        )}
      </div>
    </div>
  );
}

/**
 * デバッグパネル（PiP）
 */
export function DebugPanel({
  apiBaseUrl,
  env = 'dev',
  onSave,
  onClose,
  initialSize = { width: 400, height: 500 },
  testCases,
  logCapture,
  manualItems,
  manualDefaultPath,
  onManualNavigate,
  onManualAppNavigate,
}: DebugPanelProps) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isOpeningRef = useRef(false);

  // タブ状態
  const [activeTab, setActiveTab] = useState<PipTab>('record');
  const hasTestTab = testCases && testCases.length > 0;
  const hasManualTab = manualItems && manualItems.length > 0;

  // フォーム状態（記録タブ）
  const [content, setContent] = useState('');
  const [userLog, setUserLog] = useState('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [saving, setSaving] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [attachGetResponse, setAttachGetResponse] = useState(false);
  const [attachDuration, setAttachDuration] = useState(false);
  const [attachHeaders, setAttachHeaders] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 管理タブ用
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [manageStatusFilter, setManageStatusFilter] = useState<Set<Status>>(new Set(['resolved']));

  // テストタブ用
  const [testTree, setTestTree] = useState<DomainTree[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());
  const [caseChecks, setCaseChecks] = useState<Record<number, boolean>>({});
  const [bugForms, setBugForms] = useState<Record<string, { caseIds: number[]; content: string; severity: Severity | '' }>>({});
  const [submittingCap, setSubmittingCap] = useState<string | null>(null);

  // API URL 設定
  useEffect(() => {
    if (apiBaseUrl) {
      setDebugApiBaseUrl(apiBaseUrl);
    }
  }, [apiBaseUrl]);

  const { notes, createNote, updateStatus, refresh, error: hookError } = useDebugNotes(env);
  const hookErrorRef = useRef(hookError);
  hookErrorRef.current = hookError;

  // テストタブ: マウント時にimport → tree fetch（参照安定化）
  const prevTestCasesRef = useRef<string>('');
  useEffect(() => {
    if (!testCases || testCases.length === 0) return;
    const key = JSON.stringify(testCases);
    if (key === prevTestCasesRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await api.importTestCases(testCases);
      } catch (err) {
        console.warn('Failed to import test cases:', err);
        return; // import失敗時はrefを設定せず、リトライ可能にする
      }
      if (cancelled) return;
      try {
        const tree = await api.getTestTree(env);
        if (cancelled) return;
        setTestTree(tree);
        prevTestCasesRef.current = key; // 成功時のみrefを設定
        // 初期チェック状態: last=pass のCaseはチェック済み
        const checks: Record<number, boolean> = {};
        for (const domain of tree) {
          for (const cap of domain.capabilities) {
            for (const c of cap.cases) {
              if (c.last === 'pass') {
                checks[c.caseId] = true;
              }
            }
          }
        }
        setCaseChecks(checks);
      } catch (err) {
        console.warn('Failed to fetch test tree:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [testCases, env]);

  // PiPウィンドウを開く
  const openPipWindow = useCallback(async () => {
    if (!window.documentPictureInPicture) {
      console.warn('Document Picture-in-Picture API is not supported');
      setIsOpen(true); // フォールバック
      return;
    }

    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: initialSize.width,
        height: initialSize.height,
      });

      const style = pip.document.createElement('style');
      style.textContent = getPipStyles();
      pip.document.head.appendChild(style);

      const container = pip.document.createElement('div');
      container.id = 'debug-panel-root';
      pip.document.body.appendChild(container);

      setPipWindow(pip);
      setPipContainer(container);
      setIsOpen(true);

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
        setPipContainer(null);
        setIsOpen(false);
        onClose?.();
      });
    } catch (err) {
      console.error('Failed to open PiP window:', err);
      setIsOpen(true); // フォールバック
    } finally {
      isOpeningRef.current = false;
    }
  }, [initialSize.width, initialSize.height, onClose]);

  // PiPウィンドウを閉じる
  const closePipWindow = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
    } else {
      setIsOpen(false);
      onClose?.();
    }
  }, [pipWindow, onClose]);

  // フォームリセット
  const resetForm = useCallback(() => {
    setContent('');
    setUserLog('');
    setSeverity('');
    setShowAttachOptions(false);
    setAttachGetResponse(false);
    setAttachDuration(false);
    setAttachHeaders(false);
    setMessage(null);
  }, []);

  // 保存処理（記録タブ）
  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setMessage({ type: 'error', text: '内容は必須です' });
      return;
    }

    setSaving(true);
    setMessage(null);

    // ネットワークログのフィルタ処理
    const rawNetworkLogs = logCapture?.getNetworkLogs() ?? [];
    const filteredNetworkLogs = rawNetworkLogs.map(log => {
      const filtered: NetworkLogEntry = {
        timestamp: log.timestamp,
        method: log.method,
        url: log.url,
        status: log.status,
      };
      const isModifying = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(log.method);
      // 必須: POST等のrequest/responseBody
      if (isModifying) {
        if (log.requestBody !== undefined) filtered.requestBody = log.requestBody;
        if (log.responseBody !== undefined) filtered.responseBody = log.responseBody;
      }
      // オプション: GETレスポンス
      if (!isModifying && attachGetResponse && log.responseBody !== undefined) {
        filtered.responseBody = log.responseBody;
      }
      // オプション: duration
      if (attachDuration && log.duration != null) {
        filtered.duration = log.duration;
      }
      // オプション: ヘッダー
      if (attachHeaders) {
        if (log.requestHeaders) filtered.requestHeaders = log.requestHeaders;
        if (log.responseHeaders) filtered.responseHeaders = log.responseHeaders;
      }
      return filtered;
    });

    const input: NoteInput = {
      content: content.trim(),
      userLog: userLog ? maskSensitive(userLog) : undefined,
      severity: severity || undefined,
      consoleLogs: logCapture?.getConsoleLogs(),
      networkLogs: filteredNetworkLogs.length > 0 ? filteredNetworkLogs : undefined,
      environment: typeof window !== 'undefined' ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      } : undefined,
    };

    const note = await createNote(input);

    if (note) {
      setMessage({ type: 'success', text: '保存しました' });
      onSave?.(note);
      setTimeout(() => {
        resetForm();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: hookErrorRef.current?.message || '保存に失敗しました' });
    }

    setSaving(false);
  }, [content, userLog, severity, attachGetResponse, attachDuration, attachHeaders, createNote, onSave, resetForm, logCapture]);

  // 管理タブ: ステータス変更
  const handleStatusChange = useCallback(async (id: number, status: Status) => {
    setLoadingAction(`status-${id}`);
    try {
      await updateStatus(id, status);
    } finally {
      setLoadingAction(null);
    }
  }, [updateStatus]);

  // テストタブ: Capability単位で送信
  const handleSubmitCapability = useCallback(async (domain: string, capName: string, cases: CaseSummary[]) => {
    const capKey = `${domain}/${capName}`;
    setSubmittingCap(capKey);
    setMessage(null);

    try {
      const runs: TestRunInput[] = [];

      // バグ報告対象のcaseIdsを特定（passから除外するため）
      const bugForm = bugForms[capKey];
      const failCaseIds = (bugForm?.content.trim() && bugForm.caseIds.length > 0)
        ? bugForm.caseIds : [];
      const failSet = new Set(failCaseIds);

      // チェック済みCase → pass（FAIL報告対象は除外）
      for (const c of cases) {
        if (caseChecks[c.caseId] && !failSet.has(c.caseId)) {
          runs.push({ caseId: c.caseId, result: 'pass' });
        }
      }

      // fail（note なしで送信、failNote として別送）
      for (const id of failCaseIds) {
        runs.push({ caseId: id, result: 'fail' });
      }

      if (runs.length === 0) {
        setMessage({ type: 'error', text: 'チェックまたはバグ報告が必要です' });
        setSubmittingCap(null);
        return;
      }

      // failNote を構築
      const envInfo = typeof window !== 'undefined' ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      } : undefined;

      const failNote = failCaseIds.length > 0 ? {
        content: bugForm!.content.trim(),
        severity: bugForm!.severity || undefined,
        consoleLogs: logCapture?.getConsoleLogs(),
        networkLogs: logCapture?.getNetworkLogs(),
        environment: envInfo,
      } : undefined;

      const response = await api.submitTestRuns(env, runs, failNote);

      // ツリーの該当Capabilityを部分更新
      if (response.capability) {
        setTestTree(prev => prev.map(d => {
          if (d.domain !== domain) return d;
          return {
            ...d,
            capabilities: d.capabilities.map(cap =>
              cap.capability === capName ? response.capability : cap,
            ),
          };
        }));

        // チェック状態を更新: pass → checked, fail → unchecked
        const newChecks = { ...caseChecks };
        for (const c of response.capability.cases) {
          newChecks[c.caseId] = c.last === 'pass';
        }
        setCaseChecks(newChecks);
      }

      // 管理タブのノート一覧を更新
      refresh();

      // バグ報告フォームリセット
      setBugForms(prev => {
        const next = { ...prev };
        delete next[capKey];
        return next;
      });

      setMessage({ type: 'success', text: '送信しました' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '送信に失敗しました' });
    } finally {
      setSubmittingCap(null);
    }
  }, [caseChecks, bugForms, env, logCapture, refresh]);

  // テストタブ: トグル
  const toggleDomain = useCallback((domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }, []);

  const toggleCapability = useCallback((capKey: string) => {
    setExpandedCapabilities(prev => {
      const next = new Set(prev);
      if (next.has(capKey)) next.delete(capKey);
      else next.add(capKey);
      return next;
    });
  }, []);

  // 管理タブ: ステータスフィルタ
  const activeNotes = useMemo(() => {
    if (manageStatusFilter.size === 0) return notes;
    return notes.filter(n => manageStatusFilter.has(n.status));
  }, [notes, manageStatusFilter]);

  // Case ステータスラベル
  const getCaseStatusLabel = (c: CaseSummary) => {
    if (c.last === 'pass') return 'passed';
    if (c.last === 'fail' && c.openIssues === 0) return 'retest';
    if (c.last === 'fail') return 'fail';
    return '-';
  };

  const getCaseStatusColor = (c: CaseSummary) => {
    if (c.last === 'pass') return COLORS.success;
    if (c.last === 'fail' && c.openIssues === 0) return '#F59E0B';
    if (c.last === 'fail') return COLORS.error;
    return COLORS.gray500;
  };

  // Capability ステータスラベル
  const getCapStatusLabel = (cap: CapabilitySummary) => {
    if (cap.status === 'passed') return 'passed';
    if (cap.status === 'retest') return 'retest';
    if (cap.status === 'fail') return 'fail';
    return '';
  };

  const getCapStatusColor = (cap: CapabilitySummary) => {
    if (cap.status === 'passed') return COLORS.success;
    if (cap.status === 'retest') return '#F59E0B';
    if (cap.status === 'fail') return COLORS.error;
    return COLORS.gray500;
  };

  // PiPデータ更新
  const [refreshing, setRefreshing] = useState(false);

  const refreshTestTree = useCallback(async () => {
    setRefreshing(true);
    try {
      const tree = await api.getTestTree(env);
      setTestTree(tree);
      const newChecks: Record<number, boolean> = {};
      for (const d of tree) {
        for (const cap of d.capabilities) {
          for (const c of cap.cases) {
            newChecks[c.caseId] = c.last === 'pass';
          }
        }
      }
      setCaseChecks(newChecks);
    } catch {
      setMessage({ type: 'error', text: 'データの更新に失敗しました' });
    } finally {
      setRefreshing(false);
    }
  }, [env]);

  const handleRefresh = useCallback(async () => {
    if (activeTab === 'manage') {
      refresh();
    } else if (activeTab === 'test') {
      await refreshTestTree();
    }
  }, [activeTab, refresh, refreshTestTree]);

  // フォームコンテンツ
  const formContent = (
    <div className="debug-panel">
      <header className="debug-header">
        <div className="debug-header-left">
          <span className="debug-icon">edit_note</span>
          <span className="debug-title">デバッグノート</span>
          <span className="debug-env">{env}</span>
        </div>
        <div className="debug-header-right">
          {activeTab !== 'record' && (
            <button
              className="debug-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="データを更新"
            >
              <span
                className="debug-icon"
                style={{
                  fontSize: '18px',
                  animation: refreshing ? 'spin 0.6s linear infinite' : 'none',
                }}
              >
                sync
              </span>
            </button>
          )}
          <button onClick={closePipWindow} className="debug-close-btn" aria-label="閉じる">
            <span className="debug-icon">close</span>
          </button>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav className="debug-tabs">
        <button
          className={`debug-tab ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => { setActiveTab('record'); setMessage(null); }}
        >
          記録
        </button>
        <button
          className={`debug-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => { setActiveTab('manage'); setMessage(null); }}
        >
          管理
        </button>
        {hasTestTab && (
          <button
            className={`debug-tab ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => { setActiveTab('test'); setMessage(null); }}
          >
            テスト
          </button>
        )}
        {hasManualTab && (
          <button
            className={`debug-tab ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manual'); setMessage(null); }}
          >
            マニュアル
          </button>
        )}
      </nav>

      <main className="debug-content">
        {message && (
          <div className={`debug-message debug-message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* 記録タブ */}
        {activeTab === 'record' && (
          <>
            <div className="debug-field">
              <label htmlFor="debug-severity">重要度（任意）</label>
              <select
                id="debug-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity | '')}
              >
                <option value="">未設定</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="debug-field">
              <label htmlFor="debug-content">内容 *</label>
              <textarea
                id="debug-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="詳細な説明"
                rows={4}
                maxLength={4000}
              />
            </div>

            <div className="debug-field">
              <label htmlFor="debug-log">補足メモ（任意）</label>
              <textarea
                id="debug-log"
                value={userLog}
                onChange={(e) => setUserLog(e.target.value)}
                placeholder="状況や気づいたことを自由に記入"
                rows={3}
                maxLength={20000}
              />
              <span className="debug-hint">機密情報は自動でマスクされます</span>
            </div>

            <div className="debug-toggle">
              <button
                type="button"
                onClick={() => setShowAttachOptions(!showAttachOptions)}
                className="debug-toggle-btn"
              >
                <span className="debug-icon" style={{ fontSize: '18px' }}>
                  {showAttachOptions ? 'expand_less' : 'expand_more'}
                </span>
                添付オプション
              </button>
            </div>

            {showAttachOptions && (
              <div className="debug-attach-options">
                <label className="debug-attach-option">
                  <input
                    type="checkbox"
                    checked={attachGetResponse}
                    onChange={(e) => setAttachGetResponse(e.target.checked)}
                  />
                  GETレスポンスを含める
                </label>
                <label className="debug-attach-option">
                  <input
                    type="checkbox"
                    checked={attachDuration}
                    onChange={(e) => setAttachDuration(e.target.checked)}
                  />
                  通信時間を含める
                </label>
                <label className="debug-attach-option">
                  <input
                    type="checkbox"
                    checked={attachHeaders}
                    onChange={(e) => setAttachHeaders(e.target.checked)}
                  />
                  ヘッダーを含める
                </label>
              </div>
            )}
          </>
        )}

        {/* 管理タブ */}
        {activeTab === 'manage' && (
          <div className="debug-manage">
            <div className="debug-status-filter">
              {(['open', 'resolved', 'rejected', 'fixed'] as Status[]).map(s => (
                <button
                  key={s}
                  className={`debug-status-chip ${manageStatusFilter.has(s) ? 'active' : ''}`}
                  onClick={() => {
                    setManageStatusFilter(prev => {
                      const next = new Set(prev);
                      if (next.has(s)) {
                        next.delete(s);
                      } else {
                        next.add(s);
                      }
                      return next;
                    });
                  }}
                >
                  {s}
                </button>
              ))}
              <span className="debug-filter-count">{activeNotes.length}件</span>
            </div>
            {activeNotes.length === 0 ? (
              <div className="debug-empty">対応中のノートはありません</div>
            ) : (
              activeNotes.map(note => (
                <div key={note.id} className="debug-note-row" data-status={note.status}>
                  <div className="debug-note-info">
                    <span className="debug-note-id">#{note.id}</span>
                    <span className={`debug-severity-dot ${note.severity || 'none'}`} />
                    <span className="debug-note-preview">
                      {note.source === 'test' && <span className="debug-source-badge">🧪</span>}
                      {note.content.split('\n')[0].slice(0, 40)}
                    </span>
                  </div>
                  <select
                    className="debug-status-select"
                    value={note.status}
                    onChange={(e) => handleStatusChange(note.id, e.target.value as Status)}
                    disabled={loadingAction !== null}
                  >
                    <option value="open">open</option>
                    <option value="resolved">resolved</option>
                    <option value="rejected">rejected</option>
                    <option value="fixed">fixed</option>
                  </select>
                </div>
              ))
            )}
          </div>
        )}

        {/* マニュアルタブ */}
        {activeTab === 'manual' && hasManualTab && (
          <ManualTabContent
            items={manualItems!}
            defaultPath={manualDefaultPath}
            onNavigate={onManualNavigate}
            onAppNavigate={onManualAppNavigate}
          />
        )}

        {/* テストタブ */}
        {activeTab === 'test' && hasTestTab && (
          <div className="debug-test-tree">
            {testTree.length === 0 ? (
              <div className="debug-empty">テストケースを読み込み中...</div>
            ) : (
              testTree.map(domain => (
                <div key={domain.domain} className="debug-tree-domain">
                  <button
                    className="debug-tree-toggle"
                    onClick={() => toggleDomain(domain.domain)}
                  >
                    <span className="debug-icon" style={{ fontSize: '18px' }}>
                      {expandedDomains.has(domain.domain) ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span className="debug-tree-label">{domain.domain}</span>
                  </button>

                  {expandedDomains.has(domain.domain) && domain.capabilities.map(cap => {
                    const capKey = `${domain.domain}/${cap.capability}`;
                    const isExpanded = expandedCapabilities.has(capKey);
                    const bugForm = bugForms[capKey];

                    return (
                      <div key={capKey} className="debug-tree-capability">
                        <button
                          className="debug-tree-toggle debug-tree-cap-toggle"
                          onClick={() => toggleCapability(capKey)}
                        >
                          <span className="debug-icon" style={{ fontSize: '18px' }}>
                            {isExpanded ? 'expand_more' : 'chevron_right'}
                          </span>
                          <span className="debug-tree-label">{cap.capability}</span>
                          <span className="debug-tree-count">{cap.passed}/{cap.total}</span>
                          {cap.status && (
                            <span className="debug-tree-status" style={{ color: getCapStatusColor(cap) }}>
                              {getCapStatusLabel(cap)}
                            </span>
                          )}
                          {cap.openIssues > 0 && (
                            <span className="debug-tree-issues">[{cap.openIssues}件]</span>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="debug-tree-cases">
                            {cap.cases.map(c => (
                              <label key={c.caseId} className="debug-tree-case">
                                <input
                                  type="checkbox"
                                  checked={!!caseChecks[c.caseId]}
                                  onChange={(e) => {
                                    setCaseChecks(prev => ({
                                      ...prev,
                                      [c.caseId]: e.target.checked,
                                    }));
                                  }}
                                />
                                <span className="debug-tree-case-title">{c.title}</span>
                                <span className="debug-tree-case-status" style={{ color: getCaseStatusColor(c) }}>
                                  {getCaseStatusLabel(c)}
                                </span>
                                {c.openIssues > 0 && (
                                  <span className="debug-tree-issues">[{c.openIssues}件]</span>
                                )}
                              </label>
                            ))}

                            {/* バグ報告フォーム */}
                            <div className="debug-bug-form">
                              <div className="debug-bug-form-title">バグ報告</div>
                              <div className="debug-field">
                                <label>ケース（複数選択可）</label>
                                <div className="debug-bug-cases">
                                  {cap.cases.map(c => {
                                    const isChecked = bugForm?.caseIds.includes(c.caseId) ?? false;
                                    return (
                                      <label key={c.caseId} className="debug-bug-case-option">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            setBugForms(prev => {
                                              const current = prev[capKey] || { caseIds: [], content: '', severity: '' as Severity | '' };
                                              const ids = e.target.checked
                                                ? [...current.caseIds, c.caseId]
                                                : current.caseIds.filter(id => id !== c.caseId);
                                              return { ...prev, [capKey]: { ...current, caseIds: ids } };
                                            });
                                          }}
                                        />
                                        <span>{c.title}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="debug-field">
                                <label>内容</label>
                                <textarea
                                  value={bugForm?.content || ''}
                                  onChange={(e) => {
                                    setBugForms(prev => ({
                                      ...prev,
                                      [capKey]: {
                                        ...prev[capKey],
                                        caseIds: prev[capKey]?.caseIds || [],
                                        content: e.target.value,
                                        severity: prev[capKey]?.severity || '',
                                      },
                                    }));
                                  }}
                                  placeholder="バグの内容"
                                  rows={2}
                                />
                              </div>
                              <div className="debug-field">
                                <label>重要度</label>
                                <select
                                  value={bugForm?.severity || ''}
                                  onChange={(e) => {
                                    setBugForms(prev => ({
                                      ...prev,
                                      [capKey]: {
                                        ...prev[capKey],
                                        caseIds: prev[capKey]?.caseIds || [],
                                        content: prev[capKey]?.content || '',
                                        severity: e.target.value as Severity | '',
                                      },
                                    }));
                                  }}
                                >
                                  <option value="">未設定</option>
                                  <option value="low">low</option>
                                  <option value="medium">medium</option>
                                  <option value="high">high</option>
                                  <option value="critical">critical</option>
                                </select>
                              </div>
                            </div>

                            {/* 送信ボタン */}
                            {(() => {
                              const failCount = bugForm?.content.trim() ? (bugForm.caseIds.length) : 0;
                              const passCount = cap.cases.filter(c => caseChecks[c.caseId] && !(bugForm?.caseIds.includes(c.caseId) && failCount > 0)).length;
                              const submitCount = passCount + failCount;
                              return (
                                <button
                                  className="debug-btn debug-btn-primary debug-cap-submit"
                                  onClick={() => handleSubmitCapability(domain.domain, cap.capability, cap.cases)}
                                  disabled={submittingCap !== null || submitCount === 0}
                                >
                                  {submittingCap === capKey ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{
                                        display: 'inline-block',
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite',
                                      }} />
                                      送信中
                                    </span>
                                  ) : `${submitCount}/${cap.total}件を送信`}
                                </button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* 記録タブのfooter */}
      {activeTab === 'record' && (
        <footer className="debug-footer">
          <button onClick={resetForm} className="debug-btn debug-btn-secondary" disabled={saving}>
            クリア
          </button>
          <button onClick={handleSave} className="debug-btn debug-btn-primary" disabled={saving}>
            {saving ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                保存中
              </span>
            ) : '保存'}
          </button>
        </footer>
      )}
    </div>
  );

  // PiP対応の場合
  if (pipContainer) {
    return createPortal(formContent, pipContainer);
  }

  // フォールバック（DOM内表示）
  if (isOpen) {
    return (
      <div style={fallbackStyles.overlay}>
        <div style={fallbackStyles.panel}>
          {formContent}
        </div>
      </div>
    );
  }

  // トリガーボタン
  return (
    <button onClick={openPipWindow} style={triggerButtonStyle} aria-label="デバッグノートを開く">
      <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2, textAlign: 'center' }}>バグ<br />記録</span>
    </button>
  );
}

// トリガーボタンのスタイル
const triggerButtonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: COLORS.primary,
  color: COLORS.white,
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

// フォールバック用スタイル
const fallbackStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  panel: {
    width: '400px',
    maxHeight: '90vh',
    background: COLORS.white,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
};

/**
 * PiPウィンドウ用スタイル
 */
function getPipStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${COLORS.white};
      font-size: 14px;
      color: ${COLORS.gray900};
    }

    .debug-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
    }

    .debug-panel {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .debug-header-left .debug-icon {
      color: ${COLORS.secondary};
    }

    .debug-title {
      font-size: 16px;
      font-weight: 600;
    }

    .debug-env {
      font-size: 11px;
      padding: 2px 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      text-transform: uppercase;
    }

    .debug-header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .debug-refresh-btn {
      background: transparent;
      border: none;
      color: ${COLORS.white};
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }
    .debug-refresh-btn:hover {
      background: rgba(255,255,255,0.15);
    }
    .debug-refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .debug-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: ${COLORS.white};
      cursor: pointer;
    }

    .debug-close-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    /* タブ */
    .debug-tabs {
      display: flex;
      border-bottom: 1px solid ${COLORS.gray200};
      background: ${COLORS.gray100};
    }

    .debug-tab {
      flex: 1;
      padding: 10px 0;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      color: ${COLORS.gray500};
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .debug-tab:hover {
      color: ${COLORS.gray700};
    }

    .debug-tab.active {
      color: ${COLORS.primary};
      border-bottom-color: ${COLORS.primary};
    }

    .debug-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .debug-message {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
    }

    .debug-message-success {
      background: ${COLORS.successBg};
      color: ${COLORS.success};
    }

    .debug-message-error {
      background: ${COLORS.errorBg};
      color: ${COLORS.error};
    }

    .debug-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .debug-field label {
      font-size: 13px;
      font-weight: 500;
      color: ${COLORS.gray700};
    }

    .debug-field input,
    .debug-field textarea,
    .debug-field select {
      padding: 10px 12px;
      border: 1px solid ${COLORS.gray300};
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s;
    }

    .debug-field input:focus,
    .debug-field textarea:focus,
    .debug-field select:focus {
      outline: none;
      border-color: ${COLORS.primary};
    }

    .debug-field textarea {
      resize: vertical;
      min-height: 60px;
    }

    .debug-hint {
      font-size: 11px;
      color: ${COLORS.gray500};
    }

    .debug-toggle {
      display: flex;
      justify-content: center;
    }

    .debug-toggle-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: transparent;
      border: 1px dashed ${COLORS.gray300};
      border-radius: 6px;
      color: ${COLORS.gray500};
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-toggle-btn:hover {
      border-color: ${COLORS.primary};
      color: ${COLORS.primary};
    }

    .debug-attach-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: ${COLORS.gray100};
      border-radius: 8px;
    }

    .debug-attach-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: ${COLORS.gray700};
      cursor: pointer;
    }

    .debug-attach-option input[type="checkbox"] {
      accent-color: ${COLORS.primary};
    }

    .debug-footer {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid ${COLORS.gray200};
      background: ${COLORS.gray100};
    }

    .debug-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .debug-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .debug-btn-primary {
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-btn-primary:hover:not(:disabled) {
      background: ${COLORS.primaryHover};
    }

    .debug-btn-secondary {
      background: ${COLORS.white};
      color: ${COLORS.gray700};
      border: 1px solid ${COLORS.gray300};
    }

    .debug-btn-secondary:hover:not(:disabled) {
      background: ${COLORS.gray100};
    }

    /* 管理タブ: ステータスフィルタ */
    .debug-status-filter {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      padding-bottom: 8px;
      border-bottom: 1px solid ${COLORS.gray200};
    }

    .debug-status-chip {
      padding: 4px 10px;
      border: 1px solid ${COLORS.gray300};
      border-radius: 12px;
      background: ${COLORS.white};
      color: ${COLORS.gray500};
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-status-chip:hover {
      border-color: ${COLORS.primary};
      color: ${COLORS.primary};
    }

    .debug-status-chip.active {
      background: ${COLORS.primary};
      border-color: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-filter-count {
      font-size: 11px;
      color: ${COLORS.gray500};
      margin-left: auto;
    }

    /* 管理タブ */
    .debug-manage {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-note-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: ${COLORS.gray100};
      border-radius: 8px;
    }

    .debug-note-row[data-status="resolved"] {
      background: #FFFBEB;
      border-left: 3px solid #F59E0B;
    }

    .debug-note-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .debug-note-id {
      font-size: 11px;
      color: ${COLORS.gray500};
      font-family: monospace;
      min-width: 32px;
      flex-shrink: 0;
    }

    .debug-note-preview {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-source-badge {
      margin-right: 4px;
    }

    .debug-severity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .debug-severity-dot.critical { background: #7C2D12; }
    .debug-severity-dot.high { background: ${COLORS.error}; }
    .debug-severity-dot.medium { background: ${COLORS.secondary}; }
    .debug-severity-dot.low { background: ${COLORS.primary}; }
    .debug-severity-dot.none { background: ${COLORS.gray300}; }

    .debug-status-select {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid ${COLORS.gray300};
      border-radius: 4px;
      background: ${COLORS.white};
      cursor: pointer;
      flex-shrink: 0;
    }

    .debug-empty {
      text-align: center;
      padding: 40px 16px;
      color: ${COLORS.gray500};
      font-size: 13px;
    }

    /* テストタブ: ツリー */
    .debug-test-tree {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .debug-tree-domain {
      display: flex;
      flex-direction: column;
    }

    .debug-tree-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: ${COLORS.gray900};
      font-weight: 600;
      width: 100%;
      text-align: left;
    }

    .debug-tree-toggle:hover {
      background: ${COLORS.gray100};
      border-radius: 4px;
    }

    .debug-tree-label {
      flex: 1;
    }

    .debug-tree-count {
      font-size: 12px;
      color: ${COLORS.gray500};
      font-weight: 500;
    }

    .debug-tree-status {
      font-size: 11px;
      font-weight: 600;
    }

    .debug-tree-issues {
      font-size: 11px;
      color: ${COLORS.error};
      font-weight: 500;
    }

    .debug-tree-capability {
      margin-left: 16px;
      display: flex;
      flex-direction: column;
    }

    .debug-tree-cap-toggle {
      font-weight: 500;
      font-size: 13px;
    }

    .debug-tree-cases {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 0;
    }

    .debug-tree-case {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: ${COLORS.gray700};
    }

    .debug-tree-case:hover {
      background: ${COLORS.gray100};
    }

    .debug-tree-case input[type="checkbox"] {
      flex-shrink: 0;
      accent-color: ${COLORS.primary};
    }

    .debug-tree-case-title {
      flex: 1;
    }

    .debug-tree-case-status {
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
    }

    /* バグ報告フォーム */
    .debug-bug-form {
      margin-top: 8px;
      padding: 12px;
      background: ${COLORS.gray100};
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-bug-form-title {
      font-size: 12px;
      font-weight: 600;
      color: ${COLORS.gray700};
      padding-bottom: 4px;
      border-bottom: 1px solid ${COLORS.gray200};
    }

    .debug-bug-form .debug-field {
      gap: 4px;
    }

    .debug-bug-form .debug-field label {
      font-size: 12px;
    }

    .debug-bug-form .debug-field select,
    .debug-bug-form .debug-field textarea {
      padding: 6px 8px;
      font-size: 12px;
    }

    .debug-bug-form .debug-field textarea {
      min-height: 40px;
    }

    .debug-bug-cases {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 120px;
      overflow-y: auto;
    }

    .debug-bug-case-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: ${COLORS.gray700};
    }

    .debug-bug-case-option:hover {
      background: ${COLORS.gray200};
    }

    .debug-bug-case-option input[type="checkbox"] {
      accent-color: ${COLORS.error};
      flex-shrink: 0;
    }

    .debug-cap-submit {
      margin-top: 8px;
      flex: none;
      padding: 8px 16px;
      font-size: 13px;
    }

    /* マニュアルタブ */
    .debug-manual-tab {
      display: flex;
      height: 100%;
      min-height: 0;
    }

    .debug-manual-sidebar {
      width: 140px;
      min-width: 140px;
      border-right: 1px solid ${COLORS.gray200};
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px;
    }

    .debug-manual-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 6px 8px;
      border: none;
      background: transparent;
      font-size: 12px;
      color: ${COLORS.gray700};
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-manual-item:hover {
      background: ${COLORS.gray100};
    }

    .debug-manual-item.active {
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-manual-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      min-width: 0;
    }

    /* Markdown スタイル */
    .manual-markdown {
      font-size: 13px;
      line-height: 1.6;
      color: ${COLORS.gray900};
    }

    .manual-markdown h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid ${COLORS.gray200}; }
    .manual-markdown h2 { font-size: 17px; font-weight: 600; margin: 14px 0 6px; }
    .manual-markdown h3 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
    .manual-markdown h4 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; }

    .manual-markdown p { margin: 8px 0; }

    .manual-markdown ul, .manual-markdown ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .manual-markdown li { margin: 2px 0; }

    .manual-markdown code {
      background: ${COLORS.gray100};
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .manual-markdown pre {
      background: ${COLORS.gray100};
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .manual-markdown pre code {
      background: none;
      padding: 0;
    }

    .manual-markdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
      font-size: 12px;
    }

    .manual-markdown th, .manual-markdown td {
      border: 1px solid ${COLORS.gray200};
      padding: 6px 8px;
      text-align: left;
    }

    .manual-markdown th {
      background: ${COLORS.gray100};
      font-weight: 600;
    }

    .manual-markdown blockquote {
      border-left: 3px solid ${COLORS.gray300};
      padding-left: 12px;
      margin: 8px 0;
      color: ${COLORS.gray500};
    }

    .manual-markdown img {
      max-width: 100%;
      height: auto;
    }

    .manual-markdown hr {
      border: none;
      border-top: 1px solid ${COLORS.gray200};
      margin: 16px 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
}
