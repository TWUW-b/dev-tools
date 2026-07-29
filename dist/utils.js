import { c as u, f as d, l as b, i as h, g, p as k, s as F, b as x, u as A } from "./chunks/feedbackApi-B81GxfJ2.js";
import { c as W, m as C } from "./chunks/feedbackLogCapture-DUBfVREg.js";
import { c as B } from "./chunks/logCapture-Bkuy8MSd.js";
import { f as N, r as S } from "./chunks/releaseNotesApi-f-5GsU66.js";
function f(c) {
  const n = c.split(`
`), i = [];
  let r = "", a = "", s = !1, o = !1;
  for (const l of n) {
    const e = l.trim();
    if (e === "---" && !o) {
      s ? (s = !1, o = !0) : s = !0;
      continue;
    }
    if (s) {
      const t = e.match(/^domain:\s*(.+)$/);
      t && (r = t[1].trim());
      continue;
    }
    if (e.startsWith("# ") && !e.startsWith("## ")) {
      a = e.slice(2).trim();
      continue;
    }
    if (!e.startsWith("## ") && e.startsWith("- ") && a) {
      const t = e.slice(2).trim().replace(/^\[[ x]\]\s*/, "");
      t && i.push({ domain: r, capability: a, title: t });
    }
  }
  return i;
}
export {
  u as api,
  W as createFeedbackLogCapture,
  B as createLogCapture,
  d as deleteFeedback,
  N as fetchReleaseNotesFeed,
  b as getDebugApiBaseUrl,
  h as getFeedbackDetail,
  g as getFeedbacks,
  C as maskSensitive,
  f as parseTestCaseMd,
  k as postFeedback,
  S as releaseNotesApi,
  F as setAuthTokenProvider,
  x as setDebugApiBaseUrl,
  A as updateFeedbackStatus
};
