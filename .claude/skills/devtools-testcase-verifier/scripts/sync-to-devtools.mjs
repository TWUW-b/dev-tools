#!/usr/bin/env node
/**
 * 01_checklist.md から 🐛 IMPL_BUG（または任意バケット）を抽出して
 * dev-tools の POST /notes に投入する（opt-in）
 *
 * Usage:
 *   node sync-to-devtools.mjs \
 *     --round-dir docs/test-verifications/round-2 \
 *     [--bucket IMPL_BUG]  ← デフォルト IMPL_BUG
 *     [--api http://localhost:8082/api/__debug]
 *     [--env dev]
 *     [--admin-key xxx]
 *     [--dry-run]
 *
 * .verifier-config.json の設定を既定値として使用。
 *
 * 重複投入防止:
 *   既存のノート一覧を取得し、同じ testCaseIds + content のノートが
 *   あればスキップする。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const getFlag = (name, def) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};
const DRY_RUN = args.includes('--dry-run');

const ROUND_DIR = getFlag('round-dir', null);
if (!ROUND_DIR) {
  console.error('Usage: node sync-to-devtools.mjs --round-dir <path> [--bucket IMPL_BUG] [--dry-run]');
  process.exit(1);
}

const configPath = join(ROUND_DIR, '.verifier-config.json');
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};

const API_BASE = getFlag('api', config.apiBaseUrl || 'http://localhost:8082/api/__debug');
const ENV = getFlag('env', config.env || 'dev');
const ADMIN_KEY = getFlag('admin-key', config.adminKey || null);
const TARGET_BUCKET = getFlag('bucket', 'IMPL_BUG').toUpperCase();

const BUCKET_EMOJI = {
  OK: '✅', TC_WRONG: '🔧', IMPL_BUG: '🐛', OTHER: '❓', SKIP: '⏸',
};
const emoji = BUCKET_EMOJI[TARGET_BUCKET];
if (!emoji) {
  console.error(`[ERR] invalid bucket: ${TARGET_BUCKET}`);
  process.exit(1);
}

const checklistPath = join(ROUND_DIR, '01_checklist.md');
if (!existsSync(checklistPath)) {
  console.error(`[ERR] not found: ${checklistPath}`);
  process.exit(1);
}

const content = readFileSync(checklistPath, 'utf8');

// 対象バケットの行を抽出
const targetRows = [];
const rowRe = /^\|\s*(TC-[A-Z0-9]+-\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/gm;
let m;
while ((m = rowRe.exec(content)) !== null) {
  const [, caseKey, title, bucketText] = m;
  if (bucketText.trim().startsWith(emoji)) {
    // note 抽出: "🐛 IMPL_BUG — xxx [evidence: yyy]" から note 部分を取り出す
    const noteMatch = bucketText.match(/—\s*(.+?)(?:\s*\[evidence:.*?\])?$/);
    const note = noteMatch ? noteMatch[1].trim() : '';
    targetRows.push({ caseKey, title, note });
  }
}

console.log(`📋 ${targetRows.length} ${emoji} ${TARGET_BUCKET} cases found in ${checklistPath}`);
if (targetRows.length === 0) {
  process.exit(0);
}

if (DRY_RUN) {
  console.log('[dry-run] API 非接触で終了');
  for (const r of targetRows) {
    console.log(`  ${r.caseKey} — ${r.note}`);
  }
  process.exit(0);
}

// ---- API 連携 ----
const headers = { 'Content-Type': 'application/json' };
if (ADMIN_KEY) headers['X-Admin-Key'] = ADMIN_KEY;

async function jfetch(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${url} → ${res.status}: ${text.slice(0, 200)}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

// test-cases から case_key → id マップを作成
console.log(`📥 fetching test-cases...`);
const tcResp = await jfetch(`${API_BASE}/test-cases?env=${ENV}`);
const allTcs = tcResp.data || tcResp.cases || [];
const keyToId = new Map();
for (const tc of allTcs) {
  if (tc.case_key) keyToId.set(tc.case_key, tc.id);
}

// 既存ノート取得（重複防止）
console.log(`📥 fetching existing notes...`);
const notesResp = await jfetch(`${API_BASE}/notes?env=${ENV}`);
const existingNotes = notesResp.data || notesResp.notes || [];
const existingKeyPairs = new Set();
for (const n of existingNotes) {
  const tcs = n.test_cases || [];
  for (const tc of tcs) {
    if (tc.case_key && n.content) {
      existingKeyPairs.add(`${tc.case_key}:${n.content.slice(0, 100)}`);
    }
  }
}

// ---- 投入 ----
const severityMap = { IMPL_BUG: 'high', TC_WRONG: 'low', OTHER: 'medium' };
const severity = severityMap[TARGET_BUCKET] || 'medium';

let posted = 0;
let skipped = 0;
for (const row of targetRows) {
  const tcId = keyToId.get(row.caseKey);
  if (!tcId) {
    console.warn(`  ⚠ ${row.caseKey}: not found in test-cases`);
    continue;
  }
  const content = `[${TARGET_BUCKET}] ${row.title}\n\n${row.note}`;
  const dupKey = `${row.caseKey}:${content.slice(0, 100)}`;
  if (existingKeyPairs.has(dupKey)) {
    skipped++;
    continue;
  }

  try {
    await jfetch(`${API_BASE}/notes?env=${ENV}`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        severity,
        source: 'test',
        testCaseIds: [tcId],
      }),
    });
    posted++;
    console.log(`  ✓ ${row.caseKey} (id=${tcId})`);
  } catch (e) {
    console.error(`  ✗ ${row.caseKey}: ${e.message}`);
  }
}

console.log('');
console.log(`✅ ${posted} posted / ${skipped} skipped (duplicate)`);
