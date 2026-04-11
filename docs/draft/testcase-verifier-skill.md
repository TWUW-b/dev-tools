---
title: devtools-testcase-verifier skill を新設する
status: draft
related:
  - .claude/skills/devtools-testcase-author/ (作成側、本 skill と対になる)
  - /Users/gen/shared/kumonos/trinos/5_tmp/testcase-verification-r2/ (参照元の実運用例)
---

# 背景

`testcase-author` skill で作成したテストケース MD を、Chrome MCP + Claude で実際にブラウザ操作して検証するフローを確立する。

実運用例 (`testcase-verification-r2`) では以下の成果物が得られた:

- 94 ケースを 5 バケット (OK / TC_WRONG / IMPL_BUG / OTHER / SKIP) に振り分け
- 各判定に evidence (screenshot + network dump) を必須化
- Phase-Step 構成で進捗管理
- ロール別レポート + 全体サマリを自動生成

この運用を **testcase-author と対になる skill** として抽象化し、利用側プロジェクトが `cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-verifier .claude/skills/` で導入できるようにする。

# 設計方針（確定事項）

| 項目 | 決定 |
|---|---|
| 実装形態 | 新規 skill `devtools-testcase-verifier`（testcase-author と並列） |
| Chrome MCP | 抽象化して扱う（chrome-devtools / chrome-workspace / playwright-mcp 等どれでも動く記述） |
| 作業ディレクトリ | デフォルト `docs/test-verifications/round-N/`、ユーザーが `--dir` で上書き可能 |
| ノート連携 | opt-in（`--sync-notes` フラグ）。ただし `scripts/sync-to-devtools.mjs` 自体は同梱し、デフォルト値を `.devtools-verifier.config` 等で設定できる |

# ファイル構成

```
.claude/skills/devtools-testcase-verifier/
├── SKILL.md
├── references/
│   ├── chrome-mcp-guidelines.md     # G1〜G10（元 CLAUDE.md の MCP 操作ルール）
│   ├── bucket-definitions.md        # 5 バケット + 判定ルール
│   └── anti-patterns.md             # 禁止事項・ブロッカー判定
├── assets/
│   └── templates/
│       ├── CLAUDE.md                # 作業ディレクトリ配下用の行動ルール（ラウンド固有の追記可能）
│       ├── 00_plan.md               # ラウンド計画書テンプレ
│       ├── 01_checklist.md          # 検証項目リストテンプレ
│       ├── report-role.md           # ロール別レポートテンプレ
│       └── report-summary.md        # 最終サマリテンプレ
└── scripts/
    ├── init-verification-round.mjs  # round ディレクトリ初期化（対話 or 引数）
    ├── fetch-test-cases.mjs         # dev-tools API から TC を取得 → 01_checklist.md 生成
    ├── update-checklist.mjs         # バケット判定を 1 行追記 + 進捗サマリ再計算
    ├── generate-reports.mjs         # 01_checklist.md → reports/*.md 生成
    └── sync-to-devtools.mjs         # 🐛 IMPL_BUG を POST /notes に投入（opt-in）
```

# 各ファイルの要点

## SKILL.md

- **前提チェック**: Chrome MCP の存在確認（chrome-devtools / chrome-workspace / playwright のいずれかが使えれば OK）
- **起動タイミング**: 「検証して」「テスト実行」「バケット分けして」「Chrome で検証」等
- **Phase フロー**: 固定 13 phase（前提整理 → スコープ確定 → アンチパターン → ブロッカー分析 → データ準備 → 環境確認 → 検証実施（複数 phase）→ 最終振り分け → 総括）
- **バケット定義**: references/bucket-definitions.md を参照
- **Chrome MCP ガイドライン**: references/chrome-mcp-guidelines.md を参照（G1〜G10）
- **作業ディレクトリ**: デフォルト `docs/test-verifications/round-N/`、上書き可
- **関連 skill**: testcase-author（MD 作成側）との相互リンク

## references/chrome-mcp-guidelines.md

元 CLAUDE.md から G1-G10 を抜粋 + 汎用化:

