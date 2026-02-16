import { api } from "./helpers/client";
import { createNote, deleteNote } from "./helpers/seed";

// ─── Activities CRUD lifecycle ───

test("Activities lifecycle: status_change with comment → GET activities → POST comment → GET note includes activities", async () => {
  const { id } = await createNote();

  // PATCH status to fixed with comment → activity recorded
  const fixRes = await api(`/notes/${id}/status`, {
    method: "PATCH",
    json: { status: "fixed", comment: "ボタンのクリックハンドラを修正" },
  });
  expect(fixRes.status).toBe(200);
  expect((await fixRes.json()).success).toBe(true);

  // GET activities → 1 status_change entry
  const listRes = await api(`/notes/${id}/activities`);
  expect(listRes.status).toBe(200);
  const listBody = await listRes.json();
  expect(listBody.success).toBe(true);
  expect(listBody.activities).toHaveLength(1);
  expect(listBody.activities[0].action).toBe("status_change");
  expect(listBody.activities[0].old_status).toBe("open");
  expect(listBody.activities[0].new_status).toBe("fixed");
  expect(listBody.activities[0].content).toBe("ボタンのクリックハンドラを修正");

  // POST comment
  const commentRes = await api(`/notes/${id}/activities`, {
    method: "POST",
    json: { content: "再テストお願いします" },
  });
  expect(commentRes.status).toBe(201);
  const commentBody = await commentRes.json();
  expect(commentBody.success).toBe(true);
  expect(commentBody.activity.action).toBe("comment");
  expect(commentBody.activity.content).toBe("再テストお願いします");

  // GET note detail → activities included
  const noteRes = await api(`/notes/${id}`);
  expect(noteRes.status).toBe(200);
  const noteBody = await noteRes.json();
  expect(noteBody.note.activities).toHaveLength(2);
  expect(noteBody.note.activities[0].action).toBe("status_change");
  expect(noteBody.note.activities[1].action).toBe("comment");

  await deleteNote(id);
});

// ─── fixed requires comment ───

describe("Status change to fixed requires comment", () => {
  let noteId: number;

  beforeAll(async () => {
    const { id } = await createNote();
    noteId = id;
  });

  afterAll(async () => {
    await deleteNote(noteId);
  });

  test("PATCH status=fixed without comment → 200", async () => {
    const res = await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "fixed" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  test("PATCH status=fixed with comment → 200", async () => {
    const res = await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "fixed", comment: "修正済み" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});

// ─── Other statuses don't require comment ───

describe("Status change to resolved/rejected/open without comment", () => {
  let noteId: number;

  beforeAll(async () => {
    const { id } = await createNote();
    noteId = id;
  });

  afterAll(async () => {
    await deleteNote(noteId);
  });

  test("PATCH status=resolved without comment → 200", async () => {
    const res = await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "resolved" },
    });
    expect(res.status).toBe(200);
  });

  test("PATCH status=rejected without comment → 200", async () => {
    const res = await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "rejected" },
    });
    expect(res.status).toBe(200);
  });

  test("PATCH status=open without comment → 200", async () => {
    const res = await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "open" },
    });
    expect(res.status).toBe(200);
  });
});

// ─── Status change records activity ───

describe("Status change always records activity", () => {
  let noteId: number;

  beforeAll(async () => {
    const { id } = await createNote();
    noteId = id;
  });

  afterAll(async () => {
    await deleteNote(noteId);
  });

  test("resolved with optional comment → activity with comment", async () => {
    await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "resolved", comment: "テスターが確認済み" },
    });
    const res = await api(`/notes/${noteId}/activities`);
    const body = await res.json();
    const last = body.activities[body.activities.length - 1];
    expect(last.action).toBe("status_change");
    expect(last.new_status).toBe("resolved");
    expect(last.content).toBe("テスターが確認済み");
  });

  test("open without comment → activity with null content", async () => {
    await api(`/notes/${noteId}/status`, {
      method: "PATCH",
      json: { status: "open" },
    });
    const res = await api(`/notes/${noteId}/activities`);
    const body = await res.json();
    const last = body.activities[body.activities.length - 1];
    expect(last.action).toBe("status_change");
    expect(last.old_status).toBe("resolved");
    expect(last.new_status).toBe("open");
    expect(last.content).toBeNull();
  });
});

// ─── Author field ───

test("Activity records author when provided", async () => {
  const { id } = await createNote();

  await api(`/notes/${id}/status`, {
    method: "PATCH",
    json: { status: "fixed", comment: "修正", author: "dev-tanaka" },
  });

  const commentRes = await api(`/notes/${id}/activities`, {
    method: "POST",
    json: { content: "確認しました", author: "qa-suzuki" },
  });
  expect(commentRes.status).toBe(201);
  expect((await commentRes.json()).activity.author).toBe("qa-suzuki");

  const res = await api(`/notes/${id}/activities`);
  const body = await res.json();
  expect(body.activities[0].author).toBe("dev-tanaka");
  expect(body.activities[1].author).toBe("qa-suzuki");

  await deleteNote(id);
});

// ─── POST /notes/{id}/activities validation ───

describe("POST activities validation", () => {
  let noteId: number;

  beforeAll(async () => {
    const { id } = await createNote();
    noteId = id;
  });

  afterAll(async () => {
    await deleteNote(noteId);
  });

  test("POST without content → 400", async () => {
    const res = await api(`/notes/${noteId}/activities`, {
      method: "POST",
      json: {},
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Content is required");
  });

  test("POST with empty content → 400", async () => {
    const res = await api(`/notes/${noteId}/activities`, {
      method: "POST",
      json: { content: "  " },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Content is required");
  });

  test("POST with content exceeding 2000 chars → 400", async () => {
    const res = await api(`/notes/${noteId}/activities`, {
      method: "POST",
      json: { content: "x".repeat(2001) },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("exceeds maximum length");
  });
});

// ─── Not found (404) ───

describe("Activities not found", () => {
  test("GET /notes/99999/activities → 404", async () => {
    const res = await api("/notes/99999/activities");
    expect(res.status).toBe(404);
  });

  test("POST /notes/99999/activities → 400", async () => {
    const res = await api("/notes/99999/activities", {
      method: "POST",
      json: { content: "orphan comment" },
    });
    expect(res.status).toBe(400);
  });
});

// ─── latest_comment in list ───

test("GET /notes includes latest_comment", async () => {
  const { id } = await createNote();

  // まだコメントなし
  const res1 = await api("/notes");
  const note1 = (await res1.json()).data.find((n: any) => n.id === id);
  expect(note1.latest_comment).toBeNull();

  // コメント追加
  await api(`/notes/${id}/activities`, {
    method: "POST",
    json: { content: "最初のコメント" },
  });
  await api(`/notes/${id}/activities`, {
    method: "POST",
    json: { content: "最新のコメント" },
  });

  // latest_comment は最新のもの
  const res2 = await api("/notes");
  const note2 = (await res2.json()).data.find((n: any) => n.id === id);
  expect(note2.latest_comment).toBe("最新のコメント");

  await deleteNote(id);
});

// ─── Same status no-op ───

test("PATCH same status → 200 no-op, no activity recorded", async () => {
  const { id } = await createNote();

  const res = await api(`/notes/${id}/status`, {
    method: "PATCH",
    json: { status: "open" },
  });
  expect(res.status).toBe(200);
  expect((await res.json()).success).toBe(true);

  const actRes = await api(`/notes/${id}/activities`);
  expect((await actRes.json()).activities).toHaveLength(0);

  await deleteNote(id);
});
