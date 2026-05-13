import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecFlyProject } from "../src/init.js";

const tempDirs: string[] = [];

async function createTempProject(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specfly-test-"));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("initSpecFlyProject", () => {
  it("creates the SpecFly project structure with the default config", async () => {
    const cwd = await createTempProject();

    const result = await initSpecFlyProject({ cwd });

    await expect(readFile(path.join(cwd, ".specfly", "config.yml"), "utf8")).resolves.toBe(
      "version: 1\nlanguage: en\n"
    );
    await expect((await stat(path.join(cwd, ".specfly", "specs"))).isDirectory()).toBe(true);
    await expect((await stat(path.join(cwd, ".specfly", "changes"))).isDirectory()).toBe(true);
    await expect((await stat(path.join(cwd, ".specfly", "archive"))).isDirectory()).toBe(true);
    expect(result.configCreated).toBe(true);
    expect(result.configOverwritten).toBe(false);
  });

  it("uses the requested language in config.yml", async () => {
    const cwd = await createTempProject();

    await initSpecFlyProject({ cwd, language: "es" });

    await expect(readFile(path.join(cwd, ".specfly", "config.yml"), "utf8")).resolves.toBe(
      "version: 1\nlanguage: es\n"
    );
  });

  it("does not overwrite an existing config by default", async () => {
    const cwd = await createTempProject();
    const configPath = path.join(cwd, ".specfly", "config.yml");
    await initSpecFlyProject({ cwd, language: "ru" });
    await writeFile(configPath, "version: 1\nlanguage: zh-CN\n", "utf8");

    const result = await initSpecFlyProject({ cwd, language: "es" });

    await expect(readFile(configPath, "utf8")).resolves.toBe("version: 1\nlanguage: zh-CN\n");
    expect(result.configCreated).toBe(false);
    expect(result.configOverwritten).toBe(false);
  });

  it("overwrites an existing config with force", async () => {
    const cwd = await createTempProject();
    const configPath = path.join(cwd, ".specfly", "config.yml");
    await initSpecFlyProject({ cwd, language: "ru" });
    await writeFile(configPath, "version: 1\nlanguage: zh-CN\n", "utf8");

    const result = await initSpecFlyProject({ cwd, language: "en", force: true });

    await expect(readFile(configPath, "utf8")).resolves.toBe("version: 1\nlanguage: en\n");
    expect(result.configCreated).toBe(false);
    expect(result.configOverwritten).toBe(true);
  });
});
