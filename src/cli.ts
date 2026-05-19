#!/usr/bin/env node
import path from "node:path";
import { readFile } from "node:fs/promises";

import { Command } from "commander";
import { ZodError } from "zod";

import {
  acceptChange,
  archiveChange,
  createChange,
  getIntegrationStatus,
  getSpecRowMessage,
  initSpecRowProject,
  installSpecRowIntegrations,
  listActiveChanges,
  loadSpecRowConfig,
  markChangeBuilt,
  markChangeReviewed,
  markRevisionNeeded,
  reviewChangeReadiness,
  readChangeStatus,
  runMigration,
  updateSpecRowIntegrations,
  validateSpecRowProject,
  type IntegrationInstallResult,
  type LifecycleStatus,
  type MigrationResult
} from "./core/index.js";
import { validateLocaleContract } from "./localeContract.js";
import { startSpecRowMcpServer } from "./mcpServer.js";
import type { ValidationIssue } from "./core/index.js";

const SPECROW_VERSION = "0.1.11";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("specrow")
    .description("SpecRow CLI")
    .version(SPECROW_VERSION);

  program
    .command("init")
    .description("Create the .specrow project structure.")
    .option("-l, --language <code>", "Project language code.", "en")
    .option("-f, --force", "Overwrite .specrow/config.yml if it already exists.", false)
    .option("--tools <list>", "Install agent integrations: codex,claude,cursor,windsurf,generic,all,none.")
    .option("--detect", "Detect agent integrations to install.", false)
    .option("--mcp", "Install MCP configuration for supported agent integrations.", true)
    .option("--no-mcp", "Skip MCP configuration and install only command, skill, rule, or prompt guidance.")
    .option("--dry-run", "Show integration files without writing them.", false)
    .action(async (options: { language: string; force: boolean; tools?: string; detect: boolean; mcp: boolean; dryRun: boolean }) => {
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

        if (options.tools !== undefined || options.detect) {
          printIntegrationResult(
            await installSpecRowIntegrations({
              tools: options.tools,
              detect: options.detect,
              force: options.force,
              mcp: options.mcp,
              dryRun: options.dryRun
            })
          );
        }
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
    .command("migrate")
    .description("Migrate OpenSpec, SpecKit, or documentation folder artifacts into SpecRow.")
    .argument("[source]", "Known system name (openspec, speckit, system) or documentation folder.")
    .option("-l, --language <code>", "Project language code for auto-initialization.", "en")
    .option("--source-root <path>", "Root used to detect known specification systems.")
    .option("-f, --force", "Overwrite existing migration target files.", false)
    .option("--dry-run", "Show the migration plan without writing files.", false)
    .action(async (source: string | undefined, options: { language: string; sourceRoot?: string; force: boolean; dryRun: boolean }) => {
      try {
        printMigrationResult(
          await runMigration({
            source,
            sourceRoot: options.sourceRoot,
            language: options.language,
            force: options.force,
            dryRun: options.dryRun
          })
        );
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("integrate")
    .description("Install SpecRow agent integrations for the current project.")
    .option("--tools <list>", "Agent integrations: codex,claude,cursor,windsurf,generic,all,none. Defaults to detection.")
    .option("--detect", "Detect agent integrations to install.", false)
    .option("--mcp", "Install MCP configuration for supported agent integrations.", true)
    .option("--no-mcp", "Skip MCP configuration and install only command, skill, rule, or prompt guidance.")
    .option("-f, --force", "Overwrite existing unmarked integration files.", false)
    .option("--dry-run", "Show integration files without writing them.", false)
    .action(async (options: { tools?: string; detect: boolean; mcp: boolean; force: boolean; dryRun: boolean }) => {
      try {
        printIntegrationResult(
          await installSpecRowIntegrations({
            tools: options.tools,
            detect: options.detect || options.tools === undefined,
            force: options.force,
            mcp: options.mcp,
            dryRun: options.dryRun
          })
        );
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("update")
    .description("Regenerate installed SpecRow agent integrations.")
    .option("--tools <list>", "Override configured integrations: codex,claude,cursor,windsurf,generic,all,none.")
    .option("--mcp", "Regenerate MCP configuration for supported agent integrations.", true)
    .option("--no-mcp", "Skip MCP configuration and regenerate only command, skill, rule, or prompt guidance.")
    .option("-f, --force", "Overwrite existing unmarked integration files.", false)
    .option("--dry-run", "Show integration files without writing them.", false)
    .action(async (options: { tools?: string; mcp: boolean; force: boolean; dryRun: boolean }) => {
      try {
        printIntegrationResult(
          await updateSpecRowIntegrations({
            tools: options.tools,
            force: options.force,
            mcp: options.mcp,
            dryRun: options.dryRun
          })
        );
      } catch (error) {
        handleCommandError(error);
      }
    });

  const integrations = program.command("integrations").description("Inspect SpecRow agent integrations.");

  integrations
    .command("status")
    .description("Show installed SpecRow agent integration files.")
    .action(async () => {
      try {
        const files = await getIntegrationStatus(process.cwd());

        if (files.length === 0) {
          console.log("No SpecRow integrations are configured.");
          return;
        }

        for (const file of files) {
          console.log(`${file.tool} ${file.kind} ${file.path}: ${file.reason}`);
        }
      } catch (error) {
        handleCommandError(error);
      }
    });

  const locales = program.command("locales").description("Inspect SpecRow localization coverage.");

  locales
    .command("validate")
    .description("Validate runtime and documentation locale coverage.")
    .action(async () => {
      try {
        const issues = await validateLocaleContract(process.cwd());

        if (issues.length === 0) {
          console.log("Locale validation passed.");
          return;
        }

        for (const issue of issues) {
          console.log(`${issue.severity.toUpperCase()} ${issue.path}: ${issue.message}`);
        }

        if (issues.some((issue) => issue.severity === "error")) {
          process.exitCode = 1;
        }
      } catch (error) {
        handleCommandError(error);
      }
    });

  program
    .command("mcp")
    .description("Run the local SpecRow MCP stdio server for agents.")
    .argument("[project-path]")
    .action(async (projectPath?: string) => {
      try {
        await startSpecRowMcpServer({ projectRoot: projectPath });
      } catch (error) {
        handleCommandError(error);
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

function printIntegrationResult(result: IntegrationInstallResult): void {
  if (result.detectedTools.length > 0) {
    console.log(`Detected integrations: ${result.detectedTools.join(", ")}`);
  }

  if (result.tools.length === 0) {
    console.log("No SpecRow integrations selected.");
    return;
  }

  console.log(`${result.dryRun ? "Planned" : "Installed"} integrations: ${result.tools.join(", ")}`);

  for (const file of result.files) {
    const reason = file.reason === undefined ? "" : ` (${file.reason})`;
    console.log(`${file.action} ${file.tool} ${file.kind} ${file.path}${reason}`);
  }
}

function printMigrationResult(result: MigrationResult): void {
  if (result.initialized || result.wouldInitialize) {
    console.log(getSpecRowMessage(result.language, "migration.initialized", { path: ".specrow" }));
  }

  console.log(
    getSpecRowMessage(result.language, "migration.sourceDetected", {
      kind: result.source.kind,
      source: pathForDisplay(result.source.root)
    })
  );
  console.log(
    getSpecRowMessage(result.language, result.dryRun ? "migration.dryRun" : "migration.completed", {
      source: pathForDisplay(result.source.root)
    })
  );
  console.log(getSpecRowMessage(result.language, "migration.copied", { count: String(result.copied.length) }));
  console.log(getSpecRowMessage(result.language, "migration.converted", { count: String(result.converted.length) }));
  console.log(getSpecRowMessage(result.language, "migration.skipped", { count: String(result.skipped.length) }));

  for (const warning of result.warnings) {
    console.log(getSpecRowMessage(result.language, "migration.warning", { warning }));
  }
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
