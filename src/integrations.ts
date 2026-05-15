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
import { listAgentCommandSpecs, type AgentCommandSpec } from "./agentCommands.js";
import { getSpecRowIntegrationText, type IntegrationTextResources } from "./templates.js";

export type ManagedFileKind = "command" | "skill" | "instructions" | "workflow" | "prompt" | "rule" | "mcp-config";

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
  mcp?: boolean;
  env?: NodeJS.ProcessEnv;
  homeDir?: string;
  now?: Date;
}

interface IntegrationArtifact {
  tool: IntegrationTool;
  path: string;
  kind: ManagedFileKind;
  content: string;
  integrationText: IntegrationTextResources;
  mergeBlock?: boolean;
  mcpConfig?: boolean;
  jsonMcpConfig?: boolean;
}

const MANAGED_START = "<!-- SPECROW:MANAGED:START -->";
const MANAGED_END = "<!-- SPECROW:MANAGED:END -->";
const MCP_MANAGED_MARKER = "# SPECROW:MANAGED:mcp-config";
const MCP_CAPABLE_TOOLS = new Set<IntegrationTool>(["codex", "claude", "cursor", "windsurf"]);

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
  const language = config.language;
  const includeMcp = options.mcp !== false;

  const artifacts = tools.flatMap((tool) =>
    createArtifactsForTool(tool, cwd, options.homeDir ?? os.homedir(), options.env ?? process.env, language, includeMcp)
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
    managedFiles.map(async (file) => {
      const exists = await pathExists(resolveStoredPath(file.path, root));

      return {
        ...file,
        action: exists ? "updated" : "skipped",
        reason: exists ? (file.kind === "mcp-config" ? "present; restart agent if this was newly installed" : "present") : "missing"
      };
    })
  );
}

function createArtifactsForTool(
  tool: IntegrationTool,
  cwd: string,
  homeDir: string,
  env: NodeJS.ProcessEnv,
  language: string,
  includeMcp: boolean
): IntegrationArtifact[] {
  const commands = listAgentCommandSpecs(language);
  const integrationText = getSpecRowIntegrationText(language);
  const mcpArtifacts = includeMcp && MCP_CAPABLE_TOOLS.has(tool) ? createMcpArtifactsForTool(tool, cwd, homeDir, env, integrationText) : [];
  const commandArtifacts = commands.map((command) => createCommandArtifact(tool, command, cwd, homeDir, env, integrationText)).filter(
    (artifact): artifact is IntegrationArtifact => artifact !== undefined
  );

  switch (tool) {
    case "codex":
      return [
        ...mcpArtifacts,
        ...commandArtifacts,
        {
          tool,
          path: path.join(codexHome(homeDir, env), "skills", "specrow", "SKILL.md"),
          kind: "skill",
          content: renderSkill("SpecRow", commands, integrationText),
          integrationText
        }
      ];
    case "claude":
      return [
        ...mcpArtifacts,
        ...commandArtifacts,
        {
          tool,
          path: path.join(cwd, ".claude", "skills", "specrow", "SKILL.md"),
          kind: "skill",
          content: renderSkill("SpecRow", commands, integrationText),
          integrationText
        },
        {
          tool,
          path: path.join(cwd, "CLAUDE.md"),
          kind: "instructions",
          content: renderAgentInstructions(commands, integrationText),
          integrationText,
          mergeBlock: true
        }
      ];
    case "cursor":
      return [
        ...mcpArtifacts,
        ...commandArtifacts,
        {
          tool,
          path: path.join(cwd, ".cursor", "rules", "specrow.mdc"),
          kind: "rule",
          content: renderAgentInstructions(commands, integrationText),
          integrationText
        }
      ];
    case "windsurf":
      return [
        ...mcpArtifacts,
        ...commandArtifacts,
        {
          tool,
          path: path.join(cwd, ".windsurf", "rules", "specrow.md"),
          kind: "rule",
          content: renderAgentInstructions(commands, integrationText),
          integrationText
        }
      ];
    case "generic":
      return [
        ...mcpArtifacts,
        {
          tool,
          path: path.join(cwd, "AGENTS.md"),
          kind: "instructions",
          content: renderAgentInstructions(commands, integrationText),
          integrationText,
          mergeBlock: true
        }
      ];
  }
}

