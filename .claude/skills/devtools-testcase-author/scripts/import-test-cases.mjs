#!/usr/bin/env node
/**
 * @twuw-b/dev-tools テストケース MD 投入スクリプト (case_key 対応版)
 *
 * Usage:
 *   node scripts/import-test-cases.mjs <API_BASE_URL> [options]
 *
 * Options:
 *   --env=<name>         環境名 (default: dev)
 *   --admin-key=<key>    X-Admin-Key ヘッダ値 (本番投入時)
 *   --dir=<path>         MD ディレクトリ (default: docs/test-cases)
 *   --dry-run            パース＆バリデーションのみ（API 非接触）
 *   --auto-archive       MD に存在しない case_key を自動 archive（soft delete）
 *
 * 処理: parse → validate → upsert import → verify
 *
 * 重要:
 *  - MD は `- [TC-{role_code}-{連番}] タイトル` 形式必須
 *  - frontmatter に `domain:` と `role_code:` 必須
 *  - case_key は不変。UPSERT で title 等を更新しても実行履歴は維持される
 *  - 本スクリプトに purge 機能はない。廃止は dev-tools UI か手動 DELETE で
 *  - DB に存在するが MD から消えたキーは [warning] のみ。自動 archive しない
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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
const AUTO_ARCHIVE = args.includes('--auto-archive');

if (!existsSync(DIR)) {
  console.error(`[ERR] ディレクトリが存在しません: ${DIR}`);
  process.exit(1);
}

/**
 * MD → { domain, roleCode, cases: [{case_key, domain, capability, title}], warnings }
 * 厳格モード: エラー条件ではスロー
 */
function parseMd(md, file) {
  const lines = md.split('\n');
  let domain = '';
  let roleCode = '';
  let capability = '';
  let inFm = false;
  let fmDone = false;
  const cases = [];
  const warnings = [];
  let lineNo = 0;

  for (const raw of lines) {
    lineNo++;
    const t = raw.trim();
    if (t === '---') {
      if (!inFm && !fmDone) { inFm = true; continue; }
      if (inFm) { inFm = false; fmDone = true; continue; }
    }
    if (inFm) {
      const mDom = t.match(/^domain:\s*(.+)$/);
      if (mDom) { domain = mDom[1].trim(); continue; }
      const mRole = t.match(/^role_code:\s*([A-Z][A-Z0-9]{1,5})\s*$/);
      if (mRole) { roleCode = mRole[1]; continue; }
      continue;
    }
    if (!fmDone && t.startsWith('---')) continue;
    if (t.startsWith('# ')) {
      capability = t.slice(2).trim();
      continue;
    }
    if (t.startsWith('- ')) {
      const body = t.slice(2).trim();
      if (!body) continue;
      if (!capability) {
        throw new Error(`${file}:${lineNo}: case before any H1 capability: "${body}"`);
      }
      // [TC-XX-NNN] タイトル 形式
      const m = body.match(/^\[(TC-[A-Z][A-Z0-9]{1,5}-\d+)\]\s*(.+)$/);
      if (!m) {
        throw new Error(`${file}:${lineNo}: missing [TC-XX-NNN] key: "${body}"`);
      }
      const caseKey = m[1];
      const title = m[2].trim();
      if (!title) {
        throw new Error(`${file}:${lineNo}: title is empty after key: "${body}"`);
      }
      cases.push({ case_key: caseKey, domain, capability, title });
    }
  }

  if (!fmDone) throw new Error(`${file}: missing frontmatter`);
  if (!domain) throw new Error(`${file}: domain required in frontmatter`);
  if (!roleCode) throw new Error(`${file}: role_code required in frontmatter`);
  if (cases.length === 0) throw new Error(`${file}: case が 0 件`);

  // role_code と case_key 接頭辞の整合確認
  const expectedPrefix = `TC-${roleCode}-`;
  for (const c of cases) {
    if (!c.case_key.startsWith(expectedPrefix)) {
      throw new Error(
        `${file}: case_key prefix mismatch: expected "${expectedPrefix}..." but got "${c.case_key}"`,
      );
    }
  }

  return { domain, roleCode, cases, warnings };
}

// ---- parse ----
const files = readdirSync(DIR).filter(f => f.endsWith('.md') && !/readme/i.test(f));
if (files.length === 0) {
  console.error(`[ERR] ${DIR} に MD ファイルがありません`);
  process.exit(1);
}

