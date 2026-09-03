import { copyFile, mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, describe, expect, it } from "vitest";

const tempDirs: string[] = [];

async function createTempDir(prefix: string): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((tempDir) => rm(tempDir, { recursive: true, force: true })));
});

describe("packaged Agent Plugin runtime", () => {
  it("starts from an isolated plugin directory and serves MCP tools without node_modules", async () => {
    const pluginRoot = await createTempDir("specrow-plugin-runtime-");
    const projectRoot = await createTempDir("specrow-plugin-project-");
    const pluginData = path.join(pluginRoot, "data");
    const runtimeRoot = path.join(pluginRoot, "runtime");
    await mkdir(pluginData, { recursive: true });
    await mkdir(runtimeRoot, { recursive: true });
    await copyFile(
      path.resolve("runtime", "specrow-mcp.cjs"),
      path.join(runtimeRoot, "specrow-mcp.cjs")
    );

    const client = new Client({ name: "specrow-plugin-test", version: "1.0.0" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.join(runtimeRoot, "specrow-mcp.cjs")],
      cwd: pluginRoot,
      env: {
        ...process.env,
        PLUGIN_ROOT: pluginRoot,
        PLUGIN_DATA: pluginData
      }
    });

    try {
      await client.connect(transport);
      const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as {
        version: string;
      };
      expect(client.getServerVersion()).toMatchObject({
        name: "specrow",
        version: packageJson.version
      });
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name)).toEqual(
        expect.arrayContaining(["specrow_project_status", "specrow_init", "specrow_validate"])
      );

      const missingRoot = await client.callTool({
        name: "specrow_project_status",
        arguments: {}
      });
      expect(missingRoot.isError).toBe(true);
      expect(missingRoot.structuredContent).toMatchObject({
        success: false,
        code: "INVALID_PROJECT_ROOT"
      });

      const result = await client.callTool({
        name: "specrow_project_status",
        arguments: { projectRoot }
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        success: true,
        projectRoot: path.resolve(projectRoot),
        initialized: false
      });
    } finally {
      await client.close();
    }
  });
});
