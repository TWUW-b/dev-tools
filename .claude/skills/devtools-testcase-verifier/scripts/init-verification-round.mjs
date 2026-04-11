#!/usr/bin/env node
/**
 * 検証ラウンド用ディレクトリを初期化
 *
 * Usage:
 *   # 非対話 (明示引数)
 *   node init-verification-round.mjs \
 *     --name round-2 --api http://localhost:8082/api/__debug \
 *     --env dev --frontend https://example.com --project "My Project" \
 *     [--dir docs/test-verifications] [--roles CA,GN] [--admin-key xxx]
 *
 *   # 対話モード (未指定の引数のみ prompt で確認)
 *   node init-verification-round.mjs --interactive [--name round-2]
 *
 * 自動推測:
 *   - project: package.json の "name" から取得
 *   - roles: docs/test-cases/*.md の frontmatter role_code から抽出
 *
 * 出力:
 *   <dir>/<name>/
 *     CLAUDE.md / 00_plan.md / 01_checklist.md / .verifier-config.json
 *     .claude/settings.json / .claude/hooks/*
 *     evidence/ log/ reports/
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, '..');
const TEMPLATES = join(SKILL_ROOT, 'assets', 'templates');

const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};
const INTERACTIVE = args.includes('--interactive') || args.includes('-i');

// ---- 自動推測ユーティリティ ----
function detectProjectName() {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    return pkg.name?.replace(/^@[^/]+\//, '') || null;
  } catch { return null; }
}

function detectRoles() {
  const tcDir = 'docs/test-cases';
  if (!existsSync(tcDir)) return [];
  const roles = new Set();
  try {
    for (const f of readdirSync(tcDir)) {
      if (!f.endsWith('.md') || /readme/i.test(f)) continue;
      const content = readFileSync(join(tcDir, f), 'utf8');
      const m = content.match(/^---\n([\s\S]*?)\n---/);
      if (!m) continue;
      const rc = m[1].match(/^role_code:\s*([A-Z][A-Z0-9]{1,5})/m);
      if (rc) roles.add(rc[1]);
    }
  } catch {}
  return Array.from(roles);
}

function detectNextRoundName() {
  const base = 'docs/test-verifications';
  if (!existsSync(base)) return 'round-1';
  try {
    const existing = readdirSync(base)
      .filter(f => /^round-\d+$/.test(f))
      .map(f => parseInt(f.slice(6), 10))
      .sort((a, b) => a - b);
    const next = existing.length ? existing[existing.length - 1] + 1 : 1;
    return `round-${next}`;
  } catch { return 'round-1'; }
}

// ---- 対話プロンプト ----
async function prompt(rl, question, def) {
  const hint = def ? ` [${def}]` : '';
  const answer = await rl.question(`? ${question}${hint}: `);
  return answer.trim() || def || '';
}

const detected = {
  project: detectProjectName(),
  roles: detectRoles(),
  name: detectNextRoundName(),
};

let NAME = getFlag('name', null);
let BASE_DIR = getFlag('dir', 'docs/test-verifications');
let API_BASE = getFlag('api', process.env.DEVTOOLS_API || '');
let ENV = getFlag('env', '');
let FRONTEND = getFlag('frontend', '');
let PROJECT_NAME = getFlag('project', '');
let ROLES = getFlag('roles', '');
let ADMIN_KEY = getFlag('admin-key', '');

// 対話モード: 未指定の引数を prompt
if (INTERACTIVE) {
  const rl = createInterface({ input: stdin, output: stdout });
  console.log('━━━ 検証ラウンド初期化 (対話モード) ━━━');
  console.log(`自動推測: project=${detected.project || '?'} / roles=${detected.roles.join(',') || '?'} / next=${detected.name}`);
  console.log('');
  NAME = NAME || await prompt(rl, 'ラウンド名', detected.name);
  PROJECT_NAME = PROJECT_NAME || await prompt(rl, 'プロジェクト名', detected.project || 'Project');
  API_BASE = API_BASE || await prompt(rl, 'dev-tools API base URL', 'http://localhost:8082/api/__debug');
  ENV = ENV || await prompt(rl, '環境 (dev/staging/prod)', 'dev');
  FRONTEND = FRONTEND || await prompt(rl, 'Frontend URL', '');
  ROLES = ROLES || await prompt(rl, `対象 role_code (カンマ区切り, 空=全部)`, detected.roles.join(','));
  rl.close();
} else {
  // 非対話: 未指定は自動推測で埋める
  NAME = NAME || detected.name;
  PROJECT_NAME = PROJECT_NAME || detected.project || 'Project';
  API_BASE = API_BASE || 'http://localhost:8082/api/__debug';
  ENV = ENV || 'dev';
  ROLES = ROLES || detected.roles.join(',');
}

if (!NAME) {
  console.error('Usage: node init-verification-round.mjs --name <round-N> --api <url> --env <env> [--dir <base>] [--frontend <url>] [--project <name>] [--roles CA,GN]');
  process.exit(1);
}

const ROUND_DIR = join(BASE_DIR, NAME);
const createdAt = new Date().toISOString().slice(0, 10);

if (existsSync(ROUND_DIR)) {
  console.error(`[ERR] already exists: ${ROUND_DIR}`);
  console.error('  既存ラウンドに追記したい場合は update-checklist.mjs または fetch-test-cases.mjs を直接使ってください');
  process.exit(1);
}

// ---- ディレクトリ作成 ----
console.log(`📁 creating ${ROUND_DIR}`);
mkdirSync(join(ROUND_DIR, 'evidence'), { recursive: true });
mkdirSync(join(ROUND_DIR, 'log'), { recursive: true });
mkdirSync(join(ROUND_DIR, 'reports'), { recursive: true });
mkdirSync(join(ROUND_DIR, '.claude', 'hooks'), { recursive: true });

// ---- hook スクリプトのコピー ----
const HOOK_FILES = [
  'check-evaluate-script.sh',   // G6: evaluate_script 内の API 直叩きを物理ブロック
  'session-start.sh',            // SessionStart: CLAUDE.md + 進捗サマリ + 最新 log を注入
];
for (const hookName of HOOK_FILES) {
  const src = join(SKILL_ROOT, 'assets', 'hooks', hookName);
  const dest = join(ROUND_DIR, '.claude', 'hooks', hookName);
  if (!existsSync(src)) continue;
  writeFileSync(dest, readFileSync(src, 'utf8'));
  chmodSync(dest, 0o755);
  console.log(`  ✓ .claude/hooks/${hookName}`);
}

// ---- ラウンド用 .claude/settings.json ----
// A-1: permissions を明示（allow / ask / deny）
// A-2: SessionStart + PreToolUse hook を登録
const settings = {
  permissions: {
    // 読み取り系・UI 操作系は allow
    allow: [
      'mcp__chrome__click',
      'mcp__chrome__fill',
      'mcp__chrome__fill_form',
      'mcp__chrome__wait_for',
      'mcp__chrome__take_screenshot',
      'mcp__chrome__take_snapshot',
      'mcp__chrome__handle_dialog',
      'mcp__chrome__select_page',
      'mcp__chrome__new_page',
      'mcp__chrome__close_page',
      'mcp__chrome__list_pages',
      'mcp__chrome__list_console_messages',
      'mcp__chrome__press_key',
      'mcp__chrome__type_text',
      'mcp__chrome__navigate_page',          // 捏造 URL は別途運用ルールで抑制
      'mcp__chrome__upload_file',
      'mcp__chrome__list_network_requests',  // API レスポンス監視の正規ルート
      'mcp__chrome__get_network_request',
      // 通常ファイル操作
      'Read',
      'Grep',
      'Glob',
      'TaskCreate',
      'TaskUpdate',
    ],
    // 都度承認
    ask: [
      'mcp__chrome__evaluate_script',        // hook で内容も検査
      'Write',                                // evidence/log 等への書込みは承認制
      'Edit',
      'Bash',
    ],
    // 禁止
    deny: [
      'Bash(rm -rf *)',
      'Bash(git push --force*)',
      'Bash(git reset --hard*)',
      'WebFetch',
    ],
  },
  hooks: {
    // SessionStart: 復帰時に CLAUDE.md と進捗を注入
    SessionStart: [
      {
        hooks: [
          {
            type: 'command',
            command: '${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.sh',
          },
        ],
      },
    ],
    // PreToolUse: evaluate_script 内の API 直叩きを物理ブロック
    PreToolUse: [
      {
        matcher: 'mcp__chrome__evaluate_script',
        hooks: [
          {
            type: 'command',
            command: '${CLAUDE_PROJECT_DIR}/.claude/hooks/check-evaluate-script.sh',
          },
        ],
      },
    ],
  },
};
writeFileSync(join(ROUND_DIR, '.claude', 'settings.json'), JSON.stringify(settings, null, 2));
console.log(`  ✓ .claude/settings.json (permissions + hooks)`);

// ---- .verifier-config.json ----
const config = {
  roundName: NAME,
  projectName: PROJECT_NAME,
  apiBaseUrl: API_BASE,
  env: ENV,
  frontendUrl: FRONTEND,
  adminKey: ADMIN_KEY || null,
  roles: ROLES ? ROLES.split(',').map(s => s.trim()).filter(Boolean) : [],
  syncNotes: false,
  createdAt,
};
writeFileSync(join(ROUND_DIR, '.verifier-config.json'), JSON.stringify(config, null, 2));

// ---- テンプレから展開 ----
function expand(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

const commonVars = {
  roundName: NAME,
  projectName: PROJECT_NAME,
  targetProject: PROJECT_NAME,
  createdAt,
  apiBaseUrl: API_BASE,
  env: ENV,
  frontendUrl: FRONTEND,
  envName: ENV,
  devtoolsAdminUrl: `${FRONTEND.replace(/\/$/, '')}/__admin`,
  roundDir: ROUND_DIR,
  skillPath: '.claude/skills/devtools-testcase-verifier',
  testCasesDir: 'docs/test-cases/',
  customAntiPatterns: '（必要に応じて追記）',
  accountsTable: '| ID | メール | 役割 |\n|---|---|---|\n| (未設定) | | |',
  rolesTable: ROLES
    ? ROLES.split(',').map(r => `| ${r.trim()} | - | - |`).join('\n')
    : '| - | - | - |',
  purpose: '（このラウンドの目的を記載）',
  previousRoundNotes: '（該当なし）',
  scope: '（対象スコープを記載）',
  phaseStepTable: '（Phase-Step 構成を記載）',
  exclusions: '（除外事項を記載）',
  blockerAnalysis: '（ブロッカー分析を記載）',
  knownBlockers: '（既知のブロッカーを記載）',
  dataRequirements: '（必要リソース一覧）',
  humanRequiredItems: '（人間操作が必要な項目）',
};

// CLAUDE.md
const claudeTemplate = readFileSync(join(TEMPLATES, 'CLAUDE.md'), 'utf8');
writeFileSync(join(ROUND_DIR, 'CLAUDE.md'), expand(claudeTemplate, commonVars));
console.log(`  ✓ CLAUDE.md`);

// 00_plan.md
const planTemplate = readFileSync(join(TEMPLATES, '00_plan.md'), 'utf8');
writeFileSync(join(ROUND_DIR, '00_plan.md'), expand(planTemplate, commonVars));
console.log(`  ✓ 00_plan.md`);

// 01_checklist.md: fetch-test-cases.mjs を呼び出し
const fetchScript = join(__dirname, 'fetch-test-cases.mjs');
const checklistPath = join(ROUND_DIR, '01_checklist.md');
const fetchArgs = [
  `--api=${API_BASE}`,
  `--env=${ENV}`,
  `--out=${checklistPath}`,
  `--round-name=${NAME}`,
  `--project-name=${PROJECT_NAME}`,
];
if (ROLES) fetchArgs.push(`--roles=${ROLES}`);
if (ADMIN_KEY) fetchArgs.push(`--admin-key=${ADMIN_KEY}`);

try {
  execSync(`node "${fetchScript}" ${fetchArgs.join(' ')}`, { stdio: 'inherit' });
} catch (e) {
  console.warn(`[warn] fetch-test-cases.mjs failed: ${e.message}`);
  console.warn('  01_checklist.md は空の状態で作成されました。後で fetch-test-cases.mjs を手動実行してください');
  writeFileSync(checklistPath, `# ${PROJECT_NAME} テストケース検証項目リスト — ${NAME}\n\n(未生成)\n`);
}

console.log('');
console.log(`✅ initialized: ${ROUND_DIR}`);
console.log('');
console.log('次のステップ:');
console.log(`  1. ${ROUND_DIR}/00_plan.md を編集して Phase 構成・スコープを記載`);
console.log(`  2. ${ROUND_DIR}/CLAUDE.md にプロジェクト固有の禁止事項を追記（保護対象アカウント等）`);
console.log(`  3. cd ${ROUND_DIR} && claude   ← SessionStart hook が行動ルールを自動注入`);
console.log(`     または現セッションで続行する場合:「${NAME} の検証を始めて」`);