const all = [];
const allWarnings = [];
const fileDomains = {};
const fileRoleCodes = {};
const seenKeysGlobal = new Map(); // case_key → file

for (const f of files) {
  let parsed;
  try {
    parsed = parseMd(readFileSync(join(DIR, f), 'utf8'), f);
  } catch (e) {
    console.error(`[ERR] ${e.message}`);
    process.exit(1);
  }
  const { domain, roleCode, cases, warnings } = parsed;

  // ファイル内重複
  const seenInFile = new Set();
  for (const c of cases) {
    if (seenInFile.has(c.case_key)) {
      console.error(`[ERR] ${f}: duplicate case_key in file: ${c.case_key}`);
      process.exit(1);
    }
    seenInFile.add(c.case_key);

    // ファイル横断重複
    if (seenKeysGlobal.has(c.case_key)) {
      console.error(
        `[ERR] duplicate case_key across files: ${c.case_key} in ${seenKeysGlobal.get(c.case_key)} and ${f}`,
      );
      process.exit(1);
    }
    seenKeysGlobal.set(c.case_key, f);
  }

  all.push(...cases);
  allWarnings.push(...warnings);

  fileDomains[domain] = fileDomains[domain] || [];
  fileDomains[domain].push(f);
  fileRoleCodes[roleCode] = fileRoleCodes[roleCode] || [];
  fileRoleCodes[roleCode].push(f);
}

// ---- validate ----
for (const [d, fs] of Object.entries(fileDomains)) {
  if (fs.length > 1) {
    allWarnings.push(`domain="${d}" が複数ファイルに分散: ${fs.join(', ')}（1 ファイル=1 ロール推奨）`);
  }
}
for (const [r, fs] of Object.entries(fileRoleCodes)) {
  if (fs.length > 1) {
    allWarnings.push(`role_code="${r}" が複数ファイルに分散: ${fs.join(', ')}`);
  }
}

console.log(`📄 ${files.length} files, ${all.length} cases`);
console.log(`🏷  domains: ${[...new Set(all.map(c => c.domain))].join(', ')}`);
console.log(`🔖 role_codes: ${Object.keys(fileRoleCodes).join(', ')}`);
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

// ---- API 操作 ----
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

// ---- 既存の case_key を取得（差分ウォッチ用）----
const existing = await jfetch(`${API_BASE}/test-cases?env=${ENV}`);
const existingCases = existing.data ?? existing.cases ?? [];
const existingKeys = new Set(
  existingCases
    .map(c => c.case_key || c.caseKey)
    .filter(k => typeof k === 'string' && k.startsWith('TC-')),
);
const mdKeys = new Set(all.map(c => c.case_key));

// MD に無くなったキー（物理削除はしない。警告のみ）
const removedKeys = [...existingKeys].filter(k => !mdKeys.has(k));
if (removedKeys.length > 0) {
  console.log(`\n⚠  MD から消えた case_key: ${removedKeys.length} 件`);
  for (const k of removedKeys) console.log(`   - ${k}`);
  console.log(`   → 自動削除しません。管理 UI の archive か手動 DELETE で対処してください`);
}

// ---- UPSERT import ----
const importPayload = { cases: all };
if (AUTO_ARCHIVE) importPayload.sync = true;
console.log(`\n📤 import (upsert${AUTO_ARCHIVE ? ' + auto-archive' : ''}): ${all.length} cases`);
const importRes = await jfetch(`${API_BASE}/test-cases/import?env=${ENV}`, {
  method: 'POST',
  body: JSON.stringify(importPayload),
});
console.log(`   result:`, importRes);

// ---- verify ----
const verify = await jfetch(`${API_BASE}/test-cases?env=${ENV}`);
const verifyCases = verify.data ?? verify.cases ?? [];
const verifyActive = verifyCases.filter(c => !c.archived_at && !c.archivedAt);
const verifyKeys = new Set(
  verifyActive
    .map(c => c.case_key || c.caseKey)
    .filter(k => typeof k === 'string' && k.startsWith('TC-')),
);
const missing = [...mdKeys].filter(k => !verifyKeys.has(k));
console.log(`\n✅ verify: ${verifyKeys.size} active TC-* keys in env=${ENV}`);
if (missing.length > 0) {
  console.error(`⚠  投入した case_key のうち ${missing.length} 件が verify で確認できません:`);
  for (const k of missing.slice(0, 20)) console.error(`   - ${k}`);
  process.exit(2);
}
console.log('🎉 done');
