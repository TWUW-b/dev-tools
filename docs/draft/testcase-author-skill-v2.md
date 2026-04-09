---
title: devtools-testcase-author skill を case_key 対応 + アンチパターン規約に更新する
status: draft
related:
  - docs/fixed/test-cases-stable-key.md (dev-tools 側 case_key 対応 v11、実装済み)
  - 利用側プロジェクトの docs/modify/ready/001-test-cases-stable-key.md (利用側実装計画)
---

# 背景

2026-04-09、ある利用プロジェクトの phase1 検証中に以下のインシデントが発生:

1. `docs/test-cases/*.md` を修正して push
2. GitHub Actions の `import-test-cases.js` が走ったが、旧データ (タイトル `(1) ...` 形式) が残存したまま 257 件が追加され total=504 に膨張
3. 画面には古い `(1)` 行のみが表示されたので、ローカルから `PURGE=1` で再 import
4. dev-tools 側の cascade delete で `test_runs` (実行履歴) が物理削除された

**根因**: test_cases の実質キーが `(domain, capability, title)` だったため、MD 側のタイトル変更が新規行を生成し、`INSERT OR IGNORE` では重複、`DELETE → INSERT` では履歴消失、という詰み状態。

dev-tools 側は既に **v11 マイグレーション** で `case_key` 不変 ID + `archived_at` ソフトデリート対応済み (commit `e17259d`, `c2d2ec1`)。TestController の `importCases` も UPSERT に変更済み。

しかし `.claude/skills/devtools-testcase-author/` の SKILL.md・テンプレート・import-test-cases.mjs はまだ旧形式 (`- タイトル`、purge → import) のままで、利用者が v11 API に正しくアクセスできない。本計画でこのギャップを解消する。

また同インシデントのレビュー中に、テストケース自体の品質問題も発覚:

1. **UI から検証不可能なテスト** が混在: 例 `(14) 招待受諾: 受諾済招待の役割が DB に正しく反映される`。テスターは UI 上から DB を直接参照できないため、結果的に「画面を見て判断する」ことができず、テスト実行が空振りになる
2. **ロール別テストに認可境界テストが混在**: 例 `(9) 企業情報: 他企業の情報には API レベルでもアクセスできない`。これは企業管理者ロールとして「通常の業務フロー」を試しているテスターが、別企業のデータにアクセスしようと試みる不自然な動線になる。認可境界テストは別ドメインにまとめるのが自然

# 目標

`.claude/skills/devtools-testcase-author/` を以下の要件を満たすように更新する:

1. **case_key 命名規則の導入**: `TC-{role_code}-{連番}` 形式で不変 ID を採番
2. **role_code の frontmatter 化**: 各ロールファイルが接頭辞と一致するよう `role_code:` を必須化
3. **import スクリプトを upsert 対応**: purge 廃止、case_key ベースで UPSERT、削除予定は警告のみ
4. **テストケース作成ルールに 2 つのアンチパターンを追加**:
   - A. **UI で検証できないテストを書かない** — DB 直接参照・API レベルのレスポンス確認等
   - B. **認可境界テストは別ドメインに分離** — 通常業務のロールテストに混ぜない
5. **テンプレートを case_key 形式 + ルール準拠の例に書き直し**
6. **認可境界ドメイン用のテンプレート追加** — `access-control.md` を新設

# 設計

## 1. MD フォーマット変更

### 現行（変更前）

```md
---
domain: user
---

# ログイン・アカウント
- メールアドレスとパスワードでログインできる
```

### 新フォーマット

```md
---
domain: 2. 一般ユーザー
role_code: GN
---

# 01 ログイン・アカウント
- [TC-GN-001] ログイン: メールアドレスとパスワードでログインできる
- [TC-GN-002] ログイン: パスワードリセットメールを受け取れる
```

