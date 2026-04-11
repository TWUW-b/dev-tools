#!/usr/bin/env node
/**
 * 01_checklist.md を parse して reports/ を生成
 *
 * Usage:
 *   node generate-reports.mjs --round-dir docs/test-verifications/round-2
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = join(__dirname, '..', 'assets', 'templates');

const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};

const ROUND_DIR = getFlag('round-dir', null);
if (!ROUND_DIR) {
  console.error('Usage: node generate-reports.mjs --round-dir <path>');
  process.exit(1);
}

const checklistPath = join(ROUND_DIR, '01_checklist.md');
const configPath = join(ROUND_DIR, '.verifier-config.json');

if (!existsSync(checklistPath)) {
  console.error(`[ERR] not found: ${checklistPath}`);
  process.exit(1);
}

const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, 'utf8'))
  : {};

const content = readFileSync(checklistPath, 'utf8');

// ---- checklist を parse ----
// 構造: Phase セクション → capability サブセクション → ケース行
const lines = content.split('\n');
const rolesMap = new Map(); // roleCode → { domain, capabilities: Map<name, cases[]> }
let currentRoleCode = null;
let currentDomain = null;
let currentCapability = null;

for (const line of lines) {
  const phaseMatch = line.match(/^##\s+Phase\s+\d+:\s+([A-Z0-9]+)(?:\s+\((.+?)\))?/);
  if (phaseMatch) {
    currentRoleCode = phaseMatch[1];
    currentDomain = phaseMatch[2] || currentRoleCode;
    if (!rolesMap.has(currentRoleCode)) {
      rolesMap.set(currentRoleCode, { domain: currentDomain, capabilities: new Map() });
    }
    continue;
  }
  const capMatch = line.match(/^###\s+(.+?)(?:\s+\(\d+\))?$/);
  if (capMatch && currentRoleCode) {
    currentCapability = capMatch[1].trim();
    const role = rolesMap.get(currentRoleCode);
    if (!role.capabilities.has(currentCapability)) {
      role.capabilities.set(currentCapability, []);
    }
    continue;
  }
  const caseMatch = line.match(/^\|\s*(TC-[A-Z0-9]+-\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
  if (caseMatch && currentRoleCode && currentCapability) {
    const [, caseKey, title, bucket] = caseMatch;
    const role = rolesMap.get(currentRoleCode);
    role.capabilities.get(currentCapability).push({ caseKey, title, bucket: bucket.trim() });
  }
}

// ---- バケット分類 ----
function classifyBucket(bucketText) {
  if (bucketText.startsWith('✅')) return 'OK';
  if (bucketText.startsWith('🔧')) return 'TC_WRONG';
  if (bucketText.startsWith('🐛')) return 'IMPL_BUG';
  if (bucketText.startsWith('❓')) return 'OTHER';
  if (bucketText.startsWith('⏸')) return 'SKIP';
  return 'UNCHECKED';
}

function expand(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ---- ロール別レポート生成 ----
const roleReportTemplate = readFileSync(join(TEMPLATES, 'report-role.md'), 'utf8');
const roleReports = [];
let idx = 1;

const totalCounts = { OK: 0, TC_WRONG: 0, IMPL_BUG: 0, OTHER: 0, SKIP: 0, UNCHECKED: 0 };

for (const [roleCode, role] of rolesMap) {
  const allCases = Array.from(role.capabilities.values()).flat();
  const counts = { OK: 0, TC_WRONG: 0, IMPL_BUG: 0, OTHER: 0, SKIP: 0, UNCHECKED: 0 };
  for (const c of allCases) counts[classifyBucket(c.bucket)]++;

  const total = allCases.length;
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

  for (const k of Object.keys(totalCounts)) totalCounts[k] += counts[k];

  // capability 別内訳
  const capRows = ['| capability | 全 | ✅ | 🔧 | 🐛 | ❓ | ⏸ |', '|---|---|---|---|---|---|---|'];
  for (const [capName, cases] of role.capabilities) {
    const cc = { OK: 0, TC_WRONG: 0, IMPL_BUG: 0, OTHER: 0, SKIP: 0 };
    for (const c of cases) {
      const k = classifyBucket(c.bucket);
      if (k in cc) cc[k]++;
    }
    capRows.push(`| ${capName} | ${cases.length} | ${cc.OK} | ${cc.TC_WRONG} | ${cc.IMPL_BUG} | ${cc.OTHER} | ${cc.SKIP} |`);
  }

  // 全ケース行
  const caseRows = ['| TC ID | bucket | 備考 |', '|---|---|---|'];
  for (const c of allCases) {
    const [mark, ...noteParts] = c.bucket.split('—');
    const note = noteParts.join('—').trim().replace(/\s*\[evidence:.*?\]\s*/g, '').trim();
    caseRows.push(`| ${c.caseKey} | ${mark.trim().charAt(0)} | ${note} |`);
  }

  // 詳細抽出
  const implBugs = allCases.filter(c => classifyBucket(c.bucket) === 'IMPL_BUG');
  const tcWrongs = allCases.filter(c => classifyBucket(c.bucket) === 'TC_WRONG');
  const others = allCases.filter(c => classifyBucket(c.bucket) === 'OTHER');

  const detailBlock = (cases) => cases.length === 0
    ? '(該当なし)'
    : cases.map(c => `- **${c.caseKey}** — ${c.title}\n  - ${c.bucket.replace(/^[^—]+—\s*/, '')}`).join('\n');

  const roleName = {
    CA: '企業管理者', GN: '一般ユーザー', RO: '閲覧ユーザー', GU: 'ゲスト',
    AD: '管理者', AP: 'アプリ運用者', US: 'ユーザー', CL: 'クライアント',
    AC: 'アクセス制御',
  }[roleCode] || roleCode;

  const vars = {
    roleLabel: `${roleCode} ${roleName}`,
    roundName: config.roundName || '(unknown)',
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifier: '(未記載)',
    targetProject: config.projectName || '(unknown)',
    totalCount: total,
    okCount: counts.OK, okPercent: pct(counts.OK),
    tcWrongCount: counts.TC_WRONG, tcWrongPercent: pct(counts.TC_WRONG),
    implBugCount: counts.IMPL_BUG, implBugPercent: pct(counts.IMPL_BUG),
    otherCount: counts.OTHER, otherPercent: pct(counts.OTHER),
    skipCount: counts.SKIP, skipPercent: pct(counts.SKIP),
    capabilityTable: capRows.join('\n'),
    caseRows: caseRows.join('\n'),
    implBugDetails: detailBlock(implBugs),
    tcWrongDetails: detailBlock(tcWrongs),
    otherDetails: detailBlock(others),
  };

  const paddedIdx = String(idx).padStart(2, '0');
  const fileName = `${paddedIdx}-${roleCode.toLowerCase()}.md`;
  const out = expand(roleReportTemplate, vars);
  writeFileSync(join(ROUND_DIR, 'reports', fileName), out);
  roleReports.push({ fileName, roleCode, roleName });
  console.log(`  ✓ reports/${fileName}`);
  idx++;
}

