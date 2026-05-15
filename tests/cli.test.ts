import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { createProgram } from "../src/cli.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };

describe("SpecRow CLI program", () => {
  it("reports the package CLI version", () => {
    expect(createProgram().version()).toBe(packageJson.version);
  });
});
