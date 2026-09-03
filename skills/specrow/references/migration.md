# Migrating specifications into SpecRow

Use the selected adapter's migrate operation for OpenSpec, Spec Kit, or a project-local documentation folder.

1. Inspect project status through the selected adapter.
2. Identify the source before writing. Prefer an explicit `source`; use automatic detection only when the source system is unambiguous.
3. Run a dry migration when overwrite risk or source interpretation is uncertain.
4. Run the migration without `force` by default.
5. Validate through the same adapter and inspect all warnings and preserved source references.
6. Ask the user to review migrated material before treating it as current truth.

With MCP, migration must remain inside the announced workspace root. With the CLI, use a project-local source unless the user explicitly identifies an external source. Do not delete, move, or rewrite the source system. Preserve archived source entries as history.

CLI options:

- `--dry-run` previews initialization and file operations without writing.
- `--source-root <path>` sets the root used to detect OpenSpec or Spec Kit.
- `--language <code>` selects the workspace language if migration initializes SpecRow.
- `--force` may overwrite migration targets and requires the user's explicit replacement request.

Migrated documents may need restructuring because source headings and lifecycle semantics are not automatically equivalent to SpecRow acceptance.
