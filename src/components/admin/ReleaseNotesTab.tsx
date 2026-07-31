/**
 * DebugAdmin の「リリースノート」タブ（@TWUWB-003）。
 *
 * ここで扱うのは **公開の制御** だけ。文面の投入は feedback-fix 側が持っているので、
 * このタブで号を新規作成したり項目を書いたりはしない。開発側がここで確かめたいのは
 * 「何が、どこまで出ているか」と「クライアントに渡す URL」の2つ。
 *
 * status(draft|published) と 社外公開(is_public) は別の軸なので、切り替えも別々に出す。
 * 社内向けのつもりの号が公開 URL に出ていないか、一覧で一目で分かるようにしている。
 */
import { useCallback, useEffect, useState } from 'react';
import { releaseNotesApi } from '../../utils/releaseNotesApi';
import type { ReleaseCategory, ReleaseNote, ReleaseNoteTokens, Environment } from '../../types';
import { Icon, Spinner } from '../shared';
import { LIGHT_COLORS, type AdminColors } from '../adminColors';

// パレットは DebugAdmin と共有する（@TWUWB-005 で adminColors.ts へ切り出した）。
// ホストが単体で使うときのために省略可にし、既定はライトモード。
type Colors = AdminColors;

export interface ReleaseNotesTabProps {
  apiBaseUrl: string;
  env: Environment;
  adminKey?: string;
  /** 省略時はライトモードのパレット。DebugAdmin 以外のホストでもそのまま置ける。 */
  colors?: Colors;
  /** 外から再取得させたいときに変える。省略時は 0 固定（自前で再取得しない）。 */
  refreshKey?: number;
}

const CATEGORY_LABELS: Record<ReleaseCategory, string> = {
  fix: '直したこと',
  improve: '使いやすくしたこと',
  feature: '新しくできること',
};

function formatDate(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  return m ? `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日` : ymd;
}

