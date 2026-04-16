import { jsxs as n, jsx as e, Fragment as me } from "react/jsx-runtime";
import { useState as w, useMemo as ve, useCallback as K, forwardRef as at, useRef as ue, useEffect as ne, useImperativeHandle as ot, createContext as st, useContext as Xe } from "react";
import { a as Ye, u as lt } from "./useDebugMode-Bazrkz8S.js";
import { a as re, s as We, g as dt } from "./api-BfEr37m2.js";
import { d as ct, a as pt } from "./useFeedbackAdminMode-uS9p5VCZ.js";
import { b as ut, c as gt, e as xt } from "./feedbackApi-CdFCjUgg.js";
import { createPortal as ht } from "react-dom";
import { m as ft } from "./feedbackLogCapture-DUBfVREg.js";
import { I as et, D as s, h as Be } from "./FeedbackAdmin-CDJAuNrz.js";
import { c as bt } from "./logCapture-Bkuy8MSd.js";
function mt(i) {
  return i.split(`
`).map((r) => r.trim()).filter((r) => r.startsWith("- ")).map((r) => r.slice(2).trim()).filter(Boolean);
}
function yt({ notes: i, updateStatus: r }) {
  const [t, p] = w(null), [u, z] = w(/* @__PURE__ */ new Set(["fixed"])), [h, x] = w({}), [m, D] = w(/* @__PURE__ */ new Set()), l = ve(() => u.size === 0 ? i : i.filter((b) => u.has(b.status)), [i, u]), k = K(async (b, I) => {
    p(`status-${b}`);
    try {
      await r(b, I), I === "resolved" && x((E) => {
        const y = { ...E };
        return delete y[b], y;
      });
    } finally {
      p(null);
    }
  }, [r]), L = K((b, I) => {
    x((E) => {
      const y = E[b] ?? /* @__PURE__ */ new Set(), T = new Set(y);
      return T.has(I) ? T.delete(I) : T.add(I), { ...E, [b]: T };
    });
  }, []);
  return /* @__PURE__ */ n("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ n("div", { className: "debug-status-filter", children: [
      ["open", "fixed", "resolved", "rejected"].map((b) => /* @__PURE__ */ e(
        "button",
        {
          "data-testid": `status-chip-${b}`,
          className: `debug-status-chip ${u.has(b) ? "active" : ""}`,
          onClick: () => {
            z((I) => {
              const E = new Set(I);
              return E.has(b) ? E.delete(b) : E.add(b), E;
            });
          },
          children: b
        },
        b
      )),
      /* @__PURE__ */ n("span", { className: "debug-filter-count", children: [
        l.length,
        "件"
      ] })
    ] }) }),
    l.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "該当するノートはありません" }) : l.map((b) => {
      const I = mt(b.latest_comment || ""), E = h[b.id] ?? /* @__PURE__ */ new Set(), y = I.length > 0 && E.size === I.length, T = I.length > 0;
      return /* @__PURE__ */ n("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ n(
          "div",
          {
            className: "debug-checklist-header",
            style: { cursor: "pointer" },
            onClick: () => D((g) => {
              const S = new Set(g);
              return S.has(b.id) ? S.delete(b.id) : S.add(b.id), S;
            }),
            children: [
              /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: m.has(b.id) ? "▼" : "▶" }),
              /* @__PURE__ */ n("span", { className: "debug-note-id", children: [
                "#",
                b.id
              ] }),
              /* @__PURE__ */ e("span", { className: `debug-severity-dot ${b.severity || "none"}` }),
              b.source === "test" && /* @__PURE__ */ e("span", { className: "debug-source-badge", children: "🧪" }),
              /* @__PURE__ */ e("span", { className: "debug-checklist-title", children: b.content.split(`
`)[0].slice(0, 50) }),
              /* @__PURE__ */ n(
                "select",
                {
                  "data-testid": `note-status-select-${b.id}`,
                  className: "debug-status-select",
                  value: b.status,
                  onChange: (g) => k(b.id, g.target.value),
                  disabled: t !== null,
                  style: { marginLeft: "auto", flexShrink: 0 },
                  children: [
                    /* @__PURE__ */ e("option", { value: "open", children: "open" }),
                    /* @__PURE__ */ e("option", { value: "fixed", children: "fixed" }),
                    /* @__PURE__ */ e("option", { value: "resolved", children: "resolved" }),
                    /* @__PURE__ */ e("option", { value: "rejected", children: "rejected" })
                  ]
                }
              )
            ]
          }
        ),
        m.has(b.id) && /* @__PURE__ */ e(me, { children: T && /* @__PURE__ */ n("div", { className: "debug-checklist-items", children: [
          I.map((g, S) => /* @__PURE__ */ n("label", { className: "debug-checklist-item", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: E.has(S),
                onChange: () => L(b.id, S)
              }
            ),
            /* @__PURE__ */ e("span", { className: E.has(S) ? "debug-checklist-done" : "", children: g })
          ] }, S)),
          /* @__PURE__ */ n("div", { className: "debug-checklist-actions", children: [
            /* @__PURE__ */ n("span", { className: "debug-checklist-progress", children: [
              E.size,
              "/",
              I.length
            ] }),
            b.status === "fixed" && /* @__PURE__ */ e(
              "button",
              {
                className: "debug-btn debug-btn-resolve",
                disabled: !y || t !== null,
                onClick: () => k(b.id, "resolved"),
                children: t === `status-${b.id}` ? "更新中..." : "resolved"
              }
            )
          ] })
        ] }) })
      ] }, b.id);
    })
  ] });
}
const vt = at(function({ testCases: r, env: t, logCapture: p, onNotesRefresh: u, onRunningCasesChange: z }, h) {
  const [x, m] = w([]), [D, l] = w(/* @__PURE__ */ new Set()), [k, L] = w(/* @__PURE__ */ new Set()), [b, I] = w({}), [E, y] = w({}), [T, g] = w(null), [S, c] = w(null), O = ue("");
  ne(() => {
    if (!r || r.length === 0) return;
    const v = JSON.stringify(r);
    if (v === O.current) return;
    let F = !1;
    return (async () => {
      try {
        await re.importTestCases(r);
      } catch (f) {
        console.warn("Failed to import test cases:", f);
      }
      if (!F)
        try {
          const f = await re.getTestTree(t);
          if (F) return;
          m(f), O.current = v;
          const G = {};
          for (const _ of f)
            for (const C of _.capabilities)
              for (const B of C.cases)
                B.last === "pass" && (G[B.caseId] = !0);
          I(G);
        } catch (f) {
          console.warn("Failed to fetch test tree:", f);
        }
    })(), () => {
      F = !0;
    };
  }, [r, t]);
  const W = K(async () => {
    try {
      const v = await re.getTestTree(t);
      m(v);
      const F = {};
      for (const f of v)
        for (const G of f.capabilities)
          for (const _ of G.cases)
            F[_.caseId] = _.last === "pass";
      I(F);
    } catch {
      c({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [t]);
  ot(h, () => ({ refresh: W }), [W]), ne(() => {
    if (!z) return;
    const v = [];
    for (const F of x)
      for (const f of F.capabilities) {
        const G = `${F.domain}/${f.capability}`;
        if (k.has(G))
          for (const _ of f.cases) v.push(_.caseId);
      }
    z(v);
  }, [k, x, z]);
  const P = K(async (v, F, f) => {
    const G = `${v}/${F}`;
    g(G), c(null);
    try {
      const _ = [], C = E[G], B = C != null && C.content.trim() && C.caseIds.length > 0 ? C.caseIds : [], a = new Set(B);
      for (const J of f)
        b[J.caseId] && !a.has(J.caseId) && _.push({ caseId: J.caseId, result: "pass" });
      for (const J of B)
        _.push({ caseId: J, result: "fail" });
      if (_.length === 0) {
        c({ type: "error", text: "チェックまたはバグ報告が必要です" }), g(null);
        return;
      }
      const M = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, q = B.length > 0 ? {
        content: C.content.trim(),
        severity: C.severity || void 0,
        consoleLogs: p == null ? void 0 : p.getConsoleLogs(),
        networkLogs: p == null ? void 0 : p.getNetworkLogs(),
        environment: M
      } : void 0, Z = await re.submitTestRuns(t, _, q);
      if (C != null && C.files && C.files.length > 0 && Z.results) {
        const X = Z.results.filter((d) => d.noteId != null).map((d) => d.noteId)[0];
        if (X)
          for (const d of C.files)
            try {
              await re.uploadAttachment(t, X, d);
            } catch (N) {
              console.warn("Failed to upload attachment:", N);
            }
      }
      if (Z.capability) {
        m((X) => X.map((d) => d.domain !== v ? d : {
          ...d,
          capabilities: d.capabilities.map(
            (N) => N.capability === F ? Z.capability : N
          )
        }));
        const J = { ...b };
        for (const X of Z.capability.cases)
          J[X.caseId] = X.last === "pass";
        I(J);
      }
      u(), y((J) => {
        const X = { ...J };
        return delete X[G], X;
      }), c({ type: "success", text: "送信しました" });
    } catch (_) {
      c({ type: "error", text: _ instanceof Error ? _.message : "送信に失敗しました" });
    } finally {
      g(null);
    }
  }, [b, E, t, p, u]), j = K((v) => {
    l((F) => {
      const f = new Set(F);
      return f.has(v) ? f.delete(v) : f.add(v), f;
    });
  }, []), Q = K((v) => {
    L((F) => {
      const f = new Set(F);
      return f.has(v) ? f.delete(v) : f.add(v), f;
    });
  }, []), U = (v) => v.last === "pass" ? "passed" : v.last === "fail" && v.openIssues === 0 ? "retest" : v.last === "fail" ? "fail" : "-", ie = (v) => v.last === "pass" ? s.success : v.last === "fail" && v.openIssues === 0 ? "#F59E0B" : v.last === "fail" ? s.error : s.gray500, te = (v) => v.status === "passed" ? "passed" : v.status === "retest" ? "retest" : v.status === "fail" ? "fail" : "", A = (v) => v.status === "passed" ? s.success : v.status === "retest" ? "#F59E0B" : v.status === "fail" ? s.error : s.gray500;
  return /* @__PURE__ */ n(me, { children: [
    S && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${S.type}`, children: S.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: x.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : x.map((v) => /* @__PURE__ */ n("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ n(
        "button",
        {
          "data-testid": `domain-toggle-${v.domain}`,
          className: "debug-tree-toggle",
          onClick: () => j(v.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: D.has(v.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: v.domain })
          ]
        }
      ),
      D.has(v.domain) && v.capabilities.map((F) => {
        const f = `${v.domain}/${F.capability}`, G = k.has(f), _ = E[f];
        return /* @__PURE__ */ n("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ n(
            "button",
            {
              "data-testid": `cap-toggle-${f}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => Q(f),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: G ? "expand_more" : "chevron_right" }),
                /* @__PURE__ */ e("span", { className: "debug-tree-label", children: F.capability }),
                /* @__PURE__ */ n("span", { className: "debug-tree-count", children: [
                  F.passed,
                  "/",
                  F.total
                ] }),
                F.status && /* @__PURE__ */ e("span", { className: "debug-tree-status", style: { color: A(F) }, children: te(F) }),
                F.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                  "[",
                  F.openIssues,
                  "件]"
                ] })
              ]
            }
          ),
          G && /* @__PURE__ */ n("div", { className: "debug-tree-cases", children: [
            F.cases.map((C) => /* @__PURE__ */ n("label", { "data-testid": `case-${C.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!b[C.caseId],
                  onChange: (B) => {
                    I((a) => ({
                      ...a,
                      [C.caseId]: B.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: C.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: ie(C) }, children: U(C) }),
              C.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                "[",
                C.openIssues,
                "件]"
              ] })
            ] }, C.caseId)),
            /* @__PURE__ */ n("div", { className: "debug-bug-form", children: [
              /* @__PURE__ */ e("div", { className: "debug-bug-form-title", children: "バグ報告" }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "ケース（複数選択可）" }),
                /* @__PURE__ */ e("div", { className: "debug-bug-cases", children: F.cases.map((C) => {
                  const B = (_ == null ? void 0 : _.caseIds.includes(C.caseId)) ?? !1;
                  return /* @__PURE__ */ n("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: B,
                        onChange: (a) => {
                          y((M) => {
                            const q = M[f] || { caseIds: [], content: "", severity: "", files: [] }, Z = a.target.checked ? [...q.caseIds, C.caseId] : q.caseIds.filter((J) => J !== C.caseId);
                            return { ...M, [f]: { ...q, caseIds: Z } };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { children: C.title })
                  ] }, C.caseId);
                }) })
              ] }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "内容" }),
                /* @__PURE__ */ e(
                  "textarea",
                  {
                    value: (_ == null ? void 0 : _.content) || "",
                    onChange: (C) => {
                      y((B) => {
                        var a, M, q;
                        return {
                          ...B,
                          [f]: {
                            ...B[f],
                            caseIds: ((a = B[f]) == null ? void 0 : a.caseIds) || [],
                            content: C.target.value,
                            severity: ((M = B[f]) == null ? void 0 : M.severity) || "",
                            files: ((q = B[f]) == null ? void 0 : q.files) || []
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
                    value: (_ == null ? void 0 : _.severity) || "",
                    onChange: (C) => {
                      y((B) => {
                        var a, M, q;
                        return {
                          ...B,
                          [f]: {
                            ...B[f],
                            caseIds: ((a = B[f]) == null ? void 0 : a.caseIds) || [],
                            content: ((M = B[f]) == null ? void 0 : M.content) || "",
                            severity: C.target.value,
                            files: ((q = B[f]) == null ? void 0 : q.files) || []
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
                et,
                {
                  files: (_ == null ? void 0 : _.files) || [],
                  onAdd: (C) => {
                    y((B) => {
                      var a, M, q, Z;
                      return {
                        ...B,
                        [f]: {
                          ...B[f],
                          caseIds: ((a = B[f]) == null ? void 0 : a.caseIds) || [],
                          content: ((M = B[f]) == null ? void 0 : M.content) || "",
                          severity: ((q = B[f]) == null ? void 0 : q.severity) || "",
                          files: [...((Z = B[f]) == null ? void 0 : Z.files) || [], ...C]
                        }
                      };
                    });
                  },
                  onRemove: (C) => {
                    y((B) => {
                      var a, M, q, Z;
                      return {
                        ...B,
                        [f]: {
                          ...B[f],
                          caseIds: ((a = B[f]) == null ? void 0 : a.caseIds) || [],
                          content: ((M = B[f]) == null ? void 0 : M.content) || "",
                          severity: ((q = B[f]) == null ? void 0 : q.severity) || "",
                          files: (((Z = B[f]) == null ? void 0 : Z.files) || []).filter((J, X) => X !== C)
                        }
                      };
                    });
                  },
                  disabled: T !== null
                }
              )
            ] }),
            (() => {
              const C = _ != null && _.content.trim() ? _.caseIds.length : 0, a = F.cases.filter((M) => b[M.caseId] && !(_ != null && _.caseIds.includes(M.caseId) && C > 0)).length + C;
              return /* @__PURE__ */ e(
                "button",
                {
                  "data-testid": `cap-submit-${f}`,
                  className: "debug-btn debug-btn-primary debug-cap-submit",
                  onClick: () => P(v.domain, F.capability, F.cases),
                  disabled: T !== null || a === 0,
                  children: T === f ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
                  ] }) : `${a}/${F.total}件を送信`
                }
              );
            })()
          ] })
        ] }, f);
      })
    ] }, v.domain)) })
  ] });
});
function wt({
  items: i,
  defaultPath: r,
  onNavigate: t,
  onAppNavigate: p
}) {
  var l;
  const [u, z] = w(r || ((l = i[0]) == null ? void 0 : l.path) || ""), { content: h, loading: x, error: m } = ct(u), D = (k) => {
    z(k), t == null || t(k);
  };
  return /* @__PURE__ */ n("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: i.map((k) => /* @__PURE__ */ e(
      "button",
      {
        className: `debug-manual-item ${u === k.path ? "active" : ""}`,
        onClick: () => D(k.path),
        title: k.title,
        children: k.title
      },
      k.id
    )) }),
    /* @__PURE__ */ n("div", { className: "debug-manual-content", children: [
      x && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      m && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: m.message }),
      h && /* @__PURE__ */ e(
        Be,
        {
          content: h,
          onLinkClick: (k) => {
            z(k), t == null || t(k);
          },
          onAppLinkClick: p
        }
      )
    ] })
  ] });
}
function kt(i) {
  const { meta: r, body: t } = St(i), p = t.split(`
`), u = {
    title: r.title,
    warning: r.warning,
    projects: []
  };
  let z = [], h = null, x = null, m = null, D = !1, l = [], k = [], L = [];
  const b = () => {
    if (L.length === 0) return;
    const g = $t(L);
    L = [], g && (m ? m.table = g : k.push(...zt(g)));
  }, I = () => {
    if (b(), m && k.length > 0) {
      const g = k.join(`
`).trim();
      g && (m.extraMd = (m.extraMd ? m.extraMd + `
` : "") + g);
    }
    k = [];
  }, E = () => {
    if (I(), h && m)
      if (D) {
        const g = [
          m.entries.map((S) => `- ${S.key}: ${S.value}`).join(`
`),
          m.extraMd ?? ""
        ].filter(Boolean).join(`

`);
        g.trim() && l.push(`## ${m.label}

${g}`);
      } else if (x) {
        let g = h.envs.find((S) => S.env === x);
        g || (g = { env: x, sections: [] }, h.envs.push(g)), g.sections.push(m);
      } else
        h.common.push(m);
    m = null, x = null, D = !1;
  }, y = () => {
    E(), h && (l.length > 0 && (h.notes = l.join(`

`).trim()), l = [], u.projects.push(h)), h = null;
  };
  for (let g = 0; g < p.length; g++) {
    const S = p[g], c = S.trim();
    if (/^\|.*\|$/.test(c)) {
      L.push(c);
      continue;
    } else L.length > 0 && b();
    if (/^---+$/.test(c)) continue;
    const O = /^#\s+(.+)$/.exec(S);
    if (O) {
      y();
      const j = O[1].trim();
      j === "共通" || /^(common|shared)$/i.test(j) ? h = { name: "共通", envs: [], common: [] } : h = { name: j, envs: [], common: [] };
      continue;
    }
    const W = /^##\s+(.+)$/.exec(S);
    if (W) {
      E(), h || (h = { name: "共通", envs: [], common: [] });
      const j = W[1].trim();
      if (/前提|注意|注記|note|備考/i.test(j)) {
        m = { label: j, entries: [] }, D = !0;
        continue;
      }
      const Q = /^(.+?)\s*\/\s*(.+)$/.exec(j);
      if (Q)
        x = Oe(Q[1].trim()), m = { label: Q[2].trim(), entries: [] };
      else {
        const U = Oe(j.replace(/環境$/, "").trim());
        U && /^(dev|staging|stg|prod|production|local|test)$/i.test(U) ? (x = U, m = { label: "アカウント", entries: [] }) : (x = null, m = { label: j, entries: [] });
      }
      continue;
    }
    if (h && !m) {
      const j = /^phase\s*:\s*(.+)$/i.exec(c);
      if (j) {
        h.phase = j[1].trim();
        continue;
      }
    }
    const P = /^\s*-\s+([^:]+?):\s*(.+)$/.exec(S);
    if (P && m && !D) {
      const j = P[1].trim(), Q = P[2].trim().replace(/^`|`$/g, "");
      m.entries.push({
        key: j,
        value: Q,
        kind: Ct(j, Q)
      });
      continue;
    }
    c === "" && k.length === 0 || (m ? k.push(S) : h || z.push(S));
  }
  y();
  const T = z.join(`
`).trim();
  return T && (u.preamble = T), u;
}
function St(i) {
  const r = /^---\n([\s\S]*?)\n---\n?/.exec(i);
  if (!r) return { meta: {}, body: i };
  const t = {};
  for (const p of r[1].split(`
`)) {
    const u = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(p);
    if (!u) continue;
    const z = u[1].toLowerCase(), h = u[2].trim().replace(/^["']|["']$/g, "");
    z === "title" ? t.title = h : z === "warning" && (t.warning = h);
  }
  return { meta: t, body: i.slice(r[0].length) };
}
function $t(i) {
  if (i.length < 2) return null;
  const r = (u) => u.replace(/^\|/, "").replace(/\|$/, "").split("|").map((z) => z.trim()), t = r(i[0]);
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(i[1]))
    return { headers: t, rows: i.slice(1).map(r) };
  const p = i.slice(2).map(r);
  return { headers: t, rows: p };
}
function zt(i) {
  const r = ["| " + i.headers.join(" | ") + " |"];
  r.push("| " + i.headers.map(() => "---").join(" | ") + " |");
  for (const t of i.rows) r.push("| " + t.join(" | ") + " |");
  return r;
}
function Oe(i) {
  const r = i.toLowerCase();
  return /^(staging|stg)$/.test(r) ? "staging" : /^(prod|production|本番)$/.test(r) ? "prod" : /^(dev|development|開発)$/.test(r) ? "dev" : /^(local|ローカル)$/.test(r) ? "local" : /^(test|テスト)$/.test(r) ? "test" : i;
}
function Ct(i, r) {
  const t = i.toLowerCase();
  return /pass|pwd|password|パスワード/.test(t) ? "password" : /url|link|endpoint/.test(t) || /^https?:\/\//.test(r) ? "url" : /mail|email|メール/.test(t) || /^[^\s@]+@[^\s@]+$/.test(r) ? "email" : /user|id|name|account|ユーザー/.test(t) ? "user" : "text";
}
async function tt(i, r = typeof document < "u" ? document : null) {
  var u, z, h;
  const t = (u = r == null ? void 0 : r.defaultView) == null ? void 0 : u.navigator;
  if ((z = t == null ? void 0 : t.clipboard) != null && z.writeText)
    try {
      return await t.clipboard.writeText(i), !0;
    } catch {
    }
  if (typeof navigator < "u" && ((h = navigator.clipboard) != null && h.writeText))
    try {
      return await navigator.clipboard.writeText(i), !0;
    } catch {
    }
  const p = r ?? (typeof document < "u" ? document : null);
  if (!p) return !1;
  try {
    const x = p.createElement("textarea");
    x.value = i, x.setAttribute("readonly", ""), x.style.position = "fixed", x.style.top = "0", x.style.left = "0", x.style.width = "1px", x.style.height = "1px", x.style.opacity = "0", x.style.pointerEvents = "none", (p.body || p.documentElement).appendChild(x), x.focus(), x.select();
    const m = p.execCommand("copy");
    return x.remove(), m;
  } catch {
    return !1;
  }
}
const Le = st(null);
function It({ md: i, pipDocument: r = null }) {
  const t = ve(() => kt(i), [i]), [p, u] = w(
    () => new Set(t.projects.map((h) => h.name))
  ), z = K((h) => {
    u((x) => {
      const m = new Set(x);
      return m.has(h) ? m.delete(h) : m.add(h), m;
    });
  }, []);
  return /* @__PURE__ */ e(Le.Provider, { value: r, children: /* @__PURE__ */ n("div", { className: "debug-env-tab", children: [
    t.title && /* @__PURE__ */ e("h3", { style: { margin: "0 0 8px", fontSize: "14px" }, children: t.title }),
    t.warning && /* @__PURE__ */ n(
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
          /* @__PURE__ */ e("span", { children: t.warning })
        ]
      }
    ),
    t.preamble && /* @__PURE__ */ e("div", { style: { marginBottom: "10px", fontSize: "12px" }, children: /* @__PURE__ */ e(Be, { content: t.preamble }) }),
    t.projects.length === 0 && /* @__PURE__ */ e("div", { className: "debug-empty", children: "環境情報が空です" }),
    t.projects.map((h) => /* @__PURE__ */ e(
      Ft,
      {
        project: h,
        isExpanded: p.has(h.name),
        onToggle: () => z(h.name)
      },
      h.name
    ))
  ] }) });
}
function Ft({
  project: i,
  isExpanded: r,
  onToggle: t
}) {
  var h;
  const p = i.envs.map((x) => x.env), [u, z] = w(p[0] ?? null);
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
            onClick: t,
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
              /* @__PURE__ */ e("span", { children: i.name }),
              i.phase && /* @__PURE__ */ e(
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
                  children: i.phase
                }
              )
            ]
          }
        ),
        r && /* @__PURE__ */ n("div", { style: { padding: "8px 10px" }, children: [
          i.common.map((x, m) => /* @__PURE__ */ e(Pe, { section: x }, `common-${m}`)),
          i.envs.length > 0 && /* @__PURE__ */ n(me, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "4px",
                  marginBottom: "8px",
                  borderBottom: `1px solid ${s.gray200}`
                },
                children: i.envs.map((x) => /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: () => z(x.env),
                    style: {
                      padding: "6px 12px",
                      background: "transparent",
                      border: "none",
                      borderBottom: u === x.env ? `2px solid ${s.primary}` : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: u === x.env ? 600 : 400,
                      color: u === x.env ? s.primary : s.gray700
                    },
                    children: x.env
                  },
                  x.env
                ))
              }
            ),
            (h = i.envs.find((x) => x.env === u)) == null ? void 0 : h.sections.map((x, m) => /* @__PURE__ */ e(Pe, { section: x }, `${u}-${m}`))
          ] }),
          i.notes && /* @__PURE__ */ n("details", { style: { marginTop: "10px" }, children: [
            /* @__PURE__ */ e("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600, color: s.gray700 }, children: "📝 前提・注意点" }),
            /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Be, { content: i.notes }) })
          ] })
        ] })
      ]
    }
  );
}
function Pe({ section: i }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "10px" }, children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, color: s.gray700, marginBottom: "4px" }, children: i.label }),
    i.entries.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: i.entries.map((r, t) => /* @__PURE__ */ e(Rt, { entry: r }, t)) }),
    i.table && /* @__PURE__ */ e("div", { style: { marginTop: "6px", overflowX: "auto" }, children: /* @__PURE__ */ n("table", { style: { width: "100%", fontSize: "11px", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: i.table.headers.map((r, t) => /* @__PURE__ */ e(
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
        t
      )) }) }),
      /* @__PURE__ */ e("tbody", { children: i.table.rows.map((r, t) => /* @__PURE__ */ e("tr", { children: r.map((p, u) => /* @__PURE__ */ e(
        Bt,
        {
          value: p,
          header: i.table.headers[u] ?? ""
        },
        u
      )) }, t)) })
    ] }) }),
    i.extraMd && /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Be, { content: i.extraMd }) })
  ] });
}
function Rt({ entry: i }) {
  const r = Xe(Le), [t, p] = w(!1), [u, z] = w(!1), h = async () => {
    await tt(i.value, r) && (z(!0), setTimeout(() => z(!1), 1200));
  }, x = i.kind === "password", m = x && !t ? "•".repeat(Math.min(i.value.length, 10)) : i.value, D = i.kind === "url" ? "link" : i.kind === "email" ? "mail" : i.kind === "password" ? "key" : i.kind === "user" ? "person" : "label";
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
        /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px", color: s.gray500 }, children: D }),
        /* @__PURE__ */ e("span", { style: { minWidth: "60px", color: s.gray700 }, children: i.key }),
        /* @__PURE__ */ e(
          "span",
          {
            style: {
              flex: 1,
              fontFamily: i.kind === "password" || i.kind === "user" ? "monospace" : "inherit",
              wordBreak: "break-all"
            },
            children: m
          }
        ),
        x && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => p((l) => !l),
            title: t ? "隠す" : "表示",
            style: be,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: t ? "visibility_off" : "visibility" })
          }
        ),
        i.kind === "url" && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => window.open(i.value, "_blank", "noopener"),
            title: "開く",
            style: be,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "open_in_new" })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: h,
            title: u ? "コピーしました" : "コピー",
            style: { ...be, color: u ? s.success : be.color },
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: u ? "check" : "content_copy" })
          }
        )
      ]
    }
  );
}
function Bt({ value: i, header: r }) {
  const t = Xe(Le), p = /pass|pwd|パスワード/i.test(r), u = /^https?:\/\//.test(i), z = /^[^\s@]+@[^\s@]+$/.test(i), [h, x] = w(!1), [m, D] = w(!1), l = async () => {
    await tt(i, t) && (D(!0), setTimeout(() => D(!1), 1200));
  }, k = p && !h ? "•".repeat(Math.min(i.length, 10)) : i;
  return /* @__PURE__ */ e(
    "td",
    {
      style: {
        padding: "4px 6px",
        borderBottom: `1px solid ${s.gray200}`,
        fontFamily: p ? "monospace" : "inherit",
        wordBreak: "break-all"
      },
      children: /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
        u ? /* @__PURE__ */ e("a", { href: i, target: "_blank", rel: "noopener noreferrer", style: { color: s.primary, flex: 1 }, children: i }) : z ? /* @__PURE__ */ e("span", { style: { flex: 1 }, children: i }) : /* @__PURE__ */ e("span", { style: { flex: 1 }, children: k }),
        p && /* @__PURE__ */ e("button", { type: "button", onClick: () => x((L) => !L), style: be, title: h ? "隠す" : "表示", children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: h ? "visibility_off" : "visibility" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: l,
            style: { ...be, color: m ? s.success : be.color },
            title: m ? "コピーしました" : "コピー",
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: m ? "check" : "content_copy" })
          }
        )
      ] })
    }
  );
}
const be = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  color: s.gray500,
  display: "inline-flex",
  alignItems: "center"
};
function nt(i) {
  const r = (i == null ? void 0 : i.bottom) ?? "calc(env(safe-area-inset-bottom, 0px) + 24px)", t = (i == null ? void 0 : i.right) ?? "calc(env(safe-area-inset-right, 0px) + 24px)";
  return {
    position: "fixed",
    bottom: typeof r == "number" ? `${r}px` : r,
    right: typeof t == "number" ? `${t}px` : t,
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
nt();
const He = {
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
}, Tt = `
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
    overflow: hidden;
  }
`;
function it() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    .debug-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
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

    /* Markdown スタイル */
    .manual-markdown {
      font-size: 13px;
      line-height: 1.6;
      color: ${s.gray900};
    }

    .manual-markdown h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid ${s.gray200}; }
    .manual-markdown h2 { font-size: 17px; font-weight: 600; margin: 14px 0 6px; }
    .manual-markdown h3 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
    .manual-markdown h4 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; }

    .manual-markdown p { margin: 8px 0; }

    .manual-markdown ul, .manual-markdown ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .manual-markdown li { margin: 2px 0; }

    .manual-markdown code {
      background: ${s.gray100};
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .manual-markdown pre {
      background: ${s.gray100};
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .manual-markdown pre code {
      background: none;
      padding: 0;
    }

    .manual-markdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
      font-size: 12px;
    }

    .manual-markdown th, .manual-markdown td {
      border: 1px solid ${s.gray200};
      padding: 6px 8px;
      text-align: left;
    }

    .manual-markdown th {
      background: ${s.gray100};
      font-weight: 600;
    }

    .manual-markdown blockquote {
      border-left: 3px solid ${s.gray300};
      padding-left: 12px;
      margin: 8px 0;
      color: ${s.gray500};
    }

    .manual-markdown img {
      max-width: 100%;
      height: auto;
    }

    .manual-markdown hr {
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
function _t() {
  return `${Tt}${it()}`;
}
function Et({
  apiBaseUrl: i,
  env: r = "dev",
  onSave: t,
  onClose: p,
  initialSize: u = { width: 400, height: 500 },
  testCases: z,
  logCapture: h,
  manualItems: x,
  manualDefaultPath: m,
  onManualNavigate: D,
  onManualAppNavigate: l,
  environmentsMd: k,
  triggerOffset: L
}) {
  var De, Ae;
  const [b, I] = w(null), [E, y] = w(null), [T, g] = w(!1), S = ue(!1), [c, O] = w("record"), W = z && z.length > 0, P = x && x.length > 0, j = !!k && k.trim().length > 0, [Q, U] = w(""), [ie, te] = w(""), [A, v] = w(""), [F, f] = w(!1), [G, _] = w(!1), [C, B] = w(!1), [a, M] = w(!1), [q, Z] = w(!1), [J, X] = w([]), [d, N] = w(null), [Y, se] = w([]), [ge, Se] = w(!1), $e = ue(null);
  ne(() => {
    i && We(i);
  }, [i]);
  const { notes: Te, createNote: ze, updateStatus: _e, refresh: we, error: Ce } = Ye(r), Ie = ue(Ce);
  Ie.current = Ce;
  const o = K(async () => {
    var de;
    const H = typeof window < "u" && ((de = window.matchMedia) == null ? void 0 : de.call(window, "(max-width: 768px)").matches);
    if (!window.documentPictureInPicture || H) {
      window.documentPictureInPicture || console.warn("Document Picture-in-Picture API is not supported"), g(!0);
      return;
    }
    if (!S.current) {
      S.current = !0;
      try {
        const oe = await window.documentPictureInPicture.requestWindow({
          width: u.width,
          height: u.height
        }), ce = oe.document.createElement("style");
        ce.textContent = _t(), oe.document.head.appendChild(ce);
        const ye = oe.document.createElement("div");
        ye.id = "debug-panel-root", oe.document.body.appendChild(ye), I(oe), y(ye), g(!0), oe.addEventListener("pagehide", () => {
          I(null), y(null), g(!1), p == null || p();
        });
      } catch (oe) {
        console.error("Failed to open PiP window:", oe), g(!0);
      } finally {
        S.current = !1;
      }
    }
  }, [u.width, u.height, p]), $ = K(() => {
    b ? b.close() : (g(!1), p == null || p());
  }, [b, p]), V = ue(b);
  V.current = b, ne(() => () => {
    var H;
    (H = V.current) == null || H.close();
  }, []), ne(() => {
    if (typeof document > "u" || document.getElementById("twuw-debug-panel-styles")) return;
    const H = document.createElement("style");
    H.id = "twuw-debug-panel-styles", H.textContent = it(), document.head.appendChild(H);
  }, []);
  const ae = K(() => {
    U(""), te(""), v(""), X([]), _(!1), B(!1), M(!1), Z(!1), N(null);
  }, []), Ee = K(async () => {
    var ye;
    if (!Q.trim()) {
      N({ type: "error", text: "内容は必須です" });
      return;
    }
    f(!0), N(null);
    const de = ((h == null ? void 0 : h.getNetworkLogs()) ?? []).map((ee) => {
      const xe = {
        timestamp: ee.timestamp,
        method: ee.method,
        url: ee.url,
        status: ee.status
      }, je = ["POST", "PUT", "DELETE", "PATCH"].includes(ee.method);
      return je && (ee.requestBody !== void 0 && (xe.requestBody = ee.requestBody), ee.responseBody !== void 0 && (xe.responseBody = ee.responseBody)), !je && C && ee.responseBody !== void 0 && (xe.responseBody = ee.responseBody), a && ee.duration != null && (xe.duration = ee.duration), q && (ee.requestHeaders && (xe.requestHeaders = ee.requestHeaders), ee.responseHeaders && (xe.responseHeaders = ee.responseHeaders)), xe;
    }), oe = {
      content: Q.trim(),
      userLog: ie ? ft(ie) : void 0,
      severity: A || void 0,
      testCaseIds: Y.length > 0 ? Y : void 0,
      consoleLogs: h == null ? void 0 : h.getConsoleLogs(),
      networkLogs: de.length > 0 ? de : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, ce = await ze(oe);
    if (ce) {
      if (J.length > 0)
        try {
          for (const ee of J)
            await re.uploadAttachment(r, ce.id, ee);
        } catch (ee) {
          console.warn("Failed to upload some attachments:", ee), N({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), f(!1);
          return;
        }
      N({ type: "success", text: "保存しました" }), t == null || t(ce), setTimeout(() => {
        ae();
      }, 1500);
    } else
      N({ type: "error", text: ((ye = Ie.current) == null ? void 0 : ye.message) || "保存に失敗しました" });
    f(!1);
  }, [Q, ie, A, Y, J, C, a, q, ze, t, ae, h, r]), rt = K(async () => {
    var H;
    Se(!0);
    try {
      c === "manage" ? we() : c === "test" && await ((H = $e.current) == null ? void 0 : H.refresh());
    } finally {
      Se(!1);
    }
  }, [c, we]), Me = /* @__PURE__ */ n("div", { className: "debug-panel", children: [
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
            onClick: rt,
            disabled: ge,
            title: "データを更新",
            children: /* @__PURE__ */ e(
              "span",
              {
                className: "debug-icon",
                style: {
                  fontSize: "18px",
                  animation: ge ? "spin 0.6s linear infinite" : "none"
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
            O("record"), N(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "manage" ? "active" : ""}`,
          onClick: () => O("manage"),
          children: "管理"
        }
      ),
      W && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "test" ? "active" : ""}`,
          onClick: () => O("test"),
          children: "テスト"
        }
      ),
      P && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "manual" ? "active" : ""}`,
          onClick: () => O("manual"),
          children: "マニュアル"
        }
      ),
      j && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "env" ? "active" : ""}`,
          onClick: () => O("env"),
          children: "環境"
        }
      )
    ] }),
    /* @__PURE__ */ n("main", { className: "debug-content", children: [
      c === "record" && /* @__PURE__ */ n(me, { children: [
        Y.length > 0 && /* @__PURE__ */ n(
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
                Y.map((H) => `#${H}`).join(", ")
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => se([]),
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
        d && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${d.type}`, children: d.text }),
        /* @__PURE__ */ n("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-severity", children: "重要度（任意）" }),
          /* @__PURE__ */ n(
            "select",
            {
              id: "debug-severity",
              value: A,
              onChange: (H) => v(H.target.value),
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
              value: Q,
              onChange: (H) => U(H.target.value),
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
              value: ie,
              onChange: (H) => te(H.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          et,
          {
            files: J,
            onAdd: (H) => X((de) => [...de, ...H]),
            onRemove: (H) => X((de) => de.filter((oe, ce) => ce !== H)),
            disabled: F,
            pipDocument: ((De = V.current) == null ? void 0 : De.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => _(!G),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: G ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        G && /* @__PURE__ */ n("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: C,
                onChange: (H) => B(H.target.checked)
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
                onChange: (H) => M(H.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: q,
                onChange: (H) => Z(H.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      c === "manage" && /* @__PURE__ */ e(yt, { notes: Te, updateStatus: _e }),
      c === "manual" && P && /* @__PURE__ */ e(
        wt,
        {
          items: x,
          defaultPath: m,
          onNavigate: D,
          onAppNavigate: l
        }
      ),
      c === "env" && j && /* @__PURE__ */ e(It, { md: k, pipDocument: ((Ae = V.current) == null ? void 0 : Ae.document) ?? null }),
      c === "test" && W && /* @__PURE__ */ e(
        vt,
        {
          ref: $e,
          testCases: z,
          env: r,
          logCapture: h,
          onNotesRefresh: we,
          onRunningCasesChange: se
        }
      )
    ] }),
    c === "record" && /* @__PURE__ */ n("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: ae, className: "debug-btn debug-btn-secondary", disabled: F, children: "クリア" }),
      /* @__PURE__ */ e("button", { onClick: Ee, className: "debug-btn debug-btn-primary", disabled: F, children: F ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
  return E ? ht(Me, E) : T ? /* @__PURE__ */ e("div", { style: He.overlay, children: /* @__PURE__ */ e("div", { style: He.panel, children: Me }) }) : /* @__PURE__ */ e("button", { onClick: o, style: nt(L), "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ n("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
    "バグ",
    /* @__PURE__ */ e("br", {}),
    "記録"
  ] }) });
}
function le({ size: i = 16, color: r }) {
  return /* @__PURE__ */ n(me, { children: [
    /* @__PURE__ */ e(
      "span",
      {
        role: "status",
        "aria-label": "読み込み中",
        style: {
          display: "inline-block",
          width: `${i}px`,
          height: `${i}px`,
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
function R({ name: i, size: r = 20, color: t }) {
  return /* @__PURE__ */ e(
    "span",
    {
      className: "material-symbols-outlined",
      style: {
        fontSize: `${r}px`,
        color: t,
        lineHeight: 1,
        verticalAlign: "middle"
      },
      children: i
    }
  );
}
const Nt = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, Wt = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function Lt({ domains: i, colors: r, isDarkMode: t }) {
  const p = t ? Wt : Nt;
  return i.length === 0 ? /* @__PURE__ */ e("div", { style: {
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
    }, children: i.map((u) => /* @__PURE__ */ e(
      Mt,
      {
        domain: u,
        colors: r,
        tc: p
      },
      u.domain
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
          background: p.passed
        } }),
        "passed"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: p.fail
        } }),
        "fail / 要対応"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: p.retest
        } }),
        "retest"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: p.untested
        } }),
        "未テスト"
      ] })
    ] })
  ] });
}
function Mt({ domain: i, colors: r, tc: t }) {
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
      /* @__PURE__ */ e("span", { children: i.domain }),
      /* @__PURE__ */ n("span", { style: {
        fontSize: "12px",
        fontWeight: 500,
        color: r.textMuted
      }, children: [
        i.passed,
        "/",
        i.total
      ] })
    ] }),
    /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: i.capabilities.map((p) => /* @__PURE__ */ e(
      Dt,
      {
        cap: p,
        colors: r,
        tc: t
      },
      p.capability
    )) })
  ] });
}
function Dt({ cap: i, colors: r, tc: t }) {
  const p = i.status === "fail" ? t.fail : i.status === "retest" ? t.retest : i.status === "passed" ? t.passed : t.untested, u = i.status === "fail" ? t.failBg : i.status === "retest" ? t.retestBg : i.status === "passed" ? t.passedBg : t.untestedBg;
  return /* @__PURE__ */ n("div", { style: {
    borderLeft: `4px solid ${p}`,
    background: u,
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
      }, children: i.capability }),
      /* @__PURE__ */ n("span", { style: {
        fontSize: "12px",
        color: r.textMuted
      }, children: [
        i.passed,
        "/",
        i.total
      ] })
    ] }),
    /* @__PURE__ */ n("div", { style: {
      display: "flex",
      height: "8px",
      borderRadius: "4px",
      overflow: "hidden",
      background: t.untested
    }, children: [
      i.passed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${i.passed / i.total * 100}%`,
        background: t.passed
      } }),
      i.failed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${i.failed / i.total * 100}%`,
        background: t.fail
      } })
    ] })
  ] });
}
const At = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, jt = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function Ot({ tree: i, colors: r, isDarkMode: t, onNavigateToNote: p }) {
  const u = t ? jt : At, [z, h] = w(/* @__PURE__ */ new Set()), [x, m] = w(/* @__PURE__ */ new Set());
  ne(() => {
    h((y) => {
      const T = new Set(y);
      return i.forEach((g) => T.add(g.domain)), T;
    });
  }, [i]);
  const [D, l] = w("all"), [k, L] = w(!1), b = (y) => {
    h((T) => {
      const g = new Set(T);
      return g.has(y) ? g.delete(y) : g.add(y), g;
    });
  }, I = (y) => {
    m((T) => {
      const g = new Set(T);
      return g.has(y) ? g.delete(y) : g.add(y), g;
    });
  }, E = ve(() => i.map((y) => {
    const T = y.capabilities.filter((g) => {
      const S = g.passed === g.total && g.total > 0, c = g.failed > 0 || g.openIssues > 0, O = g.passed < g.total;
      return !(D === "passed" && !S || D === "fail" && !c || D === "incomplete" && !O || k && S && g.openIssues === 0);
    });
    return T.length === 0 ? null : { ...y, capabilities: T };
  }).filter((y) => y !== null), [i, D, k]);
  return i.length === 0 ? null : /* @__PURE__ */ n("div", { children: [
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
          value: D,
          onChange: (y) => l(y.target.value),
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
            onChange: (y) => L(y.target.checked),
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
      E.map((y, T) => {
        const g = z.has(y.domain), S = y.capabilities.reduce((W, P) => W + P.total, 0), c = y.capabilities.reduce((W, P) => W + P.passed, 0), O = S > 0 ? Math.round(c / S * 100) : 0;
        return /* @__PURE__ */ n("div", { children: [
          /* @__PURE__ */ n(
            "div",
            {
              onClick: () => b(y.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: r.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${r.border}`,
                borderTop: T > 0 ? `1px solid ${r.border}` : "none",
                gap: "8px",
                userSelect: "none"
              },
              children: [
                /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: r.textMuted, width: "16px" }, children: g ? "▼" : "▶" }),
                /* @__PURE__ */ e("span", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: r.text,
                  flex: 1
                }, children: y.domain }),
                /* @__PURE__ */ n("span", { style: {
                  fontSize: "13px",
                  color: r.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  c,
                  "/",
                  S,
                  " ",
                  O,
                  "%"
                ] })
              ]
            }
          ),
          g && y.capabilities.map((W) => {
            const P = `${y.domain}/${W.capability}`, j = x.has(P), Q = W.passed === W.total && W.total > 0, U = W.cases.some((f) => f.last === "fail" && f.openIssues > 0), ie = W.cases.some((f) => f.last === "fail" && f.openIssues === 0), te = !U && ie, A = U, v = Q ? "●" : A ? "▲" : te ? "◆" : "○", F = Q ? u.passed : A ? u.fail : te ? u.retest : u.untested;
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => I(P),
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
                    /* @__PURE__ */ e("span", { style: { color: F, fontSize: "14px", width: "16px" }, children: v }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: r.text,
                      flex: 1
                    }, children: W.capability }),
                    /* @__PURE__ */ n("span", { style: {
                      fontSize: "12px",
                      color: r.textMuted,
                      fontVariantNumeric: "tabular-nums"
                    }, children: [
                      W.passed,
                      "/",
                      W.total
                    ] }),
                    Q && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: u.passed,
                      fontWeight: 600
                    }, children: "passed" }),
                    A && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: u.fail,
                      fontWeight: 600
                    }, children: "fail" }),
                    te && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: u.retest,
                      fontWeight: 600
                    }, children: "retest" }),
                    W.openIssues > 0 && /* @__PURE__ */ n("span", { style: {
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${u.fail}18`,
                      color: u.fail,
                      fontWeight: 600
                    }, children: [
                      W.openIssues,
                      "件"
                    ] })
                  ]
                }
              ),
              j && W.cases.map((f) => /* @__PURE__ */ e(
                Pt,
                {
                  c: f,
                  tc: u,
                  colors: r,
                  onNavigateToNote: p
                },
                f.caseId
              ))
            ] }, P);
          })
        ] }, y.domain);
      }),
      E.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: r.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function Pt({ c: i, tc: r, colors: t, onNavigateToNote: p }) {
  const u = i.last === "fail" && i.openIssues === 0, z = i.last === "pass" ? "●" : u ? "◆" : i.last === "fail" ? "▲" : "○", h = i.last === "pass" ? r.passed : u ? r.retest : i.last === "fail" ? r.fail : r.untested;
  return /* @__PURE__ */ n("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: t.bg,
    borderBottom: `1px solid ${t.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: h, fontSize: "12px", width: "16px" }, children: z }),
    /* @__PURE__ */ e("span", { style: { color: t.text, flex: 1 }, children: i.title }),
    /* @__PURE__ */ e("span", { style: {
      fontSize: "11px",
      color: t.textMuted
    }, children: i.last || "-" }),
    i.openIssues > 0 && /* @__PURE__ */ n(
      "button",
      {
        onClick: (x) => {
          x.stopPropagation(), p(i.caseId);
        },
        style: {
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "10px",
          background: `${r.fail}18`,
          color: t.link,
          fontWeight: 600,
          border: "none",
          cursor: "pointer"
        },
        children: [
          i.openIssues,
          "件"
        ]
      }
    )
  ] });
}
const Ht = 3e4;
function qt({ env: i, colors: r, isDarkMode: t, onNavigateToNote: p, refreshKey: u }) {
  const [z, h] = w([]), [x, m] = w(!0), [D, l] = w(null), k = ue(0);
  ne(() => {
    let b = !1;
    const I = ++k.current, E = async () => {
      try {
        const T = await re.getTestTree(i);
        !b && k.current === I && (h(T), l(null));
      } catch (T) {
        !b && k.current === I && l(T instanceof Error ? T.message : "Failed to fetch test tree");
      } finally {
        !b && k.current === I && m(!1);
      }
    };
    m(!0), E();
    const y = setInterval(E, Ht);
    return () => {
      b = !0, clearInterval(y);
    };
  }, [i, u]);
  const L = ve(() => z.map((b) => {
    let I = 0, E = 0, y = 0, T = !1;
    const g = b.capabilities.map((c) => {
      const O = c.total - c.passed - c.failed;
      I += c.total, E += c.passed, y += c.failed, (c.failed > 0 || c.openIssues > 0) && (T = !0);
      const W = c.passed === c.total && c.total > 0, P = c.cases.some((U) => U.last === "fail" && U.openIssues > 0), j = c.cases.some((U) => U.last === "fail" && U.openIssues === 0), Q = W ? "passed" : P ? "fail" : j ? "retest" : "incomplete";
      return {
        capability: c.capability,
        total: c.total,
        passed: c.passed,
        failed: c.failed,
        untested: O < 0 ? 0 : O,
        openIssues: c.openIssues,
        status: Q,
        cases: c.cases
      };
    }), S = I - E - y;
    return {
      domain: b.domain,
      total: I,
      passed: E,
      failed: y,
      untested: S < 0 ? 0 : S,
      hasIssues: T,
      capabilities: g
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
    /* @__PURE__ */ e(le, { size: 24, color: r.primary }),
    /* @__PURE__ */ e("span", { style: { fontSize: "14px" }, children: "テストデータを読み込み中..." })
  ] }) : D && z.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "24px",
    background: r.errorBg,
    color: r.error,
    borderRadius: "12px",
    margin: "24px",
    fontSize: "13px"
  }, children: D }) : /* @__PURE__ */ e("div", { style: {
    padding: "32px",
    overflow: "auto",
    flex: 1
  }, children: /* @__PURE__ */ n("div", { style: { maxWidth: "1200px" }, children: [
    /* @__PURE__ */ e(
      Lt,
      {
        domains: L,
        colors: r,
        isDarkMode: t
      }
    ),
    /* @__PURE__ */ e(
      Ot,
      {
        tree: z,
        colors: r,
        isDarkMode: t,
        onNavigateToNote: p
      }
    )
  ] }) });
}
const Fe = {
  bug: { label: "不具合", icon: "bug_report" },
  question: { label: "質問", icon: "help" },
  request: { label: "要望", icon: "lightbulb" },
  share: { label: "共有", icon: "share" },
  other: { label: "その他", icon: "more_horiz" }
}, Vt = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, Ne = {
  app: "アプリ",
  manual: "マニュアル"
}, qe = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function Ve(i) {
  const r = Vt[i] ?? "#6B7280";
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
function Ge(i, r) {
  let t, p;
  switch (i) {
    case "open":
      t = r.warningBg, p = r.warning;
      break;
    case "in_progress":
      t = r.primaryLight, p = r.primary;
      break;
    case "closed":
      t = r.successBg, p = r.success;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: t,
    color: p,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function Gt({ apiBaseUrl: i, adminKey: r, colors: t, isDarkMode: p, refreshKey: u }) {
  var Z, J, X;
  const {
    feedbacks: z,
    total: h,
    page: x,
    limit: m,
    loading: D,
    error: l,
    filters: k,
    customTags: L,
    setFilters: b,
    setPage: I,
    updateStatus: E,
    remove: y,
    refresh: T
  } = pt({ apiBaseUrl: i, adminKey: r }), [g, S] = w(null), [c, O] = w(null), [W, P] = w(!1), [j, Q] = w(null), [U, ie] = w(null), te = ue(0), A = ue(u);
  ne(() => {
    u !== A.current && (A.current = u, T());
  }, [u, T]);
  const v = Math.max(1, Math.ceil(h / m)), F = K(async (d) => {
    if (g === d) return;
    S(d), P(!0), O(null);
    const N = ++te.current;
    try {
      const Y = await ut({ apiBaseUrl: i, adminKey: r, id: d });
      if (te.current !== N) return;
      O(Y);
    } catch {
      if (te.current !== N) return;
      O(null);
    }
    te.current === N && P(!1);
  }, [g, i, r]), f = K(async (d, N) => {
    await E(d, N) && (c == null ? void 0 : c.id) === d && O((se) => se ? { ...se, status: N } : null);
  }, [E, c == null ? void 0 : c.id]), G = K(async (d) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await y(d) && g === d && (S(null), O(null));
  }, [y, g]), _ = K(async (d, N) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await gt({ apiBaseUrl: i, adminKey: r, feedbackId: d, attachmentId: N }), O((Y) => {
          var se;
          return !Y || Y.id !== d ? Y : {
            ...Y,
            attachments: (se = Y.attachments) == null ? void 0 : se.filter((ge) => ge.id !== N)
          };
        });
      } catch (Y) {
        console.error("Failed to delete attachment:", Y);
      }
  }, [i, r]), C = K((d) => {
    try {
      const N = new URL(i);
      return `${N.origin}${N.pathname.replace(/\/$/, "")}/attachments/${d}`;
    } catch {
      return `${i}/attachments/${d}`;
    }
  }, [i]), B = K(async (d) => {
    ie(d);
    try {
      await xt({ apiBaseUrl: i, adminKey: r, format: d });
    } catch (N) {
      console.error("Export failed:", N);
    } finally {
      ie(null);
    }
  }, [i, r]), a = {
    open: z.filter((d) => d.status === "open").length,
    inProgress: z.filter((d) => d.status === "in_progress").length,
    closed: z.filter((d) => d.status === "closed").length
  }, M = p ? "#0D1117" : "#1E293B", q = p ? "#21262D" : "#2D3748";
  return /* @__PURE__ */ n("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
    /* @__PURE__ */ n("aside", { style: {
      width: "380px",
      borderRight: `1px solid ${t.border}`,
      display: "flex",
      flexDirection: "column",
      background: t.bgSecondary
    }, children: [
      /* @__PURE__ */ n("div", { style: {
        padding: "16px",
        display: "flex",
        gap: "10px",
        borderBottom: `1px solid ${t.border}`,
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ n(
          "select",
          {
            value: k.status,
            onChange: (d) => b({ status: d.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: t.bg,
              color: t.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全ステータス" }),
              qe.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
            ]
          }
        ),
        /* @__PURE__ */ n(
          "select",
          {
            value: k.kind,
            onChange: (d) => b({ kind: d.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: t.bg,
              color: t.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${t.border}`
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
            onChange: (d) => b({ target: d.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: t.bg,
              color: t.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
              /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
              /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
            ]
          }
        ),
        L.length > 0 && /* @__PURE__ */ n(
          "select",
          {
            value: k.customTag,
            onChange: (d) => b({ customTag: d.target.value }),
            style: {
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: t.bg,
              color: t.text,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
              L.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", padding: "12px" }, children: [
        D && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: t.textMuted }, children: [
          /* @__PURE__ */ e(le, { size: 24, color: t.primary }),
          /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
        ] }),
        l && /* @__PURE__ */ e("div", { style: {
          padding: "16px",
          background: t.errorBg,
          color: t.error,
          borderRadius: "12px",
          margin: "8px",
          fontSize: "13px"
        }, children: l.message }),
        !D && z.length === 0 && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: t.textMuted }, children: [
          /* @__PURE__ */ e(R, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        z.map((d) => {
          const N = Fe[d.kind] ?? { label: d.kind, icon: "help" }, Y = g === d.id;
          return /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: t.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: Y ? `2px solid ${t.primary}` : "2px solid transparent",
                boxShadow: Y ? `0 4px 12px ${t.primary}30` : `0 1px 3px ${t.border}`,
                transition: "all 0.2s"
              },
              onClick: () => F(d.id),
              children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ n("span", { style: { fontSize: "11px", color: t.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    d.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: Ve(d.kind), children: [
                    /* @__PURE__ */ e(R, { name: N.icon, size: 12 }),
                    N.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: Ge(d.status, t), children: d.status === "open" ? "Open" : d.status === "in_progress" ? "対応中" : "完了" }),
                  d.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: t.bgTertiary,
                    color: t.textSecondary,
                    fontWeight: 500
                  }, children: Ne[d.target] ?? d.target }),
                  d.customTag && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${t.primary}15`,
                    color: t.primary,
                    fontWeight: 500
                  }, children: d.customTag })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: t.text,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }, children: d.message.split(`
`)[0].slice(0, 80) }),
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: t.textMuted
                }, children: [
                  /* @__PURE__ */ e("span", { children: Jt(d.createdAt) }),
                  d.pageUrl && /* @__PURE__ */ n(me, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ n("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      background: t.bgTertiary,
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "180px"
                    }, children: [
                      /* @__PURE__ */ e(R, { name: "link", size: 12 }),
                      d.pageUrl
                    ] })
                  ] }),
                  (d.attachmentCount ?? 0) > 0 && /* @__PURE__ */ n(me, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ n("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "11px",
                      color: t.textMuted
                    }, children: [
                      /* @__PURE__ */ e(R, { name: "image", size: 12 }),
                      d.attachmentCount
                    ] })
                  ] })
                ] })
              ]
            },
            d.id
          );
        })
      ] }),
      v > 1 && /* @__PURE__ */ n("div", { style: {
        padding: "12px 16px",
        borderTop: `1px solid ${t.border}`,
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
              background: t.bg,
              color: x <= 1 ? t.textMuted : t.text,
              cursor: x <= 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: /* @__PURE__ */ e(R, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ n("span", { style: { fontSize: "13px", color: t.textSecondary }, children: [
          x,
          " / ",
          v
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => I(x + 1),
            disabled: x >= v,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: t.bg,
              color: x >= v ? t.textMuted : t.text,
              cursor: x >= v ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: /* @__PURE__ */ e(R, { name: "chevron_right", size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { style: {
        padding: "16px",
        borderTop: `1px solid ${t.border}`,
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        fontSize: "12px",
        color: t.textMuted
      }, children: [
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(R, { name: "description", size: 16 }),
          h,
          " 件"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(R, { name: "error", size: 16, color: t.warning }),
          a.open,
          " Open"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(R, { name: "pending", size: 16, color: t.primary }),
          a.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(R, { name: "check_circle", size: 16, color: t.success }),
          a.closed,
          " 完了"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ n("main", { style: {
      flex: 1,
      overflow: "auto",
      padding: "32px",
      background: t.bg
    }, children: [
      g && W && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: t.textMuted }, children: [
        /* @__PURE__ */ e(le, { size: 32, color: t.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      g && !W && c && /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ n("span", { style: Ve(c.kind), children: [
                /* @__PURE__ */ e(R, { name: ((Z = Fe[c.kind]) == null ? void 0 : Z.icon) ?? "help", size: 14 }),
                ((J = Fe[c.kind]) == null ? void 0 : J.label) ?? c.kind
              ] }),
              /* @__PURE__ */ e("span", { style: Ge(c.status, t), children: c.status === "open" ? "Open" : c.status === "in_progress" ? "対応中" : "完了" }),
              c.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: t.bgTertiary,
                color: t.textSecondary,
                fontWeight: 500
              }, children: Ne[c.target] ?? c.target }),
              c.customTag && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: `${t.primary}15`,
                color: t.primary,
                fontWeight: 600
              }, children: c.customTag })
            ] }),
            /* @__PURE__ */ n("h2", { style: {
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: t.text,
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
                onChange: (d) => f(c.id, d.target.value),
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: t.bgSecondary,
                  color: t.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer"
                },
                children: qe.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
              }
            ),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => G(c.id),
                style: {
                  padding: "10px 16px",
                  background: t.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: t.error,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                },
                children: [
                  /* @__PURE__ */ e(R, { name: "delete", size: 16 }),
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
          /* @__PURE__ */ e(he, { icon: "category", label: "種別", value: ((X = Fe[c.kind]) == null ? void 0 : X.label) ?? c.kind, colors: t }),
          /* @__PURE__ */ e(he, { icon: "ads_click", label: "対象", value: c.target ? Ne[c.target] ?? c.target : "-", colors: t }),
          /* @__PURE__ */ e(he, { icon: "schedule", label: "日時", value: Kt(c.createdAt), colors: t }),
          c.pageUrl && /* @__PURE__ */ e(he, { icon: "link", label: "URL", value: c.pageUrl, isLink: !0, colors: t }),
          c.userType && /* @__PURE__ */ e(he, { icon: "person", label: "ユーザー", value: c.userType, colors: t }),
          c.appVersion && /* @__PURE__ */ e(he, { icon: "inventory_2", label: "バージョン", value: c.appVersion, colors: t })
        ] }),
        /* @__PURE__ */ e(ke, { icon: "chat", title: "メッセージ", colors: t, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: t.text
        }, children: c.message }) }),
        c.environment && Object.keys(c.environment).length > 0 && /* @__PURE__ */ e(ke, { icon: "devices", title: "環境情報", colors: t, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: Object.entries(c.environment).map(([d, N]) => /* @__PURE__ */ e(he, { icon: "info", label: d, value: String(N), colors: t }, d)) }) }),
        c.consoleLogs && c.consoleLogs.length > 0 && /* @__PURE__ */ e(ke, { icon: "terminal", title: `コンソールログ (${c.consoleLogs.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: M }, children: c.consoleLogs.map((d, N) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${q}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: d.level === "error" ? "#F87171" : d.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: d.level === "error" ? "#7F1D1D40" : d.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: d.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: d.message })
        ] }, N)) }) }),
        c.networkLogs && c.networkLogs.length > 0 && /* @__PURE__ */ e(ke, { icon: "wifi", title: `ネットワークログ (${c.networkLogs.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: M }, children: c.networkLogs.map((d, N) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${q}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ e("span", { style: { fontWeight: 600, color: "#94A3B8", width: "40px", flexShrink: 0 }, children: d.method }),
          /* @__PURE__ */ e("span", { style: { color: d.status >= 400 ? "#F87171" : "#34D399", fontWeight: 600, flexShrink: 0 }, children: d.status }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: d.url }),
          /* @__PURE__ */ e("span", { style: { color: "#64748B", flexShrink: 0 }, children: d.duration != null ? `${d.duration}ms` : "-" })
        ] }, N)) }) }),
        c.attachments && c.attachments.length > 0 && /* @__PURE__ */ e(ke, { icon: "image", title: `添付画像 (${c.attachments.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: {
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }, children: c.attachments.map((d) => /* @__PURE__ */ n("div", { style: {
          position: "relative",
          width: "120px",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${t.border}`,
          background: t.bgSecondary
        }, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: C(d.filename),
              alt: d.original_name,
              style: {
                width: "100%",
                height: "100px",
                objectFit: "cover",
                cursor: "pointer",
                display: "block"
              },
              onClick: () => Q(C(d.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => _(c.id, d.id),
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
              children: /* @__PURE__ */ e(R, { name: "close", size: 14 })
            }
          ),
          /* @__PURE__ */ e("div", { style: {
            padding: "6px 8px",
            fontSize: "11px",
            color: t.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: d.original_name })
        ] }, d.id)) }) }),
        j && /* @__PURE__ */ e(
          "div",
          {
            onClick: () => Q(null),
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
      g && !W && !c && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: t.textMuted }, children: [
        /* @__PURE__ */ e(R, { name: "error_outline", size: 48 }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px", fontSize: "16px" }, children: "詳細の取得に失敗しました" })
      ] }),
      !g && /* @__PURE__ */ n("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: t.textMuted,
        gap: "24px"
      }, children: [
        /* @__PURE__ */ n("div", { style: {
          padding: "24px 32px",
          background: t.bgSecondary,
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%"
        }, children: [
          /* @__PURE__ */ n("div", { style: {
            fontSize: "14px",
            fontWeight: 600,
            color: t.textSecondary,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }, children: [
            /* @__PURE__ */ e(R, { name: "analytics", size: 18 }),
            "フィードバック概要"
          ] }),
          /* @__PURE__ */ n("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "13px",
            color: t.textSecondary,
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.text }, children: h }),
              " 件"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.warning }, children: a.open }),
              " Open"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.primary }, children: a.inProgress }),
              " 対応中"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.success }, children: a.closed }),
              " 完了"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }, children: ["json", "csv", "sqlite"].map((d) => /* @__PURE__ */ n(
            "button",
            {
              onClick: () => B(d),
              disabled: U !== null,
              style: {
                padding: "8px 14px",
                background: t.bg,
                border: "none",
                borderRadius: "10px",
                cursor: U !== null ? "not-allowed" : "pointer",
                color: t.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: U !== null && U !== d ? 0.5 : 1,
                boxShadow: `0 1px 3px ${t.border}`,
                transition: "all 0.2s"
              },
              children: [
                U === d ? /* @__PURE__ */ e(le, { size: 14, color: t.text }) : /* @__PURE__ */ e(R, { name: "download", size: 16 }),
                d.toUpperCase()
              ]
            },
            d
          )) })
        ] }),
        /* @__PURE__ */ n("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ e(R, { name: "arrow_back", size: 48 }),
          /* @__PURE__ */ e("div", { style: { fontSize: "16px", fontWeight: 500, marginTop: "12px" }, children: "フィードバックを選択してください" }),
          /* @__PURE__ */ e("div", { style: { fontSize: "13px", marginTop: "6px" }, children: "左のリストから選択すると詳細が表示されます" })
        ] })
      ] })
    ] })
  ] });
}
function he({ icon: i, label: r, value: t, isLink: p, colors: u }) {
  return /* @__PURE__ */ n("div", { style: {
    padding: "16px",
    background: u.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "12px",
      color: u.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(R, { name: i, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: p ? u.link : u.text,
      fontFamily: p ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: t })
  ] });
}
function ke({ icon: i, title: r, children: t, colors: p }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ n("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: p.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(R, { name: i, size: 18 }),
      r
    ] }),
    t
  ] });
}
function Jt(i) {
  const r = new Date(i), t = r.getMonth() + 1, p = r.getDate(), u = r.getHours().toString().padStart(2, "0"), z = r.getMinutes().toString().padStart(2, "0");
  return `${t}/${p} ${u}:${z}`;
}
function Kt(i) {
  return new Date(i).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Qt = {
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
}, Ut = {
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
}, Zt = 3e4;
function un({ apiBaseUrl: i, env: r = "dev", feedbackApiBaseUrl: t, feedbackAdminKey: p }) {
  const [u, z] = w(""), [h, x] = w(""), [m, D] = w(""), [l, k] = w(null), [L, b] = w(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [I, E] = w(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 768px)").matches);
  ne(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(max-width: 768px)"), $ = (V) => E(V.matches);
    return o.addEventListener("change", $), () => o.removeEventListener("change", $);
  }, []);
  const [y, T] = w(!0), [g, S] = w(null), [c, O] = w("notes"), W = !!(t && p), [P, j] = w(null), [Q, U] = w(0), [ie, te] = w(null), [A, v] = w(null), [F, f] = w(""), [G, _] = w(""), [C, B] = w(!1), a = L ? Ut : Qt;
  ne(() => {
    i && We(i);
  }, [i]), ne(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(prefers-color-scheme: dark)"), $ = (V) => b(V.matches);
    return o.addEventListener("change", $), () => o.removeEventListener("change", $);
  }, []);
  const { notes: M, loading: q, error: Z, updateStatus: J, updateSeverity: X, deleteNote: d, refresh: N } = Ye(r);
  ne(() => {
    !q && g === "refresh" && S(null);
  }, [q, g]), ne(() => {
    if (l) {
      const o = M.find(($) => $.id === l.id);
      k(o || null);
    }
  }, [M]), ne(() => {
    if (!y) return;
    const o = setInterval(() => {
      N();
    }, Zt);
    return () => clearInterval(o);
  }, [y, N]);
  const Y = K((o) => {
    const V = `${i || dt()}/export/${o}?env=${r}`;
    window.open(V, "_blank");
  }, [i, r]), se = K((o) => {
    j(o), z("open"), O("notes");
  }, []), ge = ve(() => M.filter((o) => {
    if (u && o.status !== u || h && (o.source || "manual") !== h || P != null && !(o.test_case_ids ?? (o.test_case_id ? [o.test_case_id] : [])).includes(P))
      return !1;
    if (m) {
      const $ = m.match(/^#([1-9]\d*)$/);
      if ($) {
        if (o.id !== Number($[1])) return !1;
      } else {
        const V = m.toLowerCase();
        if (!o.title.toLowerCase().includes(V) && !o.content.toLowerCase().includes(V)) return !1;
      }
    }
    return !0;
  }), [M, u, h, P, m]), Se = K((o, $) => {
    $ === "fixed" || $ === "resolved" || $ === "rejected" ? (v({ id: o, status: $ }), f("")) : (async () => {
      S(`status-${o}`);
      try {
        await J(o, $), (l == null ? void 0 : l.id) === o && k((V) => V ? { ...V, status: $ } : null);
      } finally {
        S(null);
      }
    })();
  }, [J, l == null ? void 0 : l.id]), $e = K(async () => {
    if (!A) return;
    const { id: o, status: $ } = A;
    if (!(($ === "fixed" || $ === "rejected") && F.trim() === "")) {
      S(`status-${o}`);
      try {
        const V = F.trim() ? { comment: F.trim() } : void 0;
        if (await J(o, $, V), (l == null ? void 0 : l.id) === o && k((ae) => ae ? { ...ae, status: $ } : null), v(null), f(""), (l == null ? void 0 : l.id) === o)
          try {
            const ae = await re.getNote(r, o);
            k(ae);
          } catch {
          }
      } finally {
        S(null);
      }
    }
  }, [A, F, J, l == null ? void 0 : l.id, r]), Te = K(async (o, $) => {
    S(`severity-${o}`);
    try {
      await X(o, $), (l == null ? void 0 : l.id) === o && k((V) => V ? { ...V, severity: $ } : null);
    } finally {
      S(null);
    }
  }, [X, l == null ? void 0 : l.id]), ze = K(async (o) => {
    k(o);
    try {
      const $ = await re.getNote(r, o.id);
      k($);
    } catch {
    }
  }, [r]), _e = K(async (o) => {
    if (confirm("このノートを削除しますか？")) {
      S(`delete-${o}`);
      try {
        await d(o), (l == null ? void 0 : l.id) === o && k(null);
      } finally {
        S(null);
      }
    }
  }, [d, l == null ? void 0 : l.id]), we = K(async (o, $) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await re.deleteAttachment(r, o, $), k((V) => {
          var ae;
          return !V || V.id !== o ? V : {
            ...V,
            attachments: (ae = V.attachments) == null ? void 0 : ae.filter((Ee) => Ee.id !== $)
          };
        });
      } catch (V) {
        console.error("Failed to delete attachment:", V);
      }
  }, [r]), Ce = K(async () => {
    if (!(!l || G.trim() === "")) {
      B(!0);
      try {
        const o = await re.addActivity(r, l.id, { content: G.trim() });
        k(($) => $ && {
          ...$,
          activities: [...$.activities || [], o]
        }), _("");
      } catch (o) {
        console.error("Failed to add comment:", o);
      } finally {
        B(!1);
      }
    }
  }, [l, G, r]), Ie = (o) => {
    if (!o) return [];
    try {
      const $ = JSON.parse(o);
      return Array.isArray($) ? $ : [];
    } catch {
      return o.split(`
`).filter(($) => $.trim());
    }
  };
  return /* @__PURE__ */ n("div", { style: Yt(a), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ n("header", { style: {
      ...en(a),
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
          }, children: /* @__PURE__ */ e(R, { name: "bug_report", size: 24, color: "#FFF" }) }),
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
          background: y ? a.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: y ? a.success : a.textMuted,
            animation: y ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: y,
              onChange: (o) => T(o.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => Y("json"),
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
              /* @__PURE__ */ e(R, { name: "download", size: 16 }),
              "JSON"
            ]
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => Y("sqlite"),
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
              /* @__PURE__ */ e(R, { name: "download", size: 16 }),
              "SQLite"
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => b(!L),
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
            title: L ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(R, { name: L ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => {
              S("refresh"), N(), U((o) => o + 1);
            },
            disabled: g !== null,
            style: {
              padding: "10px 20px",
              background: a.primary,
              border: "none",
              borderRadius: "10px",
              cursor: g !== null ? "not-allowed" : "pointer",
              color: "#FFF",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: g !== null ? 0.6 : 1
            },
            children: [
              g === "refresh" ? /* @__PURE__ */ e(le, { size: 18, color: "#FFF" }) : /* @__PURE__ */ e(R, { name: "refresh", size: 18, color: "#FFF" }),
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
      ...W ? [{ key: "feedback", label: "フィードバック" }] : []
    ].map(({ key: o, label: $ }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          O(o), o === "test-status" && j(null);
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
      qt,
      {
        env: r,
        colors: a,
        isDarkMode: L,
        onNavigateToNote: se,
        refreshKey: Q
      }
    ) : c === "feedback" && W ? /* @__PURE__ */ e(
      Gt,
      {
        apiBaseUrl: t,
        adminKey: p,
        colors: a,
        isDarkMode: L,
        refreshKey: Q
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
        display: I && l ? "none" : "flex",
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
              value: u,
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
                /* @__PURE__ */ e("option", { value: "rejected", children: "Rejected" })
              ]
            }
          ),
          /* @__PURE__ */ n(
            "select",
            {
              value: h,
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
                value: m,
                onChange: (o) => D(o.target.value),
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
            }, children: /* @__PURE__ */ e(R, { name: "search", size: 18 }) })
          ] })
        ] }),
        P != null && /* @__PURE__ */ e("div", { style: {
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
          P,
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
          q && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(R, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          Z && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: a.errorBg,
            color: a.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: Z.message }),
          !q && ge.length === 0 && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(R, { name: "inbox", size: 40 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "ノートがありません" })
          ] }),
          ge.map((o) => /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: a.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: (l == null ? void 0 : l.id) === o.id ? `2px solid ${a.primary}` : "2px solid transparent",
                boxShadow: (l == null ? void 0 : l.id) === o.id ? `0 4px 12px ${a.primary}30` : `0 1px 3px ${a.border}`,
                transition: "all 0.2s"
              },
              onClick: () => ze(o),
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
                  /* @__PURE__ */ n("span", { style: Ze(o.severity, a), children: [
                    /* @__PURE__ */ e(R, { name: Ue(o.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: o.severity || "none" })
                  ] }),
                  /* @__PURE__ */ n("span", { style: Re(o.status, a), children: [
                    /* @__PURE__ */ e(R, { name: Qe(o.status), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: o.status })
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
                    /* @__PURE__ */ e(R, { name: "image", size: 12 }),
                    o.attachment_count
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: a.text,
                  lineHeight: 1.4
                }, children: Je(o.content) }),
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
                    /* @__PURE__ */ e(R, { name: "link", size: 12 }),
                    o.route || "/"
                  ] }),
                  /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                  /* @__PURE__ */ e("span", { children: Ke(o.created_at) })
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
                  /* @__PURE__ */ e(R, { name: "chat_bubble_outline", size: 14 }),
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
            /* @__PURE__ */ e(R, { name: "description", size: 16 }),
            M.length,
            " 件"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(R, { name: "error", size: 16, color: a.error }),
            M.filter((o) => o.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(R, { name: "build", size: 16, color: a.warning }),
            M.filter((o) => o.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(R, { name: "check_circle", size: 16, color: a.success }),
            M.filter((o) => o.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(R, { name: "undo", size: 16, color: a.error }),
            M.filter((o) => o.status === "rejected").length,
            " Rejected"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e("main", { style: {
        flex: 1,
        overflow: "auto",
        padding: I ? "16px" : "32px",
        background: a.bg,
        display: I && !l ? "none" : "block"
      }, children: l ? /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
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
              /* @__PURE__ */ e(R, { name: "arrow_back", size: 16, color: a.textSecondary }),
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
              /* @__PURE__ */ n("span", { style: Ze(l.severity, a), children: [
                /* @__PURE__ */ e(R, { name: Ue(l.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: l.severity || "none" })
              ] }),
              /* @__PURE__ */ n("span", { style: Re(l.status, a), children: [
                /* @__PURE__ */ e(R, { name: Qe(l.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: l.status })
              ] }),
              l.source === "test" && /* @__PURE__ */ e("span", { style: {
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
            }, children: Je(l.content) })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "severity-select",
                value: l.severity || "",
                onChange: (o) => {
                  const $ = o.target.value;
                  Te(l.id, $ || null);
                },
                disabled: g !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: g !== null ? "not-allowed" : "pointer",
                  opacity: g !== null ? 0.6 : 1
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
            g === `severity-${l.id}` && /* @__PURE__ */ e(le, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "status-select",
                value: l.status,
                onChange: (o) => Se(l.id, o.target.value),
                disabled: g !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: g !== null ? "not-allowed" : "pointer",
                  opacity: g !== null ? 0.6 : 1
                },
                children: [
                  /* @__PURE__ */ e("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ e("option", { value: "fixed", children: "Fixed" }),
                  /* @__PURE__ */ e("option", { value: "resolved", children: "Resolved" }),
                  /* @__PURE__ */ e("option", { value: "rejected", children: "Rejected" })
                ]
              }
            ),
            g === `status-${l.id}` && /* @__PURE__ */ e(le, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => _e(l.id),
                disabled: g !== null,
                style: {
                  padding: "10px 16px",
                  background: a.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: a.error,
                  cursor: g !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: g !== null ? 0.6 : 1
                },
                children: [
                  g === `delete-${l.id}` ? /* @__PURE__ */ e(le, { size: 16, color: a.error }) : /* @__PURE__ */ e(R, { name: "delete", size: 16 }),
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
            fe,
            {
              icon: "link",
              label: "ページURL",
              value: l.route || "/",
              isLink: !0,
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            fe,
            {
              icon: "article",
              label: "ページタイトル",
              value: l.screen_name || "(不明)",
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            fe,
            {
              icon: "schedule",
              label: "作成日時",
              value: Xt(l.created_at),
              colors: a
            }
          ),
          l.test_cases && l.test_cases.length > 0 && /* @__PURE__ */ n("div", { style: {
            gridColumn: "1 / -1",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ e(R, { name: "science", size: 16, color: a.link }),
            l.test_cases.map((o, $) => /* @__PURE__ */ e(
              "span",
              {
                style: {
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: `${a.link}15`,
                  color: a.link,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                },
                title: o.case_key ? `${o.domain} / ${o.capability}
${o.title}` : `#${o.id}`,
                onClick: () => j(o.id),
                children: o.case_key || `#${o.id}`
              },
              $
            ))
          ] })
        ] }),
        /* @__PURE__ */ e(pe, { icon: "notes", title: "内容", colors: a, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: a.text
        }, children: l.content }) }),
        l.attachments && l.attachments.length > 0 && /* @__PURE__ */ e(pe, { icon: "image", title: `添付画像 (${l.attachments.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px"
        }, children: l.attachments.map((o) => /* @__PURE__ */ n("div", { style: {
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
              src: re.getAttachmentUrl(o.filename),
              alt: o.original_name,
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              },
              onClick: () => te(re.getAttachmentUrl(o.filename))
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
                  $.stopPropagation(), we(l.id, o.id);
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
                children: /* @__PURE__ */ e(R, { name: "delete", size: 14, color: "#fff" })
              }
            )
          ] })
        ] }, o.id)) }) }),
        l.steps && /* @__PURE__ */ e(pe, { icon: "format_list_numbered", title: "再現手順", colors: a, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: a.text
        }, children: Ie(l.steps).map((o, $) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${a.borderLight}`
        }, children: o }, $)) }) }),
        l.user_log && /* @__PURE__ */ e(pe, { icon: "sticky_note_2", title: "補足メモ", colors: a, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: L ? "#0D1117" : "#1E293B",
          color: "#E2E8F0",
          borderRadius: "12px",
          overflow: "auto",
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          lineHeight: 1.6,
          margin: 0
        }, children: l.user_log }) }),
        l.environment && /* @__PURE__ */ e(pe, { icon: "devices", title: "環境情報", colors: a, children: /* @__PURE__ */ n("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ e(fe, { icon: "public", label: "URL", value: l.environment.url || "", isLink: !0, colors: a }),
          /* @__PURE__ */ e(fe, { icon: "aspect_ratio", label: "Viewport", value: l.environment.viewport || "", colors: a }),
          /* @__PURE__ */ e(fe, { icon: "computer", label: "User Agent", value: l.environment.userAgent || "", colors: a }),
          /* @__PURE__ */ e(fe, { icon: "schedule", label: "記録日時", value: l.environment.timestamp || "", colors: a })
        ] }) }),
        l.console_log && l.console_log.length > 0 && /* @__PURE__ */ e(pe, { icon: "terminal", title: `コンソールログ (${l.console_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: L ? "#0D1117" : "#1E293B"
        }, children: l.console_log.map((o, $) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${L ? "#21262D" : "#2D3748"}`,
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
        /* @__PURE__ */ n(pe, { icon: "history", title: `アクティビティ (${(l.activities || []).length}件)`, colors: a, children: [
          (l.activities || []).length > 0 ? /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: l.activities.map((o) => /* @__PURE__ */ n("div", { style: {
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
                  ...Re(o.old_status, a),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: o.old_status }),
                /* @__PURE__ */ e("span", { style: { margin: "0 6px", color: a.textMuted }, children: " → " }),
                /* @__PURE__ */ e("span", { style: {
                  ...Re(o.new_status, a),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: o.new_status })
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
                /* @__PURE__ */ e("span", { children: Ke(o.created_at) })
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
                value: G,
                onChange: (o) => _(o.target.value),
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
                onClick: Ce,
                disabled: C || G.trim() === "",
                style: {
                  padding: "10px 16px",
                  background: C || G.trim() === "" ? a.bgTertiary : a.primary,
                  border: "none",
                  borderRadius: "10px",
                  color: C || G.trim() === "" ? a.textMuted : "#FFF",
                  cursor: C || G.trim() === "" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                },
                children: [
                  C ? /* @__PURE__ */ e(le, { size: 14, color: a.textMuted }) : /* @__PURE__ */ e(R, { name: "send", size: 16 }),
                  "送信"
                ]
              }
            )
          ] })
        ] }),
        l.network_log && l.network_log.length > 0 && /* @__PURE__ */ e(pe, { icon: "wifi", title: `ネットワークログ (${l.network_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: L ? "#0D1117" : "#1E293B"
        }, children: l.network_log.map((o, $) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${L ? "#21262D" : "#2D3748"}`,
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
        /* @__PURE__ */ e(R, { name: "arrow_back", size: 64 }),
        /* @__PURE__ */ e("div", { style: { fontSize: "18px", fontWeight: 500, marginTop: "16px" }, children: "ノートを選択してください" }),
        /* @__PURE__ */ e("div", { style: { fontSize: "14px", marginTop: "8px" }, children: "左のリストからノートを選択すると詳細が表示されます" })
      ] }) })
    ] }),
    A && /* @__PURE__ */ e(
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
        onClick: () => v(null),
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
                /* @__PURE__ */ e(R, { name: "edit_note", size: 20 }),
                "ステータスを「",
                A.status,
                "」に変更"
              ] }),
              /* @__PURE__ */ e(
                "textarea",
                {
                  value: F,
                  onChange: (o) => f(o.target.value),
                  placeholder: A.status === "fixed" ? "コメント（必須）: 何を修正したか記入してください" : A.status === "rejected" ? "コメント（必須）: 却下理由を記入してください" : "コメント（任意）",
                  style: {
                    width: "100%",
                    padding: "12px 14px",
                    border: `1px solid ${F.trim() === "" && (A.status === "fixed" || A.status === "rejected") ? a.error : a.border}`,
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
              (A.status === "fixed" || A.status === "rejected") && F.trim() === "" && /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: a.error, marginTop: "6px" }, children: A.status === "fixed" ? "fixed に変更するにはコメントが必須です" : "却下理由の入力が必須です" }),
              /* @__PURE__ */ n("div", { style: {
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px"
              }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => v(null),
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
                    onClick: $e,
                    disabled: g !== null || (A.status === "fixed" || A.status === "rejected") && F.trim() === "",
                    style: {
                      padding: "10px 20px",
                      background: (A.status === "fixed" || A.status === "rejected") && F.trim() === "" ? a.bgTertiary : a.primary,
                      border: "none",
                      borderRadius: "10px",
                      color: (A.status === "fixed" || A.status === "rejected") && F.trim() === "" ? a.textMuted : "#FFF",
                      cursor: (A.status === "fixed" || A.status === "rejected") && F.trim() === "" ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    },
                    children: [
                      g ? /* @__PURE__ */ e(le, { size: 14, color: "#FFF" }) : /* @__PURE__ */ e(R, { name: "check", size: 16 }),
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
    ie && /* @__PURE__ */ n(
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
        onClick: () => te(null),
        children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: ie,
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
              onClick: () => te(null),
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
              children: /* @__PURE__ */ e(R, { name: "close", size: 24, color: "#fff" })
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
function fe({ icon: i, label: r, value: t, isLink: p, colors: u }) {
  return /* @__PURE__ */ n("div", { style: {
    padding: "16px",
    background: u.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "12px",
      color: u.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(R, { name: i, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: p ? u.link : u.text,
      fontFamily: p ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: t })
  ] });
}
function pe({ icon: i, title: r, children: t, colors: p }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ n("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: p.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(R, { name: i, size: 18 }),
      r
    ] }),
    t
  ] });
}
function Je(i, r = 60) {
  const t = i.split(`
`)[0];
  return t.length > r ? t.slice(0, r) + "..." : t;
}
function Ke(i) {
  const r = new Date(i), t = r.getMonth() + 1, p = r.getDate(), u = r.getHours().toString().padStart(2, "0"), z = r.getMinutes().toString().padStart(2, "0");
  return `${t}/${p} ${u}:${z}`;
}
function Xt(i) {
  return new Date(i).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Qe(i) {
  switch (i) {
    case "open":
      return "error";
    case "fixed":
      return "build";
    case "resolved":
      return "check_circle";
    case "rejected":
      return "undo";
  }
}
function Ue(i) {
  switch (i) {
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
function Ze(i, r) {
  const t = i ? r[i] : r.textMuted;
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: `${t}15`,
    color: t,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function Re(i, r) {
  let t, p;
  switch (i) {
    case "open":
      t = r.primaryLight, p = r.primary;
      break;
    case "fixed":
      t = r.warningBg, p = r.warning;
      break;
    case "resolved":
      t = r.successBg, p = r.success;
      break;
    case "rejected":
      t = r.errorBg, p = r.error;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: t,
    color: p,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function Yt(i) {
  return {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSize: "14px",
    color: i.text,
    background: i.bg
  };
}
function en(i) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${i.border}`,
    background: i.bg
  };
}
function gn({
  apiBaseUrl: i,
  env: r = "dev",
  testCases: t,
  manualItems: p,
  manualDefaultPath: u,
  onManualNavigate: z,
  onManualAppNavigate: h,
  environmentsMd: x,
  onSave: m,
  initialSize: D,
  logCaptureConfig: l,
  disableLogCapture: k,
  adminRoutePath: L = "/__admin",
  triggerOffset: b
}) {
  const { isDebugMode: I } = lt();
  ne(() => {
    i && We(i);
  }, [i]);
  const E = ve(() => k || !i ? null : bt(
    l ?? { console: !0, network: ["/api/**"] }
  ), [i, k]), [y, T] = w(() => typeof window > "u" ? !1 : window.location.pathname === L);
  return ne(() => {
    if (typeof window > "u") return;
    const S = () => T(window.location.pathname === L);
    S(), window.addEventListener("popstate", S), window.addEventListener("hashchange", S);
    const c = window.history.pushState, O = window.history.replaceState;
    return window.history.pushState = function(...W) {
      const P = c.apply(this, W);
      return S(), P;
    }, window.history.replaceState = function(...W) {
      const P = O.apply(this, W);
      return S(), P;
    }, () => {
      window.removeEventListener("popstate", S), window.removeEventListener("hashchange", S), window.history.pushState = c, window.history.replaceState = O;
    };
  }, [L]), !i || !(I || y) ? null : /* @__PURE__ */ e(
    Et,
    {
      apiBaseUrl: i,
      env: r,
      testCases: t,
      logCapture: E ?? void 0,
      manualItems: p,
      manualDefaultPath: u,
      onManualNavigate: z,
      onManualAppNavigate: h,
      environmentsMd: x,
      onSave: m,
      initialSize: D,
      triggerOffset: b
    }
  );
}
export {
  un as D,
  Et as a,
  gn as b,
  kt as p
};
