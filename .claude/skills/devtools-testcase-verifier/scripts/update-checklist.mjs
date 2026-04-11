#!/usr/bin/env node
/**
 * 01_checklist.md の該当 TC 行を更新 + 進捗サマリを再計算
 *
 * Usage:
 *   node update-checklist.mjs \
 *     --round-dir docs/test-verifications/round-2 \
 *     --case TC-CA-032 \
 *     --bucket OK \
 *     [--note '招待送信成功'] \
 *     [--evidence TC-CA-032_invite.png]
 *
 * bucket は以下のいずれか:
 *   OK / TC_WRONG / IMPL_BUG / OTHER / SKIP
 *
 * 絵文字付きの表示文字列に自動変換される:
 *   OK       → ✅ OK
 *   TC_WRONG → 🔧 TC_WRONG
 *   IMPL_BUG → 🐛 IMPL_BUG
 *   OTHER    → ❓ OTHER
 *   SKIP     → ⏸ SKIP
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};

const ROUND_DIR = getFlag('round-dir', null);
const CASE_ID = getFlag('case', null);
const BUCKET_KEY = getFlag('bucket', null);
const NOTE = getFlag('note', '');
const EVIDENCE = getFlag('evidence', '');

if (!ROUND_DIR || !CASE_ID || !BUCKET_KEY) {
  console.error('Usage: node update-checklist.mjs --round-dir <path> --case <TC-ID> --bucket <key>');
  console.error('  bucket key: OK / TC_WRONG / IMPL_BUG / OTHER / SKIP');
  process.exit(1);
}

const BUCKET_MAP = {
  OK: '✅ OK',
  TC_WRONG: '🔧 TC_WRONG',
  IMPL_BUG: '🐛 IMPL_BUG',
  OTHER: '❓ OTHER',
  SKIP: '⏸ SKIP',
};
const bucketDisplay = BUCKET_MAP[BUCKET_KEY.toUpperCase()];
if (!bucketDisplay) {
  console.error(`[ERR] invalid bucket key: ${BUCKET_KEY}`);
  console.error(`  valid: ${Object.keys(BUCKET_MAP).join(' / ')}`);
  process.exit(1);
}

const checklistPath = join(ROUND_DIR, '01_checklist.md');
if (!existsSync(checklistPath)) {
  console.error(`[ERR] not found: ${checklistPath}`);
  process.exit(1);
}

let content = readFileSync(checklistPath, 'utf8');

// ---- 該当行を更新 ----
// `| TC-XX-NNN | title | old-bucket |` 形式
const rowRe = new RegExp(`^(\\|\\s*${CASE_ID}\\s*\\|\\s*[^|]+?\\s*\\|)\\s*[^|]*?\\s*(\\|)$`, 'm');
if (!rowRe.test(content)) {
  console.error(`[ERR] case_key not found in checklist: ${CASE_ID}`);
  process.exit(1);
}

// bucket + note + evidence を組み立て
let bucketCell = bucketDisplay;
if (NOTE) bucketCell += ` — ${NOTE.replace(/\|/g, '\\|')}`;
if (EVIDENCE) bucketCell += ` [evidence: ${EVIDENCE}]`;

content = content.replace(rowRe, (_, pre, post) => `${pre} ${bucketCell} ${post}`);

// ---- 進捗サマリを再計算 ----
// <!-- SUMMARY:BEGIN --> から <!-- SUMMARY:END --> の間を書き換え
const summaryRe = /<!-- SUMMARY:BEGIN -->([\s\S]*?)<!-- SUMMARY:END -->/;

// 全 TC 行を parse
const allRowsRe = /^\|\s*(TC-([A-Z0-9]+)-\d+)\s*\|\s*.+?\s*\|\s*(.+?)\s*\|$/gm;
const rows = [];
let m;
while ((m = allRowsRe.exec(content)) !== null) {
  rows.push({ caseKey: m[1], roleCode: m[2], bucket: m[3].trim() });
}

// role_code ごとに集計
const byRole = new Map();
const BUCKETS = ['✅ OK', '🔧 TC_WRONG', '🐛 IMPL_BUG', '❓ OTHER', '⏸ SKIP'];

for (const r of rows) {
  if (!byRole.has(r.roleCode)) {
    byRole.set(r.roleCode, { total: 0, unchecked: 0, counts: Object.fromEntries(BUCKETS.map(b => [b, 0])) });
  }
  const role = byRole.get(r.roleCode);
  role.total++;
  if (r.bucket === '未実施' || !r.bucket) {
    role.unchecked++;
  } else {
    const key = BUCKETS.find(b => r.bucket.startsWith(b.split(' ')[0]));
    if (key) role.counts[key]++;
  }
}

// 既存サマリから domain を取得するため既存行を parse
const existingSummaryRe = /<!-- SUMMARY:BEGIN -->\s*\n\|[^\n]*\n\|[^\n]*\n([\s\S]*?)<!-- SUMMARY:END -->/;
const existingMatch = existingSummaryRe.exec(content);
const domainByRole = new Map();
if (existingMatch) {
  const bodyLines = existingMatch[1].split('\n').filter(l => l.trim().startsWith('|'));
  for (const line of bodyLines) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length >= 3 && parts[1] && parts[1] !== '合計' && !parts[1].includes('**')) {
      domainByRole.set(parts[1], parts[2]);
    }
  }
}

// summary 再構築
const summaryLines = [
  '<!-- SUMMARY:BEGIN -->',
  '| role_code | 対象 | 全 | 未実施 | ✅ OK | 🔧 TC_WRONG | 🐛 IMPL_BUG | ❓ OTHER | ⏸ SKIP |',
  '|---|---|---|---|---|---|---|---|---|',
];
let totalAll = 0, totalUnchecked = 0;
const totalCounts = Object.fromEntries(BUCKETS.map(b => [b, 0]));

for (const [roleCode, r] of byRole) {
  const domain = domainByRole.get(roleCode) || roleCode;
  summaryLines.push(
    `| ${roleCode} | ${domain} | ${r.total} | ${r.unchecked} | ${r.counts['✅ OK']} | ${r.counts['🔧 TC_WRONG']} | ${r.counts['🐛 IMPL_BUG']} | ${r.counts['❓ OTHER']} | ${r.counts['⏸ SKIP']} |`,
  );
  totalAll += r.total;
  totalUnchecked += r.unchecked;
  for (const b of BUCKETS) totalCounts[b] += r.counts[b];
}

summaryLines.push(
  `| | **合計** | **${totalAll}** | **${totalUnchecked}** | **${totalCounts['✅ OK']}** | **${totalCounts['🔧 TC_WRONG']}** | **${totalCounts['🐛 IMPL_BUG']}** | **${totalCounts['❓ OTHER']}** | **${totalCounts['⏸ SKIP']}** |`,
);
summaryLines.push('<!-- SUMMARY:END -->');

content = content.replace(summaryRe, summaryLines.join('\n'));

writeFileSync(checklistPath, content);
console.log(`✅ ${CASE_ID} → ${bucketDisplay}`);
console.log(`📊 合計: ${totalAll} (未実施 ${totalUnchecked} / OK ${totalCounts['✅ OK']} / BUG ${totalCounts['🐛 IMPL_BUG']} / OTHER ${totalCounts['❓ OTHER']})`);
