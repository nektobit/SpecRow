#!/usr/bin/env node
import { startSpecRowMcpServer } from "./mcpServer.js";

async function main(): Promise<void> {
  try {
    await startSpecRowMcpServer();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

void main();
