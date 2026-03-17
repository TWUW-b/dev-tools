import { useState as u, useRef as x, useEffect as F, useCallback as k } from "react";
import { g as T, u as D, d as P, p as $ } from "./feedbackApi-lPew7wSg.js";
import K from "jszip";
function I(g) {
  const [d, e] = u(null), [c, t] = u(!1), [s, i] = u(null), [n, l] = u(0), m = x(null);
  F(() => {
    if (!g) {
      e(null), t(!1), i(null);
      return;
    }
    m.current && m.current.abort();
    const r = new AbortController();
    return m.current = r, (async () => {
      t(!0), i(null);
      try {
        const a = await fetch(g, { signal: r.signal });
        if (r.signal.aborted)
          return;
        if (!a.ok)
          throw new Error(`Failed to load: ${a.status} ${a.statusText}`);
        let f = await a.text();
        f = f.replace(/\]\(app:/g, "](#app:"), r.signal.aborted || (e(f), t(!1));
      } catch (a) {
        if (r.signal.aborted || a instanceof Error && a.name === "AbortError")
          return;
        i(a instanceof Error ? a : new Error(String(a))), e(null), t(!1);
      }
    })(), () => {
      r.abort();
    };
  }, [g, n]);
  const o = k(() => {
    l((r) => r + 1);
  }, []);
  return {
    content: d,
    loading: c,
    error: s,
    reload: o
  };
}
function Y(g) {
  const { apiBaseUrl: d, adminKey: e } = g, [c, t] = u([]), [s, i] = u(0), [n, l] = u(20), [m, o] = u(1), [r, b] = u(!1), [a, f] = u(null), [z, U] = u([]), [p, h] = u({
    status: "",
    kind: "",
    target: "",
    customTag: ""
  }), [L, E] = u(0), R = k((w) => {
    h((y) => ({ ...y, ...w })), o(1);
  }, []), v = k(() => {
    E((w) => w + 1);
  }, []);
  F(() => {
    const w = new AbortController();
    b(!0), f(null);
    const y = { page: String(m) };
    return p.status && (y.status = p.status), p.kind && (y.kind = p.kind), p.target && (y.target = p.target), p.customTag && (y.custom_tag = p.customTag), T({ apiBaseUrl: d, adminKey: e, query: y, signal: w.signal }).then((S) => {
      w.signal.aborted || (t(S.data), i(S.total), l(S.limit), U(S.customTags));
    }).catch((S) => {
      w.signal.aborted || f(S instanceof Error ? S : new Error(String(S)));
    }).finally(() => {
      w.signal.aborted || b(!1);
    }), () => {
      w.abort();
    };
  }, [d, e, m, p, L]);
  const M = k(
    async (w, y) => {
      try {
        return await D({ apiBaseUrl: d, adminKey: e, id: w, status: y }), v(), !0;
      } catch {
        return !1;
      }
    },
    [d, e, v]
  ), A = k(
    async (w) => {
      try {
        return await P({ apiBaseUrl: d, adminKey: e, id: w }), v(), !0;
      } catch {
        return !1;
      }
    },
    [d, e, v]
  );
  return {
    feedbacks: c,
    total: s,
    page: m,
    limit: n,
    loading: r,
    error: a,
    filters: p,
    customTags: z,
    setFilters: R,
    setPage: o,
    updateStatus: M,
    remove: A,
    refresh: v
  };
}
function H(g) {
  const { apiBaseUrl: d, userType: e, appVersion: c } = g, [t, s] = u(!1), [i, n] = u(null), l = x(!0);
  F(() => () => {
    l.current = !1;
  }, []);
  const m = k(
    async (o, r) => {
      var b;
      s(!0), n(null);
      try {
        const a = typeof window < "u" ? {
          // navigator.platform は deprecated だが、userAgentData 未対応ブラウザへのフォールバックとして残す
          os: ((b = navigator.userAgentData) == null ? void 0 : b.platform) ?? navigator.platform ?? "unknown",
          browser: navigator.userAgent,
          screen: `${screen.width}x${screen.height}`,
          language: navigator.language
        } : void 0, f = {
          kind: o.kind,
          message: o.message,
          pageUrl: typeof window < "u" ? window.location.href : void 0,
          userType: e,
          appVersion: c,
          environment: a
        };
        o.target && (f.target = o.target), r != null && r.consoleLogs && (f.consoleLogs = r.consoleLogs), r != null && r.networkLogs && (f.networkLogs = r.networkLogs);
        const z = await $({ apiBaseUrl: d, body: f });
        return l.current && s(!1), { data: z, error: null };
      } catch (a) {
        const f = a instanceof Error ? a : new Error(String(a));
        return l.current && (n(f), s(!1)), { data: null, error: f };
      }
    },
    [d, e, c]
  );
  return { submitting: t, error: i, submitFeedback: m };
}
function V() {
  const g = k(async (e, c) => {
    try {
      const t = await fetch(e);
      if (!t.ok)
        throw new Error(`Failed to fetch: ${t.status} ${t.statusText}`);
      const s = await t.text(), i = new Blob([s], { type: "text/markdown; charset=utf-8" }), n = URL.createObjectURL(i), l = e.split("/").pop() || "manual.md", m = c || l, o = document.createElement("a");
      o.href = n, o.download = m, document.body.appendChild(o), o.click(), document.body.removeChild(o), URL.revokeObjectURL(n);
    } catch (t) {
      throw console.error("Failed to download MD file:", t), t;
    }
  }, []), d = k(
    async (e, c = "manuals.zip") => {
      try {
        const t = new K();
        await Promise.all(
          e.map(async ({ path: l, filename: m }) => {
            const o = await fetch(l);
            if (!o.ok) {
              console.warn(`Failed to fetch ${l}: ${o.status}`);
              return;
            }
            const r = await o.text(), b = l.split("/").pop() || "manual.md";
            t.file(m || b, r);
          })
        );
        const s = await t.generateAsync({ type: "blob" }), i = URL.createObjectURL(s), n = document.createElement("a");
        n.href = i, n.download = c, document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(i);
      } catch (t) {
        throw console.error("Failed to download ZIP:", t), t;
      }
    },
    []
  );
  return {
    downloadMd: g,
    downloadMultipleMd: d
  };
}
function W(g) {
  const { defaultSize: d, minSize: e, maxSize: c, direction: t = "horizontal", minAdjacentSize: s = 300, enabled: i = !0 } = g, n = t === "vertical", [l, m] = u(d), [o, r] = u(!1), b = x(0), a = x(0), f = x(l);
  F(() => {
    f.current = l;
  }, [l]);
  const z = k(
    (h) => {
      i && (h.preventDefault(), b.current = n ? h.clientY : h.clientX, a.current = f.current, r(!0));
    },
    [n, i]
  );
  F(() => {
    if (!o || !i) return;
    const h = n ? "row-resize" : "col-resize", L = (R) => {
      const v = n ? R.clientY : R.clientX, M = b.current - v, A = n ? window.innerHeight : window.innerWidth, w = Math.min(c, A - s), y = Math.max(e, Math.min(w, a.current + M));
      m(y);
    }, E = () => {
      r(!1);
    };
    return document.body.style.cursor = h, document.body.style.userSelect = "none", document.addEventListener("mousemove", L), document.addEventListener("mouseup", E), () => {
      document.body.style.cursor = "", document.body.style.userSelect = "", document.removeEventListener("mousemove", L), document.removeEventListener("mouseup", E);
    };
  }, [o, n, e, c, s, i]);
  const U = 10, p = k(
    (h) => {
      if (!i) return;
      const L = n ? "ArrowUp" : "ArrowLeft", E = n ? "ArrowDown" : "ArrowRight";
      if (h.key !== L && h.key !== E) return;
      h.preventDefault();
      const R = h.key === L ? U : -U;
      m((v) => {
        const M = n ? window.innerHeight : window.innerWidth, A = Math.min(c, M - s);
        return Math.max(e, Math.min(A, v + R));
      });
    },
    [n, i, e, c, s]
  );
  return { size: l, isResizing: o, handleMouseDown: z, handleKeyDown: p };
}
function C() {
  return typeof window > "u" ? !1 : new URLSearchParams(window.location.search).get("feedback") === "admin";
}
function X() {
  const [g, d] = u(C);
  return F(() => {
    const e = () => d(C()), c = history.pushState.bind(history), t = history.replaceState.bind(history);
    return history.pushState = (...s) => {
      c(...s), e();
    }, history.replaceState = (...s) => {
      t(...s), e();
    }, window.addEventListener("popstate", e), () => {
      history.pushState = c, history.replaceState = t, window.removeEventListener("popstate", e);
    };
  }, []), g;
}
export {
  Y as a,
  X as b,
  V as c,
  I as d,
  W as e,
  H as u
};
