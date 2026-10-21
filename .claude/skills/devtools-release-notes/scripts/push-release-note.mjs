#!/usr/bin/env node
/**
 * リリースノート原稿を dev-tools API に **下書き（draft）として** 投入する。
 *
 * Usage:
 *   node push-release-note.mjs <API_BASE_URL> <原稿フォルダ> [--env=dev] [--admin-key=xxx] [--dry-run]
 *
 *   API_BASE_URL  例: http://localhost:8081 / https://example.com/api/__debug
 *   --admin-key   省略時は環境変数 DEVTOOLS_ADMIN_KEY
 *
 * 処理: 検査 → 号を draft で作成 → 項目を追加 → メディアを項目に紐付けてアップロード
 *       → cover があれば cover_image_id を設定 → <原稿フォルダ>/pushed.<env>.json に記録
 *
 * - 公開はしない。ユーザーの確認後に publish-release-note.mjs で行う。
 * - 同じ env に二重投入しないよう、pushed.<env>.json があれば止まる
 *   （作り直すときは管理画面で号を消し、pushed.<env>.json を消してから再実行する）。
 * - 途中で失敗したら、作りかけの号を消して終わる（下書きのゴミを残さない）。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import { loadManifest, checkManifest, printReport, flag, EXT_MIME } from './lib.mjs';

const args = process.argv.slice(2);
const [apiBase, dir] = args.filter((a) => !a.startsWith('--'));
if (!apiBase || !dir) {
  console.error('Usage: node push-release-note.mjs <API_BASE_URL> <原稿フォルダ> [--env=dev] [--admin-key=xxx] [--dry-run]');
  process.exit(2);
}
const ENV = flag(args, 'env', 'dev');
const ADMIN_KEY = flag(args, 'admin-key', process.env.DEVTOOLS_ADMIN_KEY);
const DRY_RUN = args.includes('--dry-run');
const BASE = apiBase.replace(/\/$/, '');
const recordPath = join(dir, `pushed.${ENV}.json`);

const manifest = loadManifest(dir);
const report = checkManifest(dir, manifest);
printReport(report);
if (report.errors.length > 0) {
  console.error('\n検査で error があるため投入しません');
  process.exit(1);
}
if (existsSync(recordPath)) {
  console.error(`\n${recordPath} があります。この env には投入済みです（号 id: ${JSON.parse(readFileSync(recordPath, 'utf8')).id}）`);
  process.exit(1);
}
if (DRY_RUN) {
  console.log('\n--dry-run のため API には接続しません');
  process.exit(0);
}
if (!ADMIN_KEY) {
  console.error('\n--admin-key か環境変数 DEVTOOLS_ADMIN_KEY が要ります');
  process.exit(2);
}

const url = (path) => `${BASE}${path}${path.includes('?') ? '&' : '?'}env=${encodeURIComponent(ENV)}`;

async function call(method, path, body) {
  const init = { method, headers: { 'X-Admin-Key': ADMIN_KEY } };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url(path), init);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${method} ${path}: HTTP ${res.status} ${text.slice(0, 200)}`);
  }
  if (!res.ok || json.success === false) {
    const hint = res.status === 403 ? `\nHTTP 403 はこの鍵に release-notes の範囲が無いという意味です（鍵は正しい）` : '';
    throw new Error(`${method} ${path}: HTTP ${res.status} ${json.error ?? ''}${hint}`);
  }
  return json.data;
}

async function upload(noteId, m, itemId) {
  const abs = resolve(dir, m.file);
  const form = new FormData();
  // type を付けないと octet-stream で飛び、サーバの拡張子補正に頼ることになる
  form.append('file', new Blob([readFileSync(abs)], { type: EXT_MIME[extname(abs).toLowerCase()] }), basename(abs));
  if (itemId !== null) form.append('item_id', String(itemId));
  for (const key of ['kind', 'caption', 'alt', 'description']) {
    if (typeof m[key] === 'string' && m[key].trim() !== '') form.append(key, m[key].trim());
  }
  return call('POST', `/release-notes/${noteId}/images`, form);
}

let noteId = null;
try {
  const note = await call('POST', '/release-notes', {
    version: manifest.version,
    title: manifest.title,
    summary: manifest.summary ?? null,
    released_on: manifest.released_on,
    status: 'draft',
  });
  noteId = note.id;
  console.log(`\n号を下書きで作成しました: id=${noteId} ${manifest.version}`);

  const record = { id: noteId, env: ENV, api: BASE, pushed_at: new Date().toISOString(), items: [], media: [] };

  for (const [i, item] of (manifest.items ?? []).entries()) {
    const created = await call('POST', `/release-notes/${noteId}/items`, {
      category: item.category,
      headline: item.headline,
      where_text: item.where ?? null,
      before_text: item.before ?? null,
      after_text: item.after ?? null,
      feedback_id: item.feedback_id ?? null,
      // 元の報告。タイトルを省くとサーバが元の feedback / note から引く
      ...(Array.isArray(item.sources) ? { sources: item.sources } : {}),
    });
    record.items.push({ index: i + 1, id: created.id });
    console.log(`  項目 ${i + 1}: ${item.headline}`);
    for (const m of item.media ?? []) {
      const media = await upload(noteId, m, created.id);
      record.media.push({ file: m.file, id: media.id });
      console.log(`    ${m.kind.padEnd(8)} ${m.file}`);
    }
  }

  if (manifest.cover) {
    const cover = await upload(noteId, manifest.cover, null);
    await call('PATCH', `/release-notes/${noteId}`, { cover_image_id: cover.id });
    record.media.push({ file: manifest.cover.file, id: cover.id, cover: true });
    console.log(`  cover    ${manifest.cover.file}`);
  }

  writeFileSync(recordPath, JSON.stringify(record, null, 2) + '\n');
  console.log(`\n投入しました（下書き）。記録: ${recordPath}`);
  console.log('公開はユーザーの確認後に publish-release-note.mjs で行ってください。');
} catch (e) {
  console.error(`\n[error] ${e.message}`);
  if (noteId !== null) {
    try {
      await call('DELETE', `/release-notes/${noteId}`);
      console.error(`作りかけの号（id=${noteId}）を削除しました`);
    } catch (e2) {
      console.error(`作りかけの号（id=${noteId}）の削除にも失敗しました: ${e2.message}`);
    }
  }
  process.exit(1);
}
