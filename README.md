# SpecRow

SpecRow is an agent-first specification workflow. Users describe intent through `/specrow:*` commands, while the `specrow` CLI remains the technical core for agents, CI, automation, and manual fallback.

## Read This In Your Language

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Documentation

GitHub Pages: https://nektobit.github.io/SpecRow/

The site covers the full MVP workflow: getting started, proposal to accept, agent commands, CLI core, templates, localization, validation, lifecycle rules, and differences from OpenSpec.

## Quick Start

Install the CLI globally:

```bash
npm i -g specrow
```

Check the installation:

```bash
specrow --version
specrow --help
```

Use the agent commands first:

```txt
/specrow:init language=en
/specrow:proposal Describe the intended change
/specrow:review
/specrow:build
/specrow:accept
```

The agent may call CLI commands such as `specrow init`, `specrow proposal`, `specrow validate`, `specrow context`, and `specrow build-finish` as implementation details.

Install agent integrations when you want SpecRow to create command, prompt, skill, rule, workflow, or fallback instruction files for supported tools:

```bash
specrow init --tools codex,claude,cursor,windsurf,generic
specrow integrate --detect
specrow update
specrow integrations status
```

Without `--tools`, `specrow init` only creates the `.specrow` workspace. For agent-driven setup, use:

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install
```

## Workspace

`/specrow:init` creates:

```txt
.specrow/
  config.yml
  project.md
  specs/
  changes/
  archive/
```

`config.yml` stays minimal:

```yml
version: 1
language: en
```

When integrations are installed, `config.yml` also records the selected tools and managed files so `specrow update` can regenerate them.

The configured language controls built-in templates and lifecycle/status messages. Missing language resources are errors. SpecRow does not silently fall back to English.

## Accept Gate

Build does not update specs as final truth and does not archive a change. Specs and archive are updated only after explicit user acceptance through `/specrow:accept`.

## Migration Notes

Older local prototypes may have used the `specfly` CLI name or a `.specfly` workspace directory. New projects use the `specrow` binary and `.specrow/`. Move any project-specific files you still need into the matching `.specrow/` locations.
