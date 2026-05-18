import { en } from "./locales/en.js";
import { es } from "./locales/es.js";
import { ru } from "./locales/ru.js";
import { zhCN } from "./locales/zh-CN.js";

export type TemplateName = "project" | "spec" | "proposal" | "tasks";

export type AgentCommandName =
  | "/specrow:init"
  | "/specrow:migrate"
  | "/specrow:explore"
  | "/specrow:proposal"
  | "/specrow:review"
  | "/specrow:build"
  | "/specrow:revise"
  | "/specrow:accept";

export type MessageName =
  | "init.config.created"
  | "init.config.overwritten"
  | "init.config.kept"
  | "init.ready"
  | "lifecycle.proposed"
  | "lifecycle.reviewed"
  | "lifecycle.built"
  | "lifecycle.revisionNeeded"
  | "lifecycle.accepted"
  | "lifecycle.archived"
  | "build.started"
  | "validate.ok"
  | "validate.failed"
  | "review.warning"
  | "status.change"
  | "list.empty"
  | "list.warning"
  | "next.acceptOrRevise"
  | "migration.completed"
  | "migration.dryRun"
  | "migration.initialized"
  | "migration.sourceDetected"
  | "migration.copied"
  | "migration.converted"
  | "migration.skipped"
  | "migration.warning"
  | "migration.warning.noSpecKitFeatures"
  | "migration.warning.noDocumentationFiles"
  | "migration.warning.importedDocumentationReview"
  | "migration.proposalAppendix"
  | "migration.tasksAppendix"
  | "error.missingTemplate"
  | "error.missingMessage";

export interface LanguageResources {
  templates: Record<TemplateName, string>;
  messages: Record<MessageName, string>;
  agentCommands: Record<AgentCommandName, AgentCommandText>;
  integration: IntegrationTextResources;
}

export const REQUIRED_TEMPLATES: readonly TemplateName[] = ["project", "spec", "proposal", "tasks"];

export interface AgentCommandText {
  userIntent: string;
  agentBehavior: readonly string[];
  forbiddenActions: readonly string[];
  languageRules: readonly string[];
  stopConditions: readonly string[];
  reviewPolicyRequiredWhen?: readonly string[];
}

export interface IntegrationTextResources {
  managedHeader: string;
  commandSections: {
    invocation: string;
    userIntent: string;
    toolCore: string;
    agentBehavior: string;
    forbiddenActions: string;
    languageRules: string;
    stopConditions: string;
    nextCommands: string;
    none: string;
  };
  invocationTemplate: string;
  agentInstructions: {
    title: string;
    overview: string;
    languageRule: string;
    toolCore: string;
    forbidden: string;
  };
  toolCoreFallback: string;
  skill: {
    description: string;
    whenToUse: string;
    instructions: string;
    triggers: readonly string[];
  };
}

export const REQUIRED_MESSAGES: readonly MessageName[] = [
  "init.config.created",
  "init.config.overwritten",
  "init.config.kept",
  "init.ready",
  "lifecycle.proposed",
  "lifecycle.reviewed",
  "lifecycle.built",
  "lifecycle.revisionNeeded",
  "lifecycle.accepted",
  "lifecycle.archived",
  "build.started",
  "validate.ok",
  "validate.failed",
  "review.warning",
  "status.change",
  "list.empty",
  "list.warning",
  "next.acceptOrRevise",
  "migration.completed",
  "migration.dryRun",
  "migration.initialized",
  "migration.sourceDetected",
  "migration.copied",
  "migration.converted",
  "migration.skipped",
  "migration.warning",
  "migration.warning.noSpecKitFeatures",
  "migration.warning.noDocumentationFiles",
  "migration.warning.importedDocumentationReview",
  "migration.proposalAppendix",
  "migration.tasksAppendix",
  "error.missingTemplate",
  "error.missingMessage"
];

export const REQUIRED_AGENT_COMMANDS: readonly AgentCommandName[] = [
  "/specrow:init",
  "/specrow:migrate",
  "/specrow:explore",
  "/specrow:proposal",
  "/specrow:review",
  "/specrow:build",
  "/specrow:revise",
  "/specrow:accept"
];

export class MissingLanguageResourceError extends Error {
  constructor(
    public readonly language: string,
    public readonly resourceType: "template" | "message" | "language",
    public readonly resourceName?: string
  ) {
    const label = resourceName ? `${resourceType} "${resourceName}"` : resourceType;
    super(`Missing SpecRow ${label} for language "${language}".`);
    this.name = "MissingLanguageResourceError";
  }
}

export const TEMPLATE_REGISTRY = {
  en,
  ru,
  es,
  "zh-CN": zhCN
} satisfies Record<string, LanguageResources>;

export type SupportedLanguage = keyof typeof TEMPLATE_REGISTRY;

export const SUPPORTED_LANGUAGES = Object.keys(TEMPLATE_REGISTRY) as SupportedLanguage[];

export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return Object.prototype.hasOwnProperty.call(TEMPLATE_REGISTRY, language);
}

export function getLanguageResources(language: string): LanguageResources {
  if (!isSupportedLanguage(language)) {
    throw new MissingLanguageResourceError(language, "language");
  }

  return TEMPLATE_REGISTRY[language];
}

export function getSpecRowTemplate(language: string, name: TemplateName): string {
  const template = getLanguageResources(language).templates[name];

  if (template === undefined) {
    throw new MissingLanguageResourceError(language, "template", name);
  }

  return template;
}

export function getSpecRowMessage(language: string, name: MessageName, values: Record<string, string> = {}): string {
  const message = getLanguageResources(language).messages[name];

  if (message === undefined) {
    throw new MissingLanguageResourceError(language, "message", name);
  }

  return renderMessage(message, values);
}

export function getSpecRowAgentCommandText(language: string, name: AgentCommandName): AgentCommandText {
  const command = getLanguageResources(language).agentCommands[name];

  if (command === undefined) {
    throw new MissingLanguageResourceError(language, "message", `agentCommands.${name}`);
  }

  return command;
}

export function getSpecRowIntegrationText(language: string): IntegrationTextResources {
  return getLanguageResources(language).integration;
}

function renderMessage(message: string, values: Record<string, string>): string {
  return message.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (match, key: string) => values[key] ?? match);
}
