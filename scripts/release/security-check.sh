#!/usr/bin/env bash
# @twuw-b/dev-tools — リリース前セキュリティ検査
#
# Usage:
#   scripts/release/security-check.sh              # すべてのチェックを実行
#   scripts/release/security-check.sh --tgz PATH   # 既存 tgz を検査 (publish 前)
#
# 終了コード:
#   0  全て OK
#   1  1 件以上の critical ヒット → publish 中止
#   2  weak pattern ヒット (同梱ファイル外、参考のみ)
#
# 設計原則:
#   - critical ヒットは問答無用で非ゼロ終了する (claude がスキップできない)
#   - 同梱対象ファイル (npm pack --dry-run で列挙) は特に厳格に検査
#   - パターンは secret-patterns.txt / placeholder-whitelist.txt に外出し

set -uo pipefail
# set -e は意図的に外す: rg/grep が「一致なし」で非ゼロを返すのは正常動作であり、
# 各関数内で個別に `|| true` するより統一してエラーを取り扱う方が簡潔。

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

PATTERNS_FILE_SRC="scripts/release/secret-patterns.txt"
WHITELIST_FILE_SRC="scripts/release/placeholder-whitelist.txt"
# rg -f は pattern file の # 始まりや空行もすべて pattern として扱うため、
# ここで前処理して /tmp にコメント除去版を書き出す
PATTERNS_FILE="$(mktemp)"
WHITELIST_FILE="$(mktemp)"
grep -v -E '^(#|$)' "$PATTERNS_FILE_SRC" > "$PATTERNS_FILE"
grep -v -E '^(#|$)' "$WHITELIST_FILE_SRC" > "$WHITELIST_FILE"
trap 'rm -f "$PATTERNS_FILE" "$WHITELIST_FILE"' EXIT

TGZ_PATH=""
while [ $# -gt 0 ]; do
  case "$1" in
    --tgz) TGZ_PATH="$2"; shift 2 ;;
    *) echo "unknown arg: $1"; exit 1 ;;
  esac
done

if ! command -v rg >/dev/null 2>&1; then
  echo "ERROR: ripgrep (rg) が必要です。brew install ripgrep" >&2
  exit 1
fi

CRITICAL_HITS=0
WEAK_HITS=0
REPORT=""

log_critical() {
  CRITICAL_HITS=$((CRITICAL_HITS + 1))
  REPORT+="${REPORT:+$'\n'}❌ CRITICAL: $1"
  echo "❌ CRITICAL: $1" >&2
}

log_weak() {
  WEAK_HITS=$((WEAK_HITS + 1))
  REPORT+="${REPORT:+$'\n'}⚠  WEAK: $1"
  echo "⚠  WEAK: $1" >&2
}

log_ok() {
  echo "✓ $1"
}

# ────────────────────────────────────────────
# 0.1 gitignore 対象の追跡検知
# ────────────────────────────────────────────
check_gitignore_tracked() {
  local hits
  hits=$(git ls-files | while read -r f; do
    git check-ignore -q "$f" 2>/dev/null && echo "$f"
  done)
  if [ -n "$hits" ]; then
    log_critical "gitignore 対象が git に追跡されています:"
    echo "$hits" | sed 's/^/    /'
  else
    log_ok "0.1 gitignore 対象の追跡検知: OK"
  fi
}

# ────────────────────────────────────────────
# 0.2 禁止ファイル名スキャン
# ────────────────────────────────────────────
check_forbidden_filenames() {
  local pat='(^|/)(\.env(\..*)?|credentials?\.json|secrets?\.(json|ya?ml)|id_rsa|id_ed25519|.*\.pem|.*\.pfx|.*\.p12|service-account.*\.json|gcp-key.*\.json|aws-credentials|config\.php)$'
  local hits
  hits=$(git ls-files | grep -iE "$pat" | grep -v -E '^api/config\.example\.php$' || true)
  if [ -n "$hits" ]; then
    log_critical "禁止ファイル名が追跡されています:"
    echo "$hits" | sed 's/^/    /'
  else
    log_ok "0.2 禁止ファイル名スキャン: OK"
  fi
}

