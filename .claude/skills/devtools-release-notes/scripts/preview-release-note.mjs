#!/usr/bin/env node
/**
 * 原稿から下見用の HTML を作る（API には接続しない）。
 *
 * Usage:
 *   node preview-release-note.mjs <原稿フォルダ>
 *
 * <原稿フォルダ>/preview.html を書き出す。メディアは原稿フォルダからの相対パスで参照するので、
 * ブラウザで開けばそのまま画像・動画が見える。下書きの号のメディアはサーバが配信しない
 * （公開前の証跡を守るため）ので、公開前にユーザーへ見せるのはこの下見で行う。
 * 見た目は公開ページ（ReleaseNotesController::renderPage）と同じ規則にそろえてある。
 * preview.html は作り直せるのでコミットしない。
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadManifest, checkManifest, isVideoPath } from './lib.mjs';

const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) {
  console.error('Usage: node preview-release-note.mjs <原稿フォルダ>');
  process.exit(2);
}

const manifest = loadManifest(dir);
const { errors, warnings } = checkManifest(dir, manifest);

const e = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const br = (s) => e(s).replace(/\n/g, '<br>');
const src = (file) => encodeURI(file);

const CAT = { fix: '直したこと', improve: '使いやすくしたこと', feature: '新しくできること' };
const KIND = { before: '変更前', after: '変更後', howto: '使い方', overview: '全体像' };

function mediaTag(m) {
  const alt = e(m.alt ?? m.caption ?? '');
  if (isVideoPath(m.file)) {
    return `<video src="${src(m.file)}#t=0.1" controls playsinline preload="metadata" aria-label="${alt}"></video>`;
  }
  return `<img src="${src(m.file)}" alt="${alt}" data-zoom="${src(m.file)}">`;
}

function figure(m) {
  return `<figure${m.kind ? ` class="k-${e(m.kind)}"` : ''}>`
    + (m.kind && KIND[m.kind] ? `<span class="kind kind-${e(m.kind)}">${KIND[m.kind]}</span>` : '')
    + mediaTag(m)
    + `<figcaption>${m.caption ? `<span class="cap">${e(m.caption)}</span>` : ''}`
    + `${m.description ? `<span class="desc">${br(m.description)}</span>` : ''}</figcaption></figure>`;
}

function item(it, n) {
  const media = it.media ?? [];
  const kinds = media.map((m) => m.kind);
  const pair = kinds.includes('before') && kinds.includes('after');
  return `<li class="item"><span class="num">${n}.</span><div class="item-body">`
    + `<p class="headline">${e(it.headline)}</p>`
    + (it.where ? `<p class="where">場所: ${e(it.where)}</p>` : '')
    + ((it.before || it.after) ? `<div class="ba">`
      + (it.before ? `<p class="before"><span class="ba-label">これまで</span>${e(it.before)}</p>` : '')
      + (it.after ? `<p class="after"><span class="ba-label">これから</span>${e(it.after)}</p>` : '')
      + `</div>` : '')
    + (media.length ? `<div class="media${pair ? ' pair' : ''}">${media.map(figure).join('')}</div>` : '')
    + (it.media_waived ? `<p class="waived">メディアなし: ${e(it.media_waived)}</p>` : '')
    + `</div></li>`;
}

const sections = Object.keys(CAT).map((c) => {
  const items = (manifest.items ?? []).filter((it) => it.category === c);
  if (!items.length) return '';
  return `<section class="cat"><h3 class="cat-title cat-${c}">${CAT[c]}（${items.length}件）</h3>`
    + `<ol class="items">${items.map((it, i) => item(it, i + 1)).join('')}</ol></section>`;
}).join('');

const checks = (errors.length || warnings.length)
  ? `<div class="checks">${errors.map((m) => `<p class="err">error: ${e(m)}</p>`).join('')}`
    + `${warnings.map((m) => `<p class="warn">warning: ${e(m)}</p>`).join('')}</div>`
  : '<div class="checks"><p class="ok">検査: 問題なし</p></div>';

const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>下見: ${e(manifest.version)} ${e(manifest.title)}</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#F7F8FA;color:#111827;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif;line-height:1.7}
.wrap{max-width:820px;margin:0 auto;padding:32px 16px 64px}
.banner{margin-bottom:16px;padding:8px 12px;border-radius:8px;background:#FEF3C7;color:#92400E;font-size:12px}
.checks{margin-bottom:16px;font-size:12px}.checks p{margin:0 0 2px}.err{color:#B91C1C}.warn{color:#92400E}.ok{color:#065F46}
.meta{display:flex;gap:8px;align-items:center;margin-bottom:6px;font-size:13px;font-weight:600;color:#374151}
.ver{font-size:11px;padding:1px 8px;border-radius:999px;background:#EEF2F7;color:#4B5563;font-weight:400}
.card{background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden}
.card-head{padding:16px}.card-head h2{margin:0;font-size:16px}
.summary{margin:10px 0 0;font-size:14px;color:#374151}
.cover{margin-top:12px}.cover img,.cover video{width:100%;border-radius:8px;border:1px solid #E5E7EB;display:block}
.card-body{padding:4px 16px 16px;background:#FAFBFC;border-top:1px solid #F3F4F6}
.cat{margin-top:16px}.cat-title{margin:0 0 8px;font-size:12px}
.cat-fix{color:#92400E}.cat-improve{color:#065F46}.cat-feature{color:#1E40AF}
.items{list-style:none;margin:0;padding:0}
.item{display:flex;gap:8px;background:#fff;border:1px solid #F3F4F6;border-radius:8px;padding:10px 12px;margin-bottom:10px}
.num{font-size:12px;color:#9CA3AF;padding-top:2px}.item-body{flex:1;min-width:0}
.headline{margin:0;font-size:14px}.where{margin:2px 0 0;font-size:12px;color:#9CA3AF}
.ba{margin-top:8px}.ba p{margin:0 0 2px;font-size:12px}.before{color:#6B7280}
.ba-label{display:inline-block;width:4.5em;color:#9CA3AF}
.media{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px}
.media figure{margin:0;width:100%;max-width:420px}
.media.pair figure{max-width:calc(50% - 6px)}
@media (max-width:560px){.media.pair figure{max-width:100%}}
.media img,.media video{width:100%;border-radius:6px;border:1px solid #E5E7EB;display:block}
.media img{background:#F9FAFB;cursor:zoom-in}.media video{background:#000}
.kind{display:inline-block;margin-bottom:4px;padding:1px 8px;border-radius:999px;font-size:11px;background:#F3F4F6;color:#4B5563}
.kind-after{background:#ECFDF5;color:#065F46}.kind-howto{background:#EFF6FF;color:#1E40AF}
figcaption{margin-top:4px;font-size:12px;color:#4B5563}figcaption .cap{display:block}
figcaption .desc{display:block;margin-top:2px;font-size:11px;color:#6B7280}
.waived{margin:8px 0 0;font-size:11px;color:#9CA3AF}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:24px}
.lightbox[hidden]{display:none}.lightbox img{max-width:100%;max-height:100%;border-radius:8px;background:#fff}
</style></head><body><div class="wrap">
<p class="banner">下見（公開前）。サーバには送っていません。</p>
${checks}
<div class="meta">${e(manifest.released_on)} <span class="ver">${e(manifest.version)}</span></div>
<div class="card"><div class="card-head"><h2>${e(manifest.title)}</h2>
${manifest.summary ? `<p class="summary">${br(manifest.summary)}</p>` : ''}
${manifest.cover ? `<div class="cover">${figure(manifest.cover)}</div>` : ''}
</div><div class="card-body">${sections}</div></div>
</div>
<div class="lightbox" id="lb" hidden><img src="" alt=""></div>
<script>
(function(){var b=document.getElementById('lb'),i=b.querySelector('img');
document.addEventListener('click',function(ev){var t=ev.target.closest('[data-zoom]');
if(t){i.src=t.getAttribute('data-zoom');b.hidden=false;return}if(ev.target===b){b.hidden=true;i.src=''}});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape'){b.hidden=true;i.src=''}});})();
</script></body></html>
`;

const out = join(dir, 'preview.html');
writeFileSync(out, html);
console.log(`${out} を書き出しました（error ${errors.length} 件 / warning ${warnings.length} 件）`);
