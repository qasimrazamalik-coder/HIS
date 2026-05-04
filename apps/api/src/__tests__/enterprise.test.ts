import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("enterprise contracts", () => {
  it("returns bed board occupancy", async () => {
    const response = await request(createApp()).get("/api/enterprise/bed-board");
    expect(response.status).toBe(200);
    expect(response.body.wards[0].totalBeds).toBeGreaterThan(response.body.wards[0].occupiedBeds);
  });

  it("accepts offline sync operations", async () => {
    const response = await request(createApp())
      .post("/api/enterprise/offline/sync")
      .send({ deviceId: "tablet-7", operations: [{ id: "op-1", type: "update", resource: "Observation", payload: { value: "98.6" } }] });
    expect(response.status).toBe(200);
    expect(response.body.acceptedOperations).toContain("op-1");
  });
});

