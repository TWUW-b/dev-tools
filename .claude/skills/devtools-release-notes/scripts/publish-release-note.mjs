#!/usr/bin/env node
/**
 * 投入済みの下書きを公開する。**ユーザーが内容を確認してから**実行する。
 *
 * Usage:
 *   node publish-release-note.mjs <API_BASE_URL> <原稿フォルダ> [--env=dev] [--admin-key=xxx] [--public]
 *
 *   --public  社外（公開 URL）にも出す。付けなければアプリ内だけ（is_public=false）
 *
 * 号の id は push-release-note.mjs が書いた <原稿フォルダ>/pushed.<env>.json から読む。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { flag } from './lib.mjs';

const args = process.argv.slice(2);
const [apiBase, dir] = args.filter((a) => !a.startsWith('--'));
if (!apiBase || !dir) {
  console.error('Usage: node publish-release-note.mjs <API_BASE_URL> <原稿フォルダ> [--env=dev] [--admin-key=xxx] [--public]');
  process.exit(2);
}
const ENV = flag(args, 'env', 'dev');
const ADMIN_KEY = flag(args, 'admin-key', process.env.DEVTOOLS_ADMIN_KEY);
const IS_PUBLIC = args.includes('--public');
const BASE = apiBase.replace(/\/$/, '');

const recordPath = join(dir, `pushed.${ENV}.json`);
if (!existsSync(recordPath)) {
  console.error(`${recordPath} がありません。先に push-release-note.mjs で投入してください`);
  process.exit(1);
}
if (!ADMIN_KEY) {
  console.error('--admin-key か環境変数 DEVTOOLS_ADMIN_KEY が要ります');
  process.exit(2);
}
const { id } = JSON.parse(readFileSync(recordPath, 'utf8'));

const res = await fetch(`${BASE}/release-notes/${id}?env=${encodeURIComponent(ENV)}`, {
  method: 'PATCH',
  headers: { 'X-Admin-Key': ADMIN_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'published', is_public: IS_PUBLIC }),
});
const json = await res.json().catch(() => ({}));
if (!res.ok || json.success === false) {
  console.error(`公開に失敗しました: HTTP ${res.status} ${json.error ?? ''}`);
  process.exit(1);
}
console.log(`公開しました: id=${id} ${json.data.version}（${IS_PUBLIC ? '社外にも公開' : 'アプリ内のみ'}）`);
