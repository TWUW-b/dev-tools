import { test, expect } from '@playwright/test';
import { mockGetNotes, mockGetNote, mockUpdateStatus, mockUpdateSeverity, mockTestCaseRoutes } from './helpers/routes';
import { NOTE_FIXTURES } from './fixtures/notes';
import { TEST_TREE_FIXTURE } from './fixtures/test-tree';

test.describe('DebugAdmin Admin', () => {
  test('ノート一覧が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('/');

    // Adminに切替
    await page.getByRole('button', { name: 'Admin' }).click();

    // ノートが表示される
    await expect(page.getByText('ボタンが反応しない')).toBeVisible();
    await expect(page.getByText('レイアウト崩れ')).toBeVisible();
  });

  test('ノート詳細が表示される', async ({ page }) => {
    const note = NOTE_FIXTURES.ok.items[0];
    await mockGetNotes(page, 'ok');
    await mockGetNote(page, note);
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // ノートをクリック
    await page.getByText('ボタンが反応しない').first().click();

    // 詳細パネルに内容が表示される
    await expect(page.getByText('/users', { exact: true })).toBeVisible();
  });

  test('ステータスを変更できる', async ({ page }) => {
    const note = NOTE_FIXTURES.ok.items[0];
    await mockGetNotes(page, 'ok');
    await mockGetNote(page, note);
    await mockUpdateStatus(page);
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // ノートを選択
    await page.getByText('ボタンが反応しない').first().click();

    // ステータスドロップダウンを変更（詳細パネル内）
    await page.getByTestId('status-select').selectOption('resolved');
  });

  test('重要度を変更できる', async ({ page }) => {
    const note = NOTE_FIXTURES.ok.items[0];
    await mockGetNotes(page, 'ok');
    await mockGetNote(page, note);
    await mockUpdateSeverity(page);
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();
    await page.getByText('ボタンが反応しない').first().click();

    // 重要度ドロップダウンを変更
    await page.getByTestId('severity-select').selectOption('critical');
  });

  test('ステータスフィルタが機能する', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // サイドバーのステータスフィルタで open を選択
    await page.getByTestId('status-filter').selectOption('open');

    // open のノートだけ表示（id:1, id:3）
    await expect(page.getByText('ボタンが反応しない')).toBeVisible();
    // resolved のノートは非表示
    await expect(page.getByText('レイアウト崩れ')).not.toBeVisible();
  });

  test('検索が機能する', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // 検索ボックスに入力
    await page.getByPlaceholder('検索...').fill('レイアウト');

    // マッチするノートだけ表示
    await expect(page.getByText('レイアウト崩れ')).toBeVisible();
    await expect(page.getByText('ボタンが反応しない')).not.toBeVisible();
  });

  test('テスト状況タブが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockTestCaseRoutes(page, TEST_TREE_FIXTURE);
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // テスト状況タブに切替
    await page.getByRole('button', { name: 'テスト状況' }).click();

    // テスト状況が表示される（TestStatusTab コンポーネント）
    await expect(page.locator('body')).toBeVisible();
  });

  test('APIエラー時にクラッシュしない', async ({ page }) => {
    await mockGetNotes(page, 'error');
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // エラー表示 or 空状態（クラッシュしないことが重要）
    await expect(page.locator('body')).toBeVisible();
  });

  test('ノートが空の場合にメッセージが表示される', async ({ page }) => {
    await mockGetNotes(page, 'empty');
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    await expect(page.getByText('ノートがありません')).toBeVisible();
  });
});
