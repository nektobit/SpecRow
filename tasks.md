# Tasks: Minimal SpecRow Workflow

## Goal

Build the minimal SpecRow model without cloning the full OpenSpec surface area.

SpecRow must be agent-first: the user works with intentions through the agent, while the CLI remains a technical core for automation, CI, and manual fallback. The first version focuses on `.specrow` structure, change lifecycle, full template localization, and an explicit accept gate.

## Core Principles

- [x] Remove all remaining old project-name references from code, tests, package metadata, docs, and generated artifacts.
- [x] Standardize the CLI binary, docs, and internal naming around `specrow`.
- [x] Standardize the project workspace directory as `.specrow`.
- [x] Keep the first implementation small: no full OpenSpec clone, no complex delta engine, no automatic conflict resolver.
- [x] Treat agent commands as the primary UX.
- [x] Treat CLI commands as the technical core used by agents, CI, automation, and manual fallback.
- [x] Require explicit user acceptance before specs become final truth and before archive.

## Language Rule

- [x] SpecRow determines the template language from `.specrow/config.yml`.
- [x] The `language` field defines the working language of the project.
- [x] The CLI uses `language` when generating built-in files:
  - `project.md`;
  - specs;
  - proposals;
  - tasks;
  - lifecycle/status messages.
- [x] Agent commands use `language` when creating or revising built-in files.
- [x] If the requested language template is missing, SpecRow stops with a clear error.
- [x] SpecRow must not silently fall back to English.
- [x] Full multilingual localization of built-in templates is part of MVP.

## Agent 1. Naming and Project Foundation

Ownership: package metadata, CLI naming, config naming, init structure, generated artifacts.

- [x] Rename public CLI binary to `specrow`.
- [x] Rename internal types, functions, constants, descriptions, and user-facing messages to SpecRow naming.
- [x] Make init create `.specrow`, not any legacy directory.
- [x] Make init create this structure:

```txt
.specrow/
  config.yml
  project.md
  specs/
  changes/
  archive/
```

- [x] Keep config minimal for MVP:

```txt
version: 1
language: <project-language>
```

- [x] Add migration notes for users who have older local structures.
- [x] Update build output so generated files contain only current SpecRow naming.

## Agent 2. Templates and Localization

Ownership: template system, supported language catalog, template errors.

- [x] Add built-in template registry keyed by language.
- [x] Generate templates from `.specrow/config.yml`.
- [x] Add full localized templates for every supported language.
- [x] Add clear missing-template errors.
- [x] Prevent silent fallback to English.
- [x] Add localized `project.md` template.
- [x] Add localized spec template.
- [x] Add localized `proposal.md` template.
- [x] Add localized `tasks.md` template.
- [x] Add localized status/lifecycle messages used by CLI output.

Minimum `project.md` structure:

```txt
# Project

## Purpose
## Working Language
## Domain Vocabulary
## Architecture Notes
## Constraints
## Verification
```

Minimum spec structure:

```txt
# <Spec Name>

## Purpose
## Current Behavior
## Requirements
## Constraints
## Decisions
## Verification
```

Minimum `proposal.md` structure:

```txt
# Proposal: <change-name>

## Summary
## Problem
## Proposed Change
## Scope
## Out of Scope
## User Impact
## Risks
## Decisions
## Acceptance Criteria
```

Minimum `tasks.md` structure:

```txt
# Tasks: <change-name>

## Implementation
- [ ] ...

## Verification
- [ ] ...

## Documentation
- [ ] ...
```

## Agent 3. Change Lifecycle Model

Ownership: change directories, status model, lifecycle transitions.

- [x] Add command support for creating a change directory:

```txt
.specrow/changes/<change-name>/
  proposal.md
  tasks.md
  status.yml
```

- [x] Add `status.yml` with lifecycle state.
- [x] Support lifecycle states:

```txt
proposed
reviewed
built
revision-needed
accepted
archived
```

- [x] Track whether review is required, recommended, or completed.
- [x] Track explicit user acceptance.
- [x] Track created and updated timestamps.
- [x] Ensure `build` moves a change only to `built`.
- [x] Ensure `revise` moves a change to `revision-needed`.
- [x] Ensure `accept` requires explicit user acceptance.
- [x] Ensure archive is possible only after accept.
- [x] Keep multiple active changes visible and warn about likely conflicts.

## Agent 4. CLI Core

Ownership: CLI commands, command output, validation entrypoints.

