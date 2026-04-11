# {{roleLabel}} — {{roundName}} 検証レポート

**検証日**: {{verifiedAt}}
**検証者**: {{verifier}}
**対象プロジェクト**: {{targetProject}}
**対象ケース数**: {{totalCount}}

## サマリ

| バケット | 件数 | 割合 |
|---|---|---|
| ✅ OK | {{okCount}} | {{okPercent}}% |
| 🔧 TC_WRONG | {{tcWrongCount}} | {{tcWrongPercent}}% |
| 🐛 IMPL_BUG | {{implBugCount}} | {{implBugPercent}}% |
| ❓ OTHER | {{otherCount}} | {{otherPercent}}% |
| ⏸ SKIP | {{skipCount}} | {{skipPercent}}% |

## capability 別内訳

{{capabilityTable}}

## 全ケース

{{caseRows}}

## バグ・TC_WRONG 詳細

### 🐛 IMPL_BUG

{{implBugDetails}}

### 🔧 TC_WRONG

{{tcWrongDetails}}

### ❓ OTHER（要追加調査）

{{otherDetails}}
