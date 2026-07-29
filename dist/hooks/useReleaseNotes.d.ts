import type { ReleaseNote } from '../types';
export interface UseReleaseNotesOptions {
    /** GET /release-notes/feed/{token} の URL */
    feedUrl: string;
    /** 未読管理のキー。同一オリジンに複数アプリを載せる場合に分ける */
    storageKey?: string;
    /** false の間は取得しない（表示前に読みたくない場合） */
    enabled?: boolean;
}
export interface UseReleaseNotesReturn {
    notes: ReleaseNote[];
    loading: boolean;
    error: string | null;
    /** 最後に見た号より新しい号の数 */
    unreadCount: number;
    /** 全部読んだことにする（バッジを消す） */
    markAllRead: () => void;
    refresh: () => void;
}
export declare function useReleaseNotes({ feedUrl, storageKey, enabled, }: UseReleaseNotesOptions): UseReleaseNotesReturn;
