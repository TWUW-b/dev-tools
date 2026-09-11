import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManualTabPage } from './ManualTabPage';

/**
 * /manual-view の app: リンク無反応バグ (2026-08-31) の回帰テスト。
 *
 * 回帰の経緯: ManualTabPage の本文 app: リンクは、window.open() でこのページを開いた
 * 場合（window.opener あり）に限り window.opener への postMessage で親ウィンドウへ
 * 通知していた。/manual-view を直接 URL アクセスやブックマークで開いた場合は
 * window.opener が存在せず、postMessage の送り先が無いためクリックしても完全に無反応
 * だった。onAppNavigate プロパティのフォールバックで解決する。
 */
describe('ManualTabPage app: リンク', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList);

    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as unknown as typeof IntersectionObserver;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<a href="app:/properties">物件管理を開く</a>'),
    });
  });

  it('window.opener が無い場合（直接アクセス）、app: リンククリックで onAppNavigate が呼ばれる', async () => {
    const onAppNavigate = vi.fn();
    Object.defineProperty(window, 'opener', { value: null, configurable: true });

    render(<ManualTabPage defaultDocPath="/manuals/index.md" onAppNavigate={onAppNavigate} />);

    const link = await screen.findByText('物件管理を開く');
    fireEvent.click(link);

    expect(onAppNavigate).toHaveBeenCalledWith('/properties');
  });

  it('window.opener がある場合（window.open() 経由）は postMessage を優先し、onAppNavigate は呼ばれない', async () => {
    const onAppNavigate = vi.fn();
    const postMessage = vi.fn();
    Object.defineProperty(window, 'opener', {
      value: { closed: false, postMessage },
      configurable: true,
    });

    render(<ManualTabPage defaultDocPath="/manuals/index.md" onAppNavigate={onAppNavigate} />);

    const link = await screen.findByText('物件管理を開く');
    fireEvent.click(link);

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'manual-app-navigate', path: '/properties' },
      window.location.origin
    );
    expect(onAppNavigate).not.toHaveBeenCalled();
  });

  it('window.opener が無く onAppNavigate も未指定の場合は何もエラーにならず無反応のまま', async () => {
    Object.defineProperty(window, 'opener', { value: null, configurable: true });

    render(<ManualTabPage defaultDocPath="/manuals/index.md" />);

    const link = await screen.findByText('物件管理を開く');
    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
