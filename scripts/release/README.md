# scripts/release/

リリース前のセキュリティ検査ツール群。Claude Code の `/release` slash command から呼び出される。

## ファイル

| ファイル | 用途 |
|---|---|
| `security-check.sh` | メインのセキュリティ検査スクリプト |
| `secret-patterns.txt` | サービストークンの正規表現リスト (AWS/GitHub PAT/Slack/Stripe/OpenAI/Google/JWT/秘密鍵) |
| `placeholder-whitelist.txt` | ドキュメント内で許可される placeholder 値 (REDACTED_* / YOUR_* / <...> 等) |

## 使い方

```bash
# 作業ツリーの検査
./scripts/release/security-check.sh

# tgz を含めた検査 (publish 前)
./scripts/release/security-check.sh --tgz twuw-b-dev-tools-X.Y.Z.tgz
```

終了コード:
- `0` 全て OK
- `1` critical ヒット → publish 中止必須
- `2` weak パターンのみ → 参考情報

## 検査項目

1. **gitignore 対象の追跡検知** — 誤って追跡された `.env` / `config.php` 等を検出
2. **禁止ファイル名スキャン** — `.env*` / `credentials.json` / `id_rsa` / `*.pem` 等
3. **同梱 MD の KV credential 検出** — `- pass: xxx` 形式で placeholder 以外の値を検出
4. **サービストークン検査** — 同梱ファイル全体で secret-patterns を grep
5. **直近 git 履歴スキャン** — 最新 20 コミットに機密が紛れていないか
6. **tgz 検査** (`--tgz` 指定時) — publish 予定の tarball の中身を最終確認

## 必要なツール

- `git`
- `ripgrep` (`rg`) — `brew install ripgrep`
- `node` (placeholder 評価で使用)
- `tar` (`--tgz` 使用時)

## インシデント履歴と教訓

### v1.2.0〜v1.2.3 (2026-04-07): ダミー認証情報の同梱事故

**何が起きたか**:
- `docs/integration-guide.md` / `docs/usage.md` / `CHANGELOG.md` / test fixtures にダミー
  credential (`flc-design.jp` ドメインの email + password サンプル) を埋め込んだまま publish
- GitGuardian の "Company Email Password" detector が検知
- 実害なし（ダミー・テスト環境）だが GitGuardian アラート発生

**根本原因**:
- 当時の `/release` セキュリティ検査はサービストークン (AWS/GitHub PAT 等) のみを対象
- 平文の email + password を KV 形式で書いた場合を検出する規則がなかった
- 弱パターン (`password:` / `token:` 等) は「参考のみ」扱いで停止条件にしていなかった

**対処**:
- v1.2.4 で `git filter-repo` 全履歴 purge + GitHub Packages 旧バージョン削除 + タグ force-push
- `scripts/release/security-check.sh` を新設し **同梱 MD の KV credential 検出** を critical 検査に追加
- placeholder 以外の値が検出されたら `exit 1` で publish を強制停止する構造に変更

**教訓**:
- `git filter-repo` + force-push だけでは **GitHub 上の dangling blob は 90 日残る**
- 完全除去には GitHub Support への削除依頼が必要 (機密度に応じて判断)
- ドキュメントのサンプル値は **必ず placeholder-whitelist に登録済みの形式** を使う
  (`admin@example.com` / `REDACTED_PASSWORD_*` / `<your-key>` / `${TOKEN}` 等)

### v1.2.4〜 (2026-04-08): CLAUDE.md / release.md の git 追跡解除

**何をしたか**:
- `CLAUDE.md` と `.claude/commands/release.md` は個人の開発環境用であり、
  チーム共有の対象外と判断し `.gitignore` に追加
- 既存の追跡は `git rm --cached` で解除
- 全履歴からも `git filter-repo --path ... --invert-paths` で purge
- force-push 済み

**教訓**:
- `.claude/commands/` と `.claude/skills/` は配布意図が異なる:
  - `commands/` = 開発者の個人環境（git 追跡しない）
  - `skills/devtools-testcase-author/` = 利用者向け配布物（npm 同梱、git 追跡する）
- `package.json.files` と `.gitignore` は **設計意図を一致させる** こと

## ドキュメント執筆ルール（再発防止）

同梱対象ファイル（README.md / docs/integration-guide.md / docs/test-case-template.md /
.claude/skills/devtools-testcase-author/**）に認証情報らしきサンプルを書く場合:

### ✅ 推奨 (placeholder-whitelist に登録済み)

```markdown
- email: admin@example.com
- pass: REDACTED_PASSWORD
- url: https://<your-cloudfront>.cloudfront.net/
- token: ${API_TOKEN}
- user: demo_user
```

### ❌ 禁止 (security-check.sh が critical で止める)

```markdown
- email: admin@company.com
- pass: AbCdEf123!@#
- token: ghp_xxx...
```

### placeholder-whitelist 拡張

新しい placeholder 形式を追加したい場合は `placeholder-whitelist.txt` に正規表現を追加し、
`security-check.sh` を実行して false positive にならないか確認。
