import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useManualHeadings } from './useManualHeadings';

describe('useManualHeadings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('h2/h3 見出しを抽出し、GithubSlugger と同じルールで id を生成する', async () => {
    const markdown = [
      '# タイトル(h1・対象外)',
      '',
      '## セクション1',
      '',
      '本文です。',
      '',
      '### サブセクション A',
      '',
      '## Section Two',
    ].join('\n');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(markdown),
    });

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/page1.md');
    });

    const headings = result.current.getHeadings('/docs/page1.md');
    expect(headings).toEqual([
      { id: 'セクション1', text: 'セクション1', level: 2 },
      { id: 'サブセクション-a', text: 'サブセクション A', level: 3 },
      { id: 'section-two', text: 'Section Two', level: 2 },
    ]);
  });

  it('h1 と h4以降 は見出しとして抽出しない', async () => {
    const markdown = [
      '# H1 見出し',
      '## H2 見出し',
      '#### H4 見出し',
      '##### H5 見出し',
      '###### H6 見出し',
    ].join('\n');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(markdown),
    });

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/page2.md');
    });

    const headings = result.current.getHeadings('/docs/page2.md');
    expect(headings).toEqual([{ id: 'h2-見出し', text: 'H2 見出し', level: 2 }]);
  });

  it('コードフェンス内の # 始まり行は見出しとして扱わない', async () => {
    const markdown = [
      '## 本物の見出し',
      '',
      '```bash',
      '## これはコメントであり見出しではない',
      '# これも見出しではない',
      '```',
      '',
      '### 本物の見出し2',
    ].join('\n');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(markdown),
    });

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/page3.md');
    });

    const headings = result.current.getHeadings('/docs/page3.md');
    expect(headings).toEqual([
      { id: '本物の見出し', text: '本物の見出し', level: 2 },
      { id: '本物の見出し2', text: '本物の見出し2', level: 3 },
    ]);
  });

  it('同じテキストの見出しが複数ある場合、連番サフィックス(-1, -2)が付く', async () => {
    const markdown = ['## 概要', '### 詳細', '## 概要', '## 概要'].join('\n');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(markdown),
    });

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/page4.md');
    });

    const headings = result.current.getHeadings('/docs/page4.md');
    expect(headings).toEqual([
      { id: '概要', text: '概要', level: 2 },
      { id: '詳細', text: '詳細', level: 3 },
      { id: '概要-1', text: '概要', level: 2 },
      { id: '概要-2', text: '概要', level: 2 },
    ]);
  });

  it('同じ path を複数回 loadHeadings しても再フェッチしない（キャッシュが効く）', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('## 見出し'),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/page5.md');
    });
    await act(async () => {
      await result.current.loadHeadings('/docs/page5.md');
    });
    await act(async () => {
      await result.current.loadHeadings('/docs/page5.md');
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.getHeadings('/docs/page5.md')).toEqual([
      { id: '見出し', text: '見出し', level: 2 },
    ]);
  });

  it('異なる path は独立してキャッシュされる（他ページの結果と混ざらない）', async () => {
    const fetchMock = vi.fn().mockImplementation((path: string) => {
      const content = path === '/docs/a.md' ? '## ページA見出し' : '## ページB見出し';
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(content),
      });
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/a.md');
    });
    await act(async () => {
      await result.current.loadHeadings('/docs/b.md');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.getHeadings('/docs/a.md')).toEqual([
      { id: 'ページa見出し', text: 'ページA見出し', level: 2 },
    ]);
    expect(result.current.getHeadings('/docs/b.md')).toEqual([
      { id: 'ページb見出し', text: 'ページB見出し', level: 2 },
    ]);
  });

  it('フェッチ失敗（HTTPエラー）時にクラッシュせず、エラー状態が分かる形で扱われる', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/missing.md');
    });

    expect(result.current.getError('/docs/missing.md')).toBeInstanceOf(Error);
    expect(result.current.getError('/docs/missing.md')?.message).toContain('404');
    expect(result.current.getHeadings('/docs/missing.md')).toBeUndefined();
    expect(result.current.isLoading('/docs/missing.md')).toBe(false);
  });

  it('フェッチ失敗（ネットワークエラー）時にクラッシュせず、エラー状態が分かる形で扱われる', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/offline.md');
    });

    expect(result.current.getError('/docs/offline.md')?.message).toBe('Network error');
    expect(result.current.getHeadings('/docs/offline.md')).toBeUndefined();
  });

  it('フェッチ失敗後は再試行できる（開始済みフラグが戻る）', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('## リトライ成功') });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useManualHeadings());

    await act(async () => {
      await result.current.loadHeadings('/docs/retry.md');
    });
    expect(result.current.getError('/docs/retry.md')).toBeInstanceOf(Error);

    await act(async () => {
      await result.current.loadHeadings('/docs/retry.md');
    });

    await waitFor(() => {
      expect(result.current.getHeadings('/docs/retry.md')).toEqual([
        { id: 'リトライ成功', text: 'リトライ成功', level: 2 },
      ]);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
