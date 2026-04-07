import { useState as f, useEffect as I, useCallback as g } from "react";
import { a as w } from "./api-BfEr37m2.js";
function T(n = "dev") {
  const [l, u] = f([]), [b, o] = f(!1), [h, a] = f(null), [E, i] = f(0);
  I(() => {
    const e = new AbortController();
    return (async () => {
      o(!0), a(null);
      try {
        const r = await w.getNotes({ env: n, signal: e.signal });
        u(r);
      } catch (r) {
        if (e.signal.aborted) return;
        a(r instanceof Error ? r : new Error(String(r)));
      } finally {
        e.signal.aborted || o(!1);
      }
    })(), () => {
      e.abort();
    };
  }, [n, E]);
  const p = g(
    async (e) => {
      try {
        const t = await w.createNote(n, e);
        return u((r) => [t, ...r]), t;
      } catch (t) {
        return a(t instanceof Error ? t : new Error(String(t))), null;
      }
    },
    [n]
  ), S = g(
    async (e, t, r) => {
      try {
        return await w.updateStatus(n, e, t, r), u(
          (s) => s.map((N) => N.id === e ? { ...N, status: t } : N)
        ), !0;
      } catch (s) {
        return a(s instanceof Error ? s : new Error(String(s))), !1;
      }
    },
    [n]
  ), y = g(
    async (e, t) => {
      try {
        return await w.updateSeverity(n, e, t), u(
          (r) => r.map((s) => s.id === e ? { ...s, severity: t } : s)
        ), !0;
      } catch (r) {
        return a(r instanceof Error ? r : new Error(String(r))), !1;
      }
    },
    [n]
  ), m = g(
    async (e) => {
      try {
        return await w.deleteNote(n, e), u((t) => t.filter((r) => r.id !== e)), !0;
      } catch (t) {
        return a(t instanceof Error ? t : new Error(String(t))), !1;
      }
    },
    [n]
  ), d = g(() => {
    i((e) => e + 1);
  }, []);
  return {
    notes: l,
    loading: b,
    error: h,
    createNote: p,
    updateStatus: S,
    updateSeverity: y,
    deleteNote: m,
    refresh: d
  };
}
const c = "debug-notes-mode";
function k() {
  const [n, l] = f(() => typeof window > "u" ? !1 : localStorage.getItem(c) === "1" ? !0 : window.location.hash === "#debug" ? (localStorage.setItem(c, "1"), !0) : !1);
  return I(() => {
    window.location.hash === "#debug" && !n && (localStorage.setItem(c, "1"), l(!0));
    const u = 3, b = 400;
    let o = [];
    const h = (i) => {
      var y, m;
      const p = (y = i.target) == null ? void 0 : y.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(p) || (m = i.target) != null && m.isContentEditable) return;
      if (i.key.toLowerCase() !== "z") {
        o = [];
        return;
      }
      const S = Date.now();
      o.push(S), o = o.filter((d) => S - d < b), o.length >= u && (o = [], l((d) => {
        const e = !d;
        return e ? localStorage.setItem(c, "1") : localStorage.removeItem(c), window.dispatchEvent(new StorageEvent("storage", {
          key: c,
          newValue: e ? "1" : null
        })), e;
      }));
    }, a = (i) => {
      i.key === c && l(i.newValue === "1");
    }, E = () => {
      window.location.hash === "#debug" && (localStorage.setItem(c, "1"), l(!0));
    };
    return window.addEventListener("keydown", h), window.addEventListener("storage", a), window.addEventListener("hashchange", E), () => {
      window.removeEventListener("keydown", h), window.removeEventListener("storage", a), window.removeEventListener("hashchange", E);
    };
  }, [n]), { isDebugMode: n };
}
export {
  T as a,
  k as u
};
