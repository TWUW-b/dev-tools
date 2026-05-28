let c = "/__debug/api";
function p(e) {
  c = e.replace(/\/$/, "");
}
function $() {
  return c;
}
let w = null;
function b(e) {
  w = e;
}
async function y() {
  if (!w) return {};
  try {
    const e = await w();
    if (typeof e == "string" && e.length > 0)
      return { Authorization: `Bearer ${e}` };
  } catch {
  }
  return {};
}
function d(e, t) {
  if (!e || typeof e != "object") return t;
  const a = e.error;
  if (typeof a == "string") return a;
  if (a && typeof a == "object") {
    const n = a.message;
    if (typeof n == "string" && n.length > 0) return n;
  }
  const s = e.message;
  return typeof s == "string" && s.length > 0 ? s : t;
}
async function o(e, t) {
  const a = await y(), s = {
    ...t || {},
    headers: {
      ...(t == null ? void 0 : t.headers) || {},
      ...a
    }
  };
  return fetch(e, s);
}
async function i(e) {
  const t = await e.text();
  let a;
  try {
    a = JSON.parse(t);
  } catch {
    throw e.ok ? new Error("Invalid JSON response") : new Error(`HTTP ${e.status}: ${t.slice(0, 200)}`);
  }
  if (!e.ok)
    throw new Error(d(a, `HTTP ${e.status}`));
  return a;
}
const m = {
  /**
   * ノート一覧を取得
   */
  async getNotes(e) {
    const t = new URLSearchParams({
      env: e.env,
      status: e.status || "",
      q: e.q || "",
      includeDeleted: e.includeDeleted ? "1" : "0"
    }), a = await o(`${c}/notes?${t}`, {
      signal: e.signal
    }), s = await i(a);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch notes");
    return s.data || [];
  },
  /**
   * ノート詳細を取得
   */
  async getNote(e, t) {
    const a = await o(`${c}/notes/${t}?env=${e}`), s = await i(a);
    if (!s.success || !s.note)
      throw new Error(s.error || "Failed to fetch note");
    return s.note;
  },
  /**
   * ノートを作成
   */
  async createNote(e, t) {
    const a = await o(`${c}/notes?env=${e}`, {
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
    }), s = await i(a);
    if (!s.success || !s.note)
      throw new Error(s.error || "Failed to create note");
    return s.note;
  },
  /**
   * ノートのステータスを更新
   */
  async updateStatus(e, t, a, s) {
    const n = await o(`${c}/notes/${t}/status?env=${e}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: a, ...s })
    }), r = await i(n);
    if (!r.success)
      throw new Error(r.error || "Failed to update status");
  },
  /**
   * ノートの重要度を更新
   */
  async updateSeverity(e, t, a) {
    const s = await o(`${c}/notes/${t}/severity?env=${e}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ severity: a })
    }), n = await i(s);
    if (!n.success)
      throw new Error(n.error || "Failed to update severity");
  },
  /**
   * ノートを削除（論理削除）
   */
  async deleteNote(e, t) {
    const a = await o(`${c}/notes/${t}?env=${e}`, {
      method: "DELETE"
    }), s = await i(a);
    if (!s.success)
      throw new Error(s.error || "Failed to delete note");
  },
  /**
   * テストケースインポート
   */
  async importTestCases(e) {
    const t = await o(`${c}/test-cases/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cases: e })
    }), a = await i(t);
    if (!a.success)
      throw new Error(a.error || "Failed to import test cases");
    return { total: a.total };
  },
  /**
   * テストツリー取得
   */
  async getTestTree(e) {
    const t = await o(`${c}/test-cases/tree?env=${e}`), a = await i(t);
    if (!a.success)
      throw new Error(a.error || "Failed to fetch test tree");
    return a.data;
  },
  /**
   * テスト実行結果一括送信
   */
  async submitTestRuns(e, t, a) {
    const s = await o(`${c}/test-runs?env=${e}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runs: t, failNote: a })
    }), n = await i(s);
    if (!n.success)
      throw new Error(n.error || "Failed to submit test runs");
    return {
      results: n.results,
      capability: n.capability
    };
  },
  /**
   * 画像アップロード
   */
  async uploadAttachment(e, t, a) {
    const s = new FormData();
    s.append("file", a);
    const n = await o(`${c}/notes/${t}/attachments?env=${e}`, {
      method: "POST",
      body: s
    }), r = await i(n);
    if (!r.success || !r.attachment)
      throw new Error(r.error || "Failed to upload attachment");
    return r.attachment;
  },
  /**
   * 添付一覧取得
   */
  async getAttachments(e, t) {
    const a = await o(`${c}/notes/${t}/attachments?env=${e}`), s = await i(a);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch attachments");
    return s.attachments;
  },
  /**
   * 添付削除
   */
  async deleteAttachment(e, t, a) {
    const s = await o(`${c}/notes/${t}/attachments/${a}?env=${e}`, {
      method: "DELETE"
    }), n = await i(s);
    if (!n.success)
      throw new Error(n.error || "Failed to delete attachment");
  },
  /**
   * アクティビティ一覧取得
   */
  async getActivities(e, t) {
    const a = await o(`${c}/notes/${t}/activities?env=${e}`), s = await i(a);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch activities");
    return s.activities;
  },
  /**
   * コメント追加
   */
  async addActivity(e, t, a) {
    const s = await o(`${c}/notes/${t}/activities?env=${e}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a)
    }), n = await i(s);
    if (!n.success || !n.activity)
      throw new Error(n.error || "Failed to add activity");
    return n.activity;
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
async function g({ apiBaseUrl: e, body: t, signal: a }) {
  const s = l(e), r = await (await o(`${s}/feedbacks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t),
    signal: a
  })).json();
  if (!r.success)
    throw new Error(d(r, "Failed to submit feedback"));
  return r.data;
}
async function E(e) {
  const t = l(e.apiBaseUrl), a = new URLSearchParams(e.query ?? {}).toString(), s = `${t}/feedbacks${a ? "?" + a : ""}`, r = await (await o(s, {
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!r.success)
    throw new Error(d(r, "Failed to fetch feedbacks"));
  return r;
}
async function v(e) {
  const t = l(e.apiBaseUrl), s = await (await o(`${t}/feedbacks/${e.id}`, {
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to fetch feedback"));
  return s.data;
}
async function k(e) {
  const t = l(e.apiBaseUrl), s = await (await o(`${t}/feedbacks/${e.id}/status`, {
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
async function F(e) {
  const t = l(e.apiBaseUrl), s = await (await o(`${t}/feedbacks/${e.id}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to delete feedback"));
}
async function T(e) {
  const t = l(e.apiBaseUrl), a = new FormData();
  a.append("file", e.file);
  const n = await (await o(`${t}/feedbacks/${e.feedbackId}/attachments`, {
    method: "POST",
    body: a
  })).json();
  if (!n.success || !n.attachment)
    throw new Error(d(n, "Failed to upload attachment"));
  return n.attachment;
}
async function j(e) {
  const t = l(e.apiBaseUrl), s = await (await o(`${t}/feedbacks/${e.feedbackId}/attachments/${e.attachmentId}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!s.success)
    throw new Error(d(s, "Failed to delete attachment"));
}
async function A(e) {
  var h, f;
  const a = `${l(e.apiBaseUrl)}/feedbacks/export/${e.format}`, s = await o(a, {
    headers: { "X-Admin-Key": e.adminKey }
  });
  if (!s.ok)
    throw new Error(`Export failed: ${s.status}`);
  const n = await s.blob(), r = ((f = (h = s.headers.get("Content-Disposition")) == null ? void 0 : h.match(/filename="?([^"]+)"?/)) == null ? void 0 : f[1]) ?? `feedbacks-export.${e.format}`, u = document.createElement("a");
  u.href = URL.createObjectURL(n), u.download = r, document.body.appendChild(u), u.click(), document.body.removeChild(u), URL.revokeObjectURL(u.href);
}
export {
  p as a,
  m as b,
  T as c,
  F as d,
  v as e,
  j as f,
  E as g,
  A as h,
  $ as i,
  g as p,
  b as s,
  k as u
};
