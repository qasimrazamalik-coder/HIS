import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("smart services", () => {
  it("anchors integrity records", async () => {
    const response = await request(createApp()).post("/api/smart/integrity-chain/anchor").send({
      entity: "prescription",
      entityId: "rx-100",
      payloadHash: "abc123456789"
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("anchored");
    expect(response.body.anchor).toHaveLength(64);
  });
});

