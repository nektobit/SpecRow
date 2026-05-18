import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";
import { runMigration } from "../src/migration.js";

const tempDirs: string[] = [];

async function createTempProject(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-migration-test-"));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("SpecRow migration", () => {
  it("initializes SpecRow and migrates OpenSpec without deleting the source", async () => {
    const cwd = await createTempProject();
    await mkdir(path.join(cwd, "openspec", "specs", "auth"), { recursive: true });
    await mkdir(path.join(cwd, "openspec", "changes", "add-login", "specs", "auth"), { recursive: true });
    await mkdir(path.join(cwd, "openspec", "changes", "archive", "2026-01-01-old-login"), { recursive: true });
    await writeFile(path.join(cwd, "openspec", "specs", "auth", "spec.md"), "current auth spec\n", "utf8");
    await writeFile(path.join(cwd, "openspec", "changes", "add-login", "proposal.md"), "legacy proposal\n", "utf8");
    await writeFile(path.join(cwd, "openspec", "changes", "add-login", "tasks.md"), "legacy tasks\n", "utf8");
    await writeFile(path.join(cwd, "openspec", "changes", "add-login", "specs", "auth", "spec.md"), "delta auth spec\n", "utf8");
    await writeFile(path.join(cwd, "openspec", "changes", "archive", "2026-01-01-old-login", "notes.md"), "archive bytes\n", "utf8");

    const result = await runMigration({
      cwd,
      source: "openspec",
      language: "ru",
      now: new Date("2026-05-14T00:00:00.000Z")
    });

    expect(result.initialized).toBe(true);
    expect(result.source.kind).toBe("openspec");
    await expect(readFile(path.join(cwd, ".specrow", "config.yml"), "utf8")).resolves.toContain("language: ru");
    await expect(readFile(path.join(cwd, ".specrow", "specs", "auth", "spec.md"), "utf8")).resolves.toBe("current auth spec\n");
    await expect(readFile(path.join(cwd, ".specrow", "archive", "2026-01-01-old-login", "notes.md"), "utf8")).resolves.toBe(
      "archive bytes\n"
    );
    await expect(readFile(path.join(cwd, ".specrow", "changes", "add-login", "proposal.md"), "utf8")).resolves.toContain(
      "# Предложение: add-login"
    );
    await expect(readFile(path.join(cwd, ".specrow", "changes", "add-login", "source", "proposal.md"), "utf8")).resolves.toBe(
      "legacy proposal\n"
    );
    await expect(readFile(path.join(cwd, "openspec", "changes", "add-login", "proposal.md"), "utf8")).resolves.toBe(
      "legacy proposal\n"
    );
  });

  it("keeps dry-run from writing initialization or migration files", async () => {
    const cwd = await createTempProject();
    await mkdir(path.join(cwd, "docs"), { recursive: true });
    await writeFile(path.join(cwd, "docs", "capability.md"), "capability notes\n", "utf8");

    const result = await runMigration({ cwd, source: "docs", dryRun: true });

    expect(result.wouldInitialize).toBe(true);
    expect(result.copied).toHaveLength(1);
    await expect(stat(path.join(cwd, ".specrow", "config.yml"))).rejects.toThrow();
    await expect(stat(path.join(cwd, ".specrow", "specs", "imported", "capability.md"))).rejects.toThrow();
  });

  it("does not overwrite existing migration targets without force", async () => {
    const cwd = await createTempProject();
    await initSpecRowProject({ cwd });
    await mkdir(path.join(cwd, "docs"), { recursive: true });
    await mkdir(path.join(cwd, ".specrow", "specs", "imported"), { recursive: true });
    await writeFile(path.join(cwd, "docs", "capability.md"), "new notes\n", "utf8");
    await writeFile(path.join(cwd, ".specrow", "specs", "imported", "capability.md"), "existing notes\n", "utf8");

    const result = await runMigration({ cwd, source: "docs" });

    expect(result.skipped).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          targetPath: path.join(".specrow", "specs", "imported", "capability.md"),
          reason: "Target file already exists."
        })
      ])
    );
    await expect(readFile(path.join(cwd, ".specrow", "specs", "imported", "capability.md"), "utf8")).resolves.toBe(
      "existing notes\n"
    );
  });

  it("migrates SpecKit feature artifacts into active SpecRow changes", async () => {
    const cwd = await createTempProject();
    await initSpecRowProject({ cwd, language: "en" });
    await mkdir(path.join(cwd, ".specify"), { recursive: true });
    await mkdir(path.join(cwd, "specs", "001-login"), { recursive: true });
    await writeFile(path.join(cwd, "specs", "001-login", "spec.md"), "# Login spec\n", "utf8");
    await writeFile(path.join(cwd, "specs", "001-login", "plan.md"), "# Login plan\n", "utf8");
    await writeFile(path.join(cwd, "specs", "001-login", "tasks.md"), "# Login tasks\n", "utf8");

    const result = await runMigration({
      cwd,
      source: "speckit",
      now: new Date("2026-05-14T00:00:00.000Z")
    });

    expect(result.converted).toEqual([
      expect.objectContaining({
        sourcePath: path.join("specs", "001-login"),
        targetPath: path.join(".specrow", "changes", "001-login")
      })
    ]);
    await expect(readFile(path.join(cwd, ".specrow", "changes", "001-login", "status.yml"), "utf8")).resolves.toContain(
      "state: proposed"
    );
    await expect(readFile(path.join(cwd, ".specrow", "changes", "001-login", "source", "plan.md"), "utf8")).resolves.toBe(
      "# Login plan\n"
    );
    await expect(readFile(path.join(cwd, ".specrow", "changes", "001-login", "specs", "001-login", "spec.md"), "utf8")).resolves.toBe(
      "# Login spec\n"
    );
  });
});
