/**
 * リリースノートを「自作の画面」で出す場合の見本（R-012）。
 *
 * `<ReleaseNotes />` を使わず、アプリのデザインシステムで更新情報ページを作るときの下敷き。
 * toho_matching の「更新情報」(frontend/src/pages/release-notes/ReleaseNotesPage.tsx。Tailwind 版)
 * を、依存なしのインライン style に移したもの。データは同じ feed（ReleaseNote[]）を使う。
 *
 * 見た目の決まり（利用者が迷わないための理由つき）:
 * 1. 号は開閉できるカード。見出しは「日付 · 号 / タイトル / 開閉の矢印」だけにする（補足文を常に出さない）
 * 2. 号の中は「要約 → 変更点 N 件 → この号の画像・動画」。件数を先に出して、いくつあるかを分からせる
 * 3. 変更点は 1 件 = 番号付きの 1 枚のカード（カードとカードの間に切れ目を作る）
 * 4. 変更前の画像は「これまで」、変更後の画像は「これから」の欄の中に置く。欄が役割を言うので札は出さない
 * 5. 使い方・全体像の画像は、何の画像かを画像の上に、見どころの説明を下に書く（先に何の画像かを読ませる）
 * 6. 号全体の画像は変更点と同じカードにしない（番号の無い 3 件目に見える）。区切り線と見出しで分ける
 * 7. 元の報告（feedback / note）は、カードの下端に区切って置き、開ける人（管理者）にだけ出す。別タブで開く
 * 8. 青はリンクだけ。押せない札は灰色にする
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { fetchReleaseNotesFeed } from '@twuw-b/dev-tools';
import type { ReleaseNote, ReleaseNoteItem, ReleaseNoteMedia, ReleaseNoteSource } from '@twuw-b/dev-tools';

const C = {
  border: '#e5e7eb',
  muted: '#6b7280',
  mutedBg: '#f3f4f6',
  surface: '#fff',
  page: '#f9fafb',
  primary: '#1E40AF',
  primaryBg: '#eff6ff',
  primaryBorder: '#bfdbfe',
};

const FREE_MEDIA_LABEL: Record<string, string> = { howto: '使い方', overview: '全体像' };
const SOURCE_TYPE_LABEL: Record<ReleaseNoteSource['type'], string> = { feedback: 'フィードバック', note: 'ノート' };

function MediaFigure({ media }: { media: ReleaseNoteMedia }) {
  const alt = media.alt || media.caption || '更新内容の説明画像';
  const label = media.kind ? FREE_MEDIA_LABEL[media.kind] : undefined;
  const frame: CSSProperties = { display: 'block', width: '100%', maxHeight: 384, borderRadius: 6, border: `1px solid ${C.border}`, background: C.mutedBg, objectFit: 'contain' };
  return (
    <figure style={{ margin: 0, display: 'grid', gap: 8 }}>
      {(label || media.caption) && (
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
          {label && <span style={{ fontWeight: 600, color: C.muted }}>{label}：</span>}
          {media.caption}
        </p>
      )}
      {media.mime_type.startsWith('video/') ? (
        <video controls preload="metadata" src={media.url} aria-label={alt} style={frame} />
      ) : (
        <a href={media.url} target="_blank" rel="noreferrer" title="画像を別タブで大きく表示">
          <img loading="lazy" src={media.url} alt={alt} style={frame} />
        </a>
      )}
      {media.description && (
        <figcaption style={{ fontSize: 14, color: C.muted, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{media.description}</figcaption>
      )}
    </figure>
  );
}

function BeforeAfterColumn({ tone, text, media }: { tone: 'before' | 'after'; text: string | null; media: ReleaseNoteMedia[] }) {
  if (!text && media.length === 0) return null;
  const after = tone === 'after';
  return (
    <div style={{ display: 'grid', gap: 12, alignContent: 'start', padding: 16, borderRadius: 8, border: `1px solid ${after ? C.primaryBorder : C.border}`, background: after ? C.primaryBg : C.mutedBg }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: after ? C.primary : C.muted }}>{after ? 'これから' : 'これまで'}</p>
      {text && <p style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{text}</p>}
      {media.map((m) => <MediaFigure key={m.id} media={m} />)}
    </div>
  );
}

function SourceLinks({ sources }: { sources: ReleaseNoteSource[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'baseline', borderTop: `1px solid ${C.border}`, paddingTop: 12, fontSize: 14 }}>
      <span style={{ color: C.muted }}>対応した報告</span>
      {sources.map((s) => {
        const label = `${SOURCE_TYPE_LABEL[s.type]} #${s.id}${s.title ? ` ${s.title}` : ''}`;
        return s.url ? (
          <a key={`${s.type}-${s.id}`} href={s.url} target="_blank" rel="noreferrer" style={{ color: C.primary, textUnderlineOffset: 4 }}>{label}</a>
        ) : (
          <span key={`${s.type}-${s.id}`}>{label}</span>
        );
      })}
    </div>
  );
}

function ChangeItem({ item, index, media, showSources }: { item: ReleaseNoteItem; index: number; media: ReleaseNoteMedia[]; showSources: boolean }) {
  const before = media.filter((m) => m.kind === 'before');
  const after = media.filter((m) => m.kind === 'after');
  const free = media.filter((m) => m.kind !== 'before' && m.kind !== 'after');
  const hasColumns = Boolean(item.before_text || item.after_text || before.length || after.length);
  return (
    <li style={{ display: 'grid', gap: 16, padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{index + 1}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '28px' }}>{item.headline}</h3>
          {item.where_text && <p style={{ margin: '4px 0 0', fontSize: 14, color: C.muted }}>場所：{item.where_text}</p>}
        </div>
      </div>
      {hasColumns && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <BeforeAfterColumn tone="before" text={item.before_text} media={before} />
          <BeforeAfterColumn tone="after" text={item.after_text} media={after} />
        </div>
      )}
      {free.map((m) => <MediaFigure key={m.id} media={m} />)}
      {showSources && item.sources && item.sources.length > 0 && <SourceLinks sources={item.sources} />}
    </li>
  );
}

function NoteBody({ note, showSources }: { note: ReleaseNote; showSources: boolean }) {
  const itemIds = new Set(note.items.map((i) => i.id));
  const noteMedia = note.images.filter((m) => m.item_id === null || !itemIds.has(m.item_id));
  const sectionTitle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 600, color: C.muted };
  return (
    <div style={{ display: 'grid', gap: 24, padding: 20, borderTop: `1px solid ${C.border}`, background: C.page }}>
      {note.summary && <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{note.summary}</p>}
      {note.items.length > 0 && (
        <section aria-label="変更点" style={{ display: 'grid', gap: 12 }}>
          <h2 style={sectionTitle}>変更点 {note.items.length} 件</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 16 }}>
            {note.items.map((item, i) => (
              <ChangeItem key={item.id} item={item} index={i} media={note.images.filter((m) => m.item_id === item.id)} showSources={showSources} />
            ))}
          </ol>
        </section>
      )}
      {noteMedia.length > 0 && (
        <section aria-label="この号の画像・動画" style={{ display: 'grid', gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <h2 style={sectionTitle}>この号の画像・動画</h2>
          {noteMedia.map((m) => <MediaFigure key={m.id} media={m} />)}
        </section>
      )}
    </div>
  );
}

export interface CustomReleaseNotesProps {
  /** tokens API の feedUrl（internal なら sources が入る） */
  feedUrl: string;
  /** 元の報告を出すか。開ける人（管理者）だけ true にする */
  showSources: boolean;
}

