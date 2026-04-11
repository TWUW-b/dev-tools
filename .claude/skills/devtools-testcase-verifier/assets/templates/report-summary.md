# {{roundName}} 最終振り分けレポート

**実施日**: {{verifiedAt}}
**対象環境**: {{envName}} ({{frontendUrl}})
**対象プロジェクト**: {{targetProject}}
**検証焦点**: {{scope}}

---

## 1. 全体結果

| バケット | 件数 | 割合 | 説明 |
|---|---|---|---|
| ✅ OK | {{okCount}} | {{okPercent}}% | 期待通り動作 |
| 🔧 TC_WRONG | {{tcWrongCount}} | {{tcWrongPercent}}% | TC 定義と実装の乖離 |
| 🐛 IMPL_BUG | {{implBugCount}} | {{implBugPercent}}% | 実装不具合 |
| ❓ OTHER | {{otherCount}} | {{otherPercent}}% | 検証保留 |
| ⏸ SKIP | {{skipCount}} | {{skipPercent}}% | 意図的スキップ |
| **合計** | **{{totalCount}}** | **100%** | |

### role_code 別内訳

{{roleBreakdown}}

---

## 2. 🐛 IMPL_BUG 一覧

{{implBugList}}

---

## 3. 🔧 TC_WRONG 一覧

{{tcWrongList}}

---

## 4. ❓ OTHER の分類

次回ラウンドへの引き継ぎ情報として、保留理由を分類:

{{otherClassification}}

---

## 5. 次回ラウンドへの推奨事項

{{recommendations}}

---

## 6. 個別レポート

{{roleReportLinks}}
