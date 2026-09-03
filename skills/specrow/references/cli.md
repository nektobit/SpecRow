# Bundled SpecRow CLI adapter

Use this adapter only when the SpecRow MCP tools are unavailable and the agent has a local shell in the user's project workspace.

## Runner

Resolve `../scripts/specrow-cli.cjs` relative to this reference file (equivalently, `scripts/specrow-cli.cjs` from the skill root) and use its absolute path as `<specrow-cli>`. Run commands as:

```text
node <specrow-cli> <command> [arguments]
```

Set the shell working directory to the intended project root for every call. Never run the CLI from the plugin or skill installation directory. Do not use `npx`, download a package, or fall back to a global `specrow` binary.

Start discovery with `node <specrow-cli> status`. If `.specrow` is missing, initialize only after resolving the language according to the workspace instructions.

## Intent mapping

| Intent | CLI operations |
| --- | --- |
| Inspect or explore | `status`, `context [change-name]`, `validate [change-name]` |
| Initialize | `init --language <code>` with optional `--estimation` |
| Create a proposal | `proposal <change-name>`; then edit the generated proposal and tasks with native file tools |
| Review | Inspect proposal and tasks semantically, then run `review <change-name>` |
| Implement | `context <change-name>`, `build-start <change-name>`, implementation and checks, then `build-finish <change-name>` |
| Request revision | `revise <change-name>` before completing requested follow-up work |
| Accept | `accept <change-name> --yes`; add `--follow-up-work-completed` only when applicable |
| Archive | `archive <change-name>` after acceptance |
| Migrate | `migrate [source]` with the options described in the migration reference |

Short phrases such as `specrow explore` and `specrow build` are user intents, not literal CLI commands. Execute the corresponding sequence above.

## Failure handling

Treat a nonzero exit code as a failed operation. Report the command output and fix the stated condition before retrying. Do not use `--force` to bypass an existing workspace or overwrite migration output unless the user explicitly requests replacement.
