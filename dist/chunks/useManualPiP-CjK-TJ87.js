import { useState as o, useCallback as n } from "react";
let r = "/manual";
function b(t) {
  r = t;
}
function h() {
  const [t, s] = o(!1), [l, a] = o(null), u = n((e) => {
    a(e), s(!0);
  }, []), c = n((e) => {
    const i = `${r}?path=${encodeURIComponent(e)}`;
    window.open(i, "_blank", "noreferrer");
  }, []), p = n(() => {
    s(!1);
  }, []), P = n((e) => {
    a(e);
  }, []);
  return {
    isOpen: t,
    currentPath: l,
    openPiP: u,
    openTab: c,
    closePiP: p,
    setPath: P
  };
}
export {
  b as s,
  h as u
};
