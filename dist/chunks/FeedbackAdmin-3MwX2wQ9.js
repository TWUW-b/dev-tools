import { jsxs as t, jsx as e, Fragment as he } from "react/jsx-runtime";
import { useState as E, useRef as X, useCallback as z, useEffect as j, useMemo as ve } from "react";
import { createPortal as Se } from "react-dom";
import { u as Ce, d as te, c as ze, e as se, b as De, a as Fe } from "./useFeedbackAdminMode-uS9p5VCZ.js";
import Ee from "react-markdown";
import $e from "remark-gfm";
import Be from "rehype-raw";
import { c as Le } from "./feedbackLogCapture-DUBfVREg.js";
import { a as Re, b as Ie, c as Me } from "./feedbackApi-CdFCjUgg.js";
const le = {
  primary: "#1E40AF",
  primaryHover: "#1E3A8A",
  secondary: "#F59E0B",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  white: "#FFFFFF",
  error: "#DC2626",
  errorBg: "#FEE2E2",
  success: "#059669",
  successBg: "#D1FAE5"
}, n = {
  primary: "#043E80",
  secondary: "#F5B500",
  tertiary: "#1E3A5F",
  gray100: "#F3F4F6",
  gray300: "#D1D5DB",
  gray500: "#6B7280",
  gray700: "#374151",
  white: "#FFFFFF",
  error: "#DC2626",
  errorBg: "#FEE2E2"
}, de = ["image/png", "image/jpeg", "image/webp", "image/gif"], Te = 5, _e = 5 * 1024 * 1024;
function Ae({
  files: o,
  onAdd: a,
  onRemove: h,
  maxFiles: m = Te,
  maxFileSize: f = _e,
  disabled: s = !1,
  pipDocument: c
}) {
  const [u, x] = E(!1), [v, y] = E(null), A = X(null), N = X(0), W = z((d) => {
    y(null);
    const b = m - o.length;
    if (b <= 0) {
      y(`最大${m}枚まで添付できます`);
      return;
    }
    const C = [];
    for (const R of d) {
      if (C.length >= b) break;
      if (!de.includes(R.type)) {
        y(`${R.name}: 対応していない形式です（PNG/JPEG/WebP/GIF）`);
        continue;
      }
      if (R.size > f) {
        y(`${R.name}: ファイルサイズが大きすぎます（最大5MB）`);
        continue;
      }
      C.push(R);
    }
    C.length > 0 && a(C);
  }, [o.length, m, f, a]), P = z((d) => {
    var R;
    if (s) return;
    const b = (R = d.clipboardData) == null ? void 0 : R.items;
    if (!b) return;
    const C = [];
    for (let M = 0; M < b.length; M++) {
      const $ = b[M];
      if ($.kind === "file" && de.includes($.type)) {
        const q = $.getAsFile();
        q && C.push(q);
      }
    }
    C.length > 0 && (d.preventDefault(), W(C));
  }, [s, W]);
  j(() => (document.addEventListener("paste", P), c == null || c.addEventListener("paste", P), () => {
    document.removeEventListener("paste", P), c == null || c.removeEventListener("paste", P);
  }), [P, c]);
  const k = z((d) => {
    d.preventDefault(), d.stopPropagation(), N.current++, N.current === 1 && x(!0);
  }, []), B = z((d) => {
    d.preventDefault(), d.stopPropagation(), N.current--, N.current === 0 && x(!1);
  }, []), p = z((d) => {
    d.preventDefault(), d.stopPropagation();
  }, []), L = z((d) => {
    if (d.preventDefault(), d.stopPropagation(), N.current = 0, x(!1), s) return;
    const b = Array.from(d.dataTransfer.files);
    W(b);
  }, [s, W]), O = z(() => {
    var d;
    s || (d = A.current) == null || d.click();
  }, [s]), G = z((d) => {
    const b = d.target.files ? Array.from(d.target.files) : [];
    b.length > 0 && W(b), A.current && (A.current.value = "");
  }, [W]), w = (d) => d < 1024 ? `${d}B` : d < 1024 * 1024 ? `${(d / 1024).toFixed(0)}KB` : `${(d / (1024 * 1024)).toFixed(1)}MB`;
  return /* @__PURE__ */ t("div", { className: "debug-field", children: [
    /* @__PURE__ */ t("label", { children: [
      "画像添付（",
      o.length,
      "/",
      m,
      "）"
    ] }),
    /* @__PURE__ */ t(
      "div",
      {
        className: `debug-dropzone ${u ? "dragging" : ""} ${s ? "disabled" : ""}`,
        onDragEnter: k,
        onDragLeave: B,
        onDragOver: p,
        onDrop: L,
        onClick: O,
        role: "button",
        tabIndex: 0,
        onKeyDown: (d) => {
          (d.key === "Enter" || d.key === " ") && O();
        },
        children: [
          /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "24px", color: le.gray500 }, children: u ? "file_download" : "add_photo_alternate" }),
          /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: le.gray500 }, children: u ? "ドロップして追加" : "クリック / ドラッグ / Ctrl+V で画像を追加" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        ref: A,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        multiple: !0,
        style: { display: "none" },
        onChange: G
      }
    ),
    v && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: le.error }, children: v }),
    o.length > 0 && /* @__PURE__ */ e("div", { className: "debug-thumbnails", children: o.map((d, b) => /* @__PURE__ */ e(
      Pe,
      {
        file: d,
        onRemove: () => h(b),
        formatSize: w
      },
      `${d.name}-${d.size}-${b}`
    )) })
  ] });
}
function Pe({ file: o, onRemove: a, formatSize: h }) {
  const [m, f] = E(null);
  return j(() => {
    const s = URL.createObjectURL(o);
    return f(s), () => URL.revokeObjectURL(s);
  }, [o]), /* @__PURE__ */ t("div", { className: "debug-thumbnail", children: [
    m && /* @__PURE__ */ e("img", { src: m, alt: o.name, className: "debug-thumbnail-img" }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "debug-thumbnail-remove",
        onClick: (s) => {
          s.stopPropagation(), a();
        },
        "aria-label": "削除",
        children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "close" })
      }
    ),
    /* @__PURE__ */ e("div", { className: "debug-thumbnail-info", children: h(o.size) })
  ] });
}
function re({
  content: o,
  className: a = "",
  onLinkClick: h,
  onAppLinkClick: m
}) {
  const f = {
    a: ({ href: s, children: c, ...u }) => {
      if (s && s.startsWith("app:") && m) {
        const x = s.replace("app:", "");
        return /* @__PURE__ */ e(
          "span",
          {
            role: "link",
            tabIndex: 0,
            onClick: (v) => {
              v.preventDefault(), v.stopPropagation(), m(x);
            },
            onKeyDown: (v) => {
              (v.key === "Enter" || v.key === " ") && (v.preventDefault(), m(x));
            },
            style: {
              color: "#043E80",
              textDecoration: "underline",
              cursor: "pointer"
            },
            ...u,
            children: c
          }
        );
      }
      return s && /\.md(#|$|\?)/.test(s) && h ? /* @__PURE__ */ e(
        "a",
        {
          href: s,
          onClick: (x) => {
            x.preventDefault(), h(s);
          },
          style: {
            color: "#043E80",
            textDecoration: "underline",
            cursor: "pointer"
          },
          ...u,
          children: c
        }
      ) : /* @__PURE__ */ e(
        "a",
        {
          href: s,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { color: "#043E80" },
          ...u,
          children: c
        }
      );
    }
  };
  return /* @__PURE__ */ e("div", { className: `manual-markdown ${a}`, children: /* @__PURE__ */ e(Ee, { remarkPlugins: [$e], rehypePlugins: [Be], components: f, children: o }) });
}
const me = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap", Ne = `
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'liga';
  }
