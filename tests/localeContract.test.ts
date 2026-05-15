import { describe, expect, it } from "vitest";

import { validateLocaleContract, validateRuntimeLocaleContract } from "../src/localeContract.js";

describe("SpecRow locale contract", () => {
  it("keeps runtime locale resources complete and placeholder-compatible", () => {
    expect(validateRuntimeLocaleContract()).toEqual([]);
  });

  it("keeps documentation coverage aligned with supported languages", async () => {
    expect(await validateLocaleContract(process.cwd())).toEqual([]);
  });
});
