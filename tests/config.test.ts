import { describe, expect, it } from "vitest";

import { parseConfig, serializeConfig } from "../src/config.js";

describe("SpecRow config", () => {
  it("serializes the MVP config shape", () => {
    expect(serializeConfig({ version: 1, language: "en" })).toBe("version: 1\nlanguage: en\n");
  });

  it("parses and validates config.yml", () => {
    expect(parseConfig("version: 1\nlanguage: zh-CN\n")).toEqual({
      version: 1,
      language: "zh-CN"
    });
  });

  it("parses estimation settings", () => {
    expect(parseConfig("version: 1\nlanguage: en\nestimation:\n  enabled: true\n")).toEqual({
      version: 1,
      language: "en",
      estimation: {
        enabled: true
      }
    });
  });

  it("serializes enabled estimation settings", () => {
    expect(serializeConfig({ version: 1, language: "en", estimation: { enabled: true } })).toBe(
      "version: 1\nlanguage: en\nestimation:\n  enabled: true\n"
    );
  });

  it("rejects unsupported config versions", () => {
    expect(() => parseConfig("version: 2\nlanguage: ru\n")).toThrow();
  });
});
