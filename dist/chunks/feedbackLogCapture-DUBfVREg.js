function i(r) {
  let o = r;
  return o = o.replace(
    /(Authorization:\s*)(Bearer\s+)?[^\s\n]+/gi,
    "$1$2[MASKED]"
  ), o = o.replace(
    /((?:Set-)?Cookie:\s*)[^\n]+/gi,
    "$1[MASKED]"
  ), o = o.replace(
    /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    "[JWT_MASKED]"
  ), o = o.replace(
    /(Bearer\s+)[^\s\n"']+/gi,
    "$1[MASKED]"
  ), o = o.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL_MASKED]"
  ), o = o.replace(
    /(?:0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}|\d{3}[-\s]?\d{4}[-\s]?\d{4})/g,
    "[PHONE_MASKED]"
  ), o;
}
const D = 15, _ = 15;
let g = null, w = 0;
function O(r) {
  if (typeof window > "u")
    return {
      getConsoleLogs: () => [],
      getNetworkLogs: () => [],
      clear: () => {
      },
      destroy: () => {
      }
    };
  if (g !== null) {
    w++;
    const e = g;
    return {
      getConsoleLogs: e.getConsoleLogs,
      getNetworkLogs: e.getNetworkLogs,
      clear: e.clear,
      destroy: () => {
        w = Math.max(0, w - 1), w === 0 && e.destroy();
      }
    };
  }
  const o = (r == null ? void 0 : r.maxConsoleLogs) ?? D, L = (r == null ? void 0 : r.maxNetworkLogs) ?? _, E = (r == null ? void 0 : r.networkInclude) ?? null, S = (r == null ? void 0 : r.networkExclude) ?? null, u = [], d = [], n = [], f = console.log, y = console.warn, A = console.error;
  function h(e, t) {
    const s = t.map((a) => {
      try {
        return typeof a == "string" ? a : JSON.stringify(a);
      } catch {
        return String(a);
      }
    }).join(" "), c = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: e,
      message: i(s)
    };
    e === "error" && t[0] instanceof Error && t[0].stack && (c.stack = i(t[0].stack)), e === "error" ? (u.push(c), u.length > o && u.shift()) : (d.push(c), d.length > o && d.shift());
  }
  console.log = (...e) => {
    h("log", e), f.apply(console, e);
  }, console.warn = (...e) => {
    h("warn", e), y.apply(console, e);
  }, console.error = (...e) => {
    h("error", e), A.apply(console, e);
  };
  const p = window.onerror;
  window.onerror = (e, t, s, c, a) => (h("error", [String(e) + (t ? ` at ${t}:${s}:${c}` : "")]), typeof p == "function" ? p.call(window, e, t, s, c, a) : !1);
  const k = (e) => {
    h("error", [`Unhandled rejection: ${e.reason}`]);
  };
  window.addEventListener("unhandledrejection", k);
  const m = window.fetch;
  window.fetch = async (e, t) => {
    const s = typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
    if (!!(S && S.some((l) => s.startsWith(l)) || E && !E.some((l) => s.includes(l))))
      return m.call(window, e, t);
    const a = Date.now();
    try {
      const l = await m.call(window, e, t);
      return n.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        method: (t == null ? void 0 : t.method) ?? "GET",
        url: i(s),
        status: l.status,
        duration: Date.now() - a
      }), n.length > L && n.shift(), l;
    } catch (l) {
      throw n.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        method: (t == null ? void 0 : t.method) ?? "GET",
        url: i(s),
        status: 0,
        duration: Date.now() - a
      }), n.length > L && n.shift(), l;
    }
  };
  const C = {
    getConsoleLogs: () => [...u, ...d].sort(
      (e, t) => e.timestamp.localeCompare(t.timestamp)
    ),
    getNetworkLogs: () => [...n],
    clear: () => {
      u.length = 0, d.length = 0, n.length = 0;
    },
    destroy: () => {
      console.log = f, console.warn = y, console.error = A, window.onerror = p, window.removeEventListener("unhandledrejection", k), window.fetch = m, u.length = 0, d.length = 0, n.length = 0, g = null, w = 0;
    }
  };
  return g = C, w = 1, C;
}
export {
  O as c,
  i as m
};
