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
}

export const REQUIRED_TEMPLATES: readonly TemplateName[] = ["project", "spec", "proposal", "tasks"];

export const TEMPLATE_SECTION_IDS = {
  project: ["purpose", "working-language", "domain-vocabulary", "architecture-notes", "constraints", "verification"],
  spec: ["purpose", "current-behavior", "requirements", "constraints", "decisions", "verification"],
  proposal: ["summary", "problem", "proposed-change", "scope", "out-of-scope", "user-impact", "risks", "decisions", "estimation", "acceptance-criteria", "spec-updates"],
  tasks: ["implementation", "verification", "documentation", "acceptance-gate"]
} as const satisfies Record<TemplateName, readonly string[]>;

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

export function templateSectionHeadings(template: string): string[] {
  return templateSections(template).map((section) => section.heading);
}

export interface TemplateSection {
  id: string;
  heading: string;
}

export function templateSections(template: string): TemplateSection[] {
  const sections: TemplateSection[] = [];
  let pendingId: string | undefined;

  for (const line of template.split(/\r?\n/)) {
    const marker = line.match(/^<!--\s*specrow:section=([a-z0-9]+(?:-[a-z0-9]+)*)\s*-->$/);
    if (marker !== null) {
      pendingId = marker[1];
      continue;
    }

    if (line.startsWith("## ") && !line.startsWith("### ")) {
      sections.push({ id: pendingId ?? "", heading: line.replace(/^##\s+/, "").trim() });
      pendingId = undefined;
    }
  }

  return sections;
}

export function templateSectionHeading(template: string, sectionId: string): string | undefined {
  return templateSections(template).find((section) => section.id === sectionId)?.heading;
}

export function getSpecRowTemplateSectionHeading(language: string, templateName: TemplateName, sectionId: string): string {
  if (!TEMPLATE_SECTION_IDS[templateName].some((candidate) => candidate === sectionId)) {
    throw new Error(`Unknown SpecRow section "${templateName}.${sectionId}".`);
  }

  const heading = templateSectionHeading(getSpecRowTemplate(language, templateName), sectionId);

  if (heading === undefined) {
    throw new MissingLanguageResourceError(language, "template", `${templateName}.${sectionId}`);
  }

  return heading;
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
