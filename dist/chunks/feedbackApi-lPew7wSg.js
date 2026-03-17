function c(e) {
  if (e.startsWith("/"))
    return e.replace(/\/$/, "");
  const a = new URL(e);
  if (!["http:", "https:"].includes(a.protocol))
    throw new Error(`Invalid API base URL protocol: ${a.protocol}`);
  return a.origin + a.pathname.replace(/\/$/, "");
}
async function f({ apiBaseUrl: e, body: a, signal: s }) {
  const t = c(e), n = await (await fetch(`${t}/feedbacks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a),
    signal: s
  })).json();
  if (!n.success)
    throw new Error(n.error || "Failed to submit feedback");
  return n.data;
}
async function l(e) {
  const a = c(e.apiBaseUrl), s = new URLSearchParams(e.query ?? {}).toString(), t = `${a}/feedbacks${s ? "?" + s : ""}`, n = await (await fetch(t, {
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!n.success)
    throw new Error(n.error || "Failed to fetch feedbacks");
  return n;
}
async function h(e) {
  const a = c(e.apiBaseUrl), t = await (await fetch(`${a}/feedbacks/${e.id}`, {
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!t.success)
    throw new Error(t.error || "Failed to fetch feedback");
  return t.data;
}
async function b(e) {
  const a = c(e.apiBaseUrl), t = await (await fetch(`${a}/feedbacks/${e.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": e.adminKey
    },
    body: JSON.stringify({ status: e.status }),
    signal: e.signal
  })).json();
  if (!t.success)
    throw new Error(t.error || "Failed to update status");
  return t.data;
}
async function u(e) {
  const a = c(e.apiBaseUrl), t = await (await fetch(`${a}/feedbacks/${e.id}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!t.success)
    throw new Error(t.error || "Failed to delete feedback");
}
async function w(e) {
  const a = c(e.apiBaseUrl), s = new FormData();
  s.append("file", e.file);
  const o = await (await fetch(`${a}/feedbacks/${e.feedbackId}/attachments`, {
    method: "POST",
    body: s
  })).json();
  if (!o.success || !o.attachment)
    throw new Error(o.error || "Failed to upload attachment");
  return o.attachment;
}
async function y(e) {
  const a = c(e.apiBaseUrl), t = await (await fetch(`${a}/feedbacks/${e.feedbackId}/attachments/${e.attachmentId}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": e.adminKey },
    signal: e.signal
  })).json();
  if (!t.success)
    throw new Error(t.error || "Failed to delete attachment");
}
async function k(e) {
  var i, d;
  const s = `${c(e.apiBaseUrl)}/feedbacks/export/${e.format}`, t = await fetch(s, {
    headers: { "X-Admin-Key": e.adminKey }
  });
  if (!t.ok)
    throw new Error(`Export failed: ${t.status}`);
  const o = await t.blob(), n = ((d = (i = t.headers.get("Content-Disposition")) == null ? void 0 : i.match(/filename="?([^"]+)"?/)) == null ? void 0 : d[1]) ?? `feedbacks-export.${e.format}`, r = document.createElement("a");
  r.href = URL.createObjectURL(o), r.download = n, document.body.appendChild(r), r.click(), document.body.removeChild(r), URL.revokeObjectURL(r.href);
}
export {
  h as a,
  y as b,
  w as c,
  u as d,
  k as e,
  l as g,
  f as p,
  b as u
};
