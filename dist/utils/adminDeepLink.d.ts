/**
 * 管理画面を「特定の報告を開いた状態」で開くための URL パラメータ（R-010）。
 *
 * リリースノートの各変更から、元になった feedback / note へアプリ内で飛べるようにするためのもの。
 * リンク先の URL は API の config（release_notes_source_urls）でホストアプリが決める。
 *   ?note=12      … DebugAdmin でノート #12 の詳細を開く
 *   ?feedback=24  … DebugAdmin のフィードバックタブ / FeedbackAdmin でフィードバック #24 を開く
 */
export interface AdminDeepLink {
    type: 'note' | 'feedback';
    id: number;
}
export declare function parseAdminDeepLink(search: string): AdminDeepLink | null;
export declare function readAdminDeepLink(): AdminDeepLink | null;