`;
function oe(o = !1) {
  if (typeof document > "u")
    return !1;
  const a = document.querySelector('link[href*="Material+Symbols"]');
  if (a && !o)
    return !1;
  a && o && a.remove();
  const h = document.createElement("link");
  return h.rel = "stylesheet", h.href = me, document.head.appendChild(h), !0;
}
function ae() {
  return typeof window < "u" && window.__MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__ === !0;
}
const We = [
  { value: "bug", label: "不具合", color: "#DC2626" },
  { value: "question", label: "質問", color: "#2563EB" },
  { value: "request", label: "要望", color: "#059669" },
  { value: "share", label: "共有", color: "#6B7280" },
  { value: "other", label: "その他", color: "#9333EA" }
], Oe = `
  .debug-field { margin-bottom: 0; }
  .debug-field > label { display: block; font-size: 12px; color: #6B7280; margin-bottom: 6px; }
  .debug-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px; padding: 12px; border: 2px dashed #D1D5DB; border-radius: 8px;
    cursor: pointer; transition: all 0.15s; background: #fff;
  }
  .debug-dropzone:hover { border-color: #3B82F6; background: #F9FAFB; }
  .debug-dropzone.dragging { border-color: #3B82F6; background: rgba(59,130,246,0.05); }
  .debug-dropzone.disabled { opacity: 0.5; cursor: not-allowed; }
  .debug-icon { font-family: 'Material Symbols Outlined'; }
  .debug-thumbnails { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .debug-thumbnail {
    position: relative; width: 56px; height: 56px; border-radius: 6px;
    overflow: hidden; border: 1px solid #E5E7EB;
  }
  .debug-thumbnail-img { width: 100%; height: 100%; object-fit: cover; }
  .debug-thumbnail-remove {
    position: absolute; top: 2px; right: 2px; width: 18px; height: 18px;
    border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff;
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; padding: 0;
  }
  .debug-thumbnail-info {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 2px 4px;
    background: rgba(0,0,0,0.5); color: #fff; font-size: 9px; text-align: center;
  }
`;
function fe({
  apiBaseUrl: o,
  userType: a,
  appVersion: h,
  onSubmitSuccess: m,
  onSubmitError: f
}) {
  const { submitting: s, submitFeedback: c } = Ce({
    apiBaseUrl: o,
    userType: a,
    appVersion: h
  });
  j(() => {
    ae() || oe();
  }, []);
  const u = X(null);
  j(() => {
    try {
      const l = Le({
        // フィードバックAPI自身への fetch を除外（無限ループ防止）
        networkExclude: [o]
      });
      return u.current = l, () => {
        l.destroy(), u.current = null;
      };
    } catch (l) {
      return console.error("Failed to create log capture:", l), () => {
      };
    }
  }, [o]);
  const [x, v] = E(null), [y, A] = E(""), [N, W] = E(!1), [P, k] = E(""), [B, p] = E(""), [L, O] = E([]), [G, w] = E(!1), [d, b] = E(null), C = X(), R = X(!1);
  j(() => () => {
    C.current && clearTimeout(C.current);
  }, []);
  const M = x !== null && y.trim() !== "" && !s, $ = z(async () => {
    var I;
    if (!x || !y.trim() || R.current) return;
    R.current = !0;
    let l = y.trim();
    (P.trim() || B.trim()) && (l += `

---`, P.trim() && (l += `
再現手順:
${P.trim()}`), B.trim() && (l += `
期待結果:
${B.trim()}`));
    const D = x === "bug" && u.current ? {
      consoleLogs: u.current.getConsoleLogs(),
      networkLogs: u.current.getNetworkLogs()
    } : void 0, { data: S, error: T } = await c({
      kind: x,
      message: l
    }, D);
    if (S) {
      if (L.length > 0)
        for (const H of L)
          try {
            await Re({
              apiBaseUrl: o,
              feedbackId: S.id,
              file: H
            });
          } catch (K) {
            console.error("Failed to upload attachment:", K);
          }
      v(null), A(""), k(""), p(""), W(!1), O([]), b(null), (I = u.current) == null || I.clear(), w(!0), C.current && clearTimeout(C.current), C.current = setTimeout(() => w(!1), 3e3), m == null || m(S);
    } else
      b(T), f == null || f(T ?? new Error("Unknown error"));
    R.current = !1;
  }, [x, y, P, B, L, o, c, m, f]), q = z(
    (l) => {
      (l.metaKey || l.ctrlKey) && l.key === "Enter" && M && (l.preventDefault(), $());
    },
    [M, $]
  ), V = z((l) => {
    O((D) => [...D, ...l]);
  }, []), r = z((l) => {
    O((D) => D.filter((S, T) => T !== l));
  }, []);
  return /* @__PURE__ */ t("div", { style: F.container, children: [
    /* @__PURE__ */ e("style", { children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }${Oe}` }),
    /* @__PURE__ */ e("div", { style: F.section, children: /* @__PURE__ */ e("div", { style: F.tagGroup, role: "radiogroup", "aria-label": "フィードバック種別", children: We.map((l) => /* @__PURE__ */ e(
      "button",
      {
        role: "radio",
        "aria-checked": x === l.value,
        onClick: () => v(x === l.value ? null : l.value),
        style: {
          ...F.tag,
          ...x === l.value ? { backgroundColor: l.color, color: "#fff", borderColor: l.color } : { borderColor: "#D1D5DB", color: "#6B7280" }
        },
        children: l.label
      },
      l.value
    )) }) }),
    /* @__PURE__ */ e("div", { style: F.section, children: /* @__PURE__ */ e(
      "textarea",
      {
        value: y,
        onChange: (l) => A(l.target.value),
        onKeyDown: q,
        placeholder: "気づいたことをそのまま書いてください（一言でもOK）",
        "aria-label": "フィードバックメッセージ",
        rows: 4,
        maxLength: 4e3,
        style: F.textarea
      }
    ) }),
    /* @__PURE__ */ e("div", { style: F.section, children: /* @__PURE__ */ e(
      Ae,
      {
        files: L,
        onAdd: V,
        onRemove: r,
        maxFiles: 3,
        disabled: s
      }
    ) }),
    x === "bug" && /* @__PURE__ */ t("div", { style: F.logNotice, children: [
      /* @__PURE__ */ e("span", { style: F.iconSmall, children: "info" }),
      "不具合タグを選択すると、直前の動作ログが自動で添付されます"
    ] }),
    /* @__PURE__ */ t("div", { style: F.section, children: [
      /* @__PURE__ */ t("button", { onClick: () => W(!N), style: F.detailToggle, "aria-expanded": N, children: [
        /* @__PURE__ */ e("span", { style: F.iconSmall, children: N ? "expand_less" : "expand_more" }),
        "詳細情報（任意）"
      ] }),
      N && /* @__PURE__ */ t("div", { style: F.detailArea, children: [
        /* @__PURE__ */ e("label", { style: F.label, children: "再現手順:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: P,
            onChange: (l) => k(l.target.value),
            "aria-label": "再現手順",
            rows: 2,
            style: F.textarea
          }
        ),
        /* @__PURE__ */ e("label", { style: { ...F.label, marginTop: "8px" }, children: "期待結果:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: B,
            onChange: (l) => p(l.target.value),
            "aria-label": "期待結果",
            rows: 2,
            style: F.textarea
          }
        )
      ] })
    ] }),
    d && /* @__PURE__ */ t("div", { style: F.errorMsg, role: "alert", children: [
      /* @__PURE__ */ e("span", { style: F.iconSmall, children: "warning" }),
      d.message.slice(0, 200)
    ] }),
    /* @__PURE__ */ e("div", { style: F.submitRow, children: /* @__PURE__ */ e("button", { onClick: $, disabled: !M, style: {
      ...F.submitButton,
      opacity: M ? 1 : 0.5,
      cursor: M ? "pointer" : "not-allowed"
    }, children: s ? /* @__PURE__ */ e("span", { style: { ...F.iconSmall, animation: "spin 1s linear infinite" }, children: "progress_activity" }) : "送信" }) }),
    G && /* @__PURE__ */ e("div", { style: F.toast, role: "status", children: "送信しました" })
  ] });
}
const F = {
  container: {
    padding: "16px",
    fontSize: "13px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative"
  },
  section: {
    marginBottom: "12px"
  },
  tagGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  tag: {
    padding: "4px 12px",
    borderRadius: "16px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    background: "transparent",
    transition: "all 0.15s ease"
  },
  iconSmall: {
    fontFamily: "Material Symbols Outlined",
    fontSize: "16px",
    lineHeight: 1
  },
  textarea: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    fontSize: "13px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box"
  },
  logNotice: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 10px",
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "6px",
    color: "#2563EB",
    fontSize: "12px",
    marginBottom: "12px"
  },
  detailToggle: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    color: "#6B7280",
    fontSize: "12px",
    cursor: "pointer",
    padding: 0
  },
  detailArea: {
    marginTop: "8px"
  },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#6B7280",
    marginBottom: "4px"
  },
  errorMsg: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 10px",
    backgroundColor: "#FEE2E2",
    border: "1px solid #FECACA",
    borderRadius: "6px",
    color: "#DC2626",
    fontSize: "12px",
    marginBottom: "12px"
  },
  submitRow: {
    display: "flex",
    justifyContent: "flex-end"
  },
  submitButton: {
    padding: "8px 24px",
    backgroundColor: "#043E80",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600
  },
  toast: {
    position: "absolute",
    bottom: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 20px",
    backgroundColor: "#059669",
    color: "#fff",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600
  }
};
function en({
  isOpen: o,
  docPath: a,
  onClose: h,
  onNavigate: m,
  onAppNavigate: f,
  initialSize: s = { width: 420, height: 550 },
  showDownloadButton: c = !1,
  feedbackApiBaseUrl: u,
  feedbackUserType: x,
  feedbackAppVersion: v,
  onFeedbackSubmitSuccess: y,
  onFeedbackSubmitError: A,
  feedbackDefaultHeight: N = 200,
  feedbackMinHeight: W = 150,
  feedbackMaxHeight: P = 400
}) {
  const [k, B] = E(null), [p, L] = E(null), { content: O, loading: G, error: w } = te(a), { downloadMd: d } = ze(), b = X(!1), [C, R] = E(!1), M = u != null, [$, q] = E(!0), V = z(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported");
      return;
    }
    if (!b.current) {
      b.current = !0;
      try {
        const S = M ? 650 : s.width, T = s.height, I = await window.documentPictureInPicture.requestWindow({
          width: S,
          height: T
        }), H = I.document.createElement("style");
        H.textContent = He(), I.document.head.appendChild(H);
        const K = I.document.createElement("div");
        K.id = "manual-pip-root", I.document.body.appendChild(K), B(I), L(K), I.addEventListener("pagehide", () => {
          B(null), L(null), h();
        });
      } catch (S) {
        console.error("Failed to open PiP window:", S);
      } finally {
        b.current = !1;
      }
    }
  }, [s.width, s.height, h]), r = z(() => {
    k && (k.close(), B(null), L(null));
  }, [k]);
  j(() => {
    o && !k ? V() : !o && k && r();
  }, [o, k, V, r]);
  const l = z(
    (S) => {
      if (m) {
        const T = a ? a.substring(0, a.lastIndexOf("/") + 1) : "/docs/", I = S.startsWith("/") ? S : T + S;
        m(I);
      }
    },
    [a, m]
  );
  j(() => {
    if (!k || !f) return;
    const S = (I) => {
      var Y;
      const K = I.target.closest("a");
      if (K) {
        const U = K.getAttribute("href");
        if (console.log("[ManualPiP] Link clicked", {
          href: U,
          text: (Y = K.textContent) == null ? void 0 : Y.substring(0, 30),
          startsWithHashApp: U == null ? void 0 : U.startsWith("#app:")
        }), U && U.startsWith("#app:")) {
          console.log("[ManualPiP] App link detected! Preventing default"), I.preventDefault(), I.stopPropagation();
          const Z = U.replace("#app:", "");
          console.log("[ManualPiP] Calling onAppNavigate", { appPath: Z }), f(Z);
        }
      }
    }, T = (I) => {
      var Y;
      const H = I.target, K = ((Y = H.querySelector("summary")) == null ? void 0 : Y.textContent) || "unknown";
      console.log("[ManualPiP] Details toggle", {
        open: H.open,
        summary: K
      }), H.open && setTimeout(() => {
        const U = H.querySelectorAll('a[href^="app:"]'), Z = H.querySelectorAll("a"), ie = Array.from(Z).map((ee) => {
          var Q;
          return {
            href: ee.getAttribute("href"),
            text: (Q = ee.textContent) == null ? void 0 : Q.substring(0, 20)
          };
        });
        console.log("[ManualPiP] Links in opened details", {
          totalLinks: Z.length,
          appLinksCount: U.length,
          allHrefs: ie
        });
      }, 100);
    };
    return k.document.addEventListener("click", S, !0), k.document.addEventListener("toggle", T, !0), () => {
      k.document.removeEventListener("click", S, !0), k.document.removeEventListener("toggle", T, !0);
    };
  }, [k, f]);
  const D = z(async () => {
    if (a) {
      R(!0);
      try {
        await d(a);
      } catch (S) {
        console.error("Download failed:", S);
      } finally {
        R(!1);
      }
    }
  }, [a, d]);
  return p ? Se(
    /* @__PURE__ */ t("div", { className: "pip-container", children: [
      /* @__PURE__ */ t("header", { className: "pip-header", children: [
        /* @__PURE__ */ t("div", { className: "pip-header-left", children: [
          /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu_book" }),
          /* @__PURE__ */ e("span", { className: "pip-title", children: "マニュアル" })
        ] }),
        /* @__PURE__ */ t("div", { className: "pip-header-right", children: [
          c && a && /* @__PURE__ */ e(
            "button",
            {
              onClick: D,
              className: "pip-download-btn",
              "aria-label": "ダウンロード",
              disabled: C,
              children: /* @__PURE__ */ e("span", { className: `pip-icon ${C ? "pip-spin" : ""}`, children: C ? "progress_activity" : "download" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: r,
              className: "pip-close-btn",
              "aria-label": "閉じる",
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "close" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ t("div", { className: "pip-body", children: [
        /* @__PURE__ */ t("main", { className: "pip-content", children: [
          G && /* @__PURE__ */ t("div", { className: "pip-loading", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-spin", children: "progress_activity" }),
            /* @__PURE__ */ e("span", { children: "読み込み中..." })
          ] }),
          w && /* @__PURE__ */ t("div", { className: "pip-error", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon", children: "warning" }),
            /* @__PURE__ */ t("div", { className: "pip-error-text", children: [
              /* @__PURE__ */ e("div", { className: "pip-error-title", children: "エラーが発生しました" }),
              /* @__PURE__ */ e("div", { className: "pip-error-detail", children: w.message })
            ] })
          ] }),
          O && /* @__PURE__ */ e(
            re,
            {
              content: O,
              onLinkClick: l,
              onAppLinkClick: f
            }
          ),
          !G && !w && !O && /* @__PURE__ */ t("div", { className: "pip-empty", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-large", children: "description" }),
            /* @__PURE__ */ e("span", { children: "マニュアルを選択してください" })
          ] })
        ] }),
        M && /* @__PURE__ */ e("aside", { className: "pip-sidebar", style: { width: "300px" }, children: u != null && /* @__PURE__ */ t(
          "div",
          {
            className: "pip-feedback-section",
            style: {
              height: $ ? "100%" : "auto",
              flex: $ ? 1 : "0 0 auto"
            },
            children: [
              /* @__PURE__ */ t("div", { className: "pip-feedback-header", children: [
                /* @__PURE__ */ t("div", { className: "pip-feedback-header-left", children: [
                  /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-small", children: "rate_review" }),
                  /* @__PURE__ */ e("span", { className: "pip-sidebar-title", children: "フィードバック" })
                ] }),
                /* @__PURE__ */ t(
                  "button",
                  {
                    onClick: () => q(!$),
                    className: "pip-toggle-btn",
                    "aria-label": $ ? "フィードバックを閉じる" : "フィードバックを開く",
                    children: [
                      /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "18px" }, children: $ ? "expand_less" : "expand_more" }),
                      /* @__PURE__ */ e("span", { children: $ ? "閉じる" : "開く" })
                    ]
                  }
                )
              ] }),
              $ && /* @__PURE__ */ e("div", { className: "pip-feedback-content", children: /* @__PURE__ */ e(
                fe,
                {
                  apiBaseUrl: u,
                  userType: x,
                  appVersion: v,
                  onSubmitSuccess: y,
                  onSubmitError: A
                }
              ) })
            ]
          }
        ) })
      ] })
    ] }),
    p
  ) : null;
}
function He() {
  return `
    @import url('${me}');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${n.white};
      overflow: hidden;
    }

    ${Ne}

    .pip-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
    }

    .pip-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* ヘッダー */
    .pip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: ${n.primary};
      color: ${n.white};
    }

    .pip-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pip-header-left .pip-icon {
      color: ${n.secondary};
    }

    .pip-title {
      font-size: 16px;
      font-weight: 700;
    }

    .pip-header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pip-download-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: ${n.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-download-btn:hover:not(:disabled) {
      background: ${n.tertiary};
    }

    .pip-download-btn:focus {
      outline: 2px solid ${n.secondary};
      outline-offset: 2px;
    }

    .pip-download-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .pip-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: ${n.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-close-btn:hover {
      background: ${n.tertiary};
    }

    .pip-close-btn:focus {
      outline: 2px solid ${n.secondary};
      outline-offset: 2px;
    }

    /* ボディ */
    .pip-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* コンテンツエリア */
    .pip-content {
      flex: 1;
      overflow: auto;
      padding: 24px;
      line-height: 1.6;
      min-width: 0;
    }

    /* サイドバー（フィードバック用） */
    .pip-sidebar {
      overflow: hidden;
      flex-shrink: 0;
      border-left: 1px solid ${n.gray300};
      display: flex;
      flex-direction: column;
    }

    /* サイドバーヘッダー（フィードバック用） */
    .pip-sidebar-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid ${n.gray300};
      background-color: ${n.gray100};
      flex-shrink: 0;
    }

    .pip-icon-small {
      font-size: 20px;
      color: ${n.tertiary};
    }

    .pip-sidebar-title {
      font-size: 14px;
      font-weight: 600;
      color: ${n.tertiary};
    }

    /* Feedback Section */
    .pip-feedback-section {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .pip-feedback-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid ${n.gray300};
      border-bottom: 1px solid ${n.gray300};
      background-color: ${n.gray100};
      flex-shrink: 0;
    }

    .pip-feedback-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pip-toggle-btn {
      background: transparent;
      border: 1px solid ${n.gray300};
      padding: 8px 12px;
      cursor: pointer;
      color: ${n.gray700};
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      min-height: 36px;
    }

    .pip-toggle-btn:hover {
      background-color: ${n.gray100};
      border-color: ${n.gray700};
    }

    .pip-toggle-btn:active {
      background-color: ${n.gray700};
      color: ${n.white};
    }

    .pip-feedback-content {
      flex: 1;
      overflow: auto;
    }

    /* ローディング */
    .pip-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      color: ${n.gray500};
      font-size: 16px;
    }

    .pip-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* エラー */
    .pip-error {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: ${n.errorBg};
      border: 1px solid #FECACA;
      border-radius: 12px;
      color: ${n.error};
    }

    .pip-error .pip-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .pip-error-title {
      font-size: 16px;
      font-weight: 600;
    }

    .pip-error-detail {
      font-size: 14px;
      margin-top: 8px;
    }

    /* 空状態 */
    .pip-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: ${n.gray500};
      font-size: 14px;
    }

    .pip-icon-large {
      font-size: 64px;
      opacity: 0.5;
    }

    /* Markdown スタイル */
    .manual-markdown {
      color: ${n.gray700};
    }

    .manual-markdown h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${n.primary};
      border-bottom: 2px solid ${n.secondary};
      padding-bottom: 8px;
    }

    .manual-markdown h2 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      color: ${n.tertiary};
    }

    .manual-markdown h3 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 8px;
      color: ${n.gray700};
    }

    .manual-markdown p {
      margin-bottom: 12px;
    }

    .manual-markdown ul,
    .manual-markdown ol {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    .manual-markdown li {
      margin-bottom: 4px;
    }

    .manual-markdown a {
      color: ${n.primary};
      text-decoration: underline;
      cursor: pointer;
    }

    .manual-markdown a:hover {
      color: ${n.tertiary};
    }

    .manual-markdown code {
      background: ${n.gray100};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 14px;
    }

    .manual-markdown pre {
      background: ${n.gray100};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 12px;
    }

    .manual-markdown pre code {
      background: transparent;
      padding: 0;
    }

    .manual-markdown table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }

    .manual-markdown th,
    .manual-markdown td {
      border: 1px solid ${n.gray300};
      padding: 8px 12px;
      text-align: left;
    }

    .manual-markdown th {
      background: ${n.gray100};
      font-weight: 600;
    }

    .manual-markdown hr {
      border: none;
      border-top: 1px solid ${n.gray300};
      margin: 24px 0;
    }

    .manual-markdown blockquote {
      border-left: 4px solid ${n.secondary};
      padding-left: 16px;
      margin: 12px 0;
      color: ${n.gray500};
    }
  `;
}
function nn({
  items: o,
  onSelect: a,
  activePath: h,
  className: m = "",
  onPiP: f,
  onNewTab: s
}) {
  j(() => {
    ae() || oe();
  }, []);
  const c = ve(() => {
    const u = {}, x = [], v = [...o].sort((y, A) => (y.order ?? 0) - (A.order ?? 0));
    for (const y of v)
      y.category ? (u[y.category] || (u[y.category] = []), u[y.category].push(y)) : x.push(y);
    return { groups: u, uncategorized: x };
  }, [o]);
  return /* @__PURE__ */ t("nav", { className: `manual-sidebar ${m}`, children: [
    c.uncategorized.length > 0 && /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: c.uncategorized.map((u) => /* @__PURE__ */ e(
      ce,
      {
        item: u,
        isActive: h === u.path,
        onSelect: a,
        onPiP: f,
        onNewTab: s
      },
      u.id
    )) }),
    Object.entries(c.groups).map(([u, x]) => /* @__PURE__ */ t("div", { style: { marginTop: "16px" }, children: [
      /* @__PURE__ */ e(
        "div",
        {
          style: {
            fontSize: "12px",
            fontWeight: "bold",
            color: "#666",
            textTransform: "uppercase",
            padding: "8px 12px"
          },
          children: u
        }
      ),
      /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: x.map((v) => /* @__PURE__ */ e(
        ce,
        {
          item: v,
          isActive: h === v.path,
          onSelect: a,
          onPiP: f,
          onNewTab: s
        },
        v.id
      )) })
    ] }, u))
  ] });
}
function ce({ item: o, isActive: a, onSelect: h, onPiP: m, onNewTab: f }) {
  const s = {
    itemRow: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      width: "100%"
    },
    itemButton: {
      display: "block",
      flex: 1,
      padding: "8px 12px",
      border: "none",
      background: a ? "#e3f2fd" : "transparent",
      textAlign: "left",
      cursor: "pointer",
      fontSize: "14px",
      color: a ? "#1976d2" : "#333",
      borderLeft: a ? "3px solid #1976d2" : "3px solid transparent"
    },
    actionButtons: {
      display: "flex",
      gap: "2px",
      flexShrink: 0,
      paddingRight: "4px"
    },
    actionBtn: {
      background: "none",
      border: "none",
      padding: "4px",
      cursor: "pointer",
      color: n.gray500,
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      borderRadius: "2px",
      transition: "background-color 0.15s ease, color 0.15s ease"
    },
    icon: {
      fontFamily: "Material Symbols Outlined",
      fontSize: "16px",
      fontWeight: "normal",
      fontStyle: "normal",
      lineHeight: 1,
      letterSpacing: "normal",
      textTransform: "none",
      display: "inline-block",
      whiteSpace: "nowrap",
      wordWrap: "normal",
      direction: "ltr",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      textRendering: "optimizeLegibility",
      fontFeatureSettings: "'liga'"
    }
  };
  return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ t("div", { style: s.itemRow, children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => h(o.path),
        style: s.itemButton,
        children: o.title
      }
    ),
    /* @__PURE__ */ t("div", { style: s.actionButtons, children: [
      m && /* @__PURE__ */ e(
        "button",
        {
          onClick: (c) => {
            c.stopPropagation(), m(o.path);
          },
          style: s.actionBtn,
          title: "PiPで開く",
          "aria-label": "PiPで開く",
          onMouseEnter: (c) => {
            c.currentTarget.style.backgroundColor = n.gray100, c.currentTarget.style.color = n.primary;
          },
          onMouseLeave: (c) => {
            c.currentTarget.style.backgroundColor = "transparent", c.currentTarget.style.color = n.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: s.icon, children: "picture_in_picture_alt" })
        }
      ),
      f && /* @__PURE__ */ e(
        "button",
        {
          onClick: (c) => {
            c.stopPropagation(), f(o.path);
          },
          style: s.actionBtn,
          title: "新しいタブで開く",
          "aria-label": "新しいタブで開く",
          onMouseEnter: (c) => {
            c.currentTarget.style.backgroundColor = n.gray100, c.currentTarget.style.color = n.primary;
          },
          onMouseLeave: (c) => {
            c.currentTarget.style.backgroundColor = "transparent", c.currentTarget.style.color = n.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: s.icon, children: "open_in_new" })
        }
      )
    ] })
  ] }) });
}
function tn({
  path: o,
  onClick: a,
  children: h,
  className: m = ""
}) {
  return /* @__PURE__ */ e(
    "a",
    {
      href: o,
      onClick: (s) => {
        s.preventDefault(), a(o);
      },
      className: `manual-link ${m}`,
      style: {
        color: "#1976d2",
        textDecoration: "underline",
        cursor: "pointer"
      },
      children: h
    }
  );
}
function rn({ docPath: o, className: a = "" }) {
  const { content: h, loading: m, error: f, reload: s } = te(o);
  return /* @__PURE__ */ t(
    "article",
    {
      className: `manual-page ${a}`,
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px"
      },
      children: [
        m && /* @__PURE__ */ e("div", { style: { textAlign: "center", padding: "40px", color: "#666" }, children: "読み込み中..." }),
        f && /* @__PURE__ */ t(
          "div",
          {
            style: {
              padding: "20px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              color: "#c62828"
            },
            children: [
              /* @__PURE__ */ t("p", { style: { margin: 0 }, children: [
                "マニュアルの読み込みに失敗しました: ",
                f.message
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  onClick: s,
                  style: {
                    marginTop: "12px",
                    padding: "8px 16px",
                    border: "1px solid #c62828",
                    borderRadius: "4px",
                    background: "transparent",
                    color: "#c62828",
                    cursor: "pointer"
                  },
                  children: "再試行"
                }
              )
            ]
          }
        ),
        h && /* @__PURE__ */ e(re, { content: h })
      ]
    }
  );
}
const je = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.manual-resize-handle {
  background-color: ${n.gray300};
}

