# Tasks: SpecRow MCP Workflow

## Goal

Make a SpecRow MCP server the default agent-facing workflow interface while preserving the current SpecRow lifecycle and CLI contract.

Users should continue working with intent through `/specrow:*` commands. The agent may use MCP tools instead of shelling out to CLI commands. The CLI remains the technical core for CI, automation, manual fallback, and environments where MCP is unavailable.

The implementation should take `spec-workflow-mcp` as a reference for MCP setup patterns, typed workflow tools, project context tools, approval tooling, and multi-agent client configuration. SpecRow must not copy its full workflow model, dashboard, or VSCode extension surface. SpecRow keeps the existing minimal flow:

```txt
proposal -> review -> build -> revise -> accept -> archive
```

## Reference Findings

- [x] `spec-workflow-mcp` exposes workflow operations as MCP tools instead of requiring the agent to remember CLI commands.
- [x] It uses an npm-run local server pattern such as `npx -y <package> <project-path>`.
- [x] It documents per-client MCP configuration for Codex, Claude, Cursor, Windsurf, OpenCode, Continue, and similar agents.
- [x] It separates MCP server mode from optional UI/dashboard mode.
- [x] It includes explicit approval workflow tools, status tools, context tools, template tools, and list/status tools.
- [x] It handles sandboxed environments through a writable home/state directory variable.
- [x] It includes security expectations: project isolation, path validation, localhost-only UI when UI exists, no arbitrary code execution in MCP tools, and structured errors.
- [x] SpecRow will not implement the referenced VSCode extension, dashboard, web approval UI, or plugin UI in this phase.

## Non-Goals

- [x] Do not replace the `.specrow` workspace layout.
- [x] Do not change lifecycle states.
- [x] Do not remove the CLI.
- [x] Do not require users to know MCP details during normal SpecRow use.
- [x] Do not introduce a new requirements/design/tasks workflow.
- [x] Do not implement VSCode extension, dashboard, web approval screens, or editor plugins.
- [x] Do not add automatic conflict resolution or a full delta engine.

## Core Principles

- [x] MCP is the new default integration path for agents.
- [x] CLI remains a stable fallback and automation interface.
- [x] MCP tools call the existing SpecRow core modules where possible instead of spawning `specrow` subprocesses.
- [x] MCP tool behavior must match CLI lifecycle rules.
- [x] Agent install configures MCP automatically when the target agent supports MCP.
- [x] Existing `/specrow:*` user commands remain the user-facing UX.
- [x] Generated slash commands, prompts, skills, and rules should become thin guidance that tells the agent to use SpecRow MCP tools first and CLI fallback second.
- [x] The accept gate remains explicit and cannot be inferred from tool availability, passing tests, or agent judgment.
- [x] Missing language resources remain hard errors and must not fall back to English.
- [x] MCP must not expose tools that can mutate arbitrary project files outside `.specrow`.

## Agent 1. MCP Package Foundation

Ownership: package metadata, build entries, runtime dependency, server entrypoint.

- [x] Add `@modelcontextprotocol/sdk` as a runtime dependency.
- [x] Add a new MCP server entrypoint, for example `src/mcpServer.ts`.
- [x] Add a new executable bin, for example:

```json
{
  "bin": {
    "specrow": "dist/bin.js",
    "specrow-mcp": "dist/mcpBin.js"
  }
}
```

- [x] Add `src/mcpBin.ts` as the CLI wrapper for MCP stdio mode.
- [x] Also consider adding `specrow mcp <project-path>` as a CLI subcommand so `npx -y specrow@latest mcp <project-path>` works without relying on npm multi-bin selection.
- [x] Update `tsup.config.ts` so MCP entrypoints build into `dist`.
- [x] Export reusable MCP types only if needed; keep public package surface small.
- [x] Keep Node engine aligned with the current project, `>=20`.
- [x] Ensure `specrow-mcp --help` explains stdio usage for agents and does not imply users must run it manually.
- [x] Ensure `specrow-mcp <project-path>` resolves and locks all operations to that project root.
- [x] Add a project-root resolver that accepts:
  - explicit `<project-path>`;
  - current working directory;
  - optional future environment override.
- [x] Ensure invalid project roots fail clearly before registering mutating tools.

## Agent 2. MCP Tool Contract

Ownership: tool names, schemas, responses, error shape, localization behavior.

- [x] Define stable MCP tool names using a SpecRow prefix:
  - `specrow_init`;
  - `specrow_create_proposal`;
  - `specrow_validate`;
  - `specrow_review`;
  - `specrow_status`;
  - `specrow_list`;
  - `specrow_context`;
  - `specrow_build_start`;
  - `specrow_build_finish`;
  - `specrow_revise`;
  - `specrow_accept`;
  - `specrow_archive`.
