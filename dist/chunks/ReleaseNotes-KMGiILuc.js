import { jsxs as n, jsx as e, Fragment as ve } from "react/jsx-runtime";
import { useState as k, useMemo as we, useCallback as q, forwardRef as zt, useRef as pe, useEffect as te, useImperativeHandle as $t, createContext as Ct, useContext as pt } from "react";
import { a as ut, u as Ft, b as It } from "./useReleaseNotes-DvdEGOj5.js";
import { c as se, b as Pe, h as Rt, i as Tt, j as Bt, k as Je } from "./feedbackApi-BAwJP8AU.js";
import { d as _t, a as Et } from "./useFeedbackAdminMode-DpbrwKWq.js";
import { r as Ce } from "./releaseNotesApi-XrwLFfcW.js";
import { k as gt, D as s, i as We, b as Nt, r as Wt, M as J, I as Lt } from "./FeedbackAdmin-Bh_XOw_Y.js";
import { createPortal as Mt } from "react-dom";
import { m as At } from "./feedbackLogCapture-DUBfVREg.js";
import { c as Dt } from "./logCapture-Bkuy8MSd.js";
function jt(t) {
  return t.split(`
`).map((r) => r.trim()).filter((r) => r.startsWith("- ")).map((r) => r.slice(2).trim()).filter(Boolean);
}
function Ot({ notes: t, updateStatus: r }) {
  const [i, l] = k(null), [u, C] = k(/* @__PURE__ */ new Set(["fixed"])), [f, y] = k({}), [h, A] = k(/* @__PURE__ */ new Set()), d = we(() => u.size === 0 ? t : t.filter((v) => u.has(v.status)), [t, u]), $ = q(async (v, I) => {
    l(`status-${v}`);
    try {
      await r(v, I), (I === "resolved" || I === "closed") && y((M) => {
        const z = { ...M };
        return delete z[v], z;
      });
    } finally {
      l(null);
    }
  }, [r]), F = q((v, I) => {
    y((M) => {
      const z = M[v] ?? /* @__PURE__ */ new Set(), N = new Set(z);
      return N.has(I) ? N.delete(I) : N.add(I), { ...M, [v]: N };
    });
  }, []);
  return /* @__PURE__ */ n("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ n("div", { className: "debug-status-filter", children: [
      ["open", "fixed", "resolved", "closed", "rejected"].map((v) => /* @__PURE__ */ e(
        "button",
        {
          "data-testid": `status-chip-${v}`,
          className: `debug-status-chip ${u.has(v) ? "active" : ""}`,
          onClick: () => {
            C((I) => {
              const M = new Set(I);
              return M.has(v) ? M.delete(v) : M.add(v), M;
            });
          },
          children: v === "closed" ? "クローズ" : v
        },
        v
      )),
      /* @__PURE__ */ n("span", { className: "debug-filter-count", children: [
        d.length,
        "件"
      ] })
    ] }) }),
    d.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "該当するノートはありません" }) : d.map((v) => {
      const I = jt(v.latest_comment || ""), M = f[v.id] ?? /* @__PURE__ */ new Set(), z = I.length > 0 && M.size === I.length, N = I.length > 0;
      return /* @__PURE__ */ n("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ n(
          "div",
          {
            className: "debug-checklist-header",
            style: { cursor: "pointer" },
            onClick: () => A((m) => {
              const w = new Set(m);
              return w.has(v.id) ? w.delete(v.id) : w.add(v.id), w;
            }),
            children: [
              /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: h.has(v.id) ? "▼" : "▶" }),
              /* @__PURE__ */ n("span", { className: "debug-note-id", children: [
                "#",
                v.id
              ] }),
              /* @__PURE__ */ e("span", { className: `debug-severity-dot ${v.severity || "none"}` }),
              v.source === "test" && /* @__PURE__ */ e("span", { className: "debug-source-badge", children: "🧪" }),
              /* @__PURE__ */ e("span", { className: "debug-checklist-title", children: v.content.split(`
`)[0].slice(0, 50) }),
              /* @__PURE__ */ n(
                "select",
                {
                  "data-testid": `note-status-select-${v.id}`,
                  className: "debug-status-select",
                  value: v.status,
                  onChange: (m) => $(v.id, m.target.value),
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
        h.has(v.id) && /* @__PURE__ */ e(ve, { children: N && /* @__PURE__ */ n("div", { className: "debug-checklist-items", children: [
          I.map((m, w) => /* @__PURE__ */ n("label", { className: "debug-checklist-item", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: M.has(w),
                onChange: () => F(v.id, w)
              }
            ),
            /* @__PURE__ */ e("span", { className: M.has(w) ? "debug-checklist-done" : "", children: m })
          ] }, w)),
          /* @__PURE__ */ n("div", { className: "debug-checklist-actions", children: [
            /* @__PURE__ */ n("span", { className: "debug-checklist-progress", children: [
              M.size,
              "/",
              I.length
            ] }),
            v.status === "fixed" && /* @__PURE__ */ e(
              "button",
              {
                className: "debug-btn debug-btn-resolve",
                disabled: !z || i !== null,
                onClick: () => $(v.id, "resolved"),
                children: i === `status-${v.id}` ? "更新中..." : "resolved"
              }
            )
          ] })
        ] }) })
      ] }, v.id);
    })
  ] });
}
const Pt = zt(function({ testCases: r, env: i, logCapture: l, onNotesRefresh: u, onRunningCasesChange: C }, f) {
  const [y, h] = k([]), [A, d] = k(/* @__PURE__ */ new Set()), [$, F] = k(/* @__PURE__ */ new Set()), [v, I] = k({}), [M, z] = k({}), [N, m] = k(null), [w, B] = k(null), x = pe("");
  te(() => {
    if (!r || r.length === 0) return;
    const b = JSON.stringify(r);
    if (b === x.current) return;
    let p = !1;
    return (async () => {
      try {
        await se.importTestCases(r);
      } catch (g) {
        console.warn("Failed to import test cases:", g);
      }
      if (!p)
        try {
          const g = await se.getTestTree(i);
          if (p) return;
          h(g), x.current = b;
          const j = {};
          for (const R of g)
            for (const E of R.capabilities)
              for (const L of E.cases)
                L.last === "pass" && (j[L.caseId] = !0);
          I(j);
        } catch (g) {
          console.warn("Failed to fetch test tree:", g);
        }
    })(), () => {
      p = !0;
    };
  }, [r, i]);
  const _ = q(async () => {
    try {
      const b = await se.getTestTree(i);
      h(b);
      const p = {};
      for (const g of b)
        for (const j of g.capabilities)
          for (const R of j.cases)
            p[R.caseId] = R.last === "pass";
      I(p);
    } catch {
      B({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [i]);
  $t(f, () => ({ refresh: _ }), [_]), te(() => {
    if (!C) return;
    const b = [];
    for (const p of y)
      for (const g of p.capabilities) {
        const j = `${p.domain}/${g.capability}`;
        if ($.has(j))
          for (const R of g.cases) b.push(R.caseId);
      }
    C(b);
  }, [$, y, C]);
  const O = q(async (b, p, g) => {
    const j = `${b}/${p}`;
    m(j), B(null);
    try {
      const R = [], E = M[j], L = E != null && E.content.trim() && E.caseIds.length > 0 ? E.caseIds : [], Z = new Set(L);
      for (const X of g)
        v[X.caseId] && !Z.has(X.caseId) && R.push({ caseId: X.caseId, result: "pass" });
      for (const X of L)
        R.push({ caseId: X, result: "fail" });
      if (R.length === 0) {
        B({ type: "error", text: "チェックまたはバグ報告が必要です" }), m(null);
        return;
      }
      const o = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, D = L.length > 0 ? {
        content: E.content.trim(),
        severity: E.severity || void 0,
        consoleLogs: l == null ? void 0 : l.getConsoleLogs(),
        networkLogs: l == null ? void 0 : l.getNetworkLogs(),
        environment: o
      } : void 0, Q = await se.submitTestRuns(i, R, D);
      if (E != null && E.files && E.files.length > 0 && Q.results) {
        const Y = Q.results.filter((ee) => ee.noteId != null).map((ee) => ee.noteId)[0];
        if (Y)
          for (const ee of E.files)
            try {
              await se.uploadAttachment(i, Y, ee);
            } catch (oe) {
              console.warn("Failed to upload attachment:", oe);
            }
      }
      if (Q.capability) {
        h((Y) => Y.map((ee) => ee.domain !== b ? ee : {
          ...ee,
          capabilities: ee.capabilities.map(
            (oe) => oe.capability === p ? Q.capability : oe
          )
        }));
        const X = { ...v };
        for (const Y of Q.capability.cases)
          X[Y.caseId] = Y.last === "pass";
        I(X);
      }
      u(), z((X) => {
        const Y = { ...X };
        return delete Y[j], Y;
      }), B({ type: "success", text: "送信しました" });
    } catch (R) {
      B({ type: "error", text: R instanceof Error ? R.message : "送信に失敗しました" });
    } finally {
      m(null);
    }
  }, [v, M, i, l, u]), T = q((b) => {
    d((p) => {
      const g = new Set(p);
      return g.has(b) ? g.delete(b) : g.add(b), g;
    });
  }, []), H = q((b) => {
    F((p) => {
      const g = new Set(p);
      return g.has(b) ? g.delete(b) : g.add(b), g;
    });
  }, []), P = (b) => b.last === "pass" ? "passed" : b.last === "fail" && b.openIssues === 0 ? "retest" : b.last === "fail" ? "fail" : "-", re = (b) => b.last === "pass" ? s.success : b.last === "fail" && b.openIssues === 0 ? "#F59E0B" : b.last === "fail" ? s.error : s.gray500, ne = (b) => b.status === "passed" ? "passed" : b.status === "retest" ? "retest" : b.status === "fail" ? "fail" : "", ie = (b) => b.status === "passed" ? s.success : b.status === "retest" ? "#F59E0B" : b.status === "fail" ? s.error : s.gray500;
  return /* @__PURE__ */ n(ve, { children: [
    w && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${w.type}`, children: w.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: y.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : y.map((b) => /* @__PURE__ */ n("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ n(
        "button",
        {
          "data-testid": `domain-toggle-${b.domain}`,
          className: "debug-tree-toggle",
          onClick: () => T(b.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: A.has(b.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: b.domain })
          ]
        }
      ),
      A.has(b.domain) && b.capabilities.map((p) => {
        const g = `${b.domain}/${p.capability}`, j = $.has(g), R = M[g];
        return /* @__PURE__ */ n("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ n(
            "button",
            {
              "data-testid": `cap-toggle-${g}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => H(g),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: j ? "expand_more" : "chevron_right" }),
                /* @__PURE__ */ e("span", { className: "debug-tree-label", children: p.capability }),
                /* @__PURE__ */ n("span", { className: "debug-tree-count", children: [
                  p.passed,
                  "/",
                  p.total
                ] }),
                p.status && /* @__PURE__ */ e("span", { className: "debug-tree-status", style: { color: ie(p) }, children: ne(p) }),
                p.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                  "[",
                  p.openIssues,
                  "件]"
                ] })
              ]
            }
          ),
          j && /* @__PURE__ */ n("div", { className: "debug-tree-cases", children: [
            p.cases.map((E) => /* @__PURE__ */ n("label", { "data-testid": `case-${E.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!v[E.caseId],
                  onChange: (L) => {
                    I((Z) => ({
                      ...Z,
                      [E.caseId]: L.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: E.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: re(E) }, children: P(E) }),
              E.openIssues > 0 && /* @__PURE__ */ n("span", { className: "debug-tree-issues", children: [
                "[",
                E.openIssues,
                "件]"
              ] })
            ] }, E.caseId)),
            /* @__PURE__ */ n("div", { className: "debug-bug-form", children: [
              /* @__PURE__ */ e("div", { className: "debug-bug-form-title", children: "バグ報告" }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "ケース（複数選択可）" }),
                /* @__PURE__ */ e("div", { className: "debug-bug-cases", children: p.cases.map((E) => {
                  const L = (R == null ? void 0 : R.caseIds.includes(E.caseId)) ?? !1;
                  return /* @__PURE__ */ n("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: L,
                        onChange: (Z) => {
                          z((o) => {
                            const D = o[g] || { caseIds: [], content: "", severity: "", files: [] }, Q = Z.target.checked ? [...D.caseIds, E.caseId] : D.caseIds.filter((X) => X !== E.caseId);
                            return { ...o, [g]: { ...D, caseIds: Q } };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { children: E.title })
                  ] }, E.caseId);
                }) })
              ] }),
              /* @__PURE__ */ n("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "内容" }),
                /* @__PURE__ */ e(
                  "textarea",
                  {
                    value: (R == null ? void 0 : R.content) || "",
                    onChange: (E) => {
                      z((L) => {
                        var Z, o, D;
                        return {
                          ...L,
                          [g]: {
                            ...L[g],
                            caseIds: ((Z = L[g]) == null ? void 0 : Z.caseIds) || [],
                            content: E.target.value,
                            severity: ((o = L[g]) == null ? void 0 : o.severity) || "",
                            files: ((D = L[g]) == null ? void 0 : D.files) || []
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
                    value: (R == null ? void 0 : R.severity) || "",
                    onChange: (E) => {
                      z((L) => {
                        var Z, o, D;
                        return {
                          ...L,
                          [g]: {
                            ...L[g],
                            caseIds: ((Z = L[g]) == null ? void 0 : Z.caseIds) || [],
                            content: ((o = L[g]) == null ? void 0 : o.content) || "",
                            severity: E.target.value,
                            files: ((D = L[g]) == null ? void 0 : D.files) || []
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
                gt,
                {
                  files: (R == null ? void 0 : R.files) || [],
                  onAdd: (E) => {
                    z((L) => {
                      var Z, o, D, Q;
                      return {
                        ...L,
                        [g]: {
                          ...L[g],
                          caseIds: ((Z = L[g]) == null ? void 0 : Z.caseIds) || [],
                          content: ((o = L[g]) == null ? void 0 : o.content) || "",
                          severity: ((D = L[g]) == null ? void 0 : D.severity) || "",
                          files: [...((Q = L[g]) == null ? void 0 : Q.files) || [], ...E]
                        }
                      };
                    });
                  },
                  onRemove: (E) => {
                    z((L) => {
                      var Z, o, D, Q;
                      return {
                        ...L,
                        [g]: {
                          ...L[g],
                          caseIds: ((Z = L[g]) == null ? void 0 : Z.caseIds) || [],
                          content: ((o = L[g]) == null ? void 0 : o.content) || "",
                          severity: ((D = L[g]) == null ? void 0 : D.severity) || "",
                          files: (((Q = L[g]) == null ? void 0 : Q.files) || []).filter((X, Y) => Y !== E)
                        }
                      };
                    });
                  },
                  disabled: N !== null
                }
              )
            ] }),
            (() => {
              const E = R != null && R.content.trim() ? R.caseIds.length : 0, Z = p.cases.filter((o) => v[o.caseId] && !(R != null && R.caseIds.includes(o.caseId) && E > 0)).length + E;
              return /* @__PURE__ */ e(
                "button",
                {
                  "data-testid": `cap-submit-${g}`,
                  className: "debug-btn debug-btn-primary debug-cap-submit",
                  onClick: () => O(b.domain, p.capability, p.cases),
                  disabled: N !== null || Z === 0,
                  children: N === g ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
                  ] }) : `${Z}/${p.total}件を送信`
                }
              );
            })()
          ] })
        ] }, g);
      })
    ] }, b.domain)) })
  ] });
});
function Ht({
  items: t,
  defaultPath: r,
  onNavigate: i,
  onAppNavigate: l,
  icons: u
}) {
  var $;
  const [C, f] = k(r || (($ = t[0]) == null ? void 0 : $.path) || ""), { content: y, loading: h, error: A } = _t(C), d = (F) => {
    f(F), i == null || i(F);
  };
  return /* @__PURE__ */ n("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: t.map((F) => /* @__PURE__ */ n(
      "button",
      {
        className: `debug-manual-item ${C === F.path ? "active" : ""}`,
        onClick: () => d(F.path),
        title: F.title,
        children: [
          F.icon && /* @__PURE__ */ e("span", { style: { display: "inline-flex", alignItems: "center", marginRight: "6px" }, "aria-hidden": "true", children: F.icon }),
          F.title
        ]
      },
      F.id
    )) }),
    /* @__PURE__ */ n("div", { className: "debug-manual-content", children: [
      h && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      A && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: A.message }),
      y && /* @__PURE__ */ e(
        We,
        {
          content: y,
          onLinkClick: (F) => {
            f(F), i == null || i(F);
          },
          onAppLinkClick: l,
          icons: u
        }
      )
    ] })
  ] });
}
function qt(t) {
  const { meta: r, body: i } = Ut(t), l = i.split(`
`), u = {
    title: r.title,
    warning: r.warning,
    projects: []
  };
  let C = [], f = null, y = null, h = null, A = !1, d = [], $ = [], F = [];
  const v = () => {
    if (F.length === 0) return;
    const m = Vt(F);
    F = [], m && (h ? h.table = m : $.push(...Gt(m)));
  }, I = () => {
    if (v(), h && $.length > 0) {
      const m = $.join(`
`).trim();
      m && (h.extraMd = (h.extraMd ? h.extraMd + `
` : "") + m);
    }
    $ = [];
  }, M = () => {
    if (I(), f && h)
      if (A) {
        const m = [
          h.entries.map((w) => `- ${w.key}: ${w.value}`).join(`
`),
          h.extraMd ?? ""
        ].filter(Boolean).join(`

`);
        m.trim() && d.push(`## ${h.label}

${m}`);
      } else if (y) {
        let m = f.envs.find((w) => w.env === y);
        m || (m = { env: y, sections: [] }, f.envs.push(m)), m.sections.push(h);
      } else
        f.common.push(h);
    h = null, y = null, A = !1;
  }, z = () => {
    M(), f && (d.length > 0 && (f.notes = d.join(`

`).trim()), d = [], u.projects.push(f)), f = null;
  };
  for (let m = 0; m < l.length; m++) {
    const w = l[m], B = w.trim();
    if (/^\|.*\|$/.test(B)) {
      F.push(B);
      continue;
    } else F.length > 0 && v();
    if (/^---+$/.test(B)) continue;
    const x = /^#\s+(.+)$/.exec(w);
    if (x) {
      z();
      const T = x[1].trim();
      T === "共通" || /^(common|shared)$/i.test(T) ? f = { name: "共通", envs: [], common: [] } : f = { name: T, envs: [], common: [] };
      continue;
    }
    const _ = /^##\s+(.+)$/.exec(w);
    if (_) {
      M(), f || (f = { name: "共通", envs: [], common: [] });
      const T = _[1].trim();
      if (/前提|注意|注記|note|備考/i.test(T)) {
        h = { label: T, entries: [] }, A = !0;
        continue;
      }
      const H = /^(.+?)\s*\/\s*(.+)$/.exec(T);
      if (H)
        y = Ze(H[1].trim()), h = { label: H[2].trim(), entries: [] };
      else {
        const P = Ze(T.replace(/環境$/, "").trim());
        P && /^(dev|staging|stg|prod|production|local|test)$/i.test(P) ? (y = P, h = { label: "アカウント", entries: [] }) : (y = null, h = { label: T, entries: [] });
      }
      continue;
    }
    if (f && !h) {
      const T = /^phase\s*:\s*(.+)$/i.exec(B);
      if (T) {
        f.phase = T[1].trim();
        continue;
      }
    }
    const O = /^\s*-\s+([^:]+?):\s*(.+)$/.exec(w);
    if (O && h && !A) {
      const T = O[1].trim(), H = O[2].trim().replace(/^`|`$/g, "");
      h.entries.push({
        key: T,
        value: H,
        kind: Jt(T, H)
      });
      continue;
    }
    B === "" && $.length === 0 || (h ? $.push(w) : f || C.push(w));
  }
  z();
  const N = C.join(`
`).trim();
  return N && (u.preamble = N), u;
}
function Ut(t) {
  const r = /^---\n([\s\S]*?)\n---\n?/.exec(t);
  if (!r) return { meta: {}, body: t };
  const i = {};
  for (const l of r[1].split(`
`)) {
    const u = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(l);
    if (!u) continue;
    const C = u[1].toLowerCase(), f = u[2].trim().replace(/^["']|["']$/g, "");
    C === "title" ? i.title = f : C === "warning" && (i.warning = f);
  }
  return { meta: i, body: t.slice(r[0].length) };
}
function Vt(t) {
  if (t.length < 2) return null;
  const r = (u) => u.replace(/^\|/, "").replace(/\|$/, "").split("|").map((C) => C.trim()), i = r(t[0]);
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(t[1]))
    return { headers: i, rows: t.slice(1).map(r) };
  const l = t.slice(2).map(r);
  return { headers: i, rows: l };
}
function Gt(t) {
  const r = ["| " + t.headers.join(" | ") + " |"];
  r.push("| " + t.headers.map(() => "---").join(" | ") + " |");
  for (const i of t.rows) r.push("| " + i.join(" | ") + " |");
  return r;
}
function Ze(t) {
  const r = t.toLowerCase();
  return /^(staging|stg)$/.test(r) ? "staging" : /^(prod|production|本番)$/.test(r) ? "prod" : /^(dev|development|開発)$/.test(r) ? "dev" : /^(local|ローカル)$/.test(r) ? "local" : /^(test|テスト)$/.test(r) ? "test" : t;
}
function Jt(t, r) {
  const i = t.toLowerCase();
  return /pass|pwd|password|パスワード/.test(i) ? "password" : /url|link|endpoint/.test(i) || /^https?:\/\//.test(r) ? "url" : /mail|email|メール/.test(i) || /^[^\s@]+@[^\s@]+$/.test(r) ? "email" : /user|id|name|account|ユーザー/.test(i) ? "user" : "text";
}
async function xt(t, r = typeof document < "u" ? document : null) {
  var u, C, f;
  const i = (u = r == null ? void 0 : r.defaultView) == null ? void 0 : u.navigator;
  if ((C = i == null ? void 0 : i.clipboard) != null && C.writeText)
    try {
      return await i.clipboard.writeText(t), !0;
    } catch {
    }
  if (typeof navigator < "u" && ((f = navigator.clipboard) != null && f.writeText))
    try {
      return await navigator.clipboard.writeText(t), !0;
    } catch {
    }
  const l = r ?? (typeof document < "u" ? document : null);
  if (!l) return !1;
  try {
    const y = l.createElement("textarea");
    y.value = t, y.setAttribute("readonly", ""), y.style.position = "fixed", y.style.top = "0", y.style.left = "0", y.style.width = "1px", y.style.height = "1px", y.style.opacity = "0", y.style.pointerEvents = "none", (l.body || l.documentElement).appendChild(y), y.focus(), y.select();
    const h = l.execCommand("copy");
    return y.remove(), h;
  } catch {
    return !1;
  }
}
const He = Ct(null);
function Zt({ md: t, pipDocument: r = null }) {
  const i = we(() => qt(t), [t]), [l, u] = k(
    () => new Set(i.projects.map((f) => f.name))
  ), C = q((f) => {
    u((y) => {
      const h = new Set(y);
      return h.has(f) ? h.delete(f) : h.add(f), h;
    });
  }, []);
  return /* @__PURE__ */ e(He.Provider, { value: r, children: /* @__PURE__ */ n("div", { className: "debug-env-tab", children: [
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
    i.preamble && /* @__PURE__ */ e("div", { style: { marginBottom: "10px", fontSize: "12px" }, children: /* @__PURE__ */ e(We, { content: i.preamble }) }),
    i.projects.length === 0 && /* @__PURE__ */ e("div", { className: "debug-empty", children: "環境情報が空です" }),
    i.projects.map((f) => /* @__PURE__ */ e(
      Qt,
      {
        project: f,
        isExpanded: l.has(f.name),
        onToggle: () => C(f.name)
      },
      f.name
    ))
  ] }) });
}
function Qt({
  project: t,
  isExpanded: r,
  onToggle: i
}) {
  var f;
  const l = t.envs.map((y) => y.env), [u, C] = k(l[0] ?? null);
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
          t.common.map((y, h) => /* @__PURE__ */ e(Qe, { section: y }, `common-${h}`)),
          t.envs.length > 0 && /* @__PURE__ */ n(ve, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "4px",
                  marginBottom: "8px",
                  borderBottom: `1px solid ${s.gray200}`
                },
                children: t.envs.map((y) => /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: () => C(y.env),
                    style: {
                      padding: "6px 12px",
                      background: "transparent",
                      border: "none",
                      borderBottom: u === y.env ? `2px solid ${s.primary}` : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: u === y.env ? 600 : 400,
                      color: u === y.env ? s.primary : s.gray700
                    },
                    children: y.env
                  },
                  y.env
                ))
              }
            ),
            (f = t.envs.find((y) => y.env === u)) == null ? void 0 : f.sections.map((y, h) => /* @__PURE__ */ e(Qe, { section: y }, `${u}-${h}`))
          ] }),
          t.notes && /* @__PURE__ */ n("details", { style: { marginTop: "10px" }, children: [
            /* @__PURE__ */ e("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600, color: s.gray700 }, children: "📝 前提・注意点" }),
            /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(We, { content: t.notes }) })
          ] })
        ] })
      ]
    }
  );
}
function Qe({ section: t }) {
  return /* @__PURE__ */ n("div", { style: { marginBottom: "10px" }, children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, color: s.gray700, marginBottom: "4px" }, children: t.label }),
    t.entries.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: t.entries.map((r, i) => /* @__PURE__ */ e(Yt, { entry: r }, i)) }),
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
      /* @__PURE__ */ e("tbody", { children: t.table.rows.map((r, i) => /* @__PURE__ */ e("tr", { children: r.map((l, u) => /* @__PURE__ */ e(
        Kt,
        {
          value: l,
          header: t.table.headers[u] ?? ""
        },
        u
      )) }, i)) })
    ] }) }),
    t.extraMd && /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(We, { content: t.extraMd }) })
  ] });
}
function Yt({ entry: t }) {
  const r = pt(He), [i, l] = k(!1), [u, C] = k(!1), f = async () => {
    await xt(t.value, r) && (C(!0), setTimeout(() => C(!1), 1200));
  }, y = t.kind === "password", h = y && !i ? "•".repeat(Math.min(t.value.length, 10)) : t.value, A = t.kind === "url" ? "link" : t.kind === "email" ? "mail" : t.kind === "password" ? "key" : t.kind === "user" ? "person" : "label";
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
        /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px", color: s.gray500 }, children: A }),
        /* @__PURE__ */ e("span", { style: { minWidth: "60px", color: s.gray700 }, children: t.key }),
        /* @__PURE__ */ e(
          "span",
          {
            style: {
              flex: 1,
              fontFamily: t.kind === "password" || t.kind === "user" ? "monospace" : "inherit",
              wordBreak: "break-all"
            },
            children: h
          }
        ),
        y && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => l((d) => !d),
            title: i ? "隠す" : "表示",
            style: ye,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: i ? "visibility_off" : "visibility" })
          }
        ),
        t.kind === "url" && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => window.open(t.value, "_blank", "noopener"),
            title: "開く",
            style: ye,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "open_in_new" })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: f,
            title: u ? "コピーしました" : "コピー",
            style: { ...ye, color: u ? s.success : ye.color },
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: u ? "check" : "content_copy" })
          }
        )
      ]
    }
  );
}
function Kt({ value: t, header: r }) {
  const i = pt(He), l = /pass|pwd|パスワード/i.test(r), u = /^https?:\/\//.test(t), C = /^[^\s@]+@[^\s@]+$/.test(t), [f, y] = k(!1), [h, A] = k(!1), d = async () => {
    await xt(t, i) && (A(!0), setTimeout(() => A(!1), 1200));
  }, $ = l && !f ? "•".repeat(Math.min(t.length, 10)) : t;
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
        u ? /* @__PURE__ */ e("a", { href: t, target: "_blank", rel: "noopener noreferrer", style: { color: s.primary, flex: 1 }, children: t }) : C ? /* @__PURE__ */ e("span", { style: { flex: 1 }, children: t }) : /* @__PURE__ */ e("span", { style: { flex: 1 }, children: $ }),
        l && /* @__PURE__ */ e("button", { type: "button", onClick: () => y((F) => !F), style: ye, title: f ? "隠す" : "表示", children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: f ? "visibility_off" : "visibility" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: d,
            style: { ...ye, color: h ? s.success : ye.color },
            title: h ? "コピーしました" : "コピー",
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: h ? "check" : "content_copy" })
          }
        )
      ] })
    }
  );
}
const ye = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  color: s.gray500,
  display: "inline-flex",
  alignItems: "center"
};
function ht(t) {
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
ht();
const Ye = {
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
}, Xt = `
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
function ft() {
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
function en() {
  return `${Xt}${ft()}`;
}
function tn({
  apiBaseUrl: t,
  env: r = "dev",
  onSave: i,
  onClose: l,
  initialSize: u = { width: 400, height: 500 },
  testCases: C,
  logCapture: f,
  manualItems: y,
  manualIcons: h,
  manualDefaultPath: A,
  onManualNavigate: d,
  onManualAppNavigate: $,
  environmentsMd: F,
  triggerOffset: v
}) {
  var Ue, Ve;
  const [I, M] = k(null), [z, N] = k(null), [m, w] = k(!1), B = pe(!1), [x, _] = k("record"), O = C && C.length > 0, T = y && y.length > 0, H = !!F && F.trim().length > 0, [P, re] = k(""), [ne, ie] = k(""), [b, p] = k(""), [g, j] = k(!1), [R, E] = k(!1), [L, Z] = k(!1), [o, D] = k(!1), [Q, X] = k(!1), [Y, ee] = k([]), [oe, c] = k(null), [U, ae] = k([]), [de, ke] = k(!1), Re = pe(null);
  te(() => {
    t && Pe(t);
  }, [t]);
  const { notes: Le, createNote: Se, updateStatus: Me, refresh: ze, error: Te } = ut(r), Be = pe(Te);
  Be.current = Te;
  const _e = q(async () => {
    var ge;
    const G = typeof window < "u" && ((ge = window.matchMedia) == null ? void 0 : ge.call(window, "(max-width: 768px)").matches);
    if (!window.documentPictureInPicture || G) {
      window.documentPictureInPicture || console.warn("Document Picture-in-Picture API is not supported"), w(!0);
      return;
    }
    if (!B.current) {
      B.current = !0;
      try {
        const le = await window.documentPictureInPicture.requestWindow({
          width: u.width,
          height: u.height
        }), xe = le.document.createElement("link");
        xe.rel = "stylesheet", xe.href = Nt, le.document.head.appendChild(xe);
        const $e = le.document.createElement("style");
        $e.textContent = en(), le.document.head.appendChild($e);
        const K = le.document.createElement("div");
        K.id = "debug-panel-root", le.document.body.appendChild(K), M(le), N(K), w(!0), le.addEventListener("pagehide", () => {
          M(null), N(null), w(!1), l == null || l();
        });
      } catch (le) {
        console.error("Failed to open PiP window:", le), w(!0);
      } finally {
        B.current = !1;
      }
    }
  }, [u.width, u.height, l]), a = q(() => {
    I ? I.close() : (w(!1), l == null || l());
  }, [I, l]), S = pe(I);
  S.current = I, te(() => () => {
    var G;
    (G = S.current) == null || G.close();
  }, []), te(() => {
    if (typeof document > "u" || document.getElementById("twuw-debug-panel-styles")) return;
    const G = document.createElement("style");
    G.id = "twuw-debug-panel-styles", G.textContent = ft(), document.head.appendChild(G);
  }, []);
  const V = q(() => {
    re(""), ie(""), p(""), ee([]), E(!1), Z(!1), D(!1), X(!1), c(null);
  }, []), ue = q(async () => {
    var $e;
    if (!P.trim()) {
      c({ type: "error", text: "内容は必須です" });
      return;
    }
    j(!0), c(null);
    const ge = ((f == null ? void 0 : f.getNetworkLogs()) ?? []).map((K) => {
      const fe = {
        timestamp: K.timestamp,
        method: K.method,
        url: K.url,
        status: K.status
      }, Ge = ["POST", "PUT", "DELETE", "PATCH"].includes(K.method);
      return Ge && (K.requestBody !== void 0 && (fe.requestBody = K.requestBody), K.responseBody !== void 0 && (fe.responseBody = K.responseBody)), !Ge && L && K.responseBody !== void 0 && (fe.responseBody = K.responseBody), o && K.duration != null && (fe.duration = K.duration), Q && (K.requestHeaders && (fe.requestHeaders = K.requestHeaders), K.responseHeaders && (fe.responseHeaders = K.responseHeaders)), fe;
    }), le = {
      content: P.trim(),
      userLog: ne ? At(ne) : void 0,
      severity: b || void 0,
      testCaseIds: U.length > 0 ? U : void 0,
      consoleLogs: f == null ? void 0 : f.getConsoleLogs(),
      networkLogs: ge.length > 0 ? ge : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, xe = await Se(le);
    if (xe) {
      if (Y.length > 0)
        try {
          for (const K of Y)
            await se.uploadAttachment(r, xe.id, K);
        } catch (K) {
          console.warn("Failed to upload some attachments:", K), c({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), j(!1);
          return;
        }
      c({ type: "success", text: "保存しました" }), i == null || i(xe), setTimeout(() => {
        V();
      }, 1500);
    } else
      c({ type: "error", text: (($e = Be.current) == null ? void 0 : $e.message) || "保存に失敗しました" });
    j(!1);
  }, [P, ne, b, U, Y, L, o, Q, Se, i, V, f, r]), Ae = q(async () => {
    var G;
    ke(!0);
    try {
      x === "manage" ? ze() : x === "test" && await ((G = Re.current) == null ? void 0 : G.refresh());
    } finally {
      ke(!1);
    }
  }, [x, ze]), qe = /* @__PURE__ */ n("div", { className: "debug-panel", children: [
    /* @__PURE__ */ n("header", { className: "debug-header", children: [
      /* @__PURE__ */ n("div", { className: "debug-header-left", children: [
        /* @__PURE__ */ e("span", { className: "debug-icon", children: "edit_note" }),
        /* @__PURE__ */ e("span", { className: "debug-title", children: "デバッグノート" }),
        /* @__PURE__ */ e("span", { className: "debug-env", children: r })
      ] }),
      /* @__PURE__ */ n("div", { className: "debug-header-right", children: [
        x !== "record" && /* @__PURE__ */ e(
          "button",
          {
            className: "debug-refresh-btn",
            onClick: Ae,
            disabled: de,
            title: "データを更新",
            children: /* @__PURE__ */ e(
              "span",
              {
                className: "debug-icon",
                style: {
                  fontSize: "18px",
                  animation: de ? "spin 0.6s linear infinite" : "none"
                },
                children: "sync"
              }
            )
          }
        ),
        /* @__PURE__ */ e("button", { onClick: a, className: "debug-close-btn", "aria-label": "閉じる", children: /* @__PURE__ */ e("span", { className: "debug-icon", children: "close" }) })
      ] })
    ] }),
    /* @__PURE__ */ n("nav", { className: "debug-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${x === "record" ? "active" : ""}`,
          onClick: () => {
            _("record"), c(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${x === "manage" ? "active" : ""}`,
          onClick: () => _("manage"),
          children: "管理"
        }
      ),
      O && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${x === "test" ? "active" : ""}`,
          onClick: () => _("test"),
          children: "テスト"
        }
      ),
      T && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${x === "manual" ? "active" : ""}`,
          onClick: () => _("manual"),
          children: "マニュアル"
        }
      ),
      H && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${x === "env" ? "active" : ""}`,
          onClick: () => _("env"),
          children: "環境"
        }
      )
    ] }),
    /* @__PURE__ */ n("main", { className: "debug-content", children: [
      x === "record" && /* @__PURE__ */ n(ve, { children: [
        U.length > 0 && /* @__PURE__ */ n(
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
                U.map((G) => `#${G}`).join(", ")
              ] }),
              /* @__PURE__ */ e(
                "button",
                {
                  type: "button",
                  onClick: () => ae([]),
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
        oe && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${oe.type}`, children: oe.text }),
        /* @__PURE__ */ n("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-severity", children: "重要度（任意）" }),
          /* @__PURE__ */ n(
            "select",
            {
              id: "debug-severity",
              value: b,
              onChange: (G) => p(G.target.value),
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
              value: P,
              onChange: (G) => re(G.target.value),
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
              value: ne,
              onChange: (G) => ie(G.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          gt,
          {
            files: Y,
            onAdd: (G) => ee((ge) => [...ge, ...G]),
            onRemove: (G) => ee((ge) => ge.filter((le, xe) => xe !== G)),
            disabled: g,
            pipDocument: ((Ue = S.current) == null ? void 0 : Ue.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => E(!R),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: R ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        R && /* @__PURE__ */ n("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: L,
                onChange: (G) => Z(G.target.checked)
              }
            ),
            "GETレスポンスを含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: o,
                onChange: (G) => D(G.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ n("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: Q,
                onChange: (G) => X(G.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      x === "manage" && /* @__PURE__ */ e(Ot, { notes: Le, updateStatus: Me }),
      x === "manual" && T && /* @__PURE__ */ e(
        Ht,
        {
          items: y,
          icons: h,
          defaultPath: A,
          onNavigate: d,
          onAppNavigate: $
        }
      ),
      x === "env" && H && /* @__PURE__ */ e(Zt, { md: F, pipDocument: ((Ve = S.current) == null ? void 0 : Ve.document) ?? null }),
      x === "test" && O && /* @__PURE__ */ e(
        Pt,
        {
          ref: Re,
          testCases: C,
          env: r,
          logCapture: f,
          onNotesRefresh: ze,
          onRunningCasesChange: ae
        }
      )
    ] }),
    x === "record" && /* @__PURE__ */ n("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: V, className: "debug-btn debug-btn-secondary", disabled: g, children: "クリア" }),
      /* @__PURE__ */ e("button", { onClick: ue, className: "debug-btn debug-btn-primary", disabled: g, children: g ? /* @__PURE__ */ n("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
  return z ? Mt(qe, z) : m ? /* @__PURE__ */ e("div", { style: Ye.overlay, children: /* @__PURE__ */ e("div", { style: Ye.panel, children: qe }) }) : /* @__PURE__ */ e("button", { onClick: _e, style: ht(v), "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ n("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
    "バグ",
    /* @__PURE__ */ e("br", {}),
    "記録"
  ] }) });
}
function ce({ size: t = 16, color: r }) {
  return /* @__PURE__ */ n(ve, { children: [
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
const nn = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, rn = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function an({ domains: t, colors: r, isDarkMode: i }) {
  const l = i ? rn : nn;
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
    }, children: t.map((u) => /* @__PURE__ */ e(
      on,
      {
        domain: u,
        colors: r,
        tc: l
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
function on({ domain: t, colors: r, tc: i }) {
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
      ln,
      {
        cap: l,
        colors: r,
        tc: i
      },
      l.capability
    )) })
  ] });
}
function ln({ cap: t, colors: r, tc: i }) {
  const l = t.status === "fail" ? i.fail : t.status === "retest" ? i.retest : t.status === "passed" ? i.passed : i.untested, u = t.status === "fail" ? i.failBg : t.status === "retest" ? i.retestBg : t.status === "passed" ? i.passedBg : i.untestedBg;
  return /* @__PURE__ */ n("div", { style: {
    borderLeft: `4px solid ${l}`,
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
const sn = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, dn = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function cn({ tree: t, colors: r, isDarkMode: i, onNavigateToNote: l }) {
  const u = i ? dn : sn, [C, f] = k(/* @__PURE__ */ new Set()), [y, h] = k(/* @__PURE__ */ new Set());
  te(() => {
    f((z) => {
      const N = new Set(z);
      return t.forEach((m) => N.add(m.domain)), N;
    });
  }, [t]);
  const [A, d] = k("all"), [$, F] = k(!1), v = (z) => {
    f((N) => {
      const m = new Set(N);
      return m.has(z) ? m.delete(z) : m.add(z), m;
    });
  }, I = (z) => {
    h((N) => {
      const m = new Set(N);
      return m.has(z) ? m.delete(z) : m.add(z), m;
    });
  }, M = we(() => t.map((z) => {
    const N = z.capabilities.filter((m) => {
      const w = m.passed === m.total && m.total > 0, B = m.failed > 0 || m.openIssues > 0, x = m.passed < m.total;
      return !(A === "passed" && !w || A === "fail" && !B || A === "incomplete" && !x || $ && w && m.openIssues === 0);
    });
    return N.length === 0 ? null : { ...z, capabilities: N };
  }).filter((z) => z !== null), [t, A, $]);
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
          value: A,
          onChange: (z) => d(z.target.value),
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
            checked: $,
            onChange: (z) => F(z.target.checked),
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
      M.map((z, N) => {
        const m = C.has(z.domain), w = z.capabilities.reduce((_, O) => _ + O.total, 0), B = z.capabilities.reduce((_, O) => _ + O.passed, 0), x = w > 0 ? Math.round(B / w * 100) : 0;
        return /* @__PURE__ */ n("div", { children: [
          /* @__PURE__ */ n(
            "div",
            {
              onClick: () => v(z.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: r.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${r.border}`,
                borderTop: N > 0 ? `1px solid ${r.border}` : "none",
                gap: "8px",
                userSelect: "none"
              },
              children: [
                /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: r.textMuted, width: "16px" }, children: m ? "▼" : "▶" }),
                /* @__PURE__ */ e("span", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  color: r.text,
                  flex: 1
                }, children: z.domain }),
                /* @__PURE__ */ n("span", { style: {
                  fontSize: "13px",
                  color: r.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  B,
                  "/",
                  w,
                  " ",
                  x,
                  "%"
                ] })
              ]
            }
          ),
          m && z.capabilities.map((_) => {
            const O = `${z.domain}/${_.capability}`, T = y.has(O), H = _.passed === _.total && _.total > 0, P = _.cases.some((g) => g.last === "fail" && g.openIssues > 0), re = _.cases.some((g) => g.last === "fail" && g.openIssues === 0), ne = !P && re, ie = P, b = H ? "●" : ie ? "▲" : ne ? "◆" : "○", p = H ? u.passed : ie ? u.fail : ne ? u.retest : u.untested;
            return /* @__PURE__ */ n("div", { children: [
              /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => I(O),
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
                    /* @__PURE__ */ e("span", { style: { color: p, fontSize: "14px", width: "16px" }, children: b }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: r.text,
                      flex: 1
                    }, children: _.capability }),
                    /* @__PURE__ */ n("span", { style: {
                      fontSize: "12px",
                      color: r.textMuted,
                      fontVariantNumeric: "tabular-nums"
                    }, children: [
                      _.passed,
                      "/",
                      _.total
                    ] }),
                    H && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: u.passed,
                      fontWeight: 600
                    }, children: "passed" }),
                    ie && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: u.fail,
                      fontWeight: 600
                    }, children: "fail" }),
                    ne && /* @__PURE__ */ e("span", { style: {
                      fontSize: "11px",
                      color: u.retest,
                      fontWeight: 600
                    }, children: "retest" }),
                    _.openIssues > 0 && /* @__PURE__ */ n("span", { style: {
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: `${u.fail}18`,
                      color: u.fail,
                      fontWeight: 600
                    }, children: [
                      _.openIssues,
                      "件"
                    ] })
                  ]
                }
              ),
              T && _.cases.map((g) => /* @__PURE__ */ e(
                pn,
                {
                  c: g,
                  tc: u,
                  colors: r,
                  onNavigateToNote: l
                },
                g.caseId
              ))
            ] }, O);
          })
        ] }, z.domain);
      }),
      M.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: r.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function pn({ c: t, tc: r, colors: i, onNavigateToNote: l }) {
  const u = t.last === "fail" && t.openIssues === 0, C = t.last === "pass" ? "●" : u ? "◆" : t.last === "fail" ? "▲" : "○", f = t.last === "pass" ? r.passed : u ? r.retest : t.last === "fail" ? r.fail : r.untested;
  return /* @__PURE__ */ n("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: i.bg,
    borderBottom: `1px solid ${i.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: f, fontSize: "12px", width: "16px" }, children: C }),
    /* @__PURE__ */ e("span", { style: { color: i.text, flex: 1 }, children: t.title }),
    /* @__PURE__ */ e("span", { style: {
      fontSize: "11px",
      color: i.textMuted
    }, children: t.last || "-" }),
    t.openIssues > 0 && /* @__PURE__ */ n(
      "button",
      {
        onClick: (y) => {
          y.stopPropagation(), l(t.caseId);
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
const un = 3e4;
function gn({ env: t, colors: r, isDarkMode: i, onNavigateToNote: l, refreshKey: u }) {
  const [C, f] = k([]), [y, h] = k(!0), [A, d] = k(null), $ = pe(0);
  te(() => {
    let v = !1;
    const I = ++$.current, M = async () => {
      try {
        const N = await se.getTestTree(t);
        !v && $.current === I && (f(N), d(null));
      } catch (N) {
        !v && $.current === I && d(N instanceof Error ? N.message : "Failed to fetch test tree");
      } finally {
        !v && $.current === I && h(!1);
      }
    };
    h(!0), M();
    const z = setInterval(M, un);
    return () => {
      v = !0, clearInterval(z);
    };
  }, [t, u]);
  const F = we(() => C.map((v) => {
    let I = 0, M = 0, z = 0, N = !1;
    const m = v.capabilities.map((B) => {
      const x = B.total - B.passed - B.failed;
      I += B.total, M += B.passed, z += B.failed, (B.failed > 0 || B.openIssues > 0) && (N = !0);
      const _ = B.passed === B.total && B.total > 0, O = B.cases.some((P) => P.last === "fail" && P.openIssues > 0), T = B.cases.some((P) => P.last === "fail" && P.openIssues === 0), H = _ ? "passed" : O ? "fail" : T ? "retest" : "incomplete";
      return {
        capability: B.capability,
        total: B.total,
        passed: B.passed,
        failed: B.failed,
        untested: x < 0 ? 0 : x,
        openIssues: B.openIssues,
        status: H,
        cases: B.cases
      };
    }), w = I - M - z;
    return {
      domain: v.domain,
      total: I,
      passed: M,
      failed: z,
      untested: w < 0 ? 0 : w,
      hasIssues: N,
      capabilities: m
    };
  }), [C]);
  return y && C.length === 0 ? /* @__PURE__ */ n("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    color: r.textMuted,
    gap: "12px"
  }, children: [
    /* @__PURE__ */ e(ce, { size: 24, color: r.primary }),
    /* @__PURE__ */ e("span", { style: { fontSize: "14px" }, children: "テストデータを読み込み中..." })
  ] }) : A && C.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "24px",
    background: r.errorBg,
    color: r.error,
    borderRadius: "12px",
    margin: "24px",
    fontSize: "13px"
  }, children: A }) : /* @__PURE__ */ e("div", { style: {
    padding: "32px",
    overflow: "auto",
    flex: 1
  }, children: /* @__PURE__ */ n("div", { style: { maxWidth: "1200px" }, children: [
    /* @__PURE__ */ e(
      an,
      {
        domains: F,
        colors: r,
        isDarkMode: i
      }
    ),
    /* @__PURE__ */ e(
      cn,
      {
        tree: C,
        colors: r,
        isDarkMode: i,
        onNavigateToNote: l
      }
    )
  ] }) });
}
const bt = "Asia/Tokyo";
function mt(t) {
  return t ? /[Zz]$/.test(t) || /[+-]\d{2}:?\d{2}$/.test(t) ? new Date(t) : /* @__PURE__ */ new Date(t.replace(" ", "T") + "Z") : /* @__PURE__ */ new Date(NaN);
}
function yt(t) {
  const r = mt(t);
  return isNaN(r.getTime()) ? "-" : r.toLocaleString("ja-JP", {
    timeZone: bt,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function vt(t) {
  const r = mt(t);
  return isNaN(r.getTime()) ? "-" : r.toLocaleString("ja-JP", {
    timeZone: bt,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: !1
  });
}
const Ee = {
  bug: { label: "不具合", icon: "bug_report" },
  question: { label: "質問", icon: "help" },
  request: { label: "要望", icon: "lightbulb" },
  share: { label: "共有", icon: "share" },
  other: { label: "その他", icon: "more_horiz" }
}, xn = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, De = {
  app: "アプリ",
  manual: "マニュアル"
}, Ke = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function Xe(t) {
  const r = xn[t] ?? "#6B7280";
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
function et(t, r) {
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
function hn({ apiBaseUrl: t, adminKey: r, colors: i, isDarkMode: l, refreshKey: u, initialSelectedId: C }) {
  var Y, ee, oe;
  const {
    feedbacks: f,
    total: y,
    page: h,
    limit: A,
    loading: d,
    error: $,
    filters: F,
    customTags: v,
    setFilters: I,
    setPage: M,
    updateStatus: z,
    remove: N,
    refresh: m
  } = Et({ apiBaseUrl: t, adminKey: r }), [w, B] = k(null), [x, _] = k(null), [O, T] = k(!1), [H, P] = k(null), [re, ne] = k(null), ie = pe(0), b = pe(u);
  te(() => {
    u !== b.current && (b.current = u, m());
  }, [u, m]);
  const p = Math.max(1, Math.ceil(y / A)), g = q(async (c) => {
    if (w === c) return;
    B(c), T(!0), _(null);
    const U = ++ie.current;
    try {
      const ae = await Rt({ apiBaseUrl: t, adminKey: r, id: c });
      if (ie.current !== U) return;
      _(ae);
    } catch {
      if (ie.current !== U) return;
      _(null);
    }
    ie.current === U && T(!1);
  }, [w, t, r]), j = pe(!1);
  te(() => {
    C === void 0 || j.current || (j.current = !0, g(C));
  }, [C, g]);
  const R = q(async (c, U) => {
    await z(c, U) && (x == null ? void 0 : x.id) === c && _((de) => de ? { ...de, status: U } : null);
  }, [z, x == null ? void 0 : x.id]), E = q(async (c) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await N(c) && w === c && (B(null), _(null));
  }, [N, w]), L = q(async (c, U) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await Tt({ apiBaseUrl: t, adminKey: r, feedbackId: c, attachmentId: U }), _((ae) => {
          var de;
          return !ae || ae.id !== c ? ae : {
            ...ae,
            attachments: (de = ae.attachments) == null ? void 0 : de.filter((ke) => ke.id !== U)
          };
        });
      } catch (ae) {
        console.error("Failed to delete attachment:", ae);
      }
  }, [t, r]), Z = q((c) => {
    try {
      const U = new URL(t);
      return `${U.origin}${U.pathname.replace(/\/$/, "")}/attachments/${c}`;
    } catch {
      return `${t}/attachments/${c}`;
    }
  }, [t]), o = q(async (c) => {
    ne(c);
    try {
      await Bt({ apiBaseUrl: t, adminKey: r, format: c });
    } catch (U) {
      console.error("Export failed:", U);
    } finally {
      ne(null);
    }
  }, [t, r]), D = {
    open: f.filter((c) => c.status === "open").length,
    inProgress: f.filter((c) => c.status === "in_progress").length,
    closed: f.filter((c) => c.status === "closed").length
  }, Q = l ? "#0D1117" : "#1E293B", X = l ? "#21262D" : "#2D3748";
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
            value: F.status,
            onChange: (c) => I({ status: c.target.value }),
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
              Ke.map((c) => /* @__PURE__ */ e("option", { value: c.value, children: c.label }, c.value))
            ]
          }
        ),
        /* @__PURE__ */ n(
          "select",
          {
            value: F.kind,
            onChange: (c) => I({ kind: c.target.value }),
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
            value: F.target,
            onChange: (c) => I({ target: c.target.value }),
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
        v.length > 0 && /* @__PURE__ */ n(
          "select",
          {
            value: F.customTag,
            onChange: (c) => I({ customTag: c.target.value }),
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
              v.map((c) => /* @__PURE__ */ e("option", { value: c, children: c }, c))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", padding: "12px" }, children: [
        d && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: i.textMuted }, children: [
          /* @__PURE__ */ e(ce, { size: 24, color: i.primary }),
          /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
        ] }),
        $ && /* @__PURE__ */ e("div", { style: {
          padding: "16px",
          background: i.errorBg,
          color: i.error,
          borderRadius: "12px",
          margin: "8px",
          fontSize: "13px"
        }, children: $.message }),
        !d && f.length === 0 && /* @__PURE__ */ n("div", { style: { padding: "40px", textAlign: "center", color: i.textMuted }, children: [
          /* @__PURE__ */ e(W, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        f.map((c) => {
          const U = Ee[c.kind] ?? { label: c.kind, icon: "help" }, ae = w === c.id;
          return /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: i.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: ae ? `2px solid ${i.primary}` : "2px solid transparent",
                boxShadow: ae ? `0 4px 12px ${i.primary}30` : `0 1px 3px ${i.border}`,
                transition: "all 0.2s"
              },
              onClick: () => g(c.id),
              children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ n("span", { style: { fontSize: "11px", color: i.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    c.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: Xe(c.kind), children: [
                    /* @__PURE__ */ e(W, { name: U.icon, size: 12 }),
                    U.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: et(c.status, i), children: c.status === "open" ? "Open" : c.status === "in_progress" ? "対応中" : "完了" }),
                  c.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: i.bgTertiary,
                    color: i.textSecondary,
                    fontWeight: 500
                  }, children: De[c.target] ?? c.target }),
                  c.customTag && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${i.primary}15`,
                    color: i.primary,
                    fontWeight: 500
                  }, children: c.customTag })
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
                }, children: c.message.split(`
`)[0].slice(0, 80) }),
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: i.textMuted
                }, children: [
                  /* @__PURE__ */ e("span", { children: fn(c.createdAt) }),
                  c.pageUrl && /* @__PURE__ */ n(ve, { children: [
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
                      c.pageUrl
                    ] })
                  ] }),
                  (c.attachmentCount ?? 0) > 0 && /* @__PURE__ */ n(ve, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ n("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "11px",
                      color: i.textMuted
                    }, children: [
                      /* @__PURE__ */ e(W, { name: "image", size: 12 }),
                      c.attachmentCount
                    ] })
                  ] })
                ] })
              ]
            },
            c.id
          );
        })
      ] }),
      p > 1 && /* @__PURE__ */ n("div", { style: {
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
            onClick: () => M(h - 1),
            disabled: h <= 1,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: i.bg,
              color: h <= 1 ? i.textMuted : i.text,
              cursor: h <= 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${i.border}`
            },
            children: /* @__PURE__ */ e(W, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ n("span", { style: { fontSize: "13px", color: i.textSecondary }, children: [
          h,
          " / ",
          p
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => M(h + 1),
            disabled: h >= p,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: i.bg,
              color: h >= p ? i.textMuted : i.text,
              cursor: h >= p ? "not-allowed" : "pointer",
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
          y,
          " 件"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "error", size: 16, color: i.warning }),
          D.open,
          " Open"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "pending", size: 16, color: i.primary }),
          D.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(W, { name: "check_circle", size: 16, color: i.success }),
          D.closed,
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
      w && O && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: i.textMuted }, children: [
        /* @__PURE__ */ e(ce, { size: 32, color: i.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      w && !O && x && /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ n("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ n("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ n("span", { style: Xe(x.kind), children: [
                /* @__PURE__ */ e(W, { name: ((Y = Ee[x.kind]) == null ? void 0 : Y.icon) ?? "help", size: 14 }),
                ((ee = Ee[x.kind]) == null ? void 0 : ee.label) ?? x.kind
              ] }),
              /* @__PURE__ */ e("span", { style: et(x.status, i), children: x.status === "open" ? "Open" : x.status === "in_progress" ? "対応中" : "完了" }),
              x.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: i.bgTertiary,
                color: i.textSecondary,
                fontWeight: 500
              }, children: De[x.target] ?? x.target }),
              x.customTag && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: `${i.primary}15`,
                color: i.primary,
                fontWeight: 600
              }, children: x.customTag })
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
              x.id,
              " フィードバック"
            ] })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ e(
              "select",
              {
                value: x.status,
                onChange: (c) => R(x.id, c.target.value),
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
                children: Ke.map((c) => /* @__PURE__ */ e("option", { value: c.value, children: c.label }, c.value))
              }
            ),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => E(x.id),
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
          /* @__PURE__ */ e(be, { icon: "category", label: "種別", value: ((oe = Ee[x.kind]) == null ? void 0 : oe.label) ?? x.kind, colors: i }),
          /* @__PURE__ */ e(be, { icon: "ads_click", label: "対象", value: x.target ? De[x.target] ?? x.target : "-", colors: i }),
          /* @__PURE__ */ e(be, { icon: "schedule", label: "日時", value: bn(x.createdAt), colors: i }),
          x.pageUrl && /* @__PURE__ */ e(be, { icon: "link", label: "URL", value: x.pageUrl, isLink: !0, colors: i }),
          x.userType && /* @__PURE__ */ e(be, { icon: "person", label: "ユーザー", value: x.userType, colors: i }),
          x.appVersion && /* @__PURE__ */ e(be, { icon: "inventory_2", label: "バージョン", value: x.appVersion, colors: i })
        ] }),
        /* @__PURE__ */ e(Fe, { icon: "chat", title: "メッセージ", colors: i, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: i.text
        }, children: x.message }) }),
        x.environment && Object.keys(x.environment).length > 0 && /* @__PURE__ */ e(Fe, { icon: "devices", title: "環境情報", colors: i, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: Object.entries(x.environment).map(([c, U]) => /* @__PURE__ */ e(be, { icon: "info", label: c, value: String(U), colors: i }, c)) }) }),
        x.consoleLogs && x.consoleLogs.length > 0 && /* @__PURE__ */ e(Fe, { icon: "terminal", title: `コンソールログ (${x.consoleLogs.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: Q }, children: x.consoleLogs.map((c, U) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${X}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: c.level === "error" ? "#F87171" : c.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: c.level === "error" ? "#7F1D1D40" : c.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: c.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: c.message })
        ] }, U)) }) }),
        x.networkLogs && x.networkLogs.length > 0 && /* @__PURE__ */ e(Fe, { icon: "wifi", title: `ネットワークログ (${x.networkLogs.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: Q }, children: x.networkLogs.map((c, U) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${X}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ e("span", { style: { fontWeight: 600, color: "#94A3B8", width: "40px", flexShrink: 0 }, children: c.method }),
          /* @__PURE__ */ e("span", { style: { color: c.status >= 400 ? "#F87171" : "#34D399", fontWeight: 600, flexShrink: 0 }, children: c.status }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: c.url }),
          /* @__PURE__ */ e("span", { style: { color: "#64748B", flexShrink: 0 }, children: c.duration != null ? `${c.duration}ms` : "-" })
        ] }, U)) }) }),
        x.attachments && x.attachments.length > 0 && /* @__PURE__ */ e(Fe, { icon: "image", title: `添付画像 (${x.attachments.length}件)`, colors: i, children: /* @__PURE__ */ e("div", { style: {
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }, children: x.attachments.map((c) => /* @__PURE__ */ n("div", { style: {
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
              src: Z(c.filename),
              alt: c.original_name,
              style: {
                width: "100%",
                height: "100px",
                objectFit: "cover",
                cursor: "pointer",
                display: "block"
              },
              onClick: () => P(Z(c.filename))
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => L(x.id, c.id),
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
          }, children: c.original_name })
        ] }, c.id)) }) }),
        H && /* @__PURE__ */ e(
          "div",
          {
            onClick: () => P(null),
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
                src: H,
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
      w && !O && !x && /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: i.textMuted }, children: [
        /* @__PURE__ */ e(W, { name: "error_outline", size: 48 }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px", fontSize: "16px" }, children: "詳細の取得に失敗しました" })
      ] }),
      !w && /* @__PURE__ */ n("div", { style: {
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
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.text }, children: y }),
              " 件"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.warning }, children: D.open }),
              " Open"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.primary }, children: D.inProgress }),
              " 対応中"
            ] }),
            /* @__PURE__ */ n("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: i.success }, children: D.closed }),
              " 完了"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }, children: ["json", "csv", "sqlite"].map((c) => /* @__PURE__ */ n(
            "button",
            {
              onClick: () => o(c),
              disabled: re !== null,
              style: {
                padding: "8px 14px",
                background: i.bg,
                border: "none",
                borderRadius: "10px",
                cursor: re !== null ? "not-allowed" : "pointer",
                color: i.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: re !== null && re !== c ? 0.5 : 1,
                boxShadow: `0 1px 3px ${i.border}`,
                transition: "all 0.2s"
              },
              children: [
                re === c ? /* @__PURE__ */ e(ce, { size: 14, color: i.text }) : /* @__PURE__ */ e(W, { name: "download", size: 16 }),
                c.toUpperCase()
              ]
            },
            c
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
function be({ icon: t, label: r, value: i, isLink: l, colors: u }) {
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
      /* @__PURE__ */ e(W, { name: t, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: l ? u.link : u.text,
      fontFamily: l ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: i })
  ] });
}
function Fe({ icon: t, title: r, children: i, colors: l }) {
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
function fn(t) {
  return vt(t);
}
function bn(t) {
  return yt(t);
}
const wt = {
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
}, mn = {
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
}, yn = {
  fix: "直したこと",
  improve: "使いやすくしたこと",
  feature: "新しくできること"
};
function vn(t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  return r ? `${Number(r[1])}年${Number(r[2])}月${Number(r[3])}日` : t;
}
function wn({ apiBaseUrl: t, env: r, adminKey: i, colors: l = wt, refreshKey: u = 0 }) {
  const C = { apiBaseUrl: t, env: r, adminKey: i }, [f, y] = k([]), [h, A] = k(null), [d, $] = k(!0), [F, v] = k(null), [I, M] = k(null), [z, N] = k(/* @__PURE__ */ new Set()), [m, w] = k(null), [B, x] = k(null), [_, O] = k(null), T = q(async () => {
    $(!0), v(null);
    try {
      const [p, g] = await Promise.all([
        Ce.list(C),
        Ce.tokens(C)
      ]);
      y(p), A(g);
    } catch (p) {
      v(p instanceof Error ? p.message : "リリースノートの取得に失敗しました");
    } finally {
      $(!1);
    }
  }, [t, r, i]);
  te(() => {
    T();
  }, [T, u]);
  const H = q(
    async (p, g) => {
      M(p.id), v(null);
      try {
        await Ce.update(C, p.id, g), await T();
      } catch (j) {
        v(j instanceof Error ? j.message : "更新に失敗しました");
      } finally {
        M(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, r, i, T]
  ), P = q(async (p) => {
    x(null), M(p.id), v(null);
    try {
      await Ce.remove(C, p.id), await T();
    } catch (g) {
      v(g instanceof Error ? g.message : "削除に失敗しました");
    } finally {
      M(null);
    }
  }, [t, r, i, T]), re = q(async (p) => {
    O(null), v(null);
    try {
      A(await Ce.rotateToken(C, p));
    } catch (g) {
      v(g instanceof Error ? g.message : "再発行に失敗しました");
    }
  }, [t, r, i]), ne = q(async (p, g) => {
    try {
      await navigator.clipboard.writeText(g), w(p), setTimeout(() => w((j) => j === p ? null : j), 2e3);
    } catch {
      v("クリップボードにコピーできませんでした");
    }
  }, []), ie = (p) => N((g) => {
    const j = new Set(g);
    return j.has(p) ? j.delete(p) : j.add(p), j;
  }), b = (p = "default") => ({
    padding: "5px 10px",
    fontSize: "12px",
    borderRadius: "6px",
    cursor: "pointer",
    border: `1px solid ${p === "danger" ? l.error : p === "primary" ? l.primary : l.border}`,
    background: p === "primary" ? l.primary : "transparent",
    color: p === "primary" ? "#FFF" : p === "danger" ? l.error : l.text
  });
  return /* @__PURE__ */ n("div", { style: { flex: 1, overflow: "auto", padding: "20px 24px", background: l.bg, color: l.text }, children: [
    F && /* @__PURE__ */ e("div", { style: {
      marginBottom: "16px",
      padding: "10px 14px",
      borderRadius: "8px",
      background: l.errorBg,
      color: l.error,
      fontSize: "13px"
    }, children: F }),
    /* @__PURE__ */ n("section", { style: {
      marginBottom: "24px",
      padding: "14px 16px",
      borderRadius: "10px",
      background: l.bgSecondary,
      border: `1px solid ${l.border}`
    }, children: [
      /* @__PURE__ */ e("h3", { style: { margin: "0 0 4px", fontSize: "13px", fontWeight: 700 }, children: "公開 URL" }),
      /* @__PURE__ */ e("p", { style: { margin: "0 0 12px", fontSize: "12px", color: l.textMuted }, children: "クライアントに渡すのは「社外公開」の URL です。ログイン不要で開けます。" }),
      h ? /* @__PURE__ */ n("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: [
        /* @__PURE__ */ e(
          nt,
          {
            label: "社外公開（クライアント向け）",
            hint: "公開済み かつ 社外公開 の号だけが出ます",
            url: h.public.pageUrl,
            colors: l,
            copied: m === "public",
            onCopy: () => ne("public", h.public.pageUrl),
            onRotate: () => O("public"),
            btn: b
          }
        ),
        /* @__PURE__ */ e(
          nt,
          {
            label: "アプリ内表示用（feedUrl）",
            hint: "ReleaseNotes コンポーネントに渡す URL。社内向けの号も含みます",
            url: h.internal.feedUrl,
            colors: l,
            copied: m === "internal",
            onCopy: () => ne("internal", h.internal.feedUrl),
            onRotate: () => O("internal"),
            btn: b
          }
        )
      ] }) : /* @__PURE__ */ e("p", { style: { margin: 0, fontSize: "12px", color: l.textMuted }, children: "読み込み中…" }),
      _ && /* @__PURE__ */ n("div", { style: {
        marginTop: "12px",
        padding: "10px 12px",
        borderRadius: "8px",
        background: l.warningBg,
        color: l.warning,
        fontSize: "12px"
      }, children: [
        "URL を再発行すると、これまでに配った URL は開けなくなります。実行しますか？",
        /* @__PURE__ */ n("div", { style: { display: "flex", gap: "8px", marginTop: "8px" }, children: [
          /* @__PURE__ */ e("button", { type: "button", style: b("danger"), onClick: () => void re(_), children: "再発行する" }),
          /* @__PURE__ */ e("button", { type: "button", style: b(), onClick: () => O(null), children: "やめる" })
        ] })
      ] })
    ] }),
    d && f.length === 0 && /* @__PURE__ */ n("div", { style: { display: "flex", alignItems: "center", gap: "8px", color: l.textMuted, fontSize: "13px" }, children: [
      /* @__PURE__ */ e(ce, { size: 16, color: l.textMuted }),
      "読み込み中…"
    ] }),
    !d && f.length === 0 && /* @__PURE__ */ e("p", { style: { fontSize: "13px", color: l.textMuted }, children: "まだリリースノートがありません。文面の投入は feedback-fix のリリースノート画面から行います。" }),
    f.map((p) => {
      const g = I === p.id, j = z.has(p.id);
      return /* @__PURE__ */ n(
        "article",
        {
          style: {
            marginBottom: "12px",
            borderRadius: "10px",
            overflow: "hidden",
            border: `1px solid ${l.border}`,
            background: l.bgSecondary,
            opacity: g ? 0.6 : 1
          },
          children: [
            /* @__PURE__ */ n("div", { style: { padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }, children: [
              /* @__PURE__ */ n("div", { style: { flex: 1, minWidth: "240px" }, children: [
                /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }, children: [
                  /* @__PURE__ */ e("span", { style: { fontSize: "13px", fontWeight: 700 }, children: p.version }),
                  /* @__PURE__ */ e("span", { style: { fontSize: "12px", color: l.textSecondary }, children: p.title }),
                  /* @__PURE__ */ e(
                    tt,
                    {
                      text: p.status === "published" ? "公開済み" : "下書き",
                      fg: p.status === "published" ? l.success : l.textMuted,
                      bg: p.status === "published" ? l.successBg : l.bgTertiary
                    }
                  ),
                  p.is_public && /* @__PURE__ */ e(tt, { text: "社外公開", fg: l.warning, bg: l.warningBg })
                ] }),
                /* @__PURE__ */ n("p", { style: { margin: "4px 0 0", fontSize: "11px", color: l.textMuted }, children: [
                  vn(p.released_on),
                  " ・ 項目 ",
                  p.items.length,
                  " 件 ・ メディア ",
                  p.images.length,
                  " 件"
                ] })
              ] }),
              /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    style: b(p.status === "published" ? "default" : "primary"),
                    disabled: g,
                    onClick: () => void H(p, { status: p.status === "published" ? "draft" : "published" }),
                    children: p.status === "published" ? "下書きに戻す" : "公開する"
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    style: b(p.is_public ? "default" : "primary"),
                    disabled: g || p.status !== "published",
                    title: p.status !== "published" ? "先に公開してください" : void 0,
                    onClick: () => void H(p, { is_public: !p.is_public }),
                    children: p.is_public ? "社外公開をやめる" : "社外公開にする"
                  }
                ),
                /* @__PURE__ */ e("button", { type: "button", style: b(), onClick: () => ie(p.id), children: j ? "閉じる" : "内容" }),
                /* @__PURE__ */ e("button", { type: "button", style: b("danger"), disabled: g, onClick: () => x(p), children: /* @__PURE__ */ e(W, { name: "delete", size: 14, color: l.error }) })
              ] })
            ] }),
            (B == null ? void 0 : B.id) === p.id && /* @__PURE__ */ n("div", { style: {
              padding: "10px 16px",
              background: l.errorBg,
              color: l.error,
              fontSize: "12px"
            }, children: [
              "「",
              p.version,
              " ",
              p.title,
              "」を削除します。添付された画像・動画も一緒に消えます。",
              /* @__PURE__ */ n("div", { style: { display: "flex", gap: "8px", marginTop: "8px" }, children: [
                /* @__PURE__ */ e("button", { type: "button", style: b("danger"), onClick: () => void P(p), children: "削除する" }),
                /* @__PURE__ */ e("button", { type: "button", style: b(), onClick: () => x(null), children: "やめる" })
              ] })
            ] }),
            j && /* @__PURE__ */ n("div", { style: { padding: "12px 16px", borderTop: `1px solid ${l.borderLight}`, background: l.bg }, children: [
              p.summary && /* @__PURE__ */ e("p", { style: { margin: "0 0 10px", fontSize: "12px", color: l.textSecondary, whiteSpace: "pre-wrap" }, children: p.summary }),
              p.items.length === 0 ? /* @__PURE__ */ e("p", { style: { margin: 0, fontSize: "12px", color: l.textMuted }, children: "項目がありません" }) : /* @__PURE__ */ e("ol", { style: { margin: 0, paddingLeft: "18px", fontSize: "12px" }, children: p.items.map((R) => /* @__PURE__ */ n("li", { style: { marginBottom: "8px" }, children: [
                /* @__PURE__ */ n("span", { style: { color: l.textMuted }, children: [
                  "[",
                  yn[R.category],
                  "]"
                ] }),
                " ",
                R.headline,
                R.feedback_id !== null && /* @__PURE__ */ n("span", { style: { color: l.textMuted }, children: [
                  " ・報告 #",
                  R.feedback_id
                ] }),
                (R.before_text || R.after_text) && /* @__PURE__ */ n("div", { style: { marginTop: "2px", color: l.textSecondary }, children: [
                  R.before_text && /* @__PURE__ */ n("div", { children: [
                    "これまで: ",
                    R.before_text
                  ] }),
                  R.after_text && /* @__PURE__ */ n("div", { children: [
                    "これから: ",
                    R.after_text
                  ] })
                ] }),
                p.images.filter((E) => E.item_id === R.id).length > 0 && /* @__PURE__ */ n("div", { style: { color: l.textMuted, marginTop: "2px" }, children: [
                  "添付 ",
                  p.images.filter((E) => E.item_id === R.id).length,
                  " 件"
                ] })
              ] }, R.id)) })
            ] })
          ]
        },
        p.id
      );
    })
  ] });
}
function tt({ text: t, fg: r, bg: i }) {
  return /* @__PURE__ */ e("span", { style: { fontSize: "10px", padding: "1px 7px", borderRadius: "999px", background: i, color: r }, children: t });
}
function nt({
  label: t,
  hint: r,
  url: i,
  colors: l,
  copied: u,
  onCopy: C,
  onRotate: f,
  btn: y
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
      /* @__PURE__ */ e("button", { type: "button", style: y(u ? "primary" : "default"), onClick: C, children: u ? "コピーしました" : "コピー" }),
      /* @__PURE__ */ e("a", { href: i, target: "_blank", rel: "noreferrer", style: { ...y(), textDecoration: "none" }, children: "開く" }),
      /* @__PURE__ */ e("button", { type: "button", style: y(), onClick: f, children: "再発行" })
    ] })
  ] });
}
const kn = 3e4;
function Pn({ apiBaseUrl: t, env: r = "dev", feedbackApiBaseUrl: i, feedbackAdminKey: l }) {
  var _e;
  const [u, C] = k(""), [f, y] = k(""), [h, A] = k(""), [d, $] = k(null), [F, v] = k(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [I, M] = k(() => typeof window > "u" ? !1 : window.matchMedia("(max-width: 768px)").matches);
  te(() => {
    if (typeof window > "u") return;
    const a = window.matchMedia("(max-width: 768px)"), S = (V) => M(V.matches);
    return a.addEventListener("change", S), () => a.removeEventListener("change", S);
  }, []);
  const [z, N] = k(!0), [m, w] = k(null), B = !!(i && l), x = pe(Wt()), [_, O] = k(
    () => {
      var a;
      return ((a = x.current) == null ? void 0 : a.type) === "feedback" && B ? "feedback" : "notes";
    }
  ), [T, H] = k(null), [P, re] = k(0), [ne, ie] = k(null), [b, p] = k(null), [g, j] = k(""), [R, E] = k(""), [L, Z] = k(!1), o = F ? mn : wt;
  te(() => {
    t && Pe(t);
  }, [t]), te(() => {
    if (typeof window > "u") return;
    const a = window.matchMedia("(prefers-color-scheme: dark)"), S = (V) => v(V.matches);
    return a.addEventListener("change", S), () => a.removeEventListener("change", S);
  }, []);
  const { notes: D, loading: Q, error: X, updateStatus: Y, updateSeverity: ee, deleteNote: oe, refresh: c } = ut(r);
  te(() => {
    !Q && m === "refresh" && w(null);
  }, [Q, m]), te(() => {
    if (d) {
      const a = D.find((S) => S.id === d.id);
      $(a ? (S) => S ? {
        ...a,
        attachments: a.attachments ?? S.attachments,
        activities: a.activities ?? S.activities,
        console_log: a.console_log ?? S.console_log,
        network_log: a.network_log ?? S.network_log,
        environment: a.environment ?? S.environment
      } : a : null);
    }
  }, [D]), te(() => {
    if (!z) return;
    const a = setInterval(() => {
      c();
    }, kn);
    return () => clearInterval(a);
  }, [z, c]);
  const U = q((a) => {
    const V = `${t || Je()}/export/${a}?env=${r}`;
    window.open(V, "_blank");
  }, [t, r]), ae = q((a) => {
    H(a), C("open"), O("notes");
  }, []), de = we(() => D.filter((a) => {
    if (u && a.status !== u || f && (a.source || "manual") !== f || T != null && !(a.test_case_ids ?? (a.test_case_id ? [a.test_case_id] : [])).includes(T))
      return !1;
    if (h) {
      const S = h.match(/^#([1-9]\d*)$/);
      if (S) {
        if (a.id !== Number(S[1])) return !1;
      } else {
        const V = h.toLowerCase();
        if (!a.title.toLowerCase().includes(V) && !a.content.toLowerCase().includes(V)) return !1;
      }
    }
    return !0;
  }), [D, u, f, T, h]), ke = q((a, S) => {
    S === "fixed" || S === "resolved" || S === "rejected" || S === "closed" ? (p({ id: a, status: S }), j("")) : (async () => {
      w(`status-${a}`);
      try {
        await Y(a, S), (d == null ? void 0 : d.id) === a && $((V) => V ? { ...V, status: S } : null);
      } finally {
        w(null);
      }
    })();
  }, [Y, d == null ? void 0 : d.id]), Re = q(async () => {
    if (!b) return;
    const { id: a, status: S } = b;
    if (!((S === "fixed" || S === "rejected") && g.trim() === "")) {
      w(`status-${a}`);
      try {
        const V = g.trim() ? { comment: g.trim() } : void 0;
        if (await Y(a, S, V), (d == null ? void 0 : d.id) === a && $((ue) => ue ? { ...ue, status: S } : null), p(null), j(""), (d == null ? void 0 : d.id) === a)
          try {
            const ue = await se.getNote(r, a);
            $(ue);
          } catch {
          }
      } finally {
        w(null);
      }
    }
  }, [b, g, Y, d == null ? void 0 : d.id, r]), Le = q(async (a, S) => {
    w(`severity-${a}`);
    try {
      await ee(a, S), (d == null ? void 0 : d.id) === a && $((V) => V ? { ...V, severity: S } : null);
    } finally {
      w(null);
    }
  }, [ee, d == null ? void 0 : d.id]), Se = q(async (a) => {
    $(a);
    try {
      const S = await se.getNote(r, a.id);
      $(S);
    } catch {
    }
  }, [r]);
  te(() => {
    const a = x.current;
    if ((a == null ? void 0 : a.type) !== "note") return;
    const S = D.find((V) => V.id === a.id);
    S && (x.current = null, Se(S));
  }, [D, Se]);
  const Me = q(async (a) => {
    if (confirm("このノートを削除しますか？")) {
      w(`delete-${a}`);
      try {
        await oe(a), (d == null ? void 0 : d.id) === a && $(null);
      } finally {
        w(null);
      }
    }
  }, [oe, d == null ? void 0 : d.id]), ze = q(async (a, S) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await se.deleteAttachment(r, a, S), $((V) => {
          var ue;
          return !V || V.id !== a ? V : {
            ...V,
            attachments: (ue = V.attachments) == null ? void 0 : ue.filter((Ae) => Ae.id !== S)
          };
        });
      } catch (V) {
        console.error("Failed to delete attachment:", V);
      }
  }, [r]), Te = q(async () => {
    if (!(!d || R.trim() === "")) {
      Z(!0);
      try {
        const a = await se.addActivity(r, d.id, { content: R.trim() });
        $((S) => S && {
          ...S,
          activities: [...S.activities || [], a]
        }), E("");
      } catch (a) {
        console.error("Failed to add comment:", a);
      } finally {
        Z(!1);
      }
    }
  }, [d, R, r]), Be = (a) => {
    if (!a) return [];
    try {
      const S = JSON.parse(a);
      return Array.isArray(S) ? S : [];
    } catch {
      return a.split(`
`).filter((S) => S.trim());
    }
  };
  return /* @__PURE__ */ n("div", { style: Sn(o), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ n("header", { style: {
      ...zn(o),
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
            background: `linear-gradient(135deg, ${o.primary}, ${o.accent})`,
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
              color: o.text,
              letterSpacing: "-0.025em"
            }, children: "Debug Notes" }),
            /* @__PURE__ */ e("span", { style: {
              fontSize: "12px",
              color: o.textMuted
            }, children: "バグ管理ダッシュボード" })
          ] })
        ] }),
        /* @__PURE__ */ e("span", { style: {
          fontSize: "11px",
          padding: "4px 10px",
          background: o.primary,
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
          color: o.textSecondary,
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "8px",
          background: z ? o.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: z ? o.success : o.textMuted,
            animation: z ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: z,
              onChange: (a) => N(a.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => U("json"),
            style: {
              padding: "8px 14px",
              background: o.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: o.text,
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
            onClick: () => U("sqlite"),
            style: {
              padding: "8px 14px",
              background: o.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: o.text,
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
            onClick: () => v(!F),
            style: {
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: o.bgSecondary,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "transform 0.2s",
              color: o.text
            },
            title: F ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(W, { name: F ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ n(
          "button",
          {
            onClick: () => {
              w("refresh"), c(), re((a) => a + 1);
            },
            disabled: m !== null,
            style: {
              padding: "10px 20px",
              background: o.primary,
              border: "none",
              borderRadius: "10px",
              cursor: m !== null ? "not-allowed" : "pointer",
              color: "#FFF",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: m !== null ? 0.6 : 1
            },
            children: [
              m === "refresh" ? /* @__PURE__ */ e(ce, { size: 18, color: "#FFF" }) : /* @__PURE__ */ e(W, { name: "refresh", size: 18, color: "#FFF" }),
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
      borderBottom: `1px solid ${o.border}`,
      background: o.bg
    }, children: [
      { key: "notes", label: "ノート一覧" },
      { key: "test-status", label: "テスト状況" },
      ...B ? [{ key: "feedback", label: "フィードバック" }] : [],
      { key: "release-notes", label: "リリースノート" }
    ].map(({ key: a, label: S }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          O(a), a === "test-status" && H(null);
        },
        style: {
          padding: "12px 20px",
          border: "none",
          borderBottom: _ === a ? `2px solid ${o.primary}` : "2px solid transparent",
          background: "transparent",
          color: _ === a ? o.primary : o.textSecondary,
          fontWeight: _ === a ? 600 : 400,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s"
        },
        children: S
      },
      a
    )) }),
    _ === "test-status" ? /* @__PURE__ */ e(
      gn,
      {
        env: r,
        colors: o,
        isDarkMode: F,
        onNavigateToNote: ae,
        refreshKey: P
      }
    ) : _ === "feedback" && B ? /* @__PURE__ */ e(
      hn,
      {
        apiBaseUrl: i,
        adminKey: l,
        initialSelectedId: ((_e = x.current) == null ? void 0 : _e.type) === "feedback" ? x.current.id : void 0,
        colors: o,
        isDarkMode: F,
        refreshKey: P
      }
    ) : _ === "release-notes" ? /* @__PURE__ */ e(
      wn,
      {
        apiBaseUrl: t ?? Je(),
        env: r,
        adminKey: l,
        colors: o,
        refreshKey: P
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
        borderRight: I ? "none" : `1px solid ${o.border}`,
        borderBottom: I ? `1px solid ${o.border}` : "none",
        display: I && d ? "none" : "flex",
        flexDirection: "column",
        background: o.bgSecondary,
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ n("div", { style: {
          padding: I ? "12px" : "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          borderBottom: `1px solid ${o.border}`
        }, children: [
          /* @__PURE__ */ n(
            "select",
            {
              "data-testid": "status-filter",
              value: u,
              onChange: (a) => C(a.target.value),
              style: {
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: o.bg,
                color: o.text,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: `0 1px 3px ${o.border}`
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
              value: f,
              onChange: (a) => y(a.target.value),
              style: {
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: o.bg,
                color: o.text,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: `0 1px 3px ${o.border}`
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
                value: h,
                onChange: (a) => A(a.target.value),
                placeholder: "検索...",
                style: {
                  width: "100%",
                  padding: "10px 14px 10px 40px",
                  border: "none",
                  borderRadius: "10px",
                  background: o.bg,
                  color: o.text,
                  fontSize: "13px",
                  boxShadow: `0 1px 3px ${o.border}`
                }
              }
            ),
            /* @__PURE__ */ e("span", { style: {
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: o.textMuted
            }, children: /* @__PURE__ */ e(W, { name: "search", size: 18 }) })
          ] })
        ] }),
        T != null && /* @__PURE__ */ e("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${o.border}`,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }, children: /* @__PURE__ */ n("span", { style: {
          fontSize: "12px",
          padding: "4px 10px",
          borderRadius: "20px",
          background: `${o.primary}15`,
          color: o.primary,
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px"
        }, children: [
          "テストケース #",
          T,
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => H(null),
              style: {
                border: "none",
                background: "transparent",
                color: o.primary,
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
          Q && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: o.textMuted
          }, children: [
            /* @__PURE__ */ e(W, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          X && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: o.errorBg,
            color: o.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: X.message }),
          !Q && de.length === 0 && /* @__PURE__ */ n("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: o.textMuted
          }, children: [
            /* @__PURE__ */ e(W, { name: "inbox", size: 40 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "ノートがありません" })
          ] }),
          de.map((a) => /* @__PURE__ */ n(
            "div",
            {
              style: {
                padding: "16px",
                background: o.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: (d == null ? void 0 : d.id) === a.id ? `2px solid ${o.primary}` : "2px solid transparent",
                boxShadow: (d == null ? void 0 : d.id) === a.id ? `0 4px 12px ${o.primary}30` : `0 1px 3px ${o.border}`,
                transition: "all 0.2s"
              },
              onClick: () => Se(a),
              children: [
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px"
                }, children: [
                  /* @__PURE__ */ n("span", { style: {
                    fontSize: "11px",
                    color: o.textMuted,
                    fontFamily: "monospace"
                  }, children: [
                    "#",
                    a.id
                  ] }),
                  /* @__PURE__ */ n("span", { style: st(a.severity, o), children: [
                    /* @__PURE__ */ e(W, { name: lt(a.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: a.severity || "none" })
                  ] }),
                  /* @__PURE__ */ n("span", { style: Ne(a.status, o), children: [
                    /* @__PURE__ */ e(W, { name: ot(a.status), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: Ie(a.status) })
                  ] }),
                  a.source === "test" && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${o.medium}15`,
                    color: o.medium,
                    fontWeight: 600
                  }, children: "🧪 test" }),
                  (a.attachment_count ?? 0) > 0 && /* @__PURE__ */ n("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${o.primary}15`,
                    color: o.primary,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px"
                  }, children: [
                    /* @__PURE__ */ e(W, { name: "image", size: 12 }),
                    a.attachment_count
                  ] })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: o.text,
                  lineHeight: 1.4
                }, children: it(a.content) }),
                /* @__PURE__ */ n("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: o.textMuted
                }, children: [
                  /* @__PURE__ */ n("span", { style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    background: o.bgTertiary,
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }, children: [
                    /* @__PURE__ */ e(W, { name: "link", size: 12 }),
                    a.route || "/"
                  ] }),
                  /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                  /* @__PURE__ */ e("span", { children: rt(a.created_at) })
                ] }),
                a.latest_comment && /* @__PURE__ */ n("div", { style: {
                  marginTop: "8px",
                  padding: "6px 10px",
                  background: o.bgTertiary,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: o.textSecondary,
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "6px"
                }, children: [
                  /* @__PURE__ */ e(W, { name: "chat_bubble_outline", size: 14 }),
                  /* @__PURE__ */ e("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: a.latest_comment.length > 60 ? a.latest_comment.slice(0, 60) + "..." : a.latest_comment })
                ] })
              ]
            },
            a.id
          ))
        ] }),
        /* @__PURE__ */ n("div", { style: {
          padding: "16px",
          borderTop: `1px solid ${o.border}`,
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          fontSize: "12px",
          color: o.textMuted
        }, children: [
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "description", size: 16 }),
            D.length,
            " 件"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "error", size: 16, color: o.error }),
            D.filter((a) => a.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "build", size: 16, color: o.warning }),
            D.filter((a) => a.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "check_circle", size: 16, color: o.success }),
            D.filter((a) => a.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "cancel", size: 16, color: o.textMuted }),
            D.filter((a) => a.status === "closed").length,
            " クローズ"
          ] }),
          /* @__PURE__ */ n("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(W, { name: "undo", size: 16, color: o.error }),
            D.filter((a) => a.status === "rejected").length,
            " Rejected"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e("main", { style: {
        flex: 1,
        overflow: "auto",
        padding: I ? "16px" : "32px",
        background: o.bg,
        display: I && !d ? "none" : "block"
      }, children: d ? /* @__PURE__ */ n("div", { style: { maxWidth: "800px" }, children: [
        I && /* @__PURE__ */ n(
          "button",
          {
            onClick: () => $(null),
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              marginBottom: "16px",
              background: "transparent",
              border: `1px solid ${o.border}`,
              borderRadius: "8px",
              color: o.textSecondary,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer"
            },
            children: [
              /* @__PURE__ */ e(W, { name: "arrow_back", size: 16, color: o.textSecondary }),
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
              /* @__PURE__ */ n("span", { style: st(d.severity, o), children: [
                /* @__PURE__ */ e(W, { name: lt(d.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: d.severity || "none" })
              ] }),
              /* @__PURE__ */ n("span", { style: Ne(d.status, o), children: [
                /* @__PURE__ */ e(W, { name: ot(d.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: Ie(d.status) })
              ] }),
              d.source === "test" && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "20px",
                background: `${o.medium}15`,
                color: o.medium,
                fontWeight: 600
              }, children: "🧪 test" })
            ] }),
            /* @__PURE__ */ e("h2", { style: {
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
              color: o.text,
              lineHeight: 1.3,
              letterSpacing: "-0.025em"
            }, children: it(d.content) })
          ] }),
          /* @__PURE__ */ n("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "severity-select",
                value: d.severity || "",
                onChange: (a) => {
                  const S = a.target.value;
                  Le(d.id, S || null);
                },
                disabled: m !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: o.bgSecondary,
                  color: o.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: m !== null ? "not-allowed" : "pointer",
                  opacity: m !== null ? 0.6 : 1
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
            m === `severity-${d.id}` && /* @__PURE__ */ e(ce, { size: 16, color: o.primary }),
            /* @__PURE__ */ n(
              "select",
              {
                "data-testid": "status-select",
                value: d.status,
                onChange: (a) => ke(d.id, a.target.value),
                disabled: m !== null,
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: o.bgSecondary,
                  color: o.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: m !== null ? "not-allowed" : "pointer",
                  opacity: m !== null ? 0.6 : 1
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
            m === `status-${d.id}` && /* @__PURE__ */ e(ce, { size: 16, color: o.primary }),
            /* @__PURE__ */ n(
              "button",
              {
                onClick: () => Me(d.id),
                disabled: m !== null,
                style: {
                  padding: "10px 16px",
                  background: o.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: o.error,
                  cursor: m !== null ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: m !== null ? 0.6 : 1
                },
                children: [
                  m === `delete-${d.id}` ? /* @__PURE__ */ e(ce, { size: 16, color: o.error }) : /* @__PURE__ */ e(W, { name: "delete", size: 16 }),
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
            me,
            {
              icon: "link",
              label: "ページURL",
              value: d.route || "/",
              isLink: !0,
              colors: o
            }
          ),
          /* @__PURE__ */ e(
            me,
            {
              icon: "article",
              label: "ページタイトル",
              value: d.screen_name || "(不明)",
              colors: o
            }
          ),
          /* @__PURE__ */ e(
            me,
            {
              icon: "schedule",
              label: "作成日時",
              value: at(d.created_at),
              colors: o
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
              color: o.textSecondary
            }, children: [
              /* @__PURE__ */ e(W, { name: "science", size: 16, color: o.link }),
              "元のテストケース"
            ] }),
            d.test_cases.map((a, S) => {
              const V = [a.domain, a.capability].filter(Boolean);
              return /* @__PURE__ */ n(
                "div",
                {
                  onClick: () => H(a.id),
                  title: "クリックでこのテストケースのノートを絞り込み",
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${o.border}`,
                    background: o.bgSecondary,
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
                        background: `${o.link}15`,
                        color: o.link,
                        fontFamily: "monospace",
                        fontWeight: 600
                      }, children: a.case_key || `#${a.id}` }),
                      V.length > 0 && /* @__PURE__ */ e("span", { style: {
                        fontSize: "11px",
                        color: o.textMuted
                      }, children: V.join(" / ") })
                    ] }),
                    /* @__PURE__ */ e("div", { style: {
                      fontSize: "13px",
                      color: o.text,
                      fontWeight: 500,
                      lineHeight: 1.4
                    }, children: a.title || "(タイトル未設定)" })
                  ]
                },
                S
              );
            })
          ] })
        ] }),
        /* @__PURE__ */ e(he, { icon: "notes", title: "内容", colors: o, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: o.text
        }, children: d.content }) }),
        d.attachments && d.attachments.length > 0 && /* @__PURE__ */ e(he, { icon: "image", title: `添付画像 (${d.attachments.length}件)`, colors: o, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px"
        }, children: d.attachments.map((a) => /* @__PURE__ */ n("div", { style: {
          position: "relative",
          borderRadius: "10px",
          overflow: "hidden",
          border: `1px solid ${o.border}`,
          cursor: "pointer",
          aspectRatio: "4/3"
        }, children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: se.getAttachmentUrl(a.filename),
              alt: a.original_name,
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              },
              onClick: () => ie(se.getAttachmentUrl(a.filename))
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
            /* @__PURE__ */ e("span", { style: { color: "#fff", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: a.original_name }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: (S) => {
                  S.stopPropagation(), ze(d.id, a.id);
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
        ] }, a.id)) }) }),
        d.steps && /* @__PURE__ */ e(he, { icon: "format_list_numbered", title: "再現手順", colors: o, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: o.text
        }, children: Be(d.steps).map((a, S) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${o.borderLight}`
        }, children: a }, S)) }) }),
        d.user_log && /* @__PURE__ */ e(he, { icon: "sticky_note_2", title: "補足メモ", colors: o, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: F ? "#0D1117" : "#1E293B",
          color: "#E2E8F0",
          borderRadius: "12px",
          overflow: "auto",
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          lineHeight: 1.6,
          margin: 0
        }, children: d.user_log }) }),
        d.environment && /* @__PURE__ */ e(he, { icon: "devices", title: "環境情報", colors: o, children: /* @__PURE__ */ n("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ e(me, { icon: "public", label: "URL", value: d.environment.url || "", isLink: !0, colors: o }),
          /* @__PURE__ */ e(me, { icon: "aspect_ratio", label: "Viewport", value: d.environment.viewport || "", colors: o }),
          /* @__PURE__ */ e(me, { icon: "computer", label: "User Agent", value: d.environment.userAgent || "", colors: o }),
          /* @__PURE__ */ e(me, { icon: "schedule", label: "記録日時", value: at(d.environment.timestamp || ""), colors: o })
        ] }) }),
        d.console_log && d.console_log.length > 0 && /* @__PURE__ */ e(he, { icon: "terminal", title: `コンソールログ (${d.console_log.length}件)`, colors: o, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: F ? "#0D1117" : "#1E293B"
        }, children: d.console_log.map((a, S) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${F ? "#21262D" : "#2D3748"}`,
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          display: "flex",
          gap: "8px",
          alignItems: "flex-start"
        }, children: [
          /* @__PURE__ */ e("span", { style: {
            color: a.level === "error" ? "#F87171" : a.level === "warn" ? "#FBBF24" : "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: a.level === "error" ? "#7F1D1D40" : a.level === "warn" ? "#78350F40" : "#33415540",
            flexShrink: 0,
            marginTop: "1px"
          }, children: a.level }),
          /* @__PURE__ */ e("span", { style: { color: "#E2E8F0", lineHeight: 1.5, wordBreak: "break-all" }, children: a.message })
        ] }, S)) }) }),
        /* @__PURE__ */ n(he, { icon: "history", title: `アクティビティ (${(d.activities || []).length}件)`, colors: o, children: [
          (d.activities || []).length > 0 ? /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: d.activities.map((a) => /* @__PURE__ */ n("div", { style: {
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            padding: "10px 14px",
            background: o.bgSecondary,
            borderRadius: "10px",
            borderLeft: `3px solid ${a.action === "status_change" ? o.primary : o.textMuted}`
          }, children: [
            /* @__PURE__ */ e("div", { style: {
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              marginTop: "4px",
              flexShrink: 0,
              background: a.action === "status_change" ? o.primary : o.textMuted
            } }),
            /* @__PURE__ */ n("div", { style: { flex: 1, minWidth: 0 }, children: [
              a.action === "status_change" ? /* @__PURE__ */ n("div", { style: { fontSize: "13px", color: o.text, marginBottom: a.content ? "4px" : 0 }, children: [
                /* @__PURE__ */ e("span", { style: {
                  ...Ne(a.old_status, o),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: Ie(a.old_status) }),
                /* @__PURE__ */ e("span", { style: { margin: "0 6px", color: o.textMuted }, children: " → " }),
                /* @__PURE__ */ e("span", { style: {
                  ...Ne(a.new_status, o),
                  fontSize: "10px",
                  padding: "2px 6px"
                }, children: Ie(a.new_status) })
              ] }) : null,
              a.content && /* @__PURE__ */ e("div", { style: {
                fontSize: "13px",
                color: o.text,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap"
              }, children: a.content }),
              /* @__PURE__ */ n("div", { style: {
                fontSize: "11px",
                color: o.textMuted,
                marginTop: "4px",
                display: "flex",
                gap: "8px"
              }, children: [
                a.author && /* @__PURE__ */ e("span", { children: a.author }),
                /* @__PURE__ */ e("span", { children: rt(a.created_at) })
              ] })
            ] })
          ] }, a.id)) }) : /* @__PURE__ */ e("div", { style: { fontSize: "13px", color: o.textMuted }, children: "アクティビティはありません" }),
          /* @__PURE__ */ n("div", { style: {
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            alignItems: "flex-end"
          }, children: [
            /* @__PURE__ */ e(
              "textarea",
              {
                value: R,
                onChange: (a) => E(a.target.value),
                placeholder: "コメントを追加...",
                style: {
                  flex: 1,
                  padding: "10px 14px",
                  border: `1px solid ${o.border}`,
                  borderRadius: "10px",
                  background: o.bg,
                  color: o.text,
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
                onClick: Te,
                disabled: L || R.trim() === "",
                style: {
                  padding: "10px 16px",
                  background: L || R.trim() === "" ? o.bgTertiary : o.primary,
                  border: "none",
                  borderRadius: "10px",
                  color: L || R.trim() === "" ? o.textMuted : "#FFF",
                  cursor: L || R.trim() === "" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                },
                children: [
                  L ? /* @__PURE__ */ e(ce, { size: 14, color: o.textMuted }) : /* @__PURE__ */ e(W, { name: "send", size: 16 }),
                  "送信"
                ]
              }
            )
          ] })
        ] }),
        d.network_log && d.network_log.length > 0 && /* @__PURE__ */ e(he, { icon: "wifi", title: `ネットワークログ (${d.network_log.length}件)`, colors: o, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: F ? "#0D1117" : "#1E293B"
        }, children: d.network_log.map((a, S) => /* @__PURE__ */ n("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${F ? "#21262D" : "#2D3748"}`,
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
          }, children: a.method }),
          /* @__PURE__ */ e("span", { style: {
            color: a.status >= 400 ? "#F87171" : "#34D399",
            fontWeight: 600,
            flexShrink: 0
          }, children: a.status }),
          /* @__PURE__ */ e("span", { style: {
            color: "#E2E8F0",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: a.url }),
          /* @__PURE__ */ e("span", { style: {
            color: "#64748B",
            flexShrink: 0
          }, children: a.duration != null ? `${a.duration}ms` : "-" })
        ] }, S)) }) })
      ] }) : /* @__PURE__ */ n("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: o.textMuted
      }, children: [
        /* @__PURE__ */ e(W, { name: "arrow_back", size: 64 }),
        /* @__PURE__ */ e("div", { style: { fontSize: "18px", fontWeight: 500, marginTop: "16px" }, children: "ノートを選択してください" }),
        /* @__PURE__ */ e("div", { style: { fontSize: "14px", marginTop: "8px" }, children: "左のリストからノートを選択すると詳細が表示されます" })
      ] }) })
    ] }),
    b && /* @__PURE__ */ e(
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
        onClick: () => p(null),
        children: /* @__PURE__ */ n(
          "div",
          {
            style: {
              background: o.bg,
              borderRadius: "16px",
              padding: "28px",
              width: "480px",
              maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            },
            onClick: (a) => a.stopPropagation(),
            children: [
              /* @__PURE__ */ n("h3", { style: {
                margin: "0 0 16px 0",
                fontSize: "16px",
                fontWeight: 700,
                color: o.text,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }, children: [
                /* @__PURE__ */ e(W, { name: "edit_note", size: 20 }),
                "ステータスを「",
                Ie(b.status),
                "」に変更"
              ] }),
              /* @__PURE__ */ e(
                "textarea",
                {
                  value: g,
                  onChange: (a) => j(a.target.value),
                  placeholder: b.status === "fixed" ? "コメント（必須）: 何を修正したか記入してください" : b.status === "rejected" ? "コメント（必須）: 却下理由を記入してください" : "コメント（任意）",
                  style: {
                    width: "100%",
                    padding: "12px 14px",
                    border: `1px solid ${g.trim() === "" && (b.status === "fixed" || b.status === "rejected") ? o.error : o.border}`,
                    borderRadius: "10px",
                    background: o.bgSecondary,
                    color: o.text,
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
              (b.status === "fixed" || b.status === "rejected") && g.trim() === "" && /* @__PURE__ */ e("div", { style: { fontSize: "12px", color: o.error, marginTop: "6px" }, children: b.status === "fixed" ? "fixed に変更するにはコメントが必須です" : "却下理由の入力が必須です" }),
              /* @__PURE__ */ n("div", { style: {
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "16px"
              }, children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    onClick: () => p(null),
                    style: {
                      padding: "10px 20px",
                      background: o.bgSecondary,
                      border: "none",
                      borderRadius: "10px",
                      color: o.text,
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
                    onClick: Re,
                    disabled: m !== null || (b.status === "fixed" || b.status === "rejected") && g.trim() === "",
                    style: {
                      padding: "10px 20px",
                      background: (b.status === "fixed" || b.status === "rejected") && g.trim() === "" ? o.bgTertiary : o.primary,
                      border: "none",
                      borderRadius: "10px",
                      color: (b.status === "fixed" || b.status === "rejected") && g.trim() === "" ? o.textMuted : "#FFF",
                      cursor: (b.status === "fixed" || b.status === "rejected") && g.trim() === "" ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    },
                    children: [
                      m ? /* @__PURE__ */ e(ce, { size: 14, color: "#FFF" }) : /* @__PURE__ */ e(W, { name: "check", size: 16 }),
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
    ne && /* @__PURE__ */ n(
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
        onClick: () => ie(null),
        children: [
          /* @__PURE__ */ e(
            "img",
            {
              src: ne,
              alt: "拡大表示",
              style: {
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
              },
              onClick: (a) => a.stopPropagation()
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => ie(null),
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
function me({ icon: t, label: r, value: i, isLink: l, colors: u }) {
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
      /* @__PURE__ */ e(W, { name: t, size: 16 }),
      r
    ] }),
    /* @__PURE__ */ e("div", { style: {
      fontSize: "14px",
      fontWeight: 500,
      color: l ? u.link : u.text,
      fontFamily: l ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: i })
  ] });
}
function he({ icon: t, title: r, children: i, colors: l }) {
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
function it(t, r = 60) {
  const i = t.split(`
`)[0];
  return i.length > r ? i.slice(0, r) + "..." : i;
}
function rt(t) {
  return vt(t);
}
function at(t) {
  return yt(t);
}
function ot(t) {
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
function Ie(t) {
  return t === "closed" ? "クローズ" : t ?? "";
}
function lt(t) {
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
function st(t, r) {
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
function Ne(t, r) {
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
function Sn(t) {
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
function zn(t) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${t.border}`,
    background: t.bg
  };
}
function Hn({
  apiBaseUrl: t,
  env: r = "dev",
  testCases: i,
  manualItems: l,
  manualDefaultPath: u,
  onManualNavigate: C,
  onManualAppNavigate: f,
  environmentsMd: y,
  onSave: h,
  initialSize: A,
  logCaptureConfig: d,
  disableLogCapture: $,
  adminRoutePath: F = "/__admin",
  triggerOffset: v
}) {
  const { isDebugMode: I } = Ft();
  te(() => {
    t && Pe(t);
  }, [t]);
  const M = we(() => $ || !t ? null : Dt(
    d ?? { console: !0, network: ["/api/**"] }
  ), [t, $]), [z, N] = k(() => typeof window > "u" ? !1 : window.location.pathname === F);
  return te(() => {
    if (typeof window > "u") return;
    const w = () => N(window.location.pathname === F);
    w(), window.addEventListener("popstate", w), window.addEventListener("hashchange", w);
    const B = window.history.pushState, x = window.history.replaceState;
    return window.history.pushState = function(..._) {
      const O = B.apply(this, _);
      return w(), O;
    }, window.history.replaceState = function(..._) {
      const O = x.apply(this, _);
      return w(), O;
    }, () => {
      window.removeEventListener("popstate", w), window.removeEventListener("hashchange", w), window.history.pushState = B, window.history.replaceState = x;
    };
  }, [F]), !t || !(I || z) ? null : /* @__PURE__ */ e(
    tn,
    {
      apiBaseUrl: t,
      env: r,
      testCases: i,
      logCapture: M ?? void 0,
      manualItems: l,
      manualDefaultPath: u,
      onManualNavigate: C,
      onManualAppNavigate: f,
      environmentsMd: y,
      onSave: h,
      initialSize: A,
      triggerOffset: v
    }
  );
}
const je = {
  fix: { label: "直したこと", fg: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  improve: { label: "使いやすくしたこと", fg: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  feature: { label: "新しくできること", fg: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" }
}, Oe = ["fix", "improve", "feature"], $n = {
  before: { label: "変更前", fg: "#4B5563", bg: "#F3F4F6" },
  after: { label: "変更後", fg: "#065F46", bg: "#ECFDF5" },
  howto: { label: "使い方", fg: "#1E40AF", bg: "#EFF6FF" },
  overview: { label: "全体像", fg: "#4B5563", bg: "#F3F4F6" }
};
function dt(t) {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  return r ? `${Number(r[1])}年${Number(r[2])}月${Number(r[3])}日` : t;
}
function Cn(t) {
  return t.mime_type.startsWith("video/");
}
function qn({
  feedUrl: t,
  title: r = "更新情報",
  description: i = "アプリの更新内容を新しい順に掲載しています",
  initialOpenCount: l = 1,
  showFilter: u = !0,
  storageKey: C,
  onLoaded: f,
  sourceHref: y,
  onSourceClick: h,
  className: A,
  style: d
}) {
  const { notes: $, loading: F, error: v, markAllRead: I } = It({ feedUrl: t, storageKey: C }), [M, z] = k(() => /* @__PURE__ */ new Set()), [N, m] = k("all"), [w, B] = k(null);
  te(() => {
    $.length !== 0 && (z(new Set($.slice(0, Math.max(0, l)).map((T) => T.id))), I(), f == null || f($));
  }, [$]);
  const x = q((T) => {
    z((H) => {
      const P = new Set(H);
      return P.has(T) ? P.delete(T) : P.add(T), P;
    });
  }, []), _ = we(() => N === "all" ? $ : $.map((T) => ({ ...T, items: T.items.filter((H) => H.category === N) })).filter((T) => T.items.length > 0), [$, N]), O = q(() => B(null), []);
  return /* @__PURE__ */ n("div", { className: A, style: { maxWidth: "820px", margin: "0 auto", fontSize: "14px", color: "#111827", ...d }, children: [
    /* @__PURE__ */ n("header", { style: { marginBottom: "20px" }, children: [
      /* @__PURE__ */ e("h1", { style: { margin: 0, fontSize: "20px", fontWeight: 700, color: J.primary }, children: r }),
      i && /* @__PURE__ */ e("p", { style: { margin: "4px 0 0", fontSize: "13px", color: J.gray500 }, children: i })
    ] }),
    u && $.length > 0 && /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }, children: [
      /* @__PURE__ */ e(ct, { active: N === "all", onClick: () => m("all"), children: "すべて" }),
      Oe.map((T) => /* @__PURE__ */ e(ct, { active: N === T, onClick: () => m(T), children: je[T].label }, T))
    ] }),
    F && $.length === 0 && /* @__PURE__ */ e("p", { style: { padding: "24px", color: J.gray500, fontSize: "13px" }, children: "読み込み中…" }),
    v && /* @__PURE__ */ e("p", { style: {
      padding: "12px 16px",
      background: J.errorBg,
      color: J.error,
      borderRadius: "8px",
      fontSize: "13px"
    }, children: v }),
    !F && !v && _.length === 0 && /* @__PURE__ */ e("p", { style: {
      padding: "24px",
      background: J.white,
      border: `1px solid ${J.gray300}`,
      borderRadius: "10px",
      color: J.gray500,
      fontSize: "13px"
    }, children: $.length === 0 ? "まだ掲載されている更新はありません" : "条件に合う更新はありません" }),
    _.length > 0 && /* @__PURE__ */ n("div", { style: { position: "relative", paddingLeft: "22px" }, children: [
      /* @__PURE__ */ e(
        "div",
        {
          "aria-hidden": !0,
          style: { position: "absolute", left: "6px", top: "8px", bottom: "8px", width: "1px", background: "#E5E7EB" }
        }
      ),
      _.map((T, H) => /* @__PURE__ */ e(
        Fn,
        {
          note: T,
          isLatest: H === 0 && N === "all",
          open: M.has(T.id),
          onToggle: () => x(T.id),
          onZoom: (P, re) => B({ url: P, caption: re }),
          sourceLink: { sourceHref: y, onSourceClick: h }
        },
        T.id
      ))
    ] }),
    w && /* @__PURE__ */ e(
      Lt,
      {
        src: w.url,
        alt: w.caption ?? "",
        caption: w.caption,
        onClose: O
      }
    )
  ] });
}
function ct({ active: t, onClick: r, children: i }) {
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
        border: `1px solid ${t ? J.primary : J.gray300}`,
        background: t ? J.primary : J.white,
        color: t ? J.white : J.gray700
      },
      children: i
    }
  );
}
function Fn({
  note: t,
  isLatest: r,
  open: i,
  onToggle: l,
  onZoom: u,
  sourceLink: C
}) {
  const f = (t.cover_image_id !== null ? t.images.find((h) => h.id === t.cover_image_id) : void 0) ?? t.images.find((h) => h.item_id === null) ?? null, y = Oe.map((h) => ({ c: h, n: t.items.filter((A) => A.category === h).length })).filter((h) => h.n > 0);
  return /* @__PURE__ */ n("article", { style: { position: "relative", marginBottom: "24px" }, children: [
    /* @__PURE__ */ e("div", { style: {
      position: "absolute",
      left: "-22px",
      top: "6px",
      width: "13px",
      height: "13px",
      borderRadius: "50%",
      border: "2px solid #F7F8FA",
      background: r ? J.primary : J.gray300
    } }),
    /* @__PURE__ */ n("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "6px" }, children: [
      /* @__PURE__ */ e("span", { style: { fontSize: "13px", fontWeight: 600, color: J.gray700 }, children: dt(t.released_on) }),
      /* @__PURE__ */ e("span", { style: { fontSize: "11px", padding: "1px 8px", borderRadius: "999px", background: "#EEF2F7", color: "#4B5563" }, children: t.version }),
      r && /* @__PURE__ */ e("span", { style: { fontSize: "11px", padding: "1px 8px", borderRadius: "999px", background: J.primary, color: J.white }, children: "最新" })
    ] }),
    /* @__PURE__ */ n("div", { style: {
      background: J.white,
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ n("div", { style: { padding: "16px 16px 14px" }, children: [
        /* @__PURE__ */ e("h2", { style: { margin: 0, fontSize: "16px", fontWeight: 700 }, children: t.title }),
        /* @__PURE__ */ e("p", { style: { margin: "4px 0 0", fontSize: "12px", color: J.gray500 }, children: t.previous ? `前回（${dt(t.previous.released_on)} ${t.previous.version}）からの変更` : "最初のリリースです" }),
        y.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }, children: y.map(({ c: h, n: A }) => {
          const d = je[h];
          return /* @__PURE__ */ n("span", { style: {
            fontSize: "11px",
            padding: "2px 9px",
            borderRadius: "999px",
            background: d.bg,
            color: d.fg,
            border: `1px solid ${d.border}`
          }, children: [
            d.label,
            " ",
            A
          ] }, h);
        }) }),
        (t.summary || f) && /* @__PURE__ */ n("div", { style: { display: "flex", gap: "14px", marginTop: "14px", flexWrap: "wrap" }, children: [
          f && /* @__PURE__ */ n("figure", { style: { margin: 0, flexShrink: 0, width: "220px", maxWidth: "100%" }, children: [
            /* @__PURE__ */ e(St, { media: f, onZoom: u }),
            /* @__PURE__ */ e(kt, { media: f })
          ] }),
          t.summary && /* @__PURE__ */ e("p", { style: { margin: 0, flex: 1, minWidth: "200px", color: J.gray700, whiteSpace: "pre-wrap" }, children: t.summary })
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
            color: J.gray500,
            background: "transparent",
            border: "none",
            borderTop: "1px solid #F3F4F6",
            cursor: "pointer"
          },
          children: i ? "▾ 閉じる" : `▸ 変更点をすべて見る（${t.items.length}件）`
        }
      ),
      i && /* @__PURE__ */ e("div", { style: { padding: "4px 16px 16px", background: "#FAFBFC", borderTop: "1px solid #F3F4F6" }, children: Oe.map((h) => {
        const A = t.items.filter(($) => $.category === h);
        if (A.length === 0) return null;
        const d = je[h];
        return /* @__PURE__ */ n("section", { style: { marginTop: "16px" }, children: [
          /* @__PURE__ */ n("h3", { style: { margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: d.fg }, children: [
            d.label,
            "（",
            A.length,
            "件）"
          ] }),
          /* @__PURE__ */ e("ol", { style: { listStyle: "none", margin: 0, padding: 0 }, children: A.map(($, F) => /* @__PURE__ */ e(
            In,
            {
              item: $,
              index: F + 1,
              media: t.images.filter((v) => v.item_id === $.id),
              onZoom: u,
              sourceLink: C
            },
            $.id
          )) })
        ] }, h);
      }) })
    ] })
  ] });
}
function In({
  item: t,
  index: r,
  media: i,
  onZoom: l,
  sourceLink: u
}) {
  return /* @__PURE__ */ n("li", { style: {
    display: "flex",
    gap: "8px",
    background: J.white,
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
      t.sources && t.sources.length > 0 && /* @__PURE__ */ e(Bn, { sources: t.sources, ...u }),
      (t.before_text || t.after_text) && /* @__PURE__ */ n("div", { style: { marginTop: "8px" }, children: [
        t.before_text && /* @__PURE__ */ n("p", { style: { margin: "0 0 2px", fontSize: "12px", color: J.gray500 }, children: [
          /* @__PURE__ */ e("span", { style: { display: "inline-block", width: "4.5em", color: "#9CA3AF" }, children: "これまで" }),
          t.before_text
        ] }),
        t.after_text && /* @__PURE__ */ n("p", { style: { margin: 0, fontSize: "12px", color: "#111827" }, children: [
          /* @__PURE__ */ e("span", { style: { display: "inline-block", width: "4.5em", color: "#9CA3AF" }, children: "これから" }),
          t.after_text
        ] })
      ] }),
      i.length > 0 && /* @__PURE__ */ e(Rn, { media: i, onZoom: l })
    ] })
  ] });
}
function Rn({
  media: t,
  onZoom: r
}) {
  const i = t.some((l) => l.kind === "before") && t.some((l) => l.kind === "after");
  return /* @__PURE__ */ e("div", { "data-testid": "release-note-media", style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" }, children: t.map((l) => {
    const u = l.kind ? $n[l.kind] : void 0;
    return /* @__PURE__ */ n(
      "figure",
      {
        "data-kind": l.kind ?? void 0,
        style: {
          margin: 0,
          width: "100%",
          // 横に 2 つ入る幅なら半分ずつ、入らなければ折り返して全幅になる
          maxWidth: i ? "100%" : "420px",
          flex: i ? "1 1 220px" : void 0
        },
        children: [
          u && /* @__PURE__ */ e("span", { style: {
            display: "inline-block",
            marginBottom: "4px",
            padding: "1px 8px",
            borderRadius: "999px",
            fontSize: "11px",
            background: u.bg,
            color: u.fg
          }, children: u.label }),
          /* @__PURE__ */ e(St, { media: l, onZoom: r }),
          /* @__PURE__ */ e(kt, { media: l })
        ]
      },
      l.id
    );
  }) });
}
function kt({ media: t }) {
  return !t.caption && !t.description ? null : /* @__PURE__ */ n("figcaption", { style: { marginTop: "4px" }, children: [
    t.caption && /* @__PURE__ */ e("span", { style: { display: "block", fontSize: "12px", color: J.gray700 }, children: t.caption }),
    t.description && /* @__PURE__ */ e("span", { style: {
      display: "block",
      marginTop: "2px",
      fontSize: "11px",
      color: J.gray500,
      whiteSpace: "pre-wrap"
    }, children: t.description })
  ] });
}
const Tn = {
  feedback: "フィードバック",
  note: "ノート"
};
function Bn({
  sources: t,
  sourceHref: r,
  onSourceClick: i
}) {
  return /* @__PURE__ */ n("div", { "data-testid": "release-note-sources", style: { display: "flex", gap: "6px", margin: "4px 0 0", fontSize: "12px" }, children: [
    /* @__PURE__ */ e("span", { style: { flexShrink: 0, color: "#9CA3AF" }, children: "対応" }),
    /* @__PURE__ */ e("ul", { style: { listStyle: "none", margin: 0, padding: 0 }, children: t.map((l) => {
      const u = r ? r(l) : l.url, C = u && /^(https?:\/\/|\/(?!\/))/i.test(u) ? u : null, f = `${Tn[l.type] ?? l.type} #${l.id}`;
      return /* @__PURE__ */ n("li", { style: { color: J.gray500 }, children: [
        C ? /* @__PURE__ */ e(
          "a",
          {
            href: C,
            onClick: i ? (y) => {
              y.preventDefault(), i(l, C);
            } : void 0,
            style: { color: J.primary },
            children: f
          }
        ) : /* @__PURE__ */ e("span", { children: f }),
        l.title && /* @__PURE__ */ e("span", { style: { marginLeft: "6px", color: J.gray700 }, children: l.title })
      ] }, `${l.type}-${l.id}`);
    }) })
  ] });
}
function St({ media: t, onZoom: r }) {
  return Cn(t) ? /* @__PURE__ */ e(
    "video",
    {
      src: `${t.url}#t=0.1`,
      controls: !0,
      playsInline: !0,
      preload: "metadata",
      "aria-label": t.alt ?? t.caption ?? void 0,
      style: { width: "100%", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#000", display: "block" }
    }
  ) : /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      onClick: () => r(t.url, t.caption),
      "aria-label": t.alt ?? t.caption ?? "画像を拡大",
      style: { display: "block", width: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" },
      children: /* @__PURE__ */ e(
        "img",
        {
          src: t.url,
          alt: t.alt ?? t.caption ?? "",
          loading: "lazy",
          style: { width: "100%", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#F9FAFB", display: "block" }
        }
      )
    }
  );
}
export {
  mn as D,
  wt as L,
  qn as R,
  Pn as a,
  tn as b,
  Hn as c,
  wn as d,
  qt as p
};
