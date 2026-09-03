---
name: specrow
description: Manage agent-first specification workflows in a local .specrow workspace. Use when a user wants to initialize or migrate specifications, explore and propose a change, review or implement it, request revisions, explicitly accept completed work, or archive an accepted change.
license: MIT
metadata:
  author: nektobit
  version: "0.2.0"
---

# SpecRow

Use one SpecRow execution adapter for the whole request:

- Prefer the `specrow_*` MCP tools when the client provides them.
- Otherwise, in a local Codex workspace, use the bundled CLI at `scripts/specrow-cli.cjs` through the local shell.
- If neither MCP tools nor a local shell are available, explain that SpecRow requires a local Codex workspace or an MCP-capable Agent Plugins client. Do not install packages or substitute an unbundled global CLI.

Both adapters require Node.js 20+ and filesystem access to the target workspace. Read [references/cli.md](references/cli.md) before using the bundled CLI. Read [references/mcp-tools.md](references/mcp-tools.md) when using MCP.

## Resolve the workspace

Resolve the project the user named before reading or writing. With MCP, start with `specrow_project_status` and pass the absolute `projectRoot` when roots are absent or ambiguous. With the CLI, run every command with the shell working directory set to the project root.

Confirm the returned `projectRoot` before any MCP mutation. With the CLI, resolve and verify the shell working directory before the first mutation. Do not use the plugin installation directory as the project workspace.

## Route the request

- For initialization and workspace structure, read [references/workspace.md](references/workspace.md).
- For explore, proposal, review, build, revise, accept, or archive, read [references/workflow.md](references/workflow.md).
- For OpenSpec, Spec Kit, or documentation-folder imports, read [references/migration.md](references/migration.md).
- For adapter-specific commands and failure handling, read the matching CLI or MCP reference above.

## Invariants

- Read `.specrow/config.yml` and use its configured language for generated SpecRow artifacts and user-facing workflow updates.
- Do not silently fall back to English when required language resources are missing.
- Proposal and review requests do not authorize product-code implementation.
- A successful build or test run is not acceptance. Call `specrow_accept` only after explicit user acceptance.
- Only the acceptance path may integrate staged specifications as final truth and authorize archival.
