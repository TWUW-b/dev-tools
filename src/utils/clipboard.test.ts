import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('PiP window の navigator.clipboard を優先使用する', async () => {
    const pipWriteText = vi.fn().mockResolvedValue(undefined);
    const mainWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mainWriteText },
      configurable: true,
    });

    const mockDoc = {
      defaultView: {
        navigator: { clipboard: { writeText: pipWriteText } },
      },
    } as unknown as Document;

    const ok = await copyToClipboard('hello', mockDoc);
    expect(ok).toBe(true);
    expect(pipWriteText).toHaveBeenCalledWith('hello');
    expect(mainWriteText).not.toHaveBeenCalled();
  });

  it('PiP clipboard が失敗したらメインにフォールバック', async () => {
    const pipWriteText = vi.fn().mockRejectedValue(new Error('denied'));
    const mainWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mainWriteText },
      configurable: true,
    });

    const mockDoc = {
      defaultView: {
        navigator: { clipboard: { writeText: pipWriteText } },
      },
    } as unknown as Document;

    const ok = await copyToClipboard('hi', mockDoc);
    expect(ok).toBe(true);
    expect(pipWriteText).toHaveBeenCalled();
    expect(mainWriteText).toHaveBeenCalledWith('hi');
  });

  it('両方の clipboard が失敗したら execCommand フォールバックを実行', async () => {
    const pipWriteText = vi.fn().mockRejectedValue(new Error('x'));
    const mainWriteText = vi.fn().mockRejectedValue(new Error('y'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mainWriteText },
      configurable: true,
    });

    const execSpy = vi.fn().mockReturnValue(true);
    const mockDoc = {
      defaultView: {
        navigator: { clipboard: { writeText: pipWriteText } },
      },
      createElement: (tag: string) => document.createElement(tag),
      body: document.body,
      documentElement: document.documentElement,
      execCommand: execSpy,
    } as unknown as Document;

    const ok = await copyToClipboard('fallback', mockDoc);
    expect(ok).toBe(true);
    expect(execSpy).toHaveBeenCalledWith('copy');
  });

  it('document が null でも主要パスが動作する', async () => {
    const mainWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mainWriteText },
      configurable: true,
    });
    const ok = await copyToClipboard('x', null);
    expect(ok).toBe(true);
    expect(mainWriteText).toHaveBeenCalledWith('x');
  });
});
