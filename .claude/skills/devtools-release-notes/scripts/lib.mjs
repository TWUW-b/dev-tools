/**
 * devtools-release-notes の共通処理: 原稿（release.json）の読み込みと検査。
 *
 * 検査の狙いは「説明の無い画像・動画を出さない」こと。以前の取り込み先では
 * caption しか書けず、どの変更の何を見る画像かが読み手に伝わらなかった（RFC 003）。
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

export const CATEGORIES = ['fix', 'improve', 'feature'];
export const KINDS = ['before', 'after', 'howto', 'overview'];

export const EXT_MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

/** サーバの既定上限（release_notes_max_upload）と 1 号あたりの件数上限 */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const MAX_MEDIA_PER_NOTE = 30;
/** 動画の目安。これを超えたら圧縮し直しを促す（エラーにはしない） */
export const VIDEO_SOFT_LIMIT_BYTES = 2 * 1024 * 1024;

/** 区分ごとに最低限ほしいメディアの役割 */
export const EXPECTED_KINDS = {
  fix: ['after'],
  improve: ['before', 'after'],
  feature: ['howto'],
};

/**
 * 利用者向けの文に出してはいけないもの。読み手に意味が無く、内部情報の漏れにもなる。
 * 誤検知を避けるため、はっきり内部のものと分かる形だけを拾う。
 */
