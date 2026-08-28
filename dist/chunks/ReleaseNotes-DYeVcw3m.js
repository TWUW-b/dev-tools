import { jsxs as n, jsx as e, Fragment as ye } from "react/jsx-runtime";
import { useState as v, useMemo as ve, useCallback as q, forwardRef as kt, useRef as ge, useEffect as ie, useImperativeHandle as St, createContext as zt, useContext as dt } from "react";
import { a as ct, u as $t, b as Ct } from "./useReleaseNotes-D1ZTqeG2.js";
import { c as oe, b as je, h as Ft, i as It, j as Rt, k as Ue } from "./feedbackApi-BAwJP8AU.js";
import { d as Tt, a as Bt } from "./useFeedbackAdminMode-DpbrwKWq.js";
import { r as Se } from "./releaseNotesApi-BahuRlM7.js";
import { createPortal as _t } from "react-dom";
import { m as Et } from "./feedbackLogCapture-DUBfVREg.js";
import { I as pt, D as s, i as Ee, b as Wt, M as K } from "./FeedbackAdmin-CilvfVsH.js";
import { c as Nt } from "./logCapture-Bkuy8MSd.js";
function Mt(t) {
  return t.split(`
`).map((r) => r.trim()).filter((r) => r.startsWith("- ")).map((r) => r.slice(2).trim()).filter(Boolean);
}
function At({ notes: t, updateStatus: r }) {
  const [i, l] = v(null), [g, z] = v(/* @__PURE__ */ new Set(["fixed"])), [b, x] = v({}), [y, T] = v(/* @__PURE__ */ new Set()), d = ve(() => g.size === 0 ? t : t.filter((m) => g.has(m.status)), [t, g]), k = q(async (m, I) => {
    l(`status-${m}`);
    try {
      await r(m, I), (I === "resolved" || I === "closed") && x((_) => {
        const S = { ..._ };
        return delete S[m], S;
      });
    } finally {
      l(null);
    }
  }, [r]), A = q((m, I) => {
    x((_) => {
      const S = _[m] ?? /* @__PURE__ */ new Set(), E = new Set(S);
      return E.has(I) ? E.delete(I) : E.add(I), { ..._, [m]: E };
    });
  }, []);
  return /* @__PURE__ */ n("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ n("div", { className: "debug-status-filter", children: [
      ["open", "fixed", "resolved", "closed", "rejected"].map((m) => /* @__PURE__ */ e(
        "button",
        {
          "data-testid": `status-chip-${m}`,
          className: `debug-status-chip ${g.has(m) ? "active" : ""}`,
          onClick: () => {
            z((I) => {
              const _ = new Set(I);
              return _.has(m) ? _.delete(m) : _.add(m), _;
            });
          },
          children: m === "closed" ? "クローズ" : m
        },
        m
      )),
      /* @__PURE__ */ n("span", { className: "debug-filter-count", children: [
        d.length,
        "件"
      ] })
    ] }) }),
    d.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "該当するノートはありません" }) : d.map((m) => {
      const I = Mt(m.latest_comment || ""), _ = b[m.id] ?? /* @__PURE__ */ new Set(), S = I.length > 0 && _.size === I.length, E = I.length > 0;
      return /* @__PURE__ */ n("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ n(
          "div",
          {
            className: "debug-checklist-header",
            style: { cursor: "pointer" },
            onClick: () => T((h) => {
              const C = new Set(h);
              return C.has(m.id) ? C.delete(m.id) : C.add(m.id), C;
            }),
            children: [
              /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: y.has(m.id) ? "▼" : "▶" }),
              /* @__PURE__ */ n("span", { className: "debug-note-id", children: [
                "#",
                m.id
              ] }),
              /* @__PURE__ */ e("span", { className: `debug-severity-dot ${m.severity || "none"}` }),
              m.source === "test" && /* @__PURE__ */ e("span", { className: "debug-source-badge", children: "🧪" }),
              /* @__PURE__ */ e("span", { className: "debug-checklist-title", children: m.content.split(`
`)[0].slice(0, 50) }),
              /* @__PURE__ */ n(
                "select",
                {
                  "data-testid": `note-status-select-${m.id}`,
                  className: "debug-status-select",
                  value: m.status,
                  onChange: (h) => k(m.id, h.target.value),
                  disabled: i !== null,
                  style: { marginLeft: "auto", flexShrink: 0 },
                  children: [
                    /* @__PURE__ */ e("option", { value: "open", children: "open" }),
                    /* @__PURE__ */ e("option", { value: "fixed", children: "fixed" }),
                    /* @__PURE__ */ e("option", { value: "resolved", children: "resolved" }),
                    /* @__PURE__ */ e("option", { value: "closed", children: "クローズ" }),
                    /* @__PURE__ */ e("option", { value: "rejected", children: "rejected" })
                  ]
                }
              )
            ]
          }
        ),
        y.has(m.id) && /* @__PURE__ */ e(ye, { children: E && /* @__PURE__ */ n("div", { className: "debug-checklist-items", children: [
          I.map((h, C) => /* @__PURE__ */ n("label", { className: "debug-checklist-item", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: _.has(C),
                onChange: () => A(m.id, C)
              }
            ),
            /* @__PURE__ */ e("span", { className: _.has(C) ? "debug-checklist-done" : "", children: h })
          ] }, C)),
          /* @__PURE__ */ n("div", { className: "debug-checklist-actions", children: [
            /* @__PURE__ */ n("span", { className: "debug-checklist-progress", children: [
              _.size,
              "/",
              I.length
            ] }),
            m.status === "fixed" && /* @__PURE__ */ e(
              "button",
              {
                className: "debug-btn debug-btn-resolve",
                disabled: !S || i !== null,
                onClick: () => k(m.id, "resolved"),
                children: i === `status-${m.id}` ? "更新中..." : "resolved"
              }
            )
          ] })
        ] }) })
      ] }, m.id);
    })
  ] });
}
const Lt = kt(function({ testCases: r, env: i, logCapture: l, onNotesRefresh: g, onRunningCasesChange: z }, b) {
  const [x, y] = v([]), [T, d] = v(/* @__PURE__ */ new Set()), [k, A] = v(/* @__PURE__ */ new Set()), [m, I] = v({}), [_, S] = v({}), [E, h] = v(null), [C, c] = v(null), F = ge("");
  ie(() => {
    if (!r || r.length === 0) return;
    const w = JSON.stringify(r);
    if (w === F.current) return;
    let u = !1;
    return (async () => {
      try {
        await oe.importTestCases(r);
      } catch (f) {
        console.warn("Failed to import test cases:", f);
      }
      if (!u)
        try {
          const f = await oe.getTestTree(i);
          if (u) return;
          y(f), F.current = w;
          const D = {};
          for (const B of f)
            for (const R of B.capabilities)
              for (const M of R.cases)
                M.last === "pass" && (D[M.caseId] = !0);
          I(D);
        } catch (f) {
          console.warn("Failed to fetch test tree:", f);
        }
    })(), () => {
      u = !0;
    };
  }, [r, i]);
  const N = q(async () => {
    try {
      const w = await oe.getTestTree(i);
      y(w);
      const u = {};
      for (const f of w)
        for (const D of f.capabilities)
          for (const B of D.cases)
            u[B.caseId] = B.last === "pass";
      I(u);
    } catch {
      c({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [i]);
  St(b, () => ({ refresh: N }), [N]), ie(() => {
    if (!z) return;
    const w = [];
    for (const u of x)
      for (const f of u.capabilities) {
        const D = `${u.domain}/${f.capability}`;
        if (k.has(D))
          for (const B of f.cases) w.push(B.caseId);
      }
    z(w);
  }, [k, x, z]);
  const L = q(async (w, u, f) => {
    const D = `${w}/${u}`;
    h(D), c(null);
    try {
      const B = [], R = _[D], M = R != null && R.content.trim() && R.caseIds.length > 0 ? R.caseIds : [], a = new Set(M);
      for (const Q of f)
        m[Q.caseId] && !a.has(Q.caseId) && B.push({ caseId: Q.caseId, result: "pass" });
      for (const Q of M)
        B.push({ caseId: Q, result: "fail" });
      if (B.length === 0) {
        c({ type: "error", text: "チェックまたはバグ報告が必要です" }), h(null);
        return;
      }
      const P = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, J = M.length > 0 ? {
        content: R.content.trim(),
        severity: R.severity || void 0,
        consoleLogs: l == null ? void 0 : l.getConsoleLogs(),
        networkLogs: l == null ? void 0 : l.getNetworkLogs(),
        environment: P
      } : void 0, X = await oe.submitTestRuns(i, B, J);
      if (R != null && R.files && R.files.length > 0 && X.results) {
        const ee = X.results.filter((p) => p.noteId != null).map((p) => p.noteId)[0];
        if (ee)
          for (const p of R.files)
            try {
              await oe.uploadAttachment(i, ee, p);
            } catch (O) {
              console.warn("Failed to upload attachment:", O);
            }
      }
      if (X.capability) {
        y((ee) => ee.map((p) => p.domain !== w ? p : {
          ...p,
          capabilities: p.capabilities.map(
            (O) => O.capability === u ? X.capability : O
          )
        }));
        const Q = { ...m };
        for (const ee of X.capability.cases)
          Q[ee.caseId] = ee.last === "pass";
        I(Q);
      }
      g(), S((Q) => {
        const ee = { ...Q };
        return delete ee[D], ee;
      }), c({ type: "success", text: "送信しました" });
    } catch (B) {
      c({ type: "error", text: B instanceof Error ? B.message : "送信に失敗しました" });
    } finally {
      h(null);
    }
  }, [m, _, i, l, g]), j = q((w) => {
    d((u) => {
      const f = new Set(u);
      return f.has(w) ? f.delete(w) : f.add(w), f;
    });
  }, []), G = q((w) => {
    A((u) => {
      const f = new Set(u);
      return f.has(w) ? f.delete(w) : f.add(w), f;
    });
  }, []), Z = (w) => w.last === "pass" ? "passed" : w.last === "fail" && w.openIssues === 0 ? "retest" : w.last === "fail" ? "fail" : "-", re = (w) => w.last === "pass" ? s.success : w.last === "fail" && w.openIssues === 0 ? "#F59E0B" : w.last === "fail" ? s.error : s.gray500, ne = (w) => w.status === "passed" ? "passed" : w.status === "retest" ? "retest" : w.status === "fail" ? "fail" : "", H = (w) => w.status === "passed" ? s.success : w.status === "retest" ? "#F59E0B" : w.status === "fail" ? s.error : s.gray500;
  return /* @__PURE__ */ n(ye, { children: [
    C && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${C.type}`, children: C.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: x.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : x.map((w) => /* @__PURE__ */ n("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ n(
        "button",
        {
          "data-testid": `domain-toggle-${w.domain}`,
          className: "debug-tree-toggle",
          onClick: () => j(w.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: T.has(w.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: w.domain })
          ]
        }
      ),
      T.has(w.domain) && w.capabilities.map((u) => {
        const f = `${w.domain}/${u.capability}`, D = k.has(f), B = _[f];
        return /* @__PURE__ */ n("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ n(
            "button",
            {
              "data-testid": `cap-toggle-${f}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => G(f),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: D ? "expand_more" : "chevron_right" }),
                /* @__PURE__ */ e("span", { className: "debug-tree-label", children: u.capability }),
                /* @__PURE__ */ n("span", { className: "debug-tree-count", children: [
                  u.passed,
                  "/",
                  u.total
                ] }),
                u.status && /* @__PURE__ */ e("span", { className: "debug-tree-status", style: { color: H(u) }, children: ne(u) }),
                u.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                  "[",
                  u.openIssues,
                  "件]"
                ] })
              ]
            }
          ),
          D && /* @__PURE__ */ n("div", { className: "debug-tree-cases", children: [
            u.cases.map((R) => /* @__PURE__ */ n("label", { "data-testid": `case-${R.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!m[R.caseId],
                  onChange: (M) => {
                    I((a) => ({
                      ...a,
                      [R.caseId]: M.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: R.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: re(R) }, children: Z(R) }),
              R.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                "[",
                R.openIssues,
                "件]"
              ] })
            ] }, R.caseId)),
            /* @__PURE__ */ n("div", { className: "debug-bug-form", children: [
              /* @__PURE__ */ e("div", { className: "debug-bug-form-title", children: "バグ報告" }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "ケース（複数選択可）" }),
                /* @__PURE__ */ e("div", { className: "debug-bug-cases", children: u.cases.map((R) => {
                  const M = (B == null ? void 0 : B.caseIds.includes(R.caseId)) ?? !1;
                  return /* @__PURE__ */ n("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: M,
                        onChange: (a) => {
                          S((P) => {
                            const J = P[f] || { caseIds: [], content: "", severity: "", files: [] }, X = a.target.checked ? [...J.caseIds, R.caseId] : J.caseIds.filter((Q) => Q !== R.caseId);
                            return { ...P, [f]: { ...J, caseIds: X } };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { children: R.title })
                  ] }, R.caseId);
                }) })
              ] }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "内容" }),
                /* @__PURE__ */ e(
                  "textarea",
                  {
                    value: (B == null ? void 0 : B.content) || "",
                    onChange: (R) => {
                      S((M) => {
                        var a, P, J;
                        return {
                          ...M,
                          [f]: {
                            ...M[f],
                            caseIds: ((a = M[f]) == null ? void 0 : a.caseIds) || [],
                            content: R.target.value,
                            severity: ((P = M[f]) == null ? void 0 : P.severity) || "",
                            files: ((J = M[f]) == null ? void 0 : J.files) || []
                          }
                        };
                      });
                    },
                    placeholder: "バグの内容",
                    rows: 2
                  }
                )
              ] }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "重要度" }),
                /* @__PURE__ */ n(
                  "select",
                  {
                    value: (B == null ? void 0 : B.severity) || "",
                    onChange: (R) => {
                      S((M) => {
                        var a, P, J;
                        return {
                          ...M,
                          [f]: {
                            ...M[f],
                            caseIds: ((a = M[f]) == null ? void 0 : a.caseIds) || [],
                            content: ((P = M[f]) == null ? void 0 : P.content) || "",
                            severity: R.target.value,
                            files: ((J = M[f]) == null ? void 0 : J.files) || []
                          }
                        };
                      });
                    },
                    children: [
                      /* @__PURE__ */ e("option", { value: "", children: "未設定" }),
                      /* @__PURE__ */ e("option", { value: "low", children: "low" }),
                      /* @__PURE__ */ e("option", { value: "medium", children: "medium" }),
                      /* @__PURE__ */ e("option", { value: "high", children: "high" }),
                      /* @__PURE__ */ e("option", { value: "critical", children: "critical" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ e(
                pt,
                {
                  files: (B == null ? void 0 : B.files) || [],
                  onAdd: (R) => {
                    S((M) => {
                      var a, P, J, X;
                      return {
                        ...M,
                        [f]: {
                          ...M[f],
                          caseIds: ((a = M[f]) == null ? void 0 : a.caseIds) || [],
                          content: ((P = M[f]) == null ? void 0 : P.content) || "",
                          severity: ((J = M[f]) == null ? void 0 : J.severity) || "",
                          files: [...((X = M[f]) == null ? void 0 : X.files) || [], ...R]
                        }
                      };
                    });
                  },
                  onRemove: (R) => {
                    S((M) => {
                      var a, P, J, X;
                      return {
                        ...M,
                        [f]: {
                          ...M[f],
                          caseIds: ((a = M[f]) == null ? void 0 : a.caseIds) || [],
                          content: ((P = M[f]) == null ? void 0 : P.content) || "",
                          severity: ((J = M[f]) == null ? void 0 : J.severity) || "",
                          files: (((X = M[f]) == null ? void 0 : X.files) || []).filter((Q, ee) => ee !== R)
                        }
                      };
                    });
                  },
                  disabled: E !== null
                }
              )
            ] }),
            (() => {
              const R = B != null && B.content.trim() ? B.caseIds.length : 0, a = u.cases.filter((P) => m[P.caseId] && !(B != null && B.caseIds.includes(P.caseId) && R > 0)).length + R;
              return /* @__PURE__ */ e(
                "button",
                {
                  "data-testid": `cap-submit-${f}`,
                  className: "debug-btn debug-btn-primary debug-cap-submit",
                  onClick: () => L(w.domain, u.capability, u.cases),
                  disabled: E !== null || a === 0,
                  children: E === f ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
                    /* @__PURE__ */ e("span", { style: {
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite"
                    } }),
                    "送信中"
                  ] }) : `${a}/${u.total}件を送信`
                }
              );
            })()
          ] })
        ] }, f);
      })
    ] }, w.domain)) })
  ] });
});
function Dt({
  items: t,
  defaultPath: r,
  onNavigate: i,
  onAppNavigate: l
}) {
  var d;
  const [g, z] = v(r || ((d = t[0]) == null ? void 0 : d.path) || ""), { content: b, loading: x, error: y } = Tt(g), T = (k) => {
    z(k), i == null || i(k);
  };
  return /* @__PURE__ */ n("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: t.map((k) => /* @__PURE__ */ e(
      "button",
      {
        className: `debug-manual-item ${g === k.path ? "active" : ""}`,
        onClick: () => T(k.path),
        title: k.title,
        children: k.title
      },
      k.id
    )) }),
    /* @__PURE__ */ n("div", { className: "debug-manual-content", children: [
      x && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      y && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: y.message }),
      b && /* @__PURE__ */ e(
        Ee,
        {
          content: b,
          onLinkClick: (k) => {
            z(k), i == null || i(k);
          },
          onAppLinkClick: l
        }
      )
    ] })
  ] });
}
function jt(t) {
  const { meta: r, body: i } = Ot(t), l = i.split(`
`), g = {
    title: r.title,
    warning: r.warning,
    projects: []
  };
  let z = [], b = null, x = null, y = null, T = !1, d = [], k = [], A = [];
  const m = () => {
    if (A.length === 0) return;
    const h = Pt(A);
    A = [], h && (y ? y.table = h : k.push(...Ht(h)));
  }, I = () => {
    if (m(), y && k.length > 0) {
      const h = k.join(`
`).trim();
      h && (y.extraMd = (y.extraMd ? y.extraMd + `
` : "") + h);
    }
    k = [];
  }, _ = () => {
    if (I(), b && y)
      if (T) {
        const h = [
          y.entries.map((C) => `- ${C.key}: ${C.value}`).join(`
`),
          y.extraMd ?? ""
        ].filter(Boolean).join(`

`);
        h.trim() && d.push(`## ${y.label}

${h}`);
      } else if (x) {
        let h = b.envs.find((C) => C.env === x);
        h || (h = { env: x, sections: [] }, b.envs.push(h)), h.sections.push(y);
      } else
        b.common.push(y);
    y = null, x = null, T = !1;
  }, S = () => {
    _(), b && (d.length > 0 && (b.notes = d.join(`

`).trim()), d = [], g.projects.push(b)), b = null;
  };
  for (let h = 0; h < l.length; h++) {
    const C = l[h], c = C.trim();
    if (/^\|.*\|$/.test(c)) {
      A.push(c);
      continue;
    } else A.length > 0 && m();
    if (/^---+$/.test(c)) continue;
    const F = /^#\s+(.+)$/.exec(C);
    if (F) {
      S();
      const j = F[1].trim();
      j === "共通" || /^(common|shared)$/i.test(j) ? b = { name: "共通", envs: [], common: [] } : b = { name: j, envs: [], common: [] };
      continue;
    }
    const N = /^##\s+(.+)$/.exec(C);
    if (N) {
      _(), b || (b = { name: "共通", envs: [], common: [] });
      const j = N[1].trim();
      if (/前提|注意|注記|note|備考/i.test(j)) {
        y = { label: j, entries: [] }, T = !0;
        continue;
      }
      const G = /^(.+?)\s*\/\s*(.+)$/.exec(j);
      if (G)
        x = Ge(G[1].trim()), y = { label: G[2].trim(), entries: [] };
      else {
        const Z = Ge(j.replace(/環境$/, "").trim());
        Z && /^(dev|staging|stg|prod|production|local|test)$/i.test(Z) ? (x = Z, y = { label: "アカウント", entries: [] }) : (x = null, y = { label: j, entries: [] });
      }
      continue;
    }
    if (b && !y) {
      const j = /^phase\s*:\s*(.+)$/i.exec(c);
      if (j) {
        b.phase = j[1].trim();
        continue;
      }
    }
    const L = /^\s*-\s+([^:]+?):\s*(.+)$/.exec(C);
    if (L && y && !T) {
      const j = L[1].trim(), G = L[2].trim().replace(/^`|`$/g, "");
      y.entries.push({
        key: j,
        value: G,
        kind: qt(j, G)
      });
      continue;
    }
    c === "" && k.length === 0 || (y ? k.push(C) : b || z.push(C));
  }
  S();
  const E = z.join(`
`).trim();
  return E && (g.preamble = E), g;
}
function Ot(t) {
  const r = /^---\n([\s\S]*?)\n---\n?/.exec(t);
  if (!r) return { meta: {}, body: t };
  const i = {};
  for (const l of r[1].split(`
`)) {
    const g = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(l);
    if (!g) continue;
    const z = g[1].toLowerCase(), b = g[2].trim().replace(/^["']|["']$/g, "");
    z === "title" ? i.title = b : z === "warning" && (i.warning = b);
  }
  return { meta: i, body: t.slice(r[0].length) };
}
function Pt(t) {
  if (t.length < 2) return null;
  const r = (g) => g.replace(/^\|/, "").replace(/\|$/, "").split("|").map((z) => z.trim()), i = r(t[0]);
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(t[1]))
    return { headers: i, rows: t.slice(1).map(r) };
  const l = t.slice(2).map(r);
  return { headers: i, rows: l };
}
function Ht(t) {
  const r = ["| " + t.headers.join(" | ") + " |"];
  r.push("| " + t.headers.map(() => "---").join(" | ") + " |");
  for (const i of t.rows) r.push("| " + i.join(" | ") + " |");
  return r;
}
function Ge(t) {
  const r = t.toLowerCase();
  return /^(staging|stg)$/.test(r) ? "staging" : /^(prod|production|本番)$/.test(r) ? "prod" : /^(dev|development|開発)$/.test(r) ? "dev" : /^(local|ローカル)$/.test(r) ? "local" : /^(test|テスト)$/.test(r) ? "test" : t;
}
function qt(t, r) {
  const i = t.toLowerCase();
  return /pass|pwd|password|パスワード/.test(i) ? "password" : /url|link|endpoint/.test(i) || /^https?:\/\//.test(r) ? "url" : /mail|email|メール/.test(i) || /^[^\s@]+@[^\s@]+$/.test(r) ? "email" : /user|id|name|account|ユーザー/.test(i) ? "user" : "text";
}
async function ut(t, r = typeof document < "u" ? document : null) {
  var g, z, b;
  const i = (g = r == null ? void 0 : r.defaultView) == null ? void 0 : g.navigator;
  if ((z = i == null ? void 0 : i.clipboard) != null && z.writeText)
    try {
      return await i.clipboard.writeText(t), !0;
    } catch {
    }
  if (typeof navigator < "u" && ((b = navigator.clipboard) != null && b.writeText))
    try {
      return await navigator.clipboard.writeText(t), !0;
    } catch {
    }
  const l = r ?? (typeof document < "u" ? document : null);
  if (!l) return !1;
  try {
    const x = l.createElement("textarea");
    x.value = t, x.setAttribute("readonly", ""), x.style.position = "fixed", x.style.top = "0", x.style.left = "0", x.style.width = "1px", x.style.height = "1px", x.style.opacity = "0", x.style.pointerEvents = "none", (l.body || l.documentElement).appendChild(x), x.focus(), x.select();
    const y = l.execCommand("copy");
    return x.remove(), y;
  } catch {
    return !1;
  }
}
const Oe = zt(null);
function Vt({ md: t, pipDocument: r = null }) {
  const i = ve(() => jt(t), [t]), [l, g] = v(
    () => new Set(i.projects.map((b) => b.name))
  ), z = q((b) => {
    g((x) => {
      const y = new Set(x);
      return y.has(b) ? y.delete(b) : y.add(b), y;
    });
  }, []);
  return /* @__PURE__ */ e(Oe.Provider, { value: r, children: /* @__PURE__ */ n("div", { className: "debug-env-tab", children: [
    i.title && /* @__PURE__ */ e("h3", { style: { margin: "0 0 8px", fontSize: "14px" }, children: i.title }),
    i.warning && /* @__PURE__ */ n(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 10px",
          marginBottom: "10px",
          background: "#FEF3C7",
          border: "1px solid #FCD34D",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#92400E"
        },
        children: [
          /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "warning" }),
          /* @__PURE__ */ e("span", { children: i.warning })
        ]
      }
    ),
    i.preamble && /* @__PURE__ */ e("div", { style: { marginBottom: "10px", fontSize: "12px" }, children: /* @__PURE__ */ e(Ee, { content: i.preamble }) }),
    i.projects.length === 0 && /* @__PURE__ */ e("div", { className: "debug-empty", children: "環境情報が空です" }),
    i.projects.map((b) => /* @__PURE__ */ e(
      Ut,
      {
        project: b,
        isExpanded: l.has(b.name),
        onToggle: () => z(b.name)
      },
      b.name
    ))
  ] }) });
}
function Ut({
  project: t,
  isExpanded: r,
  onToggle: i
}) {
  var b;
  const l = t.envs.map((x) => x.env), [g, z] = v(l[0] ?? null);
  return /* @__PURE__ */ n(
    "div",
    {
      style: {
        marginBottom: "10px",
        border: `1px solid ${s.gray300}`,
        borderRadius: "6px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: i,
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              width: "100%",
              padding: "8px 10px",
              background: s.gray100,
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              textAlign: "left"
            },
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: r ? "expand_more" : "chevron_right" }),
              /* @__PURE__ */ e("span", { children: t.name }),
              t.phase && /* @__PURE__ */ e(
                "span",
                {
                  style: {
                    marginLeft: "auto",
                    padding: "1px 8px",
                    background: s.gray200,
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: 400,
                    color: s.gray700
                  },
                  children: t.phase
                }
              )
            ]
          }
        ),
        r && /* @__PURE__ */ n("div", { style: { padding: "8px 10px" }, children: [
          t.common.map((x, y) => /* @__PURE__ */ e(Je, { section: x }, `common-${y}`)),
          t.envs.length > 0 && /* @__PURE__ */ n(ye, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "4px",
                  marginBottom: "8px",
                  borderBottom: `1px solid ${s.gray200}`
                },
                children: t.envs.map((x) => /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: () => z(x.env),
                    style: {
                      padding: "6px 12px",
                      background: "transparent",
                      border: "none",
                      borderBottom: g === x.env ? `2px solid ${s.primary}` : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: g === x.env ? 600 : 400,
                      color: g === x.env ? s.primary : s.gray700
                    },
                    children: x.env
                  },
                  x.env
                ))
              }
            ),
            (b = t.envs.find((x) => x.env === g)) == null ? void 0 : b.sections.map((x, y) => /* @__PURE__ */ e(Je, { section: x }, `${g}-${y}`))
          ] }),
          t.notes && /* @__PURE__ */ n("details", { style: { marginTop: "10px" }, children: [
            /* @__PURE__ */ e("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600, color: s.gray700 }, children: "📝 前提・注意点" }),
            /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Ee, { content: t.notes }) })
          ] })
        ] })
      ]
    }
  );
}
function Je({ section: t }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "10px" }, children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, color: s.gray700, marginBottom: "4px" }, children: t.label }),
    t.entries.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: t.entries.map((r, i) => /* @__PURE__ */ e(Gt, { entry: r }, i)) }),
    t.table && /* @__PURE__ */ e("div", { style: { marginTop: "6px", overflowX: "auto" }, children: /* @__PURE__ */ n("table", { style: { width: "100%", fontSize: "11px", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: t.table.headers.map((r, i) => /* @__PURE__ */ e(
        "th",
        {
          style: {
            padding: "4px 6px",
            borderBottom: `1px solid ${s.gray300}`,
            textAlign: "left",
            background: s.gray100
          },
          children: r
        },
        i
      )) }) }),
      /* @__PURE__ */ e("tbody", { children: t.table.rows.map((r, i) => /* @__PURE__ */ e("tr", { children: r.map((l, g) => /* @__PURE__ */ e(
        Jt,
        {
          value: l,
          header: t.table.headers[g] ?? ""
        },
        g
      )) }, i)) })
    ] }) }),
    t.extraMd && /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Ee, { content: t.extraMd }) })
  ] });
}
function Gt({ entry: t }) {
  const r = dt(Oe), [i, l] = v(!1), [g, z] = v(!1), b = async () => {
    await ut(t.value, r) && (z(!0), setTimeout(() => z(!1), 1200));
  }, x = t.kind === "password", y = x && !i ? "•".repeat(Math.min(t.value.length, 10)) : t.value, T = t.kind === "url" ? "link" : t.kind === "email" ? "mail" : t.kind === "password" ? "key" : t.kind === "user" ? "person" : "label";
  return /* @__PURE__ */ n(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 6px",
        background: "#F9FAFB",
        borderRadius: "4px",
        fontSize: "12px"
      },
      children: [
        /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px", color: s.gray500 }, children: T }),
        /* @__PURE__ */ e("span", { style: { minWidth: "60px", color: s.gray700 }, children: t.key }),
        /* @__PURE__ */ e(
          "span",
          {
            style: {
              flex: 1,
              fontFamily: t.kind === "password" || t.kind === "user" ? "monospace" : "inherit",
              wordBreak: "break-all"
            },
            children: y
          }
        ),
        x && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => l((d) => !d),
            title: i ? "隠す" : "表示",
            style: me,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: i ? "visibility_off" : "visibility" })
          }
        ),
        t.kind === "url" && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => window.open(t.value, "_blank", "noopener"),
            title: "開く",
            style: me,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "open_in_new" })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: b,
            title: g ? "コピーしました" : "コピー",
            style: { ...me, color: g ? s.success : me.color },
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: g ? "check" : "content_copy" })
          }
        )
      ]
    }
  );
}
function Jt({ value: t, header: r }) {
  const i = dt(Oe), l = /pass|pwd|パスワード/i.test(r), g = /^https?:\/\//.test(t), z = /^[^\s@]+@[^\s@]+$/.test(t), [b, x] = v(!1), [y, T] = v(!1), d = async () => {
    await ut(t, i) && (T(!0), setTimeout(() => T(!1), 1200));
  }, k = l && !b ? "•".repeat(Math.min(t.length, 10)) : t;
  return /* @__PURE__ */ e(
    "td",
    {
      style: {
        padding: "4px 6px",
        borderBottom: `1px solid ${s.gray200}`,
        fontFamily: l ? "monospace" : "inherit",
        wordBreak: "break-all"
      },
      children: /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
        g ? /* @__PURE__ */ e("a", { href: t, target: "_blank", rel: "noopener noreferrer", style: { color: s.primary, flex: 1 }, children: t }) : z ? /* @__PURE__ */ e("span", { style: { flex: 1 }, children: t }) : /* @__PURE__ */ e("span", { style: { flex: 1 }, children: k }),
        l && /* @__PURE__ */ e("button", { type: "button", onClick: () => x((A) => !A), style: me, title: b ? "隠す" : "表示", children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: b ? "visibility_off" : "visibility" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: d,
            style: { ...me, color: y ? s.success : me.color },
            title: y ? "コピーしました" : "コピー",
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: y ? "check" : "content_copy" })
          }
        )
      ] })
    }
  );
}
const me = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  color: s.gray500,
  display: "inline-flex",
  alignItems: "center"
};
function gt(t) {
  const r = (t == null ? void 0 : t.bottom) ?? "calc(env(safe-area-inset-bottom, 0px) + 24px)", i = (t == null ? void 0 : t.right) ?? "calc(env(safe-area-inset-right, 0px) + 24px)";
  return {
    position: "fixed",
    bottom: typeof r == "number" ? `${r}px` : r,
    right: typeof i == "number" ? `${i}px` : i,
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: s.primary,
    color: s.white,
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  };
}
gt();
const Ze = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)"
  },
  panel: {
    width: "min(400px, 92vw)",
    maxHeight: "90vh",
    background: s.white,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column"
  }
}, Zt = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${s.white};
    font-size: 14px;
    color: ${s.gray900};
    overflow: auto;
  }
`;
function xt() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    .debug-icon {
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
      text-rendering: optimizeLegibility;
      font-feature-settings: 'liga';
    }

    .debug-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      color: ${s.gray900};
      background: ${s.white};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    }
    .debug-panel * {
      box-sizing: border-box;
    }

    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: ${s.primary};
      color: ${s.white};
    }

    .debug-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .debug-header-left .debug-icon {
      color: ${s.secondary};
    }

    .debug-title {
      font-size: 16px;
      font-weight: 600;
    }

    .debug-env {
      font-size: 11px;
      padding: 2px 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      text-transform: uppercase;
    }

    .debug-header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .debug-refresh-btn {
      background: transparent;
      border: none;
      color: ${s.white};
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }
    .debug-refresh-btn:hover {
      background: rgba(255,255,255,0.15);
    }
    .debug-refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .debug-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: ${s.white};
      cursor: pointer;
    }

    .debug-close-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    /* タブ */
    .debug-tabs {
      display: flex;
      border-bottom: 1px solid ${s.gray200};
      background: ${s.gray100};
    }

    .debug-tab {
      flex: 1;
      padding: 10px 0;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      color: ${s.gray500};
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .debug-tab:hover {
      color: ${s.gray700};
    }

    .debug-tab.active {
      color: ${s.primary};
      border-bottom-color: ${s.primary};
    }

    .debug-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .debug-message {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
    }

    .debug-message-success {
      background: ${s.successBg};
      color: ${s.success};
    }

    .debug-message-error {
      background: ${s.errorBg};
      color: ${s.error};
    }

    .debug-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .debug-field label {
      font-size: 13px;
      font-weight: 500;
      color: ${s.gray700};
    }

    .debug-field input,
    .debug-field textarea,
    .debug-field select {
      padding: 10px 12px;
      border: 1px solid ${s.gray300};
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      color: ${s.gray900};
      background: ${s.white};
      transition: border-color 0.15s;
    }

    .debug-field input:focus,
    .debug-field textarea:focus,
    .debug-field select:focus {
      outline: none;
      border-color: ${s.primary};
    }

    .debug-field textarea {
      resize: vertical;
      min-height: 60px;
    }

    .debug-hint {
      font-size: 11px;
      color: ${s.gray500};
    }

    .debug-toggle {
      display: flex;
      justify-content: center;
    }

    .debug-toggle-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: transparent;
      border: 1px dashed ${s.gray300};
      border-radius: 6px;
      color: ${s.gray500};
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-toggle-btn:hover {
      border-color: ${s.primary};
      color: ${s.primary};
    }

    .debug-attach-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: ${s.gray100};
      border-radius: 8px;
    }

    .debug-attach-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: ${s.gray700};
      cursor: pointer;
    }

    .debug-attach-option input[type="checkbox"] {
      accent-color: ${s.primary};
    }

    .debug-footer {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid ${s.gray200};
      background: ${s.gray100};
    }

    .debug-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .debug-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .debug-btn-primary {
      background: ${s.primary};
      color: ${s.white};
    }

    .debug-btn-primary:hover:not(:disabled) {
      background: ${s.primaryHover};
    }

    .debug-btn-secondary {
      background: ${s.white};
      color: ${s.gray700};
      border: 1px solid ${s.gray300};
    }

    .debug-btn-secondary:hover:not(:disabled) {
      background: ${s.gray100};
    }

    /* 管理タブ: ステータスフィルタ */
    .debug-status-filter {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      padding-bottom: 8px;
      border-bottom: 1px solid ${s.gray200};
    }

    .debug-status-chip {
      padding: 4px 10px;
      border: 1px solid ${s.gray300};
      border-radius: 12px;
      background: ${s.white};
      color: ${s.gray500};
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-status-chip:hover {
      border-color: ${s.primary};
      color: ${s.primary};
    }

    .debug-status-chip.active {
      background: ${s.primary};
      border-color: ${s.primary};
      color: ${s.white};
    }

    .debug-filter-count {
      font-size: 11px;
      color: ${s.gray500};
      margin-left: auto;
    }

    /* 管理タブ */
    .debug-manage {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-note-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: ${s.gray100};
      border-radius: 8px;
    }

    .debug-note-row[data-status="resolved"] {
      background: #FFFBEB;
      border-left: 3px solid #F59E0B;
    }

    .debug-note-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .debug-note-id {
      font-size: 11px;
      color: ${s.gray500};
      font-family: monospace;
      min-width: 32px;
      flex-shrink: 0;
    }

    .debug-note-preview {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-source-badge {
      margin-right: 4px;
    }

    .debug-tc-badge {
      font-family: monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.12);
      color: #6366F1;
      white-space: nowrap;
    }

    .debug-severity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .debug-severity-dot.critical { background: #7C2D12; }
    .debug-severity-dot.high { background: ${s.error}; }
    .debug-severity-dot.medium { background: ${s.secondary}; }
    .debug-severity-dot.low { background: ${s.primary}; }
    .debug-severity-dot.none { background: ${s.gray300}; }

    .debug-status-select {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid ${s.gray300};
      border-radius: 4px;
      background: ${s.white};
      cursor: pointer;
      flex-shrink: 0;
    }

    .debug-empty {
      text-align: center;
      padding: 40px 16px;
      color: ${s.gray500};
      font-size: 13px;
    }

    /* テストタブ: ツリー */
    .debug-test-tree {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .debug-tree-domain {
      display: flex;
      flex-direction: column;
    }

    .debug-tree-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: ${s.gray900};
      font-weight: 600;
      width: 100%;
      text-align: left;
    }

    .debug-tree-toggle:hover {
      background: ${s.gray100};
      border-radius: 4px;
    }

    .debug-tree-label {
      flex: 1;
    }

    .debug-tree-count {
      font-size: 12px;
      color: ${s.gray500};
      font-weight: 500;
    }

    .debug-tree-status {
      font-size: 11px;
      font-weight: 600;
    }

    .debug-tree-issues {
      font-size: 11px;
      color: ${s.error};
      font-weight: 500;
    }

    .debug-tree-capability {
      margin-left: 16px;
      display: flex;
      flex-direction: column;
    }

    .debug-tree-cap-toggle {
      font-weight: 500;
      font-size: 13px;
    }

    .debug-tree-cases {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 0;
    }

    .debug-tree-case {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: ${s.gray700};
    }

    .debug-tree-case:hover {
      background: ${s.gray100};
    }

    .debug-tree-case input[type="checkbox"] {
      flex-shrink: 0;
      accent-color: ${s.primary};
    }

    .debug-tree-case-title {
      flex: 1;
    }

    .debug-tree-case-status {
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
    }

    /* バグ報告フォーム */
    .debug-bug-form {
      margin-top: 8px;
      padding: 12px;
      background: ${s.gray100};
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-bug-form-title {
      font-size: 12px;
      font-weight: 600;
      color: ${s.gray700};
      padding-bottom: 4px;
      border-bottom: 1px solid ${s.gray200};
    }

    .debug-bug-form .debug-field {
      gap: 4px;
    }

    .debug-bug-form .debug-field label {
      font-size: 12px;
    }

    .debug-bug-form .debug-field select,
    .debug-bug-form .debug-field textarea {
      padding: 6px 8px;
      font-size: 12px;
    }

    .debug-bug-form .debug-field textarea {
      min-height: 40px;
    }

    .debug-bug-cases {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 120px;
      overflow-y: auto;
    }

    .debug-bug-case-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: ${s.gray700};
    }

    .debug-bug-case-option:hover {
      background: ${s.gray200};
    }

    .debug-bug-case-option input[type="checkbox"] {
      accent-color: ${s.error};
      flex-shrink: 0;
    }

    .debug-cap-submit {
      margin-top: 8px;
      flex: none;
      padding: 8px 16px;
      font-size: 13px;
    }

    /* マニュアルタブ */
    .debug-manual-tab {
      display: flex;
      height: 100%;
      min-height: 0;
    }

    .debug-manual-sidebar {
      width: 140px;
      min-width: 140px;
      border-right: 1px solid ${s.gray200};
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px;
    }

    .debug-manual-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 6px 8px;
      border: none;
      background: transparent;
      font-size: 12px;
      color: ${s.gray700};
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-manual-item:hover {
      background: ${s.gray100};
    }

    .debug-manual-item.active {
      background: ${s.primary};
      color: ${s.white};
    }

    .debug-manual-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      min-width: 0;
    }

    /* Markdown スタイル
       .debug-panel でスコープする: MarkdownRenderer 自身が持つ :where(.manual-markdown ...)
       フォールバック（詳細度0）より確実に優先させるため、また ManualTabPage/ManualPiP の
       同名セレクタ（詳細度は同じ0,0,2,0）と、両者が同時にマウントされた場合に DOM 順序
       次第で優先順位が不定になるのを避けるため。 */
    .debug-panel .manual-markdown {
      font-size: 13px;
      line-height: 1.6;
      color: ${s.gray900};
    }

    .debug-panel .manual-markdown h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid ${s.gray200}; }
    .debug-panel .manual-markdown h2 { font-size: 17px; font-weight: 600; margin: 14px 0 6px; }
    .debug-panel .manual-markdown h3 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
    .debug-panel .manual-markdown h4 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; }

    .debug-panel .manual-markdown p { margin: 8px 0; }

    .debug-panel .manual-markdown ul, .debug-panel .manual-markdown ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .debug-panel .manual-markdown li { margin: 2px 0; }

    .debug-panel .manual-markdown code {
      background: ${s.gray100};
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .debug-panel .manual-markdown pre {
      background: ${s.gray100};
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .debug-panel .manual-markdown pre code {
      background: none;
      padding: 0;
    }

    .debug-panel .manual-markdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
      font-size: 12px;
    }

    .debug-panel .manual-markdown th, .debug-panel .manual-markdown td {
      border: 1px solid ${s.gray200};
      padding: 6px 8px;
      text-align: left;
    }

    .debug-panel .manual-markdown th {
      background: ${s.gray100};
      font-weight: 600;
    }

    .debug-panel .manual-markdown blockquote {
      border-left: 3px solid ${s.gray300};
      padding-left: 12px;
      margin: 8px 0;
      color: ${s.gray500};
    }

    .debug-panel .manual-markdown img {
      max-width: 100%;
      height: auto;
    }

    .debug-panel .manual-markdown hr {
      border: none;
      border-top: 1px solid ${s.gray200};
      margin: 16px 0;
    }

    /* ドロップゾーン */
    .debug-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 16px;
      border: 2px dashed ${s.gray300};
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
      background: ${s.white};
    }

    .debug-dropzone:hover {
      border-color: ${s.primary};
      background: ${s.gray100};
    }

    .debug-dropzone.dragging {
      border-color: ${s.primary};
      background: rgba(59, 130, 246, 0.05);
    }

    .debug-dropzone.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* サムネイル一覧 */
    .debug-thumbnails {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .debug-thumbnail {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid ${s.gray200};
    }

    .debug-thumbnail-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .debug-thumbnail-remove {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      color: ${s.white};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .debug-thumbnail-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2px 4px;
      background: rgba(0,0,0,0.5);
      color: ${s.white};
      font-size: 9px;
      text-align: center;
    }

    /* 管理タブ: ビュー切り替え */
    .debug-manage-toolbar {
      padding-bottom: 8px;
      border-bottom: 1px solid ${s.gray200};
    }

    .debug-view-toggle {
      display: flex;
      gap: 4px;
      background: ${s.gray100};
      border-radius: 8px;
      padding: 3px;
    }

    .debug-view-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: ${s.gray500};
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-view-btn:hover {
      color: ${s.gray700};
    }

    .debug-view-btn.active {
      background: ${s.white};
      color: ${s.primary};
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .debug-view-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: ${s.primary};
      color: ${s.white};
      font-size: 10px;
      font-weight: 600;
    }

    .debug-view-btn.active .debug-view-badge {
      background: ${s.secondary};
      color: ${s.gray900};
    }

    /* 確認手順ビュー */
    .debug-checklist-view {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .debug-checklist-card {
      border: 1px solid ${s.gray200};
      border-radius: 8px;
      overflow: hidden;
    }

    .debug-checklist-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: ${s.gray100};
      border-bottom: 1px solid ${s.gray200};
    }

    .debug-checklist-title {
      font-size: 13px;
      font-weight: 600;
      color: ${s.gray900};
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .debug-checklist-items {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }

    .debug-checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 12px;
      font-size: 13px;
      color: ${s.gray700};
      cursor: pointer;
      transition: background 0.1s;
      line-height: 1.4;
    }

    .debug-checklist-item:hover {
      background: ${s.gray100};
    }

    .debug-checklist-item input[type="checkbox"] {
      margin-top: 2px;
      flex-shrink: 0;
      accent-color: ${s.primary};
    }

    .debug-checklist-done {
      text-decoration: line-through;
      color: ${s.gray500};
    }

    .debug-checklist-no-items {
      padding: 12px;
      font-size: 12px;
      color: ${s.gray500};
      text-align: center;
    }

    .debug-checklist-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-top: 1px solid ${s.gray200};
      background: ${s.gray100};
    }

    .debug-checklist-progress {
      font-size: 12px;
      color: ${s.gray500};
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .debug-btn-resolve {
      padding: 6px 12px;
      font-size: 12px;
      background: ${s.primary};
      color: ${s.white};
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.15s;
    }

    .debug-btn-resolve:hover:not(:disabled) {
      background: ${s.primaryHover};
    }

    .debug-btn-resolve:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
}
function Qt() {
  return `${Zt}${xt()}`;
}
function Yt({
  apiBaseUrl: t,
  env: r = "dev",
  onSave: i,
  onClose: l,
  initialSize: g = { width: 400, height: 500 },
  testCases: z,
  logCapture: b,
  manualItems: x,
  manualDefaultPath: y,
  onManualNavigate: T,
  onManualAppNavigate: d,
  environmentsMd: k,
  triggerOffset: A
}) {
  var He, qe;
  const [m, I] = v(null), [_, S] = v(null), [E, h] = v(!1), C = ge(!1), [c, F] = v("record"), N = z && z.length > 0, L = x && x.length > 0, j = !!k && k.trim().length > 0, [G, Z] = v(""), [re, ne] = v(""), [H, w] = v(""), [u, f] = v(!1), [D, B] = v(!1), [R, M] = v(!1), [a, P] = v(!1), [J, X] = v(!1), [Q, ee] = v([]), [p, O] = v(null), [te, de] = v([]), [xe, Ce] = v(!1), Fe = ge(null);
  ie(() => {
    t && je(t);
  }, [t]);
  const { notes: We, createNote: Ie, updateStatus: Ne, refresh: we, error: Re } = ct(r), Te = ge(Re);
  Te.current = Re;
  const o = q(async () => {
    var ce;
    const U = typeof window < "u" && ((ce = window.matchMedia) == null ? void 0 : ce.call(window, "(max-width: 768px)").matches);
    if (!window.documentPictureInPicture || U) {
      window.documentPictureInPicture || console.warn("Document Picture-in-Picture API is not supported"), h(!0);
      return;
    }
    if (!C.current) {
      C.current = !0;
      try {
        const ae = await window.documentPictureInPicture.requestWindow({
          width: g.width,
          height: g.height
        }), pe = ae.document.createElement("link");
        pe.rel = "stylesheet", pe.href = Wt, ae.document.head.appendChild(pe);
        const ke = ae.document.createElement("style");
        ke.textContent = Qt(), ae.document.head.appendChild(ke);
        const Y = ae.document.createElement("div");
        Y.id = "debug-panel-root", ae.document.body.appendChild(Y), I(ae), S(Y), h(!0), ae.addEventListener("pagehide", () => {
          I(null), S(null), h(!1), l == null || l();
        });
      } catch (ae) {
        console.error("Failed to open PiP window:", ae), h(!0);
      } finally {
        C.current = !1;
      }
    }
  }, [g.width, g.height, l]), $ = q(() => {
    m ? m.close() : (h(!1), l == null || l());
  }, [m, l]), V = ge(m);
  V.current = m, ie(() => () => {
    var U;
    (U = V.current) == null || U.close();
  }, []), ie(() => {
    if (typeof document > "u" || document.getElementById("twuw-debug-panel-styles")) return;
    const U = document.createElement("style");
    U.id = "twuw-debug-panel-styles", U.textContent = xt(), document.head.appendChild(U);
  }, []);
  const le = q(() => {
    Z(""), ne(""), w(""), ee([]), B(!1), M(!1), P(!1), X(!1), O(null);
  }, []), Me = q(async () => {
    var ke;
    if (!G.trim()) {
      O({ type: "error", text: "内容は必須です" });
      return;
    }
    f(!0), O(null);
    const ce = ((b == null ? void 0 : b.getNetworkLogs()) ?? []).map((Y) => {
      const he = {
        timestamp: Y.timestamp,
        method: Y.method,
        url: Y.url,
        status: Y.status
      }, Ve = ["POST", "PUT", "DELETE", "PATCH"].includes(Y.method);
      return Ve && (Y.requestBody !== void 0 && (he.requestBody = Y.requestBody), Y.responseBody !== void 0 && (he.responseBody = Y.responseBody)), !Ve && R && Y.responseBody !== void 0 && (he.responseBody = Y.responseBody), a && Y.duration != null && (he.duration = Y.duration), J && (Y.requestHeaders && (he.requestHeaders = Y.requestHeaders), Y.responseHeaders && (he.responseHeaders = Y.responseHeaders)), he;
    }), ae = {
      content: G.trim(),
      userLog: re ? Et(re) : void 0,
      severity: H || void 0,
      testCaseIds: te.length > 0 ? te : void 0,
      consoleLogs: b == null ? void 0 : b.getConsoleLogs(),
      networkLogs: ce.length > 0 ? ce : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, pe = await Ie(ae);
    if (pe) {
      if (Q.length > 0)
        try {
          for (const Y of Q)
            await oe.uploadAttachment(r, pe.id, Y);
        } catch (Y) {
          console.warn("Failed to upload some attachments:", Y), O({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), f(!1);
          return;
        }
      O({ type: "success", text: "保存しました" }), i == null || i(pe), setTimeout(() => {
        le();
      }, 1500);
    } else
      O({ type: "error", text: ((ke = Te.current) == null ? void 0 : ke.message) || "保存に失敗しました" });
    f(!1);
  }, [G, re, H, te, Q, R, a, J, Ie, i, le, b, r]), wt = q(async () => {
    var U;
    Ce(!0);
    try {
      c === "manage" ? we() : c === "test" && await ((U = Fe.current) == null ? void 0 : U.refresh());
    } finally {
      Ce(!1);
    }
  }, [c, we]), Pe = /* @__PURE__ */ n("div", { className: "debug-panel", children: [
    /* @__PURE__ */ n("header", { className: "debug-header", children: [
      /* @__PURE__ */ n("div", { className: "debug-header-left", children: [
        /* @__PURE__ */ e("span", { className: "debug-icon", children: "edit_note" }),
        /* @__PURE__ */ e("span", { className: "debug-title", children: "デバッグノート" }),
        /* @__PURE__ */ e("span", { className: "debug-env", children: r })
      ] }),
      /* @__PURE__ */ n("div", { className: "debug-header-right", children: [
        c !== "record" && /* @__PURE__ */ e(
          "button",
          {
            className: "debug-refresh-btn",
            onClick: wt,
            disabled: xe,
            title: "データを更新",
            children: /* @__PURE__ */ e(
              "span",
              {
                className: "debug-icon",
                style: {
                  fontSize: "18px",
                  animation: xe ? "spin 0.6s linear infinite" : "none"
                },
                children: "sync"
              }
            )
          }
        ),
        /* @__PURE__ */ e("button", { onClick: $, className: "debug-close-btn", "aria-label": "閉じる", children: /* @__PURE__ */ e("span", { className: "debug-icon", children: "close" }) })
      ] })
    ] }),
    /* @__PURE__ */ n("nav", { className: "debug-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "record" ? "active" : ""}`,
          onClick: () => {
            F("record"), O(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "manage" ? "active" : ""}`,
          onClick: () => F("manage"),
          children: "管理"
        }
      ),
      N && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "test" ? "active" : ""}`,
          onClick: () => F("test"),
          children: "テスト"
        }
      ),
      L && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "manual" ? "active" : ""}`,
          onClick: () => F("manual"),
          children: "マニュアル"
        }
      ),
      j && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "env" ? "active" : ""}`,
          onClick: () => F("env"),
          children: "環境"
        }
      )
    ] }),
    /* @__PURE__ */ n("main", { className: "debug-content", children: [
      c === "record" && /* @__PURE__ */ n(ye, { children: [
        te.length > 0 && /* @__PURE__ */ n(
          "div",
          {
            className: "debug-running-cases-badge",
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              marginBottom: "8px",
              background: "#EEF2FF",
              border: "1px solid #C7D2FE",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#3730A3"
            },
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "science" }),
              /* @__PURE__ */ n("span", { children: [
                "実行中: ",
                te.map((U) => `#${U}`).join(", ")
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => de([]),
                  style: {
                    marginLeft: "auto",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#3730A3",
                    fontSize: "11px"
                  },
                  title: "紐付けを解除",
                  children: "解除"
                }
              )
            ]
          }
        ),
        p && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${p.type}`, children: p.text }),
        /* @__PURE__ */ n("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-severity", children: "重要度（任意）" }),
          /* @__PURE__ */ n(
            "select",
            {
              id: "debug-severity",
              value: H,
              onChange: (U) => w(U.target.value),
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "未設定" }),
                /* @__PURE__ */ e("option", { value: "critical", children: "Critical" }),
                /* @__PURE__ */ e("option", { value: "high", children: "High" }),
                /* @__PURE__ */ e("option", { value: "medium", children: "Medium" }),
                /* @__PURE__ */ e("option", { value: "low", children: "Low" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ n("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-content", children: "内容 *" }),
          /* @__PURE__ */ e(
            "textarea",
            {
              id: "debug-content",
              value: G,
              onChange: (U) => Z(U.target.value),
              placeholder: "詳細な説明",
              rows: 4,
              maxLength: 4e3
            }
          )
        ] }),
        /* @__PURE__ */ n("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-log", children: "補足メモ（任意）" }),
          /* @__PURE__ */ e(
            "textarea",
            {
              id: "debug-log",
              value: re,
              onChange: (U) => ne(U.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          pt,
          {
            files: Q,
            onAdd: (U) => ee((ce) => [...ce, ...U]),
            onRemove: (U) => ee((ce) => ce.filter((ae, pe) => pe !== U)),
            disabled: u,
            pipDocument: ((He = V.current) == null ? void 0 : He.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => B(!D),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: D ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        D && /* @__PURE__ */ n("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: R,
                onChange: (U) => M(U.target.checked)
              }
            ),
            "GETレスポンスを含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: a,
                onChange: (U) => P(U.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: J,
                onChange: (U) => X(U.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      c === "manage" && /* @__PURE__ */ e(At, { notes: We, updateStatus: Ne }),
      c === "manual" && L && /* @__PURE__ */ e(
        Dt,
        {
          items: x,
          defaultPath: y,
          onNavigate: T,
          onAppNavigate: d
        }
      ),
      c === "env" && j && /* @__PURE__ */ e(Vt, { md: k, pipDocument: ((qe = V.current) == null ? void 0 : qe.document) ?? null }),
      c === "test" && N && /* @__PURE__ */ e(
        Lt,
        {
          ref: Fe,
          testCases: z,
          env: r,
          logCapture: b,
          onNotesRefresh: we,
          onRunningCasesChange: de
        }
      )
    ] }),
    c === "record" && /* @__PURE__ */ n("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: le, className: "debug-btn debug-btn-secondary", disabled: u, children: "クリア" }),
      /* @__PURE__ */ e("button", { onClick: Me, className: "debug-btn debug-btn-primary", disabled: u, children: u ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          display: "inline-block",
          width: "14px",
          height: "14px",
          border: "2px solid rgba(255,255,255,0.3)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite"
        } }),
        "保存中"
      ] }) : "保存" })
    ] })
  ] });
  return _ ? _t(Pe, _) : E ? /* @__PURE__ */ e("div", { style: Ze.overlay, children: /* @__PURE__ */ e("div", { style: Ze.panel, children: Pe }) }) : /* @__PURE__ */ e("button", { onClick: o, style: gt(A), "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ n("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
    "バグ",
    /* @__PURE__ */ e("br", {}),
    "記録"
  ] }) });
}
function se({ size: t = 16, color: r }) {
  return /* @__PURE__ */ n(ye, { children: [
    /* @__PURE__ */ e(
      "span",
      {
        role: "status",
        "aria-label": "読み込み中",
        style: {
          display: "inline-block",
          width: `${t}px`,
          height: `${t}px`,
          border: `2px solid ${r || "currentColor"}30`,
          borderTopColor: r || "currentColor",
          borderRadius: "50%",
          animation: "debug-notes-spin 0.6s linear infinite"
        }
      }
    ),
    /* @__PURE__ */ e("style", { children: "@keyframes debug-notes-spin { to { transform: rotate(360deg); } }" })
  ] });
}
function W({ name: t, size: r = 20, color: i }) {
  return /* @__PURE__ */ e(
    "span",
    {
      className: "material-symbols-outlined",
      style: {
        fontSize: `${r}px`,
        color: i,
        lineHeight: 1,
        verticalAlign: "middle"
      },
      children: t
    }
  );
}
const Kt = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, Xt = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function en({ domains: t, colors: r, isDarkMode: i }) {
  const l = i ? Xt : Kt;
  return t.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "40px",
    textAlign: "center",
    color: r.textMuted,
    fontSize: "14px"
  }, children: "テストケースが登録されていません" }) : /* @__PURE__ */ n("div", { style: { marginBottom: "32px" }, children: [
    /* @__PURE__ */ e("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: r.textSecondary,
      marginBottom: "16px"
    }, children: "テスト概要" }),
    /* @__PURE__ */ e("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "16px"
    }, children: t.map((g) => /* @__PURE__ */ e(
      tn,
      {
        domain: g,
        colors: r,
        tc: l
      },
      g.domain
    )) }),
    /* @__PURE__ */ n("div", { style: {
      display: "flex",
      gap: "20px",
      marginTop: "16px",
      fontSize: "12px",
      color: r.textMuted
    }, children: [
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: l.passed
        } }),
        "passed"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: l.fail
        } }),
        "fail / 要対応"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: l.retest
        } }),
        "retest"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: l.untested
        } }),
        "未テスト"
      ] })
    ] })
  ] });
}
function tn({ domain: t, colors: r, tc: i }) {
  return /* @__PURE__ */ n("div", { style: {
    background: r.bg,
    border: `1px solid ${r.border}`,
    borderRadius: "12px",
    padding: "20px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "15px",
      fontWeight: 700,
      color: r.text,
      marginBottom: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ e("span", { children: t.domain }),
      /* @__PURE__ */ n("span", { style: {
        fontSize: "12px",
        fontWeight: 500,
        color: r.textMuted
      }, children: [
        t.passed,
        "/",
        t.total
      ] })
    ] }),
    /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: t.capabilities.map((l) => /* @__PURE__ */ e(
      nn,
      {
        cap: l,
        colors: r,
        tc: i
      },
      l.capability
    )) })
  ] });
}
function nn({ cap: t, colors: r, tc: i }) {
  const l = t.status === "fail" ? i.fail : t.status === "retest" ? i.retest : t.status === "passed" ? i.passed : i.untested, g = t.status === "fail" ? i.failBg : t.status === "retest" ? i.retestBg : t.status === "passed" ? i.passedBg : i.untestedBg;
  return /* @__PURE__ */ n("div", { style: {
    borderLeft: `4px solid ${l}`,
    background: g,
    borderRadius: "0 8px 8px 0",
    padding: "10px 12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    }, children: [
      /* @__PURE__ */ e("span", { style: {
        fontSize: "13px",
        fontWeight: 500,
        color: r.text
      }, children: t.capability }),
      /* @__PURE__ */ n("span", { style: {
        fontSize: "12px",
        color: r.textMuted
      }, children: [
        t.passed,
        "/",
        t.total
      ] })
    ] }),
    /* @__PURE__ */ n("div", { style: {
      display: "flex",
      height: "8px",
      borderRadius: "4px",
      overflow: "hidden",
      background: i.untested
    }, children: [
      t.passed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${t.passed / t.total * 100}%`,
        background: i.passed
      } }),
      t.failed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${t.failed / t.total * 100}%`,
        background: i.fail
      } })
    ] })
  ] });
}
const rn = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, an = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function on({ tree: t, colors: r, isDarkMode: i, onNavigateToNote: l }) {
  const g = i ? an : rn, [z, b] = v(/* @__PURE__ */ new Set()), [x, y] = v(/* @__PURE__ */ new Set());
  ie(() => {
    b((S) => {
      const E = new Set(S);
      return t.forEach((h) => E.add(h.domain)), E;
    });
  }, [t]);
  const [T, d] = v("all"), [k, A] = v(!1), m = (S) => {
    b((E) => {
      const h = new Set(E);
      return h.has(S) ? h.delete(S) : h.add(S), h;
    });
  }, I = (S) => {
    y((E) => {
      const h = new Set(E);
      return h.has(S) ? h.delete(S) : h.add(S), h;
    });
  }, _ = ve(() => t.map((S) => {
    const E = S.capabilities.filter((h) => {
      const C = h.passed === h.total && h.total > 0, c = h.failed > 0 || h.openIssues > 0, F = h.passed < h.total;
      return !(T === "passed" && !C || T === "fail" && !c || T === "incomplete" && !F || k && C && h.openIssues === 0);
    });
    return E.length === 0 ? null : { ...S, capabilities: E };
  }).filter((S) => S !== null), [t, T, k]);
  return t.length === 0 ? null : /* @__PURE__ */ n("div", { children: [
    /* @__PURE__ */ e("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: r.textSecondary,
      marginBottom: "16px"
    }, children: "詳細" }),
    /* @__PURE__ */ n("div", { style: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "16px"
    }, children: [
      /* @__PURE__ */ n(
        "select",
        {
          value: T,
          onChange: (S) => d(S.target.value),
          style: {
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: r.bgSecondary,
            color: r.text,
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ e("option", { value: "all", children: "全て" }),
            /* @__PURE__ */ e("option", { value: "passed", children: "passed" }),
            /* @__PURE__ */ e("option", { value: "fail", children: "fail" }),
            /* @__PURE__ */ e("option", { value: "incomplete", children: "未完了" })
          ]
        }
      ),
      /* @__PURE__ */ n("label", { style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        color: r.textSecondary,
        cursor: "pointer"
      }, children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: k,
            onChange: (S) => A(S.target.checked),
            style: { accentColor: r.primary }
          }
        ),
        "要対応のみ"
      ] })
    ] }),
    /* @__PURE__ */ n("div", { style: {
      border: `1px solid ${r.border}`,
      borderRadius: "12px",
      overflow: "hidden"
    }, children: [
      _.map((S, E) => {
        const h = z.has(S.domain), C = S.capabilities.reduce((N, L) => N + L.total, 0), c = S.capabilities.reduce((N, L) => N + L.passed, 0), F = C > 0 ? Math.round(c / C * 100) : 0;
        return /* @__PURE__ */ n("div", { children: [
          /* @__PURE__ */ n(
            "div",
            {
              onClick: () => m(S.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: r.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${r.border}`,
                borderTop: E > 0 ? `1px solid ${r.border}` : "none",
                gap: "8px",
                userSelect: "none"
              },
              children: [
                /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: r.textMuted, width: "16px" }, children: h ? "▼" : "▶" }),
                /* @__PURE__ */ e("span", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: r.text,
                  flex: 1
                }, children: S.domain }),
                /* @__PURE__ */ n("span", { style: {
                  fontSize: "13px",
                  color: r.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  c,
                  "/",
                  C,
                  " ",
                  F,
                  "%"
                ] })
              ]
            }
          ),
          h && S.capabilities.map((N) => {
            const L = `${S.domain}/${N.capability}`, j = x.has(L), G = N.passed === N.total && N.total > 0, Z = N.cases.some((f) => f.last === "fail" && f.openIssues > 0), re = N.cases.some((f) => f.last === "fail" && f.openIssues === 0), ne = !Z && re, H = Z, w = G ? "●" : H ? "▲" : ne ? "◆" : "○", u = G ? g.passed : H ? g.fail : ne ? g.retest : g.untested;
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => I(L),
                  style: {
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px 10px 44px",
                    background: r.bg,
                    cursor: "pointer",
                    borderBottom: `1px solid ${r.borderLight}`,
                    gap: "8px",
                    userSelect: "none"
                  },
                  children: [
                    /* @__PURE__ */ e("span", { style: { color: u, fontSize: "14px", width: "16px" }, children: w }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: r.text,
                      flex: 1
                    }, children: N.capability }),
                    /* @__PURE__ */ n("span", { style: {
                      fontSize: "12px",
                      color: r.textMuted,
                      fontVariantNumeric: "tabular-nums"
                    }, children: [
                      N.passed,
                      "/",
                      N.total
                    ] }),
                    G && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: g.passed,
                      fontWeight: 600
                    }, children: "passed" }),
                    H && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: g.fail,
                      fontWeight: 600
                    }, children: "fail" }),
                    ne && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: g.retest,
                      fontWeight: 600
                    }, children: "retest" }),
                    N.openIssues > 0 && /* @__PURE__ */ n("span", { style: {
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${g.fail}18`,
                      color: g.fail,
                      fontWeight: 600
                    }, children: [
                      N.openIssues,
                      "件"
                    ] })
                  ]
                }
              ),
              j && N.cases.map((f) => /* @__PURE__ */ e(
                ln,
                {
                  c: f,
                  tc: g,
                  colors: r,
                  onNavigateToNote: l
                },
                f.caseId
              ))
            ] }, L);
          })
        ] }, S.domain);
      }),
      _.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: r.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function ln({ c: t, tc: r, colors: i, onNavigateToNote: l }) {
  const g = t.last === "fail" && t.openIssues === 0, z = t.last === "pass" ? "●" : g ? "◆" : t.last === "fail" ? "▲" : "○", b = t.last === "pass" ? r.passed : g ? r.retest : t.last === "fail" ? r.fail : r.untested;
  return /* @__PURE__ */ n("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: i.bg,
    borderBottom: `1px solid ${i.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: b, fontSize: "12px", width: "16px" }, children: z }),
    /* @__PURE__ */ e("span", { style: { color: i.text, flex: 1 }, children: t.title }),
    /* @__PURE__ */ e("span", { style: {
      fontSize: "11px",
      color: i.textMuted
    }, children: t.last || "-" }),
    t.openIssues > 0 && /* @__PURE__ */ n(
      "button",
      {
        onClick: (x) => {
          x.stopPropagation(), l(t.caseId);
        },
        style: {
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "10px",
          background: `${r.fail}18`,
          color: i.link,
          fontWeight: 600,
          border: "none",
          cursor: "pointer"
        },
        children: [
          t.openIssues,
          "件"
        ]
      }
    )
  ] });
}
const sn = 3e4;
function dn({ env: t, colors: r, isDarkMode: i, onNavigateToNote: l, refreshKey: g }) {
  const [z, b] = v([]), [x, y] = v(!0), [T, d] = v(null), k = ge(0);
  ie(() => {
    let m = !1;
    const I = ++k.current, _ = async () => {
      try {
        const E = await oe.getTestTree(t);
        !m && k.current === I && (b(E), d(null));
      } catch (E) {
        !m && k.current === I && d(E instanceof Error ? E.message : "Failed to fetch test tree");
      } finally {
        !m && k.current === I && y(!1);
      }
    };
    y(!0), _();
    const S = setInterval(_, sn);
    return () => {
      m = !0, clearInterval(S);
    };
  }, [t, g]);
  const A = ve(() => z.map((m) => {
    let I = 0, _ = 0, S = 0, E = !1;
    const h = m.capabilities.map((c) => {
      const F = c.total - c.passed - c.failed;
      I += c.total, _ += c.passed, S += c.failed, (c.failed > 0 || c.openIssues > 0) && (E = !0);
      const N = c.passed === c.total && c.total > 0, L = c.cases.some((Z) => Z.last === "fail" && Z.openIssues > 0), j = c.cases.some((Z) => Z.last === "fail" && Z.openIssues === 0), G = N ? "passed" : L ? "fail" : j ? "retest" : "incomplete";
      return {
        capability: c.capability,
        total: c.total,
        passed: c.passed,
        failed: c.failed,
        untested: F < 0 ? 0 : F,
        openIssues: c.openIssues,
        status: G,
        cases: c.cases
      };
    }), C = I - _ - S;
    return {
      domain: m.domain,
      total: I,
      passed: _,
      failed: S,
      untested: C < 0 ? 0 : C,
      hasIssues: E,
      capabilities: h
    };
  }), [z]);
  return x && z.length === 0 ? /* @__PURE__ */ n("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    color: r.textMuted,
    gap: "12px"
  }, children: [
    /* @__PURE__ */ e(se, { size: 24, color: r.primary }),
    /* @__PURE__ */ e("span", { style: { fontSize: "14px" }, children: "テストデータを読み込み中..." })
  ] }) : T && z.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "24px",
    background: r.errorBg,
    color: r.error,
    borderRadius: "12px",
    margin: "24px",
    fontSize: "13px"
  }, children: T }) : /* @__PURE__ */ e("div", { style: {
    padding: "32px",
    overflow: "auto",
    flex: 1
  }, children: /* @__PURE__ */ n("div", { style: { maxWidth: "1200px" }, children: [
    /* @__PURE__ */ e(
      en,
      {
        domains: A,
        colors: r,
        isDarkMode: i
      }
    ),
    /* @__PURE__ */ e(
      on,
      {
        tree: z,
        colors: r,
        isDarkMode: i,
        onNavigateToNote: l
      }
    )
  ] }) });
}
const ht = "Asia/Tokyo";
function ft(t) {
  return t ? /[Zz]$/.test(t) || /[+-]\d{2}:?\d{2}$/.test(t) ? new Date(t) : /* @__PURE__ */ new Date(t.replace(" ", "T") + "Z") : /* @__PURE__ */ new Date(NaN);
}
function bt(t) {
  const r = ft(t);
  return isNaN(r.getTime()) ? "-" : r.toLocaleString("ja-JP", {
    timeZone: ht,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function mt(t) {
  const r = ft(t);
  return isNaN(r.getTime()) ? "-" : r.toLocaleString("ja-JP", {
    timeZone: ht,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: !1
  });
}
const Be = {
  bug: { label: "不具合", icon: "bug_report" },
  question: { label: "質問", icon: "help" },
  request: { label: "要望", icon: "lightbulb" },
  share: { label: "共有", icon: "share" },
  other: { label: "その他", icon: "more_horiz" }
}, cn = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, Ae = {
  app: "アプリ",
  manual: "マニュアル"
}, Qe = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function Ye(t) {
  const r = cn[t] ?? "#6B7280";
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: `${r}15`,
    color: r,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function Ke(t, r) {
  let i, l;
  switch (t) {
    case "open":
      i = r.warningBg, l = r.warning;
      break;
    case "in_progress":
      i = r.primaryLight, l = r.primary;
      break;
    case "closed":
      i = r.successBg, l = r.success;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: i,
    color: l,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function pn({ apiBaseUrl: t, adminKey: r, colors: i, isDarkMode: l, refreshKey: g }) {
  var X, Q, ee;
  const {
    feedbacks: z,
    total: b,
    page: x,
    limit: y,
    loading: T,
    error: d,
    filters: k,
    customTags: A,
    setFilters: m,
    setPage: I,
    updateStatus: _,
    remove: S,
    refresh: E
  } = Bt({ apiBaseUrl: t, adminKey: r }), [h, C] = v(null), [c, F] = v(null), [N, L] = v(!1), [j, G] = v(null), [Z, re] = v(null), ne = ge(0), H = ge(g);
  ie(() => {
    g !== H.current && (H.current = g, E());
  }, [g, E]);
  const w = Math.max(1, Math.ceil(b / y)), u = q(async (p) => {
    if (h === p) return;
    C(p), L(!0), F(null);
    const O = ++ne.current;
    try {
      const te = await Ft({ apiBaseUrl: t, adminKey: r, id: p });
      if (ne.current !== O) return;
      F(te);
    } catch {
      if (ne.current !== O) return;
      F(null);
    }
    ne.current === O && L(!1);
  }, [h, t, r]), f = q(async (p, O) => {
    await _(p, O) && (c == null ? void 0 : c.id) === p && F((de) => de ? { ...de, status: O } : null);
  }, [_, c == null ? void 0 : c.id]), D = q(async (p) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await S(p) && h === p && (C(null), F(null));
  }, [S, h]), B = q(async (p, O) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await It({ apiBaseUrl: t, adminKey: r, feedbackId: p, attachmentId: O }), F((te) => {
          var de;
          return !te || te.id !== p ? te : {
            ...te,
            attachments: (de = te.attachments) == null ? void 0 : de.filter((xe) => xe.id !== O)
          };
        });
      } catch (te) {
        console.error("Failed to delete attachment:", te);
      }
  }, [t, r]), R = q((p) => {
    try {
      const O = new URL(t);
      return `${O.origin}${O.pathname.replace(/\/$/, "")}/attachments/${p}`;
    } catch {
      return `${t}/attachments/${p}`;
    }
  }, [t]), M = q(async (p) => {
    re(p);
    try {
      await Rt({ apiBaseUrl: t, adminKey: r, format: p });
    } catch (O) {
      console.error("Export failed:", O);
    } finally {
      re(null);
    }
  }, [t, r]), a = {
    open: z.filter((p) => p.status === "open").length,
    inProgress: z.filter((p) => p.status === "in_progress").length,
    closed: z.filter((p) => p.status === "closed").length
  }, P = l ? "#0D1117" : "#1E293B", J = l ? "#21262D" : "#2D3748";
  return /* @__PURE__ */ n("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
    /* @__PURE__ */ n("aside", { style: {
      width: "380px",
      borderRight: `1px solid ${i.border}`,
      display: "flex",
      flexDirection: "column",
      background: i.bgSecondary
    }, children: [
      /* @__PURE__ */ n("div", { style: {
        padding: "16px",
        display: "flex",
        gap: "10px",
        borderBottom: `1px solid ${i.border}`,
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ n(
          "select",
          {
            value: k.status,
            onChange: (p) => m({ status: p.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: i.bg,
              color: i.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全ステータス" }),
              Qe.map((p) => /* @__PURE__ */ e("option", { value: p.value, children: p.label }, p.value))
            ]
          }
        ),
        /* @__PURE__ */ n(
          "select",
          {
            value: k.kind,
            onChange: (p) => m({ kind: p.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: i.bg,
              color: i.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全種別" }),
              /* @__PURE__ */ e("option", { value: "bug", children: "不具合" }),
              /* @__PURE__ */ e("option", { value: "question", children: "質問" }),
              /* @__PURE__ */ e("option", { value: "request", children: "要望" }),
              /* @__PURE__ */ e("option", { value: "share", children: "共有" }),
              /* @__PURE__ */ e("option", { value: "other", children: "その他" })
            ]
          }
        ),
        /* @__PURE__ */ n(
          "select",
          {
            value: k.target,
            onChange: (p) => m({ target: p.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: i.bg,
              color: i.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
              /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
              /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
            ]
          }
        ),
        A.length > 0 && /* @__PURE__ */ n(
          "select",
          {
            value: k.customTag,
            onChange: (p) => m({ customTag: p.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: i.bg,
              color: i.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
              A.map((p) => /* @__PURE__ */ e("option", { value: p, children: p }, p))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", padding: "12px" }, children: [
        T && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: i.textMuted }, children: [
          /* @__PURE__ */ e(se, { size: 24, color: i.primary }),
          /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
        ] }),
        d && /* @__PURE__ */ e("div", { style: {
          padding: "16px",
          background: i.errorBg,
          color: i.error,
          borderRadius: "12px",
          margin: "8px",
          fontSize: "13px"
        }, children: d.message }),
        !T && z.length === 0 && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: i.textMuted }, children: [
          /* @__PURE__ */ e(W, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        z.map((p) => {
          const O = Be[p.kind] ?? { label: p.kind, icon: "help" }, te = h === p.id;
          return /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: i.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: te ? `2px solid ${i.primary}` : "2px solid transparent",
                boxShadow: te ? `0 4px 12px ${i.primary}30` : `0 1px 3px ${i.border}`,
                transition: "all 0.2s"
              },
              onClick: () => u(p.id),
              children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ n("span", { style: { fontSize: "11px", color: i.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    p.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: Ye(p.kind), children: [
                    /* @__PURE__ */ e(W, { name: O.icon, size: 12 }),
                    O.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: Ke(p.status, i), children: p.status === "open" ? "Open" : p.status === "in_progress" ? "対応中" : "完了" }),
                  p.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: i.bgTertiary,
                    color: i.textSecondary,
                    fontWeight: 500
                  }, children: Ae[p.target] ?? p.target }),
                  p.customTag && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${i.primary}15`,
                    color: i.primary,
                    fontWeight: 500
                  }, children: p.customTag })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: i.text,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }, children: p.message.split(`
`)[0].slice(0, 80) }),
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: i.textMuted
                }, children: [
                  /* @__PURE__ */ e("span", { children: un(p.createdAt) }),
                  p.pageUrl && /* @__PURE__ */ n(ye, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ n("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      background: i.bgTertiary,
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "180px"
                    }, children: [
                      /* @__PURE__ */ e(W, { name: "link", size: 12 }),
                      p.pageUrl
                    ] })
                  ] }),
                  (p.attachmentCount ?? 0) > 0 && /* @__PURE__ */ n(ye, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ n("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "11px",
                      color: i.textMuted
                    }, children: [
                      /* @__PURE__ */ e(W, { name: "image", size: 12 }),
                      p.attachmentCount
                    ] })
                  ] })
                ] })
              ]
            },
            p.id
          );
        })
      ] }),
      w > 1 && /* @__PURE__ */ n("div", { style: {
        padding: "12px 16px",
        borderTop: `1px solid ${i.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }, children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => I(x - 1),
            disabled: x <= 1,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: i.bg,
              color: x <= 1 ? i.textMuted : i.text,
              cursor: x <= 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: /* @__PURE__ */ e(W, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ n("span", { style: { fontSize: "13px", color: i.textSecondary }, children: [
          x,
          " / ",
          w
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => I(x + 1),
            disabled: x >= w,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: i.bg,
              color: x >= w ? i.textMuted : i.text,
              cursor: x >= w ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: /* @__PURE__ */ e(W, { name: "chevron_right", size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { style: {
        padding: "16px",
        borderTop: `1px solid ${i.border}`,
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        fontSize: "12px",
        color: i.textMuted
      }, children: [
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "description", size: 16 }),
          b,
          " 件"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "error", size: 16, color: i.warning }),
          a.open,
          " Open"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "pending", size: 16, color: i.primary }),
          a.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "check_circle", size: 16, color: i.success }),
          a.closed,
          " 完了"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ n("main", { style: {
      flex: 1,
      overflow: "auto",
      padding: "32px",
      background: i.bg
    }, children: [
      h && N && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: i.textMuted }, children: [
        /* @__PURE__ */ e(se, { size: 32, color: i.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      h && !N && c && /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ n("span", { style: Ye(c.kind), children: [
                /* @__PURE__ */ e(W, { name: ((X = Be[c.kind]) == null ? void 0 : X.icon) ?? "help", size: 14 }),
                ((Q = Be[c.kind]) == null ? void 0 : Q.label) ?? c.kind
              ] }),
              /* @__PURE__ */ e("span", { style: Ke(c.status, i), children: c.status === "open" ? "Open" : c.status === "in_progress" ? "対応中" : "完了" }),
              c.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: i.bgTertiary,
                color: i.textSecondary,
                fontWeight: 500
              }, children: Ae[c.target] ?? c.target }),
              c.customTag && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: `${i.primary}15`,
                color: i.primary,
                fontWeight: 600
              }, children: c.customTag })
            ] }),
            /* @__PURE__ */ n("h2", { style: {
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: i.text,
              lineHeight: 1.3,
              letterSpacing: "-0.025em"
            }, children: [
              "#",
              c.id,
              " フィードバック"
            ] })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ e(
              "select",
              {
                value: c.status,
                onChange: (p) => f(c.id, p.target.value),
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: i.bgSecondary,
                  color: i.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer"
                },
                children: Qe.map((p) => /* @__PURE__ */ e("option", { value: p.value, children: p.label }, p.value))
              }
            ),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => D(c.id),
                style: {
                  padding: "10px 16px",
                  background: i.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: i.error,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                },
                children: [
                  /* @__PURE__ */ e(W, { name: "delete", size: 16 }),
                  "削除"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ n("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ e(fe, { icon: "category", label: "種別", value: ((ee = Be[c.kind]) == null ? void 0 : ee.label) ?? c.kind, colors: i }),
          /* @__PURE__ */ e(fe, { icon: "ads_click", label: "対象", value: c.target ? Ae[c.target] ?? c.target : "-", colors: i }),
          /* @__PURE__ */ e(fe, { icon: "schedule", label: "日時", value: gn(c.createdAt), colors: i }),
          c.pageUrl && /* @__PURE__ */ e(fe, { icon: "link", label: "URL", value: c.pageUrl, isLink: !0, colors: i }),
          c.userType && /* @__PURE__ */ e(fe, { icon: "person", label: "ユーザー", value: c.userType, colors: i }),
          c.appVersion && /* @__PURE__ */ e(fe, { icon: "inventory_2", label: "バージョン", value: c.appVersion, colors: i })
        ] }),
        /* @__PURE__ */ e(ze, { icon: "chat", title: "メッセージ", colors: i, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: i.text
        }, children: c.message }) }),
        c.environment && Object.keys(c.environment).length > 0 && /* @__PURE__ */ e(ze, { icon: "devices", title: "環境情報", colors: i, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: Object.entries(c.environment).map(([p, O]) => /* @__PURE__ */ e(fe, { icon: "info", label: p, value: String(O), colors: i }, p)) }) }),
        c.consoleLogs && c.consoleLogs.length > 0 && /* @__PURE__ */ e(ze, { icon: "terminal", title: `コンソールログ (${c.consoleLogs.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: P }, children: c.consoleLogs.map((p, O) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${J}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: p.level === "error" ? "#F87171" : p.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: p.level === "error" ? "#7F1D1D40" : p.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: p.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: p.message })
        ] }, O)) }) }),
        c.networkLogs && c.networkLogs.length > 0 && /* @__PURE__ */ e(ze, { icon: "wifi", title: `ネットワークログ (${c.networkLogs.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: P }, children: c.networkLogs.map((p, O) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${J}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ e("span", { style: { fontWeight: 600, color: "#94A3B8", width: "40px", flexShrink: 0 }, children: p.method }),
          /* @__PURE__ */ e("span", { style: { color: p.status >= 400 ? "#F87171" : "#34D399", fontWeight: 600, flexShrink: 0 }, children: p.status }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: p.url }),
          /* @__PURE__ */ e("span", { style: { color: "#64748B", flexShrink: 0 }, children: p.duration != null ? `${p.duration}ms` : "-" })
        ] }, O)) }) }),
        c.attachments && c.attachments.length > 0 && /* @__PURE__ */ e(ze, { icon: "image", title: `添付画像 (${c.attachments.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: {
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }, children: c.attachments.map((p) => /* @__PURE__ */ n("div", { style: {
          position: "relative",
          width: "120px",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${i.border}`,
          background: i.bgSecondary
        }, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: R(p.filename),
              alt: p.original_name,
              style: {
                width: "100%",
                height: "100px",
                objectFit: "cover",
                cursor: "pointer",
                display: "block"
              },
              onClick: () => G(R(p.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => B(c.id, p.id),
              style: {
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "24px",
                height: "24px",
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
              title: "画像を削除",
              children: /* @__PURE__ */ e(W, { name: "close", size: 14 })
            }
          ),
          /* @__PURE__ */ e("div", { style: {
            padding: "6px 8px",
            fontSize: "11px",
            color: i.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: p.original_name })
        ] }, p.id)) }) }),
        j && /* @__PURE__ */ e(
          "div",
          {
            onClick: () => G(null),
            style: {
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
            children: /* @__PURE__ */ e(
              "img",
              {
                src: j,
                alt: "拡大画像",
                style: {
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }
              }
            )
          }
        )
      ] }),
      h && !N && !c && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: i.textMuted }, children: [
        /* @__PURE__ */ e(W, { name: "error_outline", size: 48 }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px", fontSize: "16px" }, children: "詳細の取得に失敗しました" })
      ] }),
      !h && /* @__PURE__ */ n("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: i.textMuted,
        gap: "24px"
      }, children: [
        /* @__PURE__ */ n("div", { style: {
          padding: "24px 32px",
          background: i.bgSecondary,
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%"
        }, children: [
          /* @__PURE__ */ n("div", { style: {
            fontSize: "14px",
            fontWeight: 600,
            color: i.textSecondary,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }, children: [
            /* @__PURE__ */ e(W, { name: "analytics", size: 18 }),
            "フィードバック概要"
          ] }),
          /* @__PURE__ */ n("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "13px",
            color: i.textSecondary,
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.text }, children: b }),
              " 件"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.warning }, children: a.open }),
              " Open"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.primary }, children: a.inProgress }),
              " 対応中"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.success }, children: a.closed }),
              " 完了"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }, children: ["json", "csv", "sqlite"].map((p) => /* @__PURE__ */ n(
            "button",
            {
              onClick: () => M(p),
              disabled: Z !== null,
              style: {
                padding: "8px 14px",
                background: i.bg,
                border: "none",
                borderRadius: "10px",
                cursor: Z !== null ? "not-allowed" : "pointer",
                color: i.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: Z !== null && Z !== p ? 0.5 : 1,
                boxShadow: `0 1px 3px ${i.border}`,
                transition: "all 0.2s"
              },
              children: [
                Z === p ? /* @__PURE__ */ e(se, { size: 14, color: i.text }) : /* @__PURE__ */ e(W, { name: "download", size: 16 }),
                p.toUpperCase()
              ]
            },
            p
          )) })
        ] }),
        /* @__PURE__ */ n("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ e(W, { name: "arrow_back", size: 48 }),
          /* @__PURE__ */ e("div", { style: { fontSize: "16px", fontWeight: 500, marginTop: "12px" }, children: "フィードバックを選択してください" }),
          /* @__PURE__ */ e("div", { style: { fontSize: "13px", marginTop: "6px" }, children: "左のリストから選択すると詳細が表示されます" })
        ] })
      ] })
    ] })
  ] });
}
function fe({ icon: t, label: r, value: i, isLink: l, colors: g }) {
  return /* @__PURE__ */ n("div", { style: {
    padding: "16px",
    background: g.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "12px",
      color: g.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(W, { name: t, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: l ? g.link : g.text,
      fontFamily: l ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: i })
  ] });
}
function ze({ icon: t, title: r, children: i, colors: l }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ n("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: l.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(W, { name: t, size: 18 }),
      r
    ] }),
    i
  ] });
}
function un(t) {
  return mt(t);
}
function gn(t) {
  return bt(t);
}
const yt = {
  primary: "#6366F1",
  primaryLight: "#EEF2FF",
  primaryDark: "#4F46E5",
  accent: "#EC4899",
  bg: "#FFFFFF",
  bgSecondary: "#F9FAFB",
  bgTertiary: "#F3F4F6",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  error: "#EF4444",
  errorBg: "#FEF2F2",
  success: "#10B981",
  successBg: "#ECFDF5",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  critical: "#7C2D12",
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#3B82F6",
  link: "#6366F1"
}, xn = {
  primary: "#818CF8",
  primaryLight: "#1E1B4B",
  primaryDark: "#A5B4FC",
  accent: "#F472B6",
  bg: "#0F172A",
  bgSecondary: "#1E293B",
  bgTertiary: "#334155",
  border: "#334155",
  borderLight: "#475569",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  error: "#F87171",
  errorBg: "#450A0A",
  success: "#34D399",
  successBg: "#064E3B",
  warning: "#FBBF24",
  warningBg: "#78350F",
  critical: "#FB923C",
  high: "#F87171",
  medium: "#FBBF24",
  low: "#60A5FA",
  link: "#818CF8"
}, hn = {
  fix: "直したこと",
  improve: "使いやすくしたこと",
  feature: "新しくできること"
};
function fn(t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  return r ? `${Number(r[1])}年${Number(r[2])}月${Number(r[3])}日` : t;
}
function bn({ apiBaseUrl: t, env: r, adminKey: i, colors: l = yt, refreshKey: g = 0 }) {
  const z = { apiBaseUrl: t, env: r, adminKey: i }, [b, x] = v([]), [y, T] = v(null), [d, k] = v(!0), [A, m] = v(null), [I, _] = v(null), [S, E] = v(/* @__PURE__ */ new Set()), [h, C] = v(null), [c, F] = v(null), [N, L] = v(null), j = q(async () => {
    k(!0), m(null);
    try {
      const [u, f] = await Promise.all([
        Se.list(z),
        Se.tokens(z)
      ]);
      x(u), T(f);
    } catch (u) {
      m(u instanceof Error ? u.message : "リリースノートの取得に失敗しました");
    } finally {
      k(!1);
    }
  }, [t, r, i]);
  ie(() => {
    j();
  }, [j, g]);
  const G = q(
    async (u, f) => {
      _(u.id), m(null);
      try {
        await Se.update(z, u.id, f), await j();
      } catch (D) {
        m(D instanceof Error ? D.message : "更新に失敗しました");
      } finally {
        _(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, r, i, j]
  ), Z = q(async (u) => {
    F(null), _(u.id), m(null);
    try {
      await Se.remove(z, u.id), await j();
    } catch (f) {
      m(f instanceof Error ? f.message : "削除に失敗しました");
    } finally {
      _(null);
    }
  }, [t, r, i, j]), re = q(async (u) => {
    L(null), m(null);
    try {
      T(await Se.rotateToken(z, u));
    } catch (f) {
      m(f instanceof Error ? f.message : "再発行に失敗しました");
    }
  }, [t, r, i]), ne = q(async (u, f) => {
    try {
      await navigator.clipboard.writeText(f), C(u), setTimeout(() => C((D) => D === u ? null : D), 2e3);
    } catch {
      m("クリップボードにコピーできませんでした");
    }
  }, []), H = (u) => E((f) => {
    const D = new Set(f);
    return D.has(u) ? D.delete(u) : D.add(u), D;
  }), w = (u = "default") => ({
    padding: "5px 10px",
    fontSize: "12px",
    borderRadius: "6px",
    cursor: "pointer",
    border: `1px solid ${u === "danger" ? l.error : u === "primary" ? l.primary : l.border}`,
    background: u === "primary" ? l.primary : "transparent",
    color: u === "primary" ? "#FFF" : u === "danger" ? l.error : l.text
  });
  return /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", padding: "20px 24px", background: l.bg, color: l.text }, children: [
    A && /* @__PURE__ */ e("div", { style: {
      marginBottom: "16px",
      padding: "10px 14px",
      borderRadius: "8px",
      background: l.errorBg,
      color: l.error,
      fontSize: "13px"
    }, children: A }),
    /* @__PURE__ */ n("section", { style: {
      marginBottom: "24px",
      padding: "14px 16px",
      borderRadius: "10px",
      background: l.bgSecondary,
      border: `1px solid ${l.border}`
    }, children: [
      /* @__PURE__ */ e("h3", { style: { margin: "0 0 4px", fontSize: "13px", fontWeight: 700 }, children: "公開 URL" }),
      /* @__PURE__ */ e("p", { style: { margin: "0 0 12px", fontSize: "12px", color: l.textMuted }, children: "クライアントに渡すのは「社外公開」の URL です。ログイン不要で開けます。" }),
      y ? /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: [
        /* @__PURE__ */ e(
          et,
          {
            label: "社外公開（クライアント向け）",
            hint: "公開済み かつ 社外公開 の号だけが出ます",
            url: y.public.pageUrl,
            colors: l,
            copied: h === "public",
            onCopy: () => ne("public", y.public.pageUrl),
            onRotate: () => L("public"),
            btn: w
          }
        ),
        /* @__PURE__ */ e(
          et,
          {
            label: "アプリ内表示用（feedUrl）",
            hint: "ReleaseNotes コンポーネントに渡す URL。社内向けの号も含みます",
            url: y.internal.feedUrl,
            colors: l,
            copied: h === "internal",
            onCopy: () => ne("internal", y.internal.feedUrl),
            onRotate: () => L("internal"),
            btn: w
          }
        )
      ] }) : /* @__PURE__ */ e("p", { style: { margin: 0, fontSize: "12px", color: l.textMuted }, children: "読み込み中…" }),
      N && /* @__PURE__ */ n("div", { style: {
        marginTop: "12px",
        padding: "10px 12px",
        borderRadius: "8px",
        background: l.warningBg,
        color: l.warning,
        fontSize: "12px"
      }, children: [
        "URL を再発行すると、これまでに配った URL は開けなくなります。実行しますか？",
        /* @__PURE__ */ n("div", { style: { display: "flex", gap: "8px", marginTop: "8px" }, children: [
          /* @__PURE__ */ e("button", { type: "button", style: w("danger"), onClick: () => void re(N), children: "再発行する" }),
          /* @__PURE__ */ e("button", { type: "button", style: w(), onClick: () => L(null), children: "やめる" })
        ] })
      ] })
    ] }),
    d && b.length === 0 && /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: l.textMuted, fontSize: "13px" }, children: [
      /* @__PURE__ */ e(se, { size: 16, color: l.textMuted }),
      "読み込み中…"
    ] }),
    !d && b.length === 0 && /* @__PURE__ */ e("p", { style: { fontSize: "13px", color: l.textMuted }, children: "まだリリースノートがありません。文面の投入は feedback-fix のリリースノート画面から行います。" }),
    b.map((u) => {
      const f = I === u.id, D = S.has(u.id);
      return /* @__PURE__ */ n(
        "article",
        {
          style: {
            marginBottom: "12px",
            borderRadius: "10px",
            overflow: "hidden",
            border: `1px solid ${l.border}`,
            background: l.bgSecondary,
            opacity: f ? 0.6 : 1
          },
          children: [
            /* @__PURE__ */ n("div", { style: { padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }, children: [
              /* @__PURE__ */ n("div", { style: { flex: 1, minWidth: "240px" }, children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }, children: [
                  /* @__PURE__ */ e("span", { style: { fontSize: "13px", fontWeight: 700 }, children: u.version }),
                  /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: l.textSecondary }, children: u.title }),
                  /* @__PURE__ */ e(
                    Xe,
                    {
                      text: u.status === "published" ? "公開済み" : "下書き",
                      fg: u.status === "published" ? l.success : l.textMuted,
                      bg: u.status === "published" ? l.successBg : l.bgTertiary
                    }
                  ),
                  u.is_public && /* @__PURE__ */ e(Xe, { text: "社外公開", fg: l.warning, bg: l.warningBg })
                ] }),
                /* @__PURE__ */ n("p", { style: { margin: "4px 0 0", fontSize: "11px", color: l.textMuted }, children: [
                  fn(u.released_on),
                  " ・ 項目 ",
                  u.items.length,
                  " 件 ・ メディア ",
                  u.images.length,
                  " 件"
                ] })
              ] }),
              /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    style: w(u.status === "published" ? "default" : "primary"),
                    disabled: f,
                    onClick: () => void G(u, { status: u.status === "published" ? "draft" : "published" }),
                    children: u.status === "published" ? "下書きに戻す" : "公開する"
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    style: w(u.is_public ? "default" : "primary"),
                    disabled: f || u.status !== "published",
                    title: u.status !== "published" ? "先に公開してください" : void 0,
                    onClick: () => void G(u, { is_public: !u.is_public }),
                    children: u.is_public ? "社外公開をやめる" : "社外公開にする"
                  }
                ),
                /* @__PURE__ */ e("button", { type: "button", style: w(), onClick: () => H(u.id), children: D ? "閉じる" : "内容" }),
                /* @__PURE__ */ e("button", { type: "button", style: w("danger"), disabled: f, onClick: () => F(u), children: /* @__PURE__ */ e(W, { name: "delete", size: 14, color: l.error }) })
              ] })
            ] }),
            (c == null ? void 0 : c.id) === u.id && /* @__PURE__ */ n("div", { style: {
              padding: "10px 16px",
              background: l.errorBg,
              color: l.error,
              fontSize: "12px"
            }, children: [
              "「",
              u.version,
              " ",
              u.title,
              "」を削除します。添付された画像・動画も一緒に消えます。",
              /* @__PURE__ */ n("div", { style: { display: "flex", gap: "8px", marginTop: "8px" }, children: [
                /* @__PURE__ */ e("button", { type: "button", style: w("danger"), onClick: () => void Z(u), children: "削除する" }),
                /* @__PURE__ */ e("button", { type: "button", style: w(), onClick: () => F(null), children: "やめる" })
              ] })
            ] }),
            D && /* @__PURE__ */ n("div", { style: { padding: "12px 16px", borderTop: `1px solid ${l.borderLight}`, background: l.bg }, children: [
              u.summary && /* @__PURE__ */ e("p", { style: { margin: "0 0 10px", fontSize: "12px", color: l.textSecondary, whiteSpace: "pre-wrap" }, children: u.summary }),
              u.items.length === 0 ? /* @__PURE__ */ e("p", { style: { margin: 0, fontSize: "12px", color: l.textMuted }, children: "項目がありません" }) : /* @__PURE__ */ e("ol", { style: { margin: 0, paddingLeft: "18px", fontSize: "12px" }, children: u.items.map((B) => /* @__PURE__ */ n("li", { style: { marginBottom: "8px" }, children: [
                /* @__PURE__ */ n("span", { style: { color: l.textMuted }, children: [
                  "[",
                  hn[B.category],
                  "]"
                ] }),
                " ",
                B.headline,
                B.feedback_id !== null && /* @__PURE__ */ n("span", { style: { color: l.textMuted }, children: [
                  " ・報告 #",
                  B.feedback_id
                ] }),
                (B.before_text || B.after_text) && /* @__PURE__ */ n("div", { style: { marginTop: "2px", color: l.textSecondary }, children: [
                  B.before_text && /* @__PURE__ */ n("div", { children: [
                    "これまで: ",
                    B.before_text
                  ] }),
                  B.after_text && /* @__PURE__ */ n("div", { children: [
                    "これから: ",
                    B.after_text
                  ] })
                ] }),
                u.images.filter((R) => R.item_id === B.id).length > 0 && /* @__PURE__ */ n("div", { style: { color: l.textMuted, marginTop: "2px" }, children: [
                  "添付 ",
                  u.images.filter((R) => R.item_id === B.id).length,
                  " 件"
                ] })
              ] }, B.id)) })
            ] })
          ]
        },
        u.id
      );
    })
  ] });
}
function Xe({ text: t, fg: r, bg: i }) {
  return /* @__PURE__ */ e("span", { style: { fontSize: "10px", padding: "1px 7px", borderRadius: "999px", background: i, color: r }, children: t });
}
function et({
  label: t,
  hint: r,
  url: i,
  colors: l,
  copied: g,
  onCopy: z,
  onRotate: b,
  btn: x
}) {
  return /* @__PURE__ */ n("div", { children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, marginBottom: "2px" }, children: t }),
    /* @__PURE__ */ e("div", { style: { fontSize: "11px", color: l.textMuted, marginBottom: "4px" }, children: r }),
    /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }, children: [
      /* @__PURE__ */ e("code", { style: {
        flex: 1,
        minWidth: "220px",
        padding: "5px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        background: l.bgTertiary,
        color: l.textSecondary,
        wordBreak: "break-all"
      }, children: i }),
      /* @__PURE__ */ e("button", { type: "button", style: x(g ? "primary" : "default"), onClick: z, children: g ? "コピーしました" : "コピー" }),
      /* @__PURE__ */ e("a", { href: i, target: "_blank", rel: "noreferrer", style: { ...x(), textDecoration: "none" }, children: "開く" }),
      /* @__PURE__ */ e("button", { type: "button", style: x(), onClick: b, children: "再発行" })
    ] })
  ] });
}
const mn = 3e4;
function Wn({ apiBaseUrl: t, env: r = "dev", feedbackApiBaseUrl: i, feedbackAdminKey: l }) {
  const [g, z] = v(""), [b, x] = v(""), [y, T] = v(""), [d, k] = v(null), [A, m] = v(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [I, _] = v(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 768px)").matches);
  ie(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(max-width: 768px)"), $ = (V) => _(V.matches);
    return o.addEventListener("change", $), () => o.removeEventListener("change", $);
  }, []);
  const [S, E] = v(!0), [h, C] = v(null), [c, F] = v("notes"), N = !!(i && l), [L, j] = v(null), [G, Z] = v(0), [re, ne] = v(null), [H, w] = v(null), [u, f] = v(""), [D, B] = v(""), [R, M] = v(!1), a = A ? xn : yt;
  ie(() => {
    t && je(t);
  }, [t]), ie(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(prefers-color-scheme: dark)"), $ = (V) => m(V.matches);
    return o.addEventListener("change", $), () => o.removeEventListener("change", $);
  }, []);
  const { notes: P, loading: J, error: X, updateStatus: Q, updateSeverity: ee, deleteNote: p, refresh: O } = ct(r);
  ie(() => {
    !J && h === "refresh" && C(null);
  }, [J, h]), ie(() => {
    if (d) {
      const o = P.find(($) => $.id === d.id);
      k(o ? ($) => $ ? {
        ...o,
        attachments: o.attachments ?? $.attachments,
        activities: o.activities ?? $.activities,
        console_log: o.console_log ?? $.console_log,
        network_log: o.network_log ?? $.network_log,
        environment: o.environment ?? $.environment
      } : o : null);
    }
  }, [P]), ie(() => {
    if (!S) return;
    const o = setInterval(() => {
      O();
    }, mn);
    return () => clearInterval(o);
  }, [S, O]);
  const te = q((o) => {
    const V = `${t || Ue()}/export/${o}?env=${r}`;
    window.open(V, "_blank");
  }, [t, r]), de = q((o) => {
    j(o), z("open"), F("notes");
  }, []), xe = ve(() => P.filter((o) => {
    if (g && o.status !== g || b && (o.source || "manual") !== b || L != null && !(o.test_case_ids ?? (o.test_case_id ? [o.test_case_id] : [])).includes(L))
      return !1;
    if (y) {
      const $ = y.match(/^#([1-9]\d*)$/);
      if ($) {
        if (o.id !== Number($[1])) return !1;
      } else {
        const V = y.toLowerCase();
        if (!o.title.toLowerCase().includes(V) && !o.content.toLowerCase().includes(V)) return !1;
      }
    }
    return !0;
  }), [P, g, b, L, y]), Ce = q((o, $) => {
    $ === "fixed" || $ === "resolved" || $ === "rejected" || $ === "closed" ? (w({ id: o, status: $ }), f("")) : (async () => {
      C(`status-${o}`);
      try {
        await Q(o, $), (d == null ? void 0 : d.id) === o && k((V) => V ? { ...V, status: $ } : null);
      } finally {
        C(null);
      }
    })();
  }, [Q, d == null ? void 0 : d.id]), Fe = q(async () => {
    if (!H) return;
    const { id: o, status: $ } = H;
    if (!(($ === "fixed" || $ === "rejected") && u.trim() === "")) {
      C(`status-${o}`);
      try {
        const V = u.trim() ? { comment: u.trim() } : void 0;
        if (await Q(o, $, V), (d == null ? void 0 : d.id) === o && k((le) => le ? { ...le, status: $ } : null), w(null), f(""), (d == null ? void 0 : d.id) === o)
          try {
            const le = await oe.getNote(r, o);
            k(le);
          } catch {
          }
      } finally {
        C(null);
      }
    }
  }, [H, u, Q, d == null ? void 0 : d.id, r]), We = q(async (o, $) => {
    C(`severity-${o}`);
    try {
      await ee(o, $), (d == null ? void 0 : d.id) === o && k((V) => V ? { ...V, severity: $ } : null);
    } finally {
      C(null);
    }
  }, [ee, d == null ? void 0 : d.id]), Ie = q(async (o) => {
    k(o);
    try {
      const $ = await oe.getNote(r, o.id);
      k($);
    } catch {
    }
  }, [r]), Ne = q(async (o) => {
    if (confirm("このノートを削除しますか？")) {
      C(`delete-${o}`);
      try {
        await p(o), (d == null ? void 0 : d.id) === o && k(null);
      } finally {
        C(null);
      }
    }
  }, [p, d == null ? void 0 : d.id]), we = q(async (o, $) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await oe.deleteAttachment(r, o, $), k((V) => {
          var le;
          return !V || V.id !== o ? V : {
            ...V,
            attachments: (le = V.attachments) == null ? void 0 : le.filter((Me) => Me.id !== $)
          };
        });
      } catch (V) {
        console.error("Failed to delete attachment:", V);
      }
  }, [r]), Re = q(async () => {
    if (!(!d || D.trim() === "")) {
      M(!0);
      try {
        const o = await oe.addActivity(r, d.id, { content: D.trim() });
        k(($) => $ && {
          ...$,
          activities: [...$.activities || [], o]
        }), B("");
      } catch (o) {
        console.error("Failed to add comment:", o);
      } finally {
        M(!1);
      }
    }
  }, [d, D, r]), Te = (o) => {
    if (!o) return [];
    try {
      const $ = JSON.parse(o);
      return Array.isArray($) ? $ : [];
    } catch {
      return o.split(`
`).filter(($) => $.trim());
    }
  };
  return /* @__PURE__ */ n("div", { style: yn(a), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ n("header", { style: {
      ...vn(a),
      padding: I ? "12px 16px" : "16px 24px",
      flexWrap: "wrap",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: I ? "8px" : "16px", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${a.primary}, ${a.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF"
          }, children: /* @__PURE__ */ e(W, { name: "bug_report", size: 24, color: "#FFF" }) }),
          /* @__PURE__ */ n("div", { children: [
            /* @__PURE__ */ e("h1", { style: {
              fontSize: "18px",
              fontWeight: 700,
              margin: 0,
              color: a.text,
              letterSpacing: "-0.025em"
            }, children: "Debug Notes" }),
            /* @__PURE__ */ e("span", { style: {
              fontSize: "12px",
              color: a.textMuted
            }, children: "バグ管理ダッシュボード" })
          ] })
        ] }),
        /* @__PURE__ */ e("span", { style: {
          fontSize: "11px",
          padding: "4px 10px",
          background: a.primary,
          color: "#FFFFFF",
          borderRadius: "20px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }, children: r })
      ] }),
      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
        /* @__PURE__ */ n("label", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: a.textSecondary,
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "8px",
          background: S ? a.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: S ? a.success : a.textMuted,
            animation: S ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: S,
              onChange: (o) => E(o.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => te("json"),
            style: {
              padding: "8px 14px",
              background: a.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: a.text,
              fontWeight: 500,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            },
            title: "JSON エクスポート",
            children: [
              /* @__PURE__ */ e(W, { name: "download", size: 16 }),
              "JSON"
            ]
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => te("sqlite"),
            style: {
              padding: "8px 14px",
              background: a.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: a.text,
              fontWeight: 500,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            },
            title: "SQLite エクスポート",
            children: [
              /* @__PURE__ */ e(W, { name: "download", size: 16 }),
              "SQLite"
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => m(!A),
            style: {
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: a.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "transform 0.2s",
              color: a.text
            },
            title: A ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(W, { name: A ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => {
              C("refresh"), O(), Z((o) => o + 1);
            },
            disabled: h !== null,
            style: {
              padding: "10px 20px",
              background: a.primary,
              border: "none",
              borderRadius: "10px",
              cursor: h !== null ? "not-allowed" : "pointer",
              color: "#FFF",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: h !== null ? 0.6 : 1
            },
            children: [
              h === "refresh" ? /* @__PURE__ */ e(se, { size: 18, color: "#FFF" }) : /* @__PURE__ */ e(W, { name: "refresh", size: 18, color: "#FFF" }),
              "更新"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e("nav", { style: {
      display: "flex",
      gap: "0",
      padding: "0 24px",
      borderBottom: `1px solid ${a.border}`,
      background: a.bg
    }, children: [
      { key: "notes", label: "ノート一覧" },
      { key: "test-status", label: "テスト状況" },
      ...N ? [{ key: "feedback", label: "フィードバック" }] : [],
      { key: "release-notes", label: "リリースノート" }
    ].map(({ key: o, label: $ }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          F(o), o === "test-status" && j(null);
        },
        style: {
          padding: "12px 20px",
          border: "none",
          borderBottom: c === o ? `2px solid ${a.primary}` : "2px solid transparent",
          background: "transparent",
          color: c === o ? a.primary : a.textSecondary,
          fontWeight: c === o ? 600 : 400,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s"
        },
        children: $
      },
      o
    )) }),
    c === "test-status" ? /* @__PURE__ */ e(
      dn,
      {
        env: r,
        colors: a,
        isDarkMode: A,
        onNavigateToNote: de,
        refreshKey: G
      }
    ) : c === "feedback" && N ? /* @__PURE__ */ e(
      pn,
      {
        apiBaseUrl: i,
        adminKey: l,
        colors: a,
        isDarkMode: A,
        refreshKey: G
      }
    ) : c === "release-notes" ? /* @__PURE__ */ e(
      bn,
      {
        apiBaseUrl: t ?? Ue(),
        env: r,
        adminKey: l,
        colors: a,
        refreshKey: G
      }
    ) : /* @__PURE__ */ n("div", { style: {
      display: "flex",
      flexDirection: I ? "column" : "row",
      flex: 1,
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ n("aside", { style: {
        width: I ? "100%" : "380px",
        flex: I ? "1 1 auto" : "0 0 auto",
        minHeight: 0,
        borderRight: I ? "none" : `1px solid ${a.border}`,
        borderBottom: I ? `1px solid ${a.border}` : "none",
        display: I && d ? "none" : "flex",
        flexDirection: "column",
        background: a.bgSecondary,
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ n("div", { style: {
          padding: I ? "12px" : "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          borderBottom: `1px solid ${a.border}`
        }, children: [
          /* @__PURE__ */ n(
            "select",
            {
              "data-testid": "status-filter",
              value: g,
              onChange: (o) => z(o.target.value),
              style: {
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: a.bg,
                color: a.text,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: `0 1px 3px ${a.border}`
              },
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "すべて" }),
                /* @__PURE__ */ e("option", { value: "open", children: "Open" }),
                /* @__PURE__ */ e("option", { value: "fixed", children: "Fixed" }),
                /* @__PURE__ */ e("option", { value: "resolved", children: "Resolved" }),
                /* @__PURE__ */ e("option", { value: "closed", children: "クローズ" }),
                /* @__PURE__ */ e("option", { value: "rejected", children: "Rejected" })
              ]
            }
          ),
          /* @__PURE__ */ n(
            "select",
            {
              value: b,
              onChange: (o) => x(o.target.value),
              style: {
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: a.bg,
                color: a.text,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: `0 1px 3px ${a.border}`
              },
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "全source" }),
                /* @__PURE__ */ e("option", { value: "manual", children: "Manual" }),
                /* @__PURE__ */ e("option", { value: "test", children: "Test" })
              ]
            }
          ),
          /* @__PURE__ */ n("div", { style: {
            flex: 1,
            position: "relative"
          }, children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: y,
                onChange: (o) => T(o.target.value),
                placeholder: "検索...",
                style: {
                  width: "100%",
                  padding: "10px 14px 10px 40px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bg,
                  color: a.text,
                  fontSize: "13px",
                  boxShadow: `0 1px 3px ${a.border}`
                }
              }
            ),
            /* @__PURE__ */ e("span", { style: {
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: a.textMuted
            }, children: /* @__PURE__ */ e(W, { name: "search", size: 18 }) })
          ] })
        ] }),
        L != null && /* @__PURE__ */ e("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${a.border}`,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }, children: /* @__PURE__ */ n("span", { style: {
          fontSize: "12px",
          padding: "4px 10px",
          borderRadius: "20px",
          background: `${a.primary}15`,
          color: a.primary,
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px"
        }, children: [
          "テストケース #",
          L,
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => j(null),
              style: {
                border: "none",
                background: "transparent",
                color: a.primary,
                cursor: "pointer",
                padding: "0 2px",
                fontSize: "14px",
                lineHeight: 1
              },
              children: "✕"
            }
          )
        ] }) }),
        /* @__PURE__ */ n("div", { style: {
          flex: 1,
          overflow: "auto",
          padding: "12px"
        }, children: [
          J && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(W, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          X && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: a.errorBg,
            color: a.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: X.message }),
          !J && xe.length === 0 && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(W, { name: "inbox", size: 40 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "ノートがありません" })
          ] }),
          xe.map((o) => /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: a.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: (d == null ? void 0 : d.id) === o.id ? `2px solid ${a.primary}` : "2px solid transparent",
                boxShadow: (d == null ? void 0 : d.id) === o.id ? `0 4px 12px ${a.primary}30` : `0 1px 3px ${a.border}`,
                transition: "all 0.2s"
              },
              onClick: () => Ie(o),
              children: [
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px"
                }, children: [
                  /* @__PURE__ */ n("span", { style: {
                    fontSize: "11px",
                    color: a.textMuted,
                    fontFamily: "monospace"
                  }, children: [
                    "#",
                    o.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: ot(o.severity, a), children: [
                    /* @__PURE__ */ e(W, { name: at(o.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: o.severity || "none" })
                  ] }),
                  /* @__PURE__ */ n("span", { style: _e(o.status, a), children: [
                    /* @__PURE__ */ e(W, { name: rt(o.status), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: $e(o.status) })
                  ] }),
                  o.source === "test" && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${a.medium}15`,
                    color: a.medium,
                    fontWeight: 600
                  }, children: "🧪 test" }),
                  (o.attachment_count ?? 0) > 0 && /* @__PURE__ */ n("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${a.primary}15`,
                    color: a.primary,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px"
                  }, children: [
                    /* @__PURE__ */ e(W, { name: "image", size: 12 }),
                    o.attachment_count
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: a.text,
                  lineHeight: 1.4
                }, children: tt(o.content) }),
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: a.textMuted
                }, children: [
                  /* @__PURE__ */ n("span", { style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    background: a.bgTertiary,
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }, children: [
                    /* @__PURE__ */ e(W, { name: "link", size: 12 }),
                    o.route || "/"
                  ] }),
                  /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                  /* @__PURE__ */ e("span", { children: nt(o.created_at) })
                ] }),
                o.latest_comment && /* @__PURE__ */ n("div", { style: {
                  marginTop: "8px",
                  padding: "6px 10px",
                  background: a.bgTertiary,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: a.textSecondary,
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px"
                }, children: [
                  /* @__PURE__ */ e(W, { name: "chat_bubble_outline", size: 14 }),
                  /* @__PURE__ */ e("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: o.latest_comment.length > 60 ? o.latest_comment.slice(0, 60) + "..." : o.latest_comment })
                ] })
              ]
            },
            o.id
          ))
        ] }),
        /* @__PURE__ */ n("div", { style: {
          padding: "16px",
          borderTop: `1px solid ${a.border}`,
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          fontSize: "12px",
          color: a.textMuted
        }, children: [
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "description", size: 16 }),
            P.length,
            " 件"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "error", size: 16, color: a.error }),
            P.filter((o) => o.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "build", size: 16, color: a.warning }),
            P.filter((o) => o.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "check_circle", size: 16, color: a.success }),
            P.filter((o) => o.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "cancel", size: 16, color: a.textMuted }),
            P.filter((o) => o.status === "closed").length,
            " クローズ"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "undo", size: 16, color: a.error }),
            P.filter((o) => o.status === "rejected").length,
            " Rejected"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e("main", { style: {
        flex: 1,
        overflow: "auto",
        padding: I ? "16px" : "32px",
        background: a.bg,
        display: I && !d ? "none" : "block"
      }, children: d ? /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        I && /* @__PURE__ */ n(
          "button",
          {
            onClick: () => k(null),
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              marginBottom: "16px",
              background: "transparent",
              border: `1px solid ${a.border}`,
              borderRadius: "8px",
              color: a.textSecondary,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer"
            },
            children: [
              /* @__PURE__ */ e(W, { name: "arrow_back", size: 16, color: a.textSecondary }),
              "一覧へ戻る"
            ]
          }
        ),
        /* @__PURE__ */ n("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: I ? "20px" : "32px",
          flexWrap: "wrap",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px"
            }, children: [
              /* @__PURE__ */ n("span", { style: ot(d.severity, a), children: [
                /* @__PURE__ */ e(W, { name: at(d.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: d.severity || "none" })
              ] }),
              /* @__PURE__ */ n("span", { style: _e(d.status, a), children: [
                /* @__PURE__ */ e(W, { name: rt(d.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: $e(d.status) })
              ] }),
              d.source === "test" && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "20px",
                background: `${a.medium}15`,
                color: a.medium,
                fontWeight: 600
              }, children: "🧪 test" })
            ] }),
            /* @__PURE__ */ e("h2", { style: {
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: a.text,
              lineHeight: 1.3,
              letterSpacing: "-0.025em"
            }, children: tt(d.content) })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "severity-select",
                value: d.severity || "",
                onChange: (o) => {
                  const $ = o.target.value;
                  We(d.id, $ || null);
                },
                disabled: h !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: h !== null ? "not-allowed" : "pointer",
                  opacity: h !== null ? 0.6 : 1
                },
                children: [
                  /* @__PURE__ */ e("option", { value: "", children: "未設定" }),
                  /* @__PURE__ */ e("option", { value: "critical", children: "Critical" }),
                  /* @__PURE__ */ e("option", { value: "high", children: "High" }),
                  /* @__PURE__ */ e("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ e("option", { value: "low", children: "Low" })
                ]
              }
            ),
            h === `severity-${d.id}` && /* @__PURE__ */ e(se, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "status-select",
                value: d.status,
                onChange: (o) => Ce(d.id, o.target.value),
                disabled: h !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: h !== null ? "not-allowed" : "pointer",
                  opacity: h !== null ? 0.6 : 1
                },
                children: [
                  /* @__PURE__ */ e("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ e("option", { value: "fixed", children: "Fixed" }),
                  /* @__PURE__ */ e("option", { value: "resolved", children: "Resolved" }),
                  /* @__PURE__ */ e("option", { value: "closed", children: "クローズ" }),
                  /* @__PURE__ */ e("option", { value: "rejected", children: "Rejected" })
                ]
              }
            ),
            h === `status-${d.id}` && /* @__PURE__ */ e(se, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => Ne(d.id),
                disabled: h !== null,
                style: {
                  padding: "10px 16px",
                  background: a.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: a.error,
                  cursor: h !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: h !== null ? 0.6 : 1
                },
                children: [
                  h === `delete-${d.id}` ? /* @__PURE__ */ e(se, { size: 16, color: a.error }) : /* @__PURE__ */ e(W, { name: "delete", size: 16 }),
                  "削除"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ n("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ e(
            be,
            {
              icon: "link",
              label: "ページURL",
              value: d.route || "/",
              isLink: !0,
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            be,
            {
              icon: "article",
              label: "ページタイトル",
              value: d.screen_name || "(不明)",
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            be,
            {
              icon: "schedule",
              label: "作成日時",
              value: it(d.created_at),
              colors: a
            }
          ),
          d.test_cases && d.test_cases.length > 0 && /* @__PURE__ */ n("div", { style: {
            gridColumn: "1 / -1",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }, children: [
            /* @__PURE__ */ n("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 600,
              color: a.textSecondary
            }, children: [
              /* @__PURE__ */ e(W, { name: "science", size: 16, color: a.link }),
              "元のテストケース"
            ] }),
            d.test_cases.map((o, $) => {
              const V = [o.domain, o.capability].filter(Boolean);
              return /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => j(o.id),
                  title: "クリックでこのテストケースのノートを絞り込み",
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${a.border}`,
                    background: a.bgSecondary,
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ n("div", { style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap"
                    }, children: [
                      /* @__PURE__ */ e("span", { style: {
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: `${a.link}15`,
                        color: a.link,
                        fontFamily: "monospace",
                        fontWeight: 600
                      }, children: o.case_key || `#${o.id}` }),
                      V.length > 0 && /* @__PURE__ */ e("span", { style: {
                        fontSize: "11px",
                        color: a.textMuted
                      }, children: V.join(" / ") })
                    ] }),
                    /* @__PURE__ */ e("div", { style: {
                      fontSize: "13px",
                      color: a.text,
                      fontWeight: 500,
                      lineHeight: 1.4
                    }, children: o.title || "(タイトル未設定)" })
                  ]
                },
                $
              );
            })
          ] })
        ] }),
        /* @__PURE__ */ e(ue, { icon: "notes", title: "内容", colors: a, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: a.text
        }, children: d.content }) }),
        d.attachments && d.attachments.length > 0 && /* @__PURE__ */ e(ue, { icon: "image", title: `添付画像 (${d.attachments.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px"
        }, children: d.attachments.map((o) => /* @__PURE__ */ n("div", { style: {
          position: "relative",
          borderRadius: "10px",
          overflow: "hidden",
          border: `1px solid ${a.border}`,
          cursor: "pointer",
          aspectRatio: "4/3"
        }, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: oe.getAttachmentUrl(o.filename),
              alt: o.original_name,
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              },
              onClick: () => ne(oe.getAttachmentUrl(o.filename))
            }
          ),
          /* @__PURE__ */ n("div", { style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "6px 8px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ e("span", { style: { color: "#fff", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: o.original_name }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: ($) => {
                  $.stopPropagation(), we(d.id, o.id);
                },
                style: {
                  background: "rgba(239,68,68,0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  cursor: "pointer",
                  padding: "2px 6px",
                  fontSize: "11px",
                  flexShrink: 0
                },
                children: /* @__PURE__ */ e(W, { name: "delete", size: 14, color: "#fff" })
              }
            )
          ] })
        ] }, o.id)) }) }),
        d.steps && /* @__PURE__ */ e(ue, { icon: "format_list_numbered", title: "再現手順", colors: a, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: a.text
        }, children: Te(d.steps).map((o, $) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${a.borderLight}`
        }, children: o }, $)) }) }),
        d.user_log && /* @__PURE__ */ e(ue, { icon: "sticky_note_2", title: "補足メモ", colors: a, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: A ? "#0D1117" : "#1E293B",
          color: "#E2E8F0",
          borderRadius: "12px",
          overflow: "auto",
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          lineHeight: 1.6,
          margin: 0
        }, children: d.user_log }) }),
        d.environment && /* @__PURE__ */ e(ue, { icon: "devices", title: "環境情報", colors: a, children: /* @__PURE__ */ n("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ e(be, { icon: "public", label: "URL", value: d.environment.url || "", isLink: !0, colors: a }),
          /* @__PURE__ */ e(be, { icon: "aspect_ratio", label: "Viewport", value: d.environment.viewport || "", colors: a }),
          /* @__PURE__ */ e(be, { icon: "computer", label: "User Agent", value: d.environment.userAgent || "", colors: a }),
          /* @__PURE__ */ e(be, { icon: "schedule", label: "記録日時", value: it(d.environment.timestamp || ""), colors: a })
        ] }) }),
        d.console_log && d.console_log.length > 0 && /* @__PURE__ */ e(ue, { icon: "terminal", title: `コンソールログ (${d.console_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: A ? "#0D1117" : "#1E293B"
        }, children: d.console_log.map((o, $) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${A ? "#21262D" : "#2D3748"}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: o.level === "error" ? "#F87171" : o.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: o.level === "error" ? "#7F1D1D40" : o.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: o.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: o.message })
        ] }, $)) }) }),
        /* @__PURE__ */ n(ue, { icon: "history", title: `アクティビティ (${(d.activities || []).length}件)`, colors: a, children: [
          (d.activities || []).length > 0 ? /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: d.activities.map((o) => /* @__PURE__ */ n("div", { style: {
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            padding: "10px 14px",
            background: a.bgSecondary,
            borderRadius: "10px",
            borderLeft: `3px solid ${o.action === "status_change" ? a.primary : a.textMuted}`
          }, children: [
            /* @__PURE__ */ e("div", { style: {
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              marginTop: "4px",
              flexShrink: 0,
              background: o.action === "status_change" ? a.primary : a.textMuted
            } }),
            /* @__PURE__ */ n("div", { style: { flex: 1, minWidth: 0 }, children: [
              o.action === "status_change" ? /* @__PURE__ */ n("div", { style: { fontSize: "13px", color: a.text, marginBottom: o.content ? "4px" : 0 }, children: [
                /* @__PURE__ */ e("span", { style: {
                  ..._e(o.old_status, a),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: $e(o.old_status) }),
                /* @__PURE__ */ e("span", { style: { margin: "0 6px", color: a.textMuted }, children: " → " }),
                /* @__PURE__ */ e("span", { style: {
                  ..._e(o.new_status, a),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: $e(o.new_status) })
              ] }) : null,
              o.content && /* @__PURE__ */ e("div", { style: {
                fontSize: "13px",
                color: a.text,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap"
              }, children: o.content }),
              /* @__PURE__ */ n("div", { style: {
                fontSize: "11px",
                color: a.textMuted,
                marginTop: "4px",
                display: "flex",
                gap: "8px"
              }, children: [
                o.author && /* @__PURE__ */ e("span", { children: o.author }),
                /* @__PURE__ */ e("span", { children: nt(o.created_at) })
              ] })
            ] })
          ] }, o.id)) }) : /* @__PURE__ */ e("div", { style: { fontSize: "13px", color: a.textMuted }, children: "アクティビティはありません" }),
          /* @__PURE__ */ n("div", { style: {
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            alignItems: "flex-end"
          }, children: [
            /* @__PURE__ */ e(
              "textarea",
              {
                value: D,
                onChange: (o) => B(o.target.value),
                placeholder: "コメントを追加...",
                style: {
                  flex: 1,
                  padding: "10px 14px",
                  border: `1px solid ${a.border}`,
                  borderRadius: "10px",
                  background: a.bg,
                  color: a.text,
                  fontSize: "13px",
                  resize: "vertical",
                  minHeight: "40px",
                  maxHeight: "120px",
                  fontFamily: "inherit"
                },
                rows: 1
              }
            ),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: Re,
                disabled: R || D.trim() === "",
                style: {
                  padding: "10px 16px",
                  background: R || D.trim() === "" ? a.bgTertiary : a.primary,
                  border: "none",
                  borderRadius: "10px",
                  color: R || D.trim() === "" ? a.textMuted : "#FFF",
                  cursor: R || D.trim() === "" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                },
                children: [
                  R ? /* @__PURE__ */ e(se, { size: 14, color: a.textMuted }) : /* @__PURE__ */ e(W, { name: "send", size: 16 }),
                  "送信"
                ]
              }
            )
          ] })
        ] }),
        d.network_log && d.network_log.length > 0 && /* @__PURE__ */ e(ue, { icon: "wifi", title: `ネットワークログ (${d.network_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: A ? "#0D1117" : "#1E293B"
        }, children: d.network_log.map((o, $) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${A ? "#21262D" : "#2D3748"}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            fontWeight: 600,
            color: "#94A3B8",
            width: "40px",
            flexShrink: 0
          }, children: o.method }),
          /* @__PURE__ */ e("span", { style: {
            color: o.status >= 400 ? "#F87171" : "#34D399",
            fontWeight: 600,
            flexShrink: 0
          }, children: o.status }),
          /* @__PURE__ */ e("span", { style: {
            color: "#E2E8F0",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: o.url }),
          /* @__PURE__ */ e("span", { style: {
            color: "#64748B",
            flexShrink: 0
          }, children: o.duration != null ? `${o.duration}ms` : "-" })
        ] }, $)) }) })
      ] }) : /* @__PURE__ */ n("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: a.textMuted
      }, children: [
        /* @__PURE__ */ e(W, { name: "arrow_back", size: 64 }),
        /* @__PURE__ */ e("div", { style: { fontSize: "18px", fontWeight: 500, marginTop: "16px" }, children: "ノートを選択してください" }),
        /* @__PURE__ */ e("div", { style: { fontSize: "14px", marginTop: "8px" }, children: "左のリストからノートを選択すると詳細が表示されます" })
      ] }) })
    ] }),
    H && /* @__PURE__ */ e(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9998
        },
        onClick: () => w(null),
        children: /* @__PURE__ */ n(
          "div",
          {
            style: {
              background: a.bg,
              borderRadius: "16px",
              padding: "28px",
              width: "480px",
              maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            },
            onClick: (o) => o.stopPropagation(),
            children: [
              /* @__PURE__ */ n("h3", { style: {
                margin: "0 0 16px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: a.text,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }, children: [
                /* @__PURE__ */ e(W, { name: "edit_note", size: 20 }),
                "ステータスを「",
                $e(H.status),
                "」に変更"
              ] }),
              /* @__PURE__ */ e(
                "textarea",
                {
                  value: u,
                  onChange: (o) => f(o.target.value),
                  placeholder: H.status === "fixed" ? "コメント（必須）: 何を修正したか記入してください" : H.status === "rejected" ? "コメント（必須）: 却下理由を記入してください" : "コメント（任意）",
                  style: {
                    width: "100%",
                    padding: "12px 14px",
                    border: `1px solid ${u.trim() === "" && (H.status === "fixed" || H.status === "rejected") ? a.error : a.border}`,
                    borderRadius: "10px",
                    background: a.bgSecondary,
                    color: a.text,
                    fontSize: "14px",
                    resize: "vertical",
                    minHeight: "80px",
                    maxHeight: "200px",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    boxSizing: "border-box"
                  },
                  autoFocus: !0,
                  rows: 3
                }
              ),
              (H.status === "fixed" || H.status === "rejected") && u.trim() === "" && /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: a.error, marginTop: "6px" }, children: H.status === "fixed" ? "fixed に変更するにはコメントが必須です" : "却下理由の入力が必須です" }),
              /* @__PURE__ */ n("div", { style: {
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px"
              }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => w(null),
                    style: {
                      padding: "10px 20px",
                      background: a.bgSecondary,
                      border: "none",
                      borderRadius: "10px",
                      color: a.text,
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: "13px"
                    },
                    children: "キャンセル"
                  }
                ),
                /* @__PURE__ */ n(
                  "button",
                  {
                    onClick: Fe,
                    disabled: h !== null || (H.status === "fixed" || H.status === "rejected") && u.trim() === "",
                    style: {
                      padding: "10px 20px",
                      background: (H.status === "fixed" || H.status === "rejected") && u.trim() === "" ? a.bgTertiary : a.primary,
                      border: "none",
                      borderRadius: "10px",
                      color: (H.status === "fixed" || H.status === "rejected") && u.trim() === "" ? a.textMuted : "#FFF",
                      cursor: (H.status === "fixed" || H.status === "rejected") && u.trim() === "" ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    },
                    children: [
                      h ? /* @__PURE__ */ e(se, { size: 14, color: "#FFF" }) : /* @__PURE__ */ e(W, { name: "check", size: 16 }),
                      "変更"
                    ]
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    re && /* @__PURE__ */ n(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          cursor: "pointer"
        },
        onClick: () => ne(null),
        children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: re,
              alt: "拡大表示",
              style: {
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
              },
              onClick: (o) => o.stopPropagation()
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => ne(null),
              style: {
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              },
              children: /* @__PURE__ */ e(W, { name: "close", size: 24, color: "#fff" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e("style", { children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      ` })
  ] });
}
function be({ icon: t, label: r, value: i, isLink: l, colors: g }) {
  return /* @__PURE__ */ n("div", { style: {
    padding: "16px",
    background: g.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "12px",
      color: g.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(W, { name: t, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: l ? g.link : g.text,
      fontFamily: l ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: i })
  ] });
}
function ue({ icon: t, title: r, children: i, colors: l }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ n("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: l.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(W, { name: t, size: 18 }),
      r
    ] }),
    i
  ] });
}
function tt(t, r = 60) {
  const i = t.split(`
`)[0];
  return i.length > r ? i.slice(0, r) + "..." : i;
}
function nt(t) {
  return mt(t);
}
function it(t) {
  return bt(t);
}
function rt(t) {
  switch (t) {
    case "open":
      return "error";
    case "fixed":
      return "build";
    case "resolved":
      return "check_circle";
    case "rejected":
      return "undo";
    case "closed":
      return "cancel";
    case "in_progress":
      return "pending";
  }
}
function $e(t) {
  return t === "closed" ? "クローズ" : t ?? "";
}
function at(t) {
  switch (t) {
    case "critical":
      return "error";
    case "high":
      return "priority_high";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "remove";
  }
}
function ot(t, r) {
  const i = t ? r[t] : r.textMuted;
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: `${i}15`,
    color: i,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function _e(t, r) {
  let i, l;
  switch (t) {
    case "open":
      i = r.primaryLight, l = r.primary;
      break;
    case "fixed":
      i = r.warningBg, l = r.warning;
      break;
    case "resolved":
      i = r.successBg, l = r.success;
      break;
    case "rejected":
      i = r.errorBg, l = r.error;
      break;
    case "closed":
      i = r.bgTertiary, l = r.textMuted;
      break;
    case "in_progress":
      i = `${r.accent}15`, l = r.accent;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: i,
    color: l,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function yn(t) {
  return {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSize: "14px",
    color: t.text,
    background: t.bg
  };
}
function vn(t) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${t.border}`,
    background: t.bg
  };
}
function Nn({
  apiBaseUrl: t,
  env: r = "dev",
  testCases: i,
  manualItems: l,
  manualDefaultPath: g,
  onManualNavigate: z,
  onManualAppNavigate: b,
  environmentsMd: x,
  onSave: y,
  initialSize: T,
  logCaptureConfig: d,
  disableLogCapture: k,
  adminRoutePath: A = "/__admin",
  triggerOffset: m
}) {
  const { isDebugMode: I } = $t();
  ie(() => {
    t && je(t);
  }, [t]);
  const _ = ve(() => k || !t ? null : Nt(
    d ?? { console: !0, network: ["/api/**"] }
  ), [t, k]), [S, E] = v(() => typeof window > "u" ? !1 : window.location.pathname === A);
  return ie(() => {
    if (typeof window > "u") return;
    const C = () => E(window.location.pathname === A);
    C(), window.addEventListener("popstate", C), window.addEventListener("hashchange", C);
    const c = window.history.pushState, F = window.history.replaceState;
    return window.history.pushState = function(...N) {
      const L = c.apply(this, N);
      return C(), L;
    }, window.history.replaceState = function(...N) {
      const L = F.apply(this, N);
      return C(), L;
    }, () => {
      window.removeEventListener("popstate", C), window.removeEventListener("hashchange", C), window.history.pushState = c, window.history.replaceState = F;
    };
  }, [A]), !t || !(I || S) ? null : /* @__PURE__ */ e(
    Yt,
    {
      apiBaseUrl: t,
      env: r,
      testCases: i,
      logCapture: _ ?? void 0,
      manualItems: l,
      manualDefaultPath: g,
      onManualNavigate: z,
      onManualAppNavigate: b,
      environmentsMd: x,
      onSave: y,
      initialSize: T,
      triggerOffset: m
    }
  );
}
const Le = {
  fix: { label: "直したこと", fg: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  improve: { label: "使いやすくしたこと", fg: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  feature: { label: "新しくできること", fg: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" }
}, De = ["fix", "improve", "feature"];
function lt(t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  return r ? `${Number(r[1])}年${Number(r[2])}月${Number(r[3])}日` : t;
}
function wn(t) {
  return t.mime_type.startsWith("video/");
}
function Mn({
  feedUrl: t,
  title: r = "更新情報",
  description: i = "アプリの更新内容を新しい順に掲載しています",
  initialOpenCount: l = 1,
  showFilter: g = !0,
  storageKey: z,
  onLoaded: b,
  className: x,
  style: y
}) {
  const { notes: T, loading: d, error: k, markAllRead: A } = Ct({ feedUrl: t, storageKey: z }), [m, I] = v(() => /* @__PURE__ */ new Set()), [_, S] = v("all"), [E, h] = v(null);
  ie(() => {
    T.length !== 0 && (I(new Set(T.slice(0, Math.max(0, l)).map((F) => F.id))), A(), b == null || b(T));
  }, [T]);
  const C = q((F) => {
    I((N) => {
      const L = new Set(N);
      return L.has(F) ? L.delete(F) : L.add(F), L;
    });
  }, []), c = ve(() => _ === "all" ? T : T.map((F) => ({ ...F, items: F.items.filter((N) => N.category === _) })).filter((F) => F.items.length > 0), [T, _]);
  return ie(() => {
    if (!E) return;
    const F = (N) => {
      N.key === "Escape" && h(null);
    };
    return window.addEventListener("keydown", F), () => window.removeEventListener("keydown", F);
  }, [E]), /* @__PURE__ */ n("div", { className: x, style: { maxWidth: "820px", margin: "0 auto", fontSize: "14px", color: "#111827", ...y }, children: [
    /* @__PURE__ */ n("header", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ e("h1", { style: { margin: 0, fontSize: "20px", fontWeight: 700, color: K.primary }, children: r }),
      i && /* @__PURE__ */ e("p", { style: { margin: "4px 0 0", fontSize: "13px", color: K.gray500 }, children: i })
    ] }),
    g && T.length > 0 && /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }, children: [
      /* @__PURE__ */ e(st, { active: _ === "all", onClick: () => S("all"), children: "すべて" }),
      De.map((F) => /* @__PURE__ */ e(st, { active: _ === F, onClick: () => S(F), children: Le[F].label }, F))
    ] }),
    d && T.length === 0 && /* @__PURE__ */ e("p", { style: { padding: "24px", color: K.gray500, fontSize: "13px" }, children: "読み込み中…" }),
    k && /* @__PURE__ */ e("p", { style: {
      padding: "12px 16px",
      background: K.errorBg,
      color: K.error,
      borderRadius: "8px",
      fontSize: "13px"
    }, children: k }),
    !d && !k && c.length === 0 && /* @__PURE__ */ e("p", { style: {
      padding: "24px",
      background: K.white,
      border: `1px solid ${K.gray300}`,
      borderRadius: "10px",
      color: K.gray500,
      fontSize: "13px"
    }, children: T.length === 0 ? "まだ掲載されている更新はありません" : "条件に合う更新はありません" }),
    c.length > 0 && /* @__PURE__ */ n("div", { style: { position: "relative", paddingLeft: "22px" }, children: [
      /* @__PURE__ */ e(
        "div",
        {
          "aria-hidden": !0,
          style: { position: "absolute", left: "6px", top: "8px", bottom: "8px", width: "1px", background: "#E5E7EB" }
        }
      ),
      c.map((F, N) => /* @__PURE__ */ e(
        kn,
        {
          note: F,
          isLatest: N === 0 && _ === "all",
          open: m.has(F.id),
          onToggle: () => C(F.id),
          onZoom: (L, j) => h({ url: L, caption: j })
        },
        F.id
      ))
    ] }),
    E && /* @__PURE__ */ n(
      "div",
      {
        role: "dialog",
        "aria-modal": "true",
        onClick: () => h(null),
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 2147483e3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px"
        },
        children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              "aria-label": "閉じる",
              onClick: () => h(null),
              style: {
                position: "absolute",
                top: "12px",
                right: "16px",
                background: "none",
                border: "none",
                color: "#FFF",
                fontSize: "32px",
                lineHeight: 1,
                cursor: "pointer"
              },
              children: "×"
            }
          ),
          /* @__PURE__ */ n("figure", { style: { margin: 0, maxWidth: "100%", maxHeight: "100%" }, onClick: (F) => F.stopPropagation(), children: [
            /* @__PURE__ */ e(
              "img",
              {
                src: E.url,
                alt: E.caption ?? "",
                style: { maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px", background: "#FFF", display: "block" }
              }
            ),
            E.caption && /* @__PURE__ */ e("figcaption", { style: { textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "8px" }, children: E.caption })
          ] })
        ]
      }
    )
  ] });
}
function st({ active: t, onClick: r, children: i }) {
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      onClick: r,
      style: {
        padding: "5px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        cursor: "pointer",
        border: `1px solid ${t ? K.primary : K.gray300}`,
        background: t ? K.primary : K.white,
        color: t ? K.white : K.gray700
      },
      children: i
    }
  );
}
function kn({
  note: t,
  isLatest: r,
  open: i,
  onToggle: l,
  onZoom: g
}) {
  const z = (t.cover_image_id !== null ? t.images.find((x) => x.id === t.cover_image_id) : void 0) ?? t.images.find((x) => x.item_id === null) ?? null, b = De.map((x) => ({ c: x, n: t.items.filter((y) => y.category === x).length })).filter((x) => x.n > 0);
  return /* @__PURE__ */ n("article", { style: { position: "relative", marginBottom: "24px" }, children: [
    /* @__PURE__ */ e("div", { style: {
      position: "absolute",
      left: "-22px",
      top: "6px",
      width: "13px",
      height: "13px",
      borderRadius: "50%",
      border: "2px solid #F7F8FA",
      background: r ? K.primary : K.gray300
    } }),
    /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }, children: [
      /* @__PURE__ */ e("span", { style: { fontSize: "13px", fontWeight: 600, color: K.gray700 }, children: lt(t.released_on) }),
      /* @__PURE__ */ e("span", { style: { fontSize: "11px", padding: "1px 8px", borderRadius: "999px", background: "#EEF2F7", color: "#4B5563" }, children: t.version }),
      r && /* @__PURE__ */ e("span", { style: { fontSize: "11px", padding: "1px 8px", borderRadius: "999px", background: K.primary, color: K.white }, children: "最新" })
    ] }),
    /* @__PURE__ */ n("div", { style: {
      background: K.white,
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ n("div", { style: { padding: "16px 16px 14px" }, children: [
        /* @__PURE__ */ e("h2", { style: { margin: 0, fontSize: "16px", fontWeight: 700 }, children: t.title }),
        /* @__PURE__ */ e("p", { style: { margin: "4px 0 0", fontSize: "12px", color: K.gray500 }, children: t.previous ? `前回（${lt(t.previous.released_on)} ${t.previous.version}）からの変更` : "最初のリリースです" }),
        b.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }, children: b.map(({ c: x, n: y }) => {
          const T = Le[x];
          return /* @__PURE__ */ n("span", { style: {
            fontSize: "11px",
            padding: "2px 9px",
            borderRadius: "999px",
            background: T.bg,
            color: T.fg,
            border: `1px solid ${T.border}`
          }, children: [
            T.label,
            " ",
            y
          ] }, x);
        }) }),
        (t.summary || z) && /* @__PURE__ */ n("div", { style: { display: "flex", gap: "14px", marginTop: "14px", flexWrap: "wrap" }, children: [
          z && /* @__PURE__ */ e("div", { style: { flexShrink: 0, width: "220px", maxWidth: "100%" }, children: /* @__PURE__ */ e(vt, { media: z, onZoom: g }) }),
          t.summary && /* @__PURE__ */ e("p", { style: { margin: 0, flex: 1, minWidth: "200px", color: K.gray700, whiteSpace: "pre-wrap" }, children: t.summary })
        ] })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          onClick: l,
          style: {
            width: "100%",
            padding: "10px 16px",
            fontSize: "12px",
            color: K.gray500,
            background: "transparent",
            border: "none",
            borderTop: "1px solid #F3F4F6",
            cursor: "pointer"
          },
          children: i ? "▾ 閉じる" : `▸ 変更点をすべて見る（${t.items.length}件）`
        }
      ),
      i && /* @__PURE__ */ e("div", { style: { padding: "4px 16px 16px", background: "#FAFBFC", borderTop: "1px solid #F3F4F6" }, children: De.map((x) => {
        const y = t.items.filter((d) => d.category === x);
        if (y.length === 0) return null;
        const T = Le[x];
        return /* @__PURE__ */ n("section", { style: { marginTop: "16px" }, children: [
          /* @__PURE__ */ n("h3", { style: { margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: T.fg }, children: [
            T.label,
            "（",
            y.length,
            "件）"
          ] }),
          /* @__PURE__ */ e("ol", { style: { listStyle: "none", margin: 0, padding: 0 }, children: y.map((d, k) => /* @__PURE__ */ e(
            Sn,
            {
              item: d,
              index: k + 1,
              media: t.images.filter((A) => A.item_id === d.id),
              onZoom: g
            },
            d.id
          )) })
        ] }, x);
      }) })
    ] })
  ] });
}
function Sn({
  item: t,
  index: r,
  media: i,
  onZoom: l
}) {
  return /* @__PURE__ */ n("li", { style: {
    display: "flex",
    gap: "8px",
    background: K.white,
    border: "1px solid #F3F4F6",
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "10px"
  }, children: [
    /* @__PURE__ */ n("span", { style: { fontSize: "12px", color: "#9CA3AF", paddingTop: "2px" }, children: [
      r,
      "."
    ] }),
    /* @__PURE__ */ n("div", { style: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ e("p", { style: { margin: 0, fontSize: "14px" }, children: t.headline }),
      t.where_text && /* @__PURE__ */ n("p", { style: { margin: "2px 0 0", fontSize: "12px", color: "#9CA3AF" }, children: [
        "場所: ",
        t.where_text
      ] }),
      (t.before_text || t.after_text) && /* @__PURE__ */ n("div", { style: { marginTop: "8px" }, children: [
        t.before_text && /* @__PURE__ */ n("p", { style: { margin: "0 0 2px", fontSize: "12px", color: K.gray500 }, children: [
          /* @__PURE__ */ e("span", { style: { display: "inline-block", width: "4.5em", color: "#9CA3AF" }, children: "これまで" }),
          t.before_text
        ] }),
        t.after_text && /* @__PURE__ */ n("p", { style: { margin: 0, fontSize: "12px", color: "#111827" }, children: [
          /* @__PURE__ */ e("span", { style: { display: "inline-block", width: "4.5em", color: "#9CA3AF" }, children: "これから" }),
          t.after_text
        ] })
      ] }),
      i.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" }, children: i.map((g) => /* @__PURE__ */ n("figure", { style: { margin: 0, width: "100%", maxWidth: "420px" }, children: [
        /* @__PURE__ */ e(vt, { media: g, onZoom: l }),
        g.caption && /* @__PURE__ */ e("figcaption", { style: { marginTop: "4px", fontSize: "11px", color: "#9CA3AF" }, children: g.caption })
      ] }, g.id)) })
    ] })
  ] });
}
function vt({ media: t, onZoom: r }) {
  return wn(t) ? /* @__PURE__ */ e(
    "video",
    {
      src: `${t.url}#t=0.1`,
      controls: !0,
      playsInline: !0,
      preload: "metadata",
      style: { width: "100%", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#000", display: "block" }
    }
  ) : /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      onClick: () => r(t.url, t.caption),
      style: { display: "block", width: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" },
      children: /* @__PURE__ */ e(
        "img",
        {
          src: t.url,
          alt: t.caption ?? "",
          loading: "lazy",
          style: { width: "100%", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#F9FAFB", display: "block" }
        }
      )
    }
  );
}
export {
  xn as D,
  yt as L,
  Mn as R,
  Wn as a,
  Yt as b,
  Nn as c,
  bn as d,
  jt as p
};
