import { jsxs as o, jsx as e, Fragment as ye } from "react/jsx-runtime";
import { useState as z, useRef as q, useCallback as v, useEffect as $, useMemo as We } from "react";
import { createPortal as nn } from "react-dom";
import { u as tn, d as be, c as rn, e as Re, b as on, a as an } from "./useFeedbackAdminMode-DpbrwKWq.js";
import ln from "react-markdown";
import un from "remark-gfm";
import sn from "rehype-raw";
import { c as cn } from "./feedbackLogCapture-DUBfVREg.js";
import { l as dn, h as pn, i as gn } from "./feedbackApi-BAwJP8AU.js";
const Se = {
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
}, Me = ["image/png", "image/jpeg", "image/webp", "image/gif"], Dn = 5, hn = 5 * 1024 * 1024;
function fn({
  files: t,
  onAdd: r,
  onRemove: i,
  maxFiles: l = Dn,
  maxFileSize: u = hn,
  disabled: a = !1,
  pipDocument: g
}) {
  const [h, m] = z(!1), [A, y] = z(null), L = q(null), C = q(0), E = v((s) => {
    y(null);
    const k = l - t.length;
    if (k <= 0) {
      y(`最大${l}枚まで添付できます`);
      return;
    }
    const B = [];
    for (const j of s) {
      if (B.length >= k) break;
      if (!Me.includes(j.type)) {
        y(`${j.name}: 対応していない形式です（PNG/JPEG/WebP/GIF）`);
        continue;
      }
      if (j.size > u) {
        y(`${j.name}: ファイルサイズが大きすぎます（最大5MB）`);
        continue;
      }
      B.push(j);
    }
    B.length > 0 && r(B);
  }, [t.length, l, u, r]), M = v((s) => {
    var j;
    if (a) return;
    const k = (j = s.clipboardData) == null ? void 0 : j.items;
    if (!k) return;
    const B = [];
    for (let I = 0; I < k.length; I++) {
      const _ = k[I];
      if (_.kind === "file" && Me.includes(_.type)) {
        const N = _.getAsFile();
        N && B.push(N);
      }
    }
    B.length > 0 && (s.preventDefault(), E(B));
  }, [a, E]);
  $(() => (document.addEventListener("paste", M), g == null || g.addEventListener("paste", M), () => {
    document.removeEventListener("paste", M), g == null || g.removeEventListener("paste", M);
  }), [M, g]);
  const T = v((s) => {
    s.preventDefault(), s.stopPropagation(), C.current++, C.current === 1 && m(!0);
  }, []), d = v((s) => {
    s.preventDefault(), s.stopPropagation(), C.current--, C.current === 0 && m(!1);
  }, []), f = v((s) => {
    s.preventDefault(), s.stopPropagation();
  }, []), H = v((s) => {
    if (s.preventDefault(), s.stopPropagation(), C.current = 0, m(!1), a) return;
    const k = Array.from(s.dataTransfer.files);
    E(k);
  }, [a, E]), K = v(() => {
    var s;
    a || (s = L.current) == null || s.click();
  }, [a]), D = v((s) => {
    const k = s.target.files ? Array.from(s.target.files) : [];
    k.length > 0 && E(k), L.current && (L.current.value = "");
  }, [E]), w = (s) => s < 1024 ? `${s}B` : s < 1024 * 1024 ? `${(s / 1024).toFixed(0)}KB` : `${(s / (1024 * 1024)).toFixed(1)}MB`;
  return /* @__PURE__ */ o("div", { className: "debug-field", children: [
    /* @__PURE__ */ o("label", { children: [
      "画像添付（",
      t.length,
      "/",
      l,
      "）"
    ] }),
    /* @__PURE__ */ o(
      "div",
      {
        className: `debug-dropzone ${h ? "dragging" : ""} ${a ? "disabled" : ""}`,
        onDragEnter: T,
        onDragLeave: d,
        onDragOver: f,
        onDrop: H,
        onClick: K,
        role: "button",
        tabIndex: 0,
        onKeyDown: (s) => {
          (s.key === "Enter" || s.key === " ") && K();
        },
        children: [
          /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "24px", color: Se.gray500 }, children: h ? "file_download" : "add_photo_alternate" }),
          /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: Se.gray500 }, children: h ? "ドロップして追加" : "クリック / ドラッグ / Ctrl+V で画像を追加" })
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
        onChange: D
      }
    ),
    A && /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: Se.error }, children: A }),
    t.length > 0 && /* @__PURE__ */ e("div", { className: "debug-thumbnails", children: t.map((s, k) => /* @__PURE__ */ e(
      mn,
      {
        file: s,
        onRemove: () => i(k),
        formatSize: w
      },
      `${s.name}-${s.size}-${k}`
    )) })
  ] });
}
function mn({ file: t, onRemove: r, formatSize: i }) {
  const [l, u] = z(null);
  return $(() => {
    const a = URL.createObjectURL(t);
    return u(a), () => URL.revokeObjectURL(a);
  }, [t]), /* @__PURE__ */ o("div", { className: "debug-thumbnail", children: [
    l && /* @__PURE__ */ e("img", { src: l, alt: t.name, className: "debug-thumbnail-img" }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "debug-thumbnail-remove",
        onClick: (a) => {
          a.stopPropagation(), r();
        },
        "aria-label": "削除",
        children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "close" })
      }
    ),
    /* @__PURE__ */ e("div", { className: "debug-thumbnail-info", children: i(t.size) })
  ] });
}
const Fn = /[\0-\x1F!-,\.\/:-@\[-\^`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482\u0530\u0557\u0558\u055A-\u055F\u0589-\u0590\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EE\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06DE\u06E9\u06FD\u06FE\u0700-\u070F\u074B\u074C\u07B2-\u07BF\u07F6-\u07F9\u07FB\u07FC\u07FE\u07FF\u082E-\u083F\u085C-\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u08E2\u0964\u0965\u0970\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09F2-\u09FB\u09FD\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF0-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B70\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BF0-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D4F-\u0D53\u0D58-\u0D5E\u0D64\u0D65\u0D70-\u0D79\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3F\u0E4F\u0E5A-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F48\u0F6D-\u0F70\u0F85\u0F98\u0FBD-\u0FC5\u0FC7-\u0FFF\u104A-\u104F\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u1360-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1715-\u171F\u1735-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17D4-\u17D6\u17D8-\u17DB\u17DE\u17DF\u17EA-\u180A\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u1945\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DA-\u19FF\u1A1C-\u1A1F\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1AA6\u1AA8-\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B5A-\u1B6A\u1B74-\u1B7F\u1BF4-\u1BFF\u1C38-\u1C3F\u1C4A-\u1C4C\u1C7E\u1C7F\u1C89-\u1C8F\u1CBB\u1CBC\u1CC0-\u1CCF\u1CD3\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u203E\u2041-\u2053\u2055-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u20CF\u20F1-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u215F\u2189-\u24B5\u24EA-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u3004\u3008-\u3020\u3030\u3036\u3037\u303D-\u3040\u3097\u3098\u309B\u309C\u30A0\u30FB\u3100-\u3104\u3130\u318F-\u319F\u31C0-\u31EF\u3200-\u33FF\u4DC0-\u4DFF\u9FFD-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA62C-\uA63F\uA673\uA67E\uA6F2-\uA716\uA720\uA721\uA789\uA78A\uA7C0\uA7C1\uA7CB-\uA7F4\uA828-\uA82B\uA82D-\uA83F\uA874-\uA87F\uA8C6-\uA8CF\uA8DA-\uA8DF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA954-\uA95F\uA97D-\uA97F\uA9C1-\uA9CE\uA9DA-\uA9DF\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A-\uAA5F\uAA77-\uAA79\uAAC3-\uAADA\uAADE\uAADF\uAAF0\uAAF1\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB6A-\uAB6F\uABEB\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uE000-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFDFF\uFE10-\uFE1F\uFE30-\uFE32\uFE35-\uFE4C\uFE50-\uFE6F\uFE75\uFEFD-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF3E\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF]|\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDD3F\uDD75-\uDDFC\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEE1-\uDEFF\uDF20-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDF9F\uDFC4-\uDFC7\uDFD0\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56-\uDC5F\uDC77-\uDC7F\uDC9F-\uDCDF\uDCF3\uDCF6-\uDCFF\uDD16-\uDD1F\uDD3A-\uDD7F\uDDB8-\uDDBD\uDDC0-\uDDFF\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE40-\uDE5F\uDE7D-\uDE7F\uDE9D-\uDEBF\uDEC8\uDEE7-\uDEFF\uDF36-\uDF3F\uDF56-\uDF5F\uDF73-\uDF7F\uDF92-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCFF\uDD28-\uDD2F\uDD3A-\uDE7F\uDEAA\uDEAD-\uDEAF\uDEB2-\uDEFF\uDF1D-\uDF26\uDF28-\uDF2F\uDF51-\uDFAF\uDFC5-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC47-\uDC65\uDC70-\uDC7E\uDCBB-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD40-\uDD43\uDD48-\uDD4F\uDD74\uDD75\uDD77-\uDD7F\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDFF\uDE12\uDE38-\uDE3D\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEA9-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC4B-\uDC4F\uDC5A-\uDC5D\uDC62-\uDC7F\uDCC6\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDC1-\uDDD7\uDDDE-\uDDFF\uDE41-\uDE43\uDE45-\uDE4F\uDE5A-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF3A-\uDFFF]|\uD806[\uDC3B-\uDC9F\uDCEA-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD44-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE2\uDDE5-\uDDFF\uDE3F-\uDE46\uDE48-\uDE4F\uDE9A-\uDE9C\uDE9E-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC41-\uDC4F\uDC5A-\uDC71\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF7-\uDFAF\uDFB1-\uDFFF]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83D\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDECF\uDEEE\uDEEF\uDEF5-\uDEFF\uDF37-\uDF3F\uDF44-\uDF4F\uDF5A-\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE80-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE2\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A-\uDC9C\uDC9F-\uDFFF]|\uD834[\uDC00-\uDD64\uDD6A-\uDD6C\uDD73-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDE41\uDE45-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3\uDFCC\uDFCD]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD4F-\uDEBF\uDEFA-\uDFFF]|\uD83A[\uDCC5-\uDCCF\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDFFF]|\uD83B[\uDC00-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDFFF]|\uD83C[\uDC00-\uDD2F\uDD4A-\uDD4F\uDD6A-\uDD6F\uDD8A-\uDFFF]|\uD83E[\uDC00-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]/g, xn = Object.hasOwnProperty;
class qe {
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
    let u = yn(r, i === !0);
    const a = u;
    for (; xn.call(l.occurrences, u); )
      l.occurrences[a]++, u = a + "-" + l.occurrences[a];
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
function yn(t, r) {
  return typeof t != "string" ? "" : (r || (t = t.toLowerCase()), t.replace(Fn, "").replace(/ /g, "-"));
}
function bn(t) {
  const r = t.type === "element" ? t.tagName.toLowerCase() : "", i = r.length === 2 && r.charCodeAt(0) === 104 ? r.charCodeAt(1) : 0;
  return i > 48 && i < 55 ? i - 48 : void 0;
}
function Cn(t) {
  return "children" in t ? Ke(t) : "value" in t ? t.value : "";
}
function En(t) {
  return t.type === "text" ? t.value : "children" in t ? Ke(t) : "";
}
function Ke(t) {
  let r = -1;
  const i = [];
  for (; ++r < t.children.length; )
    i[r] = En(t.children[r]);
  return i.join("");
}
const Ge = (
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
  (function(t) {
    if (t == null)
      return Bn;
    if (typeof t == "function")
      return Ee(t);
    if (typeof t == "object")
      return Array.isArray(t) ? An(t) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        wn(
          /** @type {Props} */
          t
        )
      );
    if (typeof t == "string")
      return kn(t);
    throw new Error("Expected function, string, or object as test");
  })
);
function An(t) {
  const r = [];
  let i = -1;
  for (; ++i < t.length; )
    r[i] = Ge(t[i]);
  return Ee(l);
  function l(...u) {
    let a = -1;
    for (; ++a < r.length; )
      if (r[a].apply(this, u)) return !0;
    return !1;
  }
}
function wn(t) {
  const r = (
    /** @type {Record<string, unknown>} */
    t
  );
  return Ee(i);
  function i(l) {
    const u = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      l
    );
    let a;
    for (a in t)
      if (u[a] !== r[a]) return !1;
    return !0;
  }
}
function kn(t) {
  return Ee(r);
  function r(i) {
    return i && i.type === t;
  }
}
function Ee(t) {
  return r;
  function r(i, l, u) {
    return !!(vn(i) && t.call(
      this,
      i,
      typeof l == "number" ? l : void 0,
      u || void 0
    ));
  }
}
function Bn() {
  return !0;
}
function vn(t) {
  return t !== null && typeof t == "object" && "type" in t;
}
const Ve = [], Sn = !0, Te = !1, $n = "skip";
function zn(t, r, i, l) {
  let u;
  typeof r == "function" && typeof i != "function" ? (l = i, i = r) : u = r;
  const a = Ge(u), g = l ? -1 : 1;
  h(t, void 0, [])();
  function h(m, A, y) {
    const L = (
      /** @type {Record<string, unknown>} */
      m && typeof m == "object" ? m : {}
    );
    if (typeof L.type == "string") {
      const E = (
        // `hast`
        typeof L.tagName == "string" ? L.tagName : (
          // `xast`
          typeof L.name == "string" ? L.name : void 0
        )
      );
      Object.defineProperty(C, "name", {
        value: "node (" + (m.type + (E ? "<" + E + ">" : "")) + ")"
      });
    }
    return C;
    function C() {
      let E = Ve, M, T, d;
      if ((!r || a(m, A, y[y.length - 1] || void 0)) && (E = Ln(i(m, y)), E[0] === Te))
        return E;
      if ("children" in m && m.children) {
        const f = (
          /** @type {UnistParent} */
          m
        );
        if (f.children && E[0] !== $n)
          for (T = (l ? f.children.length : -1) + g, d = y.concat(f); T > -1 && T < f.children.length; ) {
            const H = f.children[T];
            if (M = h(H, T, d)(), M[0] === Te)
              return M;
            T = typeof M[1] == "number" ? M[1] : T + g;
          }
      }
      return E;
    }
  }
}
function Ln(t) {
  return Array.isArray(t) ? t : typeof t == "number" ? [Sn, t] : t == null ? Ve : [t];
}
function In(t, r, i, l) {
  let u, a, g;
  a = r, g = i, u = l, zn(t, a, h, u);
  function h(m, A) {
    const y = A[A.length - 1], L = y ? y.children.indexOf(m) : void 0;
    return g(m, L, y);
  }
}
const Rn = {}, _e = new qe();
function Mn(t) {
  const i = (t || Rn).prefix || "";
  return function(l) {
    _e.reset(), In(l, "element", function(u) {
      bn(u) && !u.properties.id && (u.properties.id = i + _e.slug(Cn(u)));
    });
  };
}
const Tn = `
:where(.manual-markdown) {
  color: ${n.gray700};
}

:where(.manual-markdown h1) {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${n.primary};
  border-bottom: 2px solid ${n.secondary};
  padding-bottom: 8px;
}

:where(.manual-markdown h2) {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${n.tertiary};
}

:where(.manual-markdown h3) {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${n.gray700};
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
  color: ${n.primary};
  text-decoration: underline;
  cursor: pointer;
}

:where(.manual-markdown a:hover) {
  color: ${n.tertiary};
}

:where(.manual-markdown code) {
  background: ${n.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

:where(.manual-markdown pre) {
  background: ${n.gray100};
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
  border: 1px solid ${n.gray300};
  padding: 8px 12px;
  text-align: left;
}

:where(.manual-markdown th) {
  background: ${n.gray100};
  font-weight: 600;
}

:where(.manual-markdown hr) {
  border: none;
  border-top: 1px solid ${n.gray300};
  margin: 24px 0;
}

:where(.manual-markdown blockquote) {
  border-left: 4px solid ${n.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${n.gray500};
}

:where(.manual-markdown img) {
  max-width: 100%;
  height: auto;
}
`;
function Ce({
  content: t,
  className: r = "",
  onLinkClick: i,
  onAppLinkClick: l
}) {
  const u = {
    a: ({ href: a, children: g, ...h }) => {
      if (a && a.startsWith("app:") && l) {
        const m = a.replace("app:", "");
        return /* @__PURE__ */ e(
          "span",
          {
            role: "link",
            tabIndex: 0,
            onClick: (A) => {
              A.preventDefault(), A.stopPropagation(), l(m);
            },
            onKeyDown: (A) => {
              (A.key === "Enter" || A.key === " ") && (A.preventDefault(), l(m));
            },
            style: {
              color: "#043E80",
              textDecoration: "underline",
              cursor: "pointer"
            },
            ...h,
            children: g
          }
        );
      }
      return a && /\.md(#|$|\?)/.test(a) && i ? /* @__PURE__ */ e(
        "a",
        {
          href: a,
          onClick: (m) => {
            m.preventDefault(), i(a);
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
          href: a,
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
    /* @__PURE__ */ e("style", { children: Tn }),
    /* @__PURE__ */ e(ln, { remarkPlugins: [un], rehypePlugins: [sn, Mn], components: u, children: t })
  ] });
}
const Ue = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap", _n = `
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
function Ae(t = !1) {
  if (typeof document > "u")
    return !1;
  const r = document.querySelector('link[href*="Material+Symbols"]');
  if (r && !t)
    return !1;
  r && t && r.remove();
  const i = document.createElement("link");
  return i.rel = "stylesheet", i.href = Ue, document.head.appendChild(i), !0;
}
function we() {
  return typeof window < "u" && window.__MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__ === !0;
}
const Pn = [
  { value: "bug", label: "不具合", color: "#DC2626" },
  { value: "question", label: "質問", color: "#2563EB" },
  { value: "request", label: "要望", color: "#059669" },
  { value: "share", label: "共有", color: "#6B7280" },
  { value: "other", label: "その他", color: "#9333EA" }
], Hn = `
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
function Xe({
  apiBaseUrl: t,
  userType: r,
  appVersion: i,
  onSubmitSuccess: l,
  onSubmitError: u
}) {
  const { submitting: a, submitFeedback: g } = tn({
    apiBaseUrl: t,
    userType: r,
    appVersion: i
  });
  $(() => {
    we() || Ae();
  }, []);
  const h = q(null);
  $(() => {
    try {
      const c = cn({
        // フィードバックAPI自身への fetch を除外（無限ループ防止）
        networkExclude: [t]
      });
      return h.current = c, () => {
        c.destroy(), h.current = null;
      };
    } catch (c) {
      return console.error("Failed to create log capture:", c), () => {
      };
    }
  }, [t]);
  const [m, A] = z(null), [y, L] = z(""), [C, E] = z(!1), [M, T] = z(""), [d, f] = z(""), [H, K] = z([]), [D, w] = z(!1), [s, k] = z(null), B = q(), j = q(!1);
  $(() => () => {
    B.current && clearTimeout(B.current);
  }, []);
  const I = m !== null && y.trim() !== "" && !a, _ = v(async () => {
    var oe;
    if (!m || !y.trim() || j.current) return;
    j.current = !0;
    let c = y.trim();
    (M.trim() || d.trim()) && (c += `

---`, M.trim() && (c += `
再現手順:
${M.trim()}`), d.trim() && (c += `
期待結果:
${d.trim()}`));
    const O = m === "bug" && h.current ? {
      consoleLogs: h.current.getConsoleLogs(),
      networkLogs: h.current.getNetworkLogs()
    } : void 0, { data: Y, error: ee } = await g({
      kind: m,
      message: c
    }, O);
    if (Y) {
      if (H.length > 0)
        for (const ie of H)
          try {
            await dn({
              apiBaseUrl: t,
              feedbackId: Y.id,
              file: ie
            });
          } catch (te) {
            console.error("Failed to upload attachment:", te);
          }
      A(null), L(""), T(""), f(""), E(!1), K([]), k(null), (oe = h.current) == null || oe.clear(), w(!0), B.current && clearTimeout(B.current), B.current = setTimeout(() => w(!1), 3e3), l == null || l(Y);
    } else
      k(ee), u == null || u(ee ?? new Error("Unknown error"));
    j.current = !1;
  }, [m, y, M, d, H, t, g, l, u]), N = v(
    (c) => {
      (c.metaKey || c.ctrlKey) && c.key === "Enter" && I && (c.preventDefault(), _());
    },
    [I, _]
  ), Z = v((c) => {
    K((O) => [...O, ...c]);
  }, []), p = v((c) => {
    K((O) => O.filter((Y, ee) => ee !== c));
  }, []);
  return /* @__PURE__ */ o("div", { style: W.container, children: [
    /* @__PURE__ */ e("style", { children: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }${Hn}` }),
    /* @__PURE__ */ o("div", { style: W.section, children: [
      /* @__PURE__ */ e("div", { style: W.tagGroup, role: "radiogroup", "aria-label": "フィードバック種別", children: Pn.map((c) => /* @__PURE__ */ e(
        "button",
        {
          role: "radio",
          "aria-checked": m === c.value,
          onClick: () => A(m === c.value ? null : c.value),
          style: {
            ...W.tag,
            ...m === c.value ? { backgroundColor: c.color, color: "#fff", borderColor: c.color } : { borderColor: "#D1D5DB", color: "#6B7280" }
          },
          children: c.label
        },
        c.value
      )) }),
      /* @__PURE__ */ e("div", { style: W.tagHint, children: "どれか一つを選んでください" })
    ] }),
    /* @__PURE__ */ e("div", { style: W.section, children: /* @__PURE__ */ e(
      "textarea",
      {
        value: y,
        onChange: (c) => L(c.target.value),
        onKeyDown: N,
        placeholder: "気づいたことをそのまま書いてください（一言でもOK）",
        "aria-label": "フィードバックメッセージ",
        rows: 4,
        maxLength: 4e3,
        style: W.textarea
      }
    ) }),
    /* @__PURE__ */ e("div", { style: W.section, children: /* @__PURE__ */ e(
      fn,
      {
        files: H,
        onAdd: Z,
        onRemove: p,
        maxFiles: 3,
        disabled: a
      }
    ) }),
    m === "bug" && /* @__PURE__ */ o("div", { style: W.logNotice, children: [
      /* @__PURE__ */ e("span", { style: W.iconSmall, children: "info" }),
      "不具合タグを選択すると、直前の動作ログが自動で添付されます"
    ] }),
    /* @__PURE__ */ o("div", { style: W.section, children: [
      /* @__PURE__ */ o("button", { onClick: () => E(!C), style: W.detailToggle, "aria-expanded": C, children: [
        /* @__PURE__ */ e("span", { style: W.iconSmall, children: C ? "expand_less" : "expand_more" }),
        "詳細情報（任意）"
      ] }),
      C && /* @__PURE__ */ o("div", { style: W.detailArea, children: [
        /* @__PURE__ */ e("label", { style: W.label, children: "再現手順:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: M,
            onChange: (c) => T(c.target.value),
            "aria-label": "再現手順",
            rows: 2,
            style: W.textarea
          }
        ),
        /* @__PURE__ */ e("label", { style: { ...W.label, marginTop: "8px" }, children: "期待結果:" }),
        /* @__PURE__ */ e(
          "textarea",
          {
            value: d,
            onChange: (c) => f(c.target.value),
            "aria-label": "期待結果",
            rows: 2,
            style: W.textarea
          }
        )
      ] })
    ] }),
    s && /* @__PURE__ */ o("div", { style: W.errorMsg, role: "alert", children: [
      /* @__PURE__ */ e("span", { style: W.iconSmall, children: "warning" }),
      s.message.slice(0, 200)
    ] }),
    /* @__PURE__ */ e("div", { style: W.submitRow, children: /* @__PURE__ */ e("button", { onClick: _, disabled: !I, style: {
      ...W.submitButton,
      opacity: I ? 1 : 0.5,
      cursor: I ? "pointer" : "not-allowed"
    }, children: a ? /* @__PURE__ */ e("span", { style: { ...W.iconSmall, animation: "spin 1s linear infinite" }, children: "progress_activity" }) : "送信" }) }),
    D && /* @__PURE__ */ e("div", { style: W.toast, role: "status", children: "送信しました" })
  ] });
}
const W = {
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
function Nn(t) {
  return t.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1").replace(/!\[([^\]]*)\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
}
function On(t) {
  return t.replace(/(?:^|[ \t])#+[ \t]*$/, "").trim();
}
function jn(t) {
  const r = new qe(), i = [], l = t.split(/\r?\n/);
  let u = null;
  for (const a of l) {
    const g = /^(`{3,}|~{3,})/.exec(a.trim());
    if (g) {
      const C = g[1][0];
      u === null ? u = C : u === C && (u = null);
      continue;
    }
    if (u) continue;
    let h = null, m = "";
    const A = /^ {0,3}(#{2,3})(?:[ \t]+(.*))?$/.exec(a);
    if (A)
      h = A[1].length, m = On((A[2] ?? "").trim());
    else {
      const C = /^\s{0,3}<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>\s*$/i.exec(a);
      C && (h = Number(C[1]), m = C[2].replace(/<[^>]+>/g, "").trim());
    }
    if (h === null) continue;
    const y = Nn(m);
    if (!y) continue;
    const L = r.slug(y);
    i.push({ id: L, text: y, level: h });
  }
  return i;
}
function Wn() {
  const [t, r] = z({}), [i, l] = z({}), [u, a] = z({}), g = q(/* @__PURE__ */ new Set()), h = q(!0);
  $(() => (h.current = !0, () => {
    h.current = !1;
  }), []);
  const m = v((C) => t[C], [t]), A = v((C) => i[C] ?? !1, [i]), y = v((C) => u[C] ?? null, [u]), L = v(async (C) => {
    if (!g.current.has(C)) {
      g.current.add(C), l((E) => ({ ...E, [C]: !0 })), a((E) => ({ ...E, [C]: null }));
      try {
        const E = await fetch(C);
        if (!E.ok)
          throw new Error(`Failed to load: ${E.status} ${E.statusText}`);
        const M = await E.text(), T = jn(M);
        if (!h.current) return;
        r((d) => ({ ...d, [C]: T }));
      } catch (E) {
        if (g.current.delete(C), !h.current) return;
        a((M) => ({
          ...M,
          [C]: E instanceof Error ? E : new Error(String(E))
        }));
      } finally {
        h.current && l((E) => ({ ...E, [C]: !1 }));
      }
    }
  }, []);
  return { getHeadings: m, loadHeadings: L, isLoading: A, getError: y };
}
function qn(t) {
  const r = {}, i = [], l = [...t].sort((a, g) => (a.order ?? 0) - (g.order ?? 0));
  for (const a of l)
    a.category ? (r[a.category] || (r[a.category] = []), r[a.category].push(a)) : i.push(a);
  return { groups: Object.entries(r).map(([a, g]) => ({
    category: a,
    items: g
  })), uncategorized: i };
}
function Pe(t, r) {
  var i;
  return r ? ((i = t.find((l) => l.path === r)) == null ? void 0 : i.category) ?? null : null;
}
function Kn(t) {
  return t.replace(/\s+/g, "-");
}
function $e({
  items: t,
  activePath: r,
  onSelectPage: i,
  onSelectHeading: l,
  activeHeadingId: u = null,
  className: a = ""
}) {
  const { groups: g, uncategorized: h } = We(() => qn(t), [t]), { getHeadings: m, loadHeadings: A, isLoading: y, getError: L } = Wn(), [C, E] = z(() => {
    const D = Pe(t, r), w = {};
    for (const s of g)
      w[s.category] = s.category === D;
    return w;
  });
  $(() => {
    const D = Pe(t, r);
    D && E((w) => w[D] ? w : { ...w, [D]: !0 });
  }, [r, t]);
  const [M, T] = z({}), d = q(/* @__PURE__ */ new Set()), f = v((D) => {
    E((w) => ({ ...w, [D]: !w[D] }));
  }, []), H = v(
    (D) => {
      T((w) => {
        const s = !(w[D] ?? !1);
        return s ? (A(D), d.current.delete(D)) : d.current.add(D), { ...w, [D]: s };
      });
    },
    [A]
  );
  $(() => {
    !u || !r || d.current.has(r) || (A(r), T((D) => D[r] ? D : { ...D, [r]: !0 }));
  }, [u, r, A]);
  const K = (D) => {
    const w = r === D.path, s = M[D.path] ?? !1, k = m(D.path), B = y(D.path), j = L(D.path), I = `manual-toc-headings-${Kn(D.id)}`;
    return /* @__PURE__ */ o("li", { children: [
      /* @__PURE__ */ o("div", { style: J.pageRow, children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              i(D.path), H(D.path);
            },
            "aria-expanded": s,
            "aria-controls": I,
            style: {
              ...J.pageButton,
              background: w ? "#e3f2fd" : "transparent",
              color: w ? n.primary : n.gray700,
              borderLeft: w ? `3px solid ${n.primary}` : "3px solid transparent"
            },
            children: D.title
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => H(D.path),
            style: J.toggleHeadingsButton,
            "aria-expanded": s,
            "aria-controls": I,
            "aria-label": s ? `${D.title} の見出しを閉じる` : `${D.title} の見出しを開く`,
            title: s ? "見出しを閉じる" : "見出しを開く",
            children: /* @__PURE__ */ e("span", { style: J.chevronIcon, children: s ? "expand_less" : "expand_more" })
          }
        )
      ] }),
      s && /* @__PURE__ */ o("ul", { id: I, style: J.headingList, role: "group", children: [
        B && /* @__PURE__ */ e("li", { style: J.headingStatus, children: "読み込み中..." }),
        !B && j && /* @__PURE__ */ e("li", { style: { ...J.headingStatus, color: n.error }, children: "見出しの読み込みに失敗しました" }),
        !B && !j && k && k.length === 0 && /* @__PURE__ */ e("li", { style: J.headingStatus, children: "見出しなし" }),
        !B && !j && (k == null ? void 0 : k.map((_) => {
          const N = _.level === 3, Z = w && u === _.id;
          return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => l(D.path, _.id),
              style: {
                ...J.headingButton,
                paddingLeft: N ? "38px" : "20px",
                fontSize: N ? "12px" : "13px",
                color: Z ? n.primary : N ? n.gray500 : n.gray700,
                background: Z ? "#e3f2fd" : "transparent",
                borderLeft: Z ? `2px solid ${n.primary}` : "2px solid transparent",
                fontWeight: Z ? 600 : 400
              },
              children: [
                /* @__PURE__ */ e(
                  "span",
                  {
                    style: {
                      ...J.headingDot,
                      ...N ? J.headingDotSub : null,
                      ...Z ? { background: n.primary } : null
                    }
                  }
                ),
                /* @__PURE__ */ e("span", { style: J.headingText, children: _.text })
              ]
            }
          ) }, _.id);
        }))
      ] })
    ] }, D.id);
  };
  return /* @__PURE__ */ o("nav", { className: `manual-toc ${a}`, "aria-label": "マニュアル目次", style: J.nav, children: [
    h.length > 0 && /* @__PURE__ */ e("ul", { style: J.list, children: h.map(K) }),
    g.map((D, w) => {
      const s = C[D.category] ?? !1, k = `manual-toc-category-${w}`;
      return /* @__PURE__ */ o("div", { style: J.categoryBlock, children: [
        /* @__PURE__ */ o(
          "button",
          {
            type: "button",
            onClick: () => f(D.category),
            style: J.categoryButton,
            "aria-expanded": s,
            "aria-controls": k,
            children: [
              /* @__PURE__ */ e("span", { style: J.categoryChevron, "aria-hidden": "true", children: s ? "expand_more" : "chevron_right" }),
              /* @__PURE__ */ e("span", { children: D.category })
            ]
          }
        ),
        s && /* @__PURE__ */ e("ul", { id: k, style: J.list, children: D.items.map(K) })
      ] }, D.category);
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
    color: n.gray700,
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
    color: n.gray500,
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
    borderLeft: `1px solid ${n.gray300}`
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
    color: n.gray700
  },
  headingDot: {
    flexShrink: 0,
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: n.gray300
  },
  headingDotSub: {
    width: "4px",
    height: "4px",
    background: n.gray300,
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
    color: n.gray500
  }
};
function ot({
  isOpen: t,
  docPath: r,
  onClose: i,
  onNavigate: l,
  onAppNavigate: u,
  initialSize: a = { width: 420, height: 550 },
  showDownloadButton: g = !1,
  items: h,
  feedbackApiBaseUrl: m,
  feedbackUserType: A,
  feedbackAppVersion: y,
  onFeedbackSubmitSuccess: L,
  onFeedbackSubmitError: C,
  feedbackDefaultHeight: E = 200,
  feedbackMinHeight: M = 150,
  feedbackMaxHeight: T = 400
}) {
  const [d, f] = z(null), [H, K] = z(null), { content: D, loading: w, error: s } = be(r), { downloadMd: k } = rn(), B = q(!1), [j, I] = z(!1), _ = m != null, [N, Z] = z(!0), [p, c] = z(!1), O = q(null), Y = q(!1), ee = q(null), oe = q(null), [ie, te] = z(null), ae = q(!1), de = v(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported");
      return;
    }
    if (!B.current) {
      B.current = !0;
      try {
        const S = _ ? 650 : a.width, G = a.height, R = await window.documentPictureInPicture.requestWindow({
          width: S,
          height: G
        }), U = R.document.createElement("style");
        U.textContent = Gn(), R.document.head.appendChild(U);
        const X = R.document.createElement("div");
        X.id = "manual-pip-root", R.document.body.appendChild(X), f(R), K(X), R.addEventListener("pagehide", () => {
          f(null), K(null), i();
        });
      } catch (S) {
        console.error("Failed to open PiP window:", S);
      } finally {
        B.current = !1;
      }
    }
  }, [a.width, a.height, i]), pe = v(() => {
    d && (d.close(), f(null), K(null));
  }, [d]);
  $(() => {
    t && !d ? de() : !t && d && pe();
  }, [t, d, de, pe]);
  const me = v(
    (S) => {
      if (l) {
        const G = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/", R = S.startsWith("/") ? S : G + S;
        l(R);
      }
    },
    [r, l]
  );
  $(() => {
    if (!d || d.closed || !u) return;
    const S = (R) => {
      var ne;
      const X = R.target.closest("a");
      if (X) {
        const V = X.getAttribute("href");
        if (console.log("[ManualPiP] Link clicked", {
          href: V,
          text: (ne = X.textContent) == null ? void 0 : ne.substring(0, 30),
          startsWithHashApp: V == null ? void 0 : V.startsWith("#app:")
        }), V && V.startsWith("#app:")) {
          console.log("[ManualPiP] App link detected! Preventing default"), R.preventDefault(), R.stopPropagation();
          const re = V.replace("#app:", "");
          console.log("[ManualPiP] Calling onAppNavigate", { appPath: re }), u(re);
        }
      }
    }, G = (R) => {
      var ne;
      const U = R.target, X = ((ne = U.querySelector("summary")) == null ? void 0 : ne.textContent) || "unknown";
      console.log("[ManualPiP] Details toggle", {
        open: U.open,
        summary: X
      }), U.open && setTimeout(() => {
        const V = U.querySelectorAll('a[href^="app:"]'), re = U.querySelectorAll("a"), ge = Array.from(re).map((De) => {
          var he;
          return {
            href: De.getAttribute("href"),
            text: (he = De.textContent) == null ? void 0 : he.substring(0, 20)
          };
        });
        console.log("[ManualPiP] Links in opened details", {
          totalLinks: re.length,
          appLinksCount: V.length,
          allHrefs: ge
        });
      }, 100);
    };
    return d.document.addEventListener("click", S, !0), d.document.addEventListener("toggle", G, !0), () => {
      d.closed || (d.document.removeEventListener("click", S, !0), d.document.removeEventListener("toggle", G, !0));
    };
  }, [d, u]);
  const Fe = v(
    (S) => {
      c(!1), l == null || l(S);
    },
    [l]
  ), ke = v(
    (S, G) => {
      if (c(!1), S === r) {
        if (d && !d.closed) {
          const R = d.document.getElementById(G);
          R == null || R.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      O.current = { path: S, headingId: G }, l == null || l(S);
    },
    [r, d, l]
  );
  $(() => {
    const S = O.current;
    if (!S || S.path !== r) {
      Y.current = !1;
      return;
    }
    if (w) {
      Y.current = !0;
      return;
    }
    if (!Y.current || !d || d.closed || !D) return;
    let G = !1, R, U = 0;
    const X = () => {
      if (G || d.closed) return;
      const ne = d.document.getElementById(S.headingId);
      if (ne) {
        ne.scrollIntoView({ behavior: "smooth" }), O.current = null;
        return;
      }
      U += 1, U < 30 ? R = d.requestAnimationFrame(X) : O.current = null;
    };
    return R = d.requestAnimationFrame(X), () => {
      G = !0, d.closed || d.cancelAnimationFrame(R);
    };
  }, [D, r, w, d]), $(() => {
    ae.current = !1;
  }, [r]), $(() => {
    w && (ae.current = !0);
  }, [w]), $(() => {
    if (!d || d.closed || !D || !ae.current) {
      te(null);
      return;
    }
    const S = oe.current;
    if (!S) {
      te(null);
      return;
    }
    const G = Array.from(
      S.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (G.length === 0) {
      te(null);
      return;
    }
    const R = /* @__PURE__ */ new Set(), U = new d.IntersectionObserver(
      (X) => {
        for (const V of X) {
          const re = V.target.id;
          V.isIntersecting ? R.add(re) : R.delete(re);
        }
        if (R.size === 0) return;
        const ne = G.find((V) => R.has(V.id));
        ne && te((V) => V === ne.id ? V : ne.id);
      },
      {
        root: S,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return G.forEach((X) => U.observe(X)), te(G[0].id), () => {
      U.disconnect();
    };
  }, [D, r, d, w]), $(() => {
    if (!d || d.closed || !p) return;
    const S = (G) => {
      G.key === "Escape" && c(!1);
    };
    return d.document.addEventListener("keydown", S), () => {
      d.closed || d.document.removeEventListener("keydown", S);
    };
  }, [d, p]), $(() => {
    ee.current && (ee.current.inert = !p);
  }, [p]);
  const Be = v(async () => {
    if (r) {
      I(!0);
      try {
        await k(r);
      } catch (S) {
        console.error("Download failed:", S);
      } finally {
        I(!1);
      }
    }
  }, [r, k]);
  return H ? nn(
    /* @__PURE__ */ o("div", { className: "pip-container", children: [
      /* @__PURE__ */ o("header", { className: "pip-header", children: [
        /* @__PURE__ */ o("div", { className: "pip-header-left", children: [
          h && /* @__PURE__ */ e(
            "button",
            {
              onClick: () => c((S) => !S),
              className: "pip-menu-btn",
              "aria-label": p ? "目次を閉じる" : "目次を開く",
              "aria-expanded": p,
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
              onClick: Be,
              className: "pip-download-btn",
              "aria-label": "ダウンロード",
              disabled: j,
              children: /* @__PURE__ */ e("span", { className: `pip-icon ${j ? "pip-spin" : ""}`, children: j ? "progress_activity" : "download" })
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: pe,
              className: "pip-close-btn",
              "aria-label": "閉じる",
              children: /* @__PURE__ */ e("span", { className: "pip-icon", children: "close" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o("div", { className: "pip-body", children: [
        h && /* @__PURE__ */ o(ye, { children: [
          /* @__PURE__ */ e(
            "div",
            {
              className: `pip-toc-backdrop${p ? " pip-toc-backdrop-open" : ""}`,
              onClick: () => c(!1),
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ o(
            "div",
            {
              ref: ee,
              className: `pip-toc-panel${p ? " pip-toc-panel-open" : ""}`,
              role: "dialog",
              "aria-label": "目次",
              "aria-hidden": !p,
              children: [
                /* @__PURE__ */ o("div", { className: "pip-toc-panel-header", children: [
                  /* @__PURE__ */ e("span", { className: "pip-toc-panel-title", children: "目次" }),
                  /* @__PURE__ */ e(
                    "button",
                    {
                      onClick: () => c(!1),
                      className: "pip-toc-panel-close",
                      "aria-label": "目次を閉じる",
                      children: /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "20px" }, children: "close" })
                    }
                  )
                ] }),
                /* @__PURE__ */ e("div", { className: "pip-toc-panel-content", children: /* @__PURE__ */ e(
                  $e,
                  {
                    items: h,
                    activePath: r,
                    onSelectPage: Fe,
                    onSelectHeading: ke,
                    activeHeadingId: ie
                  }
                ) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ o("main", { className: "pip-content", ref: oe, children: [
          w && /* @__PURE__ */ o("div", { className: "pip-loading", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-spin", children: "progress_activity" }),
            /* @__PURE__ */ e("span", { children: "読み込み中..." })
          ] }),
          s && /* @__PURE__ */ o("div", { className: "pip-error", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon", children: "warning" }),
            /* @__PURE__ */ o("div", { className: "pip-error-text", children: [
              /* @__PURE__ */ e("div", { className: "pip-error-title", children: "エラーが発生しました" }),
              /* @__PURE__ */ e("div", { className: "pip-error-detail", children: s.message })
            ] })
          ] }),
          D && /* @__PURE__ */ e(
            Ce,
            {
              content: D,
              onLinkClick: me,
              onAppLinkClick: u
            }
          ),
          !w && !s && !D && /* @__PURE__ */ o("div", { className: "pip-empty", children: [
            /* @__PURE__ */ e("span", { className: "pip-icon pip-icon-large", children: "description" }),
            /* @__PURE__ */ e("span", { children: "マニュアルを選択してください" })
          ] })
        ] }),
        _ && /* @__PURE__ */ e("aside", { className: "pip-sidebar", style: { width: "300px" }, children: m != null && /* @__PURE__ */ o(
          "div",
          {
            className: "pip-feedback-section",
            style: {
              height: N ? "100%" : "auto",
              flex: N ? 1 : "0 0 auto"
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
                    onClick: () => Z(!N),
                    className: "pip-toggle-btn",
                    "aria-label": N ? "フィードバックを閉じる" : "フィードバックを開く",
                    children: [
                      /* @__PURE__ */ e("span", { className: "pip-icon", style: { fontSize: "18px" }, children: N ? "expand_less" : "expand_more" }),
                      /* @__PURE__ */ e("span", { children: N ? "閉じる" : "開く" })
                    ]
                  }
                )
              ] }),
              N && /* @__PURE__ */ e("div", { className: "pip-feedback-content", children: /* @__PURE__ */ e(
                Xe,
                {
                  apiBaseUrl: m,
                  userType: A,
                  appVersion: y,
                  onSubmitSuccess: L,
                  onSubmitError: C
                }
              ) })
            ]
          }
        ) })
      ] })
    ] }),
    H
  ) : null;
}
function Gn() {
  return `
    @import url('${Ue}');

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

    ${_n}

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
      background: ${n.primary};
      color: ${n.white};
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

    /* ハンバーガーメニュー（目次パネル開閉） */
    .pip-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .pip-menu-btn:hover {
      background: ${n.tertiary};
    }

    .pip-menu-btn:focus {
      outline: 2px solid ${n.secondary};
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
      background: ${n.white};
      border-right: 1px solid ${n.gray300};
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
      border-bottom: 1px solid ${n.gray300};
      background: ${n.gray100};
      flex-shrink: 0;
    }

    .pip-toc-panel-title {
      font-size: 14px;
      font-weight: 700;
      color: ${n.tertiary};
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
      color: ${n.gray700};
      cursor: pointer;
    }

    .pip-toc-panel-close:hover {
      background: ${n.gray100};
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

    /* Markdown スタイル
       .pip-container でスコープする。PiP ウィンドウは別 document なので他コンポーネントの
       CSS とはそもそも衝突しないが、命名・詳細度の方針を他2箇所（ManualTabPage/DebugPanel）
       と揃えるため同様にスコープする。 */
    .pip-container .manual-markdown {
      color: ${n.gray700};
    }

    .pip-container .manual-markdown h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${n.primary};
      border-bottom: 2px solid ${n.secondary};
      padding-bottom: 8px;
    }

    .pip-container .manual-markdown h2 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 12px;
      color: ${n.tertiary};
    }

    .pip-container .manual-markdown h3 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 8px;
      color: ${n.gray700};
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
      color: ${n.primary};
      text-decoration: underline;
      cursor: pointer;
    }

    .pip-container .manual-markdown a:hover {
      color: ${n.tertiary};
    }

    .pip-container .manual-markdown code {
      background: ${n.gray100};
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 14px;
    }

    .pip-container .manual-markdown pre {
      background: ${n.gray100};
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
      border: 1px solid ${n.gray300};
      padding: 8px 12px;
      text-align: left;
    }

    .pip-container .manual-markdown th {
      background: ${n.gray100};
      font-weight: 600;
    }

    .pip-container .manual-markdown hr {
      border: none;
      border-top: 1px solid ${n.gray300};
      margin: 24px 0;
    }

    .pip-container .manual-markdown blockquote {
      border-left: 4px solid ${n.secondary};
      padding-left: 16px;
      margin: 12px 0;
      color: ${n.gray500};
    }
  `;
}
function at({
  items: t,
  onSelect: r,
  activePath: i,
  className: l = "",
  onPiP: u,
  onNewTab: a
}) {
  $(() => {
    we() || Ae();
  }, []);
  const g = We(() => {
    const h = {}, m = [], A = [...t].sort((y, L) => (y.order ?? 0) - (L.order ?? 0));
    for (const y of A)
      y.category ? (h[y.category] || (h[y.category] = []), h[y.category].push(y)) : m.push(y);
    return { groups: h, uncategorized: m };
  }, [t]);
  return /* @__PURE__ */ o("nav", { className: `manual-sidebar ${l}`, children: [
    g.uncategorized.length > 0 && /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: g.uncategorized.map((h) => /* @__PURE__ */ e(
      He,
      {
        item: h,
        isActive: i === h.path,
        onSelect: r,
        onPiP: u,
        onNewTab: a
      },
      h.id
    )) }),
    Object.entries(g.groups).map(([h, m]) => /* @__PURE__ */ o("div", { style: { marginTop: "16px" }, children: [
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
      /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: m.map((A) => /* @__PURE__ */ e(
        He,
        {
          item: A,
          isActive: i === A.path,
          onSelect: r,
          onPiP: u,
          onNewTab: a
        },
        A.id
      )) })
    ] }, h))
  ] });
}
function He({ item: t, isActive: r, onSelect: i, onPiP: l, onNewTab: u }) {
  const a = {
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
  return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ o("div", { style: a.itemRow, children: [
    /* @__PURE__ */ e(
      "button",
      {
        onClick: () => i(t.path),
        style: a.itemButton,
        children: t.title
      }
    ),
    /* @__PURE__ */ o("div", { style: a.actionButtons, children: [
      l && /* @__PURE__ */ e(
        "button",
        {
          onClick: (g) => {
            g.stopPropagation(), l(t.path);
          },
          style: a.actionBtn,
          title: "PiPで開く",
          "aria-label": "PiPで開く",
          onMouseEnter: (g) => {
            g.currentTarget.style.backgroundColor = n.gray100, g.currentTarget.style.color = n.primary;
          },
          onMouseLeave: (g) => {
            g.currentTarget.style.backgroundColor = "transparent", g.currentTarget.style.color = n.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: a.icon, children: "picture_in_picture_alt" })
        }
      ),
      u && /* @__PURE__ */ e(
        "button",
        {
          onClick: (g) => {
            g.stopPropagation(), u(t.path);
          },
          style: a.actionBtn,
          title: "新しいタブで開く",
          "aria-label": "新しいタブで開く",
          onMouseEnter: (g) => {
            g.currentTarget.style.backgroundColor = n.gray100, g.currentTarget.style.color = n.primary;
          },
          onMouseLeave: (g) => {
            g.currentTarget.style.backgroundColor = "transparent", g.currentTarget.style.color = n.gray500;
          },
          children: /* @__PURE__ */ e("span", { style: a.icon, children: "open_in_new" })
        }
      )
    ] })
  ] }) });
}
function it({
  path: t,
  onClick: r,
  children: i,
  className: l = ""
}) {
  return /* @__PURE__ */ e(
    "a",
    {
      href: t,
      onClick: (a) => {
        a.preventDefault(), r(t);
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
function lt({ docPath: t, className: r = "" }) {
  const { content: i, loading: l, error: u, reload: a } = be(t);
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
        l && /* @__PURE__ */ e("div", { style: { textAlign: "center", padding: "40px", color: "#666" }, children: "読み込み中..." }),
        u && /* @__PURE__ */ o(
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
                u.message
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  onClick: a,
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
        i && /* @__PURE__ */ e(Ce, { content: i })
      ]
    }
  );
}
const Vn = `
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
  background: ${n.tertiary};
}

.manual-menu-btn:focus {
  outline: 2px solid ${n.secondary};
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
  background: ${n.white};
  border-right: 1px solid ${n.gray300};
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
  border-bottom: 1px solid ${n.gray300};
  background: ${n.gray100};
  flex-shrink: 0;
}

.manual-toc-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: ${n.tertiary};
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
  color: ${n.gray700};
  cursor: pointer;
}

.manual-toc-panel-close:hover {
  background: ${n.gray100};
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
  color: ${n.gray700};
}

.manual-tab-page .manual-markdown h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${n.primary};
  border-bottom: 2px solid ${n.secondary};
  padding-bottom: 8px;
}

