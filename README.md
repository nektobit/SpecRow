# SpecRow

SpecRow is an agent-first specification workflow. Users describe intent in plain language, such as `specrow proposal` or `specrow build`; agents execute the workflow through the SpecRow MCP server.

## Read This In Your Language

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Documentation

GitHub Pages: https://nektobit.github.io/SpecRow/

The site covers the full MVP workflow: getting started, proposal to accept, MCP tools, templates, localization, validation, lifecycle rules, and differences from OpenSpec.

## Quick Start

Use the agent installer first. Pass the project working language explicitly:

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install language=en
```

The agent uses the SpecRow MCP server to inspect the workspace, initialize `.specrow` with that language when needed, validate the workspace, and report the next logical step.

Then tell the agent what SpecRow workflow you want:

```txt
specrow proposal Describe the intended change
specrow review
specrow build
specrow accept
```

Agents should treat these as workflow intentions and execute them through MCP tools.

For automation outside an agent session, the `specrow` binary is also available:

```bash
npm i -g specrow
specrow init --language en --tools codex,claude,cursor,windsurf,generic
specrow validate
specrow integrations status
```

## Workspace

SpecRow initialization creates:

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

The configured language controls built-in templates and lifecycle/status messages. Missing language resources are errors. SpecRow does not silently fall back to English.

## Accept Gate

Build does not update specs as final truth and does not archive a change. Specs and archive are updated only after explicit user acceptance through the `specrow accept` workflow.

## Migration Notes

Older local prototypes may have used the `specfly` CLI name or a `.specfly` workspace directory. New projects use the `specrow` binary and `.specrow/`. Move any project-specific files you still need into the matching `.specrow/` locations.
