---
name: devtools-testcase-author
description: |
  @twuw-b/dev-tools 統合プロジェクトで、テストケース MD をロール単位で作成し
  /__debug/api/test-cases/import に同期するスキル。dev-tools の固定スキーマ
  Domain → Capability → Case 3階層に強制準拠し、1ファイル=1ユーザーロールで
  整理する。設計 (MD 作成) が主、API 投入 (purge→import→verify) は付属。
  Use when: (1) dev-tools を統合済みのプロジェクトでテストケースを新規作成したい
  (2) docs/test-cases/*.md を API に同期したい (3) DebugPanel / TestFlow UI に
  ケースが出ない (4) 「テストデータ作って」「テストケース投入」「test-cases 同期」
  「ロールごとにテスト整理」と言われた時
---

# devtools-testcase-author

## 前提チェック

このスキルは `@twuw-b/dev-tools` を統合済みのプロジェクトで動く。起動時に以下を確認:

1. `package.json` に `@twuw-b/dev-tools` が含まれる
2. `/__debug/api` エンドポイントが疎通する（ローカル Docker または本番）
3. `docs/test-cases/` ディレクトリが存在する（なければ作成）

いずれか欠けていれば、まず `docs/integration-guide.md` に従って統合を完了させる。

## 固定スキーマ（絶対に変えない）

dev-tools のテストケースは **Domain → Capability → Case** の3階層固定。
`parseTestCaseMd` と DebugPanel 実装で強制される。

| 階層 | MD 要素 | 意味 |
|---|---|---|
| Domain | frontmatter `domain:` | **ユーザーロール**（1ファイル=1ドメイン） |
| Capability | `# 見出し` (H1) | そのロールが触る機能グループ |
| Case | `- 箇条書き` | 実際に試す検証項目 |

### 最重要ルール: 1 ファイル = 1 ユーザーロール

テスターは「自分はこのロール」と決めて1ファイルを上から順に試す。
**ファイルは機能軸ではなくロール軸で分ける**。

- OK: `user.md` の中に `# ログイン`, `# ダッシュボード`, `# プロフィール`
- NG: `auth.md` / `dashboard.md` のように機能軸で分割し、複数ロールを混在させる

### よくある誤り（3日ハマる元）

```markdown
# OK
# ログイン・アカウント        ← capability
- メールでログインできる      ← case

# NG (capability 抜け)
- メールでログインできる      ← case が親 capability を持たないので無視される

# NG (階層逆転)
# メールでログインできる      ← これが capability 扱いになり、中身が 0 件
```

## ワークフロー

### モード判定

- `docs/test-cases/` が空 → **生成モード**（Step 1 → 2 → 3 → 4 → 5）
- 既に MD あり → **同期モード**（Step 3 → 4 → 5、MD 編集は必要時のみ）

### Step 1: ロール棚卸し

プロジェクトから存在するユーザーロールを抽出:

1. `CLAUDE.md` / `docs/requirement.md` / `README.md` を読む
2. `src/` 内の auth/role/guard 実装を grep（`role`, `permission`, `guard`, `admin`）
3. ルーティング (`src/routes`, `src/pages`) の保護パターンを確認

抽出したロール候補をユーザーに提示し、確定させる。典型セット:

| ロール | 典型 |
|---|---|
| `guest` | 未ログイン閲覧・サインアップ |
| `user` | 一般ユーザー（自データ CRUD） |
| `client` | 顧客・閲覧専用・承認 |
| `admin` | 管理者（全体管理） |
| `app-admin` | アプリ運用者（環境・権限・ログ） |

### Step 2: MD 生成

各ロールごとに `assets/templates/<role>.md` をコピーして `docs/test-cases/<role>.md` を作成。
テンプレに載ってない機能はプロジェクトの要件から capability として追記する。

capability の粒度目安: 1 capability = 3〜10 case。多すぎたら分割、少なすぎたら統合。

### Step 3: バリデーション（投入前に必須）

投入前に必ず `scripts/import-test-cases.mjs --dry-run` を実行し、以下を確認:

- すべての MD に frontmatter `domain:` がある
- H1 の直前・直後でないリスト項目が無視されていないか
- case 数が 0 のファイルはエラー
- 同一 domain が複数ファイルに分散していないか警告

### Step 4: API 投入

`scripts/import-test-cases.mjs` をプロジェクトルートから実行。処理順は purge → import → verify:

```bash
# ローカル (env=dev)
node scripts/import-test-cases.mjs http://localhost:8082/api/__debug

# 本番 (admin key 必要)
node scripts/import-test-cases.mjs https://example.com/__debug/api \
  --env=dev --admin-key="$DEVTOOLS_ADMIN_KEY"

# 確認のみ（API 非接触）
node scripts/import-test-cases.mjs http://localhost:8082/api/__debug --dry-run
```

投入先が prod/staging の場合はユーザーに必ず確認を取る。

### Step 5: 動作確認

1. フロントエンドを起動し DebugPanel を開く
2. 「テスト」タブに Domain → Capability → Case の階層が出ているか確認
3. 出ない場合: `/__debug/api/test-cases/tree?env=dev` を curl で叩き、
   レスポンスの `data` が空でないか確認

## パラメータ

| 項目 | デフォルト | 説明 |
|---|---|---|
| `api_base_url` | `http://localhost:8082/api/__debug` | dev-tools API のベース URL |
| `env` | `dev` | 環境名（dev/staging/prod） |
| `admin_key` | なし | 本番投入時は `X-Admin-Key` ヘッダに使用 |
| `test_cases_dir` | `docs/test-cases` | MD 配置先 |

## ハマりポイント集

| 症状 | 原因 | 対処 |
|---|---|---|
| DebugPanel に何も出ない | case を `#` で書いている | `#` は capability、case は `-` |
| 100件超の削除が失敗 | DELETE API の max 100件制限 | import-test-cases.mjs が自動バッチ化 |
| サブドメイン疎通しない | DNS 伝播遅延（xserver で30分＋） | 待機して再試行 |
| 複数ロール混在で想定外 | ファイルを機能軸で分割 | ロール軸に再編 |

## バンドルリソース

- `assets/templates/<role>.md` — 5ロール分のテンプレート（guest/user/client/admin/app-admin）
- `scripts/import-test-cases.mjs` — パース＋バリデート＋purge＋import＋verify の一体型スクリプト
