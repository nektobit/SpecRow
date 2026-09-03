---
name: specrow
description: Manage agent-first specification workflows in a .specrow workspace. Use when a user wants to initialize or migrate specifications, explore and propose a change, review or implement it, request revisions, explicitly accept completed work, or archive an accepted change.
license: MIT
metadata:
  author: nektobit
  version: "0.2.0"
---

# SpecRow

Use the SpecRow MCP tools as the single mutation path for `.specrow`. The CLI is reserved for CI and manual automation, not a parallel workflow implementation for agents.

This plugin requires Node.js 20+, an Agent Plugins client with MCP stdio support, and filesystem access to the target workspace.

## Resolve the workspace

Start with `specrow_project_status`. Pass the absolute `projectRoot` for the workspace named by the user. If the client advertises exactly one MCP filesystem root, the server can select it automatically; when roots are absent or ambiguous, an explicit `projectRoot` is required.

Confirm the returned `projectRoot` before any mutation. Do not use the plugin installation directory as the project workspace.

## Route the request

- For initialization and workspace structure, read [references/workspace.md](references/workspace.md).
- For explore, proposal, review, build, revise, accept, or archive, read [references/workflow.md](references/workflow.md).
- For OpenSpec, Spec Kit, or documentation-folder imports, read [references/migration.md](references/migration.md).
- For tool inputs, root selection, and failure handling, read [references/mcp-tools.md](references/mcp-tools.md).

## Invariants

- Read `.specrow/config.yml` and use its configured language for generated SpecRow artifacts and user-facing workflow updates.
- Do not silently fall back to English when required language resources are missing.
- Proposal and review requests do not authorize product-code implementation.
- A successful build or test run is not acceptance. Call `specrow_accept` only after explicit user acceptance.
- Only the acceptance path may integrate staged specifications as final truth and authorize archival.
