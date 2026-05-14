import { constants } from "node:fs";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  INTEGRATION_TOOLS,
  IntegrationToolSchema,
  loadSpecRowConfig,
  serializeConfig,
  type IntegrationTool,
  type SpecRowConfig
} from "./config.js";
import { AGENT_COMMAND_SPECS, type AgentCommandSpec } from "./agentCommands.js";

export type ManagedFileKind = "command" | "skill" | "instructions" | "workflow" | "prompt" | "rule";

export interface ManagedIntegrationFile {
  tool: IntegrationTool;
  path: string;
  kind: ManagedFileKind;
}

export interface IntegrationWriteResult extends ManagedIntegrationFile {
  action: "created" | "updated" | "would-create" | "would-update" | "skipped";
  reason?: string;
}

export interface IntegrationInstallResult {
  tools: IntegrationTool[];
  detectedTools: IntegrationTool[];
  files: IntegrationWriteResult[];
  dryRun: boolean;
}

export interface IntegrationInstallOptions {
  cwd?: string;
  tools?: string | readonly IntegrationTool[];
  detect?: boolean;
  dryRun?: boolean;
  force?: boolean;
  env?: NodeJS.ProcessEnv;
  homeDir?: string;
  now?: Date;
}

interface IntegrationArtifact {
  tool: IntegrationTool;
  path: string;
  kind: ManagedFileKind;
  content: string;
  mergeBlock?: boolean;
}

const MANAGED_START = "<!-- SPECROW:MANAGED:START -->";
const MANAGED_END = "<!-- SPECROW:MANAGED:END -->";
const GENERATED_HEADER = `${MANAGED_START}
This file or section is managed by SpecRow. Regenerate it with:
specrow update
${MANAGED_END}`;

export function parseIntegrationTools(input: string | readonly IntegrationTool[] | undefined): IntegrationTool[] {
  if (input === undefined) {
    return [];
  }

  if (typeof input !== "string") {
    return dedupeTools(input);
  }

  const value = input.trim();

  if (value.length === 0 || value === "none") {
    return [];
  }

  if (value === "all") {
    return [...INTEGRATION_TOOLS];
  }

  return dedupeTools(
    value.split(",").map((tool) => {
      const parsed = IntegrationToolSchema.safeParse(tool.trim());

      if (!parsed.success) {
        throw new Error(`Unknown SpecRow integration tool "${tool.trim()}". Use one of: ${INTEGRATION_TOOLS.join(", ")}.`);
      }

      return parsed.data;
    })
  );
}

export async function detectIntegrationTools(options: IntegrationInstallOptions = {}): Promise<IntegrationTool[]> {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const homeDir = options.homeDir ?? os.homedir();
  const env = options.env ?? process.env;
  const detected: IntegrationTool[] = [];

  if (env.CODEX_HOME !== undefined || env.CODEX_SANDBOX !== undefined || (await pathExists(path.join(homeDir, ".codex")))) {
    detected.push("codex");
  }

  if (
    env.CLAUDECODE !== undefined ||
    env.CLAUDE_CODE !== undefined ||
    env.CLAUDE_CODE_SSE_PORT !== undefined ||
    (await pathExists(path.join(cwd, ".claude")))
  ) {
    detected.push("claude");
  }

  if (
    env.CURSOR_TRACE_ID !== undefined ||
    env.CURSOR_AGENT !== undefined ||
    env.CURSOR_WORKSPACE_ID !== undefined ||
    (await pathExists(path.join(cwd, ".cursor")))
  ) {
    detected.push("cursor");
  }

  if (
    env.WINDSURF !== undefined ||
    env.WINDSURF_AGENT !== undefined ||
    env.CODEIUM_APP_NAME === "Windsurf" ||
    (await pathExists(path.join(cwd, ".windsurf")))
  ) {
    detected.push("windsurf");
  }

  return dedupeTools(detected.length > 0 ? detected : ["generic"]);
}

export async function installSpecRowIntegrations(options: IntegrationInstallOptions = {}): Promise<IntegrationInstallResult> {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const config = await loadSpecRowConfig(cwd);
  const detectedTools = options.detect === true || options.tools === undefined ? await detectIntegrationTools(options) : [];
  const selectedTools = parseIntegrationTools(options.tools).concat(options.tools === undefined || options.detect === true ? detectedTools : []);
  const tools = dedupeTools(selectedTools);

  const artifacts = tools.flatMap((tool) =>
    createArtifactsForTool(tool, cwd, options.homeDir ?? os.homedir(), options.env ?? process.env)
  );
  const files: IntegrationWriteResult[] = [];

  for (const artifact of artifacts) {
    files.push(await writeIntegrationArtifact(artifact, cwd, options));
  }

  if (options.dryRun !== true && tools.length > 0) {
    await saveIntegrationConfig(cwd, config, tools, files, options.now ?? new Date());
  }

  return {
    tools,
    detectedTools,
    files,
    dryRun: options.dryRun === true
  };
}

