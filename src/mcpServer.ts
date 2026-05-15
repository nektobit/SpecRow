import { constants } from "node:fs";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z, ZodError, type ZodTypeAny } from "zod";

import { loadSpecRowConfig } from "./config.js";
import { getIntegrationStatus } from "./integrations.js";
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
  type LifecycleStatus,
  type ReviewState
} from "./lifecycle.js";
import {
  getSpecRowMessage,
  getSpecRowTemplate,
  SUPPORTED_LANGUAGES,
  type TemplateName
} from "./templates.js";
import { reviewChangeReadiness, validateSpecRowProject, type ValidationIssue } from "./validation.js";

const SPECROW_VERSION = "0.1.5";
const SPECROW_DIR = ".specrow";

const EmptySchema = z.object({}).optional();
const InitSchema = z.object({
  language: z.string().min(2).max(32).optional(),
  force: z.boolean().optional()
});
const ChangeNameSchema = z.object({
  changeName: z.string().min(1)
});
const CreateProposalSchema = ChangeNameSchema.extend({
  review: z.enum(["required", "recommended"]).optional()
});
const AcceptSchema = ChangeNameSchema.extend({
  explicitUserAcceptance: z.boolean(),
  followUpWorkCompleted: z.boolean().optional()
});
const TemplateContextSchema = z.object({
  template: z.enum(["project", "spec", "proposal", "tasks"]).optional()
});

export type McpErrorCode =
  | "VALIDATION_FAILED"
  | "MISSING_LANGUAGE_RESOURCE"
  | "INVALID_STATE"
  | "NOT_FOUND"
  | "UNSAFE_PATH"
  | "INVALID_PROJECT_ROOT"
  | "INTERNAL_ERROR";

export interface McpFailure {
  success: false;
  code: McpErrorCode;
  message: string;
  issues?: ValidationIssue[] | Array<{ path: string; message: string }>;
  suggestion?: string;
}

export type McpSuccess = {
  success: true;
  message?: string;
  nextSteps?: string[];
  [key: string]: unknown;
};

export type McpToolResult = McpSuccess | McpFailure;

export interface SpecRowMcpOptions {
  projectRoot?: string;
  env?: NodeJS.ProcessEnv;
}

export interface SpecRowMcpRuntime {
  projectRoot: string;
  server: McpServer;
  callTool(name: string, input?: unknown): Promise<McpToolResult>;
  readResource(uri: string): Promise<string>;
  listResourceUris(): Promise<string[]>;
}

type ToolHandler = (input: unknown) => Promise<McpToolResult>;

export async function resolveSpecRowMcpProjectRoot(projectPath?: string, env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const requested = projectPath ?? env.SPECROW_PROJECT_ROOT ?? process.cwd();
  const root = path.resolve(requested);

  let rootStat;
  try {
    rootStat = await stat(root);
  } catch {
    throw new Error(`Invalid SpecRow project root "${root}": directory does not exist.`);
  }

  if (!rootStat.isDirectory()) {
    throw new Error(`Invalid SpecRow project root "${root}": expected a directory.`);
  }

  return root;
}

export async function createSpecRowMcpRuntime(options: SpecRowMcpOptions = {}): Promise<SpecRowMcpRuntime> {
  const projectRoot = await resolveSpecRowMcpProjectRoot(options.projectRoot, options.env);
  const server = new McpServer({
    name: "specrow",
    version: SPECROW_VERSION
  });
  const handlers = createToolHandlers(projectRoot);

  for (const [name, registration] of Object.entries(createToolRegistrations(handlers))) {
    server.registerTool(
      name,
      {
        title: registration.title,
        description: registration.description,
        inputSchema: registration.schema,
        annotations: {
          readOnlyHint: registration.readOnly,
          destructiveHint: registration.destructive,
          openWorldHint: false
        }
      },
      async (args) => toMcpCallResult(await registration.handler(args))
    );
  }

  registerResources(server, projectRoot);

  return {
    projectRoot,
    server,
    callTool: async (name, input = {}) => {
      const handler = handlers[name];

      if (handler === undefined) {
        return failure("NOT_FOUND", `Unknown SpecRow MCP tool "${name}".`);
      }

      return handler(input);
    },
    readResource: (uri) => readSpecRowResource(projectRoot, uri),
    listResourceUris: () => listSpecRowResourceUris(projectRoot)
  };
}

export async function startSpecRowMcpServer(options: SpecRowMcpOptions = {}): Promise<void> {
  const runtime = await createSpecRowMcpRuntime(options);
  await runtime.server.connect(new StdioServerTransport());
}

