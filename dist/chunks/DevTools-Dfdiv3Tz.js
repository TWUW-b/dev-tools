import { jsxs as n, jsx as e, Fragment as he } from "react/jsx-runtime";
import { useState as w, useMemo as fe, useCallback as V, forwardRef as nt, useRef as ce, useEffect as ie, useImperativeHandle as it, createContext as rt, useContext as Ue } from "react";
import { a as Ze, u as at } from "./useDebugMode-Bazrkz8S.js";
import { a as re, s as Ne, g as ot } from "./api-BfEr37m2.js";
import { d as st, a as lt } from "./useFeedbackAdminMode-uS9p5VCZ.js";
import { b as dt, c as ct, e as pt } from "./feedbackApi-CdFCjUgg.js";
import { createPortal as ut } from "react-dom";
import { m as gt } from "./feedbackLogCapture-DUBfVREg.js";
import { I as Xe, D as s, h as Fe } from "./FeedbackAdmin-3MwX2wQ9.js";
import { c as xt } from "./logCapture-Bkuy8MSd.js";
function ht(i) {
  return i.split(`
`).map((r) => r.trim()).filter((r) => r.startsWith("- ")).map((r) => r.slice(2).trim()).filter(Boolean);
}
function ft({ notes: i, updateStatus: r }) {
  const [t, u] = w(null), [x, S] = w(/* @__PURE__ */ new Set(["fixed"])), [h, f] = w(/* @__PURE__ */ new Set()), [m, L] = w("list"), [c, k] = w({}), R = fe(() => x.size === 0 ? i : i.filter((d) => x.has(d.status)), [i, x]), E = fe(() => i.filter((d) => d.status === "fixed"), [i]), M = V(async (d, y) => {
    u(`status-${d}`);
    try {
      await r(d, y), y === "resolved" && k((g) => {
        const $ = { ...g };
        return delete $[d], $;
      });
    } finally {
      u(null);
    }
  }, [r]), H = V((d, y) => {
    k((g) => {
      const $ = g[d] ?? /* @__PURE__ */ new Set(), p = new Set($);
      return p.has(y) ? p.delete(y) : p.add(y), { ...g, [d]: p };
    });
  }, []);
  return /* @__PURE__ */ n("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ n("div", { className: "debug-view-toggle", children: [
      /* @__PURE__ */ n(
        "button",
        {
          className: `debug-view-btn ${m === "list" ? "active" : ""}`,
          onClick: () => L("list"),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "list" }),
            "一覧"
          ]
        }
      ),
      /* @__PURE__ */ n(
        "button",
        {
          className: `debug-view-btn ${m === "checklist" ? "active" : ""}`,
          onClick: () => L("checklist"),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "checklist" }),
            "確認手順",
            E.length > 0 && /* @__PURE__ */ e("span", { className: "debug-view-badge", children: E.length })
          ]
        }
      )
    ] }) }),
    m === "list" && /* @__PURE__ */ n(he, { children: [
      /* @__PURE__ */ n("div", { className: "debug-status-filter", children: [
        ["open", "fixed", "resolved", "rejected"].map((d) => /* @__PURE__ */ e(
          "button",
          {
            "data-testid": `status-chip-${d}`,
            className: `debug-status-chip ${x.has(d) ? "active" : ""}`,
            onClick: () => {
              S((y) => {
                const g = new Set(y);
                return g.has(d) ? g.delete(d) : g.add(d), g;
              });
            },
            children: d
          },
          d
        )),
        /* @__PURE__ */ n("span", { className: "debug-filter-count", children: [
          R.length,
          "件"
        ] })
      ] }),
      R.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "対応中のノートはありません" }) : R.map((d) => /* @__PURE__ */ n("div", { children: [
        /* @__PURE__ */ n("div", { className: "debug-note-row", "data-status": d.status, children: [
          /* @__PURE__ */ n(
            "div",
            {
              className: "debug-note-info",
              style: { cursor: d.latest_comment ? "pointer" : void 0 },
              onClick: () => {
                d.latest_comment && f((y) => {
                  const g = new Set(y);
                  return g.has(d.id) ? g.delete(d.id) : g.add(d.id), g;
                });
              },
              children: [
                /* @__PURE__ */ n("span", { className: "debug-note-id", children: [
                  "#",
                  d.id
                ] }),
                d.latest_comment && /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: h.has(d.id) ? "▲" : "▼" }),
                /* @__PURE__ */ e("span", { className: `debug-severity-dot ${d.severity || "none"}` }),
                /* @__PURE__ */ n("span", { className: "debug-note-preview", children: [
                  d.source === "test" && /* @__PURE__ */ e("span", { className: "debug-source-badge", children: "🧪" }),
                  d.content.split(`
`)[0].slice(0, 40)
                ] })
              ]
            }
          ),
          /* @__PURE__ */ n(
            "select",
            {
              "data-testid": `note-status-select-${d.id}`,
              className: "debug-status-select",
              value: d.status,
              onChange: (y) => M(d.id, y.target.value),
              disabled: t !== null,
              children: [
                /* @__PURE__ */ e("option", { value: "open", children: "open" }),
                /* @__PURE__ */ e("option", { value: "fixed", children: "fixed" }),
                /* @__PURE__ */ e("option", { value: "resolved", children: "resolved" }),
                /* @__PURE__ */ e("option", { value: "rejected", children: "rejected" })
              ]
            }
          )
        ] }),
        h.has(d.id) && d.latest_comment && /* @__PURE__ */ e("div", { style: {
          padding: "4px 12px 6px 28px",
          fontSize: "11px",
          color: "#6B7280",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }, children: d.latest_comment })
      ] }, d.id))
    ] }),
    m === "checklist" && /* @__PURE__ */ e("div", { className: "debug-checklist-view", children: E.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "fixed のノートはありません" }) : E.map((d) => {
      const y = ht(d.latest_comment || ""), g = c[d.id] ?? /* @__PURE__ */ new Set(), $ = y.length > 0 && g.size === y.length;
      return /* @__PURE__ */ n("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ n("div", { className: "debug-checklist-header", children: [
          /* @__PURE__ */ n("span", { className: "debug-note-id", children: [
            "#",
            d.id
          ] }),
          /* @__PURE__ */ e("span", { className: "debug-checklist-title", children: d.content.split(`
`)[0].slice(0, 50) })
        ] }),
        y.length > 0 ? /* @__PURE__ */ e("div", { className: "debug-checklist-items", children: y.map((p, N) => /* @__PURE__ */ n("label", { className: "debug-checklist-item", children: [
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: g.has(N),
              onChange: () => H(d.id, N)
            }
          ),
          /* @__PURE__ */ e("span", { className: g.has(N) ? "debug-checklist-done" : "", children: p })
        ] }, N)) }) : /* @__PURE__ */ e("div", { className: "debug-checklist-no-items", children: "確認手順が登録されていません" }),
        /* @__PURE__ */ n("div", { className: "debug-checklist-actions", children: [
          /* @__PURE__ */ n("span", { className: "debug-checklist-progress", children: [
            g.size,
            "/",
            y.length
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              className: "debug-btn debug-btn-resolve",
              disabled: !$ || t !== null,
              onClick: () => M(d.id, "resolved"),
              children: t === `status-${d.id}` ? "更新中..." : "resolved に変更"
            }
          )
        ] })
      ] }, d.id);
    }) })
  ] });
}
const bt = nt(function({ testCases: r, env: t, logCapture: u, onNotesRefresh: x, onRunningCasesChange: S }, h) {
  const [f, m] = w([]), [L, c] = w(/* @__PURE__ */ new Set()), [k, R] = w(/* @__PURE__ */ new Set()), [E, M] = w({}), [H, d] = w({}), [y, g] = w(null), [$, p] = w(null), N = ce("");
  ie(() => {
    if (!r || r.length === 0) return;
    const v = JSON.stringify(r);
    if (v === N.current) return;
    let I = !1;
    return (async () => {
      try {
        await re.importTestCases(r);
      } catch (b) {
        console.warn("Failed to import test cases:", b);
        return;
      }
      if (!I)
        try {
          const b = await re.getTestTree(t);
          if (I) return;
          m(b), N.current = v;
          const J = {};
          for (const B of b)
            for (const a of B.capabilities)
              for (const C of a.cases)
                C.last === "pass" && (J[C.caseId] = !0);
          M(J);
        } catch (b) {
          console.warn("Failed to fetch test tree:", b);
        }
    })(), () => {
      I = !0;
    };
  }, [r, t]);
  const T = V(async () => {
    try {
      const v = await re.getTestTree(t);
      m(v);
      const I = {};
      for (const b of v)
        for (const J of b.capabilities)
          for (const B of J.cases)
            I[B.caseId] = B.last === "pass";
      M(I);
    } catch {
      p({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [t]);
  it(h, () => ({ refresh: T }), [T]), ie(() => {
    if (!S) return;
    const v = [];
    for (const I of f)
      for (const b of I.capabilities) {
        const J = `${I.domain}/${b.capability}`;
        if (k.has(J))
          for (const B of b.cases) v.push(B.caseId);
      }
    S(v);
  }, [k, f, S]);
  const G = V(async (v, I, b) => {
    const J = `${v}/${I}`;
    g(J), p(null);
    try {
      const B = [], a = H[J], C = a != null && a.content.trim() && a.caseIds.length > 0 ? a.caseIds : [], W = new Set(C);
      for (const Q of b)
        E[Q.caseId] && !W.has(Q.caseId) && B.push({ caseId: Q.caseId, result: "pass" });
      for (const Q of C)
        B.push({ caseId: Q, result: "fail" });
      if (B.length === 0) {
        p({ type: "error", text: "チェックまたはバグ報告が必要です" }), g(null);
        return;
      }
      const P = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, q = C.length > 0 ? {
        content: a.content.trim(),
        severity: a.severity || void 0,
        consoleLogs: u == null ? void 0 : u.getConsoleLogs(),
        networkLogs: u == null ? void 0 : u.getNetworkLogs(),
        environment: P
      } : void 0, K = await re.submitTestRuns(t, B, q);
      if (a != null && a.files && a.files.length > 0 && K.results) {
        const Y = K.results.filter((l) => l.noteId != null).map((l) => l.noteId)[0];
        if (Y)
          for (const l of a.files)
            try {
              await re.uploadAttachment(t, Y, l);
            } catch (_) {
              console.warn("Failed to upload attachment:", _);
            }
      }
      if (K.capability) {
        m((Y) => Y.map((l) => l.domain !== v ? l : {
          ...l,
          capabilities: l.capabilities.map(
            (_) => _.capability === I ? K.capability : _
          )
        }));
        const Q = { ...E };
        for (const Y of K.capability.cases)
          Q[Y.caseId] = Y.last === "pass";
        M(Q);
      }
      x(), d((Q) => {
        const Y = { ...Q };
        return delete Y[J], Y;
      }), p({ type: "success", text: "送信しました" });
    } catch (B) {
      p({ type: "error", text: B instanceof Error ? B.message : "送信に失敗しました" });
    } finally {
      g(null);
    }
  }, [E, H, t, u, x]), D = V((v) => {
    c((I) => {
      const b = new Set(I);
      return b.has(v) ? b.delete(v) : b.add(v), b;
    });
  }, []), Z = V((v) => {
    R((I) => {
      const b = new Set(I);
      return b.has(v) ? b.delete(v) : b.add(v), b;
    });
  }, []), O = (v) => v.last === "pass" ? "passed" : v.last === "fail" && v.openIssues === 0 ? "retest" : v.last === "fail" ? "fail" : "-", j = (v) => v.last === "pass" ? s.success : v.last === "fail" && v.openIssues === 0 ? "#F59E0B" : v.last === "fail" ? s.error : s.gray500, te = (v) => v.status === "passed" ? "passed" : v.status === "retest" ? "retest" : v.status === "fail" ? "fail" : "", X = (v) => v.status === "passed" ? s.success : v.status === "retest" ? "#F59E0B" : v.status === "fail" ? s.error : s.gray500;
  return /* @__PURE__ */ n(he, { children: [
    $ && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${$.type}`, children: $.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: f.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : f.map((v) => /* @__PURE__ */ n("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ n(
        "button",
        {
          "data-testid": `domain-toggle-${v.domain}`,
          className: "debug-tree-toggle",
          onClick: () => D(v.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: L.has(v.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: v.domain })
          ]
        }
      ),
      L.has(v.domain) && v.capabilities.map((I) => {
        const b = `${v.domain}/${I.capability}`, J = k.has(b), B = H[b];
        return /* @__PURE__ */ n("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ n(
            "button",
            {
              "data-testid": `cap-toggle-${b}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => Z(b),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: J ? "expand_more" : "chevron_right" }),
                /* @__PURE__ */ e("span", { className: "debug-tree-label", children: I.capability }),
                /* @__PURE__ */ n("span", { className: "debug-tree-count", children: [
                  I.passed,
                  "/",
                  I.total
                ] }),
                I.status && /* @__PURE__ */ e("span", { className: "debug-tree-status", style: { color: X(I) }, children: te(I) }),
                I.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                  "[",
                  I.openIssues,
                  "件]"
                ] })
              ]
            }
          ),
          J && /* @__PURE__ */ n("div", { className: "debug-tree-cases", children: [
            I.cases.map((a) => /* @__PURE__ */ n("label", { "data-testid": `case-${a.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!E[a.caseId],
                  onChange: (C) => {
                    M((W) => ({
                      ...W,
                      [a.caseId]: C.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: a.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: j(a) }, children: O(a) }),
              a.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                "[",
                a.openIssues,
                "件]"
              ] })
            ] }, a.caseId)),
            /* @__PURE__ */ n("div", { className: "debug-bug-form", children: [
              /* @__PURE__ */ e("div", { className: "debug-bug-form-title", children: "バグ報告" }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "ケース（複数選択可）" }),
                /* @__PURE__ */ e("div", { className: "debug-bug-cases", children: I.cases.map((a) => {
                  const C = (B == null ? void 0 : B.caseIds.includes(a.caseId)) ?? !1;
                  return /* @__PURE__ */ n("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: C,
                        onChange: (W) => {
                          d((P) => {
                            const q = P[b] || { caseIds: [], content: "", severity: "", files: [] }, K = W.target.checked ? [...q.caseIds, a.caseId] : q.caseIds.filter((Q) => Q !== a.caseId);
                            return { ...P, [b]: { ...q, caseIds: K } };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { children: a.title })
                  ] }, a.caseId);
                }) })
              ] }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "内容" }),
                /* @__PURE__ */ e(
                  "textarea",
                  {
                    value: (B == null ? void 0 : B.content) || "",
                    onChange: (a) => {
                      d((C) => {
                        var W, P, q;
                        return {
                          ...C,
                          [b]: {
                            ...C[b],
                            caseIds: ((W = C[b]) == null ? void 0 : W.caseIds) || [],
                            content: a.target.value,
                            severity: ((P = C[b]) == null ? void 0 : P.severity) || "",
                            files: ((q = C[b]) == null ? void 0 : q.files) || []
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
                    onChange: (a) => {
                      d((C) => {
                        var W, P, q;
                        return {
                          ...C,
                          [b]: {
                            ...C[b],
                            caseIds: ((W = C[b]) == null ? void 0 : W.caseIds) || [],
                            content: ((P = C[b]) == null ? void 0 : P.content) || "",
                            severity: a.target.value,
                            files: ((q = C[b]) == null ? void 0 : q.files) || []
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
                Xe,
                {
                  files: (B == null ? void 0 : B.files) || [],
                  onAdd: (a) => {
                    d((C) => {
                      var W, P, q, K;
                      return {
                        ...C,
                        [b]: {
                          ...C[b],
                          caseIds: ((W = C[b]) == null ? void 0 : W.caseIds) || [],
                          content: ((P = C[b]) == null ? void 0 : P.content) || "",
                          severity: ((q = C[b]) == null ? void 0 : q.severity) || "",
                          files: [...((K = C[b]) == null ? void 0 : K.files) || [], ...a]
                        }
                      };
                    });
                  },
                  onRemove: (a) => {
                    d((C) => {
                      var W, P, q, K;
                      return {
                        ...C,
                        [b]: {
                          ...C[b],
                          caseIds: ((W = C[b]) == null ? void 0 : W.caseIds) || [],
                          content: ((P = C[b]) == null ? void 0 : P.content) || "",
                          severity: ((q = C[b]) == null ? void 0 : q.severity) || "",
                          files: (((K = C[b]) == null ? void 0 : K.files) || []).filter((Q, Y) => Y !== a)
                        }
                      };
                    });
                  },
                  disabled: y !== null
                }
              )
            ] }),
            (() => {
              const a = B != null && B.content.trim() ? B.caseIds.length : 0, W = I.cases.filter((P) => E[P.caseId] && !(B != null && B.caseIds.includes(P.caseId) && a > 0)).length + a;
              return /* @__PURE__ */ e(
                "button",
                {
                  "data-testid": `cap-submit-${b}`,
                  className: "debug-btn debug-btn-primary debug-cap-submit",
                  onClick: () => G(v.domain, I.capability, I.cases),
                  disabled: y !== null || W === 0,
                  children: y === b ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
                  ] }) : `${W}/${I.total}件を送信`
                }
              );
            })()
          ] })
        ] }, b);
      })
    ] }, v.domain)) })
  ] });
});
function mt({
  items: i,
  defaultPath: r,
  onNavigate: t,
  onAppNavigate: u
}) {
  var c;
  const [x, S] = w(r || ((c = i[0]) == null ? void 0 : c.path) || ""), { content: h, loading: f, error: m } = st(x), L = (k) => {
    S(k), t == null || t(k);
  };
  return /* @__PURE__ */ n("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: i.map((k) => /* @__PURE__ */ e(
      "button",
      {
        className: `debug-manual-item ${x === k.path ? "active" : ""}`,
        onClick: () => L(k.path),
        title: k.title,
        children: k.title
      },
      k.id
    )) }),
    /* @__PURE__ */ n("div", { className: "debug-manual-content", children: [
      f && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      m && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: m.message }),
      h && /* @__PURE__ */ e(
        Fe,
        {
          content: h,
          onLinkClick: (k) => {
            S(k), t == null || t(k);
          },
          onAppLinkClick: u
        }
      )
    ] })
  ] });
}
function yt(i) {
  const { meta: r, body: t } = vt(i), u = t.split(`
`), x = {
    title: r.title,
    warning: r.warning,
    projects: []
  };
  let S = [], h = null, f = null, m = null, L = !1, c = [], k = [], R = [];
  const E = () => {
    if (R.length === 0) return;
    const g = wt(R);
    R = [], g && (m ? m.table = g : k.push(...kt(g)));
  }, M = () => {
    if (E(), m && k.length > 0) {
      const g = k.join(`
`).trim();
      g && (m.extraMd = (m.extraMd ? m.extraMd + `
` : "") + g);
    }
    k = [];
  }, H = () => {
    if (M(), h && m)
      if (L) {
        const g = [
          m.entries.map(($) => `- ${$.key}: ${$.value}`).join(`
`),
          m.extraMd ?? ""
        ].filter(Boolean).join(`

`);
        g.trim() && c.push(`## ${m.label}

${g}`);
      } else if (f) {
        let g = h.envs.find(($) => $.env === f);
        g || (g = { env: f, sections: [] }, h.envs.push(g)), g.sections.push(m);
      } else
        h.common.push(m);
    m = null, f = null, L = !1;
  }, d = () => {
    H(), h && (c.length > 0 && (h.notes = c.join(`

`).trim()), c = [], x.projects.push(h)), h = null;
  };
  for (let g = 0; g < u.length; g++) {
    const $ = u[g], p = $.trim();
    if (/^\|.*\|$/.test(p)) {
      R.push(p);
      continue;
    } else R.length > 0 && E();
    if (/^---+$/.test(p)) continue;
    const N = /^#\s+(.+)$/.exec($);
    if (N) {
      d();
      const D = N[1].trim();
      D === "共通" || /^(common|shared)$/i.test(D) ? h = { name: "共通", envs: [], common: [] } : h = { name: D, envs: [], common: [] };
      continue;
    }
    const T = /^##\s+(.+)$/.exec($);
    if (T) {
      H(), h || (h = { name: "共通", envs: [], common: [] });
      const D = T[1].trim();
      if (/前提|注意|注記|note|備考/i.test(D)) {
        m = { label: D, entries: [] }, L = !0;
        continue;
      }
      const Z = /^(.+?)\s*\/\s*(.+)$/.exec(D);
      if (Z)
        f = De(Z[1].trim()), m = { label: Z[2].trim(), entries: [] };
      else {
        const O = De(D.replace(/環境$/, "").trim());
        O && /^(dev|staging|stg|prod|production|local|test)$/i.test(O) ? (f = O, m = { label: "アカウント", entries: [] }) : (f = null, m = { label: D, entries: [] });
      }
      continue;
    }
    if (h && !m) {
      const D = /^phase\s*:\s*(.+)$/i.exec(p);
      if (D) {
        h.phase = D[1].trim();
        continue;
      }
    }
    const G = /^\s*-\s+([^:]+?):\s*(.+)$/.exec($);
    if (G && m && !L) {
      const D = G[1].trim(), Z = G[2].trim().replace(/^`|`$/g, "");
      m.entries.push({
        key: D,
        value: Z,
        kind: St(D, Z)
      });
      continue;
    }
    p === "" && k.length === 0 || (m ? k.push($) : h || S.push($));
  }
  d();
  const y = S.join(`
`).trim();
  return y && (x.preamble = y), x;
}
function vt(i) {
  const r = /^---\n([\s\S]*?)\n---\n?/.exec(i);
  if (!r) return { meta: {}, body: i };
  const t = {};
  for (const u of r[1].split(`
`)) {
    const x = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(u);
    if (!x) continue;
    const S = x[1].toLowerCase(), h = x[2].trim().replace(/^["']|["']$/g, "");
    S === "title" ? t.title = h : S === "warning" && (t.warning = h);
  }
  return { meta: t, body: i.slice(r[0].length) };
}
function wt(i) {
  if (i.length < 2) return null;
  const r = (x) => x.replace(/^\|/, "").replace(/\|$/, "").split("|").map((S) => S.trim()), t = r(i[0]);
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(i[1]))
    return { headers: t, rows: i.slice(1).map(r) };
  const u = i.slice(2).map(r);
  return { headers: t, rows: u };
}
function kt(i) {
  const r = ["| " + i.headers.join(" | ") + " |"];
  r.push("| " + i.headers.map(() => "---").join(" | ") + " |");
  for (const t of i.rows) r.push("| " + t.join(" | ") + " |");
  return r;
}
function De(i) {
  const r = i.toLowerCase();
  return /^(staging|stg)$/.test(r) ? "staging" : /^(prod|production|本番)$/.test(r) ? "prod" : /^(dev|development|開発)$/.test(r) ? "dev" : /^(local|ローカル)$/.test(r) ? "local" : /^(test|テスト)$/.test(r) ? "test" : i;
}
function St(i, r) {
  const t = i.toLowerCase();
  return /pass|pwd|password|パスワード/.test(t) ? "password" : /url|link|endpoint/.test(t) || /^https?:\/\//.test(r) ? "url" : /mail|email|メール/.test(t) || /^[^\s@]+@[^\s@]+$/.test(r) ? "email" : /user|id|name|account|ユーザー/.test(t) ? "user" : "text";
}
async function Ye(i, r = typeof document < "u" ? document : null) {
  var x, S, h;
  const t = (x = r == null ? void 0 : r.defaultView) == null ? void 0 : x.navigator;
  if ((S = t == null ? void 0 : t.clipboard) != null && S.writeText)
    try {
      return await t.clipboard.writeText(i), !0;
    } catch {
    }
  if (typeof navigator < "u" && ((h = navigator.clipboard) != null && h.writeText))
    try {
      return await navigator.clipboard.writeText(i), !0;
    } catch {
    }
  const u = r ?? (typeof document < "u" ? document : null);
  if (!u) return !1;
  try {
    const f = u.createElement("textarea");
    f.value = i, f.setAttribute("readonly", ""), f.style.position = "fixed", f.style.top = "0", f.style.left = "0", f.style.width = "1px", f.style.height = "1px", f.style.opacity = "0", f.style.pointerEvents = "none", (u.body || u.documentElement).appendChild(f), f.focus(), f.select();
    const m = u.execCommand("copy");
    return f.remove(), m;
  } catch {
    return !1;
  }
}
const _e = rt(null);
function $t({ md: i, pipDocument: r = null }) {
  const t = fe(() => yt(i), [i]), [u, x] = w(
    () => new Set(t.projects.map((h) => h.name))
  ), S = V((h) => {
    x((f) => {
      const m = new Set(f);
      return m.has(h) ? m.delete(h) : m.add(h), m;
    });
  }, []);
  return /* @__PURE__ */ e(_e.Provider, { value: r, children: /* @__PURE__ */ n("div", { className: "debug-env-tab", children: [
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
    t.preamble && /* @__PURE__ */ e("div", { style: { marginBottom: "10px", fontSize: "12px" }, children: /* @__PURE__ */ e(Fe, { content: t.preamble }) }),
    t.projects.length === 0 && /* @__PURE__ */ e("div", { className: "debug-empty", children: "環境情報が空です" }),
    t.projects.map((h) => /* @__PURE__ */ e(
      zt,
      {
        project: h,
        isExpanded: u.has(h.name),
        onToggle: () => S(h.name)
      },
      h.name
    ))
  ] }) });
}
function zt({
  project: i,
  isExpanded: r,
  onToggle: t
}) {
  var h;
  const u = i.envs.map((f) => f.env), [x, S] = w(u[0] ?? null);
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
          i.common.map((f, m) => /* @__PURE__ */ e(je, { section: f }, `common-${m}`)),
          i.envs.length > 0 && /* @__PURE__ */ n(he, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "4px",
                  marginBottom: "8px",
                  borderBottom: `1px solid ${s.gray200}`
                },
                children: i.envs.map((f) => /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: () => S(f.env),
                    style: {
                      padding: "6px 12px",
                      background: "transparent",
                      border: "none",
                      borderBottom: x === f.env ? `2px solid ${s.primary}` : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: x === f.env ? 600 : 400,
                      color: x === f.env ? s.primary : s.gray700
                    },
                    children: f.env
                  },
                  f.env
                ))
              }
            ),
            (h = i.envs.find((f) => f.env === x)) == null ? void 0 : h.sections.map((f, m) => /* @__PURE__ */ e(je, { section: f }, `${x}-${m}`))
          ] }),
          i.notes && /* @__PURE__ */ n("details", { style: { marginTop: "10px" }, children: [
            /* @__PURE__ */ e("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600, color: s.gray700 }, children: "📝 前提・注意点" }),
            /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Fe, { content: i.notes }) })
          ] })
        ] })
      ]
    }
  );
}
function je({ section: i }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "10px" }, children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, color: s.gray700, marginBottom: "4px" }, children: i.label }),
    i.entries.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: i.entries.map((r, t) => /* @__PURE__ */ e(Ct, { entry: r }, t)) }),
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
      /* @__PURE__ */ e("tbody", { children: i.table.rows.map((r, t) => /* @__PURE__ */ e("tr", { children: r.map((u, x) => /* @__PURE__ */ e(
        It,
        {
          value: u,
          header: i.table.headers[x] ?? ""
        },
        x
      )) }, t)) })
    ] }) }),
    i.extraMd && /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Fe, { content: i.extraMd }) })
  ] });
}
function Ct({ entry: i }) {
  const r = Ue(_e), [t, u] = w(!1), [x, S] = w(!1), h = async () => {
    await Ye(i.value, r) && (S(!0), setTimeout(() => S(!1), 1200));
  }, f = i.kind === "password", m = f && !t ? "•".repeat(Math.min(i.value.length, 10)) : i.value, L = i.kind === "url" ? "link" : i.kind === "email" ? "mail" : i.kind === "password" ? "key" : i.kind === "user" ? "person" : "label";
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
        /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px", color: s.gray500 }, children: L }),
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
        f && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => u((c) => !c),
            title: t ? "隠す" : "表示",
            style: xe,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: t ? "visibility_off" : "visibility" })
          }
        ),
        i.kind === "url" && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => window.open(i.value, "_blank", "noopener"),
            title: "開く",
            style: xe,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "open_in_new" })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: h,
            title: x ? "コピーしました" : "コピー",
            style: { ...xe, color: x ? s.success : xe.color },
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: x ? "check" : "content_copy" })
          }
        )
      ]
    }
  );
}
function It({ value: i, header: r }) {
  const t = Ue(_e), u = /pass|pwd|パスワード/i.test(r), x = /^https?:\/\//.test(i), S = /^[^\s@]+@[^\s@]+$/.test(i), [h, f] = w(!1), [m, L] = w(!1), c = async () => {
    await Ye(i, t) && (L(!0), setTimeout(() => L(!1), 1200));
  }, k = u && !h ? "•".repeat(Math.min(i.length, 10)) : i;
  return /* @__PURE__ */ e(
    "td",
    {
      style: {
        padding: "4px 6px",
        borderBottom: `1px solid ${s.gray200}`,
        fontFamily: u ? "monospace" : "inherit",
        wordBreak: "break-all"
      },
      children: /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
        x ? /* @__PURE__ */ e("a", { href: i, target: "_blank", rel: "noopener noreferrer", style: { color: s.primary, flex: 1 }, children: i }) : S ? /* @__PURE__ */ e("span", { style: { flex: 1 }, children: i }) : /* @__PURE__ */ e("span", { style: { flex: 1 }, children: k }),
        u && /* @__PURE__ */ e("button", { type: "button", onClick: () => f((R) => !R), style: xe, title: h ? "隠す" : "表示", children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: h ? "visibility_off" : "visibility" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: c,
            style: { ...xe, color: m ? s.success : xe.color },
            title: m ? "コピーしました" : "コピー",
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: m ? "check" : "content_copy" })
          }
        )
      ] })
    }
  );
}
const xe = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  color: s.gray500,
  display: "inline-flex",
  alignItems: "center"
}, Ft = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
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
}, Oe = {
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
    background: s.white,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  }
};
function Rt() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${s.white};
      font-size: 14px;
      color: ${s.gray900};
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
function Bt({
  apiBaseUrl: i,
  env: r = "dev",
  onSave: t,
  onClose: u,
  initialSize: x = { width: 400, height: 500 },
  testCases: S,
  logCapture: h,
  manualItems: f,
  manualDefaultPath: m,
  onManualNavigate: L,
  onManualAppNavigate: c,
  environmentsMd: k
}) {
  var Le, We;
  const [R, E] = w(null), [M, H] = w(null), [d, y] = w(!1), g = ce(!1), [$, p] = w("record"), N = S && S.length > 0, T = f && f.length > 0, G = !!k && k.trim().length > 0, [D, Z] = w(""), [O, j] = w(""), [te, X] = w(""), [v, I] = w(!1), [b, J] = w(!1), [B, a] = w(!1), [C, W] = w(!1), [P, q] = w(!1), [K, Q] = w([]), [Y, l] = w(null), [_, ne] = w([]), [oe, be] = w(!1), Se = ce(null);
  ie(() => {
    i && Ne(i);
  }, [i]);
  const { notes: Re, createNote: $e, updateStatus: Be, refresh: ye, error: ze } = Ze(r), o = ce(ze);
  o.current = ze;
  const z = V(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported"), y(!0);
      return;
    }
    if (!g.current) {
      g.current = !0;
      try {
        const A = await window.documentPictureInPicture.requestWindow({
          width: x.width,
          height: x.height
        }), le = A.document.createElement("style");
        le.textContent = Rt(), A.document.head.appendChild(le);
        const me = A.document.createElement("div");
        me.id = "debug-panel-root", A.document.body.appendChild(me), E(A), H(me), y(!0), A.addEventListener("pagehide", () => {
          E(null), H(null), y(!1), u == null || u();
        });
      } catch (A) {
        console.error("Failed to open PiP window:", A), y(!0);
      } finally {
        g.current = !1;
      }
    }
  }, [x.width, x.height, u]), U = V(() => {
    R ? R.close() : (y(!1), u == null || u());
  }, [R, u]), ae = ce(R);
  ae.current = R, ie(() => () => {
    var A;
    (A = ae.current) == null || A.close();
  }, []);
  const ve = V(() => {
    Z(""), j(""), X(""), Q([]), J(!1), a(!1), W(!1), q(!1), l(null);
  }, []), et = V(async () => {
    var Me;
    if (!D.trim()) {
      l({ type: "error", text: "内容は必須です" });
      return;
    }
    I(!0), l(null);
    const le = ((h == null ? void 0 : h.getNetworkLogs()) ?? []).map((ee) => {
      const pe = {
        timestamp: ee.timestamp,
        method: ee.method,
        url: ee.url,
        status: ee.status
      }, Ae = ["POST", "PUT", "DELETE", "PATCH"].includes(ee.method);
      return Ae && (ee.requestBody !== void 0 && (pe.requestBody = ee.requestBody), ee.responseBody !== void 0 && (pe.responseBody = ee.responseBody)), !Ae && B && ee.responseBody !== void 0 && (pe.responseBody = ee.responseBody), C && ee.duration != null && (pe.duration = ee.duration), P && (ee.requestHeaders && (pe.requestHeaders = ee.requestHeaders), ee.responseHeaders && (pe.responseHeaders = ee.responseHeaders)), pe;
    }), me = {
      content: D.trim(),
      userLog: O ? gt(O) : void 0,
      severity: te || void 0,
      testCaseIds: _.length > 0 ? _ : void 0,
      consoleLogs: h == null ? void 0 : h.getConsoleLogs(),
      networkLogs: le.length > 0 ? le : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, we = await $e(me);
    if (we) {
      if (K.length > 0)
        try {
          for (const ee of K)
            await re.uploadAttachment(r, we.id, ee);
        } catch (ee) {
          console.warn("Failed to upload some attachments:", ee), l({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), I(!1);
          return;
        }
      l({ type: "success", text: "保存しました" }), t == null || t(we), setTimeout(() => {
        ve();
      }, 1500);
    } else
      l({ type: "error", text: ((Me = o.current) == null ? void 0 : Me.message) || "保存に失敗しました" });
    I(!1);
  }, [D, O, te, _, K, B, C, P, $e, t, ve, h, r]), tt = V(async () => {
    var A;
    be(!0);
    try {
      $ === "manage" ? ye() : $ === "test" && await ((A = Se.current) == null ? void 0 : A.refresh());
    } finally {
      be(!1);
    }
  }, [$, ye]), Ee = /* @__PURE__ */ n("div", { className: "debug-panel", children: [
    /* @__PURE__ */ n("header", { className: "debug-header", children: [
      /* @__PURE__ */ n("div", { className: "debug-header-left", children: [
        /* @__PURE__ */ e("span", { className: "debug-icon", children: "edit_note" }),
        /* @__PURE__ */ e("span", { className: "debug-title", children: "デバッグノート" }),
        /* @__PURE__ */ e("span", { className: "debug-env", children: r })
      ] }),
      /* @__PURE__ */ n("div", { className: "debug-header-right", children: [
        $ !== "record" && /* @__PURE__ */ e(
          "button",
          {
            className: "debug-refresh-btn",
            onClick: tt,
            disabled: oe,
            title: "データを更新",
            children: /* @__PURE__ */ e(
              "span",
              {
                className: "debug-icon",
                style: {
                  fontSize: "18px",
                  animation: oe ? "spin 0.6s linear infinite" : "none"
                },
                children: "sync"
              }
            )
          }
        ),
        /* @__PURE__ */ e("button", { onClick: U, className: "debug-close-btn", "aria-label": "閉じる", children: /* @__PURE__ */ e("span", { className: "debug-icon", children: "close" }) })
      ] })
    ] }),
    /* @__PURE__ */ n("nav", { className: "debug-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "record" ? "active" : ""}`,
          onClick: () => {
            p("record"), l(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "manage" ? "active" : ""}`,
          onClick: () => p("manage"),
          children: "管理"
        }
      ),
      N && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "test" ? "active" : ""}`,
          onClick: () => p("test"),
          children: "テスト"
        }
      ),
      T && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "manual" ? "active" : ""}`,
          onClick: () => p("manual"),
          children: "マニュアル"
        }
      ),
      G && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "env" ? "active" : ""}`,
          onClick: () => p("env"),
          children: "環境"
        }
      )
    ] }),
    /* @__PURE__ */ n("main", { className: "debug-content", children: [
      $ === "record" && /* @__PURE__ */ n(he, { children: [
        _.length > 0 && /* @__PURE__ */ n(
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
                _.map((A) => `#${A}`).join(", ")
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => ne([]),
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
        Y && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${Y.type}`, children: Y.text }),
        /* @__PURE__ */ n("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-severity", children: "重要度（任意）" }),
          /* @__PURE__ */ n(
            "select",
            {
              id: "debug-severity",
              value: te,
              onChange: (A) => X(A.target.value),
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
              value: D,
              onChange: (A) => Z(A.target.value),
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
              value: O,
              onChange: (A) => j(A.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          Xe,
          {
            files: K,
            onAdd: (A) => Q((le) => [...le, ...A]),
            onRemove: (A) => Q((le) => le.filter((me, we) => we !== A)),
            disabled: v,
            pipDocument: ((Le = ae.current) == null ? void 0 : Le.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => J(!b),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: b ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        b && /* @__PURE__ */ n("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: B,
                onChange: (A) => a(A.target.checked)
              }
            ),
            "GETレスポンスを含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: C,
                onChange: (A) => W(A.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: P,
                onChange: (A) => q(A.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      $ === "manage" && /* @__PURE__ */ e(ft, { notes: Re, updateStatus: Be }),
      $ === "manual" && T && /* @__PURE__ */ e(
        mt,
        {
          items: f,
          defaultPath: m,
          onNavigate: L,
          onAppNavigate: c
        }
      ),
      $ === "env" && G && /* @__PURE__ */ e($t, { md: k, pipDocument: ((We = ae.current) == null ? void 0 : We.document) ?? null }),
      $ === "test" && N && /* @__PURE__ */ e(
        bt,
        {
          ref: Se,
          testCases: S,
          env: r,
          logCapture: h,
          onNotesRefresh: ye,
          onRunningCasesChange: ne
        }
      )
    ] }),
    $ === "record" && /* @__PURE__ */ n("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: ve, className: "debug-btn debug-btn-secondary", disabled: v, children: "クリア" }),
      /* @__PURE__ */ e("button", { onClick: et, className: "debug-btn debug-btn-primary", disabled: v, children: v ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
  return M ? ut(Ee, M) : d ? /* @__PURE__ */ e("div", { style: Oe.overlay, children: /* @__PURE__ */ e("div", { style: Oe.panel, children: Ee }) }) : /* @__PURE__ */ e("button", { onClick: z, style: Ft, "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ n("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
    "バグ",
    /* @__PURE__ */ e("br", {}),
    "記録"
  ] }) });
}
function se({ size: i = 16, color: r }) {
  return /* @__PURE__ */ n(he, { children: [
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
function F({ name: i, size: r = 20, color: t }) {
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
const Tt = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, Nt = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function _t({ domains: i, colors: r, isDarkMode: t }) {
  const u = t ? Nt : Tt;
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
    }, children: i.map((x) => /* @__PURE__ */ e(
      Et,
      {
        domain: x,
        colors: r,
        tc: u
      },
      x.domain
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
          background: u.passed
        } }),
        "passed"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: u.fail
        } }),
        "fail / 要対応"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: u.retest
        } }),
        "retest"
      ] }),
      /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
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
function Et({ domain: i, colors: r, tc: t }) {
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
    /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: i.capabilities.map((u) => /* @__PURE__ */ e(
      Lt,
      {
        cap: u,
        colors: r,
        tc: t
      },
      u.capability
    )) })
  ] });
}
function Lt({ cap: i, colors: r, tc: t }) {
  const u = i.status === "fail" ? t.fail : i.status === "retest" ? t.retest : i.status === "passed" ? t.passed : t.untested, x = i.status === "fail" ? t.failBg : i.status === "retest" ? t.retestBg : i.status === "passed" ? t.passedBg : t.untestedBg;
  return /* @__PURE__ */ n("div", { style: {
    borderLeft: `4px solid ${u}`,
    background: x,
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
const Wt = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, Mt = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function At({ tree: i, colors: r, isDarkMode: t, onNavigateToNote: u }) {
  const x = t ? Mt : Wt, [S, h] = w(/* @__PURE__ */ new Set()), [f, m] = w(/* @__PURE__ */ new Set());
  ie(() => {
    h((d) => {
      const y = new Set(d);
      return i.forEach((g) => y.add(g.domain)), y;
    });
  }, [i]);
  const [L, c] = w("all"), [k, R] = w(!1), E = (d) => {
    h((y) => {
      const g = new Set(y);
      return g.has(d) ? g.delete(d) : g.add(d), g;
    });
  }, M = (d) => {
    m((y) => {
      const g = new Set(y);
      return g.has(d) ? g.delete(d) : g.add(d), g;
    });
  }, H = fe(() => i.map((d) => {
    const y = d.capabilities.filter((g) => {
      const $ = g.passed === g.total && g.total > 0, p = g.failed > 0 || g.openIssues > 0, N = g.passed < g.total;
      return !(L === "passed" && !$ || L === "fail" && !p || L === "incomplete" && !N || k && $ && g.openIssues === 0);
    });
    return y.length === 0 ? null : { ...d, capabilities: y };
  }).filter((d) => d !== null), [i, L, k]);
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
          value: L,
          onChange: (d) => c(d.target.value),
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
            onChange: (d) => R(d.target.checked),
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
      H.map((d, y) => {
        const g = S.has(d.domain), $ = d.capabilities.reduce((T, G) => T + G.total, 0), p = d.capabilities.reduce((T, G) => T + G.passed, 0), N = $ > 0 ? Math.round(p / $ * 100) : 0;
        return /* @__PURE__ */ n("div", { children: [
          /* @__PURE__ */ n(
            "div",
            {
              onClick: () => E(d.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: r.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${r.border}`,
                borderTop: y > 0 ? `1px solid ${r.border}` : "none",
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
                }, children: d.domain }),
                /* @__PURE__ */ n("span", { style: {
                  fontSize: "13px",
                  color: r.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  p,
                  "/",
                  $,
                  " ",
                  N,
                  "%"
                ] })
              ]
            }
          ),
          g && d.capabilities.map((T) => {
            const G = `${d.domain}/${T.capability}`, D = f.has(G), Z = T.passed === T.total && T.total > 0, O = T.cases.some((b) => b.last === "fail" && b.openIssues > 0), j = T.cases.some((b) => b.last === "fail" && b.openIssues === 0), te = !O && j, X = O, v = Z ? "●" : X ? "▲" : te ? "◆" : "○", I = Z ? x.passed : X ? x.fail : te ? x.retest : x.untested;
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => M(G),
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
                    /* @__PURE__ */ e("span", { style: { color: I, fontSize: "14px", width: "16px" }, children: v }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: r.text,
                      flex: 1
                    }, children: T.capability }),
                    /* @__PURE__ */ n("span", { style: {
                      fontSize: "12px",
                      color: r.textMuted,
                      fontVariantNumeric: "tabular-nums"
                    }, children: [
                      T.passed,
                      "/",
                      T.total
                    ] }),
                    Z && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: x.passed,
                      fontWeight: 600
                    }, children: "passed" }),
                    X && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: x.fail,
                      fontWeight: 600
                    }, children: "fail" }),
                    te && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: x.retest,
                      fontWeight: 600
                    }, children: "retest" }),
                    T.openIssues > 0 && /* @__PURE__ */ n("span", { style: {
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${x.fail}18`,
                      color: x.fail,
                      fontWeight: 600
                    }, children: [
                      T.openIssues,
                      "件"
                    ] })
                  ]
                }
              ),
              D && T.cases.map((b) => /* @__PURE__ */ e(
                Dt,
                {
                  c: b,
                  tc: x,
                  colors: r,
                  onNavigateToNote: u
                },
                b.caseId
              ))
            ] }, G);
          })
        ] }, d.domain);
      }),
      H.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: r.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function Dt({ c: i, tc: r, colors: t, onNavigateToNote: u }) {
  const x = i.last === "fail" && i.openIssues === 0, S = i.last === "pass" ? "●" : x ? "◆" : i.last === "fail" ? "▲" : "○", h = i.last === "pass" ? r.passed : x ? r.retest : i.last === "fail" ? r.fail : r.untested;
  return /* @__PURE__ */ n("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: t.bg,
    borderBottom: `1px solid ${t.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: h, fontSize: "12px", width: "16px" }, children: S }),
    /* @__PURE__ */ e("span", { style: { color: t.text, flex: 1 }, children: i.title }),
    /* @__PURE__ */ e("span", { style: {
      fontSize: "11px",
      color: t.textMuted
    }, children: i.last || "-" }),
    i.openIssues > 0 && /* @__PURE__ */ n(
      "button",
      {
        onClick: (f) => {
          f.stopPropagation(), u(i.caseId);
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
const jt = 3e4;
function Ot({ env: i, colors: r, isDarkMode: t, onNavigateToNote: u, refreshKey: x }) {
  const [S, h] = w([]), [f, m] = w(!0), [L, c] = w(null), k = ce(0);
  ie(() => {
    let E = !1;
    const M = ++k.current, H = async () => {
      try {
        const y = await re.getTestTree(i);
        !E && k.current === M && (h(y), c(null));
      } catch (y) {
        !E && k.current === M && c(y instanceof Error ? y.message : "Failed to fetch test tree");
      } finally {
        !E && k.current === M && m(!1);
      }
    };
    m(!0), H();
    const d = setInterval(H, jt);
    return () => {
      E = !0, clearInterval(d);
    };
  }, [i, x]);
  const R = fe(() => S.map((E) => {
    let M = 0, H = 0, d = 0, y = !1;
    const g = E.capabilities.map((p) => {
      const N = p.total - p.passed - p.failed;
      M += p.total, H += p.passed, d += p.failed, (p.failed > 0 || p.openIssues > 0) && (y = !0);
      const T = p.passed === p.total && p.total > 0, G = p.cases.some((O) => O.last === "fail" && O.openIssues > 0), D = p.cases.some((O) => O.last === "fail" && O.openIssues === 0), Z = T ? "passed" : G ? "fail" : D ? "retest" : "incomplete";
      return {
        capability: p.capability,
        total: p.total,
        passed: p.passed,
        failed: p.failed,
        untested: N < 0 ? 0 : N,
        openIssues: p.openIssues,
        status: Z,
        cases: p.cases
      };
    }), $ = M - H - d;
    return {
      domain: E.domain,
      total: M,
      passed: H,
      failed: d,
      untested: $ < 0 ? 0 : $,
      hasIssues: y,
      capabilities: g
    };
  }), [S]);
  return f && S.length === 0 ? /* @__PURE__ */ n("div", { style: {
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
  ] }) : L && S.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "24px",
    background: r.errorBg,
    color: r.error,
    borderRadius: "12px",
    margin: "24px",
    fontSize: "13px"
  }, children: L }) : /* @__PURE__ */ e("div", { style: {
    padding: "32px",
    overflow: "auto",
    flex: 1
  }, children: /* @__PURE__ */ n("div", { style: { maxWidth: "1200px" }, children: [
    /* @__PURE__ */ e(
      _t,
      {
        domains: R,
        colors: r,
        isDarkMode: t
      }
    ),
    /* @__PURE__ */ e(
      At,
      {
        tree: S,
        colors: r,
        isDarkMode: t,
        onNavigateToNote: u
      }
    )
  ] }) });
}
const Ce = {
  bug: { label: "不具合", icon: "bug_report" },
  question: { label: "質問", icon: "help" },
  request: { label: "要望", icon: "lightbulb" },
  share: { label: "共有", icon: "share" },
  other: { label: "その他", icon: "more_horiz" }
}, Pt = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, Te = {
  app: "アプリ",
  manual: "マニュアル"
}, Pe = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function He(i) {
  const r = Pt[i] ?? "#6B7280";
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
function qe(i, r) {
  let t, u;
  switch (i) {
    case "open":
      t = r.warningBg, u = r.warning;
      break;
    case "in_progress":
      t = r.primaryLight, u = r.primary;
      break;
    case "closed":
      t = r.successBg, u = r.success;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: t,
    color: u,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function Ht({ apiBaseUrl: i, adminKey: r, colors: t, isDarkMode: u, refreshKey: x }) {
  var K, Q, Y;
  const {
    feedbacks: S,
    total: h,
    page: f,
    limit: m,
    loading: L,
    error: c,
    filters: k,
    customTags: R,
    setFilters: E,
    setPage: M,
    updateStatus: H,
    remove: d,
    refresh: y
  } = lt({ apiBaseUrl: i, adminKey: r }), [g, $] = w(null), [p, N] = w(null), [T, G] = w(!1), [D, Z] = w(null), [O, j] = w(null), te = ce(0), X = ce(x);
  ie(() => {
    x !== X.current && (X.current = x, y());
  }, [x, y]);
  const v = Math.max(1, Math.ceil(h / m)), I = V(async (l) => {
    if (g === l) return;
    $(l), G(!0), N(null);
    const _ = ++te.current;
    try {
      const ne = await dt({ apiBaseUrl: i, adminKey: r, id: l });
      if (te.current !== _) return;
      N(ne);
    } catch {
      if (te.current !== _) return;
      N(null);
    }
    te.current === _ && G(!1);
  }, [g, i, r]), b = V(async (l, _) => {
    await H(l, _) && (p == null ? void 0 : p.id) === l && N((oe) => oe ? { ...oe, status: _ } : null);
  }, [H, p == null ? void 0 : p.id]), J = V(async (l) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await d(l) && g === l && ($(null), N(null));
  }, [d, g]), B = V(async (l, _) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await ct({ apiBaseUrl: i, adminKey: r, feedbackId: l, attachmentId: _ }), N((ne) => {
          var oe;
          return !ne || ne.id !== l ? ne : {
            ...ne,
            attachments: (oe = ne.attachments) == null ? void 0 : oe.filter((be) => be.id !== _)
          };
        });
      } catch (ne) {
        console.error("Failed to delete attachment:", ne);
      }
  }, [i, r]), a = V((l) => {
    try {
      const _ = new URL(i);
      return `${_.origin}${_.pathname.replace(/\/$/, "")}/attachments/${l}`;
    } catch {
      return `${i}/attachments/${l}`;
    }
  }, [i]), C = V(async (l) => {
    j(l);
    try {
      await pt({ apiBaseUrl: i, adminKey: r, format: l });
    } catch (_) {
      console.error("Export failed:", _);
    } finally {
      j(null);
    }
  }, [i, r]), W = {
    open: S.filter((l) => l.status === "open").length,
    inProgress: S.filter((l) => l.status === "in_progress").length,
    closed: S.filter((l) => l.status === "closed").length
  }, P = u ? "#0D1117" : "#1E293B", q = u ? "#21262D" : "#2D3748";
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
            onChange: (l) => E({ status: l.target.value }),
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
              Pe.map((l) => /* @__PURE__ */ e("option", { value: l.value, children: l.label }, l.value))
            ]
          }
        ),
        /* @__PURE__ */ n(
          "select",
          {
            value: k.kind,
            onChange: (l) => E({ kind: l.target.value }),
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
            onChange: (l) => E({ target: l.target.value }),
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
        R.length > 0 && /* @__PURE__ */ n(
          "select",
          {
            value: k.customTag,
            onChange: (l) => E({ customTag: l.target.value }),
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
              R.map((l) => /* @__PURE__ */ e("option", { value: l, children: l }, l))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", padding: "12px" }, children: [
        L && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: t.textMuted }, children: [
          /* @__PURE__ */ e(se, { size: 24, color: t.primary }),
          /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
        ] }),
        c && /* @__PURE__ */ e("div", { style: {
          padding: "16px",
          background: t.errorBg,
          color: t.error,
          borderRadius: "12px",
          margin: "8px",
          fontSize: "13px"
        }, children: c.message }),
        !L && S.length === 0 && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: t.textMuted }, children: [
          /* @__PURE__ */ e(F, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        S.map((l) => {
          const _ = Ce[l.kind] ?? { label: l.kind, icon: "help" }, ne = g === l.id;
          return /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: t.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: ne ? `2px solid ${t.primary}` : "2px solid transparent",
                boxShadow: ne ? `0 4px 12px ${t.primary}30` : `0 1px 3px ${t.border}`,
                transition: "all 0.2s"
              },
              onClick: () => I(l.id),
              children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ n("span", { style: { fontSize: "11px", color: t.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    l.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: He(l.kind), children: [
                    /* @__PURE__ */ e(F, { name: _.icon, size: 12 }),
                    _.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: qe(l.status, t), children: l.status === "open" ? "Open" : l.status === "in_progress" ? "対応中" : "完了" }),
                  l.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: t.bgTertiary,
                    color: t.textSecondary,
                    fontWeight: 500
                  }, children: Te[l.target] ?? l.target }),
                  l.customTag && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${t.primary}15`,
                    color: t.primary,
                    fontWeight: 500
                  }, children: l.customTag })
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
                }, children: l.message.split(`
`)[0].slice(0, 80) }),
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: t.textMuted
                }, children: [
                  /* @__PURE__ */ e("span", { children: qt(l.createdAt) }),
                  l.pageUrl && /* @__PURE__ */ n(he, { children: [
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
                      /* @__PURE__ */ e(F, { name: "link", size: 12 }),
                      l.pageUrl
                    ] })
                  ] }),
                  (l.attachmentCount ?? 0) > 0 && /* @__PURE__ */ n(he, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ n("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "11px",
                      color: t.textMuted
                    }, children: [
                      /* @__PURE__ */ e(F, { name: "image", size: 12 }),
                      l.attachmentCount
                    ] })
                  ] })
                ] })
              ]
            },
            l.id
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
            onClick: () => M(f - 1),
            disabled: f <= 1,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: t.bg,
              color: f <= 1 ? t.textMuted : t.text,
              cursor: f <= 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: /* @__PURE__ */ e(F, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ n("span", { style: { fontSize: "13px", color: t.textSecondary }, children: [
          f,
          " / ",
          v
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => M(f + 1),
            disabled: f >= v,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: t.bg,
              color: f >= v ? t.textMuted : t.text,
              cursor: f >= v ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${t.border}`
            },
            children: /* @__PURE__ */ e(F, { name: "chevron_right", size: 16 })
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
          /* @__PURE__ */ e(F, { name: "description", size: 16 }),
          h,
          " 件"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(F, { name: "error", size: 16, color: t.warning }),
          W.open,
          " Open"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(F, { name: "pending", size: 16, color: t.primary }),
          W.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(F, { name: "check_circle", size: 16, color: t.success }),
          W.closed,
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
      g && T && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: t.textMuted }, children: [
        /* @__PURE__ */ e(se, { size: 32, color: t.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      g && !T && p && /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ n("span", { style: He(p.kind), children: [
                /* @__PURE__ */ e(F, { name: ((K = Ce[p.kind]) == null ? void 0 : K.icon) ?? "help", size: 14 }),
                ((Q = Ce[p.kind]) == null ? void 0 : Q.label) ?? p.kind
              ] }),
              /* @__PURE__ */ e("span", { style: qe(p.status, t), children: p.status === "open" ? "Open" : p.status === "in_progress" ? "対応中" : "完了" }),
              p.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: t.bgTertiary,
                color: t.textSecondary,
                fontWeight: 500
              }, children: Te[p.target] ?? p.target }),
              p.customTag && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: `${t.primary}15`,
                color: t.primary,
                fontWeight: 600
              }, children: p.customTag })
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
              p.id,
              " フィードバック"
            ] })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ e(
              "select",
              {
                value: p.status,
                onChange: (l) => b(p.id, l.target.value),
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
                children: Pe.map((l) => /* @__PURE__ */ e("option", { value: l.value, children: l.label }, l.value))
              }
            ),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => J(p.id),
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
                  /* @__PURE__ */ e(F, { name: "delete", size: 16 }),
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
          /* @__PURE__ */ e(ue, { icon: "category", label: "種別", value: ((Y = Ce[p.kind]) == null ? void 0 : Y.label) ?? p.kind, colors: t }),
          /* @__PURE__ */ e(ue, { icon: "ads_click", label: "対象", value: p.target ? Te[p.target] ?? p.target : "-", colors: t }),
          /* @__PURE__ */ e(ue, { icon: "schedule", label: "日時", value: Vt(p.createdAt), colors: t }),
          p.pageUrl && /* @__PURE__ */ e(ue, { icon: "link", label: "URL", value: p.pageUrl, isLink: !0, colors: t }),
          p.userType && /* @__PURE__ */ e(ue, { icon: "person", label: "ユーザー", value: p.userType, colors: t }),
          p.appVersion && /* @__PURE__ */ e(ue, { icon: "inventory_2", label: "バージョン", value: p.appVersion, colors: t })
        ] }),
        /* @__PURE__ */ e(ke, { icon: "chat", title: "メッセージ", colors: t, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: t.text
        }, children: p.message }) }),
        p.environment && Object.keys(p.environment).length > 0 && /* @__PURE__ */ e(ke, { icon: "devices", title: "環境情報", colors: t, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: Object.entries(p.environment).map(([l, _]) => /* @__PURE__ */ e(ue, { icon: "info", label: l, value: String(_), colors: t }, l)) }) }),
        p.consoleLogs && p.consoleLogs.length > 0 && /* @__PURE__ */ e(ke, { icon: "terminal", title: `コンソールログ (${p.consoleLogs.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: P }, children: p.consoleLogs.map((l, _) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${q}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: l.level === "error" ? "#F87171" : l.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: l.level === "error" ? "#7F1D1D40" : l.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: l.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: l.message })
        ] }, _)) }) }),
        p.networkLogs && p.networkLogs.length > 0 && /* @__PURE__ */ e(ke, { icon: "wifi", title: `ネットワークログ (${p.networkLogs.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: P }, children: p.networkLogs.map((l, _) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${q}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ e("span", { style: { fontWeight: 600, color: "#94A3B8", width: "40px", flexShrink: 0 }, children: l.method }),
          /* @__PURE__ */ e("span", { style: { color: l.status >= 400 ? "#F87171" : "#34D399", fontWeight: 600, flexShrink: 0 }, children: l.status }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: l.url }),
          /* @__PURE__ */ e("span", { style: { color: "#64748B", flexShrink: 0 }, children: l.duration != null ? `${l.duration}ms` : "-" })
        ] }, _)) }) }),
        p.attachments && p.attachments.length > 0 && /* @__PURE__ */ e(ke, { icon: "image", title: `添付画像 (${p.attachments.length}件)`, colors: t, children: /* @__PURE__ */ e("div", { style: {
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }, children: p.attachments.map((l) => /* @__PURE__ */ n("div", { style: {
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
              src: a(l.filename),
              alt: l.original_name,
              style: {
                width: "100%",
                height: "100px",
                objectFit: "cover",
                cursor: "pointer",
                display: "block"
              },
              onClick: () => Z(a(l.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => B(p.id, l.id),
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
              children: /* @__PURE__ */ e(F, { name: "close", size: 14 })
            }
          ),
          /* @__PURE__ */ e("div", { style: {
            padding: "6px 8px",
            fontSize: "11px",
            color: t.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: l.original_name })
        ] }, l.id)) }) }),
        D && /* @__PURE__ */ e(
          "div",
          {
            onClick: () => Z(null),
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
                src: D,
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
      g && !T && !p && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: t.textMuted }, children: [
        /* @__PURE__ */ e(F, { name: "error_outline", size: 48 }),
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
            /* @__PURE__ */ e(F, { name: "analytics", size: 18 }),
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
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.warning }, children: W.open }),
              " Open"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.primary }, children: W.inProgress }),
              " 対応中"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: t.success }, children: W.closed }),
              " 完了"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }, children: ["json", "csv", "sqlite"].map((l) => /* @__PURE__ */ n(
            "button",
            {
              onClick: () => C(l),
              disabled: O !== null,
              style: {
                padding: "8px 14px",
                background: t.bg,
                border: "none",
                borderRadius: "10px",
                cursor: O !== null ? "not-allowed" : "pointer",
                color: t.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: O !== null && O !== l ? 0.5 : 1,
                boxShadow: `0 1px 3px ${t.border}`,
                transition: "all 0.2s"
              },
              children: [
                O === l ? /* @__PURE__ */ e(se, { size: 14, color: t.text }) : /* @__PURE__ */ e(F, { name: "download", size: 16 }),
                l.toUpperCase()
              ]
            },
            l
          )) })
        ] }),
        /* @__PURE__ */ n("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ e(F, { name: "arrow_back", size: 48 }),
          /* @__PURE__ */ e("div", { style: { fontSize: "16px", fontWeight: 500, marginTop: "12px" }, children: "フィードバックを選択してください" }),
          /* @__PURE__ */ e("div", { style: { fontSize: "13px", marginTop: "6px" }, children: "左のリストから選択すると詳細が表示されます" })
        ] })
      ] })
    ] })
  ] });
}
function ue({ icon: i, label: r, value: t, isLink: u, colors: x }) {
  return /* @__PURE__ */ n("div", { style: {
    padding: "16px",
    background: x.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "12px",
      color: x.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(F, { name: i, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: u ? x.link : x.text,
      fontFamily: u ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: t })
  ] });
}
function ke({ icon: i, title: r, children: t, colors: u }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ n("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: u.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(F, { name: i, size: 18 }),
      r
    ] }),
    t
  ] });
}
function qt(i) {
  const r = new Date(i), t = r.getMonth() + 1, u = r.getDate(), x = r.getHours().toString().padStart(2, "0"), S = r.getMinutes().toString().padStart(2, "0");
  return `${t}/${u} ${x}:${S}`;
}
function Vt(i) {
  return new Date(i).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Gt = {
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
}, Jt = {
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
}, Kt = 3e4;
function dn({ apiBaseUrl: i, env: r = "dev", feedbackApiBaseUrl: t, feedbackAdminKey: u }) {
  const [x, S] = w(""), [h, f] = w(""), [m, L] = w(""), [c, k] = w(null), [R, E] = w(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [M, H] = w(!0), [d, y] = w(null), [g, $] = w("notes"), p = !!(t && u), [N, T] = w(null), [G, D] = w(0), [Z, O] = w(null), [j, te] = w(null), [X, v] = w(""), [I, b] = w(""), [J, B] = w(!1), a = R ? Jt : Gt;
  ie(() => {
    i && Ne(i);
  }, [i]), ie(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(prefers-color-scheme: dark)"), z = (U) => E(U.matches);
    return o.addEventListener("change", z), () => o.removeEventListener("change", z);
  }, []);
  const { notes: C, loading: W, error: P, updateStatus: q, updateSeverity: K, deleteNote: Q, refresh: Y } = Ze(r);
  ie(() => {
    !W && d === "refresh" && y(null);
  }, [W, d]), ie(() => {
    if (c) {
      const o = C.find((z) => z.id === c.id);
      k(o || null);
    }
  }, [C]), ie(() => {
    if (!M) return;
    const o = setInterval(() => {
      Y();
    }, Kt);
    return () => clearInterval(o);
  }, [M, Y]);
  const l = V((o) => {
    const U = `${i || ot()}/export/${o}?env=${r}`;
    window.open(U, "_blank");
  }, [i, r]), _ = V((o) => {
    T(o), S("open"), $("notes");
  }, []), ne = fe(() => C.filter((o) => {
    if (x && o.status !== x || h && (o.source || "manual") !== h || N != null && !(o.test_case_ids ?? (o.test_case_id ? [o.test_case_id] : [])).includes(N))
      return !1;
    if (m) {
      const z = m.match(/^#([1-9]\d*)$/);
      if (z) {
        if (o.id !== Number(z[1])) return !1;
      } else {
        const U = m.toLowerCase();
        if (!o.title.toLowerCase().includes(U) && !o.content.toLowerCase().includes(U)) return !1;
      }
    }
    return !0;
  }), [C, x, h, N, m]), oe = V((o, z) => {
    z === "fixed" || z === "resolved" || z === "rejected" ? (te({ id: o, status: z }), v("")) : (async () => {
      y(`status-${o}`);
      try {
        await q(o, z), (c == null ? void 0 : c.id) === o && k((U) => U ? { ...U, status: z } : null);
      } finally {
        y(null);
      }
    })();
  }, [q, c == null ? void 0 : c.id]), be = V(async () => {
    if (!j) return;
    const { id: o, status: z } = j;
    if (!((z === "fixed" || z === "rejected") && X.trim() === "")) {
      y(`status-${o}`);
      try {
        const U = X.trim() ? { comment: X.trim() } : void 0;
        if (await q(o, z, U), (c == null ? void 0 : c.id) === o && k((ae) => ae ? { ...ae, status: z } : null), te(null), v(""), (c == null ? void 0 : c.id) === o)
          try {
            const ae = await re.getNote(r, o);
            k(ae);
          } catch {
          }
      } finally {
        y(null);
      }
    }
  }, [j, X, q, c == null ? void 0 : c.id, r]), Se = V(async (o, z) => {
    y(`severity-${o}`);
    try {
      await K(o, z), (c == null ? void 0 : c.id) === o && k((U) => U ? { ...U, severity: z } : null);
    } finally {
      y(null);
    }
  }, [K, c == null ? void 0 : c.id]), Re = V(async (o) => {
    k(o);
    try {
      const z = await re.getNote(r, o.id);
      k(z);
    } catch {
    }
  }, [r]), $e = V(async (o) => {
    if (confirm("このノートを削除しますか？")) {
      y(`delete-${o}`);
      try {
        await Q(o), (c == null ? void 0 : c.id) === o && k(null);
      } finally {
        y(null);
      }
    }
  }, [Q, c == null ? void 0 : c.id]), Be = V(async (o, z) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await re.deleteAttachment(r, o, z), k((U) => {
          var ae;
          return !U || U.id !== o ? U : {
            ...U,
            attachments: (ae = U.attachments) == null ? void 0 : ae.filter((ve) => ve.id !== z)
          };
        });
      } catch (U) {
        console.error("Failed to delete attachment:", U);
      }
  }, [r]), ye = V(async () => {
    if (!(!c || I.trim() === "")) {
      B(!0);
      try {
        const o = await re.addActivity(r, c.id, { content: I.trim() });
        k((z) => z && {
          ...z,
          activities: [...z.activities || [], o]
        }), b("");
      } catch (o) {
        console.error("Failed to add comment:", o);
      } finally {
        B(!1);
      }
    }
  }, [c, I, r]), ze = (o) => {
    if (!o) return [];
    try {
      const z = JSON.parse(o);
      return Array.isArray(z) ? z : [];
    } catch {
      return o.split(`
`).filter((z) => z.trim());
    }
  };
  return /* @__PURE__ */ n("div", { style: Ut(a), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ n("header", { style: Zt(a), children: [
      /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "16px" }, children: [
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
          }, children: /* @__PURE__ */ e(F, { name: "bug_report", size: 24, color: "#FFF" }) }),
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
          background: M ? a.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: M ? a.success : a.textMuted,
            animation: M ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: M,
              onChange: (o) => H(o.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => l("json"),
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
              /* @__PURE__ */ e(F, { name: "download", size: 16 }),
              "JSON"
            ]
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => l("sqlite"),
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
              /* @__PURE__ */ e(F, { name: "download", size: 16 }),
              "SQLite"
            ]
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => E(!R),
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
            title: R ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(F, { name: R ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => {
              y("refresh"), Y(), D((o) => o + 1);
            },
            disabled: d !== null,
            style: {
              padding: "10px 20px",
              background: a.primary,
              border: "none",
              borderRadius: "10px",
              cursor: d !== null ? "not-allowed" : "pointer",
              color: "#FFF",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: d !== null ? 0.6 : 1
            },
            children: [
              d === "refresh" ? /* @__PURE__ */ e(se, { size: 18, color: "#FFF" }) : /* @__PURE__ */ e(F, { name: "refresh", size: 18, color: "#FFF" }),
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
      ...p ? [{ key: "feedback", label: "フィードバック" }] : []
    ].map(({ key: o, label: z }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          $(o), o === "test-status" && T(null);
        },
        style: {
          padding: "12px 20px",
          border: "none",
          borderBottom: g === o ? `2px solid ${a.primary}` : "2px solid transparent",
          background: "transparent",
          color: g === o ? a.primary : a.textSecondary,
          fontWeight: g === o ? 600 : 400,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s"
        },
        children: z
      },
      o
    )) }),
    g === "test-status" ? /* @__PURE__ */ e(
      Ot,
      {
        env: r,
        colors: a,
        isDarkMode: R,
        onNavigateToNote: _,
        refreshKey: G
      }
    ) : g === "feedback" && p ? /* @__PURE__ */ e(
      Ht,
      {
        apiBaseUrl: t,
        adminKey: u,
        colors: a,
        isDarkMode: R,
        refreshKey: G
      }
    ) : /* @__PURE__ */ n("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
      /* @__PURE__ */ n("aside", { style: {
        width: "380px",
        borderRight: `1px solid ${a.border}`,
        display: "flex",
        flexDirection: "column",
        background: a.bgSecondary
      }, children: [
        /* @__PURE__ */ n("div", { style: {
          padding: "16px",
          display: "flex",
          gap: "10px",
          borderBottom: `1px solid ${a.border}`
        }, children: [
          /* @__PURE__ */ n(
            "select",
            {
              "data-testid": "status-filter",
              value: x,
              onChange: (o) => S(o.target.value),
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
              onChange: (o) => f(o.target.value),
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
                onChange: (o) => L(o.target.value),
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
            }, children: /* @__PURE__ */ e(F, { name: "search", size: 18 }) })
          ] })
        ] }),
        N != null && /* @__PURE__ */ e("div", { style: {
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
          N,
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => T(null),
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
          W && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(F, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          P && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: a.errorBg,
            color: a.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: P.message }),
          !W && ne.length === 0 && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(F, { name: "inbox", size: 40 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "ノートがありません" })
          ] }),
          ne.map((o) => /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: a.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: (c == null ? void 0 : c.id) === o.id ? `2px solid ${a.primary}` : "2px solid transparent",
                boxShadow: (c == null ? void 0 : c.id) === o.id ? `0 4px 12px ${a.primary}30` : `0 1px 3px ${a.border}`,
                transition: "all 0.2s"
              },
              onClick: () => Re(o),
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
                  /* @__PURE__ */ n("span", { style: Qe(o.severity, a), children: [
                    /* @__PURE__ */ e(F, { name: Ke(o.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: o.severity || "none" })
                  ] }),
                  /* @__PURE__ */ n("span", { style: Ie(o.status, a), children: [
                    /* @__PURE__ */ e(F, { name: Je(o.status), size: 14 }),
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
                    /* @__PURE__ */ e(F, { name: "image", size: 12 }),
                    o.attachment_count
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: a.text,
                  lineHeight: 1.4
                }, children: Ve(o.content) }),
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
                    /* @__PURE__ */ e(F, { name: "link", size: 12 }),
                    o.route || "/"
                  ] }),
                  /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                  /* @__PURE__ */ e("span", { children: Ge(o.created_at) })
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
                  /* @__PURE__ */ e(F, { name: "chat_bubble_outline", size: 14 }),
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
            /* @__PURE__ */ e(F, { name: "description", size: 16 }),
            C.length,
            " 件"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "error", size: 16, color: a.error }),
            C.filter((o) => o.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "build", size: 16, color: a.warning }),
            C.filter((o) => o.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "check_circle", size: 16, color: a.success }),
            C.filter((o) => o.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "undo", size: 16, color: a.error }),
            C.filter((o) => o.status === "rejected").length,
            " Rejected"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e("main", { style: {
        flex: 1,
        overflow: "auto",
        padding: "32px",
        background: a.bg
      }, children: c ? /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ n("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px"
            }, children: [
              /* @__PURE__ */ n("span", { style: Qe(c.severity, a), children: [
                /* @__PURE__ */ e(F, { name: Ke(c.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: c.severity || "none" })
              ] }),
              /* @__PURE__ */ n("span", { style: Ie(c.status, a), children: [
                /* @__PURE__ */ e(F, { name: Je(c.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: c.status })
              ] }),
              c.source === "test" && /* @__PURE__ */ e("span", { style: {
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
            }, children: Ve(c.content) })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "severity-select",
                value: c.severity || "",
                onChange: (o) => {
                  const z = o.target.value;
                  Se(c.id, z || null);
                },
                disabled: d !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: d !== null ? "not-allowed" : "pointer",
                  opacity: d !== null ? 0.6 : 1
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
            d === `severity-${c.id}` && /* @__PURE__ */ e(se, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "status-select",
                value: c.status,
                onChange: (o) => oe(c.id, o.target.value),
                disabled: d !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: a.bgSecondary,
                  color: a.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: d !== null ? "not-allowed" : "pointer",
                  opacity: d !== null ? 0.6 : 1
                },
                children: [
                  /* @__PURE__ */ e("option", { value: "open", children: "Open" }),
                  /* @__PURE__ */ e("option", { value: "fixed", children: "Fixed" }),
                  /* @__PURE__ */ e("option", { value: "resolved", children: "Resolved" }),
                  /* @__PURE__ */ e("option", { value: "rejected", children: "Rejected" })
                ]
              }
            ),
            d === `status-${c.id}` && /* @__PURE__ */ e(se, { size: 16, color: a.primary }),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => $e(c.id),
                disabled: d !== null,
                style: {
                  padding: "10px 16px",
                  background: a.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: a.error,
                  cursor: d !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: d !== null ? 0.6 : 1
                },
                children: [
                  d === `delete-${c.id}` ? /* @__PURE__ */ e(se, { size: 16, color: a.error }) : /* @__PURE__ */ e(F, { name: "delete", size: 16 }),
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
            ge,
            {
              icon: "link",
              label: "ページURL",
              value: c.route || "/",
              isLink: !0,
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            ge,
            {
              icon: "article",
              label: "ページタイトル",
              value: c.screen_name || "(不明)",
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            ge,
            {
              icon: "schedule",
              label: "作成日時",
              value: Qt(c.created_at),
              colors: a
            }
          )
        ] }),
        /* @__PURE__ */ e(de, { icon: "notes", title: "内容", colors: a, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: a.text
        }, children: c.content }) }),
        c.attachments && c.attachments.length > 0 && /* @__PURE__ */ e(de, { icon: "image", title: `添付画像 (${c.attachments.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px"
        }, children: c.attachments.map((o) => /* @__PURE__ */ n("div", { style: {
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
              onClick: () => O(re.getAttachmentUrl(o.filename))
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
                onClick: (z) => {
                  z.stopPropagation(), Be(c.id, o.id);
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
                children: /* @__PURE__ */ e(F, { name: "delete", size: 14, color: "#fff" })
              }
            )
          ] })
        ] }, o.id)) }) }),
        c.steps && /* @__PURE__ */ e(de, { icon: "format_list_numbered", title: "再現手順", colors: a, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: a.text
        }, children: ze(c.steps).map((o, z) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${a.borderLight}`
        }, children: o }, z)) }) }),
        c.user_log && /* @__PURE__ */ e(de, { icon: "sticky_note_2", title: "補足メモ", colors: a, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: R ? "#0D1117" : "#1E293B",
          color: "#E2E8F0",
          borderRadius: "12px",
          overflow: "auto",
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          lineHeight: 1.6,
          margin: 0
        }, children: c.user_log }) }),
        c.environment && /* @__PURE__ */ e(de, { icon: "devices", title: "環境情報", colors: a, children: /* @__PURE__ */ n("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ e(ge, { icon: "public", label: "URL", value: c.environment.url || "", isLink: !0, colors: a }),
          /* @__PURE__ */ e(ge, { icon: "aspect_ratio", label: "Viewport", value: c.environment.viewport || "", colors: a }),
          /* @__PURE__ */ e(ge, { icon: "computer", label: "User Agent", value: c.environment.userAgent || "", colors: a }),
          /* @__PURE__ */ e(ge, { icon: "schedule", label: "記録日時", value: c.environment.timestamp || "", colors: a })
        ] }) }),
        c.console_log && c.console_log.length > 0 && /* @__PURE__ */ e(de, { icon: "terminal", title: `コンソールログ (${c.console_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: R ? "#0D1117" : "#1E293B"
        }, children: c.console_log.map((o, z) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${R ? "#21262D" : "#2D3748"}`,
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
        ] }, z)) }) }),
        /* @__PURE__ */ n(de, { icon: "history", title: `アクティビティ (${(c.activities || []).length}件)`, colors: a, children: [
          (c.activities || []).length > 0 ? /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: c.activities.map((o) => /* @__PURE__ */ n("div", { style: {
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
                  ...Ie(o.old_status, a),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: o.old_status }),
                /* @__PURE__ */ e("span", { style: { margin: "0 6px", color: a.textMuted }, children: " → " }),
                /* @__PURE__ */ e("span", { style: {
                  ...Ie(o.new_status, a),
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
                /* @__PURE__ */ e("span", { children: Ge(o.created_at) })
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
                value: I,
                onChange: (o) => b(o.target.value),
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
                onClick: ye,
                disabled: J || I.trim() === "",
                style: {
                  padding: "10px 16px",
                  background: J || I.trim() === "" ? a.bgTertiary : a.primary,
                  border: "none",
                  borderRadius: "10px",
                  color: J || I.trim() === "" ? a.textMuted : "#FFF",
                  cursor: J || I.trim() === "" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                },
                children: [
                  J ? /* @__PURE__ */ e(se, { size: 14, color: a.textMuted }) : /* @__PURE__ */ e(F, { name: "send", size: 16 }),
                  "送信"
                ]
              }
            )
          ] })
        ] }),
        c.network_log && c.network_log.length > 0 && /* @__PURE__ */ e(de, { icon: "wifi", title: `ネットワークログ (${c.network_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: R ? "#0D1117" : "#1E293B"
        }, children: c.network_log.map((o, z) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${R ? "#21262D" : "#2D3748"}`,
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
        ] }, z)) }) })
      ] }) : /* @__PURE__ */ n("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: a.textMuted
      }, children: [
        /* @__PURE__ */ e(F, { name: "arrow_back", size: 64 }),
        /* @__PURE__ */ e("div", { style: { fontSize: "18px", fontWeight: 500, marginTop: "16px" }, children: "ノートを選択してください" }),
        /* @__PURE__ */ e("div", { style: { fontSize: "14px", marginTop: "8px" }, children: "左のリストからノートを選択すると詳細が表示されます" })
      ] }) })
    ] }),
    j && /* @__PURE__ */ e(
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
        onClick: () => te(null),
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
                /* @__PURE__ */ e(F, { name: "edit_note", size: 20 }),
                "ステータスを「",
                j.status,
                "」に変更"
              ] }),
              /* @__PURE__ */ e(
                "textarea",
                {
                  value: X,
                  onChange: (o) => v(o.target.value),
                  placeholder: j.status === "fixed" ? "コメント（必須）: 何を修正したか記入してください" : j.status === "rejected" ? "コメント（必須）: 却下理由を記入してください" : "コメント（任意）",
                  style: {
                    width: "100%",
                    padding: "12px 14px",
                    border: `1px solid ${X.trim() === "" && (j.status === "fixed" || j.status === "rejected") ? a.error : a.border}`,
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
              (j.status === "fixed" || j.status === "rejected") && X.trim() === "" && /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: a.error, marginTop: "6px" }, children: j.status === "fixed" ? "fixed に変更するにはコメントが必須です" : "却下理由の入力が必須です" }),
              /* @__PURE__ */ n("div", { style: {
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px"
              }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => te(null),
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
                    onClick: be,
                    disabled: d !== null || (j.status === "fixed" || j.status === "rejected") && X.trim() === "",
                    style: {
                      padding: "10px 20px",
                      background: (j.status === "fixed" || j.status === "rejected") && X.trim() === "" ? a.bgTertiary : a.primary,
                      border: "none",
                      borderRadius: "10px",
                      color: (j.status === "fixed" || j.status === "rejected") && X.trim() === "" ? a.textMuted : "#FFF",
                      cursor: (j.status === "fixed" || j.status === "rejected") && X.trim() === "" ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    },
                    children: [
                      d ? /* @__PURE__ */ e(se, { size: 14, color: "#FFF" }) : /* @__PURE__ */ e(F, { name: "check", size: 16 }),
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
    Z && /* @__PURE__ */ n(
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
        onClick: () => O(null),
        children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: Z,
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
              onClick: () => O(null),
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
              children: /* @__PURE__ */ e(F, { name: "close", size: 24, color: "#fff" })
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
function ge({ icon: i, label: r, value: t, isLink: u, colors: x }) {
  return /* @__PURE__ */ n("div", { style: {
    padding: "16px",
    background: x.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ n("div", { style: {
      fontSize: "12px",
      color: x.textMuted,
      marginBottom: "6px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }, children: [
      /* @__PURE__ */ e(F, { name: i, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: u ? x.link : x.text,
      fontFamily: u ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: t })
  ] });
}
function de({ icon: i, title: r, children: t, colors: u }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ n("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: u.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(F, { name: i, size: 18 }),
      r
    ] }),
    t
  ] });
}
function Ve(i, r = 60) {
  const t = i.split(`
`)[0];
  return t.length > r ? t.slice(0, r) + "..." : t;
}
function Ge(i) {
  const r = new Date(i), t = r.getMonth() + 1, u = r.getDate(), x = r.getHours().toString().padStart(2, "0"), S = r.getMinutes().toString().padStart(2, "0");
  return `${t}/${u} ${x}:${S}`;
}
function Qt(i) {
  return new Date(i).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Je(i) {
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
function Ke(i) {
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
function Qe(i, r) {
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
function Ie(i, r) {
  let t, u;
  switch (i) {
    case "open":
      t = r.primaryLight, u = r.primary;
      break;
    case "fixed":
      t = r.warningBg, u = r.warning;
      break;
    case "resolved":
      t = r.successBg, u = r.success;
      break;
    case "rejected":
      t = r.errorBg, u = r.error;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: t,
    color: u,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function Ut(i) {
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
function Zt(i) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${i.border}`,
    background: i.bg
  };
}
function cn({
  apiBaseUrl: i,
  env: r = "dev",
  testCases: t,
  manualItems: u,
  manualDefaultPath: x,
  onManualNavigate: S,
  onManualAppNavigate: h,
  environmentsMd: f,
  onSave: m,
  initialSize: L,
  logCaptureConfig: c,
  disableLogCapture: k,
  adminRoutePath: R = "/__admin"
}) {
  const { isDebugMode: E } = at();
  ie(() => {
    i && Ne(i);
  }, [i]);
  const M = fe(() => k || !i ? null : xt(
    c ?? { console: !0, network: ["/api/**"] }
  ), [i, k]), [H, d] = w(() => typeof window > "u" ? !1 : window.location.pathname === R);
  return ie(() => {
    if (typeof window > "u") return;
    const g = () => d(window.location.pathname === R);
    g(), window.addEventListener("popstate", g), window.addEventListener("hashchange", g);
    const $ = window.history.pushState, p = window.history.replaceState;
    return window.history.pushState = function(...N) {
      const T = $.apply(this, N);
      return g(), T;
    }, window.history.replaceState = function(...N) {
      const T = p.apply(this, N);
      return g(), T;
    }, () => {
      window.removeEventListener("popstate", g), window.removeEventListener("hashchange", g), window.history.pushState = $, window.history.replaceState = p;
    };
  }, [R]), !i || !(E || H) ? null : /* @__PURE__ */ e(
    Bt,
    {
      apiBaseUrl: i,
      env: r,
      testCases: t,
      logCapture: M ?? void 0,
      manualItems: u,
      manualDefaultPath: x,
      onManualNavigate: S,
      onManualAppNavigate: h,
      environmentsMd: f,
      onSave: m,
      initialSize: L
    }
  );
}
export {
  dn as D,
  Bt as a,
  cn as b,
  yt as p
};
