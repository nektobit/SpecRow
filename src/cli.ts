#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";

import { Command } from "commander";
import { ZodError } from "zod";

import { initSpecRowProject } from "./init.js";
import { getSpecRowMessage } from "./templates.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("specrow")
    .description("SpecRow CLI")
    .version("0.1.0");

  program
    .command("init")
    .description("Create the .specrow project structure.")
    .option("-l, --language <code>", "Project language code.", "en")
    .option("-f, --force", "Overwrite .specrow/config.yml if it already exists.", false)
    .action(async (options: { language: string; force: boolean }) => {
      try {
        const result = await initSpecRowProject({
          language: options.language,
          force: options.force
        });

        const relativeConfigPath = pathForDisplay(result.configPath);

        if (result.configCreated) {
          console.log(getSpecRowMessage(result.language, "init.config.created", { path: relativeConfigPath }));
        } else if (result.configOverwritten) {
          console.log(getSpecRowMessage(result.language, "init.config.overwritten", { path: relativeConfigPath }));
        } else {
          console.log(getSpecRowMessage(result.language, "init.config.kept", { path: relativeConfigPath }));
        }

        console.log(getSpecRowMessage(result.language, "init.ready", { path: pathForDisplay(result.root) }));
      } catch (error) {
        if (error instanceof ZodError) {
          console.error(`Invalid config: ${error.issues.map((issue) => issue.message).join("; ")}`);
        } else if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(String(error));
        }

        process.exitCode = 1;
      }
    });

  return program;
}

function pathForDisplay(targetPath: string): string {
  return path.relative(process.cwd(), targetPath) || ".";
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await createProgram().parseAsync();
}
