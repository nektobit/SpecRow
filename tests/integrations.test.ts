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
  renderCodexMcpConfig,
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
    await expect(readFile(path.join(homeDir, ".codex", "config.toml"), "utf8")).resolves.toContain(
      '[mcp_servers.specrow]\ncommand = "npx"\nargs = ["-y", "specrow@latest", "mcp"]'
    );
  });

  it("renders global Codex MCP config without binding it to one project path", () => {
    expect(renderCodexMcpConfig()).toContain('args = ["-y", "specrow@latest", "mcp"]');
    expect(renderCodexMcpConfig()).not.toContain("/work/project");
    expect(renderCodexMcpConfig()).not.toContain("C:\\\\Work\\\\Project");
  });

  it("preserves unrelated Codex MCP servers when installing managed SpecRow config", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);
    const codexConfig = path.join(homeDir, ".codex", "config.toml");
    await mkdir(path.dirname(codexConfig), { recursive: true });
    await writeFile(codexConfig, '[mcp_servers.other]\ncommand = "other"\n', "utf8");

    await installSpecRowIntegrations({ cwd, homeDir, tools: "codex" });

    const config = await readFile(codexConfig, "utf8");
    expect(config).toContain('[mcp_servers.other]\ncommand = "other"');
    expect(config).toContain("[mcp_servers.specrow]");
  });

  it("preserves unrelated JSON MCP servers for Cursor config", async () => {
    const cwd = await createTempProject();
    const cursorConfig = path.join(cwd, ".cursor", "mcp.json");
    await mkdir(path.dirname(cursorConfig), { recursive: true });
    await writeFile(cursorConfig, JSON.stringify({ mcpServers: { other: { command: "other" } } }, null, 2), "utf8");

    await installSpecRowIntegrations({ cwd, tools: "cursor" });

    const config = JSON.parse(await readFile(cursorConfig, "utf8")) as {
      mcpServers: Record<string, { command: string; args?: string[] }>;
    };
    expect(config.mcpServers.other).toEqual({ command: "other" });
    expect(config.mcpServers.specrow).toEqual({
      command: "npx",
      args: ["-y", "specrow@latest", "mcp"]
    });
  });

  it("migrates legacy pinned JSON SpecRow MCP config to workspace-aware config", async () => {
    const cwd = await createTempProject();
    const cursorConfig = path.join(cwd, ".cursor", "mcp.json");
    await mkdir(path.dirname(cursorConfig), { recursive: true });
    await writeFile(
      cursorConfig,
      JSON.stringify({ mcpServers: { specrow: { command: "npx", args: ["-y", "specrow@latest", "mcp", cwd] } } }, null, 2),
      "utf8"
    );

    await installSpecRowIntegrations({ cwd, tools: "cursor" });

    const config = JSON.parse(await readFile(cursorConfig, "utf8")) as {
      mcpServers: Record<string, { command: string; args?: string[] }>;
    };
    expect(config.mcpServers.specrow).toEqual({
      command: "npx",
      args: ["-y", "specrow@latest", "mcp"]
    });
  });

  it("does not overwrite custom JSON SpecRow MCP config without force", async () => {
    const cwd = await createTempProject();
    const cursorConfig = path.join(cwd, ".cursor", "mcp.json");
    await mkdir(path.dirname(cursorConfig), { recursive: true });
    await writeFile(cursorConfig, JSON.stringify({ mcpServers: { specrow: { command: "custom" } } }, null, 2), "utf8");

    const result = await installSpecRowIntegrations({ cwd, tools: "cursor" });

    expect(result.files).toContainEqual(
      expect.objectContaining({
        tool: "cursor",
        kind: "mcp-config",
        action: "skipped"
      })
    );
    const config = JSON.parse(await readFile(cursorConfig, "utf8")) as { mcpServers: { specrow: { command: string } } };
    expect(config.mcpServers.specrow.command).toBe("custom");
  });

  it("updates only the managed Codex SpecRow MCP entry", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);
    const codexConfig = path.join(homeDir, ".codex", "config.toml");
    await mkdir(path.dirname(codexConfig), { recursive: true });
    await writeFile(
      codexConfig,
      '# SPECROW:MANAGED:mcp-config\n[mcp_servers.specrow]\ncommand = "old"\n\n[mcp_servers.other]\ncommand = "other"\n',
      "utf8"
    );

    await installSpecRowIntegrations({ cwd, homeDir, tools: "codex" });

    const config = await readFile(codexConfig, "utf8");
    expect(config).toContain('command = "npx"');
    expect(config).not.toContain('command = "old"');
    expect(config).toContain('[mcp_servers.other]\ncommand = "other"');
  });

  it("does not overwrite unmarked Codex SpecRow MCP config without force", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);
    const codexConfig = path.join(homeDir, ".codex", "config.toml");
    await mkdir(path.dirname(codexConfig), { recursive: true });
    await writeFile(codexConfig, '[mcp_servers.specrow]\ncommand = "custom"\n', "utf8");

    const result = await installSpecRowIntegrations({ cwd, homeDir, tools: "codex" });

    expect(result.files).toContainEqual(
      expect.objectContaining({
        tool: "codex",
        kind: "mcp-config",
        action: "skipped"
      })
    );
    await expect(readFile(codexConfig, "utf8")).resolves.toBe('[mcp_servers.specrow]\ncommand = "custom"\n');
  });

  it("overwrites unmarked Codex SpecRow MCP config with force", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);
    const codexConfig = path.join(homeDir, ".codex", "config.toml");
    await mkdir(path.dirname(codexConfig), { recursive: true });
    await writeFile(codexConfig, '[mcp_servers.specrow]\ncommand = "custom"\n', "utf8");

    await installSpecRowIntegrations({ cwd, homeDir, tools: "codex", force: true });

    const config = await readFile(codexConfig, "utf8");
    expect(config).toContain('command = "npx"');
    expect(config).not.toContain('command = "custom"');
  });

  it("supports opt-out from MCP config for MCP-capable integrations", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);

    const result = await installSpecRowIntegrations({ cwd, homeDir, tools: "codex", mcp: false });

    expect(result.files.some((file) => file.kind === "mcp-config")).toBe(false);
    await expect(stat(path.join(homeDir, ".codex", "config.toml"))).rejects.toThrow();
  });

  it("uses the configured language for managed Codex prompts and generic instructions", async () => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), "specrow-ru-integrations-test-"));
    tempDirs.push(cwd);
    await initSpecRowProject({ cwd, language: "ru" });
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-ru-home-"));
    tempDirs.push(homeDir);

    await installSpecRowIntegrations({ cwd, homeDir, tools: "codex,generic" });

    const reviewPrompt = await readFile(path.join(homeDir, ".codex", "prompts", "specrow-review.md"), "utf8");
    const agents = await readFile(path.join(cwd, "AGENTS.md"), "utf8");

    expect(reviewPrompt).toContain("Этот файл или раздел управляется SpecRow");
    expect(reviewPrompt).toContain("## Намерение пользователя");
    expect(reviewPrompt).toContain("Проверить готовность предложения до кода");
    expect(reviewPrompt).not.toContain("Use this workflow");
    expect(reviewPrompt).not.toContain("## User Intent");
    expect(agents).toContain("Инструкции агента SpecRow");
    expect(agents).not.toContain("SpecRow Agent Instructions");
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

  it("reports MCP-managed files in integration status", async () => {
    const cwd = await createTempProject();
    const homeDir = await mkdtemp(path.join(os.tmpdir(), "specrow-home-"));
    tempDirs.push(homeDir);

    await installSpecRowIntegrations({ cwd, homeDir, tools: "codex" });
    const status = await getIntegrationStatus(cwd);

    expect(status).toContainEqual(
      expect.objectContaining({
        tool: "codex",
        kind: "mcp-config",
        reason: "present; restart agent if this was newly installed"
      })
    );
  });
});
