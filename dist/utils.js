import { c as p, d, j as b, f as g, g as h, p as k, s as F, b as x, u as D } from "./chunks/feedbackApi-D4n_7_zn.js";
import { c as A, m as C } from "./chunks/feedbackLogCapture-DUBfVREg.js";
import { c as B } from "./chunks/logCapture-Bkuy8MSd.js";
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
  p as api,
  A as createFeedbackLogCapture,
  B as createLogCapture,
  d as deleteFeedback,
  b as getDebugApiBaseUrl,
  g as getFeedbackDetail,
  h as getFeedbacks,
  C as maskSensitive,
  f as parseTestCaseMd,
  k as postFeedback,
  F as setAuthTokenProvider,
  x as setDebugApiBaseUrl,
  D as updateFeedbackStatus
};
