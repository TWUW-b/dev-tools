let c = "/__debug/api";
function p(e) {
  c = e.replace(/\/$/, "");
}
function b() {
  return c;
}
let h = null;
function $(e) {
  h = e;
}
let w = null;
function g(e) {
  if (e == null) {
    w = null;
    return;
  }
  w = typeof e == "function" ? e : () => e;
}
async function m() {
  const e = {};
  if (h)
    try {
      const t = await h();
      typeof t == "string" && t.length > 0 && (e.Authorization = `Bearer ${t}`);
    } catch {
    }
  if (w)
    try {
      const t = await w();
      typeof t == "string" && t.length > 0 && (e["X-Admin-Key"] = t);
    } catch {
    }
  return e;
}
function d(e, t) {
  if (!e || typeof e != "object") return t;
  const n = e.error;
  if (typeof n == "string") return n;
  if (n && typeof n == "object") {
    const a = n.message;
    if (typeof a == "string" && a.length > 0) return a;
  }
  const s = e.message;
  return typeof s == "string" && s.length > 0 ? s : t;
}
async function r(e, t) {
  const n = await m(), s = {
    ...t || {},
    headers: {
      ...(t == null ? void 0 : t.headers) || {},
      ...n
    }
  };
  return fetch(e, s);
}
async function i(e) {
  const t = await e.text();
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    throw e.ok ? new Error("Invalid JSON response") : new Error(`HTTP ${e.status}: ${t.slice(0, 200)}`);
  }
  if (!e.ok)
    throw new Error(d(n, `HTTP ${e.status}`));
  return n;
}
const E = {
  /**
   * ノート一覧を取得
   */
  async getNotes(e) {
    const t = new URLSearchParams({
      env: e.env,
      status: e.status || "",
      q: e.q || "",
      includeDeleted: e.includeDeleted ? "1" : "0"
    }), n = await r(`${c}/notes?${t}`, {
      signal: e.signal
    }), s = await i(n);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch notes");
    return s.data || [];
  },
  /**
   * ノート詳細を取得
   */
  async getNote(e, t) {
    const n = await r(`${c}/notes/${t}?env=${e}`), s = await i(n);
    if (!s.success || !s.note)
      throw new Error(s.error || "Failed to fetch note");
    return s.note;
  },
  /**
   * ノートを作成
   */
  async createNote(e, t) {
    const n = await r(`${c}/notes?env=${e}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: t.title || null,
        content: t.content,
        userLog: t.userLog || null,
        severity: t.severity || null,
        status: t.status || "open",
        route: t.route || (typeof window < "u" ? window.location.pathname + window.location.search + window.location.hash : ""),
        screenName: t.screenName || (typeof document < "u" ? document.title : ""),
        consoleLogs: t.consoleLogs || null,
        networkLogs: t.networkLogs || null,
        environment: t.environment || null,
        source: t.source || null,
        testCaseIds: t.testCaseIds ?? null
      })
    }), s = await i(n);
    if (!s.success || !s.note)
      throw new Error(s.error || "Failed to create note");
    return s.note;
  },
  /**
   * ノートのステータスを更新
   */
  async updateStatus(e, t, n, s) {
    const a = await r(`${c}/notes/${t}/status?env=${e}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: n, ...s })
    }), o = await i(a);
    if (!o.success)
      throw new Error(o.error || "Failed to update status");
  },
  /**
   * ノートの重要度を更新
   */
  async updateSeverity(e, t, n) {
    const s = await r(`${c}/notes/${t}/severity?env=${e}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ severity: n })
    }), a = await i(s);
    if (!a.success)
      throw new Error(a.error || "Failed to update severity");
  },
  /**
   * ノートを削除（論理削除）
   */
  async deleteNote(e, t) {
    const n = await r(`${c}/notes/${t}?env=${e}`, {
      method: "DELETE"
    }), s = await i(n);
    if (!s.success)
      throw new Error(s.error || "Failed to delete note");
  },
  /**
   * テストケースインポート
   */
  async importTestCases(e) {
    const t = await r(`${c}/test-cases/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cases: e })
    }), n = await i(t);
    if (!n.success)
      throw new Error(n.error || "Failed to import test cases");
    return { total: n.total };
  },
  /**
   * テストツリー取得
   */
  async getTestTree(e) {
    const t = await r(`${c}/test-cases/tree?env=${e}`), n = await i(t);
    if (!n.success)
      throw new Error(n.error || "Failed to fetch test tree");
    return n.data;
  },
  /**
   * テスト実行結果一括送信
   */
  async submitTestRuns(e, t, n) {
    const s = n ? {
      ...n,
      route: n.route || (typeof window < "u" ? window.location.pathname + window.location.search + window.location.hash : ""),
      screen_name: n.screenName || (typeof document < "u" ? document.title : "")
    } : void 0, a = await r(`${c}/test-runs?env=${e}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runs: t, failNote: s })
    }), o = await i(a);
    if (!o.success)
      throw new Error(o.error || "Failed to submit test runs");
    return {
      results: o.results,
      capability: o.capability
    };
  },
  /**
   * 画像アップロード
   */
  async uploadAttachment(e, t, n) {
    const s = new FormData();
    s.append("file", n);
    const a = await r(`${c}/notes/${t}/attachments?env=${e}`, {
      method: "POST",
      body: s
    }), o = await i(a);
    if (!o.success || !o.attachment)
      throw new Error(o.error || "Failed to upload attachment");
    return o.attachment;
  },
  /**
   * 添付一覧取得
   */
  async getAttachments(e, t) {
    const n = await r(`${c}/notes/${t}/attachments?env=${e}`), s = await i(n);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch attachments");
    return s.attachments;
  },
  /**
   * 添付削除
   */
  async deleteAttachment(e, t, n) {
    const s = await r(`${c}/notes/${t}/attachments/${n}?env=${e}`, {
      method: "DELETE"
    }), a = await i(s);
    if (!a.success)
      throw new Error(a.error || "Failed to delete attachment");
  },
  /**
   * アクティビティ一覧取得
   */
  async getActivities(e, t) {
    const n = await r(`${c}/notes/${t}/activities?env=${e}`), s = await i(n);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch activities");
    return s.activities;
  },
  /**
   * コメント追加
   */
  async addActivity(e, t, n) {
    const s = await r(`${c}/notes/${t}/activities?env=${e}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n)
    }), a = await i(s);
    if (!a.success || !a.activity)
      throw new Error(a.error || "Failed to add activity");
    return a.activity;
  },
  /**
   * 添付ファイルURL取得（同期）
   */
  getAttachmentUrl(e) {
    return `${c}/attachments/${e}`;
  }
};
function l(e) {
  if (e.startsWith("/"))
    return e.replace(/\/$/, "");
  const t = new URL(e);
  if (!["http:", "https:"].includes(t.protocol))
    throw new Error(`Invalid API base URL protocol: ${t.protocol}`);
  return t.origin + t.pathname.replace(/\/$/, "");
}
async function v({ apiBaseUrl: e, body: t, signal: n }) {
  const s = l(e), o = await (await r(`${s}/feedbacks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t),
    signal: n
  })).json();
  if (!o.success)
    throw new Error(d(o, "Failed to submit feedback"));
  return o.data;
}
async function F(e) {
  const t = l(e.apiBaseUrl), n = new URLSearchParams(e.query ?? {}).toString(), s = `${t}/feedbacks${n ? "?" + n : ""}`, o = await (await r(s, {
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!o.success)
    throw new Error(d(o, "Failed to fetch feedbacks"));
  return o;
}
async function T(e) {
  const t = l(e.apiBaseUrl), s = await (await r(`${t}/feedbacks/${e.id}`, {
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to fetch feedback"));
  return s.data;
}
async function k(e) {
  const t = l(e.apiBaseUrl), s = await (await r(`${t}/feedbacks/${e.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": e.adminKey
    },
    body: JSON.stringify({ status: e.status }),
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to update status"));
  return s.data;
}
async function j(e) {
  const t = l(e.apiBaseUrl), s = await (await r(`${t}/feedbacks/${e.id}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to delete feedback"));
}
async function A(e) {
  const t = l(e.apiBaseUrl), n = new FormData();
  n.append("file", e.file);
  const a = await (await r(`${t}/feedbacks/${e.feedbackId}/attachments`, {
    method: "POST",
    body: n
  })).json();
  if (!a.success || !a.attachment)
    throw new Error(d(a, "Failed to upload attachment"));
  return a.attachment;
}
async function S(e) {
  const t = l(e.apiBaseUrl), s = await (await r(`${t}/feedbacks/${e.feedbackId}/attachments/${e.attachmentId}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to delete attachment"));
}
async function U(e) {
  var f, y;
  const n = `${l(e.apiBaseUrl)}/feedbacks/export/${e.format}`, s = await r(n, {
    headers: { "X-Admin-Key": e.adminKey }
  });
  if (!s.ok)
    throw new Error(`Export failed: ${s.status}`);
  const a = await s.blob(), o = ((y = (f = s.headers.get("Content-Disposition")) == null ? void 0 : f.match(/filename="?([^"]+)"?/)) == null ? void 0 : y[1]) ?? `feedbacks-export.${e.format}`, u = document.createElement("a");
  u.href = URL.createObjectURL(a), u.download = o, document.body.appendChild(u), u.click(), document.body.removeChild(u), URL.revokeObjectURL(u.href);
}
export {
  g as a,
  p as b,
  E as c,
  r as d,
  d as e,
  j as f,
  F as g,
  T as h,
  S as i,
  U as j,
  b as k,
  A as l,
  v as p,
  $ as s,
  k as u
};
