import { a as u, g as d, s as b } from "./chunks/api-BfEr37m2.js";
import { c as h, m as k } from "./chunks/feedbackLogCapture-DUBfVREg.js";
import { c as F } from "./chunks/logCapture-Bkuy8MSd.js";
import { d as W, b as C, g as A, p as B, u as L } from "./chunks/feedbackApi-CdFCjUgg.js";
function f(c) {
  const n = c.split(`
`), i = [];
  let r = "", a = "", s = !1, o = !1;
  for (const l of n) {
    const t = l.trim();
    if (t === "---" && !o) {
      s ? (s = !1, o = !0) : s = !0;
      continue;
    }
    if (s) {
      const e = t.match(/^domain:\s*(.+)$/);
      e && (r = e[1].trim());
      continue;
    }
    if (t.startsWith("# ") && !t.startsWith("## ")) {
      a = t.slice(2).trim();
      continue;
    }
    if (!t.startsWith("## ") && t.startsWith("- ") && a) {
      const e = t.slice(2).trim().replace(/^\[[ x]\]\s*/, "");
      e && i.push({ domain: r, capability: a, title: e });
    }
  }
  return i;
}
export {
  u as api,
  h as createFeedbackLogCapture,
  F as createLogCapture,
  W as deleteFeedback,
  d as getDebugApiBaseUrl,
  C as getFeedbackDetail,
  A as getFeedbacks,
  k as maskSensitive,
  f as parseTestCaseMd,
  B as postFeedback,
  b as setDebugApiBaseUrl,
  L as updateFeedbackStatus
};
