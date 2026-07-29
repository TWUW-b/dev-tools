/**
 * リリースノート API クライアント（@TWUWB-003）
 *
 * 2種類の呼び出しがある:
 *   - 公開系（fetchReleaseNotesFeed / メディア URL）… 認証なし。URL のトークンで守る
 *   - 管理系（releaseNotesApi.*）                  … X-Admin-Key（または Firebase）が要る
 *
 * フィールド名はバックエンドの列名（snake_case）のまま通す。投入側（feedback-fix）と
 * API 形状を揃える必要があるため、ここで camelCase へ変換しない。
 */
import { dbgFetch, extractErrorMessage } from './api';
import type {
  ReleaseNote,
  ReleaseNoteInput,
  ReleaseNoteItem,
  ReleaseNoteItemInput,
  ReleaseNoteMedia,
  ReleaseNoteTokens,
  Environment,
} from '../types';

/** 管理系の呼び出しに共通で要る接続情報 */
export interface ReleaseNotesApiConfig {
  /** デバッグ API のベース URL（例: /api/__debug） */
  apiBaseUrl: string;
  env?: Environment;
  /**
   * X-Admin-Key。省略時は setDebugAdminKey() で登録済みの鍵が dbgFetch 経由で付く。
   * DebugAdmin のように鍵を prop で受け取っている場合はここに渡す。
   */
  adminKey?: string;
}

function base(config: ReleaseNotesApiConfig): string {
  return config.apiBaseUrl.replace(/\/$/, '');
}

function query(config: ReleaseNotesApiConfig): string {
  return `?env=${encodeURIComponent(config.env ?? 'dev')}`;
}

function adminHeaders(config: ReleaseNotesApiConfig, json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (config.adminKey) headers['X-Admin-Key'] = config.adminKey;
  return headers;
}

/**
 * サーバが返す URL を base のオリジン基準で絶対化する。
 *
 * バックエンドはベースパス付きの絶対パス（例 `/api/__debug/release-notes/media/…`）を返す。
 * フロントと API が同一オリジンならそのままで良いが、**別オリジンに置く構成**
 * （Vite:5173 → PHP:8082 など）ではフロント側のオリジンに解決されてしまい、
 * `<img>` / `<video>` が 404 になる。JSON は読めるので API 疎通では気づけない。
 */
function absolutize(url: string, base: string): string {
  if (!url || /^https?:\/\//i.test(url)) return url;
  try {
    const here = typeof window !== 'undefined' ? window.location.href : 'http://localhost';
    return new URL(url, new URL(base, here)).toString();
  } catch {
    return url;
  }
}

function resolveNoteUrls(notes: ReleaseNote[], base: string): ReleaseNote[] {
  return notes.map((n) => ({
    ...n,
    images: n.images.map((im) => ({ ...im, url: absolutize(im.url, base) })),
  }));
}

async function parse<T>(res: Response, fallback: string): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const body = data as { success?: boolean; error?: unknown; data?: T };
  if (!res.ok || body?.success === false) {
    throw new Error(extractErrorMessage(data, `${fallback}（HTTP ${res.status}）`));
  }
  return body.data as T;
}

/**
 * 公開フィードを読む（認証なし）。
 *
 * feedUrl は tokens API が返す feedUrl をそのまま渡す。
 * トークンのスコープによって、公開済みのうち社外公開分だけ / 全件、が切り替わる。
 */
export async function fetchReleaseNotesFeed(
  feedUrl: string,
  options?: { signal?: AbortSignal },
): Promise<ReleaseNote[]> {
  const res = await fetch(feedUrl, { signal: options?.signal });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const body = data as { success?: boolean; data?: ReleaseNote[] };
  if (!res.ok || body?.success === false) {
    throw new Error(extractErrorMessage(data, '更新情報の取得に失敗しました'));
  }
  // メディアは feedUrl と同じオリジンにある
  return Array.isArray(body.data) ? resolveNoteUrls(body.data, feedUrl) : [];
}

