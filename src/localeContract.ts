import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import {
  REQUIRED_AGENT_COMMANDS,
  REQUIRED_MESSAGES,
  REQUIRED_TEMPLATES,
  SUPPORTED_LANGUAGES,
  TEMPLATE_REGISTRY,
  type AgentCommandName,
  type LanguageResources,
  type MessageName,
  type SupportedLanguage,
  type TemplateName
} from "./templates.js";

export type LocaleIssueSeverity = "error" | "warning";

export interface LocaleIssue {
  severity: LocaleIssueSeverity;
  path: string;
  message: string;
}

const DOCUMENTATION_FILES: Record<SupportedLanguage, string> = {
  en: "README.md",
  ru: "README.ru.md",
  es: "README.es.md",
  "zh-CN": "README.zh-CN.md"
};

export async function validateLocaleContract(cwd = process.cwd()): Promise<LocaleIssue[]> {
  return [...validateRuntimeLocaleContract(), ...(await validateDocumentationLocaleContract(cwd))];
}

export function validateRuntimeLocaleContract(): LocaleIssue[] {
  const issues: LocaleIssue[] = [];
  const baseLanguage = "en";
  const base = TEMPLATE_REGISTRY[baseLanguage];

  for (const language of SUPPORTED_LANGUAGES) {
    const resources = TEMPLATE_REGISTRY[language];
    issues.push(...validateRequiredRuntimeKeys(language, resources));
    issues.push(...validatePlaceholderParity(language, resources, base));
  }

  return issues;
}

async function validateDocumentationLocaleContract(cwd: string): Promise<LocaleIssue[]> {
  const issues: LocaleIssue[] = [];
  const siteContentPath = path.join(cwd, "site", "src", "content.ts");
  const siteContent = (await pathExists(siteContentPath)) ? await readFile(siteContentPath, "utf8") : "";
  const baseReadmePath = path.join(cwd, DOCUMENTATION_FILES.en);
  const baseReadmeSignature = (await pathExists(baseReadmePath))
    ? headingSignature(await readFile(baseReadmePath, "utf8"))
    : [];

  for (const language of SUPPORTED_LANGUAGES) {
    const readmePath = path.join(cwd, DOCUMENTATION_FILES[language]);

    if (!(await pathExists(readmePath))) {
      issues.push({
        severity: "error",
        path: DOCUMENTATION_FILES[language],
        message: `Missing localized README for ${language}.`
      });
    } else {
      const signature = headingSignature(await readFile(readmePath, "utf8"));

      if (signature.join(",") !== baseReadmeSignature.join(",")) {
        issues.push({
          severity: "error",
          path: DOCUMENTATION_FILES[language],
          message: "Localized README heading structure differs from the documentation contract."
        });
      }
    }

    if (siteContent.length === 0) {
      issues.push({
        severity: "error",
        path: "site/src/content.ts",
        message: "Missing localized site content registry."
      });
    } else if (!siteContent.includes(`code: '${language}'`) && !siteContent.includes(`${language}: {`)) {
      issues.push({
        severity: "error",
        path: "site/src/content.ts",
        message: `Missing site locale entry for ${language}.`
      });
    }
  }

  return issues;
}

