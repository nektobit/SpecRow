<!-- specrow:readme-section=title -->
# SpecRow

SpecRow is an agent-first specification workflow. Users describe intent in plain language, such as `specrow migrate`, `specrow explore`, `specrow proposal`, or `specrow build`; agents execute the workflow through SpecRow MCP tools or the bundled local CLI adapter for Codex.

<!-- specrow:readme-section=language-links -->
## Read This In Your Language

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

<!-- specrow:readme-section=documentation -->
## Documentation

Website: https://specrow.com/

The site covers the full MVP workflow: getting started, explore, proposal to accept, MCP and local CLI adapters, templates, localization, validation, lifecycle rules, and differences from OpenSpec.

<!-- specrow:readme-section=quick-start -->
## Quick Start

Install the complete plugin with a supported client:

- GitHub Copilot CLI: `copilot plugin install nektobit/SpecRow`.
- GitHub Copilot in VS Code: run `Chat: Install Plugin From Source` and enter `https://github.com/nektobit/SpecRow`.
- Kiro IDE (experimental): choose `Powers → Add Custom Power → Import power from GitHub` and enter the same repository URL.
- Codex desktop/CLI: the repository includes a skills-only adapter with a bundled local CLI; public one-click installation depends on approval in the OpenAI Plugins Directory. Cursor still depends on its own marketplace listing.

Hermes Agent, OpenClaw, Grok Bot, and NanoClaw are compatible with the Agent Plugins format but are not yet tested by SpecRow. Claude Code, Gemini CLI, and Windsurf/Cascade do not currently have a supported one-package SpecRow install. Node.js 20+ and target-project filesystem access are required; Agent Plugins clients also need local stdio MCP support, while Codex uses its local shell and the bundled CLI. These installation paths are documented by their client vendors, but SpecRow does not yet run client-specific end-to-end installation tests.

`npm i -g specrow` installs only the standalone CLI; it does not register the plugin in an agent. After a complete plugin install, start a new chat and ask the agent to check SpecRow for the intended project.

Then tell the agent what SpecRow workflow you want:

```txt
specrow migrate openspec
specrow explore Discuss the idea before creating a change
specrow proposal Describe the intended change
specrow review
specrow build
specrow accept
```

Agents should treat these as workflow intentions and execute them through the adapter provided by the client: MCP tools or the bundled local CLI in Codex.

Tip: use `brief: task text` or `бриф: текст задачи` to mark the original human-side task description. The agent should use the brief as source material and constraints for preparing the proposal, but it is not the final proposal itself.

For automation outside an agent session, the `specrow` binary is also available:

```bash
npm i -g specrow
specrow init --language en --estimation
specrow migrate ./docs
specrow validate
```

<!-- specrow:readme-section=workspace -->
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

Add `estimation.enabled: true` when agents should add an approximate implementation-time estimate after each proposal is formed:

```yml
version: 1
language: en
estimation:
  enabled: true
```

<!-- specrow:readme-section=accept-gate -->
## Accept Gate

Build does not update specs as final truth and does not archive a change. Specs and archive are updated only after explicit user acceptance through the `specrow accept` workflow.

<!-- specrow:readme-section=migration -->
## Migration Notes

Use `specrow migrate openspec`, `specrow migrate speckit`, or `specrow migrate ./docs` to bring existing specification artifacts into `.specrow/`. If `.specrow` is missing, migration initializes it first. The source system is not deleted, and archived records are copied as preserved history without transformation.
