#!/usr/bin/env node
import path from "node:path";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { Command } from "commander";
import { ZodError } from "zod";

import { loadSpecRowConfig } from "./config.js";
import { initSpecRowProject } from "./init.js";
import {
  acceptChange,
  archiveChange,
  createChange,
  listActiveChanges,
  markChangeBuilt,
  markChangeReviewed,
  markRevisionNeeded,
  readChangeStatus,
  type LifecycleStatus
} from "./lifecycle.js";
import { getSpecRowMessage } from "./templates.js";
import { reviewChangeReadiness, validateSpecRowProject, type ValidationIssue } from "./validation.js";

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

  program
    .command("proposal")
    .description("Create a SpecRow change proposal directory.")
    .argument("<change-name>")
    .option("--review <state>", "Initial review tracking state: required or recommended.", "recommended")
    .action(async (changeName: string, options: { review: "required" | "recommended" }) => {
      try {
        const result = await createChange({
          changeName,
          review: options.review
        });

        console.log(getSpecRowMessage(result.language, "lifecycle.proposed"));
        console.log(pathForDisplay(result.root));
      } catch (error) {
        if (error instanceof ZodError) {
          console.error(`Invalid status: ${error.issues.map((issue) => issue.message).join("; ")}`);
        } else if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(String(error));
        }

        process.exitCode = 1;
      }
    });

  program
    .command("validate")
    .description("Validate the SpecRow workspace or a single change.")
    .argument("[change-name]")
    .action(async (changeName?: string) => {
      try {
        const result = await validateSpecRowProject(process.cwd(), changeName);
        printValidationResult(result.language, result.issues);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("review")
    .description("Review a change proposal and mark review as completed.")
    .argument("<change-name>")
    .action(async (changeName: string) => {
      try {
        const result = await reviewChangeReadiness(process.cwd(), changeName);
        const hasErrors = printValidationResult(result.language, result.issues);

        if (hasErrors) {
          return;
        }

        const status = await markChangeReviewed(process.cwd(), changeName);
        console.log(getSpecRowMessage(result.language, result.issues.length > 0 ? "review.warning" : "lifecycle.reviewed"));
        printStatusLine(result.language, status);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("status")
    .description("Show status for active changes or a single change.")
    .argument("[change-name]")
    .action(async (changeName?: string) => {
      try {
        const language = await loadProjectLanguage();

        if (changeName !== undefined) {
          printStatusLine(language, await readChangeStatus(process.cwd(), changeName));
          return;
        }

        await printActiveChangeList(language);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("context")
    .description("Print agent-readable SpecRow context.")
    .argument("[change-name]")
    .action(async (changeName?: string) => {
      try {
        const config = await loadSpecRowConfig(process.cwd());
        const activeChanges = await listActiveChanges();
        const context: Record<string, unknown> = {
          specrow: {
            root: pathForDisplay(path.join(process.cwd(), ".specrow")),
            config
          },
          activeChanges
        };

        if (changeName !== undefined) {
          const changeRoot = path.join(process.cwd(), ".specrow", "changes", changeName);
          context.change = {
            root: pathForDisplay(changeRoot),
            status: await readChangeStatus(process.cwd(), changeName),
            proposal: await readFile(path.join(changeRoot, "proposal.md"), "utf8"),
            tasks: await readFile(path.join(changeRoot, "tasks.md"), "utf8")
          };
        }

        console.log(JSON.stringify(context, null, 2));
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("build-start")
    .description("Check that a change is ready for implementation.")
    .argument("<change-name>")
    .action(async (changeName: string) => {
      try {
        const result = await validateSpecRowProject(process.cwd(), changeName);
        const hasErrors = printValidationResult(result.language, result.issues);

        if (hasErrors) {
          return;
        }

        const status = await readChangeStatus(process.cwd(), changeName);
        console.log(getSpecRowMessage(result.language, "build.started", { change: status.change }));
        printStatusLine(result.language, status);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("build-finish")
    .description("Mark implementation work as built without accepting or archiving it.")
    .argument("<change-name>")
    .action(async (changeName: string) => {
      try {
        const language = await loadProjectLanguage();
        const status = await markChangeBuilt(process.cwd(), changeName);
        console.log(getSpecRowMessage(language, "lifecycle.built"));
        console.log(getSpecRowMessage(language, "next.acceptOrRevise"));
        printStatusLine(language, status);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("revise")
    .description("Mark a change as needing revision.")
    .argument("<change-name>")
    .action(async (changeName: string) => {
      try {
        const language = await loadProjectLanguage();
        const status = await markRevisionNeeded(process.cwd(), changeName);
        console.log(getSpecRowMessage(language, "lifecycle.revisionNeeded"));
        printStatusLine(language, status);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("accept")
    .description("Mark a built change as explicitly accepted by the user.")
    .argument("<change-name>")
    .option("--yes", "Confirm explicit user acceptance.", false)
    .option("--follow-up-work-completed", "Confirm completed follow-up work for revision-needed changes.", false)
    .action(async (changeName: string, options: { yes: boolean; followUpWorkCompleted: boolean }) => {
      try {
        const language = await loadProjectLanguage();
        const status = await acceptChange(process.cwd(), changeName, {
          explicitUserAcceptance: options.yes,
          followUpWorkCompleted: options.followUpWorkCompleted
        });
        console.log(getSpecRowMessage(language, "lifecycle.accepted"));
        printStatusLine(language, status);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("archive")
    .description("Archive an accepted change.")
    .argument("<change-name>")
    .action(async (changeName: string) => {
      try {
        const language = await loadProjectLanguage();
        const status = await archiveChange(process.cwd(), changeName);
        console.log(getSpecRowMessage(language, "lifecycle.archived"));
        printStatusLine(language, status);
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("list")
    .description("List active SpecRow changes.")
    .action(async () => {
      try {
        await printActiveChangeList(await loadProjectLanguage());
      } catch (error) {
        handleCommandError(error);
      }
    });

  return program;
}

function pathForDisplay(targetPath: string): string {
  return path.relative(process.cwd(), targetPath) || ".";
}

async function loadProjectLanguage(): Promise<string> {
  return (await loadSpecRowConfig(process.cwd())).language;
}

function printValidationResult(language: string, issues: ValidationIssue[]): boolean {
  const hasErrors = issues.some((issue) => issue.severity === "error");
  console.log(getSpecRowMessage(language, hasErrors ? "validate.failed" : "validate.ok"));

  for (const issue of issues) {
    const label = issue.severity.toUpperCase();
    console.log(`${label} ${issue.path}: ${issue.message}`);
  }

  if (hasErrors) {
    process.exitCode = 1;
  }

  return hasErrors;
}

async function printActiveChangeList(language: string): Promise<void> {
  const result = await listActiveChanges();

  if (result.changes.length === 0) {
    console.log(getSpecRowMessage(language, "list.empty"));
  }

  for (const change of result.changes) {
    printStatusLine(language, change);
  }

  for (const warning of result.warnings) {
    console.log(getSpecRowMessage(language, "list.warning", { warning }));
  }
}

function printStatusLine(language: string, status: LifecycleStatus): void {
  console.log(
    getSpecRowMessage(language, "status.change", {
      change: status.change,
      state: status.state,
      review: status.review.state,
      accepted: String(status.acceptance.explicit)
    })
  );
}

function handleCommandError(error: unknown): void {
  if (error instanceof ZodError) {
    console.error(`Invalid SpecRow data: ${error.issues.map((issue) => issue.message).join("; ")}`);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }

  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await createProgram().parseAsync();
}
