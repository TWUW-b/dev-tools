import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ManualPiP } from './ManualPiP';
import type { ManualItem } from '../../types';

/**
 * 目次パネルのホバー開閉 (2026-08-31 追加)。
 *
 * 経緯: 目次パネルはハンバーガーボタンのクリックでしか開閉できず、都度クリックが必要だった。
 * ボタン/パネルにマウスを乗せている間は開き、両方から離れると既定の遅延後に自動で閉じるように
 * した。クリックでの操作性を壊さないよう、クリックは「常に開く」（トグルにすると、ホバーで
 * 既に開いている状態でクリックした瞬間に閉じてしまうため）。
 *
 * ManualPiP は Document Picture-in-Picture API（別 window/document）に依存するため、jsdom には
 * 実装がない。テストでは window.documentPictureInPicture.requestWindow を、実際の jsdom
 * document をそのまま「PiP の document」として返すフェイクに差し替える。
 */

const ITEMS: ManualItem[] = [
  { id: 'page-a', title: 'ページA', path: '/docs/page-a.md', order: 1 },
];

function installFakeDocumentPictureInPicture() {
  const fakePipWindow = {
    document,
    // pipWindow.IntersectionObserver（スクロールスパイ用）
    IntersectionObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    close: vi.fn(),
    closed: false,
  };

  (window as unknown as { documentPictureInPicture: unknown }).documentPictureInPicture = {
    requestWindow: vi.fn().mockResolvedValue(fakePipWindow),
    window: null,
  };

  return fakePipWindow;
}

describe('ManualPiP 目次パネルのホバー開閉', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    installFakeDocumentPictureInPicture();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# ページA\n\n本文'),
    });
  });

  afterEach(() => {
    cleanup();
    // openPipWindow は #manual-pip-root を document.body に直接 appendChild するため、
    // RTL の cleanup（自前の render コンテナの取り外し）だけでは残留する。
    document.getElementById('manual-pip-root')?.remove();
    delete (window as unknown as { documentPictureInPicture?: unknown }).documentPictureInPicture;
  });

  it('ハンバーガーボタンにマウスを乗せると目次パネルが開く（クリック不要）', async () => {
    render(
      <ManualPiP isOpen docPath="/docs/page-a.md" onClose={vi.fn()} items={ITEMS} copyHostStyles={false} />
    );

    const btn = await screen.findByRole('button', { name: '目次を開く' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(btn);

    await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'true'));
  });

  it('ボタンからマウスが離れると、既定の遅延後に自動的に閉じる', async () => {
    render(
      <ManualPiP isOpen docPath="/docs/page-a.md" onClose={vi.fn()} items={ITEMS} copyHostStyles={false} />
    );

    const btn = await screen.findByRole('button', { name: '目次を開く' });
    fireEvent.mouseEnter(btn);
    await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'true'));

    fireEvent.mouseLeave(btn);

    await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'false'), { timeout: 1000 });
  });

  it('ボタンから離れた直後にパネル本体へマウスを移しても閉じない（チラつき防止の遅延内での乗り移り）', async () => {
    render(
      <ManualPiP isOpen docPath="/docs/page-a.md" onClose={vi.fn()} items={ITEMS} copyHostStyles={false} />
    );

    const btn = await screen.findByRole('button', { name: '目次を開く' });
    fireEvent.mouseEnter(btn);
    await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'true'));

    const panel = screen.getByRole('dialog', { name: '目次' });
    fireEvent.mouseLeave(btn);
    fireEvent.mouseEnter(panel);

    // 遅延（200ms）を跨いで待っても、パネル側のホバーで閉じるタイマーはキャンセルされているため開いたまま
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(btn).toHaveAttribute('aria-expanded', 'true');

    // パネルからも離れれば、そこから改めて遅延後に閉じる
    fireEvent.mouseLeave(panel);
    await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'false'), { timeout: 1000 });
  });

  it('ホバーで開いた状態でボタンをクリックしても閉じない（トグルではなく常に「開く」）', async () => {
    render(
      <ManualPiP isOpen docPath="/docs/page-a.md" onClose={vi.fn()} items={ITEMS} copyHostStyles={false} />
    );

    const btn = await screen.findByRole('button', { name: '目次を開く' });
    fireEvent.mouseEnter(btn);
    await waitFor(() => expect(btn).toHaveAttribute('aria-expanded', 'true'));

    fireEvent.click(btn);

    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});
