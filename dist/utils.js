import { b as p, d, i as b, e as g, g as h, p as k, s as F, a as x, u as D } from "./chunks/feedbackApi-BAMqIntC.js";
import { c as A, m as C } from "./chunks/feedbackLogCapture-DUBfVREg.js";
import { c as B } from "./chunks/logCapture-Bkuy8MSd.js";
function f(n) {
  const c = n.split(`
`), i = [];
  let r = "", a = "", s = !1, o = !1;
  for (const l of c) {
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
