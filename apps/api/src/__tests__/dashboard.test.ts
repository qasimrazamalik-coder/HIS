import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("dashboards", () => {
  it("returns admin summary data", async () => {
    const response = await request(createApp()).get("/api/dashboards/admin");
    expect(response.status).toBe(200);
    expect(response.body.role).toBe("admin");
    expect(response.body.metrics.admissions).toBeGreaterThan(0);
  });
});

