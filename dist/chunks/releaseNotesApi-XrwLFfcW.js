import { e as m, d } from "./feedbackApi-BAwJP8AU.js";
function n(e) {
  return e.apiBaseUrl.replace(/\/$/, "");
}
function l(e) {
  return `?env=${encodeURIComponent(e.env ?? "dev")}`;
}
function u(e, r = !1) {
  const t = {};
  return r && (t["Content-Type"] = "application/json"), e.adminKey && (t["X-Admin-Key"] = e.adminKey), t;
}
function $(e, r) {
  if (!e || /^https?:\/\//i.test(e)) return e;
  try {
    const t = typeof window < "u" ? window.location.href : "http://localhost";
    return new URL(e, new URL(r, t)).toString();
  } catch {
    return e;
  }
}
function y(e, r) {
  return e.map((t) => ({
    ...t,
    images: t.images.map((a) => ({ ...a, url: $(a.url, r) }))
  }));
}
async function c(e, r) {
  const t = await e.text();
  let a;
  try {
    a = JSON.parse(t);
  } catch {
    throw new Error(`HTTP ${e.status}: ${t.slice(0, 200)}`);
  }
  const s = a;
  if (!e.ok || (s == null ? void 0 : s.success) === !1)
    throw new Error(m(a, `${r}（HTTP ${e.status}）`));
  return s.data;
}
async function o(e, r) {
  const t = await fetch(e, { signal: r == null ? void 0 : r.signal }), a = await t.text();
  let s;
  try {
    s = JSON.parse(a);
  } catch {
    throw new Error(`HTTP ${t.status}: ${a.slice(0, 200)}`);
  }
  const i = s;
  if (!t.ok || (i == null ? void 0 : i.success) === !1)
    throw new Error(m(s, "更新情報の取得に失敗しました"));
  return Array.isArray(i.data) ? y(i.data, e) : [];
}
const E = {
  /** 下書きを含む全件（管理用） */
  async list(e, r) {
    const t = await d(`${n(e)}/release-notes${l(e)}`, {
      headers: u(e),
      signal: r
    }), a = await c(t, "リリースノートの取得に失敗しました") ?? [];
    return y(a, n(e));
  },
  /** 号を作成する */
  async create(e, r) {
    const t = await d(`${n(e)}/release-notes${l(e)}`, {
      method: "POST",
      headers: u(e, !0),
      body: JSON.stringify(r)
    });
    return c(t, "リリースノートの作成に失敗しました");
  },
  /** 号を更新する（status / is_public の切り替えもこれ） */
  async update(e, r, t) {
    const a = await d(`${n(e)}/release-notes/${r}${l(e)}`, {
      method: "PATCH",
      headers: u(e, !0),
      body: JSON.stringify(t)
    });
    return c(a, "リリースノートの更新に失敗しました");
  },
  /** 号を削除する（メディアの実体も片付けられる） */
  async remove(e, r) {
    const t = await d(`${n(e)}/release-notes/${r}${l(e)}`, {
      method: "DELETE",
      headers: u(e)
    });
    await c(t, "リリースノートの削除に失敗しました");
  },
  async addItem(e, r, t) {
    const a = await d(`${n(e)}/release-notes/${r}/items${l(e)}`, {
      method: "POST",
      headers: u(e, !0),
      body: JSON.stringify(t)
    });
    return c(a, "項目の追加に失敗しました");
  },
  async updateItem(e, r, t, a) {
    const s = await d(`${n(e)}/release-notes/${r}/items/${t}${l(e)}`, {
      method: "PATCH",
      headers: u(e, !0),
      body: JSON.stringify(a)
    });
    return c(s, "項目の更新に失敗しました");
  },
  async deleteItem(e, r, t) {
    const a = await d(`${n(e)}/release-notes/${r}/items/${t}${l(e)}`, {
      method: "DELETE",
      headers: u(e)
    });
    await c(a, "項目の削除に失敗しました");
  },
  /**
   * メディアを添付する。itemId を省くと号全体の代表メディアになる。
   *
   * Content-Type は File が持つものがそのまま multipart に載る。呼び出し側で
   * File を作る場合は type を必ず指定すること（application/octet-stream で飛ぶと
   * サーバ側の拡張子フォールバックに頼ることになる）。
   */
  async uploadMedia(e, r, t, a) {
    const s = new FormData();
    s.append("file", t), (a == null ? void 0 : a.itemId) !== void 0 && s.append("item_id", String(a.itemId)), a != null && a.caption && s.append("caption", a.caption), a != null && a.kind && s.append("kind", a.kind), a != null && a.alt && s.append("alt", a.alt), a != null && a.description && s.append("description", a.description);
    const i = await d(`${n(e)}/release-notes/${r}/images${l(e)}`, {
      method: "POST",
      headers: u(e),
      // multipart の境界は fetch に任せるので Content-Type は付けない
      body: s
    }), h = await c(i, "メディアの添付に失敗しました");
    return { ...h, url: $(h.url, n(e)) };
  },
  /** メディアの説明・役割・紐付け先・並びを直す（ファイルと URL はそのまま） */
  async updateMedia(e, r, t, a) {
    const s = await d(`${n(e)}/release-notes/${r}/images/${t}${l(e)}`, {
      method: "PATCH",
      headers: u(e, !0),
      body: JSON.stringify(a)
    }), i = await c(s, "メディアの更新に失敗しました");
    return { ...i, url: $(i.url, n(e)) };
  },
  async deleteMedia(e, r, t) {
    const a = await d(`${n(e)}/release-notes/${r}/images/${t}${l(e)}`, {
      method: "DELETE",
      headers: u(e)
    });
    await c(a, "メディアの削除に失敗しました");
  },
  /** 公開 URL と 2 本のトークンを取得する（未生成なら生成される） */
  async tokens(e, r) {
    const t = await d(`${n(e)}/release-notes/tokens${l(e)}`, {
      headers: u(e),
      signal: r
    });
    return w(await c(t, "公開 URL の取得に失敗しました"), n(e));
  },
  /** トークンを作り直す（URL が漏れたときの失効手段。既存 URL は使えなくなる） */
  async rotateToken(e, r) {
    const t = await d(`${n(e)}/release-notes/tokens/rotate${l(e)}`, {
      method: "POST",
      headers: u(e, !0),
      body: JSON.stringify({ scope: r })
    });
    return w(await c(t, "公開 URL の再発行に失敗しました"), n(e));
  }
};
function w(e, r) {
  const t = (a) => ({
    ...a,
    pageUrl: $(a.pageUrl, r),
    feedUrl: $(a.feedUrl, r)
  });
  return { public: t(e.public), internal: t(e.internal) };
}
export {
  o as f,
  E as r
};
