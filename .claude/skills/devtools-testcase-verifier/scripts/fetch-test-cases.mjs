#!/usr/bin/env node
/**
 * dev-tools API から TC を取得して 01_checklist.md を生成
 *
 * Usage:
 *   node fetch-test-cases.mjs \
 *     --api http://localhost:8082/api/__debug \
 *     --env dev \
 *     --roles CA,GN,RO,GU \
 *     --out docs/test-verifications/round-2/01_checklist.md \
 *     [--admin-key xxx]
 *     [--round-name round-2]
 *     [--project-name "My Project"]
 *
 * 既存の 01_checklist.md がある場合は bucket 判定を保持したままマージ。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};

const API_BASE = getFlag('api', process.env.DEVTOOLS_API || 'http://localhost:8082/api/__debug');
const ENV = getFlag('env', 'dev');
const ROLES = getFlag('roles', '').split(',').map(s => s.trim()).filter(Boolean);
const OUT = getFlag('out', null);
const ADMIN_KEY = getFlag('admin-key', null);
const ROUND_NAME = getFlag('round-name', 'round-1');
const PROJECT_NAME = getFlag('project-name', 'Project');

if (!OUT) {
  console.error('Usage: node fetch-test-cases.mjs --api <url> --env <env> --out <path> [--roles CA,GN]');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json' };
if (ADMIN_KEY) headers['X-Admin-Key'] = ADMIN_KEY;

async function jfetch(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

// ---- fetch test cases ----
console.log(`📥 fetching TC from ${API_BASE}/test-cases?env=${ENV}`);
const resp = await jfetch(`${API_BASE}/test-cases?env=${ENV}`);
const allCases = (resp.data || resp.cases || []).filter(c => !c.archived_at && !c.archivedAt);

// role_code でフィルタ (ROLES が空なら全件)
const filtered = ROLES.length === 0
  ? allCases
  : allCases.filter(c => {
      if (!c.case_key) return false;
      return ROLES.some(r => c.case_key.startsWith(`TC-${r}-`));
    });

if (filtered.length === 0) {
  console.error(`[ERR] no cases matched. total=${allCases.length}, roles=${ROLES.join(',') || 'all'}`);
  process.exit(2);
}

console.log(`📄 ${filtered.length} cases matched`);

// ---- 既存 checklist の bucket を読み込み（マージ用）----
const existingBuckets = new Map();
if (existsSync(OUT)) {
  const content = readFileSync(OUT, 'utf8');
  // `| TC-XX-NNN | title | ✅ OK — note |` 形式を parse
  const rowRe = /^\|\s*(TC-[A-Z0-9]+-\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/gm;
  let m;
  while ((m = rowRe.exec(content)) !== null) {
    const caseKey = m[1];
    const bucket = m[3].trim();
    if (bucket && bucket !== '未実施') {
      existingBuckets.set(caseKey, bucket);
    }
  }
  console.log(`🔄 merged ${existingBuckets.size} existing bucket judgments`);
}

// ---- role_code でグルーピング ----
const byRole = new Map(); // role_code → { domain, byCapability: Map<capName, cases[]> }
for (const c of filtered) {
  const key = c.case_key || '';
  const roleMatch = key.match(/^TC-([A-Z0-9]+)-/);
  const roleCode = roleMatch ? roleMatch[1] : 'UNKNOWN';
  if (!byRole.has(roleCode)) {
    byRole.set(roleCode, { domain: c.domain || roleCode, byCapability: new Map() });
  }
  const role = byRole.get(roleCode);
  if (!role.byCapability.has(c.capability)) {
    role.byCapability.set(c.capability, []);
  }
  role.byCapability.get(c.capability).push(c);
}

// ---- checklist セクション生成 ----
const sections = [];
const summaryRows = [];
let phaseNum = 1;

for (const [roleCode, role] of byRole) {
  const roleCases = Array.from(role.byCapability.values()).flat();
  const total = roleCases.length;
  const unchecked = roleCases.filter(c => !existingBuckets.has(c.case_key)).length;
  const counts = {
    '✅ OK': 0, '🔧 TC_WRONG': 0, '🐛 IMPL_BUG': 0, '❓ OTHER': 0, '⏸ SKIP': 0,
  };
  for (const c of roleCases) {
    const b = existingBuckets.get(c.case_key);
    if (!b) continue;
    // bucket 文字列の先頭絵文字でキー判定
    const key = Object.keys(counts).find(k => b.startsWith(k.split(' ')[0]));
    if (key) counts[key]++;
  }

  summaryRows.push(
    `| ${roleCode} | ${role.domain} | ${total} | ${unchecked} | ${counts['✅ OK']} | ${counts['🔧 TC_WRONG']} | ${counts['🐛 IMPL_BUG']} | ${counts['❓ OTHER']} | ${counts['⏸ SKIP']} |`,
  );

  sections.push(`## Phase ${phaseNum}: ${roleCode} (${role.domain})`);
  sections.push('');
  for (const [capName, cases] of role.byCapability) {
    sections.push(`### ${capName} (${cases.length})`);
    sections.push('');
    sections.push('| TC ID | title | bucket |');
    sections.push('|---|---|---|');
    for (const c of cases) {
      const bucket = existingBuckets.get(c.case_key) || '未実施';
      sections.push(`| ${c.case_key} | ${c.title} | ${bucket} |`);
    }
    sections.push('');
  }
  phaseNum++;
}

// 合計行
const totalCount = filtered.length;
const totalUnchecked = totalCount - existingBuckets.size;
const totalCounts = { '✅ OK': 0, '🔧 TC_WRONG': 0, '🐛 IMPL_BUG': 0, '❓ OTHER': 0, '⏸ SKIP': 0 };
for (const b of existingBuckets.values()) {
  const key = Object.keys(totalCounts).find(k => b.startsWith(k.split(' ')[0]));
  if (key) totalCounts[key]++;
}
summaryRows.push(`| | **合計** | **${totalCount}** | **${totalUnchecked}** | **${totalCounts['✅ OK']}** | **${totalCounts['🔧 TC_WRONG']}** | **${totalCounts['🐛 IMPL_BUG']}** | **${totalCounts['❓ OTHER']}** | **${totalCounts['⏸ SKIP']}** |`);

// ---- テンプレ埋め込み ----
const template = `# ${PROJECT_NAME} テストケース検証項目リスト — ${ROUND_NAME}

**生成元**: \`${API_BASE}/test-cases?env=${ENV}\`
**生成日**: ${new Date().toISOString().slice(0, 10)}
**全ケース数**: ${totalCount}

## 進捗サマリ（update-checklist.mjs で自動更新）

<!-- SUMMARY:BEGIN -->
| role_code | 対象 | 全 | 未実施 | ✅ OK | 🔧 TC_WRONG | 🐛 IMPL_BUG | ❓ OTHER | ⏸ SKIP |
|---|---|---|---|---|---|---|---|---|
${summaryRows.join('\n')}
<!-- SUMMARY:END -->

---

${sections.join('\n')}
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, template);
console.log(`✅ wrote ${OUT}`);
