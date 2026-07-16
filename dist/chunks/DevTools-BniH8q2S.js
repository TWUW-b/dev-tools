import { jsxs as n, jsx as e, Fragment as me } from "react/jsx-runtime";
import { useState as k, useMemo as ye, useCallback as Z, forwardRef as pt, useRef as ue, useEffect as ne, useImperativeHandle as ut, createContext as gt, useContext as et } from "react";
import { a as tt, u as xt } from "./useDebugMode-IjhrC_NU.js";
import { c as ae, b as We, f as ht, h as ft, i as bt, j as mt } from "./feedbackApi-D4n_7_zn.js";
import { d as yt, a as vt } from "./useFeedbackAdminMode-vEJc7eMn.js";
import { createPortal as wt } from "react-dom";
import { m as kt } from "./feedbackLogCapture-DUBfVREg.js";
import { I as nt, D as s, h as Be, b as St } from "./FeedbackAdmin-Psn6na1H.js";
import { c as $t } from "./logCapture-Bkuy8MSd.js";
function zt(i) {
  return i.split(`
`).map((r) => r.trim()).filter((r) => r.startsWith("- ")).map((r) => r.slice(2).trim()).filter(Boolean);
}
function Ct({ notes: i, updateStatus: r }) {
  const [t, p] = k(null), [g, I] = k(/* @__PURE__ */ new Set(["fixed"])), [h, x] = k({}), [y, D] = k(/* @__PURE__ */ new Set()), l = ye(() => g.size === 0 ? i : i.filter((b) => g.has(b.status)), [i, g]), S = Z(async (b, z) => {
    p(`status-${b}`);
    try {
      await r(b, z), (z === "resolved" || z === "closed") && x((N) => {
        const v = { ...N };
        return delete v[b], v;
      });
    } finally {
      p(null);
    }
  }, [r]), W = Z((b, z) => {
    x((N) => {
      const v = N[b] ?? /* @__PURE__ */ new Set(), B = new Set(v);
      return B.has(z) ? B.delete(z) : B.add(z), { ...N, [b]: B };
    });
  }, []);
  return /* @__PURE__ */ n("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ n("div", { className: "debug-status-filter", children: [
      ["open", "fixed", "resolved", "closed", "rejected"].map((b) => /* @__PURE__ */ e(
        "button",
        {
          "data-testid": `status-chip-${b}`,
          className: `debug-status-chip ${g.has(b) ? "active" : ""}`,
          onClick: () => {
            I((z) => {
              const N = new Set(z);
              return N.has(b) ? N.delete(b) : N.add(b), N;
            });
          },
          children: b === "closed" ? "クローズ" : b
        },
        b
      )),
      /* @__PURE__ */ n("span", { className: "debug-filter-count", children: [
        l.length,
        "件"
      ] })
    ] }) }),
    l.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "該当するノートはありません" }) : l.map((b) => {
      const z = zt(b.latest_comment || ""), N = h[b.id] ?? /* @__PURE__ */ new Set(), v = z.length > 0 && N.size === z.length, B = z.length > 0;
      return /* @__PURE__ */ n("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ n(
          "div",
          {
            className: "debug-checklist-header",
            style: { cursor: "pointer" },
            onClick: () => D((u) => {
              const $ = new Set(u);
              return $.has(b.id) ? $.delete(b.id) : $.add(b.id), $;
            }),
            children: [
              /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: y.has(b.id) ? "▼" : "▶" }),
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
                  onChange: (u) => S(b.id, u.target.value),
                  disabled: t !== null,
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
        y.has(b.id) && /* @__PURE__ */ e(me, { children: B && /* @__PURE__ */ n("div", { className: "debug-checklist-items", children: [
          z.map((u, $) => /* @__PURE__ */ n("label", { className: "debug-checklist-item", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: N.has($),
                onChange: () => W(b.id, $)
              }
            ),
            /* @__PURE__ */ e("span", { className: N.has($) ? "debug-checklist-done" : "", children: u })
          ] }, $)),
          /* @__PURE__ */ n("div", { className: "debug-checklist-actions", children: [
            /* @__PURE__ */ n("span", { className: "debug-checklist-progress", children: [
              N.size,
              "/",
              z.length
            ] }),
            b.status === "fixed" && /* @__PURE__ */ e(
              "button",
              {
                className: "debug-btn debug-btn-resolve",
                disabled: !v || t !== null,
                onClick: () => S(b.id, "resolved"),
                children: t === `status-${b.id}` ? "更新中..." : "resolved"
              }
            )
          ] })
        ] }) })
      ] }, b.id);
    })
  ] });
}
const It = pt(function({ testCases: r, env: t, logCapture: p, onNotesRefresh: g, onRunningCasesChange: I }, h) {
  const [x, y] = k([]), [D, l] = k(/* @__PURE__ */ new Set()), [S, W] = k(/* @__PURE__ */ new Set()), [b, z] = k({}), [N, v] = k({}), [B, u] = k(null), [$, c] = k(null), P = ue("");
  ne(() => {
    if (!r || r.length === 0) return;
    const w = JSON.stringify(r);
    if (w === P.current) return;
    let F = !1;
    return (async () => {
      try {
        await ae.importTestCases(r);
      } catch (f) {
        console.warn("Failed to import test cases:", f);
      }
      if (!F)
        try {
          const f = await ae.getTestTree(t);
          if (F) return;
          y(f), P.current = w;
          const J = {};
          for (const _ of f)
            for (const C of _.capabilities)
              for (const R of C.cases)
                R.last === "pass" && (J[R.caseId] = !0);
          z(J);
        } catch (f) {
          console.warn("Failed to fetch test tree:", f);
        }
    })(), () => {
      F = !0;
    };
  }, [r, t]);
  const L = Z(async () => {
    try {
      const w = await ae.getTestTree(t);
      y(w);
      const F = {};
      for (const f of w)
        for (const J of f.capabilities)
          for (const _ of J.cases)
            F[_.caseId] = _.last === "pass";
      z(F);
    } catch {
      c({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [t]);
  ut(h, () => ({ refresh: L }), [L]), ne(() => {
    if (!I) return;
    const w = [];
    for (const F of x)
      for (const f of F.capabilities) {
        const J = `${F.domain}/${f.capability}`;
        if (S.has(J))
          for (const _ of f.cases) w.push(_.caseId);
      }
    I(w);
  }, [S, x, I]);
  const H = Z(async (w, F, f) => {
    const J = `${w}/${F}`;
    u(J), c(null);
    try {
      const _ = [], C = N[J], R = C != null && C.content.trim() && C.caseIds.length > 0 ? C.caseIds : [], a = new Set(R);
      for (const G of f)
        b[G.caseId] && !a.has(G.caseId) && _.push({ caseId: G.caseId, result: "pass" });
      for (const G of R)
        _.push({ caseId: G, result: "fail" });
      if (_.length === 0) {
        c({ type: "error", text: "チェックまたはバグ報告が必要です" }), u(null);
        return;
      }
      const M = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, V = R.length > 0 ? {
        content: C.content.trim(),
        severity: C.severity || void 0,
        consoleLogs: p == null ? void 0 : p.getConsoleLogs(),
        networkLogs: p == null ? void 0 : p.getNetworkLogs(),
        environment: M
      } : void 0, Y = await ae.submitTestRuns(t, _, V);
      if (C != null && C.files && C.files.length > 0 && Y.results) {
        const X = Y.results.filter((d) => d.noteId != null).map((d) => d.noteId)[0];
        if (X)
          for (const d of C.files)
            try {
              await ae.uploadAttachment(t, X, d);
            } catch (E) {
              console.warn("Failed to upload attachment:", E);
            }
      }
      if (Y.capability) {
        y((X) => X.map((d) => d.domain !== w ? d : {
          ...d,
          capabilities: d.capabilities.map(
            (E) => E.capability === F ? Y.capability : E
          )
        }));
        const G = { ...b };
        for (const X of Y.capability.cases)
          G[X.caseId] = X.last === "pass";
        z(G);
      }
      g(), v((G) => {
        const X = { ...G };
        return delete X[J], X;
      }), c({ type: "success", text: "送信しました" });
    } catch (_) {
      c({ type: "error", text: _ instanceof Error ? _.message : "送信に失敗しました" });
    } finally {
      u(null);
    }
  }, [b, N, t, p, g]), j = Z((w) => {
    l((F) => {
      const f = new Set(F);
      return f.has(w) ? f.delete(w) : f.add(w), f;
    });
  }, []), K = Z((w) => {
    W((F) => {
      const f = new Set(F);
      return f.has(w) ? f.delete(w) : f.add(w), f;
    });
  }, []), Q = (w) => w.last === "pass" ? "passed" : w.last === "fail" && w.openIssues === 0 ? "retest" : w.last === "fail" ? "fail" : "-", ie = (w) => w.last === "pass" ? s.success : w.last === "fail" && w.openIssues === 0 ? "#F59E0B" : w.last === "fail" ? s.error : s.gray500, te = (w) => w.status === "passed" ? "passed" : w.status === "retest" ? "retest" : w.status === "fail" ? "fail" : "", A = (w) => w.status === "passed" ? s.success : w.status === "retest" ? "#F59E0B" : w.status === "fail" ? s.error : s.gray500;
  return /* @__PURE__ */ n(me, { children: [
    $ && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${$.type}`, children: $.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: x.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : x.map((w) => /* @__PURE__ */ n("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ n(
        "button",
        {
          "data-testid": `domain-toggle-${w.domain}`,
          className: "debug-tree-toggle",
          onClick: () => j(w.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: D.has(w.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: w.domain })
          ]
        }
      ),
      D.has(w.domain) && w.capabilities.map((F) => {
        const f = `${w.domain}/${F.capability}`, J = S.has(f), _ = N[f];
        return /* @__PURE__ */ n("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ n(
            "button",
            {
              "data-testid": `cap-toggle-${f}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => K(f),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: J ? "expand_more" : "chevron_right" }),
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
          J && /* @__PURE__ */ n("div", { className: "debug-tree-cases", children: [
            F.cases.map((C) => /* @__PURE__ */ n("label", { "data-testid": `case-${C.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!b[C.caseId],
                  onChange: (R) => {
                    z((a) => ({
                      ...a,
                      [C.caseId]: R.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: C.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: ie(C) }, children: Q(C) }),
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
                  const R = (_ == null ? void 0 : _.caseIds.includes(C.caseId)) ?? !1;
                  return /* @__PURE__ */ n("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: R,
                        onChange: (a) => {
                          v((M) => {
                            const V = M[f] || { caseIds: [], content: "", severity: "", files: [] }, Y = a.target.checked ? [...V.caseIds, C.caseId] : V.caseIds.filter((G) => G !== C.caseId);
                            return { ...M, [f]: { ...V, caseIds: Y } };
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
                      v((R) => {
                        var a, M, V;
                        return {
                          ...R,
                          [f]: {
                            ...R[f],
                            caseIds: ((a = R[f]) == null ? void 0 : a.caseIds) || [],
                            content: C.target.value,
                            severity: ((M = R[f]) == null ? void 0 : M.severity) || "",
                            files: ((V = R[f]) == null ? void 0 : V.files) || []
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
                      v((R) => {
                        var a, M, V;
                        return {
                          ...R,
                          [f]: {
                            ...R[f],
                            caseIds: ((a = R[f]) == null ? void 0 : a.caseIds) || [],
                            content: ((M = R[f]) == null ? void 0 : M.content) || "",
                            severity: C.target.value,
                            files: ((V = R[f]) == null ? void 0 : V.files) || []
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
                nt,
                {
                  files: (_ == null ? void 0 : _.files) || [],
                  onAdd: (C) => {
                    v((R) => {
                      var a, M, V, Y;
                      return {
                        ...R,
                        [f]: {
                          ...R[f],
                          caseIds: ((a = R[f]) == null ? void 0 : a.caseIds) || [],
                          content: ((M = R[f]) == null ? void 0 : M.content) || "",
                          severity: ((V = R[f]) == null ? void 0 : V.severity) || "",
                          files: [...((Y = R[f]) == null ? void 0 : Y.files) || [], ...C]
                        }
                      };
                    });
                  },
                  onRemove: (C) => {
                    v((R) => {
                      var a, M, V, Y;
                      return {
                        ...R,
                        [f]: {
                          ...R[f],
                          caseIds: ((a = R[f]) == null ? void 0 : a.caseIds) || [],
                          content: ((M = R[f]) == null ? void 0 : M.content) || "",
                          severity: ((V = R[f]) == null ? void 0 : V.severity) || "",
                          files: (((Y = R[f]) == null ? void 0 : Y.files) || []).filter((G, X) => X !== C)
                        }
                      };
                    });
                  },
                  disabled: B !== null
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
                  onClick: () => H(w.domain, F.capability, F.cases),
                  disabled: B !== null || a === 0,
                  children: B === f ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
    ] }, w.domain)) })
  ] });
});
function Ft({
  items: i,
  defaultPath: r,
  onNavigate: t,
  onAppNavigate: p
}) {
  var l;
  const [g, I] = k(r || ((l = i[0]) == null ? void 0 : l.path) || ""), { content: h, loading: x, error: y } = yt(g), D = (S) => {
    I(S), t == null || t(S);
  };
  return /* @__PURE__ */ n("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: i.map((S) => /* @__PURE__ */ e(
      "button",
      {
        className: `debug-manual-item ${g === S.path ? "active" : ""}`,
        onClick: () => D(S.path),
        title: S.title,
        children: S.title
      },
      S.id
    )) }),
    /* @__PURE__ */ n("div", { className: "debug-manual-content", children: [
      x && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      y && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: y.message }),
      h && /* @__PURE__ */ e(
        Be,
        {
          content: h,
          onLinkClick: (S) => {
            I(S), t == null || t(S);
          },
          onAppLinkClick: p
        }
      )
    ] })
  ] });
}
function Tt(i) {
  const { meta: r, body: t } = Rt(i), p = t.split(`
`), g = {
    title: r.title,
    warning: r.warning,
    projects: []
  };
  let I = [], h = null, x = null, y = null, D = !1, l = [], S = [], W = [];
  const b = () => {
    if (W.length === 0) return;
    const u = Bt(W);
    W = [], u && (y ? y.table = u : S.push(..._t(u)));
  }, z = () => {
    if (b(), y && S.length > 0) {
      const u = S.join(`
`).trim();
      u && (y.extraMd = (y.extraMd ? y.extraMd + `
` : "") + u);
    }
    S = [];
  }, N = () => {
    if (z(), h && y)
      if (D) {
        const u = [
          y.entries.map(($) => `- ${$.key}: ${$.value}`).join(`
`),
          y.extraMd ?? ""
        ].filter(Boolean).join(`

`);
        u.trim() && l.push(`## ${y.label}

${u}`);
      } else if (x) {
        let u = h.envs.find(($) => $.env === x);
        u || (u = { env: x, sections: [] }, h.envs.push(u)), u.sections.push(y);
      } else
        h.common.push(y);
    y = null, x = null, D = !1;
  }, v = () => {
    N(), h && (l.length > 0 && (h.notes = l.join(`

`).trim()), l = [], g.projects.push(h)), h = null;
  };
  for (let u = 0; u < p.length; u++) {
    const $ = p[u], c = $.trim();
    if (/^\|.*\|$/.test(c)) {
      W.push(c);
      continue;
    } else W.length > 0 && b();
    if (/^---+$/.test(c)) continue;
    const P = /^#\s+(.+)$/.exec($);
    if (P) {
      v();
      const j = P[1].trim();
      j === "共通" || /^(common|shared)$/i.test(j) ? h = { name: "共通", envs: [], common: [] } : h = { name: j, envs: [], common: [] };
      continue;
    }
    const L = /^##\s+(.+)$/.exec($);
    if (L) {
      N(), h || (h = { name: "共通", envs: [], common: [] });
      const j = L[1].trim();
      if (/前提|注意|注記|note|備考/i.test(j)) {
        y = { label: j, entries: [] }, D = !0;
        continue;
      }
      const K = /^(.+?)\s*\/\s*(.+)$/.exec(j);
      if (K)
        x = Pe(K[1].trim()), y = { label: K[2].trim(), entries: [] };
      else {
        const Q = Pe(j.replace(/環境$/, "").trim());
        Q && /^(dev|staging|stg|prod|production|local|test)$/i.test(Q) ? (x = Q, y = { label: "アカウント", entries: [] }) : (x = null, y = { label: j, entries: [] });
      }
      continue;
    }
    if (h && !y) {
      const j = /^phase\s*:\s*(.+)$/i.exec(c);
      if (j) {
        h.phase = j[1].trim();
        continue;
      }
    }
    const H = /^\s*-\s+([^:]+?):\s*(.+)$/.exec($);
    if (H && y && !D) {
      const j = H[1].trim(), K = H[2].trim().replace(/^`|`$/g, "");
      y.entries.push({
        key: j,
        value: K,
        kind: Nt(j, K)
      });
      continue;
    }
    c === "" && S.length === 0 || (y ? S.push($) : h || I.push($));
  }
  v();
  const B = I.join(`
`).trim();
  return B && (g.preamble = B), g;
}
function Rt(i) {
  const r = /^---\n([\s\S]*?)\n---\n?/.exec(i);
  if (!r) return { meta: {}, body: i };
  const t = {};
  for (const p of r[1].split(`
`)) {
    const g = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(p);
    if (!g) continue;
    const I = g[1].toLowerCase(), h = g[2].trim().replace(/^["']|["']$/g, "");
    I === "title" ? t.title = h : I === "warning" && (t.warning = h);
  }
  return { meta: t, body: i.slice(r[0].length) };
}
function Bt(i) {
  if (i.length < 2) return null;
  const r = (g) => g.replace(/^\|/, "").replace(/\|$/, "").split("|").map((I) => I.trim()), t = r(i[0]);
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(i[1]))
    return { headers: t, rows: i.slice(1).map(r) };
  const p = i.slice(2).map(r);
  return { headers: t, rows: p };
}
function _t(i) {
  const r = ["| " + i.headers.join(" | ") + " |"];
  r.push("| " + i.headers.map(() => "---").join(" | ") + " |");
  for (const t of i.rows) r.push("| " + t.join(" | ") + " |");
  return r;
}
function Pe(i) {
  const r = i.toLowerCase();
  return /^(staging|stg)$/.test(r) ? "staging" : /^(prod|production|本番)$/.test(r) ? "prod" : /^(dev|development|開発)$/.test(r) ? "dev" : /^(local|ローカル)$/.test(r) ? "local" : /^(test|テスト)$/.test(r) ? "test" : i;
}
function Nt(i, r) {
  const t = i.toLowerCase();
  return /pass|pwd|password|パスワード/.test(t) ? "password" : /url|link|endpoint/.test(t) || /^https?:\/\//.test(r) ? "url" : /mail|email|メール/.test(t) || /^[^\s@]+@[^\s@]+$/.test(r) ? "email" : /user|id|name|account|ユーザー/.test(t) ? "user" : "text";
}
async function it(i, r = typeof document < "u" ? document : null) {
  var g, I, h;
  const t = (g = r == null ? void 0 : r.defaultView) == null ? void 0 : g.navigator;
  if ((I = t == null ? void 0 : t.clipboard) != null && I.writeText)
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
    const y = p.execCommand("copy");
    return x.remove(), y;
  } catch {
    return !1;
  }
}
const Me = gt(null);
function Et({ md: i, pipDocument: r = null }) {
  const t = ye(() => Tt(i), [i]), [p, g] = k(
    () => new Set(t.projects.map((h) => h.name))
  ), I = Z((h) => {
    g((x) => {
      const y = new Set(x);
      return y.has(h) ? y.delete(h) : y.add(h), y;
    });
  }, []);
  return /* @__PURE__ */ e(Me.Provider, { value: r, children: /* @__PURE__ */ n("div", { className: "debug-env-tab", children: [
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
      Lt,
      {
        project: h,
        isExpanded: p.has(h.name),
        onToggle: () => I(h.name)
      },
      h.name
    ))
  ] }) });
}
function Lt({
  project: i,
  isExpanded: r,
  onToggle: t
}) {
  var h;
  const p = i.envs.map((x) => x.env), [g, I] = k(p[0] ?? null);
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
          i.common.map((x, y) => /* @__PURE__ */ e(He, { section: x }, `common-${y}`)),
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
                    onClick: () => I(x.env),
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
            (h = i.envs.find((x) => x.env === g)) == null ? void 0 : h.sections.map((x, y) => /* @__PURE__ */ e(He, { section: x }, `${g}-${y}`))
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
function He({ section: i }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "10px" }, children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, color: s.gray700, marginBottom: "4px" }, children: i.label }),
    i.entries.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: i.entries.map((r, t) => /* @__PURE__ */ e(Wt, { entry: r }, t)) }),
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
      /* @__PURE__ */ e("tbody", { children: i.table.rows.map((r, t) => /* @__PURE__ */ e("tr", { children: r.map((p, g) => /* @__PURE__ */ e(
        Mt,
        {
          value: p,
          header: i.table.headers[g] ?? ""
        },
        g
      )) }, t)) })
    ] }) }),
    i.extraMd && /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Be, { content: i.extraMd }) })
  ] });
}
function Wt({ entry: i }) {
  const r = et(Me), [t, p] = k(!1), [g, I] = k(!1), h = async () => {
    await it(i.value, r) && (I(!0), setTimeout(() => I(!1), 1200));
  }, x = i.kind === "password", y = x && !t ? "•".repeat(Math.min(i.value.length, 10)) : i.value, D = i.kind === "url" ? "link" : i.kind === "email" ? "mail" : i.kind === "password" ? "key" : i.kind === "user" ? "person" : "label";
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
            children: y
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
            title: g ? "コピーしました" : "コピー",
            style: { ...be, color: g ? s.success : be.color },
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: g ? "check" : "content_copy" })
          }
        )
      ]
    }
  );
}
function Mt({ value: i, header: r }) {
  const t = et(Me), p = /pass|pwd|パスワード/i.test(r), g = /^https?:\/\//.test(i), I = /^[^\s@]+@[^\s@]+$/.test(i), [h, x] = k(!1), [y, D] = k(!1), l = async () => {
    await it(i, t) && (D(!0), setTimeout(() => D(!1), 1200));
  }, S = p && !h ? "•".repeat(Math.min(i.length, 10)) : i;
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
        g ? /* @__PURE__ */ e("a", { href: i, target: "_blank", rel: "noopener noreferrer", style: { color: s.primary, flex: 1 }, children: i }) : I ? /* @__PURE__ */ e("span", { style: { flex: 1 }, children: i }) : /* @__PURE__ */ e("span", { style: { flex: 1 }, children: S }),
        p && /* @__PURE__ */ e("button", { type: "button", onClick: () => x((W) => !W), style: be, title: h ? "隠す" : "表示", children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: h ? "visibility_off" : "visibility" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: l,
            style: { ...be, color: y ? s.success : be.color },
            title: y ? "コピーしました" : "コピー",
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: y ? "check" : "content_copy" })
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
function rt(i) {
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
rt();
const qe = {
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
}, Dt = `
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
function at() {
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
function At() {
  return `${Dt}${at()}`;
}
function jt({
  apiBaseUrl: i,
  env: r = "dev",
  onSave: t,
  onClose: p,
  initialSize: g = { width: 400, height: 500 },
  testCases: I,
  logCapture: h,
  manualItems: x,
  manualDefaultPath: y,
  onManualNavigate: D,
  onManualAppNavigate: l,
  environmentsMd: S,
  triggerOffset: W
}) {
  var Ae, je;
  const [b, z] = k(null), [N, v] = k(null), [B, u] = k(!1), $ = ue(!1), [c, P] = k("record"), L = I && I.length > 0, H = x && x.length > 0, j = !!S && S.trim().length > 0, [K, Q] = k(""), [ie, te] = k(""), [A, w] = k(""), [F, f] = k(!1), [J, _] = k(!1), [C, R] = k(!1), [a, M] = k(!1), [V, Y] = k(!1), [G, X] = k([]), [d, E] = k(null), [ee, se] = k([]), [ge, $e] = k(!1), ze = ue(null);
  ne(() => {
    i && We(i);
  }, [i]);
  const { notes: _e, createNote: Ce, updateStatus: Ne, refresh: ve, error: Ie } = tt(r), Fe = ue(Ie);
  Fe.current = Ie;
  const o = Z(async () => {
    var de;
    const q = typeof window < "u" && ((de = window.matchMedia) == null ? void 0 : de.call(window, "(max-width: 768px)").matches);
    if (!window.documentPictureInPicture || q) {
      window.documentPictureInPicture || console.warn("Document Picture-in-Picture API is not supported"), u(!0);
      return;
    }
    if (!$.current) {
      $.current = !0;
      try {
        const re = await window.documentPictureInPicture.requestWindow({
          width: g.width,
          height: g.height
        }), ce = re.document.createElement("link");
        ce.rel = "stylesheet", ce.href = St, re.document.head.appendChild(ce);
        const we = re.document.createElement("style");
        we.textContent = At(), re.document.head.appendChild(we);
        const U = re.document.createElement("div");
        U.id = "debug-panel-root", re.document.body.appendChild(U), z(re), v(U), u(!0), re.addEventListener("pagehide", () => {
          z(null), v(null), u(!1), p == null || p();
        });
      } catch (re) {
        console.error("Failed to open PiP window:", re), u(!0);
      } finally {
        $.current = !1;
      }
    }
  }, [g.width, g.height, p]), m = Z(() => {
    b ? b.close() : (u(!1), p == null || p());
  }, [b, p]), O = ue(b);
  O.current = b, ne(() => () => {
    var q;
    (q = O.current) == null || q.close();
  }, []), ne(() => {
    if (typeof document > "u" || document.getElementById("twuw-debug-panel-styles")) return;
    const q = document.createElement("style");
    q.id = "twuw-debug-panel-styles", q.textContent = at(), document.head.appendChild(q);
  }, []);
  const oe = Z(() => {
    Q(""), te(""), w(""), X([]), _(!1), R(!1), M(!1), Y(!1), E(null);
  }, []), Ee = Z(async () => {
    var we;
    if (!K.trim()) {
      E({ type: "error", text: "内容は必須です" });
      return;
    }
    f(!0), E(null);
    const de = ((h == null ? void 0 : h.getNetworkLogs()) ?? []).map((U) => {
      const xe = {
        timestamp: U.timestamp,
        method: U.method,
        url: U.url,
        status: U.status
      }, Oe = ["POST", "PUT", "DELETE", "PATCH"].includes(U.method);
      return Oe && (U.requestBody !== void 0 && (xe.requestBody = U.requestBody), U.responseBody !== void 0 && (xe.responseBody = U.responseBody)), !Oe && C && U.responseBody !== void 0 && (xe.responseBody = U.responseBody), a && U.duration != null && (xe.duration = U.duration), V && (U.requestHeaders && (xe.requestHeaders = U.requestHeaders), U.responseHeaders && (xe.responseHeaders = U.responseHeaders)), xe;
    }), re = {
      content: K.trim(),
      userLog: ie ? kt(ie) : void 0,
      severity: A || void 0,
      testCaseIds: ee.length > 0 ? ee : void 0,
      consoleLogs: h == null ? void 0 : h.getConsoleLogs(),
      networkLogs: de.length > 0 ? de : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, ce = await Ce(re);
    if (ce) {
      if (G.length > 0)
        try {
          for (const U of G)
            await ae.uploadAttachment(r, ce.id, U);
        } catch (U) {
          console.warn("Failed to upload some attachments:", U), E({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), f(!1);
          return;
        }
      E({ type: "success", text: "保存しました" }), t == null || t(ce), setTimeout(() => {
        oe();
      }, 1500);
    } else
      E({ type: "error", text: ((we = Fe.current) == null ? void 0 : we.message) || "保存に失敗しました" });
    f(!1);
  }, [K, ie, A, ee, G, C, a, V, Ce, t, oe, h, r]), ct = Z(async () => {
    var q;
    $e(!0);
    try {
      c === "manage" ? ve() : c === "test" && await ((q = ze.current) == null ? void 0 : q.refresh());
    } finally {
      $e(!1);
    }
  }, [c, ve]), De = /* @__PURE__ */ n("div", { className: "debug-panel", children: [
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
            onClick: ct,
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
        /* @__PURE__ */ e("button", { onClick: m, className: "debug-close-btn", "aria-label": "閉じる", children: /* @__PURE__ */ e("span", { className: "debug-icon", children: "close" }) })
      ] })
    ] }),
    /* @__PURE__ */ n("nav", { className: "debug-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "record" ? "active" : ""}`,
          onClick: () => {
            P("record"), E(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "manage" ? "active" : ""}`,
          onClick: () => P("manage"),
          children: "管理"
        }
      ),
      L && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "test" ? "active" : ""}`,
          onClick: () => P("test"),
          children: "テスト"
        }
      ),
      H && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "manual" ? "active" : ""}`,
          onClick: () => P("manual"),
          children: "マニュアル"
        }
      ),
      j && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${c === "env" ? "active" : ""}`,
          onClick: () => P("env"),
          children: "環境"
        }
      )
    ] }),
    /* @__PURE__ */ n("main", { className: "debug-content", children: [
      c === "record" && /* @__PURE__ */ n(me, { children: [
        ee.length > 0 && /* @__PURE__ */ n(
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
                ee.map((q) => `#${q}`).join(", ")
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
              onChange: (q) => w(q.target.value),
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
              value: K,
              onChange: (q) => Q(q.target.value),
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
              onChange: (q) => te(q.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          nt,
          {
            files: G,
            onAdd: (q) => X((de) => [...de, ...q]),
            onRemove: (q) => X((de) => de.filter((re, ce) => ce !== q)),
            disabled: F,
            pipDocument: ((Ae = O.current) == null ? void 0 : Ae.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => _(!J),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: J ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        J && /* @__PURE__ */ n("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: C,
                onChange: (q) => R(q.target.checked)
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
                onChange: (q) => M(q.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: V,
                onChange: (q) => Y(q.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      c === "manage" && /* @__PURE__ */ e(Ct, { notes: _e, updateStatus: Ne }),
      c === "manual" && H && /* @__PURE__ */ e(
        Ft,
        {
          items: x,
          defaultPath: y,
          onNavigate: D,
          onAppNavigate: l
        }
      ),
      c === "env" && j && /* @__PURE__ */ e(Et, { md: S, pipDocument: ((je = O.current) == null ? void 0 : je.document) ?? null }),
      c === "test" && L && /* @__PURE__ */ e(
        It,
        {
          ref: ze,
          testCases: I,
          env: r,
          logCapture: h,
          onNotesRefresh: ve,
          onRunningCasesChange: se
        }
      )
    ] }),
    c === "record" && /* @__PURE__ */ n("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: oe, className: "debug-btn debug-btn-secondary", disabled: F, children: "クリア" }),
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
  return N ? wt(De, N) : B ? /* @__PURE__ */ e("div", { style: qe.overlay, children: /* @__PURE__ */ e("div", { style: qe.panel, children: De }) }) : /* @__PURE__ */ e("button", { onClick: o, style: rt(W), "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ n("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
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
function T({ name: i, size: r = 20, color: t }) {
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
const Ot = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, Pt = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function Ht({ domains: i, colors: r, isDarkMode: t }) {
  const p = t ? Pt : Ot;
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
    }, children: i.map((g) => /* @__PURE__ */ e(
      qt,
      {
        domain: g,
        colors: r,
        tc: p
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
function qt({ domain: i, colors: r, tc: t }) {
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
      Vt,
      {
        cap: p,
        colors: r,
        tc: t
      },
      p.capability
    )) })
  ] });
}
function Vt({ cap: i, colors: r, tc: t }) {
  const p = i.status === "fail" ? t.fail : i.status === "retest" ? t.retest : i.status === "passed" ? t.passed : t.untested, g = i.status === "fail" ? t.failBg : i.status === "retest" ? t.retestBg : i.status === "passed" ? t.passedBg : t.untestedBg;
  return /* @__PURE__ */ n("div", { style: {
    borderLeft: `4px solid ${p}`,
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
const Jt = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, Gt = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function Zt({ tree: i, colors: r, isDarkMode: t, onNavigateToNote: p }) {
  const g = t ? Gt : Jt, [I, h] = k(/* @__PURE__ */ new Set()), [x, y] = k(/* @__PURE__ */ new Set());
  ne(() => {
    h((v) => {
      const B = new Set(v);
      return i.forEach((u) => B.add(u.domain)), B;
    });
  }, [i]);
  const [D, l] = k("all"), [S, W] = k(!1), b = (v) => {
    h((B) => {
      const u = new Set(B);
      return u.has(v) ? u.delete(v) : u.add(v), u;
    });
  }, z = (v) => {
    y((B) => {
      const u = new Set(B);
      return u.has(v) ? u.delete(v) : u.add(v), u;
    });
  }, N = ye(() => i.map((v) => {
    const B = v.capabilities.filter((u) => {
      const $ = u.passed === u.total && u.total > 0, c = u.failed > 0 || u.openIssues > 0, P = u.passed < u.total;
      return !(D === "passed" && !$ || D === "fail" && !c || D === "incomplete" && !P || S && $ && u.openIssues === 0);
    });
    return B.length === 0 ? null : { ...v, capabilities: B };
  }).filter((v) => v !== null), [i, D, S]);
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
          onChange: (v) => l(v.target.value),
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
            checked: S,
            onChange: (v) => W(v.target.checked),
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
      N.map((v, B) => {
        const u = I.has(v.domain), $ = v.capabilities.reduce((L, H) => L + H.total, 0), c = v.capabilities.reduce((L, H) => L + H.passed, 0), P = $ > 0 ? Math.round(c / $ * 100) : 0;
        return /* @__PURE__ */ n("div", { children: [
          /* @__PURE__ */ n(
            "div",
            {
              onClick: () => b(v.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: r.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${r.border}`,
                borderTop: B > 0 ? `1px solid ${r.border}` : "none",
                gap: "8px",
                userSelect: "none"
              },
              children: [
                /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: r.textMuted, width: "16px" }, children: u ? "▼" : "▶" }),
                /* @__PURE__ */ e("span", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: r.text,
                  flex: 1
                }, children: v.domain }),
                /* @__PURE__ */ n("span", { style: {
                  fontSize: "13px",
                  color: r.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  c,
                  "/",
                  $,
                  " ",
                  P,
                  "%"
                ] })
              ]
            }
          ),
          u && v.capabilities.map((L) => {
            const H = `${v.domain}/${L.capability}`, j = x.has(H), K = L.passed === L.total && L.total > 0, Q = L.cases.some((f) => f.last === "fail" && f.openIssues > 0), ie = L.cases.some((f) => f.last === "fail" && f.openIssues === 0), te = !Q && ie, A = Q, w = K ? "●" : A ? "▲" : te ? "◆" : "○", F = K ? g.passed : A ? g.fail : te ? g.retest : g.untested;
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => z(H),
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
                    /* @__PURE__ */ e("span", { style: { color: F, fontSize: "14px", width: "16px" }, children: w }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: r.text,
                      flex: 1
                    }, children: L.capability }),
                    /* @__PURE__ */ n("span", { style: {
                      fontSize: "12px",
                      color: r.textMuted,
                      fontVariantNumeric: "tabular-nums"
                    }, children: [
                      L.passed,
                      "/",
                      L.total
                    ] }),
                    K && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: g.passed,
                      fontWeight: 600
                    }, children: "passed" }),
                    A && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: g.fail,
                      fontWeight: 600
                    }, children: "fail" }),
                    te && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: g.retest,
                      fontWeight: 600
                    }, children: "retest" }),
                    L.openIssues > 0 && /* @__PURE__ */ n("span", { style: {
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${g.fail}18`,
                      color: g.fail,
                      fontWeight: 600
                    }, children: [
                      L.openIssues,
                      "件"
                    ] })
                  ]
                }
              ),
              j && L.cases.map((f) => /* @__PURE__ */ e(
                Kt,
                {
                  c: f,
                  tc: g,
                  colors: r,
                  onNavigateToNote: p
                },
                f.caseId
              ))
            ] }, H);
          })
        ] }, v.domain);
      }),
      N.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: r.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function Kt({ c: i, tc: r, colors: t, onNavigateToNote: p }) {
  const g = i.last === "fail" && i.openIssues === 0, I = i.last === "pass" ? "●" : g ? "◆" : i.last === "fail" ? "▲" : "○", h = i.last === "pass" ? r.passed : g ? r.retest : i.last === "fail" ? r.fail : r.untested;
  return /* @__PURE__ */ n("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: t.bg,
    borderBottom: `1px solid ${t.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: h, fontSize: "12px", width: "16px" }, children: I }),
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
const Qt = 3e4;
function Ut({ env: i, colors: r, isDarkMode: t, onNavigateToNote: p, refreshKey: g }) {
  const [I, h] = k([]), [x, y] = k(!0), [D, l] = k(null), S = ue(0);
  ne(() => {
    let b = !1;
    const z = ++S.current, N = async () => {
      try {
        const B = await ae.getTestTree(i);
        !b && S.current === z && (h(B), l(null));
      } catch (B) {
        !b && S.current === z && l(B instanceof Error ? B.message : "Failed to fetch test tree");
      } finally {
        !b && S.current === z && y(!1);
      }
    };
    y(!0), N();
    const v = setInterval(N, Qt);
    return () => {
      b = !0, clearInterval(v);
    };
  }, [i, g]);
  const W = ye(() => I.map((b) => {
    let z = 0, N = 0, v = 0, B = !1;
    const u = b.capabilities.map((c) => {
      const P = c.total - c.passed - c.failed;
      z += c.total, N += c.passed, v += c.failed, (c.failed > 0 || c.openIssues > 0) && (B = !0);
      const L = c.passed === c.total && c.total > 0, H = c.cases.some((Q) => Q.last === "fail" && Q.openIssues > 0), j = c.cases.some((Q) => Q.last === "fail" && Q.openIssues === 0), K = L ? "passed" : H ? "fail" : j ? "retest" : "incomplete";
      return {
        capability: c.capability,
        total: c.total,
        passed: c.passed,
        failed: c.failed,
        untested: P < 0 ? 0 : P,
        openIssues: c.openIssues,
        status: K,
        cases: c.cases
      };
    }), $ = z - N - v;
    return {
      domain: b.domain,
      total: z,
      passed: N,
      failed: v,
      untested: $ < 0 ? 0 : $,
      hasIssues: B,
      capabilities: u
    };
  }), [I]);
  return x && I.length === 0 ? /* @__PURE__ */ n("div", { style: {
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
  ] }) : D && I.length === 0 ? /* @__PURE__ */ e("div", { style: {
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
      Ht,
      {
        domains: W,
        colors: r,
        isDarkMode: t
      }
    ),
    /* @__PURE__ */ e(
      Zt,
      {
        tree: I,
        colors: r,
        isDarkMode: t,
        onNavigateToNote: p
      }
    )
  ] }) });
}
const ot = "Asia/Tokyo";
function st(i) {
  return i ? /[Zz]$/.test(i) || /[+-]\d{2}:?\d{2}$/.test(i) ? new Date(i) : /* @__PURE__ */ new Date(i.replace(" ", "T") + "Z") : /* @__PURE__ */ new Date(NaN);
}
function lt(i) {
  const r = st(i);
  return isNaN(r.getTime()) ? "-" : r.toLocaleString("ja-JP", {
    timeZone: ot,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function dt(i) {
  const r = st(i);
  return isNaN(r.getTime()) ? "-" : r.toLocaleString("ja-JP", {
    timeZone: ot,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: !1
  });
}
const Te = {
  bug: { label: "不具合", icon: "bug_report" },
  question: { label: "質問", icon: "help" },
  request: { label: "要望", icon: "lightbulb" },
  share: { label: "共有", icon: "share" },
  other: { label: "その他", icon: "more_horiz" }
}, Yt = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, Le = {
  app: "アプリ",
  manual: "マニュアル"
}, Ve = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function Je(i) {
  const r = Yt[i] ?? "#6B7280";
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
function Xt({ apiBaseUrl: i, adminKey: r, colors: t, isDarkMode: p, refreshKey: g }) {
  var Y, G, X;
  const {
    feedbacks: I,
    total: h,
    page: x,
    limit: y,
    loading: D,
    error: l,
    filters: S,
    customTags: W,
    setFilters: b,
    setPage: z,
    updateStatus: N,
    remove: v,
    refresh: B
  } = vt({ apiBaseUrl: i, adminKey: r }), [u, $] = k(null), [c, P] = k(null), [L, H] = k(!1), [j, K] = k(null), [Q, ie] = k(null), te = ue(0), A = ue(g);
  ne(() => {
    g !== A.current && (A.current = g, B());
  }, [g, B]);
  const w = Math.max(1, Math.ceil(h / y)), F = Z(async (d) => {
    if (u === d) return;
    $(d), H(!0), P(null);
    const E = ++te.current;
    try {
      const ee = await ht({ apiBaseUrl: i, adminKey: r, id: d });
      if (te.current !== E) return;
      P(ee);
    } catch {
      if (te.current !== E) return;
      P(null);
    }
    te.current === E && H(!1);
  }, [u, i, r]), f = Z(async (d, E) => {
    await N(d, E) && (c == null ? void 0 : c.id) === d && P((se) => se ? { ...se, status: E } : null);
  }, [N, c == null ? void 0 : c.id]), J = Z(async (d) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await v(d) && u === d && ($(null), P(null));
  }, [v, u]), _ = Z(async (d, E) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await ft({ apiBaseUrl: i, adminKey: r, feedbackId: d, attachmentId: E }), P((ee) => {
          var se;
          return !ee || ee.id !== d ? ee : {
            ...ee,
            attachments: (se = ee.attachments) == null ? void 0 : se.filter((ge) => ge.id !== E)
          };
        });
      } catch (ee) {
        console.error("Failed to delete attachment:", ee);
      }
  }, [i, r]), C = Z((d) => {
    try {
      const E = new URL(i);
      return `${E.origin}${E.pathname.replace(/\/$/, "")}/attachments/${d}`;
    } catch {
      return `${i}/attachments/${d}`;
    }
  }, [i]), R = Z(async (d) => {
    ie(d);
    try {
      await bt({ apiBaseUrl: i, adminKey: r, format: d });
    } catch (E) {
      console.error("Export failed:", E);
    } finally {
      ie(null);
    }
  }, [i, r]), a = {
    open: I.filter((d) => d.status === "open").length,
    inProgress: I.filter((d) => d.status === "in_progress").length,
    closed: I.filter((d) => d.status === "closed").length
  }, M = p ? "#0D1117" : "#1E293B", V = p ? "#21262D" : "#2D3748";
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
            value: S.status,
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
              Ve.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
            ]
          }
        ),
        /* @__PURE__ */ n(
          "select",
          {
            value: S.kind,
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
            value: S.target,
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
        W.length > 0 && /* @__PURE__ */ n(
          "select",
          {
            value: S.customTag,
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
              W.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d))
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
        !D && I.length === 0 && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: t.textMuted }, children: [
          /* @__PURE__ */ e(T, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        I.map((d) => {
          const E = Te[d.kind] ?? { label: d.kind, icon: "help" }, ee = u === d.id;
          return /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: t.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: ee ? `2px solid ${t.primary}` : "2px solid transparent",
                boxShadow: ee ? `0 4px 12px ${t.primary}30` : `0 1px 3px ${t.border}`,
                transition: "all 0.2s"
              },
              onClick: () => F(d.id),
              children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ n("span", { style: { fontSize: "11px", color: t.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    d.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: Je(d.kind), children: [
                    /* @__PURE__ */ e(T, { name: E.icon, size: 12 }),
                    E.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: Ge(d.status, t), children: d.status === "open" ? "Open" : d.status === "in_progress" ? "対応中" : "完了" }),
                  d.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: t.bgTertiary,
                    color: t.textSecondary,
                    fontWeight: 500
                  }, children: Le[d.target] ?? d.target }),
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
                  /* @__PURE__ */ e("span", { children: en(d.createdAt) }),
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
                      /* @__PURE__ */ e(T, { name: "link", size: 12 }),
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
                      /* @__PURE__ */ e(T, { name: "image", size: 12 }),
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
      w > 1 && /* @__PURE__ */ n("div", { style: {
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
            onClick: () => z(x - 1),
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
            children: /* @__PURE__ */ e(T, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ n("span", { style: { fontSize: "13px", color: t.textSecondary }, children: [
          x,
          " / ",
          w
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => z(x + 1),
            disabled: x >= w,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: t.bg,
              color: x >= w ? t.textMuted : t.text,
              cursor: x >= w ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: /* @__PURE__ */ e(T, { name: "chevron_right", size: 16 })
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
          /* @__PURE__ */ e(T, { name: "description", size: 16 }),
          h,
          " 件"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(T, { name: "error", size: 16, color: t.warning }),
          a.open,
          " Open"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(T, { name: "pending", size: 16, color: t.primary }),
          a.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(T, { name: "check_circle", size: 16, color: t.success }),
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
      u && L && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: t.textMuted }, children: [
        /* @__PURE__ */ e(le, { size: 32, color: t.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      u && !L && c && /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ n("span", { style: Je(c.kind), children: [
                /* @__PURE__ */ e(T, { name: ((Y = Te[c.kind]) == null ? void 0 : Y.icon) ?? "help", size: 14 }),
                ((G = Te[c.kind]) == null ? void 0 : G.label) ?? c.kind
              ] }),
              /* @__PURE__ */ e("span", { style: Ge(c.status, t), children: c.status === "open" ? "Open" : c.status === "in_progress" ? "対応中" : "完了" }),
              c.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: t.bgTertiary,
                color: t.textSecondary,
                fontWeight: 500
              }, children: Le[c.target] ?? c.target }),
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
                children: Ve.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
              }
            ),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => J(c.id),
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
                  /* @__PURE__ */ e(T, { name: "delete", size: 16 }),
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
          /* @__PURE__ */ e(he, { icon: "category", label: "種別", value: ((X = Te[c.kind]) == null ? void 0 : X.label) ?? c.kind, colors: t }),
          /* @__PURE__ */ e(he, { icon: "ads_click", label: "対象", value: c.target ? Le[c.target] ?? c.target : "-", colors: t }),
          /* @__PURE__ */ e(he, { icon: "schedule", label: "日時", value: tn(c.createdAt), colors: t }),
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
        }, children: Object.entries(c.environment).map(([d, E]) => /* @__PURE__ */ e(he, { icon: "info", label: d, value: String(E), colors: t }, d)) }) }),
        c.consoleLogs && c.consoleLogs.length > 0 && /* @__PURE__ */ e(ke, { icon: "terminal", title: `コンソールログ (${c.consoleLogs.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: M }, children: c.consoleLogs.map((d, E) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${V}`,
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
        ] }, E)) }) }),
        c.networkLogs && c.networkLogs.length > 0 && /* @__PURE__ */ e(ke, { icon: "wifi", title: `ネットワークログ (${c.networkLogs.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: M }, children: c.networkLogs.map((d, E) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${V}`,
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
        ] }, E)) }) }),
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
              onClick: () => K(C(d.filename))
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
              children: /* @__PURE__ */ e(T, { name: "close", size: 14 })
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
            onClick: () => K(null),
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
      u && !L && !c && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: t.textMuted }, children: [
        /* @__PURE__ */ e(T, { name: "error_outline", size: 48 }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px", fontSize: "16px" }, children: "詳細の取得に失敗しました" })
      ] }),
      !u && /* @__PURE__ */ n("div", { style: {
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
            /* @__PURE__ */ e(T, { name: "analytics", size: 18 }),
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
              onClick: () => R(d),
              disabled: Q !== null,
              style: {
                padding: "8px 14px",
                background: t.bg,
                border: "none",
                borderRadius: "10px",
                cursor: Q !== null ? "not-allowed" : "pointer",
                color: t.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: Q !== null && Q !== d ? 0.5 : 1,
                boxShadow: `0 1px 3px ${t.border}`,
                transition: "all 0.2s"
              },
              children: [
                Q === d ? /* @__PURE__ */ e(le, { size: 14, color: t.text }) : /* @__PURE__ */ e(T, { name: "download", size: 16 }),
                d.toUpperCase()
              ]
            },
            d
          )) })
        ] }),
        /* @__PURE__ */ n("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ e(T, { name: "arrow_back", size: 48 }),
          /* @__PURE__ */ e("div", { style: { fontSize: "16px", fontWeight: 500, marginTop: "12px" }, children: "フィードバックを選択してください" }),
          /* @__PURE__ */ e("div", { style: { fontSize: "13px", marginTop: "6px" }, children: "左のリストから選択すると詳細が表示されます" })
        ] })
      ] })
    ] })
  ] });
}
function he({ icon: i, label: r, value: t, isLink: p, colors: g }) {
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
      /* @__PURE__ */ e(T, { name: i, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: p ? g.link : g.text,
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
      /* @__PURE__ */ e(T, { name: i, size: 18 }),
      r
    ] }),
    t
  ] });
}
function en(i) {
  return dt(i);
}
function tn(i) {
  return lt(i);
}
const nn = {
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
}, rn = {
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
}, an = 3e4;
function bn({ apiBaseUrl: i, env: r = "dev", feedbackApiBaseUrl: t, feedbackAdminKey: p }) {
  const [g, I] = k(""), [h, x] = k(""), [y, D] = k(""), [l, S] = k(null), [W, b] = k(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [z, N] = k(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 768px)").matches);
  ne(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(max-width: 768px)"), m = (O) => N(O.matches);
    return o.addEventListener("change", m), () => o.removeEventListener("change", m);
  }, []);
  const [v, B] = k(!0), [u, $] = k(null), [c, P] = k("notes"), L = !!(t && p), [H, j] = k(null), [K, Q] = k(0), [ie, te] = k(null), [A, w] = k(null), [F, f] = k(""), [J, _] = k(""), [C, R] = k(!1), a = W ? rn : nn;
  ne(() => {
    i && We(i);
  }, [i]), ne(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(prefers-color-scheme: dark)"), m = (O) => b(O.matches);
    return o.addEventListener("change", m), () => o.removeEventListener("change", m);
  }, []);
  const { notes: M, loading: V, error: Y, updateStatus: G, updateSeverity: X, deleteNote: d, refresh: E } = tt(r);
  ne(() => {
    !V && u === "refresh" && $(null);
  }, [V, u]), ne(() => {
    if (l) {
      const o = M.find((m) => m.id === l.id);
      S(o ? (m) => m ? {
        ...o,
        attachments: o.attachments ?? m.attachments,
        activities: o.activities ?? m.activities,
        console_log: o.console_log ?? m.console_log,
        network_log: o.network_log ?? m.network_log,
        environment: o.environment ?? m.environment
      } : o : null);
    }
  }, [M]), ne(() => {
    if (!v) return;
    const o = setInterval(() => {
      E();
    }, an);
    return () => clearInterval(o);
  }, [v, E]);
  const ee = Z((o) => {
    const O = `${i || mt()}/export/${o}?env=${r}`;
    window.open(O, "_blank");
  }, [i, r]), se = Z((o) => {
    j(o), I("open"), P("notes");
  }, []), ge = ye(() => M.filter((o) => {
    if (g && o.status !== g || h && (o.source || "manual") !== h || H != null && !(o.test_case_ids ?? (o.test_case_id ? [o.test_case_id] : [])).includes(H))
      return !1;
    if (y) {
      const m = y.match(/^#([1-9]\d*)$/);
      if (m) {
        if (o.id !== Number(m[1])) return !1;
      } else {
        const O = y.toLowerCase();
        if (!o.title.toLowerCase().includes(O) && !o.content.toLowerCase().includes(O)) return !1;
      }
    }
    return !0;
  }), [M, g, h, H, y]), $e = Z((o, m) => {
    m === "fixed" || m === "resolved" || m === "rejected" || m === "closed" ? (w({ id: o, status: m }), f("")) : (async () => {
      $(`status-${o}`);
      try {
        await G(o, m), (l == null ? void 0 : l.id) === o && S((O) => O ? { ...O, status: m } : null);
      } finally {
        $(null);
      }
    })();
  }, [G, l == null ? void 0 : l.id]), ze = Z(async () => {
    if (!A) return;
    const { id: o, status: m } = A;
    if (!((m === "fixed" || m === "rejected") && F.trim() === "")) {
      $(`status-${o}`);
      try {
        const O = F.trim() ? { comment: F.trim() } : void 0;
        if (await G(o, m, O), (l == null ? void 0 : l.id) === o && S((oe) => oe ? { ...oe, status: m } : null), w(null), f(""), (l == null ? void 0 : l.id) === o)
          try {
            const oe = await ae.getNote(r, o);
            S(oe);
          } catch {
          }
      } finally {
        $(null);
      }
    }
  }, [A, F, G, l == null ? void 0 : l.id, r]), _e = Z(async (o, m) => {
    $(`severity-${o}`);
    try {
      await X(o, m), (l == null ? void 0 : l.id) === o && S((O) => O ? { ...O, severity: m } : null);
    } finally {
      $(null);
    }
  }, [X, l == null ? void 0 : l.id]), Ce = Z(async (o) => {
    S(o);
    try {
      const m = await ae.getNote(r, o.id);
      S(m);
    } catch {
    }
  }, [r]), Ne = Z(async (o) => {
    if (confirm("このノートを削除しますか？")) {
      $(`delete-${o}`);
      try {
        await d(o), (l == null ? void 0 : l.id) === o && S(null);
      } finally {
        $(null);
      }
    }
  }, [d, l == null ? void 0 : l.id]), ve = Z(async (o, m) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await ae.deleteAttachment(r, o, m), S((O) => {
          var oe;
          return !O || O.id !== o ? O : {
            ...O,
            attachments: (oe = O.attachments) == null ? void 0 : oe.filter((Ee) => Ee.id !== m)
          };
        });
      } catch (O) {
        console.error("Failed to delete attachment:", O);
      }
  }, [r]), Ie = Z(async () => {
    if (!(!l || J.trim() === "")) {
      R(!0);
      try {
        const o = await ae.addActivity(r, l.id, { content: J.trim() });
        S((m) => m && {
          ...m,
          activities: [...m.activities || [], o]
        }), _("");
      } catch (o) {
        console.error("Failed to add comment:", o);
      } finally {
        R(!1);
      }
    }
  }, [l, J, r]), Fe = (o) => {
    if (!o) return [];
    try {
      const m = JSON.parse(o);
      return Array.isArray(m) ? m : [];
    } catch {
      return o.split(`
`).filter((m) => m.trim());
    }
  };
  return /* @__PURE__ */ n("div", { style: on(a), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ n("header", { style: {
      ...sn(a),
      padding: z ? "12px 16px" : "16px 24px",
      flexWrap: "wrap",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: z ? "8px" : "16px", flexWrap: "wrap" }, children: [
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
          }, children: /* @__PURE__ */ e(T, { name: "bug_report", size: 24, color: "#FFF" }) }),
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
          background: v ? a.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: v ? a.success : a.textMuted,
            animation: v ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: v,
              onChange: (o) => B(o.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => ee("json"),
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
              /* @__PURE__ */ e(T, { name: "download", size: 16 }),
              "JSON"
            ]
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => ee("sqlite"),
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
              /* @__PURE__ */ e(T, { name: "download", size: 16 }),
              "SQLite"
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => b(!W),
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
            title: W ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(T, { name: W ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => {
              $("refresh"), E(), Q((o) => o + 1);
            },
            disabled: u !== null,
            style: {
              padding: "10px 20px",
              background: a.primary,
              border: "none",
              borderRadius: "10px",
              cursor: u !== null ? "not-allowed" : "pointer",
              color: "#FFF",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: u !== null ? 0.6 : 1
            },
            children: [
              u === "refresh" ? /* @__PURE__ */ e(le, { size: 18, color: "#FFF" }) : /* @__PURE__ */ e(T, { name: "refresh", size: 18, color: "#FFF" }),
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
      ...L ? [{ key: "feedback", label: "フィードバック" }] : []
    ].map(({ key: o, label: m }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          P(o), o === "test-status" && j(null);
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
        children: m
      },
      o
    )) }),
    c === "test-status" ? /* @__PURE__ */ e(
      Ut,
      {
        env: r,
        colors: a,
        isDarkMode: W,
        onNavigateToNote: se,
        refreshKey: K
      }
    ) : c === "feedback" && L ? /* @__PURE__ */ e(
      Xt,
      {
        apiBaseUrl: t,
        adminKey: p,
        colors: a,
        isDarkMode: W,
        refreshKey: K
      }
    ) : /* @__PURE__ */ n("div", { style: {
      display: "flex",
      flexDirection: z ? "column" : "row",
      flex: 1,
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ n("aside", { style: {
        width: z ? "100%" : "380px",
        flex: z ? "1 1 auto" : "0 0 auto",
        minHeight: 0,
        borderRight: z ? "none" : `1px solid ${a.border}`,
        borderBottom: z ? `1px solid ${a.border}` : "none",
        display: z && l ? "none" : "flex",
        flexDirection: "column",
        background: a.bgSecondary,
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ n("div", { style: {
          padding: z ? "12px" : "16px",
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
              onChange: (o) => I(o.target.value),
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
                value: y,
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
            }, children: /* @__PURE__ */ e(T, { name: "search", size: 18 }) })
          ] })
        ] }),
        H != null && /* @__PURE__ */ e("div", { style: {
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
          H,
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
          V && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(T, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          Y && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: a.errorBg,
            color: a.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: Y.message }),
          !V && ge.length === 0 && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(T, { name: "inbox", size: 40 }),
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
              onClick: () => Ce(o),
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
                  /* @__PURE__ */ n("span", { style: Xe(o.severity, a), children: [
                    /* @__PURE__ */ e(T, { name: Ye(o.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: o.severity || "none" })
                  ] }),
                  /* @__PURE__ */ n("span", { style: Re(o.status, a), children: [
                    /* @__PURE__ */ e(T, { name: Ue(o.status), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: Se(o.status) })
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
                    /* @__PURE__ */ e(T, { name: "image", size: 12 }),
                    o.attachment_count
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: a.text,
                  lineHeight: 1.4
                }, children: Ze(o.content) }),
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
                    /* @__PURE__ */ e(T, { name: "link", size: 12 }),
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
                  /* @__PURE__ */ e(T, { name: "chat_bubble_outline", size: 14 }),
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
            /* @__PURE__ */ e(T, { name: "description", size: 16 }),
            M.length,
            " 件"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(T, { name: "error", size: 16, color: a.error }),
            M.filter((o) => o.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(T, { name: "build", size: 16, color: a.warning }),
            M.filter((o) => o.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(T, { name: "check_circle", size: 16, color: a.success }),
            M.filter((o) => o.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(T, { name: "cancel", size: 16, color: a.textMuted }),
            M.filter((o) => o.status === "closed").length,
            " クローズ"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(T, { name: "undo", size: 16, color: a.error }),
            M.filter((o) => o.status === "rejected").length,
            " Rejected"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e("main", { style: {
        flex: 1,
        overflow: "auto",
        padding: z ? "16px" : "32px",
        background: a.bg,
        display: z && !l ? "none" : "block"
      }, children: l ? /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        z && /* @__PURE__ */ n(
          "button",
          {
            onClick: () => S(null),
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
              /* @__PURE__ */ e(T, { name: "arrow_back", size: 16, color: a.textSecondary }),
              "一覧へ戻る"
            ]
          }
        ),
        /* @__PURE__ */ n("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: z ? "20px" : "32px",
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
              /* @__PURE__ */ n("span", { style: Xe(l.severity, a), children: [
                /* @__PURE__ */ e(T, { name: Ye(l.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: l.severity || "none" })
              ] }),
              /* @__PURE__ */ n("span", { style: Re(l.status, a), children: [
                /* @__PURE__ */ e(T, { name: Ue(l.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: Se(l.status) })
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
            }, children: Ze(l.content) })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "severity-select",
                value: l.severity || "",
                onChange: (o) => {
                  const m = o.target.value;
                  _e(l.id, m || null);
                },
                disabled: u !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: u !== null ? "not-allowed" : "pointer",
                  opacity: u !== null ? 0.6 : 1
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
            u === `severity-${l.id}` && /* @__PURE__ */ e(le, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "status-select",
                value: l.status,
                onChange: (o) => $e(l.id, o.target.value),
                disabled: u !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: u !== null ? "not-allowed" : "pointer",
                  opacity: u !== null ? 0.6 : 1
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
            u === `status-${l.id}` && /* @__PURE__ */ e(le, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => Ne(l.id),
                disabled: u !== null,
                style: {
                  padding: "10px 16px",
                  background: a.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: a.error,
                  cursor: u !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: u !== null ? 0.6 : 1
                },
                children: [
                  u === `delete-${l.id}` ? /* @__PURE__ */ e(le, { size: 16, color: a.error }) : /* @__PURE__ */ e(T, { name: "delete", size: 16 }),
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
              value: Qe(l.created_at),
              colors: a
            }
          ),
          l.test_cases && l.test_cases.length > 0 && /* @__PURE__ */ n("div", { style: {
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
              /* @__PURE__ */ e(T, { name: "science", size: 16, color: a.link }),
              "元のテストケース"
            ] }),
            l.test_cases.map((o, m) => {
              const O = [o.domain, o.capability].filter(Boolean);
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
                      O.length > 0 && /* @__PURE__ */ e("span", { style: {
                        fontSize: "11px",
                        color: a.textMuted
                      }, children: O.join(" / ") })
                    ] }),
                    /* @__PURE__ */ e("div", { style: {
                      fontSize: "13px",
                      color: a.text,
                      fontWeight: 500,
                      lineHeight: 1.4
                    }, children: o.title || "(タイトル未設定)" })
                  ]
                },
                m
              );
            })
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
              src: ae.getAttachmentUrl(o.filename),
              alt: o.original_name,
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              },
              onClick: () => te(ae.getAttachmentUrl(o.filename))
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
                onClick: (m) => {
                  m.stopPropagation(), ve(l.id, o.id);
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
                children: /* @__PURE__ */ e(T, { name: "delete", size: 14, color: "#fff" })
              }
            )
          ] })
        ] }, o.id)) }) }),
        l.steps && /* @__PURE__ */ e(pe, { icon: "format_list_numbered", title: "再現手順", colors: a, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: a.text
        }, children: Fe(l.steps).map((o, m) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${a.borderLight}`
        }, children: o }, m)) }) }),
        l.user_log && /* @__PURE__ */ e(pe, { icon: "sticky_note_2", title: "補足メモ", colors: a, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: W ? "#0D1117" : "#1E293B",
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
          /* @__PURE__ */ e(fe, { icon: "schedule", label: "記録日時", value: Qe(l.environment.timestamp || ""), colors: a })
        ] }) }),
        l.console_log && l.console_log.length > 0 && /* @__PURE__ */ e(pe, { icon: "terminal", title: `コンソールログ (${l.console_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: W ? "#0D1117" : "#1E293B"
        }, children: l.console_log.map((o, m) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${W ? "#21262D" : "#2D3748"}`,
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
        ] }, m)) }) }),
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
                }, children: Se(o.old_status) }),
                /* @__PURE__ */ e("span", { style: { margin: "0 6px", color: a.textMuted }, children: " → " }),
                /* @__PURE__ */ e("span", { style: {
                  ...Re(o.new_status, a),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: Se(o.new_status) })
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
                value: J,
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
                onClick: Ie,
                disabled: C || J.trim() === "",
                style: {
                  padding: "10px 16px",
                  background: C || J.trim() === "" ? a.bgTertiary : a.primary,
                  border: "none",
                  borderRadius: "10px",
                  color: C || J.trim() === "" ? a.textMuted : "#FFF",
                  cursor: C || J.trim() === "" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                },
                children: [
                  C ? /* @__PURE__ */ e(le, { size: 14, color: a.textMuted }) : /* @__PURE__ */ e(T, { name: "send", size: 16 }),
                  "送信"
                ]
              }
            )
          ] })
        ] }),
        l.network_log && l.network_log.length > 0 && /* @__PURE__ */ e(pe, { icon: "wifi", title: `ネットワークログ (${l.network_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: W ? "#0D1117" : "#1E293B"
        }, children: l.network_log.map((o, m) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${W ? "#21262D" : "#2D3748"}`,
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
        ] }, m)) }) })
      ] }) : /* @__PURE__ */ n("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: a.textMuted
      }, children: [
        /* @__PURE__ */ e(T, { name: "arrow_back", size: 64 }),
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
                /* @__PURE__ */ e(T, { name: "edit_note", size: 20 }),
                "ステータスを「",
                Se(A.status),
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
                    onClick: ze,
                    disabled: u !== null || (A.status === "fixed" || A.status === "rejected") && F.trim() === "",
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
                      u ? /* @__PURE__ */ e(le, { size: 14, color: "#FFF" }) : /* @__PURE__ */ e(T, { name: "check", size: 16 }),
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
              children: /* @__PURE__ */ e(T, { name: "close", size: 24, color: "#fff" })
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
function fe({ icon: i, label: r, value: t, isLink: p, colors: g }) {
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
      /* @__PURE__ */ e(T, { name: i, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: p ? g.link : g.text,
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
      /* @__PURE__ */ e(T, { name: i, size: 18 }),
      r
    ] }),
    t
  ] });
}
function Ze(i, r = 60) {
  const t = i.split(`
`)[0];
  return t.length > r ? t.slice(0, r) + "..." : t;
}
function Ke(i) {
  return dt(i);
}
function Qe(i) {
  return lt(i);
}
function Ue(i) {
  switch (i) {
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
function Se(i) {
  return i === "closed" ? "クローズ" : i ?? "";
}
function Ye(i) {
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
function Xe(i, r) {
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
    case "closed":
      t = r.bgTertiary, p = r.textMuted;
      break;
    case "in_progress":
      t = `${r.accent}15`, p = r.accent;
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
function on(i) {
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
function sn(i) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${i.border}`,
    background: i.bg
  };
}
function mn({
  apiBaseUrl: i,
  env: r = "dev",
  testCases: t,
  manualItems: p,
  manualDefaultPath: g,
  onManualNavigate: I,
  onManualAppNavigate: h,
  environmentsMd: x,
  onSave: y,
  initialSize: D,
  logCaptureConfig: l,
  disableLogCapture: S,
  adminRoutePath: W = "/__admin",
  triggerOffset: b
}) {
  const { isDebugMode: z } = xt();
  ne(() => {
    i && We(i);
  }, [i]);
  const N = ye(() => S || !i ? null : $t(
    l ?? { console: !0, network: ["/api/**"] }
  ), [i, S]), [v, B] = k(() => typeof window > "u" ? !1 : window.location.pathname === W);
  return ne(() => {
    if (typeof window > "u") return;
    const $ = () => B(window.location.pathname === W);
    $(), window.addEventListener("popstate", $), window.addEventListener("hashchange", $);
    const c = window.history.pushState, P = window.history.replaceState;
    return window.history.pushState = function(...L) {
      const H = c.apply(this, L);
      return $(), H;
    }, window.history.replaceState = function(...L) {
      const H = P.apply(this, L);
      return $(), H;
    }, () => {
      window.removeEventListener("popstate", $), window.removeEventListener("hashchange", $), window.history.pushState = c, window.history.replaceState = P;
    };
  }, [W]), !i || !(z || v) ? null : /* @__PURE__ */ e(
    jt,
    {
      apiBaseUrl: i,
      env: r,
      testCases: t,
      logCapture: N ?? void 0,
      manualItems: p,
      manualDefaultPath: g,
      onManualNavigate: I,
      onManualAppNavigate: h,
      environmentsMd: x,
      onSave: y,
      initialSize: D,
      triggerOffset: b
    }
  );
}
export {
  bn as D,
  jt as a,
  mn as b,
  Tt as p
};
