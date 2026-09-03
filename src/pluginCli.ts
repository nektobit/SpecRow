#!/usr/bin/env node
import { createCoreProgram } from "./cliCore.js";

createCoreProgram().parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
