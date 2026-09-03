# SpecRow workspace

## Initialization

1. Determine the intended project language. Prefer the user's explicit choice, then an existing `.specrow/config.yml` value. Ask only when a new workspace has no reliable language signal.
2. Call `specrow_project_status` with the target `projectRoot`.
3. If the workspace is not initialized, call `specrow_init` with the same `projectRoot` and the selected language.
4. Call `specrow_validate` and report blocking issues before starting another workflow phase.

Do not reinitialize an existing workspace or use `force` unless the user explicitly asks to replace its configuration.

## Layout

```text
.specrow/
├── config.yml
├── project.md
├── specs/
├── changes/
└── archive/
```

- `config.yml` contains stable workspace settings, including the working language.
- `project.md` describes the current project context.
- `specs/` is accepted current truth.
- `changes/<change-name>/` contains staged proposal, tasks, specs, and lifecycle status.
- `archive/` contains accepted historical changes.

Treat `.specrow/changes/` as staged work. Do not copy staged specifications into `.specrow/specs/` outside the explicit accept-and-archive flow.
