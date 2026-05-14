import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";
import {
  detectIntegrationTools,
  getIntegrationStatus,
  installSpecRowIntegrations,
  parseIntegrationTools,
  updateSpecRowIntegrations
} from "../src/integrations.js";
import { parseConfig } from "../src/config.js";

const tempDirs: string[] = [];

async function createTempProject(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-integrations-test-"));
  tempDirs.push(tempDir);
  await initSpecRowProject({ cwd: tempDir });
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("SpecRow integrations", () => {
  it("parses integration tool selections", () => {
    expect(parseIntegrationTools("codex,generic,codex")).toEqual(["codex", "generic"]);
    expect(parseIntegrationTools("all")).toEqual(["codex", "claude", "cursor", "windsurf", "generic"]);
    expect(parseIntegrationTools("none")).toEqual([]);
    expect(() => parseIntegrationTools("unknown")).toThrow('Unknown SpecRow integration tool "unknown".');
  });

  it("installs generic AGENTS.md instructions and records config metadata", async () => {
    const cwd = await createTempProject();

    const result = await installSpecRowIntegrations({
      cwd,
      tools: "generic",
      now: new Date("2026-05-14T00:00:00.000Z")
    });

    expect(result.tools).toEqual(["generic"]);
    await expect(readFile(path.join(cwd, "AGENTS.md"), "utf8")).resolves.toContain("/specrow:init");

    const config = parseConfig(await readFile(path.join(cwd, ".specrow", "config.yml"), "utf8"));
    expect(config.integrations?.tools).toEqual(["generic"]);
    expect(config.integrations?.installedAt).toBe("2026-05-14T00:00:00.000Z");
    expect(config.integrations?.managedFiles).toEqual([
      {
        tool: "generic",
        path: "AGENTS.md",
        kind: "instructions"
      }
    ]);
  });

  it("installs Codex prompts and skill into the configured home directory", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);

    await installSpecRowIntegrations({ cwd, homeDir, tools: "codex" });

    await expect(readFile(path.join(homeDir, ".codex", "prompts", "specrow-init.md"), "utf8")).resolves.toContain(
      "/specrow:init"
    );
    await expect(readFile(path.join(homeDir, ".codex", "skills", "specrow", "SKILL.md"), "utf8")).resolves.toContain(
      "SpecRow Agent Instructions"
    );
  });

  it("detects project-local agent folders and falls back to generic", async () => {
    const cwd = await createTempProject();
    await mkdir(path.join(cwd, ".cursor"), { recursive: true });

    await expect(detectIntegrationTools({ cwd, homeDir: path.join(cwd, "home"), env: {} })).resolves.toEqual(["cursor"]);
    await expect(detectIntegrationTools({ cwd, homeDir: path.join(cwd, "home-empty"), env: {} })).resolves.toEqual([
      "cursor"
    ]);

    const otherProject = await createTempProject();
    await expect(detectIntegrationTools({ cwd: otherProject, homeDir: path.join(otherProject, "home"), env: {} })).resolves.toEqual([
      "generic"
    ]);
  });

  it("does not overwrite existing unmarked integration files without force", async () => {
    const cwd = await createTempProject();
    const cursorCommand = path.join(cwd, ".cursor", "commands", "specrow-init.md");
    await mkdir(path.dirname(cursorCommand), { recursive: true });
    await writeFile(cursorCommand, "custom command\n", "utf8");

    const result = await installSpecRowIntegrations({ cwd, tools: "cursor" });

    expect(result.files).toContainEqual(
      expect.objectContaining({
        tool: "cursor",
        path: ".cursor/commands/specrow-init.md",
        action: "skipped"
      })
    );
    await expect(readFile(cursorCommand, "utf8")).resolves.toBe("custom command\n");
  });

  it("supports dry-run and update of configured integrations", async () => {
    const cwd = await createTempProject();

    const dryRun = await installSpecRowIntegrations({ cwd, tools: "generic", dryRun: true });

    expect(dryRun.files[0]).toEqual(expect.objectContaining({ action: "would-create" }));
    await expect(stat(path.join(cwd, "AGENTS.md"))).rejects.toThrow();

    await installSpecRowIntegrations({ cwd, tools: "generic" });
    const update = await updateSpecRowIntegrations({ cwd });
    const status = await getIntegrationStatus(cwd);

    expect(update.tools).toEqual(["generic"]);
    expect(status).toEqual([
      expect.objectContaining({
        tool: "generic",
        path: "AGENTS.md",
        reason: "present"
      })
    ]);
  });
});
