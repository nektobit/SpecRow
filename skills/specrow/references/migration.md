# Migrating specifications into SpecRow

Use `specrow_migrate` for OpenSpec, Spec Kit, or a project-local documentation folder.

1. Call `specrow_project_status` for the target workspace.
2. Identify the source before writing. Prefer an explicit `source`; use automatic detection only when the source system is unambiguous.
3. Run a dry migration when overwrite risk or source interpretation is uncertain.
4. Run the migration without `force` by default.
5. Call `specrow_validate` and inspect all warnings and preserved source references.
6. Ask the user to review migrated material before treating it as current truth.

Migration must remain inside the MCP workspace root. Do not use parent traversal or an external source path through the plugin. Do not delete, move, or rewrite the source system. Preserve archived source entries as history.

Migrated documents may need restructuring because source headings and lifecycle semantics are not automatically equivalent to SpecRow acceptance.
