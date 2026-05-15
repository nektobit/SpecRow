import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";
import { createChange, markChangeBuilt, markRevisionNeeded } from "../src/lifecycle.js";
import { createSpecRowMcpRuntime, resolveSpecRowMcpProjectRoot } from "../src/mcpServer.js";

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-mcp-test-"));
  tempDirs.push(tempDir);
  return tempDir;
}

async function createTempProject(language = "en"): Promise<string> {
  const tempDir = await createTempDir();
  await initSpecRowProject({ cwd: tempDir, language });
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("SpecRow MCP runtime", () => {
  it("creates a runtime locked to an existing project root", async () => {
    const cwd = await createTempDir();

    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    expect(runtime.projectRoot).toBe(path.resolve(cwd));
    expect(runtime.server.isConnected()).toBe(false);
  });

  it("rejects invalid project roots before server setup", async () => {
    const cwd = await createTempDir();

    await expect(resolveSpecRowMcpProjectRoot(path.join(cwd, "missing"))).rejects.toThrow("directory does not exist");
  });

  it("reports whether the workspace is already initialized", async () => {
    const cwd = await createTempDir();
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    await expect(runtime.callTool("specrow_project_status")).resolves.toMatchObject({
      success: true,
      projectRoot: path.resolve(cwd),
      initialized: false,
      absoluteConfigPath: path.join(path.resolve(cwd), ".specrow", "config.yml"),
      nextSteps: [expect.stringContaining("specrow_init")]
    });

    await runtime.callTool("specrow_init", { language: "ru" });

    await expect(runtime.callTool("specrow_project_status")).resolves.toMatchObject({
      success: true,
      projectRoot: path.resolve(cwd),
      initialized: true,
      language: "ru",
      nextSteps: [expect.stringContaining("specrow_validate")]
    });
  });

  it("initializes a SpecRow project through specrow_init", async () => {
    const cwd = await createTempDir();
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    await expect(runtime.callTool("specrow_init", { language: "ru" })).resolves.toMatchObject({
      success: true,
      projectRoot: path.resolve(cwd),
      configPath: path.join(".specrow", "config.yml"),
      absoluteConfigPath: path.join(path.resolve(cwd), ".specrow", "config.yml"),
      projectPath: path.join(".specrow", "project.md"),
      absoluteProjectPath: path.join(path.resolve(cwd), ".specrow", "project.md"),
      language: "ru"
    });
    await expect(readFile(path.join(cwd, ".specrow", "config.yml"), "utf8")).resolves.toContain("language: ru");
  });

  it("creates proposals with structured lifecycle output", async () => {
    const cwd = await createTempProject();
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    await expect(runtime.callTool("specrow_create_proposal", { changeName: "mcp-flow", review: "required" })).resolves.toMatchObject({
      success: true,
      proposalPath: path.join(".specrow", "changes", "mcp-flow", "proposal.md"),
      tasksPath: path.join(".specrow", "changes", "mcp-flow", "tasks.md"),
      status: {
        change: "mcp-flow",
        state: "proposed",
        review: { state: "required" }
      }
    });
    await expect(stat(path.join(cwd, ".specrow", "changes", "mcp-flow", "status.yml"))).resolves.toBeTruthy();
  });

  it("keeps the context shape aligned with the CLI context command", async () => {
    const cwd = await createTempProject("es");
    await createChange({ cwd, changeName: "context-shape" });
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    await expect(runtime.callTool("specrow_context", { changeName: "context-shape" })).resolves.toMatchObject({
      success: true,
      context: {
        specrow: {
          root: ".specrow",
          config: { language: "es" }
        },
        activeChanges: {
          changes: [{ change: "context-shape" }],
          warnings: []
        },
        change: {
          root: path.join(".specrow", "changes", "context-shape"),
          status: { change: "context-shape" }
        }
      }
    });
  });

  it("enforces the explicit accept gate and revision follow-up gate", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "accept-gate" });
    await markChangeBuilt(cwd, "accept-gate");
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    await expect(runtime.callTool("specrow_accept", { changeName: "accept-gate", explicitUserAcceptance: false })).resolves.toMatchObject({
      success: false,
      code: "INVALID_STATE",
      suggestion: expect.stringContaining("/specrow:accept")
    });
    await expect(runtime.callTool("specrow_accept", { changeName: "accept-gate", explicitUserAcceptance: true })).resolves.toMatchObject({
      success: true,
      nextSteps: [expect.stringContaining("specrow_archive")],
      status: {
        state: "accepted",
        acceptance: { explicit: true }
      }
    });

    await createChange({ cwd, changeName: "revision-gate" });
    await markRevisionNeeded(cwd, "revision-gate");
    await expect(runtime.callTool("specrow_accept", { changeName: "revision-gate", explicitUserAcceptance: true })).resolves.toMatchObject({
      success: false,
      code: "INVALID_STATE"
    });
    await expect(
      runtime.callTool("specrow_accept", {
        changeName: "revision-gate",
        explicitUserAcceptance: true,
        followUpWorkCompleted: true
      })
    ).resolves.toMatchObject({
      success: true,
      status: { state: "accepted" }
    });
  });

  it("rejects path traversal change names before file access", async () => {
    const cwd = await createTempProject();
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    for (const changeName of ["../escape", "..\\escape", "/absolute", "nested/name"]) {
      await expect(runtime.callTool("specrow_create_proposal", { changeName })).resolves.toMatchObject({
        success: false,
        code: "UNSAFE_PATH"
      });
    }
  });

  it("exposes read-only project and change resources", async () => {
    const cwd = await createTempProject();
    await createChange({ cwd, changeName: "resource-flow" });
    const runtime = await createSpecRowMcpRuntime({ projectRoot: cwd });

    await expect(runtime.listResourceUris()).resolves.toEqual(
      expect.arrayContaining([
        "specrow://project/config",
        "specrow://project/project-md",
        "specrow://changes",
        "specrow://changes/resource-flow/proposal",
        "specrow://changes/resource-flow/tasks",
        "specrow://changes/resource-flow/status",
        "specrow://specs"
      ])
    );
    await expect(runtime.readResource("specrow://changes/resource-flow/status")).resolves.toContain("change: resource-flow");
    await expect(runtime.readResource("specrow://changes/../escape/status")).rejects.toThrow("Unknown SpecRow resource");
  });
});
