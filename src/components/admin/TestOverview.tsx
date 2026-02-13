import type { CaseSummary } from '../../types';

interface CapabilityVisual {
  capability: string;
  total: number;
  passed: number;
  failed: number;
  untested: number;
  openIssues: number;
  status: 'passed' | 'fail' | 'retest' | 'incomplete';
  cases: CaseSummary[];
}

export interface DomainVisual {
  domain: string;
  total: number;
  passed: number;
  failed: number;
  untested: number;
  hasIssues: boolean;
  capabilities: CapabilityVisual[];
}

interface Colors {
  bg: string;
  bgSecondary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
}

const TEST_COLORS = {
  passed: '#22c55e',
  passedBg: '#f0fdf4',
  fail: '#ef4444',
  failBg: '#fef2f2',
  retest: '#f59e0b',
  retestBg: '#fffbeb',
  untested: '#e5e7eb',
  untestedBg: '#f9fafb',
};

const TEST_COLORS_DARK = {
  passed: '#4ade80',
  passedBg: '#064e3b',
  fail: '#f87171',
  failBg: '#450a0a',
  retest: '#fbbf24',
  retestBg: '#451a03',
  untested: '#475569',
  untestedBg: '#1e293b',
};

interface TestOverviewProps {
  domains: DomainVisual[];
  colors: Colors;
  isDarkMode: boolean;
}

export function TestOverview({ domains, colors, isDarkMode }: TestOverviewProps) {
  const tc = isDarkMode ? TEST_COLORS_DARK : TEST_COLORS;

  if (domains.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: '14px',
      }}>
        テストケースが登録されていません
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: colors.textSecondary,
        marginBottom: '16px',
      }}>
        テスト概要
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '16px',
      }}>
        {domains.map((domain) => (
          <DomainCard
            key={domain.domain}
            domain={domain}
            colors={colors}
            tc={tc}
          />
        ))}
      </div>
      {/* 凡例 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '16px',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '12px', height: '12px', borderRadius: '2px',
            background: tc.passed,
          }} />
          passed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '12px', height: '12px', borderRadius: '2px',
            background: tc.fail,
          }} />
          fail / 要対応
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '12px', height: '12px', borderRadius: '2px',
            background: tc.retest,
          }} />
          retest
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '12px', height: '12px', borderRadius: '2px',
            background: tc.untested,
          }} />
          未テスト
        </span>
      </div>
    </div>
  );
}

function DomainCard({ domain, colors, tc }: {
  domain: DomainVisual;
  colors: Colors;
  tc: typeof TEST_COLORS;
}) {
  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '15px',
        fontWeight: 700,
        color: colors.text,
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>{domain.domain}</span>
        <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: colors.textMuted,
        }}>
          {domain.passed}/{domain.total}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {domain.capabilities.map((cap) => (
          <CapabilityBlock
            key={cap.capability}
            cap={cap}
            colors={colors}
            tc={tc}
          />
        ))}
      </div>
    </div>
  );
}

function CapabilityBlock({ cap, colors, tc }: {
  cap: DomainVisual['capabilities'][0];
  colors: Colors;
  tc: typeof TEST_COLORS;
}) {
  const borderColor = cap.status === 'fail' ? tc.fail
    : cap.status === 'retest' ? tc.retest
    : cap.status === 'passed' ? tc.passed
    : tc.untested;

  const bgColor = cap.status === 'fail' ? tc.failBg
    : cap.status === 'retest' ? tc.retestBg
    : cap.status === 'passed' ? tc.passedBg
    : tc.untestedBg;

  return (
    <div style={{
      borderLeft: `4px solid ${borderColor}`,
      background: bgColor,
      borderRadius: '0 8px 8px 0',
      padding: '10px 12px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 500,
          color: colors.text,
        }}>
          {cap.capability}
        </span>
        <span style={{
          fontSize: '12px',
          color: colors.textMuted,
        }}>
          {cap.passed}/{cap.total}
        </span>
      </div>
      {/* 進捗バー */}
      <div style={{
        display: 'flex',
        height: '8px',
        borderRadius: '4px',
        overflow: 'hidden',
        background: tc.untested,
      }}>
        {cap.passed > 0 && (
          <div style={{
            width: `${(cap.passed / cap.total) * 100}%`,
            background: tc.passed,
          }} />
        )}
        {cap.failed > 0 && (
          <div style={{
            width: `${(cap.failed / cap.total) * 100}%`,
            background: tc.fail,
          }} />
        )}
      </div>
    </div>
  );
}
