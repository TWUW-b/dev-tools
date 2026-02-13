import type { Page } from '@playwright/test';
import { NOTE_FIXTURES } from '../fixtures/notes';
import { FEEDBACK_FIXTURES } from '../fixtures/feedbacks';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8081';

/**
 * PiP APIを無効化してフォールバックモーダルを使わせる
 */
export async function disablePiP(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'documentPictureInPicture', {
      value: undefined,
      configurable: true,
    });
  });
}

/**
 * ノート一覧 GET を注入
 */
export async function mockGetNotes(page: Page, fixture: 'ok' | 'empty' | 'error' = 'ok') {
  if (fixture === 'error') {
    await page.route(`${API_BASE}/notes?**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(NOTE_FIXTURES.error.body),
        });
      } else {
        await route.continue();
      }
    });
    return;
  }

  const items = fixture === 'empty' ? [] : NOTE_FIXTURES.ok.items;
  await page.route(`${API_BASE}/notes?**`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: items }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * ノート作成 POST を注入
 * onPost コールバックで payload をキャプチャ可能
 */
export async function mockCreateNote(
  page: Page,
  opts: {
    status?: number;
    response?: Record<string, unknown>;
    onPost?: (payload: Record<string, unknown>) => void;
  } = {},
) {
  const { status = 200, response, onPost } = opts;
  await page.route(`${API_BASE}/notes?**`, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const body = await route.request().postDataJSON();
    onPost?.(body);
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        response ?? {
          success: status < 400,
          note: status < 400 ? {
            id: 99,
            content: body.content,
            severity: body.severity,
            status: 'open',
            route: body.route || '/',
            screen_name: body.screenName || '',
            title: '',
            user_log: null,
            steps: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
            source: body.source || 'manual',
          } : undefined,
          error: status >= 400 ? 'Internal Server Error' : undefined,
        },
      ),
    });
  });
}

/**
 * /notes/{id} のみにマッチし /notes/{id}/status, /notes/{id}/severity を除外する predicate
 */
function isNoteDetailUrl(url: string): boolean {
  const path = new URL(url).pathname;
  return /^\/notes\/\d+$/.test(path);
}

/**
 * ノート詳細 GET を注入
 */
export async function mockGetNote(page: Page, note: Record<string, unknown>) {
  await page.route((url) => {
    return url.origin === new URL(API_BASE).origin && isNoteDetailUrl(url.href);
  }, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, note }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * ステータス更新 PATCH を注入
 */
export async function mockUpdateStatus(page: Page) {
  await page.route(`${API_BASE}/notes/*/status?**`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * 重要度更新 PATCH を注入
 */
export async function mockUpdateSeverity(page: Page) {
  await page.route(`${API_BASE}/notes/*/severity?**`, async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * ノート削除 DELETE を注入
 */
export async function mockDeleteNote(page: Page) {
  await page.route((url) => {
    return url.origin === new URL(API_BASE).origin && isNoteDetailUrl(url.href);
  }, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * テストケース import + tree を注入
 */
export async function mockTestCaseRoutes(page: Page, tree: unknown[]) {
  await page.route(`${API_BASE}/test-cases/import`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, total: 5 }),
    });
  });

  await page.route(`${API_BASE}/test-cases/tree?**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: tree }),
    });
  });
}

/**
 * テスト結果送信を注入
 */
export async function mockSubmitTestRuns(page: Page, tree: unknown[]) {
  await page.route(`${API_BASE}/test-runs?**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        results: [],
        capability: (tree[0] as Record<string, unknown[]>)?.capabilities?.[0] ?? null,
      }),
    });
  });
}

// ── Feedback routes ──

/**
 * /feedbacks のみにマッチし /feedbacks/{id}, /feedbacks/{id}/status を除外する predicate
 */
function isFeedbackListUrl(url: string): boolean {
  const path = new URL(url).pathname;
  return /^\/feedbacks\/?$/.test(path);
}

/**
 * /feedbacks/{id} のみにマッチし /feedbacks/{id}/status を除外する predicate
 */
function isFeedbackDetailUrl(url: string): boolean {
  const path = new URL(url).pathname;
  return /^\/feedbacks\/\d+$/.test(path);
}

/**
 * フィードバック一覧 GET を注入
 */
export async function mockGetFeedbacks(page: Page, fixture: 'ok' | 'empty' | 'error' = 'ok') {
  if (fixture === 'error') {
    await page.route((url) => {
      return url.origin === new URL(API_BASE).origin && isFeedbackListUrl(url.href);
    }, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(FEEDBACK_FIXTURES.error.body),
        });
      } else {
        await route.continue();
      }
    });
    return;
  }

  const data = fixture === 'empty' ? FEEDBACK_FIXTURES.empty : FEEDBACK_FIXTURES.ok;
  await page.route((url) => {
    return url.origin === new URL(API_BASE).origin && isFeedbackListUrl(url.href);
  }, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * フィードバック詳細 GET を注入
 */
export async function mockGetFeedbackDetail(page: Page, feedback?: Record<string, unknown>) {
  const detail = feedback ?? FEEDBACK_FIXTURES.detail;
  await page.route((url) => {
    return url.origin === new URL(API_BASE).origin && isFeedbackDetailUrl(url.href);
  }, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: detail }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * フィードバックステータス更新 PATCH を注入
 */
export async function mockUpdateFeedbackStatus(page: Page) {
  await page.route(`${API_BASE}/feedbacks/*/status`, async (route) => {
    if (route.request().method() === 'PATCH') {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 1, status: body.status, updatedAt: new Date().toISOString() },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * フィードバック削除 DELETE を注入
 */
export async function mockDeleteFeedback(page: Page) {
  await page.route((url) => {
    return url.origin === new URL(API_BASE).origin && isFeedbackDetailUrl(url.href);
  }, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.continue();
    }
  });
}
