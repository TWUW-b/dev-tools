#!/usr/bin/env bash
# PreToolUse hook for mcp__chrome__evaluate_script (および派生ツール)
#
# 禁止: API 直叩き (fetch / XMLHttpRequest / axios / sendBeacon / $.ajax 等)
# 許可: DOM 読取・スタイル取得・window/location/document への read-only アクセス
#
# 理由: テスト検証は「UI を通した動作」を評価する活動。evaluate_script で
#       直接 API を叩くと、認可・ルーティングガード・ミドルウェアをバイパス
#       してしまい、検証の意味がなくなる。ネットワーク監視が必要な場合は
#       `list_network_requests` / `get_network_request` を使う。
#
# 入力: stdin に Claude Code が以下の JSON を渡す
#   { "tool_name": "mcp__chrome__evaluate_script",
#     "tool_input": { "function": "() => { ... }", ... } }
#
# 出力:
#   exit 0: 許可
#   exit 2: ブロック（stderr の内容が Claude に feedback される）

set -uo pipefail

INPUT=$(cat)

# jq が無ければ sed ベースで抽出
if command -v jq >/dev/null 2>&1; then
  TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
  SCRIPT=$(echo "$INPUT" | jq -r '.tool_input.function // .tool_input.script // .tool_input.code // .tool_input.expression // empty')
else
  TOOL=$(echo "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
  SCRIPT=$(echo "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); ti=d.get("tool_input",{}); print(ti.get("function") or ti.get("script") or ti.get("code") or ti.get("expression") or "")' 2>/dev/null || echo '')
fi

# evaluate_script 系でなければスルー
case "$TOOL" in
  *evaluate_script|*evaluate*|*execute_script*) ;;
  *) exit 0 ;;
esac

if [ -z "$SCRIPT" ]; then
  exit 0
fi

# 禁止パターンの検出（正規表現）
# 単語境界を意識して false positive を抑える
FORBIDDEN_PATTERNS=(
  'fetch[[:space:]]*\('                    # fetch('/api/...')
  'new[[:space:]]+XMLHttpRequest'          # new XMLHttpRequest()
  'XMLHttpRequest[[:space:]]*\('           # XMLHttpRequest の直接呼び出し
  'axios\.'                                # axios.get / axios.post 等
  'axios[[:space:]]*\('                    # axios(config)
  'navigator\.sendBeacon'                  # navigator.sendBeacon(...)
  '\$\.ajax[[:space:]]*\('                 # $.ajax({...})
  '\$\.get[[:space:]]*\('                  # $.get / $.post
  '\$\.post[[:space:]]*\('
  'request[[:space:]]*\('                  # request('/api/...')
  'got[[:space:]]*\('                      # got() (node-fetch 互換)
)

HITS=()
for pat in "${FORBIDDEN_PATTERNS[@]}"; do
  # grep は拡張正規表現で evaluate
  if echo "$SCRIPT" | grep -qE "$pat"; then
    HITS+=("$pat")
  fi
done

if [ ${#HITS[@]} -eq 0 ]; then
  exit 0
fi

# ブロック: stderr に理由を出力
{
  echo "❌ G6 違反: evaluate_script 内で API 直叩きが検出されました"
  echo ""
  echo "検出されたパターン:"
  for h in "${HITS[@]}"; do
    echo "  - ${h}"
  done
  echo ""
  echo "【禁止される理由】"
  echo "テスト検証は UI を通した動作を評価する活動です。evaluate_script で"
  echo "直接 fetch / XHR / axios 等を呼び出すと、認可・ガード・ミドルウェアを"
  echo "バイパスするため、検証結果が無効になります。"
  echo ""
  echo "【代替手段】"
  echo "1. UI 操作で同じ結果を得る (click / fill / wait_for)"
  echo "2. ネットワーク監視: mcp__chrome__list_network_requests / get_network_request"
  echo "3. DOM 読取のみ: document.querySelector(...).textContent など"
  echo "4. どうしても API レスポンスが必要な場合は、人間に操作を委ねて OTHER 記録"
  echo ""
  echo "このツール呼び出しをブロックします。スクリプトから上記の禁止パターンを"
  echo "除去して再試行してください。"
} >&2

exit 2
