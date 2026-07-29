/**
 * リリースノート API（@TWUWB-003）。
 *
 * この機能の失敗はほぼ全部「curl では通るのにブラウザで壊れる」類なので、
 * ここでは特に次を落とさないよう固定する:
 *   - メディア配信が **認証なしで通る**こと（<img>/<video> は Authorization を送れない）
 *   - Range(206) が返ること（未対応だと動画の再生開始もシークもできない）
 *   - 削除でメディアの行が消えること（実体の孤児化を防ぐ）
 *   - draft / published+社内 / published+社外 の3段階が取り違えられないこと
 */
import { test, expect, describe, afterAll } from "vitest";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const ADMIN_KEY = process.env.API_ADMIN_KEY ?? "dev-admin-key-change-in-production";
const ENV = "test";

/** 1x1 の PNG。finfo がバイナリから image/png と判定できる最小データ */
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

function url(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${BASE_URL}${path}${sep}env=${ENV}`;
}

/** 管理系（X-Admin-Key 必須） */
async function admin(path: string, options?: RequestInit & { json?: unknown }) {
  const { json, ...rest } = options ?? {};
  return fetch(url(path), {
    ...rest,
    headers: {
      "X-Admin-Key": ADMIN_KEY,
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    ...(json !== undefined && { body: JSON.stringify(json) }),
  });
}

/** 公開系（認証なし） */
async function anon(path: string, init?: RequestInit) {
  return fetch(path.startsWith("http") ? path : url(path), init);
}

async function createNote(body: Record<string, unknown>): Promise<number> {
  const res = await admin("/release-notes", { method: "POST", json: body });
  expect(res.status).toBe(201);
  return (await res.json()).data.id as number;
}

async function uploadMedia(
  noteId: number,
  file: { data: Buffer; name: string; type: string },
  extra?: { itemId?: number; caption?: string },
) {
  const form = new FormData();
  form.append("file", new Blob([file.data], { type: file.type }), file.name);
  if (extra?.itemId !== undefined) form.append("item_id", String(extra.itemId));
  if (extra?.caption) form.append("caption", extra.caption);
  return fetch(url(`/release-notes/${noteId}/images`), {
    method: "POST",
    body: form,
    headers: { "X-Admin-Key": ADMIN_KEY },
  });
}

const createdNotes: number[] = [];
afterAll(async () => {
  for (const id of createdNotes) {
    await admin(`/release-notes/${id}`, { method: "DELETE" });
  }
});

// ─── 認証 ───

describe("認証", () => {
  test("管理系は鍵が無いと 401", async () => {
    for (const [path, init] of [
      ["/release-notes", undefined],
      ["/release-notes/tokens", undefined],
      ["/release-notes", { method: "POST" }],
    ] as [string, RequestInit | undefined][]) {
      const res = await anon(path, init);
      expect(res.status, `${init?.method ?? "GET"} ${path}`).toBe(401);
    }
  });

  test("誤った鍵は 401", async () => {
    const res = await anon("/release-notes", { headers: { "X-Admin-Key": "wrong-key" } });
    expect(res.status).toBe(401);
  });
});

// ─── CRUD ───

describe("号の CRUD", () => {
  test("作成 → 更新 → 削除", async () => {
    const id = await createNote({ version: "第900号", title: "CRUD検証", released_on: "2026-01-10" });
    createdNotes.push(id);

    // 既定は draft かつ 非公開（明示しない限り外に出さない）
    const list = await (await admin("/release-notes")).json();
    const created = list.data.find((n: { id: number }) => n.id === id);
    expect(created.status).toBe("draft");
    expect(created.is_public).toBe(false);

    const patched = await admin(`/release-notes/${id}`, {
      method: "PATCH",
      json: { title: "CRUD検証(改)", status: "published", is_public: true },
    });
    expect(patched.status).toBe(200);
    const body = await patched.json();
    expect(body.data.title).toBe("CRUD検証(改)");
    expect(body.data.status).toBe("published");
    expect(body.data.is_public).toBe(true);

    const del = await admin(`/release-notes/${id}`, { method: "DELETE" });
    expect(del.status).toBe(200);
    createdNotes.pop();

    const after = await (await admin("/release-notes")).json();
    expect(after.data.some((n: { id: number }) => n.id === id)).toBe(false);
  });

  test("必須項目が無ければ 400", async () => {
    for (const json of [
      { title: "版数なし", released_on: "2026-01-10" },
      { version: "第901号", released_on: "2026-01-10" },
      { version: "第901号", title: "日付が不正", released_on: "2026/01/10" },
    ]) {
      const res = await admin("/release-notes", { method: "POST", json });
      expect(res.status).toBe(400);
      expect((await res.json()).success).toBe(false);
    }
  });

  test("previous_release_id は公開日から直前の号が自動で入る", async () => {
    const older = await createNote({ version: "第910号", title: "前", released_on: "2026-02-01" });
    createdNotes.push(older);
    const newer = await createNote({ version: "第911号", title: "後", released_on: "2026-02-08" });
    createdNotes.push(newer);

    const list = await (await admin("/release-notes")).json();
    const target = list.data.find((n: { id: number }) => n.id === newer);
    expect(target.previous_release_id).toBe(older);
    // 画面が「前回（○月○日 第N号）からの変更」を出せるだけの情報が付く
    expect(target.previous).toMatchObject({ id: older, version: "第910号", released_on: "2026-02-01" });
  });

  test("存在しない号の更新・削除は 404", async () => {
    expect((await admin("/release-notes/999999", { method: "PATCH", json: { title: "x" } })).status).toBe(404);
    expect((await admin("/release-notes/999999", { method: "DELETE" })).status).toBe(404);
  });

  test("previous_release_id は存在する別の号でなければ 400", async () => {
    const id = await createNote({ version: "第912号", title: "前回参照", released_on: "2026-02-20" });
    createdNotes.push(id);

    // 自分自身 → 画面に「前回（自分）からの変更」と出てしまう
    const self = await admin(`/release-notes/${id}`, { method: "PATCH", json: { previous_release_id: id } });
    expect(self.status).toBe(400);

    // 存在しない ID → 黙って無視されると「設定したのに反映されない」になる
    const missing = await admin(`/release-notes/${id}`, { method: "PATCH", json: { previous_release_id: 999999 } });
    expect(missing.status).toBe(400);
    expect((await admin("/release-notes", {
      method: "POST",
      json: { version: "第913号", title: "x", released_on: "2026-02-21", previous_release_id: 999999 },
    })).status).toBe(400);

    // null で明示的に外すのは許す（最初のリリース扱いに戻す）
    expect((await admin(`/release-notes/${id}`, { method: "PATCH", json: { previous_release_id: null } })).status).toBe(200);
  });
});

// ─── 項目 ───

describe("項目", () => {
  test("追加 → 更新 → 削除", async () => {
    const noteId = await createNote({ version: "第920号", title: "項目検証", released_on: "2026-03-01" });
    createdNotes.push(noteId);

    const addRes = await admin(`/release-notes/${noteId}/items`, {
      method: "POST",
      json: {
        category: "fix",
        headline: "編集ボタンで画面が真っ白になるのを直しました",
        where_text: "案件 > MTGログ",
        before_text: "押すと操作できなくなっていました。",
        after_text: "編集画面がそのまま開きます。",
        feedback_id: 4242,
      },
    });
    expect(addRes.status).toBe(201);
    const item = (await addRes.json()).data;
    expect(item.category).toBe("fix");
    // 投入側が二重掲載を検出する正本なので、必ず往復すること
    expect(item.feedback_id).toBe(4242);

    const patchRes = await admin(`/release-notes/${noteId}/items/${item.id}`, {
      method: "PATCH",
      json: { category: "improve", headline: "使いやすくしました" },
    });
    expect(patchRes.status).toBe(200);
    expect((await patchRes.json()).data.category).toBe("improve");

    // 区分は3つだけ
    const bad = await admin(`/release-notes/${noteId}/items/${item.id}`, {
      method: "PATCH",
      json: { category: "refactor" },
    });
    expect(bad.status).toBe(400);

    expect((await admin(`/release-notes/${noteId}/items/${item.id}`, { method: "DELETE" })).status).toBe(200);
  });

  test("headline が空なら 400 / 存在しない号への追加は 404", async () => {
    const noteId = await createNote({ version: "第921号", title: "項目検証2", released_on: "2026-03-02" });
    createdNotes.push(noteId);
    expect((await admin(`/release-notes/${noteId}/items`, { method: "POST", json: { headline: "  " } })).status).toBe(400);
    expect((await admin("/release-notes/999999/items", { method: "POST", json: { headline: "x" } })).status).toBe(404);
  });
});

// ─── 可視性（この機能の肝）───

describe("可視性の3段階", () => {
  test("draft / published+社内 / published+社外 が取り違えられない", async () => {
    const tokens = (await (await admin("/release-notes/tokens")).json()).data;
    const feedPublic = () => anon(`${BASE_URL}${tokens.public.feedUrl}`);
    const feedInternal = () => anon(`${BASE_URL}${tokens.internal.feedUrl}`);
    const has = async (res: Response, id: number) =>
      (await res.json()).data.some((n: { id: number }) => n.id === id);

    const id = await createNote({ version: "第930号", title: "可視性検証", released_on: "2026-04-01" });
    createdNotes.push(id);

    // draft: どちらにも出ない
    expect(await has(await feedInternal(), id)).toBe(false);
    expect(await has(await feedPublic(), id)).toBe(false);

    // published + is_public=0: アプリ内だけ（社内向け）
    await admin(`/release-notes/${id}`, { method: "PATCH", json: { status: "published" } });
    expect(await has(await feedInternal(), id)).toBe(true);
    expect(await has(await feedPublic(), id)).toBe(false);

    // published + is_public=1: 公開 URL にも出る
    await admin(`/release-notes/${id}`, { method: "PATCH", json: { is_public: true } });
    expect(await has(await feedPublic(), id)).toBe(true);

    // 下書きに戻すと公開 URL からも消える
    await admin(`/release-notes/${id}`, { method: "PATCH", json: { status: "draft" } });
    expect(await has(await feedPublic(), id)).toBe(false);
  });

  test("不正なトークンでは feed もページも 404", async () => {
    const bogus = "deadbeef".repeat(6);
    expect((await anon(`/release-notes/feed/${bogus}`)).status).toBe(404);
    expect((await anon(`/release-notes/p/${bogus}`)).status).toBe(404);
    // 短すぎるトークンはルートにすら一致しない
    expect((await anon("/release-notes/feed/abc")).status).toBe(404);
  });

  test("公開ページは HTML を返し、内容がエスケープされている", async () => {
    const tokens = (await (await admin("/release-notes/tokens")).json()).data;
    const id = await createNote({
      version: "第931号",
      title: '<script>alert(1)</script>',
      released_on: "2026-04-05",
      status: "published",
      is_public: true,
    });
    createdNotes.push(id);

    const res = await anon(`${BASE_URL}${tokens.public.pageUrl}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    // 限定公開なので検索エンジンには載せない
    expect(res.headers.get("x-robots-tag")).toContain("noindex");

    const html = await res.text();
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});

