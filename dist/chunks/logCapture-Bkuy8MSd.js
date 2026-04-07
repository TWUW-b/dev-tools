import { m as y } from "./feedbackLogCapture-DUBfVREg.js";
const L = {
  maxErrorEntries: 30,
  maxLogEntries: 30
}, O = 30, _ = ["authorization", "cookie", "set-cookie", "x-api-key"];
let E = null;
function x(c) {
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
  const e = [], n = [], a = [], u = [];
  if (c.console) {
    const o = c.console === !0 ? L : c.console, i = o.maxErrorEntries ?? L.maxErrorEntries, l = o.maxLogEntries ?? L.maxLogEntries, h = {}, t = ["error", "warn", "log"];
    for (const s of t) {
      const r = console[s];
      h[s] = r, console[s] = (...d) => {
        const f = d.map((g) => {
          if (typeof g == "object")
            try {
              return JSON.stringify(g);
            } catch {
              return String(g);
            }
          return String(g);
        }).join(" ");
        if (!o.filter || o.filter(f)) {
          const g = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            level: s,
            message: y(f)
          };
          s === "error" ? (e.length >= i && e.shift(), e.push(g)) : (n.length >= l && n.shift(), n.push(g));
        }
        r.apply(console, d);
      };
    }
    const m = (s) => {
      var r;
      e.length >= i && e.shift(), e.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        level: "error",
        message: y(s.message),
        stack: (r = s.error) == null ? void 0 : r.stack
      });
    };
    window.addEventListener("error", m);
    const p = (s) => {
      var r;
      e.length >= i && e.shift(), e.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        level: "error",
        message: y(`Unhandled Promise Rejection: ${s.reason}`),
        stack: (r = s.reason) == null ? void 0 : r.stack
      });
    };
    window.addEventListener("unhandledrejection", p), u.push(() => {
      for (const [s, r] of Object.entries(h))
        r && (console[s] = r);
      window.removeEventListener("error", m), window.removeEventListener("unhandledrejection", p);
    });
  }
  if (c.network) {
    const o = Array.isArray(c.network) ? { include: c.network } : c.network, i = o.maxEntries ?? O, l = window.fetch;
    window.fetch = async (h, t) => {
      const m = typeof h == "string" ? h : h instanceof URL ? h.href : h.url;
      let p;
      try {
        p = v(m, o.include, o.exclude);
      } catch {
        return l(h, t);
      }
      if (!p)
        return l(h, t);
      const s = performance.now();
      try {
        const r = await l(h, t), d = Math.round(performance.now() - s);
        if (!o.errorOnly || !r.ok) {
          const f = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            method: (t == null ? void 0 : t.method) || "GET",
            url: m,
            status: r.status,
            duration: d
          };
          if (t != null && t.body)
            try {
              f.requestBody = JSON.parse(String(t.body));
            } catch {
              f.requestBody = String(t.body);
            }
          try {
            f.responseBody = await r.clone().json();
          } catch {
          }
          o.captureHeaders && (f.requestHeaders = k(
            Object.fromEntries(new Headers(t == null ? void 0 : t.headers).entries())
          ), f.responseHeaders = k(
            Object.fromEntries(r.headers.entries())
          )), a.length >= i && a.shift(), a.push(f);
        }
        return r;
      } catch (r) {
        const d = Math.round(performance.now() - s);
        throw a.length >= i && a.shift(), a.push({
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          method: (t == null ? void 0 : t.method) || "GET",
          url: m,
          status: 0,
          duration: d
        }), r;
      }
    }, u.push(() => {
      window.fetch = l;
    });
  }
  const w = {
    getConsoleLogs: () => [...e, ...n].sort(
      (o, i) => o.timestamp.localeCompare(i.timestamp)
    ),
    getNetworkLogs: () => [...a],
    clear: () => {
      e.length = 0, n.length = 0, a.length = 0;
    },
    destroy: () => {
      u.forEach((o) => o()), e.length = 0, n.length = 0, a.length = 0, E === w && (E = null);
    }
  };
  return E = w, w;
}
function v(c, e, n) {
  const a = new URL(c, window.location.origin), u = a.pathname, w = a.href, o = (l) => l.startsWith("http://") || l.startsWith("https://") ? S(w, l) : S(u, l);
  return !(!e.some(o) || n != null && n.some(o));
}
function S(c, e) {
  const n = e.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "___DOUBLE___").replace(/\*/g, "[^/]*").replace(/___DOUBLE___/g, ".*");
  return new RegExp(`^${n}$`).test(c);
}
function k(c) {
  const e = {};
  for (const [n, a] of Object.entries(c))
    e[n] = _.includes(n.toLowerCase()) ? "***MASKED***" : a;
  return e;
}
export {
  x as c
};
