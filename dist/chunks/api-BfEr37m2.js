let n = "/__debug/api";
function i(t) {
  n = t.replace(/\/$/, "");
}
function d() {
  return n;
}
async function o(t) {
  const e = await t.text();
  let s;
  try {
    s = JSON.parse(e);
  } catch {
    throw t.ok ? new Error("Invalid JSON response") : new Error(`HTTP ${t.status}: ${e.slice(0, 200)}`);
  }
  if (!t.ok) {
    const a = s.error || `HTTP ${t.status}`;
    throw new Error(String(a));
  }
  return s;
}
const w = {
  /**
   * ノート一覧を取得
   */
  async getNotes(t) {
    const e = new URLSearchParams({
      env: t.env,
      status: t.status || "",
      q: t.q || "",
      includeDeleted: t.includeDeleted ? "1" : "0"
    }), s = await fetch(`${n}/notes?${e}`, {
      signal: t.signal
    }), a = await o(s);
    if (!a.success)
      throw new Error(a.error || "Failed to fetch notes");
    return a.data || [];
  },
  /**
   * ノート詳細を取得
   */
  async getNote(t, e) {
    const s = await fetch(`${n}/notes/${e}?env=${t}`), a = await o(s);
    if (!a.success || !a.note)
      throw new Error(a.error || "Failed to fetch note");
    return a.note;
  },
  /**
   * ノートを作成
   */
  async createNote(t, e) {
    const s = await fetch(`${n}/notes?env=${t}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: e.title || null,
        content: e.content,
        userLog: e.userLog || null,
        severity: e.severity || null,
        status: e.status || "open",
        route: e.route || (typeof window < "u" ? window.location.pathname + window.location.search + window.location.hash : ""),
        screenName: e.screenName || (typeof document < "u" ? document.title : ""),
        consoleLogs: e.consoleLogs || null,
        networkLogs: e.networkLogs || null,
        environment: e.environment || null,
        source: e.source || null,
        testCaseIds: e.testCaseIds ?? null
      })
    }), a = await o(s);
    if (!a.success || !a.note)
      throw new Error(a.error || "Failed to create note");
    return a.note;
  },
  /**
   * ノートのステータスを更新
   */
  async updateStatus(t, e, s, a) {
    const r = await fetch(`${n}/notes/${e}/status?env=${t}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s, ...a })
    }), c = await o(r);
    if (!c.success)
      throw new Error(c.error || "Failed to update status");
  },
  /**
   * ノートの重要度を更新
   */
  async updateSeverity(t, e, s) {
    const a = await fetch(`${n}/notes/${e}/severity?env=${t}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ severity: s })
    }), r = await o(a);
    if (!r.success)
      throw new Error(r.error || "Failed to update severity");
  },
  /**
   * ノートを削除（論理削除）
   */
  async deleteNote(t, e) {
    const s = await fetch(`${n}/notes/${e}?env=${t}`, {
      method: "DELETE"
    }), a = await o(s);
    if (!a.success)
      throw new Error(a.error || "Failed to delete note");
  },
  /**
   * テストケースインポート
   */
  async importTestCases(t) {
    const e = await fetch(`${n}/test-cases/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cases: t })
    }), s = await o(e);
    if (!s.success)
      throw new Error(s.error || "Failed to import test cases");
    return { total: s.total };
  },
  /**
   * テストツリー取得
   */
  async getTestTree(t) {
    const e = await fetch(`${n}/test-cases/tree?env=${t}`), s = await o(e);
    if (!s.success)
      throw new Error(s.error || "Failed to fetch test tree");
    return s.data;
  },
  /**
   * テスト実行結果一括送信
   */
  async submitTestRuns(t, e, s) {
    const a = await fetch(`${n}/test-runs?env=${t}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runs: e, failNote: s })
    }), r = await o(a);
    if (!r.success)
      throw new Error(r.error || "Failed to submit test runs");
    return {
      results: r.results,
      capability: r.capability
    };
  },
  /**
   * 画像アップロード
   */
  async uploadAttachment(t, e, s) {
    const a = new FormData();
    a.append("file", s);
    const r = await fetch(`${n}/notes/${e}/attachments?env=${t}`, {
      method: "POST",
      body: a
    }), c = await o(r);
    if (!c.success || !c.attachment)
      throw new Error(c.error || "Failed to upload attachment");
    return c.attachment;
  },
  /**
   * 添付一覧取得
   */
  async getAttachments(t, e) {
    const s = await fetch(`${n}/notes/${e}/attachments?env=${t}`), a = await o(s);
    if (!a.success)
      throw new Error(a.error || "Failed to fetch attachments");
    return a.attachments;
  },
  /**
   * 添付削除
   */
  async deleteAttachment(t, e, s) {
    const a = await fetch(`${n}/notes/${e}/attachments/${s}?env=${t}`, {
      method: "DELETE"
    }), r = await o(a);
    if (!r.success)
      throw new Error(r.error || "Failed to delete attachment");
  },
  /**
   * アクティビティ一覧取得
   */
  async getActivities(t, e) {
    const s = await fetch(`${n}/notes/${e}/activities?env=${t}`), a = await o(s);
    if (!a.success)
      throw new Error(a.error || "Failed to fetch activities");
    return a.activities;
  },
  /**
   * コメント追加
   */
  async addActivity(t, e, s) {
    const a = await fetch(`${n}/notes/${e}/activities?env=${t}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    }), r = await o(a);
    if (!r.success || !r.activity)
      throw new Error(r.error || "Failed to add activity");
    return r.activity;
  },
  /**
   * 添付ファイルURL取得（同期）
   */
  getAttachmentUrl(t) {
    return `${n}/attachments/${t}`;
  }
};
export {
  w as a,
  d as g,
  i as s
};
