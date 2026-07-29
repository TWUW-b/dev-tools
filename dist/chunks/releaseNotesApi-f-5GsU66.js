import { e as w, d } from "./feedbackApi-B81GxfJ2.js";
function n(e) {
  return e.apiBaseUrl.replace(/\/$/, "");
}
function i(e) {
  return `?env=${encodeURIComponent(e.env ?? "dev")}`;
}
function o(e, a = !1) {
  const t = {};
  return a && (t["Content-Type"] = "application/json"), e.adminKey && (t["X-Admin-Key"] = e.adminKey), t;
}
function u(e, a) {
  if (!e || /^https?:\/\//i.test(e)) return e;
  try {
    const t = typeof window < "u" ? window.location.href : "http://localhost";
    return new URL(e, new URL(a, t)).toString();
  } catch {
    return e;
  }
}
function m(e, a) {
  return e.map((t) => ({
    ...t,
    images: t.images.map((r) => ({ ...r, url: u(r.url, a) }))
  }));
}
async function l(e, a) {
  const t = await e.text();
  let r;
  try {
    r = JSON.parse(t);
  } catch {
    throw new Error(`HTTP ${e.status}: ${t.slice(0, 200)}`);
  }
  const s = r;
  if (!e.ok || (s == null ? void 0 : s.success) === !1)
    throw new Error(w(r, `${a}（HTTP ${e.status}）`));
  return s.data;
}
async function T(e, a) {
  const t = await fetch(e, { signal: a == null ? void 0 : a.signal }), r = await t.text();
  let s;
  try {
    s = JSON.parse(r);
  } catch {
    throw new Error(`HTTP ${t.status}: ${r.slice(0, 200)}`);
  }
  const c = s;
  if (!t.ok || (c == null ? void 0 : c.success) === !1)
    throw new Error(w(s, "更新情報の取得に失敗しました"));
  return Array.isArray(c.data) ? m(c.data, e) : [];
}
const p = {
  /** 下書きを含む全件（管理用） */
  async list(e, a) {
    const t = await d(`${n(e)}/release-notes${i(e)}`, {
      headers: o(e),
      signal: a
    }), r = await l(t, "リリースノートの取得に失敗しました") ?? [];
    return m(r, n(e));
  },
  /** 号を作成する */
  async create(e, a) {
    const t = await d(`${n(e)}/release-notes${i(e)}`, {
      method: "POST",
      headers: o(e, !0),
      body: JSON.stringify(a)
    });
    return l(t, "リリースノートの作成に失敗しました");
  },
  /** 号を更新する（status / is_public の切り替えもこれ） */
  async update(e, a, t) {
    const r = await d(`${n(e)}/release-notes/${a}${i(e)}`, {
      method: "PATCH",
      headers: o(e, !0),
      body: JSON.stringify(t)
    });
    return l(r, "リリースノートの更新に失敗しました");
  },
  /** 号を削除する（メディアの実体も片付けられる） */
  async remove(e, a) {
    const t = await d(`${n(e)}/release-notes/${a}${i(e)}`, {
      method: "DELETE",
      headers: o(e)
    });
    await l(t, "リリースノートの削除に失敗しました");
  },
  async addItem(e, a, t) {
    const r = await d(`${n(e)}/release-notes/${a}/items${i(e)}`, {
      method: "POST",
      headers: o(e, !0),
      body: JSON.stringify(t)
    });
    return l(r, "項目の追加に失敗しました");
  },
  async updateItem(e, a, t, r) {
    const s = await d(`${n(e)}/release-notes/${a}/items/${t}${i(e)}`, {
      method: "PATCH",
      headers: o(e, !0),
      body: JSON.stringify(r)
    });
    return l(s, "項目の更新に失敗しました");
  },
  async deleteItem(e, a, t) {
    const r = await d(`${n(e)}/release-notes/${a}/items/${t}${i(e)}`, {
      method: "DELETE",
      headers: o(e)
    });
    await l(r, "項目の削除に失敗しました");
  },
  /**
   * メディアを添付する。itemId を省くと号全体の代表メディアになる。
   *
   * Content-Type は File が持つものがそのまま multipart に載る。呼び出し側で
   * File を作る場合は type を必ず指定すること（application/octet-stream で飛ぶと
   * サーバ側の拡張子フォールバックに頼ることになる）。
   */
  async uploadMedia(e, a, t, r) {
    const s = new FormData();
    s.append("file", t), (r == null ? void 0 : r.itemId) !== void 0 && s.append("item_id", String(r.itemId)), r != null && r.caption && s.append("caption", r.caption);
    const c = await d(`${n(e)}/release-notes/${a}/images${i(e)}`, {
      method: "POST",
      headers: o(e),
      // multipart の境界は fetch に任せるので Content-Type は付けない
      body: s
    }), $ = await l(c, "メディアの添付に失敗しました");
    return { ...$, url: u($.url, n(e)) };
  },
  async deleteMedia(e, a, t) {
    const r = await d(`${n(e)}/release-notes/${a}/images/${t}${i(e)}`, {
      method: "DELETE",
      headers: o(e)
    });
    await l(r, "メディアの削除に失敗しました");
  },
  /** 公開 URL と 2 本のトークンを取得する（未生成なら生成される） */
  async tokens(e, a) {
    const t = await d(`${n(e)}/release-notes/tokens${i(e)}`, {
      headers: o(e),
      signal: a
    });
    return h(await l(t, "公開 URL の取得に失敗しました"), n(e));
  },
  /** トークンを作り直す（URL が漏れたときの失効手段。既存 URL は使えなくなる） */
  async rotateToken(e, a) {
    const t = await d(`${n(e)}/release-notes/tokens/rotate${i(e)}`, {
      method: "POST",
      headers: o(e, !0),
      body: JSON.stringify({ scope: a })
    });
    return h(await l(t, "公開 URL の再発行に失敗しました"), n(e));
  }
};
function h(e, a) {
  const t = (r) => ({
    ...r,
    pageUrl: u(r.pageUrl, a),
    feedUrl: u(r.feedUrl, a)
  });
  return { public: t(e.public), internal: t(e.internal) };
}
export {
  T as f,
  p as r
};
