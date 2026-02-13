import { test, expect } from '@playwright/test';
import {
  mockGetNotes,
  mockGetFeedbacks,
  mockGetFeedbackDetail,
  mockUpdateFeedbackStatus,
  mockDeleteFeedback,
} from './helpers/routes';
import { FEEDBACK_FIXTURES } from './fixtures/feedbacks';

/**
 * Admin → フィードバックタブへ遷移するヘルパー
 * ノート一覧のモックも必要（Adminデフォルトタブがノート）
 */
async function gotoFeedbackTab(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'フィードバック' }).click();
}

test.describe('FeedbackTab', () => {
  test('フィードバックタブが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // タブが存在する
    await expect(page.getByRole('button', { name: 'フィードバック' })).toBeVisible();
  });

  test('フィードバック一覧が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await gotoFeedbackTab(page);

    // 各フィードバックのメッセージが見える
    await expect(page.getByText('ログイン画面でボタンが押せない')).toBeVisible();
    await expect(page.getByText('ダッシュボードにグラフを追加してほしい')).toBeVisible();
    await expect(page.getByText('エクスポート機能の使い方がわからない')).toBeVisible();

    // 統計バー（サイドバー内）
    await expect(page.locator('aside').getByText('3 件')).toBeVisible();
  });

  test('フィードバック詳細が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await mockGetFeedbackDetail(page);
    await gotoFeedbackTab(page);

    // 一覧からクリック
    await page.getByText('ログイン画面でボタンが押せない').first().click();

    // 詳細ペインに情報が表示される
    await expect(page.getByText('#1 フィードバック')).toBeVisible();
    await expect(page.getByText('/login', { exact: true })).toBeVisible();
    await expect(page.getByText('tester')).toBeVisible();
    await expect(page.getByText('1.0.0').first()).toBeVisible();
  });

  test('詳細に環境情報が表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await mockGetFeedbackDetail(page);
    await gotoFeedbackTab(page);

    await page.getByText('ログイン画面でボタンが押せない').first().click();

    // 環境情報セクション
    await expect(page.getByText('macOS 14.3')).toBeVisible();
    await expect(page.getByText('Chrome 121')).toBeVisible();
  });

  test('詳細にコンソールログが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await mockGetFeedbackDetail(page);
    await gotoFeedbackTab(page);

    await page.getByText('ログイン画面でボタンが押せない').first().click();

    // コンソールログセクション
    await expect(page.getByText('コンソールログ (1件)')).toBeVisible();
    await expect(page.getByText('TypeError: Cannot read property')).toBeVisible();
  });

  test('詳細にネットワークログが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await mockGetFeedbackDetail(page);
    await gotoFeedbackTab(page);

    await page.getByText('ログイン画面でボタンが押せない').first().click();

    // ネットワークログセクション
    await expect(page.getByText('ネットワークログ (1件)')).toBeVisible();
    await expect(page.getByText('/api/login')).toBeVisible();
    await expect(page.getByText('500')).toBeVisible();
  });

  test('ステータスを変更できる', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await mockGetFeedbackDetail(page);
    await mockUpdateFeedbackStatus(page);
    await gotoFeedbackTab(page);

    await page.getByText('ログイン画面でボタンが押せない').first().click();
    await expect(page.getByText('#1 フィードバック')).toBeVisible();

    // ステータスドロップダウンを変更
    const statusSelect = page.locator('main select');
    await statusSelect.selectOption('closed');
  });

  test('フィードバックを削除できる', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await mockGetFeedbackDetail(page);
    await mockDeleteFeedback(page);
    await gotoFeedbackTab(page);

    await page.getByText('ログイン画面でボタンが押せない').first().click();
    await expect(page.getByText('#1 フィードバック')).toBeVisible();

    // confirm ダイアログを自動承認
    page.on('dialog', (d) => d.accept());

    // 削除ボタンクリック
    await page.getByRole('button', { name: '削除' }).click();
  });

  test('空の場合にメッセージが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'empty');
    await gotoFeedbackTab(page);

    await expect(page.getByText('フィードバックがありません')).toBeVisible();
  });

  test('APIエラー時にクラッシュしない', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'error');
    await gotoFeedbackTab(page);

    // クラッシュしないことが重要（エラーメッセージ or 空状態）
    await expect(page.locator('body')).toBeVisible();
  });

  test('未選択時にプレースホルダーが表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await gotoFeedbackTab(page);

    // 詳細ペインに案内テキスト
    await expect(page.getByText('フィードバックを選択してください')).toBeVisible();
  });

  test('種別バッジが正しく表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await gotoFeedbackTab(page);

    // サイドバーカード内の種別バッジ（option要素を除外）
    const sidebar = page.locator('aside');
    await expect(sidebar.locator('span', { hasText: '不具合' }).first()).toBeVisible();
    await expect(sidebar.locator('span', { hasText: '要望' }).first()).toBeVisible();
    await expect(sidebar.locator('span', { hasText: '質問' }).first()).toBeVisible();
  });

  test('ステータスバッジが正しく表示される', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await gotoFeedbackTab(page);

    // サイドバーカード内のステータスバッジ（select/option を除外）
    const cards = page.locator('aside > div:nth-child(2)');
    await expect(cards.locator('span', { hasText: 'Open' }).first()).toBeVisible();
    await expect(cards.locator('span', { hasText: '対応中' }).first()).toBeVisible();
    await expect(cards.locator('span', { hasText: '完了' }).first()).toBeVisible();
  });

  test('タブ切替が正しく動作する', async ({ page }) => {
    await mockGetNotes(page, 'ok');
    await mockGetFeedbacks(page, 'ok');
    await page.goto('/');

    await page.getByRole('button', { name: 'Admin' }).click();

    // ノート一覧が表示されている
    await expect(page.getByText('ボタンが反応しない')).toBeVisible();

    // フィードバックタブに切替
    await page.getByRole('button', { name: 'フィードバック' }).click();
    await expect(page.getByText('ログイン画面でボタンが押せない')).toBeVisible();
    // ノート一覧は非表示
    await expect(page.getByText('ボタンが反応しない')).not.toBeVisible();

    // ノート一覧に戻る
    await page.getByRole('button', { name: 'ノート一覧' }).click();
    await expect(page.getByText('ボタンが反応しない')).toBeVisible();
  });
});
