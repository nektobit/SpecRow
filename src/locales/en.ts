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
    "next.acceptOrRevise": "Next step: /specrow:accept or /specrow:revise.",
    "error.missingTemplate": "Missing SpecRow template \"{name}\" for language \"{language}\".",
    "error.missingMessage": "Missing SpecRow message \"{name}\" for language \"{language}\"."
  }
} satisfies LanguageResources;