export async function updateSpecRowIntegrations(options: IntegrationInstallOptions = {}): Promise<IntegrationInstallResult> {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const config = await loadSpecRowConfig(cwd);
  const tools = options.tools === undefined ? config.integrations?.tools ?? [] : parseIntegrationTools(options.tools);

  if (tools.length === 0) {
    throw new Error("No SpecRow integrations are configured. Run specrow integrate --tools <tool> first.");
  }

  return installSpecRowIntegrations({
    ...options,
    cwd,
    tools
  });
}

export async function getIntegrationStatus(cwd = process.cwd()): Promise<IntegrationWriteResult[]> {
  const root = path.resolve(cwd);
  const config = await loadSpecRowConfig(root);
  const managedFiles = config.integrations?.managedFiles ?? [];

  return Promise.all(
    managedFiles.map(async (file) => ({
      ...file,
      action: (await pathExists(resolveStoredPath(file.path, root))) ? "updated" : "skipped",
      reason: (await pathExists(resolveStoredPath(file.path, root))) ? "present" : "missing"
    }))
  );
}

function createArtifactsForTool(
  tool: IntegrationTool,
  cwd: string,
  homeDir: string,
  env: NodeJS.ProcessEnv
): IntegrationArtifact[] {
  const commandArtifacts = AGENT_COMMAND_SPECS.map((command) => createCommandArtifact(tool, command, cwd, homeDir, env)).filter(
    (artifact): artifact is IntegrationArtifact => artifact !== undefined
  );

  switch (tool) {
    case "codex":
      return [
        ...commandArtifacts,
        {
          tool,
          path: path.join(codexHome(homeDir, env), "skills", "specrow", "SKILL.md"),
          kind: "skill",
          content: renderSkill("SpecRow", "Use SpecRow workflows when the user mentions SpecRow or /specrow:* commands.")
        }
      ];
    case "claude":
      return [
        ...commandArtifacts,
        {
          tool,
          path: path.join(cwd, ".claude", "skills", "specrow", "SKILL.md"),
          kind: "skill",
          content: renderSkill("SpecRow", "Use SpecRow workflows when the user asks for specification-led implementation.")
        },
        {
          tool,
          path: path.join(cwd, "CLAUDE.md"),
          kind: "instructions",
          content: renderAgentInstructions(),
          mergeBlock: true
        }
      ];
    case "cursor":
      return [
        ...commandArtifacts,
        {
          tool,
          path: path.join(cwd, ".cursor", "rules", "specrow.mdc"),
          kind: "rule",
          content: renderAgentInstructions()
        }
      ];
    case "windsurf":
      return [
        ...commandArtifacts,
        {
          tool,
          path: path.join(cwd, ".windsurf", "rules", "specrow.md"),
          kind: "rule",
          content: renderAgentInstructions()
        }
      ];
    case "generic":
      return [
        {
          tool,
          path: path.join(cwd, "AGENTS.md"),
          kind: "instructions",
          content: renderAgentInstructions(),
          mergeBlock: true
        }
      ];
  }
}

function createCommandArtifact(
  tool: IntegrationTool,
  command: AgentCommandSpec,
  cwd: string,
  homeDir: string,
  env: NodeJS.ProcessEnv
): IntegrationArtifact | undefined {
  const id = command.name.replace("/specrow:", "");
  const fileName = `specrow-${id}.md`;
  const content = renderCommand(command);

  switch (tool) {
    case "codex":
      return {
        tool,
        path: path.join(codexHome(homeDir, env), "prompts", fileName),
        kind: "prompt",
        content
      };
    case "claude":
      return {
        tool,
        path: path.join(cwd, ".claude", "commands", "specrow", `${id}.md`),
        kind: "command",
        content
      };
    case "cursor":
      return {
        tool,
        path: path.join(cwd, ".cursor", "commands", fileName),
        kind: "command",
        content
      };
    case "windsurf":
      return {
        tool,
        path: path.join(cwd, ".windsurf", "workflows", fileName),
        kind: "workflow",
        content
      };
    case "generic":
      return undefined;
  }
}

async function writeIntegrationArtifact(
  artifact: IntegrationArtifact,
  cwd: string,
  options: IntegrationInstallOptions
): Promise<IntegrationWriteResult> {
  const exists = await pathExists(artifact.path);
  const action = exists ? "updated" : "created";
  const dryAction = exists ? "would-update" : "would-create";
  const baseResult = {
    tool: artifact.tool,
    path: pathForStorage(artifact.path, cwd),
    kind: artifact.kind
  };

  if (options.dryRun === true) {
    return {
      ...baseResult,
      action: dryAction
    };
  }

  await mkdir(path.dirname(artifact.path), { recursive: true });

  if (artifact.mergeBlock === true) {
    const existing = exists ? await readFile(artifact.path, "utf8") : "";
    await writeFile(artifact.path, mergeManagedBlock(existing, artifact.content), "utf8");
    return {
      ...baseResult,
      action
    };
  }

  if (exists) {
    const existing = await readFile(artifact.path, "utf8");

    if (!existing.includes(MANAGED_START) && options.force !== true) {
      return {
        ...baseResult,
        action: "skipped",
        reason: "exists without SpecRow managed marker; use --force to overwrite"
      };
    }
  }

  await writeFile(artifact.path, withManagedHeader(artifact.content), "utf8");
  return {
    ...baseResult,
    action
  };
}

