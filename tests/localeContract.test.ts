import { describe, expect, it } from "vitest";

import { validateLocaleContract, validateRuntimeLocaleContract } from "../src/localeContract.js";
import { TEMPLATE_REGISTRY } from "../src/templates.js";

describe("SpecRow locale contract", () => {
  it("keeps runtime locale resources complete and placeholder-compatible", () => {
    expect(validateRuntimeLocaleContract()).toEqual([]);
  });

  it("keeps documentation coverage aligned with supported languages", async () => {
    expect(await validateLocaleContract(process.cwd())).toEqual([]);
  });

  it("invalidates runtime locale review after a prose-only change", () => {
    const original = TEMPLATE_REGISTRY.ru.messages["list.empty"];
    TEMPLATE_REGISTRY.ru.messages["list.empty"] = `${original} Изменено.`;
    try {
      expect(validateRuntimeLocaleContract()).toContainEqual(
        expect.objectContaining({ path: "ru", message: expect.stringContaining("changed after review") })
      );
    } finally {
      TEMPLATE_REGISTRY.ru.messages["list.empty"] = original;
    }
  });
});
