import { test, expect, type Locator, type Page } from '@playwright/test';
import { MANUAL_CATEGORIES, MANUAL_DOCS } from './fixtures/manual-docs';

/**
 * ManualTabPage の目次サイドバー（常時表示、通常のブラウジングコンテキストにレンダリングされる）
 * を対象とした E2E テスト。
 *
 * 対象外: ManualPiP のハンバーガーメニュー/目次パネル。
 * ManualPiP の目次は Document Picture-in-Picture ウィンドウ（別ブラウジングコンテキスト）内に
 * createPortal で描画されるため、PiP ウィンドウを実際に開かない限り DOM 上に現れない。
 * この開発環境（Claude Browser、CDP経由のChromium）では
 * window.documentPictureInPicture.requestWindow() が
 * "InvalidStateError: Internal error: no window" を投げ、実際に PiP ウィンドウを開くことができない
 * （サンドボックス化されたヘッドレス/CDP環境における Document Picture-in-Picture API 自体の制約であり
 * コードのバグではない）。そのため Playwright での自動 E2E テストは現実的に書けない。
 * 手動でのブラウザ確認では、ManualPiP 内の目次（本ファイルがテストする ManualTableOfContents と
 * 同一コンポーネントを使用）も含めて正しく動作することは確認済み。
 *
 * API モックは使用しない。sample/public/docs/*.md を Vite dev server 経由で実ファイルとして
 * そのまま fetch させている（tests/fixtures 相当のモックデータは不要）。
 *
 * 修正済みの既知の欠陥（記録として残す）:
 * ManualTableOfContents.tsx の openCategories は元々 useState の初期化子でのみ
 * `activePath を含むカテゴリのみ開く` ロジックを評価しており、ManualTabPage.tsx が
 * docPath を useState(null) で初期化した後 useEffect で defaultDocPath を非同期にセットする
 * ため、初回マウント時の activePath=null で openCategories が確定してしまい、初期表示時に
 * カテゴリが自動で開かないバグがあった（本 E2E テスト実装時に発見）。
 * ManualTableOfContents.tsx に activePath の変化を追跡する useEffect を追加して修正済み。
 * 以下のテストは修正後の正しい挙動（現在表示中ページを含むカテゴリが自動で開く）を検証する。
 */