# ────────────────────────────────────────────
# 0.3 同梱ファイル内のサービストークン検査
# ────────────────────────────────────────────
scan_content() {
  local target="$1"
  local label="$2"
  local hits
  hits=$(rg -P -f "$PATTERNS_FILE" --no-heading -n "$target" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    log_critical "$label 内にサービストークンを検出:"
    echo "$hits" | sed 's/^/    /'
  else
    log_ok "$label 内のサービストークン: OK"
  fi
}

# ────────────────────────────────────────────
# 0.4 同梱 MD 内の credential-in-kv 検出
#     (今回の漏洩事故の再発防止)
# ────────────────────────────────────────────
check_kv_credentials_in_shipped() {
  local target_files=(
    README.md
    docs/integration-guide.md
    docs/test-case-template.md
  )

  # skill の MD も同梱対象
  if [ -d .claude/skills/devtools-testcase-author ]; then
    while IFS= read -r f; do
      target_files+=("$f")
    done < <(find .claude/skills/devtools-testcase-author -name '*.md' -type f)
  fi

  local any_hit=0
  for f in "${target_files[@]}"; do
    [ -f "$f" ] || continue

    # KV 形式 - key: value の password / pass / secret / api_key / token を抽出
    # 値が placeholder-whitelist にマッチすれば OK
    local violations
    violations=$(rg -n -P '^\s*[-*]?\s*(pass(word)?|pwd|secret|api[_-]?key|access[_-]?key|token|auth|bearer)\s*[:=]\s*(\S+)' "$f" 2>/dev/null || true)

    if [ -z "$violations" ]; then
      continue
    fi

    while IFS= read -r line; do
      [ -z "$line" ] && continue
      # line 形式: "N:  - password: VALUE"
      local lineno value
      lineno=$(echo "$line" | cut -d: -f1)
      # ":" で分割して 2 つ目以降を結合（value に : が含まれる場合の対策）
      value=$(echo "$line" | sed -E 's/^[0-9]+:[[:space:]]*[-*]?[[:space:]]*(pass(word)?|pwd|secret|api[_-]?key|access[_-]?key|token|auth|bearer)[[:space:]]*[:=][[:space:]]*//i' | sed 's/[`"'"'"']//g' | tr -d '\r' | awk '{$1=$1; print}')

      # 空 or コードブロックインライン (< や $) は許可
      [ -z "$value" ] && continue

      # placeholder-whitelist と照合
      if echo "$value" | rg -q -i -P -f "$WHITELIST_FILE"; then
        continue
      fi

      any_hit=1
      log_critical "同梱MD $f:$lineno  KV credential に実値らしきもの: '$value'"
    done <<< "$violations"
  done

  [ "$any_hit" -eq 0 ] && log_ok "0.4 同梱 MD の KV credential 検査: OK"
}

# ────────────────────────────────────────────
# 0.5 同梱ファイル全体のスキャン (git ls-files ベース)
# ────────────────────────────────────────────
check_shipped_files_tokens() {
  local files_expr
  files_expr=$(node -p "require('./package.json').files.join('\n')" 2>/dev/null || echo '')

  # dist/ と api/ を軽くスキャン
  scan_content "dist" "0.5 dist"
  scan_content "api" "0.5 api" "^api/config\.php$"
  [ -f docs/integration-guide.md ] && scan_content docs/integration-guide.md "0.5 integration-guide"
  [ -f docs/test-case-template.md ] && scan_content docs/test-case-template.md "0.5 test-case-template"
  [ -f README.md ] && scan_content README.md "0.5 README"
  [ -d .claude/skills/devtools-testcase-author ] && scan_content .claude/skills/devtools-testcase-author "0.5 skill"
}

# ────────────────────────────────────────────
# 0.6 tgz 検査 (--tgz 指定時)
# ────────────────────────────────────────────
check_tgz() {
  [ -z "$TGZ_PATH" ] && return 0
  [ ! -f "$TGZ_PATH" ] && { echo "tgz not found: $TGZ_PATH" >&2; exit 1; }

  local file_list
  file_list=$(tar -tzf "$TGZ_PATH")

  # ファイル名ベースの危険パターン
  local forbidden
  forbidden=$(echo "$file_list" | grep -iE 'environments?\.md|\.env($|\.)|config\.php$|credentials?\.json|id_rsa|\.pem$' | grep -v -E 'api/config\.example\.php$' || true)
  if [ -n "$forbidden" ]; then
    log_critical "tgz に禁止ファイルが含まれます:"
    echo "$forbidden" | sed 's/^/    /'
  fi

  # tgz を展開して中身全体をスキャン
  local extract
  extract=$(mktemp -d)
  tar -xzf "$TGZ_PATH" -C "$extract"
  if rg -q -P -f "$PATTERNS_FILE" "$extract"; then
    log_critical "tgz 内にサービストークンを検出"
    rg -P -f "$PATTERNS_FILE" "$extract" --no-heading -n 2>&1 | head -10 | sed 's/^/    /' >&2
  fi

  # tgz 内 MD の KV credential 検査
  local md_files
  md_files=$(find "$extract" -name '*.md' -type f)
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    local hits
    hits=$(rg -n -P '^\s*[-*]?\s*(pass(word)?|pwd|secret)\s*[:=]\s*(\S+)' "$f" 2>/dev/null || true)
    [ -z "$hits" ] && continue
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      local value
      value=$(echo "$line" | sed -E 's/^[0-9]+:[[:space:]]*[-*]?[[:space:]]*(pass(word)?|pwd|secret)[[:space:]]*[:=][[:space:]]*//i' | sed 's/[`"'"'"']//g' | tr -d '\r' | awk '{$1=$1; print}')
      [ -z "$value" ] && continue
      if echo "$value" | rg -q -i -P -f "$WHITELIST_FILE"; then
        continue
      fi
      log_critical "tgz $f: KV credential 実値らしきもの: '$value'"
    done <<< "$hits"
  done <<< "$md_files"

  rm -rf "$extract"
  [ "$CRITICAL_HITS" -eq 0 ] && log_ok "0.6 tgz 検査: OK"
}

# ────────────────────────────────────────────
# 0.7 直近 git 履歴スキャン
# ────────────────────────────────────────────
check_git_history() {
  local diff_file
  diff_file=$(mktemp)
  git log -p -20 -- ':!dist' ':!*.lock' ':!package-lock.json' > "$diff_file" 2>/dev/null
  if rg -q -P -f "$PATTERNS_FILE" "$diff_file"; then
    log_critical "直近 20 コミット履歴にサービストークンを検出"
    rg -P -f "$PATTERNS_FILE" "$diff_file" --no-heading | head -5 | sed 's/^/    /' >&2
  else
    log_ok "0.7 直近 git 履歴: OK"
  fi
  rm -f "$diff_file"
}

# ────────────────────────────────────────────
# メイン
# ────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "@twuw-b/dev-tools security check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_gitignore_tracked
check_forbidden_filenames
check_kv_credentials_in_shipped
check_shipped_files_tokens
check_git_history
check_tgz

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "critical: $CRITICAL_HITS, weak: $WEAK_HITS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$CRITICAL_HITS" -gt 0 ]; then
  echo "❌ publish 中止: critical ヒットを解消してから再実行してください" >&2
  exit 1
fi
if [ "$WEAK_HITS" -gt 0 ]; then
  exit 2
fi
exit 0
