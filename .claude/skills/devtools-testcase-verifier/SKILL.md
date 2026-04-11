---
name: devtools-testcase-verifier
description: |
  @twuw-b/dev-tools 統合プロジェクトで、docs/test-cases/*.md のテストケースを
  Chrome MCP + Claude で実際にブラウザ操作して検証し、5 バケット
  (OK / TC_WRONG / IMPL_BUG / OTHER / SKIP) に振り分けて reports を生成するスキル。
  evidence 必須 (screenshot + network dump)、MCP 固有の症状を IMPL_BUG と
  断定しない、修正は行わず振り分けのみ、の行動ルールを強制。
  testcase-author (MD 作成側) と対になる検証専用 skill。
  Use when:
  (1) テストケース検証ラウンドを開始したい
  (2) 「検証して」「テスト実行」「バケット分けして」「Chrome で検証」と言われた時
  (3) IMPL_BUG を dev-tools にバグ報告として投入したい (opt-in)
  (4) 既存ラウンドの結果からレポートを生成したい
---

# devtools-testcase-verifier

## 前提条件

本 skill を起動する前に確認:

1. **Chrome MCP が利用可能**（chrome-devtools / chrome-workspace / playwright-mcp いずれか）
   - skill は MCP コマンド名を抽象化して扱う。`click` / `wait_for` 等のセマンティクス
   - 利用可能な MCP に合わせて実際のコマンド名を読み替える
2. `@twuw-b/dev-tools` を統合済みのプロジェクト
   - `docs/test-cases/*.md` に case_key 付きの TC が存在
   - `/__debug/api/test-cases` が疎通する
3. フロントエンド（検証対象アプリ）にアクセス可能

## 関連 skill

- **`devtools-testcase-author`** — MD 作成側。本 skill は作成済み MD を検証する
- 相互関係: author で作成 → verifier で実行 → IMPL_BUG を author の対象にフィードバック

## フォルダ構成

本 skill は利用側プロジェクトに作業ディレクトリを生成します:

```
<consumer-project>/docs/test-verifications/    # デフォルト (--dir で上書き可)
├── round-1/
│   ├── CLAUDE.md                   # 行動ルール (ラウンド固有の禁止事項含む)
│   ├── 00_plan.md                  # ラウンド計画書
│   ├── 01_checklist.md             # 検証項目リスト (進捗サマリ付き)
│   ├── .verifier-config.json       # API / env / frontend URL 等の既定値
│   ├── evidence/                   # screenshot + network dump
│   ├── log/                        # Phase / Step 中間報告
│   └── reports/                    # 最終振り分けレポート
└── round-2/
    └── ...
```

## ワークフロー

### Phase フロー（固定）

```
Phase 1: 前提の整理 (目的・対象・環境)
Phase 2: 調査範囲の確定 (scope / phase-step 構成)
Phase 3: アンチパターン確認 (references/anti-patterns.md)
Phase 4: ブロッカー分析 (前回 OTHER の解消策)
Phase 5: テストデータ準備計画 (人間操作必要項目の識別)
Phase 6: 環境確認・セットアップ (疎通確認 / 初期データ投入)
Phase 7〜N: 検証実施 (ロール・capability 単位)
Phase N+1: 最終振り分けレポート生成
Phase N+2: 総括 (次回ラウンドへの推奨事項)
```

### Step 1: ラウンド初期化

**Claude Code 起動後の対話で完結できます。** ユーザーが「検証ラウンドを作って」「round-1 を始めたい」等と言ったら、以下の手順で実行してください:

#### 1-A. 自動推測 (推奨)

skill 側の init スクリプトは以下を自動で推測します:

| 項目 | 推測元 |
|---|---|
| `--name` | `docs/test-verifications/round-*` の最大値 + 1 |
| `--project` | `package.json` の `name`（npm scope は除去） |
| `--roles` | `docs/test-cases/*.md` の frontmatter `role_code` |

Claude は以下の順序で対応:

1. **確定情報**: `package.json` / `docs/test-cases/` から project と roles を自動取得
2. **AskUserQuestion** で以下を確認:
   - API base URL (デフォルト `http://localhost:8082/api/__debug`)
   - 環境 (`dev` / `staging` / `prod`)
   - Frontend URL
3. Bash で init スクリプトを実行:

```bash
node .claude/skills/devtools-testcase-verifier/scripts/init-verification-round.mjs \
  --api=${API_URL} \
  --env=${ENV} \
  --frontend=${FRONTEND_URL}
  # name / project / roles は省略 → 自動推測
```

#### 1-B. 対話スクリプト経由 (ターミナル単独起動時)

Claude Code 経由でない場合や、ユーザーが値を順に確認したい場合は `--interactive` フラグ:

```bash
node .claude/skills/devtools-testcase-verifier/scripts/init-verification-round.mjs --interactive
```

自動推測値が `[ ]` 内にデフォルトとして表示され、Enter で受け入れ。

#### 1-C. 明示引数 (CI / 非対話)

```bash
node .claude/skills/devtools-testcase-verifier/scripts/init-verification-round.mjs \
  --name=round-1 --api=... --env=dev --frontend=... --project="My Project" --roles=CA,GN,RO,GU
```

### 生成物

- `docs/test-verifications/round-1/` ディレクトリ + テンプレ展開
- `01_checklist.md` が `fetch-test-cases.mjs` で自動生成される
- `.verifier-config.json` に既定値保存
- `.claude/settings.json` (allow/ask/deny) + `.claude/hooks/*` (SessionStart + PreToolUse)

### Step 2: 00_plan.md / CLAUDE.md の編集

Claude が対話で以下を埋める:

- 対象プロジェクトの目的
- 対象 role_code / capability のスコープ確定
- テストアカウントの詳細
- ラウンド固有の禁止事項（本番環境除外、特定データ保護等）
- 既知のブロッカー（前回 OTHER 相当）

### Step 3: 環境確認（Phase 6）

- Frontend アクセス確認（screenshot 撮影）
- dev-tools `/__debug/api/notes` の疎通確認
- テストアカウントのログイン可能性確認
- 既存データの状態把握

### Step 4: 検証実施（Phase 7 以降）

各ケースを 1 つずつ処理。**TaskCreate / TaskUpdate を必ず併用する**:

```
┌─────────────────────────────────────┐
│ 1. TaskCreate (case_key + title)     │  ← 必須。context 圧縮後も進捗復元可能
│ 2. 手順実行 (Chrome MCP)              │
│    - G1〜G10 ガイドライン遵守         │
│    - handle_dialog, wait_for 等       │
│    - evaluate_script 内 fetch は hook │
│      で物理ブロック                   │
│ 3. screenshot + network dump 保存     │
│    - evidence/<caseId>_<slug>.png    │
│ 4. バケット判定                       │
│    - bucket-definitions.md の基準     │
│ 5. update-checklist.mjs で反映        │
│ 6. TaskUpdate (completed)            │  ← 必須
└─────────────────────────────────────┘
```

**TaskCreate / TaskUpdate 併用の理由**:
- context 圧縮後も TaskList から進捗を復元できる
- 1 ケースごとに `in_progress → completed` と遷移することで二重実行を防ぐ
- 前セッション `b5380ac5` で「前のステップでやったはず」の記憶劣化が発生した原因の対策

#### 1 ケース反映コマンド

```bash
node scripts/update-checklist.mjs \
  --round-dir docs/test-verifications/round-1 \
  --case TC-CA-032 \
  --bucket OK \
  --note '招待送信成功' \
  --evidence TC-CA-032_invite.png
```

bucket キー: `OK` / `TC_WRONG` / `IMPL_BUG` / `OTHER` / `SKIP`

#### Phase / Step 完了時

中間報告を `log/` に追加（手動）:

```bash
# log/phase7_step7-1_interim.md を Write ツールで作成
```

### Step 5: 最終レポート生成

全ケース反映後:

```bash
node scripts/generate-reports.mjs --round-dir docs/test-verifications/round-1
```

生成物:
- `reports/01-<role>.md` 〜 `NN-<role>.md` (ロール別)
- `reports/99_final-summary.md` (全体サマリ)

### Step 6: dev-tools への投入 (opt-in)

```bash
node scripts/sync-to-devtools.mjs \
  --round-dir docs/test-verifications/round-1 \
  --bucket IMPL_BUG \
  [--dry-run]
```

- デフォルトは `IMPL_BUG` のみ投入
- `--bucket OTHER` で未解決ケースも投入可能
- 重複ノート（同 case_key + 同 content）はスキップ
- `.verifier-config.json` の `syncNotes: true` で自動投入も可能

## バケット定義

`references/bucket-definitions.md` を参照。要点:

| バケット | 条件 | 対応 |
|---|---|---|
| ✅ OK | 手順通り実行でき期待結果と一致 | 記録のみ |
| 🔧 TC_WRONG | 実装は意図通りだが TC 側が食い違い | 記録のみ |
| 🐛 IMPL_BUG | TC 期待が正しい、実装が満たしていない | 記録のみ（修正別会） |
| ❓ OTHER | 判定保留（環境要因・MCP 制約等） | 理由 + 次アクション |
| ⏸ SKIP | 破壊的操作・承認未取得 | スキップ理由 |

## Chrome MCP ガイドライン

`references/chrome-mcp-guidelines.md` を参照。要点:

- **G1**: ページ遷移は UI 操作のみ（URL 直打ち禁止、初回 + ログインのみ例外）
- **G2**: ブラウザダイアログは `handle_dialog` を事前仕込み
- **G3**: `wait_for` 必須、タイミング依存を避ける
- **G4**: 特殊 UI（日付ピッカー等）は 3 回試行で OTHER
- **G5**: screenshot 命名 `<caseId>_<slug>.png`
- **G6**: API レスポンスは `evaluate_script` + `evidence/*.json`
- **G7**: 認証切れは `/login` リダイレクトで検知 → 再ログイン許可
- **G8**: 複数アカウントはタブ分離 (`new_page` / `select_page`)
- **G9**: `list_console_messages` で JS エラー監視
- **G10**: 同一操作 4 回以上禁止、3 回失敗で OTHER

## 禁止事項

`references/anti-patterns.md` を参照。特に重要:

1. **検証中に MD / コードを修正しない**（修正は別会）
2. **既存アカウント・既存データに触らない**
3. **本番環境は触らない**
4. **バグの workaround 禁止**
5. **evidence なしの判定は原則不可**
6. **MCP 固有の症状を IMPL_BUG と断定しない**

## 物理的に止まる禁止事項 (PreToolUse hook)

`init-verification-round.mjs` が生成する `<round-dir>/.claude/settings.json` に
PreToolUse hook が設定されており、以下のパターンは **claude の意図に関わらず物理的にブロック** されます:

### G6 違反: evaluate_script 内での API 直叩き

`mcp__chrome__evaluate_script` で以下を含むスクリプトは `check-evaluate-script.sh` がブロック:

- `fetch(...)` — API 直叩き
- `new XMLHttpRequest()` / `XMLHttpRequest(...)`
- `axios.get` / `axios.post` / `axios(...)`
- `navigator.sendBeacon(...)`
- `$.ajax(...)` / `$.get(...)` / `$.post(...)`

**許可される evaluate_script の用途**:
- DOM 読取（`document.querySelector(...).textContent` 等）
- スタイル取得（`getComputedStyle(el)`）
- `window.location` / `window.history` の read-only
- クッキー確認（auth state の読取のみ）

**代替手段**:
1. UI 操作で同じ結果を得る（click / fill / wait_for）
2. ネットワーク監視: `mcp__chrome__list_network_requests` / `get_network_request`
3. どうしても API レスポンスが必要な場合は人間操作に委ね OTHER 記録

この hook により、**G6 違反は発生前にツール層で止まります**。ユーザーから「API を直接呼ぶのは禁止のはず」と怒られる前に claude 側で却下される構造です。

## 成功条件

- 全ケースが 5 バケットのいずれかに分類されている
- 全判定に evidence が紐付いている
- `reports/99_final-summary.md` が生成されている
- OTHER が多い場合は理由分類（`[DATA-MISSING]` / `[MCP-LIMIT]` / `[UNCLEAR]` 等）が記載されている

## バンドルリソース

- `references/bucket-definitions.md` — 5 バケット定義と判定ルール
- `references/chrome-mcp-guidelines.md` — G1〜G10 操作ガイドライン
- `references/anti-patterns.md` — 禁止事項
- `assets/templates/` — CLAUDE.md / 00_plan.md / 01_checklist.md / report-role.md / report-summary.md
- `scripts/init-verification-round.mjs` — ラウンド初期化
- `scripts/fetch-test-cases.mjs` — dev-tools API から TC 取得
- `scripts/update-checklist.mjs` — 1 ケース判定反映
- `scripts/generate-reports.mjs` — reports/ 生成
- `scripts/sync-to-devtools.mjs` — IMPL_BUG の自動ノート投入 (opt-in)

## 関連ドキュメント

- 本 skill の計画: `docs/draft/testcase-verifier-skill.md`
- 作成側 skill: `.claude/skills/devtools-testcase-author/`