test.describe('ManualTabPage 目次サイドバー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Manual (Tab)' }).click();
  });

  /** 目次ナビゲーション（nav[aria-label="マニュアル目次"]）のロケータ */
  function toc(page: Page): Locator {
    return page.getByRole('navigation', { name: 'マニュアル目次' });
  }

  /**
   * カテゴリ開閉トグルボタンのロケータ（例: 「はじめに」「リファレンス」）。
   * カテゴリボタンは nav の直接の子 div の直接の子 button という構造上の位置で一意に絞り込み、
   * ページボタンや見出しトグルボタン（アイコンリガチャ文字を含む名前を持つ）との名前衝突を避ける。
   */
  function categoryToggle(page: Page, categoryLabel: string): Locator {
    return toc(page)
      .locator('> div > button')
      .filter({ hasText: categoryLabel });
  }

  test('目次ナビゲーションが左サイドバーに表示される', async ({ page }) => {
    await expect(page.getByText('目次', { exact: true })).toBeVisible();
    await expect(toc(page)).toBeVisible();
  });

  test('初期表示では guide.md がメインペインに表示され、guide.md が属する「はじめに」カテゴリが自動で開いている', async ({ page }) => {
    const main = page.getByRole('main');

    // メインペインには defaultDocPath="/docs/guide.md" の内容が表示される
    await expect(
      main.getByRole('heading', { level: 1, name: MANUAL_DOCS.guide.heading.title })
    ).toBeVisible();
    await expect(
      main.getByRole('heading', { level: 2, name: MANUAL_DOCS.guide.heading.debugModeStart })
    ).toBeVisible();

    // 現在表示中ページ(guide.md)が属する「はじめに」カテゴリは自動で開く。
    // 属さない「リファレンス」カテゴリは閉じたまま。
    await expect(categoryToggle(page, MANUAL_CATEGORIES.intro)).toHaveAttribute('aria-expanded', 'true');
    await expect(categoryToggle(page, MANUAL_CATEGORIES.reference)).toHaveAttribute('aria-expanded', 'false');

    // 開いているので、guide.md のページボタンは最初から見える
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.guide.pageLabel, exact: true })
    ).toBeVisible();

    // クリックすれば閉じ、ページボタンは見えなくなる
    await categoryToggle(page, MANUAL_CATEGORIES.intro).click();
    await expect(categoryToggle(page, MANUAL_CATEGORIES.intro)).toHaveAttribute('aria-expanded', 'false');
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.guide.pageLabel, exact: true })
    ).not.toBeVisible();
  });

  test('「リファレンス」カテゴリはクリックで開閉できる', async ({ page }) => {
    const referenceToggle = categoryToggle(page, MANUAL_CATEGORIES.reference);
    const apiPageButton = toc(page).getByRole('button', {
      name: MANUAL_DOCS.api.pageLabel,
      exact: true,
    });

    await expect(referenceToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(apiPageButton).not.toBeVisible();

    // 1回目クリック: 展開
    await referenceToggle.click();
    await expect(referenceToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(apiPageButton).toBeVisible();

    // 2回目クリック: 折りたたみ
    await referenceToggle.click();
    await expect(referenceToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(apiPageButton).not.toBeVisible();
  });

  test('FAQ の見出し展開トグルをクリックすると FAQ 内の見出し一覧が表示される', async ({ page }) => {
    // FAQ は「はじめに」カテゴリに属し、guide.md が初期表示中のため既に開いている
    await expect(categoryToggle(page, MANUAL_CATEGORIES.intro)).toHaveAttribute('aria-expanded', 'true');

    const faqToggle = toc(page).getByRole('button', {
      name: `${MANUAL_DOCS.faq.pageLabel} の見出しを開く`,
    });
    await expect(faqToggle).toHaveAttribute('aria-expanded', 'false');

    await faqToggle.click();
    await expect(
      toc(page).getByRole('button', { name: `${MANUAL_DOCS.faq.pageLabel} の見出しを閉じる` })
    ).toHaveAttribute('aria-expanded', 'true');

    // sample/public/docs/faq.md の実際の h2 見出しテキストと一致すること
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.faq.heading.debugModeNotEnabled })
    ).toBeVisible();
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.faq.heading.pipWindowNotOpening })
    ).toBeVisible();
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.faq.heading.logCaptureNotWorking })
    ).toBeVisible();
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.faq.heading.apiConnectionFailed })
    ).toBeVisible();
  });

  test('目次から FAQ のページボタンをクリックするとメインペインが FAQ ページに切り替わる', async ({ page }) => {
    const main = page.getByRole('main');

    // 初期状態は使い方ガイド
    await expect(
      main.getByRole('heading', { level: 1, name: MANUAL_DOCS.guide.heading.title })
    ).toBeVisible();

    // 「はじめに」カテゴリは guide.md が初期表示中のため既に開いている
    await toc(page).getByRole('button', { name: MANUAL_DOCS.faq.pageLabel, exact: true }).click();

    await expect(page).toHaveURL(/path=%2Fdocs%2Ffaq\.md/);
    await expect(
      main.getByRole('heading', { level: 1, name: MANUAL_DOCS.faq.heading.title })
    ).toBeVisible();
    await expect(
      main.getByRole('heading', { level: 2, name: MANUAL_DOCS.faq.heading.pipWindowNotOpening })
    ).toBeVisible();
    // 使い方ガイド特有の見出しはもう表示されていない
    await expect(
      main.getByRole('heading', { name: MANUAL_DOCS.guide.heading.debugModeStart })
    ).not.toBeVisible();
  });

  test('目次から別ページの見出しをクリックすると、そのページに遷移し該当見出しがビューポート内に入る', async ({
    page,
  }) => {
    const main = page.getByRole('main');

    // 「リファレンス」カテゴリを開き、API リファレンスの見出し一覧を展開する
    await categoryToggle(page, MANUAL_CATEGORIES.reference).click();
    await toc(page)
      .getByRole('button', { name: `${MANUAL_DOCS.api.pageLabel} の見出しを開く` })
      .click();

    const targetHeadingToc = toc(page).getByRole('button', {
      name: MANUAL_DOCS.api.heading.putNoteStatus,
    });
    await expect(targetHeadingToc).toBeVisible();
    await targetHeadingToc.click();

    // 別ページ（api.md）へ遷移していること
    await expect(page).toHaveURL(/path=%2Fdocs%2Fapi\.md/);
    await expect(
      main.getByRole('heading', { level: 1, name: MANUAL_DOCS.api.heading.title })
    ).toBeVisible();

    // 該当見出し要素がビューポート内に入っていること（scrollIntoView の効果）
    const targetHeadingInMain = main.getByRole('heading', {
      level: 3,
      name: MANUAL_DOCS.api.heading.putNoteStatus,
    });
    await expect(targetHeadingInMain).toBeVisible();
    await expect(targetHeadingInMain).toBeInViewport();
  });

  test('目次を操作してもメインの使い方ガイドページ構造は壊れない', async ({ page }) => {
    const main = page.getByRole('main');

    await expect(
      main.getByRole('heading', { level: 1, name: MANUAL_DOCS.guide.heading.title })
    ).toBeVisible();

    // 一連の目次操作(カテゴリ開閉・見出し展開/折りたたみ)を行う。
    // 「はじめに」は guide.md が初期表示中のため既に開いているので、ここでは
    // 「リファレンス」の開閉のみ操作する
    await categoryToggle(page, MANUAL_CATEGORIES.reference).click();
    await categoryToggle(page, MANUAL_CATEGORIES.reference).click();

    const faqToggle = toc(page).getByRole('button', {
      name: `${MANUAL_DOCS.faq.pageLabel} の見出しを開く`,
    });
    await faqToggle.click();
    await expect(
      toc(page).getByRole('button', { name: MANUAL_DOCS.faq.heading.pipWindowNotOpening })
    ).toBeVisible();
    await toc(page).getByRole('button', { name: `${MANUAL_DOCS.faq.pageLabel} の見出しを閉じる` }).click();

    // 上記の目次操作だけではページ遷移は起きておらず、メインの構造は維持されている
    await expect(
      main.getByRole('heading', { level: 1, name: MANUAL_DOCS.guide.heading.title })
    ).toBeVisible();
    await expect(
      main.getByRole('heading', { level: 2, name: MANUAL_DOCS.guide.heading.debugModeStart })
    ).toBeVisible();
    await expect(
      main.getByRole('heading', { level: 2, name: MANUAL_DOCS.guide.heading.debugPanel })
    ).toBeVisible();
    await expect(
      main.getByRole('heading', { level: 3, name: MANUAL_DOCS.guide.heading.recordTab })
    ).toBeVisible();
  });
});
