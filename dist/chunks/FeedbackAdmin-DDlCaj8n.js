import { jsxs as o, jsx as e, Fragment as Ee } from "react/jsx-runtime";
import { useState as S, useRef as N, useCallback as k, useEffect as B, useMemo as Ue } from "react";
import { createPortal as rn } from "react-dom";
import { u as on, d as Ae, c as an, e as He, b as ln, a as un } from "./useFeedbackAdminMode-DpbrwKWq.js";
import sn, { defaultUrlTransform as cn } from "react-markdown";
import dn from "remark-gfm";
import pn from "rehype-raw";
import { c as gn } from "./feedbackLogCapture-DUBfVREg.js";
import { l as Dn, h as hn, i as fn } from "./feedbackApi-BAwJP8AU.js";
const Me = {
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
}, Oe = ["image/png", "image/jpeg", "image/webp", "image/gif"], mn = 5, Fn = 5 * 1024 * 1024;
function xn({
  files: n,
  onAdd: r,
  onRemove: a,
  maxFiles: u = mn,
  maxFileSize: c = Fn,
  disabled: i = !1,
  pipDocument: g
}) {
  const [D, h] = S(!1), [E, x] = S(null), L = N(null), C = N(0), A = k((s) => {
    x(null);
    const y = u - n.length;
    if (y <= 0) {
      x(`最大${u}枚まで添付できます`);
      return;
    }
    const v = [];
    for (const T of s) {
      if (v.length >= y) break;
      if (!Oe.includes(T.type)) {
        x(`${T.name}: 対応していない形式です（PNG/JPEG/WebP/GIF）`);
        continue;
      }
      if (T.size > c) {
        x(`${T.name}: ファイルサイズが大きすぎます（最大5MB）`);
        continue;
      }
      v.push(T);
    }
    v.length > 0 && r(v);
  }, [n.length, u, c, r]), I = k((s) => {
    var T;
    if (i) return;
    const y = (T = s.clipboardData) == null ? void 0 : T.items;
    if (!y) return;
    const v = [];
    for (let H = 0; H < y.length; H++) {
      const Y = y[H];
      if (Y.kind === "file" && Oe.includes(Y.type)) {
        const M = Y.getAsFile();
        M && v.push(M);
      }
    }
    v.length > 0 && (s.preventDefault(), A(v));
  }, [i, A]);
  B(() => (document.addEventListener("paste", I), g == null || g.addEventListener("paste", I), () => {
    document.removeEventListener("paste", I), g == null || g.removeEventListener("paste", I);
  }), [I, g]);
  const _ = k((s) => {
    s.preventDefault(), s.stopPropagation(), C.current++, C.current === 1 && h(!0);
  }, []), R = k((s) => {
    s.preventDefault(), s.stopPropagation(), C.current--, C.current === 0 && h(!1);
  }, []), l = k((s) => {
    s.preventDefault(), s.stopPropagation();
  }, []), W = k((s) => {
    if (s.preventDefault(), s.stopPropagation(), C.current = 0, h(!1), i) return;
    const y = Array.from(s.dataTransfer.files);
    A(y);
  }, [i, A]), P = k(() => {
    var s;
    i || (s = L.current) == null || s.click();
  }, [i]), J = k((s) => {
    const y = s.target.files ? Array.from(s.target.files) : [];
    y.length > 0 && A(y), L.current && (L.current.value = "");
  }, [A]), p = (s) => s < 1024 ? `${s}B` : s < 1024 * 1024 ? `${(s / 1024).toFixed(0)}KB` : `${(s / (1024 * 1024)).toFixed(1)}MB`;
  return /* @__PURE__ */ o("div", { className: "debug-field", children: [
    /* @__PURE__ */ o("label", { children: [
      "画像添付（",
      n.length,
      "/",
      u,
      "）"
    ] }),
    /* @__PURE__ */ o(
      "div",
      {
        className: `debug-dropzone ${D ? "dragging" : ""} ${i ? "disabled" : ""}`,
        onDragEnter: _,
        onDragLeave: R,
        onDragOver: l,
        onDrop: W,
        onClick: P,
        role: "button",
        tabIndex: 0,
        onKeyDown: (s) => {
          (s.key === "Enter" || s.key === " ") && P();
        },
        children: [
          /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "24px", color: Me.gray500 }, children: D ? "file_download" : "add_photo_alternate" }),
          /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: Me.gray500 }, children: D ? "ドロップして追加" : "クリック / ドラッグ / Ctrl+V で画像を追加" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        ref: L,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        multiple: !0,
        style: { display: "none" },
        onChange: J
      }
    ),
    E && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: Me.error }, children: E }),
    n.length > 0 && /* @__PURE__ */ e("div", { className: "debug-thumbnails", children: n.map((s, y) => /* @__PURE__ */ e(
      yn,
      {
        file: s,
        onRemove: () => a(y),
        formatSize: p
      },
      `${s.name}-${s.size}-${y}`
    )) })
  ] });
}
function yn({ file: n, onRemove: r, formatSize: a }) {
  const [u, c] = S(null);
  return B(() => {
    const i = URL.createObjectURL(n);
    return c(i), () => URL.revokeObjectURL(i);
  }, [n]), /* @__PURE__ */ o("div", { className: "debug-thumbnail", children: [
    u && /* @__PURE__ */ e("img", { src: u, alt: n.name, className: "debug-thumbnail-img" }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "debug-thumbnail-remove",
        onClick: (i) => {
          i.stopPropagation(), r();
        },
        "aria-label": "削除",
        children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "close" })
      }
    ),
    /* @__PURE__ */ e("div", { className: "debug-thumbnail-info", children: a(n.size) })
  ] });
}
const bn = /[\0-\x1F!-,\.\/:-@\[-\^`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482\u0530\u0557\u0558\u055A-\u055F\u0589-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EE\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06DE\u06E9\u06FD\u06FE\u0700-\u070F\u074B\u074C\u07B2-\u07BF\u07F6-\u07F9\u07FB\u07FC\u07FE\u07FF\u082E-\u083F\u085C-\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u08E2\u0964\u0965\u0970\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09F2-\u09FB\u09FD\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF0-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B70\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BF0-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D4F-\u0D53\u0D58-\u0D5E\u0D64\u0D65\u0D70-\u0D79\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3F\u0E4F\u0E5A-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F98\u0FBD-\u0FC5\u0FC7-\u0FFF\u104A-\u104F\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u1360-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DB\u17DE\u17DF\u17EA-\u180A\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u1945\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DA-\u19FF\u1A1C-\u1A1F\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1AA6\u1AA8-\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B6A\u1B74-\u1B7F\u1BF4-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E\u1C7F\u1C89-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CCF\u1CD3\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u203E\u2041-\u2053\u2055-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u20CF\u20F1-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u215F\u2189-\u24B5\u24EA-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u3004\u3008-\u3020\u3030\u3036\u3037\u303D-\u3040\u3097\u3098\u309B\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\u9FFD-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA673\uA67E\uA6F2-\uA716\uA720\uA721\uA789\uA78A\uA7C0\uA7C1\uA7CB-\uA7F4\uA828-\uA82B\uA82D-\uA83F\uA874-\uA87F\uA8C6-\uA8CF\uA8DA-\uA8DF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA954-\uA95F\uA97D-\uA97F\uA9C1-\uA9CE\uA9DA-\uA9DF\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A-\uAA5F\uAA77-\uAA79\uAAC3-\uAADA\uAADE\uAADF\uAAF0\uAAF1\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABEB\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFDFF\uFE10-\uFE1F\uFE30-\uFE32\uFE35-\uFE4C\uFE50-\uFE6F\uFE75\uFEFD-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF3E\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDD3F\uDD75-\uDDFC\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEE1-\uDEFF\uDF20-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE40-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE7-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD28-\uDD2F\uDD3A-\uDE7F\uDEAA\uDEAD-\uDEAF\uDEB2-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF51-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC47-\uDC65\uDC70-\uDC7E\uDCBB-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD40-\uDD43\uDD48-\uDD4F\uDD74\uDD75\uDD77-\uDD7F\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDFF\uDE12\uDE38-\uDE3D\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC4B-\uDC4F\uDC5A-\uDC5D\uDC62-\uDC7F\uDCC6\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDC1-\uDDD7\uDDDE-\uDDFF\uDE41-\uDE43\uDE45-\uDE4F\uDE5A-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF3A-\uDFFF]|\uD806[\uDC3B-\uDC9F\uDCEA-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD44-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE2\uDDE5-\uDDFF\uDE3F-\uDE46\uDE48-\uDE4F\uDE9A-\uDE9C\uDE9E-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC41-\uDC4F\uDC5A-\uDC71\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF7-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83D\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDECF\uDEEE\uDEEF\uDEF5-\uDEFF\uDF37-\uDF3F\uDF44-\uDF4F\uDF5A-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE80-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE2\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDC9C\uDC9F-\uDFFF]|\uD834[\uDC00-\uDD64\uDD6A-\uDD6C\uDD73-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDE41\uDE45-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD4F-\uDEBF\uDEFA-\uDFFF]|\uD83A[\uDCC5-\uDCCF\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD83C[\uDC00-\uDD2F\uDD4A-\uDD4F\uDD6A-\uDD6F\uDD8A-\uDFFF]|\uD83E[\uDC00-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]/g, Cn = Object.hasOwnProperty;
class Xe {
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
  slug(r, a) {
    const u = this;
    let c = En(r, a === !0);
    const i = c;
    for (; Cn.call(u.occurrences, c); )
      u.occurrences[i]++, c = i + "-" + u.occurrences[i];
    return u.occurrences[c] = 0, c;
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
function En(n, r) {
  return typeof n != "string" ? "" : (r || (n = n.toLowerCase()), n.replace(bn, "").replace(/ /g, "-"));
}
function An(n) {
  const r = n.type === "element" ? n.tagName.toLowerCase() : "", a = r.length === 2 && r.charCodeAt(0) === 104 ? r.charCodeAt(1) : 0;
  return a > 48 && a < 55 ? a - 48 : void 0;
}
function wn(n) {
  return "children" in n ? Ye(n) : "value" in n ? n.value : "";
}
function kn(n) {
  return n.type === "text" ? n.value : "children" in n ? Ye(n) : "";
}
function Ye(n) {
  let r = -1;
  const a = [];
  for (; ++r < n.children.length; )
    a[r] = kn(n.children[r]);
  return a.join("");
}
const Je = (
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
      return $n;
    if (typeof n == "function")
      return ke(n);
    if (typeof n == "object")
      return Array.isArray(n) ? Bn(n) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        vn(
          /** @type {Props} */
          n
        )
      );
    if (typeof n == "string")
      return Sn(n);
    throw new Error("Expected function, string, or object as test");
  })
);
function Bn(n) {
  const r = [];
  let a = -1;
  for (; ++a < n.length; )
    r[a] = Je(n[a]);
  return ke(u);
  function u(...c) {
    let i = -1;
    for (; ++i < r.length; )
      if (r[i].apply(this, c)) return !0;
    return !1;
  }
}
function vn(n) {
  const r = (
    /** @type {Record<string, unknown>} */
    n
  );
  return ke(a);
  function a(u) {
    const c = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      u
    );
    let i;
    for (i in n)
      if (c[i] !== r[i]) return !1;
    return !0;
  }
}
function Sn(n) {
  return ke(r);
  function r(a) {
    return a && a.type === n;
  }
}
function ke(n) {
  return r;
  function r(a, u, c) {
    return !!(zn(a) && n.call(
      this,
      a,
      typeof u == "number" ? u : void 0,
      c || void 0
    ));
  }
}
function $n() {
  return !0;
}
function zn(n) {
  return n !== null && typeof n == "object" && "type" in n;
}
const Ze = [], Ln = !0, Ne = !1, In = "skip";
function Rn(n, r, a, u) {
  let c;
  typeof r == "function" && typeof a != "function" ? (u = a, a = r) : c = r;
  const i = Je(c), g = u ? -1 : 1;
  D(n, void 0, [])();
  function D(h, E, x) {
    const L = (
      /** @type {Record<string, unknown>} */
      h && typeof h == "object" ? h : {}
    );
    if (typeof L.type == "string") {
      const A = (
        // `hast`
        typeof L.tagName == "string" ? L.tagName : (
          // `xast`
          typeof L.name == "string" ? L.name : void 0
        )
      );
      Object.defineProperty(C, "name", {
        value: "node (" + (h.type + (A ? "<" + A + ">" : "")) + ")"
      });
    }
    return C;
    function C() {
      let A = Ze, I, _, R;
      if ((!r || i(h, E, x[x.length - 1] || void 0)) && (A = Tn(a(h, x)), A[0] === Ne))
        return A;
      if ("children" in h && h.children) {
        const l = (
          /** @type {UnistParent} */
          h
        );
        if (l.children && A[0] !== In)
          for (_ = (u ? l.children.length : -1) + g, R = x.concat(l); _ > -1 && _ < l.children.length; ) {
            const W = l.children[_];
            if (I = D(W, _, R)(), I[0] === Ne)
              return I;
            _ = typeof I[1] == "number" ? I[1] : _ + g;
          }
      }
      return A;
    }
  }
}
function Tn(n) {
  return Array.isArray(n) ? n : typeof n == "number" ? [Ln, n] : n == null ? Ze : [n];
}
function Mn(n, r, a, u) {
  let c, i, g;
  i = r, g = a, c = u, Rn(n, i, D, c);
  function D(h, E) {
    const x = E[E.length - 1], L = x ? x.children.indexOf(h) : void 0;
    return g(h, L, x);
  }
}
const _n = {}, je = new Xe();
function Pn(n) {
  const a = (n || _n).prefix || "";
  return function(u) {
    je.reset(), Mn(u, "element", function(c) {
      An(c) && !c.properties.id && (c.properties.id = a + je.slug(wn(c)));
    });
  };
}
const Hn = ["#app:", "app:"];
function On(n) {
  for (const r of Hn)
    if (n.startsWith(r)) return n.slice(r.length);
  return null;
}
function Nn(n) {
  return n.startsWith("app:") ? n : cn(n);
}
const jn = `
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
`;
function we({
  content: n,
  className: r = "",
  onLinkClick: a,
  onAppLinkClick: u
}) {
  const c = {
    a: ({ href: i, children: g, ...D }) => {
      const h = i ? On(i) : null;
      return h !== null && u ? /* @__PURE__ */ e(
        "span",
        {
          role: "link",
          tabIndex: 0,
          onClick: (E) => {
            E.preventDefault(), E.stopPropagation(), u(h);
          },
          onKeyDown: (E) => {
            (E.key === "Enter" || E.key === " ") && (E.preventDefault(), u(h));
          },
          style: {
            color: "#043E80",
            textDecoration: "underline",
            cursor: "pointer"
          },
          ...D,
          children: g
        }
      ) : i && /\.md(#|$|\?)/.test(i) && a ? /* @__PURE__ */ e(
        "a",
        {
          href: i,
          onClick: (E) => {
            E.preventDefault(), a(i);
          },
          style: {
            color: "#043E80",
            textDecoration: "underline",
            cursor: "pointer"
          },
          ...D,
          children: g
        }
      ) : /* @__PURE__ */ e(
        "a",
        {
          href: i,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { color: "#043E80" },
          ...D,
          children: g
        }
      );
    }
  };
  return /* @__PURE__ */ o("div", { className: `manual-markdown ${r}`, children: [
    /* @__PURE__ */ e("style", { children: jn }),
    /* @__PURE__ */ e(
      sn,
      {
        remarkPlugins: [dn],
        rehypePlugins: [pn, Pn],
        urlTransform: Nn,
        components: c,
        children: n
      }
    )
  ] });
}
const Qe = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap", Wn = `
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
function Be(n = !1) {
  if (typeof document > "u")
    return !1;
  const r = document.querySelector('link[href*="Material+Symbols"]');
  if (r && !n)
    return !1;
  r && n && r.remove();
  const a = document.createElement("link");
  return a.rel = "stylesheet", a.href = Qe, document.head.appendChild(a), !0;
}
function ve() {
  return typeof window < "u" && window.__MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__ === !0;
}
const qn = [
  { value: "bug", label: "不具合", color: "#DC2626" },
  { value: "question", label: "質問", color: "#2563EB" },
  { value: "request", label: "要望", color: "#059669" },
  { value: "share", label: "共有", color: "#6B7280" },
  { value: "other", label: "その他", color: "#9333EA" }
], Kn = `
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
function en({
  apiBaseUrl: n,
  userType: r,
  appVersion: a,
  onSubmitSuccess: u,
  onSubmitError: c
}) {
  const { submitting: i, submitFeedback: g } = on({
    apiBaseUrl: n,
    userType: r,
    appVersion: a
  });
  B(() => {
    ve() || Be();
  }, []);
  const D = N(null);
  B(() => {
    try {
      const f = gn({
        // フィードバックAPI自身への fetch を除外（無限ループ防止）
        networkExclude: [n]
      });
      return D.current = f, () => {
        f.destroy(), D.current = null;
      };
    } catch (f) {
      return console.error("Failed to create log capture:", f), () => {
      };
    }
  }, [n]);
  const [h, E] = S(null), [x, L] = S(""), [C, A] = S(!1), [I, _] = S(""), [R, l] = S(""), [W, P] = S([]), [J, p] = S(!1), [s, y] = S(null), v = N(), T = N(!1);
  B(() => () => {
    v.current && clearTimeout(v.current);
  }, []);
  const H = h !== null && x.trim() !== "" && !i, Y = k(async () => {
    var ee;
    if (!h || !x.trim() || T.current) return;
    T.current = !0;
    let f = x.trim();
    (I.trim() || R.trim()) && (f += `

---`, I.trim() && (f += `
再現手順:
${I.trim()}`), R.trim() && (f += `
期待結果:
${R.trim()}`));
    const q = h === "bug" && D.current ? {
      consoleLogs: D.current.getConsoleLogs(),
      networkLogs: D.current.getNetworkLogs()
    } : void 0, { data: $, error: te } = await g({
      kind: h,
      message: f
    }, q);
    if ($) {
      if (W.length > 0)
        for (const re of W)
          try {
            await Dn({
              apiBaseUrl: n,
              feedbackId: $.id,
              file: re
            });
          } catch (ie) {
            console.error("Failed to upload attachment:", ie);
          }
      E(null), L(""), _(""), l(""), A(!1), P([]), y(null), (ee = D.current) == null || ee.clear(), p(!0), v.current && clearTimeout(v.current), v.current = setTimeout(() => p(!1), 3e3), u == null || u($);
    } else
      y(te), c == null || c(te ?? new Error("Unknown error"));
    T.current = !1;
  }, [h, x, I, R, W, n, g, u, c]), M = k(
    (f) => {
      (f.metaKey || f.ctrlKey) && f.key === "Enter" && H && (f.preventDefault(), Y());
    },
    [H, Y]
  ), V = k((f) => {
    P((q) => [...q, ...f]);
  }, []), d = k((f) => {
    P((q) => q.filter(($, te) => te !== f));
  }, []);
  return /* @__PURE__ */ o("div", { style: G.container, children: [
    /* @__PURE__ */ e("style", { children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }${Kn}` }),
    /* @__PURE__ */ o("div", { style: G.section, children: [
      /* @__PURE__ */ e("div", { style: G.tagGroup, role: "radiogroup", "aria-label": "フィードバック種別", children: qn.map((f) => /* @__PURE__ */ e(
        "button",
        {
          role: "radio",
          "aria-checked": h === f.value,
          onClick: () => E(h === f.value ? null : f.value),
          style: {
            ...G.tag,
            ...h === f.value ? { backgroundColor: f.color, color: "#fff", borderColor: f.color } : { borderColor: "#D1D5DB", color: "#6B7280" }
          },
          children: f.label
        },
        f.value
      )) }),
      /* @__PURE__ */ e("div", { style: G.tagHint, children: "どれか一つを選んでください" })
    ] }),
    /* @__PURE__ */ e("div", { style: G.section, children: /* @__PURE__ */ e(
      "textarea",
      {
        value: x,
        onChange: (f) => L(f.target.value),
        onKeyDown: M,
        placeholder: "気づいたことをそのまま書いてください（一言でもOK）",
        "aria-label": "フィードバックメッセージ",
        rows: 4,
        maxLength: 4e3,
        style: G.textarea
      }
    ) }),
    /* @__PURE__ */ e("div", { style: G.section, children: /* @__PURE__ */ e(
      xn,
      {
        files: W,
        onAdd: V,
        onRemove: d,
        maxFiles: 3,
        disabled: i
      }
    ) }),
    h === "bug" && /* @__PURE__ */ o("div", { style: G.logNotice, children: [
      /* @__PURE__ */ e("span", { style: G.iconSmall, children: "info" }),
      "不具合タグを選択すると、直前の動作ログが自動で添付されます"
    ] }),
    /* @__PURE__ */ o("div", { style: G.section, children: [
      /* @__PURE__ */ o("button", { onClick: () => A(!C), style: G.detailToggle, "aria-expanded": C, children: [
        /* @__PURE__ */ e("span", { style: G.iconSmall, children: C ? "expand_less" : "expand_more" }),
        "詳細情報（任意）"
      ] }),
      C && /* @__PURE__ */ o("div", { style: G.detailArea, children: [
        /* @__PURE__ */ e("label", { style: G.label, children: "再現手順:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: I,
            onChange: (f) => _(f.target.value),
            "aria-label": "再現手順",
            rows: 2,
            style: G.textarea
          }
        ),
        /* @__PURE__ */ e("label", { style: { ...G.label, marginTop: "8px" }, children: "期待結果:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: R,
            onChange: (f) => l(f.target.value),
            "aria-label": "期待結果",
            rows: 2,
            style: G.textarea
          }
        )
      ] })
    ] }),
    s && /* @__PURE__ */ o("div", { style: G.errorMsg, role: "alert", children: [
      /* @__PURE__ */ e("span", { style: G.iconSmall, children: "warning" }),
      s.message.slice(0, 200)
    ] }),
    /* @__PURE__ */ e("div", { style: G.submitRow, children: /* @__PURE__ */ e("button", { onClick: Y, disabled: !H, style: {
      ...G.submitButton,
      opacity: H ? 1 : 0.5,
      cursor: H ? "pointer" : "not-allowed"
    }, children: i ? /* @__PURE__ */ e("span", { style: { ...G.iconSmall, animation: "spin 1s linear infinite" }, children: "progress_activity" }) : "送信" }) }),
    J && /* @__PURE__ */ e("div", { style: G.toast, role: "status", children: "送信しました" })
  ] });
}
const G = {
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
function Gn(n) {
  return n.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/!\[([^\]]*)\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
}
function Vn(n) {
  return n.replace(/(?:^|[ \t])#+[ \t]*$/, "").trim();
}
function Un(n) {
  const r = new Xe(), a = [], u = n.split(/\r?\n/);
  let c = null;
  for (const i of u) {
    const g = /^(`{3,}|~{3,})/.exec(i.trim());
    if (g) {
      const C = g[1][0];
      c === null ? c = C : c === C && (c = null);
      continue;
    }
    if (c) continue;
    let D = null, h = "";
    const E = /^ {0,3}(#{2,3})(?:[ \t]+(.*))?$/.exec(i);
    if (E)
      D = E[1].length, h = Vn((E[2] ?? "").trim());
    else {
      const C = /^\s{0,3}<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>\s*$/i.exec(i);
      C && (D = Number(C[1]), h = C[2].replace(/<[^>]+>/g, "").trim());
    }
    if (D === null) continue;
    const x = Gn(h);
    if (!x) continue;
    const L = r.slug(x);
    a.push({ id: L, text: x, level: D });
  }
  return a;
}
function Xn() {
  const [n, r] = S({}), [a, u] = S({}), [c, i] = S({}), g = N(/* @__PURE__ */ new Set()), D = N(!0);
  B(() => (D.current = !0, () => {
    D.current = !1;
  }), []);
  const h = k((C) => n[C], [n]), E = k((C) => a[C] ?? !1, [a]), x = k((C) => c[C] ?? null, [c]), L = k(async (C) => {
    if (!g.current.has(C)) {
      g.current.add(C), u((A) => ({ ...A, [C]: !0 })), i((A) => ({ ...A, [C]: null }));
      try {
        const A = await fetch(C);
        if (!A.ok)
          throw new Error(`Failed to load: ${A.status} ${A.statusText}`);
        const I = await A.text(), _ = Un(I);
        if (!D.current) return;
        r((R) => ({ ...R, [C]: _ }));
      } catch (A) {
        if (g.current.delete(C), !D.current) return;
        i((I) => ({
          ...I,
          [C]: A instanceof Error ? A : new Error(String(A))
        }));
      } finally {
        D.current && u((A) => ({ ...A, [C]: !1 }));
      }
    }
  }, []);
  return { getHeadings: h, loadHeadings: L, isLoading: E, getError: x };
}
function Yn(n) {
  const r = {}, a = [], u = [...n].sort((i, g) => (i.order ?? 0) - (g.order ?? 0));
  for (const i of u)
    i.category ? (r[i.category] || (r[i.category] = []), r[i.category].push(i)) : a.push(i);
  return { groups: Object.entries(r).map(([i, g]) => ({
    category: i,
    items: g
  })), uncategorized: a };
}
function We(n, r) {
  var a;
  return r ? ((a = n.find((u) => u.path === r)) == null ? void 0 : a.category) ?? null : null;
}
function Jn(n, r) {
  if (r)
    return n.find((a) => a.path === r);
}
function Zn(n) {
  return n.replace(/\s+/g, "-");
}
function _e({
  items: n,
  activePath: r,
  onSelectPage: a,
  onSelectHeading: u,
  activeHeadingId: c = null,
  defaultExpandCategories: i = "active",
  className: g = ""
}) {
  const { groups: D, uncategorized: h } = Ue(() => Yn(n), [n]), { getHeadings: E, loadHeadings: x, isLoading: L, getError: C } = Xn(), [A, I] = S(() => {
    const p = We(n, r), s = {};
    for (const y of D)
      s[y.category] = i === "all" || y.category === p;
    return s;
  });
  B(() => {
    const p = We(n, r);
    p && I((s) => s[p] ? s : { ...s, [p]: !0 });
  }, [r, n]);
  const [_, R] = S({}), l = N(/* @__PURE__ */ new Set()), W = k((p) => {
    I((s) => ({ ...s, [p]: !s[p] }));
  }, []), P = k(
    (p) => {
      R((s) => {
        const y = !(s[p] ?? !1);
        return y ? (x(p), l.current.delete(p)) : l.current.add(p), { ...s, [p]: y };
      });
    },
    [x]
  );
  B(() => {
    var p;
    !c || !r || (p = Jn(n, r)) != null && p.hideHeadingsOutline || l.current.has(r) || (x(r), R((s) => s[r] ? s : { ...s, [r]: !0 }));
  }, [c, r, n, x]);
  const J = (p) => {
    const s = r === p.path, y = !p.hideHeadingsOutline && (_[p.path] ?? !1), v = E(p.path), T = L(p.path), H = C(p.path), Y = `manual-toc-headings-${Zn(p.id)}`;
    return /* @__PURE__ */ o("li", { children: [
      /* @__PURE__ */ o("div", { style: Z.pageRow, children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              a(p.path), p.hideHeadingsOutline || P(p.path);
            },
            "aria-expanded": p.hideHeadingsOutline ? void 0 : y,
            "aria-controls": p.hideHeadingsOutline ? void 0 : Y,
            style: {
              ...Z.pageButton,
              background: s ? "#e3f2fd" : "transparent",
              color: s ? t.primary : t.gray700,
              borderLeft: s ? `3px solid ${t.primary}` : "3px solid transparent"
            },
            children: p.title
          }
        ),
        !p.hideHeadingsOutline && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => P(p.path),
            style: Z.toggleHeadingsButton,
            "aria-expanded": y,
            "aria-controls": Y,
            "aria-label": y ? `${p.title} の見出しを閉じる` : `${p.title} の見出しを開く`,
            title: y ? "見出しを閉じる" : "見出しを開く",
            children: /* @__PURE__ */ e("span", { style: Z.chevronIcon, children: y ? "expand_less" : "expand_more" })
          }
        )
      ] }),
      y && /* @__PURE__ */ o("ul", { id: Y, style: Z.headingList, role: "group", children: [
        T && /* @__PURE__ */ e("li", { style: Z.headingStatus, children: "読み込み中..." }),
        !T && H && /* @__PURE__ */ e("li", { style: { ...Z.headingStatus, color: t.error }, children: "見出しの読み込みに失敗しました" }),
        !T && !H && v && v.length === 0 && /* @__PURE__ */ e("li", { style: Z.headingStatus, children: "見出しなし" }),
        !T && !H && (v == null ? void 0 : v.map((M) => {
          const V = M.level === 3, d = s && c === M.id;
          return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => u(p.path, M.id),
              style: {
                ...Z.headingButton,
                paddingLeft: V ? "38px" : "20px",
                fontSize: V ? "12px" : "13px",
                color: d ? t.primary : V ? t.gray500 : t.gray700,
                background: d ? "#e3f2fd" : "transparent",
                borderLeft: d ? `2px solid ${t.primary}` : "2px solid transparent",
                fontWeight: d ? 600 : 400
              },
              children: [
                /* @__PURE__ */ e(
                  "span",
                  {
                    style: {
                      ...Z.headingDot,
                      ...V ? Z.headingDotSub : null,
                      ...d ? { background: t.primary } : null
                    }
                  }
                ),
                /* @__PURE__ */ e("span", { style: Z.headingText, children: M.text })
              ]
            }
          ) }, M.id);
        }))
      ] })
    ] }, p.id);
  };
  return /* @__PURE__ */ o("nav", { className: `manual-toc ${g}`, "aria-label": "マニュアル目次", style: Z.nav, children: [
    h.length > 0 && /* @__PURE__ */ e("ul", { style: Z.list, children: h.map(J) }),
    D.map((p, s) => {
      const y = A[p.category] ?? !1, v = `manual-toc-category-${s}`;
      return /* @__PURE__ */ o("div", { style: Z.categoryBlock, children: [
        /* @__PURE__ */ o(
          "button",
          {
            type: "button",
            onClick: () => W(p.category),
            style: Z.categoryButton,
            "aria-expanded": y,
            "aria-controls": v,
            children: [
              /* @__PURE__ */ e("span", { style: Z.categoryChevron, "aria-hidden": "true", children: y ? "expand_more" : "chevron_right" }),
              /* @__PURE__ */ e("span", { children: p.category })
            ]
          }
        ),
        y && /* @__PURE__ */ e("ul", { id: v, style: Z.list, children: p.items.map(J) })
      ] }, p.category);
    })
  ] });
}
const Z = {
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
}, Qn = 200;
function gt({
  isOpen: n,
  docPath: r,
  onClose: a,
  onNavigate: u,
  onAppNavigate: c,
  initialSize: i = { width: 420, height: 550 },
  showDownloadButton: g = !1,
  copyHostStyles: D = !0,
  items: h,
  feedbackApiBaseUrl: E,
  feedbackUserType: x,
  feedbackAppVersion: L,
  onFeedbackSubmitSuccess: C,
  onFeedbackSubmitError: A,
  feedbackDefaultHeight: I = 200,
  feedbackMinHeight: _ = 150,
  feedbackMaxHeight: R = 400
}) {
  const [l, W] = S(null), [P, J] = S(null), { content: p, loading: s, error: y } = Ae(r), { downloadMd: v } = an(), [T, H] = S([]), Y = N(null), M = N(!1), V = N(!1), [d, f] = S(!1), q = E != null, [$, te] = S(!0), [ee, re] = S(!1), ie = N(null), le = N(null), ue = N(!1), se = N(null), he = N(null), [Se, ce] = S(null), pe = N(!1), ye = k(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported");
      return;
    }
    if (!V.current) {
      V.current = !0;
      try {
        const w = q ? 650 : i.width, j = i.height, z = await window.documentPictureInPicture.requestWindow({
          width: w,
          height: j,
          // Document Picture-in-Picture API はデフォルト(false)で「閉じたときの
          // 位置・サイズを記憶し、次回はそれを再利用する」仕様のため、true を渡さないと
          // 一度でも手動リサイズ/別サイズで開いた履歴があると width/height の指定が
          // 無視され続ける。true にして常に指定サイズで開かせる（Chrome 130+。
          // 非対応ブラウザではオプションが単に無視されるだけで害はない）。
          preferInitialWindowPlacement: !0
        }), U = z.document.createElement("style");
        U.textContent = nt(), z.document.head.appendChild(U), D && et(z.document);
        const X = z.document.createElement("div");
        X.id = "manual-pip-root", z.document.body.appendChild(X), W(z), J(X), z.addEventListener("pagehide", () => {
          W(null), J(null), a();
        });
      } catch (w) {
        console.error("Failed to open PiP window:", w);
      } finally {
        V.current = !1;
      }
    }
  }, [i.width, i.height, D, a]), fe = k(() => {
    l && (l.close(), W(null), J(null));
  }, [l]);
  B(() => {
    n && !l ? ye() : !n && l && fe();
  }, [n, l, ye, fe]);
  const $e = k(
    (w) => {
      if (u) {
        const j = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/", z = w.startsWith("/") ? w : j + w;
        u(z);
      }
    },
    [r, u]
  );
  B(() => {
    if (!l || l.closed || !c) return;
    const w = (z) => {
      var ne;
      const X = z.target.closest("a");
      if (X) {
        const K = X.getAttribute("href");
        if (console.log("[ManualPiP] Link clicked", {
          href: K,
          text: (ne = X.textContent) == null ? void 0 : ne.substring(0, 30),
          startsWithHashApp: K == null ? void 0 : K.startsWith("#app:")
        }), K && K.startsWith("#app:")) {
          console.log("[ManualPiP] App link detected! Preventing default"), z.preventDefault(), z.stopPropagation();
          const ae = K.replace("#app:", "");
          console.log("[ManualPiP] Calling onAppNavigate", { appPath: ae }), c(ae);
        }
      }
    }, j = (z) => {
      var ne;
      const U = z.target, X = ((ne = U.querySelector("summary")) == null ? void 0 : ne.textContent) || "unknown";
      console.log("[ManualPiP] Details toggle", {
        open: U.open,
        summary: X
      }), U.open && setTimeout(() => {
        const K = U.querySelectorAll('a[href^="app:"]'), ae = U.querySelectorAll("a"), be = Array.from(ae).map((Fe) => {
          var Ce;
          return {
            href: Fe.getAttribute("href"),
            text: (Ce = Fe.textContent) == null ? void 0 : Ce.substring(0, 20)
          };
        });
        console.log("[ManualPiP] Links in opened details", {
          totalLinks: ae.length,
          appLinksCount: K.length,
          allHrefs: be
        });
      }, 100);
    };
    return l.document.addEventListener("click", w, !0), l.document.addEventListener("toggle", j, !0), () => {
      l.closed || (l.document.removeEventListener("click", w, !0), l.document.removeEventListener("toggle", j, !0));
    };
  }, [l, c]);
  const oe = k(() => {
    le.current !== null && (clearTimeout(le.current), le.current = null);
  }, []), ze = k(() => {
    oe(), re(!0);
  }, [oe]), me = k(() => {
    oe(), le.current = setTimeout(() => {
      le.current = null, re(!1);
    }, Qn);
  }, [oe]);
  B(() => oe, [oe]), B(() => {
    const w = Y.current;
    if (Y.current = r, !(!w || w === r)) {
      if (M.current) {
        M.current = !1;
        return;
      }
      H((j) => [...j, w]);
    }
  }, [r]), B(() => {
    n || (H([]), Y.current = null);
  }, [n]);
  const Le = k(() => {
    if (T.length === 0) return;
    const w = T[T.length - 1];
    M.current = !0, H((j) => j.slice(0, -1)), re(!1), u == null || u(w);
  }, [T, u]), Ie = k(
    (w) => {
      re(!1), u == null || u(w);
    },
    [u]
  ), Re = k(
    (w, j) => {
      if (re(!1), w === r) {
        if (l && !l.closed) {
          const z = l.document.getElementById(j);
          z == null || z.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      ie.current = { path: w, headingId: j }, u == null || u(w);
    },
    [r, l, u]
  );
  B(() => {
    const w = ie.current;
    if (!w || w.path !== r) {
      ue.current = !1;
      return;
    }
    if (s) {
      ue.current = !0;
      return;
    }
    if (!ue.current || !l || l.closed || !p) return;
    let j = !1, z, U = 0;
    const X = () => {
      if (j || l.closed) return;
      const ne = l.document.getElementById(w.headingId);
      if (ne) {
        ne.scrollIntoView({ behavior: "smooth" }), ie.current = null;
        return;
      }
      U += 1, U < 30 ? z = l.requestAnimationFrame(X) : ie.current = null;
    };
    return z = l.requestAnimationFrame(X), () => {
      j = !0, l.closed || l.cancelAnimationFrame(z);
    };
  }, [p, r, s, l]), B(() => {
    pe.current = !1;
  }, [r]), B(() => {
    s && (pe.current = !0);
  }, [s]), B(() => {
    if (!l || l.closed || !p || !pe.current) {
      ce(null);
      return;
    }
    const w = he.current;
    if (!w) {
      ce(null);
      return;
    }
    const j = Array.from(
      w.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (j.length === 0) {
      ce(null);
      return;
    }
    const z = /* @__PURE__ */ new Set(), U = new l.IntersectionObserver(
      (X) => {
        for (const K of X) {
          const ae = K.target.id;
          K.isIntersecting ? z.add(ae) : z.delete(ae);
        }
        if (z.size === 0) return;
        const ne = j.find((K) => z.has(K.id));
        ne && ce((K) => K === ne.id ? K : ne.id);
      },
      {
        root: w,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return j.forEach((X) => U.observe(X)), ce(j[0].id), () => {
      U.disconnect();
    };
  }, [p, r, l, s]), B(() => {
    if (!l || l.closed || !ee) return;
    const w = (j) => {
      j.key === "Escape" && re(!1);
    };
    return l.document.addEventListener("keydown", w), () => {
      l.closed || l.document.removeEventListener("keydown", w);
    };
  }, [l, ee]), B(() => {
    se.current && (se.current.inert = !ee);
  }, [ee]);
  const Te = k(async () => {
    if (r) {
      f(!0);
      try {
        await v(r);
      } catch (w) {
        console.error("Download failed:", w);
      } finally {
        f(!1);
      }
    }
  }, [r, v]);
  return P ? rn(
    /* @__PURE__ */ o("div", { className: "pip-container", children: [
      /* @__PURE__ */ o("header", { className: "pip-header", children: [
        /* @__PURE__ */ o("div", { className: "pip-header-left", children: [
          h && /* @__PURE__ */ e(
            "button",
            {
              onClick: () => {
                oe(), re(!0);
              },
              onMouseEnter: ze,
              onMouseLeave: me,
              className: "pip-menu-btn",
              "aria-label": "目次を開く",
              "aria-expanded": ee,
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: Le,
              className: "pip-back-btn",
              "aria-label": "前のページに戻る",
              title: "前のページに戻る",
              disabled: T.length === 0,
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "arrow_back" })
            }
          ),
          /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu_book" }),
          /* @__PURE__ */ e("span", { className: "pip-title", children: "マニュアル" })
        ] }),
        /* @__PURE__ */ o("div", { className: "pip-header-right", children: [
          g && r && /* @__PURE__ */ e(
            "button",
            {
              onClick: Te,
              className: "pip-download-btn",
              "aria-label": "ダウンロード",
              disabled: d,
              children: /* @__PURE__ */ e("span", { className: `pip-icon ${d ? "pip-spin" : ""}`, children: d ? "progress_activity" : "download" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: fe,
              className: "pip-close-btn",
              "aria-label": "閉じる",
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "close" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o("div", { className: "pip-body", children: [
        h && /* @__PURE__ */ o(Ee, { children: [
          /* @__PURE__ */ e(
            "div",
            {
              className: `pip-toc-backdrop${ee ? " pip-toc-backdrop-open" : ""}`,
              onClick: () => re(!1),
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ o(
            "div",
            {
              ref: se,
              className: `pip-toc-panel${ee ? " pip-toc-panel-open" : ""}`,
              role: "dialog",
              "aria-label": "目次",
              "aria-hidden": !ee,
              onMouseEnter: oe,
              onMouseLeave: me,
              children: [
                /* @__PURE__ */ o("div", { className: "pip-toc-panel-header", children: [
                  /* @__PURE__ */ e("span", { className: "pip-toc-panel-title", children: "目次" }),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      onClick: () => re(!1),
                      className: "pip-toc-panel-close",
                      "aria-label": "目次を閉じる",
                      children: /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "20px" }, children: "close" })
                    }
                  )
                ] }),
                /* @__PURE__ */ e("div", { className: "pip-toc-panel-content", children: /* @__PURE__ */ e(
                  _e,
                  {
                    items: h,
                    activePath: r,
                    onSelectPage: Ie,
                    onSelectHeading: Re,
                    activeHeadingId: Se
                  }
                ) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ o("main", { className: "pip-content", ref: he, children: [
          s && /* @__PURE__ */ o("div", { className: "pip-loading", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-spin", children: "progress_activity" }),
            /* @__PURE__ */ e("span", { children: "読み込み中..." })
          ] }),
          y && /* @__PURE__ */ o("div", { className: "pip-error", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon", children: "warning" }),
            /* @__PURE__ */ o("div", { className: "pip-error-text", children: [
              /* @__PURE__ */ e("div", { className: "pip-error-title", children: "エラーが発生しました" }),
              /* @__PURE__ */ e("div", { className: "pip-error-detail", children: y.message })
            ] })
          ] }),
          p && /* @__PURE__ */ e(
            we,
            {
              content: p,
              onLinkClick: $e,
              onAppLinkClick: c
            }
          ),
          !s && !y && !p && /* @__PURE__ */ o("div", { className: "pip-empty", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-large", children: "description" }),
            /* @__PURE__ */ e("span", { children: "マニュアルを選択してください" })
          ] })
        ] }),
        q && /* @__PURE__ */ e("aside", { className: "pip-sidebar", style: { width: "300px" }, children: E != null && /* @__PURE__ */ o(
          "div",
          {
            className: "pip-feedback-section",
            style: {
              height: $ ? "100%" : "auto",
              flex: $ ? 1 : "0 0 auto"
            },
            children: [
              /* @__PURE__ */ o("div", { className: "pip-feedback-header", children: [
                /* @__PURE__ */ o("div", { className: "pip-feedback-header-left", children: [
                  /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-small", children: "rate_review" }),
                  /* @__PURE__ */ e("span", { className: "pip-sidebar-title", children: "フィードバック" })
                ] }),
                /* @__PURE__ */ o(
                  "button",
                  {
                    onClick: () => te(!$),
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
                en,
                {
                  apiBaseUrl: E,
                  userType: x,
                  appVersion: L,
                  onSubmitSuccess: C,
                  onSubmitError: A
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
function et(n) {
  Array.from(document.styleSheets).forEach((r) => {
    try {
      const a = Array.from(r.cssRules).map((c) => c.cssText).join(`
`);
      if (!a) return;
      const u = n.createElement("style");
      u.textContent = a, n.head.appendChild(u);
    } catch {
      if (r.href) {
        const a = n.createElement("link");
        a.rel = "stylesheet", a.href = r.href, n.head.appendChild(a);
      }
    }
  });
}
function nt() {
  return `
    @import url('${Qe}');

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

    ${Wn}

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
function Dt({
  items: n,
  onSelect: r,
  activePath: a,
  className: u = "",
  onPiP: c,
  onNewTab: i
}) {
  B(() => {
    ve() || Be();
  }, []);
  const g = Ue(() => {
    const D = {}, h = [], E = [...n].sort((x, L) => (x.order ?? 0) - (L.order ?? 0));
    for (const x of E)
      x.category ? (D[x.category] || (D[x.category] = []), D[x.category].push(x)) : h.push(x);
    return { groups: D, uncategorized: h };
  }, [n]);
  return /* @__PURE__ */ o("nav", { className: `manual-sidebar ${u}`, children: [
    g.uncategorized.length > 0 && /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: g.uncategorized.map((D) => /* @__PURE__ */ e(
      qe,
      {
        item: D,
        isActive: a === D.path,
        onSelect: r,
        onPiP: c,
        onNewTab: i
      },
      D.id
    )) }),
    Object.entries(g.groups).map(([D, h]) => /* @__PURE__ */ o("div", { style: { marginTop: "16px" }, children: [
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
          children: D
        }
      ),
      /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: h.map((E) => /* @__PURE__ */ e(
        qe,
        {
          item: E,
          isActive: a === E.path,
          onSelect: r,
          onPiP: c,
          onNewTab: i
        },
        E.id
      )) })
    ] }, D))
  ] });
}
function qe({ item: n, isActive: r, onSelect: a, onPiP: u, onNewTab: c }) {
  const i = {
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
  return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ o("div", { style: i.itemRow, children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => a(n.path),
        style: i.itemButton,
        children: n.title
      }
    ),
    /* @__PURE__ */ o("div", { style: i.actionButtons, children: [
      u && /* @__PURE__ */ e(
        "button",
        {
          onClick: (g) => {
            g.stopPropagation(), u(n.path);
          },
          style: i.actionBtn,
          title: "PiPで開く",
          "aria-label": "PiPで開く",
          onMouseEnter: (g) => {
            g.currentTarget.style.backgroundColor = t.gray100, g.currentTarget.style.color = t.primary;
          },
          onMouseLeave: (g) => {
            g.currentTarget.style.backgroundColor = "transparent", g.currentTarget.style.color = t.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: i.icon, children: "picture_in_picture_alt" })
        }
      ),
      c && /* @__PURE__ */ e(
        "button",
        {
          onClick: (g) => {
            g.stopPropagation(), c(n.path);
          },
          style: i.actionBtn,
          title: "新しいタブで開く",
          "aria-label": "新しいタブで開く",
          onMouseEnter: (g) => {
            g.currentTarget.style.backgroundColor = t.gray100, g.currentTarget.style.color = t.primary;
          },
          onMouseLeave: (g) => {
            g.currentTarget.style.backgroundColor = "transparent", g.currentTarget.style.color = t.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: i.icon, children: "open_in_new" })
        }
      )
    ] })
  ] }) });
}
function ht({
  path: n,
  onClick: r,
  children: a,
  className: u = ""
}) {
  return /* @__PURE__ */ e(
    "a",
    {
      href: n,
      onClick: (i) => {
        i.preventDefault(), r(n);
      },
      className: `manual-link ${u}`,
      style: {
        color: "#1976d2",
        textDecoration: "underline",
        cursor: "pointer"
      },
      children: a
    }
  );
}
function ft({ docPath: n, className: r = "" }) {
  const { content: a, loading: u, error: c, reload: i } = Ae(n);
  return /* @__PURE__ */ o(
    "article",
    {
      className: `manual-page ${r}`,
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px"
      },
      children: [
        u && /* @__PURE__ */ e("div", { style: { textAlign: "center", padding: "40px", color: "#666" }, children: "読み込み中..." }),
        c && /* @__PURE__ */ o(
          "div",
          {
            style: {
              padding: "20px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              color: "#c62828"
            },
            children: [
              /* @__PURE__ */ o("p", { style: { margin: 0 }, children: [
                "マニュアルの読み込みに失敗しました: ",
                c.message
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  onClick: i,
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
        a && /* @__PURE__ */ e(we, { content: a })
      ]
    }
  );
}
const tt = `
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
function Ke(n, r) {
  if (n.startsWith("/")) return n;
  const a = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/";
  try {
    return new URL(n, "http://d" + a).pathname;
  } catch {
    return a + n;
  }
}
function mt({
  defaultDocPath: n,
  sidebarPath: r,
  onSidebarNavigate: a,
  onSidebarAppNavigate: u,
  sidebarDefaultWidth: c = 400,
  sidebarMinWidth: i = 250,
  sidebarMaxWidth: g = 800,
  feedbackApiBaseUrl: D,
  feedbackUserType: h,
  feedbackAppVersion: E,
  feedbackAdminUrl: x,
  feedbackDefaultHeight: L = 350,
  feedbackMinHeight: C = 200,
  feedbackMaxHeight: A = 600,
  onFeedbackSubmitSuccess: I,
  onFeedbackSubmitError: _,
  items: R,
  defaultExpandCategories: l,
  onAppNavigate: W
} = {}) {
  const [P, J] = S(null), { content: p, loading: s, error: y } = Ae(P), v = N(null), T = N(!1), [H, Y] = S(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 767px)").matches);
  B(() => {
    if (typeof window > "u") return;
    const b = window.matchMedia("(max-width: 767px)"), O = (Q) => Y(Q.matches);
    return b.addEventListener("change", O), () => b.removeEventListener("change", O);
  }, []);
  const [M, V] = S(!1), d = N(null), f = N(null), q = N(null);
  B(() => {
    V(!1);
  }, [H]);
  const [$, te] = S(!0), [ee, re] = S(400), [ie, le] = S(r ?? null);
  B(() => {
    a === void 0 && le(r ?? null);
  }, [r, a]);
  const ue = a !== void 0, se = ue ? r ?? null : ie, {
    content: he,
    loading: Se,
    error: ce
  } = Ae(se), { size: pe, isResizing: ye, handleMouseDown: fe, handleKeyDown: $e } = He({
    defaultSize: c,
    minSize: i,
    maxSize: g
  }), oe = r != null && D != null, ze = N(null), {
    size: me,
    isResizing: Le,
    handleMouseDown: Ie,
    handleKeyDown: Re
  } = He({
    defaultSize: L,
    minSize: C,
    maxSize: A,
    direction: "vertical",
    enabled: oe && $
  });
  B(() => {
    oe && $ && re(me);
  }, [me, oe, $]);
  const Te = ln(), w = N(null), j = N(null), [z, U] = S(null), X = N(!1);
  B(() => {
    ve() || Be();
  }, []), B(() => {
    w.current && (w.current.scrollTop = 0);
  }, [se]), B(() => {
    X.current = !1;
  }, [P]), B(() => {
    s && (X.current = !0);
  }, [s]), B(() => {
    const b = j.current;
    if (!b || !p || !X.current) {
      U(null);
      return;
    }
    const O = Array.from(
      b.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (O.length === 0) {
      U(null);
      return;
    }
    const Q = /* @__PURE__ */ new Set(), xe = new IntersectionObserver(
      (ge) => {
        for (const de of ge) {
          const Pe = de.target.id;
          de.isIntersecting ? Q.add(Pe) : Q.delete(Pe);
        }
        if (Q.size === 0) return;
        const De = O.find((de) => Q.has(de.id));
        De && U((de) => de === De.id ? de : De.id);
      },
      {
        root: b,
        // ビューポート上部付近（上30%のライン）を基準に「読んでいる見出し」を判定する
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return O.forEach((ge) => xe.observe(ge)), U(O[0].id), () => {
      xe.disconnect();
    };
  }, [p, P, s]);
  const ne = r != null || D != null;
  B(() => {
    const O = new URLSearchParams(window.location.search).get("path");
    O ? J(O) : n && J(n);
  }, [n]);
  const K = k((b) => {
    const O = `${window.location.pathname}?path=${encodeURIComponent(b)}`;
    window.history.pushState({}, "", O), J(b);
  }, []), ae = k(
    (b) => {
      K(Ke(b, P));
    },
    [P, K]
  ), be = k(
    (b) => {
      V(!1), K(b);
    },
    [K]
  ), Fe = k(
    (b, O) => {
      var Q;
      if (V(!1), b === P) {
        (Q = document.getElementById(O)) == null || Q.scrollIntoView({ behavior: "smooth" });
        return;
      }
      v.current = { path: b, headingId: O }, K(b);
    },
    [P, K]
  );
  B(() => {
    const b = v.current;
    if (!b || b.path !== P) {
      T.current = !1;
      return;
    }
    if (s) {
      T.current = !0;
      return;
    }
    if (!T.current || !p) return;
    let O = !1, Q, xe = 0;
    const ge = () => {
      if (O) return;
      const De = document.getElementById(b.headingId);
      if (De) {
        De.scrollIntoView({ behavior: "smooth" }), v.current = null;
        return;
      }
      xe += 1, xe < 30 ? Q = requestAnimationFrame(ge) : v.current = null;
    };
    return Q = requestAnimationFrame(ge), () => {
      O = !0, cancelAnimationFrame(Q);
    };
  }, [p, P, s]);
  const Ce = k(
    (b) => {
      window.opener && !window.opener.closed ? window.opener.postMessage({ type: "manual-app-navigate", path: b }, window.location.origin) : W == null || W(b);
    },
    [W]
  ), nn = k(
    (b) => {
      const O = Ke(b, se);
      ue ? a(O) : le(O);
    },
    [ue, a, se]
  ), tn = k(
    (b) => {
      u == null || u(b);
    },
    [u]
  );
  return B(() => {
    const b = () => {
      const Q = new URLSearchParams(window.location.search).get("path");
      Q && J(Q), V(!1);
    };
    return window.addEventListener("popstate", b), () => window.removeEventListener("popstate", b);
  }, []), B(() => {
    if (!M) return;
    const b = (O) => {
      O.key === "Escape" && V(!1);
    };
    return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
  }, [M]), B(() => {
    d.current && (d.current.inert = !M);
  }, [M, H]), B(() => {
    var O;
    const b = !!R && H && M;
    f.current && (f.current.inert = b), q.current && (q.current.inert = b), b && ((O = d.current) == null || O.focus());
  }, [R, H, M]), /* @__PURE__ */ o(
    "div",
    {
      className: "manual-tab-page",
      style: {
        ...m.container,
        // items 未指定時は既存の見た目・挙動を一切変えない（docs/usage.md の互換性保証）。
        // items 指定時のみ container を height:100vh + overflow:hidden に固定し、
        // 常設サイドバー(tocPane)がビューポート内で独立スクロールできるようにする。
        ...R ? m.containerWithToc : m.containerLegacy
      },
      children: [
        /* @__PURE__ */ o("header", { ref: f, style: m.header, children: [
          /* @__PURE__ */ o("div", { style: m.headerLeft, children: [
            R && H && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => V((b) => !b),
                className: "manual-menu-btn",
                style: m.headerButton,
                "aria-label": M ? "目次を閉じる" : "目次を開く",
                "aria-expanded": M,
                children: /* @__PURE__ */ e("span", { style: m.icon, children: "menu" })
              }
            ),
            /* @__PURE__ */ e("span", { style: m.icon, children: "menu_book" }),
            /* @__PURE__ */ e("span", { style: m.title, children: "マニュアル" })
          ] }),
          /* @__PURE__ */ o("div", { style: m.headerRight, children: [
            Te && x && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => window.open(x, "_blank"),
                style: m.headerButton,
                title: "フィードバック管理",
                children: /* @__PURE__ */ e("span", { style: m.icon, children: "admin_panel_settings" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => window.print(),
                style: m.headerButton,
                title: "印刷",
                children: /* @__PURE__ */ e("span", { style: m.icon, children: "print" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ o("div", { className: "manual-body", style: m.body, children: [
          R && !H && /* @__PURE__ */ o("aside", { style: m.tocPane, children: [
            /* @__PURE__ */ o("div", { style: m.tocHeader, children: [
              /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px", color: t.tertiary }, children: "toc" }),
              /* @__PURE__ */ e("span", { style: m.sidebarTitle, children: "目次" })
            ] }),
            /* @__PURE__ */ e("div", { style: m.tocContent, children: /* @__PURE__ */ e(
              _e,
              {
                items: R,
                activePath: P,
                onSelectPage: be,
                onSelectHeading: Fe,
                activeHeadingId: z,
                defaultExpandCategories: l
              }
            ) })
          ] }),
          R && H && /* @__PURE__ */ o(Ee, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `manual-toc-backdrop${M ? " manual-toc-backdrop-open" : ""}`,
                onClick: () => V(!1),
                "aria-hidden": "true"
              }
            ),
            /* @__PURE__ */ o(
              "div",
              {
                ref: d,
                className: `manual-toc-panel${M ? " manual-toc-panel-open" : ""}`,
                role: "dialog",
                "aria-label": "目次",
                "aria-hidden": !M,
                tabIndex: -1,
                children: [
                  /* @__PURE__ */ o("div", { className: "manual-toc-panel-header", children: [
                    /* @__PURE__ */ e("span", { className: "manual-toc-panel-title", children: "目次" }),
                    /* @__PURE__ */ e(
                      "button",
                      {
                        onClick: () => V(!1),
                        className: "manual-toc-panel-close",
                        "aria-label": "目次を閉じる",
                        children: /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px" }, children: "close" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("div", { className: "manual-toc-panel-content", children: /* @__PURE__ */ e(
                    _e,
                    {
                      items: R,
                      activePath: P,
                      onSelectPage: be,
                      onSelectHeading: Fe,
                      activeHeadingId: z,
                      defaultExpandCategories: l
                    }
                  ) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("div", { ref: q, style: { display: "contents" }, children: [
            /* @__PURE__ */ e("main", { ref: j, style: m.mainPane, children: /* @__PURE__ */ o("div", { style: m.mainContent, children: [
              s && /* @__PURE__ */ o("div", { style: m.loading, children: [
                /* @__PURE__ */ e("span", { style: { ...m.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                /* @__PURE__ */ e("span", { children: "読み込み中..." })
              ] }),
              y && /* @__PURE__ */ o("div", { style: m.error, children: [
                /* @__PURE__ */ e("span", { style: m.icon, children: "warning" }),
                /* @__PURE__ */ o("div", { children: [
                  /* @__PURE__ */ e("div", { style: m.errorTitle, children: "エラーが発生しました" }),
                  /* @__PURE__ */ e("div", { style: m.errorDetail, children: y.message })
                ] })
              ] }),
              p && /* @__PURE__ */ e(
                we,
                {
                  content: p,
                  onLinkClick: ae,
                  onAppLinkClick: Ce
                }
              ),
              !s && !y && !p && !P && /* @__PURE__ */ o("div", { style: m.empty, children: [
                /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "64px", opacity: 0.5 }, children: "description" }),
                /* @__PURE__ */ e("span", { children: "マニュアルが指定されていません" })
              ] })
            ] }) }),
            ne && /* @__PURE__ */ o(Ee, { children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `manual-resize-handle${ye ? " resizing" : ""}`,
                  onMouseDown: fe,
                  onKeyDown: $e,
                  style: m.resizeHandle,
                  role: "separator",
                  "aria-orientation": "vertical",
                  "aria-valuenow": pe,
                  "aria-valuemin": i,
                  "aria-valuemax": g,
                  "aria-label": "サイドバーのリサイズ",
                  tabIndex: 0
                }
              ),
              /* @__PURE__ */ o("aside", { style: { ...m.sidebarPane, width: pe }, children: [
                r != null && /* @__PURE__ */ o(
                  "div",
                  {
                    ref: ze,
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      flex: D && $ ? `0 0 ${ee}px` : 1,
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ o("div", { style: m.sidebarHeader, children: [
                        !ue && ie !== r && /* @__PURE__ */ e(
                          "button",
                          {
                            onClick: () => le(r ?? null),
                            style: m.backButton,
                            title: "初期ページに戻る",
                            children: /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px" }, children: "home" })
                          }
                        ),
                        /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px", color: t.tertiary }, children: "auto_stories" }),
                        /* @__PURE__ */ e("span", { style: m.sidebarTitle, children: "参照" })
                      ] }),
                      /* @__PURE__ */ o(
                        "div",
                        {
                          ref: w,
                          style: m.sidebarContent,
                          children: [
                            Se && /* @__PURE__ */ o("div", { style: m.loading, children: [
                              /* @__PURE__ */ e("span", { style: { ...m.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                              /* @__PURE__ */ e("span", { children: "読み込み中..." })
                            ] }),
                            ce && /* @__PURE__ */ o("div", { style: m.error, children: [
                              /* @__PURE__ */ e("span", { style: m.icon, children: "warning" }),
                              /* @__PURE__ */ o("div", { children: [
                                /* @__PURE__ */ e("div", { style: m.errorTitle, children: "エラー" }),
                                /* @__PURE__ */ e("div", { style: m.errorDetail, children: ce.message })
                              ] })
                            ] }),
                            he && /* @__PURE__ */ e(
                              we,
                              {
                                content: he,
                                onLinkClick: nn,
                                onAppLinkClick: tn
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ),
                r && D && $ && /* @__PURE__ */ e(
                  "div",
                  {
                    className: `manual-v-resize-handle${Le ? " resizing" : ""}`,
                    onMouseDown: Ie,
                    onKeyDown: Re,
                    style: m.vResizeHandle,
                    role: "separator",
                    "aria-orientation": "horizontal",
                    "aria-valuenow": ee,
                    "aria-valuemin": 150,
                    "aria-valuemax": 800,
                    "aria-label": "TOC領域のリサイズ",
                    tabIndex: 0
                  }
                ),
                D != null && /* @__PURE__ */ o(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      height: $ ? r ? "auto" : "100%" : "auto",
                      flex: $ && !r ? 1 : $ ? "1 1 0" : "0 0 auto",
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ o("div", { style: m.feedbackHeader, children: [
                        /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                          /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px", color: t.tertiary }, children: "rate_review" }),
                          /* @__PURE__ */ e("span", { style: m.sidebarTitle, children: "フィードバック" })
                        ] }),
                        /* @__PURE__ */ o(
                          "button",
                          {
                            onClick: () => te(!$),
                            style: m.toggleBtn,
                            onMouseEnter: (b) => {
                              b.currentTarget.style.backgroundColor = t.gray100, b.currentTarget.style.borderColor = t.gray700;
                            },
                            onMouseLeave: (b) => {
                              b.currentTarget.style.backgroundColor = "transparent", b.currentTarget.style.borderColor = t.gray300;
                            },
                            "aria-label": $ ? "フィードバックを閉じる" : "フィードバックを開く",
                            title: $ ? "フィードバックを閉じる" : "フィードバックを開く",
                            children: [
                              /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "18px" }, children: $ ? "expand_less" : "expand_more" }),
                              /* @__PURE__ */ e("span", { children: $ ? "閉じる" : "開く" })
                            ]
                          }
                        )
                      ] }),
                      $ && /* @__PURE__ */ e("div", { style: m.feedbackContent, children: /* @__PURE__ */ e(
                        en,
                        {
                          apiBaseUrl: D,
                          userType: h,
                          appVersion: E,
                          onSubmitSuccess: I,
                          onSubmitError: _
                        }
                      ) })
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e("style", { children: tt })
      ]
    }
  );
}
const m = {
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
}, Ge = {
  bug: { label: "不具合", color: "#DC2626" },
  question: { label: "質問", color: "#2563EB" },
  request: { label: "要望", color: "#059669" },
  share: { label: "共有", color: "#6B7280" },
  other: { label: "その他", color: "#9333EA" }
}, Ve = {
  app: "アプリ",
  manual: "マニュアル"
}, rt = {
  open: { label: "open", color: "#F59E0B" },
  in_progress: { label: "対応中", color: "#2563EB" },
  closed: { label: "完了", color: "#059669" }
};
function Ft({ apiBaseUrl: n, adminKey: r }) {
  var V;
  const {
    feedbacks: a,
    total: u,
    page: c,
    limit: i,
    loading: g,
    error: D,
    filters: h,
    customTags: E,
    setFilters: x,
    setPage: L,
    updateStatus: C,
    remove: A,
    refresh: I
  } = un({ apiBaseUrl: n, adminKey: r }), [_, R] = S(null), [l, W] = S(null), [P, J] = S(!1), [p, s] = S(null), y = N(0);
  B(() => {
    ve() || Be();
  }, []);
  const v = Math.max(1, Math.ceil(u / i)), T = k(async (d) => {
    if (_ === d) {
      R(null), W(null);
      return;
    }
    R(d), J(!0);
    const f = ++y.current;
    try {
      const q = await hn({ apiBaseUrl: n, adminKey: r, id: d });
      if (y.current !== f) return;
      W(q);
    } catch {
      if (y.current !== f) return;
      W(null);
    }
    y.current === f && J(!1);
  }, [_, n, r]), H = k(async (d) => {
    confirm("削除しますか？") && (await A(d), _ === d && (R(null), W(null)));
  }, [A, _]), Y = k(async (d, f) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await fn({ apiBaseUrl: n, adminKey: r, feedbackId: d, attachmentId: f }), W((q) => {
          var $;
          return !q || q.id !== d ? q : {
            ...q,
            attachments: ($ = q.attachments) == null ? void 0 : $.filter((te) => te.id !== f)
          };
        });
      } catch (q) {
        console.error("Failed to delete attachment:", q);
      }
  }, [n, r]), M = k((d) => {
    try {
      const f = new URL(n);
      return `${f.origin}${f.pathname.replace(/\/$/, "")}/attachments/${d}`;
    } catch {
      return `${n}/attachments/${d}`;
    }
  }, [n]);
  return /* @__PURE__ */ o("div", { style: F.container, children: [
    /* @__PURE__ */ e("h2", { style: F.title, children: "フィードバック管理" }),
    /* @__PURE__ */ o("div", { style: F.filterRow, children: [
      /* @__PURE__ */ o(
        "select",
        {
          value: h.status,
          onChange: (d) => x({ status: d.target.value }),
          style: F.select,
          "aria-label": "ステータスフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全ステータス" }),
            /* @__PURE__ */ e("option", { value: "open", children: "open" }),
            /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
            /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
          ]
        }
      ),
      /* @__PURE__ */ o(
        "select",
        {
          value: h.kind,
          onChange: (d) => x({ kind: d.target.value }),
          style: F.select,
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
      /* @__PURE__ */ o(
        "select",
        {
          value: h.target,
          onChange: (d) => x({ target: d.target.value }),
          style: F.select,
          "aria-label": "対象フィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
            /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
            /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
          ]
        }
      ),
      E.length > 0 && /* @__PURE__ */ o(
        "select",
        {
          value: h.customTag,
          onChange: (d) => x({ customTag: d.target.value }),
          style: F.select,
          "aria-label": "タグフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
            E.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d))
          ]
        }
      ),
      /* @__PURE__ */ e("button", { onClick: I, style: F.refreshBtn, "aria-label": "更新", children: /* @__PURE__ */ e("span", { style: F.iconSmall, children: "refresh" }) })
    ] }),
    D && /* @__PURE__ */ e("div", { style: F.error, role: "alert", children: D.message.slice(0, 200) }),
    /* @__PURE__ */ o("table", { style: F.table, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ o("tr", { children: [
        /* @__PURE__ */ e("th", { style: F.th, children: "日時" }),
        /* @__PURE__ */ e("th", { style: F.th, children: "種別" }),
        /* @__PURE__ */ e("th", { style: F.th, children: "対象" }),
        /* @__PURE__ */ e("th", { style: { ...F.th, width: "40%" }, children: "メッセージ" }),
        /* @__PURE__ */ e("th", { style: F.th, children: "状態" }),
        /* @__PURE__ */ e("th", { style: { ...F.th, width: "30px" } })
      ] }) }),
      /* @__PURE__ */ o("tbody", { children: [
        g && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: F.loadingCell, children: "読み込み中..." }) }),
        !g && a.length === 0 && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: F.loadingCell, children: "データなし" }) }),
        a.map((d) => {
          var te;
          const f = Ge[d.kind] ?? { label: d.kind, color: "#6B7280" }, q = rt[d.status] ?? { label: d.status, color: "#6B7280" }, $ = _ === d.id;
          return /* @__PURE__ */ o("tr", { children: [
            /* @__PURE__ */ e("td", { style: F.td, children: /* @__PURE__ */ e(
              "button",
              {
                onClick: () => T(d.id),
                style: F.rowButton,
                "aria-expanded": $,
                "aria-controls": $ ? `feedback-detail-${d.id}` : void 0,
                children: (te = d.createdAt) == null ? void 0 : te.slice(5, 16).replace("T", " ")
              }
            ) }),
            /* @__PURE__ */ e("td", { style: F.td, children: /* @__PURE__ */ e("span", { style: { ...F.badge, backgroundColor: f.color }, children: f.label }) }),
            /* @__PURE__ */ e("td", { style: F.td, children: d.target ? Ve[d.target] ?? d.target : "-" }),
            /* @__PURE__ */ e("td", { style: { ...F.td, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: d.message.slice(0, 80) }),
            /* @__PURE__ */ e("td", { style: F.td, children: /* @__PURE__ */ e("span", { style: { color: q.color, fontWeight: 600, fontSize: "12px" }, children: q.label }) }),
            /* @__PURE__ */ e("td", { style: F.td, children: (d.attachmentCount ?? 0) > 0 && /* @__PURE__ */ e("span", { style: { ...F.iconSmall, fontSize: "14px", color: "#6B7280" }, title: `${d.attachmentCount}枚`, children: "image" }) })
          ] }, d.id);
        })
      ] })
    ] }),
    _ !== null && /* @__PURE__ */ e("div", { style: F.detailPanel, id: `feedback-detail-${_}`, role: "region", "aria-label": "フィードバック詳細", children: P ? /* @__PURE__ */ e("div", { children: "読み込み中..." }) : l ? /* @__PURE__ */ o(Ee, { children: [
      /* @__PURE__ */ o("div", { style: F.detailGrid, children: [
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "種別:" }),
          " ",
          (V = Ge[l.kind]) == null ? void 0 : V.label
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "対象:" }),
          " ",
          l.target ? Ve[l.target] : "-"
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "URL:" }),
          " ",
          l.pageUrl ?? "-"
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "ユーザー:" }),
          " ",
          l.userType ?? "-"
        ] }),
        l.environment && /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "環境:" }),
          " ",
          Object.values(l.environment).slice(0, 2).join(" / ")
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "バージョン:" }),
          " ",
          l.appVersion ?? "-"
        ] }),
        l.customTag && /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "タグ:" }),
          " ",
          l.customTag
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "日時:" }),
          " ",
          l.createdAt
        ] })
      ] }),
      /* @__PURE__ */ o("div", { style: F.detailMessage, children: [
        /* @__PURE__ */ e("strong", { children: "メッセージ:" }),
        /* @__PURE__ */ e("pre", { style: F.messagePre, children: l.message })
      ] }),
      l.consoleLogs && l.consoleLogs.length > 0 && /* @__PURE__ */ o("details", { style: F.logSection, children: [
        /* @__PURE__ */ o("summary", { children: [
          "コンソールログ (",
          l.consoleLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: F.logPre, children: JSON.stringify(l.consoleLogs, null, 2) })
      ] }),
      l.networkLogs && l.networkLogs.length > 0 && /* @__PURE__ */ o("details", { style: F.logSection, children: [
        /* @__PURE__ */ o("summary", { children: [
          "ネットワークログ (",
          l.networkLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: F.logPre, children: JSON.stringify(l.networkLogs, null, 2) })
      ] }),
      l.attachments && l.attachments.length > 0 && /* @__PURE__ */ o("div", { style: F.attachmentSection, children: [
        /* @__PURE__ */ o("strong", { children: [
          "添付画像 (",
          l.attachments.length,
          "件):"
        ] }),
        /* @__PURE__ */ e("div", { style: F.attachmentGrid, children: l.attachments.map((d) => /* @__PURE__ */ o("div", { style: F.attachmentThumb, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: M(d.filename),
              alt: d.original_name,
              style: F.attachmentImg,
              onClick: () => s(M(d.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => Y(l.id, d.id),
              style: F.attachmentRemoveBtn,
              "aria-label": "画像を削除",
              children: /* @__PURE__ */ e("span", { style: { ...F.iconSmall, fontSize: "14px" }, children: "close" })
            }
          ),
          /* @__PURE__ */ e("div", { style: F.attachmentInfo, children: d.original_name.length > 12 ? d.original_name.slice(0, 12) + "..." : d.original_name })
        ] }, d.id)) })
      ] }),
      p && /* @__PURE__ */ e("div", { style: F.overlay, onClick: () => s(null), children: /* @__PURE__ */ e("img", { src: p, alt: "拡大画像", style: F.enlargedImg }) }),
      /* @__PURE__ */ o("div", { style: F.detailActions, children: [
        /* @__PURE__ */ o(
          "select",
          {
            value: l.status,
            onChange: (d) => C(l.id, d.target.value),
            style: F.select,
            "aria-label": "ステータス変更",
            children: [
              /* @__PURE__ */ e("option", { value: "open", children: "open" }),
              /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
              /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
            ]
          }
        ),
        /* @__PURE__ */ e("button", { onClick: () => H(l.id), style: F.deleteBtn, children: "削除" })
      ] })
    ] }) : /* @__PURE__ */ e("div", { children: "詳細の取得に失敗しました" }) }),
    v > 1 && /* @__PURE__ */ o("div", { style: F.pagination, children: [
      /* @__PURE__ */ e("button", { onClick: () => L(c - 1), disabled: c <= 1, style: F.pageBtn, "aria-label": "前のページ", children: "◀" }),
      /* @__PURE__ */ o("span", { style: F.pageInfo, children: [
        c,
        " / ",
        v
      ] }),
      /* @__PURE__ */ e("button", { onClick: () => L(c + 1), disabled: c >= v, style: F.pageBtn, "aria-label": "次のページ", children: "▶" })
    ] })
  ] });
}
const F = {
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
  Me as D,
  Ft as F,
  xn as I,
  t as M,
  en as a,
  Qe as b,
  ht as c,
  ft as d,
  gt as e,
  Dt as f,
  mt as g,
  _e as h,
  we as i,
  ve as j,
  Be as l,
  Wn as m,
  Xn as u
};
