import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ReleaseNotes } from './ReleaseNotes';
import type { ReleaseNote, ReleaseNoteMedia } from '../types';

/**
 * RFC 003: メディアに役割（変更前／変更後…）と説明を持たせた表示。
 * 以前は caption しか出せず、取り込み先で「どの変更の、何を見る画像か」が分からなかった。
 */

function media(over: Partial<ReleaseNoteMedia>): ReleaseNoteMedia {
  return {
    id: 1,
    release_note_id: 1,
    item_id: 10,
    original_name: 'a.png',
    mime_type: 'image/png',
    size: 1,
    caption: null,
    sort_order: 0,
    url: 'http://api.test/release-notes/media/abc',
    ...over,
  };
}

function note(images: ReleaseNoteMedia[]): ReleaseNote {
  return {
    id: 1,
    version: '第1号',
    title: '一覧を見やすくしました',
    summary: null,
    released_on: '2026-10-21',
    previous_release_id: null,
    previous: null,
    cover_image_id: null,
    status: 'published',
    is_public: true,
    created_at: '',
    updated_at: '',
    items: [{
      id: 10, release_note_id: 1, sort_order: 0, category: 'improve',
      headline: '件数を見出しの横に出しました', where_text: '案件 > 一覧',
      before_text: '件数が分かりませんでした', after_text: '件数が見出しの横に出ます', feedback_id: null,
    }],
    images,
  };
}

function mockFeed(notes: ReleaseNote[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify({ success: true, data: notes })),
  }) as unknown as typeof fetch;
}

describe('ReleaseNotes のメディア表示', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('役割の札・caption・description を出し、alt を優先する', async () => {
    mockFeed([note([
      media({ id: 1, kind: 'before', caption: '変更前の一覧', sort_order: 0 }),
      media({
        id: 2, kind: 'after', caption: '変更後の一覧', sort_order: 1,
        alt: '件数つきの一覧', description: '見出しの右に件数が出る',
      }),
    ])]);

    render(<ReleaseNotes feedUrl="http://api.test/release-notes/feed/t" />);

    const list = await screen.findByTestId('release-note-media');
    const figs = list.querySelectorAll('figure');
    expect(figs).toHaveLength(2);
    expect(within(figs[0] as HTMLElement).getByText('変更前')).toBeTruthy();
    expect(within(figs[1] as HTMLElement).getByText('変更後')).toBeTruthy();
    expect(screen.getByText('見出しの右に件数が出る')).toBeTruthy();
    expect(screen.getByAltText('件数つきの一覧')).toBeTruthy();
    // alt が無ければ caption を代替テキストにする（従来の動作）
    expect(screen.getByAltText('変更前の一覧')).toBeTruthy();
    // 変更前と変更後がそろうと横並び（幅を分け合い、狭ければ折り返す）になる
    expect((figs[0] as HTMLElement).style.flex).toBe('1 1 220px');
  });

  it('kind の無い従来データは札を出さず、幅も従来どおり', async () => {
    mockFeed([note([media({ id: 3, caption: '修正後: 担当者が表示されます' })])]);

    render(<ReleaseNotes feedUrl="http://api.test/release-notes/feed/t" />);

    const list = await screen.findByTestId('release-note-media');
    const fig = list.querySelector('figure') as HTMLElement;
    expect(fig.getAttribute('data-kind')).toBeNull();
    expect(within(fig).queryByText('変更後')).toBeNull();
    expect(within(fig).getByText('修正後: 担当者が表示されます')).toBeTruthy();
    expect(fig.style.maxWidth).toBe('420px');
  });

  it('動画には冒頭フレーム用の #t=0.1 と aria-label が付く', async () => {
    mockFeed([note([media({ id: 4, mime_type: 'video/mp4', kind: 'howto', caption: '使い方: 保存まで' })])]);

    render(<ReleaseNotes feedUrl="http://api.test/release-notes/feed/t" />);

    const list = await screen.findByTestId('release-note-media');
    const video = list.querySelector('video') as HTMLVideoElement;
    expect(video.getAttribute('src')).toBe('http://api.test/release-notes/media/abc#t=0.1');
    expect(video.getAttribute('aria-label')).toBe('使い方: 保存まで');
    expect(within(list).getByText('使い方')).toBeTruthy();
  });
});

describe('ReleaseNotes の元の報告（R-010）', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  function withSources(sources: ReleaseNote['items'][number]['sources']): ReleaseNote {
    const n = note([]);
    return { ...n, items: [{ ...n.items[0], sources }] };
  }

  it('ID とタイトルを出し、API の url をリンクにする', async () => {
    mockFeed([withSources([
      { type: 'feedback', id: 24, title: '保存ボタンが押せない', url: 'https://app.test/__admin?feedback=24' },
      { type: 'note', id: 7, title: '件数が出ない', url: null },
    ])]);

    render(<ReleaseNotes feedUrl="http://api.test/release-notes/feed/t" />);

    const box = await screen.findByTestId('release-note-sources');
    const link = within(box).getByRole('link', { name: 'フィードバック #24' });
    expect(link.getAttribute('href')).toBe('https://app.test/__admin?feedback=24');
    expect(within(box).getByText('保存ボタンが押せない')).toBeTruthy();
    // url が無ければリンクにせず ID だけ出す
    expect(within(box).getByText('ノート #7').tagName).toBe('SPAN');
  });

  it('sourceHref で上書きでき、onSourceClick を渡すと遷移を止めて呼ぶ', async () => {
    mockFeed([withSources([{ type: 'note', id: 7, title: null, url: null }])]);
    const onSourceClick = vi.fn();

    render(
      <ReleaseNotes
        feedUrl="http://api.test/release-notes/feed/t"
        sourceHref={(s) => `/__admin?${s.type}=${s.id}`}
        onSourceClick={onSourceClick}
      />,
    );

    const link = await screen.findByRole('link', { name: 'ノート #7' });
    expect(link.getAttribute('href')).toBe('/__admin?note=7');
    link.click();
    expect(onSourceClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'note', id: 7 }), '/__admin?note=7');
  });

  it('javascript: の URL はリンクにしない', async () => {
    mockFeed([withSources([{ type: 'feedback', id: 1, title: null, url: 'javascript:alert(1)' }])]);

    render(<ReleaseNotes feedUrl="http://api.test/release-notes/feed/t" />);

    const box = await screen.findByTestId('release-note-sources');
    expect(within(box).queryByRole('link')).toBeNull();
  });

  it('紐付けが無ければ「対応」の行を出さない', async () => {
    mockFeed([withSources([])]);

    render(<ReleaseNotes feedUrl="http://api.test/release-notes/feed/t" />);

    await screen.findByText('件数を見出しの横に出しました');
    expect(screen.queryByTestId('release-note-sources')).toBeNull();
  });
});
