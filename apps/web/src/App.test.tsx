import { describe, expect, it } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

function Smoke() {
  return <div>Hospital Information System</div>;
}

describe("web shell", () => {
  it("renders", () => {
    expect(renderToString(<Smoke />)).toContain("Hospital Information System");
  });
});