- `role_code`: プロジェクトごとに決める 2〜4 文字の英大文字コード。`case_key` の接頭辞と一致
- `[TC-{role_code}-{連番}]`: 不変 ID。MD 内で絶対に書き換えない
- 連番: そのファイル内の `TC-XX-*` の最大値 + 1。欠番 OK、再利用禁止

## 2. アンチパターン規約

### A. UI で検証できないテストを書かない

**前提**: テスターは `DebugPanel` の TestFlow UI からチェックボックスで pass/fail を記録する。手元に DB 管理画面や API コンソールを持たない純粋な QA ロール。したがって **アプリ UI 上で観察できる現象だけ** をテスト対象にする。

**❌ NG 例** (UI 上で確認不可能、テスター実行不能)

- `招待受諾: 受諾済招待の役割が DB に正しく反映される`
  - テスターが DB を覗けない
- `ユーザー登録: users テーブルに新規行が追加される`
  - 同上
- `API レスポンスの JSON スキーマが仕様と一致する`
  - UI では見えない
- `createdAt タイムスタンプが UTC で保存される`
  - UI に出ない値

**✅ OK 例** (UI 上の副作用として観察可能)

- `招待受諾: 受諾後、対象ユーザーが該当企業のメンバー一覧に表示される`
- `招待受諾: 受諾後、サイドバーに新しい企業が選択可能になる`
- `ユーザー登録: 登録完了画面に入力したメールアドレスが表示される`

**判断基準**: 「テスターが DebugPanel の TestFlow UI から実行するとき、ブラウザの画面操作だけで pass/fail を判定できるか？」を満たすケースだけ書く。

### B. 認可境界テストは別ドメインに分離

**前提**: 1 ファイル = 1 ロール の原則で、各 MD はそのロールの **日常業務フロー** をテストする。「自分の権限で何ができるか」を確認するもの。

認可境界テスト (= 「他のユーザー/企業/権限のデータに触れないこと」を確認するテスト) は性質が異なる:

- 実行には複数アカウントの切り替えが必要
- テスター視点では「わざと違反操作する」不自然な動線
- 失敗時の影響度は「データ漏洩」レベルで、通常機能の不具合とは重大さが違う

したがって **通常ロールの MD には書かず、専用ドメインに集約する**:

```md
---
domain: 6. アクセス制御
role_code: AC
---

# 01 企業境界
- [TC-AC-001] 企業管理者: 他企業の /corporate にアクセスすると 403 または自企業へリダイレクトされる
- [TC-AC-002] 企業管理者: 他企業のユーザー編集 URL を直打ちしても編集画面が開かない
- [TC-AC-003] 一般ユーザー: 共有されていない他企業のファイル URL に直接アクセスすると該当画面が開かない

# 02 ゲスト認可
- [TC-AC-101] ゲスト: 公開リンクから /users を開いても認可エラー画面に遷移する
- [TC-AC-102] ゲスト: 保護された画面に直接アクセスするとログイン画面にリダイレクトされる

# 03 読み取り専用
- [TC-AC-201] 閲覧ユーザー: /corporate の編集ボタンが表示されない、または押しても保存できない
```

**テスター側のメリット**:
- 通常業務の MD を上から順に試している最中に「他企業の URL を直打ちしてみる」不自然な動線が混ざらない
- 認可境界だけ「別の日に専門的にまとめて検証」できる
- `TC-AC-*` の障害は社内エスカレーション対象として優先度マークしやすい

**アンチパターン A との複合**: 認可境界テストも UI 上で結果が観察できるものに限定する。`API レベルでもアクセスできない` という言い回しは **UI 経由で 403 画面が出る / 画面遷移が起きない / データが表示されない** など、画面として観察できる表現に書き換える。

## 3. role_code の扱い

プロジェクトごとに 2〜4 文字の英大文字コードを決めて、frontmatter に記述する。

| プロジェクト例 | role_code | ファイル |
|---|---|---|
| タスク管理 SaaS | `SA` | 01-sys-admin.md |
| タスク管理 SaaS | `TM` | 02-team-manager.md |
| タスク管理 SaaS | `MB` | 03-member.md |
| タスク管理 SaaS | `VW` | 04-viewer.md |
| タスク管理 SaaS | `GU` | 05-guest.md |
| タスク管理 SaaS | `AC` | 06-access-control.md |

