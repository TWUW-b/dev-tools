import type { ReleaseNote, ReleaseNoteInput, ReleaseNoteItem, ReleaseNoteItemInput, ReleaseNoteMedia, ReleaseNoteTokens, Environment } from '../types';
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
/**
 * 公開フィードを読む（認証なし）。
 *
 * feedUrl は tokens API が返す feedUrl をそのまま渡す。
 * トークンのスコープによって、公開済みのうち社外公開分だけ / 全件、が切り替わる。
 */
export declare function fetchReleaseNotesFeed(feedUrl: string, options?: {
    signal?: AbortSignal;
}): Promise<ReleaseNote[]>;
export declare const releaseNotesApi: {
    /** 下書きを含む全件（管理用） */
    list(config: ReleaseNotesApiConfig, signal?: AbortSignal): Promise<ReleaseNote[]>;
    /** 号を作成する */
    create(config: ReleaseNotesApiConfig, input: ReleaseNoteInput): Promise<ReleaseNote>;
    /** 号を更新する（status / is_public の切り替えもこれ） */
    update(config: ReleaseNotesApiConfig, id: number, input: ReleaseNoteInput): Promise<ReleaseNote>;
    /** 号を削除する（メディアの実体も片付けられる） */
    remove(config: ReleaseNotesApiConfig, id: number): Promise<void>;
    addItem(config: ReleaseNotesApiConfig, noteId: number, input: ReleaseNoteItemInput): Promise<ReleaseNoteItem>;
    updateItem(config: ReleaseNotesApiConfig, noteId: number, itemId: number, input: ReleaseNoteItemInput): Promise<ReleaseNoteItem>;
    deleteItem(config: ReleaseNotesApiConfig, noteId: number, itemId: number): Promise<void>;
    /**
     * メディアを添付する。itemId を省くと号全体の代表メディアになる。
     *
     * Content-Type は File が持つものがそのまま multipart に載る。呼び出し側で
     * File を作る場合は type を必ず指定すること（application/octet-stream で飛ぶと
     * サーバ側の拡張子フォールバックに頼ることになる）。
     */
    uploadMedia(config: ReleaseNotesApiConfig, noteId: number, file: File, options?: {
        itemId?: number;
        caption?: string;
    }): Promise<ReleaseNoteMedia>;
    deleteMedia(config: ReleaseNotesApiConfig, noteId: number, mediaId: number): Promise<void>;
    /** 公開 URL と 2 本のトークンを取得する（未生成なら生成される） */
    tokens(config: ReleaseNotesApiConfig, signal?: AbortSignal): Promise<ReleaseNoteTokens>;
    /** トークンを作り直す（URL が漏れたときの失効手段。既存 URL は使えなくなる） */
    rotateToken(config: ReleaseNotesApiConfig, scope: "public" | "internal"): Promise<ReleaseNoteTokens>;
};
