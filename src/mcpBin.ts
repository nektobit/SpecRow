#!/usr/bin/env node
import { startSpecRowMcpServer } from "./mcpServer.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`SpecRow MCP stdio server

Usage:
  specrow-mcp [project-path]
  specrow mcp [project-path]

Runs a local stdio MCP server for agents. The optional project path locks all
SpecRow operations to that project root. If omitted, the current working
directory is used.`);
  process.exit(0);
}

try {
  await startSpecRowMcpServer({ projectRoot: args[0] });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