skill のデフォルトテンプレートは英語ベースのロール名に合わせる:

| ロール | role_code (デフォルト) |
|---|---|
| admin | `AD` |
| app-admin | `AP` |
| user | `US` |
| client | `CL` |
| guest | `GU` |
| access-control | `AC` |

利用者はプロジェクト慣例に合わせて自由に上書きしてよい。`case_key` と `role_code` の接頭辞が一致していれば OK。

## 4. import-test-cases.mjs 改修

### 変更点

- **パーサ**: `- [TC-XX-NNN] タイトル` 形式に対応。`[...]` が欠けていればエラー停止
- **case_key 抽出**: `TC-XX-NNN` 部分を `case_key` として payload に含める
- **role_code 検証**: frontmatter の `role_code` と、そのファイル内の全 case_key の接頭辞 `TC-XX-` が一致することを確認
- **重複 case_key 検出**: 同一ファイル内・全ファイル横断で case_key が重複していないか
- **purge 廃止**: `PURGE` オプションを削除。存在しないキーは警告出力のみ
- **不在キー検出**: DB には存在するが MD に無い case_key を列挙して `[warning]` 出力。削除は **手動判断** (dev-tools UI か DELETE エンドポイントで archive)
- **dry-run は維持**

### エラーメッセージ

| メッセージ | 原因 | 対処 |
|---|---|---|
| `missing frontmatter` | `---` ブロックが無い | frontmatter を追加 |
| `domain required in frontmatter` | `domain:` 行が無い | 追加 |
| `role_code required in frontmatter` | `role_code:` 行が無い | 追加 |
| `missing [TC-XX-NNN] key on line N` | `- ` の直後にキー記法が無い | 採番して追加 |
| `case_key prefix mismatch: expected TC-{role_code}-` | case_key の接頭辞が frontmatter role_code と不一致 | どちらかを合わせる |
| `duplicate case_key in file: TC-XX-NNN` | 同一ファイル内重複 | 片方を別キーに |
| `duplicate case_key across files: TC-XX-NNN in A.md and B.md` | ファイル横断重複 | 別キーに修正 |
| `case before any H1 capability` | `# 見出し` より前に `- ` がある | `# 見出し` 配下に移動 |

## 5. テンプレート書き直し

### 各ロール (guest / user / client / admin / app-admin)

- frontmatter に `role_code` 追加（デフォルト: `GU` / `US` / `CL` / `AD` / `AP`）
- 全 case に `[TC-XX-NNN]` を付与
- アンチパターン A に該当する「DB 反映確認」系を UI 観察ベースに書き換え
- 認可境界に該当する case はテンプレートから削除（新設する access-control.md に移動）

### 新設: access-control.md

- `role_code: AC`
- 典型的な認可境界テストを 10〜15 件含む
- capability は「企業境界」「ゲスト認可」「読み取り専用」「権限昇格」など

## 6. SKILL.md 更新

### 追加セクション

1. **命名規則**: case_key / role_code の定義、採番ルール、不変性の説明
2. **アンチパターン集**: A (UI 検証不可) / B (認可境界混在) の具体例と判定基準
3. **新フォーマット例**: frontmatter + `- [TC-XX-NNN]` 形式
4. **import スクリプトの upsert 動作説明**: v11 API 前提、purge 廃止、不在キー警告のみ

### 既存セクション更新

- 「ハマりポイント集」に case_key 関連の典型エラーを追加
- 「ワークフロー」の Step 3 (バリデーション) / Step 4 (投入) を新スクリプトに整合

# 影響範囲

