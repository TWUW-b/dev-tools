import { test, expect } from '@playwright/test';
import { disablePiP, mockGetNotes, mockCreateNote } from './helpers/routes';

test.describe('DebugPanel 記録タブ', () => {
  test.beforeEach(async ({ page }) => {
    await disablePiP(page);
    await page.addInitScript(() => {
      localStorage.setItem('debug-notes-mode', '1');
    });
  });

  test('バグ報告を送信できる', async ({ page }) => {
    await mockGetNotes(page, 'ok');

    // POST payload を検証用にキャプチャ
    let capturedPayload: Record<string, unknown> | null = null;
    await mockCreateNote(page, {
      onPost: (payload) => { capturedPayload = payload; },
    });

    await page.goto('/');

    // トリガーボタンをクリック → フォールバックモーダル表示
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();

    // 記録タブがデフォルトで表示されている
    await expect(page.locator('#debug-content')).toBeVisible();

    // 内容を入力
    await page.locator('#debug-content').fill('ボタンが反応しない');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージが表示される
    await expect(page.getByText('保存しました')).toBeVisible();

    // payload を検証
    expect(capturedPayload).toBeTruthy();
    expect(capturedPayload!.content).toBe('ボタンが反応しない');
  });

  test('重要度を選択して送信できる', async ({ page }) => {
    await mockGetNotes(page, 'ok');

    let capturedPayload: Record<string, unknown> | null = null;
    await mockCreateNote(page, {
      onPost: (payload) => { capturedPayload = payload; },
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();

    // 重要度を選択
    await page.locator('#debug-severity').selectOption('high');

    // 内容を入力
    await page.locator('#debug-content').fill('重要なバグ');

    // 保存
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText('保存しました')).toBeVisible();

    // payload 検証
    expect(capturedPayload!.severity).toBe('high');
  });

  test('APIエラー時にエラーメッセージが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockCreateNote(page, {
      status: 500,
      response: { success: false, error: '保存に失敗しました' },
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();

    await page.locator('#debug-content').fill('テスト内容');
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージが表示される
    await expect(page.getByText('保存に失敗しました')).toBeVisible();
  });

  test('空入力では保存できない', async ({ page }) => {
    await mockGetNotes(page, 'ok');

    await page.goto('/');
    await page.getByRole('button', { name: 'デバッグノートを開く' }).click();

    // 空のまま保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージが表示される
    await expect(page.getByText('内容は必須です')).toBeVisible();
  });
});