- [x] Add non-mutating guidance/context tools:
  - `specrow_workflow_guide`;
  - `specrow_template_context`;
  - `specrow_language_status`;
  - `specrow_integration_status`.
- [x] Use Zod schemas for all tool inputs.
- [x] Return structured JSON-compatible results instead of CLI text as the primary MCP response format.
- [x] Include localized human-readable `message` fields where the CLI currently emits localized lifecycle/status messages.
- [x] Include `nextCommands` or `nextSteps` in lifecycle responses so agents can decide between `/specrow:accept` and `/specrow:revise`.
- [x] Preserve CLI-equivalent exit/error semantics as MCP structured errors:

```ts
{
  success: false,
  code: "VALIDATION_FAILED" | "MISSING_LANGUAGE_RESOURCE" | "INVALID_STATE" | "NOT_FOUND",
  message: string,
  issues?: ValidationIssue[],
  suggestion?: string
}
```

- [x] Ensure all mutating tools include the target `changeName` where relevant.
- [x] Ensure every mutating tool records or updates timestamps exactly like lifecycle core.
- [x] Ensure path values returned to the agent are project-relative by default.
- [x] Add absolute paths only when they are necessary for agent file reads.

## Agent 3. MCP Lifecycle Mapping

Ownership: exact behavior parity between MCP tools and current CLI commands.

- [x] Map `specrow_init` to `initSpecRowProject`.
- [x] Map `specrow_create_proposal` to `createChange`.
- [x] Map `specrow_validate` to `validateSpecRowProject`.
- [x] Map `specrow_review` to `reviewChangeReadiness` plus `markChangeReviewed` only when validation has no blocking errors.
- [x] Map `specrow_status` to `readChangeStatus` or active change listing.
- [x] Map `specrow_list` to `listActiveChanges`.
- [x] Map `specrow_context` to the current `specrow context` JSON behavior without shelling out.
- [x] Map `specrow_build_start` to validation plus readiness status.
- [x] Map `specrow_build_finish` to `markChangeBuilt`.
- [x] Map `specrow_revise` to `markRevisionNeeded`.
- [x] Map `specrow_accept` to `acceptChange`.
- [x] Map `specrow_archive` to `archiveChange`.
- [x] Preserve the rule that build finish never updates specs as final truth.
- [x] Preserve the rule that archive is blocked before accept.
- [x] Preserve the rule that accept requires explicit user acceptance.
- [x] Preserve the rule that revision-needed changes require `followUpWorkCompleted`.
- [x] Preserve conflict warnings when multiple active changes exist.
- [ ] Add tests proving MCP and CLI produce equivalent lifecycle state transitions.

## Agent 4. Explicit Accept Gate In MCP

Ownership: approval safety, irreversible workflow boundaries, auditability.

- [x] Require `explicitUserAcceptance: true` in `specrow_accept`.
- [x] Reject `specrow_accept` when the agent omits the explicit flag.
- [x] Reject `specrow_accept` when the change is not `built` or eligible `revision-needed`.
- [x] Require `followUpWorkCompleted: true` for revision-needed acceptance.
- [x] Return a clear next step when acceptance is blocked:
  - ask the user for explicit `/specrow:accept`;
  - or use `/specrow:revise` when the user requests changes.
- [x] Ensure MCP cannot combine accept and archive in a single hidden tool call unless the user-facing command is `/specrow:accept`.
- [x] Keep `specrow_archive` as a separate tool so archive remains auditable and testable.
- [x] Ensure archived changes retain accepted status metadata.
- [x] Ensure archive never overwrites an existing archive directory.

## Agent 5. MCP Installation Through Agent Install

Ownership: `install` instructions, integration installer, config writing, default selection.

- [x] Update `install` so agent setup configures MCP by default after CLI availability is confirmed.
- [x] Keep language detection and language-switching behavior unchanged.
- [x] Keep `.specrow` initialization unchanged.
- [x] Change normal install flow from "install command/skill integrations first" to:
  1. install or verify CLI package;
  2. initialize `.specrow`;
  3. install MCP server configuration for the current agent when supported;
  4. install thin command/prompt/rule guidance only as a user-facing trigger layer;
  5. validate workspace;
  6. report whether restart is needed.
- [x] Add `specrow integrate --mcp` or equivalent option.
- [x] Add `specrow update` support for regenerating MCP config.
- [x] Add `specrow integrations status` output for MCP server config files.
- [x] Keep `--tools codex,claude,cursor,windsurf,generic` behavior, but make MCP the default strategy for MCP-capable tools.
- [x] Add an opt-out option such as `--no-mcp` for users who need legacy command/skill-only integration.
- [x] Decide whether `generic` should install only `AGENTS.md` or also include generic MCP configuration examples. Prefer no hidden generic MCP mutation when the target client is unknown.
- [x] Record MCP-managed files in `.specrow/config.yml` alongside existing managed integration files.
- [x] Add managed file kind `mcp-config`.
- [x] Preserve managed markers or safe merge behavior for files that support comments.
- [x] For JSON/TOML config files, use structured parsing where practical instead of string concatenation.