| ファイル | 変更 |
|---|---|
| `.claude/skills/devtools-testcase-author/SKILL.md` | 命名規則・アンチパターン・アップサート動作を追記、旧 purge 記述を削除 |
| `.claude/skills/devtools-testcase-author/assets/templates/guest.md` | frontmatter に role_code 追加、case_key 付与、認可境界を削除 |
| `.claude/skills/devtools-testcase-author/assets/templates/user.md` | 同上 |
| `.claude/skills/devtools-testcase-author/assets/templates/client.md` | 同上 |
| `.claude/skills/devtools-testcase-author/assets/templates/admin.md` | 同上 |
| `.claude/skills/devtools-testcase-author/assets/templates/app-admin.md` | 同上 |
| `.claude/skills/devtools-testcase-author/assets/templates/access-control.md` | **新規** |
| `.claude/skills/devtools-testcase-author/scripts/import-test-cases.mjs` | parser を `[TC-XX-NNN]` 形式に、case_key を payload に、purge 廃止、不在キー警告 |
| `.claude/skills/devtools-testcase-author/references/case-key-guide.md` | **新規** — 命名規則とアンチパターンの詳細リファレンス |

影響:

- dev-tools 側の API・スキーマ・型変更は **不要**（v11 で対応済み）
- 利用側プロジェクトの `ready/001-test-cases-stable-key.md` と整合
- 既存利用者で skill を導入済みのプロジェクトは、導入済みの MD を再採番する必要がある

# リリース方針

- skill 配下の MD 変更は **同梱 MD 変更** (ケース C) に該当
- `/release` の判定ロジックにより **patch bump 強制**: 1.2.4 → 1.2.5
- `scripts/release/security-check.sh` で新テンプレート内の credential サンプルをチェック（placeholder 形式に揃える）

# 実装順序

1. 新設: `access-control.md` テンプレート
2. 既存 5 テンプレートを case_key 形式に更新、認可境界を除外
3. `import-test-cases.mjs` を upsert 対応版に置換
4. `SKILL.md` に命名規則・アンチパターン・upsert 説明を追加
5. `references/case-key-guide.md` を新規作成
6. dry-run で新 skill を自己検証（skill 内の templates を使う想定）
7. `npm run test` で既存テストが通ることを確認（src の変更はないので影響なし）
8. `/release patch` で v1.2.5 を publish

# オープン課題

1. **role_code の自動提案**: skill は対話的にプロジェクトから role を抽出するが、role_code の決定をどう誘導するか
   - 案 A: skill が「英語ロール名の先頭 2 文字 + Safety 検証」で自動提案、ユーザー確認
   - 案 B: ユーザーに「このロールの role_code は？」と都度聞く
   - **案 A を推奨**（利用者の負担を最小化）

2. **認可境界ファイルの命名**: デフォルトで `access-control.md` / `role_code: AC` とするが、プロジェクトによっては `authorization.md` / `security.md` のほうが自然
   - skill は **デフォルト提案として access-control.md** を示し、ユーザーが override できるようにする

3. **既存プロジェクトへのマイグレーション支援**: 利用側で既に TC-*-NNN 採番済みなら問題ないが、古い形式のままのプロジェクトは手作業の移行が必要
   - skill に「既存 `- タイトル` を読み取って `[TC-XX-NNN]` を一括付与する migrate モード」を追加するかは要検討
   - **今回は対象外**（次のイテレーション）

# 検証計画

1. **単体テスト**: skill 配下なのでプロジェクトの vitest は対象外。手動検証:
   - 新テンプレートを parse → case_key / role_code が抽出される
   - アンチパターン A の例が新テンプレートに混ざっていない
   - 認可境界 case が access-control.md にのみ存在する

2. **結合テスト**: 利用プロジェクトのローカル Docker に対して新 `import-test-cases.mjs` を走らせ:
   - 既存ケースが UPSERT される
   - `test_runs` が維持される
   - 削除予定キーは警告のみで物理削除されない

3. **回帰テスト**: `npm run test` / `npm run test:api` (dev-tools リポ)
   - 本変更は skill のみで src/api 未変更 → 既存 98 + 83 テストが通れば OK
