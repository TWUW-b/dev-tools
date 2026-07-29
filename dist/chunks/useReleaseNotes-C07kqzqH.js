import { useState as u, useEffect as L, useCallback as S, useRef as R, useMemo as D } from "react";
import { c as I } from "./feedbackApi-B81GxfJ2.js";
import { f as T } from "./releaseNotesApi-f-5GsU66.js";
function F(n = "dev") {
  const [a, s] = u([]), [d, c] = u(!1), [m, i] = u(null), [b, l] = u(0);
  L(() => {
    const t = new AbortController();
    return (async () => {
      c(!0), i(null);
      try {
        const o = await I.getNotes({ env: n, signal: t.signal });
        s(o);
      } catch (o) {
        if (t.signal.aborted) return;
        i(o instanceof Error ? o : new Error(String(o)));
      } finally {
        t.signal.aborted || c(!1);
      }
    })(), () => {
      t.abort();
    };
  }, [n, b]);
  const g = S(
    async (t) => {
      try {
        const r = await I.createNote(n, t);
        return s((o) => [r, ...o]), r;
      } catch (r) {
        return i(r instanceof Error ? r : new Error(String(r))), null;
      }
    },
    [n]
  ), y = S(
    async (t, r, o) => {
      try {
        return await I.updateStatus(n, t, r, o), s(
          (e) => e.map((f) => f.id === t ? { ...f, status: r } : f)
        ), !0;
      } catch (e) {
        return i(e instanceof Error ? e : new Error(String(e))), !1;
      }
    },
    [n]
  ), N = S(
    async (t, r) => {
      try {
        return await I.updateSeverity(n, t, r), s(
          (o) => o.map((e) => e.id === t ? { ...e, severity: r } : e)
        ), !0;
      } catch (o) {
        return i(o instanceof Error ? o : new Error(String(o))), !1;
      }
    },
    [n]
  ), p = S(
    async (t) => {
      try {
        return await I.deleteNote(n, t), s((r) => r.filter((o) => o.id !== t)), !0;
      } catch (r) {
        return i(r instanceof Error ? r : new Error(String(r))), !1;
      }
    },
    [n]
  ), w = S(() => {
    l((t) => t + 1);
  }, []);
  return {
    notes: a,
    loading: d,
    error: m,
    createNote: g,
    updateStatus: y,
    updateSeverity: N,
    deleteNote: p,
    refresh: w
  };
}
const h = "debug-notes-mode";
function K() {
  const [n, a] = u(() => typeof window > "u" ? !1 : localStorage.getItem(h) === "1" ? !0 : window.location.hash === "#debug" ? (localStorage.setItem(h, "1"), !0) : !1);
  return L(() => {
    window.location.hash === "#debug" && !n && (localStorage.setItem(h, "1"), a(!0));
    const s = 3, d = 400;
    let c = [];
    const m = (l) => {
      var N, p;
      const g = (N = l.target) == null ? void 0 : N.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(g) || (p = l.target) != null && p.isContentEditable) return;
      if (l.key.toLowerCase() !== "z") {
        c = [];
        return;
      }
      const y = Date.now();
      c.push(y), c = c.filter((w) => y - w < d), c.length >= s && (c = [], a((w) => {
        const t = !w;
        return t ? localStorage.setItem(h, "1") : localStorage.removeItem(h), window.dispatchEvent(new StorageEvent("storage", {
          key: h,
          newValue: t ? "1" : null
        })), t;
      }));
    }, i = (l) => {
      l.key === h && a(l.newValue === "1");
    }, b = () => {
      window.location.hash === "#debug" && (localStorage.setItem(h, "1"), a(!0));
    };
    return window.addEventListener("keydown", m), window.addEventListener("storage", i), window.addEventListener("hashchange", b), () => {
      window.removeEventListener("keydown", m), window.removeEventListener("storage", i), window.removeEventListener("hashchange", b);
    };
  }, [n]), { isDebugMode: n };
}
const A = "devtools:release-notes:lastSeenId";
function C(n) {
  if (typeof window > "u") return 0;
  try {
    const a = window.localStorage.getItem(n), s = a === null ? 0 : Number(a);
    return Number.isFinite(s) ? s : 0;
  } catch {
    return 0;
  }
}
function O({
  feedUrl: n,
  storageKey: a = A,
  enabled: s = !0
}) {
  const [d, c] = u([]), [m, i] = u(!1), [b, l] = u(null), [g, y] = u(() => C(a)), [N, p] = u(0), w = R(null);
  L(() => {
    var f;
    if (!s || !n) return;
    (f = w.current) == null || f.abort();
    const e = new AbortController();
    return w.current = e, i(!0), l(null), T(n, { signal: e.signal }).then((E) => {
      e.signal.aborted || c(E);
    }).catch((E) => {
      e.signal.aborted || l(E instanceof Error ? E.message : "更新情報の取得に失敗しました");
    }).finally(() => {
      e.signal.aborted || i(!1);
    }), () => e.abort();
  }, [n, s, N]);
  const t = D(
    () => d.filter((e) => e.id > g).length,
    [d, g]
  ), r = S(() => {
    const e = d.reduce((f, E) => E.id > f ? E.id : f, 0);
    if (!(e <= g)) {
      y(e);
      try {
        window.localStorage.setItem(a, String(e));
      } catch {
      }
    }
  }, [d, g, a]), o = S(() => p((e) => e + 1), []);
  return { notes: d, loading: m, error: b, unreadCount: t, markAllRead: r, refresh: o };
}
export {
  F as a,
  O as b,
  K as u
};
