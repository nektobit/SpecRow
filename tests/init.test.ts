import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";

const tempDirs: string[] = [];

async function createTempProject(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-test-"));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("initSpecRowProject", () => {
  it("creates the SpecRow project structure with the default config", async () => {
    const cwd = await createTempProject();

    const result = await initSpecRowProject({ cwd });

    await expect(readFile(path.join(cwd, ".specrow", "config.yml"), "utf8")).resolves.toBe(
      "version: 1\nlanguage: en\n"
    );
    await expect(readFile(path.join(cwd, ".specrow", "project.md"), "utf8")).resolves.toContain("# Project");
    await expect((await stat(path.join(cwd, ".specrow", "specs"))).isDirectory()).toBe(true);
    await expect((await stat(path.join(cwd, ".specrow", "changes"))).isDirectory()).toBe(true);
    await expect((await stat(path.join(cwd, ".specrow", "archive"))).isDirectory()).toBe(true);
    await expect(stat(path.join(cwd, ".specfly"))).rejects.toThrow();
    expect(result.configCreated).toBe(true);
    expect(result.configOverwritten).toBe(false);
    expect(result.projectCreated).toBe(true);
  });

  it("uses the requested language in config.yml", async () => {
    const cwd = await createTempProject();

    await initSpecRowProject({ cwd, language: "es" });

    await expect(readFile(path.join(cwd, ".specrow", "config.yml"), "utf8")).resolves.toBe(
      "version: 1\nlanguage: es\n"
    );
    await expect(readFile(path.join(cwd, ".specrow", "project.md"), "utf8")).resolves.toContain("# Proyecto");
  });

  it("does not overwrite an existing config by default", async () => {
    const cwd = await createTempProject();
    const configPath = path.join(cwd, ".specrow", "config.yml");
    await initSpecRowProject({ cwd, language: "ru" });
    await writeFile(configPath, "version: 1\nlanguage: zh-CN\n", "utf8");

    const result = await initSpecRowProject({ cwd, language: "es" });

    await expect(readFile(configPath, "utf8")).resolves.toBe("version: 1\nlanguage: zh-CN\n");
    expect(result.configCreated).toBe(false);
    expect(result.configOverwritten).toBe(false);
  });

  it("overwrites an existing config with force", async () => {
    const cwd = await createTempProject();
    const configPath = path.join(cwd, ".specrow", "config.yml");
    await initSpecRowProject({ cwd, language: "ru" });
    await writeFile(configPath, "version: 1\nlanguage: zh-CN\n", "utf8");

    const result = await initSpecRowProject({ cwd, language: "en", force: true });

    await expect(readFile(configPath, "utf8")).resolves.toBe("version: 1\nlanguage: en\n");
    expect(result.configCreated).toBe(false);
    expect(result.configOverwritten).toBe(true);
  });

  it("uses the existing config language when creating a missing project.md", async () => {
    const cwd = await createTempProject();
    const projectPath = path.join(cwd, ".specrow", "project.md");
    await initSpecRowProject({ cwd, language: "ru" });
    await rm(projectPath);

    const result = await initSpecRowProject({ cwd, language: "en" });

    await expect(readFile(projectPath, "utf8")).resolves.toContain("# Проект");
    expect(result.language).toBe("ru");
  });

  it("fails clearly for languages without built-in templates", async () => {
    const cwd = await createTempProject();

    await expect(initSpecRowProject({ cwd, language: "fr" })).rejects.toThrow(
      'Missing SpecRow language for language "fr".'
    );
    await expect(stat(path.join(cwd, ".specrow", "project.md"))).rejects.toThrow();
  });
});