function createToolHandlers(projectRoot: string): Record<string, ToolHandler> {
  const tool = <T extends ZodTypeAny>(schema: T, handler: (input: z.infer<T>) => Promise<McpToolResult>): ToolHandler => {
    return async (input: unknown) => {
      const parsed = schema.safeParse(input ?? {});

      if (!parsed.success) {
        return failure("VALIDATION_FAILED", "Invalid SpecRow MCP tool input.", zodIssues(parsed.error));
      }

      try {
        return await handler(parsed.data);
      } catch (error) {
        return errorToFailure(error);
      }
    };
  };

  return {
    specrow_init: tool(InitSchema, async (input) => {
      const result = await initSpecRowProject({ cwd: projectRoot, language: input.language, force: input.force });
      return success({
        message: getSpecRowMessage(result.language, result.configCreated ? "init.config.created" : "init.config.kept", {
          path: relative(projectRoot, result.configPath)
        }),
        root: relative(projectRoot, result.root),
        configPath: relative(projectRoot, result.configPath),
        projectPath: relative(projectRoot, result.projectPath),
        configCreated: result.configCreated,
        configOverwritten: result.configOverwritten,
        projectCreated: result.projectCreated,
        directories: result.directories.map((directory) => relative(projectRoot, directory)),
        language: result.language,
        nextSteps: ["Use /specrow:proposal to create a change proposal."]
      });
    }),
    specrow_create_proposal: tool(CreateProposalSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const result = await createChange({
        cwd: projectRoot,
        changeName: input.changeName,
        review: input.review as ReviewState | undefined
      });
      return lifecycleSuccess(result.language, "lifecycle.proposed", result.status, {
        root: relative(projectRoot, result.root),
        proposalPath: relative(projectRoot, result.proposalPath),
        tasksPath: relative(projectRoot, result.tasksPath),
        statusPath: relative(projectRoot, result.statusPath),
        nextSteps: ["Use /specrow:review after the proposal and tasks are ready."]
      });
    }),
    specrow_validate: tool(ChangeNameSchema.partial(), async (input) => {
      if (input.changeName !== undefined) {
        assertSafeChangeName(input.changeName);
      }

      const result = await validateSpecRowProject(projectRoot, input.changeName);
      const hasErrors = hasBlockingErrors(result.issues);
      return success({
        message: getSpecRowMessage(result.language, hasErrors ? "validate.failed" : "validate.ok"),
        language: result.language,
        issues: result.issues,
        valid: !hasErrors
      });
    }),
    specrow_review: tool(ChangeNameSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const result = await reviewChangeReadiness(projectRoot, input.changeName);
      const hasErrors = hasBlockingErrors(result.issues);

      if (hasErrors) {
        return failure("VALIDATION_FAILED", getSpecRowMessage(result.language, "validate.failed"), result.issues, "Fix blocking errors, then run /specrow:review again.");
      }

      const status = await markChangeReviewed(projectRoot, input.changeName);
      return lifecycleSuccess(result.language, result.issues.length > 0 ? "review.warning" : "lifecycle.reviewed", status, {
        issues: result.issues,
        nextSteps: ["Use /specrow:build when implementation is ready to start."]
      });
    }),
    specrow_status: tool(ChangeNameSchema.partial(), async (input) => {
      const language = await projectLanguage(projectRoot);

      if (input.changeName !== undefined) {
        assertSafeChangeName(input.changeName);
        const status = await readChangeStatus(projectRoot, input.changeName);
        return lifecycleSuccess(language, "status.change", status);
      }

      const activeChanges = await listActiveChanges(projectRoot);
      return success({
        message: activeChanges.changes.length === 0 ? getSpecRowMessage(language, "list.empty") : "Active SpecRow changes.",
        language,
        activeChanges
      });
    }),
    specrow_list: tool(EmptySchema, async () => {
      const language = await projectLanguage(projectRoot);
      const activeChanges = await listActiveChanges(projectRoot);
      return success({
        message: activeChanges.changes.length === 0 ? getSpecRowMessage(language, "list.empty") : "Active SpecRow changes.",
        language,
        activeChanges
      });
    }),
    specrow_context: tool(ChangeNameSchema.partial(), async (input) => {
      if (input.changeName !== undefined) {
        assertSafeChangeName(input.changeName);
      }

      return success({
        context: await buildContext(projectRoot, input.changeName)
      });
    }),
    specrow_build_start: tool(ChangeNameSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const result = await validateSpecRowProject(projectRoot, input.changeName);

      if (hasBlockingErrors(result.issues)) {
        return failure("VALIDATION_FAILED", getSpecRowMessage(result.language, "validate.failed"), result.issues, "Fix validation errors before implementation.");
      }

      const status = await readChangeStatus(projectRoot, input.changeName);
      return lifecycleSuccess(result.language, "build.started", status, {
        issues: result.issues,
        nextSteps: ["Implement the requested work, then use /specrow:build to finish."]
      });
    }),
    specrow_build_finish: tool(ChangeNameSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const language = await projectLanguage(projectRoot);
      const status = await markChangeBuilt(projectRoot, input.changeName);
      return lifecycleSuccess(language, "lifecycle.built", status, {
        nextSteps: ["Use /specrow:accept only after explicit user acceptance, or /specrow:revise if changes are requested."]
      });
    }),
    specrow_revise: tool(ChangeNameSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const language = await projectLanguage(projectRoot);
      const status = await markRevisionNeeded(projectRoot, input.changeName);
      return lifecycleSuccess(language, "lifecycle.revisionNeeded", status, {
        nextSteps: ["Complete follow-up work before requesting /specrow:accept again."]
      });
    }),
    specrow_accept: tool(AcceptSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const language = await projectLanguage(projectRoot);
      const status = await acceptChange(projectRoot, input.changeName, {
        explicitUserAcceptance: input.explicitUserAcceptance,
        followUpWorkCompleted: input.followUpWorkCompleted
      });
      return lifecycleSuccess(language, "lifecycle.accepted", status, {
        nextSteps: ["Continue the user-facing /specrow:accept flow with specrow_archive to archive the accepted change."]
      });
    }),
    specrow_archive: tool(ChangeNameSchema, async (input) => {
      assertSafeChangeName(input.changeName);
      const language = await projectLanguage(projectRoot);
      const status = await archiveChange(projectRoot, input.changeName);
      return lifecycleSuccess(language, "lifecycle.archived", status);
    }),
    specrow_workflow_guide: tool(EmptySchema, async () =>
      success({
        message: "SpecRow workflow guide.",
        workflow: ["proposal", "review", "build", "revise", "accept", "archive"],
        tools: {
          proposal: "specrow_create_proposal",
          review: "specrow_review",
          buildStart: "specrow_build_start",
          buildFinish: "specrow_build_finish",
          revise: "specrow_revise",
          accept: "specrow_accept",
          archive: "specrow_archive"
        },
        acceptGate: {
          explicitUserAcceptance: "Required and must be true.",
          revisionNeeded: "Requires followUpWorkCompleted true."
        }
      })
    ),
    specrow_template_context: tool(TemplateContextSchema, async (input) => {
      const config = await loadSpecRowConfig(projectRoot);
      const templates = (input.template === undefined ? ["project", "spec", "proposal", "tasks"] : [input.template]) as TemplateName[];
      return success({
        language: config.language,
        templates: Object.fromEntries(templates.map((template) => [template, getSpecRowTemplate(config.language, template)]))
      });
    }),
    specrow_language_status: tool(EmptySchema, async () => {
      const config = await loadSpecRowConfig(projectRoot);
      return success({
        language: config.language,
        supportedLanguages: SUPPORTED_LANGUAGES,
        supported: SUPPORTED_LANGUAGES.includes(config.language as (typeof SUPPORTED_LANGUAGES)[number])
      });
    }),
    specrow_integration_status: tool(EmptySchema, async () => {
      const files = await getIntegrationStatus(projectRoot);
      return success({
        files
      });
    })
  };
}

