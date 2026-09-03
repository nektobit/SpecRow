import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import {
  REQUIRED_MESSAGES,
  REQUIRED_TEMPLATES,
  SUPPORTED_LANGUAGES,
  TEMPLATE_SECTION_IDS,
  TEMPLATE_REGISTRY,
  templateSections,
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

const README_SECTION_IDS = ["title", "language-links", "documentation", "quick-start", "workspace", "accept-gate", "migration"] as const;
const README_SOURCE_DIGEST = "4cd8a1de4146dc05";
const README_CONTENT_DIGESTS: Record<SupportedLanguage, string> = {
  en: "4cd8a1de4146dc05",
  ru: "e1a245ef68b91fad",
  es: "a4ca257ede7ac1d1",
  "zh-CN": "5a05422ebc6038c4"
};
const README_REVIEWED_SOURCE_DIGESTS: Record<SupportedLanguage, string> = {
  en: "4cd8a1de4146dc05",
  ru: "4cd8a1de4146dc05",
  es: "4cd8a1de4146dc05",
  "zh-CN": "4cd8a1de4146dc05"
};
const RUNTIME_SOURCE_DIGEST = "5ac21ab4dac86400";
const RUNTIME_CONTENT_DIGESTS: Record<SupportedLanguage, string> = {
  en: "5ac21ab4dac86400",
  ru: "989e26f93a630b8f",
  es: "4075250e58f261af",
  "zh-CN": "88d107493ca82847"
};
const RUNTIME_REVIEWED_SOURCE_DIGESTS: Record<SupportedLanguage, string> = {
  en: "5ac21ab4dac86400",
  ru: "5ac21ab4dac86400",
  es: "5ac21ab4dac86400",
  "zh-CN": "5ac21ab4dac86400"
};

export async function validateLocaleContract(cwd = process.cwd()): Promise<LocaleIssue[]> {
  return [...validateRuntimeLocaleContract(), ...(await validateDocumentationLocaleContract(cwd))];
}

export function validateRuntimeLocaleContract(): LocaleIssue[] {
  const issues: LocaleIssue[] = [];
  const baseLanguage = "en";
  const base = TEMPLATE_REGISTRY[baseLanguage];
  const actualSourceDigest = runtimeResourceDigest(base);

  if (actualSourceDigest !== RUNTIME_SOURCE_DIGEST) {
    issues.push({ severity: "error", path: "en", message: `Runtime locale source changed. Expected digest ${RUNTIME_SOURCE_DIGEST}, got ${actualSourceDigest}.` });
  }

  for (const language of SUPPORTED_LANGUAGES) {
    const resources = TEMPLATE_REGISTRY[language];
    const actualDigest = runtimeResourceDigest(resources);
    if (actualDigest !== RUNTIME_CONTENT_DIGESTS[language]) {
      issues.push({ severity: "error", path: language, message: `Runtime locale changed after review. Expected digest ${RUNTIME_CONTENT_DIGESTS[language]}, got ${actualDigest}.` });
    }
    if (RUNTIME_REVIEWED_SOURCE_DIGESTS[language] !== RUNTIME_SOURCE_DIGEST) {
      issues.push({ severity: "error", path: language, message: `Runtime locale was reviewed against source ${RUNTIME_REVIEWED_SOURCE_DIGESTS[language]}, current source is ${RUNTIME_SOURCE_DIGEST}.` });
    }
    issues.push(...validateRequiredRuntimeKeys(language, resources));
    issues.push(...validateTemplateTopology(language, resources));
    issues.push(...validatePlaceholderParity(language, resources, base));
  }

  return issues;
}

function runtimeResourceDigest(resources: LanguageResources): string {
  return createHash("sha256").update(JSON.stringify(resources)).digest("hex").slice(0, 16);
}

function validateTemplateTopology(language: SupportedLanguage, resources: LanguageResources): LocaleIssue[] {
  const issues: LocaleIssue[] = [];

  for (const templateName of REQUIRED_TEMPLATES) {
    const sections = templateSections(resources.templates[templateName]);
    const expectedIds = TEMPLATE_SECTION_IDS[templateName];

    if (sections.map(({ id }) => id).join(",") !== expectedIds.join(",")) {
      issues.push({
        severity: "error",
        path: `${language}.templates.${templateName}`,
        message: `Template section topology mismatch. Expected IDs ${expectedIds.join(", ")}, got ${sections.map(({ id }) => id || "<missing>").join(", ")}.`
      });
    }
  }

  return issues;
}

async function validateDocumentationLocaleContract(cwd: string): Promise<LocaleIssue[]> {
  const issues: LocaleIssue[] = [];
  const baseReadmePath = path.join(cwd, DOCUMENTATION_FILES.en);
  const baseReadme = (await pathExists(baseReadmePath)) ? await readFile(baseReadmePath, "utf8") : "";
  const baseReadmeSignature = headingSignature(baseReadme);
  const baseCommandSignature = documentationCommandSignature(baseReadme);

  if (baseReadme.length > 0 && contentDigest(baseReadme) !== README_SOURCE_DIGEST) {
    issues.push({ severity: "error", path: DOCUMENTATION_FILES.en, message: "README source changed; update its digest and review every translation." });
  }

  for (const language of SUPPORTED_LANGUAGES) {
    const readmePath = path.join(cwd, DOCUMENTATION_FILES[language]);

    if (!(await pathExists(readmePath))) {
      issues.push({
        severity: "error",
        path: DOCUMENTATION_FILES[language],
        message: `Missing localized README for ${language}.`
      });
    } else {
      const readme = await readFile(readmePath, "utf8");
      const signature = headingSignature(readme);

      if (readmeSectionIds(readme).join(",") !== README_SECTION_IDS.join(",")) {
        issues.push({ severity: "error", path: DOCUMENTATION_FILES[language], message: "Localized README semantic section IDs differ from the documentation contract." });
      }

      if (contentDigest(readme) !== README_CONTENT_DIGESTS[language]) {
        issues.push({ severity: "error", path: DOCUMENTATION_FILES[language], message: "Localized README changed after its last recorded review." });
      }

      if (README_REVIEWED_SOURCE_DIGESTS[language] !== README_SOURCE_DIGEST) {
        issues.push({ severity: "error", path: DOCUMENTATION_FILES[language], message: "Localized README was reviewed against an older source digest." });
      }

      if (signature.join(",") !== baseReadmeSignature.join(",")) {
        issues.push({
          severity: "error",
          path: DOCUMENTATION_FILES[language],
          message: "Localized README heading structure differs from the documentation contract."
        });
      }

      const commandSignature = documentationCommandSignature(await readFile(readmePath, "utf8"));

      if (commandSignature.join(",") !== baseCommandSignature.join(",")) {
        issues.push({
          severity: "error",
          path: DOCUMENTATION_FILES[language],
          message: "Localized README command examples differ from the documentation contract."
        });
      }
    }
  }

  return issues;
}

function readmeSectionIds(markdown: string): string[] {
  return [...markdown.matchAll(/^<!--\s*specrow:readme-section=([a-z0-9]+(?:-[a-z0-9]+)*)\s*-->$/gm)].map((match) => match[1]);
}

function contentDigest(value: string): string {
  return createHash("sha256").update(value.replace(/\r\n/g, "\n")).digest("hex").slice(0, 16);
}

function documentationCommandSignature(markdown: string): string[] {
  return markdown.split(/\r?\n/).flatMap((line) => {
    const command = line.trim();
    const specrow = command.match(/^specrow\s+([a-z-]+)/);
    if (specrow !== null) return [`specrow ${specrow[1]}`];

    const packageManager = command.match(/^(npm|pnpm|npx)\s+([^\s]+)/);
    return packageManager === null ? [] : [`${packageManager[1]} ${packageManager[2]}`];
  });
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

  return issues;
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
