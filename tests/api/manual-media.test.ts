/**
 * マニュアル画像アップロード API（RFC 002 / ADR-002）。
 *
 * 参考実装は release-notes.test.ts。ここでも独自の admin()/anon() ヘルパーを
 * このファイル内で完結させて定義する。理由: `/manual/media/{token}` は認証なしの
 * 配信ルートであり、`tests/api/helpers/client.ts` の共通 ADMIN_GUARDED_PATH に
 * 「manual」を機械的に追加すると配信ルートにも誤って認証ヘッダを付けてしまいかねない。
 * @TWUWB-004 で ADMIN_GUARDED_PATH とガード対象がズレて 11 件が誤って 401 になった
 * 教訓があるため、このスイートは共通ヘルパーに触れず自己完結させる。
 *
 * 落とさないよう固定する点:
 *   - メディア配信が **認証なしで通る**こと（<img> は Authorization ヘッダを送れない）
 *   - Range(206) が返ること
 *   - manual_item_id は `^[A-Za-z0-9_-]{1,128}$` に一致しないと 400（実在チェックができない
 *     代わりの唯一の検証。パストラバーサル対策の要でもある）
 *   - 削除で DB 行・配信の両方が消えること（実体の孤児化を防ぐ）
 *   - 画像のみ許可（動画・SVG・txt は拒否）
 *   - 30枚/項目の上限
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

/** ftyp ボックスだけの最小 mp4 らしきバイナリ（動画は対象外であることの確認用） */
const MP4_MIN = Buffer.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0x00, 0x00, 0x00, 0x00, 0x6d, 0x70, 0x34,
  0x32, 0x69, 0x73, 0x6f, 0x6d,
]);

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

/** 実行のたびに衝突しない manual_item_id を作る（DB がテスト間で永続するため）。 */
let seq = 0;
function uniqueItemId(suffix: string): string {
  seq += 1;
  return `t${Date.now()}-${seq}-${suffix}`;
}

async function uploadMediaAs(
  itemId: string,
  file: { data: Buffer; name: string; type: string },
  extra?: { caption?: string; headers?: Record<string, string> },
) {
  const form = new FormData();
  form.append("file", new Blob([file.data], { type: file.type }), file.name);
  if (extra?.caption) form.append("caption", extra.caption);
  return fetch(url(`/manual/items/${encodeURIComponent(itemId)}/media`), {
    method: "POST",
    body: form,
    headers: extra?.headers ?? { "X-Admin-Key": ADMIN_KEY },
  });
}

const createdMedia: number[] = [];
afterAll(async () => {
  for (const id of createdMedia) {
    await admin(`/manual/media/${id}`, { method: "DELETE" });
  }
});

// ─── 認証 ───

describe("認証", () => {
  test("管理系は鍵が無いと 401", async () => {
    for (const [path, init] of [
      ["/manual/items/guide/media", undefined],
      ["/manual/items/guide/media", { method: "POST" }],
      ["/manual/media/1", { method: "DELETE" }],
    ] as [string, RequestInit | undefined][]) {
      const res = await anon(path, init);
      expect(res.status, `${init?.method ?? "GET"} ${path}`).toBe(401);
    }
  });

  test("誤った鍵は 401", async () => {
    const res = await anon("/manual/items/guide/media", { headers: { "X-Admin-Key": "wrong-key" } });
    expect(res.status).toBe(401);
  });
});

// ─── manual_item_id の検証 ───

describe("manual_item_id の検証", () => {
  test("不正な itemId はパストラバーサル試行も含め 400 で弾かれる", async () => {
    const badIds = ["../etc/passwd", "a/b", "a b", "a".repeat(129)];
    for (const id of badIds) {
      const listRes = await admin(`/manual/items/${encodeURIComponent(id)}/media`);
      expect(listRes.status, `GET itemId=${id}`).toBe(400);

      const upRes = await uploadMediaAs(id, { data: PNG_1X1, name: "shot.png", type: "image/png" });
      expect(upRes.status, `POST itemId=${id}`).toBe(400);
      // どちらの経路でも実ファイルが書き込まれていないこと（201 でなければ createdMedia に積まない）
    }
  });

  test("有効な itemId は許可される", async () => {
    for (const id of ["guide", "getting-started_v2"]) {
      const up = await uploadMediaAs(id, { data: PNG_1X1, name: "shot.png", type: "image/png" });
      expect(up.status, `itemId=${id}`).toBe(201);
      const media = (await up.json()).data;
      createdMedia.push(media.id);

      const list = await admin(`/manual/items/${id}/media`);
      expect(list.status).toBe(200);
    }
  });
});

// ─── メディア（アップロード・配信） ───

