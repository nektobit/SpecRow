# SpecRow Agent Commands

This file defines the user-facing agent command contract for the MVP workflow. Users work through `/specrow:*` intentions. The agent may call `specrow` CLI commands, read `.specrow` files, and run validation as implementation details.

Users should not need to memorize CLI mechanics for normal SpecRow work.

## Language Rule

Before an agent creates or revises built-in SpecRow files, it reads `.specrow/config.yml` and uses the configured `language`.

The configured language applies to `project.md`, specs, proposals, tasks, and lifecycle/status responses. If a required template or message is missing, the agent stops with a clear error. It must not silently fall back to English.

## Commands

### `/specrow:init`

Sets up SpecRow for the current project. The agent determines the intended project language, asks if it is ambiguous, then uses the CLI core to create `.specrow/config.yml`, `project.md`, `specs/`, `changes/`, and `archive/`.

The agent stops if the requested language resources are missing.

### `/specrow:migrate`

Migrates existing OpenSpec, SpecKit, or documentation-folder specification artifacts into SpecRow. The agent identifies the source, initializes `.specrow` when needed, runs `specrow migrate [folder | system]` through the MCP tool or CLI core, validates the result, and reports warnings that require user review.

Migration does not delete, move, or rewrite the legacy source. Archived source entries are copied as preserved history without transformation. Migrated specs are not treated as final truth until the user reviews the result.

### `/specrow:explore`

Explores an idea, problem, or possible change before committing it to a proposal. The agent reads project status and context, uses only read-only SpecRow tools, inspects relevant codebase context when useful, and clarifies goals, options, risks, affected areas, open questions, and acceptance expectations.

Exploration does not create `proposal.md`, `tasks.md`, `status.yml`, or a change directory. It does not implement code, accept, archive, or update specs as final truth. When the intent is clear enough, the next step is `/specrow:proposal`.

### `/specrow:proposal`

Turns user intent into a change proposal. The agent chooses a stable change name, creates the change through the CLI core, fills `proposal.md` and `tasks.md` in the project language, validates the result, and reports blocking issues.

This command does not implement code, accept the change, archive the change, or update specs as final truth.

### `/specrow:review`

Checks proposal readiness before implementation. Review is recommended for ordinary changes and required only for risky changes.

Risky changes include security, privacy, permissions, data migrations, destructive operations, public API or CLI contracts, automation, CI, architecture, cross-module workflow, localization, or user-visible lifecycle behavior.

Review is not acceptance and does not implement code.

### `/specrow:build`

Implements and verifies the proposed change. The agent uses CLI context, runs `build-start`, performs the scoped implementation, runs relevant checks, and finishes with `build-finish`.

Build is implementation only. It must not accept, archive, or update specs as final truth. The end state waits for `/specrow:accept` or `/specrow:revise`.

### `/specrow:revise`

Handles user-requested changes after build. The agent marks the change as needing revision, applies the requested follow-up work to the proposal, tasks, implementation, or verification evidence as needed, and re-runs relevant checks.

Revision is not acceptance and does not archive the change.

### `/specrow:accept`

Records explicit user acceptance. This is the only user-facing command that authorizes specs to become final truth and allows archive.

The agent must not infer acceptance from silence, passing tests, or completed implementation. It proceeds only when the user clearly accepts the built or revision-complete work.
