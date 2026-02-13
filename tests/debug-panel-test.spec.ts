import { test, expect } from '@playwright/test';
import { disablePiP, mockGetNotes, mockTestCaseRoutes, mockSubmitTestRuns } from './helpers/routes';
import { TEST_TREE_FIXTURE } from './fixtures/test-tree';

test.describe('DebugPanel テストタブ', () => {
  test.beforeEach(async ({ page }) => {
    await disablePiP(page);
    await page.addInitScript(() => {
      localStorage.setItem('debug-notes-mode', '1');
    });
  });

  test('テストツリーが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockTestCaseRoutes(page, TEST_TREE_FIXTURE);

    await page.goto('/');

    // パネルを開く
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();

    // テストタブに切替
    await page.getByRole('button', { name: 'テスト' }).click();

    // ドメインが表示される
    await expect(page.getByTestId('domain-toggle-sample')).toBeVisible();

    // ドメインを展開
    await page.getByTestId('domain-toggle-sample').click();

    // capability が表示される
    await expect(page.getByText('S1 基本表示')).toBeVisible();
    await expect(page.getByText('S2 デバッグモード')).toBeVisible();
  });

  test('テスト結果を送信できる', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockTestCaseRoutes(page, TEST_TREE_FIXTURE);
    await mockSubmitTestRuns(page, TEST_TREE_FIXTURE);

    await page.goto('/');
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();
    await page.getByRole('button', { name: 'テスト' }).click();

    // ドメイン展開
    await page.getByTestId('domain-toggle-sample').click();

    // capability 展開
    await page.getByTestId('cap-toggle-sample/S1 基本表示').click();

    // テストケースが表示される
    await expect(page.getByTestId('case-1')).toBeVisible();

    // 送信ボタンをクリック（pass済みケースがあるため送信可能）
    await page.getByTestId('cap-submit-sample/S1 基本表示').click();

    // 成功メッセージ
    await expect(page.getByText('送信しました')).toBeVisible();
  });
});
