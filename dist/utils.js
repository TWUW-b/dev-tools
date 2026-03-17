import { a as F, g as U, s as A } from "./chunks/api-BfEr37m2.js";
import { m as y } from "./chunks/feedbackLogCapture-DUBfVREg.js";
import { c as M } from "./chunks/feedbackLogCapture-DUBfVREg.js";
import { d as N, a as R, g as B, p as W, u as H } from "./chunks/feedbackApi-lPew7wSg.js";
function D(l) {
  const e = l.split(`
`), n = [];
  let a = "", m = "", h = !1, t = !1;
  for (const f of e) {
    const r = f.trim();
    if (r === "---" && !t) {
      h ? (h = !1, t = !0) : h = !0;
      continue;
    }
    if (h) {
      const c = r.match(/^domain:\s*(.+)$/);
      c && (a = c[1].trim());
      continue;
    }
    if (r.startsWith("# ") && !r.startsWith("## ")) {
      m = r.slice(2).trim();
      continue;
    }
    if (!r.startsWith("## ") && r.startsWith("- ") && m) {
      const c = r.slice(2).trim().replace(/^\[[ x]\]\s*/, "");
      c && n.push({ domain: a, capability: m, title: c });
    }
  }
  return n;
}
const k = {
  maxErrorEntries: 30,
  maxLogEntries: 30
}, b = 30, O = ["authorization", "cookie", "set-cookie", "x-api-key"];
let E = null;
function v(l) {
  if (typeof window > "u")
    return {
      getConsoleLogs: () => [],
      getNetworkLogs: () => [],
      clear: () => {
      },
      destroy: () => {
      }
    };
  E && E.destroy();
  const e = [], n = [], a = [], m = [];
  if (l.console) {
    const t = l.console === !0 ? k : l.console, f = t.maxErrorEntries ?? k.maxErrorEntries, r = t.maxLogEntries ?? k.maxLogEntries, c = {}, s = ["error", "warn", "log"];
    for (const i of s) {
      const o = console[i];
      c[i] = o, console[i] = (...p) => {
        const u = p.map((d) => {
          if (typeof d == "object")
            try {
              return JSON.stringify(d);
            } catch {
              return String(d);
            }
          return String(d);
        }).join(" ");
        if (!t.filter || t.filter(u)) {
          const d = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            level: i,
            message: y(u)
          };
          i === "error" ? (e.length >= f && e.shift(), e.push(d)) : (n.length >= r && n.shift(), n.push(d));
        }
        o.apply(console, p);
      };
    }
    const g = (i) => {
      var o;
      e.length >= f && e.shift(), e.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        level: "error",
        message: y(i.message),
        stack: (o = i.error) == null ? void 0 : o.stack
      });
    };
    window.addEventListener("error", g);
    const w = (i) => {
      var o;
      e.length >= f && e.shift(), e.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        level: "error",
        message: y(`Unhandled Promise Rejection: ${i.reason}`),
        stack: (o = i.reason) == null ? void 0 : o.stack
      });
    };
    window.addEventListener("unhandledrejection", w), m.push(() => {
      for (const [i, o] of Object.entries(c))
        o && (console[i] = o);
      window.removeEventListener("error", g), window.removeEventListener("unhandledrejection", w);
    });
  }
  if (l.network) {
    const t = Array.isArray(l.network) ? { include: l.network } : l.network, f = t.maxEntries ?? b, r = window.fetch;
    window.fetch = async (c, s) => {
      const g = typeof c == "string" ? c : c instanceof URL ? c.href : c.url;
      let w;
      try {
        w = _(g, t.include, t.exclude);
      } catch {
        return r(c, s);
      }
      if (!w)
        return r(c, s);
      const i = performance.now();
      try {
        const o = await r(c, s), p = Math.round(performance.now() - i);
        if (!t.errorOnly || !o.ok) {
          const u = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            method: (s == null ? void 0 : s.method) || "GET",
            url: g,
            status: o.status,
            duration: p
          };
          if (s != null && s.body)
            try {
              u.requestBody = JSON.parse(String(s.body));
            } catch {
              u.requestBody = String(s.body);
            }
          try {
            u.responseBody = await o.clone().json();
          } catch {
          }
          t.captureHeaders && (u.requestHeaders = S(
            Object.fromEntries(new Headers(s == null ? void 0 : s.headers).entries())
          ), u.responseHeaders = S(
            Object.fromEntries(o.headers.entries())
          )), a.length >= f && a.shift(), a.push(u);
        }
        return o;
      } catch (o) {
        const p = Math.round(performance.now() - i);
        throw a.length >= f && a.shift(), a.push({
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          method: (s == null ? void 0 : s.method) || "GET",
          url: g,
          status: 0,
          duration: p
        }), o;
      }
    }, m.push(() => {
      window.fetch = r;
    });
  }
  const h = {
    getConsoleLogs: () => [...e, ...n].sort(
      (t, f) => t.timestamp.localeCompare(f.timestamp)
    ),
    getNetworkLogs: () => [...a],
    clear: () => {
      e.length = 0, n.length = 0, a.length = 0;
    },
    destroy: () => {
      m.forEach((t) => t()), e.length = 0, n.length = 0, a.length = 0, E === h && (E = null);
    }
  };
  return E = h, h;
}
function _(l, e, n) {
  const a = new URL(l, window.location.origin), m = a.pathname, h = a.href, t = (r) => r.startsWith("http://") || r.startsWith("https://") ? L(h, r) : L(m, r);
  return !(!e.some(t) || n != null && n.some(t));
}
function L(l, e) {
  const n = e.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "___DOUBLE___").replace(/\*/g, "[^/]*").replace(/___DOUBLE___/g, ".*");
  return new RegExp(`^${n}$`).test(l);
}
function S(l) {
  const e = {};
  for (const [n, a] of Object.entries(l))
    e[n] = O.includes(n.toLowerCase()) ? "***MASKED***" : a;
  return e;
}
export {
  F as api,
  M as createFeedbackLogCapture,
  v as createLogCapture,
  N as deleteFeedback,
  U as getDebugApiBaseUrl,
  R as getFeedbackDetail,
  B as getFeedbacks,
  y as maskSensitive,
  D as parseTestCaseMd,
  W as postFeedback,
  A as setDebugApiBaseUrl,
  H as updateFeedbackStatus
};