function createToolRegistrations(handlers: Record<string, ToolHandler>): Record<string, {
  title: string;
  description: string;
  schema: ZodTypeAny;
  handler: ToolHandler;
  readOnly: boolean;
  destructive: boolean;
}> {
  return {
    specrow_init: registration("Initialize SpecRow", "Create the .specrow project structure.", InitSchema, handlers.specrow_init, false, false),
    specrow_create_proposal: registration("Create Proposal", "Create a SpecRow change proposal.", CreateProposalSchema, handlers.specrow_create_proposal, false, false),
    specrow_validate: registration("Validate", "Validate the SpecRow workspace or a change.", ChangeNameSchema.partial(), handlers.specrow_validate, true, false),
    specrow_review: registration("Review", "Review a change and mark review completed when valid.", ChangeNameSchema, handlers.specrow_review, false, false),
    specrow_status: registration("Status", "Read change status or active change list.", ChangeNameSchema.partial(), handlers.specrow_status, true, false),
    specrow_list: registration("List", "List active SpecRow changes.", EmptySchema, handlers.specrow_list, true, false),
    specrow_context: registration("Context", "Return agent-readable SpecRow context.", ChangeNameSchema.partial(), handlers.specrow_context, true, false),
    specrow_build_start: registration("Build Start", "Check that a change is ready for implementation.", ChangeNameSchema, handlers.specrow_build_start, true, false),
    specrow_build_finish: registration("Build Finish", "Mark implementation work as built.", ChangeNameSchema, handlers.specrow_build_finish, false, false),
    specrow_revise: registration("Revise", "Mark a change as needing revision.", ChangeNameSchema, handlers.specrow_revise, false, false),
    specrow_accept: registration("Accept", "Record explicit user acceptance.", AcceptSchema, handlers.specrow_accept, false, false),
    specrow_archive: registration("Archive", "Archive an accepted change.", ChangeNameSchema, handlers.specrow_archive, false, true),
    specrow_workflow_guide: registration("Workflow Guide", "Explain the SpecRow MCP workflow.", EmptySchema, handlers.specrow_workflow_guide, true, false),
    specrow_template_context: registration("Template Context", "Return localized SpecRow templates.", TemplateContextSchema, handlers.specrow_template_context, true, false),
    specrow_language_status: registration("Language Status", "Return configured and supported languages.", EmptySchema, handlers.specrow_language_status, true, false),
    specrow_integration_status: registration("Integration Status", "Return configured SpecRow integration files.", EmptySchema, handlers.specrow_integration_status, true, false)
  };
}