| # | タイトル | 要点 |
|---|---|---|
| G1 | ページ遷移は UI 操作のみ | URL 直打ち禁止（初回 + ログインのみ例外） |
| G2 | ブラウザダイアログの対応 | `handle_dialog` を前に仕込む |
| G3 | 待機戦略 | `wait_for` 必須、タイミング依存を避ける |
| G4 | 特殊 UI（日付ピッカー等） | 3 回試行で不可なら OTHER |
| G5 | screenshot ルール | 結果記録必須、命名 `<caseId>_<slug>.png` |
| G6 | API レスポンス取得 | `evaluate_script` で fetch、evidence/ に JSON 保存 |
| G7 | 認証切れリカバリ | `/login` リダイレクト検知 → 再ログイン許可 |
| G8 | 複数タブ管理 | `new_page` / `select_page` / `close_page` |
| G9 | コンソールエラー監視 | `list_console_messages` を各 Step 開始時に実行 |
| G10 | リトライルール | 同一操作 4 回以上禁止、3 回失敗で OTHER |

汎用化: MCP コマンド名は例示のみ（`click`, `wait_for` 等）。ツール固有の関数名は **括弧書きで併記** する形に。

## references/bucket-definitions.md

| バケット | 条件 | 対応 |
|---|---|---|
| ✅ OK | 手順通り実行でき期待結果と一致 | 記録のみ |
| 🔧 TC_WRONG | 実装は意図通りだが TC 側の記述・期待・手順が食い違い | 記録のみ |
| 🐛 IMPL_BUG | TC の期待が正しい仕様で、実装が満たしていない | 記録のみ（修正は別会） |
| ❓ OTHER | 判定保留（環境要因 / データ不足 / MCP 制約） | 理由 + 次アクション記録 |
| ⏸ SKIP | 破壊的操作 / 承認未取得 / 明示スキップ | スキップ理由記載 |

**判定ルール**:
- MCP 自動操作固有の症状を IMPL_BUG と断定しない（人間操作で再現確認前は確定扱いしない）
- evidence なしの判定は原則不可（最低 1 screenshot）

## references/anti-patterns.md

- 本検証では MD / コードの修正を行わない（振り分けと記録のみ）
- 既存アカウント・既存データに触らない（検証用リソースのみ使用）
- 本番環境は触らない
- バグの workaround は禁止
- 修正案・差分作成は別会で実施

## assets/templates/

### CLAUDE.md（作業ディレクトリ配下用）

ラウンド固有の情報を差し込める形。skill 側の references を参照する指示を含む。

### 00_plan.md

プレースホルダー:
- `{{roundName}}`
- `{{targetProject}}`
- `{{envName}}`
- `{{frontendUrl}}`
- `{{apiBaseUrl}}`
- `{{accounts}}`
- `{{phaseTable}}`

### 01_checklist.md

- 進捗サマリ表（Phase 別 × バケット別）
- Phase セクション（Phase ごとに Step）
- TC 行フォーマット: `| TC ID | title | bucket |`

### report-role.md / report-summary.md

実運用例の reports/ のフォーマットをそのまま移植。

## scripts/

### init-verification-round.mjs

```bash
node scripts/init-verification-round.mjs \
  --name round-2 \
  --dir docs/test-verifications \
  --api http://localhost:8082/api/__debug \
  --env dev \
  --frontend https://example.com \
  --interactive
```

対話モードでは以下を順番に質問:
1. ラウンド名（`round-N`）
2. 作業ディレクトリ（デフォルト `docs/test-verifications`、override 可）
3. API base URL
4. env
5. Frontend URL
6. 対象 role_code（CA / GN / RO / GU / AC 等、MD から自動抽出 → multi-select）
7. テストアカウント数と情報
8. 前ラウンドからの継承（`reports/` を参照）

出力:
- `<dir>/<roundName>/CLAUDE.md` ← テンプレから展開 + ラウンド情報埋め込み
- `<dir>/<roundName>/00_plan.md`
- `<dir>/<roundName>/01_checklist.md`（fetch-test-cases を内部で呼ぶ）
- `<dir>/<roundName>/{evidence,log,reports}/`

### fetch-test-cases.mjs

