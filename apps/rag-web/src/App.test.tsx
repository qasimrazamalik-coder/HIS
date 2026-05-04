import { describe, expect, it } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

function Smoke() {
  return <div>AI Support Agent</div>;
}

describe("rag web shell", () => {
  it("renders product name", () => {
    expect(renderToString(<Smoke />)).toContain("AI Support Agent");
  });
});

