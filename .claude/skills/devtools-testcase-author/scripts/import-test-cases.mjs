#!/usr/bin/env node
/**
 * @twuw-b/dev-tools テストケース MD 投入スクリプト
 *
 * Usage:
 *   node scripts/import-test-cases.mjs <API_BASE_URL> [options]
 *
 * Options:
 *   --env=<name>         環境名 (default: dev)
 *   --admin-key=<key>    X-Admin-Key ヘッダ値 (本番投入時)
 *   --dir=<path>         MD ディレクトリ (default: docs/test-cases)
 *   --dry-run            パース＆バリデーションのみ（API 非接触）
 *
 * 処理: parse → validate → purge (100件バッチ) → import → verify
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const args = process.argv.slice(2);
const API_BASE = args.find(a => !a.startsWith('--'));
if (!API_BASE) {
  console.error('Usage: node import-test-cases.mjs <API_BASE_URL> [--env=dev] [--admin-key=xxx] [--dir=docs/test-cases] [--dry-run]');
  process.exit(1);
}
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};
const ENV = getFlag('env', 'dev');
const ADMIN_KEY = getFlag('admin-key', null);
const DIR = getFlag('dir', 'docs/test-cases');
const DRY_RUN = args.includes('--dry-run');

if (!existsSync(DIR)) {
  console.error(`[ERR] ディレクトリが存在しません: ${DIR}`);
  process.exit(1);
}

/** MD → ParsedTestCase[] に変換 (dev-tools の parseTestCaseMd 互換) */
function parseMd(md, file) {
  const lines = md.split('\n');
  let domain = '', capability = '', inFm = false, fmDone = false;
  const cases = [];
  const warnings = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (t === '---') {
      if (!inFm && !fmDone) { inFm = true; continue; }
      if (inFm) { inFm = false; fmDone = true; continue; }
    }
    if (inFm) {
      const m = t.match(/^domain:\s*(.+)$/);
      if (m) domain = m[1].trim();
      continue;
    }
    if (!fmDone && t.startsWith('---')) continue;
    if (t.startsWith('# ')) { capability = t.slice(2).trim(); continue; }
    if (t.startsWith('- ')) {
      const title = t.slice(2).trim();
      if (!title) continue;
      if (!capability) {
        warnings.push(`${file}: capability 未指定のまま case "${title}" が出現 → 無視`);
        continue;
      }
      cases.push({ domain, capability, title });
    }
  }
  if (!domain) throw new Error(`${file}: frontmatter に domain: が必要`);
  if (cases.length === 0) throw new Error(`${file}: case が 0 件`);
  return { cases, warnings };
}

// ---- parse ----
const files = readdirSync(DIR).filter(f => f.endsWith('.md'));
if (files.length === 0) {
  console.error(`[ERR] ${DIR} に MD ファイルがありません`);
  process.exit(1);
}

const all = [];
const allWarnings = [];
const fileDomains = {};
for (const f of files) {
  const { cases, warnings } = parseMd(readFileSync(join(DIR, f), 'utf8'), f);
  all.push(...cases);
  allWarnings.push(...warnings);
  const d = cases[0].domain;
  fileDomains[d] = fileDomains[d] || [];
  fileDomains[d].push(f);
}

// ---- validate ----
for (const [d, fs] of Object.entries(fileDomains)) {
  if (fs.length > 1) {
    allWarnings.push(`domain="${d}" が複数ファイルに分散: ${fs.join(', ')}（1 ファイル=1 ロール推奨）`);
  }
}

console.log(`📄 ${files.length} files, ${all.length} cases`);
console.log(`🏷  domains: ${[...new Set(all.map(c => c.domain))].join(', ')}`);
const capCount = {};
for (const c of all) capCount[c.domain] = (capCount[c.domain] || new Set()).add(c.capability);
for (const [d, s] of Object.entries(capCount)) console.log(`   - ${d}: ${s.size} capabilities`);

if (allWarnings.length) {
  console.log(`\n⚠  warnings:`);
  for (const w of allWarnings) console.log(`   - ${w}`);
}

if (DRY_RUN) {
  console.log('\n[dry-run] API 非接触で終了');
  process.exit(0);
}

// ---- purge → import → verify ----
const headers = { 'Content-Type': 'application/json' };
if (ADMIN_KEY) headers['X-Admin-Key'] = ADMIN_KEY;

async function jfetch(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${url} → ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

console.log(`\n🌐 API: ${API_BASE}  env=${ENV}`);

// purge
const existing = await jfetch(`${API_BASE}/test-cases?env=${ENV}`);
const ids = (existing.data ?? existing.cases ?? []).map(c => c.id).filter(Boolean);
console.log(`🗑  purge: ${ids.length} existing cases`);
for (let i = 0; i < ids.length; i += 100) {
  const batch = ids.slice(i, i + 100);
  await jfetch(`${API_BASE}/test-cases?env=${ENV}`, {
    method: 'DELETE',
    body: JSON.stringify({ ids: batch }),
  });
  console.log(`   batch ${i / 100 + 1}: deleted ${batch.length}`);
}

// import
console.log(`📤 import: ${all.length} cases`);
const importRes = await jfetch(`${API_BASE}/test-cases/import?env=${ENV}`, {
  method: 'POST',
  body: JSON.stringify({ cases: all }),
});
console.log(`   result:`, importRes);

// verify
const verify = await jfetch(`${API_BASE}/test-cases?env=${ENV}`);
const verifyCount = (verify.data ?? verify.cases ?? []).length;
console.log(`\n✅ verify: ${verifyCount} cases in env=${ENV}`);
if (verifyCount !== all.length) {
  console.warn(`⚠  投入数 ${all.length} と一致しません`);
  process.exit(2);
}
console.log('🎉 done');
