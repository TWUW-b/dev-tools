import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualTableOfContents } from './ManualTableOfContents';
import type { ManualItem } from '../../types';

/**
 * 2ページが同じカテゴリに属し、どちらも同名の h2「手順」を持つ状況を再現する。
 * useManualHeadings は呼び出し毎に新しい GithubSlugger インスタンスで id を振るため、
 * 両ページの「手順」はどちらも id="手順" になる（ページをまたいで一意ではない）。
 */
const ITEMS: ManualItem[] = [
  { id: 'page-a', title: 'ページA', path: '/docs/page-a.md', category: 'カテゴリ', order: 1 },
  { id: 'page-b', title: 'ページB', path: '/docs/page-b.md', category: 'カテゴリ', order: 2 },
];

describe('ManualTableOfContents', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('## 手順\n\n本文'),
    });
  });

  it('複数ページに同名見出しが展開されていても、activePath と一致するページの見出しだけをハイライトする', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ManualTableOfContents
        items={ITEMS}
        activePath="/docs/page-a.md"
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
        activeHeadingId="手順"
      />
    );

    // page-a は activePath と一致するため、マウント時点のスクロールスパイ用 useEffect で
    // 見出しリストが既に自動展開されている。page-b は手動でトグルを開く。
    await user.click(await screen.findByRole('button', { name: 'ページB の見出しを開く' }));

    const stepsButtons = await screen.findAllByRole('button', { name: '手順' });
    expect(stepsButtons).toHaveLength(2);
    const [pageASteps, pageBSteps] = stepsButtons; // items の順序（page-a → page-b）で DOM に並ぶ

    // 同じ activeHeadingId="手順" でも、activePath="/docs/page-a.md" の間は page-a 側だけがハイライトされる
    expect(pageASteps).toHaveStyle({ background: '#e3f2fd' });
    expect(pageBSteps).toHaveStyle({ background: 'transparent' });

    // activePath が page-b に切り替わると、ハイライトも追従して page-b 側だけになる
    rerender(
      <ManualTableOfContents
        items={ITEMS}
        activePath="/docs/page-b.md"
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
        activeHeadingId="手順"
      />
    );

    const [pageASteps2, pageBSteps2] = screen.getAllByRole('button', { name: '手順' });
    expect(pageASteps2).toHaveStyle({ background: 'transparent' });
    expect(pageBSteps2).toHaveStyle({ background: '#e3f2fd' });
  });
});

/**
 * カテゴリの初期開閉状態 (defaultExpandCategories)。
 * 2026-08-31: 章を1つずつ開かないとページ名すら見えない、というフィードバックを受けて
 * 'all'（全カテゴリ初期展開）を追加した。既存利用者に影響が出ないよう、未指定時は
 * 従来どおり「activePath を含むカテゴリのみ開く」動作を維持する。
 */
describe('ManualTableOfContents defaultExpandCategories', () => {
  const TWO_CATEGORIES: ManualItem[] = [
    { id: 'page-a', title: 'ページA', path: '/docs/page-a.md', category: 'カテゴリ1', order: 1 },
    { id: 'page-b', title: 'ページB', path: '/docs/page-b.md', category: 'カテゴリ2', order: 2 },
  ];

  it('未指定時: どのページもアクティブでなければ全カテゴリが閉じている（既存挙動）', () => {
    render(
      <ManualTableOfContents
        items={TWO_CATEGORIES}
        activePath={null}
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'ページA' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ページB' })).not.toBeInTheDocument();
  });

  it("'all' 指定時: どのページもアクティブでなくても全カテゴリが初期状態から開いている", () => {
    render(
      <ManualTableOfContents
        items={TWO_CATEGORIES}
        activePath={null}
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
        defaultExpandCategories="all"
      />
    );

    expect(screen.getByRole('button', { name: 'ページA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ページB' })).toBeInTheDocument();
  });

  it("'all' 指定時でも activePath を含むカテゴリを開く既存ロジックと矛盾しない（両カテゴリとも開いたまま）", () => {
    render(
      <ManualTableOfContents
        items={TWO_CATEGORIES}
        activePath="/docs/page-b.md"
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
        defaultExpandCategories="all"
      />
    );

    expect(screen.getByRole('button', { name: 'ページA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ページB' })).toBeInTheDocument();
  });
});

/**
 * hideHeadingsOutline (2026-08-31 追加)。
 *
 * 経緯: TOP ページ本文の h2/h3 見出しが実際のカテゴリ名と同じ文言になっている場合、
 * 「見出しを開く」トグルを開くとサイドバー内に同じカテゴリ名が二重に表示されてしまう
 * （本文見出し一覧 と 実際のカテゴリ一覧 が並んで同じ文言を繰り返す）。
 * hideHeadingsOutline: true の項目は見出しトグル自体を出さないことでこれを防ぐ。
 */
describe('ManualTableOfContents hideHeadingsOutline', () => {
  const ITEM_WITH_HIDDEN_OUTLINE: ManualItem = {
    id: 'top',
    title: 'マニュアル TOP',
    path: '/docs/top.md',
    order: 1,
    hideHeadingsOutline: true,
  };
  const NORMAL_ITEM: ManualItem = {
    id: 'page-a',
    title: 'ページA',
    path: '/docs/page-a.md',
    category: 'カテゴリ',
    order: 2,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('## カテゴリ\n\n本文'),
    });
  });

  it('hideHeadingsOutline: true の項目には「見出しを開く」トグルが表示されない', () => {
    render(
      <ManualTableOfContents
        items={[ITEM_WITH_HIDDEN_OUTLINE, NORMAL_ITEM]}
        activePath={null}
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'マニュアル TOP の見出しを開く' })).not.toBeInTheDocument();
    // 通常項目（カテゴリを開かないと表示されない）以外は変わらず存在することの対照
    expect(screen.getByRole('button', { name: 'マニュアル TOP' })).toBeInTheDocument();
  });

  it('hideHeadingsOutline: true の項目でもページ選択自体は動く（onSelectPage が呼ばれる）', async () => {
    const user = userEvent.setup();
    const onSelectPage = vi.fn();

    render(
      <ManualTableOfContents
        items={[ITEM_WITH_HIDDEN_OUTLINE]}
        activePath={null}
        onSelectPage={onSelectPage}
        onSelectHeading={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'マニュアル TOP' }));

    expect(onSelectPage).toHaveBeenCalledWith('/docs/top.md');
  });

  it('hideHeadingsOutline: true のページがアクティブでも、スクロールスパイによる見出し自動展開は起きない', () => {
    render(
      <ManualTableOfContents
        items={[ITEM_WITH_HIDDEN_OUTLINE]}
        activePath="/docs/top.md"
        onSelectPage={vi.fn()}
        onSelectHeading={vi.fn()}
        activeHeadingId="カテゴリ"
      />
    );

    // 見出しトグル自体が存在しないので、見出しリスト（「カテゴリ」という見出しテキスト）も出ない
    expect(screen.queryByText('カテゴリ')).not.toBeInTheDocument();
  });
});
