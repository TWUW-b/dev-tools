#!/usr/bin/env node
/**
 * 検証ラウンド用ディレクトリを初期化
 *
 * Usage:
 *   node init-verification-round.mjs \
 *     --name round-2 \
 *     --dir docs/test-verifications \
 *     --api http://localhost:8082/api/__debug \
 *     --env dev \
 *     --frontend https://example.com \
 *     --project "My Project" \
 *     [--roles CA,GN,RO,GU]
 *     [--admin-key xxx]
 *
 * 出力:
 *   <dir>/<name>/
 *     CLAUDE.md
 *     00_plan.md
 *     01_checklist.md (fetch-test-cases.mjs を呼び出し)
 *     .verifier-config.json
 *     evidence/
 *     log/
 *     reports/
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, '..');
const TEMPLATES = join(SKILL_ROOT, 'assets', 'templates');

const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};

const NAME = getFlag('name', null);
const BASE_DIR = getFlag('dir', 'docs/test-verifications');
const API_BASE = getFlag('api', process.env.DEVTOOLS_API || 'http://localhost:8082/api/__debug');
const ENV = getFlag('env', 'dev');
const FRONTEND = getFlag('frontend', '');
const PROJECT_NAME = getFlag('project', 'Project');
const ROLES = getFlag('roles', '');
const ADMIN_KEY = getFlag('admin-key', '');

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
// check-evaluate-script.sh: evaluate_script 内の API 直叩きを物理的にブロック
const hookSrc = join(SKILL_ROOT, 'assets', 'hooks', 'check-evaluate-script.sh');
const hookDest = join(ROUND_DIR, '.claude', 'hooks', 'check-evaluate-script.sh');
if (existsSync(hookSrc)) {
  const { readFileSync, chmodSync } = await import('node:fs');
  writeFileSync(hookDest, readFileSync(hookSrc, 'utf8'));
  chmodSync(hookDest, 0o755);
  console.log(`  ✓ .claude/hooks/check-evaluate-script.sh`);
}

// ---- ラウンド用 .claude/settings.json ----
// PreToolUse hook で evaluate_script 系を gate
const settings = {
  hooks: {
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
console.log(`  ✓ .claude/settings.json (PreToolUse gate)`);

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
console.log(`  2. ${ROUND_DIR}/CLAUDE.md にプロジェクト固有の禁止事項を追記`);
console.log(`  3. Claude Code で検証を開始: 「${NAME} の検証を始めて」`);
