#!/usr/bin/env bash
# SessionStart hook for devtools-testcase-verifier
#
# セッション開始・resume 時に以下を stdout に出力し、Claude の初期 context に注入する:
#  1. CLAUDE.md（ラウンド行動ルール、50行程度）
#  2. 01_checklist.md の進捗サマリ表のみ（全行ではない）
#  3. 最新の interim log（ある場合）
#  4. 再読込が必要な references ファイルのパス
#
# context 圧縮後に「前のステップで削除したはず」のような記憶劣化を防ぐ。

set -uo pipefail

# Claude Code は hook 実行時に cwd をプロジェクトルートにする
# round-dir 配下で起動された場合のみ有効
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"

# round-dir マーカーの存在確認（.verifier-config.json があればラウンドディレクトリ）
if [ ! -f "${ROOT}/.verifier-config.json" ]; then
  exit 0
fi

cat <<'BANNER'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 devtools-testcase-verifier: ラウンド復帰
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANNER

# 1. CLAUDE.md
if [ -f "${ROOT}/CLAUDE.md" ]; then
  echo ""
  echo "=== CLAUDE.md (行動ルール) ==="
  cat "${ROOT}/CLAUDE.md"
fi

# 2. 01_checklist.md のサマリ表のみ抽出
if [ -f "${ROOT}/01_checklist.md" ]; then
  echo ""
  echo "=== 現在の進捗サマリ ==="
  awk '/<!-- SUMMARY:BEGIN -->/,/<!-- SUMMARY:END -->/' "${ROOT}/01_checklist.md"
fi

# 3. 最新の interim log
if [ -d "${ROOT}/log" ]; then
  LATEST=$(ls -t "${ROOT}/log"/*.md 2>/dev/null | head -1)
  if [ -n "$LATEST" ]; then
    echo ""
    echo "=== 直近 log: $(basename "$LATEST") ==="
    head -40 "$LATEST"
  fi
fi

# 4. references への参照指示
cat <<'FOOTER'

=== 必要時に参照 ===
  - bucket-definitions.md (判定ルール)
  - chrome-mcp-guidelines.md (G1〜G10)
  - anti-patterns.md (禁止事項)
  → .claude/skills/devtools-testcase-verifier/references/ 配下

=== 必須ワークフロー ===
  1. 各ケース開始時に TaskCreate
  2. Chrome MCP で実行（G1〜G10 遵守、evaluate_script の fetch/XHR は hook で物理ブロック）
  3. evidence 保存
  4. update-checklist.mjs でバケット反映
  5. TaskUpdate で完了化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOOTER

exit 0