```bash
node scripts/fetch-test-cases.mjs \
  --api http://localhost:8082/api/__debug \
  --env dev \
  --roles CA,GN,RO,GU \
  --out docs/test-verifications/round-2/01_checklist.md
```

- `GET /test-cases?env=dev` で全 TC を取得
- `roles` でフィルタ（role_code 接頭辞一致）
- 01_checklist.md に bucket 未実施状態で出力
- 既存 01_checklist.md があればマージ（bucket 判定を保持）

### update-checklist.mjs

```bash
node scripts/update-checklist.mjs \
  --round-dir docs/test-verifications/round-2 \
  --case TC-CA-032 \
  --bucket OK \
  --note '招待送信成功' \
  --evidence TC-CA-032_invite.png
```

- 01_checklist.md の該当行を上書き
- 進捗サマリ表を再計算
- 同一 TC を複数回更新した場合は最後の値を採用

### generate-reports.mjs

```bash
node scripts/generate-reports.mjs \
  --round-dir docs/test-verifications/round-2
```

- 01_checklist.md を parse
- ロール別 `reports/NN-<role>.md` を生成
- `reports/99_final-summary.md` を生成（全体サマリ + 各バケット抜粋）

### sync-to-devtools.mjs（opt-in）

```bash
node scripts/sync-to-devtools.mjs \
  --round-dir docs/test-verifications/round-2 \
  --api http://localhost:8082/api/__debug \
  --env dev \
  --bucket IMPL_BUG
```

- 01_checklist.md から指定バケット行を抽出
- `POST /notes` で `source:'test', testCaseIds:[tcId]` 付きで投入
- 既に同 TC 紐付けで content が一致するノートがあれば skip
- デフォルト設定は `<round-dir>/.verifier-config.json` に保存可能

## デフォルト設定ファイル

`<round-dir>/.verifier-config.json`:

```json
{
  "apiBaseUrl": "http://localhost:8082/api/__debug",
  "env": "dev",
  "frontendUrl": "https://example.com",
  "syncNotes": false,
  "defaultBucketOnSkip": "⏸ SKIP"
}
```

全スクリプトがこのファイルを読み込んで引数未指定時の既定値とする。

# 影響範囲

| ファイル | 変更 |
|---|---|
| `.claude/skills/devtools-testcase-verifier/` 一式 | **新規** |
| `package.json` の `files` | `.claude/skills/devtools-testcase-verifier/**` を追加 |
| `docs/integration-guide.md` | skill 導入手順を追記 |
| `.claude/skills/devtools-testcase-author/SKILL.md` | 「検証は testcase-verifier へ」の相互リンク追加 |

# リリース方針

- **同梱 MD + scripts のみの追加 → patch bump**（v1.2.6 → v1.2.7）
- `/release` の判定ロジックによりケース C 扱い

# 実装順序

1. references/ 3 ファイル
2. assets/templates/ 5 ファイル
3. scripts/ 5 ファイル
4. SKILL.md
5. package.json の files フィールド更新
6. integration-guide.md 追記
7. testcase-author SKILL.md に相互リンク追加
8. `npm run test` で既存テスト回帰確認
9. dry-run 自己検証（空ディレクトリで init → checklist が生成されるか）
10. `/release patch` で v1.2.7 publish

# オープン課題

1. **Chrome MCP 種別の検知**: skill 起動時に MCP の有無をどう判定するか
   - 案 A: 前提条件として記載のみ、実際の検知は Claude 側の判断
   - 案 B: scripts に `check-mcp.mjs` を追加 → 利用不可なら warn
   - **案 A 推奨**（skill は指針提供、実際の動作は Claude 対話セッション依存）

2. **evidence の gzip 圧縮**: round ごとに screenshot が増える対策
   - 初期版は対象外、必要になったら `archive-round.mjs` を後付けで追加

3. **前 round からの継承**: 再実施の効率化
   - 初期版は「前 round の reports を `<round-dir>/prev/` にコピーして参照させる」程度
   - 自動 bucket 継承は誤判定リスクがあるため手動

4. **人間操作が必要な箇所**: checklist で `[HUMAN]` マーク + 完了チェックの運用
   - update-checklist.mjs に `--human-required` フラグを追加
