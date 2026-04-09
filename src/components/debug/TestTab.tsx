import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { api } from '../../utils/api';
import { DEBUG_COLORS as COLORS } from '../../styles/colors';
import { ImageDropZone } from './ImageDropZone';
import type {
  Severity,
  DomainTree,
  CapabilitySummary,
  CaseSummary,
  TestRunInput,
  ParsedTestCase,
  Environment,
  LogCaptureInstance,
} from '../../types';

export interface TestTabHandle {
  refresh: () => Promise<void>;
}

interface TestTabProps {
  testCases: ParsedTestCase[];
  env: Environment;
  logCapture?: LogCaptureInstance;
  onNotesRefresh: () => void;
  /** 現在「実行中」のテストケース ID が変化したときに呼ばれる。展開中の capability の全 case ID の和集合 */
  onRunningCasesChange?: (caseIds: number[]) => void;
}

export const TestTab = forwardRef<TestTabHandle, TestTabProps>(function TestTab(
  { testCases, env, logCapture, onNotesRefresh, onRunningCasesChange },
  ref,
) {
  const [testTree, setTestTree] = useState<DomainTree[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());
  const [caseChecks, setCaseChecks] = useState<Record<number, boolean>>({});
  const [bugForms, setBugForms] = useState<Record<string, { caseIds: number[]; content: string; severity: Severity | ''; files: File[] }>>({});
  const [submittingCap, setSubmittingCap] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // テストケースimport → tree fetch
  const prevTestCasesRef = useRef<string>('');
  useEffect(() => {
    if (!testCases || testCases.length === 0) return;
    const key = JSON.stringify(testCases);
    if (key === prevTestCasesRef.current) return;

    let cancelled = false;

    (async () => {
      // import は best-effort。失敗しても tree 取得は必ず試みる
      try {
        await api.importTestCases(testCases);
      } catch (err) {
        console.warn('Failed to import test cases:', err);
      }
      if (cancelled) return;
      try {
        const tree = await api.getTestTree(env);
        if (cancelled) return;
        setTestTree(tree);
        prevTestCasesRef.current = key;
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

  // ツリー更新
  const refreshTestTree = useCallback(async () => {
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
    }
  }, [env]);

  useImperativeHandle(ref, () => ({ refresh: refreshTestTree }), [refreshTestTree]);

  // 展開中の capability に属する case ID を「実行中」として親に通知
  useEffect(() => {
    if (!onRunningCasesChange) return;
    const running: number[] = [];
    for (const domain of testTree) {
      for (const cap of domain.capabilities) {
        const capKey = `${domain.domain}/${cap.capability}`;
        if (expandedCapabilities.has(capKey)) {
          for (const c of cap.cases) running.push(c.caseId);
        }
      }
    }
    onRunningCasesChange(running);
  }, [expandedCapabilities, testTree, onRunningCasesChange]);

  // Capability単位で送信
  const handleSubmitCapability = useCallback(async (domain: string, capName: string, cases: CaseSummary[]) => {
    const capKey = `${domain}/${capName}`;
    setSubmittingCap(capKey);
    setMessage(null);

    try {
      const runs: TestRunInput[] = [];

      const bugForm = bugForms[capKey];
      const failCaseIds = (bugForm?.content.trim() && bugForm.caseIds.length > 0)
        ? bugForm.caseIds : [];
      const failSet = new Set(failCaseIds);

      for (const c of cases) {
        if (caseChecks[c.caseId] && !failSet.has(c.caseId)) {
          runs.push({ caseId: c.caseId, result: 'pass' });
        }
      }

      for (const id of failCaseIds) {
        runs.push({ caseId: id, result: 'fail' });
      }

      if (runs.length === 0) {
        setMessage({ type: 'error', text: 'チェックまたはバグ報告が必要です' });
        setSubmittingCap(null);
        return;
      }

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

      // バグ報告のノートに画像をアップロード
      if (bugForm?.files && bugForm.files.length > 0 && response.results) {
        const noteIds = response.results
          .filter(r => r.noteId != null)
          .map(r => r.noteId!);
        // 最初のノートIDに添付（全fail ケースが1ノートを共有する設計）
        const targetNoteId = noteIds[0];
        if (targetNoteId) {
          for (const file of bugForm.files) {
            try {
              await api.uploadAttachment(env, targetNoteId, file);
            } catch (err) {
              console.warn('Failed to upload attachment:', err);
            }
          }
        }
      }

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

        const newChecks = { ...caseChecks };
        for (const c of response.capability.cases) {
          newChecks[c.caseId] = c.last === 'pass';
        }
        setCaseChecks(newChecks);
      }

      onNotesRefresh();

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
  }, [caseChecks, bugForms, env, logCapture, onNotesRefresh]);

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

  return (
    <>
      {message && (
        <div className={`debug-message debug-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="debug-test-tree">
        {testTree.length === 0 ? (
          <div className="debug-empty">テストケースを読み込み中...</div>
        ) : (
          testTree.map(domain => (
            <div key={domain.domain} className="debug-tree-domain">
              <button
                data-testid={`domain-toggle-${domain.domain}`}
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
                      data-testid={`cap-toggle-${capKey}`}
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
                          <label key={c.caseId} data-testid={`case-${c.caseId}`} className="debug-tree-case">
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
                                          const current = prev[capKey] || { caseIds: [], content: '', severity: '' as Severity | '', files: [] };
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
                                    files: prev[capKey]?.files || [],
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
                                    files: prev[capKey]?.files || [],
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
                          <ImageDropZone
                            files={bugForm?.files || []}
                            onAdd={(newFiles) => {
                              setBugForms(prev => ({
                                ...prev,
                                [capKey]: {
                                  ...prev[capKey],
                                  caseIds: prev[capKey]?.caseIds || [],
                                  content: prev[capKey]?.content || '',
                                  severity: prev[capKey]?.severity || '',
                                  files: [...(prev[capKey]?.files || []), ...newFiles],
                                },
                              }));
                            }}
                            onRemove={(index) => {
                              setBugForms(prev => ({
                                ...prev,
                                [capKey]: {
                                  ...prev[capKey],
                                  caseIds: prev[capKey]?.caseIds || [],
                                  content: prev[capKey]?.content || '',
                                  severity: prev[capKey]?.severity || '',
                                  files: (prev[capKey]?.files || []).filter((_, i) => i !== index),
                                },
                              }));
                            }}
                            disabled={submittingCap !== null}
                          />
                        </div>

                        {/* 送信ボタン */}
                        {(() => {
                          const failCount = bugForm?.content.trim() ? (bugForm.caseIds.length) : 0;
                          const passCount = cap.cases.filter(c => caseChecks[c.caseId] && !(bugForm?.caseIds.includes(c.caseId) && failCount > 0)).length;
                          const submitCount = passCount + failCount;
                          return (
                            <button
                              data-testid={`cap-submit-${capKey}`}
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
    </>
  );
});
