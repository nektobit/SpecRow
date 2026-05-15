import {
  getSpecRowMessage,
  getSpecRowAgentCommandText,
  getSpecRowTemplate,
  REQUIRED_AGENT_COMMANDS,
  REQUIRED_MESSAGES,
  REQUIRED_TEMPLATES
} from "./templates.js";

export const AGENT_COMMAND_NAMES = [
  "/specrow:init",
  "/specrow:proposal",
  "/specrow:review",
  "/specrow:build",
  "/specrow:revise",
  "/specrow:accept"
] as const;

export type AgentCommandName = (typeof AGENT_COMMAND_NAMES)[number];

export type AgentCommandPhase = "setup" | "proposal" | "review" | "implementation" | "revision" | "acceptance";

export interface ReviewPolicy {
  default: "recommended";
  requiredWhen: readonly string[];
}

export interface AgentCommandSpec {
  name: AgentCommandName;
  phase: AgentCommandPhase;
  userIntent: string;
  toolCore: readonly string[];
  cliCore: readonly string[];
  agentBehavior: readonly string[];
  forbiddenActions: readonly string[];
  languageRules: readonly string[];
  stopConditions: readonly string[];
  nextCommands: readonly AgentCommandName[];
  reviewPolicy?: ReviewPolicy;
  allowsFinalSpecIntegration: boolean;
  allowsArchive: boolean;
  requiresExplicitUserAcceptance: boolean;
}

export const AGENT_LANGUAGE_RULES = [
  "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
  "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
  "Stop with a clear missing-resource error when a required template or message is unavailable.",
  "Do not silently fall back to English."
] as const;

export const AGENT_COMMAND_SPECS: readonly AgentCommandSpec[] = [
  {
    name: "/specrow:init",
    phase: "setup",
    userIntent: "Set up SpecRow for the current project without requiring the user to know CLI flags or files.",
    toolCore: ["specrow_init"],
    cliCore: ["specrow init --language <language>"],
    agentBehavior: [
      "Determine the intended project language from the user or ask for it when it is ambiguous.",
      "Run the CLI init command as an implementation detail.",
      "Confirm that .specrow/config.yml, project.md, specs/, changes/, and archive/ exist."
    ],
    forbiddenActions: [
      "Do not create legacy workspace directories.",
      "Do not continue if the requested language resources are missing."
    ],
    languageRules: AGENT_LANGUAGE_RULES,
    stopConditions: ["Missing template or message resources for the requested language."],
    nextCommands: ["/specrow:proposal"],
    allowsFinalSpecIntegration: false,
    allowsArchive: false,
    requiresExplicitUserAcceptance: false
  },
  {
    name: "/specrow:proposal",
    phase: "proposal",
    userIntent: "Turn the user's intent into a concrete change proposal and task skeleton.",
    toolCore: ["specrow_create_proposal", "specrow_validate", "specrow_context"],
    cliCore: ["specrow proposal <change-name>", "specrow validate <change-name>", "specrow context <change-name>"],
    agentBehavior: [
      "Choose a stable change name from the user's intent.",
      "Create proposal.md, tasks.md, and status.yml through the CLI core.",
      "Fill proposal and task content in the configured project language.",
      "Validate the change and surface any blocking issues before implementation starts."
    ],
    forbiddenActions: [
      "Do not implement code as part of proposal creation.",
      "Do not accept, archive, or update specs as final truth."
    ],
    languageRules: AGENT_LANGUAGE_RULES,
    stopConditions: [
      "The project is not initialized.",
      "The configured language has missing templates or lifecycle messages.",
      "Required proposal or task sections cannot be produced."
    ],
    nextCommands: ["/specrow:review", "/specrow:build"],
    allowsFinalSpecIntegration: false,
    allowsArchive: false,
    requiresExplicitUserAcceptance: false
  },
  {
    name: "/specrow:review",
    phase: "review",
    userIntent: "Check proposal readiness before code; recommended by default and required only for risky changes.",
    toolCore: ["specrow_review", "specrow_validate"],
    cliCore: ["specrow review <change-name>", "specrow validate <change-name>"],
    agentBehavior: [
      "Review problem framing, scope, risks, decisions, acceptance criteria, and language consistency.",
      "Treat review as required for risky changes and recommended for ordinary changes.",
      "Ask the user or revise the proposal when review finds blocking ambiguity."
    ],
    forbiddenActions: [
      "Do not implement code during review.",
      "Do not use review as acceptance."
    ],
    languageRules: AGENT_LANGUAGE_RULES,
    stopConditions: [
      "Acceptance criteria are missing or too weak.",
      "Risky changes lack explicit risk, migration, security, data, or compatibility decisions.",
      "The configured language has missing templates or lifecycle messages."
    ],
    nextCommands: ["/specrow:build", "/specrow:proposal"],
    reviewPolicy: {
      default: "recommended",
      requiredWhen: [
        "Security, privacy, or permission behavior changes.",
        "Data model, migration, persistence, or destructive operation changes.",
        "Public API, CLI contract, automation, or CI behavior changes.",
        "Architecture, cross-module workflow, localization, or user-visible lifecycle changes."
      ]
    },
    allowsFinalSpecIntegration: false,
    allowsArchive: false,
    requiresExplicitUserAcceptance: false
  },
  {
    name: "/specrow:build",
    phase: "implementation",
    userIntent: "Implement and verify an approved change without turning it into final truth.",
    toolCore: ["specrow_context", "specrow_build_start", "specrow_build_finish"],
    cliCore: ["specrow context <change-name>", "specrow build-start <change-name>", "specrow build-finish <change-name>"],
    agentBehavior: [
      "Use CLI context to load the proposal, tasks, status, and active-change warnings.",
      "Implement only the work described by the change.",
      "Run relevant verification and update the change tasks with implementation evidence when appropriate.",
      "Finish by leaving the change waiting for /specrow:accept or /specrow:revise."
    ],
    forbiddenActions: [
      "Do not run acceptance.",
      "Do not archive the change.",
      "Do not update specs as final truth."
    ],
    languageRules: AGENT_LANGUAGE_RULES,
    stopConditions: [
      "Validation fails before implementation.",
      "The proposal is too ambiguous to implement safely.",
      "The configured language has missing templates or lifecycle messages."
    ],
    nextCommands: ["/specrow:accept", "/specrow:revise"],
    allowsFinalSpecIntegration: false,
    allowsArchive: false,
    requiresExplicitUserAcceptance: false
  },
  {
    name: "/specrow:revise",
    phase: "revision",
    userIntent: "Handle user-requested changes after build without accepting or archiving the change.",
    toolCore: ["specrow_revise", "specrow_context", "specrow_validate"],
    cliCore: ["specrow revise <change-name>", "specrow context <change-name>", "specrow validate <change-name>"],
    agentBehavior: [
      "Mark the change as needing revision.",
      "Apply the user's requested follow-up changes to the proposal, tasks, implementation, or verification evidence as needed.",
      "Re-run relevant verification and leave the change ready for another user decision."
    ],
    forbiddenActions: [
      "Do not treat revision as acceptance.",
      "Do not archive the change.",
      "Do not update specs as final truth."
    ],
    languageRules: AGENT_LANGUAGE_RULES,
    stopConditions: [
      "The requested revision conflicts with the proposal scope and needs a new user decision.",
      "The configured language has missing templates or lifecycle messages."
    ],
    nextCommands: ["/specrow:accept", "/specrow:build"],
    allowsFinalSpecIntegration: false,
    allowsArchive: false,
    requiresExplicitUserAcceptance: false
  },
  {
    name: "/specrow:accept",
    phase: "acceptance",
    userIntent: "Record explicit user acceptance and allow final spec integration and archive.",
    toolCore: ["specrow_accept", "specrow_archive"],
    cliCore: ["specrow accept <change-name> --yes", "specrow archive <change-name>"],
    agentBehavior: [
      "Proceed only when the user clearly accepts the built or completed revision work.",
      "Record explicit acceptance through the CLI core.",
      "Use this path as the only user-facing authorization for specs becoming final truth and for archive."
    ],
    forbiddenActions: [
      "Do not infer acceptance from silence, successful tests, or completed implementation.",
      "Do not accept a change that is not built or revision-complete."
    ],
    languageRules: AGENT_LANGUAGE_RULES,
    stopConditions: [
      "The user has not explicitly accepted the change.",
      "The change is not built or revision-complete.",
      "The configured language has missing templates or lifecycle messages."
    ],
    nextCommands: [],
    allowsFinalSpecIntegration: true,
    allowsArchive: true,
    requiresExplicitUserAcceptance: true
  }
] as const;