.manual-resize-handle:hover,
.manual-resize-handle.resizing {
  background-color: ${n.secondary};
}

.manual-v-resize-handle {
  background-color: ${n.gray300};
}

.manual-v-resize-handle:hover,
.manual-v-resize-handle.resizing {
  background-color: ${n.secondary};
}

@media print {
  .manual-tab-page > header { display: none !important; }
  .manual-tab-page main { max-width: 100% !important; }
  .manual-tab-page .manual-resize-handle,
  .manual-tab-page .manual-v-resize-handle,
  .manual-tab-page aside { display: none !important; }
}

/* Markdown スタイル */
.manual-markdown {
  color: ${n.gray700};
}

.manual-markdown h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${n.primary};
  border-bottom: 2px solid ${n.secondary};
  padding-bottom: 8px;
}

.manual-markdown h2 {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${n.tertiary};
}

.manual-markdown h3 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${n.gray700};
}

.manual-markdown p {
  margin-bottom: 12px;
}

.manual-markdown ul,
.manual-markdown ol {
  margin-bottom: 12px;
  padding-left: 24px;
}

.manual-markdown li {
  margin-bottom: 4px;
}

.manual-markdown a {
  color: ${n.primary};
  text-decoration: underline;
  cursor: pointer;
}

.manual-markdown a:hover {
  color: ${n.tertiary};
}