export const releaseNotesApi = {
  /** 下書きを含む全件（管理用） */
  async list(config: ReleaseNotesApiConfig, signal?: AbortSignal): Promise<ReleaseNote[]> {
    const res = await dbgFetch(`${base(config)}/release-notes${query(config)}`, {
      headers: adminHeaders(config),
      signal,
    });
    const data = (await parse<ReleaseNote[]>(res, 'リリースノートの取得に失敗しました')) ?? [];
    return resolveNoteUrls(data, base(config));
  },

  /** 号を作成する */
  async create(config: ReleaseNotesApiConfig, input: ReleaseNoteInput): Promise<ReleaseNote> {
    const res = await dbgFetch(`${base(config)}/release-notes${query(config)}`, {
      method: 'POST',
      headers: adminHeaders(config, true),
      body: JSON.stringify(input),
    });
    return parse<ReleaseNote>(res, 'リリースノートの作成に失敗しました');
  },

  /** 号を更新する（status / is_public の切り替えもこれ） */
  async update(config: ReleaseNotesApiConfig, id: number, input: ReleaseNoteInput): Promise<ReleaseNote> {
    const res = await dbgFetch(`${base(config)}/release-notes/${id}${query(config)}`, {
      method: 'PATCH',
      headers: adminHeaders(config, true),
      body: JSON.stringify(input),
    });
    return parse<ReleaseNote>(res, 'リリースノートの更新に失敗しました');
  },

  /** 号を削除する（メディアの実体も片付けられる） */
  async remove(config: ReleaseNotesApiConfig, id: number): Promise<void> {
    const res = await dbgFetch(`${base(config)}/release-notes/${id}${query(config)}`, {
      method: 'DELETE',
      headers: adminHeaders(config),
    });
    await parse<unknown>(res, 'リリースノートの削除に失敗しました');
  },

  async addItem(config: ReleaseNotesApiConfig, noteId: number, input: ReleaseNoteItemInput): Promise<ReleaseNoteItem> {
    const res = await dbgFetch(`${base(config)}/release-notes/${noteId}/items${query(config)}`, {
      method: 'POST',
      headers: adminHeaders(config, true),
      body: JSON.stringify(input),
    });
    return parse<ReleaseNoteItem>(res, '項目の追加に失敗しました');
  },

  async updateItem(
    config: ReleaseNotesApiConfig,
    noteId: number,
    itemId: number,
    input: ReleaseNoteItemInput,
  ): Promise<ReleaseNoteItem> {
    const res = await dbgFetch(`${base(config)}/release-notes/${noteId}/items/${itemId}${query(config)}`, {
      method: 'PATCH',
      headers: adminHeaders(config, true),
      body: JSON.stringify(input),
    });
    return parse<ReleaseNoteItem>(res, '項目の更新に失敗しました');
  },

  async deleteItem(config: ReleaseNotesApiConfig, noteId: number, itemId: number): Promise<void> {
    const res = await dbgFetch(`${base(config)}/release-notes/${noteId}/items/${itemId}${query(config)}`, {
      method: 'DELETE',
      headers: adminHeaders(config),
    });
    await parse<unknown>(res, '項目の削除に失敗しました');
  },

  /**
   * メディアを添付する。itemId を省くと号全体の代表メディアになる。
   *
   * Content-Type は File が持つものがそのまま multipart に載る。呼び出し側で
   * File を作る場合は type を必ず指定すること（application/octet-stream で飛ぶと
   * サーバ側の拡張子フォールバックに頼ることになる）。
   */
  async uploadMedia(
    config: ReleaseNotesApiConfig,
    noteId: number,
    file: File,
    options?: { itemId?: number; caption?: string },
  ): Promise<ReleaseNoteMedia> {
    const form = new FormData();
    form.append('file', file);
    if (options?.itemId !== undefined) form.append('item_id', String(options.itemId));
    if (options?.caption) form.append('caption', options.caption);

    const res = await dbgFetch(`${base(config)}/release-notes/${noteId}/images${query(config)}`, {
      method: 'POST',
      headers: adminHeaders(config), // multipart の境界は fetch に任せるので Content-Type は付けない
      body: form,
    });
    const media = await parse<ReleaseNoteMedia>(res, 'メディアの添付に失敗しました');
    return { ...media, url: absolutize(media.url, base(config)) };
  },

  async deleteMedia(config: ReleaseNotesApiConfig, noteId: number, mediaId: number): Promise<void> {
    const res = await dbgFetch(`${base(config)}/release-notes/${noteId}/images/${mediaId}${query(config)}`, {
      method: 'DELETE',
      headers: adminHeaders(config),
    });
    await parse<unknown>(res, 'メディアの削除に失敗しました');
  },

  /** 公開 URL と 2 本のトークンを取得する（未生成なら生成される） */
  async tokens(config: ReleaseNotesApiConfig, signal?: AbortSignal): Promise<ReleaseNoteTokens> {
    const res = await dbgFetch(`${base(config)}/release-notes/tokens${query(config)}`, {
      headers: adminHeaders(config),
      signal,
    });
    return resolveTokenUrls(await parse<ReleaseNoteTokens>(res, '公開 URL の取得に失敗しました'), base(config));
  },

  /** トークンを作り直す（URL が漏れたときの失効手段。既存 URL は使えなくなる） */
  async rotateToken(config: ReleaseNotesApiConfig, scope: 'public' | 'internal'): Promise<ReleaseNoteTokens> {
    const res = await dbgFetch(`${base(config)}/release-notes/tokens/rotate${query(config)}`, {
      method: 'POST',
      headers: adminHeaders(config, true),
      body: JSON.stringify({ scope }),
    });
    return resolveTokenUrls(await parse<ReleaseNoteTokens>(res, '公開 URL の再発行に失敗しました'), base(config));
  },
};

/**
 * トークンの URL も絶対化する。
 * ここで返す pageUrl はクライアントにそのまま送るものなので、相対のままでは意味を成さない。
 */
function resolveTokenUrls(tokens: ReleaseNoteTokens, apiBase: string): ReleaseNoteTokens {
  const one = (t: ReleaseNoteTokens['public']) => ({
    ...t,
    pageUrl: absolutize(t.pageUrl, apiBase),
    feedUrl: absolutize(t.feedUrl, apiBase),
  });
  return { public: one(tokens.public), internal: one(tokens.internal) };
}
