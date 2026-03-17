import { useState as f, useEffect as p, useCallback as u } from "react";
const n = "debug-notes-mode";
function I() {
  const [o, a] = f(() => typeof window > "u" ? !1 : localStorage.getItem(n) === "1" ? !0 : window.location.hash === "#debug" ? (localStorage.setItem(n, "1"), !0) : !1);
  return p(() => {
    window.location.hash === "#debug" && !o && (localStorage.setItem(n, "1"), a(!0));
    const c = 3, s = 400;
    let t = [];
    const r = (e) => {
      var E, m;
      const d = (E = e.target) == null ? void 0 : E.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(d) || (m = e.target) != null && m.isContentEditable) return;
      if (e.key.toLowerCase() !== "z") {
        t = [];
        return;
      }
      const h = Date.now();
      t.push(h), t = t.filter((w) => h - w < s), t.length >= c && (t = [], a((w) => {
        const g = !w;
        return g ? localStorage.setItem(n, "1") : localStorage.removeItem(n), window.dispatchEvent(new StorageEvent("storage", {
          key: n,
          newValue: g ? "1" : null
        })), g;
      }));
    }, i = (e) => {
      e.key === n && a(e.newValue === "1");
    }, l = () => {
      window.location.hash === "#debug" && (localStorage.setItem(n, "1"), a(!0));
    };
    return window.addEventListener("keydown", r), window.addEventListener("storage", i), window.addEventListener("hashchange", l), () => {
      window.removeEventListener("keydown", r), window.removeEventListener("storage", i), window.removeEventListener("hashchange", l);
    };
  }, [o]), { isDebugMode: o };
}
let b = "/manual";
function S(o) {
  b = o;
}
function P() {
  const [o, a] = f(!1), [c, s] = f(null), t = u((e) => {
    s(e), a(!0);
  }, []), r = u((e) => {
    const d = `${b}?path=${encodeURIComponent(e)}`;
    window.open(d, "_blank", "noreferrer");
  }, []), i = u(() => {
    a(!1);
  }, []), l = u((e) => {
    s(e);
  }, []);
  return {
    isOpen: o,
    currentPath: c,
    openPiP: t,
    openTab: r,
    closePiP: i,
    setPath: l
  };
}
export {
  P as a,
  S as s,
  I as u
};
