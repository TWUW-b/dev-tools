import { jsxs as a, jsx as e, Fragment as ke } from "react/jsx-runtime";
import { useState as I, useRef as M, useCallback as S, useEffect as z, useMemo as Oe } from "react";
import { createPortal as ln } from "react-dom";
import { u as un, d as Ae, c as sn, e as We, b as cn, a as dn } from "./useFeedbackAdminMode-DpbrwKWq.js";
import pn, { defaultUrlTransform as gn } from "react-markdown";
import Dn from "remark-gfm";
import fn from "rehype-raw";
import { c as hn } from "./feedbackLogCapture-DUBfVREg.js";
import { l as mn, h as Fn, i as xn } from "./feedbackApi-BAwJP8AU.js";
const Pe = {
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
}, t = {
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
}, je = ["image/png", "image/jpeg", "image/webp", "image/gif"], yn = 5, bn = 5 * 1024 * 1024;
function Cn({
  files: n,
  onAdd: r,
  onRemove: i,
  maxFiles: l = yn,
  maxFileSize: u = bn,
  disabled: s = !1,
  pipDocument: d
}) {
  const [E, D] = I(!1), [L, A] = I(null), w = M(null), g = M(0), p = S((o) => {
    A(null);
    const f = l - n.length;
    if (f <= 0) {
      A(`最大${l}枚まで添付できます`);
      return;
    }
    const x = [];
    for (const R of o) {
      if (x.length >= f) break;
      if (!je.includes(R.type)) {
        A(`${R.name}: 対応していない形式です（PNG/JPEG/WebP/GIF）`);
        continue;
      }
      if (R.size > u) {
        A(`${R.name}: ファイルサイズが大きすぎます（最大5MB）`);
        continue;
      }
      x.push(R);
    }
    x.length > 0 && r(x);
  }, [n.length, l, u, r]), k = S((o) => {
    var R;
    if (s) return;
    const f = (R = o.clipboardData) == null ? void 0 : R.items;
    if (!f) return;
    const x = [];
    for (let H = 0; H < f.length; H++) {
      const G = f[H];
      if (G.kind === "file" && je.includes(G.type)) {
        const V = G.getAsFile();
        V && x.push(V);
      }
    }
    x.length > 0 && (o.preventDefault(), p(x));
  }, [s, p]);
  z(() => (document.addEventListener("paste", k), d == null || d.addEventListener("paste", k), () => {
    document.removeEventListener("paste", k), d == null || d.removeEventListener("paste", k);
  }), [k, d]);
  const m = S((o) => {
    o.preventDefault(), o.stopPropagation(), g.current++, g.current === 1 && D(!0);
  }, []), v = S((o) => {
    o.preventDefault(), o.stopPropagation(), g.current--, g.current === 0 && D(!1);
  }, []), F = S((o) => {
    o.preventDefault(), o.stopPropagation();
  }, []), _ = S((o) => {
    if (o.preventDefault(), o.stopPropagation(), g.current = 0, D(!1), s) return;
    const f = Array.from(o.dataTransfer.files);
    p(f);
  }, [s, p]), y = S(() => {
    var o;
    s || (o = w.current) == null || o.click();
  }, [s]), Z = S((o) => {
    const f = o.target.files ? Array.from(o.target.files) : [];
    f.length > 0 && p(f), w.current && (w.current.value = "");
  }, [p]), P = (o) => o < 1024 ? `${o}B` : o < 1024 * 1024 ? `${(o / 1024).toFixed(0)}KB` : `${(o / (1024 * 1024)).toFixed(1)}MB`;
  return /* @__PURE__ */ a("div", { className: "debug-field", children: [
    /* @__PURE__ */ a("label", { children: [
      "画像添付（",
      n.length,
      "/",
      l,
      "）"
    ] }),
    /* @__PURE__ */ a(
      "div",
      {
        className: `debug-dropzone ${E ? "dragging" : ""} ${s ? "disabled" : ""}`,
        onDragEnter: m,
        onDragLeave: v,
        onDragOver: F,
        onDrop: _,
        onClick: y,
        role: "button",
        tabIndex: 0,
        onKeyDown: (o) => {
          (o.key === "Enter" || o.key === " ") && y();
        },
        children: [
          /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "24px", color: Pe.gray500 }, children: E ? "file_download" : "add_photo_alternate" }),
          /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: Pe.gray500 }, children: E ? "ドロップして追加" : "クリック / ドラッグ / Ctrl+V で画像を追加" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        ref: w,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        multiple: !0,
        style: { display: "none" },
        onChange: Z
      }
    ),
    L && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: Pe.error }, children: L }),
    n.length > 0 && /* @__PURE__ */ e("div", { className: "debug-thumbnails", children: n.map((o, f) => /* @__PURE__ */ e(
      En,
      {
        file: o,
        onRemove: () => i(f),
        formatSize: P
      },
      `${o.name}-${o.size}-${f}`
    )) })
  ] });
}
function En({ file: n, onRemove: r, formatSize: i }) {
  const [l, u] = I(null);
  return z(() => {
    const s = URL.createObjectURL(n);
    return u(s), () => URL.revokeObjectURL(s);
  }, [n]), /* @__PURE__ */ a("div", { className: "debug-thumbnail", children: [
    l && /* @__PURE__ */ e("img", { src: l, alt: n.name, className: "debug-thumbnail-img" }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "debug-thumbnail-remove",
        onClick: (s) => {
          s.stopPropagation(), r();
        },
        "aria-label": "削除",
        children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "close" })
      }
    ),
    /* @__PURE__ */ e("div", { className: "debug-thumbnail-info", children: i(n.size) })
  ] });
}
const wn = /[\0-\x1F!-,\.\/:-@\[-\^`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482\u0530\u0557\u0558\u055A-\u055F\u0589-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EE\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06DE\u06E9\u06FD\u06FE\u0700-\u070F\u074B\u074C\u07B2-\u07BF\u07F6-\u07F9\u07FB\u07FC\u07FE\u07FF\u082E-\u083F\u085C-\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u08E2\u0964\u0965\u0970\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09F2-\u09FB\u09FD\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF0-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B70\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BF0-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D4F-\u0D53\u0D58-\u0D5E\u0D64\u0D65\u0D70-\u0D79\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3F\u0E4F\u0E5A-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F98\u0FBD-\u0FC5\u0FC7-\u0FFF\u104A-\u104F\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u1360-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DB\u17DE\u17DF\u17EA-\u180A\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u1945\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DA-\u19FF\u1A1C-\u1A1F\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1AA6\u1AA8-\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B6A\u1B74-\u1B7F\u1BF4-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E\u1C7F\u1C89-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CCF\u1CD3\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u203E\u2041-\u2053\u2055-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u20CF\u20F1-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u215F\u2189-\u24B5\u24EA-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u3004\u3008-\u3020\u3030\u3036\u3037\u303D-\u3040\u3097\u3098\u309B\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\u9FFD-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA673\uA67E\uA6F2-\uA716\uA720\uA721\uA789\uA78A\uA7C0\uA7C1\uA7CB-\uA7F4\uA828-\uA82B\uA82D-\uA83F\uA874-\uA87F\uA8C6-\uA8CF\uA8DA-\uA8DF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA954-\uA95F\uA97D-\uA97F\uA9C1-\uA9CE\uA9DA-\uA9DF\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A-\uAA5F\uAA77-\uAA79\uAAC3-\uAADA\uAADE\uAADF\uAAF0\uAAF1\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABEB\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFDFF\uFE10-\uFE1F\uFE30-\uFE32\uFE35-\uFE4C\uFE50-\uFE6F\uFE75\uFEFD-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF3E\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDD3F\uDD75-\uDDFC\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEE1-\uDEFF\uDF20-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE40-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE7-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD28-\uDD2F\uDD3A-\uDE7F\uDEAA\uDEAD-\uDEAF\uDEB2-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF51-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC47-\uDC65\uDC70-\uDC7E\uDCBB-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD40-\uDD43\uDD48-\uDD4F\uDD74\uDD75\uDD77-\uDD7F\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDFF\uDE12\uDE38-\uDE3D\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC4B-\uDC4F\uDC5A-\uDC5D\uDC62-\uDC7F\uDCC6\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDC1-\uDDD7\uDDDE-\uDDFF\uDE41-\uDE43\uDE45-\uDE4F\uDE5A-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF3A-\uDFFF]|\uD806[\uDC3B-\uDC9F\uDCEA-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD44-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE2\uDDE5-\uDDFF\uDE3F-\uDE46\uDE48-\uDE4F\uDE9A-\uDE9C\uDE9E-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC41-\uDC4F\uDC5A-\uDC71\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF7-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83D\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDECF\uDEEE\uDEEF\uDEF5-\uDEFF\uDF37-\uDF3F\uDF44-\uDF4F\uDF5A-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE80-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE2\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDC9C\uDC9F-\uDFFF]|\uD834[\uDC00-\uDD64\uDD6A-\uDD6C\uDD73-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDE41\uDE45-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD4F-\uDEBF\uDEFA-\uDFFF]|\uD83A[\uDCC5-\uDCCF\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD83C[\uDC00-\uDD2F\uDD4A-\uDD4F\uDD6A-\uDD6F\uDD8A-\uDFFF]|\uD83E[\uDC00-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]/g, kn = Object.hasOwnProperty;
class Je {
  /**
   * Create a new slug class.
   */
  constructor() {
    this.occurrences, this.reset();
  }
  /**
   * Generate a unique slug.
  *
  * Tracks previously generated slugs: repeated calls with the same value
  * will result in different slugs.
  * Use the `slug` function to get same slugs.
   *
   * @param  {string} value
   *   String of text to slugify
   * @param  {boolean} [maintainCase=false]
   *   Keep the current case, otherwise make all lowercase
   * @return {string}
   *   A unique slug string
   */
  slug(r, i) {
    const l = this;
    let u = An(r, i === !0);
    const s = u;
    for (; kn.call(l.occurrences, u); )
      l.occurrences[s]++, u = s + "-" + l.occurrences[s];
    return l.occurrences[u] = 0, u;
  }
  /**
   * Reset - Forget all previous slugs
   *
   * @return void
   */
  reset() {
    this.occurrences = /* @__PURE__ */ Object.create(null);
  }
}
function An(n, r) {
  return typeof n != "string" ? "" : (r || (n = n.toLowerCase()), n.replace(wn, "").replace(/ /g, "-"));
}
function Bn(n) {
  const r = n.type === "element" ? n.tagName.toLowerCase() : "", i = r.length === 2 && r.charCodeAt(0) === 104 ? r.charCodeAt(1) : 0;
  return i > 48 && i < 55 ? i - 48 : void 0;
}
function vn(n) {
  return "children" in n ? Qe(n) : "value" in n ? n.value : "";
}
function Sn(n) {
  return n.type === "text" ? n.value : "children" in n ? Qe(n) : "";
}
function Qe(n) {
  let r = -1;
  const i = [];
  for (; ++r < n.children.length; )
    i[r] = Sn(n.children[r]);
  return i.join("");
}
const en = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(n) {
    if (n == null)
      return In;
    if (typeof n == "function")
      return ve(n);
    if (typeof n == "object")
      return Array.isArray(n) ? $n(n) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        zn(
          /** @type {Props} */
          n
        )
      );
    if (typeof n == "string")
      return Ln(n);
    throw new Error("Expected function, string, or object as test");
  })
);
function $n(n) {
  const r = [];
  let i = -1;
  for (; ++i < n.length; )
    r[i] = en(n[i]);
  return ve(l);
  function l(...u) {
    let s = -1;
    for (; ++s < r.length; )
      if (r[s].apply(this, u)) return !0;
    return !1;
  }
}
function zn(n) {
  const r = (
    /** @type {Record<string, unknown>} */
    n
  );
  return ve(i);
  function i(l) {
    const u = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      l
    );
    let s;
    for (s in n)
      if (u[s] !== r[s]) return !1;
    return !0;
  }
}
function Ln(n) {
  return ve(r);
  function r(i) {
    return i && i.type === n;
  }
}
function ve(n) {
  return r;
  function r(i, l, u) {
    return !!(Rn(i) && n.call(
      this,
      i,
      typeof l == "number" ? l : void 0,
      u || void 0
    ));
  }
}
function In() {
  return !0;
}
function Rn(n) {
  return n !== null && typeof n == "object" && "type" in n;
}
const nn = [], Tn = !0, qe = !1, Mn = "skip";
function _n(n, r, i, l) {
  let u;
  typeof r == "function" && typeof i != "function" ? (l = i, i = r) : u = r;
  const s = en(u), d = l ? -1 : 1;
  E(n, void 0, [])();
  function E(D, L, A) {
    const w = (
      /** @type {Record<string, unknown>} */
      D && typeof D == "object" ? D : {}
    );
    if (typeof w.type == "string") {
      const p = (
        // `hast`
        typeof w.tagName == "string" ? w.tagName : (
          // `xast`
          typeof w.name == "string" ? w.name : void 0
        )
      );
      Object.defineProperty(g, "name", {
        value: "node (" + (D.type + (p ? "<" + p + ">" : "")) + ")"
      });
    }
    return g;
    function g() {
      let p = nn, k, m, v;
      if ((!r || s(D, L, A[A.length - 1] || void 0)) && (p = Pn(i(D, A)), p[0] === qe))
        return p;
      if ("children" in D && D.children) {
        const F = (
          /** @type {UnistParent} */
          D
        );
        if (F.children && p[0] !== Mn)
          for (m = (l ? F.children.length : -1) + d, v = A.concat(F); m > -1 && m < F.children.length; ) {
            const _ = F.children[m];
            if (k = E(_, m, v)(), k[0] === qe)
              return k;
            m = typeof k[1] == "number" ? k[1] : m + d;
          }
      }
      return p;
    }
  }
}
function Pn(n) {
  return Array.isArray(n) ? n : typeof n == "number" ? [Tn, n] : n == null ? nn : [n];
}
function Hn(n, r, i, l) {
  let u, s, d;
  s = r, d = i, u = l, _n(n, s, E, u);
  function E(D, L) {
    const A = L[L.length - 1], w = A ? A.children.indexOf(D) : void 0;
    return d(D, w, A);
  }
}
const On = {}, Ke = new Je();
function Nn(n) {
  const i = (n || On).prefix || "";
  return function(l) {
    Ke.reset(), Hn(l, "element", function(u) {
      Bn(u) && !u.properties.id && (u.properties.id = i + Ke.slug(vn(u)));
    });
  };
}
function Wn({ src: n, alt: r = "", caption: i, overlaySource: l, onClose: u }) {
  const s = M(null), d = M(null), E = M(null), [D, L] = I(!1), A = M(u);
  A.current = u, z(() => {
    var F;
    const g = s.current;
    if (!g) return;
    const p = g.ownerDocument, k = p.activeElement, m = (_) => {
      _.key === "Escape" && A.current();
    };
    p.addEventListener("keydown", m);
    const v = p.body.style.overflow;
    return p.body.style.overflow = "hidden", (F = d.current) == null || F.focus(), () => {
      p.removeEventListener("keydown", m), p.body.style.overflow = v, k && typeof k.focus == "function" && k.focus();
    };
  }, []), z(() => {
    const g = E.current;
    if (!g || !l) return;
    const p = g.ownerDocument.defaultView;
    if (!p) return;
    const k = Array.from(l.children).filter((m) => m instanceof p.HTMLElement && m.tagName !== "IMG").filter((m) => p.getComputedStyle(m).position === "absolute").map((m) => m.cloneNode(!0));
    return k.forEach((m) => g.appendChild(m)), () => k.forEach((m) => m.remove());
  }, [l]);
  const w = i ?? (r || null);
  return /* @__PURE__ */ a(
    "div",
    {
      ref: s,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": r ? `拡大表示: ${r}` : "画像の拡大表示",
      onClick: () => u(),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 2147483e3,
        background: "rgba(0, 0, 0, 0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "52px 16px 16px",
        overscrollBehavior: "contain"
      },
      children: [
        /* @__PURE__ */ a(
          "div",
          {
            onClick: (g) => g.stopPropagation(),
            style: { position: "absolute", top: "10px", right: "12px", display: "flex", alignItems: "center", gap: "8px" },
            children: [
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => L((g) => !g),
                  style: {
                    padding: "5px 12px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255, 255, 255, 0.45)",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    lineHeight: 1.4,
                    cursor: "pointer"
                  },
                  children: D ? "画面に合わせる" : "実寸で表示"
                }
              ),
              /* @__PURE__ */ e(
                "button",
                {
                  ref: d,
                  type: "button",
                  "aria-label": "閉じる",
                  onClick: () => u(),
                  style: {
                    width: "32px",
                    height: "32px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255, 255, 255, 0.45)",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    lineHeight: 1,
                    cursor: "pointer"
                  },
                  children: "×"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ a(
          "figure",
          {
            onClick: (g) => g.stopPropagation(),
            style: {
              margin: 0,
              maxWidth: "100%",
              maxHeight: "100%",
              overflow: D ? "auto" : "visible",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px"
            },
            children: [
              /* @__PURE__ */ e(
                "div",
                {
                  ref: E,
                  style: {
                    position: "relative",
                    display: "inline-block",
                    lineHeight: 0,
                    // 実寸表示では画像より小さく詰められると、% 指定の注記が画像とずれる
                    // （注記の基準はこの箱なので、箱は常に画像と同じ大きさである必要がある）
                    maxWidth: D ? "none" : "100%"
                  },
                  children: /* @__PURE__ */ e(
                    "img",
                    {
                      src: n,
                      alt: r,
                      onClick: () => L((g) => !g),
                      style: {
                        display: "block",
                        borderRadius: "6px",
                        background: "#FFFFFF",
                        cursor: D ? "zoom-out" : "zoom-in",
                        maxWidth: D ? "none" : "100%",
                        maxHeight: D ? "none" : w ? "calc(100vh - 120px)" : "calc(100vh - 84px)"
                      }
                    }
                  )
                }
              ),
              w && /* @__PURE__ */ e(
                "figcaption",
                {
                  style: {
                    flexShrink: 0,
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "12px",
                    lineHeight: 1.5
                  },
                  children: w
                }
              )
            ]
          }
        )
      ]
    }
  );
}
const jn = ["#app:", "app:"];
function qn(n) {
  for (const r of jn)
    if (n.startsWith(r)) return n.slice(r.length);
  return null;
}
function Kn(n) {
  return n.startsWith("app:") ? n : gn(n);
}
const Gn = `
:where(.manual-markdown) {
  color: ${t.gray700};
}

:where(.manual-markdown h1) {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${t.primary};
  border-bottom: 2px solid ${t.secondary};
  padding-bottom: 8px;
}

:where(.manual-markdown h2) {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${t.tertiary};
}

:where(.manual-markdown h3) {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${t.gray700};
}

:where(.manual-markdown p) {
  margin-bottom: 12px;
}

:where(.manual-markdown ul),
:where(.manual-markdown ol) {
  margin-bottom: 12px;
  padding-left: 24px;
}

:where(.manual-markdown li) {
  margin-bottom: 4px;
}

:where(.manual-markdown a) {
  color: ${t.primary};
  text-decoration: underline;
  cursor: pointer;
}

:where(.manual-markdown a:hover) {
  color: ${t.tertiary};
}

:where(.manual-markdown code) {
  background: ${t.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

:where(.manual-markdown pre) {
  background: ${t.gray100};
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

:where(.manual-markdown pre code) {
  background: transparent;
  padding: 0;
}

:where(.manual-markdown table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

:where(.manual-markdown th),
:where(.manual-markdown td) {
  border: 1px solid ${t.gray300};
  padding: 8px 12px;
  text-align: left;
}

:where(.manual-markdown th) {
  background: ${t.gray100};
  font-weight: 600;
}

:where(.manual-markdown hr) {
  border: none;
  border-top: 1px solid ${t.gray300};
  margin: 24px 0;
}

:where(.manual-markdown blockquote) {
  border-left: 4px solid ${t.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${t.gray500};
}

:where(.manual-markdown img) {
  max-width: 100%;
  height: auto;
}

/*
 * クリックで拡大できる画像。
 *
 * NOTE: <img> を <button> 等で包まない。ホストアプリのマニュアル用 CSS は
 * .manual-shot img { width: 100% } のように「コンテナの直下の img」を前提に
 * 書かれており（toho_matching TOHOMA-338 の手順ステップ表示など）、間に要素を
 * 挟むと画像幅の基準が変わって、画像の上に重ねた注記マーカーの位置がずれる。
 * 拡大の当たり判定は img 自身に持たせ、DOM 構造は従来のままにする。
 */
:where(.manual-markdown img[data-zoomable]) {
  cursor: zoom-in;
}

/*
 * <app-icon name="..."> の描画枠。
 * 行の中で文字と並べたときにベースラインが揃うよう、inline-flex + 微調整のみを当てる。
 * 大きさ・色はホストが渡すノード側（lucide の size/className 等）に任せる。
 */
:where(.manual-markdown .manual-icon) {
  display: inline-flex;
  align-items: center;
  vertical-align: -0.15em;
}
`, Ge = 48;
function Vn(n) {
  const r = (u) => typeof u == "number" ? u : typeof u == "string" && /^\d+(\.\d+)?(px)?$/.test(u.trim()) ? parseFloat(u) : null, i = r(n.width), l = r(n.height);
  return i === null && l === null ? !1 : (i ?? 0) <= Ge && (l ?? 0) <= Ge;
}
function Be({
  content: n,
  className: r = "",
  onLinkClick: i,
  onAppLinkClick: l,
  disableImageZoom: u = !1,
  icons: s
}) {
  const [d, E] = I(null), D = S(() => E(null), []), L = Oe(() => {
    const w = {
      a: ({ href: g, children: p, ...k }) => {
        const m = g ? qn(g) : null;
        return m !== null && l ? /* @__PURE__ */ e(
          "span",
          {
            role: "link",
            tabIndex: 0,
            onClick: (v) => {
              v.preventDefault(), v.stopPropagation(), l(m);
            },
            onKeyDown: (v) => {
              (v.key === "Enter" || v.key === " ") && (v.preventDefault(), l(m));
            },
            style: {
              color: "#043E80",
              textDecoration: "underline",
              cursor: "pointer"
            },
            ...k,
            children: p
          }
        ) : g && /\.md(#|$|\?)/.test(g) && i ? /* @__PURE__ */ e(
          "a",
          {
            href: g,
            onClick: (v) => {
              v.preventDefault(), i(g);
            },
            style: {
              color: "#043E80",
              textDecoration: "underline",
              cursor: "pointer"
            },
            ...k,
            children: p
          }
        ) : /* @__PURE__ */ e(
          "a",
          {
            href: g,
            target: "_blank",
            rel: "noopener noreferrer",
            style: { color: "#043E80" },
            ...k,
            children: p
          }
        );
      },
      // 画像はクリックで拡大表示する（マニュアルの画像はスクリーンショットが主で、
      // 本文中の幅では画面内の文字が読めないことが多いため）
      img: ({ node: g, src: p, alt: k, title: m, ...v }) => {
        const F = typeof p == "string" ? p : "", _ = v, y = u || _["data-no-zoom"] !== void 0 || Vn(_);
        if (!F || y)
          return /* @__PURE__ */ e("img", { ...v, src: F || void 0, alt: k ?? "", title: m });
        const Z = (o) => {
          const f = o.parentElement, x = o.ownerDocument.defaultView;
          return !f || !x ? null : Array.from(f.children).some(
            (H) => H !== o && x.getComputedStyle(H).position === "absolute"
          ) ? f : null;
        }, P = (o) => E({
          src: F,
          alt: k ?? "",
          caption: m ?? k ?? null,
          overlaySource: Z(o)
        });
        return /* @__PURE__ */ e(
          "img",
          {
            ...v,
            src: F,
            alt: k ?? "",
            title: m,
            "data-zoomable": "true",
            role: "button",
            tabIndex: 0,
            "aria-label": k ? `${k}（クリックで拡大）` : "画像を拡大表示",
            onClick: (o) => {
              o.currentTarget.closest("a") || (o.preventDefault(), o.stopPropagation(), P(o.currentTarget));
            },
            onKeyDown: (o) => {
              o.key !== "Enter" && o.key !== " " || o.currentTarget.closest("a") || (o.preventDefault(), P(o.currentTarget));
            }
          }
        );
      }
    };
    return w["app-icon"] = ({ name: g, label: p, className: k }) => {
      const m = typeof g == "string" ? s == null ? void 0 : s[g] : void 0;
      if (m == null) return null;
      const v = k ? `manual-icon ${k}` : "manual-icon";
      return p ? /* @__PURE__ */ e("span", { className: v, role: "img", "aria-label": p, children: m }) : /* @__PURE__ */ e("span", { className: v, "aria-hidden": "true", children: m });
    }, w;
  }, [i, l, u, s]);
  return /* @__PURE__ */ a("div", { className: `manual-markdown ${r}`, children: [
    /* @__PURE__ */ e("style", { children: Gn }),
    /* @__PURE__ */ e(
      pn,
      {
        remarkPlugins: [Dn],
        rehypePlugins: [fn, Nn],
        urlTransform: Kn,
        components: L,
        children: n
      }
    ),
    d && /* @__PURE__ */ e(
      Wn,
      {
        src: d.src,
        alt: d.alt,
        caption: d.caption,
        overlaySource: d.overlaySource,
        onClose: D
      }
    )
  ] });
}
const tn = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap", Un = `
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
function Se(n = !1) {
  if (typeof document > "u")
    return !1;
  const r = document.querySelector('link[href*="Material+Symbols"]');
  if (r && !n)
    return !1;
  r && n && r.remove();
  const i = document.createElement("link");
  return i.rel = "stylesheet", i.href = tn, document.head.appendChild(i), !0;
}
function $e() {
  return typeof window < "u" && window.__MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__ === !0;
}
const Xn = [
  { value: "bug", label: "不具合", color: "#DC2626" },
  { value: "question", label: "質問", color: "#2563EB" },
  { value: "request", label: "要望", color: "#059669" },
  { value: "share", label: "共有", color: "#6B7280" },
  { value: "other", label: "その他", color: "#9333EA" }
], Zn = `
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
function rn({
  apiBaseUrl: n,
  userType: r,
  appVersion: i,
  onSubmitSuccess: l,
  onSubmitError: u
}) {
  const { submitting: s, submitFeedback: d } = un({
    apiBaseUrl: n,
    userType: r,
    appVersion: i
  });
  z(() => {
    $e() || Se();
  }, []);
  const E = M(null);
  z(() => {
    try {
      const h = hn({
        // フィードバックAPI自身への fetch を除外（無限ループ防止）
        networkExclude: [n]
      });
      return E.current = h, () => {
        h.destroy(), E.current = null;
      };
    } catch (h) {
      return console.error("Failed to create log capture:", h), () => {
      };
    }
  }, [n]);
  const [D, L] = I(null), [A, w] = I(""), [g, p] = I(!1), [k, m] = I(""), [v, F] = I(""), [_, y] = I([]), [Z, P] = I(!1), [o, f] = I(null), x = M(), R = M(!1);
  z(() => () => {
    x.current && clearTimeout(x.current);
  }, []);
  const H = D !== null && A.trim() !== "" && !s, G = S(async () => {
    var j;
    if (!D || !A.trim() || R.current) return;
    R.current = !0;
    let h = A.trim();
    (k.trim() || v.trim()) && (h += `

---`, k.trim() && (h += `
再現手順:
${k.trim()}`), v.trim() && (h += `
期待結果:
${v.trim()}`));
    const O = D === "bug" && E.current ? {
      consoleLogs: E.current.getConsoleLogs(),
      networkLogs: E.current.getNetworkLogs()
    } : void 0, { data: J, error: ee } = await d({
      kind: D,
      message: h
    }, O);
    if (J) {
      if (_.length > 0)
        for (const he of _)
          try {
            await mn({
              apiBaseUrl: n,
              feedbackId: J.id,
              file: he
            });
          } catch (re) {
            console.error("Failed to upload attachment:", re);
          }
      L(null), w(""), m(""), F(""), p(!1), y([]), f(null), (j = E.current) == null || j.clear(), P(!0), x.current && clearTimeout(x.current), x.current = setTimeout(() => P(!1), 3e3), l == null || l(J);
    } else
      f(ee), u == null || u(ee ?? new Error("Unknown error"));
    R.current = !1;
  }, [D, A, k, v, _, n, d, l, u]), V = S(
    (h) => {
      (h.metaKey || h.ctrlKey) && h.key === "Enter" && H && (h.preventDefault(), G());
    },
    [H, G]
  ), Q = S((h) => {
    y((O) => [...O, ...h]);
  }, []), c = S((h) => {
    y((O) => O.filter((J, ee) => ee !== h));
  }, []);
  return /* @__PURE__ */ a("div", { style: K.container, children: [
    /* @__PURE__ */ e("style", { children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }${Zn}` }),
    /* @__PURE__ */ a("div", { style: K.section, children: [
      /* @__PURE__ */ e("div", { style: K.tagGroup, role: "radiogroup", "aria-label": "フィードバック種別", children: Xn.map((h) => /* @__PURE__ */ e(
        "button",
        {
          role: "radio",
          "aria-checked": D === h.value,
          onClick: () => L(D === h.value ? null : h.value),
          style: {
            ...K.tag,
            ...D === h.value ? { backgroundColor: h.color, color: "#fff", borderColor: h.color } : { borderColor: "#D1D5DB", color: "#6B7280" }
          },
          children: h.label
        },
        h.value
      )) }),
      /* @__PURE__ */ e("div", { style: K.tagHint, children: "どれか一つを選んでください" })
    ] }),
    /* @__PURE__ */ e("div", { style: K.section, children: /* @__PURE__ */ e(
      "textarea",
      {
        value: A,
        onChange: (h) => w(h.target.value),
        onKeyDown: V,
        placeholder: "気づいたことをそのまま書いてください（一言でもOK）",
        "aria-label": "フィードバックメッセージ",
        rows: 4,
        maxLength: 4e3,
        style: K.textarea
      }
    ) }),
    /* @__PURE__ */ e("div", { style: K.section, children: /* @__PURE__ */ e(
      Cn,
      {
        files: _,
        onAdd: Q,
        onRemove: c,
        maxFiles: 3,
        disabled: s
      }
    ) }),
    D === "bug" && /* @__PURE__ */ a("div", { style: K.logNotice, children: [
      /* @__PURE__ */ e("span", { style: K.iconSmall, children: "info" }),
      "不具合タグを選択すると、直前の動作ログが自動で添付されます"
    ] }),
    /* @__PURE__ */ a("div", { style: K.section, children: [
      /* @__PURE__ */ a("button", { onClick: () => p(!g), style: K.detailToggle, "aria-expanded": g, children: [
        /* @__PURE__ */ e("span", { style: K.iconSmall, children: g ? "expand_less" : "expand_more" }),
        "詳細情報（任意）"
      ] }),
      g && /* @__PURE__ */ a("div", { style: K.detailArea, children: [
        /* @__PURE__ */ e("label", { style: K.label, children: "再現手順:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: k,
            onChange: (h) => m(h.target.value),
            "aria-label": "再現手順",
            rows: 2,
            style: K.textarea
          }
        ),
        /* @__PURE__ */ e("label", { style: { ...K.label, marginTop: "8px" }, children: "期待結果:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: v,
            onChange: (h) => F(h.target.value),
            "aria-label": "期待結果",
            rows: 2,
            style: K.textarea
          }
        )
      ] })
    ] }),
    o && /* @__PURE__ */ a("div", { style: K.errorMsg, role: "alert", children: [
      /* @__PURE__ */ e("span", { style: K.iconSmall, children: "warning" }),
      o.message.slice(0, 200)
    ] }),
    /* @__PURE__ */ e("div", { style: K.submitRow, children: /* @__PURE__ */ e("button", { onClick: G, disabled: !H, style: {
      ...K.submitButton,
      opacity: H ? 1 : 0.5,
      cursor: H ? "pointer" : "not-allowed"
    }, children: s ? /* @__PURE__ */ e("span", { style: { ...K.iconSmall, animation: "spin 1s linear infinite" }, children: "progress_activity" }) : "送信" }) }),
    Z && /* @__PURE__ */ e("div", { style: K.toast, role: "status", children: "送信しました" })
  ] });
}
const K = {
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
  tagHint: {
    fontSize: "10px",
    color: "#9CA3AF",
    marginTop: "4px"
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
function Yn(n) {
  return n.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/!\[([^\]]*)\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}
function Jn(n) {
  return n.replace(/<[^>]+>/g, "");
}
function Qn(n) {
  return n.replace(/(?:^|[ \t])#+[ \t]*$/, "").trim();
}
function et(n) {
  const r = new Je(), i = [], l = n.split(/\r?\n/);
  let u = null;
  for (const s of l) {
    const d = /^(`{3,}|~{3,})/.exec(s.trim());
    if (d) {
      const p = d[1][0];
      u === null ? u = p : u === p && (u = null);
      continue;
    }
    if (u) continue;
    let E = null, D = "";
    const L = /^ {0,3}(#{2,3})(?:[ \t]+(.*))?$/.exec(s);
    if (L)
      E = L[1].length, D = Qn((L[2] ?? "").trim());
    else {
      const p = /^\s{0,3}<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>\s*$/i.exec(s);
      p && (E = Number(p[1]), D = p[2]);
    }
    if (E === null) continue;
    const A = Jn(Yn(D)), w = A.trim();
    if (!w) continue;
    const g = r.slug(A);
    i.push({ id: g, text: w, level: E });
  }
  return i;
}
function nt() {
  const [n, r] = I({}), [i, l] = I({}), [u, s] = I({}), d = M(/* @__PURE__ */ new Set()), E = M(!0);
  z(() => (E.current = !0, () => {
    E.current = !1;
  }), []);
  const D = S((g) => n[g], [n]), L = S((g) => i[g] ?? !1, [i]), A = S((g) => u[g] ?? null, [u]), w = S(async (g) => {
    if (!d.current.has(g)) {
      d.current.add(g), l((p) => ({ ...p, [g]: !0 })), s((p) => ({ ...p, [g]: null }));
      try {
        const p = await fetch(g);
        if (!p.ok)
          throw new Error(`Failed to load: ${p.status} ${p.statusText}`);
        const k = await p.text(), m = et(k);
        if (!E.current) return;
        r((v) => ({ ...v, [g]: m }));
      } catch (p) {
        if (d.current.delete(g), !E.current) return;
        s((k) => ({
          ...k,
          [g]: p instanceof Error ? p : new Error(String(p))
        }));
      } finally {
        E.current && l((p) => ({ ...p, [g]: !1 }));
      }
    }
  }, []);
  return { getHeadings: D, loadHeadings: w, isLoading: L, getError: A };
}
function tt(n) {
  const r = {}, i = [], l = [...n].sort((s, d) => (s.order ?? 0) - (d.order ?? 0));
  for (const s of l)
    s.category ? (r[s.category] || (r[s.category] = []), r[s.category].push(s)) : i.push(s);
  return { groups: Object.entries(r).map(([s, d]) => ({
    category: s,
    items: d
  })), uncategorized: i };
}
function Ve(n, r) {
  var i;
  return r ? ((i = n.find((l) => l.path === r)) == null ? void 0 : i.category) ?? null : null;
}
function rt(n, r) {
  if (r)
    return n.find((i) => i.path === r);
}
function ot(n) {
  return n.replace(/\s+/g, "-");
}
function He({
  items: n,
  activePath: r,
  onSelectPage: i,
  onSelectHeading: l,
  activeHeadingId: u = null,
  defaultExpandCategories: s = "active",
  categoryIcons: d,
  className: E = ""
}) {
  const { groups: D, uncategorized: L } = Oe(() => tt(n), [n]), { getHeadings: A, loadHeadings: w, isLoading: g, getError: p } = nt(), [k, m] = I(() => {
    const o = Ve(n, r), f = {};
    for (const x of D)
      f[x.category] = s === "all" || x.category === o;
    return f;
  });
  z(() => {
    const o = Ve(n, r);
    o && m((f) => f[o] ? f : { ...f, [o]: !0 });
  }, [r, n]);
  const [v, F] = I({}), _ = M(/* @__PURE__ */ new Set()), y = S((o) => {
    m((f) => ({ ...f, [o]: !f[o] }));
  }, []), Z = S(
    (o) => {
      F((f) => {
        const x = !(f[o] ?? !1);
        return x ? (w(o), _.current.delete(o)) : _.current.add(o), { ...f, [o]: x };
      });
    },
    [w]
  );
  z(() => {
    var o;
    !u || !r || (o = rt(n, r)) != null && o.hideHeadingsOutline || _.current.has(r) || (w(r), F((f) => f[r] ? f : { ...f, [r]: !0 }));
  }, [u, r, n, w]);
  const P = (o) => {
    const f = r === o.path, x = !o.hideHeadingsOutline && (v[o.path] ?? !1), R = A(o.path), H = g(o.path), G = p(o.path), V = `manual-toc-headings-${ot(o.id)}`;
    return /* @__PURE__ */ a("li", { children: [
      /* @__PURE__ */ a("div", { style: Y.pageRow, children: [
        /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            onClick: () => {
              i(o.path), o.hideHeadingsOutline || Z(o.path);
            },
            "aria-expanded": o.hideHeadingsOutline ? void 0 : x,
            "aria-controls": o.hideHeadingsOutline ? void 0 : V,
            style: {
              ...Y.pageButton,
              // アイコンがある時だけ flex にする（テキストのみの既存表示は変えない）
              ...o.icon ? { display: "flex", alignItems: "center", gap: "8px" } : null,
              background: f ? "#e3f2fd" : "transparent",
              color: f ? t.primary : t.gray700,
              borderLeft: f ? `3px solid ${t.primary}` : "3px solid transparent"
            },
            children: [
              o.icon && /* @__PURE__ */ e("span", { style: { display: "inline-flex", alignItems: "center", flex: "none" }, "aria-hidden": "true", children: o.icon }),
              o.title
            ]
          }
        ),
        !o.hideHeadingsOutline && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => Z(o.path),
            style: Y.toggleHeadingsButton,
            "aria-expanded": x,
            "aria-controls": V,
            "aria-label": x ? `${o.title} の見出しを閉じる` : `${o.title} の見出しを開く`,
            title: x ? "見出しを閉じる" : "見出しを開く",
            children: /* @__PURE__ */ e("span", { style: Y.chevronIcon, children: x ? "expand_less" : "expand_more" })
          }
        )
      ] }),
      x && /* @__PURE__ */ a("ul", { id: V, style: Y.headingList, role: "group", children: [
        H && /* @__PURE__ */ e("li", { style: Y.headingStatus, children: "読み込み中..." }),
        !H && G && /* @__PURE__ */ e("li", { style: { ...Y.headingStatus, color: t.error }, children: "見出しの読み込みに失敗しました" }),
        !H && !G && R && R.length === 0 && /* @__PURE__ */ e("li", { style: Y.headingStatus, children: "見出しなし" }),
        !H && !G && (R == null ? void 0 : R.map((Q) => {
          const c = Q.level === 3, h = f && u === Q.id;
          return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => l(o.path, Q.id),
              style: {
                ...Y.headingButton,
                paddingLeft: c ? "38px" : "20px",
                fontSize: c ? "12px" : "13px",
                color: h ? t.primary : c ? t.gray500 : t.gray700,
                background: h ? "#e3f2fd" : "transparent",
                borderLeft: h ? `2px solid ${t.primary}` : "2px solid transparent",
                fontWeight: h ? 600 : 400
              },
              children: [
                /* @__PURE__ */ e(
                  "span",
                  {
                    style: {
                      ...Y.headingDot,
                      ...c ? Y.headingDotSub : null,
                      ...h ? { background: t.primary } : null
                    }
                  }
                ),
                /* @__PURE__ */ e("span", { style: Y.headingText, children: Q.text })
              ]
            }
          ) }, Q.id);
        }))
      ] })
    ] }, o.id);
  };
  return /* @__PURE__ */ a("nav", { className: `manual-toc ${E}`, "aria-label": "マニュアル目次", style: Y.nav, children: [
    L.length > 0 && /* @__PURE__ */ e("ul", { style: Y.list, children: L.map(P) }),
    D.map((o, f) => {
      const x = k[o.category] ?? !1, R = `manual-toc-category-${f}`;
      return /* @__PURE__ */ a("div", { style: Y.categoryBlock, children: [
        /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            onClick: () => y(o.category),
            style: Y.categoryButton,
            "aria-expanded": x,
            "aria-controls": R,
            children: [
              /* @__PURE__ */ e("span", { style: Y.categoryChevron, "aria-hidden": "true", children: x ? "expand_more" : "chevron_right" }),
              (d == null ? void 0 : d[o.category]) && /* @__PURE__ */ e("span", { style: { display: "inline-flex", alignItems: "center", flex: "none" }, "aria-hidden": "true", children: d[o.category] }),
              /* @__PURE__ */ e("span", { children: o.category })
            ]
          }
        ),
        x && /* @__PURE__ */ e("ul", { id: R, style: Y.list, children: o.items.map(P) })
      ] }, o.category);
    })
  ] });
}
const Y = {
  nav: {
    display: "flex",
    flexDirection: "column",
    fontSize: "14px"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  categoryBlock: {
    marginBottom: "2px"
  },
  categoryButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    width: "100%",
    padding: "8px 12px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    color: t.gray700,
    textTransform: "uppercase"
  },
  categoryChevron: {
    fontFamily: "Material Symbols Outlined",
    fontSize: "18px",
    lineHeight: 1,
    flexShrink: 0
  },
  pageRow: {
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  pageButton: {
    display: "block",
    flex: 1,
    padding: "8px 8px 8px 12px",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px"
  },
  toggleHeadingsButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    flexShrink: 0,
    marginRight: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: t.gray500,
    borderRadius: "4px"
  },
  chevronIcon: {
    fontFamily: "Material Symbols Outlined",
    fontSize: "18px",
    lineHeight: 1
  },
  headingList: {
    listStyle: "none",
    margin: "0 0 4px 20px",
    padding: 0,
    borderLeft: `1px solid ${t.gray300}`
  },
  headingButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "6px 10px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "13px",
    color: t.gray700
  },
  headingDot: {
    flexShrink: 0,
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: t.gray300
  },
  headingDotSub: {
    width: "4px",
    height: "4px",
    background: t.gray300,
    opacity: 0.7
  },
  headingText: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  headingStatus: {
    padding: "6px 24px",
    fontSize: "12px",
    color: t.gray500
  }
}, at = 200;
function xt({
  isOpen: n,
  docPath: r,
  onClose: i,
  onNavigate: l,
  onAppNavigate: u,
  initialSize: s = { width: 420, height: 550 },
  showDownloadButton: d = !1,
  copyHostStyles: E = !0,
  icons: D,
  categoryIcons: L,
  items: A,
  feedbackApiBaseUrl: w,
  feedbackUserType: g,
  feedbackAppVersion: p,
  onFeedbackSubmitSuccess: k,
  onFeedbackSubmitError: m,
  feedbackDefaultHeight: v = 200,
  feedbackMinHeight: F = 150,
  feedbackMaxHeight: _ = 400
}) {
  const [y, Z] = I(null), [P, o] = I(null), { content: f, loading: x, error: R } = Ae(r), { downloadMd: H } = sn(), [G, V] = I([]), Q = M(null), c = M(!1), h = M(!1), [O, J] = I(!1), ee = w != null, [j, he] = I(!0), [re, ae] = I(!1), de = M(null), le = M(null), ue = M(!1), se = M(null), me = M(null), [ze, ce] = I(null), ge = M(!1), Ce = S(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported");
      return;
    }
    if (!h.current) {
      h.current = !0;
      try {
        const $ = ee ? 650 : s.width, W = s.height, T = await window.documentPictureInPicture.requestWindow({
          width: $,
          height: W,
          // Document Picture-in-Picture API はデフォルト(false)で「閉じたときの
          // 位置・サイズを記憶し、次回はそれを再利用する」仕様のため、true を渡さないと
          // 一度でも手動リサイズ/別サイズで開いた履歴があると width/height の指定が
          // 無視され続ける。true にして常に指定サイズで開かせる（Chrome 130+。
          // 非対応ブラウザではオプションが単に無視されるだけで害はない）。
          preferInitialWindowPlacement: !0
        }), U = T.document.createElement("style");
        U.textContent = lt(), T.document.head.appendChild(U), E && it(T.document);
        const X = T.document.createElement("div");
        X.id = "manual-pip-root", T.document.body.appendChild(X), Z(T), o(X), T.addEventListener("pagehide", () => {
          Z(null), o(null), i();
        });
      } catch ($) {
        console.error("Failed to open PiP window:", $);
      } finally {
        h.current = !1;
      }
    }
  }, [s.width, s.height, E, i]), Fe = S(() => {
    y && (y.close(), Z(null), o(null));
  }, [y]);
  z(() => {
    n && !y ? Ce() : !n && y && Fe();
  }, [n, y, Ce, Fe]);
  const Le = S(
    ($) => {
      if (l) {
        const W = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/", T = $.startsWith("/") ? $ : W + $;
        l(T);
      }
    },
    [r, l]
  );
  z(() => {
    if (!y || y.closed || !u) return;
    const $ = (T) => {
      var te;
      const X = T.target.closest("a");
      if (X) {
        const q = X.getAttribute("href");
        if (console.log("[ManualPiP] Link clicked", {
          href: q,
          text: (te = X.textContent) == null ? void 0 : te.substring(0, 30),
          startsWithHashApp: q == null ? void 0 : q.startsWith("#app:")
        }), q && q.startsWith("#app:")) {
          console.log("[ManualPiP] App link detected! Preventing default"), T.preventDefault(), T.stopPropagation();
          const ie = q.replace("#app:", "");
          console.log("[ManualPiP] Calling onAppNavigate", { appPath: ie }), u(ie);
        }
      }
    }, W = (T) => {
      var te;
      const U = T.target, X = ((te = U.querySelector("summary")) == null ? void 0 : te.textContent) || "unknown";
      console.log("[ManualPiP] Details toggle", {
        open: U.open,
        summary: X
      }), U.open && setTimeout(() => {
        const q = U.querySelectorAll('a[href^="app:"]'), ie = U.querySelectorAll("a"), Ee = Array.from(ie).map((ye) => {
          var we;
          return {
            href: ye.getAttribute("href"),
            text: (we = ye.textContent) == null ? void 0 : we.substring(0, 20)
          };
        });
        console.log("[ManualPiP] Links in opened details", {
          totalLinks: ie.length,
          appLinksCount: q.length,
          allHrefs: Ee
        });
      }, 100);
    };
    return y.document.addEventListener("click", $, !0), y.document.addEventListener("toggle", W, !0), () => {
      y.closed || (y.document.removeEventListener("click", $, !0), y.document.removeEventListener("toggle", W, !0));
    };
  }, [y, u]);
  const oe = S(() => {
    le.current !== null && (clearTimeout(le.current), le.current = null);
  }, []), Ie = S(() => {
    oe(), ae(!0);
  }, [oe]), xe = S(() => {
    oe(), le.current = setTimeout(() => {
      le.current = null, ae(!1);
    }, at);
  }, [oe]);
  z(() => oe, [oe]), z(() => {
    const $ = Q.current;
    if (Q.current = r, !(!$ || $ === r)) {
      if (c.current) {
        c.current = !1;
        return;
      }
      V((W) => [...W, $]);
    }
  }, [r]), z(() => {
    n || (V([]), Q.current = null);
  }, [n]);
  const Re = S(() => {
    if (G.length === 0) return;
    const $ = G[G.length - 1];
    c.current = !0, V((W) => W.slice(0, -1)), ae(!1), l == null || l($);
  }, [G, l]), Te = S(
    ($) => {
      ae(!1), l == null || l($);
    },
    [l]
  ), Me = S(
    ($, W) => {
      if (ae(!1), $ === r) {
        if (y && !y.closed) {
          const T = y.document.getElementById(W);
          T == null || T.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      de.current = { path: $, headingId: W }, l == null || l($);
    },
    [r, y, l]
  );
  z(() => {
    const $ = de.current;
    if (!$ || $.path !== r) {
      ue.current = !1;
      return;
    }
    if (x) {
      ue.current = !0;
      return;
    }
    if (!ue.current || !y || y.closed || !f) return;
    let W = !1, T, U = 0;
    const X = () => {
      if (W || y.closed) return;
      const te = y.document.getElementById($.headingId);
      if (te) {
        te.scrollIntoView({ behavior: "smooth" }), de.current = null;
        return;
      }
      U += 1, U < 30 ? T = y.requestAnimationFrame(X) : de.current = null;
    };
    return T = y.requestAnimationFrame(X), () => {
      W = !0, y.closed || y.cancelAnimationFrame(T);
    };
  }, [f, r, x, y]), z(() => {
    ge.current = !1;
  }, [r]), z(() => {
    x && (ge.current = !0);
  }, [x]), z(() => {
    if (!y || y.closed || !f || !ge.current) {
      ce(null);
      return;
    }
    const $ = me.current;
    if (!$) {
      ce(null);
      return;
    }
    const W = Array.from(
      $.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (W.length === 0) {
      ce(null);
      return;
    }
    const T = /* @__PURE__ */ new Set(), U = new y.IntersectionObserver(
      (X) => {
        for (const q of X) {
          const ie = q.target.id;
          q.isIntersecting ? T.add(ie) : T.delete(ie);
        }
        if (T.size === 0) return;
        const te = W.find((q) => T.has(q.id));
        te && ce((q) => q === te.id ? q : te.id);
      },
      {
        root: $,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return W.forEach((X) => U.observe(X)), ce(W[0].id), () => {
      U.disconnect();
    };
  }, [f, r, y, x]), z(() => {
    if (!y || y.closed || !re) return;
    const $ = (W) => {
      W.key === "Escape" && ae(!1);
    };
    return y.document.addEventListener("keydown", $), () => {
      y.closed || y.document.removeEventListener("keydown", $);
    };
  }, [y, re]), z(() => {
    se.current && (se.current.inert = !re);
  }, [re]);
  const _e = S(async () => {
    if (r) {
      J(!0);
      try {
        await H(r);
      } catch ($) {
        console.error("Download failed:", $);
      } finally {
        J(!1);
      }
    }
  }, [r, H]);
  return P ? ln(
    /* @__PURE__ */ a("div", { className: "pip-container", children: [
      /* @__PURE__ */ a("header", { className: "pip-header", children: [
        /* @__PURE__ */ a("div", { className: "pip-header-left", children: [
          A && /* @__PURE__ */ e(
            "button",
            {
              onClick: () => {
                oe(), ae(!0);
              },
              onMouseEnter: Ie,
              onMouseLeave: xe,
              className: "pip-menu-btn",
              "aria-label": "目次を開く",
              "aria-expanded": re,
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: Re,
              className: "pip-back-btn",
              "aria-label": "前のページに戻る",
              title: "前のページに戻る",
              disabled: G.length === 0,
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "arrow_back" })
            }
          ),
          /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu_book" }),
          /* @__PURE__ */ e("span", { className: "pip-title", children: "マニュアル" })
        ] }),
        /* @__PURE__ */ a("div", { className: "pip-header-right", children: [
          d && r && /* @__PURE__ */ e(
            "button",
            {
              onClick: _e,
              className: "pip-download-btn",
              "aria-label": "ダウンロード",
              disabled: O,
              children: /* @__PURE__ */ e("span", { className: `pip-icon ${O ? "pip-spin" : ""}`, children: O ? "progress_activity" : "download" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: Fe,
              className: "pip-close-btn",
              "aria-label": "閉じる",
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "close" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ a("div", { className: "pip-body", children: [
        A && /* @__PURE__ */ a(ke, { children: [
          /* @__PURE__ */ e(
            "div",
            {
              className: `pip-toc-backdrop${re ? " pip-toc-backdrop-open" : ""}`,
              onClick: () => ae(!1),
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ a(
            "div",
            {
              ref: se,
              className: `pip-toc-panel${re ? " pip-toc-panel-open" : ""}`,
              role: "dialog",
              "aria-label": "目次",
              "aria-hidden": !re,
              onMouseEnter: oe,
              onMouseLeave: xe,
              children: [
                /* @__PURE__ */ a("div", { className: "pip-toc-panel-header", children: [
                  /* @__PURE__ */ e("span", { className: "pip-toc-panel-title", children: "目次" }),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      onClick: () => ae(!1),
                      className: "pip-toc-panel-close",
                      "aria-label": "目次を閉じる",
                      children: /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "20px" }, children: "close" })
                    }
                  )
                ] }),
                /* @__PURE__ */ e("div", { className: "pip-toc-panel-content", children: /* @__PURE__ */ e(
                  He,
                  {
                    items: A,
                    activePath: r,
                    onSelectPage: Te,
                    onSelectHeading: Me,
                    activeHeadingId: ze,
                    categoryIcons: L
                  }
                ) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ a("main", { className: "pip-content", ref: me, children: [
          x && /* @__PURE__ */ a("div", { className: "pip-loading", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-spin", children: "progress_activity" }),
            /* @__PURE__ */ e("span", { children: "読み込み中..." })
          ] }),
          R && /* @__PURE__ */ a("div", { className: "pip-error", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon", children: "warning" }),
            /* @__PURE__ */ a("div", { className: "pip-error-text", children: [
              /* @__PURE__ */ e("div", { className: "pip-error-title", children: "エラーが発生しました" }),
              /* @__PURE__ */ e("div", { className: "pip-error-detail", children: R.message })
            ] })
          ] }),
          f && /* @__PURE__ */ e(
            Be,
            {
              content: f,
              onLinkClick: Le,
              onAppLinkClick: u,
              icons: D
            }
          ),
          !x && !R && !f && /* @__PURE__ */ a("div", { className: "pip-empty", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-large", children: "description" }),
            /* @__PURE__ */ e("span", { children: "マニュアルを選択してください" })
          ] })
        ] }),
        ee && /* @__PURE__ */ e("aside", { className: "pip-sidebar", style: { width: "300px" }, children: w != null && /* @__PURE__ */ a(
          "div",
          {
            className: "pip-feedback-section",
            style: {
              height: j ? "100%" : "auto",
              flex: j ? 1 : "0 0 auto"
            },
            children: [
              /* @__PURE__ */ a("div", { className: "pip-feedback-header", children: [
                /* @__PURE__ */ a("div", { className: "pip-feedback-header-left", children: [
                  /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-small", children: "rate_review" }),
                  /* @__PURE__ */ e("span", { className: "pip-sidebar-title", children: "フィードバック" })
                ] }),
                /* @__PURE__ */ a(
                  "button",
                  {
                    onClick: () => he(!j),
                    className: "pip-toggle-btn",
                    "aria-label": j ? "フィードバックを閉じる" : "フィードバックを開く",
                    children: [
                      /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "18px" }, children: j ? "expand_less" : "expand_more" }),
                      /* @__PURE__ */ e("span", { children: j ? "閉じる" : "開く" })
                    ]
                  }
                )
              ] }),
              j && /* @__PURE__ */ e("div", { className: "pip-feedback-content", children: /* @__PURE__ */ e(
                rn,
                {
                  apiBaseUrl: w,
                  userType: g,
                  appVersion: p,
                  onSubmitSuccess: k,
                  onSubmitError: m
                }
              ) })
            ]
          }
        ) })
      ] })
    ] }),
    P
  ) : null;
}
function it(n) {
  Array.from(document.styleSheets).forEach((r) => {
    try {
      const i = Array.from(r.cssRules).map((u) => u.cssText).join(`
`);
      if (!i) return;
      const l = n.createElement("style");
      l.textContent = i, n.head.appendChild(l);
    } catch {
      if (r.href) {
        const i = n.createElement("link");
        i.rel = "stylesheet", i.href = r.href, n.head.appendChild(i);
      }
    }
  });
}
function lt() {
  return `
    @import url('${tn}');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${t.white};
      overflow: hidden;
    }

    ${Un}

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
      padding: 16px 24px;
      background: ${t.primary};
      color: ${t.white};
    }

    .pip-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pip-title {
      font-size: 18px;
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
      color: ${t.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-download-btn:hover:not(:disabled) {
      background: ${t.tertiary};
    }

    .pip-download-btn:focus {
      outline: 2px solid ${t.secondary};
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
      color: ${t.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-close-btn:hover {
      background: ${t.tertiary};
    }

    .pip-close-btn:focus {
      outline: 2px solid ${t.secondary};
      outline-offset: 2px;
    }

    /* ハンバーガーメニュー（目次パネル開閉）
       button 要素は UA スタイルで color が親から継承されないため、
       .pip-close-btn / .pip-download-btn と同様に明示指定する
       （指定漏れにより中の .pip-icon が既定の黒文字になっていた）。 */
    .pip-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: ${t.white};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-menu-btn:hover {
      background: ${t.tertiary};
    }

    .pip-menu-btn:focus {
      outline: 2px solid ${t.secondary};
      outline-offset: 2px;
    }

    /* 戻るボタン (1.4.11)。目次ボタンと同じ当たり判定で、
       戻り先が無いときは押せないことが分かるよう薄くする */
    .pip-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: ${t.white};
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;
    }

    .pip-back-btn:hover:not(:disabled) {
      background: ${t.tertiary};
    }

    .pip-back-btn:focus {
      outline: 2px solid ${t.secondary};
      outline-offset: 2px;
    }

    .pip-back-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }

    /* ボディ */
    .pip-body {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* 目次パネル背景オーバーレイ */
    .pip-toc-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 4;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .pip-toc-backdrop-open {
      opacity: 1;
      pointer-events: auto;
    }

    /* 目次パネル本体（左からスライドイン） */
    .pip-toc-panel {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      max-width: 85%;
      background: ${t.white};
      border-right: 1px solid ${t.gray300};
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
      z-index: 5;
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform 0.2s ease;
      pointer-events: none;
    }

    .pip-toc-panel-open {
      transform: translateX(0);
      pointer-events: auto;
    }

    .pip-toc-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid ${t.gray300};
      background: ${t.gray100};
      flex-shrink: 0;
    }

    .pip-toc-panel-title {
      font-size: 14px;
      font-weight: 700;
      color: ${t.tertiary};
    }

    .pip-toc-panel-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: ${t.gray700};
      cursor: pointer;
    }

    .pip-toc-panel-close:hover {
      background: ${t.gray100};
    }

    .pip-toc-panel-content {
      flex: 1;
      overflow: auto;
      padding: 8px 0;
    }

    /* コンテンツエリア
       padding は ManualTabPage の mainContent(32px) より狭い 24px を意図的に維持する
       （PiP は 420〜650px 幅の小さいフローティングウィンドウのため、32px にすると
       本文の実効幅が狭くなりすぎる）。line-height は ManualTabPage と揃える。 */
    .pip-content {
      flex: 1;
      overflow: auto;
      padding: 24px;
      line-height: 1.7;
      min-width: 0;
    }

    /* サイドバー（フィードバック用） */
    .pip-sidebar {
      overflow: hidden;
      flex-shrink: 0;
      border-left: 1px solid ${t.gray300};
      display: flex;
      flex-direction: column;
    }

    /* サイドバーヘッダー（フィードバック用） */
    .pip-sidebar-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid ${t.gray300};
      background-color: ${t.gray100};
      flex-shrink: 0;
    }

    .pip-icon-small {
      font-size: 20px;
      color: ${t.tertiary};
    }

    .pip-sidebar-title {
      font-size: 14px;
      font-weight: 600;
      color: ${t.tertiary};
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
      border-top: 1px solid ${t.gray300};
      border-bottom: 1px solid ${t.gray300};
      background-color: ${t.gray100};
      flex-shrink: 0;
    }

    .pip-feedback-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pip-toggle-btn {
      background: transparent;
      border: 1px solid ${t.gray300};
      padding: 8px 12px;
      cursor: pointer;
      color: ${t.gray700};
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
      background-color: ${t.gray100};
      border-color: ${t.gray700};
    }

    .pip-toggle-btn:active {
      background-color: ${t.gray700};
      color: ${t.white};
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
      color: ${t.gray500};
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
      background: ${t.errorBg};
      border: 1px solid #FECACA;
      border-radius: 12px;
      color: ${t.error};
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
      color: ${t.gray500};
      font-size: 14px;
    }

    .pip-icon-large {
      font-size: 64px;
      opacity: 0.5;
    }

    /* Markdown スタイル
       .pip-container でスコープする。PiP ウィンドウは別 document なので他コンポーネントの
       CSS とはそもそも衝突しないが、命名・詳細度の方針を他2箇所（ManualTabPage/DebugPanel）
       と揃えるため同様にスコープする。 */
    .pip-container .manual-markdown {
      color: ${t.gray700};
    }

    .pip-container .manual-markdown h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${t.primary};
      border-bottom: 2px solid ${t.secondary};
      padding-bottom: 8px;
    }

    .pip-container .manual-markdown h2 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      color: ${t.tertiary};
    }

    .pip-container .manual-markdown h3 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 8px;
      color: ${t.gray700};
    }

    .pip-container .manual-markdown p {
      margin-bottom: 12px;
    }

    .pip-container .manual-markdown ul,
    .pip-container .manual-markdown ol {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    .pip-container .manual-markdown li {
      margin-bottom: 4px;
    }

    .pip-container .manual-markdown a {
      color: ${t.primary};
      text-decoration: underline;
      cursor: pointer;
    }

    .pip-container .manual-markdown a:hover {
      color: ${t.tertiary};
    }

    .pip-container .manual-markdown code {
      background: ${t.gray100};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 14px;
    }

    .pip-container .manual-markdown pre {
      background: ${t.gray100};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 12px;
    }

    .pip-container .manual-markdown pre code {
      background: transparent;
      padding: 0;
    }

    .pip-container .manual-markdown table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }

    .pip-container .manual-markdown th,
    .pip-container .manual-markdown td {
      border: 1px solid ${t.gray300};
      padding: 8px 12px;
      text-align: left;
    }

    .pip-container .manual-markdown th {
      background: ${t.gray100};
      font-weight: 600;
    }

    .pip-container .manual-markdown hr {
      border: none;
      border-top: 1px solid ${t.gray300};
      margin: 24px 0;
    }

    .pip-container .manual-markdown blockquote {
      border-left: 4px solid ${t.secondary};
      padding-left: 16px;
      margin: 12px 0;
      color: ${t.gray500};
    }
  `;
}
function yt({
  items: n,
  onSelect: r,
  activePath: i,
  className: l = "",
  onPiP: u,
  onNewTab: s,
  categoryIcons: d
}) {
  z(() => {
    $e() || Se();
  }, []);
  const E = Oe(() => {
    const D = {}, L = [], A = [...n].sort((w, g) => (w.order ?? 0) - (g.order ?? 0));
    for (const w of A)
      w.category ? (D[w.category] || (D[w.category] = []), D[w.category].push(w)) : L.push(w);
    return { groups: D, uncategorized: L };
  }, [n]);
  return /* @__PURE__ */ a("nav", { className: `manual-sidebar ${l}`, children: [
    E.uncategorized.length > 0 && /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: E.uncategorized.map((D) => /* @__PURE__ */ e(
      Ue,
      {
        item: D,
        isActive: i === D.path,
        onSelect: r,
        onPiP: u,
        onNewTab: s
      },
      D.id
    )) }),
    Object.entries(E.groups).map(([D, L]) => /* @__PURE__ */ a("div", { style: { marginTop: "16px" }, children: [
      /* @__PURE__ */ a(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#666",
            textTransform: "uppercase",
            padding: "8px 12px"
          },
          children: [
            (d == null ? void 0 : d[D]) && /* @__PURE__ */ e("span", { style: { display: "inline-flex", alignItems: "center" }, "aria-hidden": "true", children: d[D] }),
            D
          ]
        }
      ),
      /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: L.map((A) => /* @__PURE__ */ e(
        Ue,
        {
          item: A,
          isActive: i === A.path,
          onSelect: r,
          onPiP: u,
          onNewTab: s
        },
        A.id
      )) })
    ] }, D))
  ] });
}
function Ue({ item: n, isActive: r, onSelect: i, onPiP: l, onNewTab: u }) {
  const s = {
    itemRow: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      width: "100%"
    },
    itemButton: {
      // アイコンがある時だけ flex にする（テキストのみの既存表示は block のまま変えない）
      display: n.icon ? "flex" : "block",
      alignItems: "center",
      gap: "8px",
      flex: 1,
      padding: "8px 12px",
      border: "none",
      background: r ? "#e3f2fd" : "transparent",
      textAlign: "left",
      cursor: "pointer",
      fontSize: "14px",
      color: r ? "#1976d2" : "#333",
      borderLeft: r ? "3px solid #1976d2" : "3px solid transparent"
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
      color: t.gray500,
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
  return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ a("div", { style: s.itemRow, children: [
    /* @__PURE__ */ a(
      "button",
      {
        onClick: () => i(n.path),
        style: s.itemButton,
        children: [
          n.icon && /* @__PURE__ */ e("span", { style: { display: "inline-flex", alignItems: "center", flex: "none" }, "aria-hidden": "true", children: n.icon }),
          n.title
        ]
      }
    ),
    /* @__PURE__ */ a("div", { style: s.actionButtons, children: [
      l && /* @__PURE__ */ e(
        "button",
        {
          onClick: (d) => {
            d.stopPropagation(), l(n.path);
          },
          style: s.actionBtn,
          title: "PiPで開く",
          "aria-label": "PiPで開く",
          onMouseEnter: (d) => {
            d.currentTarget.style.backgroundColor = t.gray100, d.currentTarget.style.color = t.primary;
          },
          onMouseLeave: (d) => {
            d.currentTarget.style.backgroundColor = "transparent", d.currentTarget.style.color = t.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: s.icon, children: "picture_in_picture_alt" })
        }
      ),
      u && /* @__PURE__ */ e(
        "button",
        {
          onClick: (d) => {
            d.stopPropagation(), u(n.path);
          },
          style: s.actionBtn,
          title: "新しいタブで開く",
          "aria-label": "新しいタブで開く",
          onMouseEnter: (d) => {
            d.currentTarget.style.backgroundColor = t.gray100, d.currentTarget.style.color = t.primary;
          },
          onMouseLeave: (d) => {
            d.currentTarget.style.backgroundColor = "transparent", d.currentTarget.style.color = t.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: s.icon, children: "open_in_new" })
        }
      )
    ] })
  ] }) });
}
function bt({
  path: n,
  onClick: r,
  children: i,
  className: l = ""
}) {
  return /* @__PURE__ */ e(
    "a",
    {
      href: n,
      onClick: (s) => {
        s.preventDefault(), r(n);
      },
      className: `manual-link ${l}`,
      style: {
        color: "#1976d2",
        textDecoration: "underline",
        cursor: "pointer"
      },
      children: i
    }
  );
}
function Ct({ docPath: n, className: r = "" }) {
  const { content: i, loading: l, error: u, reload: s } = Ae(n);
  return /* @__PURE__ */ a(
    "article",
    {
      className: `manual-page ${r}`,
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px"
      },
      children: [
        l && /* @__PURE__ */ e("div", { style: { textAlign: "center", padding: "40px", color: "#666" }, children: "読み込み中..." }),
        u && /* @__PURE__ */ a(
          "div",
          {
            style: {
              padding: "20px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              color: "#c62828"
            },
            children: [
              /* @__PURE__ */ a("p", { style: { margin: 0 }, children: [
                "マニュアルの読み込みに失敗しました: ",
                u.message
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
        i && /* @__PURE__ */ e(Be, { content: i })
      ]
    }
  );
}
const ut = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.manual-resize-handle {
  background-color: ${t.gray300};
}

.manual-resize-handle:hover,
.manual-resize-handle.resizing {
  background-color: ${t.secondary};
}

.manual-v-resize-handle {
  background-color: ${t.gray300};
}

.manual-v-resize-handle:hover,
.manual-v-resize-handle.resizing {
  background-color: ${t.secondary};
}

@media print {
  /* items 指定時のみ container/body が height:100vh + overflow:hidden で固定されるため、
     印刷時はページネーションできるよう高さ制約を解除する（items 未指定時はそもそも
     この制約が付かないため無害な上書きになる）。 */
  .manual-tab-page { height: auto !important; overflow: visible !important; }
  .manual-tab-page > header { display: none !important; }
  .manual-tab-page .manual-body { height: auto !important; overflow: visible !important; }
  .manual-tab-page main { max-width: 100% !important; height: auto !important; overflow: visible !important; }
  .manual-tab-page .manual-resize-handle,
  .manual-tab-page .manual-v-resize-handle,
  .manual-tab-page aside { display: none !important; }
  /* モバイル向けハンバーガーボタン・オーバーレイ目次パネルも印刷時は不要 */
  .manual-tab-page .manual-menu-btn,
  .manual-tab-page .manual-toc-backdrop,
  .manual-tab-page .manual-toc-panel { display: none !important; }
}

/* ハンバーガーメニュー（モバイル幅での目次パネル開閉） */
.manual-menu-btn:hover {
  background: ${t.tertiary};
}

.manual-menu-btn:focus {
  outline: 2px solid ${t.secondary};
  outline-offset: 2px;
}

/* 目次パネル背景オーバーレイ（モバイル幅） */
.manual-toc-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 4;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.manual-toc-backdrop-open {
  opacity: 1;
  pointer-events: auto;
}

/* 目次パネル本体（左からスライドイン、モバイル幅） */
.manual-toc-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85%;
  background: ${t.white};
  border-right: 1px solid ${t.gray300};
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 5;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
  pointer-events: none;
}

.manual-toc-panel-open {
  transform: translateX(0);
  pointer-events: auto;
}

.manual-toc-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${t.gray300};
  background: ${t.gray100};
  flex-shrink: 0;
}

.manual-toc-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: ${t.tertiary};
}

.manual-toc-panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: ${t.gray700};
  cursor: pointer;
}

.manual-toc-panel-close:hover {
  background: ${t.gray100};
}

.manual-toc-panel-content {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}

/* Markdown スタイル
   .manual-tab-page でスコープする: MarkdownRenderer 自身が持つ :where(.manual-markdown ...)
   フォールバック（詳細度0）より確実に優先させるため、また DebugPanel の同名セレクタと
   両者が同時にマウントされた場合に DOM 順序次第で優先順位が不定になるのを避けるため。 */
.manual-tab-page .manual-markdown {
  color: ${t.gray700};
}

.manual-tab-page .manual-markdown h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${t.primary};
  border-bottom: 2px solid ${t.secondary};
  padding-bottom: 8px;
}

.manual-tab-page .manual-markdown h2 {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${t.tertiary};
}

.manual-tab-page .manual-markdown h3 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${t.gray700};
}

.manual-tab-page .manual-markdown p {
  margin-bottom: 12px;
}

.manual-tab-page .manual-markdown ul,
.manual-tab-page .manual-markdown ol {
  margin-bottom: 12px;
  padding-left: 24px;
}

.manual-tab-page .manual-markdown li {
  margin-bottom: 4px;
}

.manual-tab-page .manual-markdown a {
  color: ${t.primary};
  text-decoration: underline;
  cursor: pointer;
}

.manual-tab-page .manual-markdown a:hover {
  color: ${t.tertiary};
}

.manual-tab-page .manual-markdown code {
  background: ${t.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

.manual-tab-page .manual-markdown pre {
  background: ${t.gray100};
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.manual-tab-page .manual-markdown pre code {
  background: transparent;
  padding: 0;
}

.manual-tab-page .manual-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.manual-tab-page .manual-markdown th,
.manual-tab-page .manual-markdown td {
  border: 1px solid ${t.gray300};
  padding: 8px 12px;
  text-align: left;
}

.manual-tab-page .manual-markdown th {
  background: ${t.gray100};
  font-weight: 600;
}

.manual-tab-page .manual-markdown hr {
  border: none;
  border-top: 1px solid ${t.gray300};
  margin: 24px 0;
}

.manual-tab-page .manual-markdown blockquote {
  border-left: 4px solid ${t.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${t.gray500};
}
`;
function Xe(n, r) {
  if (n.startsWith("/")) return n;
  const i = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/";
  try {
    return new URL(n, "http://d" + i).pathname;
  } catch {
    return i + n;
  }
}
function Et({
  defaultDocPath: n,
  sidebarPath: r,
  onSidebarNavigate: i,
  onSidebarAppNavigate: l,
  sidebarDefaultWidth: u = 400,
  sidebarMinWidth: s = 250,
  sidebarMaxWidth: d = 800,
  feedbackApiBaseUrl: E,
  feedbackUserType: D,
  feedbackAppVersion: L,
  feedbackAdminUrl: A,
  feedbackDefaultHeight: w = 350,
  feedbackMinHeight: g = 200,
  feedbackMaxHeight: p = 600,
  onFeedbackSubmitSuccess: k,
  onFeedbackSubmitError: m,
  items: v,
  defaultExpandCategories: F,
  onAppNavigate: _,
  icons: y,
  categoryIcons: Z
} = {}) {
  const [P, o] = I(null), { content: f, loading: x, error: R } = Ae(P), H = M(null), G = M(!1), [V, Q] = I(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 767px)").matches);
  z(() => {
    if (typeof window > "u") return;
    const B = window.matchMedia("(max-width: 767px)"), N = (ne) => Q(ne.matches);
    return B.addEventListener("change", N), () => B.removeEventListener("change", N);
  }, []);
  const [c, h] = I(!1), O = M(null), J = M(null), ee = M(null);
  z(() => {
    h(!1);
  }, [V]);
  const [j, he] = I(!0), [re, ae] = I(400), [de, le] = I(r ?? null);
  z(() => {
    i === void 0 && le(r ?? null);
  }, [r, i]);
  const ue = i !== void 0, se = ue ? r ?? null : de, {
    content: me,
    loading: ze,
    error: ce
  } = Ae(se), { size: ge, isResizing: Ce, handleMouseDown: Fe, handleKeyDown: Le } = We({
    defaultSize: u,
    minSize: s,
    maxSize: d
  }), oe = r != null && E != null, Ie = M(null), {
    size: xe,
    isResizing: Re,
    handleMouseDown: Te,
    handleKeyDown: Me
  } = We({
    defaultSize: w,
    minSize: g,
    maxSize: p,
    direction: "vertical",
    enabled: oe && j
  });
  z(() => {
    oe && j && ae(xe);
  }, [xe, oe, j]);
  const _e = cn(), $ = M(null), W = M(null), [T, U] = I(null), X = M(!1);
  z(() => {
    $e() || Se();
  }, []), z(() => {
    $.current && ($.current.scrollTop = 0);
  }, [se]), z(() => {
    X.current = !1;
  }, [P]), z(() => {
    x && (X.current = !0);
  }, [x]), z(() => {
    const B = W.current;
    if (!B || !f || !X.current) {
      U(null);
      return;
    }
    const N = Array.from(
      B.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (N.length === 0) {
      U(null);
      return;
    }
    const ne = /* @__PURE__ */ new Set(), be = new IntersectionObserver(
      (De) => {
        for (const pe of De) {
          const Ne = pe.target.id;
          pe.isIntersecting ? ne.add(Ne) : ne.delete(Ne);
        }
        if (ne.size === 0) return;
        const fe = N.find((pe) => ne.has(pe.id));
        fe && U((pe) => pe === fe.id ? pe : fe.id);
      },
      {
        root: B,
        // ビューポート上部付近（上30%のライン）を基準に「読んでいる見出し」を判定する
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return N.forEach((De) => be.observe(De)), U(N[0].id), () => {
      be.disconnect();
    };
  }, [f, P, x]);
  const te = r != null || E != null;
  z(() => {
    const N = new URLSearchParams(window.location.search).get("path");
    N ? o(N) : n && o(n);
  }, [n]);
  const q = S((B) => {
    const N = `${window.location.pathname}?path=${encodeURIComponent(B)}`;
    window.history.pushState({}, "", N), o(B);
  }, []), ie = S(
    (B) => {
      q(Xe(B, P));
    },
    [P, q]
  ), Ee = S(
    (B) => {
      h(!1), q(B);
    },
    [q]
  ), ye = S(
    (B, N) => {
      var ne;
      if (h(!1), B === P) {
        (ne = document.getElementById(N)) == null || ne.scrollIntoView({ behavior: "smooth" });
        return;
      }
      H.current = { path: B, headingId: N }, q(B);
    },
    [P, q]
  );
  z(() => {
    const B = H.current;
    if (!B || B.path !== P) {
      G.current = !1;
      return;
    }
    if (x) {
      G.current = !0;
      return;
    }
    if (!G.current || !f) return;
    let N = !1, ne, be = 0;
    const De = () => {
      if (N) return;
      const fe = document.getElementById(B.headingId);
      if (fe) {
        fe.scrollIntoView({ behavior: "smooth" }), H.current = null;
        return;
      }
      be += 1, be < 30 ? ne = requestAnimationFrame(De) : H.current = null;
    };
    return ne = requestAnimationFrame(De), () => {
      N = !0, cancelAnimationFrame(ne);
    };
  }, [f, P, x]);
  const we = S(
    (B) => {
      window.opener && !window.opener.closed ? window.opener.postMessage({ type: "manual-app-navigate", path: B }, window.location.origin) : _ == null || _(B);
    },
    [_]
  ), on = S(
    (B) => {
      const N = Xe(B, se);
      ue ? i(N) : le(N);
    },
    [ue, i, se]
  ), an = S(
    (B) => {
      l == null || l(B);
    },
    [l]
  );
  return z(() => {
    const B = () => {
      const ne = new URLSearchParams(window.location.search).get("path");
      ne && o(ne), h(!1);
    };
    return window.addEventListener("popstate", B), () => window.removeEventListener("popstate", B);
  }, []), z(() => {
    if (!c) return;
    const B = (N) => {
      N.key === "Escape" && h(!1);
    };
    return document.addEventListener("keydown", B), () => document.removeEventListener("keydown", B);
  }, [c]), z(() => {
    O.current && (O.current.inert = !c);
  }, [c, V]), z(() => {
    var N;
    const B = !!v && V && c;
    J.current && (J.current.inert = B), ee.current && (ee.current.inert = B), B && ((N = O.current) == null || N.focus());
  }, [v, V, c]), /* @__PURE__ */ a(
    "div",
    {
      className: "manual-tab-page",
      style: {
        ...b.container,
        // items 未指定時は既存の見た目・挙動を一切変えない（docs/usage.md の互換性保証）。
        // items 指定時のみ container を height:100vh + overflow:hidden に固定し、
        // 常設サイドバー(tocPane)がビューポート内で独立スクロールできるようにする。
        ...v ? b.containerWithToc : b.containerLegacy
      },
      children: [
        /* @__PURE__ */ a("header", { ref: J, style: b.header, children: [
          /* @__PURE__ */ a("div", { style: b.headerLeft, children: [
            v && V && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => h((B) => !B),
                className: "manual-menu-btn",
                style: b.headerButton,
                "aria-label": c ? "目次を閉じる" : "目次を開く",
                "aria-expanded": c,
                children: /* @__PURE__ */ e("span", { style: b.icon, children: "menu" })
              }
            ),
            /* @__PURE__ */ e("span", { style: b.icon, children: "menu_book" }),
            /* @__PURE__ */ e("span", { style: b.title, children: "マニュアル" })
          ] }),
          /* @__PURE__ */ a("div", { style: b.headerRight, children: [
            _e && A && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => window.open(A, "_blank"),
                style: b.headerButton,
                title: "フィードバック管理",
                children: /* @__PURE__ */ e("span", { style: b.icon, children: "admin_panel_settings" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => window.print(),
                style: b.headerButton,
                title: "印刷",
                children: /* @__PURE__ */ e("span", { style: b.icon, children: "print" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ a("div", { className: "manual-body", style: b.body, children: [
          v && !V && /* @__PURE__ */ a("aside", { style: b.tocPane, children: [
            /* @__PURE__ */ a("div", { style: b.tocHeader, children: [
              /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "20px", color: t.tertiary }, children: "toc" }),
              /* @__PURE__ */ e("span", { style: b.sidebarTitle, children: "目次" })
            ] }),
            /* @__PURE__ */ e("div", { style: b.tocContent, children: /* @__PURE__ */ e(
              He,
              {
                items: v,
                activePath: P,
                onSelectPage: Ee,
                onSelectHeading: ye,
                activeHeadingId: T,
                defaultExpandCategories: F,
                categoryIcons: Z
              }
            ) })
          ] }),
          v && V && /* @__PURE__ */ a(ke, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `manual-toc-backdrop${c ? " manual-toc-backdrop-open" : ""}`,
                onClick: () => h(!1),
                "aria-hidden": "true"
              }
            ),
            /* @__PURE__ */ a(
              "div",
              {
                ref: O,
                className: `manual-toc-panel${c ? " manual-toc-panel-open" : ""}`,
                role: "dialog",
                "aria-label": "目次",
                "aria-hidden": !c,
                tabIndex: -1,
                children: [
                  /* @__PURE__ */ a("div", { className: "manual-toc-panel-header", children: [
                    /* @__PURE__ */ e("span", { className: "manual-toc-panel-title", children: "目次" }),
                    /* @__PURE__ */ e(
                      "button",
                      {
                        onClick: () => h(!1),
                        className: "manual-toc-panel-close",
                        "aria-label": "目次を閉じる",
                        children: /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "20px" }, children: "close" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("div", { className: "manual-toc-panel-content", children: /* @__PURE__ */ e(
                    He,
                    {
                      items: v,
                      activePath: P,
                      onSelectPage: Ee,
                      onSelectHeading: ye,
                      activeHeadingId: T,
                      defaultExpandCategories: F,
                      categoryIcons: Z
                    }
                  ) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ a("div", { ref: ee, style: { display: "contents" }, children: [
            /* @__PURE__ */ e("main", { ref: W, style: b.mainPane, children: /* @__PURE__ */ a("div", { style: b.mainContent, children: [
              x && /* @__PURE__ */ a("div", { style: b.loading, children: [
                /* @__PURE__ */ e("span", { style: { ...b.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                /* @__PURE__ */ e("span", { children: "読み込み中..." })
              ] }),
              R && /* @__PURE__ */ a("div", { style: b.error, children: [
                /* @__PURE__ */ e("span", { style: b.icon, children: "warning" }),
                /* @__PURE__ */ a("div", { children: [
                  /* @__PURE__ */ e("div", { style: b.errorTitle, children: "エラーが発生しました" }),
                  /* @__PURE__ */ e("div", { style: b.errorDetail, children: R.message })
                ] })
              ] }),
              f && /* @__PURE__ */ e(
                Be,
                {
                  content: f,
                  icons: y,
                  onLinkClick: ie,
                  onAppLinkClick: we
                }
              ),
              !x && !R && !f && !P && /* @__PURE__ */ a("div", { style: b.empty, children: [
                /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "64px", opacity: 0.5 }, children: "description" }),
                /* @__PURE__ */ e("span", { children: "マニュアルが指定されていません" })
              ] })
            ] }) }),
            te && /* @__PURE__ */ a(ke, { children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `manual-resize-handle${Ce ? " resizing" : ""}`,
                  onMouseDown: Fe,
                  onKeyDown: Le,
                  style: b.resizeHandle,
                  role: "separator",
                  "aria-orientation": "vertical",
                  "aria-valuenow": ge,
                  "aria-valuemin": s,
                  "aria-valuemax": d,
                  "aria-label": "サイドバーのリサイズ",
                  tabIndex: 0
                }
              ),
              /* @__PURE__ */ a("aside", { style: { ...b.sidebarPane, width: ge }, children: [
                r != null && /* @__PURE__ */ a(
                  "div",
                  {
                    ref: Ie,
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      flex: E && j ? `0 0 ${re}px` : 1,
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ a("div", { style: b.sidebarHeader, children: [
                        !ue && de !== r && /* @__PURE__ */ e(
                          "button",
                          {
                            onClick: () => le(r ?? null),
                            style: b.backButton,
                            title: "初期ページに戻る",
                            children: /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "20px" }, children: "home" })
                          }
                        ),
                        /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "20px", color: t.tertiary }, children: "auto_stories" }),
                        /* @__PURE__ */ e("span", { style: b.sidebarTitle, children: "参照" })
                      ] }),
                      /* @__PURE__ */ a(
                        "div",
                        {
                          ref: $,
                          style: b.sidebarContent,
                          children: [
                            ze && /* @__PURE__ */ a("div", { style: b.loading, children: [
                              /* @__PURE__ */ e("span", { style: { ...b.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                              /* @__PURE__ */ e("span", { children: "読み込み中..." })
                            ] }),
                            ce && /* @__PURE__ */ a("div", { style: b.error, children: [
                              /* @__PURE__ */ e("span", { style: b.icon, children: "warning" }),
                              /* @__PURE__ */ a("div", { children: [
                                /* @__PURE__ */ e("div", { style: b.errorTitle, children: "エラー" }),
                                /* @__PURE__ */ e("div", { style: b.errorDetail, children: ce.message })
                              ] })
                            ] }),
                            me && /* @__PURE__ */ e(
                              Be,
                              {
                                content: me,
                                icons: y,
                                onLinkClick: on,
                                onAppLinkClick: an
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ),
                r && E && j && /* @__PURE__ */ e(
                  "div",
                  {
                    className: `manual-v-resize-handle${Re ? " resizing" : ""}`,
                    onMouseDown: Te,
                    onKeyDown: Me,
                    style: b.vResizeHandle,
                    role: "separator",
                    "aria-orientation": "horizontal",
                    "aria-valuenow": re,
                    "aria-valuemin": 150,
                    "aria-valuemax": 800,
                    "aria-label": "TOC領域のリサイズ",
                    tabIndex: 0
                  }
                ),
                E != null && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      height: j ? r ? "auto" : "100%" : "auto",
                      flex: j && !r ? 1 : j ? "1 1 0" : "0 0 auto",
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ a("div", { style: b.feedbackHeader, children: [
                        /* @__PURE__ */ a("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                          /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "20px", color: t.tertiary }, children: "rate_review" }),
                          /* @__PURE__ */ e("span", { style: b.sidebarTitle, children: "フィードバック" })
                        ] }),
                        /* @__PURE__ */ a(
                          "button",
                          {
                            onClick: () => he(!j),
                            style: b.toggleBtn,
                            onMouseEnter: (B) => {
                              B.currentTarget.style.backgroundColor = t.gray100, B.currentTarget.style.borderColor = t.gray700;
                            },
                            onMouseLeave: (B) => {
                              B.currentTarget.style.backgroundColor = "transparent", B.currentTarget.style.borderColor = t.gray300;
                            },
                            "aria-label": j ? "フィードバックを閉じる" : "フィードバックを開く",
                            title: j ? "フィードバックを閉じる" : "フィードバックを開く",
                            children: [
                              /* @__PURE__ */ e("span", { style: { ...b.icon, fontSize: "18px" }, children: j ? "expand_less" : "expand_more" }),
                              /* @__PURE__ */ e("span", { children: j ? "閉じる" : "開く" })
                            ]
                          }
                        )
                      ] }),
                      j && /* @__PURE__ */ e("div", { style: b.feedbackContent, children: /* @__PURE__ */ e(
                        rn,
                        {
                          apiBaseUrl: E,
                          userType: D,
                          appVersion: L,
                          onSubmitSuccess: k,
                          onSubmitError: m
                        }
                      ) })
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e("style", { children: ut })
      ]
    }
  );
}
const b = {
  container: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  // items 未指定時（既存利用者向け）: 従来通り minHeight のみ・overflow 指定なし。
  // コンテンツが1画面を超える場合はコンテナごと伸び、ウィンドウレベルでスクロールする
  // （bugではあるが、items 未採用の既存ホストの挙動を変えないため意図的に維持する）。
  containerLegacy: {
    minHeight: "100vh"
  },
  // items 指定時: height を 100vh に固定し overflow:hidden にすることで、
  // 子要素（tocPane/mainPane）の overflow:auto が正しく機能し、tocPane が
  // ビューポート内で独立スクロールできるようにする。
  containerWithToc: {
    height: "100vh",
    overflow: "hidden"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: t.primary,
    color: t.white,
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
    color: t.white,
    cursor: "pointer"
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    position: "relative"
  },
  tocPane: {
    width: "260px",
    flexShrink: 0,
    borderRight: `1px solid ${t.gray300}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  tocHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    borderBottom: `1px solid ${t.gray300}`,
    backgroundColor: t.gray100,
    flexShrink: 0
  },
  tocContent: {
    flex: 1,
    overflow: "auto",
    padding: "8px 0"
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
    borderLeft: `1px solid ${t.gray300}`,
    display: "flex",
    flexDirection: "column"
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    borderBottom: `1px solid ${t.gray300}`,
    backgroundColor: t.gray100,
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
    color: t.tertiary
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: t.tertiary
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
    borderTop: `1px solid ${t.gray300}`,
    borderBottom: `1px solid ${t.gray300}`,
    backgroundColor: t.gray100,
    flexShrink: 0
  },
  toggleBtn: {
    background: "transparent",
    border: `1px solid ${t.gray300}`,
    padding: "8px 12px",
    cursor: "pointer",
    color: t.gray700,
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
    color: t.gray500,
    fontSize: "16px"
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    backgroundColor: t.errorBg,
    border: "1px solid #FECACA",
    borderRadius: "12px",
    color: t.error
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
    color: t.gray500,
    fontSize: "14px"
  }
}, Ze = {
  bug: { label: "不具合", color: "#DC2626" },
  question: { label: "質問", color: "#2563EB" },
  request: { label: "要望", color: "#059669" },
  share: { label: "共有", color: "#6B7280" },
  other: { label: "その他", color: "#9333EA" }
}, Ye = {
  app: "アプリ",
  manual: "マニュアル"
}, st = {
  open: { label: "open", color: "#F59E0B" },
  in_progress: { label: "対応中", color: "#2563EB" },
  closed: { label: "完了", color: "#059669" }
};
function wt({ apiBaseUrl: n, adminKey: r }) {
  var Q;
  const {
    feedbacks: i,
    total: l,
    page: u,
    limit: s,
    loading: d,
    error: E,
    filters: D,
    customTags: L,
    setFilters: A,
    setPage: w,
    updateStatus: g,
    remove: p,
    refresh: k
  } = dn({ apiBaseUrl: n, adminKey: r }), [m, v] = I(null), [F, _] = I(null), [y, Z] = I(!1), [P, o] = I(null), f = M(0);
  z(() => {
    $e() || Se();
  }, []);
  const x = Math.max(1, Math.ceil(l / s)), R = S(async (c) => {
    if (m === c) {
      v(null), _(null);
      return;
    }
    v(c), Z(!0);
    const h = ++f.current;
    try {
      const O = await Fn({ apiBaseUrl: n, adminKey: r, id: c });
      if (f.current !== h) return;
      _(O);
    } catch {
      if (f.current !== h) return;
      _(null);
    }
    f.current === h && Z(!1);
  }, [m, n, r]), H = S(async (c) => {
    confirm("削除しますか？") && (await p(c), m === c && (v(null), _(null)));
  }, [p, m]), G = S(async (c, h) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await xn({ apiBaseUrl: n, adminKey: r, feedbackId: c, attachmentId: h }), _((O) => {
          var J;
          return !O || O.id !== c ? O : {
            ...O,
            attachments: (J = O.attachments) == null ? void 0 : J.filter((ee) => ee.id !== h)
          };
        });
      } catch (O) {
        console.error("Failed to delete attachment:", O);
      }
  }, [n, r]), V = S((c) => {
    try {
      const h = new URL(n);
      return `${h.origin}${h.pathname.replace(/\/$/, "")}/attachments/${c}`;
    } catch {
      return `${n}/attachments/${c}`;
    }
  }, [n]);
  return /* @__PURE__ */ a("div", { style: C.container, children: [
    /* @__PURE__ */ e("h2", { style: C.title, children: "フィードバック管理" }),
    /* @__PURE__ */ a("div", { style: C.filterRow, children: [
      /* @__PURE__ */ a(
        "select",
        {
          value: D.status,
          onChange: (c) => A({ status: c.target.value }),
          style: C.select,
          "aria-label": "ステータスフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全ステータス" }),
            /* @__PURE__ */ e("option", { value: "open", children: "open" }),
            /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
            /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
          ]
        }
      ),
      /* @__PURE__ */ a(
        "select",
        {
          value: D.kind,
          onChange: (c) => A({ kind: c.target.value }),
          style: C.select,
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
      /* @__PURE__ */ a(
        "select",
        {
          value: D.target,
          onChange: (c) => A({ target: c.target.value }),
          style: C.select,
          "aria-label": "対象フィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
            /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
            /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
          ]
        }
      ),
      L.length > 0 && /* @__PURE__ */ a(
        "select",
        {
          value: D.customTag,
          onChange: (c) => A({ customTag: c.target.value }),
          style: C.select,
          "aria-label": "タグフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
            L.map((c) => /* @__PURE__ */ e("option", { value: c, children: c }, c))
          ]
        }
      ),
      /* @__PURE__ */ e("button", { onClick: k, style: C.refreshBtn, "aria-label": "更新", children: /* @__PURE__ */ e("span", { style: C.iconSmall, children: "refresh" }) })
    ] }),
    E && /* @__PURE__ */ e("div", { style: C.error, role: "alert", children: E.message.slice(0, 200) }),
    /* @__PURE__ */ a("table", { style: C.table, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ a("tr", { children: [
        /* @__PURE__ */ e("th", { style: C.th, children: "日時" }),
        /* @__PURE__ */ e("th", { style: C.th, children: "種別" }),
        /* @__PURE__ */ e("th", { style: C.th, children: "対象" }),
        /* @__PURE__ */ e("th", { style: { ...C.th, width: "40%" }, children: "メッセージ" }),
        /* @__PURE__ */ e("th", { style: C.th, children: "状態" }),
        /* @__PURE__ */ e("th", { style: { ...C.th, width: "30px" } })
      ] }) }),
      /* @__PURE__ */ a("tbody", { children: [
        d && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: C.loadingCell, children: "読み込み中..." }) }),
        !d && i.length === 0 && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: C.loadingCell, children: "データなし" }) }),
        i.map((c) => {
          var ee;
          const h = Ze[c.kind] ?? { label: c.kind, color: "#6B7280" }, O = st[c.status] ?? { label: c.status, color: "#6B7280" }, J = m === c.id;
          return /* @__PURE__ */ a("tr", { children: [
            /* @__PURE__ */ e("td", { style: C.td, children: /* @__PURE__ */ e(
              "button",
              {
                onClick: () => R(c.id),
                style: C.rowButton,
                "aria-expanded": J,
                "aria-controls": J ? `feedback-detail-${c.id}` : void 0,
                children: (ee = c.createdAt) == null ? void 0 : ee.slice(5, 16).replace("T", " ")
              }
            ) }),
            /* @__PURE__ */ e("td", { style: C.td, children: /* @__PURE__ */ e("span", { style: { ...C.badge, backgroundColor: h.color }, children: h.label }) }),
            /* @__PURE__ */ e("td", { style: C.td, children: c.target ? Ye[c.target] ?? c.target : "-" }),
            /* @__PURE__ */ e("td", { style: { ...C.td, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: c.message.slice(0, 80) }),
            /* @__PURE__ */ e("td", { style: C.td, children: /* @__PURE__ */ e("span", { style: { color: O.color, fontWeight: 600, fontSize: "12px" }, children: O.label }) }),
            /* @__PURE__ */ e("td", { style: C.td, children: (c.attachmentCount ?? 0) > 0 && /* @__PURE__ */ e("span", { style: { ...C.iconSmall, fontSize: "14px", color: "#6B7280" }, title: `${c.attachmentCount}枚`, children: "image" }) })
          ] }, c.id);
        })
      ] })
    ] }),
    m !== null && /* @__PURE__ */ e("div", { style: C.detailPanel, id: `feedback-detail-${m}`, role: "region", "aria-label": "フィードバック詳細", children: y ? /* @__PURE__ */ e("div", { children: "読み込み中..." }) : F ? /* @__PURE__ */ a(ke, { children: [
      /* @__PURE__ */ a("div", { style: C.detailGrid, children: [
        /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "種別:" }),
          " ",
          (Q = Ze[F.kind]) == null ? void 0 : Q.label
        ] }),
        /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "対象:" }),
          " ",
          F.target ? Ye[F.target] : "-"
        ] }),
        /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "URL:" }),
          " ",
          F.pageUrl ?? "-"
        ] }),
        /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "ユーザー:" }),
          " ",
          F.userType ?? "-"
        ] }),
        F.environment && /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "環境:" }),
          " ",
          Object.values(F.environment).slice(0, 2).join(" / ")
        ] }),
        /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "バージョン:" }),
          " ",
          F.appVersion ?? "-"
        ] }),
        F.customTag && /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "タグ:" }),
          " ",
          F.customTag
        ] }),
        /* @__PURE__ */ a("div", { children: [
          /* @__PURE__ */ e("strong", { children: "日時:" }),
          " ",
          F.createdAt
        ] })
      ] }),
      /* @__PURE__ */ a("div", { style: C.detailMessage, children: [
        /* @__PURE__ */ e("strong", { children: "メッセージ:" }),
        /* @__PURE__ */ e("pre", { style: C.messagePre, children: F.message })
      ] }),
      F.consoleLogs && F.consoleLogs.length > 0 && /* @__PURE__ */ a("details", { style: C.logSection, children: [
        /* @__PURE__ */ a("summary", { children: [
          "コンソールログ (",
          F.consoleLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: C.logPre, children: JSON.stringify(F.consoleLogs, null, 2) })
      ] }),
      F.networkLogs && F.networkLogs.length > 0 && /* @__PURE__ */ a("details", { style: C.logSection, children: [
        /* @__PURE__ */ a("summary", { children: [
          "ネットワークログ (",
          F.networkLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: C.logPre, children: JSON.stringify(F.networkLogs, null, 2) })
      ] }),
      F.attachments && F.attachments.length > 0 && /* @__PURE__ */ a("div", { style: C.attachmentSection, children: [
        /* @__PURE__ */ a("strong", { children: [
          "添付画像 (",
          F.attachments.length,
          "件):"
        ] }),
        /* @__PURE__ */ e("div", { style: C.attachmentGrid, children: F.attachments.map((c) => /* @__PURE__ */ a("div", { style: C.attachmentThumb, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: V(c.filename),
              alt: c.original_name,
              style: C.attachmentImg,
              onClick: () => o(V(c.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => G(F.id, c.id),
              style: C.attachmentRemoveBtn,
              "aria-label": "画像を削除",
              children: /* @__PURE__ */ e("span", { style: { ...C.iconSmall, fontSize: "14px" }, children: "close" })
            }
          ),
          /* @__PURE__ */ e("div", { style: C.attachmentInfo, children: c.original_name.length > 12 ? c.original_name.slice(0, 12) + "..." : c.original_name })
        ] }, c.id)) })
      ] }),
      P && /* @__PURE__ */ e("div", { style: C.overlay, onClick: () => o(null), children: /* @__PURE__ */ e("img", { src: P, alt: "拡大画像", style: C.enlargedImg }) }),
      /* @__PURE__ */ a("div", { style: C.detailActions, children: [
        /* @__PURE__ */ a(
          "select",
          {
            value: F.status,
            onChange: (c) => g(F.id, c.target.value),
            style: C.select,
            "aria-label": "ステータス変更",
            children: [
              /* @__PURE__ */ e("option", { value: "open", children: "open" }),
              /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
              /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
            ]
          }
        ),
        /* @__PURE__ */ e("button", { onClick: () => H(F.id), style: C.deleteBtn, children: "削除" })
      ] })
    ] }) : /* @__PURE__ */ e("div", { children: "詳細の取得に失敗しました" }) }),
    x > 1 && /* @__PURE__ */ a("div", { style: C.pagination, children: [
      /* @__PURE__ */ e("button", { onClick: () => w(u - 1), disabled: u <= 1, style: C.pageBtn, "aria-label": "前のページ", children: "◀" }),
      /* @__PURE__ */ a("span", { style: C.pageInfo, children: [
        u,
        " / ",
        x
      ] }),
      /* @__PURE__ */ e("button", { onClick: () => w(u + 1), disabled: u >= x, style: C.pageBtn, "aria-label": "次のページ", children: "▶" })
    ] })
  ] });
}
const C = {
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
  Pe as D,
  wt as F,
  Wn as I,
  t as M,
  rn as a,
  tn as b,
  bt as c,
  Ct as d,
  xt as e,
  yt as f,
  Et as g,
  He as h,
  Be as i,
  $e as j,
  Cn as k,
  Se as l,
  Un as m,
  nt as u
};
