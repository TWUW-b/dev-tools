# {{projectName}} テストケース検証計画書 — {{roundName}}

**作成日**: {{createdAt}}
**対象プロジェクト**: {{targetProject}}

## フロー

```
Phase 1: 前提の整理
Phase 2: 調査範囲の確定
Phase 3: アンチパターン定義 → CLAUDE.md / anti-patterns.md 参照
Phase 4: ブロッカー分析
Phase 5: テストデータ準備計画
Phase 6: 環境確認・セットアップ
Phase 7〜N: 検証実施（ロール・capability 単位で分割）
Phase N+1: 最終振り分けレポート
Phase N+2: 総括
```

---

## Phase 1: 前提の整理

### 1.1 目的

{{purpose}}

本検証は **振り分けのみ**。修正は行わない（アンチパターン参照）。

### 1.2 対象

テストケース定義: `{{testCasesDir}}`

| 対象 role_code | domain | ケース数 |
|---|---|---|
{{rolesTable}}

### 1.3 検証環境

| 項目 | URL |
|---|---|
| Frontend | `{{frontendUrl}}` |
| API | `{{apiBaseUrl}}` |
| dev-tools 管理 UI | `{{devtoolsAdminUrl}}` |
| **本番環境** | **検証対象外** |

### 1.4 テストアカウント

{{accountsTable}}

### 1.5 前回結果の引き継ぎ（該当する場合）

{{previousRoundNotes}}

---

## Phase 2: 調査範囲の確定

### 2.1 スコープ

{{scope}}

### 2.2 Phase-Step 構成

{{phaseStepTable}}

### 2.3 除外事項

{{exclusions}}

---

## Phase 3: アンチパターン定義

→ `{{skillPath}}/references/anti-patterns.md` を参照

プロジェクト固有の追加禁止事項:

{{customAntiPatterns}}

---

## Phase 4: ブロッカー分析

### 4.1 前回 OTHER の原因分類と今回の解消策

{{blockerAnalysis}}

### 4.2 今回も検証不能と予想されるケース

{{knownBlockers}}

---

## Phase 5: テストデータ準備計画

### 5.1 必要リソース一覧

{{dataRequirements}}

### 5.2 人間操作が必要な項目

{{humanRequiredItems}}

---

## Phase 6: 環境確認・セットアップ

### 6.1 環境状態チェック

- [ ] Frontend アクセス確認
- [ ] API 疎通確認
- [ ] dev-tools `/__debug/api/notes` 疎通確認
- [ ] テストアカウントでログイン可能
- [ ] 既存データ確認

### 6.2 初期データ投入

Phase 5 の計画に従い実施。evidence を `evidence/` に保存。

---

## 検証実施（Phase 7 以降）

Phase-Step 構成に従い、capability 単位で検証を実施する。

### 1 ケースの検証サイクル

```
1. 手順実行（Chrome MCP / fetch）
2. screenshot + network dump を evidence/ に保存
3. 判定（✅/🔧/🐛/❓/⏸）
4. update-checklist.mjs で 01_checklist.md を更新
5. Step 完了時に log/ に中間報告を追加
```
