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

export function parseAdminDeepLink(search: string): AdminDeepLink | null {
  const params = new URLSearchParams(search);
  for (const type of ['note', 'feedback'] as const) {
    const raw = params.get(type);
    if (raw !== null && /^[1-9]\d*$/.test(raw)) {
      return { type, id: Number(raw) };
    }
  }
  return null;
}

export function readAdminDeepLink(): AdminDeepLink | null {
  if (typeof window === 'undefined') return null;
  return parseAdminDeepLink(window.location.search);
}
