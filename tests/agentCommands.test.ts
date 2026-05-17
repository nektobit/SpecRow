import { describe, expect, it } from "vitest";

import {
  AGENT_COMMAND_NAMES,
  AGENT_COMMAND_SPECS,
  assertAgentCommandLanguageResources,
  getAgentCommandSpec,
  listAgentCommandSpecs
} from "../src/agentCommands.js";
import { MissingLanguageResourceError, SUPPORTED_LANGUAGES } from "../src/templates.js";

describe("SpecRow agent commands", () => {
  it("defines the MVP user-facing command set", () => {
    expect(AGENT_COMMAND_SPECS.map((command) => command.name)).toEqual([...AGENT_COMMAND_NAMES]);
  });

  it("keeps CLI mechanics as implementation details", () => {
    for (const command of AGENT_COMMAND_SPECS) {
      expect(command.userIntent.length).toBeGreaterThan(0);
      expect(command.toolCore.length).toBeGreaterThan(0);
      expect(command.cliCore.length).toBeGreaterThan(0);
      expect(command.agentBehavior.length).toBeGreaterThan(0);
    }
  });

  it("prefers MCP tools before CLI fallback in generated command specs", () => {
    const proposal = getAgentCommandSpec("/specrow:proposal", "en");

    expect(proposal.toolCore).toEqual(["specrow_create_proposal", "specrow_validate", "specrow_context"]);
    expect(proposal.cliCore).toEqual(["specrow proposal <change-name>", "specrow validate <change-name>", "specrow context <change-name>"]);
  });

  it("keeps explore read-only and pre-proposal", () => {
    const explore = getAgentCommandSpec("/specrow:explore", "en");

    expect(explore.phase).toBe("exploration");
    expect(explore.toolCore).toEqual(["specrow_project_status", "specrow_context", "specrow_validate", "specrow_template_context"]);
    expect(explore.allowsFinalSpecIntegration).toBe(false);
    expect(explore.allowsArchive).toBe(false);
    expect(explore.forbiddenActions).toEqual(
      expect.arrayContaining([
        "Do not create proposal.md, tasks.md, status.yml, or a change directory during exploration.",
        "Do not implement code during exploration."
      ])
    );
    expect(explore.nextCommands).toEqual(["/specrow:proposal", "/specrow:init"]);
  });

  it("requires configured language resources without falling back to English", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      expect(() => assertAgentCommandLanguageResources(language)).not.toThrow();
      expect(listAgentCommandSpecs(language)).toHaveLength(AGENT_COMMAND_NAMES.length);
    }

    expect(() => listAgentCommandSpecs("fr")).toThrow(MissingLanguageResourceError);
    expect(() => listAgentCommandSpecs("fr")).toThrow('Missing SpecRow language for language "fr".');
  });

  it("requires every command to follow the language rule", () => {
    for (const command of AGENT_COMMAND_SPECS) {
      expect(command.languageRules).toEqual(
        expect.arrayContaining([
          "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
          "Do not silently fall back to English."
        ])
      );
    }
  });

  it("makes review recommended by default and required only for risky changes", () => {
    const review = getAgentCommandSpec("/specrow:review", "en");

    expect(review.reviewPolicy?.default).toBe("recommended");
    expect(review.reviewPolicy?.requiredWhen).toEqual(
      expect.arrayContaining([
        "Security, privacy, or permission behavior changes.",
        "Data model, migration, persistence, or destructive operation changes."
      ])
    );
  });

  it("returns localized command text for the requested language", () => {
    const review = getAgentCommandSpec("/specrow:review", "ru");

    expect(review.userIntent).toContain("Проверить готовность");
    expect(review.languageRules).toEqual(expect.arrayContaining(["Не выполнять скрытый fallback на английский."]));
  });

  it("keeps build implementation-only", () => {
    const build = getAgentCommandSpec("/specrow:build", "en");

    expect(build.allowsFinalSpecIntegration).toBe(false);
    expect(build.allowsArchive).toBe(false);
    expect(build.forbiddenActions).toEqual(
      expect.arrayContaining(["Do not run acceptance.", "Do not archive the change.", "Do not update specs as final truth."])
    );
    expect(build.nextCommands).toEqual(["/specrow:accept", "/specrow:revise"]);
  });

  it("makes accept the only command that can authorize final truth and archive", () => {
    expect(AGENT_COMMAND_SPECS.filter((command) => command.allowsFinalSpecIntegration).map((command) => command.name)).toEqual([
      "/specrow:accept"
    ]);
    expect(AGENT_COMMAND_SPECS.filter((command) => command.allowsArchive).map((command) => command.name)).toEqual([
      "/specrow:accept"
    ]);
    expect(getAgentCommandSpec("/specrow:accept", "en").requiresExplicitUserAcceptance).toBe(true);
  });
});
