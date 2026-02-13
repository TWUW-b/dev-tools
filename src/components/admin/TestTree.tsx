import { useState, useMemo, useEffect } from 'react';
import type { DomainTree, CaseSummary } from '../../types';

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
  link: string;
}

const TEST_COLORS = {
  passed: '#22c55e',
  fail: '#ef4444',
  retest: '#f59e0b',
  untested: '#9ca3af',
};

const TEST_COLORS_DARK = {
  passed: '#4ade80',
  fail: '#f87171',
  retest: '#fbbf24',
  untested: '#64748b',
};

type StatusFilter = 'all' | 'passed' | 'fail' | 'incomplete';

interface TestTreeProps {
  tree: DomainTree[];
  colors: Colors;
  isDarkMode: boolean;
  onNavigateToNote: (caseId: number) => void;
}

export function TestTree({ tree, colors, isDarkMode, onNavigateToNote }: TestTreeProps) {
  const tc = isDarkMode ? TEST_COLORS_DARK : TEST_COLORS;
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());

  // tree 変更時に新しい domain を自動展開
  useEffect(() => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      tree.forEach(d => next.add(d.domain));
      return next;
    });
  }, [tree]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [needsActionOnly, setNeedsActionOnly] = useState(false);

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const toggleCapability = (key: string) => {
    setExpandedCapabilities(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredTree = useMemo(() => {
    return tree
      .map((domain) => {
        const caps = domain.capabilities.filter((cap) => {
          const allPassed = cap.passed === cap.total && cap.total > 0;
          const hasFail = cap.failed > 0 || cap.openIssues > 0;
          const isIncomplete = cap.passed < cap.total;

          if (statusFilter === 'passed' && !allPassed) return false;
          if (statusFilter === 'fail' && !hasFail) return false;
          if (statusFilter === 'incomplete' && !isIncomplete) return false;

          if (needsActionOnly && allPassed && cap.openIssues === 0) return false;

          return true;
        });
        if (caps.length === 0) return null;
        return { ...domain, capabilities: caps };
      })
      .filter((d): d is DomainTree => d !== null);
  }, [tree, statusFilter, needsActionOnly]);

  if (tree.length === 0) return null;

  return (
    <div>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: colors.textSecondary,
        marginBottom: '16px',
      }}>
        詳細
      </h3>

      {/* フィルタバー */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          style={{
            padding: '8px 12px',
            border: 'none',
            borderRadius: '8px',
            background: colors.bgSecondary,
            color: colors.text,
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <option value="all">全て</option>
          <option value="passed">passed</option>
          <option value="fail">fail</option>
          <option value="incomplete">未完了</option>
        </select>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: colors.textSecondary,
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={needsActionOnly}
            onChange={(e) => setNeedsActionOnly(e.target.checked)}
            style={{ accentColor: colors.primary }}
          />
          要対応のみ
        </label>
      </div>

      {/* ツリー */}
      <div style={{
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {filteredTree.map((domain, di) => {
          const isExpanded = expandedDomains.has(domain.domain);
          const domainTotal = domain.capabilities.reduce((s, c) => s + c.total, 0);
          const domainPassed = domain.capabilities.reduce((s, c) => s + c.passed, 0);
          const pct = domainTotal > 0 ? Math.round((domainPassed / domainTotal) * 100) : 0;

          return (
            <div key={domain.domain}>
              {/* Domain 行 */}
              <div
                onClick={() => toggleDomain(domain.domain)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: colors.bgSecondary,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${colors.border}`,
                  borderTop: di > 0 ? `1px solid ${colors.border}` : 'none',
                  gap: '8px',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '12px', color: colors.textMuted, width: '16px' }}>
                  {isExpanded ? '\u25BC' : '\u25B6'}
                </span>
                <span style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: colors.text,
                  flex: 1,
                }}>
                  {domain.domain}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {domainPassed}/{domainTotal} {pct}%
                </span>
              </div>

              {/* Capabilities */}
              {isExpanded && domain.capabilities.map((cap) => {
                const capKey = `${domain.domain}/${cap.capability}`;
                const isCapExpanded = expandedCapabilities.has(capKey);
                const allPassed = cap.passed === cap.total && cap.total > 0;
                const hasFailWithOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues > 0);
                const hasFailWithoutOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues === 0);
                const isRetest = !hasFailWithOpenIssues && hasFailWithoutOpenIssues;
                const hasFail = hasFailWithOpenIssues;

                const icon = allPassed ? '\u25CF' : hasFail ? '\u25B2' : isRetest ? '\u25C6' : '\u25CB';
                const iconColor = allPassed ? tc.passed : hasFail ? tc.fail : isRetest ? tc.retest : tc.untested;

                return (
                  <div key={capKey}>
                    {/* Capability 行 */}
                    <div
                      onClick={() => toggleCapability(capKey)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 16px 10px 44px',
                        background: colors.bg,
                        cursor: 'pointer',
                        borderBottom: `1px solid ${colors.borderLight}`,
                        gap: '8px',
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ color: iconColor, fontSize: '14px', width: '16px' }}>
                        {icon}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: colors.text,
                        flex: 1,
                      }}>
                        {cap.capability}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: colors.textMuted,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {cap.passed}/{cap.total}
                      </span>
                      {allPassed && (
                        <span style={{
                          fontSize: '11px',
                          color: tc.passed,
                          fontWeight: 600,
                        }}>passed</span>
                      )}
                      {hasFail && (
                        <span style={{
                          fontSize: '11px',
                          color: tc.fail,
                          fontWeight: 600,
                        }}>fail</span>
                      )}
                      {isRetest && (
                        <span style={{
                          fontSize: '11px',
                          color: tc.retest,
                          fontWeight: 600,
                        }}>retest</span>
                      )}
                      {cap.openIssues > 0 && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: `${tc.fail}18`,
                          color: tc.fail,
                          fontWeight: 600,
                        }}>
                          {cap.openIssues}件
                        </span>
                      )}
                    </div>

                    {/* Cases */}
                    {isCapExpanded && cap.cases.map((c) => (
                      <CaseRow
                        key={c.caseId}
                        c={c}
                        tc={tc}
                        colors={colors}
                        onNavigateToNote={onNavigateToNote}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}

        {filteredTree.length === 0 && (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: colors.textMuted,
            fontSize: '13px',
          }}>
            該当するCapabilityがありません
          </div>
        )}
      </div>
    </div>
  );
}

function CaseRow({ c, tc, colors, onNavigateToNote }: {
  c: CaseSummary;
  tc: typeof TEST_COLORS;
  colors: Colors;
  onNavigateToNote: (caseId: number) => void;
}) {
  const isRetest = c.last === 'fail' && c.openIssues === 0;
  const icon = c.last === 'pass' ? '\u25CF'
    : isRetest ? '\u25C6'
    : c.last === 'fail' ? '\u25B2'
    : '\u25CB';
  const iconColor = c.last === 'pass' ? tc.passed
    : isRetest ? tc.retest
    : c.last === 'fail' ? tc.fail
    : tc.untested;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px 8px 72px',
      background: colors.bg,
      borderBottom: `1px solid ${colors.borderLight}`,
      gap: '8px',
      fontSize: '13px',
    }}>
      <span style={{ color: iconColor, fontSize: '12px', width: '16px' }}>
        {icon}
      </span>
      <span style={{ color: colors.text, flex: 1 }}>
        {c.title}
      </span>
      <span style={{
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        {c.last || '-'}
      </span>
      {c.openIssues > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToNote(c.caseId);
          }}
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '10px',
            background: `${tc.fail}18`,
            color: colors.link,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {c.openIssues}件
        </button>
      )}
    </div>
  );
}
