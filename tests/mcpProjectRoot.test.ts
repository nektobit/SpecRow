import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { initSpecRowProject } from "../src/init.js";
import { resolveRequestProjectRoot } from "../src/mcp/projectRoot.js";
import { createSpecRowMcpRuntime } from "../src/mcpServer.js";

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "specrow-root-test-"));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("request-scoped MCP project roots", () => {
  it("lets a tool call select a project independently from the server working directory", async () => {
    const pluginRoot = await createTempDir();
    const projectRoot = await createTempDir();
    const runtime = await createSpecRowMcpRuntime({ projectRoot: pluginRoot });

    await expect(
      runtime.callTool("specrow_init", { projectRoot, language: "ru" })
    ).resolves.toMatchObject({
      success: true,
      projectRoot: path.resolve(projectRoot),
      language: "ru"
    });
  });

  it("does not fall back to the plugin installation directory in Agent Plugin mode", async () => {
    const pluginRoot = await createTempDir();
    const runtime = await createSpecRowMcpRuntime({
      projectRoot: pluginRoot,
      env: { PLUGIN_ROOT: pluginRoot }
    });

    await expect(runtime.callTool("specrow_project_status")).resolves.toMatchObject({
      success: false,
      code: "INVALID_PROJECT_ROOT",
      suggestion: expect.stringContaining("projectRoot")
    });
  });

  it("uses a single filesystem root announced by the MCP client", async () => {
    const pluginRoot = await createTempDir();
    const projectRoot = await createTempDir();

    await expect(
      resolveRequestProjectRoot({
        defaultProjectRoot: pluginRoot,
        listRoots: async () => [{ uri: pathToFileURL(projectRoot).href }]
      })
    ).resolves.toBe(path.resolve(projectRoot));
  });

  it("selects the only initialized SpecRow project when a client announces multiple roots", async () => {
    const pluginRoot = await createTempDir();
    const initializedRoot = await createTempDir();
    const otherRoot = await createTempDir();
    await initSpecRowProject({ cwd: initializedRoot, language: "en" });

    await expect(
      resolveRequestProjectRoot({
        defaultProjectRoot: pluginRoot,
        listRoots: async () => [
          { uri: pathToFileURL(otherRoot).href },
          { uri: pathToFileURL(initializedRoot).href }
        ]
      })
    ).resolves.toBe(path.resolve(initializedRoot));
  });

  it("requires an explicit projectRoot when multiple roots remain ambiguous", async () => {
    const pluginRoot = await createTempDir();
    const firstRoot = await createTempDir();
    const secondRoot = await createTempDir();

    await expect(
      resolveRequestProjectRoot({
        defaultProjectRoot: pluginRoot,
        listRoots: async () => [
          { uri: pathToFileURL(firstRoot).href },
          { uri: pathToFileURL(secondRoot).href }
        ]
      })
    ).rejects.toThrow("Multiple MCP workspace roots");
  });

  it("rejects an explicit projectRoot outside roots announced by the client", async () => {
    const pluginRoot = await createTempDir();
    const announcedRoot = await createTempDir();
    const outsideRoot = await createTempDir();

    await expect(
      resolveRequestProjectRoot({
        requestedProjectRoot: outsideRoot,
        defaultProjectRoot: pluginRoot,
        listRoots: async () => [{ uri: pathToFileURL(announcedRoot).href }]
      })
    ).rejects.toThrow("outside the workspace roots");
  });

  it("rejects a relative projectRoot so plugin cwd cannot affect workspace selection", async () => {
    const pluginRoot = await createTempDir();

    await expect(
      resolveRequestProjectRoot({
        requestedProjectRoot: ".",
        defaultProjectRoot: pluginRoot
      })
    ).rejects.toThrow("absolute filesystem path");
  });
});