describe("メディア", () => {
  test("アップロードした画像は認証なしで配信され、Range に対応する", async () => {
    const itemId = uniqueItemId("delivery");
    const up = await uploadMediaAs(itemId, { data: PNG_1X1, name: "shot.png", type: "image/png" }, { caption: "説明" });
    expect(up.status).toBe(201);
    const media = (await up.json()).data;
    createdMedia.push(media.id);
    expect(media.mime_type).toBe("image/png");
    expect(media.caption).toBe("説明");
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

  test("Content-Type を誤って送っても拡張子から補われる", async () => {
    const itemId = uniqueItemId("mime");
    const res = await uploadMediaAs(itemId, { data: PNG_1X1, name: "shot.png", type: "application/octet-stream" });
    expect(res.status).toBe(201);
    const media = (await res.json()).data;
    createdMedia.push(media.id);
    expect(media.mime_type).toBe("image/png");
  });

  test("許可しない形式は 400 で拒否される", async () => {
    const itemId = uniqueItemId("reject");

    // SVG はスクリプトを埋め込めるため許可しない
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const svgRes = await uploadMediaAs(itemId, { data: svg, name: "x.svg", type: "image/svg+xml" });
    expect(svgRes.status).toBe(400);
    expect((await svgRes.json()).error).toContain("Invalid file type");

    const txtRes = await uploadMediaAs(itemId, { data: Buffer.from("hello"), name: "x.txt", type: "text/plain" });
    expect(txtRes.status).toBe(400);
  });

  test("動画は許可されない（画像のみのスコープ）", async () => {
    const itemId = uniqueItemId("video");
    const res = await uploadMediaAs(itemId, { data: MP4_MIN, name: "clip.mp4", type: "video/mp4" });
    expect(res.status).toBe(400);
  });
});

// ─── 一覧 ───

describe("一覧", () => {
  test("sort_order 順に返る", async () => {
    const itemId = uniqueItemId("order");
    const names = ["a.png", "b.png", "c.png"];
    for (const name of names) {
      const res = await uploadMediaAs(itemId, { data: PNG_1X1, name, type: "image/png" });
      expect(res.status).toBe(201);
      const media = (await res.json()).data;
      createdMedia.push(media.id);
    }

    const list = await (await admin(`/manual/items/${itemId}/media`)).json();
    expect(list.data.map((m: { original_name: string }) => m.original_name)).toEqual(names);
    expect(list.data.map((m: { sort_order: number }) => m.sort_order)).toEqual([0, 1, 2]);
  });
});

// ─── 削除 ───

describe("削除", () => {
  test("削除すると DB 行と配信の両方が消える。もう一方の項目のメディアは残る", async () => {
    const itemA = uniqueItemId("del-a");
    const itemB = uniqueItemId("del-b");

    const mediaA = (await (await uploadMediaAs(itemA, { data: PNG_1X1, name: "a.png", type: "image/png" })).json()).data;
    const mediaB = (await (await uploadMediaAs(itemB, { data: PNG_1X1, name: "b.png", type: "image/png" })).json()).data;
    createdMedia.push(mediaB.id); // mediaA は本テストで削除するので afterAll 対象は B のみ

    expect((await admin(`/manual/media/${mediaA.id}`, { method: "DELETE" })).status).toBe(200);

    // 配信も消える
    expect((await anon(`${BASE_URL}${mediaA.url}`)).status).toBe(404);
    // 一覧からも消える
    const listA = await (await admin(`/manual/items/${itemA}/media`)).json();
    expect(listA.data.some((m: { id: number }) => m.id === mediaA.id)).toBe(false);

    // 別項目のメディアは影響を受けない
    expect((await anon(`${BASE_URL}${mediaB.url}`)).status).toBe(200);
    const listB = await (await admin(`/manual/items/${itemB}/media`)).json();
    expect(listB.data.some((m: { id: number }) => m.id === mediaB.id)).toBe(true);
  });
});

// ─── トークン ───

describe("配信トークン", () => {
  test("存在しない token は 404", async () => {
    const bogus = "deadbeef".repeat(6);
    expect((await anon(`/manual/media/${bogus}`)).status).toBe(404);
    // 短すぎるトークンはルートにすら一致しない
    expect((await anon("/manual/media/abc")).status).toBe(404);
  });
});

// ─── 上限 ───

describe("枚数上限", () => {
  test("30枚を超えるアップロードは拒否される", async () => {
    const itemId = uniqueItemId("cap");
    for (let i = 0; i < 30; i++) {
      const res = await uploadMediaAs(itemId, { data: PNG_1X1, name: `img${i}.png`, type: "image/png" });
      expect(res.status, `#${i}`).toBe(201);
      const media = (await res.json()).data;
      createdMedia.push(media.id);
    }

    const overflow = await uploadMediaAs(itemId, { data: PNG_1X1, name: "img30.png", type: "image/png" });
    expect(overflow.status).toBe(400);
    expect((await overflow.json()).error).toContain("Maximum");
  }, 30000);
});
