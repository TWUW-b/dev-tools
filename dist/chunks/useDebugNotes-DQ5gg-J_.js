import { useState as u, useEffect as m, useCallback as c } from "react";
import { a as i } from "./api-BfEr37m2.js";
function k(a = "dev") {
  const [g, s] = u([]), [d, f] = u(!1), [y, o] = u(null), [E, w] = u(0);
  m(() => {
    const t = new AbortController();
    return (async () => {
      f(!0), o(null);
      try {
        const e = await i.getNotes({ env: a, signal: t.signal });
        s(e);
      } catch (e) {
        if (t.signal.aborted) return;
        o(e instanceof Error ? e : new Error(String(e)));
      } finally {
        t.signal.aborted || f(!1);
      }
    })(), () => {
      t.abort();
    };
  }, [a, E]);
  const h = c(
    async (t) => {
      try {
        const r = await i.createNote(a, t);
        return s((e) => [r, ...e]), r;
      } catch (r) {
        return o(r instanceof Error ? r : new Error(String(r))), null;
      }
    },
    [a]
  ), p = c(
    async (t, r, e) => {
      try {
        return await i.updateStatus(a, t, r, e), s(
          (n) => n.map((l) => l.id === t ? { ...l, status: r } : l)
        ), !0;
      } catch (n) {
        return o(n instanceof Error ? n : new Error(String(n))), !1;
      }
    },
    [a]
  ), S = c(
    async (t, r) => {
      try {
        return await i.updateSeverity(a, t, r), s(
          (e) => e.map((n) => n.id === t ? { ...n, severity: r } : n)
        ), !0;
      } catch (e) {
        return o(e instanceof Error ? e : new Error(String(e))), !1;
      }
    },
    [a]
  ), N = c(
    async (t) => {
      try {
        return await i.deleteNote(a, t), s((r) => r.filter((e) => e.id !== t)), !0;
      } catch (r) {
        return o(r instanceof Error ? r : new Error(String(r))), !1;
      }
    },
    [a]
  ), b = c(() => {
    w((t) => t + 1);
  }, []);
  return {
    notes: g,
    loading: d,
    error: y,
    createNote: h,
    updateStatus: p,
    updateSeverity: S,
    deleteNote: N,
    refresh: b
  };
}
export {
  k as u
};
