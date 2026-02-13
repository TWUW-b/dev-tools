import type { Note } from '../../src/types';

export const NOTE_FIXTURES = {
  ok: {
    items: [
      {
        id: 1,
        route: '/users',
        screen_name: 'ユーザー一覧',
        title: '',
        content: 'ボタンが反応しない',
        user_log: null,
        steps: null,
        severity: 'high' as const,
        status: 'open' as const,
        deleted_at: null,
        created_at: '2026-01-15T10:00:00Z',
        source: 'manual' as const,
      },
      {
        id: 2,
        route: '/settings',
        screen_name: '設定',
        title: '',
        content: 'レイアウト崩れ',
        user_log: null,
        steps: null,
        severity: 'medium' as const,
        status: 'resolved' as const,
        deleted_at: null,
        created_at: '2026-01-14T09:00:00Z',
        source: 'manual' as const,
      },
      {
        id: 3,
        route: '/dashboard',
        screen_name: 'ダッシュボード',
        title: '',
        content: 'テストケース: ナビゲーションが表示される',
        user_log: null,
        steps: null,
        severity: null,
        status: 'open' as const,
        deleted_at: null,
        created_at: '2026-01-13T08:00:00Z',
        source: 'test' as const,
        test_case_ids: [1],
      },
    ] satisfies Note[],
  },
  empty: {
    items: [] as Note[],
  },
  error: {
    status: 500,
    body: { success: false, error: 'Internal Server Error' },
  },
};
