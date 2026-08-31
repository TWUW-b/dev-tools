import { jsxs as o, jsx as e, Fragment as Ee } from "react/jsx-runtime";
import { useState as v, useRef as q, useCallback as w, useEffect as B, useMemo as Ve } from "react";
import { createPortal as rn } from "react-dom";
import { u as on, d as Ae, c as an, e as _e, b as ln, a as un } from "./useFeedbackAdminMode-DpbrwKWq.js";
import sn, { defaultUrlTransform as cn } from "react-markdown";
import dn from "remark-gfm";
import pn from "rehype-raw";
import { c as gn } from "./feedbackLogCapture-DUBfVREg.js";
import { l as Dn, h as hn, i as fn } from "./feedbackApi-BAwJP8AU.js";
const Le = {
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
}, Pe = ["image/png", "image/jpeg", "image/webp", "image/gif"], mn = 5, Fn = 5 * 1024 * 1024;
function xn({
  files: n,
  onAdd: r,
  onRemove: a,
  maxFiles: u = mn,
  maxFileSize: c = Fn,
  disabled: i = !1,
  pipDocument: g
}) {
  const [h, f] = v(!1), [E, x] = v(null), z = q(null), C = q(0), A = w((s) => {
    x(null);
    const y = u - n.length;
    if (y <= 0) {
      x(`最大${u}枚まで添付できます`);
      return;
    }
    const k = [];
    for (const H of s) {
      if (k.length >= y) break;
      if (!Pe.includes(H.type)) {
        x(`${H.name}: 対応していない形式です（PNG/JPEG/WebP/GIF）`);
        continue;
      }
      if (H.size > c) {
        x(`${H.name}: ファイルサイズが大きすぎます（最大5MB）`);
        continue;
      }
      k.push(H);
    }
    k.length > 0 && r(k);
  }, [n.length, u, c, r]), R = w((s) => {
    var H;
    if (i) return;
    const y = (H = s.clipboardData) == null ? void 0 : H.items;
    if (!y) return;
    const k = [];
    for (let O = 0; O < y.length; O++) {
      const X = y[O];
      if (X.kind === "file" && Pe.includes(X.type)) {
        const M = X.getAsFile();
        M && k.push(M);
      }
    }
    k.length > 0 && (s.preventDefault(), A(k));
  }, [i, A]);
  B(() => (document.addEventListener("paste", R), g == null || g.addEventListener("paste", R), () => {
    document.removeEventListener("paste", R), g == null || g.removeEventListener("paste", R);
  }), [R, g]);
  const _ = w((s) => {
    s.preventDefault(), s.stopPropagation(), C.current++, C.current === 1 && f(!0);
  }, []), T = w((s) => {
    s.preventDefault(), s.stopPropagation(), C.current--, C.current === 0 && f(!1);
  }, []), l = w((s) => {
    s.preventDefault(), s.stopPropagation();
  }, []), W = w((s) => {
    if (s.preventDefault(), s.stopPropagation(), C.current = 0, f(!1), i) return;
    const y = Array.from(s.dataTransfer.files);
    A(y);
  }, [i, A]), P = w(() => {
    var s;
    i || (s = z.current) == null || s.click();
  }, [i]), U = w((s) => {
    const y = s.target.files ? Array.from(s.target.files) : [];
    y.length > 0 && A(y), z.current && (z.current.value = "");
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
        className: `debug-dropzone ${h ? "dragging" : ""} ${i ? "disabled" : ""}`,
        onDragEnter: _,
        onDragLeave: T,
        onDragOver: l,
        onDrop: W,
        onClick: P,
        role: "button",
        tabIndex: 0,
        onKeyDown: (s) => {
          (s.key === "Enter" || s.key === " ") && P();
        },
        children: [
          /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "24px", color: Le.gray500 }, children: h ? "file_download" : "add_photo_alternate" }),
          /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: Le.gray500 }, children: h ? "ドロップして追加" : "クリック / ドラッグ / Ctrl+V で画像を追加" })
        ]
      }
    ),
    /* @__PURE__ */ e(
      "input",
      {
        ref: z,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        multiple: !0,
        style: { display: "none" },
        onChange: U
      }
    ),
    E && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: Le.error }, children: E }),
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
  const [u, c] = v(null);
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
class Ge {
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
  return "children" in n ? Ue(n) : "value" in n ? n.value : "";
}
function kn(n) {
  return n.type === "text" ? n.value : "children" in n ? Ue(n) : "";
}
function Ue(n) {
  let r = -1;
  const a = [];
  for (; ++r < n.children.length; )
    a[r] = kn(n.children[r]);
  return a.join("");
}
const Xe = (
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
    r[a] = Xe(n[a]);
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
const Ye = [], Ln = !0, He = !1, In = "skip";
function Rn(n, r, a, u) {
  let c;
  typeof r == "function" && typeof a != "function" ? (u = a, a = r) : c = r;
  const i = Xe(c), g = u ? -1 : 1;
  h(n, void 0, [])();
  function h(f, E, x) {
    const z = (
      /** @type {Record<string, unknown>} */
      f && typeof f == "object" ? f : {}
    );
    if (typeof z.type == "string") {
      const A = (
        // `hast`
        typeof z.tagName == "string" ? z.tagName : (
          // `xast`
          typeof z.name == "string" ? z.name : void 0
        )
      );
      Object.defineProperty(C, "name", {
        value: "node (" + (f.type + (A ? "<" + A + ">" : "")) + ")"
      });
    }
    return C;
    function C() {
      let A = Ye, R, _, T;
      if ((!r || i(f, E, x[x.length - 1] || void 0)) && (A = Tn(a(f, x)), A[0] === He))
        return A;
      if ("children" in f && f.children) {
        const l = (
          /** @type {UnistParent} */
          f
        );
        if (l.children && A[0] !== In)
          for (_ = (u ? l.children.length : -1) + g, T = x.concat(l); _ > -1 && _ < l.children.length; ) {
            const W = l.children[_];
            if (R = h(W, _, T)(), R[0] === He)
              return R;
            _ = typeof R[1] == "number" ? R[1] : _ + g;
          }
      }
      return A;
    }
  }
}
function Tn(n) {
  return Array.isArray(n) ? n : typeof n == "number" ? [Ln, n] : n == null ? Ye : [n];
}
function Mn(n, r, a, u) {
  let c, i, g;
  i = r, g = a, c = u, Rn(n, i, h, c);
  function h(f, E) {
    const x = E[E.length - 1], z = x ? x.children.indexOf(f) : void 0;
    return g(f, z, x);
  }
}
const _n = {}, Oe = new Ge();
function Pn(n) {
  const a = (n || _n).prefix || "";
  return function(u) {
    Oe.reset(), Mn(u, "element", function(c) {
      An(c) && !c.properties.id && (c.properties.id = a + Oe.slug(wn(c)));
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
    a: ({ href: i, children: g, ...h }) => {
      const f = i ? On(i) : null;
      return f !== null && u ? /* @__PURE__ */ e(
        "span",
        {
          role: "link",
          tabIndex: 0,
          onClick: (E) => {
            E.preventDefault(), E.stopPropagation(), u(f);
          },
          onKeyDown: (E) => {
            (E.key === "Enter" || E.key === " ") && (E.preventDefault(), u(f));
          },
          style: {
            color: "#043E80",
            textDecoration: "underline",
            cursor: "pointer"
          },
          ...h,
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
          ...h,
          children: g
        }
      ) : /* @__PURE__ */ e(
        "a",
        {
          href: i,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { color: "#043E80" },
          ...h,
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
const Je = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap", Wn = `
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
  return a.rel = "stylesheet", a.href = Je, document.head.appendChild(a), !0;
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
function Ze({
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
  const h = q(null);
  B(() => {
    try {
      const D = gn({
        // フィードバックAPI自身への fetch を除外（無限ループ防止）
        networkExclude: [n]
      });
      return h.current = D, () => {
        D.destroy(), h.current = null;
      };
    } catch (D) {
      return console.error("Failed to create log capture:", D), () => {
      };
    }
  }, [n]);
  const [f, E] = v(null), [x, z] = v(""), [C, A] = v(!1), [R, _] = v(""), [T, l] = v(""), [W, P] = v([]), [U, p] = v(!1), [s, y] = v(null), k = q(), H = q(!1);
  B(() => () => {
    k.current && clearTimeout(k.current);
  }, []);
  const O = f !== null && x.trim() !== "" && !i, X = w(async () => {
    var ae;
    if (!f || !x.trim() || H.current) return;
    H.current = !0;
    let D = x.trim();
    (R.trim() || T.trim()) && (D += `

---`, R.trim() && (D += `
再現手順:
${R.trim()}`), T.trim() && (D += `
期待結果:
${T.trim()}`));
    const $ = f === "bug" && h.current ? {
      consoleLogs: h.current.getConsoleLogs(),
      networkLogs: h.current.getNetworkLogs()
    } : void 0, { data: L, error: Z } = await g({
      kind: f,
      message: D
    }, $);
    if (L) {
      if (W.length > 0)
        for (const le of W)
          try {
            await Dn({
              apiBaseUrl: n,
              feedbackId: L.id,
              file: le
            });
          } catch (ue) {
            console.error("Failed to upload attachment:", ue);
          }
      E(null), z(""), _(""), l(""), A(!1), P([]), y(null), (ae = h.current) == null || ae.clear(), p(!0), k.current && clearTimeout(k.current), k.current = setTimeout(() => p(!1), 3e3), u == null || u(L);
    } else
      y(Z), c == null || c(Z ?? new Error("Unknown error"));
    H.current = !1;
  }, [f, x, R, T, W, n, g, u, c]), M = w(
    (D) => {
      (D.metaKey || D.ctrlKey) && D.key === "Enter" && O && (D.preventDefault(), X());
    },
    [O, X]
  ), j = w((D) => {
    P(($) => [...$, ...D]);
  }, []), d = w((D) => {
    P(($) => $.filter((L, Z) => Z !== D));
  }, []);
  return /* @__PURE__ */ o("div", { style: K.container, children: [
    /* @__PURE__ */ e("style", { children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }${Kn}` }),
    /* @__PURE__ */ o("div", { style: K.section, children: [
      /* @__PURE__ */ e("div", { style: K.tagGroup, role: "radiogroup", "aria-label": "フィードバック種別", children: qn.map((D) => /* @__PURE__ */ e(
        "button",
        {
          role: "radio",
          "aria-checked": f === D.value,
          onClick: () => E(f === D.value ? null : D.value),
          style: {
            ...K.tag,
            ...f === D.value ? { backgroundColor: D.color, color: "#fff", borderColor: D.color } : { borderColor: "#D1D5DB", color: "#6B7280" }
          },
          children: D.label
        },
        D.value
      )) }),
      /* @__PURE__ */ e("div", { style: K.tagHint, children: "どれか一つを選んでください" })
    ] }),
    /* @__PURE__ */ e("div", { style: K.section, children: /* @__PURE__ */ e(
      "textarea",
      {
        value: x,
        onChange: (D) => z(D.target.value),
        onKeyDown: M,
        placeholder: "気づいたことをそのまま書いてください（一言でもOK）",
        "aria-label": "フィードバックメッセージ",
        rows: 4,
        maxLength: 4e3,
        style: K.textarea
      }
    ) }),
    /* @__PURE__ */ e("div", { style: K.section, children: /* @__PURE__ */ e(
      xn,
      {
        files: W,
        onAdd: j,
        onRemove: d,
        maxFiles: 3,
        disabled: i
      }
    ) }),
    f === "bug" && /* @__PURE__ */ o("div", { style: K.logNotice, children: [
      /* @__PURE__ */ e("span", { style: K.iconSmall, children: "info" }),
      "不具合タグを選択すると、直前の動作ログが自動で添付されます"
    ] }),
    /* @__PURE__ */ o("div", { style: K.section, children: [
      /* @__PURE__ */ o("button", { onClick: () => A(!C), style: K.detailToggle, "aria-expanded": C, children: [
        /* @__PURE__ */ e("span", { style: K.iconSmall, children: C ? "expand_less" : "expand_more" }),
        "詳細情報（任意）"
      ] }),
      C && /* @__PURE__ */ o("div", { style: K.detailArea, children: [
        /* @__PURE__ */ e("label", { style: K.label, children: "再現手順:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: R,
            onChange: (D) => _(D.target.value),
            "aria-label": "再現手順",
            rows: 2,
            style: K.textarea
          }
        ),
        /* @__PURE__ */ e("label", { style: { ...K.label, marginTop: "8px" }, children: "期待結果:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: T,
            onChange: (D) => l(D.target.value),
            "aria-label": "期待結果",
            rows: 2,
            style: K.textarea
          }
        )
      ] })
    ] }),
    s && /* @__PURE__ */ o("div", { style: K.errorMsg, role: "alert", children: [
      /* @__PURE__ */ e("span", { style: K.iconSmall, children: "warning" }),
      s.message.slice(0, 200)
    ] }),
    /* @__PURE__ */ e("div", { style: K.submitRow, children: /* @__PURE__ */ e("button", { onClick: X, disabled: !O, style: {
      ...K.submitButton,
      opacity: O ? 1 : 0.5,
      cursor: O ? "pointer" : "not-allowed"
    }, children: i ? /* @__PURE__ */ e("span", { style: { ...K.iconSmall, animation: "spin 1s linear infinite" }, children: "progress_activity" }) : "送信" }) }),
    U && /* @__PURE__ */ e("div", { style: K.toast, role: "status", children: "送信しました" })
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
function Vn(n) {
  return n.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/!\[([^\]]*)\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
}
function Gn(n) {
  return n.replace(/(?:^|[ \t])#+[ \t]*$/, "").trim();
}
function Un(n) {
  const r = new Ge(), a = [], u = n.split(/\r?\n/);
  let c = null;
  for (const i of u) {
    const g = /^(`{3,}|~{3,})/.exec(i.trim());
    if (g) {
      const C = g[1][0];
      c === null ? c = C : c === C && (c = null);
      continue;
    }
    if (c) continue;
    let h = null, f = "";
    const E = /^ {0,3}(#{2,3})(?:[ \t]+(.*))?$/.exec(i);
    if (E)
      h = E[1].length, f = Gn((E[2] ?? "").trim());
    else {
      const C = /^\s{0,3}<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>\s*$/i.exec(i);
      C && (h = Number(C[1]), f = C[2].replace(/<[^>]+>/g, "").trim());
    }
    if (h === null) continue;
    const x = Vn(f);
    if (!x) continue;
    const z = r.slug(x);
    a.push({ id: z, text: x, level: h });
  }
  return a;
}
function Xn() {
  const [n, r] = v({}), [a, u] = v({}), [c, i] = v({}), g = q(/* @__PURE__ */ new Set()), h = q(!0);
  B(() => (h.current = !0, () => {
    h.current = !1;
  }), []);
  const f = w((C) => n[C], [n]), E = w((C) => a[C] ?? !1, [a]), x = w((C) => c[C] ?? null, [c]), z = w(async (C) => {
    if (!g.current.has(C)) {
      g.current.add(C), u((A) => ({ ...A, [C]: !0 })), i((A) => ({ ...A, [C]: null }));
      try {
        const A = await fetch(C);
        if (!A.ok)
          throw new Error(`Failed to load: ${A.status} ${A.statusText}`);
        const R = await A.text(), _ = Un(R);
        if (!h.current) return;
        r((T) => ({ ...T, [C]: _ }));
      } catch (A) {
        if (g.current.delete(C), !h.current) return;
        i((R) => ({
          ...R,
          [C]: A instanceof Error ? A : new Error(String(A))
        }));
      } finally {
        h.current && u((A) => ({ ...A, [C]: !1 }));
      }
    }
  }, []);
  return { getHeadings: f, loadHeadings: z, isLoading: E, getError: x };
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
function Ne(n, r) {
  var a;
  return r ? ((a = n.find((u) => u.path === r)) == null ? void 0 : a.category) ?? null : null;
}
function Jn(n) {
  return n.replace(/\s+/g, "-");
}
function Ie({
  items: n,
  activePath: r,
  onSelectPage: a,
  onSelectHeading: u,
  activeHeadingId: c = null,
  defaultExpandCategories: i = "active",
  className: g = ""
}) {
  const { groups: h, uncategorized: f } = Ve(() => Yn(n), [n]), { getHeadings: E, loadHeadings: x, isLoading: z, getError: C } = Xn(), [A, R] = v(() => {
    const p = Ne(n, r), s = {};
    for (const y of h)
      s[y.category] = i === "all" || y.category === p;
    return s;
  });
  B(() => {
    const p = Ne(n, r);
    p && R((s) => s[p] ? s : { ...s, [p]: !0 });
  }, [r, n]);
  const [_, T] = v({}), l = q(/* @__PURE__ */ new Set()), W = w((p) => {
    R((s) => ({ ...s, [p]: !s[p] }));
  }, []), P = w(
    (p) => {
      T((s) => {
        const y = !(s[p] ?? !1);
        return y ? (x(p), l.current.delete(p)) : l.current.add(p), { ...s, [p]: y };
      });
    },
    [x]
  );
  B(() => {
    !c || !r || l.current.has(r) || (x(r), T((p) => p[r] ? p : { ...p, [r]: !0 }));
  }, [c, r, x]);
  const U = (p) => {
    const s = r === p.path, y = _[p.path] ?? !1, k = E(p.path), H = z(p.path), O = C(p.path), X = `manual-toc-headings-${Jn(p.id)}`;
    return /* @__PURE__ */ o("li", { children: [
      /* @__PURE__ */ o("div", { style: J.pageRow, children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              a(p.path), P(p.path);
            },
            "aria-expanded": y,
            "aria-controls": X,
            style: {
              ...J.pageButton,
              background: s ? "#e3f2fd" : "transparent",
              color: s ? t.primary : t.gray700,
              borderLeft: s ? `3px solid ${t.primary}` : "3px solid transparent"
            },
            children: p.title
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => P(p.path),
            style: J.toggleHeadingsButton,
            "aria-expanded": y,
            "aria-controls": X,
            "aria-label": y ? `${p.title} の見出しを閉じる` : `${p.title} の見出しを開く`,
            title: y ? "見出しを閉じる" : "見出しを開く",
            children: /* @__PURE__ */ e("span", { style: J.chevronIcon, children: y ? "expand_less" : "expand_more" })
          }
        )
      ] }),
      y && /* @__PURE__ */ o("ul", { id: X, style: J.headingList, role: "group", children: [
        H && /* @__PURE__ */ e("li", { style: J.headingStatus, children: "読み込み中..." }),
        !H && O && /* @__PURE__ */ e("li", { style: { ...J.headingStatus, color: t.error }, children: "見出しの読み込みに失敗しました" }),
        !H && !O && k && k.length === 0 && /* @__PURE__ */ e("li", { style: J.headingStatus, children: "見出しなし" }),
        !H && !O && (k == null ? void 0 : k.map((M) => {
          const j = M.level === 3, d = s && c === M.id;
          return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => u(p.path, M.id),
              style: {
                ...J.headingButton,
                paddingLeft: j ? "38px" : "20px",
                fontSize: j ? "12px" : "13px",
                color: d ? t.primary : j ? t.gray500 : t.gray700,
                background: d ? "#e3f2fd" : "transparent",
                borderLeft: d ? `2px solid ${t.primary}` : "2px solid transparent",
                fontWeight: d ? 600 : 400
              },
              children: [
                /* @__PURE__ */ e(
                  "span",
                  {
                    style: {
                      ...J.headingDot,
                      ...j ? J.headingDotSub : null,
                      ...d ? { background: t.primary } : null
                    }
                  }
                ),
                /* @__PURE__ */ e("span", { style: J.headingText, children: M.text })
              ]
            }
          ) }, M.id);
        }))
      ] })
    ] }, p.id);
  };
  return /* @__PURE__ */ o("nav", { className: `manual-toc ${g}`, "aria-label": "マニュアル目次", style: J.nav, children: [
    f.length > 0 && /* @__PURE__ */ e("ul", { style: J.list, children: f.map(U) }),
    h.map((p, s) => {
      const y = A[p.category] ?? !1, k = `manual-toc-category-${s}`;
      return /* @__PURE__ */ o("div", { style: J.categoryBlock, children: [
        /* @__PURE__ */ o(
          "button",
          {
            type: "button",
            onClick: () => W(p.category),
            style: J.categoryButton,
            "aria-expanded": y,
            "aria-controls": k,
            children: [
              /* @__PURE__ */ e("span", { style: J.categoryChevron, "aria-hidden": "true", children: y ? "expand_more" : "chevron_right" }),
              /* @__PURE__ */ e("span", { children: p.category })
            ]
          }
        ),
        y && /* @__PURE__ */ e("ul", { id: k, style: J.list, children: p.items.map(U) })
      ] }, p.category);
    })
  ] });
}
const J = {
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
}, Zn = 200;
function pt({
  isOpen: n,
  docPath: r,
  onClose: a,
  onNavigate: u,
  onAppNavigate: c,
  initialSize: i = { width: 420, height: 550 },
  showDownloadButton: g = !1,
  copyHostStyles: h = !0,
  items: f,
  feedbackApiBaseUrl: E,
  feedbackUserType: x,
  feedbackAppVersion: z,
  onFeedbackSubmitSuccess: C,
  onFeedbackSubmitError: A,
  feedbackDefaultHeight: R = 200,
  feedbackMinHeight: _ = 150,
  feedbackMaxHeight: T = 400
}) {
  const [l, W] = v(null), [P, U] = v(null), { content: p, loading: s, error: y } = Ae(r), { downloadMd: k } = an(), H = q(!1), [O, X] = v(!1), M = E != null, [j, d] = v(!0), [D, $] = v(!1), L = q(null), Z = q(null), ae = q(!1), le = q(null), ue = q(null), [he, oe] = v(null), ie = q(!1), fe = w(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported");
      return;
    }
    if (!H.current) {
      H.current = !0;
      try {
        const S = M ? 650 : i.width, V = i.height, I = await window.documentPictureInPicture.requestWindow({
          width: S,
          height: V,
          // Document Picture-in-Picture API はデフォルト(false)で「閉じたときの
          // 位置・サイズを記憶し、次回はそれを再利用する」仕様のため、true を渡さないと
          // 一度でも手動リサイズ/別サイズで開いた履歴があると width/height の指定が
          // 無視され続ける。true にして常に指定サイズで開かせる（Chrome 130+。
          // 非対応ブラウザではオプションが単に無視されるだけで害はない）。
          preferInitialWindowPlacement: !0
        }), Q = I.document.createElement("style");
        Q.textContent = et(), I.document.head.appendChild(Q), h && Qn(I.document);
        const Y = I.document.createElement("div");
        Y.id = "manual-pip-root", I.document.body.appendChild(Y), W(I), U(Y), I.addEventListener("pagehide", () => {
          W(null), U(null), a();
        });
      } catch (S) {
        console.error("Failed to open PiP window:", S);
      } finally {
        H.current = !1;
      }
    }
  }, [i.width, i.height, h, a]), me = w(() => {
    l && (l.close(), W(null), U(null));
  }, [l]);
  B(() => {
    n && !l ? fe() : !n && l && me();
  }, [n, l, fe, me]);
  const ye = w(
    (S) => {
      if (u) {
        const V = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/", I = S.startsWith("/") ? S : V + S;
        u(I);
      }
    },
    [r, u]
  );
  B(() => {
    if (!l || l.closed || !c) return;
    const S = (I) => {
      var ee;
      const Y = I.target.closest("a");
      if (Y) {
        const G = Y.getAttribute("href");
        if (console.log("[ManualPiP] Link clicked", {
          href: G,
          text: (ee = Y.textContent) == null ? void 0 : ee.substring(0, 30),
          startsWithHashApp: G == null ? void 0 : G.startsWith("#app:")
        }), G && G.startsWith("#app:")) {
          console.log("[ManualPiP] App link detected! Preventing default"), I.preventDefault(), I.stopPropagation();
          const re = G.replace("#app:", "");
          console.log("[ManualPiP] Calling onAppNavigate", { appPath: re }), c(re);
        }
      }
    }, V = (I) => {
      var ee;
      const Q = I.target, Y = ((ee = Q.querySelector("summary")) == null ? void 0 : ee.textContent) || "unknown";
      console.log("[ManualPiP] Details toggle", {
        open: Q.open,
        summary: Y
      }), Q.open && setTimeout(() => {
        const G = Q.querySelectorAll('a[href^="app:"]'), re = Q.querySelectorAll("a"), ce = Array.from(re).map((de) => {
          var Ce;
          return {
            href: de.getAttribute("href"),
            text: (Ce = de.textContent) == null ? void 0 : Ce.substring(0, 20)
          };
        });
        console.log("[ManualPiP] Links in opened details", {
          totalLinks: re.length,
          appLinksCount: G.length,
          allHrefs: ce
        });
      }, 100);
    };
    return l.document.addEventListener("click", S, !0), l.document.addEventListener("toggle", V, !0), () => {
      l.closed || (l.document.removeEventListener("click", S, !0), l.document.removeEventListener("toggle", V, !0));
    };
  }, [l, c]);
  const te = w(() => {
    Z.current !== null && (clearTimeout(Z.current), Z.current = null);
  }, []), Se = w(() => {
    te(), $(!0);
  }, [te]), be = w(() => {
    te(), Z.current = setTimeout(() => {
      Z.current = null, $(!1);
    }, Zn);
  }, [te]);
  B(() => te, [te]);
  const $e = w(
    (S) => {
      $(!1), u == null || u(S);
    },
    [u]
  ), Fe = w(
    (S, V) => {
      if ($(!1), S === r) {
        if (l && !l.closed) {
          const I = l.document.getElementById(V);
          I == null || I.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      L.current = { path: S, headingId: V }, u == null || u(S);
    },
    [r, l, u]
  );
  B(() => {
    const S = L.current;
    if (!S || S.path !== r) {
      ae.current = !1;
      return;
    }
    if (s) {
      ae.current = !0;
      return;
    }
    if (!ae.current || !l || l.closed || !p) return;
    let V = !1, I, Q = 0;
    const Y = () => {
      if (V || l.closed) return;
      const ee = l.document.getElementById(S.headingId);
      if (ee) {
        ee.scrollIntoView({ behavior: "smooth" }), L.current = null;
        return;
      }
      Q += 1, Q < 30 ? I = l.requestAnimationFrame(Y) : L.current = null;
    };
    return I = l.requestAnimationFrame(Y), () => {
      V = !0, l.closed || l.cancelAnimationFrame(I);
    };
  }, [p, r, s, l]), B(() => {
    ie.current = !1;
  }, [r]), B(() => {
    s && (ie.current = !0);
  }, [s]), B(() => {
    if (!l || l.closed || !p || !ie.current) {
      oe(null);
      return;
    }
    const S = ue.current;
    if (!S) {
      oe(null);
      return;
    }
    const V = Array.from(
      S.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (V.length === 0) {
      oe(null);
      return;
    }
    const I = /* @__PURE__ */ new Set(), Q = new l.IntersectionObserver(
      (Y) => {
        for (const G of Y) {
          const re = G.target.id;
          G.isIntersecting ? I.add(re) : I.delete(re);
        }
        if (I.size === 0) return;
        const ee = V.find((G) => I.has(G.id));
        ee && oe((G) => G === ee.id ? G : ee.id);
      },
      {
        root: S,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return V.forEach((Y) => Q.observe(Y)), oe(V[0].id), () => {
      Q.disconnect();
    };
  }, [p, r, l, s]), B(() => {
    if (!l || l.closed || !D) return;
    const S = (V) => {
      V.key === "Escape" && $(!1);
    };
    return l.document.addEventListener("keydown", S), () => {
      l.closed || l.document.removeEventListener("keydown", S);
    };
  }, [l, D]), B(() => {
    le.current && (le.current.inert = !D);
  }, [D]);
  const ze = w(async () => {
    if (r) {
      X(!0);
      try {
        await k(r);
      } catch (S) {
        console.error("Download failed:", S);
      } finally {
        X(!1);
      }
    }
  }, [r, k]);
  return P ? rn(
    /* @__PURE__ */ o("div", { className: "pip-container", children: [
      /* @__PURE__ */ o("header", { className: "pip-header", children: [
        /* @__PURE__ */ o("div", { className: "pip-header-left", children: [
          f && /* @__PURE__ */ e(
            "button",
            {
              onClick: () => {
                te(), $(!0);
              },
              onMouseEnter: Se,
              onMouseLeave: be,
              className: "pip-menu-btn",
              "aria-label": "目次を開く",
              "aria-expanded": D,
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu" })
            }
          ),
          /* @__PURE__ */ e("span", { className: "pip-icon", children: "menu_book" }),
          /* @__PURE__ */ e("span", { className: "pip-title", children: "マニュアル" })
        ] }),
        /* @__PURE__ */ o("div", { className: "pip-header-right", children: [
          g && r && /* @__PURE__ */ e(
            "button",
            {
              onClick: ze,
              className: "pip-download-btn",
              "aria-label": "ダウンロード",
              disabled: O,
              children: /* @__PURE__ */ e("span", { className: `pip-icon ${O ? "pip-spin" : ""}`, children: O ? "progress_activity" : "download" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: me,
              className: "pip-close-btn",
              "aria-label": "閉じる",
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "close" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o("div", { className: "pip-body", children: [
        f && /* @__PURE__ */ o(Ee, { children: [
          /* @__PURE__ */ e(
            "div",
            {
              className: `pip-toc-backdrop${D ? " pip-toc-backdrop-open" : ""}`,
              onClick: () => $(!1),
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ o(
            "div",
            {
              ref: le,
              className: `pip-toc-panel${D ? " pip-toc-panel-open" : ""}`,
              role: "dialog",
              "aria-label": "目次",
              "aria-hidden": !D,
              onMouseEnter: te,
              onMouseLeave: be,
              children: [
                /* @__PURE__ */ o("div", { className: "pip-toc-panel-header", children: [
                  /* @__PURE__ */ e("span", { className: "pip-toc-panel-title", children: "目次" }),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      onClick: () => $(!1),
                      className: "pip-toc-panel-close",
                      "aria-label": "目次を閉じる",
                      children: /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "20px" }, children: "close" })
                    }
                  )
                ] }),
                /* @__PURE__ */ e("div", { className: "pip-toc-panel-content", children: /* @__PURE__ */ e(
                  Ie,
                  {
                    items: f,
                    activePath: r,
                    onSelectPage: $e,
                    onSelectHeading: Fe,
                    activeHeadingId: he
                  }
                ) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ o("main", { className: "pip-content", ref: ue, children: [
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
              onLinkClick: ye,
              onAppLinkClick: c
            }
          ),
          !s && !y && !p && /* @__PURE__ */ o("div", { className: "pip-empty", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-large", children: "description" }),
            /* @__PURE__ */ e("span", { children: "マニュアルを選択してください" })
          ] })
        ] }),
        M && /* @__PURE__ */ e("aside", { className: "pip-sidebar", style: { width: "300px" }, children: E != null && /* @__PURE__ */ o(
          "div",
          {
            className: "pip-feedback-section",
            style: {
              height: j ? "100%" : "auto",
              flex: j ? 1 : "0 0 auto"
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
                    onClick: () => d(!j),
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
                Ze,
                {
                  apiBaseUrl: E,
                  userType: x,
                  appVersion: z,
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
function Qn(n) {
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
function et() {
  return `
    @import url('${Je}');

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
function gt({
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
  const g = Ve(() => {
    const h = {}, f = [], E = [...n].sort((x, z) => (x.order ?? 0) - (z.order ?? 0));
    for (const x of E)
      x.category ? (h[x.category] || (h[x.category] = []), h[x.category].push(x)) : f.push(x);
    return { groups: h, uncategorized: f };
  }, [n]);
  return /* @__PURE__ */ o("nav", { className: `manual-sidebar ${u}`, children: [
    g.uncategorized.length > 0 && /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: g.uncategorized.map((h) => /* @__PURE__ */ e(
      je,
      {
        item: h,
        isActive: a === h.path,
        onSelect: r,
        onPiP: c,
        onNewTab: i
      },
      h.id
    )) }),
    Object.entries(g.groups).map(([h, f]) => /* @__PURE__ */ o("div", { style: { marginTop: "16px" }, children: [
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
          children: h
        }
      ),
      /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: f.map((E) => /* @__PURE__ */ e(
        je,
        {
          item: E,
          isActive: a === E.path,
          onSelect: r,
          onPiP: c,
          onNewTab: i
        },
        E.id
      )) })
    ] }, h))
  ] });
}
function je({ item: n, isActive: r, onSelect: a, onPiP: u, onNewTab: c }) {
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
function Dt({
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
function ht({ docPath: n, className: r = "" }) {
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
const nt = `
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
function We(n, r) {
  if (n.startsWith("/")) return n;
  const a = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/";
  try {
    return new URL(n, "http://d" + a).pathname;
  } catch {
    return a + n;
  }
}
function ft({
  defaultDocPath: n,
  sidebarPath: r,
  onSidebarNavigate: a,
  onSidebarAppNavigate: u,
  sidebarDefaultWidth: c = 400,
  sidebarMinWidth: i = 250,
  sidebarMaxWidth: g = 800,
  feedbackApiBaseUrl: h,
  feedbackUserType: f,
  feedbackAppVersion: E,
  feedbackAdminUrl: x,
  feedbackDefaultHeight: z = 350,
  feedbackMinHeight: C = 200,
  feedbackMaxHeight: A = 600,
  onFeedbackSubmitSuccess: R,
  onFeedbackSubmitError: _,
  items: T,
  defaultExpandCategories: l,
  onAppNavigate: W
} = {}) {
  const [P, U] = v(null), { content: p, loading: s, error: y } = Ae(P), k = q(null), H = q(!1), [O, X] = v(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 767px)").matches);
  B(() => {
    if (typeof window > "u") return;
    const b = window.matchMedia("(max-width: 767px)"), N = (ne) => X(ne.matches);
    return b.addEventListener("change", N), () => b.removeEventListener("change", N);
  }, []);
  const [M, j] = v(!1), d = q(null), D = q(null), $ = q(null);
  B(() => {
    j(!1);
  }, [O]);
  const [L, Z] = v(!0), [ae, le] = v(400), [ue, he] = v(r ?? null);
  B(() => {
    a === void 0 && he(r ?? null);
  }, [r, a]);
  const oe = a !== void 0, ie = oe ? r ?? null : ue, {
    content: fe,
    loading: me,
    error: ye
  } = Ae(ie), { size: te, isResizing: Se, handleMouseDown: be, handleKeyDown: $e } = _e({
    defaultSize: c,
    minSize: i,
    maxSize: g
  }), Fe = r != null && h != null, ze = q(null), {
    size: S,
    isResizing: V,
    handleMouseDown: I,
    handleKeyDown: Q
  } = _e({
    defaultSize: z,
    minSize: C,
    maxSize: A,
    direction: "vertical",
    enabled: Fe && L
  });
  B(() => {
    Fe && L && le(S);
  }, [S, Fe, L]);
  const Y = ln(), ee = q(null), G = q(null), [re, ce] = v(null), de = q(!1);
  B(() => {
    ve() || Be();
  }, []), B(() => {
    ee.current && (ee.current.scrollTop = 0);
  }, [ie]), B(() => {
    de.current = !1;
  }, [P]), B(() => {
    s && (de.current = !0);
  }, [s]), B(() => {
    const b = G.current;
    if (!b || !p || !de.current) {
      ce(null);
      return;
    }
    const N = Array.from(
      b.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (N.length === 0) {
      ce(null);
      return;
    }
    const ne = /* @__PURE__ */ new Set(), xe = new IntersectionObserver(
      (ge) => {
        for (const se of ge) {
          const Me = se.target.id;
          se.isIntersecting ? ne.add(Me) : ne.delete(Me);
        }
        if (ne.size === 0) return;
        const De = N.find((se) => ne.has(se.id));
        De && ce((se) => se === De.id ? se : De.id);
      },
      {
        root: b,
        // ビューポート上部付近（上30%のライン）を基準に「読んでいる見出し」を判定する
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return N.forEach((ge) => xe.observe(ge)), ce(N[0].id), () => {
      xe.disconnect();
    };
  }, [p, P, s]);
  const Ce = r != null || h != null;
  B(() => {
    const N = new URLSearchParams(window.location.search).get("path");
    N ? U(N) : n && U(n);
  }, [n]);
  const pe = w((b) => {
    const N = `${window.location.pathname}?path=${encodeURIComponent(b)}`;
    window.history.pushState({}, "", N), U(b);
  }, []), Qe = w(
    (b) => {
      pe(We(b, P));
    },
    [P, pe]
  ), Re = w(
    (b) => {
      j(!1), pe(b);
    },
    [pe]
  ), Te = w(
    (b, N) => {
      var ne;
      if (j(!1), b === P) {
        (ne = document.getElementById(N)) == null || ne.scrollIntoView({ behavior: "smooth" });
        return;
      }
      k.current = { path: b, headingId: N }, pe(b);
    },
    [P, pe]
  );
  B(() => {
    const b = k.current;
    if (!b || b.path !== P) {
      H.current = !1;
      return;
    }
    if (s) {
      H.current = !0;
      return;
    }
    if (!H.current || !p) return;
    let N = !1, ne, xe = 0;
    const ge = () => {
      if (N) return;
      const De = document.getElementById(b.headingId);
      if (De) {
        De.scrollIntoView({ behavior: "smooth" }), k.current = null;
        return;
      }
      xe += 1, xe < 30 ? ne = requestAnimationFrame(ge) : k.current = null;
    };
    return ne = requestAnimationFrame(ge), () => {
      N = !0, cancelAnimationFrame(ne);
    };
  }, [p, P, s]);
  const en = w(
    (b) => {
      window.opener && !window.opener.closed ? window.opener.postMessage({ type: "manual-app-navigate", path: b }, window.location.origin) : W == null || W(b);
    },
    [W]
  ), nn = w(
    (b) => {
      const N = We(b, ie);
      oe ? a(N) : he(N);
    },
    [oe, a, ie]
  ), tn = w(
    (b) => {
      u == null || u(b);
    },
    [u]
  );
  return B(() => {
    const b = () => {
      const ne = new URLSearchParams(window.location.search).get("path");
      ne && U(ne), j(!1);
    };
    return window.addEventListener("popstate", b), () => window.removeEventListener("popstate", b);
  }, []), B(() => {
    if (!M) return;
    const b = (N) => {
      N.key === "Escape" && j(!1);
    };
    return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
  }, [M]), B(() => {
    d.current && (d.current.inert = !M);
  }, [M, O]), B(() => {
    var N;
    const b = !!T && O && M;
    D.current && (D.current.inert = b), $.current && ($.current.inert = b), b && ((N = d.current) == null || N.focus());
  }, [T, O, M]), /* @__PURE__ */ o(
    "div",
    {
      className: "manual-tab-page",
      style: {
        ...m.container,
        // items 未指定時は既存の見た目・挙動を一切変えない（docs/usage.md の互換性保証）。
        // items 指定時のみ container を height:100vh + overflow:hidden に固定し、
        // 常設サイドバー(tocPane)がビューポート内で独立スクロールできるようにする。
        ...T ? m.containerWithToc : m.containerLegacy
      },
      children: [
        /* @__PURE__ */ o("header", { ref: D, style: m.header, children: [
          /* @__PURE__ */ o("div", { style: m.headerLeft, children: [
            T && O && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => j((b) => !b),
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
            Y && x && /* @__PURE__ */ e(
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
          T && !O && /* @__PURE__ */ o("aside", { style: m.tocPane, children: [
            /* @__PURE__ */ o("div", { style: m.tocHeader, children: [
              /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px", color: t.tertiary }, children: "toc" }),
              /* @__PURE__ */ e("span", { style: m.sidebarTitle, children: "目次" })
            ] }),
            /* @__PURE__ */ e("div", { style: m.tocContent, children: /* @__PURE__ */ e(
              Ie,
              {
                items: T,
                activePath: P,
                onSelectPage: Re,
                onSelectHeading: Te,
                activeHeadingId: re,
                defaultExpandCategories: l
              }
            ) })
          ] }),
          T && O && /* @__PURE__ */ o(Ee, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `manual-toc-backdrop${M ? " manual-toc-backdrop-open" : ""}`,
                onClick: () => j(!1),
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
                        onClick: () => j(!1),
                        className: "manual-toc-panel-close",
                        "aria-label": "目次を閉じる",
                        children: /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "20px" }, children: "close" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("div", { className: "manual-toc-panel-content", children: /* @__PURE__ */ e(
                    Ie,
                    {
                      items: T,
                      activePath: P,
                      onSelectPage: Re,
                      onSelectHeading: Te,
                      activeHeadingId: re,
                      defaultExpandCategories: l
                    }
                  ) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("div", { ref: $, style: { display: "contents" }, children: [
            /* @__PURE__ */ e("main", { ref: G, style: m.mainPane, children: /* @__PURE__ */ o("div", { style: m.mainContent, children: [
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
                  onLinkClick: Qe,
                  onAppLinkClick: en
                }
              ),
              !s && !y && !p && !P && /* @__PURE__ */ o("div", { style: m.empty, children: [
                /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "64px", opacity: 0.5 }, children: "description" }),
                /* @__PURE__ */ e("span", { children: "マニュアルが指定されていません" })
              ] })
            ] }) }),
            Ce && /* @__PURE__ */ o(Ee, { children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `manual-resize-handle${Se ? " resizing" : ""}`,
                  onMouseDown: be,
                  onKeyDown: $e,
                  style: m.resizeHandle,
                  role: "separator",
                  "aria-orientation": "vertical",
                  "aria-valuenow": te,
                  "aria-valuemin": i,
                  "aria-valuemax": g,
                  "aria-label": "サイドバーのリサイズ",
                  tabIndex: 0
                }
              ),
              /* @__PURE__ */ o("aside", { style: { ...m.sidebarPane, width: te }, children: [
                r != null && /* @__PURE__ */ o(
                  "div",
                  {
                    ref: ze,
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      flex: h && L ? `0 0 ${ae}px` : 1,
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ o("div", { style: m.sidebarHeader, children: [
                        !oe && ue !== r && /* @__PURE__ */ e(
                          "button",
                          {
                            onClick: () => he(r ?? null),
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
                          ref: ee,
                          style: m.sidebarContent,
                          children: [
                            me && /* @__PURE__ */ o("div", { style: m.loading, children: [
                              /* @__PURE__ */ e("span", { style: { ...m.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                              /* @__PURE__ */ e("span", { children: "読み込み中..." })
                            ] }),
                            ye && /* @__PURE__ */ o("div", { style: m.error, children: [
                              /* @__PURE__ */ e("span", { style: m.icon, children: "warning" }),
                              /* @__PURE__ */ o("div", { children: [
                                /* @__PURE__ */ e("div", { style: m.errorTitle, children: "エラー" }),
                                /* @__PURE__ */ e("div", { style: m.errorDetail, children: ye.message })
                              ] })
                            ] }),
                            fe && /* @__PURE__ */ e(
                              we,
                              {
                                content: fe,
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
                r && h && L && /* @__PURE__ */ e(
                  "div",
                  {
                    className: `manual-v-resize-handle${V ? " resizing" : ""}`,
                    onMouseDown: I,
                    onKeyDown: Q,
                    style: m.vResizeHandle,
                    role: "separator",
                    "aria-orientation": "horizontal",
                    "aria-valuenow": ae,
                    "aria-valuemin": 150,
                    "aria-valuemax": 800,
                    "aria-label": "TOC領域のリサイズ",
                    tabIndex: 0
                  }
                ),
                h != null && /* @__PURE__ */ o(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      height: L ? r ? "auto" : "100%" : "auto",
                      flex: L && !r ? 1 : L ? "1 1 0" : "0 0 auto",
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
                            onClick: () => Z(!L),
                            style: m.toggleBtn,
                            onMouseEnter: (b) => {
                              b.currentTarget.style.backgroundColor = t.gray100, b.currentTarget.style.borderColor = t.gray700;
                            },
                            onMouseLeave: (b) => {
                              b.currentTarget.style.backgroundColor = "transparent", b.currentTarget.style.borderColor = t.gray300;
                            },
                            "aria-label": L ? "フィードバックを閉じる" : "フィードバックを開く",
                            title: L ? "フィードバックを閉じる" : "フィードバックを開く",
                            children: [
                              /* @__PURE__ */ e("span", { style: { ...m.icon, fontSize: "18px" }, children: L ? "expand_less" : "expand_more" }),
                              /* @__PURE__ */ e("span", { children: L ? "閉じる" : "開く" })
                            ]
                          }
                        )
                      ] }),
                      L && /* @__PURE__ */ e("div", { style: m.feedbackContent, children: /* @__PURE__ */ e(
                        Ze,
                        {
                          apiBaseUrl: h,
                          userType: f,
                          appVersion: E,
                          onSubmitSuccess: R,
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
        /* @__PURE__ */ e("style", { children: nt })
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
}, qe = {
  bug: { label: "不具合", color: "#DC2626" },
  question: { label: "質問", color: "#2563EB" },
  request: { label: "要望", color: "#059669" },
  share: { label: "共有", color: "#6B7280" },
  other: { label: "その他", color: "#9333EA" }
}, Ke = {
  app: "アプリ",
  manual: "マニュアル"
}, tt = {
  open: { label: "open", color: "#F59E0B" },
  in_progress: { label: "対応中", color: "#2563EB" },
  closed: { label: "完了", color: "#059669" }
};
function mt({ apiBaseUrl: n, adminKey: r }) {
  var j;
  const {
    feedbacks: a,
    total: u,
    page: c,
    limit: i,
    loading: g,
    error: h,
    filters: f,
    customTags: E,
    setFilters: x,
    setPage: z,
    updateStatus: C,
    remove: A,
    refresh: R
  } = un({ apiBaseUrl: n, adminKey: r }), [_, T] = v(null), [l, W] = v(null), [P, U] = v(!1), [p, s] = v(null), y = q(0);
  B(() => {
    ve() || Be();
  }, []);
  const k = Math.max(1, Math.ceil(u / i)), H = w(async (d) => {
    if (_ === d) {
      T(null), W(null);
      return;
    }
    T(d), U(!0);
    const D = ++y.current;
    try {
      const $ = await hn({ apiBaseUrl: n, adminKey: r, id: d });
      if (y.current !== D) return;
      W($);
    } catch {
      if (y.current !== D) return;
      W(null);
    }
    y.current === D && U(!1);
  }, [_, n, r]), O = w(async (d) => {
    confirm("削除しますか？") && (await A(d), _ === d && (T(null), W(null)));
  }, [A, _]), X = w(async (d, D) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await fn({ apiBaseUrl: n, adminKey: r, feedbackId: d, attachmentId: D }), W(($) => {
          var L;
          return !$ || $.id !== d ? $ : {
            ...$,
            attachments: (L = $.attachments) == null ? void 0 : L.filter((Z) => Z.id !== D)
          };
        });
      } catch ($) {
        console.error("Failed to delete attachment:", $);
      }
  }, [n, r]), M = w((d) => {
    try {
      const D = new URL(n);
      return `${D.origin}${D.pathname.replace(/\/$/, "")}/attachments/${d}`;
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
          value: f.status,
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
          value: f.kind,
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
          value: f.target,
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
          value: f.customTag,
          onChange: (d) => x({ customTag: d.target.value }),
          style: F.select,
          "aria-label": "タグフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
            E.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d))
          ]
        }
      ),
      /* @__PURE__ */ e("button", { onClick: R, style: F.refreshBtn, "aria-label": "更新", children: /* @__PURE__ */ e("span", { style: F.iconSmall, children: "refresh" }) })
    ] }),
    h && /* @__PURE__ */ e("div", { style: F.error, role: "alert", children: h.message.slice(0, 200) }),
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
          var Z;
          const D = qe[d.kind] ?? { label: d.kind, color: "#6B7280" }, $ = tt[d.status] ?? { label: d.status, color: "#6B7280" }, L = _ === d.id;
          return /* @__PURE__ */ o("tr", { children: [
            /* @__PURE__ */ e("td", { style: F.td, children: /* @__PURE__ */ e(
              "button",
              {
                onClick: () => H(d.id),
                style: F.rowButton,
                "aria-expanded": L,
                "aria-controls": L ? `feedback-detail-${d.id}` : void 0,
                children: (Z = d.createdAt) == null ? void 0 : Z.slice(5, 16).replace("T", " ")
              }
            ) }),
            /* @__PURE__ */ e("td", { style: F.td, children: /* @__PURE__ */ e("span", { style: { ...F.badge, backgroundColor: D.color }, children: D.label }) }),
            /* @__PURE__ */ e("td", { style: F.td, children: d.target ? Ke[d.target] ?? d.target : "-" }),
            /* @__PURE__ */ e("td", { style: { ...F.td, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: d.message.slice(0, 80) }),
            /* @__PURE__ */ e("td", { style: F.td, children: /* @__PURE__ */ e("span", { style: { color: $.color, fontWeight: 600, fontSize: "12px" }, children: $.label }) }),
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
          (j = qe[l.kind]) == null ? void 0 : j.label
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "対象:" }),
          " ",
          l.target ? Ke[l.target] : "-"
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
              onClick: () => X(l.id, d.id),
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
        /* @__PURE__ */ e("button", { onClick: () => O(l.id), style: F.deleteBtn, children: "削除" })
      ] })
    ] }) : /* @__PURE__ */ e("div", { children: "詳細の取得に失敗しました" }) }),
    k > 1 && /* @__PURE__ */ o("div", { style: F.pagination, children: [
      /* @__PURE__ */ e("button", { onClick: () => z(c - 1), disabled: c <= 1, style: F.pageBtn, "aria-label": "前のページ", children: "◀" }),
      /* @__PURE__ */ o("span", { style: F.pageInfo, children: [
        c,
        " / ",
        k
      ] }),
      /* @__PURE__ */ e("button", { onClick: () => z(c + 1), disabled: c >= k, style: F.pageBtn, "aria-label": "次のページ", children: "▶" })
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
  Le as D,
  mt as F,
  xn as I,
  t as M,
  Ze as a,
  Je as b,
  Dt as c,
  ht as d,
  pt as e,
  gt as f,
  ft as g,
  Ie as h,
  we as i,
  ve as j,
  Be as l,
  Wn as m,
  Xn as u
};
