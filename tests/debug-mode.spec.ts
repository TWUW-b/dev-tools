import { test, expect } from '@playwright/test';

test.describe('デバッグモード有効化', () => {
  test('#debug ハッシュでパネルトリガーが表示される', async ({ page }) => {
    await page.goto('/#debug');
    await expect(page.getByRole('button', { name: 'デバッグノートを開く' })).toBeVisible();
  });

  test('localStorage でデバッグモードが維持される', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('debug-notes-mode', '1');
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'デバッグノートを開く' })).toBeVisible();
  });

  test('デバッグモードOFFではトリガーが表示されない', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'デバッグノートを開く' })).not.toBeVisible();
  });
});
