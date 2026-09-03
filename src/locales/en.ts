import type { LanguageResources } from "../templates.js";

export const en = {
  templates: {
    project: `# Project

<!-- specrow:section=purpose -->
## Purpose
Describe what this project is for, who it serves, and what outcomes matter.

<!-- specrow:section=working-language -->
## Working Language
English.

All built-in SpecRow files, agent-authored proposals, specs, tasks, and lifecycle messages should use this language unless a user explicitly asks for a quoted foreign-language term.

<!-- specrow:section=domain-vocabulary -->
## Domain Vocabulary
List project-specific terms, canonical names, acronyms, and words that must not be translated.

- Term:
  - Meaning:
  - Notes:

<!-- specrow:section=architecture-notes -->
## Architecture Notes
Capture stable technical context that helps an agent make correct changes.

- Runtime and frameworks:
- Data stores and external systems:
- Important modules or boundaries:
- Existing patterns to preserve:

<!-- specrow:section=constraints -->
## Constraints
Document hard rules, compatibility requirements, security or privacy boundaries, performance limits, and operational constraints.

- Constraint:
  - Reason:
  - Verification:

<!-- specrow:section=verification -->
## Verification
Describe how changes are normally proven correct.

- Unit tests:
- Integration tests:
- Manual checks:
- CI or release gates:
`,
    spec: `# <Spec Name>

<!-- specrow:section=purpose -->
## Purpose
State the user-visible capability or behavior this spec owns. Keep one focused capability per spec.

<!-- specrow:section=current-behavior -->
## Current Behavior
Describe what is true today. Specs are final truth only after explicit acceptance.

- Current contract:
- Inputs and outputs:
- Error handling:
- Important edge cases:

<!-- specrow:section=requirements -->
## Requirements
Use behavior-first requirements. Requirements describe observable behavior, interfaces, constraints, and error handling rather than implementation internals.

### Requirement: <Name>
The system SHALL <observable behavior>.

#### Scenario: <Description>
- **GIVEN** <optional starting state>
- **WHEN** <trigger or condition>
- **THEN** <expected outcome>
- **AND** <additional expected outcome>

<!-- specrow:section=constraints -->
## Constraints
List non-negotiable rules that apply to this capability.

<!-- specrow:section=decisions -->
## Decisions
Record accepted product or technical decisions that explain why the current behavior exists.

- Decision:
  - Reason:
  - Date:

<!-- specrow:section=verification -->
## Verification
List checks that prove this spec remains true.

- Automated:
- Manual:
- Observability:
`,
    proposal: `# Proposal: <change-name>

<!-- specrow:section=summary -->
## Summary
Describe the intended change in a few sentences.

<!-- specrow:section=problem -->
## Problem
Explain the current pain, missing behavior, risk, or opportunity. Include user impact and why the change is worth doing now.

<!-- specrow:section=proposed-change -->
## Proposed Change
Describe the target behavior. Be explicit about each meaningful before/after change.

**<Behavior or Section Name>**
- From: <current state>
- To: <future state>
- Reason: <why this change is needed>
- Impact: <breaking or non-breaking, who is affected>

<!-- specrow:section=scope -->
## Scope
List what this change includes.

- 

<!-- specrow:section=out-of-scope -->
## Out of Scope
List related work that this change intentionally does not include.

- 

<!-- specrow:section=user-impact -->
## User Impact
Describe how users, agents, automation, CI, or maintainers experience the change.

<!-- specrow:section=risks -->
## Risks
Call out compatibility, migration, security, data, workflow, and localization risks.

- Risk:
  - Mitigation:
  - Verification:

<!-- specrow:section=decisions -->
## Decisions
Record decisions made while shaping the proposal.

- Decision:
  - Reason:

<!-- specrow:section=estimation -->
## Estimation
Fill this section only when .specrow/config.yml has estimation.enabled: true.

- Approximate implementation time:
- Assumptions:
- Confidence:

<!-- specrow:section=acceptance-criteria -->
## Acceptance Criteria
Define the explicit checks required before the user can accept this change.

- [ ] Behavior is implemented and verified.
- [ ] Built-in files are written in the project language.
- [ ] Specs are not updated as final truth before specrow accept.

<!-- specrow:section=spec-updates -->
## Spec Updates
Describe the intended spec changes using this structure when requirements change.

### ADDED Requirements
### MODIFIED Requirements
### REMOVED Requirements
### RENAMED Requirements
`,
    tasks: `# Tasks: <change-name>

<!-- specrow:section=implementation -->
## Implementation
- [ ] Update code and generated artifacts required by the proposal.
- [ ] Keep implementation scoped to the accepted proposal.
- [ ] Do not update specs as final truth during build.

<!-- specrow:section=verification -->
## Verification
- [ ] Run targeted tests for changed behavior.
- [ ] Run the relevant full test or typecheck command.
- [ ] Validate generated SpecRow files use the configured language.

<!-- specrow:section=documentation -->
## Documentation
- [ ] Update user-facing or agent-facing documentation when behavior changes.
- [ ] Note migration guidance if existing projects are affected.

<!-- specrow:section=acceptance-gate -->
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
  }
} satisfies LanguageResources;
