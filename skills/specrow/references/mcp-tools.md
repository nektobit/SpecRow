# MCP tool contract

## Project root

Workspace-dependent tools accept an optional absolute `projectRoot`.

Resolution order:

1. Explicit `projectRoot`, when it is within a filesystem root announced by the MCP client.
2. The client's only filesystem root.
3. The only initialized SpecRow workspace among multiple announced roots.
4. The explicitly supplied server startup root for direct CLI MCP runs.

When multiple client roots remain ambiguous, stop and pass the intended absolute `projectRoot`. Always compare the `projectRoot` in the tool result with the workspace the user named before writing.

## Failure handling

- `VALIDATION_FAILED`: fix reported workspace or input issues and retry validation.
- `INVALID_PROJECT_ROOT`: select a valid announced workspace root; never substitute the plugin directory.
- `UNSAFE_PATH`: stop and remove traversal or an out-of-workspace source.
- `INVALID_STATE`: respect the lifecycle gate rather than forcing a transition.
- `NOT_FOUND`: confirm the change name or initialize the workspace.
- `MISSING_LANGUAGE_RESOURCE`: stop; do not fall back to another language.
- `INTERNAL_ERROR`: report the exact message and avoid repeating a mutation blindly.

Use read-only tools for discovery. Do not treat a `success: true` envelope as proof that validation passed; inspect the `valid` field and issue severities returned by `specrow_validate`.