function createMcpArtifactsForTool(
  tool: IntegrationTool,
  cwd: string,
  homeDir: string,
  env: NodeJS.ProcessEnv,
  integrationText: IntegrationTextResources
): IntegrationArtifact[] {
  const server = renderJsonMcpServer(cwd);

  switch (tool) {
    case "codex":
      return [
        {
          tool,
          path: path.join(codexHome(homeDir, env), "config.toml"),
          kind: "mcp-config",
          content: renderCodexMcpConfig(),
          integrationText,
          mcpConfig: true
        }
      ];
    case "claude":
      return [
        {
          tool,
          path: path.join(cwd, ".mcp.json"),
          kind: "mcp-config",
          content: JSON.stringify({ mcpServers: { specrow: server } }, null, 2),
          integrationText,
          jsonMcpConfig: true
        }
      ];
    case "cursor":
      return [
        {
          tool,
          path: path.join(cwd, ".cursor", "mcp.json"),
          kind: "mcp-config",
          content: JSON.stringify({ mcpServers: { specrow: server } }, null, 2),
          integrationText,
          jsonMcpConfig: true
        }
      ];
    case "windsurf":
      return [
        {
          tool,
          path: path.join(cwd, ".windsurf", "mcp_config.json"),
          kind: "mcp-config",
          content: JSON.stringify({ mcpServers: { specrow: server } }, null, 2),
          integrationText,
          jsonMcpConfig: true
        }
      ];
    case "generic":
      return [];
  }
}

export function renderCodexMcpConfig(): string {
  return `${MCP_MANAGED_MARKER}
[mcp_servers.specrow]
command = "npx"
args = ["-y", "specrow@latest", "mcp"]
`;
}

function renderJsonMcpServer(projectPath: string): Record<string, unknown> {
  return {
    command: "npx",
    args: ["-y", "specrow@latest", "mcp", projectPath]
  };
}

