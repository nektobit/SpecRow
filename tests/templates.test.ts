import { describe, expect, it } from "vitest";

import {
  getSpecRowMessage,
  getSpecRowAgentCommandText,
  getSpecRowIntegrationText,
  getSpecRowTemplate,
  MissingLanguageResourceError,
  REQUIRED_AGENT_COMMANDS,
  REQUIRED_MESSAGES,
  REQUIRED_TEMPLATES,
  SUPPORTED_LANGUAGES,
  TEMPLATE_REGISTRY
} from "../src/templates.js";

describe("SpecRow templates", () => {
  it("has every required template for every supported language", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      for (const templateName of REQUIRED_TEMPLATES) {
        expect(TEMPLATE_REGISTRY[language].templates[templateName], `${language}.${templateName}`).toContain("#");
      }
    }
  });

  it("has every required message for every supported language", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      for (const messageName of REQUIRED_MESSAGES) {
        expect(TEMPLATE_REGISTRY[language].messages[messageName], `${language}.${messageName}`).toBeTruthy();
      }
    }
  });

  it("has every required agent command and integration text for every supported language", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      for (const commandName of REQUIRED_AGENT_COMMANDS) {
        expect(getSpecRowAgentCommandText(language, commandName).userIntent, `${language}.${commandName}`).toBeTruthy();
      }

      expect(getSpecRowIntegrationText(language).managedHeader, `${language}.integration.managedHeader`).toContain("specrow update");
    }
  });

  it("returns localized templates without falling back to English", () => {
    expect(getSpecRowTemplate("ru", "project")).toContain("# Проект");
    expect(getSpecRowTemplate("es", "proposal")).toContain("# Propuesta");
    expect(getSpecRowTemplate("zh-CN", "tasks")).toContain("# 任务");
  });

  it("includes OpenSpec-like behavior-first guidance in every supported language", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const spec = getSpecRowTemplate(language, "spec");
      const proposal = getSpecRowTemplate(language, "proposal");
      const tasks = getSpecRowTemplate(language, "tasks");

      expect(spec).toContain("### ");
      expect(spec).toContain("#### ");
      expect(proposal).toContain("specrow accept");
      expect(tasks).toContain("specrow revise");
    }
  });

  it("renders localized messages with placeholders", () => {
    expect(getSpecRowMessage("ru", "init.ready", { path: ".specrow" })).toBe("Готово .specrow");
    expect(getSpecRowMessage("es", "next.acceptOrRevise")).toContain("specrow accept");
  });

  it("fails clearly when a language resource is missing", () => {
    expect(() => getSpecRowTemplate("fr", "project")).toThrow(MissingLanguageResourceError);
    expect(() => getSpecRowTemplate("fr", "project")).toThrow('Missing SpecRow language for language "fr".');
  });
});
