---
name: devtools-testcase-author
description: |
  @twuw-b/dev-tools 統合プロジェクトで、テストケース MD をロール単位で作成し
  /__debug/api/test-cases/import に同期するスキル。dev-tools v1.2.0+ の
  case_key (不変ID) ベース UPSERT に対応し、タイトル変更しても実行履歴を維持する。
  固定スキーマ Domain → Capability → Case 3階層に強制準拠、1ファイル=1ロール。
  認可境界テストは専用ドメインに分離。UI から確認できないテスト (DB 直接検証等)
  は禁止。
  Use when: (1) dev-tools を統合済みのプロジェクトでテストケースを新規作成したい
  (2) docs/test-cases/*.md を API に同期したい (3) DebugPanel / TestFlow UI に
  ケースが出ない (4) タイトル変更で実行履歴が失われて困っている
  (5) 「テストデータ作って」「テストケース投入」「test-cases 同期」
  「ロールごとにテスト整理」と言われた時
---

# devtools-testcase-author

## 前提チェック

このスキルは `@twuw-b/dev-tools` v1.2.0 以降を統合済みのプロジェクトで動く。起動時に以下を確認:

1. `package.json` に `@twuw-b/dev-tools` (>=1.2.0) が含まれる
2. `/__debug/api` エンドポイントが疎通する（ローカル Docker または本番）
3. `docs/test-cases/` ディレクトリが存在する（なければ作成）

いずれか欠けていれば、まず `docs/integration-guide.md` に従って統合を完了させる。

## 固定スキーマ（絶対に変えない）

dev-tools のテストケースは **Domain → Capability → Case** の3階層固定。
`parseTestCaseMd` と DebugPanel 実装で強制される。

| 階層 | MD 要素 | 意味 |
|---|---|---|
| Domain | frontmatter `domain:` + `role_code:` | ユーザーロールまたは認可境界（1ファイル=1ドメイン） |
| Capability | `# 見出し` (H1) | そのドメインが触る機能グループ |
| Case | `- [TC-XX-NNN] タイトル` | 実際に試す検証項目（不変キー必須） |

### 最重要ルール: 1 ファイル = 1 ドメイン

テスターは「自分はこのロール」と決めて1ファイルを上から順に試す。
**ファイルは機能軸ではなくドメイン (ロール+特殊用途) 軸で分ける**。

- OK: `user.md` の中に `# ログイン`, `# ダッシュボード`, `# プロフィール`
- NG: `auth.md` / `dashboard.md` のように機能軸で分割し、複数ロールを混在させる

### 正しい MD の例

```markdown
---
domain: 一般ユーザー
role_code: US
---

# 01 ログイン・アカウント
- [TC-US-001] ログイン画面からメールとパスワードでログインするとダッシュボードが表示される
- [TC-US-002] パスワードリセット画面からメールを送信すると完了メッセージが表示される

# 02 プロフィール
- [TC-US-101] プロフィール画面に自分の名前とメールアドレスが表示される
```

### よくある誤り（3日ハマる元）

```markdown
# NG: キー記法なし (v1.2.0+ で拒否される)
- ログインできる

# NG: capability 抜け
- [TC-US-003] メールでログインできる

# NG: 階層逆転
# メールでログインできる  ← これが capability 扱いになり case 0 件

# NG: キーの接頭辞と role_code が不一致
---
role_code: US
---
- [TC-AD-001] ...  ← 接頭辞 TC-US- でないのでパースエラー
```

## case_key 命名規則

**v1.2.0 以降、case_key が必須。不変 ID として扱う。**

```
TC-{role_code}-{連番}
```

- `role_code`: 2〜6 文字の英大文字 + 数字。プロジェクトが決める
- 連番: そのファイル内の `TC-{role_code}-` の最大値 + 1
- 欠番 OK、再利用禁止、番号の振り直し禁止

### 不変性の絶対ルール

1. **一度採番したら二度と番号を変更しない**
2. タイトル・domain・capability は自由に書き換え可 → UPSERT で更新される
3. 廃止したい場合は MD から行ごと削除 (物理削除ではなく archive 扱い)
4. 復活したい場合は **同じ番号のまま** MD に戻す

### role_code のデフォルト一覧

プロジェクト固有のコードを優先。未定義なら以下:

| ロール | role_code | テンプレート |
|---|---|---|
| guest (未ログイン) | `GU` | `guest.md` |
| user (一般ユーザー) | `US` | `user.md` |
| client (顧客) | `CL` | `client.md` |
| admin (管理者) | `AD` | `admin.md` |
| app-admin (アプリ運用者) | `AP` | `app-admin.md` |
| 認可・アクセス制御 | `AC` | `access-control.md` ← 新設 |

詳細は `references/case-key-guide.md` を参照。

## 🚫 アンチパターン A: UI で検証できないテストを書かない

テスターは `DebugPanel` の TestFlow UI からチェックボックスで pass/fail を記録する。手元に DB 管理ツールや API コンソールは無い。したがって **ブラウザ画面の変化だけで pass/fail を判定できるケース** しか書いてはいけない。

### NG 例と書き換え

| ❌ NG (UI 確認不能) | ✅ OK (UI 観察可能) |
|---|---|
| 招待受諾: 受諾済招待の役割が DB に正しく反映される | 招待受諾: 受諾後、対象ユーザーが該当企業のメンバー一覧に表示される |
| ユーザー登録: users テーブルに新規行が追加される | ユーザー登録: 登録完了画面に入力したメールアドレスが表示される |
| API レスポンス JSON が仕様と一致する | 画面の該当エリアに取得データが表示される |
| createdAt が UTC で保存される | 作成日時が画面に表示される |
| パスワードが bcrypt でハッシュ化される | 正しいパスワードでログイン成功、誤ると失敗する |

### 判定基準

ケースを書く前に自問: **「テスターが TestFlow UI から実行したとき、ブラウザ画面のどこに結果が現れるか？」**

画面上の具体的な変化を言語化できないなら却下して書き換える。DB・API・ログ・内部 ID 等の裏側検証は **ユニットテスト・結合テスト** の領分であり、この skill の対象外。

## 🚫 アンチパターン B: 認可境界テストをロール MD に混ぜない

ロール別 MD はそのロールの **日常業務フロー** をテスターが上から順に試す想定。「他ロールのデータに触れないこと」の確認 (= 認可境界テスト) は以下の理由で別扱い:

1. 複数アカウント切替が必要
2. 「わざと違反操作する」不自然な動線
3. 失敗時の重大度が格段に高い (データ漏洩レベル)

### 解決策: `access-control.md` に集約

```markdown
---
domain: 認可・アクセス制御
role_code: AC
---

# 01 企業・テナント境界
- [TC-AC-001] 企業管理者: 他企業の管理画面 URL を直打ちしても該当画面が開かず、エラーかログイン画面にリダイレクトされる
- [TC-AC-002] 企業管理者: 他企業のユーザー編集 URL を直打ちしても編集フォームが表示されない

# 02 ゲスト認可
- [TC-AC-101] ゲスト: 保護された画面 (/dashboard 等) に直接アクセスするとログイン画面に遷移する
```

### ルール

1. **ケース冒頭にテスト主体ロールを書く**: `企業管理者:` `一般ユーザー:` `ゲスト:` 等
2. **アンチパターン A と複合**: `API レベルでもアクセスできない` → `直打ちしても画面が開かない` と書き換え
3. **capability は権限軸で切る**: `企業・テナント境界` / `ゲスト認可` / `読み取り専用権限` / `権限昇格の拒否` / `セッション・認証`

該当ロール MD に以下のパターンがあれば移動対象:

- `他企業のデータにアクセスできない`
- `権限のないユーザーは ... 拒否される`
- `URL 直打ちでリダイレクトされる`

## ワークフロー

### モード判定

- `docs/test-cases/` が空 → **生成モード**（Step 1 → 5）
- 既に MD あり → **同期モード**（Step 4 → 5、MD 編集は必要時のみ）

### Step 1: ロール棚卸し

プロジェクトから存在するユーザーロールを抽出:

1. `CLAUDE.md` / `docs/requirement.md` / `README.md` を読む
2. `src/` 内の auth/role/guard 実装を grep（`role`, `permission`, `guard`, `admin`）
3. ルーティング (`src/routes`, `src/pages`) の保護パターンを確認

抽出したロール候補をユーザーに提示し、確定させる。**認可境界ドメイン (`access-control.md`) も必ず含める**。

### Step 2: role_code 決定

各ロールに 2〜6 文字の英大文字コードを割り当てる。プロジェクトに既存の命名があればそれを優先。無ければデフォルト (`GU`/`US`/`CL`/`AD`/`AP`/`AC`) をベースに提案してユーザー確認を取る。

### Step 3: MD 生成

各ロールごとに `assets/templates/<role>.md` をコピーして `docs/test-cases/<role>.md` を作成。frontmatter の `role_code` を書き換え、case_key の接頭辞もそれに合わせて一括置換。

テンプレに載ってない機能はプロジェクトの要件から capability として追記する。

**必ず確認**:
- すべての case が UI 観察可能か (アンチパターン A)
- 認可境界が access-control.md に集約されているか (アンチパターン B)
- capability の粒度: 1 capability = 3〜10 case

### Step 4: バリデーション（投入前に必須）

```bash
node scripts/import-test-cases.mjs http://localhost:8082/api/__debug --dry-run
```

以下をチェック:

- すべての MD に frontmatter `domain:` と `role_code:` がある
- 全 case に `[TC-XX-NNN]` キーがある
- キーの接頭辞が `role_code` と一致する
- ファイル内・ファイル横断で case_key が重複していない
- case 数が 0 のファイルはエラー
- 同一 domain が複数ファイルに分散していないか警告

### Step 5: API 投入（UPSERT）

`scripts/import-test-cases.mjs` をプロジェクトルートから実行。**purge はしない。UPSERT のみ**:

```bash
# ローカル (env=dev)
node scripts/import-test-cases.mjs http://localhost:8082/api/__debug

# 本番 (admin key 必要)
node scripts/import-test-cases.mjs https://example.com/__debug/api \
  --env=dev --admin-key="$DEVTOOLS_ADMIN_KEY"

# 確認のみ（API 非接触）
node scripts/import-test-cases.mjs http://localhost:8082/api/__debug --dry-run
```

**本番投入時の注意**:
- 投入先が prod/staging の場合はユーザーに必ず確認を取る
- UPSERT なので既存データは破壊されないが、`role_code` ミスや接頭辞不一致は即座に検出して停止

### Step 6: 動作確認

1. フロントエンドを起動し DebugPanel を開く
2. 「テスト」タブに Domain → Capability → Case の階層が出ているか確認
3. 出ない場合: `/__debug/api/test-cases/tree?env=dev` を curl で叩き、レスポンスの `data` が空でないか確認

## 削除について

本 skill の `import-test-cases.mjs` は **一切削除操作を行わない**:

- MD から行を削除しても DB 上は残る（警告 `MD から消えた case_key: N 件` のみ）
- 廃止したい場合は dev-tools 管理 UI の archive 機能で手動実行
- `case_key` の再利用・番号振り直しは **絶対禁止**

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
| `missing [TC-XX-NNN] key` | 旧形式のまま `- タイトル` で書いた | キーを採番して付与 |
| `case_key prefix mismatch` | role_code と case_key の接頭辞不一致 | どちらかを揃える |
| `duplicate case_key across files` | ファイル横断で同じ番号 | 別番号に |
| DebugPanel に何も出ない | case を `#` で書いている | `#` は capability、case は `- [TC-XX-NNN]` |
| タイトル修正で実行履歴が消える (旧動作) | dev-tools が v1.2.0 未満 | dev-tools をアップデート |
| 複数ロール混在で想定外 | ファイルを機能軸で分割 | ロール軸に再編 |
| 認可テストが業務 MD に混ざる | アンチパターン B | access-control.md に分離 |

## バンドルリソース

- `assets/templates/<role>.md` — 6 ドメイン分のテンプレート
  - guest / user / client / admin / app-admin + **access-control (新設)**
- `scripts/import-test-cases.mjs` — パース + バリデート + UPSERT + 差分検出 + verify
- `references/case-key-guide.md` — case_key とアンチパターンの詳細リファレンス

## 関連 skill

- **`devtools-testcase-verifier`** — 本 skill で作成した MD を Chrome MCP で実際に検証し、5 バケットに振り分けるスキル。テストケースを作成した後はこちらで実行 → レポート生成まで一貫して行う。

## 関連ドキュメント

- dev-tools 側の設計: `docs/fixed/test-cases-stable-key.md` (v11 マイグレーション、UPSERT 実装)
- 本 skill の更新計画: `docs/draft/testcase-author-skill-v2.md`
- 利用側プロジェクトの対応: 各プロジェクトの `docs/modify/ready/*test-cases-stable-key*.md`
