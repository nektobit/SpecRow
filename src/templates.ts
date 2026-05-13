import { en } from "./locales/en.js";
import { es } from "./locales/es.js";
import { ru } from "./locales/ru.js";
import { zhCN } from "./locales/zh-CN.js";

export type TemplateName = "project" | "spec" | "proposal" | "tasks";

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
  | "error.missingTemplate"
  | "error.missingMessage";

export interface LanguageResources {
  templates: Record<TemplateName, string>;
  messages: Record<MessageName, string>;
}

export const REQUIRED_TEMPLATES: readonly TemplateName[] = ["project", "spec", "proposal", "tasks"];

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
  "error.missingTemplate",
  "error.missingMessage"
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

function renderMessage(message: string, values: Record<string, string>): string {
  return message.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (match, key: string) => values[key] ?? match);
}