// ─── メディア ───

describe("メディア", () => {
  test("アップロードした画像は認証なしで配信され、Range に対応する", async () => {
    // 配信は published の号だけなので、公開状態にしてから確かめる
    const noteId = await createNote({ version: "第940号", title: "メディア検証", released_on: "2026-05-01", status: "published" });
    createdNotes.push(noteId);

    const up = await uploadMedia(noteId, { data: PNG_1X1, name: "shot.png", type: "image/png" }, { caption: "修正後" });
    expect(up.status).toBe(201);
    const media = (await up.json()).data;
    expect(media.mime_type).toBe("image/png");
    expect(media.caption).toBe("修正後");
    // トークンそのものはレスポンスに含めない（URL に埋めて渡す）
    expect(media.token).toBeUndefined();

    // <img> は Authorization を送れないので、鍵無しで 200 でなければならない
    const full = await anon(`${BASE_URL}${media.url}`);
    expect(full.status).toBe(200);
    expect(full.headers.get("content-type")).toBe("image/png");
    expect(full.headers.get("accept-ranges")).toBe("bytes");
    const size = PNG_1X1.length;

    const partial = await anon(`${BASE_URL}${media.url}`, { headers: { Range: "bytes=0-9" } });
    expect(partial.status).toBe(206);
    expect(partial.headers.get("content-range")).toBe(`bytes 0-9/${size}`);
    expect((await partial.arrayBuffer()).byteLength).toBe(10);

    // 末尾 N バイト
    const suffix = await anon(`${BASE_URL}${media.url}`, { headers: { Range: "bytes=-5" } });
    expect(suffix.status).toBe(206);
    expect((await suffix.arrayBuffer()).byteLength).toBe(5);

    // 範囲外は 416
    const over = await anon(`${BASE_URL}${media.url}`, { headers: { Range: "bytes=999999-" } });
    expect(over.status).toBe(416);
    expect(over.headers.get("content-range")).toBe(`bytes */${size}`);
  });

  test("下書きの号のメディアは配信しない（公開してから見えるようになる）", async () => {
    const noteId = await createNote({ version: "第946号", title: "未公開の下書き", released_on: "2026-05-10" });
    createdNotes.push(noteId);

    const media = (await (await uploadMedia(noteId, { data: PNG_1X1, name: "wip.png", type: "image/png" })).json()).data;

    // トークンを知っていても、まだ公開していない号の証跡は読めない
    expect((await anon(`${BASE_URL}${media.url}`)).status).toBe(404);

    await admin(`/release-notes/${noteId}`, { method: "PATCH", json: { status: "published" } });
    expect((await anon(`${BASE_URL}${media.url}`)).status).toBe(200);

    // 社外公開でない published はアプリ内で表示する必要があるので配信は続ける
    expect((await anon(`${BASE_URL}${media.url}`)).status).toBe(200);

    // 下書きに戻すと再び読めなくなる
    await admin(`/release-notes/${noteId}`, { method: "PATCH", json: { status: "draft" } });
    expect((await anon(`${BASE_URL}${media.url}`)).status).toBe(404);
  });

  test("cover_image_id は自分の号のメディアしか指定できない", async () => {
    const a = await createNote({ version: "第947号", title: "A", released_on: "2026-05-11" });
    const b = await createNote({ version: "第948号", title: "B", released_on: "2026-05-12" });
    createdNotes.push(a, b);

    const mediaOfA = (await (await uploadMedia(a, { data: PNG_1X1, name: "a.png", type: "image/png" })).json()).data;

    // 他の号のメディアを代表にすると、その号を消したときに表示が壊れる
    expect((await admin(`/release-notes/${b}`, { method: "PATCH", json: { cover_image_id: mediaOfA.id } })).status).toBe(400);
    expect((await admin(`/release-notes/${b}`, { method: "PATCH", json: { cover_image_id: 999999 } })).status).toBe(400);
    expect((await admin(`/release-notes/${a}`, { method: "PATCH", json: { cover_image_id: mediaOfA.id } })).status).toBe(200);

    // メディアを消したら参照も外れる（存在しない id を指したままにしない）
    await admin(`/release-notes/${a}/images/${mediaOfA.id}`, { method: "DELETE" });
    const list = await (await admin("/release-notes")).json();
    expect(list.data.find((n: { id: number }) => n.id === a).cover_image_id).toBeNull();
  });

  test("Content-Type を誤って送っても拡張子から補われる", async () => {
    const noteId = await createNote({ version: "第941号", title: "MIME検証", released_on: "2026-05-02" });
    createdNotes.push(noteId);

    // 送信側が type を付け忘れると octet-stream で飛んでくる。そのまま保存すると <video> で描けない
    const res = await uploadMedia(noteId, { data: PNG_1X1, name: "shot.png", type: "application/octet-stream" });
    expect(res.status).toBe(201);
    expect((await res.json()).data.mime_type).toBe("image/png");
  });

  test("許可しない形式は拒否する", async () => {
    const noteId = await createNote({ version: "第942号", title: "拒否検証", released_on: "2026-05-03" });
    createdNotes.push(noteId);

    // SVG はスクリプトを埋め込めるため許可しない
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const res = await uploadMedia(noteId, { data: svg, name: "x.svg", type: "image/svg+xml" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid file type");

    const txt = await uploadMedia(noteId, { data: Buffer.from("hello"), name: "x.txt", type: "text/plain" });
    expect(txt.status).toBe(400);
  });

  test("他の号の項目 ID は紐付けられない", async () => {
    const a = await createNote({ version: "第943号", title: "A", released_on: "2026-05-04" });
    const b = await createNote({ version: "第944号", title: "B", released_on: "2026-05-05" });
    createdNotes.push(a, b);
    const item = (await (await admin(`/release-notes/${a}/items`, { method: "POST", json: { headline: "Aの項目" } })).json()).data;

    const res = await uploadMedia(b, { data: PNG_1X1, name: "shot.png", type: "image/png" }, { itemId: item.id });
    expect(res.status).toBe(400);
  });

  test("メディア削除・号の削除でメディアが辿れなくなる", async () => {
    const noteId = await createNote({ version: "第945号", title: "削除検証", released_on: "2026-05-06", status: "published" });

    const one = (await (await uploadMedia(noteId, { data: PNG_1X1, name: "a.png", type: "image/png" })).json()).data;
    const two = (await (await uploadMedia(noteId, { data: PNG_1X1, name: "b.png", type: "image/png" })).json()).data;

    expect((await admin(`/release-notes/${noteId}/images/${one.id}`, { method: "DELETE" })).status).toBe(200);
    expect((await anon(`${BASE_URL}${one.url}`)).status).toBe(404);
    // もう片方は残っている
    expect((await anon(`${BASE_URL}${two.url}`)).status).toBe(200);

    // 号ごと削除すると、残りのメディアも辿れなくなる（実体も片付けられる）
    expect((await admin(`/release-notes/${noteId}`, { method: "DELETE" })).status).toBe(200);
    expect((await anon(`${BASE_URL}${two.url}`)).status).toBe(404);
  });
});

// ─── トークン ───

describe("トークン", () => {
  test("2種類のトークンと URL が返る", async () => {
    const res = await admin("/release-notes/tokens");
    expect(res.status).toBe(200);
    const { data } = await res.json();
    for (const scope of ["public", "internal"] as const) {
      expect(data[scope].token).toMatch(/^[a-f0-9]{48}$/);
      expect(data[scope].pageUrl).toContain(`/release-notes/p/${data[scope].token}`);
      expect(data[scope].feedUrl).toContain(`/release-notes/feed/${data[scope].token}`);
    }
    expect(data.public.token).not.toBe(data.internal.token);
  });

  test("再発行すると古い URL は使えなくなる", async () => {
    const before = (await (await admin("/release-notes/tokens")).json()).data.public.token;
    expect((await anon(`/release-notes/feed/${before}`)).status).toBe(200);

    const rotated = await admin("/release-notes/tokens/rotate", { method: "POST", json: { scope: "public" } });
    expect(rotated.status).toBe(200);
    const after = (await rotated.json()).data.public.token;

    expect(after).not.toBe(before);
    expect((await anon(`/release-notes/feed/${before}`)).status).toBe(404);
    expect((await anon(`/release-notes/feed/${after}`)).status).toBe(200);
  });

  test("不正な scope は 400", async () => {
    const res = await admin("/release-notes/tokens/rotate", { method: "POST", json: { scope: "everyone" } });
    expect(res.status).toBe(400);
  });
});
