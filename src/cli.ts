import type { Command } from "commander";

import { createCoreProgram } from "./cliCore.js";
import { startSpecRowMcpServer } from "./mcpServer.js";

export function createProgram(): Command {
  return createCoreProgram({
    registerMcpCommand(program) {
      program
        .command("mcp")
        .description("Run the local SpecRow MCP stdio server for agents.")
        .argument("[project-path]")
        .action(async (projectPath?: string) => {
          try {
            await startSpecRowMcpServer({ projectRoot: projectPath });
          } catch (error) {
            console.error(error instanceof Error ? error.message : String(error));
            process.exitCode = 1;
          }
        });
    }
  });
}