function headingSignature(markdown: string): string[] {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.match(/^(#{1,6})\s+/)?.[1].length.toString() ?? "");
}

function validateRequiredRuntimeKeys(language: SupportedLanguage, resources: LanguageResources): LocaleIssue[] {
  const issues: LocaleIssue[] = [];

  for (const templateName of REQUIRED_TEMPLATES) {
    if (!hasText(resources.templates[templateName])) {
      issues.push(missingIssue(language, `templates.${templateName}`));
    }
  }

  for (const messageName of REQUIRED_MESSAGES) {
    if (!hasText(resources.messages[messageName])) {
      issues.push(missingIssue(language, `messages.${messageName}`));
    }
  }

  for (const commandName of REQUIRED_AGENT_COMMANDS) {
    const command = resources.agentCommands[commandName];

    if (command === undefined) {
      issues.push(missingIssue(language, `agentCommands.${commandName}`));
      continue;
    }

    if (!hasText(command.userIntent)) {
      issues.push(missingIssue(language, `agentCommands.${commandName}.userIntent`));
    }

    for (const [field, values] of [
      ["agentBehavior", command.agentBehavior],
      ["forbiddenActions", command.forbiddenActions],
      ["languageRules", command.languageRules],
      ["stopConditions", command.stopConditions]
    ] as const) {
      if (values.length === 0 || values.some((item) => !hasText(item))) {
        issues.push(missingIssue(language, `agentCommands.${commandName}.${field}`));
      }
    }
  }

  for (const [pathName, value] of flattenIntegrationResources(resources.integration)) {
    if (!hasText(value)) {
      issues.push(missingIssue(language, `integration.${pathName}`));
    }
  }

  return issues;
}

function validatePlaceholderParity(
  language: SupportedLanguage,
  resources: LanguageResources,
  base: LanguageResources
): LocaleIssue[] {
  const issues: LocaleIssue[] = [];

  for (const messageName of REQUIRED_MESSAGES) {
    pushPlaceholderIssue(issues, language, `messages.${messageName}`, base.messages[messageName], resources.messages[messageName]);
  }

  for (const commandName of REQUIRED_AGENT_COMMANDS) {
    const baseCommand = base.agentCommands[commandName];
    const command = resources.agentCommands[commandName];

    if (command === undefined) {
      continue;
    }

    pushPlaceholderIssue(issues, language, `agentCommands.${commandName}.userIntent`, baseCommand.userIntent, command.userIntent);
    pushArrayPlaceholderIssues(issues, language, commandName, "agentBehavior", baseCommand.agentBehavior, command.agentBehavior);
    pushArrayPlaceholderIssues(issues, language, commandName, "forbiddenActions", baseCommand.forbiddenActions, command.forbiddenActions);
    pushArrayPlaceholderIssues(issues, language, commandName, "languageRules", baseCommand.languageRules, command.languageRules);
    pushArrayPlaceholderIssues(issues, language, commandName, "stopConditions", baseCommand.stopConditions, command.stopConditions);
  }

  const baseIntegration = flattenIntegrationResources(base.integration);

  for (const [pathName, baseText] of baseIntegration) {
    const localizedText = flattenIntegrationResources(resources.integration).find(([candidate]) => candidate === pathName)?.[1];
    pushPlaceholderIssue(issues, language, `integration.${pathName}`, baseText, localizedText ?? "");
  }

  return issues;
}

function pushArrayPlaceholderIssues(
  issues: LocaleIssue[],
  language: SupportedLanguage,
  commandName: AgentCommandName,
  field: string,
  baseValues: readonly string[],
  localizedValues: readonly string[]
): void {
  if (baseValues.length !== localizedValues.length) {
    issues.push({
      severity: "error",
      path: `${language}.agentCommands.${commandName}.${field}`,
      message: `Array length mismatch. Expected ${baseValues.length}, got ${localizedValues.length}.`
    });
  }

  for (let index = 0; index < baseValues.length; index += 1) {
    pushPlaceholderIssue(
      issues,
      language,
      `agentCommands.${commandName}.${field}.${index}`,
      baseValues[index],
      localizedValues[index] ?? ""
    );
  }
}

function pushPlaceholderIssue(
  issues: LocaleIssue[],
  language: SupportedLanguage,
  resourcePath: string,
  baseText: string,
  localizedText: string
): void {
  const basePlaceholders = extractPlaceholders(baseText);
  const localizedPlaceholders = extractPlaceholders(localizedText);

  if (basePlaceholders.join(",") !== localizedPlaceholders.join(",")) {
    issues.push({
      severity: "error",
      path: `${language}.${resourcePath}`,
      message: `Placeholder mismatch. Expected {${basePlaceholders.join("},{")}}, got {${localizedPlaceholders.join("},{")}}.`
    });
  }
}

function flattenIntegrationResources(resources: LanguageResources["integration"]): [string, string][] {
  return [
    ["managedHeader", resources.managedHeader],
    ["commandSections.invocation", resources.commandSections.invocation],
    ["commandSections.userIntent", resources.commandSections.userIntent],
    ["commandSections.toolCore", resources.commandSections.toolCore],
    ["commandSections.agentBehavior", resources.commandSections.agentBehavior],
    ["commandSections.forbiddenActions", resources.commandSections.forbiddenActions],
    ["commandSections.languageRules", resources.commandSections.languageRules],
    ["commandSections.stopConditions", resources.commandSections.stopConditions],
    ["commandSections.nextCommands", resources.commandSections.nextCommands],
    ["commandSections.none", resources.commandSections.none],
    ["invocationTemplate", resources.invocationTemplate],
    ["agentInstructions.title", resources.agentInstructions.title],
    ["agentInstructions.overview", resources.agentInstructions.overview],
    ["agentInstructions.languageRule", resources.agentInstructions.languageRule],
    ["agentInstructions.toolCore", resources.agentInstructions.toolCore],
    ["agentInstructions.forbidden", resources.agentInstructions.forbidden],
    ["toolCoreFallback", resources.toolCoreFallback],
    ["skill.description", resources.skill.description],
    ["skill.whenToUse", resources.skill.whenToUse],
    ["skill.instructions", resources.skill.instructions],
    ...resources.skill.triggers.map((trigger, index): [string, string] => [`skill.triggers.${index}`, trigger])
  ];
}

function extractPlaceholders(value: string): string[] {
  return [...new Set([...value.matchAll(/\{([a-zA-Z0-9_.-]+)\}/g)].map((match) => match[1]))].sort();
}

function missingIssue(language: SupportedLanguage, resourcePath: string): LocaleIssue {
  return {
    severity: "error",
    path: `${language}.${resourcePath}`,
    message: "Missing required localized resource."
  };
}

function hasText(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
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