function createCommandArtifact(
  tool: IntegrationTool,
  command: AgentCommandSpec,
  cwd: string,
  homeDir: string,
  env: NodeJS.ProcessEnv,
  integrationText: IntegrationTextResources
): IntegrationArtifact | undefined {
  const id = command.name.replace("/specrow:", "");
  const fileName = `specrow-${id}.md`;
  const content = renderCommand(command, integrationText);

  switch (tool) {
    case "codex":
      return {
        tool,
        path: path.join(codexHome(homeDir, env), "prompts", fileName),
        kind: "prompt",
        content,
        integrationText
      };
    case "claude":
      return {
        tool,
        path: path.join(cwd, ".claude", "commands", "specrow", `${id}.md`),
        kind: "command",
        content,
        integrationText
      };
    case "cursor":
      return {
        tool,
        path: path.join(cwd, ".cursor", "commands", fileName),
        kind: "command",
        content,
        integrationText
      };
    case "windsurf":
      return {
        tool,
        path: path.join(cwd, ".windsurf", "workflows", fileName),
        kind: "workflow",
        content,
        integrationText
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

  if (artifact.mcpConfig === true) {
    const existing = exists ? await readFile(artifact.path, "utf8") : "";
    const merged = mergeCodexMcpConfig(existing, artifact.content, options.force === true);

    if (merged === undefined) {
      return {
        ...baseResult,
        action: "skipped",
        reason: "existing specrow MCP server is not SpecRow-managed; use --force to overwrite"
      };
    }

    await writeFile(artifact.path, merged, "utf8");
    return {
      ...baseResult,
      action
    };
  }

  if (artifact.jsonMcpConfig === true) {
    const existing = exists ? await readFile(artifact.path, "utf8") : "";
    const merged = mergeJsonMcpConfig(existing, artifact.content, options.force === true);

    if (merged === undefined) {
      return {
        ...baseResult,
        action: "skipped",
        reason: "existing specrow MCP server is not SpecRow-managed; use --force to overwrite"
      };
    }

    await writeFile(artifact.path, merged, "utf8");
    return {
      ...baseResult,
      action
    };
  }

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

  await writeFile(artifact.path, withManagedHeader(artifact.content, artifact.integrationText), "utf8");
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

function renderCommand(command: AgentCommandSpec, integrationText: IntegrationTextResources): string {
  const sections = integrationText.commandSections;
  return `# ${command.name}

## ${sections.invocation}
${integrationText.invocationTemplate.replace("{command}", command.name)}

## ${sections.userIntent}
${command.userIntent}

## ${sections.toolCore}
${command.toolCore.map((line) => `- \`${line}\``).join("\n")}
${integrationText.toolCoreFallback}
${command.cliCore.map((line) => `- \`${line}\``).join("\n")}

## ${sections.agentBehavior}
${command.agentBehavior.map((line) => `- ${line}`).join("\n")}

## ${sections.forbiddenActions}
${command.forbiddenActions.map((line) => `- ${line}`).join("\n")}

## ${sections.languageRules}
${command.languageRules.map((line) => `- ${line}`).join("\n")}

## ${sections.stopConditions}
${command.stopConditions.map((line) => `- ${line}`).join("\n")}

## ${sections.nextCommands}
${command.nextCommands.length === 0 ? `- ${sections.none}` : command.nextCommands.map((line) => `- \`${line}\``).join("\n")}
`;
}

function renderAgentInstructions(commands: readonly AgentCommandSpec[], integrationText: IntegrationTextResources): string {
  return `# ${integrationText.agentInstructions.title}

${integrationText.agentInstructions.overview}

${integrationText.agentInstructions.languageRule}

${commands.map(
  (command) => `## ${command.name}
${command.userIntent}

${integrationText.agentInstructions.toolCore}
${command.toolCore.map((line) => `- \`${line}\``).join("\n")}
${integrationText.toolCoreFallback}
${command.cliCore.map((line) => `- \`${line}\``).join("\n")}

${integrationText.agentInstructions.forbidden}
${command.forbiddenActions.map((line) => `- ${line}`).join("\n")}`
).join("\n\n")}
`;
}

function mergeCodexMcpConfig(existing: string, managedSpecrowConfig: string, force: boolean): string | undefined {
  const replacement = managedSpecrowConfig.trim();
  const section = findTomlSection(existing, "mcp_servers.specrow");

  if (section === undefined) {
    return `${existing.trimEnd()}${existing.trim().length > 0 ? "\n\n" : ""}${replacement}\n`;
  }

  const currentSection = existing.slice(section.start, section.end);
  const hasManagedMarker = currentSection.includes(MCP_MANAGED_MARKER) || existing.slice(Math.max(0, section.start - 128), section.start).includes(MCP_MANAGED_MARKER);

  if (!hasManagedMarker && !force) {
    return undefined;
  }

  return `${existing.slice(0, section.start).trimEnd()}${section.start > 0 ? "\n\n" : ""}${replacement}${existing.slice(section.end).trimStart().length > 0 ? `\n\n${existing.slice(section.end).trimStart()}` : "\n"}`;
}

function mergeJsonMcpConfig(existing: string, managedSpecrowConfig: string, force: boolean): string | undefined {
  const nextServer = JSON.parse(managedSpecrowConfig) as { mcpServers: { specrow: unknown } };

  if (existing.trim().length === 0) {
    return `${JSON.stringify(nextServer, null, 2)}\n`;
  }

  const parsed = JSON.parse(existing) as Record<string, unknown>;
  const mcpServers = isRecord(parsed.mcpServers) ? parsed.mcpServers : {};
  const currentSpecrow = mcpServers.specrow;

  if (currentSpecrow !== undefined && !force && !isCanonicalSpecrowServer(currentSpecrow)) {
    return undefined;
  }

  parsed.mcpServers = {
    ...mcpServers,
    specrow: nextServer.mcpServers.specrow
  };

  return `${JSON.stringify(parsed, null, 2)}\n`;
}

function isCanonicalSpecrowServer(value: unknown): boolean {
  return (
    isRecord(value) &&
    value.command === "npx" &&
    Array.isArray(value.args) &&
    value.args.length === 4 &&
    value.args[0] === "-y" &&
    value.args[1] === "specrow@latest" &&
    value.args[2] === "mcp" &&
    typeof value.args[3] === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findTomlSection(source: string, sectionName: string): { start: number; end: number } | undefined {
  const headerPattern = new RegExp(`^\\[${escapeRegExp(sectionName)}\\]\\s*$`, "m");
  const match = headerPattern.exec(source);

  if (match === null || match.index === undefined) {
    return undefined;
  }

  const markerStart = source.lastIndexOf(MCP_MANAGED_MARKER, match.index);
  const sectionStart = markerStart >= 0 && source.slice(markerStart, match.index).trim() === MCP_MANAGED_MARKER ? markerStart : match.index;
  const rest = source.slice(match.index + match[0].length);
  const nextHeader = /^\[.+\]\s*$/m.exec(rest);
  const end = nextHeader === null || nextHeader.index === undefined ? source.length : match.index + match[0].length + nextHeader.index;

  return { start: sectionStart, end };
}

function renderSkill(name: string, commands: readonly AgentCommandSpec[], integrationText: IntegrationTextResources): string {
  return `# ${name}

${integrationText.skill.description}

## ${integrationText.skill.whenToUse}
${integrationText.skill.triggers.map((trigger) => `- ${trigger}`).join("\n")}

## ${integrationText.skill.instructions}
${renderAgentInstructions(commands, integrationText)}
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

function withManagedHeader(content: string, integrationText: IntegrationTextResources): string {
  return `${MANAGED_START}
${integrationText.managedHeader}
${MANAGED_END}

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