export function listAgentCommandSpecs(language: string): readonly AgentCommandSpec[] {
  assertAgentCommandLanguageResources(language);
  return AGENT_COMMAND_SPECS.map((command) => localizeAgentCommandSpec(command, language));
}

export function getAgentCommandSpec(name: AgentCommandName, language: string): AgentCommandSpec {
  assertAgentCommandLanguageResources(language);
  const command = AGENT_COMMAND_SPECS.find((candidate) => candidate.name === name);

  if (command === undefined) {
    throw new Error(`Unknown SpecRow agent command "${name}".`);
  }

  return localizeAgentCommandSpec(command, language);
}

export function assertAgentCommandLanguageResources(language: string): void {
  for (const templateName of REQUIRED_TEMPLATES) {
    getSpecRowTemplate(language, templateName);
  }

  for (const messageName of REQUIRED_MESSAGES) {
    getSpecRowMessage(language, messageName);
  }

  for (const commandName of REQUIRED_AGENT_COMMANDS) {
    getSpecRowAgentCommandText(language, commandName);
  }
}

function localizeAgentCommandSpec(command: AgentCommandSpec, language: string): AgentCommandSpec {
  const localized = getSpecRowAgentCommandText(language, command.name);

  return {
    ...command,
    userIntent: localized.userIntent,
    agentBehavior: localized.agentBehavior,
    forbiddenActions: localized.forbiddenActions,
    languageRules: localized.languageRules,
    stopConditions: localized.stopConditions,
    reviewPolicy:
      command.reviewPolicy === undefined
        ? undefined
        : {
            ...command.reviewPolicy,
            requiredWhen: localized.reviewPolicyRequiredWhen ?? command.reviewPolicy.requiredWhen
          }
  };
}