const INTERNAL_PATTERNS = [
  { re: /\b[\w./-]+\.(php|tsx?|jsx?|mjs|sql|json|ya?ml|md)\b/i, why: 'ファイル名' },
  { re: /\b[a-z]+(?:_[a-z0-9]+){1,}\b/, why: 'snake_case の識別子（列名・enum など）' },
  { re: /\b[A-Z][A-Z0-9]{1,}-\d+\b/, why: 'チケット ID' },
  { re: /(^|\s)#\d+\b/, why: 'issue / PR 番号' },
  { re: /\b(TODO|FIXME)\b/, why: '作業メモ' },
  { re: /\b(?:GET|POST|PATCH|PUT|DELETE)\s+\//, why: 'API のパス' },
];

export function isVideoPath(p) {
  return (EXT_MIME[extname(p).toLowerCase()] ?? '').startsWith('video/');
}

export function loadManifest(dir) {
  const path = join(dir, 'release.json');
  if (!existsSync(path)) {
    throw new Error(`${path} がありません`);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`${path} を JSON として読めません: ${e.message}`);
  }
}

/** 原稿に出てくるメディアを（項目の番号つきで）平らに並べる */
export function listMedia(manifest) {
  const out = [];
  if (manifest.cover) out.push({ itemIndex: null, media: manifest.cover, isCover: true });
  (manifest.items ?? []).forEach((item, i) => {
    (item.media ?? []).forEach((m) => out.push({ itemIndex: i, media: m, isCover: false }));
  });
  return out;
}

/**
 * 原稿を検査する。errors が 1 件でもあれば投入しない。
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkManifest(dir, manifest) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
  const scanInternal = (label, v) => {
    if (typeof v !== 'string') return;
    for (const { re, why } of INTERNAL_PATTERNS) {
      const m = v.match(re);
      if (m) err(`${label}: ${why}らしき「${m[0].trim()}」が入っています。利用者の言葉に直してください`);
    }
  };

  if (!text(manifest.version)) err('version（例「第3号」）がありません');
  if (!text(manifest.title)) err('title がありません');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.released_on ?? '')) err('released_on は YYYY-MM-DD で書いてください');
  scanInternal('title', manifest.title);
  scanInternal('summary', manifest.summary);

  const items = Array.isArray(manifest.items) ? manifest.items : [];
  if (items.length === 0) err('items が空です');

  items.forEach((item, i) => {
    const at = `items[${i + 1}]「${item.headline ?? '(見出しなし)'}」`;
    if (!CATEGORIES.includes(item.category)) err(`${at}: category は fix / improve / feature のどれかです`);
    if (!text(item.headline)) err(`${at}: headline がありません`);
    else if (!/(ました|ます)。?$/.test(item.headline.trim())) warn(`${at}: headline は「〜しました」の形にそろえてください`);
    if (!text(item.where)) warn(`${at}: where（画面上の場所）がありません`);
    if (!text(item.before) || !text(item.after)) {
      warn(`${at}: before（これまで）と after（これから）は対で書いてください`);
    }
    for (const key of ['headline', 'where', 'before', 'after']) scanInternal(`${at} ${key}`, item[key]);

    const media = Array.isArray(item.media) ? item.media : [];
    if (media.length === 0) {
      if (text(item.media_waived)) {
        warn(`${at}: メディアなし（理由: ${item.media_waived.trim()}）`);
      } else {
        err(`${at}: メディアがありません。画面で見て分からない変更なら media_waived に理由を書いてください`);
      }
    } else {
      const kinds = media.map((m) => m.kind);
      const missing = (EXPECTED_KINDS[item.category] ?? []).filter((k) => !kinds.includes(k));
      if (missing.length > 0) {
        warn(`${at}: この区分は ${missing.join(' / ')} のメディアがあると伝わりやすくなります`);
      }
    }
  });

  const all = listMedia(manifest);
  if (all.length > MAX_MEDIA_PER_NOTE) err(`メディアは 1 号 ${MAX_MEDIA_PER_NOTE} 件までです（${all.length} 件）`);

  const seen = new Set();
  for (const { itemIndex, media: m, isCover } of all) {
    const at = isCover ? 'cover' : `items[${itemIndex + 1}] の media「${m.file ?? '(file なし)'}」`;
    if (!text(m.file)) {
      err(`${at}: file がありません`);
      continue;
    }
    if (seen.has(m.file)) warn(`${at}: 同じファイルが 2 回使われています`);
    seen.add(m.file);

    const abs = resolve(dir, m.file);
    if (!abs.startsWith(resolve(dir))) err(`${at}: 原稿フォルダの外は参照できません`);
    const ext = extname(m.file).toLowerCase();
    if (!EXT_MIME[ext]) err(`${at}: 使える形式は ${Object.keys(EXT_MIME).join(' ')} です（SVG は不可）`);
    if (!existsSync(abs)) {
      err(`${at}: ファイルが見つかりません`);
    } else {
      const size = statSync(abs).size;
      if (size > MAX_UPLOAD_BYTES) err(`${at}: 50MB を超えています`);
      else if (isVideoPath(m.file) && size > VIDEO_SOFT_LIMIT_BYTES) {
        warn(`${at}: 動画が ${(size / 1048576).toFixed(1)}MB あります。10〜18 秒・CRF 圧縮で撮り直せないか確認してください`);
      }
    }

    if (!isCover) {
      if (!KINDS.includes(m.kind)) err(`${at}: kind は before / after / howto / overview のどれかです`);
    } else if (m.kind !== undefined && !KINDS.includes(m.kind)) {
      err(`${at}: kind は before / after / howto / overview のどれかです`);
    }
    if (!text(m.caption)) err(`${at}: caption（何が写っているかの 1 文）がありません`);
    if (!text(m.description)) err(`${at}: description（どこを見ればよいか）がありません`);
    if (!isVideoPath(m.file) && !text(m.alt)) warn(`${at}: alt が無いので caption を代替テキストに使います`);
    for (const key of ['caption', 'alt', 'description']) scanInternal(`${at} ${key}`, m[key]);
  }

  return { errors, warnings };
}

export function printReport({ errors, warnings }) {
  for (const w of warnings) console.log(`[warning] ${w}`);
  for (const e of errors) console.log(`[error]   ${e}`);
  console.log(`\nerror ${errors.length} 件 / warning ${warnings.length} 件`);
}

/** --name=value 形式の引数を読む */
export function flag(args, name, def = undefined) {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
}
