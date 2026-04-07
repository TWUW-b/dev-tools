import { jsxs as t, jsx as e, Fragment as xe } from "react/jsx-runtime";
import { useState as w, useMemo as he, useCallback as V, forwardRef as Xe, useRef as ce, useEffect as ie, useImperativeHandle as Ye } from "react";
import { a as Ke, u as et } from "./useDebugMode-Bazrkz8S.js";
import { a as re, s as Ne, g as tt } from "./api-BfEr37m2.js";
import { d as nt, a as it } from "./useFeedbackAdminMode-uS9p5VCZ.js";
import { b as rt, c as at, e as ot } from "./feedbackApi-CdFCjUgg.js";
import { createPortal as st } from "react-dom";
import { m as lt } from "./feedbackLogCapture-DUBfVREg.js";
import { I as Qe, D as s, h as Fe } from "./FeedbackAdmin-3MwX2wQ9.js";
import { c as dt } from "./logCapture-Bkuy8MSd.js";
function ct(i) {
  return i.split(`
`).map((r) => r.trim()).filter((r) => r.startsWith("- ")).map((r) => r.slice(2).trim()).filter(Boolean);
}
function pt({ notes: i, updateStatus: r }) {
  const [n, g] = w(null), [x, m] = w(/* @__PURE__ */ new Set(["fixed"])), [b, v] = w(/* @__PURE__ */ new Set()), [k, D] = w("list"), [p, S] = w({}), B = he(() => x.size === 0 ? i : i.filter((d) => x.has(d.status)), [i, x]), L = he(() => i.filter((d) => d.status === "fixed"), [i]), W = V(async (d, f) => {
    g(`status-${d}`);
    try {
      await r(d, f), f === "resolved" && S((u) => {
        const $ = { ...u };
        return delete $[d], $;
      });
    } finally {
      g(null);
    }
  }, [r]), P = V((d, f) => {
    S((u) => {
      const $ = u[d] ?? /* @__PURE__ */ new Set(), c = new Set($);
      return c.has(f) ? c.delete(f) : c.add(f), { ...u, [d]: c };
    });
  }, []);
  return /* @__PURE__ */ t("div", { className: "debug-manage", children: [
    /* @__PURE__ */ e("div", { className: "debug-manage-toolbar", children: /* @__PURE__ */ t("div", { className: "debug-view-toggle", children: [
      /* @__PURE__ */ t(
        "button",
        {
          className: `debug-view-btn ${k === "list" ? "active" : ""}`,
          onClick: () => D("list"),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "list" }),
            "一覧"
          ]
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          className: `debug-view-btn ${k === "checklist" ? "active" : ""}`,
          onClick: () => D("checklist"),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "16px" }, children: "checklist" }),
            "確認手順",
            L.length > 0 && /* @__PURE__ */ e("span", { className: "debug-view-badge", children: L.length })
          ]
        }
      )
    ] }) }),
    k === "list" && /* @__PURE__ */ t(xe, { children: [
      /* @__PURE__ */ t("div", { className: "debug-status-filter", children: [
        ["open", "fixed", "resolved", "rejected"].map((d) => /* @__PURE__ */ e(
          "button",
          {
            "data-testid": `status-chip-${d}`,
            className: `debug-status-chip ${x.has(d) ? "active" : ""}`,
            onClick: () => {
              m((f) => {
                const u = new Set(f);
                return u.has(d) ? u.delete(d) : u.add(d), u;
              });
            },
            children: d
          },
          d
        )),
        /* @__PURE__ */ t("span", { className: "debug-filter-count", children: [
          B.length,
          "件"
        ] })
      ] }),
      B.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "対応中のノートはありません" }) : B.map((d) => /* @__PURE__ */ t("div", { children: [
        /* @__PURE__ */ t("div", { className: "debug-note-row", "data-status": d.status, children: [
          /* @__PURE__ */ t(
            "div",
            {
              className: "debug-note-info",
              style: { cursor: d.latest_comment ? "pointer" : void 0 },
              onClick: () => {
                d.latest_comment && v((f) => {
                  const u = new Set(f);
                  return u.has(d.id) ? u.delete(d.id) : u.add(d.id), u;
                });
              },
              children: [
                /* @__PURE__ */ t("span", { className: "debug-note-id", children: [
                  "#",
                  d.id
                ] }),
                d.latest_comment && /* @__PURE__ */ e("span", { style: { fontSize: "10px", opacity: 0.5 }, children: b.has(d.id) ? "▲" : "▼" }),
                /* @__PURE__ */ e("span", { className: `debug-severity-dot ${d.severity || "none"}` }),
                /* @__PURE__ */ t("span", { className: "debug-note-preview", children: [
                  d.source === "test" && /* @__PURE__ */ e("span", { className: "debug-source-badge", children: "🧪" }),
                  d.content.split(`
`)[0].slice(0, 40)
                ] })
              ]
            }
          ),
          /* @__PURE__ */ t(
            "select",
            {
              "data-testid": `note-status-select-${d.id}`,
              className: "debug-status-select",
              value: d.status,
              onChange: (f) => W(d.id, f.target.value),
              disabled: n !== null,
              children: [
                /* @__PURE__ */ e("option", { value: "open", children: "open" }),
                /* @__PURE__ */ e("option", { value: "fixed", children: "fixed" }),
                /* @__PURE__ */ e("option", { value: "resolved", children: "resolved" }),
                /* @__PURE__ */ e("option", { value: "rejected", children: "rejected" })
              ]
            }
          )
        ] }),
        b.has(d.id) && d.latest_comment && /* @__PURE__ */ e("div", { style: {
          padding: "4px 12px 6px 28px",
          fontSize: "11px",
          color: "#6B7280",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }, children: d.latest_comment })
      ] }, d.id))
    ] }),
    k === "checklist" && /* @__PURE__ */ e("div", { className: "debug-checklist-view", children: L.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "fixed のノートはありません" }) : L.map((d) => {
      const f = ct(d.latest_comment || ""), u = p[d.id] ?? /* @__PURE__ */ new Set(), $ = f.length > 0 && u.size === f.length;
      return /* @__PURE__ */ t("div", { className: "debug-checklist-card", children: [
        /* @__PURE__ */ t("div", { className: "debug-checklist-header", children: [
          /* @__PURE__ */ t("span", { className: "debug-note-id", children: [
            "#",
            d.id
          ] }),
          /* @__PURE__ */ e("span", { className: "debug-checklist-title", children: d.content.split(`
`)[0].slice(0, 50) })
        ] }),
        f.length > 0 ? /* @__PURE__ */ e("div", { className: "debug-checklist-items", children: f.map((c, N) => /* @__PURE__ */ t("label", { className: "debug-checklist-item", children: [
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: u.has(N),
              onChange: () => P(d.id, N)
            }
          ),
          /* @__PURE__ */ e("span", { className: u.has(N) ? "debug-checklist-done" : "", children: c })
        ] }, N)) }) : /* @__PURE__ */ e("div", { className: "debug-checklist-no-items", children: "確認手順が登録されていません" }),
        /* @__PURE__ */ t("div", { className: "debug-checklist-actions", children: [
          /* @__PURE__ */ t("span", { className: "debug-checklist-progress", children: [
            u.size,
            "/",
            f.length
          ] }),
          /* @__PURE__ */ e(
            "button",
            {
              className: "debug-btn debug-btn-resolve",
              disabled: !$ || n !== null,
              onClick: () => W(d.id, "resolved"),
              children: n === `status-${d.id}` ? "更新中..." : "resolved に変更"
            }
          )
        ] })
      ] }, d.id);
    }) })
  ] });
}
const ut = Xe(function({ testCases: r, env: n, logCapture: g, onNotesRefresh: x, onRunningCasesChange: m }, b) {
  const [v, k] = w([]), [D, p] = w(/* @__PURE__ */ new Set()), [S, B] = w(/* @__PURE__ */ new Set()), [L, W] = w({}), [P, d] = w({}), [f, u] = w(null), [$, c] = w(null), N = ce("");
  ie(() => {
    if (!r || r.length === 0) return;
    const y = JSON.stringify(r);
    if (y === N.current) return;
    let I = !1;
    return (async () => {
      try {
        await re.importTestCases(r);
      } catch (h) {
        console.warn("Failed to import test cases:", h);
        return;
      }
      if (!I)
        try {
          const h = await re.getTestTree(n);
          if (I) return;
          k(h), N.current = y;
          const J = {};
          for (const R of h)
            for (const a of R.capabilities)
              for (const C of a.cases)
                C.last === "pass" && (J[C.caseId] = !0);
          W(J);
        } catch (h) {
          console.warn("Failed to fetch test tree:", h);
        }
    })(), () => {
      I = !0;
    };
  }, [r, n]);
  const T = V(async () => {
    try {
      const y = await re.getTestTree(n);
      k(y);
      const I = {};
      for (const h of y)
        for (const J of h.capabilities)
          for (const R of J.cases)
            I[R.caseId] = R.last === "pass";
      W(I);
    } catch {
      c({ type: "error", text: "データの更新に失敗しました" });
    }
  }, [n]);
  Ye(b, () => ({ refresh: T }), [T]), ie(() => {
    if (!m) return;
    const y = [];
    for (const I of v)
      for (const h of I.capabilities) {
        const J = `${I.domain}/${h.capability}`;
        if (S.has(J))
          for (const R of h.cases) y.push(R.caseId);
      }
    m(y);
  }, [S, v, m]);
  const G = V(async (y, I, h) => {
    const J = `${y}/${I}`;
    u(J), c(null);
    try {
      const R = [], a = P[J], C = a != null && a.content.trim() && a.caseIds.length > 0 ? a.caseIds : [], E = new Set(C);
      for (const Q of h)
        L[Q.caseId] && !E.has(Q.caseId) && R.push({ caseId: Q.caseId, result: "pass" });
      for (const Q of C)
        R.push({ caseId: Q, result: "fail" });
      if (R.length === 0) {
        c({ type: "error", text: "チェックまたはバグ報告が必要です" }), u(null);
        return;
      }
      const H = typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0, q = C.length > 0 ? {
        content: a.content.trim(),
        severity: a.severity || void 0,
        consoleLogs: g == null ? void 0 : g.getConsoleLogs(),
        networkLogs: g == null ? void 0 : g.getNetworkLogs(),
        environment: H
      } : void 0, K = await re.submitTestRuns(n, R, q);
      if (a != null && a.files && a.files.length > 0 && K.results) {
        const Y = K.results.filter((l) => l.noteId != null).map((l) => l.noteId)[0];
        if (Y)
          for (const l of a.files)
            try {
              await re.uploadAttachment(n, Y, l);
            } catch (_) {
              console.warn("Failed to upload attachment:", _);
            }
      }
      if (K.capability) {
        k((Y) => Y.map((l) => l.domain !== y ? l : {
          ...l,
          capabilities: l.capabilities.map(
            (_) => _.capability === I ? K.capability : _
          )
        }));
        const Q = { ...L };
        for (const Y of K.capability.cases)
          Q[Y.caseId] = Y.last === "pass";
        W(Q);
      }
      x(), d((Q) => {
        const Y = { ...Q };
        return delete Y[J], Y;
      }), c({ type: "success", text: "送信しました" });
    } catch (R) {
      c({ type: "error", text: R instanceof Error ? R.message : "送信に失敗しました" });
    } finally {
      u(null);
    }
  }, [L, P, n, g, x]), A = V((y) => {
    p((I) => {
      const h = new Set(I);
      return h.has(y) ? h.delete(y) : h.add(y), h;
    });
  }, []), Z = V((y) => {
    B((I) => {
      const h = new Set(I);
      return h.has(y) ? h.delete(y) : h.add(y), h;
    });
  }, []), O = (y) => y.last === "pass" ? "passed" : y.last === "fail" && y.openIssues === 0 ? "retest" : y.last === "fail" ? "fail" : "-", j = (y) => y.last === "pass" ? s.success : y.last === "fail" && y.openIssues === 0 ? "#F59E0B" : y.last === "fail" ? s.error : s.gray500, te = (y) => y.status === "passed" ? "passed" : y.status === "retest" ? "retest" : y.status === "fail" ? "fail" : "", X = (y) => y.status === "passed" ? s.success : y.status === "retest" ? "#F59E0B" : y.status === "fail" ? s.error : s.gray500;
  return /* @__PURE__ */ t(xe, { children: [
    $ && /* @__PURE__ */ e("div", { className: `debug-message debug-message-${$.type}`, children: $.text }),
    /* @__PURE__ */ e("div", { className: "debug-test-tree", children: v.length === 0 ? /* @__PURE__ */ e("div", { className: "debug-empty", children: "テストケースを読み込み中..." }) : v.map((y) => /* @__PURE__ */ t("div", { className: "debug-tree-domain", children: [
      /* @__PURE__ */ t(
        "button",
        {
          "data-testid": `domain-toggle-${y.domain}`,
          className: "debug-tree-toggle",
          onClick: () => A(y.domain),
          children: [
            /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: D.has(y.domain) ? "expand_more" : "chevron_right" }),
            /* @__PURE__ */ e("span", { className: "debug-tree-label", children: y.domain })
          ]
        }
      ),
      D.has(y.domain) && y.capabilities.map((I) => {
        const h = `${y.domain}/${I.capability}`, J = S.has(h), R = P[h];
        return /* @__PURE__ */ t("div", { className: "debug-tree-capability", children: [
          /* @__PURE__ */ t(
            "button",
            {
              "data-testid": `cap-toggle-${h}`,
              className: "debug-tree-toggle debug-tree-cap-toggle",
              onClick: () => Z(h),
              children: [
                /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: J ? "expand_more" : "chevron_right" }),
                /* @__PURE__ */ e("span", { className: "debug-tree-label", children: I.capability }),
                /* @__PURE__ */ t("span", { className: "debug-tree-count", children: [
                  I.passed,
                  "/",
                  I.total
                ] }),
                I.status && /* @__PURE__ */ e("span", { className: "debug-tree-status", style: { color: X(I) }, children: te(I) }),
                I.openIssues > 0 && /* @__PURE__ */ t("span", { className: "debug-tree-issues", children: [
                  "[",
                  I.openIssues,
                  "件]"
                ] })
              ]
            }
          ),
          J && /* @__PURE__ */ t("div", { className: "debug-tree-cases", children: [
            I.cases.map((a) => /* @__PURE__ */ t("label", { "data-testid": `case-${a.caseId}`, className: "debug-tree-case", children: [
              /* @__PURE__ */ e(
                "input",
                {
                  type: "checkbox",
                  checked: !!L[a.caseId],
                  onChange: (C) => {
                    W((E) => ({
                      ...E,
                      [a.caseId]: C.target.checked
                    }));
                  }
                }
              ),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-title", children: a.title }),
              /* @__PURE__ */ e("span", { className: "debug-tree-case-status", style: { color: j(a) }, children: O(a) }),
              a.openIssues > 0 && /* @__PURE__ */ t("span", { className: "debug-tree-issues", children: [
                "[",
                a.openIssues,
                "件]"
              ] })
            ] }, a.caseId)),
            /* @__PURE__ */ t("div", { className: "debug-bug-form", children: [
              /* @__PURE__ */ e("div", { className: "debug-bug-form-title", children: "バグ報告" }),
              /* @__PURE__ */ t("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "ケース（複数選択可）" }),
                /* @__PURE__ */ e("div", { className: "debug-bug-cases", children: I.cases.map((a) => {
                  const C = (R == null ? void 0 : R.caseIds.includes(a.caseId)) ?? !1;
                  return /* @__PURE__ */ t("label", { className: "debug-bug-case-option", children: [
                    /* @__PURE__ */ e(
                      "input",
                      {
                        type: "checkbox",
                        checked: C,
                        onChange: (E) => {
                          d((H) => {
                            const q = H[h] || { caseIds: [], content: "", severity: "", files: [] }, K = E.target.checked ? [...q.caseIds, a.caseId] : q.caseIds.filter((Q) => Q !== a.caseId);
                            return { ...H, [h]: { ...q, caseIds: K } };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ e("span", { children: a.title })
                  ] }, a.caseId);
                }) })
              ] }),
              /* @__PURE__ */ t("div", { className: "debug-field", children: [
                /* @__PURE__ */ e("label", { children: "内容" }),
                /* @__PURE__ */ e(
                  "textarea",
                  {
                    value: (R == null ? void 0 : R.content) || "",
                    onChange: (a) => {
                      d((C) => {
                        var E, H, q;
                        return {
                          ...C,
                          [h]: {
                            ...C[h],
                            caseIds: ((E = C[h]) == null ? void 0 : E.caseIds) || [],
                            content: a.target.value,
                            severity: ((H = C[h]) == null ? void 0 : H.severity) || "",
                            files: ((q = C[h]) == null ? void 0 : q.files) || []
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
                    value: (R == null ? void 0 : R.severity) || "",
                    onChange: (a) => {
                      d((C) => {
                        var E, H, q;
                        return {
                          ...C,
                          [h]: {
                            ...C[h],
                            caseIds: ((E = C[h]) == null ? void 0 : E.caseIds) || [],
                            content: ((H = C[h]) == null ? void 0 : H.content) || "",
                            severity: a.target.value,
                            files: ((q = C[h]) == null ? void 0 : q.files) || []
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
                Qe,
                {
                  files: (R == null ? void 0 : R.files) || [],
                  onAdd: (a) => {
                    d((C) => {
                      var E, H, q, K;
                      return {
                        ...C,
                        [h]: {
                          ...C[h],
                          caseIds: ((E = C[h]) == null ? void 0 : E.caseIds) || [],
                          content: ((H = C[h]) == null ? void 0 : H.content) || "",
                          severity: ((q = C[h]) == null ? void 0 : q.severity) || "",
                          files: [...((K = C[h]) == null ? void 0 : K.files) || [], ...a]
                        }
                      };
                    });
                  },
                  onRemove: (a) => {
                    d((C) => {
                      var E, H, q, K;
                      return {
                        ...C,
                        [h]: {
                          ...C[h],
                          caseIds: ((E = C[h]) == null ? void 0 : E.caseIds) || [],
                          content: ((H = C[h]) == null ? void 0 : H.content) || "",
                          severity: ((q = C[h]) == null ? void 0 : q.severity) || "",
                          files: (((K = C[h]) == null ? void 0 : K.files) || []).filter((Q, Y) => Y !== a)
                        }
                      };
                    });
                  },
                  disabled: f !== null
                }
              )
            ] }),
            (() => {
              const a = R != null && R.content.trim() ? R.caseIds.length : 0, E = I.cases.filter((H) => L[H.caseId] && !(R != null && R.caseIds.includes(H.caseId) && a > 0)).length + a;
              return /* @__PURE__ */ e(
                "button",
                {
                  "data-testid": `cap-submit-${h}`,
                  className: "debug-btn debug-btn-primary debug-cap-submit",
                  onClick: () => G(y.domain, I.capability, I.cases),
                  disabled: f !== null || E === 0,
                  children: f === h ? /* @__PURE__ */ t("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
                  ] }) : `${E}/${I.total}件を送信`
                }
              );
            })()
          ] })
        ] }, h);
      })
    ] }, y.domain)) })
  ] });
});
function gt({
  items: i,
  defaultPath: r,
  onNavigate: n,
  onAppNavigate: g
}) {
  var p;
  const [x, m] = w(r || ((p = i[0]) == null ? void 0 : p.path) || ""), { content: b, loading: v, error: k } = nt(x), D = (S) => {
    m(S), n == null || n(S);
  };
  return /* @__PURE__ */ t("div", { className: "debug-manual-tab", children: [
    /* @__PURE__ */ e("div", { className: "debug-manual-sidebar", children: i.map((S) => /* @__PURE__ */ e(
      "button",
      {
        className: `debug-manual-item ${x === S.path ? "active" : ""}`,
        onClick: () => D(S.path),
        title: S.title,
        children: S.title
      },
      S.id
    )) }),
    /* @__PURE__ */ t("div", { className: "debug-manual-content", children: [
      v && /* @__PURE__ */ e("div", { className: "debug-empty", children: "読み込み中..." }),
      k && /* @__PURE__ */ e("div", { className: "debug-message debug-message-error", children: k.message }),
      b && /* @__PURE__ */ e(
        Fe,
        {
          content: b,
          onLinkClick: (S) => {
            m(S), n == null || n(S);
          },
          onAppLinkClick: g
        }
      )
    ] })
  ] });
}
function xt(i) {
  const { meta: r, body: n } = ht(i), g = n.split(`
`), x = {
    title: r.title,
    warning: r.warning,
    projects: []
  };
  let m = [], b = null, v = null, k = null, D = !1, p = [], S = [], B = [];
  const L = () => {
    if (B.length === 0) return;
    const u = ft(B);
    B = [], u && (k ? k.table = u : S.push(...bt(u)));
  }, W = () => {
    if (L(), k && S.length > 0) {
      const u = S.join(`
`).trim();
      u && (k.extraMd = (k.extraMd ? k.extraMd + `
` : "") + u);
    }
    S = [];
  }, P = () => {
    if (W(), b && k)
      if (D) {
        const u = [
          k.entries.map(($) => `- ${$.key}: ${$.value}`).join(`
`),
          k.extraMd ?? ""
        ].filter(Boolean).join(`

`);
        u.trim() && p.push(`## ${k.label}

${u}`);
      } else if (v) {
        let u = b.envs.find(($) => $.env === v);
        u || (u = { env: v, sections: [] }, b.envs.push(u)), u.sections.push(k);
      } else
        b.common.push(k);
    k = null, v = null, D = !1;
  }, d = () => {
    P(), b && (p.length > 0 && (b.notes = p.join(`

`).trim()), p = [], x.projects.push(b)), b = null;
  };
  for (let u = 0; u < g.length; u++) {
    const $ = g[u], c = $.trim();
    if (/^\|.*\|$/.test(c)) {
      B.push(c);
      continue;
    } else B.length > 0 && L();
    if (/^---+$/.test(c)) continue;
    const N = /^#\s+(.+)$/.exec($);
    if (N) {
      d();
      const A = N[1].trim();
      A === "共通" || /^(common|shared)$/i.test(A) ? b = { name: "共通", envs: [], common: [] } : b = { name: A, envs: [], common: [] };
      continue;
    }
    const T = /^##\s+(.+)$/.exec($);
    if (T) {
      P(), b || (b = { name: "共通", envs: [], common: [] });
      const A = T[1].trim();
      if (/前提|注意|注記|note|備考/i.test(A)) {
        k = { label: A, entries: [] }, D = !0;
        continue;
      }
      const Z = /^(.+?)\s*\/\s*(.+)$/.exec(A);
      if (Z)
        v = Me(Z[1].trim()), k = { label: Z[2].trim(), entries: [] };
      else {
        const O = Me(A.replace(/環境$/, "").trim());
        O && /^(dev|staging|stg|prod|production|local|test)$/i.test(O) ? (v = O, k = { label: "アカウント", entries: [] }) : (v = null, k = { label: A, entries: [] });
      }
      continue;
    }
    if (b && !k) {
      const A = /^phase\s*:\s*(.+)$/i.exec(c);
      if (A) {
        b.phase = A[1].trim();
        continue;
      }
    }
    const G = /^\s*-\s+([^:]+?):\s*(.+)$/.exec($);
    if (G && k && !D) {
      const A = G[1].trim(), Z = G[2].trim().replace(/^`|`$/g, "");
      k.entries.push({
        key: A,
        value: Z,
        kind: mt(A, Z)
      });
      continue;
    }
    c === "" && S.length === 0 || (k ? S.push($) : b || m.push($));
  }
  d();
  const f = m.join(`
`).trim();
  return f && (x.preamble = f), x;
}
function ht(i) {
  const r = /^---\n([\s\S]*?)\n---\n?/.exec(i);
  if (!r) return { meta: {}, body: i };
  const n = {};
  for (const g of r[1].split(`
`)) {
    const x = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(g);
    if (!x) continue;
    const m = x[1].toLowerCase(), b = x[2].trim().replace(/^["']|["']$/g, "");
    m === "title" ? n.title = b : m === "warning" && (n.warning = b);
  }
  return { meta: n, body: i.slice(r[0].length) };
}
function ft(i) {
  if (i.length < 2) return null;
  const r = (x) => x.replace(/^\|/, "").replace(/\|$/, "").split("|").map((m) => m.trim()), n = r(i[0]);
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(i[1]))
    return { headers: n, rows: i.slice(1).map(r) };
  const g = i.slice(2).map(r);
  return { headers: n, rows: g };
}
function bt(i) {
  const r = ["| " + i.headers.join(" | ") + " |"];
  r.push("| " + i.headers.map(() => "---").join(" | ") + " |");
  for (const n of i.rows) r.push("| " + n.join(" | ") + " |");
  return r;
}
function Me(i) {
  const r = i.toLowerCase();
  return /^(staging|stg)$/.test(r) ? "staging" : /^(prod|production|本番)$/.test(r) ? "prod" : /^(dev|development|開発)$/.test(r) ? "dev" : /^(local|ローカル)$/.test(r) ? "local" : /^(test|テスト)$/.test(r) ? "test" : i;
}
function mt(i, r) {
  const n = i.toLowerCase();
  return /pass|pwd|password|パスワード/.test(n) ? "password" : /url|link|endpoint/.test(n) || /^https?:\/\//.test(r) ? "url" : /mail|email|メール/.test(n) || /^[^\s@]+@[^\s@]+$/.test(r) ? "email" : /user|id|name|account|ユーザー/.test(n) ? "user" : "text";
}
function yt({ md: i }) {
  const r = he(() => xt(i), [i]), [n, g] = w(
    () => new Set(r.projects.map((m) => m.name))
  ), x = V((m) => {
    g((b) => {
      const v = new Set(b);
      return v.has(m) ? v.delete(m) : v.add(m), v;
    });
  }, []);
  return /* @__PURE__ */ t("div", { className: "debug-env-tab", children: [
    r.title && /* @__PURE__ */ e("h3", { style: { margin: "0 0 8px", fontSize: "14px" }, children: r.title }),
    r.warning && /* @__PURE__ */ t(
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
          /* @__PURE__ */ e("span", { children: r.warning })
        ]
      }
    ),
    r.preamble && /* @__PURE__ */ e("div", { style: { marginBottom: "10px", fontSize: "12px" }, children: /* @__PURE__ */ e(Fe, { content: r.preamble }) }),
    r.projects.length === 0 && /* @__PURE__ */ e("div", { className: "debug-empty", children: "環境情報が空です" }),
    r.projects.map((m) => /* @__PURE__ */ e(
      vt,
      {
        project: m,
        isExpanded: n.has(m.name),
        onToggle: () => x(m.name)
      },
      m.name
    ))
  ] });
}
function vt({
  project: i,
  isExpanded: r,
  onToggle: n
}) {
  var b;
  const g = i.envs.map((v) => v.env), [x, m] = w(g[0] ?? null);
  return /* @__PURE__ */ t(
    "div",
    {
      style: {
        marginBottom: "10px",
        border: `1px solid ${s.gray300}`,
        borderRadius: "6px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            onClick: n,
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
        r && /* @__PURE__ */ t("div", { style: { padding: "8px 10px" }, children: [
          i.common.map((v, k) => /* @__PURE__ */ e(Ae, { section: v }, `common-${k}`)),
          i.envs.length > 0 && /* @__PURE__ */ t(xe, { children: [
            /* @__PURE__ */ e(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "4px",
                  marginBottom: "8px",
                  borderBottom: `1px solid ${s.gray200}`
                },
                children: i.envs.map((v) => /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    onClick: () => m(v.env),
                    style: {
                      padding: "6px 12px",
                      background: "transparent",
                      border: "none",
                      borderBottom: x === v.env ? `2px solid ${s.primary}` : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: x === v.env ? 600 : 400,
                      color: x === v.env ? s.primary : s.gray700
                    },
                    children: v.env
                  },
                  v.env
                ))
              }
            ),
            (b = i.envs.find((v) => v.env === x)) == null ? void 0 : b.sections.map((v, k) => /* @__PURE__ */ e(Ae, { section: v }, `${x}-${k}`))
          ] }),
          i.notes && /* @__PURE__ */ t("details", { style: { marginTop: "10px" }, children: [
            /* @__PURE__ */ e("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600, color: s.gray700 }, children: "📝 前提・注意点" }),
            /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Fe, { content: i.notes }) })
          ] })
        ] })
      ]
    }
  );
}
function Ae({ section: i }) {
  return /* @__PURE__ */ t("div", { style: { marginBottom: "10px" }, children: [
    /* @__PURE__ */ e("div", { style: { fontSize: "12px", fontWeight: 600, color: s.gray700, marginBottom: "4px" }, children: i.label }),
    i.entries.length > 0 && /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "4px" }, children: i.entries.map((r, n) => /* @__PURE__ */ e(wt, { entry: r }, n)) }),
    i.table && /* @__PURE__ */ e("div", { style: { marginTop: "6px", overflowX: "auto" }, children: /* @__PURE__ */ t("table", { style: { width: "100%", fontSize: "11px", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: i.table.headers.map((r, n) => /* @__PURE__ */ e(
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
        n
      )) }) }),
      /* @__PURE__ */ e("tbody", { children: i.table.rows.map((r, n) => /* @__PURE__ */ e("tr", { children: r.map((g, x) => /* @__PURE__ */ e(
        kt,
        {
          value: g,
          header: i.table.headers[x] ?? ""
        },
        x
      )) }, n)) })
    ] }) }),
    i.extraMd && /* @__PURE__ */ e("div", { style: { marginTop: "6px", fontSize: "12px" }, children: /* @__PURE__ */ e(Fe, { content: i.extraMd }) })
  ] });
}
function wt({ entry: i }) {
  const [r, n] = w(!1), g = i.kind === "password", x = g && !r ? "•".repeat(Math.min(i.value.length, 10)) : i.value, m = i.kind === "url" ? "link" : i.kind === "email" ? "mail" : i.kind === "password" ? "key" : i.kind === "user" ? "person" : "label";
  return /* @__PURE__ */ t(
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
        /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px", color: s.gray500 }, children: m }),
        /* @__PURE__ */ e("span", { style: { minWidth: "60px", color: s.gray700 }, children: i.key }),
        /* @__PURE__ */ e(
          "span",
          {
            style: {
              flex: 1,
              fontFamily: i.kind === "password" || i.kind === "user" ? "monospace" : "inherit",
              wordBreak: "break-all"
            },
            children: x
          }
        ),
        g && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => n((b) => !b),
            title: r ? "隠す" : "表示",
            style: ke,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: r ? "visibility_off" : "visibility" })
          }
        ),
        i.kind === "url" && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => window.open(i.value, "_blank", "noopener"),
            title: "開く",
            style: ke,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "open_in_new" })
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              var b;
              return (b = navigator.clipboard) == null ? void 0 : b.writeText(i.value);
            },
            title: "コピー",
            style: ke,
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "14px" }, children: "content_copy" })
          }
        )
      ]
    }
  );
}
function kt({ value: i, header: r }) {
  const n = /pass|pwd|パスワード/i.test(r), g = /^https?:\/\//.test(i), x = /^[^\s@]+@[^\s@]+$/.test(i), [m, b] = w(!1), v = n && !m ? "•".repeat(Math.min(i.length, 10)) : i;
  return /* @__PURE__ */ e(
    "td",
    {
      style: {
        padding: "4px 6px",
        borderBottom: `1px solid ${s.gray200}`,
        fontFamily: n ? "monospace" : "inherit",
        wordBreak: "break-all"
      },
      children: /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
        g ? /* @__PURE__ */ e("a", { href: i, target: "_blank", rel: "noopener noreferrer", style: { color: s.primary, flex: 1 }, children: i }) : x ? /* @__PURE__ */ e("span", { style: { flex: 1 }, children: i }) : /* @__PURE__ */ e("span", { style: { flex: 1 }, children: v }),
        n && /* @__PURE__ */ e("button", { type: "button", onClick: () => b((k) => !k), style: ke, title: m ? "隠す" : "表示", children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: m ? "visibility_off" : "visibility" }) }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              var k;
              return (k = navigator.clipboard) == null ? void 0 : k.writeText(i);
            },
            style: ke,
            title: "コピー",
            children: /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "12px" }, children: "content_copy" })
          }
        )
      ] })
    }
  );
}
const ke = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  color: s.gray500,
  display: "inline-flex",
  alignItems: "center"
}, St = {
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
}, De = {
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
function $t() {
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
function zt({
  apiBaseUrl: i,
  env: r = "dev",
  onSave: n,
  onClose: g,
  initialSize: x = { width: 400, height: 500 },
  testCases: m,
  logCapture: b,
  manualItems: v,
  manualDefaultPath: k,
  onManualNavigate: D,
  onManualAppNavigate: p,
  environmentsMd: S
}) {
  var Le;
  const [B, L] = w(null), [W, P] = w(null), [d, f] = w(!1), u = ce(!1), [$, c] = w("record"), N = m && m.length > 0, T = v && v.length > 0, G = !!S && S.trim().length > 0, [A, Z] = w(""), [O, j] = w(""), [te, X] = w(""), [y, I] = w(!1), [h, J] = w(!1), [R, a] = w(!1), [C, E] = w(!1), [H, q] = w(!1), [K, Q] = w([]), [Y, l] = w(null), [_, ne] = w([]), [oe, fe] = w(!1), Se = ce(null);
  ie(() => {
    i && Ne(i);
  }, [i]);
  const { notes: Re, createNote: $e, updateStatus: Be, refresh: me, error: ze } = Ke(r), o = ce(ze);
  o.current = ze;
  const z = V(async () => {
    if (!window.documentPictureInPicture) {
      console.warn("Document Picture-in-Picture API is not supported"), f(!0);
      return;
    }
    if (!u.current) {
      u.current = !0;
      try {
        const M = await window.documentPictureInPicture.requestWindow({
          width: x.width,
          height: x.height
        }), le = M.document.createElement("style");
        le.textContent = $t(), M.document.head.appendChild(le);
        const be = M.document.createElement("div");
        be.id = "debug-panel-root", M.document.body.appendChild(be), L(M), P(be), f(!0), M.addEventListener("pagehide", () => {
          L(null), P(null), f(!1), g == null || g();
        });
      } catch (M) {
        console.error("Failed to open PiP window:", M), f(!0);
      } finally {
        u.current = !1;
      }
    }
  }, [x.width, x.height, g]), U = V(() => {
    B ? B.close() : (f(!1), g == null || g());
  }, [B, g]), ae = ce(B);
  ae.current = B, ie(() => () => {
    var M;
    (M = ae.current) == null || M.close();
  }, []);
  const ye = V(() => {
    Z(""), j(""), X(""), Q([]), J(!1), a(!1), E(!1), q(!1), l(null);
  }, []), Ue = V(async () => {
    var Ee;
    if (!A.trim()) {
      l({ type: "error", text: "内容は必須です" });
      return;
    }
    I(!0), l(null);
    const le = ((b == null ? void 0 : b.getNetworkLogs()) ?? []).map((ee) => {
      const pe = {
        timestamp: ee.timestamp,
        method: ee.method,
        url: ee.url,
        status: ee.status
      }, We = ["POST", "PUT", "DELETE", "PATCH"].includes(ee.method);
      return We && (ee.requestBody !== void 0 && (pe.requestBody = ee.requestBody), ee.responseBody !== void 0 && (pe.responseBody = ee.responseBody)), !We && R && ee.responseBody !== void 0 && (pe.responseBody = ee.responseBody), C && ee.duration != null && (pe.duration = ee.duration), H && (ee.requestHeaders && (pe.requestHeaders = ee.requestHeaders), ee.responseHeaders && (pe.responseHeaders = ee.responseHeaders)), pe;
    }), be = {
      content: A.trim(),
      userLog: O ? lt(O) : void 0,
      severity: te || void 0,
      testCaseIds: _.length > 0 ? _ : void 0,
      consoleLogs: b == null ? void 0 : b.getConsoleLogs(),
      networkLogs: le.length > 0 ? le : void 0,
      environment: typeof window < "u" ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      } : void 0
    }, ve = await $e(be);
    if (ve) {
      if (K.length > 0)
        try {
          for (const ee of K)
            await re.uploadAttachment(r, ve.id, ee);
        } catch (ee) {
          console.warn("Failed to upload some attachments:", ee), l({ type: "success", text: "保存しました（一部画像のアップロードに失敗）" }), I(!1);
          return;
        }
      l({ type: "success", text: "保存しました" }), n == null || n(ve), setTimeout(() => {
        ye();
      }, 1500);
    } else
      l({ type: "error", text: ((Ee = o.current) == null ? void 0 : Ee.message) || "保存に失敗しました" });
    I(!1);
  }, [A, O, te, _, K, R, C, H, $e, n, ye, b, r]), Ze = V(async () => {
    var M;
    fe(!0);
    try {
      $ === "manage" ? me() : $ === "test" && await ((M = Se.current) == null ? void 0 : M.refresh());
    } finally {
      fe(!1);
    }
  }, [$, me]), _e = /* @__PURE__ */ t("div", { className: "debug-panel", children: [
    /* @__PURE__ */ t("header", { className: "debug-header", children: [
      /* @__PURE__ */ t("div", { className: "debug-header-left", children: [
        /* @__PURE__ */ e("span", { className: "debug-icon", children: "edit_note" }),
        /* @__PURE__ */ e("span", { className: "debug-title", children: "デバッグノート" }),
        /* @__PURE__ */ e("span", { className: "debug-env", children: r })
      ] }),
      /* @__PURE__ */ t("div", { className: "debug-header-right", children: [
        $ !== "record" && /* @__PURE__ */ e(
          "button",
          {
            className: "debug-refresh-btn",
            onClick: Ze,
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
    /* @__PURE__ */ t("nav", { className: "debug-tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "record" ? "active" : ""}`,
          onClick: () => {
            c("record"), l(null);
          },
          children: "記録"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "manage" ? "active" : ""}`,
          onClick: () => c("manage"),
          children: "管理"
        }
      ),
      N && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "test" ? "active" : ""}`,
          onClick: () => c("test"),
          children: "テスト"
        }
      ),
      T && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "manual" ? "active" : ""}`,
          onClick: () => c("manual"),
          children: "マニュアル"
        }
      ),
      G && /* @__PURE__ */ e(
        "button",
        {
          className: `debug-tab ${$ === "env" ? "active" : ""}`,
          onClick: () => c("env"),
          children: "環境"
        }
      )
    ] }),
    /* @__PURE__ */ t("main", { className: "debug-content", children: [
      $ === "record" && /* @__PURE__ */ t(xe, { children: [
        _.length > 0 && /* @__PURE__ */ t(
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
              /* @__PURE__ */ t("span", { children: [
                "実行中: ",
                _.map((M) => `#${M}`).join(", ")
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
        /* @__PURE__ */ t("div", { className: "debug-field", children: [
          /* @__PURE__ */ e("label", { htmlFor: "debug-severity", children: "重要度（任意）" }),
          /* @__PURE__ */ t(
            "select",
            {
              id: "debug-severity",
              value: te,
              onChange: (M) => X(M.target.value),
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
              value: A,
              onChange: (M) => Z(M.target.value),
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
              value: O,
              onChange: (M) => j(M.target.value),
              placeholder: "状況や気づいたことを自由に記入",
              rows: 3,
              maxLength: 2e4
            }
          ),
          /* @__PURE__ */ e("span", { className: "debug-hint", children: "機密情報は自動でマスクされます" })
        ] }),
        /* @__PURE__ */ e(
          Qe,
          {
            files: K,
            onAdd: (M) => Q((le) => [...le, ...M]),
            onRemove: (M) => Q((le) => le.filter((be, ve) => ve !== M)),
            disabled: y,
            pipDocument: ((Le = ae.current) == null ? void 0 : Le.document) ?? null
          }
        ),
        /* @__PURE__ */ e("div", { className: "debug-toggle", children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            onClick: () => J(!h),
            className: "debug-toggle-btn",
            children: [
              /* @__PURE__ */ e("span", { className: "debug-icon", style: { fontSize: "18px" }, children: h ? "expand_less" : "expand_more" }),
              "添付オプション"
            ]
          }
        ) }),
        h && /* @__PURE__ */ t("div", { className: "debug-attach-options", children: [
          /* @__PURE__ */ t("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: R,
                onChange: (M) => a(M.target.checked)
              }
            ),
            "GETレスポンスを含める"
          ] }),
          /* @__PURE__ */ t("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: C,
                onChange: (M) => E(M.target.checked)
              }
            ),
            "通信時間を含める"
          ] }),
          /* @__PURE__ */ t("label", { className: "debug-attach-option", children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "checkbox",
                checked: H,
                onChange: (M) => q(M.target.checked)
              }
            ),
            "ヘッダーを含める"
          ] })
        ] })
      ] }),
      $ === "manage" && /* @__PURE__ */ e(pt, { notes: Re, updateStatus: Be }),
      $ === "manual" && T && /* @__PURE__ */ e(
        gt,
        {
          items: v,
          defaultPath: k,
          onNavigate: D,
          onAppNavigate: p
        }
      ),
      $ === "env" && G && /* @__PURE__ */ e(yt, { md: S }),
      $ === "test" && N && /* @__PURE__ */ e(
        ut,
        {
          ref: Se,
          testCases: m,
          env: r,
          logCapture: b,
          onNotesRefresh: me,
          onRunningCasesChange: ne
        }
      )
    ] }),
    $ === "record" && /* @__PURE__ */ t("footer", { className: "debug-footer", children: [
      /* @__PURE__ */ e("button", { onClick: ye, className: "debug-btn debug-btn-secondary", disabled: y, children: "クリア" }),
      /* @__PURE__ */ e("button", { onClick: Ue, className: "debug-btn debug-btn-primary", disabled: y, children: y ? /* @__PURE__ */ t("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" }, children: [
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
  return W ? st(_e, W) : d ? /* @__PURE__ */ e("div", { style: De.overlay, children: /* @__PURE__ */ e("div", { style: De.panel, children: _e }) }) : /* @__PURE__ */ e("button", { onClick: z, style: St, "aria-label": "デバッグノートを開く", children: /* @__PURE__ */ t("span", { style: { fontSize: "13px", fontWeight: 600, lineHeight: 1.2, textAlign: "center" }, children: [
    "バグ",
    /* @__PURE__ */ e("br", {}),
    "記録"
  ] }) });
}
function se({ size: i = 16, color: r }) {
  return /* @__PURE__ */ t(xe, { children: [
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
function F({ name: i, size: r = 20, color: n }) {
  return /* @__PURE__ */ e(
    "span",
    {
      className: "material-symbols-outlined",
      style: {
        fontSize: `${r}px`,
        color: n,
        lineHeight: 1,
        verticalAlign: "middle"
      },
      children: i
    }
  );
}
const Ct = {
  passed: "#22c55e",
  passedBg: "#f0fdf4",
  fail: "#ef4444",
  failBg: "#fef2f2",
  retest: "#f59e0b",
  retestBg: "#fffbeb",
  untested: "#e5e7eb",
  untestedBg: "#f9fafb"
}, It = {
  passed: "#4ade80",
  passedBg: "#064e3b",
  fail: "#f87171",
  failBg: "#450a0a",
  retest: "#fbbf24",
  retestBg: "#451a03",
  untested: "#475569",
  untestedBg: "#1e293b"
};
function Ft({ domains: i, colors: r, isDarkMode: n }) {
  const g = n ? It : Ct;
  return i.length === 0 ? /* @__PURE__ */ e("div", { style: {
    padding: "40px",
    textAlign: "center",
    color: r.textMuted,
    fontSize: "14px"
  }, children: "テストケースが登録されていません" }) : /* @__PURE__ */ t("div", { style: { marginBottom: "32px" }, children: [
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
      Rt,
      {
        domain: x,
        colors: r,
        tc: g
      },
      x.domain
    )) }),
    /* @__PURE__ */ t("div", { style: {
      display: "flex",
      gap: "20px",
      marginTop: "16px",
      fontSize: "12px",
      color: r.textMuted
    }, children: [
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: g.passed
        } }),
        "passed"
      ] }),
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: g.fail
        } }),
        "fail / 要対応"
      ] }),
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: g.retest
        } }),
        "retest"
      ] }),
      /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
        /* @__PURE__ */ e("span", { style: {
          width: "12px",
          height: "12px",
          borderRadius: "2px",
          background: g.untested
        } }),
        "未テスト"
      ] })
    ] })
  ] });
}
function Rt({ domain: i, colors: r, tc: n }) {
  return /* @__PURE__ */ t("div", { style: {
    background: r.bg,
    border: `1px solid ${r.border}`,
    borderRadius: "12px",
    padding: "20px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
      fontSize: "15px",
      fontWeight: 700,
      color: r.text,
      marginBottom: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ e("span", { children: i.domain }),
      /* @__PURE__ */ t("span", { style: {
        fontSize: "12px",
        fontWeight: 500,
        color: r.textMuted
      }, children: [
        i.passed,
        "/",
        i.total
      ] })
    ] }),
    /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: i.capabilities.map((g) => /* @__PURE__ */ e(
      Bt,
      {
        cap: g,
        colors: r,
        tc: n
      },
      g.capability
    )) })
  ] });
}
function Bt({ cap: i, colors: r, tc: n }) {
  const g = i.status === "fail" ? n.fail : i.status === "retest" ? n.retest : i.status === "passed" ? n.passed : n.untested, x = i.status === "fail" ? n.failBg : i.status === "retest" ? n.retestBg : i.status === "passed" ? n.passedBg : n.untestedBg;
  return /* @__PURE__ */ t("div", { style: {
    borderLeft: `4px solid ${g}`,
    background: x,
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
        color: r.text
      }, children: i.capability }),
      /* @__PURE__ */ t("span", { style: {
        fontSize: "12px",
        color: r.textMuted
      }, children: [
        i.passed,
        "/",
        i.total
      ] })
    ] }),
    /* @__PURE__ */ t("div", { style: {
      display: "flex",
      height: "8px",
      borderRadius: "4px",
      overflow: "hidden",
      background: n.untested
    }, children: [
      i.passed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${i.passed / i.total * 100}%`,
        background: n.passed
      } }),
      i.failed > 0 && /* @__PURE__ */ e("div", { style: {
        width: `${i.failed / i.total * 100}%`,
        background: n.fail
      } })
    ] })
  ] });
}
const Tt = {
  passed: "#22c55e",
  fail: "#ef4444",
  retest: "#f59e0b",
  untested: "#9ca3af"
}, Nt = {
  passed: "#4ade80",
  fail: "#f87171",
  retest: "#fbbf24",
  untested: "#64748b"
};
function _t({ tree: i, colors: r, isDarkMode: n, onNavigateToNote: g }) {
  const x = n ? Nt : Tt, [m, b] = w(/* @__PURE__ */ new Set()), [v, k] = w(/* @__PURE__ */ new Set());
  ie(() => {
    b((d) => {
      const f = new Set(d);
      return i.forEach((u) => f.add(u.domain)), f;
    });
  }, [i]);
  const [D, p] = w("all"), [S, B] = w(!1), L = (d) => {
    b((f) => {
      const u = new Set(f);
      return u.has(d) ? u.delete(d) : u.add(d), u;
    });
  }, W = (d) => {
    k((f) => {
      const u = new Set(f);
      return u.has(d) ? u.delete(d) : u.add(d), u;
    });
  }, P = he(() => i.map((d) => {
    const f = d.capabilities.filter((u) => {
      const $ = u.passed === u.total && u.total > 0, c = u.failed > 0 || u.openIssues > 0, N = u.passed < u.total;
      return !(D === "passed" && !$ || D === "fail" && !c || D === "incomplete" && !N || S && $ && u.openIssues === 0);
    });
    return f.length === 0 ? null : { ...d, capabilities: f };
  }).filter((d) => d !== null), [i, D, S]);
  return i.length === 0 ? null : /* @__PURE__ */ t("div", { children: [
    /* @__PURE__ */ e("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: r.textSecondary,
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
          value: D,
          onChange: (d) => p(d.target.value),
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
      /* @__PURE__ */ t("label", { style: {
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
            onChange: (d) => B(d.target.checked),
            style: { accentColor: r.primary }
          }
        ),
        "要対応のみ"
      ] })
    ] }),
    /* @__PURE__ */ t("div", { style: {
      border: `1px solid ${r.border}`,
      borderRadius: "12px",
      overflow: "hidden"
    }, children: [
      P.map((d, f) => {
        const u = m.has(d.domain), $ = d.capabilities.reduce((T, G) => T + G.total, 0), c = d.capabilities.reduce((T, G) => T + G.passed, 0), N = $ > 0 ? Math.round(c / $ * 100) : 0;
        return /* @__PURE__ */ t("div", { children: [
          /* @__PURE__ */ t(
            "div",
            {
              onClick: () => L(d.domain),
              style: {
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                background: r.bgSecondary,
                cursor: "pointer",
                borderBottom: `1px solid ${r.border}`,
                borderTop: f > 0 ? `1px solid ${r.border}` : "none",
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
                }, children: d.domain }),
                /* @__PURE__ */ t("span", { style: {
                  fontSize: "13px",
                  color: r.textMuted,
                  fontVariantNumeric: "tabular-nums"
                }, children: [
                  c,
                  "/",
                  $,
                  " ",
                  N,
                  "%"
                ] })
              ]
            }
          ),
          u && d.capabilities.map((T) => {
            const G = `${d.domain}/${T.capability}`, A = v.has(G), Z = T.passed === T.total && T.total > 0, O = T.cases.some((h) => h.last === "fail" && h.openIssues > 0), j = T.cases.some((h) => h.last === "fail" && h.openIssues === 0), te = !O && j, X = O, y = Z ? "●" : X ? "▲" : te ? "◆" : "○", I = Z ? x.passed : X ? x.fail : te ? x.retest : x.untested;
            return /* @__PURE__ */ t("div", { children: [
              /* @__PURE__ */ t(
                "div",
                {
                  onClick: () => W(G),
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
                    /* @__PURE__ */ e("span", { style: { color: I, fontSize: "14px", width: "16px" }, children: y }),
                    /* @__PURE__ */ e("span", { style: {
                      fontSize: "13px",
                      fontWeight: 500,
                      color: r.text,
                      flex: 1
                    }, children: T.capability }),
                    /* @__PURE__ */ t("span", { style: {
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
                    T.openIssues > 0 && /* @__PURE__ */ t("span", { style: {
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
              A && T.cases.map((h) => /* @__PURE__ */ e(
                Lt,
                {
                  c: h,
                  tc: x,
                  colors: r,
                  onNavigateToNote: g
                },
                h.caseId
              ))
            ] }, G);
          })
        ] }, d.domain);
      }),
      P.length === 0 && /* @__PURE__ */ e("div", { style: {
        padding: "24px",
        textAlign: "center",
        color: r.textMuted,
        fontSize: "13px"
      }, children: "該当するCapabilityがありません" })
    ] })
  ] });
}
function Lt({ c: i, tc: r, colors: n, onNavigateToNote: g }) {
  const x = i.last === "fail" && i.openIssues === 0, m = i.last === "pass" ? "●" : x ? "◆" : i.last === "fail" ? "▲" : "○", b = i.last === "pass" ? r.passed : x ? r.retest : i.last === "fail" ? r.fail : r.untested;
  return /* @__PURE__ */ t("div", { style: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px 8px 72px",
    background: n.bg,
    borderBottom: `1px solid ${n.borderLight}`,
    gap: "8px",
    fontSize: "13px"
  }, children: [
    /* @__PURE__ */ e("span", { style: { color: b, fontSize: "12px", width: "16px" }, children: m }),
    /* @__PURE__ */ e("span", { style: { color: n.text, flex: 1 }, children: i.title }),
    /* @__PURE__ */ e("span", { style: {
      fontSize: "11px",
      color: n.textMuted
    }, children: i.last || "-" }),
    i.openIssues > 0 && /* @__PURE__ */ t(
      "button",
      {
        onClick: (v) => {
          v.stopPropagation(), g(i.caseId);
        },
        style: {
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "10px",
          background: `${r.fail}18`,
          color: n.link,
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
const Et = 3e4;
function Wt({ env: i, colors: r, isDarkMode: n, onNavigateToNote: g, refreshKey: x }) {
  const [m, b] = w([]), [v, k] = w(!0), [D, p] = w(null), S = ce(0);
  ie(() => {
    let L = !1;
    const W = ++S.current, P = async () => {
      try {
        const f = await re.getTestTree(i);
        !L && S.current === W && (b(f), p(null));
      } catch (f) {
        !L && S.current === W && p(f instanceof Error ? f.message : "Failed to fetch test tree");
      } finally {
        !L && S.current === W && k(!1);
      }
    };
    k(!0), P();
    const d = setInterval(P, Et);
    return () => {
      L = !0, clearInterval(d);
    };
  }, [i, x]);
  const B = he(() => m.map((L) => {
    let W = 0, P = 0, d = 0, f = !1;
    const u = L.capabilities.map((c) => {
      const N = c.total - c.passed - c.failed;
      W += c.total, P += c.passed, d += c.failed, (c.failed > 0 || c.openIssues > 0) && (f = !0);
      const T = c.passed === c.total && c.total > 0, G = c.cases.some((O) => O.last === "fail" && O.openIssues > 0), A = c.cases.some((O) => O.last === "fail" && O.openIssues === 0), Z = T ? "passed" : G ? "fail" : A ? "retest" : "incomplete";
      return {
        capability: c.capability,
        total: c.total,
        passed: c.passed,
        failed: c.failed,
        untested: N < 0 ? 0 : N,
        openIssues: c.openIssues,
        status: Z,
        cases: c.cases
      };
    }), $ = W - P - d;
    return {
      domain: L.domain,
      total: W,
      passed: P,
      failed: d,
      untested: $ < 0 ? 0 : $,
      hasIssues: f,
      capabilities: u
    };
  }), [m]);
  return v && m.length === 0 ? /* @__PURE__ */ t("div", { style: {
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
  ] }) : D && m.length === 0 ? /* @__PURE__ */ e("div", { style: {
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
  }, children: /* @__PURE__ */ t("div", { style: { maxWidth: "1200px" }, children: [
    /* @__PURE__ */ e(
      Ft,
      {
        domains: B,
        colors: r,
        isDarkMode: n
      }
    ),
    /* @__PURE__ */ e(
      _t,
      {
        tree: m,
        colors: r,
        isDarkMode: n,
        onNavigateToNote: g
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
}, Mt = {
  bug: "#EF4444",
  question: "#3B82F6",
  request: "#10B981",
  share: "#6B7280",
  other: "#8B5CF6"
}, Te = {
  app: "アプリ",
  manual: "マニュアル"
}, je = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "対応中" },
  { value: "closed", label: "完了" }
];
function Oe(i) {
  const r = Mt[i] ?? "#6B7280";
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
function He(i, r) {
  let n, g;
  switch (i) {
    case "open":
      n = r.warningBg, g = r.warning;
      break;
    case "in_progress":
      n = r.primaryLight, g = r.primary;
      break;
    case "closed":
      n = r.successBg, g = r.success;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: n,
    color: g,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  };
}
function At({ apiBaseUrl: i, adminKey: r, colors: n, isDarkMode: g, refreshKey: x }) {
  var K, Q, Y;
  const {
    feedbacks: m,
    total: b,
    page: v,
    limit: k,
    loading: D,
    error: p,
    filters: S,
    customTags: B,
    setFilters: L,
    setPage: W,
    updateStatus: P,
    remove: d,
    refresh: f
  } = it({ apiBaseUrl: i, adminKey: r }), [u, $] = w(null), [c, N] = w(null), [T, G] = w(!1), [A, Z] = w(null), [O, j] = w(null), te = ce(0), X = ce(x);
  ie(() => {
    x !== X.current && (X.current = x, f());
  }, [x, f]);
  const y = Math.max(1, Math.ceil(b / k)), I = V(async (l) => {
    if (u === l) return;
    $(l), G(!0), N(null);
    const _ = ++te.current;
    try {
      const ne = await rt({ apiBaseUrl: i, adminKey: r, id: l });
      if (te.current !== _) return;
      N(ne);
    } catch {
      if (te.current !== _) return;
      N(null);
    }
    te.current === _ && G(!1);
  }, [u, i, r]), h = V(async (l, _) => {
    await P(l, _) && (c == null ? void 0 : c.id) === l && N((oe) => oe ? { ...oe, status: _ } : null);
  }, [P, c == null ? void 0 : c.id]), J = V(async (l) => {
    if (!confirm("このフィードバックを削除しますか？")) return;
    await d(l) && u === l && ($(null), N(null));
  }, [d, u]), R = V(async (l, _) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await at({ apiBaseUrl: i, adminKey: r, feedbackId: l, attachmentId: _ }), N((ne) => {
          var oe;
          return !ne || ne.id !== l ? ne : {
            ...ne,
            attachments: (oe = ne.attachments) == null ? void 0 : oe.filter((fe) => fe.id !== _)
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
      await ot({ apiBaseUrl: i, adminKey: r, format: l });
    } catch (_) {
      console.error("Export failed:", _);
    } finally {
      j(null);
    }
  }, [i, r]), E = {
    open: m.filter((l) => l.status === "open").length,
    inProgress: m.filter((l) => l.status === "in_progress").length,
    closed: m.filter((l) => l.status === "closed").length
  }, H = g ? "#0D1117" : "#1E293B", q = g ? "#21262D" : "#2D3748";
  return /* @__PURE__ */ t("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
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
        borderBottom: `1px solid ${n.border}`,
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ t(
          "select",
          {
            value: S.status,
            onChange: (l) => L({ status: l.target.value }),
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
              /* @__PURE__ */ e("option", { value: "", children: "全ステータス" }),
              je.map((l) => /* @__PURE__ */ e("option", { value: l.value, children: l.label }, l.value))
            ]
          }
        ),
        /* @__PURE__ */ t(
          "select",
          {
            value: S.kind,
            onChange: (l) => L({ kind: l.target.value }),
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
            value: S.target,
            onChange: (l) => L({ target: l.target.value }),
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
              /* @__PURE__ */ e("option", { value: "", children: "全対象" }),
              /* @__PURE__ */ e("option", { value: "app", children: "アプリ" }),
              /* @__PURE__ */ e("option", { value: "manual", children: "マニュアル" })
            ]
          }
        ),
        B.length > 0 && /* @__PURE__ */ t(
          "select",
          {
            value: S.customTag,
            onChange: (l) => L({ customTag: l.target.value }),
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
              /* @__PURE__ */ e("option", { value: "", children: "全タグ" }),
              B.map((l) => /* @__PURE__ */ e("option", { value: l, children: l }, l))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ t("div", { style: { flex: 1, overflow: "auto", padding: "12px" }, children: [
        D && /* @__PURE__ */ t("div", { style: { padding: "40px", textAlign: "center", color: n.textMuted }, children: [
          /* @__PURE__ */ e(se, { size: 24, color: n.primary }),
          /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
        ] }),
        p && /* @__PURE__ */ e("div", { style: {
          padding: "16px",
          background: n.errorBg,
          color: n.error,
          borderRadius: "12px",
          margin: "8px",
          fontSize: "13px"
        }, children: p.message }),
        !D && m.length === 0 && /* @__PURE__ */ t("div", { style: { padding: "40px", textAlign: "center", color: n.textMuted }, children: [
          /* @__PURE__ */ e(F, { name: "inbox", size: 40 }),
          /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "フィードバックがありません" })
        ] }),
        m.map((l) => {
          const _ = Ce[l.kind] ?? { label: l.kind, icon: "help" }, ne = u === l.id;
          return /* @__PURE__ */ t(
            "div",
            {
              style: {
                padding: "16px",
                background: n.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: ne ? `2px solid ${n.primary}` : "2px solid transparent",
                boxShadow: ne ? `0 4px 12px ${n.primary}30` : `0 1px 3px ${n.border}`,
                transition: "all 0.2s"
              },
              onClick: () => I(l.id),
              children: [
                /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ t("span", { style: { fontSize: "11px", color: n.textMuted, fontFamily: "monospace" }, children: [
                    "#",
                    l.id
                  ] }),
                  /* @__PURE__ */ t("span", { style: Oe(l.kind), children: [
                    /* @__PURE__ */ e(F, { name: _.icon, size: 12 }),
                    _.label
                  ] }),
                  /* @__PURE__ */ e("span", { style: He(l.status, n), children: l.status === "open" ? "Open" : l.status === "in_progress" ? "対応中" : "完了" }),
                  l.target && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: n.bgTertiary,
                    color: n.textSecondary,
                    fontWeight: 500
                  }, children: Te[l.target] ?? l.target }),
                  l.customTag && /* @__PURE__ */ e("span", { style: {
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: `${n.primary}15`,
                    color: n.primary,
                    fontWeight: 500
                  }, children: l.customTag })
                ] }),
                /* @__PURE__ */ e("div", { style: {
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "8px",
                  color: n.text,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }, children: l.message.split(`
`)[0].slice(0, 80) }),
                /* @__PURE__ */ t("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: n.textMuted
                }, children: [
                  /* @__PURE__ */ e("span", { children: Dt(l.createdAt) }),
                  l.pageUrl && /* @__PURE__ */ t(xe, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ t("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      background: n.bgTertiary,
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
                  (l.attachmentCount ?? 0) > 0 && /* @__PURE__ */ t(xe, { children: [
                    /* @__PURE__ */ e("span", { style: { margin: "0 2px" }, children: "·" }),
                    /* @__PURE__ */ t("span", { style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "11px",
                      color: n.textMuted
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
      y > 1 && /* @__PURE__ */ t("div", { style: {
        padding: "12px 16px",
        borderTop: `1px solid ${n.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }, children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => W(v - 1),
            disabled: v <= 1,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: n.bg,
              color: v <= 1 ? n.textMuted : n.text,
              cursor: v <= 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${n.border}`
            },
            children: /* @__PURE__ */ e(F, { name: "chevron_left", size: 16 })
          }
        ),
        /* @__PURE__ */ t("span", { style: { fontSize: "13px", color: n.textSecondary }, children: [
          v,
          " / ",
          y
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: () => W(v + 1),
            disabled: v >= y,
            style: {
              padding: "6px 12px",
              border: "none",
              borderRadius: "8px",
              background: n.bg,
              color: v >= y ? n.textMuted : n.text,
              cursor: v >= y ? "not-allowed" : "pointer",
              fontSize: "13px",
              boxShadow: `0 1px 3px ${n.border}`
            },
            children: /* @__PURE__ */ e(F, { name: "chevron_right", size: 16 })
          }
        )
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
          /* @__PURE__ */ e(F, { name: "description", size: 16 }),
          b,
          " 件"
        ] }),
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(F, { name: "error", size: 16, color: n.warning }),
          E.open,
          " Open"
        ] }),
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(F, { name: "pending", size: 16, color: n.primary }),
          E.inProgress,
          " 対応中"
        ] }),
        /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
          /* @__PURE__ */ e(F, { name: "check_circle", size: 16, color: n.success }),
          E.closed,
          " 完了"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ t("main", { style: {
      flex: 1,
      overflow: "auto",
      padding: "32px",
      background: n.bg
    }, children: [
      u && T && /* @__PURE__ */ t("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: n.textMuted }, children: [
        /* @__PURE__ */ e(se, { size: 32, color: n.primary }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "読み込み中..." })
      ] }),
      u && !T && c && /* @__PURE__ */ t("div", { style: { maxWidth: "800px" }, children: [
        /* @__PURE__ */ t("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }, children: [
          /* @__PURE__ */ t("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ t("span", { style: Oe(c.kind), children: [
                /* @__PURE__ */ e(F, { name: ((K = Ce[c.kind]) == null ? void 0 : K.icon) ?? "help", size: 14 }),
                ((Q = Ce[c.kind]) == null ? void 0 : Q.label) ?? c.kind
              ] }),
              /* @__PURE__ */ e("span", { style: He(c.status, n), children: c.status === "open" ? "Open" : c.status === "in_progress" ? "対応中" : "完了" }),
              c.target && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: n.bgTertiary,
                color: n.textSecondary,
                fontWeight: 500
              }, children: Te[c.target] ?? c.target }),
              c.customTag && /* @__PURE__ */ e("span", { style: {
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: `${n.primary}15`,
                color: n.primary,
                fontWeight: 600
              }, children: c.customTag })
            ] }),
            /* @__PURE__ */ t("h2", { style: {
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: n.text,
              lineHeight: 1.3,
              letterSpacing: "-0.025em"
            }, children: [
              "#",
              c.id,
              " フィードバック"
            ] })
          ] }),
          /* @__PURE__ */ t("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ e(
              "select",
              {
                value: c.status,
                onChange: (l) => h(c.id, l.target.value),
                style: {
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: n.bgSecondary,
                  color: n.text,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer"
                },
                children: je.map((l) => /* @__PURE__ */ e("option", { value: l.value, children: l.label }, l.value))
              }
            ),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: () => J(c.id),
                style: {
                  padding: "10px 16px",
                  background: n.errorBg,
                  border: "none",
                  borderRadius: "10px",
                  color: n.error,
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
        /* @__PURE__ */ t("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }, children: [
          /* @__PURE__ */ e(ue, { icon: "category", label: "種別", value: ((Y = Ce[c.kind]) == null ? void 0 : Y.label) ?? c.kind, colors: n }),
          /* @__PURE__ */ e(ue, { icon: "ads_click", label: "対象", value: c.target ? Te[c.target] ?? c.target : "-", colors: n }),
          /* @__PURE__ */ e(ue, { icon: "schedule", label: "日時", value: jt(c.createdAt), colors: n }),
          c.pageUrl && /* @__PURE__ */ e(ue, { icon: "link", label: "URL", value: c.pageUrl, isLink: !0, colors: n }),
          c.userType && /* @__PURE__ */ e(ue, { icon: "person", label: "ユーザー", value: c.userType, colors: n }),
          c.appVersion && /* @__PURE__ */ e(ue, { icon: "inventory_2", label: "バージョン", value: c.appVersion, colors: n })
        ] }),
        /* @__PURE__ */ e(we, { icon: "chat", title: "メッセージ", colors: n, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: n.text
        }, children: c.message }) }),
        c.environment && Object.keys(c.environment).length > 0 && /* @__PURE__ */ e(we, { icon: "devices", title: "環境情報", colors: n, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: Object.entries(c.environment).map(([l, _]) => /* @__PURE__ */ e(ue, { icon: "info", label: l, value: String(_), colors: n }, l)) }) }),
        c.consoleLogs && c.consoleLogs.length > 0 && /* @__PURE__ */ e(we, { icon: "terminal", title: `コンソールログ (${c.consoleLogs.length}件)`, colors: n, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: H }, children: c.consoleLogs.map((l, _) => /* @__PURE__ */ t("div", { style: {
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
        c.networkLogs && c.networkLogs.length > 0 && /* @__PURE__ */ e(we, { icon: "wifi", title: `ネットワークログ (${c.networkLogs.length}件)`, colors: n, children: /* @__PURE__ */ e("div", { style: { borderRadius: "12px", overflow: "hidden", background: H }, children: c.networkLogs.map((l, _) => /* @__PURE__ */ t("div", { style: {
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
        c.attachments && c.attachments.length > 0 && /* @__PURE__ */ e(we, { icon: "image", title: `添付画像 (${c.attachments.length}件)`, colors: n, children: /* @__PURE__ */ e("div", { style: {
          display: "flex",
          gap: "12px",
          flexWrap: "wrap"
        }, children: c.attachments.map((l) => /* @__PURE__ */ t("div", { style: {
          position: "relative",
          width: "120px",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${n.border}`,
          background: n.bgSecondary
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
              onClick: () => R(c.id, l.id),
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
            color: n.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: l.original_name })
        ] }, l.id)) }) }),
        A && /* @__PURE__ */ e(
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
                src: A,
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
      u && !T && !c && /* @__PURE__ */ t("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: n.textMuted }, children: [
        /* @__PURE__ */ e(F, { name: "error_outline", size: 48 }),
        /* @__PURE__ */ e("div", { style: { marginTop: "12px", fontSize: "16px" }, children: "詳細の取得に失敗しました" })
      ] }),
      !u && /* @__PURE__ */ t("div", { style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: n.textMuted,
        gap: "24px"
      }, children: [
        /* @__PURE__ */ t("div", { style: {
          padding: "24px 32px",
          background: n.bgSecondary,
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%"
        }, children: [
          /* @__PURE__ */ t("div", { style: {
            fontSize: "14px",
            fontWeight: 600,
            color: n.textSecondary,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }, children: [
            /* @__PURE__ */ e(F, { name: "analytics", size: 18 }),
            "フィードバック概要"
          ] }),
          /* @__PURE__ */ t("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "13px",
            color: n.textSecondary,
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: n.text }, children: b }),
              " 件"
            ] }),
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: n.warning }, children: E.open }),
              " Open"
            ] }),
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: n.primary }, children: E.inProgress }),
              " 対応中"
            ] }),
            /* @__PURE__ */ t("span", { children: [
              /* @__PURE__ */ e("strong", { style: { fontSize: "20px", color: n.success }, children: E.closed }),
              " 完了"
            ] })
          ] }),
          /* @__PURE__ */ e("div", { style: {
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }, children: ["json", "csv", "sqlite"].map((l) => /* @__PURE__ */ t(
            "button",
            {
              onClick: () => C(l),
              disabled: O !== null,
              style: {
                padding: "8px 14px",
                background: n.bg,
                border: "none",
                borderRadius: "10px",
                cursor: O !== null ? "not-allowed" : "pointer",
                color: n.text,
                fontWeight: 500,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                opacity: O !== null && O !== l ? 0.5 : 1,
                boxShadow: `0 1px 3px ${n.border}`,
                transition: "all 0.2s"
              },
              children: [
                O === l ? /* @__PURE__ */ e(se, { size: 14, color: n.text }) : /* @__PURE__ */ e(F, { name: "download", size: 16 }),
                l.toUpperCase()
              ]
            },
            l
          )) })
        ] }),
        /* @__PURE__ */ t("div", { style: { textAlign: "center" }, children: [
          /* @__PURE__ */ e(F, { name: "arrow_back", size: 48 }),
          /* @__PURE__ */ e("div", { style: { fontSize: "16px", fontWeight: 500, marginTop: "12px" }, children: "フィードバックを選択してください" }),
          /* @__PURE__ */ e("div", { style: { fontSize: "13px", marginTop: "6px" }, children: "左のリストから選択すると詳細が表示されます" })
        ] })
      ] })
    ] })
  ] });
}
function ue({ icon: i, label: r, value: n, isLink: g, colors: x }) {
  return /* @__PURE__ */ t("div", { style: {
    padding: "16px",
    background: x.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
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
      color: g ? x.link : x.text,
      fontFamily: g ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: n })
  ] });
}
function we({ icon: i, title: r, children: n, colors: g }) {
  return /* @__PURE__ */ t("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ t("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: g.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(F, { name: i, size: 18 }),
      r
    ] }),
    n
  ] });
}
function Dt(i) {
  const r = new Date(i), n = r.getMonth() + 1, g = r.getDate(), x = r.getHours().toString().padStart(2, "0"), m = r.getMinutes().toString().padStart(2, "0");
  return `${n}/${g} ${x}:${m}`;
}
function jt(i) {
  return new Date(i).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Ot = {
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
}, Ht = {
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
}, Pt = 3e4;
function rn({ apiBaseUrl: i, env: r = "dev", feedbackApiBaseUrl: n, feedbackAdminKey: g }) {
  const [x, m] = w(""), [b, v] = w(""), [k, D] = w(""), [p, S] = w(null), [B, L] = w(() => typeof window < "u" ? window.matchMedia("(prefers-color-scheme: dark)").matches : !1), [W, P] = w(!0), [d, f] = w(null), [u, $] = w("notes"), c = !!(n && g), [N, T] = w(null), [G, A] = w(0), [Z, O] = w(null), [j, te] = w(null), [X, y] = w(""), [I, h] = w(""), [J, R] = w(!1), a = B ? Ht : Ot;
  ie(() => {
    i && Ne(i);
  }, [i]), ie(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia("(prefers-color-scheme: dark)"), z = (U) => L(U.matches);
    return o.addEventListener("change", z), () => o.removeEventListener("change", z);
  }, []);
  const { notes: C, loading: E, error: H, updateStatus: q, updateSeverity: K, deleteNote: Q, refresh: Y } = Ke(r);
  ie(() => {
    !E && d === "refresh" && f(null);
  }, [E, d]), ie(() => {
    if (p) {
      const o = C.find((z) => z.id === p.id);
      S(o || null);
    }
  }, [C]), ie(() => {
    if (!W) return;
    const o = setInterval(() => {
      Y();
    }, Pt);
    return () => clearInterval(o);
  }, [W, Y]);
  const l = V((o) => {
    const U = `${i || tt()}/export/${o}?env=${r}`;
    window.open(U, "_blank");
  }, [i, r]), _ = V((o) => {
    T(o), m("open"), $("notes");
  }, []), ne = he(() => C.filter((o) => {
    if (x && o.status !== x || b && (o.source || "manual") !== b || N != null && !(o.test_case_ids ?? (o.test_case_id ? [o.test_case_id] : [])).includes(N))
      return !1;
    if (k) {
      const z = k.match(/^#([1-9]\d*)$/);
      if (z) {
        if (o.id !== Number(z[1])) return !1;
      } else {
        const U = k.toLowerCase();
        if (!o.title.toLowerCase().includes(U) && !o.content.toLowerCase().includes(U)) return !1;
      }
    }
    return !0;
  }), [C, x, b, N, k]), oe = V((o, z) => {
    z === "fixed" || z === "resolved" || z === "rejected" ? (te({ id: o, status: z }), y("")) : (async () => {
      f(`status-${o}`);
      try {
        await q(o, z), (p == null ? void 0 : p.id) === o && S((U) => U ? { ...U, status: z } : null);
      } finally {
        f(null);
      }
    })();
  }, [q, p == null ? void 0 : p.id]), fe = V(async () => {
    if (!j) return;
    const { id: o, status: z } = j;
    if (!((z === "fixed" || z === "rejected") && X.trim() === "")) {
      f(`status-${o}`);
      try {
        const U = X.trim() ? { comment: X.trim() } : void 0;
        if (await q(o, z, U), (p == null ? void 0 : p.id) === o && S((ae) => ae ? { ...ae, status: z } : null), te(null), y(""), (p == null ? void 0 : p.id) === o)
          try {
            const ae = await re.getNote(r, o);
            S(ae);
          } catch {
          }
      } finally {
        f(null);
      }
    }
  }, [j, X, q, p == null ? void 0 : p.id, r]), Se = V(async (o, z) => {
    f(`severity-${o}`);
    try {
      await K(o, z), (p == null ? void 0 : p.id) === o && S((U) => U ? { ...U, severity: z } : null);
    } finally {
      f(null);
    }
  }, [K, p == null ? void 0 : p.id]), Re = V(async (o) => {
    S(o);
    try {
      const z = await re.getNote(r, o.id);
      S(z);
    } catch {
    }
  }, [r]), $e = V(async (o) => {
    if (confirm("このノートを削除しますか？")) {
      f(`delete-${o}`);
      try {
        await Q(o), (p == null ? void 0 : p.id) === o && S(null);
      } finally {
        f(null);
      }
    }
  }, [Q, p == null ? void 0 : p.id]), Be = V(async (o, z) => {
    if (confirm("この画像を削除しますか？"))
      try {
        await re.deleteAttachment(r, o, z), S((U) => {
          var ae;
          return !U || U.id !== o ? U : {
            ...U,
            attachments: (ae = U.attachments) == null ? void 0 : ae.filter((ye) => ye.id !== z)
          };
        });
      } catch (U) {
        console.error("Failed to delete attachment:", U);
      }
  }, [r]), me = V(async () => {
    if (!(!p || I.trim() === "")) {
      R(!0);
      try {
        const o = await re.addActivity(r, p.id, { content: I.trim() });
        S((z) => z && {
          ...z,
          activities: [...z.activities || [], o]
        }), h("");
      } catch (o) {
        console.error("Failed to add comment:", o);
      } finally {
        R(!1);
      }
    }
  }, [p, I, r]), ze = (o) => {
    if (!o) return [];
    try {
      const z = JSON.parse(o);
      return Array.isArray(z) ? z : [];
    } catch {
      return o.split(`
`).filter((z) => z.trim());
    }
  };
  return /* @__PURE__ */ t("div", { style: Vt(a), children: [
    /* @__PURE__ */ e(
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet"
      }
    ),
    /* @__PURE__ */ t("header", { style: Gt(a), children: [
      /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "16px" }, children: [
        /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
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
          /* @__PURE__ */ t("div", { children: [
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
      /* @__PURE__ */ t("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
        /* @__PURE__ */ t("label", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: a.textSecondary,
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "8px",
          background: W ? a.successBg : "transparent",
          transition: "all 0.2s"
        }, children: [
          /* @__PURE__ */ e("div", { style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: W ? a.success : a.textMuted,
            animation: W ? "pulse 2s infinite" : "none"
          } }),
          "自動更新",
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: W,
              onChange: (o) => P(o.target.checked),
              style: { display: "none" }
            }
          )
        ] }),
        /* @__PURE__ */ t(
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
        /* @__PURE__ */ t(
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
            onClick: () => L(!B),
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
            title: B ? "ライトモード" : "ダークモード",
            children: /* @__PURE__ */ e(F, { name: B ? "light_mode" : "dark_mode", size: 20 })
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => {
              f("refresh"), Y(), A((o) => o + 1);
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
      ...c ? [{ key: "feedback", label: "フィードバック" }] : []
    ].map(({ key: o, label: z }) => /* @__PURE__ */ e(
      "button",
      {
        onClick: () => {
          $(o), o === "test-status" && T(null);
        },
        style: {
          padding: "12px 20px",
          border: "none",
          borderBottom: u === o ? `2px solid ${a.primary}` : "2px solid transparent",
          background: "transparent",
          color: u === o ? a.primary : a.textSecondary,
          fontWeight: u === o ? 600 : 400,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s"
        },
        children: z
      },
      o
    )) }),
    u === "test-status" ? /* @__PURE__ */ e(
      Wt,
      {
        env: r,
        colors: a,
        isDarkMode: B,
        onNavigateToNote: _,
        refreshKey: G
      }
    ) : u === "feedback" && c ? /* @__PURE__ */ e(
      At,
      {
        apiBaseUrl: n,
        adminKey: g,
        colors: a,
        isDarkMode: B,
        refreshKey: G
      }
    ) : /* @__PURE__ */ t("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [
      /* @__PURE__ */ t("aside", { style: {
        width: "380px",
        borderRight: `1px solid ${a.border}`,
        display: "flex",
        flexDirection: "column",
        background: a.bgSecondary
      }, children: [
        /* @__PURE__ */ t("div", { style: {
          padding: "16px",
          display: "flex",
          gap: "10px",
          borderBottom: `1px solid ${a.border}`
        }, children: [
          /* @__PURE__ */ t(
            "select",
            {
              "data-testid": "status-filter",
              value: x,
              onChange: (o) => m(o.target.value),
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
          /* @__PURE__ */ t(
            "select",
            {
              value: b,
              onChange: (o) => v(o.target.value),
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
          /* @__PURE__ */ t("div", { style: {
            flex: 1,
            position: "relative"
          }, children: [
            /* @__PURE__ */ e(
              "input",
              {
                type: "text",
                value: k,
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
            }, children: /* @__PURE__ */ e(F, { name: "search", size: 18 }) })
          ] })
        ] }),
        N != null && /* @__PURE__ */ e("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${a.border}`,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }, children: /* @__PURE__ */ t("span", { style: {
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
        /* @__PURE__ */ t("div", { style: {
          flex: 1,
          overflow: "auto",
          padding: "12px"
        }, children: [
          E && /* @__PURE__ */ t("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(F, { name: "hourglass_empty", size: 32 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "8px" }, children: "読み込み中..." })
          ] }),
          H && /* @__PURE__ */ e("div", { style: {
            padding: "16px",
            background: a.errorBg,
            color: a.error,
            borderRadius: "12px",
            margin: "8px",
            fontSize: "13px"
          }, children: H.message }),
          !E && ne.length === 0 && /* @__PURE__ */ t("div", { style: {
            padding: "40px",
            textAlign: "center",
            color: a.textMuted
          }, children: [
            /* @__PURE__ */ e(F, { name: "inbox", size: 40 }),
            /* @__PURE__ */ e("div", { style: { marginTop: "12px" }, children: "ノートがありません" })
          ] }),
          ne.map((o) => /* @__PURE__ */ t(
            "div",
            {
              style: {
                padding: "16px",
                background: a.bg,
                borderRadius: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                border: (p == null ? void 0 : p.id) === o.id ? `2px solid ${a.primary}` : "2px solid transparent",
                boxShadow: (p == null ? void 0 : p.id) === o.id ? `0 4px 12px ${a.primary}30` : `0 1px 3px ${a.border}`,
                transition: "all 0.2s"
              },
              onClick: () => Re(o),
              children: [
                /* @__PURE__ */ t("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px"
                }, children: [
                  /* @__PURE__ */ t("span", { style: {
                    fontSize: "11px",
                    color: a.textMuted,
                    fontFamily: "monospace"
                  }, children: [
                    "#",
                    o.id
                  ] }),
                  /* @__PURE__ */ t("span", { style: Je(o.severity, a), children: [
                    /* @__PURE__ */ e(F, { name: Ge(o.severity), size: 14 }),
                    /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: o.severity || "none" })
                  ] }),
                  /* @__PURE__ */ t("span", { style: Ie(o.status, a), children: [
                    /* @__PURE__ */ e(F, { name: Ve(o.status), size: 14 }),
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
                  (o.attachment_count ?? 0) > 0 && /* @__PURE__ */ t("span", { style: {
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
                }, children: Pe(o.content) }),
                /* @__PURE__ */ t("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: a.textMuted
                }, children: [
                  /* @__PURE__ */ t("span", { style: {
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
                  /* @__PURE__ */ e("span", { children: qe(o.created_at) })
                ] }),
                o.latest_comment && /* @__PURE__ */ t("div", { style: {
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
        /* @__PURE__ */ t("div", { style: {
          padding: "16px",
          borderTop: `1px solid ${a.border}`,
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          fontSize: "12px",
          color: a.textMuted
        }, children: [
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "description", size: 16 }),
            C.length,
            " 件"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "error", size: 16, color: a.error }),
            C.filter((o) => o.status === "open").length,
            " Open"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "build", size: 16, color: a.warning }),
            C.filter((o) => o.status === "fixed").length,
            " Fixed"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
            /* @__PURE__ */ e(F, { name: "check_circle", size: 16, color: a.success }),
            C.filter((o) => o.status === "resolved").length,
            " Resolved"
          ] }),
          /* @__PURE__ */ t("span", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
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
      }, children: p ? /* @__PURE__ */ t("div", { style: { maxWidth: "800px" }, children: [
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
              /* @__PURE__ */ t("span", { style: Je(p.severity, a), children: [
                /* @__PURE__ */ e(F, { name: Ge(p.severity), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: p.severity || "none" })
              ] }),
              /* @__PURE__ */ t("span", { style: Ie(p.status, a), children: [
                /* @__PURE__ */ e(F, { name: Ve(p.status), size: 14 }),
                /* @__PURE__ */ e("span", { style: { marginLeft: "4px" }, children: p.status })
              ] }),
              p.source === "test" && /* @__PURE__ */ e("span", { style: {
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
            }, children: Pe(p.content) })
          ] }),
          /* @__PURE__ */ t("div", { style: { display: "flex", gap: "10px", alignItems: "center" }, children: [
            /* @__PURE__ */ t(
              "select",
              {
                "data-testid": "severity-select",
                value: p.severity || "",
                onChange: (o) => {
                  const z = o.target.value;
                  Se(p.id, z || null);
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
            d === `severity-${p.id}` && /* @__PURE__ */ e(se, { size: 16, color: a.primary }),
            /* @__PURE__ */ t(
              "select",
              {
                "data-testid": "status-select",
                value: p.status,
                onChange: (o) => oe(p.id, o.target.value),
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
            d === `status-${p.id}` && /* @__PURE__ */ e(se, { size: 16, color: a.primary }),
            /* @__PURE__ */ t(
              "button",
              {
                onClick: () => $e(p.id),
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
                  d === `delete-${p.id}` ? /* @__PURE__ */ e(se, { size: 16, color: a.error }) : /* @__PURE__ */ e(F, { name: "delete", size: 16 }),
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
            ge,
            {
              icon: "link",
              label: "ページURL",
              value: p.route || "/",
              isLink: !0,
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            ge,
            {
              icon: "article",
              label: "ページタイトル",
              value: p.screen_name || "(不明)",
              colors: a
            }
          ),
          /* @__PURE__ */ e(
            ge,
            {
              icon: "schedule",
              label: "作成日時",
              value: qt(p.created_at),
              colors: a
            }
          )
        ] }),
        /* @__PURE__ */ e(de, { icon: "notes", title: "内容", colors: a, children: /* @__PURE__ */ e("div", { style: {
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: a.text
        }, children: p.content }) }),
        p.attachments && p.attachments.length > 0 && /* @__PURE__ */ e(de, { icon: "image", title: `添付画像 (${p.attachments.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px"
        }, children: p.attachments.map((o) => /* @__PURE__ */ t("div", { style: {
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
            /* @__PURE__ */ e("span", { style: { color: "#fff", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: o.original_name }),
            /* @__PURE__ */ e(
              "button",
              {
                onClick: (z) => {
                  z.stopPropagation(), Be(p.id, o.id);
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
        p.steps && /* @__PURE__ */ e(de, { icon: "format_list_numbered", title: "再現手順", colors: a, children: /* @__PURE__ */ e("ol", { style: {
          margin: 0,
          paddingLeft: "20px",
          color: a.text
        }, children: ze(p.steps).map((o, z) => /* @__PURE__ */ e("li", { style: {
          padding: "8px 0",
          borderBottom: `1px solid ${a.borderLight}`
        }, children: o }, z)) }) }),
        p.user_log && /* @__PURE__ */ e(de, { icon: "sticky_note_2", title: "補足メモ", colors: a, children: /* @__PURE__ */ e("pre", { style: {
          padding: "16px",
          background: B ? "#0D1117" : "#1E293B",
          color: "#E2E8F0",
          borderRadius: "12px",
          overflow: "auto",
          fontSize: "12px",
          fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
          lineHeight: 1.6,
          margin: 0
        }, children: p.user_log }) }),
        p.environment && /* @__PURE__ */ e(de, { icon: "devices", title: "環境情報", colors: a, children: /* @__PURE__ */ t("div", { style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ e(ge, { icon: "public", label: "URL", value: p.environment.url || "", isLink: !0, colors: a }),
          /* @__PURE__ */ e(ge, { icon: "aspect_ratio", label: "Viewport", value: p.environment.viewport || "", colors: a }),
          /* @__PURE__ */ e(ge, { icon: "computer", label: "User Agent", value: p.environment.userAgent || "", colors: a }),
          /* @__PURE__ */ e(ge, { icon: "schedule", label: "記録日時", value: p.environment.timestamp || "", colors: a })
        ] }) }),
        p.console_log && p.console_log.length > 0 && /* @__PURE__ */ e(de, { icon: "terminal", title: `コンソールログ (${p.console_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: B ? "#0D1117" : "#1E293B"
        }, children: p.console_log.map((o, z) => /* @__PURE__ */ t("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${B ? "#21262D" : "#2D3748"}`,
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
        /* @__PURE__ */ t(de, { icon: "history", title: `アクティビティ (${(p.activities || []).length}件)`, colors: a, children: [
          (p.activities || []).length > 0 ? /* @__PURE__ */ e("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: p.activities.map((o) => /* @__PURE__ */ t("div", { style: {
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
            /* @__PURE__ */ t("div", { style: { flex: 1, minWidth: 0 }, children: [
              o.action === "status_change" ? /* @__PURE__ */ t("div", { style: { fontSize: "13px", color: a.text, marginBottom: o.content ? "4px" : 0 }, children: [
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
              /* @__PURE__ */ t("div", { style: {
                fontSize: "11px",
                color: a.textMuted,
                marginTop: "4px",
                display: "flex",
                gap: "8px"
              }, children: [
                o.author && /* @__PURE__ */ e("span", { children: o.author }),
                /* @__PURE__ */ e("span", { children: qe(o.created_at) })
              ] })
            ] })
          ] }, o.id)) }) : /* @__PURE__ */ e("div", { style: { fontSize: "13px", color: a.textMuted }, children: "アクティビティはありません" }),
          /* @__PURE__ */ t("div", { style: {
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            alignItems: "flex-end"
          }, children: [
            /* @__PURE__ */ e(
              "textarea",
              {
                value: I,
                onChange: (o) => h(o.target.value),
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
            /* @__PURE__ */ t(
              "button",
              {
                onClick: me,
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
        p.network_log && p.network_log.length > 0 && /* @__PURE__ */ e(de, { icon: "wifi", title: `ネットワークログ (${p.network_log.length}件)`, colors: a, children: /* @__PURE__ */ e("div", { style: {
          borderRadius: "12px",
          overflow: "hidden",
          background: B ? "#0D1117" : "#1E293B"
        }, children: p.network_log.map((o, z) => /* @__PURE__ */ t("div", { style: {
          padding: "8px 16px",
          borderBottom: `1px solid ${B ? "#21262D" : "#2D3748"}`,
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
      ] }) : /* @__PURE__ */ t("div", { style: {
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
        children: /* @__PURE__ */ t(
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
              /* @__PURE__ */ t("h3", { style: {
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
                  onChange: (o) => y(o.target.value),
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
              /* @__PURE__ */ t("div", { style: {
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
                /* @__PURE__ */ t(
                  "button",
                  {
                    onClick: fe,
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
    Z && /* @__PURE__ */ t(
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
function ge({ icon: i, label: r, value: n, isLink: g, colors: x }) {
  return /* @__PURE__ */ t("div", { style: {
    padding: "16px",
    background: x.bgSecondary,
    borderRadius: "12px"
  }, children: [
    /* @__PURE__ */ t("div", { style: {
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
      color: g ? x.link : x.text,
      fontFamily: g ? '"Fira Code", monospace' : "inherit",
      wordBreak: "break-all"
    }, children: n })
  ] });
}
function de({ icon: i, title: r, children: n, colors: g }) {
  return /* @__PURE__ */ t("div", { style: { marginBottom: "28px" }, children: [
    /* @__PURE__ */ t("h3", { style: {
      fontSize: "14px",
      fontWeight: 600,
      color: g.textSecondary,
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ e(F, { name: i, size: 18 }),
      r
    ] }),
    n
  ] });
}
function Pe(i, r = 60) {
  const n = i.split(`
`)[0];
  return n.length > r ? n.slice(0, r) + "..." : n;
}
function qe(i) {
  const r = new Date(i), n = r.getMonth() + 1, g = r.getDate(), x = r.getHours().toString().padStart(2, "0"), m = r.getMinutes().toString().padStart(2, "0");
  return `${n}/${g} ${x}:${m}`;
}
function qt(i) {
  return new Date(i).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ve(i) {
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
function Ge(i) {
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
function Je(i, r) {
  const n = i ? r[i] : r.textMuted;
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: `${n}15`,
    color: n,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function Ie(i, r) {
  let n, g;
  switch (i) {
    case "open":
      n = r.primaryLight, g = r.primary;
      break;
    case "fixed":
      n = r.warningBg, g = r.warning;
      break;
    case "resolved":
      n = r.successBg, g = r.success;
      break;
    case "rejected":
      n = r.errorBg, g = r.error;
      break;
  }
  return {
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: n,
    color: g,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    display: "inline-flex",
    alignItems: "center"
  };
}
function Vt(i) {
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
function Gt(i) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${i.border}`,
    background: i.bg
  };
}
function an({
  apiBaseUrl: i,
  env: r = "dev",
  testCases: n,
  manualItems: g,
  manualDefaultPath: x,
  onManualNavigate: m,
  onManualAppNavigate: b,
  environmentsMd: v,
  onSave: k,
  initialSize: D,
  logCaptureConfig: p,
  disableLogCapture: S,
  adminRoutePath: B = "/__admin"
}) {
  const { isDebugMode: L } = et();
  ie(() => {
    i && Ne(i);
  }, [i]);
  const W = he(() => S || !i ? null : dt(
    p ?? { console: !0, network: ["/api/**"] }
  ), [i, S]), [P, d] = w(() => typeof window > "u" ? !1 : window.location.pathname === B);
  return ie(() => {
    if (typeof window > "u") return;
    const u = () => d(window.location.pathname === B);
    u(), window.addEventListener("popstate", u), window.addEventListener("hashchange", u);
    const $ = window.history.pushState, c = window.history.replaceState;
    return window.history.pushState = function(...N) {
      const T = $.apply(this, N);
      return u(), T;
    }, window.history.replaceState = function(...N) {
      const T = c.apply(this, N);
      return u(), T;
    }, () => {
      window.removeEventListener("popstate", u), window.removeEventListener("hashchange", u), window.history.pushState = $, window.history.replaceState = c;
    };
  }, [B]), !i || !(L || P) ? null : /* @__PURE__ */ e(
    zt,
    {
      apiBaseUrl: i,
      env: r,
      testCases: n,
      logCapture: W ?? void 0,
      manualItems: g,
      manualDefaultPath: x,
      onManualNavigate: m,
      onManualAppNavigate: b,
      environmentsMd: v,
      onSave: k,
      initialSize: D
    }
  );
}
export {
  rn as D,
  zt as a,
  an as b,
  xt as p
};