- [x] Implement `specrow init`.
- [x] Implement `specrow proposal <change-name>`.
- [x] Implement `specrow validate [change-name]`.
- [x] Implement `specrow review <change-name>`.
- [x] Implement `specrow status [change-name]`.
- [x] Implement `specrow context [change-name]` for agent-readable context.
- [x] Implement `specrow build-start <change-name>`.
- [x] Implement `specrow build-finish <change-name>`.
- [x] Implement `specrow revise <change-name>`.
- [x] Implement `specrow accept <change-name>`.
- [x] Implement `specrow archive <change-name>`.
- [x] Implement `specrow list`.
- [x] Make CLI output clear enough for the agent to decide the next workflow step.
- [x] Use project language for built-in status messages.
- [x] Fail clearly when the configured language has no required template or message.

## Agent 5. Agent Commands

Ownership: user-facing command specs and expected agent behavior.

- [x] Define `/specrow:init` as the user-facing setup command.
- [x] Define `/specrow:proposal` as the command for turning user intent into a change proposal.
- [x] Define `/specrow:review` as a recommended check before code, required only for risky changes.
- [x] Define `/specrow:build` as implementation only; it must not accept, archive, or update specs as final truth.
- [x] Define `/specrow:revise` as the path for user-requested changes after build.
- [x] Define `/specrow:accept` as the only user-facing command that allows final integration and archive.
- [x] Document that users should not need to remember CLI mechanics for normal work.
- [x] Document that the agent may call CLI commands as implementation details.
- [x] Ensure agent commands respect `.specrow/config.yml` language.
- [x] Ensure agent commands stop with a clear error if the requested language resources are missing.

## Agent 6. Accept Gate and Archive

Ownership: acceptance rules, spec integration rules, archive safety.

- [x] Prevent `build-finish` from updating specs as final truth.
- [x] Prevent archive while the change is not accepted.
- [x] Prevent accept unless the change is in `built` or `revision-needed` with completed follow-up work.
- [x] Record explicit acceptance in `status.yml`.
- [x] Update specs and archive the change only through the accept path.
- [x] Make CLI output clearly tell the agent/user whether the next step is `/specrow:accept` or `/specrow:revise`.
- [x] Keep accepted changes auditable after archive.
- [x] Avoid destructive overwrite when archiving an existing change name.

## Agent 7. Documentation

Ownership: README files, documentation site content, workflow docs.

- [x] Rewrite getting-started documentation around agent commands, not CLI memorization.
- [x] Add a workflow page for `proposal -> review -> build -> revise -> accept`.
- [x] Add an agent command reference.
- [x] Add a CLI reference that frames CLI as the technical core.
- [x] Add a templates page for `project.md`, specs, `proposal.md`, and `tasks.md`.
- [x] Add a localization page explaining `.specrow/config.yml` language behavior.
- [x] Add a validation and lifecycle page.
- [x] Explain how SpecRow differs from OpenSpec:
  - agent-first user experience;
  - user intent before CLI mechanics;
  - explicit accept gate;
  - project-native working language;
  - fully localized built-in templates;
  - smaller MVP surface.
- [x] Document that missing language templates are errors, not fallback cases.

## Agent 8. Tests

Ownership: unit tests, integration tests, lifecycle regression tests.

- [x] Test init creates `.specrow`, not any legacy directory.
- [x] Test init creates `config.yml`, `project.md`, `specs/`, `changes/`, and `archive/`.
- [x] Test proposal creates `proposal.md`, `tasks.md`, and `status.yml`.
- [x] Test templates use the configured project language.
- [x] Test every built-in template exists for every supported language.
- [x] Test missing language template fails with a clear error.
- [x] Test missing language template does not fall back to English.
- [x] Test localized status messages use the configured project language.
- [x] Test validate fails on missing required change files.
- [x] Test validate fails on missing required sections.
- [x] Test review reports empty or weak acceptance criteria.
- [x] Test build-finish does not archive and does not update specs as accepted truth.
- [x] Test accept requires explicit user acceptance state.
- [x] Test archive is blocked before accept.
- [x] Test multiple active changes are listed and potential spec conflicts are reported as warnings.

## MVP Definition

- [x] A user can initialize a project through `/specrow:init`.
- [x] A user can describe an intended change through `/specrow:proposal`.
- [x] The agent can use CLI context and validation without exposing CLI mechanics as the main UX.
- [x] The agent can implement through `/specrow:build`.
- [x] Build stops with the change waiting for `/specrow:accept` or `/specrow:revise`.
- [x] Specs and archive are updated only after `/specrow:accept`.
- [x] All built-in templates are fully localized for supported languages.
- [x] Missing language resources stop the workflow with a clear error.

## Deferred

- [ ] Full OpenSpec-compatible spec delta model.
- [ ] Automatic task derivation from specs.
- [ ] Automatic merge/conflict resolution for active changes.
- [ ] Separate human-view and agent-view files.
- [ ] Deep integrations with issue trackers and pull requests.