async function saveIntegrationConfig(
  cwd: string,
  config: SpecRowConfig,
  tools: readonly IntegrationTool[],
  files: readonly IntegrationWriteResult[],
  now: Date
): Promise<void> {
  const previous = config.integrations?.managedFiles ?? [];
  const updatedFiles = files
    .filter((file) => file.action !== "skipped")
    .map(({ tool, path: filePath, kind }) => ({ tool, path: filePath, kind }));
  const managedFilesByPath = new Map<string, ManagedIntegrationFile>();

  for (const file of previous) {
    managedFilesByPath.set(file.path, file);
  }

  for (const file of updatedFiles) {
    managedFilesByPath.set(file.path, file);
  }

  const nextConfig: SpecRowConfig = {
    ...config,
    integrations: {
      tools: dedupeTools([...(config.integrations?.tools ?? []), ...tools]),
      installedAt: now.toISOString(),
      managedFiles: [...managedFilesByPath.values()].sort((left, right) => left.path.localeCompare(right.path))
    }
  };

  await writeFile(path.join(cwd, ".specrow", "config.yml"), serializeConfig(nextConfig), "utf8");
}

function renderCommand(command: AgentCommandSpec): string {
  return `# ${command.name}

## Invocation
Use this workflow when the user writes \`${command.name}\` or asks for the same intent.

## User Intent
${command.userIntent}

## CLI Core
${command.cliCore.map((line) => `- \`${line}\``).join("\n")}

## Agent Behavior
${command.agentBehavior.map((line) => `- ${line}`).join("\n")}

## Forbidden Actions
${command.forbiddenActions.map((line) => `- ${line}`).join("\n")}

## Language Rules
${command.languageRules.map((line) => `- ${line}`).join("\n")}

## Stop Conditions
${command.stopConditions.map((line) => `- ${line}`).join("\n")}

## Next Commands
${command.nextCommands.length === 0 ? "- None." : command.nextCommands.map((line) => `- \`${line}\``).join("\n")}
`;
}

function renderAgentInstructions(): string {
  return `# SpecRow Agent Instructions

SpecRow is an agent-first specification workflow. Treat \`/specrow:*\` user messages as workflow intentions and use the \`specrow\` CLI as the implementation detail.

Before creating or revising built-in SpecRow files, read \`.specrow/config.yml\` and use its configured \`language\`. Do not silently fall back to English.

${AGENT_COMMAND_SPECS.map(
  (command) => `## ${command.name}
${command.userIntent}

CLI core:
${command.cliCore.map((line) => `- \`${line}\``).join("\n")}

Forbidden:
${command.forbiddenActions.map((line) => `- ${line}`).join("\n")}`
).join("\n\n")}
`;
}

function renderSkill(name: string, description: string): string {
  return `# ${name}

${description}

## When to Use
- The user invokes a \`/specrow:*\` command.
- The user asks to initialize SpecRow, create a proposal, review, build, revise, or accept a SpecRow change.

## Instructions
${renderAgentInstructions()}
`;
}

function mergeManagedBlock(existing: string, content: string): string {
  const block = `${MANAGED_START}
${content.trim()}
${MANAGED_END}`;
  const pattern = new RegExp(`${escapeRegExp(MANAGED_START)}[\\s\\S]*?${escapeRegExp(MANAGED_END)}`);

  if (pattern.test(existing)) {
    return `${existing.replace(pattern, block).trimEnd()}\n`;
  }

  return `${existing.trimEnd()}${existing.trim().length > 0 ? "\n\n" : ""}${block}\n`;
}

function withManagedHeader(content: string): string {
  return `${GENERATED_HEADER}

${content.trim()}
`;
}

function codexHome(homeDir: string, env: NodeJS.ProcessEnv): string {
  return env.CODEX_HOME ?? path.join(homeDir, ".codex");
}

function pathForStorage(targetPath: string, cwd: string): string {
  const relative = path.relative(cwd, targetPath);

  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    return normalizePath(relative);
  }

  return normalizePath(targetPath);
}

function resolveStoredPath(storedPath: string, cwd: string): string {
  return path.isAbsolute(storedPath) ? storedPath : path.join(cwd, storedPath);
}

function normalizePath(targetPath: string): string {
  return targetPath.split(path.sep).join("/");
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function dedupeTools(tools: readonly IntegrationTool[]): IntegrationTool[] {
  return [...new Set(tools)];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
