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
- [ ] Specs are not updated as final truth before /specrow:accept.

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
- [ ] The next step is /specrow:accept or /specrow:revise.
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
    "next.acceptOrRevise": "Next step: /specrow:accept or /specrow:revise.",
    "error.missingTemplate": "Missing SpecRow template \"{name}\" for language \"{language}\".",
    "error.missingMessage": "Missing SpecRow message \"{name}\" for language \"{language}\"."
  },
  agentCommands: {
    "/specrow:init": {
      userIntent: "Set up SpecRow for the current project without requiring the user to know CLI flags or files.",
      agentBehavior: [
        "Determine the intended project language from the user or ask for it when it is ambiguous.",
        "Run the CLI init command as an implementation detail.",
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
    "/specrow:proposal": {
      userIntent: "Turn the user's intent into a concrete change proposal and task skeleton.",
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
        "Public API, CLI contract, automation, or CI behavior changes.",
        "Architecture, cross-module workflow, localization, or user-visible lifecycle changes."
      ]
    },
    "/specrow:build": {
      userIntent: "Implement and verify an approved change without turning it into final truth.",
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
        "Record explicit acceptance through the CLI core.",
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
      cliCore: "CLI Core",
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
      overview: "SpecRow is an agent-first specification workflow. Treat `/specrow:*` user messages as workflow intentions and use the `specrow` CLI as the implementation detail.",
      languageRule: "Before creating or revising built-in SpecRow files, read `.specrow/config.yml` and use its configured `language`. Do not silently fall back to English.",
      cliCore: "CLI core:",
      forbidden: "Forbidden:"
    },
    skill: {
      description: "Use SpecRow workflows when the user mentions SpecRow or /specrow:* commands.",
      whenToUse: "When to Use",
      instructions: "Instructions",
      triggers: [
        "The user invokes a `/specrow:*` command.",
        "The user asks to initialize SpecRow, create a proposal, review, build, revise, or accept a SpecRow change."
      ]
    }
  }
} satisfies LanguageResources;