.manual-tab-page .manual-markdown h2 {
  font-size: 20px;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 12px;
  color: ${n.tertiary};
}

.manual-tab-page .manual-markdown h3 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 8px;
  color: ${n.gray700};
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
  color: ${n.primary};
  text-decoration: underline;
  cursor: pointer;
}

.manual-tab-page .manual-markdown a:hover {
  color: ${n.tertiary};
}

.manual-tab-page .manual-markdown code {
  background: ${n.gray100};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 14px;
}

.manual-tab-page .manual-markdown pre {
  background: ${n.gray100};
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
  border: 1px solid ${n.gray300};
  padding: 8px 12px;
  text-align: left;
}

.manual-tab-page .manual-markdown th {
  background: ${n.gray100};
  font-weight: 600;
}

.manual-tab-page .manual-markdown hr {
  border: none;
  border-top: 1px solid ${n.gray300};
  margin: 24px 0;
}

.manual-tab-page .manual-markdown blockquote {
  border-left: 4px solid ${n.secondary};
  padding-left: 16px;
  margin: 12px 0;
  color: ${n.gray500};
}
`;
function Ne(t, r) {
  if (t.startsWith("/")) return t;
  const i = r ? r.substring(0, r.lastIndexOf("/") + 1) : "/docs/";
  try {
    return new URL(t, "http://d" + i).pathname;
  } catch {
    return i + t;
  }
}
function ut({
  defaultDocPath: t,
  sidebarPath: r,
  onSidebarNavigate: i,
  onSidebarAppNavigate: l,
  sidebarDefaultWidth: u = 400,
  sidebarMinWidth: a = 250,
  sidebarMaxWidth: g = 800,
  feedbackApiBaseUrl: h,
  feedbackUserType: m,
  feedbackAppVersion: A,
  feedbackAdminUrl: y,
  feedbackDefaultHeight: L = 350,
  feedbackMinHeight: C = 200,
  feedbackMaxHeight: E = 600,
  onFeedbackSubmitSuccess: M,
  onFeedbackSubmitError: T,
  items: d
} = {}) {
  const [f, H] = z(null), { content: K, loading: D, error: w } = be(f), s = q(null), k = q(!1), [B, j] = z(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 767px)").matches);
  $(() => {
    if (typeof window > "u") return;
    const b = window.matchMedia("(max-width: 767px)"), P = (Q) => j(Q.matches);
    return b.addEventListener("change", P), () => b.removeEventListener("change", P);
  }, []);
  const [I, _] = z(!1), N = q(null), Z = q(null), p = q(null);
  $(() => {
    _(!1);
  }, [B]);
  const [c, O] = z(!0), [Y, ee] = z(400), [oe, ie] = z(r ?? null);
  $(() => {
    i === void 0 && ie(r ?? null);
  }, [r, i]);
  const te = i !== void 0, ae = te ? r ?? null : oe, {
    content: de,
    loading: pe,
    error: me
  } = be(ae), { size: Fe, isResizing: ke, handleMouseDown: Be, handleKeyDown: S } = Re({
    defaultSize: u,
    minSize: a,
    maxSize: g
  }), G = r != null && h != null, R = q(null), {
    size: U,
    isResizing: X,
    handleMouseDown: ne,
    handleKeyDown: V
  } = Re({
    defaultSize: L,
    minSize: C,
    maxSize: E,
    direction: "vertical",
    enabled: G && c
  });
  $(() => {
    G && c && ee(U);
  }, [U, G, c]);
  const re = on(), ge = q(null), De = q(null), [he, xe] = z(null), ve = q(!1);
  $(() => {
    we() || Ae();
  }, []), $(() => {
    ge.current && (ge.current.scrollTop = 0);
  }, [ae]), $(() => {
    ve.current = !1;
  }, [f]), $(() => {
    D && (ve.current = !0);
  }, [D]), $(() => {
    const b = De.current;
    if (!b || !K || !ve.current) {
      xe(null);
      return;
    }
    const P = Array.from(
      b.querySelectorAll("h1[id], h2[id], h3[id]")
    );
    if (P.length === 0) {
      xe(null);
      return;
    }
    const Q = /* @__PURE__ */ new Set(), fe = new IntersectionObserver(
      (se) => {
        for (const le of se) {
          const Ie = le.target.id;
          le.isIntersecting ? Q.add(Ie) : Q.delete(Ie);
        }
        if (Q.size === 0) return;
        const ce = P.find((le) => Q.has(le.id));
        ce && xe((le) => le === ce.id ? le : ce.id);
      },
      {
        root: b,
        // ビューポート上部付近（上30%のライン）を基準に「読んでいる見出し」を判定する
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
      }
    );
    return P.forEach((se) => fe.observe(se)), xe(P[0].id), () => {
      fe.disconnect();
    };
  }, [K, f, D]);
  const Je = r != null || h != null;
  $(() => {
    const P = new URLSearchParams(window.location.search).get("path");
    P ? H(P) : t && H(t);
  }, [t]);
  const ue = v((b) => {
    const P = `${window.location.pathname}?path=${encodeURIComponent(b)}`;
    window.history.pushState({}, "", P), H(b);
  }, []), Ye = v(
    (b) => {
      ue(Ne(b, f));
    },
    [f, ue]
  ), ze = v(
    (b) => {
      _(!1), ue(b);
    },
    [ue]
  ), Le = v(
    (b, P) => {
      var Q;
      if (_(!1), b === f) {
        (Q = document.getElementById(P)) == null || Q.scrollIntoView({ behavior: "smooth" });
        return;
      }
      s.current = { path: b, headingId: P }, ue(b);
    },
    [f, ue]
  );
  $(() => {
    const b = s.current;
    if (!b || b.path !== f) {
      k.current = !1;
      return;
    }
    if (D) {
      k.current = !0;
      return;
    }
    if (!k.current || !K) return;
    let P = !1, Q, fe = 0;
    const se = () => {
      if (P) return;
      const ce = document.getElementById(b.headingId);
      if (ce) {
        ce.scrollIntoView({ behavior: "smooth" }), s.current = null;
        return;
      }
      fe += 1, fe < 30 ? Q = requestAnimationFrame(se) : s.current = null;
    };
    return Q = requestAnimationFrame(se), () => {
      P = !0, cancelAnimationFrame(Q);
    };
  }, [K, f, D]);
  const Ze = v((b) => {
    window.opener && !window.opener.closed && window.opener.postMessage({ type: "manual-app-navigate", path: b }, window.location.origin);
  }, []), Qe = v(
    (b) => {
      const P = Ne(b, ae);
      te ? i(P) : ie(P);
    },
    [te, i, ae]
  ), en = v(
    (b) => {
      l == null || l(b);
    },
    [l]
  );
  return $(() => {
    const b = () => {
      const Q = new URLSearchParams(window.location.search).get("path");
      Q && H(Q), _(!1);
    };
    return window.addEventListener("popstate", b), () => window.removeEventListener("popstate", b);
  }, []), $(() => {
    if (!I) return;
    const b = (P) => {
      P.key === "Escape" && _(!1);
    };
    return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
  }, [I]), $(() => {
    N.current && (N.current.inert = !I);
  }, [I, B]), $(() => {
    var P;
    const b = !!d && B && I;
    Z.current && (Z.current.inert = b), p.current && (p.current.inert = b), b && ((P = N.current) == null || P.focus());
  }, [d, B, I]), /* @__PURE__ */ o(
    "div",
    {
      className: "manual-tab-page",
      style: {
        ...F.container,
        // items 未指定時は既存の見た目・挙動を一切変えない（docs/usage.md の互換性保証）。
        // items 指定時のみ container を height:100vh + overflow:hidden に固定し、
        // 常設サイドバー(tocPane)がビューポート内で独立スクロールできるようにする。
        ...d ? F.containerWithToc : F.containerLegacy
      },
      children: [
        /* @__PURE__ */ o("header", { ref: Z, style: F.header, children: [
          /* @__PURE__ */ o("div", { style: F.headerLeft, children: [
            d && B && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => _((b) => !b),
                className: "manual-menu-btn",
                style: F.headerButton,
                "aria-label": I ? "目次を閉じる" : "目次を開く",
                "aria-expanded": I,
                children: /* @__PURE__ */ e("span", { style: F.icon, children: "menu" })
              }
            ),
            /* @__PURE__ */ e("span", { style: F.icon, children: "menu_book" }),
            /* @__PURE__ */ e("span", { style: F.title, children: "マニュアル" })
          ] }),
          /* @__PURE__ */ o("div", { style: F.headerRight, children: [
            re && y && /* @__PURE__ */ e(
              "button",
              {
                onClick: () => window.open(y, "_blank"),
                style: F.headerButton,
                title: "フィードバック管理",
                children: /* @__PURE__ */ e("span", { style: F.icon, children: "admin_panel_settings" })
              }
            ),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: () => window.print(),
                style: F.headerButton,
                title: "印刷",
                children: /* @__PURE__ */ e("span", { style: F.icon, children: "print" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ o("div", { className: "manual-body", style: F.body, children: [
          d && !B && /* @__PURE__ */ o("aside", { style: F.tocPane, children: [
            /* @__PURE__ */ o("div", { style: F.tocHeader, children: [
              /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "20px", color: n.tertiary }, children: "toc" }),
              /* @__PURE__ */ e("span", { style: F.sidebarTitle, children: "目次" })
            ] }),
            /* @__PURE__ */ e("div", { style: F.tocContent, children: /* @__PURE__ */ e(
              $e,
              {
                items: d,
                activePath: f,
                onSelectPage: ze,
                onSelectHeading: Le,
                activeHeadingId: he
              }
            ) })
          ] }),
          d && B && /* @__PURE__ */ o(ye, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                className: `manual-toc-backdrop${I ? " manual-toc-backdrop-open" : ""}`,
                onClick: () => _(!1),
                "aria-hidden": "true"
              }
            ),
            /* @__PURE__ */ o(
              "div",
              {
                ref: N,
                className: `manual-toc-panel${I ? " manual-toc-panel-open" : ""}`,
                role: "dialog",
                "aria-label": "目次",
                "aria-hidden": !I,
                tabIndex: -1,
                children: [
                  /* @__PURE__ */ o("div", { className: "manual-toc-panel-header", children: [
                    /* @__PURE__ */ e("span", { className: "manual-toc-panel-title", children: "目次" }),
                    /* @__PURE__ */ e(
                      "button",
                      {
                        onClick: () => _(!1),
                        className: "manual-toc-panel-close",
                        "aria-label": "目次を閉じる",
                        children: /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "20px" }, children: "close" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ e("div", { className: "manual-toc-panel-content", children: /* @__PURE__ */ e(
                    $e,
                    {
                      items: d,
                      activePath: f,
                      onSelectPage: ze,
                      onSelectHeading: Le,
                      activeHeadingId: he
                    }
                  ) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ o("div", { ref: p, style: { display: "contents" }, children: [
            /* @__PURE__ */ e("main", { ref: De, style: F.mainPane, children: /* @__PURE__ */ o("div", { style: F.mainContent, children: [
              D && /* @__PURE__ */ o("div", { style: F.loading, children: [
                /* @__PURE__ */ e("span", { style: { ...F.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                /* @__PURE__ */ e("span", { children: "読み込み中..." })
              ] }),
              w && /* @__PURE__ */ o("div", { style: F.error, children: [
                /* @__PURE__ */ e("span", { style: F.icon, children: "warning" }),
                /* @__PURE__ */ o("div", { children: [
                  /* @__PURE__ */ e("div", { style: F.errorTitle, children: "エラーが発生しました" }),
                  /* @__PURE__ */ e("div", { style: F.errorDetail, children: w.message })
                ] })
              ] }),
              K && /* @__PURE__ */ e(
                Ce,
                {
                  content: K,
                  onLinkClick: Ye,
                  onAppLinkClick: Ze
                }
              ),
              !D && !w && !K && !f && /* @__PURE__ */ o("div", { style: F.empty, children: [
                /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "64px", opacity: 0.5 }, children: "description" }),
                /* @__PURE__ */ e("span", { children: "マニュアルが指定されていません" })
              ] })
            ] }) }),
            Je && /* @__PURE__ */ o(ye, { children: [
              /* @__PURE__ */ e(
                "div",
                {
                  className: `manual-resize-handle${ke ? " resizing" : ""}`,
                  onMouseDown: Be,
                  onKeyDown: S,
                  style: F.resizeHandle,
                  role: "separator",
                  "aria-orientation": "vertical",
                  "aria-valuenow": Fe,
                  "aria-valuemin": a,
                  "aria-valuemax": g,
                  "aria-label": "サイドバーのリサイズ",
                  tabIndex: 0
                }
              ),
              /* @__PURE__ */ o("aside", { style: { ...F.sidebarPane, width: Fe }, children: [
                r != null && /* @__PURE__ */ o(
                  "div",
                  {
                    ref: R,
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      flex: h && c ? `0 0 ${Y}px` : 1,
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ o("div", { style: F.sidebarHeader, children: [
                        !te && oe !== r && /* @__PURE__ */ e(
                          "button",
                          {
                            onClick: () => ie(r ?? null),
                            style: F.backButton,
                            title: "初期ページに戻る",
                            children: /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "20px" }, children: "home" })
                          }
                        ),
                        /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "20px", color: n.tertiary }, children: "auto_stories" }),
                        /* @__PURE__ */ e("span", { style: F.sidebarTitle, children: "参照" })
                      ] }),
                      /* @__PURE__ */ o(
                        "div",
                        {
                          ref: ge,
                          style: F.sidebarContent,
                          children: [
                            pe && /* @__PURE__ */ o("div", { style: F.loading, children: [
                              /* @__PURE__ */ e("span", { style: { ...F.icon, animation: "spin 1s linear infinite" }, children: "progress_activity" }),
                              /* @__PURE__ */ e("span", { children: "読み込み中..." })
                            ] }),
                            me && /* @__PURE__ */ o("div", { style: F.error, children: [
                              /* @__PURE__ */ e("span", { style: F.icon, children: "warning" }),
                              /* @__PURE__ */ o("div", { children: [
                                /* @__PURE__ */ e("div", { style: F.errorTitle, children: "エラー" }),
                                /* @__PURE__ */ e("div", { style: F.errorDetail, children: me.message })
                              ] })
                            ] }),
                            de && /* @__PURE__ */ e(
                              Ce,
                              {
                                content: de,
                                onLinkClick: Qe,
                                onAppLinkClick: en
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ),
                r && h && c && /* @__PURE__ */ e(
                  "div",
                  {
                    className: `manual-v-resize-handle${X ? " resizing" : ""}`,
                    onMouseDown: ne,
                    onKeyDown: V,
                    style: F.vResizeHandle,
                    role: "separator",
                    "aria-orientation": "horizontal",
                    "aria-valuenow": Y,
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
                      height: c ? r ? "auto" : "100%" : "auto",
                      flex: c && !r ? 1 : c ? "1 1 0" : "0 0 auto",
                      minHeight: 0
                    },
                    children: [
                      /* @__PURE__ */ o("div", { style: F.feedbackHeader, children: [
                        /* @__PURE__ */ o("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                          /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "20px", color: n.tertiary }, children: "rate_review" }),
                          /* @__PURE__ */ e("span", { style: F.sidebarTitle, children: "フィードバック" })
                        ] }),
                        /* @__PURE__ */ o(
                          "button",
                          {
                            onClick: () => O(!c),
                            style: F.toggleBtn,
                            onMouseEnter: (b) => {
                              b.currentTarget.style.backgroundColor = n.gray100, b.currentTarget.style.borderColor = n.gray700;
                            },
                            onMouseLeave: (b) => {
                              b.currentTarget.style.backgroundColor = "transparent", b.currentTarget.style.borderColor = n.gray300;
                            },
                            "aria-label": c ? "フィードバックを閉じる" : "フィードバックを開く",
                            title: c ? "フィードバックを閉じる" : "フィードバックを開く",
                            children: [
                              /* @__PURE__ */ e("span", { style: { ...F.icon, fontSize: "18px" }, children: c ? "expand_less" : "expand_more" }),
                              /* @__PURE__ */ e("span", { children: c ? "閉じる" : "開く" })
                            ]
                          }
                        )
                      ] }),
                      c && /* @__PURE__ */ e("div", { style: F.feedbackContent, children: /* @__PURE__ */ e(
                        Xe,
                        {
                          apiBaseUrl: h,
                          userType: m,
                          appVersion: A,
                          onSubmitSuccess: M,
                          onSubmitError: T
                        }
                      ) })
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e("style", { children: Vn })
      ]
    }
  );
}
const F = {
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
    overflow: "hidden",
    position: "relative"
  },
  tocPane: {
    width: "260px",
    flexShrink: 0,
    borderRight: `1px solid ${n.gray300}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  tocHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    borderBottom: `1px solid ${n.gray300}`,
    backgroundColor: n.gray100,
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
}, Oe = {
  bug: { label: "不具合", color: "#DC2626" },
  question: { label: "質問", color: "#2563EB" },
  request: { label: "要望", color: "#059669" },
  share: { label: "共有", color: "#6B7280" },
  other: { label: "その他", color: "#9333EA" }
}, je = {
  app: "アプリ",
  manual: "マニュアル"
}, Un = {
  open: { label: "open", color: "#F59E0B" },
  in_progress: { label: "対応中", color: "#2563EB" },
  closed: { label: "完了", color: "#059669" }
};
function st({ apiBaseUrl: t, adminKey: r }) {
  var Z;
  const {
    feedbacks: i,
    total: l,
    page: u,
    limit: a,
    loading: g,
    error: h,
    filters: m,
    customTags: A,
    setFilters: y,
    setPage: L,
    updateStatus: C,
    remove: E,
    refresh: M
  } = an({ apiBaseUrl: t, adminKey: r }), [T, d] = z(null), [f, H] = z(null), [K, D] = z(!1), [w, s] = z(null), k = q(0);
  $(() => {
    we() || Ae();
  }, []);
  const B = Math.max(1, Math.ceil(l / a)), j = v(async (p) => {
    if (T === p) {
      d(null), H(null);
      return;
    }
    d(p), D(!0);
    const c = ++k.current;
    try {
      const O = await pn({ apiBaseUrl: t, adminKey: r, id: p });
      if (k.current !== c) return;
      H(O);
    } catch {
      if (k.current !== c) return;
      H(null);
    }
    k.current === c && D(!1);
  }, [T, t, r]), I = v(async (p) => {
    confirm("削除しますか？") && (await E(p), T === p && (d(null), H(null)));
  }, [E, T]), _ = v(async (p, c) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await gn({ apiBaseUrl: t, adminKey: r, feedbackId: p, attachmentId: c }), H((O) => {
          var Y;
          return !O || O.id !== p ? O : {
            ...O,
            attachments: (Y = O.attachments) == null ? void 0 : Y.filter((ee) => ee.id !== c)
          };
        });
      } catch (O) {
        console.error("Failed to delete attachment:", O);
      }
  }, [t, r]), N = v((p) => {
    try {
      const c = new URL(t);
      return `${c.origin}${c.pathname.replace(/\/$/, "")}/attachments/${p}`;
    } catch {
      return `${t}/attachments/${p}`;
    }
  }, [t]);
  return /* @__PURE__ */ o("div", { style: x.container, children: [
    /* @__PURE__ */ e("h2", { style: x.title, children: "フィードバック管理" }),
    /* @__PURE__ */ o("div", { style: x.filterRow, children: [
      /* @__PURE__ */ o(
        "select",
        {
          value: m.status,
          onChange: (p) => y({ status: p.target.value }),
          style: x.select,
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
          value: m.kind,
          onChange: (p) => y({ kind: p.target.value }),
          style: x.select,
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
          value: m.target,
          onChange: (p) => y({ target: p.target.value }),
          style: x.select,
          "aria-label": "対象フィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
            /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
            /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
          ]
        }
      ),
      A.length > 0 && /* @__PURE__ */ o(
        "select",
        {
          value: m.customTag,
          onChange: (p) => y({ customTag: p.target.value }),
          style: x.select,
          "aria-label": "タグフィルター",
          children: [
            /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
            A.map((p) => /* @__PURE__ */ e("option", { value: p, children: p }, p))
          ]
        }
      ),
      /* @__PURE__ */ e("button", { onClick: M, style: x.refreshBtn, "aria-label": "更新", children: /* @__PURE__ */ e("span", { style: x.iconSmall, children: "refresh" }) })
    ] }),
    h && /* @__PURE__ */ e("div", { style: x.error, role: "alert", children: h.message.slice(0, 200) }),
    /* @__PURE__ */ o("table", { style: x.table, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ o("tr", { children: [
        /* @__PURE__ */ e("th", { style: x.th, children: "日時" }),
        /* @__PURE__ */ e("th", { style: x.th, children: "種別" }),
        /* @__PURE__ */ e("th", { style: x.th, children: "対象" }),
        /* @__PURE__ */ e("th", { style: { ...x.th, width: "40%" }, children: "メッセージ" }),
        /* @__PURE__ */ e("th", { style: x.th, children: "状態" }),
        /* @__PURE__ */ e("th", { style: { ...x.th, width: "30px" } })
      ] }) }),
      /* @__PURE__ */ o("tbody", { children: [
        g && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: x.loadingCell, children: "読み込み中..." }) }),
        !g && i.length === 0 && /* @__PURE__ */ e("tr", { children: /* @__PURE__ */ e("td", { colSpan: 6, style: x.loadingCell, children: "データなし" }) }),
        i.map((p) => {
          var ee;
          const c = Oe[p.kind] ?? { label: p.kind, color: "#6B7280" }, O = Un[p.status] ?? { label: p.status, color: "#6B7280" }, Y = T === p.id;
          return /* @__PURE__ */ o("tr", { children: [
            /* @__PURE__ */ e("td", { style: x.td, children: /* @__PURE__ */ e(
              "button",
              {
                onClick: () => j(p.id),
                style: x.rowButton,
                "aria-expanded": Y,
                "aria-controls": Y ? `feedback-detail-${p.id}` : void 0,
                children: (ee = p.createdAt) == null ? void 0 : ee.slice(5, 16).replace("T", " ")
              }
            ) }),
            /* @__PURE__ */ e("td", { style: x.td, children: /* @__PURE__ */ e("span", { style: { ...x.badge, backgroundColor: c.color }, children: c.label }) }),
            /* @__PURE__ */ e("td", { style: x.td, children: p.target ? je[p.target] ?? p.target : "-" }),
            /* @__PURE__ */ e("td", { style: { ...x.td, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: p.message.slice(0, 80) }),
            /* @__PURE__ */ e("td", { style: x.td, children: /* @__PURE__ */ e("span", { style: { color: O.color, fontWeight: 600, fontSize: "12px" }, children: O.label }) }),
            /* @__PURE__ */ e("td", { style: x.td, children: (p.attachmentCount ?? 0) > 0 && /* @__PURE__ */ e("span", { style: { ...x.iconSmall, fontSize: "14px", color: "#6B7280" }, title: `${p.attachmentCount}枚`, children: "image" }) })
          ] }, p.id);
        })
      ] })
    ] }),
    T !== null && /* @__PURE__ */ e("div", { style: x.detailPanel, id: `feedback-detail-${T}`, role: "region", "aria-label": "フィードバック詳細", children: K ? /* @__PURE__ */ e("div", { children: "読み込み中..." }) : f ? /* @__PURE__ */ o(ye, { children: [
      /* @__PURE__ */ o("div", { style: x.detailGrid, children: [
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "種別:" }),
          " ",
          (Z = Oe[f.kind]) == null ? void 0 : Z.label
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "対象:" }),
          " ",
          f.target ? je[f.target] : "-"
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "URL:" }),
          " ",
          f.pageUrl ?? "-"
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "ユーザー:" }),
          " ",
          f.userType ?? "-"
        ] }),
        f.environment && /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "環境:" }),
          " ",
          Object.values(f.environment).slice(0, 2).join(" / ")
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "バージョン:" }),
          " ",
          f.appVersion ?? "-"
        ] }),
        f.customTag && /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "タグ:" }),
          " ",
          f.customTag
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ e("strong", { children: "日時:" }),
          " ",
          f.createdAt
        ] })
      ] }),
      /* @__PURE__ */ o("div", { style: x.detailMessage, children: [
        /* @__PURE__ */ e("strong", { children: "メッセージ:" }),
        /* @__PURE__ */ e("pre", { style: x.messagePre, children: f.message })
      ] }),
      f.consoleLogs && f.consoleLogs.length > 0 && /* @__PURE__ */ o("details", { style: x.logSection, children: [
        /* @__PURE__ */ o("summary", { children: [
          "コンソールログ (",
          f.consoleLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: x.logPre, children: JSON.stringify(f.consoleLogs, null, 2) })
      ] }),
      f.networkLogs && f.networkLogs.length > 0 && /* @__PURE__ */ o("details", { style: x.logSection, children: [
        /* @__PURE__ */ o("summary", { children: [
          "ネットワークログ (",
          f.networkLogs.length,
          "件)"
        ] }),
        /* @__PURE__ */ e("pre", { style: x.logPre, children: JSON.stringify(f.networkLogs, null, 2) })
      ] }),
      f.attachments && f.attachments.length > 0 && /* @__PURE__ */ o("div", { style: x.attachmentSection, children: [
        /* @__PURE__ */ o("strong", { children: [
          "添付画像 (",
          f.attachments.length,
          "件):"
        ] }),
        /* @__PURE__ */ e("div", { style: x.attachmentGrid, children: f.attachments.map((p) => /* @__PURE__ */ o("div", { style: x.attachmentThumb, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: N(p.filename),
              alt: p.original_name,
              style: x.attachmentImg,
              onClick: () => s(N(p.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => _(f.id, p.id),
              style: x.attachmentRemoveBtn,
              "aria-label": "画像を削除",
              children: /* @__PURE__ */ e("span", { style: { ...x.iconSmall, fontSize: "14px" }, children: "close" })
            }
          ),
          /* @__PURE__ */ e("div", { style: x.attachmentInfo, children: p.original_name.length > 12 ? p.original_name.slice(0, 12) + "..." : p.original_name })
        ] }, p.id)) })
      ] }),
      w && /* @__PURE__ */ e("div", { style: x.overlay, onClick: () => s(null), children: /* @__PURE__ */ e("img", { src: w, alt: "拡大画像", style: x.enlargedImg }) }),
      /* @__PURE__ */ o("div", { style: x.detailActions, children: [
        /* @__PURE__ */ o(
          "select",
          {
            value: f.status,
            onChange: (p) => C(f.id, p.target.value),
            style: x.select,
            "aria-label": "ステータス変更",
            children: [
              /* @__PURE__ */ e("option", { value: "open", children: "open" }),
              /* @__PURE__ */ e("option", { value: "in_progress", children: "対応中" }),
              /* @__PURE__ */ e("option", { value: "closed", children: "完了" })
            ]
          }
        ),
        /* @__PURE__ */ e("button", { onClick: () => I(f.id), style: x.deleteBtn, children: "削除" })
      ] })
    ] }) : /* @__PURE__ */ e("div", { children: "詳細の取得に失敗しました" }) }),
    B > 1 && /* @__PURE__ */ o("div", { style: x.pagination, children: [
      /* @__PURE__ */ e("button", { onClick: () => L(u - 1), disabled: u <= 1, style: x.pageBtn, "aria-label": "前のページ", children: "◀" }),
      /* @__PURE__ */ o("span", { style: x.pageInfo, children: [
        u,
        " / ",
        B
      ] }),
      /* @__PURE__ */ e("button", { onClick: () => L(u + 1), disabled: u >= B, style: x.pageBtn, "aria-label": "次のページ", children: "▶" })
    ] })
  ] });
}
const x = {
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
  Se as D,
  st as F,
  fn as I,
  n as M,
  Xe as a,
  Ue as b,
  it as c,
  lt as d,
  ot as e,
  at as f,
  ut as g,
  $e as h,
  Ce as i,
  we as j,
  Ae as l,
  _n as m,
  Wn as u
};
