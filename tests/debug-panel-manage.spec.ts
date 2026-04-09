import { test, expect } from '@playwright/test';
import { disablePiP, mockGetNotes, mockUpdateStatus } from './helpers/routes';

test.describe('DebugPanel 管理タブ', () => {
  test.beforeEach(async ({ page }) => {
    await disablePiP(page);
    await page.addInitScript(() => {
      localStorage.setItem('debug-notes-mode', '1');
    });
  });

  test('ノート一覧が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('/');

    // パネルを開く
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();

    // 管理タブに切替
    await page.getByRole('button', { name: '管理', exact: true }).click();

    // デフォルトフィルタは fixed → resolved チップをクリックして resolved ノートを表示
    await page.getByTestId('status-chip-resolved').click();
    await expect(page.getByText('レイアウト崩れ')).toBeVisible();
  });

  test('フィルタ切替でノートが変化する', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('/');

    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();
    await page.getByRole('button', { name: '管理', exact: true }).click();

    // open フィルタをクリック → open ノートも表示
    await page.getByTestId('status-chip-open').click();

    await expect(page.getByText('ボタンが反応しない')).toBeVisible();
  });

  test('空状態でメッセージが表示される', async ({ page }) => {
    await mockGetNotes(page, 'empty');
    await page.goto('/');

    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();
    await page.getByRole('button', { name: '管理', exact: true }).click();

    await expect(page.getByText('該当するノートはありません')).toBeVisible();
  });

  test('ステータスを変更できる', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockUpdateStatus(page);
    await page.goto('/');

    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();
    await page.getByRole('button', { name: '管理', exact: true }).click();

    // resolved チップをクリックして resolved ノートを表示
    await page.getByTestId('status-chip-resolved').click();
    await expect(page.getByText('レイアウト崩れ')).toBeVisible();

    // ステータスを fixed に変更（resolved ノート id:2 のセレクト）
    await page.getByTestId('note-status-select-2').selectOption('fixed');
  });
});