## Agent 6. MCP Client Config Targets

Ownership: per-agent config paths and generated snippets.

- [x] Add Codex MCP config generation:

```toml
[mcp_servers.specrow]
command = "npx"
args = ["-y", "specrow@latest", "mcp", "<project-path>"]
```

- [ ] If using a separate bin, generate:

```toml
[mcp_servers.specrow]
command = "npx"
args = ["-y", "--package", "specrow@latest", "specrow-mcp", "<project-path>"]
```

- [ ] Validate which npm invocation works best after packaging and use one canonical form.
- [x] Prefer the `specrow mcp` subcommand unless package validation proves the separate-bin form is more reliable across MCP clients.
- [x] Add Claude Code MCP config support where available through generated instructions or command guidance.
- [x] Add Claude project config support only when it can be updated safely.
- [x] Add Cursor MCP config support.
- [x] Add Windsurf MCP config support.
- [x] Keep generic fallback instructions for agents without supported MCP configuration.
- [x] Add Windows path handling tests for all config snippets.
- [x] Add POSIX path handling tests for all config snippets.
- [x] Avoid overwriting unmarked user MCP config.
- [x] When updating existing MCP config, preserve unrelated servers.
- [x] Detect already-configured SpecRow MCP servers and update only the managed entry.
- [x] Include a restart-required hint per client when new MCP config is written.

## Agent 7. Agent Command Layer After MCP

Ownership: generated `/specrow:*` files, skills, prompts, rules, instructions.

- [x] Keep `/specrow:init`, `/specrow:proposal`, `/specrow:review`, `/specrow:build`, `/specrow:revise`, and `/specrow:accept`.
- [x] Update generated command specs so `cliCore` becomes `toolCore` with MCP tools first and CLI fallback second.
- [x] Preserve the existing user-facing command behavior and stop conditions.
- [x] Update Codex skill text to prefer MCP tools when available.
- [x] Update Claude skill/commands to prefer MCP tools when available.
- [x] Update Cursor rules/commands to prefer MCP tools when available.
- [x] Update Windsurf workflows/rules to prefer MCP tools when available.
- [x] Keep generated text fully localized.
- [x] Add locale keys for MCP-related command guidance in every supported runtime language.
- [x] Ensure missing MCP localization resources fail validation.
- [x] Ensure user-facing docs do not overexplain MCP outside the dedicated site page.

## Agent 8. MCP Server Safety

Ownership: path isolation, filesystem safety, input validation, execution boundaries.

- [x] Validate `changeName` using the same normalization rules as lifecycle core.
- [x] Reject path traversal in every tool input.
- [x] Restrict all MCP file reads/writes to the configured project root and `.specrow`.
- [x] Do not add tools that run arbitrary shell commands.
- [x] Do not let MCP tools edit implementation files outside `.specrow`.
- [x] Keep implementation work in the agent, not inside the MCP server.
- [x] Return context and status; do not execute build tasks.
- [x] Add explicit error codes for unsafe paths and invalid state transitions.
- [x] Add tests for Windows path traversal cases.
- [x] Add tests for POSIX path traversal cases.
- [x] Add tests proving a malicious `changeName` cannot escape `.specrow/changes`.
- [x] Add tests proving `specrow_archive` cannot overwrite existing archive content.

## Agent 9. MCP Context Resources

Ownership: MCP resources, promptable context, agent-readable data.

- [x] Expose `specrow://project/config` as a read-only MCP resource if supported by the SDK.
- [x] Expose `specrow://project/project-md` as a read-only MCP resource.
- [x] Expose `specrow://changes` as a read-only resource listing active changes.
- [x] Expose `specrow://changes/<change-name>/proposal` as a read-only resource.
- [x] Expose `specrow://changes/<change-name>/tasks` as a read-only resource.
- [x] Expose `specrow://changes/<change-name>/status` as a read-only resource.
- [x] Expose `specrow://specs` as a read-only accepted specs index.
- [x] Keep write operations as tools, not resources.
- [x] Ensure resource content uses configured project language when returning generated guidance.
- [x] Add tests for resource registration and missing project behavior.

## Agent 10. Documentation Site

Ownership: site navigation, one dedicated MCP page, minimal cross-linking.

- [x] Add one new site menu item: `MCP Server`.
- [x] Add localized page slug, for example `mcp-server`.
- [x] Do not mention MCP broadly across unrelated pages except where command examples must be accurate.
- [x] On the MCP page, explain:
  - MCP is the default agent integration path;
  - users still use `/specrow:*` commands;
  - agent install configures MCP automatically;
  - CLI remains fallback and automation core;
  - no dashboard or VSCode plugin is included in this phase.
