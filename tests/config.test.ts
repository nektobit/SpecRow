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

  it("loads existing configs without integration metadata", () => {
    expect(parseConfig("version: 1\nlanguage: en\n")).toEqual({
      version: 1,
      language: "en"
    });
  });

  it("accepts MCP-managed integration files", () => {
    expect(
      parseConfig(
        "version: 1\nlanguage: en\nintegrations:\n  tools:\n    - codex\n  installedAt: '2026-05-15T00:00:00.000Z'\n  managedFiles:\n    - tool: codex\n      path: /home/me/.codex/config.toml\n      kind: mcp-config\n"
      ).integrations?.managedFiles
    ).toEqual([
      {
        tool: "codex",
        path: "/home/me/.codex/config.toml",
        kind: "mcp-config"
      }
    ]);
  });

  it("rejects unsupported config versions", () => {
    expect(() => parseConfig("version: 2\nlanguage: ru\n")).toThrow();
  });
});