// ---- サマリレポート生成 ----
const summaryTemplate = readFileSync(join(TEMPLATES, 'report-summary.md'), 'utf8');
const totalAll = Object.values(totalCounts).reduce((a, b) => a + b, 0);
const pctT = (n) => totalAll > 0 ? Math.round((n / totalAll) * 100) : 0;

const roleBreakdown = ['| role_code | 対象 | 全 | ✅ | 🔧 | 🐛 | ❓ | ⏸ |', '|---|---|---|---|---|---|---|---|'];
for (const [roleCode, role] of rolesMap) {
  const all = Array.from(role.capabilities.values()).flat();
  const cc = { OK: 0, TC_WRONG: 0, IMPL_BUG: 0, OTHER: 0, SKIP: 0 };
  for (const c of all) {
    const k = classifyBucket(c.bucket);
    if (k in cc) cc[k]++;
  }
  roleBreakdown.push(`| ${roleCode} | ${role.domain} | ${all.length} | ${cc.OK} | ${cc.TC_WRONG} | ${cc.IMPL_BUG} | ${cc.OTHER} | ${cc.SKIP} |`);
}

const allCases = Array.from(rolesMap.values()).flatMap(r => Array.from(r.capabilities.values()).flat());
const allImplBugs = allCases.filter(c => classifyBucket(c.bucket) === 'IMPL_BUG');
const allTcWrongs = allCases.filter(c => classifyBucket(c.bucket) === 'TC_WRONG');
const allOthers = allCases.filter(c => classifyBucket(c.bucket) === 'OTHER');

const listBlock = (cases) => cases.length === 0
  ? '(該当なし)'
  : cases.map(c => `- **${c.caseKey}**: ${c.title}`).join('\n');

// OTHER 分類
const otherTagCounts = {};
for (const c of allOthers) {
  const tagMatch = c.bucket.match(/\[([A-Z-]+)\]/);
  const tag = tagMatch ? tagMatch[1] : 'UNTAGGED';
  otherTagCounts[tag] = (otherTagCounts[tag] || 0) + 1;
}
const otherClassification = Object.entries(otherTagCounts).length === 0
  ? '(該当なし)'
  : Object.entries(otherTagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `- \`[${tag}]\`: ${n} 件`).join('\n');

const summaryVars = {
  roundName: config.roundName || '(unknown)',
  verifiedAt: new Date().toISOString().slice(0, 10),
  envName: config.env || 'dev',
  frontendUrl: config.frontendUrl || '(未設定)',
  targetProject: config.projectName || '(unknown)',
  scope: '(00_plan.md を参照)',
  okCount: totalCounts.OK, okPercent: pctT(totalCounts.OK),
  tcWrongCount: totalCounts.TC_WRONG, tcWrongPercent: pctT(totalCounts.TC_WRONG),
  implBugCount: totalCounts.IMPL_BUG, implBugPercent: pctT(totalCounts.IMPL_BUG),
  otherCount: totalCounts.OTHER, otherPercent: pctT(totalCounts.OTHER),
  skipCount: totalCounts.SKIP, skipPercent: pctT(totalCounts.SKIP),
  totalCount: totalAll,
  roleBreakdown: roleBreakdown.join('\n'),
  implBugList: listBlock(allImplBugs),
  tcWrongList: listBlock(allTcWrongs),
  otherClassification,
  recommendations: '(次回ラウンドへの推奨事項を記載)',
  roleReportLinks: roleReports.map(r => `- [${r.roleCode} ${r.roleName}](./${r.fileName})`).join('\n'),
};

const summaryOut = expand(summaryTemplate, summaryVars);
writeFileSync(join(ROUND_DIR, 'reports', '99_final-summary.md'), summaryOut);
console.log(`  ✓ reports/99_final-summary.md`);
console.log('');
console.log(`✅ ${roleReports.length} role reports + summary generated`);
console.log(`📊 OK=${totalCounts.OK} / 🔧=${totalCounts.TC_WRONG} / 🐛=${totalCounts.IMPL_BUG} / ❓=${totalCounts.OTHER} / ⏸=${totalCounts.SKIP}`);
