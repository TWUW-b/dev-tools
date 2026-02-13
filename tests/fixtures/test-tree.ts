import type { DomainTree } from '../../src/types';

export const TEST_TREE_FIXTURE: DomainTree[] = [
  {
    domain: 'sample',
    capabilities: [
      {
        capability: 'S1 基本表示',
        total: 3,
        passed: 2,
        failed: 1,
        status: 'fail',
        openIssues: 1,
        cases: [
          { caseId: 1, title: 'ナビゲーションが表示される', last: 'pass', openIssues: 0 },
          { caseId: 2, title: '「アプリ画面」ボタンが表示される', last: 'pass', openIssues: 0 },
          { caseId: 3, title: '「管理画面」ボタンが表示される', last: 'fail', openIssues: 1 },
        ],
      },
      {
        capability: 'S2 デバッグモード',
        total: 2,
        passed: 0,
        failed: 0,
        status: null,
        openIssues: 0,
        cases: [
          { caseId: 4, title: '?mode=debug でデバッグパネルが表示される', last: null, openIssues: 0 },
          { caseId: 5, title: 'パネルからバグ報告ができる', last: null, openIssues: 0 },
        ],
      },
    ],
  },
];
