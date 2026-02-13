import { api } from "./helpers/client";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";

describe("Routing and common", () => {
  test("GET /nonexistent → 404", async () => {
    const res = await api("/nonexistent");
    expect(res.status).toBe(404);
    expect((await res.json()).error).toContain("Not found");
  });

  test("invalid env parameter → 400", async () => {
    // env パラメータはclient.tsで自動付与されるため、直接fetchする
    const res = await fetch(`${BASE_URL}/notes?env=invalid`);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid env parameter");
  });

  test("OPTIONS /notes → 204 (preflight)", async () => {
    const res = await fetch(`${BASE_URL}/notes?env=test`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
      },
    });
    expect(res.status).toBe(204);
  });
});
