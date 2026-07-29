/**
 * リリースノート表示コンポーネント（@TWUWB-003）。
 *
 * ログイン済みの利用者がアプリ内で「何が変わったか」を読む面。
 * どこに置くか（グローバルナビ / ヘッダ / マニュアルの隣）はホストアプリが決める。
 *
 * 「前回から何が変わったか」を3層で見せる:
 *   1. 号ごと — カード冒頭の「前回（○月○日 第N号）からの変更」
 *   2. 項目ごと — 「これまで → これから」の対
 *   3. メディア — 文章を読まなくても伝わる層（伝達の主役）
 *
 * 見た目は公開ページ（PHP が返す HTML）と揃えてある。ホストの CSS に依存しないよう
 * すべてインライン style で書く（Tailwind 等のクラスは使わない）。
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReleaseNotes } from '../hooks/useReleaseNotes';
import { MANUAL_COLORS } from '../styles/colors';
import type { ReleaseCategory, ReleaseNote, ReleaseNoteItem, ReleaseNoteMedia, ReleaseNotesProps } from '../types';

const CATEGORY_META: Record<ReleaseCategory, { label: string; fg: string; bg: string; border: string }> = {
  fix: { label: '直したこと', fg: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  improve: { label: '使いやすくしたこと', fg: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  feature: { label: '新しくできること', fg: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
};
const CATEGORY_ORDER: ReleaseCategory[] = ['fix', 'improve', 'feature'];

function formatDate(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`;
}

function isVideo(media: ReleaseNoteMedia): boolean {
  return media.mime_type.startsWith('video/');
}

export function ReleaseNotes({
  feedUrl,
  title = '更新情報',
  description = 'アプリの更新内容を新しい順に掲載しています',
  initialOpenCount = 1,
  showFilter = true,
  storageKey,
  onLoaded,
  className,
  style,
}: ReleaseNotesProps) {
  const { notes, loading, error, markAllRead } = useReleaseNotes({ feedUrl, storageKey });
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [filter, setFilter] = useState<ReleaseCategory | 'all'>('all');
  const [lightbox, setLightbox] = useState<{ url: string; caption: string | null } | null>(null);

  useEffect(() => {
    if (notes.length === 0) return;
    // 件数が増えても1画面に収まるよう、既定では最新のいくつかだけ開く。
    setOpen(new Set(notes.slice(0, Math.max(0, initialOpenCount)).map((n) => n.id)));
    // 読んだ扱いにする（ホスト側のバッジを消すため）。
    markAllRead();
    onLoaded?.(notes);
    // notes の同一性でのみ再実行する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const toggle = useCallback((id: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visible = useMemo(() => {
    if (filter === 'all') return notes;
    return notes
      .map((n) => ({ ...n, items: n.items.filter((i) => i.category === filter) }))
      .filter((n) => n.items.length > 0);
  }, [notes, filter]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <div className={className} style={{ maxWidth: '820px', margin: '0 auto', fontSize: '14px', color: '#111827', ...style }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: MANUAL_COLORS.primary }}>{title}</h1>
        {description && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: MANUAL_COLORS.gray500 }}>{description}</p>
        )}
      </header>

      {showFilter && notes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>すべて</FilterChip>
          {CATEGORY_ORDER.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {CATEGORY_META[c].label}
            </FilterChip>
          ))}
        </div>
      )}

      {loading && notes.length === 0 && (
        <p style={{ padding: '24px', color: MANUAL_COLORS.gray500, fontSize: '13px' }}>読み込み中…</p>
      )}

      {error && (
        <p style={{
          padding: '12px 16px', background: MANUAL_COLORS.errorBg, color: MANUAL_COLORS.error,
          borderRadius: '8px', fontSize: '13px',
        }}>
          {error}
        </p>
      )}

      {!loading && !error && visible.length === 0 && (
        <p style={{
          padding: '24px', background: MANUAL_COLORS.white, border: `1px solid ${MANUAL_COLORS.gray300}`,
          borderRadius: '10px', color: MANUAL_COLORS.gray500, fontSize: '13px',
        }}>
          {notes.length === 0 ? 'まだ掲載されている更新はありません' : '条件に合う更新はありません'}
        </p>
      )}

      {visible.length > 0 && (
        <div style={{ position: 'relative', paddingLeft: '22px' }}>
          <div
            aria-hidden
            style={{ position: 'absolute', left: '6px', top: '8px', bottom: '8px', width: '1px', background: '#E5E7EB' }}
          />
          {visible.map((note, idx) => (
            <NoteCard
              key={note.id}
              note={note}
              isLatest={idx === 0 && filter === 'all'}
              open={open.has(note.id)}
              onToggle={() => toggle(note.id)}
              onZoom={(url, caption) => setLightbox({ url, caption })}
            />
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2147483000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <button
            type="button"
            aria-label="閉じる"
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none',
              color: '#FFF', fontSize: '32px', lineHeight: 1, cursor: 'pointer',
            }}
          >
            ×
          </button>
          <figure style={{ margin: 0, maxWidth: '100%', maxHeight: '100%' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption ?? ''}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', background: '#FFF', display: 'block' }}
            />
            {lightbox.caption && (
              <figcaption style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '8px' }}>
                {lightbox.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
        border: `1px solid ${active ? MANUAL_COLORS.primary : MANUAL_COLORS.gray300}`,
        background: active ? MANUAL_COLORS.primary : MANUAL_COLORS.white,
        color: active ? MANUAL_COLORS.white : MANUAL_COLORS.gray700,
      }}
    >
      {children}
    </button>
  );
}

function NoteCard({
  note,
  isLatest,
  open,
  onToggle,
  onZoom,
}: {
  note: ReleaseNote;
  isLatest: boolean;
  open: boolean;
  onToggle: () => void;
  onZoom: (url: string, caption: string | null) => void;
}) {
  // 代表メディアは cover_image_id の明示が最優先。指定が無ければ
  // 「項目に紐付いていないメディア」の先頭を使う（公開ページ側と同じ規則）。
  const cover =
    (note.cover_image_id !== null ? note.images.find((im) => im.id === note.cover_image_id) : undefined) ??
    note.images.find((im) => im.item_id === null) ??
    null;
  const counts = CATEGORY_ORDER
    .map((c) => ({ c, n: note.items.filter((i) => i.category === c).length }))
    .filter((x) => x.n > 0);

  return (
    <article style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{
        position: 'absolute', left: '-22px', top: '6px', width: '13px', height: '13px',
        borderRadius: '50%', border: '2px solid #F7F8FA',
        background: isLatest ? MANUAL_COLORS.primary : MANUAL_COLORS.gray300,
      }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: MANUAL_COLORS.gray700 }}>
          {formatDate(note.released_on)}
        </span>
        <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '999px', background: '#EEF2F7', color: '#4B5563' }}>
          {note.version}
        </span>
        {isLatest && (
          <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '999px', background: MANUAL_COLORS.primary, color: MANUAL_COLORS.white }}>
            最新
          </span>
        )}
      </div>

      <div style={{
        background: MANUAL_COLORS.white, border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 16px 14px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{note.title}</h2>
          {/* 「前回から何が変わったか」の明示。ここがこの画面の核 */}
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: MANUAL_COLORS.gray500 }}>
            {note.previous
              ? `前回（${formatDate(note.previous.released_on)} ${note.previous.version}）からの変更`
              : '最初のリリースです'}
          </p>

          {counts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {counts.map(({ c, n }) => {
                const meta = CATEGORY_META[c];
                return (
                  <span key={c} style={{
                    fontSize: '11px', padding: '2px 9px', borderRadius: '999px',
                    background: meta.bg, color: meta.fg, border: `1px solid ${meta.border}`,
                  }}>
                    {meta.label} {n}
                  </span>
                );
              })}
            </div>
          )}

          {(note.summary || cover) && (
            <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
              {cover && (
                <div style={{ flexShrink: 0, width: '220px', maxWidth: '100%' }}>
                  <Media media={cover} onZoom={onZoom} />
                </div>
              )}
              {note.summary && (
                <p style={{ margin: 0, flex: 1, minWidth: '200px', color: MANUAL_COLORS.gray700, whiteSpace: 'pre-wrap' }}>
                  {note.summary}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          style={{
            width: '100%', padding: '10px 16px', fontSize: '12px', color: MANUAL_COLORS.gray500,
            background: 'transparent', border: 'none', borderTop: '1px solid #F3F4F6', cursor: 'pointer',
          }}
        >
          {open ? '▾ 閉じる' : `▸ 変更点をすべて見る（${note.items.length}件）`}
        </button>

        {open && (
          <div style={{ padding: '4px 16px 16px', background: '#FAFBFC', borderTop: '1px solid #F3F4F6' }}>
            {CATEGORY_ORDER.map((c) => {
              const items = note.items.filter((i) => i.category === c);
              if (items.length === 0) return null;
              const meta = CATEGORY_META[c];
              return (
                <section key={c} style={{ marginTop: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: meta.fg }}>
                    {meta.label}（{items.length}件）
                  </h3>
                  <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {items.map((item, n) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        index={n + 1}
                        media={note.images.filter((im) => im.item_id === item.id)}
                        onZoom={onZoom}
                      />
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

function ItemRow({
  item,
  index,
  media,
  onZoom,
}: {
  item: ReleaseNoteItem;
  index: number;
  media: ReleaseNoteMedia[];
  onZoom: (url: string, caption: string | null) => void;
}) {
  return (
    <li style={{
      display: 'flex', gap: '8px', background: MANUAL_COLORS.white, border: '1px solid #F3F4F6',
      borderRadius: '8px', padding: '10px 12px', marginBottom: '10px',
    }}>
      <span style={{ fontSize: '12px', color: '#9CA3AF', paddingTop: '2px' }}>{index}.</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '14px' }}>{item.headline}</p>
        {item.where_text && (
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9CA3AF' }}>場所: {item.where_text}</p>
        )}

        {(item.before_text || item.after_text) && (
          <div style={{ marginTop: '8px' }}>
            {item.before_text && (
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: MANUAL_COLORS.gray500 }}>
                <span style={{ display: 'inline-block', width: '4.5em', color: '#9CA3AF' }}>これまで</span>
                {item.before_text}
              </p>
            )}
            {item.after_text && (
              <p style={{ margin: 0, fontSize: '12px', color: '#111827' }}>
                <span style={{ display: 'inline-block', width: '4.5em', color: '#9CA3AF' }}>これから</span>
                {item.after_text}
              </p>
            )}
          </div>
        )}

        {media.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
            {media.map((m) => (
              <figure key={m.id} style={{ margin: 0, width: '100%', maxWidth: '420px' }}>
                <Media media={m} onZoom={onZoom} />
                {m.caption && (
                  <figcaption style={{ marginTop: '4px', fontSize: '11px', color: '#9CA3AF' }}>{m.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * 画像と動画を出し分ける。
 *
 * 動画の src には #t=0.1 を付ける。付けないとブラウザが冒頭フレームを描かず、
 * 再生前が真っ黒な箱に見えて何の動画か分からない。
 */
function Media({ media, onZoom }: { media: ReleaseNoteMedia; onZoom: (url: string, caption: string | null) => void }) {
  if (isVideo(media)) {
    return (
      <video
        src={`${media.url}#t=0.1`}
        controls
        playsInline
        preload="metadata"
        style={{ width: '100%', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#000', display: 'block' }}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => onZoom(media.url, media.caption)}
      style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'zoom-in' }}
    >
      <img
        src={media.url}
        alt={media.caption ?? ''}
        loading="lazy"
        style={{ width: '100%', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', display: 'block' }}
      />
    </button>
  );
}