- [x] Add setup examples for supported agents only if they are useful for troubleshooting.
- [x] Keep the page concise and user-oriented.
- [x] Add the page content in `en`, `ru`, `es`, and `zh-CN`.
- [x] Update site locale validation if page lists are checked.
- [x] Verify the site builds after adding the menu item.

## Agent 11. README And Install Docs

Ownership: top-level README files and install instructions.

- [x] Update README quick start only if necessary to keep it accurate.
- [x] Avoid making users learn MCP in the README.
- [x] Mention that agent install configures the default agent integration automatically.
- [x] Keep manual CLI fallback examples.
- [x] Update localized README files consistently.
- [x] Update `install` to mention MCP only as an agent setup responsibility, not as a normal user workflow.
- [ ] Update migration notes only if MCP changes managed integration files.

## Agent 12. Tests

Ownership: MCP unit tests, lifecycle parity tests, integration config tests.

- [x] Test MCP server starts in stdio mode.
- [x] Test MCP server rejects invalid project roots.
- [x] Test `specrow_init` creates `.specrow`.
- [x] Test `specrow_create_proposal` creates `proposal.md`, `tasks.md`, and `status.yml`.
- [x] Test `specrow_validate` returns structured issues.
- [x] Test `specrow_review` marks review completed only when blocking errors are absent.
- [x] Test `specrow_context` matches existing CLI context shape.
- [x] Test `specrow_build_finish` moves only to `built`.
- [x] Test `specrow_accept` requires `explicitUserAcceptance: true`.
- [x] Test `specrow_archive` is blocked before accept.
- [x] Test accepted archive integrates staged specs exactly like CLI archive.
- [x] Test multiple active changes return warnings.
- [x] Test localized MCP messages use `.specrow/config.yml` language.
- [x] Test missing language resources fail without English fallback.
- [x] Test MCP tool schemas reject invalid values.
- [x] Test MCP errors include stable `code` and `message`.
- [x] Test generated MCP configs preserve unrelated user config.
- [x] Test generated MCP configs do not overwrite unmarked files without `--force`.
- [x] Test `specrow update` regenerates MCP-managed config.
- [x] Test `specrow integrations status` reports MCP-managed files.
- [x] Test docs/site build after adding the MCP page.

## Agent 13. Compatibility And Migration

Ownership: existing users, existing managed files, old command-only integrations.

- [x] Existing `.specrow/config.yml` without MCP metadata must continue to load.
- [x] Existing command/skill/rule integrations must continue to work.
- [x] `specrow update` should be able to add MCP config to existing installations.
- [x] Provide a clear status message when MCP is not configured but legacy integrations exist.
- [x] Provide a clear status message when MCP config exists but the client likely needs restart.
- [x] Preserve `--tools none`.
- [x] Preserve `--dry-run`.
- [x] Preserve `--force` semantics.
- [x] Do not remove old managed integration files automatically.
- [ ] Add a future cleanup command only if needed later.

## Agent 14. Release Checklist

Ownership: publish readiness, versioning, verification.

- [x] Run `pnpm test`.
- [x] Run `pnpm typecheck`.
- [x] Run `pnpm locale:validate`.
- [x] Run package build and inspect `dist` for MCP entrypoints.
- [ ] Verify `npx -y specrow@latest mcp <project-path>` or the chosen canonical npm command works after packing locally.
- [ ] Verify Codex config can load the server.
- [x] Verify at least one non-Codex MCP client config format in tests.
- [x] Verify CLI fallback still works without MCP.
- [x] Verify agent install still initializes a clean project.
- [x] Verify agent install updates an existing project without losing config.
- [ ] Bump package version.
- [ ] Update changelog or release notes if the project has one by then.

## MVP Definition

- [x] SpecRow ships an MCP server that agents can run locally per project.
- [x] Agent install configures MCP by default for supported agents.
- [x] `/specrow:*` commands still behave the same from the user's point of view.
- [x] MCP tools cover the current lifecycle from init through archive.
- [x] MCP tools preserve the explicit accept gate.
- [x] MCP tools preserve localization behavior and missing-resource errors.
- [x] MCP tools do not mutate arbitrary implementation files.
- [x] CLI remains available and behavior-compatible.
- [x] The site has one dedicated `MCP Server` menu page.
- [x] No VSCode extension, dashboard, or plugin UI is required.

## Deferred

- [ ] Web dashboard for approval/status.
- [ ] VSCode extension or editor sidebar.
- [ ] Remote/network MCP server mode.
- [ ] Authentication for remote MCP access.
- [ ] Team/shared approval queue.
- [ ] Task execution logs and implementation statistics.
- [ ] Full OpenSpec-compatible delta model.
- [ ] Automatic task derivation from specs.
- [ ] Automatic merge/conflict resolution for active changes.