function registration(
  title: string,
  description: string,
  schema: ZodTypeAny,
  handler: ToolHandler,
  readOnly: boolean,
  destructive: boolean
) {
  return { title, description, schema, handler, readOnly, destructive };
}

function registerResources(server: McpServer, projectRoot: string): void {
  const fixedResources = [
    ["project-config", "specrow://project/config", "SpecRow project config"],
    ["project-md", "specrow://project/project-md", "SpecRow project context"],
    ["changes", "specrow://changes", "Active SpecRow changes"],
    ["specs", "specrow://specs", "Accepted SpecRow specs index"]
  ] as const;

  for (const [name, uri, title] of fixedResources) {
    server.registerResource(name, uri, { title, mimeType: "application/json" }, async () => resourceResponse(uri, await readSpecRowResource(projectRoot, uri)));
  }

  for (const [name, template, title] of [
    ["change-proposal", "specrow://changes/{changeName}/proposal", "SpecRow change proposal"],
    ["change-tasks", "specrow://changes/{changeName}/tasks", "SpecRow change tasks"],
    ["change-status", "specrow://changes/{changeName}/status", "SpecRow change status"]
  ] as const) {
    server.registerResource(
      name,
      new ResourceTemplate(template, { list: async () => ({ resources: (await listSpecRowResourceUris(projectRoot)).map((uri) => ({ uri, name: uri })) }) }),
      { title, mimeType: "text/plain" },
      async (uri) => resourceResponse(uri.toString(), await readSpecRowResource(projectRoot, uri.toString()))
    );
  }
}

async function readSpecRowResource(projectRoot: string, uri: string): Promise<string> {
  switch (uri) {
    case "specrow://project/config":
      return JSON.stringify(await loadSpecRowConfig(projectRoot), null, 2);
    case "specrow://project/project-md":
      return readSpecRowFile(projectRoot, "project.md");
    case "specrow://changes":
      return JSON.stringify(await listActiveChanges(projectRoot), null, 2);
    case "specrow://specs":
      return JSON.stringify({ specs: await listFiles(path.join(projectRoot, SPECROW_DIR, "specs"), projectRoot) }, null, 2);
    default:
      return readChangeResource(projectRoot, uri);
  }
}

async function readChangeResource(projectRoot: string, uri: string): Promise<string> {
  const match = /^specrow:\/\/changes\/([^/]+)\/(proposal|tasks|status)$/.exec(uri);

  if (match === null) {
    throw new Error(`Unknown SpecRow resource "${uri}".`);
  }

  const [, changeName, resource] = match;
  assertSafeChangeName(decodeURIComponent(changeName));
  const fileName = resource === "status" ? "status.yml" : `${resource}.md`;
  return readSpecRowFile(projectRoot, "changes", decodeURIComponent(changeName), fileName);
}

async function listSpecRowResourceUris(projectRoot: string): Promise<string[]> {
  const resources = ["specrow://project/config", "specrow://project/project-md", "specrow://changes", "specrow://specs"];
  const activeChanges = await listActiveChanges(projectRoot).catch(() => ({ changes: [] as LifecycleStatus[] }));

  for (const change of activeChanges.changes) {
    resources.push(`specrow://changes/${encodeURIComponent(change.change)}/proposal`);
    resources.push(`specrow://changes/${encodeURIComponent(change.change)}/tasks`);
    resources.push(`specrow://changes/${encodeURIComponent(change.change)}/status`);
  }

  return resources;
}

