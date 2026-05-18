import type { LanguageResources } from "../templates.js";

export const en = {
  templates: {
    project: `# Project

## Purpose
Describe what this project is for, who it serves, and what outcomes matter.

## Working Language
English.

All built-in SpecRow files, agent-authored proposals, specs, tasks, and lifecycle messages should use this language unless a user explicitly asks for a quoted foreign-language term.

## Domain Vocabulary
List project-specific terms, canonical names, acronyms, and words that must not be translated.

- Term:
  - Meaning:
  - Notes:

## Architecture Notes
Capture stable technical context that helps an agent make correct changes.

- Runtime and frameworks:
- Data stores and external systems:
- Important modules or boundaries:
- Existing patterns to preserve:

## Constraints
Document hard rules, compatibility requirements, security or privacy boundaries, performance limits, and operational constraints.

- Constraint:
  - Reason:
  - Verification:

## Verification
Describe how changes are normally proven correct.

- Unit tests:
- Integration tests:
- Manual checks:
- CI or release gates:
`,
    spec: `# <Spec Name>

## Purpose
State the user-visible capability or behavior this spec owns. Keep one focused capability per spec.

## Current Behavior
Describe what is true today. Specs are final truth only after explicit acceptance.

- Current contract:
- Inputs and outputs:
- Error handling:
- Important edge cases:

## Requirements
Use behavior-first requirements. Requirements describe observable behavior, interfaces, constraints, and error handling rather than implementation internals.

### Requirement: <Name>
The system SHALL <observable behavior>.

#### Scenario: <Description>
- **GIVEN** <optional starting state>
- **WHEN** <trigger or condition>
- **THEN** <expected outcome>
- **AND** <additional expected outcome>

## Constraints
List non-negotiable rules that apply to this capability.

## Decisions
Record accepted product or technical decisions that explain why the current behavior exists.

- Decision:
  - Reason:
  - Date:

## Verification
List checks that prove this spec remains true.

- Automated:
- Manual:
- Observability:
`,
    proposal: `# Proposal: <change-name>

## Summary
Describe the intended change in a few sentences.

## Problem
Explain the current pain, missing behavior, risk, or opportunity. Include user impact and why the change is worth doing now.

## Proposed Change
Describe the target behavior. Be explicit about each meaningful before/after change.

**<Behavior or Section Name>**
- From: <current state>
- To: <future state>
- Reason: <why this change is needed>
- Impact: <breaking or non-breaking, who is affected>

## Scope
List what this change includes.

- 

## Out of Scope
List related work that this change intentionally does not include.

- 

## User Impact
Describe how users, agents, automation, CI, or maintainers experience the change.

## Risks
Call out compatibility, migration, security, data, workflow, and localization risks.

- Risk:
  - Mitigation:
  - Verification:

## Decisions
Record decisions made while shaping the proposal.

- Decision:
  - Reason:

## Acceptance Criteria
Define the explicit checks required before the user can accept this change.

- [ ] Behavior is implemented and verified.
- [ ] Built-in files are written in the project language.
- [ ] Specs are not updated as final truth before specrow accept.

## Spec Updates
Describe the intended spec changes using this structure when requirements change.

### ADDED Requirements
### MODIFIED Requirements
### REMOVED Requirements
### RENAMED Requirements
`,
    tasks: `# Tasks: <change-name>

## Implementation
- [ ] Update code and generated artifacts required by the proposal.
- [ ] Keep implementation scoped to the accepted proposal.
- [ ] Do not update specs as final truth during build.

## Verification
- [ ] Run targeted tests for changed behavior.
- [ ] Run the relevant full test or typecheck command.
- [ ] Validate generated SpecRow files use the configured language.

## Documentation
- [ ] Update user-facing or agent-facing documentation when behavior changes.
- [ ] Note migration guidance if existing projects are affected.

## Acceptance Gate
- [ ] Build output is ready for user review.
- [ ] The next step is specrow accept or specrow revise.
`
  },
  messages: {
    "init.config.created": "Created {path}",
    "init.config.overwritten": "Overwrote {path}",
    "init.config.kept": "Kept existing {path}",
    "init.ready": "Ready {path}",
    "lifecycle.proposed": "Change is proposed.",
    "lifecycle.reviewed": "Change is reviewed.",
    "lifecycle.built": "Build is finished. Awaiting explicit acceptance or revision.",
    "lifecycle.revisionNeeded": "Revision is needed.",
    "lifecycle.accepted": "Change is accepted.",
    "lifecycle.archived": "Change is archived.",
    "build.started": "Build can start for {change}.",
    "validate.ok": "Validation passed.",
    "validate.failed": "Validation failed.",
    "review.warning": "Review completed with warnings.",
    "status.change": "{change}: {state}; review: {review}; accepted: {accepted}.",
    "list.empty": "No active changes.",
    "list.warning": "Warning: {warning}",
    "next.acceptOrRevise": "Next step: specrow accept or specrow revise.",
    "migration.completed": "Migration completed for {source}.",
    "migration.dryRun": "Migration dry-run completed for {source}.",
    "migration.initialized": "Initialized {path} for migration.",
    "migration.sourceDetected": "Detected {kind} source at {source}.",
    "migration.copied": "Copied {count} migration files.",
    "migration.converted": "Converted {count} active changes.",
    "migration.skipped": "Skipped {count} existing migration targets.",
    "migration.warning": "Migration warning: {warning}",
    "migration.warning.noSpecKitFeatures": "No SpecKit feature directories were found under {path}.",
    "migration.warning.noDocumentationFiles": "No documentation files were found under {path}.",
    "migration.warning.importedDocumentationReview": "Imported documentation was copied as source material; review it before treating it as final SpecRow specs.",
    "migration.proposalAppendix": `## Migration Source
Migrated from {kind} source {source}.
Original artifacts are preserved under {path}.`,
    "migration.tasksAppendix": `## Migration Review
- [ ] Review migrated {kind} source artifacts preserved under {path}.
- [ ] Confirm migrated output from {source} before treating it as final SpecRow truth.`,
    "error.missingTemplate": "Missing SpecRow template \"{name}\" for language \"{language}\".",
    "error.missingMessage": "Missing SpecRow message \"{name}\" for language \"{language}\"."
  },
  agentCommands: {
    "/specrow:init": {
      userIntent: "Set up SpecRow for the current project without requiring the user to know tool names or files.",
      agentBehavior: [
        "Determine the intended project language from the user or ask for it when it is ambiguous.",
        "Call the SpecRow MCP init tool as an implementation detail.",
        "Confirm that .specrow/config.yml, project.md, specs/, changes/, and archive/ exist."
      ],
      forbiddenActions: [
        "Do not create legacy workspace directories.",
        "Do not continue if the requested language resources are missing."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: ["Missing template or message resources for the requested language."]
    },
    "/specrow:migrate": {
      userIntent: "Migrate existing OpenSpec, SpecKit, or documentation-folder specification artifacts into SpecRow.",
      agentBehavior: [
        "Identify whether the source is OpenSpec, SpecKit, or a documentation folder before writing migration output.",
        "Initialize SpecRow when the project is not initialized.",
        "Run migration through the SpecRow MCP tool or CLI core and preserve source traceability.",
        "Validate migrated SpecRow files and report warnings that require user review."
      ],
      forbiddenActions: [
        "Do not delete, move, or rewrite the legacy source.",
        "Do not transform archived source entries; copy archive records as preserved history.",
        "Do not treat migrated specs as final truth without user review."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "The requested source cannot be found or safely read.",
        "The configured language has missing templates or lifecycle messages.",
        "Migrated output would overwrite existing SpecRow files without explicit force."
      ]
    },
    "/specrow:explore": {
      userIntent: "Explore an idea, problem, or possible change before committing it to a proposal.",
      agentBehavior: [
        "Inspect project status and context before committing to a change.",
        "Use read-only SpecRow tools and codebase context to clarify goals, options, risks, affected areas, and open questions.",
        "Ask focused questions when the intended change, scope, or acceptance expectations are ambiguous.",
        "End with a concise exploration summary and recommend /specrow:proposal when the intent is ready."
      ],
      forbiddenActions: [
        "Do not create proposal.md, tasks.md, status.yml, or a change directory during exploration.",
        "Do not implement code during exploration.",
        "Do not accept, archive, or update specs as final truth."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "The project is not initialized and exploration requires project-specific context.",
        "The requested topic is too broad to produce actionable questions or options.",
        "The configured language has missing templates or lifecycle messages."
      ]
    },
    "/specrow:proposal": {
      userIntent: "Turn the user's intent into a concrete change proposal and task skeleton.",
      agentBehavior: [
        "Choose a stable change name from the user's intent.",
        "Create proposal.md, tasks.md, and status.yml through SpecRow MCP tools.",
        "Fill proposal and task content in the configured project language.",
        "Validate the change and surface any blocking issues before implementation starts."
      ],
      forbiddenActions: [
        "Do not implement code as part of proposal creation.",
        "Do not accept, archive, or update specs as final truth."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "The project is not initialized.",
        "The configured language has missing templates or lifecycle messages.",
        "Required proposal or task sections cannot be produced."
      ]
    },
    "/specrow:review": {
      userIntent: "Check proposal readiness before code; recommended by default and required only for risky changes.",
      agentBehavior: [
        "Review problem framing, scope, risks, decisions, acceptance criteria, and language consistency.",
        "Treat review as required for risky changes and recommended for ordinary changes.",
        "Ask the user or revise the proposal when review finds blocking ambiguity."
      ],
      forbiddenActions: [
        "Do not implement code during review.",
        "Do not use review as acceptance."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "Acceptance criteria are missing or too weak.",
        "Risky changes lack explicit risk, migration, security, data, or compatibility decisions.",
        "The configured language has missing templates or lifecycle messages."
      ],
      reviewPolicyRequiredWhen: [
        "Security, privacy, or permission behavior changes.",
        "Data model, migration, persistence, or destructive operation changes.",
        "Public API, command contract, automation, or CI behavior changes.",
        "Architecture, cross-module workflow, localization, or user-visible lifecycle changes."
      ]
    },
    "/specrow:build": {
      userIntent: "Implement and verify an approved change without turning it into final truth.",
      agentBehavior: [
        "Use SpecRow MCP context to load the proposal, tasks, status, and active-change warnings.",
        "Implement only the work described by the change.",
        "Run relevant verification and update the change tasks with implementation evidence when appropriate.",
        "Finish by leaving the change waiting for specrow accept or specrow revise."
      ],
      forbiddenActions: [
        "Do not run acceptance.",
        "Do not archive the change.",
        "Do not update specs as final truth."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "Validation fails before implementation.",
        "The proposal is too ambiguous to implement safely.",
        "The configured language has missing templates or lifecycle messages."
      ]
    },
    "/specrow:revise": {
      userIntent: "Handle user-requested changes after build without accepting or archiving the change.",
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
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "The requested revision conflicts with the proposal scope and needs a new user decision.",
        "The configured language has missing templates or lifecycle messages."
      ]
    },
    "/specrow:accept": {
      userIntent: "Record explicit user acceptance and allow final spec integration and archive.",
      agentBehavior: [
        "Proceed only when the user clearly accepts the built or completed revision work.",
        "Record explicit acceptance through SpecRow MCP tools.",
        "Use this path as the only user-facing authorization for specs becoming final truth and for archive."
      ],
      forbiddenActions: [
        "Do not infer acceptance from silence, successful tests, or completed implementation.",
        "Do not accept a change that is not built or revision-complete."
      ],
      languageRules: [
        "Read .specrow/config.yml before creating or revising built-in SpecRow files.",
        "Use the configured language for project.md, specs, proposals, tasks, and lifecycle/status responses.",
        "Stop with a clear missing-resource error when a required template or message is unavailable.",
        "Do not silently fall back to English."
      ],
      stopConditions: [
        "The user has not explicitly accepted the change.",
        "The change is not built or revision-complete.",
        "The configured language has missing templates or lifecycle messages."
      ]
    }
  },
  integration: {
    managedHeader: "This file or section is managed by SpecRow. Regenerate it with:\nspecrow update",
    commandSections: {
      invocation: "Invocation",
      userIntent: "User Intent",
      toolCore: "Tool Core",
      agentBehavior: "Agent Behavior",
      forbiddenActions: "Forbidden Actions",
      languageRules: "Language Rules",
      stopConditions: "Stop Conditions",
      nextCommands: "Next Commands",
      none: "None."
    },
    invocationTemplate: "Use this workflow when the user writes `{command}` or asks for the same intent.",
    agentInstructions: {
      title: "SpecRow Agent Instructions",
      overview: "SpecRow is an agent-first specification workflow. Treat user messages such as `specrow migrate`, `specrow explore`, `specrow proposal`, `specrow build`, or direct SpecRow requests as workflow intentions. Execute them through SpecRow MCP tools.",
      languageRule: "Before creating or revising built-in SpecRow files, read `.specrow/config.yml` and use its configured `language`. Do not silently fall back to English.",
      toolCore: "Tool core:",
      forbidden: "Forbidden:"
    },
    toolCoreFallback: "Use these SpecRow MCP tools:",
    skill: {
      description: "Use SpecRow workflows when the user mentions SpecRow or asks for specrow migrate, explore, proposal, review, build, revise, or accept.",
      whenToUse: "When to Use",
      instructions: "Instructions",
      triggers: [
        "The user asks for a SpecRow workflow such as `specrow migrate`, `specrow explore`, `specrow proposal`, or `specrow build`.",
        "The user asks to initialize SpecRow, migrate existing specification artifacts, explore an idea, create a proposal, review, build, revise, or accept a SpecRow change."
      ]
    }
  }
} satisfies LanguageResources;
