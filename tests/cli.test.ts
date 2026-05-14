import { describe, expect, it } from "vitest";

import { createProgram } from "../src/cli.js";

describe("SpecRow CLI program", () => {
  it("reports the package CLI version", () => {
    expect(createProgram().version()).toBe("0.1.2");
  });
});