async function buildContext(projectRoot: string, changeName?: string): Promise<Record<string, unknown>> {
  const config = await loadSpecRowConfig(projectRoot);
  const context: Record<string, unknown> = {
    specrow: {
      root: relative(projectRoot, path.join(projectRoot, SPECROW_DIR)),
      config
    },
    activeChanges: await listActiveChanges(projectRoot)
  };

  if (changeName !== undefined) {
    const changeRoot = path.join(projectRoot, SPECROW_DIR, "changes", changeName);
    context.change = {
      root: relative(projectRoot, changeRoot),
      status: await readChangeStatus(projectRoot, changeName),
      proposal: await readFile(path.join(changeRoot, "proposal.md"), "utf8"),
      tasks: await readFile(path.join(changeRoot, "tasks.md"), "utf8")
    };
  }

  return context;
}

async function readSpecRowFile(projectRoot: string, ...segments: string[]): Promise<string> {
  const targetPath = path.resolve(projectRoot, SPECROW_DIR, ...segments);
  assertInsideProjectSpecRow(projectRoot, targetPath);
  return readFile(targetPath, "utf8");
}

async function listFiles(root: string, projectRoot: string): Promise<string[]> {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath, projectRoot)));
    } else if (entry.isFile()) {
      files.push(relative(projectRoot, entryPath));
    }
  }

  return files.sort();
}

function lifecycleSuccess(language: string, messageName: Parameters<typeof getSpecRowMessage>[1], status: LifecycleStatus, extra: Record<string, unknown> = {}): McpSuccess {
  return success({
    message: getSpecRowMessage(language, messageName, {
      change: status.change,
      state: status.state,
      review: status.review.state,
      accepted: String(status.acceptance.explicit)
    }),
    language,
    status,
    ...extra
  });
}

async function projectLanguage(projectRoot: string): Promise<string> {
  return (await loadSpecRowConfig(projectRoot)).language;
}

function success(result: Omit<McpSuccess, "success"> = {}): McpSuccess {
  return {
    success: true,
    ...result
  };
}

function failure(code: McpErrorCode, message: string, issues?: McpFailure["issues"], suggestion?: string): McpFailure {
  return {
    success: false,
    code,
    message,
    ...(issues === undefined ? {} : { issues }),
    ...(suggestion === undefined ? {} : { suggestion })
  };
}

function errorToFailure(error: unknown): McpFailure {
  if (error instanceof ZodError) {
    return failure("VALIDATION_FAILED", "Invalid SpecRow data.", zodIssues(error));
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Missing SpecRow")) {
    return failure("MISSING_LANGUAGE_RESOURCE", message);
  }

  if (message.includes("cannot contain paths") || message.includes("Unsafe SpecRow path")) {
    return failure("UNSAFE_PATH", message);
  }

  if (message.includes("does not exist") || message.includes("ENOENT")) {
    return failure("NOT_FOUND", message);
  }

  if (message.includes("requires explicit user acceptance")) {
    return failure("INVALID_STATE", message, undefined, "Ask the user for explicit /specrow:accept before calling specrow_accept.");
  }

  if (message.includes("must be built before acceptance")) {
    return failure("INVALID_STATE", message, undefined, "Use /specrow:revise for requested changes, or complete follow-up work before /specrow:accept.");
  }

  if (message.includes("must be accepted") || message.includes("already exists")) {
    return failure("INVALID_STATE", message);
  }

  return failure("INTERNAL_ERROR", message);
}

function zodIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

function hasBlockingErrors(issues: readonly ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}

function assertSafeChangeName(changeName: string): void {
  const trimmed = changeName.trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(trimmed)) {
    throw new Error("Change name must use letters, numbers, dots, underscores, or hyphens and cannot contain paths.");
  }
}

function assertInsideProjectSpecRow(projectRoot: string, targetPath: string): void {
  const specrowRoot = path.resolve(projectRoot, SPECROW_DIR);
  const relativePath = path.relative(specrowRoot, targetPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Unsafe SpecRow path "${targetPath}".`);
  }
}

function relative(projectRoot: string, targetPath: string): string {
  return path.relative(projectRoot, targetPath) || ".";
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

function resourceResponse(uri: string, text: string) {
  return {
    contents: [
      {
        uri,
        text
      }
    ]
  };
}

function toMcpCallResult(result: McpToolResult) {
  return {
    structuredContent: result as unknown as Record<string, unknown>,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: result.success === false
  };
}
