import { jsxs as t, jsx as e, Fragment as he } from "react/jsx-runtime";
import { useState as m, useMemo as we, useCallback as H, forwardRef as qe, useRef as ce, useEffect as re, useImperativeHandle as Ve } from "react";
import { createPortal as Ge } from "react-dom";
import { u as Oe } from "./useDebugNotes-DQ5gg-J_.js";
import { a as ie, s as He, g as Ue } from "./api-BfEr37m2.js";
import { m as Je } from "./feedbackLogCapture-DUBfVREg.js";
import { I as Pe, D as o, h as Qe } from "./FeedbackAdmin-Ba0BcbJ0.js";
import { d as Ke, a as Ye } from "./useFeedbackAdminMode-ubetqYta.js";
import { a as Ze, b as Xe, e as et } from "./feedbackApi-lPew7wSg.js";
function tt(s) {
  return s.split(`
`).map((a) => a.trim()).filter((a) => a.startsWith("- ")).map((a) => a.slice(2).trim()).filter(Boolean);
}
function nt({ notes: s, updateStatus: a }) {
  const [i, u] = m(null), [f, C] = m(/* @__PURE__ */ new Set(["fixed"])), [F, M] = m(/* @__PURE__ */ new Set()), [P, Q] = m("list"), [c, w] = m({}), T = we(() => f.size === 0 ? s : s.filter((l) => f.has(l.status)), [s, f]), _ = we(() => s.filter((l) => l.status === "fixed"), [s]), A = H(async (l, b) => {
    u(`status-${l}`);
    try {
      await a(l, b), b === "resolved" && w((g) => {
        const R = { ...g };
        return delete R[l], R;
      });
    } finally {
      u(null);
    }
  }, [a]), q = H((l, b) => {
    w((g) => {
      const R = g[l] ?? /* @__PURE__ */ new Set(), p = new Set(R);
      return p.has(b) ? p.delete(b) : p.add(b), { ...g, [l]: p };
    });
  }, []);
  return /* @__PURE__ */ t("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ t("div", { className: "debug-view-toggle", children: [
      /* @__PURE__ */ t(
        "button",
        {
          className: `debug-view-btn ${P === "list" ? "active" : ""}`,
          onClick: () => Q("list"),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "list" }),
            "一覧"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          className: `debug-view-btn ${P === "checklist" ? "active" : ""}`,
          onClick: () => Q("checklist"),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "checklist" }),
            "確認手順",
            _.length > 0 && /* @__PURE__ */ e("span", { className: "debug-view-badge", children: _.length })
          ]
        }
      )
    ] }) }),
    P === "list" && /* @__PURE__ */ t(he, { children: [
      /* @__PURE__ */ t("div", { className: "debug-status-filter", children: [
        ["open", "fixed", "resolved", "rejected"].map((l) => /* @__PURE__ */ e(
          "button",
          {
            "data-testid": `status-chip-${l}`,
            className: `debug-status-chip ${f.has(l) ? "active" : ""}`,
            onClick: () => {
              C((b) => {
                const g = new Set(b);
                return g.has(l) ? g.delete(l) : g.add(l), g;
              });
            },
            children: l
          },
          l
        )),
        /* @__PURE__ */ t("span", { className: "debug-filter-count", children: [
          T.length,
          "件"
        ] })
      ] }),
      T.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "対応中のノートはありません" }) : T.map((l) => /* @__PURE__ */ t("div", { children: [
        /* @__PURE__ */ t("div", { className: "debug-note-row", "data-status": l.status, children: [
          /* @__PURE__ */ t(
            "div",
            {
              className: "debug-note-info",
              style: { cursor: l.latest_comment ? "pointer" : void 0 },
              onClick: () => {
                l.latest_comment && M((b) => {
                  const g = new Set(b);
                  return g.has(l.id) ? g.delete(l.id) : g.add(l.id), g;
                });
              },
              children: [
                /* @__PURE__ */ t("span", { className: "debug-note-id", children: [
                  "#",
                  l.id
                ] }),
                l.latest_comment && /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: F.has(l.id) ? "▲" : "▼" }),
                /* @__PURE__ */ e("span", { className: `debug-severity-dot ${l.severity || "none"}` }),
                /* @__PURE__ */ t("span", { className: "debug-note-preview", children: [
                  l.source === "test" && /* @__PURE__ */ e("span", { className: "debug-source-badge", children: "🧪" }),
                  l.content.split(`
`)[0].slice(0, 40)
                ] })
              ]
            }
          ),
          /* @__PURE__ */ t(
            "select",
            {
              "data-testid": `note-status-select-${l.id}`,
              className: "debug-status-select",
              value: l.status,
              onChange: (b) => A(l.id, b.target.value),
              disabled: i !== null,
              children: [
                /* @__PURE__ */ e("option", { value: "open", children: "open" }),
                /* @__PURE__ */ e("option", { value: "fixed", children: "fixed" }),
                /* @__PURE__ */ e("option", { value: "resolved", children: "resolved" }),
                /* @__PURE__ */ e("option", { value: "rejected", children: "rejected" })
              ]
            }
          )
        ] }),
        F.has(l.id) && l.latest_comment && /* @__PURE__ */ e("div", { style: {
          padding: "4px 12px 6px 28px",
          fontSize: "11px",
          color: "#6B7280",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }, children: l.latest_comment })
      ] }, l.id))
    ] }),
    P === "checklist" && /* @__PURE__ */ e("div", { className: "debug-checklist-view", children: _.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "fixed のノートはありません" }) : _.map((l) => {
      const b = tt(l.latest_comment || ""), g = c[l.id] ?? /* @__PURE__ */ new Set(), R = b.length > 0 && g.size === b.length;
      return /* @__PURE__ */ t("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ t("div", { className: "debug-checklist-header", children: [
          /* @__PURE__ */ t("span", { className: "debug-note-id", children: [
            "#",
            l.id
          ] }),
          /* @__PURE__ */ e("span", { className: "debug-checklist-title", children: l.content.split(`
`)[0].slice(0, 50) })
        ] }),
        b.length > 0 ? /* @__PURE__ */ e("div", { className: "debug-checklist-items", children: b.map((p, W) => /* @__PURE__ */ t("label", { className: "debug-checklist-item", children: [
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: g.has(W),
              onChange: () => q(l.id, W)
            }
          ),
          /* @__PURE__ */ e("span", { className: g.has(W) ? "debug-checklist-done" : "", children: p })
        ] }, W)) }) : /* @__PURE__ */ e("div", { className: "debug-checklist-no-items", children: "確認手順が登録されていません" }),
        /* @__PURE__ */ t("div", { className: "debug-checklist-actions", children: [
          /* @__PURE__ */ t("span", { className: "debug-checklist-progress", children: [
            g.size,
            "/",
            b.length
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              className: "debug-btn debug-btn-resolve",
              disabled: !R || i !== null,
              onClick: () => A(l.id, "resolved"),
              children: i === `status-${l.id}` ? "更新中..." : "resolved に変更"
            }
          )
        ] })
      ] }, l.id);
    }) })
  ] });
}
const it = qe(function({ testCases: a, env: i, logCapture: u, onNotesRefresh: f }, C) {
  const [F, M] = m([]), [P, Q] = m(/* @__PURE__ */ new Set()), [c, w] = m(/* @__PURE__ */ new Set()), [T, _] = m({}), [A, q] = m({}), [l, b] = m(null), [g, R] = m(null), p = ce("");
  re(() => {
    if (!a || a.length === 0) return;
    const h = JSON.stringify(a);
    if (h === p.current) return;
    let S = !1;
    return (async () => {
      try {
        await ie.importTestCases(a);
      } catch (x) {
        console.warn("Failed to import test cases:", x);
        return;
      }
      if (!S)
        try {
          const x = await ie.getTestTree(i);
          if (S) return;
          M(x), p.current = h;
          const D = {};
          for (const z of x)
            for (const v of z.capabilities)
              for (const n of v.cases)
                n.last === "pass" && (D[n.caseId] = !0);
          _(D);
        } catch (x) {
          console.warn("Failed to fetch test tree:", x);
        }
    })(), () => {
      S = !0;
    };
  }, [a, i]);
  const W = H(async () => {
    try {
      const h = await ie.getTestTree(i);
      M(h);
      const S = {};
      for (const x of h)
        for (const D of x.capabilities)
          for (const z of D.cases)
            S[z.caseId] = z.last === "pass";
      _(S);
    } catch {
      R({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [i]);
  Ve(C, () => ({ refresh: W }), [W]);
  const B = H(async (h, S, x) => {
    const D = `${h}/${S}`;
    b(D), R(null);
    try {
      const z = [], v = A[D], n = v != null && v.content.trim() && v.caseIds.length > 0 ? v.caseIds : [], $ = new Set(n);
      for (const U of x)
        T[U.caseId] && !$.has(U.caseId) && z.push({ caseId: U.caseId, result: "pass" });
      for (const U of n)
        z.push({ caseId: U, result: "fail" });
      if (z.length === 0) {
        R({ type: "error", text: "チェックまたはバグ報告が必要です" }), b(null);
        return;
      }
      const I = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, j = n.length > 0 ? {
        content: v.content.trim(),
        severity: v.severity || void 0,
        consoleLogs: u == null ? void 0 : u.getConsoleLogs(),
        networkLogs: u == null ? void 0 : u.getNetworkLogs(),
        environment: I
      } : void 0, V = await ie.submitTestRuns(i, z, j);
      if (v != null && v.files && v.files.length > 0 && V.results) {
        const O = V.results.filter((X) => X.noteId != null).map((X) => X.noteId)[0];
        if (O)
          for (const X of v.files)
            try {
              await ie.uploadAttachment(i, O, X);
            } catch (d) {
              console.warn("Failed to upload attachment:", d);
            }
      }
      if (V.capability) {
        M((O) => O.map((X) => X.domain !== h ? X : {
          ...X,
          capabilities: X.capabilities.map(
            (d) => d.capability === S ? V.capability : d
          )
        }));
        const U = { ...T };
        for (const O of V.capability.cases)
          U[O.caseId] = O.last === "pass";
        _(U);
      }
      f(), q((U) => {
        const O = { ...U };
        return delete O[D], O;
      }), R({ type: "success", text: "送信しました" });
    } catch (z) {
      R({ type: "error", text: z instanceof Error ? z.message : "送信に失敗しました" });
    } finally {
      b(null);
    }
  }, [T, A, i, u, f]), Y = H((h) => {
    Q((S) => {
      const x = new Set(S);
      return x.has(h) ? x.delete(h) : x.add(h), x;
    });
  }, []), ne = H((h) => {
    w((S) => {
      const x = new Set(S);
      return x.has(h) ? x.delete(h) : x.add(h), x;
    });
  }, []), te = (h) => h.last === "pass" ? "passed" : h.last === "fail" && h.openIssues === 0 ? "retest" : h.last === "fail" ? "fail" : "-", G = (h) => h.last === "pass" ? o.success : h.last === "fail" && h.openIssues === 0 ? "#F59E0B" : h.last === "fail" ? o.error : o.gray500, L = (h) => h.status === "passed" ? "passed" : h.status === "retest" ? "retest" : h.status === "fail" ? "fail" : "", Z = (h) => h.status === "passed" ? o.success : h.status === "retest" ? "#F59E0B" : h.status === "fail" ? o.error : o.gray500;
  return /* @__PURE__ */ t(he, { children: [
    g && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${g.type}`, children: g.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: F.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : F.map((h) => /* @__PURE__ */ t("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ t(
        "button",
        {
          "data-testid": `domain-toggle-${h.domain}`,
          className: "debug-tree-toggle",
          onClick: () => Y(h.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: P.has(h.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: h.domain })
          ]
        }
      ),
      P.has(h.domain) && h.capabilities.map((S) => {
        const x = `${h.domain}/${S.capability}`, D = c.has(x), z = A[x];
        return /* @__PURE__ */ t("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ t(
            "button",
            {
              "data-testid": `cap-toggle-${x}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => ne(x),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: D ? "expand_more" : "chevron_right" }),
                /* @__PURE__ */ e("span", { className: "debug-tree-label", children: S.capability }),
                /* @__PURE__ */ t("span", { className: "debug-tree-count", children: [
                  S.passed,
                  "/",
                  S.total
                ] }),
                S.status && /* @__PURE__ */ e("span", { className: "debug-tree-status", style: { color: Z(S) }, children: L(S) }),
                S.openIssues > 0 && /* @__PURE__ */ t("span", { className: "debug-tree-issues", children: [
                  "[",
                  S.openIssues,
                  "件]"
                ] })
              ]
            }
          ),
          D && /* @__PURE__ */ t("div", { className: "debug-tree-cases", children: [
            S.cases.map((v) => /* @__PURE__ */ t("label", { "data-testid": `case-${v.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!T[v.caseId],
                  onChange: (n) => {
                    _(($) => ({
                      ...$,
                      [v.caseId]: n.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: v.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: G(v) }, children: te(v) }),
              v.openIssues > 0 && /* @__PURE__ */ t("span", { className: "debug-tree-issues", children: [
                "[",
                v.openIssues,
                "件]"
              ] })
            ] }, v.caseId)),
            /* @__PURE__ */ t("div", { className: "debug-bug-form", children: [
              /* @__PURE__ */ e("div", { className: "debug-bug-form-title", children: "バグ報告" }),
              /* @__PURE__ */ t("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "ケース（複数選択可）" }),
                /* @__PURE__ */ e("div", { className: "debug-bug-cases", children: S.cases.map((v) => {
                  const n = (z == null ? void 0 : z.caseIds.includes(v.caseId)) ?? !1;
                  return /* @__PURE__ */ t("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: n,
                        onChange: ($) => {
                          q((I) => {
                            const j = I[x] || { caseIds: [], content: "", severity: "", files: [] }, V = $.target.checked ? [...j.caseIds, v.caseId] : j.caseIds.filter((U) => U !== v.caseId);
                            return { ...I, [x]: { ...j, caseIds: V } };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { children: v.title })
                  ] }, v.caseId);
                }) })
              ] }),
              /* @__PURE__ */ t("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "内容" }),
                /* @__PURE__ */ e(
                  "textarea",
                  {
                    value: (z == null ? void 0 : z.content) || "",
                    onChange: (v) => {
                      q((n) => {
                        var $, I, j;
                        return {
                          ...n,
                          [x]: {
                            ...n[x],
                            caseIds: (($ = n[x]) == null ? void 0 : $.caseIds) || [],
                            content: v.target.value,
                            severity: ((I = n[x]) == null ? void 0 : I.severity) || "",
                            files: ((j = n[x]) == null ? void 0 : j.files) || []
                          }
                        };
                      });
                    },
                    placeholder: "バグの内容",
                    rows: 2
                  }
                )
              ] }),
              /* @__PURE__ */ t("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "重要度" }),
                /* @__PURE__ */ t(
                  "select",
                  {
                    value: (z == null ? void 0 : z.severity) || "",
                    onChange: (v) => {
                      q((n) => {
                        var $, I, j;
                        return {
                          ...n,
                          [x]: {
                            ...n[x],
                            caseIds: (($ = n[x]) == null ? void 0 : $.caseIds) || [],
                            content: ((I = n[x]) == null ? void 0 : I.content) || "",
                            severity: v.target.value,
                            files: ((j = n[x]) == null ? void 0 : j.files) || []
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
                Pe,
                {
                  files: (z == null ? void 0 : z.files) || [],
                  onAdd: (v) => {
                    q((n) => {
                      var $, I, j, V;
                      return {
                        ...n,
                        [x]: {
                          ...n[x],
                          caseIds: (($ = n[x]) == null ? void 0 : $.caseIds) || [],
                          content: ((I = n[x]) == null ? void 0 : I.content) || "",
                          severity: ((j = n[x]) == null ? void 0 : j.severity) || "",
                          files: [...((V = n[x]) == null ? void 0 : V.files) || [], ...v]
                        }
                      };
                    });
                  },
                  onRemove: (v) => {
                    q((n) => {
                      var $, I, j, V;
                      return {
                        ...n,
                        [x]: {
                          ...n[x],
                          caseIds: (($ = n[x]) == null ? void 0 : $.caseIds) || [],
                          content: ((I = n[x]) == null ? void 0 : I.content) || "",
                          severity: ((j = n[x]) == null ? void 0 : j.severity) || "",
                          files: (((V = n[x]) == null ? void 0 : V.files) || []).filter((U, O) => O !== v)
                        }
                      };
                    });
                  },
                  disabled: l !== null
                }
              )
            ] }),
            (() => {
              const v = z != null && z.content.trim() ? z.caseIds.length : 0, $ = S.cases.filter((I) => T[I.caseId] && !(z != null && z.caseIds.includes(I.caseId) && v > 0)).length + v;
              return /* @__PURE__ */ e(
                "button",
                {
                  "data-testid": `cap-submit-${x}`,
                  className: "debug-btn debug-btn-primary debug-cap-submit",
                  onClick: () => B(h.domain, S.capability, S.cases),
                  disabled: l !== null || $ === 0,
                  children: l === x ? /* @__PURE__ */ t("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
                  ] }) : `${$}/${S.total}件を送信`
                }
              );
            })()
          ] })
        ] }, x);
      })
    ] }, h.domain)) })
  ] });
});
function rt({
  items: s,
  defaultPath: a,
  onNavigate: i,
  onAppNavigate: u
}) {
  var c;
  const [f, C] = m(a || ((c = s[0]) == null ? void 0 : c.path) || ""), { content: F, loading: M, error: P } = Ke(f), Q = (w) => {
    C(w), i == null || i(w);
  };
  return /* @__PURE__ */ t("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: s.map((w) => /* @__PURE__ */ e(
      "button",
      {
        className: `debug-manual-item ${f === w.path ? "active" : ""}`,
        onClick: () => Q(w.path),
        title: w.title,
        children: w.title
      },
      w.id
    )) }),
    /* @__PURE__ */ t("div", { className: "debug-manual-content", children: [
      M && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      P && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: P.message }),
      F && /* @__PURE__ */ e(
        Qe,
        {
          content: F,
          onLinkClick: (w) => {
            C(w), i == null || i(w);
          },
          onAppLinkClick: u
        }
      )
    ] })
  ] });
}
const at = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: o.primary,
  color: o.white,
  border: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
}, Ne = {
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
    zIndex: 9999
  },
  panel: {
    width: "400px",
    maxHeight: "90vh",
    background: o.white,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  }
};
function ot() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${o.white};
      font-size: 14px;
      color: ${o.gray900};
    }

    .debug-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
    }

    .debug-panel {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: ${o.primary};
      color: ${o.white};
    }

    .debug-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .debug-header-left .debug-icon {
      color: ${o.secondary};
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
      color: ${o.white};
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
      color: ${o.white};
      cursor: pointer;
    }

    .debug-close-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    /* タブ */
    .debug-tabs {
      display: flex;
      border-bottom: 1px solid ${o.gray200};
      background: ${o.gray100};
    }

    .debug-tab {
      flex: 1;
      padding: 10px 0;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      color: ${o.gray500};
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .debug-tab:hover {
      color: ${o.gray700};
    }

    .debug-tab.active {
      color: ${o.primary};
      border-bottom-color: ${o.primary};
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
      background: ${o.successBg};
      color: ${o.success};
    }

    .debug-message-error {
      background: ${o.errorBg};
      color: ${o.error};
    }

    .debug-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .debug-field label {
      font-size: 13px;
      font-weight: 500;
      color: ${o.gray700};
    }

    .debug-field input,
    .debug-field textarea,
    .debug-field select {
      padding: 10px 12px;
      border: 1px solid ${o.gray300};
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s;
    }

    .debug-field input:focus,
    .debug-field textarea:focus,
    .debug-field select:focus {
      outline: none;
      border-color: ${o.primary};
    }

    .debug-field textarea {
      resize: vertical;
      min-height: 60px;
    }

    .debug-hint {
      font-size: 11px;
      color: ${o.gray500};
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
      border: 1px dashed ${o.gray300};
      border-radius: 6px;
      color: ${o.gray500};
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-toggle-btn:hover {
      border-color: ${o.primary};
      color: ${o.primary};
    }

    .debug-attach-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: ${o.gray100};
      border-radius: 8px;
    }

    .debug-attach-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: ${o.gray700};
      cursor: pointer;
    }

    .debug-attach-option input[type="checkbox"] {
      accent-color: ${o.primary};
    }

    .debug-footer {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid ${o.gray200};
      background: ${o.gray100};
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
      background: ${o.primary};
      color: ${o.white};
    }

    .debug-btn-primary:hover:not(:disabled) {
      background: ${o.primaryHover};
    }

    .debug-btn-secondary {
      background: ${o.white};
      color: ${o.gray700};
      border: 1px solid ${o.gray300};
    }

    .debug-btn-secondary:hover:not(:disabled) {
      background: ${o.gray100};
    }

    /* 管理タブ: ステータスフィルタ */
    .debug-status-filter {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      padding-bottom: 8px;
      border-bottom: 1px solid ${o.gray200};
    }

    .debug-status-chip {
      padding: 4px 10px;
      border: 1px solid ${o.gray300};
      border-radius: 12px;
      background: ${o.white};
      color: ${o.gray500};
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-status-chip:hover {
      border-color: ${o.primary};
      color: ${o.primary};
    }

    .debug-status-chip.active {
      background: ${o.primary};
      border-color: ${o.primary};
      color: ${o.white};
    }

    .debug-filter-count {
      font-size: 11px;
      color: ${o.gray500};
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
      background: ${o.gray100};
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
      color: ${o.gray500};
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

    .debug-severity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .debug-severity-dot.critical { background: #7C2D12; }
    .debug-severity-dot.high { background: ${o.error}; }
    .debug-severity-dot.medium { background: ${o.secondary}; }
    .debug-severity-dot.low { background: ${o.primary}; }
    .debug-severity-dot.none { background: ${o.gray300}; }

    .debug-status-select {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid ${o.gray300};
      border-radius: 4px;
      background: ${o.white};
      cursor: pointer;
      flex-shrink: 0;
    }

    .debug-empty {
      text-align: center;
      padding: 40px 16px;
      color: ${o.gray500};
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
      color: ${o.gray900};
      font-weight: 600;
      width: 100%;
      text-align: left;
    }

    .debug-tree-toggle:hover {
      background: ${o.gray100};
      border-radius: 4px;
    }

    .debug-tree-label {
      flex: 1;
    }

    .debug-tree-count {
      font-size: 12px;
      color: ${o.gray500};
      font-weight: 500;
    }

    .debug-tree-status {
      font-size: 11px;
      font-weight: 600;
    }

    .debug-tree-issues {
      font-size: 11px;
      color: ${o.error};
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
      color: ${o.gray700};
    }

    .debug-tree-case:hover {
      background: ${o.gray100};
    }

    .debug-tree-case input[type="checkbox"] {
      flex-shrink: 0;
      accent-color: ${o.primary};
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
      background: ${o.gray100};
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-bug-form-title {
      font-size: 12px;
      font-weight: 600;
      color: ${o.gray700};
      padding-bottom: 4px;
      border-bottom: 1px solid ${o.gray200};
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
      color: ${o.gray700};
    }

    .debug-bug-case-option:hover {
      background: ${o.gray200};
    }

    .debug-bug-case-option input[type="checkbox"] {
      accent-color: ${o.error};
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
      border-right: 1px solid ${o.gray200};
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
      color: ${o.gray700};
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-manual-item:hover {
      background: ${o.gray100};
    }

    .debug-manual-item.active {
      background: ${o.primary};
      color: ${o.white};
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
      color: ${o.gray900};
    }

    .manual-markdown h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid ${o.gray200}; }
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
      background: ${o.gray100};
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .manual-markdown pre {
      background: ${o.gray100};
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
      border: 1px solid ${o.gray200};
      padding: 6px 8px;
      text-align: left;
    }

    .manual-markdown th {
      background: ${o.gray100};
      font-weight: 600;
    }

    .manual-markdown blockquote {
      border-left: 3px solid ${o.gray300};
      padding-left: 12px;
      margin: 8px 0;
      color: ${o.gray500};
    }

    .manual-markdown img {
      max-width: 100%;
      height: auto;
    }

    .manual-markdown hr {
      border: none;
      border-top: 1px solid ${o.gray200};
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
      border: 2px dashed ${o.gray300};
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
      background: ${o.white};
    }

    .debug-dropzone:hover {
      border-color: ${o.primary};
      background: ${o.gray100};
    }

    .debug-dropzone.dragging {
      border-color: ${o.primary};
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
      border: 1px solid ${o.gray200};
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
      color: ${o.white};
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
      color: ${o.white};
      font-size: 9px;
      text-align: center;
    }

    /* 管理タブ: ビュー切り替え */
    .debug-manage-toolbar {
      padding-bottom: 8px;
      border-bottom: 1px solid ${o.gray200};
    }

    .debug-view-toggle {
      display: flex;
      gap: 4px;
      background: ${o.gray100};
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
      color: ${o.gray500};
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-view-btn:hover {
      color: ${o.gray700};
    }

    .debug-view-btn.active {
      background: ${o.white};
      color: ${o.primary};
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
      background: ${o.primary};
      color: ${o.white};
      font-size: 10px;
      font-weight: 600;
    }

    .debug-view-btn.active .debug-view-badge {
      background: ${o.secondary};
      color: ${o.gray900};
    }

    /* 確認手順ビュー */
    .debug-checklist-view {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .debug-checklist-card {
      border: 1px solid ${o.gray200};
      border-radius: 8px;
      overflow: hidden;
    }

    .debug-checklist-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: ${o.gray100};
      border-bottom: 1px solid ${o.gray200};
    }

    .debug-checklist-title {
      font-size: 13px;
      font-weight: 600;
      color: ${o.gray900};
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
      color: ${o.gray700};
      cursor: pointer;
      transition: background 0.1s;
      line-height: 1.4;
    }

    .debug-checklist-item:hover {
      background: ${o.gray100};
    }

    .debug-checklist-item input[type="checkbox"] {
      margin-top: 2px;
      flex-shrink: 0;
      accent-color: ${o.primary};
    }

    .debug-checklist-done {
      text-decoration: line-through;
      color: ${o.gray500};
    }

    .debug-checklist-no-items {
      padding: 12px;
      font-size: 12px;
      color: ${o.gray500};
      text-align: center;
    }

    .debug-checklist-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-top: 1px solid ${o.gray200};
      background: ${o.gray100};
    }

    .debug-checklist-progress {
      font-size: 12px;
      color: ${o.gray500};
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .debug-btn-resolve {
      padding: 6px 12px;
      font-size: 12px;
      background: ${o.primary};
      color: ${o.white};
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.15s;
    }

    .debug-btn-resolve:hover:not(:disabled) {
      background: ${o.primaryHover};
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
function At({
  apiBaseUrl: s,
  env: a = "dev",
  onSave: i,
  onClose: u,
  initialSize: f = { width: 400, height: 500 },
  testCases: C,
  logCapture: F,
  manualItems: M,
  manualDefaultPath: P,
  onManualNavigate: Q,
  onManualAppNavigate: c
}) {
  var ze;
  const [w, T] = m(null), [_, A] = m(null), [q, l] = m(!1), b = ce(!1), [g, R] = m("record"), p = C && C.length > 0, W = M && M.length > 0, [B, Y] = m(""), [ne, te] = m(""), [G, L] = m(""), [Z, h] = m(!1), [S, x] = m(!1), [D, z] = m(!1), [v, n] = m(!1), [$, I] = m(!1), [j, V] = m([]), [U, O] = m(null), [X, d] = m(!1), E = ce(null);
  re(() => {
    s && He(s);
  }, [s]);
  const { notes: ee, createNote: ae, updateStatus: fe, refresh: be, error: ke } = Oe(a), Se = ce(ke);
  Se.current = ke;
  const Ce = H(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported"), l(!0);
      return;
    }
    if (!b.current) {
      b.current = !0;
      try {
        const N = await window.documentPictureInPicture.requestWindow({
          width: f.width,
          height: f.height
        }), le = N.document.createElement("style");
        le.textContent = ot(), N.document.head.appendChild(le);
        const xe = N.document.createElement("div");
        xe.id = "debug-panel-root", N.document.body.appendChild(xe), T(N), A(xe), l(!0), N.addEventListener("pagehide", () => {
          T(null), A(null), l(!1), u == null || u();
        });
      } catch (N) {
        console.error("Failed to open PiP window:", N), l(!0);
      } finally {
        b.current = !1;
      }
    }
  }, [f.width, f.height, u]), Fe = H(() => {
    w ? w.close() : (l(!1), u == null || u());
  }, [w, u]), me = ce(w);
  me.current = w, re(() => () => {
    var N;
    (N = me.current) == null || N.close();
  }, []);
  const r = H(() => {
    Y(""), te(""), L(""), V([]), x(!1), z(!1), n(!1), I(!1), O(null);
  }, []), y = H(async () => {
    var Be;
    if (!B.trim()) {
      O({ type: "error", text: "内容は必須です" });
      return;
    }
    h(!0), O(null);
    const le = ((F == null ? void 0 : F.getNetworkLogs()) ?? []).map((K) => {
      const pe = {
        timestamp: K.timestamp,
        method: K.method,
        url: K.url,
        status: K.status
      }, Te = ["POST", "PUT", "DELETE", "PATCH"].includes(K.method);
      return Te && (K.requestBody !== void 0 && (pe.requestBody = K.requestBody), K.responseBody !== void 0 && (pe.responseBody = K.responseBody)), !Te && D && K.responseBody !== void 0 && (pe.responseBody = K.responseBody), v && K.duration != null && (pe.duration = K.duration), $ && (K.requestHeaders && (pe.requestHeaders = K.requestHeaders), K.responseHeaders && (pe.responseHeaders = K.responseHeaders)), pe;
    }), xe = {
      content: B.trim(),
      userLog: ne ? Je(ne) : void 0,
      severity: G || void 0,
      consoleLogs: F == null ? void 0 : F.getConsoleLogs(),
      networkLogs: le.length > 0 ? le : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, ye = await ae(xe);
    if (ye) {
      if (j.length > 0)
        try {
          for (const K of j)
            await ie.uploadAttachment(a, ye.id, K);
        } catch (K) {
          console.warn("Failed to upload some attachments:", K), O({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), h(!1);
          return;
        }
      O({ type: "success", text: "保存しました" }), i == null || i(ye), setTimeout(() => {
        r();
      }, 1500);
    } else
      O({ type: "error", text: ((Be = Se.current) == null ? void 0 : Be.message) || "保存に失敗しました" });
    h(!1);
  }, [B, ne, G, j, D, v, $, ae, i, r, F, a]), J = H(async () => {
    var N;
    d(!0);
    try {
      g === "manage" ? be() : g === "test" && await ((N = E.current) == null ? void 0 : N.refresh());
    } finally {
      d(!1);
    }
  }, [g, be]), oe = /* @__PURE__ */ t("div", { className: "debug-panel", children: [
    /* @__PURE__ */ t("header", { className: "debug-header", children: [
      /* @__PURE__ */ t("div", { className: "debug-header-left", children: [
        /* @__PURE__ */ e("span", { className: "debug-icon", children: "edit_note" }),
        /* @__PURE__ */ e("span", { className: "debug-title", children: "デバッグノート" }),
        /* @__PURE__ */ e("span", { className: "debug-env", children: a })
      ] }),
      /* @__PURE__ */ t("div", { className: "debug-header-right", children: [
        g !== "record" && /* @__PURE__ */ e(
          "button",
          {
            className: "debug-refresh-btn",
            onClick: J,
            disabled: X,
            title: "データを更新",
            children: /* @__PURE__ */ e(
              "span",
              {
                className: "debug-icon",
                style: {
                  fontSize: "18px",
                  animation: X ? "spin 0.6s linear infinite" : "none"
                },
                children: "sync"
              }
            )
          }
        ),
        /* @__PURE__ */ e("button", { onClick: Fe, className: "debug-close-btn", "aria-label": "閉じる", children: /* @__PURE__ */ e("span", { className: "debug-icon", children: "close" }) })
      ] })
    ] }),
    /* @__PURE__ */ t("nav", { className: "debug-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${g === "record" ? "active" : ""}`,
          onClick: () => {
            R("record"), O(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${g === "manage" ? "active" : ""}`,
          onClick: () => R("manage"),
          children: "管理"
        }
      ),
      p && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${g === "test" ? "active" : ""}`,
          onClick: () => R("test"),
          children: "テスト"
        }
      ),
      W && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${g === "manual" ? "active" : ""}`,
          onClick: () => R("manual"),
          children: "マニュアル"
        }
      )
    ] }),
    /* @__PURE__ */ t("main", { className: "debug-content", children: [
      g === "record" && /* @__PURE__ */ t(he, { children: [
        U && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${U.type}`, children: U.text }),
        /* @__PURE__ */ t("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-severity", children: "重要度（任意）" }),
          /* @__PURE__ */ t(
            "select",
            {
              id: "debug-severity",
              value: G,
              onChange: (N) => L(N.target.value),
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
        /* @__PURE__ */ t("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-content", children: "内容 *" }),
          /* @__PURE__ */ e(
            "textarea",
            {
              id: "debug-content",
              value: B,
              onChange: (N) => Y(N.target.value),
              placeholder: "詳細な説明",
              rows: 4,
              maxLength: 4e3
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-log", children: "補足メモ（任意）" }),
          /* @__PURE__ */ e(
            "textarea",
            {
              id: "debug-log",
              value: ne,
              onChange: (N) => te(N.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          Pe,
          {
            files: j,
            onAdd: (N) => V((le) => [...le, ...N]),
            onRemove: (N) => V((le) => le.filter((xe, ye) => ye !== N)),
            disabled: Z,
            pipDocument: ((ze = me.current) == null ? void 0 : ze.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            onClick: () => x(!S),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: S ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        S && /* @__PURE__ */ t("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ t("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: D,
                onChange: (N) => z(N.target.checked)
              }
            ),
            "GETレスポンスを含める"
          ] }),
          /* @__PURE__ */ t("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: v,
                onChange: (N) => n(N.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ t("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: $,
                onChange: (N) => I(N.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      g === "manage" && /* @__PURE__ */ e(nt, { notes: ee, updateStatus: fe }),
      g === "manual" && W && /* @__PURE__ */ e(
        rt,
        {
          items: M,
          defaultPath: P,
          onNavigate: Q,
          onAppNavigate: c
        }
      ),
      g === "test" && p && /* @__PURE__ */ e(
        it,
        {
          ref: E,
          testCases: C,
          env: a,
          logCapture: F,
          onNotesRefresh: be
        }
      )
    ] }),
    g === "record" && /* @__PURE__ */ t("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: r, className: "debug-btn debug-btn-secondary", disabled: Z, children: "クリア" }),
      /* @__PURE__ */ e("button", { onClick: y, className: "debug-btn debug-btn-primary", disabled: Z, children: Z ? /* @__PURE__ */ t("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
  return _ ? Ge(oe, _) : q ? /* @__PURE__ */ e("div", { style: Ne.overlay, children: /* @__PURE__ */ e("div", { style: Ne.panel, children: oe }) }) : /* @__PURE__ */ e("button", { onClick: Ce, style: at, "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ t("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
    "バグ",
    /* @__PURE__ */ e("br", {}),
    "記録"
  ] }) });
}
function se({ size: s = 16, color: a }) {
  return /* @__PURE__ */ t(he, { children: [
    /* @__PURE__ */ e(
      "span",
      {
        role: "status",
        "aria-label": "読み込み中",
        style: {
          display: "inline-block",
          width: `${s}px`,
          height: `${s}px`,
          border: `2px solid ${a || "currentColor"}30`,
          borderTopColor: a || "currentColor",
          borderRadius: "50%",
          animation: "debug-notes-spin 0.6s linear infinite"
        }
      }
    ),
    /* @__PURE__ */ e("style", { children: "@keyframes debug-notes-spin { to { transform: rotate(360deg); } }" })
  ] });
}
function k({ name: s, size: a = 20, color: i }) {
  return /* @__PURE__ */ e(
    "span",
    {
      className: "material-symbols-outlined",
      style: {
        fontSize: `${a}px`,
        color: i,
        lineHeight: 1,
        verticalAlign: "middle"
      },
      children: s
    }
  );
}
const st = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, lt = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function dt({ domains: s, colors: a, isDarkMode: i }) {
  const u = i ? lt : st;
  return s.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "40px",
    textAlign: "center",
    color: a.textMuted,
    fontSize: "14px"
  }, children: "テストケースが登録されていません" }) : /* @__PURE__ */ t("div", { style: { marginBottom: "32px" }, children: [
    /* @__PURE__ */ e("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: a.textSecondary,
      marginBottom: "16px"
    }, children: "テスト概要" }),
    /* @__PURE__ */ e("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "16px"
    }, children: s.map((f) => /* @__PURE__ */ e(
      ct,
      {
        domain: f,
        colors: a,
        tc: u
      },
      f.domain
    )) }),
    /* @__PURE__ */ t("div", { style: {
      display: "flex",
      gap: "20px",
      marginTop: "16px",
      fontSize: "12px",
      color: a.textMuted
    }, children: [
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: u.passed
        } }),
        "passed"
      ] }),
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: u.fail
        } }),
        "fail / 要対応"
      ] }),
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: u.retest
        } }),
        "retest"
      ] }),
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: u.untested
        } }),
        "未テスト"
      ] })
    ] })
  ] });
}
function ct({ domain: s, colors: a, tc: i }) {
  return /* @__PURE__ */ t("div", { style: {
    background: a.bg,
    border: `1px solid ${a.border}`,
    borderRadius: "12px",
    padding: "20px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
      fontSize: "15px",
      fontWeight: 700,
      color: a.text,
      marginBottom: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ e("span", { children: s.domain }),
      /* @__PURE__ */ t("span", { style: {
        fontSize: "12px",
        fontWeight: 500,
        color: a.textMuted
      }, children: [
        s.passed,
        "/",
        s.total
      ] })
    ] }),
    /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: s.capabilities.map((u) => /* @__PURE__ */ e(
      pt,
      {
        cap: u,
        colors: a,
        tc: i
      },
      u.capability
    )) })
  ] });
}
function pt({ cap: s, colors: a, tc: i }) {
  const u = s.status === "fail" ? i.fail : s.status === "retest" ? i.retest : s.status === "passed" ? i.passed : i.untested, f = s.status === "fail" ? i.failBg : s.status === "retest" ? i.retestBg : s.status === "passed" ? i.passedBg : i.untestedBg;
  return /* @__PURE__ */ t("div", { style: {
    borderLeft: `4px solid ${u}`,
    background: f,
    borderRadius: "0 8px 8px 0",
    padding: "10px 12px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    }, children: [
      /* @__PURE__ */ e("span", { style: {
        fontSize: "13px",
        fontWeight: 500,
        color: a.text
      }, children: s.capability }),
      /* @__PURE__ */ t("span", { style: {
        fontSize: "12px",
        color: a.textMuted
      }, children: [
        s.passed,
        "/",
        s.total
      ] })
    ] }),
    /* @__PURE__ */ t("div", { style: {
      display: "flex",
      height: "8px",
      borderRadius: "4px",
      overflow: "hidden",
      background: i.untested
    }, children: [
      s.passed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${s.passed / s.total * 100}%`,
        background: i.passed
      } }),
      s.failed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${s.failed / s.total * 100}%`,
        background: i.fail
      } })
    ] })
  ] });
}
const gt = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, ut = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function xt({ tree: s, colors: a, isDarkMode: i, onNavigateToNote: u }) {
  const f = i ? ut : gt, [C, F] = m(/* @__PURE__ */ new Set()), [M, P] = m(/* @__PURE__ */ new Set());
  re(() => {
    F((l) => {
      const b = new Set(l);
      return s.forEach((g) => b.add(g.domain)), b;
    });
  }, [s]);
  const [Q, c] = m("all"), [w, T] = m(!1), _ = (l) => {
    F((b) => {
      const g = new Set(b);
      return g.has(l) ? g.delete(l) : g.add(l), g;
    });
  }, A = (l) => {
    P((b) => {
      const g = new Set(b);
      return g.has(l) ? g.delete(l) : g.add(l), g;
    });
  }, q = we(() => s.map((l) => {
    const b = l.capabilities.filter((g) => {
      const R = g.passed === g.total && g.total > 0, p = g.failed > 0 || g.openIssues > 0, W = g.passed < g.total;
      return !(Q === "passed" && !R || Q === "fail" && !p || Q === "incomplete" && !W || w && R && g.openIssues === 0);
    });
    return b.length === 0 ? null : { ...l, capabilities: b };
  }).filter((l) => l !== null), [s, Q, w]);
  return s.length === 0 ? null : /* @__PURE__ */ t("div", { children: [
    /* @__PURE__ */ e("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: a.textSecondary,
      marginBottom: "16px"
    }, children: "詳細" }),
    /* @__PURE__ */ t("div", { style: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "16px"
    }, children: [
      /* @__PURE__ */ t(
        "select",
        {
          value: Q,
          onChange: (l) => c(l.target.value),
          style: {
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: a.bgSecondary,
            color: a.text,
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
      /* @__PURE__ */ t("label", { style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
        color: a.textSecondary,
        cursor: "pointer"
      }, children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: w,
            onChange: (l) => T(l.target.checked),
            style: { accentColor: a.primary }
          }
        ),
        "要対応のみ"
      ] })
    ] }),
    /* @__PURE__ */ t("div", { style: {
      border: `1px solid ${a.border}`,
      borderRadius: "12px",
      overflow: "hidden"
    }, children: [
      q.map((l, b) => {
        const g = C.has(l.domain), R = l.capabilities.reduce((B, Y) => B + Y.total, 0), p = l.capabilities.reduce((B, Y) => B + Y.passed, 0), W = R > 0 ? Math.round(p / R * 100) : 0;
        return /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ t(
            "div",
            {
              onClick: () => _(l.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: a.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${a.border}`,
                borderTop: b > 0 ? `1px solid ${a.border}` : "none",
                gap: "8px",
                userSelect: "none"
              },
              children: [
                /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: a.textMuted, width: "16px" }, children: g ? "▼" : "▶" }),
                /* @__PURE__ */ e("span", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: a.text,
                  flex: 1
                }, children: l.domain }),
                /* @__PURE__ */ t("span", { style: {
                  fontSize: "13px",
                  color: a.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  p,
                  "/",
                  R,
                  " ",
                  W,
                  "%"
                ] })
              ]
            }
          ),
          g && l.capabilities.map((B) => {
            const Y = `${l.domain}/${B.capability}`, ne = M.has(Y), te = B.passed === B.total && B.total > 0, G = B.cases.some((D) => D.last === "fail" && D.openIssues > 0), L = B.cases.some((D) => D.last === "fail" && D.openIssues === 0), Z = !G && L, h = G, S = te ? "●" : h ? "▲" : Z ? "◆" : "○", x = te ? f.passed : h ? f.fail : Z ? f.retest : f.untested;
            return /* @__PURE__ */ t("div", { children: [
              /* @__PURE__ */ t(
                "div",
                {
                  onClick: () => A(Y),
                  style: {
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px 10px 44px",
                    background: a.bg,
                    cursor: "pointer",
                    borderBottom: `1px solid ${a.borderLight}`,
                    gap: "8px",
                    userSelect: "none"
                  },
                  children: [
                    /* @__PURE__ */ e("span", { style: { color: x, fontSize: "14px", width: "16px" }, children: S }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: a.text,
                      flex: 1
                    }, children: B.capability }),
                    /* @__PURE__ */ t("span", { style: {
                      fontSize: "12px",
                      color: a.textMuted,
                      fontVariantNumeric: "tabular-nums"
                    }, children: [
                      B.passed,
                      "/",
                      B.total
                    ] }),
                    te && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: f.passed,
                      fontWeight: 600
                    }, children: "passed" }),
                    h && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: f.fail,
                      fontWeight: 600
                    }, children: "fail" }),
                    Z && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: f.retest,
                      fontWeight: 600
                    }, children: "retest" }),
                    B.openIssues > 0 && /* @__PURE__ */ t("span", { style: {
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${f.fail}18`,
                      color: f.fail,
                      fontWeight: 600
                    }, children: [
                      B.openIssues,
                      "件"
                    ] })
                  ]
                }
              ),
              ne && B.cases.map((D) => /* @__PURE__ */ e(
                ht,
                {
                  c: D,
                  tc: f,
                  colors: a,
                  onNavigateToNote: u
                },
                D.caseId
              ))
            ] }, Y);
          })
        ] }, l.domain);
      }),
      q.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: a.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function ht({ c: s, tc: a, colors: i, onNavigateToNote: u }) {
  const f = s.last === "fail" && s.openIssues === 0, C = s.last === "pass" ? "●" : f ? "◆" : s.last === "fail" ? "▲" : "○", F = s.last === "pass" ? a.passed : f ? a.retest : s.last === "fail" ? a.fail : a.untested;
  return /* @__PURE__ */ t("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: i.bg,
    borderBottom: `1px solid ${i.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: F, fontSize: "12px", width: "16px" }, children: C }),
    /* @__PURE__ */ e("span", { style: { color: i.text, flex: 1 }, children: s.title }),
    /* @__PURE__ */ e("span", { style: {
      fontSize: "11px",
      color: i.textMuted
    }, children: s.last || "-" }),
    s.openIssues > 0 && /* @__PURE__ */ t(
      "button",
      {
        onClick: (M) => {
          M.stopPropagation(), u(s.caseId);
        },
        style: {
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "10px",
          background: `${a.fail}18`,
          color: i.link,
          fontWeight: 600,
          border: "none",
          cursor: "pointer"
        },
        children: [
          s.openIssues,
          "件"
        ]
      }
    )
  ] });
}
const ft = 3e4;
function bt({ env: s, colors: a, isDarkMode: i, onNavigateToNote: u, refreshKey: f }) {
  const [C, F] = m([]), [M, P] = m(!0), [Q, c] = m(null), w = ce(0);
  re(() => {
    let _ = !1;
    const A = ++w.current, q = async () => {
      try {
        const b = await ie.getTestTree(s);
        !_ && w.current === A && (F(b), c(null));
      } catch (b) {
        !_ && w.current === A && c(b instanceof Error ? b.message : "Failed to fetch test tree");
      } finally {
        !_ && w.current === A && P(!1);
      }
    };
    P(!0), q();
    const l = setInterval(q, ft);
    return () => {
      _ = !0, clearInterval(l);
    };
  }, [s, f]);
  const T = we(() => C.map((_) => {
    let A = 0, q = 0, l = 0, b = !1;
    const g = _.capabilities.map((p) => {
      const W = p.total - p.passed - p.failed;
      A += p.total, q += p.passed, l += p.failed, (p.failed > 0 || p.openIssues > 0) && (b = !0);
      const B = p.passed === p.total && p.total > 0, Y = p.cases.some((G) => G.last === "fail" && G.openIssues > 0), ne = p.cases.some((G) => G.last === "fail" && G.openIssues === 0), te = B ? "passed" : Y ? "fail" : ne ? "retest" : "incomplete";
      return {
        capability: p.capability,
        total: p.total,
        passed: p.passed,
        failed: p.failed,
        untested: W < 0 ? 0 : W,
        openIssues: p.openIssues,
        status: te,
        cases: p.cases
      };
    }), R = A - q - l;
    return {
      domain: _.domain,
      total: A,
      passed: q,
      failed: l,
      untested: R < 0 ? 0 : R,
      hasIssues: b,
      capabilities: g
    };
  }), [C]);
  return M && C.length === 0 ? /* @__PURE__ */ t("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    color: a.textMuted,
    gap: "12px"
  }, children: [
    /* @__PURE__ */ e(se, { size: 24, color: a.primary }),
    /* @__PURE__ */ e("span", { style: { fontSize: "14px" }, children: "テストデータを読み込み中..." })
  ] }) : Q && C.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "24px",
    background: a.errorBg,
    color: a.error,
    borderRadius: "12px",
    margin: "24px",
    fontSize: "13px"
  }, children: Q }) : /* @__PURE__ */ e("div", { style: {
    padding: "32px",
    overflow: "auto",
    flex: 1
  }, children: /* @__PURE__ */ t("div", { style: { maxWidth: "1200px" }, children: [
    /* @__PURE__ */ e(
      dt,
      {
        domains: T,
        colors: a,
        isDarkMode: i
      }
    ),
    /* @__PURE__ */ e(
      xt,
      {
        tree: C,
        colors: a,
        isDarkMode: i,
        onNavigateToNote: u
      }
    )
  ] }) });
}
const $e = {
  bug: { label: "不具合", icon: "bug_report" },
  question: { label: "質問", icon: "help" },
  request: { label: "要望", icon: "lightbulb" },
  share: { label: "共有", icon: "share" },
  other: { label: "その他", icon: "more_horiz" }
}, mt = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, Re = {
  app: "アプリ",
  manual: "マニュアル"
}, _e = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function We(s) {
  const a = mt[s] ?? "#6B7280";
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: `${a}15`,
    color: a,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function Le(s, a) {
  let i, u;
  switch (s) {
    case "open":
      i = a.warningBg, u = a.warning;
      break;
    case "in_progress":
      i = a.primaryLight, u = a.primary;
      break;
    case "closed":
      i = a.successBg, u = a.success;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: i,
    color: u,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function yt({ apiBaseUrl: s, adminKey: a, colors: i, isDarkMode: u, refreshKey: f }) {
  var U, O, X;
  const {
    feedbacks: C,
    total: F,
    page: M,
    limit: P,
    loading: Q,
    error: c,
    filters: w,
    customTags: T,
    setFilters: _,
    setPage: A,
    updateStatus: q,
    remove: l,
    refresh: b
  } = Ye({ apiBaseUrl: s, adminKey: a }), [g, R] = m(null), [p, W] = m(null), [B, Y] = m(!1), [ne, te] = m(null), [G, L] = m(null), Z = ce(0), h = ce(f);
  re(() => {
    f !== h.current && (h.current = f, b());
  }, [f, b]);
  const S = Math.max(1, Math.ceil(F / P)), x = H(async (d) => {
    if (g === d) return;
    R(d), Y(!0), W(null);
    const E = ++Z.current;
    try {
      const ee = await Ze({ apiBaseUrl: s, adminKey: a, id: d });
      if (Z.current !== E) return;
      W(ee);
    } catch {
      if (Z.current !== E) return;
      W(null);
    }
    Z.current === E && Y(!1);
  }, [g, s, a]), D = H(async (d, E) => {
    await q(d, E) && (p == null ? void 0 : p.id) === d && W((ae) => ae ? { ...ae, status: E } : null);
  }, [q, p == null ? void 0 : p.id]), z = H(async (d) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await l(d) && g === d && (R(null), W(null));
  }, [l, g]), v = H(async (d, E) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await Xe({ apiBaseUrl: s, adminKey: a, feedbackId: d, attachmentId: E }), W((ee) => {
          var ae;
          return !ee || ee.id !== d ? ee : {
            ...ee,
            attachments: (ae = ee.attachments) == null ? void 0 : ae.filter((fe) => fe.id !== E)
          };
        });
      } catch (ee) {
        console.error("Failed to delete attachment:", ee);
      }
  }, [s, a]), n = H((d) => {
    try {
      const E = new URL(s);
      return `${E.origin}${E.pathname.replace(/\/$/, "")}/attachments/${d}`;
    } catch {
      return `${s}/attachments/${d}`;
    }
  }, [s]), $ = H(async (d) => {
    L(d);
    try {
      await et({ apiBaseUrl: s, adminKey: a, format: d });
    } catch (E) {
      console.error("Export failed:", E);
    } finally {
      L(null);
    }
  }, [s, a]), I = {
    open: C.filter((d) => d.status === "open").length,
    inProgress: C.filter((d) => d.status === "in_progress").length,
    closed: C.filter((d) => d.status === "closed").length
  }, j = u ? "#0D1117" : "#1E293B", V = u ? "#21262D" : "#2D3748";
  return /* @__PURE__ */ t("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
    /* @__PURE__ */ t("aside", { style: {
      width: "380px",
      borderRight: `1px solid ${i.border}`,
      display: "flex",
      flexDirection: "column",
      background: i.bgSecondary
    }, children: [
      /* @__PURE__ */ t("div", { style: {
        padding: "16px",
        display: "flex",
        gap: "10px",
        borderBottom: `1px solid ${i.border}`,
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ t(
          "select",
          {
            value: w.status,
            onChange: (d) => _({ status: d.target.value }),
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
              _e.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
            ]
          }
        ),
        /* @__PURE__ */ t(
          "select",
          {
            value: w.kind,
            onChange: (d) => _({ kind: d.target.value }),
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
        /* @__PURE__ */ t(
          "select",
          {
            value: w.target,
            onChange: (d) => _({ target: d.target.value }),
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
        T.length > 0 && /* @__PURE__ */ t(
          "select",
          {
            value: w.customTag,
            onChange: (d) => _({ customTag: d.target.value }),
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
              T.map((d) => /* @__PURE__ */ e("option", { value: d, children: d }, d))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ t("div", { style: { flex: 1, overflow: "auto", padding: "12px" }, children: [
        Q && /* @__PURE__ */ t("div", { style: { padding: "40px", textAlign: "center", color: i.textMuted }, children: [
          /* @__PURE__ */ e(se, { size: 24, color: i.primary }),
          /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
        ] }),
        c && /* @__PURE__ */ e("div", { style: {
          padding: "16px",
          background: i.errorBg,
          color: i.error,
          borderRadius: "12px",
          margin: "8px",
          fontSize: "13px"
        }, children: c.message }),
        !Q && C.length === 0 && /* @__PURE__ */ t("div", { style: { padding: "40px", textAlign: "center", color: i.textMuted }, children: [
          /* @__PURE__ */ e(k, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        C.map((d) => {
          const E = $e[d.kind] ?? { label: d.kind, icon: "help" }, ee = g === d.id;
          return /* @__PURE__ */ t(
            "div",
            {
              style: {
                padding: "16px",
                background: i.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: ee ? `2px solid ${i.primary}` : "2px solid transparent",
                boxShadow: ee ? `0 4px 12px ${i.primary}30` : `0 1px 3px ${i.border}`,
                transition: "all 0.2s"
              },
              onClick: () => x(d.id),
              children: [
                /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ t("span", { style: { fontSize: "11px", color: i.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    d.id
                  ] }),
                  /* @__PURE__ */ t("span", { style: We(d.kind), children: [
                    /* @__PURE__ */ e(k, { name: E.icon, size: 12 }),
                    E.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: Le(d.status, i), children: d.status === "open" ? "Open" : d.status === "in_progress" ? "対応中" : "完了" }),
                  d.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: i.bgTertiary,
                    color: i.textSecondary,
                    fontWeight: 500
                  }, children: Re[d.target] ?? d.target }),
                  d.customTag && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${i.primary}15`,
                    color: i.primary,
                    fontWeight: 500
                  }, children: d.customTag })
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
                }, children: d.message.split(`
`)[0].slice(0, 80) }),
                /* @__PURE__ */ t("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: i.textMuted
                }, children: [
                  /* @__PURE__ */ e("span", { children: vt(d.createdAt) }),
                  d.pageUrl && /* @__PURE__ */ t(he, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ t("span", { style: {
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
                      /* @__PURE__ */ e(k, { name: "link", size: 12 }),
                      d.pageUrl
                    ] })
                  ] }),
                  (d.attachmentCount ?? 0) > 0 && /* @__PURE__ */ t(he, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ t("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "11px",
                      color: i.textMuted
                    }, children: [
                      /* @__PURE__ */ e(k, { name: "image", size: 12 }),
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
      S > 1 && /* @__PURE__ */ t("div", { style: {
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
            onClick: () => A(M - 1),
            disabled: M <= 1,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: i.bg,
              color: M <= 1 ? i.textMuted : i.text,
              cursor: M <= 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: /* @__PURE__ */ e(k, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ t("span", { style: { fontSize: "13px", color: i.textSecondary }, children: [
          M,
          " / ",
          S
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => A(M + 1),
            disabled: M >= S,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: i.bg,
              color: M >= S ? i.textMuted : i.text,
              cursor: M >= S ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: /* @__PURE__ */ e(k, { name: "chevron_right", size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ t("div", { style: {
        padding: "16px",
        borderTop: `1px solid ${i.border}`,
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        fontSize: "12px",
        color: i.textMuted
      }, children: [
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(k, { name: "description", size: 16 }),
          F,
          " 件"
        ] }),
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(k, { name: "error", size: 16, color: i.warning }),
          I.open,
          " Open"
        ] }),
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(k, { name: "pending", size: 16, color: i.primary }),
          I.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(k, { name: "check_circle", size: 16, color: i.success }),
          I.closed,
          " 完了"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("main", { style: {
      flex: 1,
      overflow: "auto",
      padding: "32px",
      background: i.bg
    }, children: [
      g && B && /* @__PURE__ */ t("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: i.textMuted }, children: [
        /* @__PURE__ */ e(se, { size: 32, color: i.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      g && !B && p && /* @__PURE__ */ t("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ t("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ t("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ t("span", { style: We(p.kind), children: [
                /* @__PURE__ */ e(k, { name: ((U = $e[p.kind]) == null ? void 0 : U.icon) ?? "help", size: 14 }),
                ((O = $e[p.kind]) == null ? void 0 : O.label) ?? p.kind
              ] }),
              /* @__PURE__ */ e("span", { style: Le(p.status, i), children: p.status === "open" ? "Open" : p.status === "in_progress" ? "対応中" : "完了" }),
              p.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: i.bgTertiary,
                color: i.textSecondary,
                fontWeight: 500
              }, children: Re[p.target] ?? p.target }),
              p.customTag && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: `${i.primary}15`,
                color: i.primary,
                fontWeight: 600
              }, children: p.customTag })
            ] }),
            /* @__PURE__ */ t("h2", { style: {
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: i.text,
              lineHeight: 1.3,
              letterSpacing: "-0.025em"
            }, children: [
              "#",
              p.id,
              " フィードバック"
            ] })
          ] }),
          /* @__PURE__ */ t("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ e(
              "select",
              {
                value: p.status,
                onChange: (d) => D(p.id, d.target.value),
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
                children: _e.map((d) => /* @__PURE__ */ e("option", { value: d.value, children: d.label }, d.value))
              }
            ),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: () => z(p.id),
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
                  /* @__PURE__ */ e(k, { name: "delete", size: 16 }),
                  "削除"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ t("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ e(ge, { icon: "category", label: "種別", value: ((X = $e[p.kind]) == null ? void 0 : X.label) ?? p.kind, colors: i }),
          /* @__PURE__ */ e(ge, { icon: "ads_click", label: "対象", value: p.target ? Re[p.target] ?? p.target : "-", colors: i }),
          /* @__PURE__ */ e(ge, { icon: "schedule", label: "日時", value: wt(p.createdAt), colors: i }),
          p.pageUrl && /* @__PURE__ */ e(ge, { icon: "link", label: "URL", value: p.pageUrl, isLink: !0, colors: i }),
          p.userType && /* @__PURE__ */ e(ge, { icon: "person", label: "ユーザー", value: p.userType, colors: i }),
          p.appVersion && /* @__PURE__ */ e(ge, { icon: "inventory_2", label: "バージョン", value: p.appVersion, colors: i })
        ] }),
        /* @__PURE__ */ e(ve, { icon: "chat", title: "メッセージ", colors: i, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: i.text
        }, children: p.message }) }),
        p.environment && Object.keys(p.environment).length > 0 && /* @__PURE__ */ e(ve, { icon: "devices", title: "環境情報", colors: i, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: Object.entries(p.environment).map(([d, E]) => /* @__PURE__ */ e(ge, { icon: "info", label: d, value: String(E), colors: i }, d)) }) }),
        p.consoleLogs && p.consoleLogs.length > 0 && /* @__PURE__ */ e(ve, { icon: "terminal", title: `コンソールログ (${p.consoleLogs.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: j }, children: p.consoleLogs.map((d, E) => /* @__PURE__ */ t("div", { style: {
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
        p.networkLogs && p.networkLogs.length > 0 && /* @__PURE__ */ e(ve, { icon: "wifi", title: `ネットワークログ (${p.networkLogs.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: j }, children: p.networkLogs.map((d, E) => /* @__PURE__ */ t("div", { style: {
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
        p.attachments && p.attachments.length > 0 && /* @__PURE__ */ e(ve, { icon: "image", title: `添付画像 (${p.attachments.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: {
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }, children: p.attachments.map((d) => /* @__PURE__ */ t("div", { style: {
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
              src: n(d.filename),
              alt: d.original_name,
              style: {
                width: "100%",
                height: "100px",
                objectFit: "cover",
                cursor: "pointer",
                display: "block"
              },
              onClick: () => te(n(d.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => v(p.id, d.id),
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
              children: /* @__PURE__ */ e(k, { name: "close", size: 14 })
            }
          ),
          /* @__PURE__ */ e("div", { style: {
            padding: "6px 8px",
            fontSize: "11px",
            color: i.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: d.original_name })
        ] }, d.id)) }) }),
        ne && /* @__PURE__ */ e(
          "div",
          {
            onClick: () => te(null),
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
                src: ne,
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
      g && !B && !p && /* @__PURE__ */ t("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: i.textMuted }, children: [
        /* @__PURE__ */ e(k, { name: "error_outline", size: 48 }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px", fontSize: "16px" }, children: "詳細の取得に失敗しました" })
      ] }),
      !g && /* @__PURE__ */ t("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: i.textMuted,
        gap: "24px"
      }, children: [
        /* @__PURE__ */ t("div", { style: {
          padding: "24px 32px",
          background: i.bgSecondary,
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%"
        }, children: [
          /* @__PURE__ */ t("div", { style: {
            fontSize: "14px",
            fontWeight: 600,
            color: i.textSecondary,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }, children: [
            /* @__PURE__ */ e(k, { name: "analytics", size: 18 }),
            "フィードバック概要"
          ] }),
          /* @__PURE__ */ t("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "13px",
            color: i.textSecondary,
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.text }, children: F }),
              " 件"
            ] }),
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.warning }, children: I.open }),
              " Open"
            ] }),
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.primary }, children: I.inProgress }),
              " 対応中"
            ] }),
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.success }, children: I.closed }),
              " 完了"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }, children: ["json", "csv", "sqlite"].map((d) => /* @__PURE__ */ t(
            "button",
            {
              onClick: () => $(d),
              disabled: G !== null,
              style: {
                padding: "8px 14px",
                background: i.bg,
                border: "none",
                borderRadius: "10px",
                cursor: G !== null ? "not-allowed" : "pointer",
                color: i.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: G !== null && G !== d ? 0.5 : 1,
                boxShadow: `0 1px 3px ${i.border}`,
                transition: "all 0.2s"
              },
              children: [
                G === d ? /* @__PURE__ */ e(se, { size: 14, color: i.text }) : /* @__PURE__ */ e(k, { name: "download", size: 16 }),
                d.toUpperCase()
              ]
            },
            d
          )) })
        ] }),
        /* @__PURE__ */ t("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ e(k, { name: "arrow_back", size: 48 }),
          /* @__PURE__ */ e("div", { style: { fontSize: "16px", fontWeight: 500, marginTop: "12px" }, children: "フィードバックを選択してください" }),
          /* @__PURE__ */ e("div", { style: { fontSize: "13px", marginTop: "6px" }, children: "左のリストから選択すると詳細が表示されます" })
        ] })
      ] })
    ] })
  ] });
}
function ge({ icon: s, label: a, value: i, isLink: u, colors: f }) {
  return /* @__PURE__ */ t("div", { style: {
    padding: "16px",
    background: f.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
      fontSize: "12px",
      color: f.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(k, { name: s, size: 16 }),
      a
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: u ? f.link : f.text,
      fontFamily: u ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: i })
  ] });
}
function ve({ icon: s, title: a, children: i, colors: u }) {
  return /* @__PURE__ */ t("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ t("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: u.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(k, { name: s, size: 18 }),
      a
    ] }),
    i
  ] });
}
function vt(s) {
  const a = new Date(s), i = a.getMonth() + 1, u = a.getDate(), f = a.getHours().toString().padStart(2, "0"), C = a.getMinutes().toString().padStart(2, "0");
  return `${i}/${u} ${f}:${C}`;
}
function wt(s) {
  return new Date(s).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const kt = {
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
}, St = {
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
}, zt = 3e4;
function Dt({ apiBaseUrl: s, env: a = "dev", feedbackApiBaseUrl: i, feedbackAdminKey: u }) {
  const [f, C] = m(""), [F, M] = m(""), [P, Q] = m(""), [c, w] = m(null), [T, _] = m(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [A, q] = m(!0), [l, b] = m(null), [g, R] = m("notes"), p = !!(i && u), [W, B] = m(null), [Y, ne] = m(0), [te, G] = m(null), [L, Z] = m(null), [h, S] = m(""), [x, D] = m(""), [z, v] = m(!1), n = T ? St : kt;
  re(() => {
    s && He(s);
  }, [s]), re(() => {
    if (typeof window > "u") return;
    const r = window.matchMedia("(prefers-color-scheme: dark)"), y = (J) => _(J.matches);
    return r.addEventListener("change", y), () => r.removeEventListener("change", y);
  }, []);
  const { notes: $, loading: I, error: j, updateStatus: V, updateSeverity: U, deleteNote: O, refresh: X } = Oe(a);
  re(() => {
    !I && l === "refresh" && b(null);
  }, [I, l]), re(() => {
    if (c) {
      const r = $.find((y) => y.id === c.id);
      w(r || null);
    }
  }, [$]), re(() => {
    if (!A) return;
    const r = setInterval(() => {
      X();
    }, zt);
    return () => clearInterval(r);
  }, [A, X]);
  const d = H((r) => {
    const J = `${s || Ue()}/export/${r}?env=${a}`;
    window.open(J, "_blank");
  }, [s, a]), E = H((r) => {
    B(r), C("open"), R("notes");
  }, []), ee = we(() => $.filter((r) => {
    if (f && r.status !== f || F && (r.source || "manual") !== F || W != null && !(r.test_case_ids ?? (r.test_case_id ? [r.test_case_id] : [])).includes(W))
      return !1;
    if (P) {
      const y = P.match(/^#([1-9]\d*)$/);
      if (y) {
        if (r.id !== Number(y[1])) return !1;
      } else {
        const J = P.toLowerCase();
        if (!r.title.toLowerCase().includes(J) && !r.content.toLowerCase().includes(J)) return !1;
      }
    }
    return !0;
  }), [$, f, F, W, P]), ae = H((r, y) => {
    y === "fixed" || y === "resolved" || y === "rejected" ? (Z({ id: r, status: y }), S("")) : (async () => {
      b(`status-${r}`);
      try {
        await V(r, y), (c == null ? void 0 : c.id) === r && w((J) => J ? { ...J, status: y } : null);
      } finally {
        b(null);
      }
    })();
  }, [V, c == null ? void 0 : c.id]), fe = H(async () => {
    if (!L) return;
    const { id: r, status: y } = L;
    if (!((y === "fixed" || y === "rejected") && h.trim() === "")) {
      b(`status-${r}`);
      try {
        const J = h.trim() ? { comment: h.trim() } : void 0;
        if (await V(r, y, J), (c == null ? void 0 : c.id) === r && w((oe) => oe ? { ...oe, status: y } : null), Z(null), S(""), (c == null ? void 0 : c.id) === r)
          try {
            const oe = await ie.getNote(a, r);
            w(oe);
          } catch {
          }
      } finally {
        b(null);
      }
    }
  }, [L, h, V, c == null ? void 0 : c.id, a]), be = H(async (r, y) => {
    b(`severity-${r}`);
    try {
      await U(r, y), (c == null ? void 0 : c.id) === r && w((J) => J ? { ...J, severity: y } : null);
    } finally {
      b(null);
    }
  }, [U, c == null ? void 0 : c.id]), ke = H(async (r) => {
    w(r);
    try {
      const y = await ie.getNote(a, r.id);
      w(y);
    } catch {
    }
  }, [a]), Se = H(async (r) => {
    if (confirm("このノートを削除しますか？")) {
      b(`delete-${r}`);
      try {
        await O(r), (c == null ? void 0 : c.id) === r && w(null);
      } finally {
        b(null);
      }
    }
  }, [O, c == null ? void 0 : c.id]), Ce = H(async (r, y) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await ie.deleteAttachment(a, r, y), w((J) => {
          var oe;
          return !J || J.id !== r ? J : {
            ...J,
            attachments: (oe = J.attachments) == null ? void 0 : oe.filter((ze) => ze.id !== y)
          };
        });
      } catch (J) {
        console.error("Failed to delete attachment:", J);
      }
  }, [a]), Fe = H(async () => {
    if (!(!c || x.trim() === "")) {
      v(!0);
      try {
        const r = await ie.addActivity(a, c.id, { content: x.trim() });
        w((y) => y && {
          ...y,
          activities: [...y.activities || [], r]
        }), D("");
      } catch (r) {
        console.error("Failed to add comment:", r);
      } finally {
        v(!1);
      }
    }
  }, [c, x, a]), me = (r) => {
    if (!r) return [];
    try {
      const y = JSON.parse(r);
      return Array.isArray(y) ? y : [];
    } catch {
      return r.split(`
`).filter((y) => y.trim());
    }
  };
  return /* @__PURE__ */ t("div", { style: It(n), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ t("header", { style: Ct(n), children: [
      /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "16px" }, children: [
        /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${n.primary}, ${n.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF"
          }, children: /* @__PURE__ */ e(k, { name: "bug_report", size: 24, color: "#FFF" }) }),
          /* @__PURE__ */ t("div", { children: [
            /* @__PURE__ */ e("h1", { style: {
              fontSize: "18px",
              fontWeight: 700,
              margin: 0,
              color: n.text,
              letterSpacing: "-0.025em"
            }, children: "Debug Notes" }),
            /* @__PURE__ */ e("span", { style: {
              fontSize: "12px",
              color: n.textMuted
            }, children: "バグ管理ダッシュボード" })
          ] })
        ] }),
        /* @__PURE__ */ e("span", { style: {
          fontSize: "11px",
          padding: "4px 10px",
          background: n.primary,
          color: "#FFFFFF",
          borderRadius: "20px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }, children: a })
      ] }),
      /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
        /* @__PURE__ */ t("label", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: n.textSecondary,
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "8px",
          background: A ? n.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: A ? n.success : n.textMuted,
            animation: A ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: A,
              onChange: (r) => q(r.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => d("json"),
            style: {
              padding: "8px 14px",
              background: n.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: n.text,
              fontWeight: 500,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            },
            title: "JSON エクスポート",
            children: [
              /* @__PURE__ */ e(k, { name: "download", size: 16 }),
              "JSON"
            ]
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => d("sqlite"),
            style: {
              padding: "8px 14px",
              background: n.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: n.text,
              fontWeight: 500,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            },
            title: "SQLite エクスポート",
            children: [
              /* @__PURE__ */ e(k, { name: "download", size: 16 }),
              "SQLite"
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => _(!T),
            style: {
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: n.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "transform 0.2s",
              color: n.text
            },
            title: T ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(k, { name: T ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => {
              b("refresh"), X(), ne((r) => r + 1);
            },
            disabled: l !== null,
            style: {
              padding: "10px 20px",
              background: n.primary,
              border: "none",
              borderRadius: "10px",
              cursor: l !== null ? "not-allowed" : "pointer",
              color: "#FFF",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: l !== null ? 0.6 : 1
            },
            children: [
              l === "refresh" ? /* @__PURE__ */ e(se, { size: 18, color: "#FFF" }) : /* @__PURE__ */ e(k, { name: "refresh", size: 18, color: "#FFF" }),
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
      borderBottom: `1px solid ${n.border}`,
      background: n.bg
    }, children: [
      { key: "notes", label: "ノート一覧" },
      { key: "test-status", label: "テスト状況" },
      ...p ? [{ key: "feedback", label: "フィードバック" }] : []
    ].map(({ key: r, label: y }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          R(r), r === "test-status" && B(null);
        },
        style: {
          padding: "12px 20px",
          border: "none",
          borderBottom: g === r ? `2px solid ${n.primary}` : "2px solid transparent",
          background: "transparent",
          color: g === r ? n.primary : n.textSecondary,
          fontWeight: g === r ? 600 : 400,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s"
        },
        children: y
      },
      r
    )) }),
    g === "test-status" ? /* @__PURE__ */ e(
      bt,
      {
        env: a,
        colors: n,
        isDarkMode: T,
        onNavigateToNote: E,
        refreshKey: Y
      }
    ) : g === "feedback" && p ? /* @__PURE__ */ e(
      yt,
      {
        apiBaseUrl: i,
        adminKey: u,
        colors: n,
        isDarkMode: T,
        refreshKey: Y
      }
    ) : /* @__PURE__ */ t("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
      /* @__PURE__ */ t("aside", { style: {
        width: "380px",
        borderRight: `1px solid ${n.border}`,
        display: "flex",
        flexDirection: "column",
        background: n.bgSecondary
      }, children: [
        /* @__PURE__ */ t("div", { style: {
          padding: "16px",
          display: "flex",
          gap: "10px",
          borderBottom: `1px solid ${n.border}`
        }, children: [
          /* @__PURE__ */ t(
            "select",
            {
              "data-testid": "status-filter",
              value: f,
              onChange: (r) => C(r.target.value),
              style: {
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: n.bg,
                color: n.text,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: `0 1px 3px ${n.border}`
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
          /* @__PURE__ */ t(
            "select",
            {
              value: F,
              onChange: (r) => M(r.target.value),
              style: {
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: n.bg,
                color: n.text,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: `0 1px 3px ${n.border}`
              },
              children: [
                /* @__PURE__ */ e("option", { value: "", children: "全source" }),
                /* @__PURE__ */ e("option", { value: "manual", children: "Manual" }),
                /* @__PURE__ */ e("option", { value: "test", children: "Test" })
              ]
            }
          ),
          /* @__PURE__ */ t("div", { style: {
            flex: 1,
            position: "relative"
          }, children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: P,
                onChange: (r) => Q(r.target.value),
                placeholder: "検索...",
                style: {
                  width: "100%",
                  padding: "10px 14px 10px 40px",
                  border: "none",
                  borderRadius: "10px",
                  background: n.bg,
                  color: n.text,
                  fontSize: "13px",
                  boxShadow: `0 1px 3px ${n.border}`
                }
              }
            ),
            /* @__PURE__ */ e("span", { style: {
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: n.textMuted
            }, children: /* @__PURE__ */ e(k, { name: "search", size: 18 }) })
          ] })
        ] }),
        W != null && /* @__PURE__ */ e("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${n.border}`,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }, children: /* @__PURE__ */ t("span", { style: {
          fontSize: "12px",
          padding: "4px 10px",
          borderRadius: "20px",
          background: `${n.primary}15`,
          color: n.primary,
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px"
        }, children: [
          "テストケース #",
          W,
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => B(null),
              style: {
                border: "none",
                background: "transparent",
                color: n.primary,
                cursor: "pointer",
                padding: "0 2px",
                fontSize: "14px",
                lineHeight: 1
              },
              children: "✕"
            }
          )
        ] }) }),
        /* @__PURE__ */ t("div", { style: {
          flex: 1,
          overflow: "auto",
          padding: "12px"
        }, children: [
          I && /* @__PURE__ */ t("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: n.textMuted
          }, children: [
            /* @__PURE__ */ e(k, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          j && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: n.errorBg,
            color: n.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: j.message }),
          !I && ee.length === 0 && /* @__PURE__ */ t("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: n.textMuted
          }, children: [
            /* @__PURE__ */ e(k, { name: "inbox", size: 40 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "ノートがありません" })
          ] }),
          ee.map((r) => /* @__PURE__ */ t(
            "div",
            {
              style: {
                padding: "16px",
                background: n.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: (c == null ? void 0 : c.id) === r.id ? `2px solid ${n.primary}` : "2px solid transparent",
                boxShadow: (c == null ? void 0 : c.id) === r.id ? `0 4px 12px ${n.primary}30` : `0 1px 3px ${n.border}`,
                transition: "all 0.2s"
              },
              onClick: () => ke(r),
              children: [
                /* @__PURE__ */ t("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px"
                }, children: [
                  /* @__PURE__ */ t("span", { style: {
                    fontSize: "11px",
                    color: n.textMuted,
                    fontFamily: "monospace"
                  }, children: [
                    "#",
                    r.id
                  ] }),
                  /* @__PURE__ */ t("span", { style: je(r.severity, n), children: [
                    /* @__PURE__ */ e(k, { name: Ee(r.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: r.severity || "none" })
                  ] }),
                  /* @__PURE__ */ t("span", { style: Ie(r.status, n), children: [
                    /* @__PURE__ */ e(k, { name: De(r.status), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: r.status })
                  ] }),
                  r.source === "test" && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${n.medium}15`,
                    color: n.medium,
                    fontWeight: 600
                  }, children: "🧪 test" }),
                  (r.attachment_count ?? 0) > 0 && /* @__PURE__ */ t("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${n.primary}15`,
                    color: n.primary,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px"
                  }, children: [
                    /* @__PURE__ */ e(k, { name: "image", size: 12 }),
                    r.attachment_count
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: n.text,
                  lineHeight: 1.4
                }, children: Me(r.content) }),
                /* @__PURE__ */ t("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: n.textMuted
                }, children: [
                  /* @__PURE__ */ t("span", { style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    background: n.bgTertiary,
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }, children: [
                    /* @__PURE__ */ e(k, { name: "link", size: 12 }),
                    r.route || "/"
                  ] }),
                  /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                  /* @__PURE__ */ e("span", { children: Ae(r.created_at) })
                ] }),
                r.latest_comment && /* @__PURE__ */ t("div", { style: {
                  marginTop: "8px",
                  padding: "6px 10px",
                  background: n.bgTertiary,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: n.textSecondary,
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px"
                }, children: [
                  /* @__PURE__ */ e(k, { name: "chat_bubble_outline", size: 14 }),
                  /* @__PURE__ */ e("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.latest_comment.length > 60 ? r.latest_comment.slice(0, 60) + "..." : r.latest_comment })
                ] })
              ]
            },
            r.id
          ))
        ] }),
        /* @__PURE__ */ t("div", { style: {
          padding: "16px",
          borderTop: `1px solid ${n.border}`,
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          fontSize: "12px",
          color: n.textMuted
        }, children: [
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(k, { name: "description", size: 16 }),
            $.length,
            " 件"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(k, { name: "error", size: 16, color: n.error }),
            $.filter((r) => r.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(k, { name: "build", size: 16, color: n.warning }),
            $.filter((r) => r.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(k, { name: "check_circle", size: 16, color: n.success }),
            $.filter((r) => r.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(k, { name: "undo", size: 16, color: n.error }),
            $.filter((r) => r.status === "rejected").length,
            " Rejected"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e("main", { style: {
        flex: 1,
        overflow: "auto",
        padding: "32px",
        background: n.bg
      }, children: c ? /* @__PURE__ */ t("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ t("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ t("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ t("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px"
            }, children: [
              /* @__PURE__ */ t("span", { style: je(c.severity, n), children: [
                /* @__PURE__ */ e(k, { name: Ee(c.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: c.severity || "none" })
              ] }),
              /* @__PURE__ */ t("span", { style: Ie(c.status, n), children: [
                /* @__PURE__ */ e(k, { name: De(c.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: c.status })
              ] }),
              c.source === "test" && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "20px",
                background: `${n.medium}15`,
                color: n.medium,
                fontWeight: 600
              }, children: "🧪 test" })
            ] }),
            /* @__PURE__ */ e("h2", { style: {
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: n.text,
              lineHeight: 1.3,
              letterSpacing: "-0.025em"
            }, children: Me(c.content) })
          ] }),
          /* @__PURE__ */ t("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ t(
              "select",
              {
                "data-testid": "severity-select",
                value: c.severity || "",
                onChange: (r) => {
                  const y = r.target.value;
                  be(c.id, y || null);
                },
                disabled: l !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: n.bgSecondary,
                  color: n.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: l !== null ? "not-allowed" : "pointer",
                  opacity: l !== null ? 0.6 : 1
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
            l === `severity-${c.id}` && /* @__PURE__ */ e(se, { size: 16, color: n.primary }),
            /* @__PURE__ */ t(
              "select",
              {
                "data-testid": "status-select",
                value: c.status,
                onChange: (r) => ae(c.id, r.target.value),
                disabled: l !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: n.bgSecondary,
                  color: n.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: l !== null ? "not-allowed" : "pointer",
                  opacity: l !== null ? 0.6 : 1
                },
                children: [
                  /* @__PURE__ */ e("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ e("option", { value: "fixed", children: "Fixed" }),
                  /* @__PURE__ */ e("option", { value: "resolved", children: "Resolved" }),
                  /* @__PURE__ */ e("option", { value: "rejected", children: "Rejected" })
                ]
              }
            ),
            l === `status-${c.id}` && /* @__PURE__ */ e(se, { size: 16, color: n.primary }),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: () => Se(c.id),
                disabled: l !== null,
                style: {
                  padding: "10px 16px",
                  background: n.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: n.error,
                  cursor: l !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: l !== null ? 0.6 : 1
                },
                children: [
                  l === `delete-${c.id}` ? /* @__PURE__ */ e(se, { size: 16, color: n.error }) : /* @__PURE__ */ e(k, { name: "delete", size: 16 }),
                  "削除"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ t("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ e(
            ue,
            {
              icon: "link",
              label: "ページURL",
              value: c.route || "/",
              isLink: !0,
              colors: n
            }
          ),
          /* @__PURE__ */ e(
            ue,
            {
              icon: "article",
              label: "ページタイトル",
              value: c.screen_name || "(不明)",
              colors: n
            }
          ),
          /* @__PURE__ */ e(
            ue,
            {
              icon: "schedule",
              label: "作成日時",
              value: $t(c.created_at),
              colors: n
            }
          )
        ] }),
        /* @__PURE__ */ e(de, { icon: "notes", title: "内容", colors: n, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: n.text
        }, children: c.content }) }),
        c.attachments && c.attachments.length > 0 && /* @__PURE__ */ e(de, { icon: "image", title: `添付画像 (${c.attachments.length}件)`, colors: n, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px"
        }, children: c.attachments.map((r) => /* @__PURE__ */ t("div", { style: {
          position: "relative",
          borderRadius: "10px",
          overflow: "hidden",
          border: `1px solid ${n.border}`,
          cursor: "pointer",
          aspectRatio: "4/3"
        }, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: ie.getAttachmentUrl(r.filename),
              alt: r.original_name,
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              },
              onClick: () => G(ie.getAttachmentUrl(r.filename))
            }
          ),
          /* @__PURE__ */ t("div", { style: {
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
            /* @__PURE__ */ e("span", { style: { color: "#fff", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.original_name }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: (y) => {
                  y.stopPropagation(), Ce(c.id, r.id);
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
                children: /* @__PURE__ */ e(k, { name: "delete", size: 14, color: "#fff" })
              }
            )
          ] })
        ] }, r.id)) }) }),
        c.steps && /* @__PURE__ */ e(de, { icon: "format_list_numbered", title: "再現手順", colors: n, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: n.text
        }, children: me(c.steps).map((r, y) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${n.borderLight}`
        }, children: r }, y)) }) }),
        c.user_log && /* @__PURE__ */ e(de, { icon: "sticky_note_2", title: "補足メモ", colors: n, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: T ? "#0D1117" : "#1E293B",
          color: "#E2E8F0",
          borderRadius: "12px",
          overflow: "auto",
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          lineHeight: 1.6,
          margin: 0
        }, children: c.user_log }) }),
        c.environment && /* @__PURE__ */ e(de, { icon: "devices", title: "環境情報", colors: n, children: /* @__PURE__ */ t("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ e(ue, { icon: "public", label: "URL", value: c.environment.url || "", isLink: !0, colors: n }),
          /* @__PURE__ */ e(ue, { icon: "aspect_ratio", label: "Viewport", value: c.environment.viewport || "", colors: n }),
          /* @__PURE__ */ e(ue, { icon: "computer", label: "User Agent", value: c.environment.userAgent || "", colors: n }),
          /* @__PURE__ */ e(ue, { icon: "schedule", label: "記録日時", value: c.environment.timestamp || "", colors: n })
        ] }) }),
        c.console_log && c.console_log.length > 0 && /* @__PURE__ */ e(de, { icon: "terminal", title: `コンソールログ (${c.console_log.length}件)`, colors: n, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: T ? "#0D1117" : "#1E293B"
        }, children: c.console_log.map((r, y) => /* @__PURE__ */ t("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${T ? "#21262D" : "#2D3748"}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: r.level === "error" ? "#F87171" : r.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: r.level === "error" ? "#7F1D1D40" : r.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: r.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: r.message })
        ] }, y)) }) }),
        /* @__PURE__ */ t(de, { icon: "history", title: `アクティビティ (${(c.activities || []).length}件)`, colors: n, children: [
          (c.activities || []).length > 0 ? /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: c.activities.map((r) => /* @__PURE__ */ t("div", { style: {
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            padding: "10px 14px",
            background: n.bgSecondary,
            borderRadius: "10px",
            borderLeft: `3px solid ${r.action === "status_change" ? n.primary : n.textMuted}`
          }, children: [
            /* @__PURE__ */ e("div", { style: {
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              marginTop: "4px",
              flexShrink: 0,
              background: r.action === "status_change" ? n.primary : n.textMuted
            } }),
            /* @__PURE__ */ t("div", { style: { flex: 1, minWidth: 0 }, children: [
              r.action === "status_change" ? /* @__PURE__ */ t("div", { style: { fontSize: "13px", color: n.text, marginBottom: r.content ? "4px" : 0 }, children: [
                /* @__PURE__ */ e("span", { style: {
                  ...Ie(r.old_status, n),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: r.old_status }),
                /* @__PURE__ */ e("span", { style: { margin: "0 6px", color: n.textMuted }, children: " → " }),
                /* @__PURE__ */ e("span", { style: {
                  ...Ie(r.new_status, n),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: r.new_status })
              ] }) : null,
              r.content && /* @__PURE__ */ e("div", { style: {
                fontSize: "13px",
                color: n.text,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap"
              }, children: r.content }),
              /* @__PURE__ */ t("div", { style: {
                fontSize: "11px",
                color: n.textMuted,
                marginTop: "4px",
                display: "flex",
                gap: "8px"
              }, children: [
                r.author && /* @__PURE__ */ e("span", { children: r.author }),
                /* @__PURE__ */ e("span", { children: Ae(r.created_at) })
              ] })
            ] })
          ] }, r.id)) }) : /* @__PURE__ */ e("div", { style: { fontSize: "13px", color: n.textMuted }, children: "アクティビティはありません" }),
          /* @__PURE__ */ t("div", { style: {
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            alignItems: "flex-end"
          }, children: [
            /* @__PURE__ */ e(
              "textarea",
              {
                value: x,
                onChange: (r) => D(r.target.value),
                placeholder: "コメントを追加...",
                style: {
                  flex: 1,
                  padding: "10px 14px",
                  border: `1px solid ${n.border}`,
                  borderRadius: "10px",
                  background: n.bg,
                  color: n.text,
                  fontSize: "13px",
                  resize: "vertical",
                  minHeight: "40px",
                  maxHeight: "120px",
                  fontFamily: "inherit"
                },
                rows: 1
              }
            ),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: Fe,
                disabled: z || x.trim() === "",
                style: {
                  padding: "10px 16px",
                  background: z || x.trim() === "" ? n.bgTertiary : n.primary,
                  border: "none",
                  borderRadius: "10px",
                  color: z || x.trim() === "" ? n.textMuted : "#FFF",
                  cursor: z || x.trim() === "" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                },
                children: [
                  z ? /* @__PURE__ */ e(se, { size: 14, color: n.textMuted }) : /* @__PURE__ */ e(k, { name: "send", size: 16 }),
                  "送信"
                ]
              }
            )
          ] })
        ] }),
        c.network_log && c.network_log.length > 0 && /* @__PURE__ */ e(de, { icon: "wifi", title: `ネットワークログ (${c.network_log.length}件)`, colors: n, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: T ? "#0D1117" : "#1E293B"
        }, children: c.network_log.map((r, y) => /* @__PURE__ */ t("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${T ? "#21262D" : "#2D3748"}`,
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
          }, children: r.method }),
          /* @__PURE__ */ e("span", { style: {
            color: r.status >= 400 ? "#F87171" : "#34D399",
            fontWeight: 600,
            flexShrink: 0
          }, children: r.status }),
          /* @__PURE__ */ e("span", { style: {
            color: "#E2E8F0",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: r.url }),
          /* @__PURE__ */ e("span", { style: {
            color: "#64748B",
            flexShrink: 0
          }, children: r.duration != null ? `${r.duration}ms` : "-" })
        ] }, y)) }) })
      ] }) : /* @__PURE__ */ t("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: n.textMuted
      }, children: [
        /* @__PURE__ */ e(k, { name: "arrow_back", size: 64 }),
        /* @__PURE__ */ e("div", { style: { fontSize: "18px", fontWeight: 500, marginTop: "16px" }, children: "ノートを選択してください" }),
        /* @__PURE__ */ e("div", { style: { fontSize: "14px", marginTop: "8px" }, children: "左のリストからノートを選択すると詳細が表示されます" })
      ] }) })
    ] }),
    L && /* @__PURE__ */ e(
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
        onClick: () => Z(null),
        children: /* @__PURE__ */ t(
          "div",
          {
            style: {
              background: n.bg,
              borderRadius: "16px",
              padding: "28px",
              width: "480px",
              maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            },
            onClick: (r) => r.stopPropagation(),
            children: [
              /* @__PURE__ */ t("h3", { style: {
                margin: "0 0 16px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: n.text,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }, children: [
                /* @__PURE__ */ e(k, { name: "edit_note", size: 20 }),
                "ステータスを「",
                L.status,
                "」に変更"
              ] }),
              /* @__PURE__ */ e(
                "textarea",
                {
                  value: h,
                  onChange: (r) => S(r.target.value),
                  placeholder: L.status === "fixed" ? "コメント（必須）: 何を修正したか記入してください" : L.status === "rejected" ? "コメント（必須）: 却下理由を記入してください" : "コメント（任意）",
                  style: {
                    width: "100%",
                    padding: "12px 14px",
                    border: `1px solid ${h.trim() === "" && (L.status === "fixed" || L.status === "rejected") ? n.error : n.border}`,
                    borderRadius: "10px",
                    background: n.bgSecondary,
                    color: n.text,
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
              (L.status === "fixed" || L.status === "rejected") && h.trim() === "" && /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: n.error, marginTop: "6px" }, children: L.status === "fixed" ? "fixed に変更するにはコメントが必須です" : "却下理由の入力が必須です" }),
              /* @__PURE__ */ t("div", { style: {
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px"
              }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => Z(null),
                    style: {
                      padding: "10px 20px",
                      background: n.bgSecondary,
                      border: "none",
                      borderRadius: "10px",
                      color: n.text,
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: "13px"
                    },
                    children: "キャンセル"
                  }
                ),
                /* @__PURE__ */ t(
                  "button",
                  {
                    onClick: fe,
                    disabled: l !== null || (L.status === "fixed" || L.status === "rejected") && h.trim() === "",
                    style: {
                      padding: "10px 20px",
                      background: (L.status === "fixed" || L.status === "rejected") && h.trim() === "" ? n.bgTertiary : n.primary,
                      border: "none",
                      borderRadius: "10px",
                      color: (L.status === "fixed" || L.status === "rejected") && h.trim() === "" ? n.textMuted : "#FFF",
                      cursor: (L.status === "fixed" || L.status === "rejected") && h.trim() === "" ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    },
                    children: [
                      l ? /* @__PURE__ */ e(se, { size: 14, color: "#FFF" }) : /* @__PURE__ */ e(k, { name: "check", size: 16 }),
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
    te && /* @__PURE__ */ t(
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
        onClick: () => G(null),
        children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: te,
              alt: "拡大表示",
              style: {
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
              },
              onClick: (r) => r.stopPropagation()
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => G(null),
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
              children: /* @__PURE__ */ e(k, { name: "close", size: 24, color: "#fff" })
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
function ue({ icon: s, label: a, value: i, isLink: u, colors: f }) {
  return /* @__PURE__ */ t("div", { style: {
    padding: "16px",
    background: f.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
      fontSize: "12px",
      color: f.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(k, { name: s, size: 16 }),
      a
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: u ? f.link : f.text,
      fontFamily: u ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: i })
  ] });
}
function de({ icon: s, title: a, children: i, colors: u }) {
  return /* @__PURE__ */ t("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ t("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: u.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(k, { name: s, size: 18 }),
      a
    ] }),
    i
  ] });
}
function Me(s, a = 60) {
  const i = s.split(`
`)[0];
  return i.length > a ? i.slice(0, a) + "..." : i;
}
function Ae(s) {
  const a = new Date(s), i = a.getMonth() + 1, u = a.getDate(), f = a.getHours().toString().padStart(2, "0"), C = a.getMinutes().toString().padStart(2, "0");
  return `${i}/${u} ${f}:${C}`;
}
function $t(s) {
  return new Date(s).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function De(s) {
  switch (s) {
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
function Ee(s) {
  switch (s) {
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
function je(s, a) {
  const i = s ? a[s] : a.textMuted;
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
function Ie(s, a) {
  let i, u;
  switch (s) {
    case "open":
      i = a.primaryLight, u = a.primary;
      break;
    case "fixed":
      i = a.warningBg, u = a.warning;
      break;
    case "resolved":
      i = a.successBg, u = a.success;
      break;
    case "rejected":
      i = a.errorBg, u = a.error;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: i,
    color: u,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function It(s) {
  return {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSize: "14px",
    color: s.text,
    background: s.bg
  };
}
function Ct(s) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${s.border}`,
    background: s.bg
  };
}
export {
  Dt as D,
  At as a
};