export function CustomReleaseNotes({ feedUrl, showSources }: CustomReleaseNotesProps) {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState<number[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchReleaseNotesFeed(feedUrl, { signal: controller.signal })
      .then((data) => { setNotes(data); setError(''); })
      .catch((e: Error) => { if (!controller.signal.aborted) setError(e.message || '更新情報を取得できませんでした。'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [feedUrl]);

  return (
    <div style={{ maxWidth: 896, margin: '0 auto', display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>更新情報</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: C.muted }}>追加された機能や、使いやすくなった点をご案内します。</p>
      </header>
      {error && <p role="alert" style={{ margin: 0, padding: 16, border: `1px solid ${C.border}`, borderRadius: 8, color: '#dc2626' }}>{error}</p>}
      {loading && <p role="status" style={{ margin: 0 }}>読み込み中です…</p>}
      {!loading && !error && notes.length === 0 && <p style={{ margin: 0, padding: 24, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted }}>現在、公開されている更新情報はありません。</p>}
      {notes.map((note) => {
        const open = openIds.includes(note.id);
        return (
          <details
            key={note.id}
            open={open}
            onToggle={(e) => {
              const isOpen = e.currentTarget.open;
              setOpenIds((ids) => (isOpen ? [...new Set([...ids, note.id])] : ids.filter((id) => id !== note.id)));
            }}
            style={{ overflow: 'hidden', borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }}
          >
            <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start', padding: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, color: C.muted }}>{note.released_on} · {note.version}</p>
                <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600 }}>{note.title}</p>
              </div>
              <span aria-hidden="true" style={{ color: C.muted, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}>▾</span>
            </summary>
            <NoteBody note={note} showSources={showSources} />
          </details>
        );
      })}
    </div>
  );
}
