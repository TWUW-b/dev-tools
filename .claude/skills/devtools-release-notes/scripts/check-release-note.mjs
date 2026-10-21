#!/usr/bin/env node
/**
 * リリースノート原稿の検査。
 *
 * Usage:
 *   node check-release-note.mjs <原稿フォルダ>
 *
 * error が 1 件でもあれば終了コード 1。push-release-note.mjs も投入前に同じ検査をする。
 */
import { loadManifest, checkManifest, printReport } from './lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Usage: node check-release-note.mjs <原稿フォルダ>');
  process.exit(2);
}

try {
  const report = checkManifest(dir, loadManifest(dir));
  printReport(report);
  process.exit(report.errors.length > 0 ? 1 : 0);
} catch (e) {
  console.error(`[error] ${e.message}`);
  process.exit(1);
}