export function ReleaseNotesTab({ apiBaseUrl, env, adminKey, colors = LIGHT_COLORS, refreshKey = 0 }: ReleaseNotesTabProps) {
  const config = { apiBaseUrl, env, adminKey };

  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [tokens, setTokens] = useState<ReleaseNoteTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  /** 削除の確認待ち。ブラウザ標準ダイアログは使わない */
  const [pendingDelete, setPendingDelete] = useState<ReleaseNote | null>(null);
  const [pendingRotate, setPendingRotate] = useState<'public' | 'internal' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, tk] = await Promise.all([
        releaseNotesApi.list(config),
        releaseNotesApi.tokens(config),
      ]);
      setNotes(list);
      setTokens(tk);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'リリースノートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
    // config は毎レンダ再生成されるので個別の値に依存させる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, env, adminKey]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const patch = useCallback(
    async (note: ReleaseNote, input: Parameters<typeof releaseNotesApi.update>[2]) => {
      setBusyId(note.id);
      setError(null);
      try {
        await releaseNotesApi.update(config, note.id, input);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : '更新に失敗しました');
      } finally {
        setBusyId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBaseUrl, env, adminKey, load],
  );

  const remove = useCallback(async (note: ReleaseNote) => {
    setPendingDelete(null);
    setBusyId(note.id);
    setError(null);
    try {
      await releaseNotesApi.remove(config, note.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました');
    } finally {
      setBusyId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, env, adminKey, load]);

  const rotate = useCallback(async (scope: 'public' | 'internal') => {
    setPendingRotate(null);
    setError(null);
    try {
      setTokens(await releaseNotesApi.rotateToken(config, scope));
    } catch (e) {
      setError(e instanceof Error ? e.message : '再発行に失敗しました');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, env, adminKey]);

  const copy = useCallback(async (label: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 2000);
    } catch {
      setError('クリップボードにコピーできませんでした');
    }
  }, []);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const btn = (kind: 'default' | 'primary' | 'danger' = 'default') => ({
    padding: '5px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: `1px solid ${kind === 'danger' ? colors.error : kind === 'primary' ? colors.primary : colors.border}`,
    background: kind === 'primary' ? colors.primary : 'transparent',
    color: kind === 'primary' ? '#FFF' : kind === 'danger' ? colors.error : colors.text,
  });

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', background: colors.bg, color: colors.text }}>
      {error && (
        <div style={{
          marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
          background: colors.errorBg, color: colors.error, fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* 公開 URL。この機能の成果物そのものなので一番上に置く */}
      <section style={{
        marginBottom: '24px', padding: '14px 16px', borderRadius: '10px',
        background: colors.bgSecondary, border: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700 }}>公開 URL</h3>
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: colors.textMuted }}>
          クライアントに渡すのは「社外公開」の URL です。ログイン不要で開けます。
        </p>

        {tokens ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <UrlRow
              label="社外公開（クライアント向け）"
              hint="公開済み かつ 社外公開 の号だけが出ます"
              url={tokens.public.pageUrl}
              colors={colors}
              copied={copied === 'public'}
              onCopy={() => copy('public', tokens.public.pageUrl)}
              onRotate={() => setPendingRotate('public')}
              btn={btn}
            />
            <UrlRow
              label="アプリ内表示用（feedUrl）"
              hint="ReleaseNotes コンポーネントに渡す URL。社内向けの号も含みます"
              url={tokens.internal.feedUrl}
              colors={colors}
              copied={copied === 'internal'}
              onCopy={() => copy('internal', tokens.internal.feedUrl)}
              onRotate={() => setPendingRotate('internal')}
              btn={btn}
            />
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>読み込み中…</p>
        )}

        {pendingRotate && (
          <div style={{
            marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
            background: colors.warningBg, color: colors.warning, fontSize: '12px',
          }}>
            URL を再発行すると、これまでに配った URL は開けなくなります。実行しますか？
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="button" style={btn('danger')} onClick={() => void rotate(pendingRotate)}>
                再発行する
              </button>
              <button type="button" style={btn()} onClick={() => setPendingRotate(null)}>
                やめる
              </button>
            </div>
          </div>
        )}
      </section>

      {loading && notes.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '13px' }}>
          <Spinner size={16} color={colors.textMuted} />
          読み込み中…
        </div>
      )}

      {!loading && notes.length === 0 && (
        <p style={{ fontSize: '13px', color: colors.textMuted }}>
          まだリリースノートがありません。文面の投入は feedback-fix のリリースノート画面から行います。
        </p>
      )}

      {notes.map((note) => {
        const isBusy = busyId === note.id;
        const open = expanded.has(note.id);
        return (
          <article
            key={note.id}
            style={{
              marginBottom: '12px', borderRadius: '10px', overflow: 'hidden',
              border: `1px solid ${colors.border}`, background: colors.bgSecondary,
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{note.version}</span>
                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>{note.title}</span>
                  <Badge
                    text={note.status === 'published' ? '公開済み' : '下書き'}
                    fg={note.status === 'published' ? colors.success : colors.textMuted}
                    bg={note.status === 'published' ? colors.successBg : colors.bgTertiary}
                  />
                  {note.is_public && <Badge text="社外公開" fg={colors.warning} bg={colors.warningBg} />}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: colors.textMuted }}>
                  {formatDate(note.released_on)} ・ 項目 {note.items.length} 件 ・ メディア {note.images.length} 件
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  style={btn(note.status === 'published' ? 'default' : 'primary')}
                  disabled={isBusy}
                  onClick={() => void patch(note, { status: note.status === 'published' ? 'draft' : 'published' })}
                >
                  {note.status === 'published' ? '下書きに戻す' : '公開する'}
                </button>
                <button
                  type="button"
                  style={btn(note.is_public ? 'default' : 'primary')}
                  disabled={isBusy || note.status !== 'published'}
                  title={note.status !== 'published' ? '先に公開してください' : undefined}
                  onClick={() => void patch(note, { is_public: !note.is_public })}
                >
                  {note.is_public ? '社外公開をやめる' : '社外公開にする'}
                </button>
                <button type="button" style={btn()} onClick={() => toggle(note.id)}>
                  {open ? '閉じる' : '内容'}
                </button>
                <button type="button" style={btn('danger')} disabled={isBusy} onClick={() => setPendingDelete(note)}>
                  <Icon name="delete" size={14} color={colors.error} />
                </button>
              </div>
            </div>

            {pendingDelete?.id === note.id && (
              <div style={{
                padding: '10px 16px', background: colors.errorBg, color: colors.error, fontSize: '12px',
              }}>
                「{note.version} {note.title}」を削除します。添付された画像・動画も一緒に消えます。
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="button" style={btn('danger')} onClick={() => void remove(note)}>削除する</button>
                  <button type="button" style={btn()} onClick={() => setPendingDelete(null)}>やめる</button>
                </div>
              </div>
            )}

            {open && (
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.borderLight}`, background: colors.bg }}>
                {note.summary && (
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: colors.textSecondary, whiteSpace: 'pre-wrap' }}>
                    {note.summary}
                  </p>
                )}
                {note.items.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: colors.textMuted }}>項目がありません</p>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px' }}>
                    {note.items.map((item) => (
                      <li key={item.id} style={{ marginBottom: '8px' }}>
                        <span style={{ color: colors.textMuted }}>[{CATEGORY_LABELS[item.category]}]</span>{' '}
                        {item.headline}
                        {item.feedback_id !== null && (
                          <span style={{ color: colors.textMuted }}> ・報告 #{item.feedback_id}</span>
                        )}
                        {(item.before_text || item.after_text) && (
                          <div style={{ marginTop: '2px', color: colors.textSecondary }}>
                            {item.before_text && <div>これまで: {item.before_text}</div>}
                            {item.after_text && <div>これから: {item.after_text}</div>}
                          </div>
                        )}
                        {note.images.filter((im) => im.item_id === item.id).length > 0 && (
                          <div style={{ color: colors.textMuted, marginTop: '2px' }}>
                            添付 {note.images.filter((im) => im.item_id === item.id).length} 件
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Badge({ text, fg, bg }: { text: string; fg: string; bg: string }) {
  return (
    <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '999px', background: bg, color: fg }}>
      {text}
    </span>
  );
}

function UrlRow({
  label,
  hint,
  url,
  colors,
  copied,
  onCopy,
  onRotate,
  btn,
}: {
  label: string;
  hint: string;
  url: string;
  colors: Colors;
  copied: boolean;
  onCopy: () => void;
  onRotate: () => void;
  btn: (kind?: 'default' | 'primary' | 'danger') => React.CSSProperties;
}) {
  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>{hint}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
        <code style={{
          flex: 1, minWidth: '220px', padding: '5px 8px', borderRadius: '6px', fontSize: '11px',
          background: colors.bgTertiary, color: colors.textSecondary, wordBreak: 'break-all',
        }}>
          {url}
        </code>
        <button type="button" style={btn(copied ? 'primary' : 'default')} onClick={onCopy}>
          {copied ? 'コピーしました' : 'コピー'}
        </button>
        <a href={url} target="_blank" rel="noreferrer" style={{ ...btn(), textDecoration: 'none' }}>
          開く
        </a>
        <button type="button" style={btn()} onClick={onRotate}>再発行</button>
      </div>
    </div>
  );
}
