import { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../../utils/api';
import type { Environment, DomainTree } from '../../types';
import { TestOverview } from './TestOverview';
import type { DomainVisual } from './TestOverview';
import { TestTree } from './TestTree';
import { Spinner } from '../shared';

const AUTO_REFRESH_INTERVAL = 30000;

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
  error: string;
  errorBg: string;
}

interface TestStatusTabProps {
  env: Environment;
  colors: Colors;
  isDarkMode: boolean;
  onNavigateToNote: (caseId: number) => void;
  refreshKey: number;
}

export function TestStatusTab({ env, colors, isDarkMode, onNavigateToNote, refreshKey }: TestStatusTabProps) {
  const [tree, setTree] = useState<DomainTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  // 初回 + refreshKey / env 変更時 + 30秒 auto-refresh
  useEffect(() => {
    let cancelled = false;
    const currentId = ++fetchIdRef.current;

    const fetchTree = async () => {
      try {
        const data = await api.getTestTree(env);
        if (!cancelled && fetchIdRef.current === currentId) {
          setTree(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled && fetchIdRef.current === currentId) {
          setError(e instanceof Error ? e.message : 'Failed to fetch test tree');
        }
      } finally {
        if (!cancelled && fetchIdRef.current === currentId) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchTree();

    const interval = setInterval(fetchTree, AUTO_REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [env, refreshKey]);

  const domainVisuals: DomainVisual[] = useMemo(() => {
    return tree.map((domain) => {
      let total = 0;
      let passed = 0;
      let failed = 0;
      let hasIssues = false;

      const capabilities = domain.capabilities.map((cap) => {
        const untested = cap.total - cap.passed - cap.failed;
        total += cap.total;
        passed += cap.passed;
        failed += cap.failed;
        if (cap.failed > 0 || cap.openIssues > 0) hasIssues = true;

        const allPassed = cap.passed === cap.total && cap.total > 0;
        const hasFailWithOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues > 0);
        const hasFailWithoutOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues === 0);
        const status: 'passed' | 'fail' | 'retest' | 'incomplete' =
          allPassed ? 'passed'
          : hasFailWithOpenIssues ? 'fail'
          : hasFailWithoutOpenIssues ? 'retest'
          : 'incomplete';

        return {
          capability: cap.capability,
          total: cap.total,
          passed: cap.passed,
          failed: cap.failed,
          untested: untested < 0 ? 0 : untested,
          openIssues: cap.openIssues,
          status,
          cases: cap.cases,
        };
      });

      const untested = total - passed - failed;
      return {
        domain: domain.domain,
        total,
        passed,
        failed,
        untested: untested < 0 ? 0 : untested,
        hasIssues,
        capabilities,
      };
    });
  }, [tree]);

  if (loading && tree.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        color: colors.textMuted,
        gap: '12px',
      }}>
        <Spinner size={24} color={colors.primary} />
        <span style={{ fontSize: '14px' }}>テストデータを読み込み中...</span>
      </div>
    );
  }

  if (error && tree.length === 0) {
    return (
      <div style={{
        padding: '24px',
        background: colors.errorBg,
        color: colors.error,
        borderRadius: '12px',
        margin: '24px',
        fontSize: '13px',
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      overflow: 'auto',
      flex: 1,
    }}>
      <div style={{ maxWidth: '1200px' }}>
        <TestOverview
          domains={domainVisuals}
          colors={colors}
          isDarkMode={isDarkMode}
        />
        <TestTree
          tree={tree}
          colors={colors}
          isDarkMode={isDarkMode}
          onNavigateToNote={onNavigateToNote}
        />
      </div>
    </div>
  );
}