.manual-markdown code {
  background: ${n.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

.manual-markdown pre {
  background: ${n.gray100};
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.manual-markdown pre code {
  background: transparent;
  padding: 0;
}

.manual-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.manual-markdown th,
.manual-markdown td {
  border: 1px solid ${n.gray300};
  padding: 8px 12px;
  text-align: left;
}

.manual-markdown th {
  background: ${n.gray100};
  font-weight: 600;
}

.manual-markdown hr {
  border: none;
  border-top: 1px solid ${n.gray300};
  margin: 24px 0;
}

.manual-markdown blockquote {
  border-left: 4px solid ${n.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${n.gray500};
}
`;
function pe(o, a) {
  if (o.startsWith("/")) return o;
  const h = a ? a.substring(0, a.lastIndexOf("/") + 1) : "/docs/";
  try {
    return new URL(o, "http://d" + h).pathname;
  } catch {
    return h + o;
  }
}
function on({
  defaultDocPath: o,
  sidebarPath: a,
  onSidebarNavigate: h,
  onSidebarAppNavigate: m,
  sidebarDefaultWidth: f = 400,
  sidebarMinWidth: s = 250,
  sidebarMaxWidth: c = 800,
  feedbackApiBaseUrl: u,
  feedbackUserType: x,
  feedbackAppVersion: v,
  feedbackAdminUrl: y,
  feedbackDefaultHeight: A = 350,
  feedbackMinHeight: N = 200,
  feedbackMaxHeight: W = 600,
  onFeedbackSubmitSuccess: P,
  onFeedbackSubmitError: k
} = {}) {
  const [B, p] = E(null), { content: L, loading: O, error: G } = te(B), [w, d] = E(!0), [b, C] = E(400), [R, M] = E(a ?? null);
  j(() => {
    h === void 0 && M(a ?? null);
  }, [a, h]);
  const $ = h !== void 0, q = $ ? a ?? null : R, {
    content: V,
    loading: r,
    error: l
  } = te(q), { size: D, isResizing: S, handleMouseDown: T, handleKeyDown: I } = se({
    defaultSize: f,
    minSize: s,
    maxSize: c
  }), H = a != null && u != null, K = X(null), {
    size: Y,
    isResizing: U,
    handleMouseDown: Z,
    handleKeyDown: ie
  } = se({
    defaultSize: A,
    minSize: N,
    maxSize: W,
    direction: "vertical",
    enabled: H && w
  });
  j(() => {
    H && w && C(Y);
  }, [Y, H, w]);
  const ee = De(), Q = X(null);
  j(() => {
    ae() || oe();
  }, []), j(() => {
    Q.current && (Q.current.scrollTop = 0);
  }, [q]);
  const xe = a != null || u != null;
  j(() => {
    const J = new URLSearchParams(window.location.search).get("path");
    J ? p(J) : o && p(o);
  }, [o]);
  const ye = z(
    (_) => {
      const J = pe(_, B), ne = `${window.location.pathname}?path=${encodeURIComponent(J)}`;
      window.history.pushState({}, "", ne), p(J);
    },
    [B]
  ), be = z((_) => {
    window.opener && !window.opener.closed && window.opener.postMessage({ type: "manual-app-navigate", path: _ }, window.location.origin);
  }, []), ke = z(
    (_) => {
      const J = pe(_, q);
      $ ? h(J) : M(J);
    },
    [$, h, q]
  ), we = z(
    (_) => {
      m == null || m(_);
    },
    [m]
  );
  return j(() => {
    const _ = () => {
      const ne = new URLSearchParams(window.location.search).get("path");
      ne && p(ne);
    };
    return window.addEventListener("popstate", _), () => window.removeEventListener("popstate", _);
  }, []), /* @__PURE__ */ t("div", { className: "manual-tab-page", style: g.container, children: [
    /* @__PURE__ */ t("header", { style: g.header, children: [
      /* @__PURE__ */ t("div", { style: g.headerLeft, children: [
        /* @__PURE__ */ e("span", { style: g.icon, children: "menu_book" }),
        /* @__PURE__ */ e("span", { style: g.title, children: "マニュアル" })
      ] }),
      /* @__PURE__ */ t("div", { style: g.headerRight, children: [
        ee && y && /* @__PURE__ */ e(
          "button",
          {
            onClick: () => window.open(y, "_blank"),
            style: g.headerButton,
            title: "フィードバック管理",
            children: /* @__PURE__ */ e("span", { style: g.icon, children: "admin_panel_settings" })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => window.print(),
            style: g.headerButton,
            title: "印刷",
            children: /* @__PURE__ */ e("span", { style: g.icon, children: "print" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ t("div", { style: g.body, children: [
      /* @__PURE__ */ e("main", { style: g.mainPane, children: /* @__PURE__ */ t("div", { style: g.mainContent, children: [
        O && /* @__PURE__ */ t("div", { style: g.loading, children: [
          /* @__PURE__ */ e("span", { style: { ...g.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
          /* @__PURE__ */ e("span", { children: "読み込み中..." })
        ] }),
        G && /* @__PURE__ */ t("div", { style: g.error, children: [
          /* @__PURE__ */ e("span", { style: g.icon, children: "warning" }),
          /* @__PURE__ */ t("div", { children: [
            /* @__PURE__ */ e("div", { style: g.errorTitle, children: "エラーが発生しました" }),
            /* @__PURE__ */ e("div", { style: g.errorDetail, children: G.message })
          ] })
        ] }),
        L && /* @__PURE__ */ e(
          re,
          {
            content: L,
            onLinkClick: ye,
            onAppLinkClick: be
          }
        ),
        !O && !G && !L && !B && /* @__PURE__ */ t("div", { style: g.empty, children: [
          /* @__PURE__ */ e("span", { style: { ...g.icon, fontSize: "64px", opacity: 0.5 }, children: "description" }),
          /* @__PURE__ */ e("span", { children: "マニュアルが指定されていません" })
        ] })
      ] }) }),
      xe && /* @__PURE__ */ t(he, { children: [
        /* @__PURE__ */ e(
          "div",
          {
            className: `manual-resize-handle${S ? " resizing" : ""}`,
            onMouseDown: T,
            onKeyDown: I,
            style: g.resizeHandle,
            role: "separator",
            "aria-orientation": "vertical",
            "aria-valuenow": D,
            "aria-valuemin": s,
            "aria-valuemax": c,
            "aria-label": "サイドバーのリサイズ",
            tabIndex: 0
          }
        ),
        /* @__PURE__ */ t("aside", { style: { ...g.sidebarPane, width: D }, children: [
          a != null && /* @__PURE__ */ t(
            "div",
            {
              ref: K,
              style: {
                display: "flex",
                flexDirection: "column",
                flex: u && w ? `0 0 ${b}px` : 1,
                minHeight: 0
              },
              children: [
                /* @__PURE__ */ t("div", { style: g.sidebarHeader, children: [
                  !$ && R !== a && /* @__PURE__ */ e(
                    "button",
                    {
                      onClick: () => M(a ?? null),
                      style: g.backButton,
                      title: "初期ページに戻る",
                      children: /* @__PURE__ */ e("span", { style: { ...g.icon, fontSize: "20px" }, children: "home" })
                    }
                  ),
                  /* @__PURE__ */ e("span", { style: { ...g.icon, fontSize: "20px", color: n.tertiary }, children: "auto_stories" }),
                  /* @__PURE__ */ e("span", { style: g.sidebarTitle, children: "参照" })
                ] }),
                /* @__PURE__ */ t(
                  "div",
                  {
                    ref: Q,
                    style: g.sidebarContent,
                    children: [
                      r && /* @__PURE__ */ t("div", { style: g.loading, children: [
                        /* @__PURE__ */ e("span", { style: { ...g.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                        /* @__PURE__ */ e("span", { children: "読み込み中..." })
                      ] }),
                      l && /* @__PURE__ */ t("div", { style: g.error, children: [
                        /* @__PURE__ */ e("span", { style: g.icon, children: "warning" }),
                        /* @__PURE__ */ t("div", { children: [
                          /* @__PURE__ */ e("div", { style: g.errorTitle, children: "エラー" }),
                          /* @__PURE__ */ e("div", { style: g.errorDetail, children: l.message })
                        ] })
                      ] }),
                      V && /* @__PURE__ */ e(
                        re,
                        {
                          content: V,
                          onLinkClick: ke,
                          onAppLinkClick: we
                        }
                      )
                    ]
                  }
                )
              ]
            }
          ),
          a && u && w && /* @__PURE__ */ e(
            "div",
            {
              className: `manual-v-resize-handle${U ? " resizing" : ""}`,
              onMouseDown: Z,
              onKeyDown: ie,
              style: g.vResizeHandle,
              role: "separator",
              "aria-orientation": "horizontal",
              "aria-valuenow": b,
              "aria-valuemin": 150,
              "aria-valuemax": 800,
              "aria-label": "TOC領域のリサイズ",
              tabIndex: 0
            }
          ),
          u != null && /* @__PURE__ */ t(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                height: w ? a ? "auto" : "100%" : "auto",
                flex: w && !a ? 1 : w ? "1 1 0" : "0 0 auto",
                minHeight: 0
              },
              children: [
                /* @__PURE__ */ t("div", { style: g.feedbackHeader, children: [
                  /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                    /* @__PURE__ */ e("span", { style: { ...g.icon, fontSize: "20px", color: n.tertiary }, children: "rate_review" }),
                    /* @__PURE__ */ e("span", { style: g.sidebarTitle, children: "フィードバック" })
                  ] }),
                  /* @__PURE__ */ t(
                    "button",
                    {
                      onClick: () => d(!w),
                      style: g.toggleBtn,
                      onMouseEnter: (_) => {
                        _.currentTarget.style.backgroundColor = n.gray100, _.currentTarget.style.borderColor = n.gray700;
                      },
                      onMouseLeave: (_) => {
                        _.currentTarget.style.backgroundColor = "transparent", _.currentTarget.style.borderColor = n.gray300;
                      },
                      "aria-label": w ? "フィードバックを閉じる" : "フィードバックを開く",
                      title: w ? "フィードバックを閉じる" : "フィードバックを開く",
                      children: [
                        /* @__PURE__ */ e("span", { style: { ...g.icon, fontSize: "18px" }, children: w ? "expand_less" : "expand_more" }),
                        /* @__PURE__ */ e("span", { children: w ? "閉じる" : "開く" })
                      ]
                    }
                  )
                ] }),
                w && /* @__PURE__ */ e("div", { style: g.feedbackContent, children: /* @__PURE__ */ e(
                  fe,
                  {
                    apiBaseUrl: u,
                    userType: x,
                    appVersion: v,
                    onSubmitSuccess: P,
                    onSubmitError: k
                  }
                ) })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e("style", { children: je })
  ] });
}
const g = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: n.primary,
    color: n.white,
    flexShrink: 0
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  icon: {
    fontFamily: "Material Symbols Outlined",
    fontSize: "24px",
    lineHeight: 1
  },
  title: {
    fontSize: "18px",
    fontWeight: 700
  },
  headerButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color: n.white,
    cursor: "pointer"
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden"
  },
  mainPane: {
    flex: 1,
    overflow: "auto",
    minWidth: 0
  },
  mainContent: {
    padding: "32px",
    maxWidth: "800px",
    margin: "0 auto",
    width: "100%",
    lineHeight: 1.7
  },
  resizeHandle: {
    width: "6px",
    cursor: "col-resize",
    flexShrink: 0,
    transition: "background-color 0.15s ease"
  },
  sidebarPane: {
    overflow: "hidden",
    flexShrink: 0,
    borderLeft: `1px solid ${n.gray300}`,
    display: "flex",
    flexDirection: "column"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    borderBottom: `1px solid ${n.gray300}`,
    backgroundColor: n.gray100,
    flexShrink: 0
  },
  backButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: n.tertiary
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: n.tertiary
  },
  sidebarContent: {
    padding: "24px 16px",
    lineHeight: 1.7,
    flex: 1,
    overflow: "auto"
  },
  vResizeHandle: {
    height: "6px",
    cursor: "row-resize",
    flexShrink: 0,
    transition: "background-color 0.15s ease"
  },
  feedbackHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "12px 16px",
    borderTop: `1px solid ${n.gray300}`,
    borderBottom: `1px solid ${n.gray300}`,
    backgroundColor: n.gray100,
    flexShrink: 0
  },
  toggleBtn: {
    background: "transparent",
    border: `1px solid ${n.gray300}`,
    padding: "8px 12px",
    cursor: "pointer",
    color: n.gray700,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 500,
    transition: "all 0.15s ease",
    minHeight: "36px"
  },
  feedbackContent: {
    flex: 1,
    overflow: "auto"
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: n.gray500,
    fontSize: "16px"
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    backgroundColor: n.errorBg,
    border: "1px solid #FECACA",
    borderRadius: "12px",
    color: n.error
  },
  errorTitle: {
    fontSize: "16px",
    fontWeight: 600
  },
  errorDetail: {
    fontSize: "14px",
    marginTop: "8px"
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "50vh",
    gap: "12px",
    color: n.gray500,
    fontSize: "14px"
  }
}, ge = {
  bug: { label: "不具合", color: "#DC2626" },
  question: { label: "質問", color: "#2563EB" },
  request: { label: "要望", color: "#059669" },
  share: { label: "共有", color: "#6B7280" },
  other: { label: "その他", color: "#9333EA" }
}, ue = {
  app: "アプリ",
  manual: "マニュアル"
}, qe = {
  open: { label: "open", color: "#F59E0B" },
  in_progress: { label: "対応中", color: "#2563EB" },
  closed: { label: "完了", color: "#059669" }
};
function an({ apiBaseUrl: o, adminKey: a }) {
  var V;
  const {
    feedbacks: h,
    total: m,
    page: f,
    limit: s,
    loading: c,
    error: u,
    filters: x,
    customTags: v,
    setFilters: y,
    setPage: A,
    updateStatus: N,
    remove: W,
    refresh: P
  } = Fe({ apiBaseUrl: o, adminKey: a }), [k, B] = E(null), [p, L] = E(null), [O, G] = E(!1), [w, d] = E(null), b = X(0);
  j(() => {
    ae() || oe();
  }, []);
  const C = Math.max(1, Math.ceil(m / s)), R = z(async (r) => {
    if (k === r) {
      B(null), L(null);
      return;
    }
    B(r), G(!0);
    const l = ++b.current;
    try {
      const D = await Ie({ apiBaseUrl: o, adminKey: a, id: r });
      if (b.current !== l) return;
      L(D);
    } catch {
      if (b.current !== l) return;
      L(null);
    }
    b.current === l && G(!1);
  }, [k, o, a]), M = z(async (r) => {
    confirm("削除しますか？") && (await W(r), k === r && (B(null), L(null)));
  }, [W, k]), $ = z(async (r, l) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await Me({ apiBaseUrl: o, adminKey: a, feedbackId: r, attachmentId: l }), L((D) => {
          var S;
          return !D || D.id !== r ? D : {
            ...D,
            attachments: (S = D.attachments) == null ? void 0 : S.filter((T) => T.id !== l)
          };
        });
      } catch (D) {
        console.error("Failed to delete attachment:", D);
      }
  }, [o, a]), q = z((r) => {
    try {
      const l = new URL(o);
      return `${l.origin}${l.pathname.replace(/\/$/, "")}/attachments/${r}`;
    } catch {
      return `${o}/attachments/${r}`;
    }
  }, [o]);
  return /* @__PURE__ */ t("div", { style: i.container, children: [
    /* @__PURE__ */ e("h2", { style: i.title, children: "フィードバック管理" }),
    /* @__PURE__ */ t("div", { style: i.filterRow, children: [
      /* @__PURE__ */ t(
        "select",
        {
          value: x.status,
          onChange: (r) => y({ status: r.target.value }),
          style: i.select,
          "aria-label": "ステータスフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全ステータス" }),
            /* @__PURE__ */ e("option", { value: "open", children: "open" }),
            /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
            /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
          ]
        }
      ),
      /* @__PURE__ */ t(
        "select",
        {
          value: x.kind,
          onChange: (r) => y({ kind: r.target.value }),
          style: i.select,
          "aria-label": "種別フィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全種別" }),
            /* @__PURE__ */ e("option", { value: "bug", children: "不具合" }),
            /* @__PURE__ */ e("option", { value: "question", children: "質問" }),
            /* @__PURE__ */ e("option", { value: "request", children: "要望" }),
            /* @__PURE__ */ e("option", { value: "share", children: "共有" })
          ]
        }
      ),
      /* @__PURE__ */ t(
        "select",
        {
          value: x.target,
          onChange: (r) => y({ target: r.target.value }),
          style: i.select,
          "aria-label": "対象フィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
            /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
            /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
          ]
        }
      ),
      v.length > 0 && /* @__PURE__ */ t(
        "select",
        {
          value: x.customTag,
          onChange: (r) => y({ customTag: r.target.value }),
          style: i.select,
          "aria-label": "タグフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
            v.map((r) => /* @__PURE__ */ e("option", { value: r, children: r }, r))
          ]
        }
      ),
      /* @__PURE__ */ e("button", { onClick: P, style: i.refreshBtn, "aria-label": "更新", children: /* @__PURE__ */ e("span", { style: i.iconSmall, children: "refresh" }) })
    ] }),
    u && /* @__PURE__ */ e("div", { style: i.error, role: "alert", children: u.message.slice(0, 200) }),
    /* @__PURE__ */ t("table", { style: i.table, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ t("tr", { children: [
        /* @__PURE__ */ e("th", { style: i.th, children: "日時" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "種別" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "対象" }),
        /* @__PURE__ */ e("th", { style: { ...i.th, width: "40%" }, children: "メッセージ" }),
        /* @__PURE__ */ e("th", { style: i.th, children: "状態" }),
        /* @__PURE__ */ e("th", { style: { ...i.th, width: "30px" } })
      ] }) }),
      /* @__PURE__ */ t("tbody", { children: [
        c && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: i.loadingCell, children: "読み込み中..." }) }),
        !c && h.length === 0 && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: i.loadingCell, children: "データなし" }) }),
        h.map((r) => {
          var T;
          const l = ge[r.kind] ?? { label: r.kind, color: "#6B7280" }, D = qe[r.status] ?? { label: r.status, color: "#6B7280" }, S = k === r.id;
          return /* @__PURE__ */ t("tr", { children: [
            /* @__PURE__ */ e("td", { style: i.td, children: /* @__PURE__ */ e(
              "button",
              {
                onClick: () => R(r.id),
                style: i.rowButton,
                "aria-expanded": S,
                "aria-controls": S ? `feedback-detail-${r.id}` : void 0,
                children: (T = r.createdAt) == null ? void 0 : T.slice(5, 16).replace("T", " ")
              }
            ) }),
            /* @__PURE__ */ e("td", { style: i.td, children: /* @__PURE__ */ e("span", { style: { ...i.badge, backgroundColor: l.color }, children: l.label }) }),
            /* @__PURE__ */ e("td", { style: i.td, children: r.target ? ue[r.target] ?? r.target : "-" }),
            /* @__PURE__ */ e("td", { style: { ...i.td, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.message.slice(0, 80) }),
            /* @__PURE__ */ e("td", { style: i.td, children: /* @__PURE__ */ e("span", { style: { color: D.color, fontWeight: 600, fontSize: "12px" }, children: D.label }) }),
            /* @__PURE__ */ e("td", { style: i.td, children: (r.attachmentCount ?? 0) > 0 && /* @__PURE__ */ e("span", { style: { ...i.iconSmall, fontSize: "14px", color: "#6B7280" }, title: `${r.attachmentCount}枚`, children: "image" }) })
          ] }, r.id);
        })
      ] })
    ] }),
    k !== null && /* @__PURE__ */ e("div", { style: i.detailPanel, id: `feedback-detail-${k}`, role: "region", "aria-label": "フィードバック詳細", children: O ? /* @__PURE__ */ e("div", { children: "読み込み中..." }) : p ? /* @__PURE__ */ t(he, { children: [
      /* @__PURE__ */ t("div", { style: i.detailGrid, children: [
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "種別:" }),
          " ",
          (V = ge[p.kind]) == null ? void 0 : V.label
        ] }),
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "対象:" }),
          " ",
          p.target ? ue[p.target] : "-"
        ] }),
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "URL:" }),
          " ",
          p.pageUrl ?? "-"
        ] }),
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "ユーザー:" }),
          " ",
          p.userType ?? "-"
        ] }),
        p.environment && /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "環境:" }),
          " ",
          Object.values(p.environment).slice(0, 2).join(" / ")
        ] }),
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "バージョン:" }),
          " ",
          p.appVersion ?? "-"
        ] }),
        p.customTag && /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "タグ:" }),
          " ",
          p.customTag
        ] }),
        /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ e("strong", { children: "日時:" }),
          " ",
          p.createdAt
        ] })
      ] }),
      /* @__PURE__ */ t("div", { style: i.detailMessage, children: [
        /* @__PURE__ */ e("strong", { children: "メッセージ:" }),
        /* @__PURE__ */ e("pre", { style: i.messagePre, children: p.message })
      ] }),
      p.consoleLogs && p.consoleLogs.length > 0 && /* @__PURE__ */ t("details", { style: i.logSection, children: [
        /* @__PURE__ */ t("summary", { children: [
          "コンソールログ (",
          p.consoleLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: i.logPre, children: JSON.stringify(p.consoleLogs, null, 2) })
      ] }),
      p.networkLogs && p.networkLogs.length > 0 && /* @__PURE__ */ t("details", { style: i.logSection, children: [
        /* @__PURE__ */ t("summary", { children: [
          "ネットワークログ (",
          p.networkLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: i.logPre, children: JSON.stringify(p.networkLogs, null, 2) })
      ] }),
      p.attachments && p.attachments.length > 0 && /* @__PURE__ */ t("div", { style: i.attachmentSection, children: [
        /* @__PURE__ */ t("strong", { children: [
          "添付画像 (",
          p.attachments.length,
          "件):"
        ] }),
        /* @__PURE__ */ e("div", { style: i.attachmentGrid, children: p.attachments.map((r) => /* @__PURE__ */ t("div", { style: i.attachmentThumb, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: q(r.filename),
              alt: r.original_name,
              style: i.attachmentImg,
              onClick: () => d(q(r.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => $(p.id, r.id),
              style: i.attachmentRemoveBtn,
              "aria-label": "画像を削除",
              children: /* @__PURE__ */ e("span", { style: { ...i.iconSmall, fontSize: "14px" }, children: "close" })
            }
          ),
          /* @__PURE__ */ e("div", { style: i.attachmentInfo, children: r.original_name.length > 12 ? r.original_name.slice(0, 12) + "..." : r.original_name })
        ] }, r.id)) })
      ] }),
      w && /* @__PURE__ */ e("div", { style: i.overlay, onClick: () => d(null), children: /* @__PURE__ */ e("img", { src: w, alt: "拡大画像", style: i.enlargedImg }) }),
      /* @__PURE__ */ t("div", { style: i.detailActions, children: [
        /* @__PURE__ */ t(
          "select",
          {
            value: p.status,
            onChange: (r) => N(p.id, r.target.value),
            style: i.select,
            "aria-label": "ステータス変更",
            children: [
              /* @__PURE__ */ e("option", { value: "open", children: "open" }),
              /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
              /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
            ]
          }
        ),
        /* @__PURE__ */ e("button", { onClick: () => M(p.id), style: i.deleteBtn, children: "削除" })
      ] })
    ] }) : /* @__PURE__ */ e("div", { children: "詳細の取得に失敗しました" }) }),
    C > 1 && /* @__PURE__ */ t("div", { style: i.pagination, children: [
      /* @__PURE__ */ e("button", { onClick: () => A(f - 1), disabled: f <= 1, style: i.pageBtn, "aria-label": "前のページ", children: "◀" }),
      /* @__PURE__ */ t("span", { style: i.pageInfo, children: [
        f,
        " / ",
        C
      ] }),
      /* @__PURE__ */ e("button", { onClick: () => A(f + 1), disabled: f >= C, style: i.pageBtn, "aria-label": "次のページ", children: "▶" })
    ] })
  ] });
}
const i = {
  container: {
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "14px",
    color: "#374151"
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#043E80",
    marginBottom: "16px"
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  select: {
    padding: "6px 10px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    fontSize: "13px",
    backgroundColor: "#fff"
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer"
  },
  iconSmall: {
    fontFamily: "Material Symbols Outlined",
    fontSize: "18px",
    lineHeight: 1
  },
  error: {
    padding: "8px 12px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "13px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "16px"
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "2px solid #D1D5DB",
    fontSize: "12px",
    fontWeight: 600,
    color: "#6B7280"
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #F3F4F6",
    fontSize: "13px"
  },
  rowButton: {
    background: "none",
    border: "none",
    color: "#2563EB",
    cursor: "pointer",
    fontSize: "13px",
    padding: 0,
    textDecoration: "underline"
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 600
  },
  loadingCell: {
    textAlign: "center",
    padding: "24px",
    color: "#6B7280"
  },
  detailPanel: {
    padding: "16px",
    backgroundColor: "#F9FAFB",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    marginBottom: "16px"
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    fontSize: "13px",
    marginBottom: "12px"
  },
  detailMessage: {
    marginBottom: "12px"
  },
  messagePre: {
    whiteSpace: "pre-wrap",
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #E5E7EB",
    fontSize: "13px",
    marginTop: "4px"
  },
  logSection: {
    marginBottom: "8px",
    fontSize: "13px"
  },
  logPre: {
    whiteSpace: "pre-wrap",
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #E5E7EB",
    fontSize: "11px",
    maxHeight: "200px",
    overflow: "auto",
    marginTop: "4px"
  },
  detailActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #E5E7EB"
  },
  deleteBtn: {
    padding: "6px 16px",
    backgroundColor: "#DC2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer"
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px"
  },
  pageBtn: {
    padding: "4px 12px",
    border: "1px solid #D1D5DB",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px"
  },
  pageInfo: {
    fontSize: "13px",
    color: "#6B7280"
  },
  attachmentSection: {
    marginBottom: "12px",
    fontSize: "13px"
  },
  attachmentGrid: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px"
  },
  attachmentThumb: {
    position: "relative",
    width: "80px",
    height: "80px",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    cursor: "pointer"
  },
  attachmentImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  attachmentRemoveBtn: {
    position: "absolute",
    top: "2px",
    right: "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0
  },
  attachmentInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "2px 4px",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    fontSize: "9px",
    textAlign: "center"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1e4,
    cursor: "pointer"
  },
  enlargedImg: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
  }
};
export {
  le as D,
  an as F,
  Ae as I,
  n as M,
  fe as a,
  me as b,
  tn as c,
  rn as d,
  en as e,
  nn as f,
  on as g,
  re as h,
  ae as i,
  oe as l,
  Ne as m
};
