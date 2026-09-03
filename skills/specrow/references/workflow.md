# SpecRow lifecycle workflow

Use this sequence as a stateful workflow, not as a list of interchangeable commands.

| Intent | MCP tools | Bundled CLI | Required boundary |
| --- | --- | --- | --- |
| Explore an idea | `specrow_project_status`, `specrow_context`, `specrow_validate` | `status`, `context`, `validate` | Read-only; do not create a change or implement code. |
| Create a proposal | `specrow_create_proposal`, `specrow_validate`, `specrow_context` | `proposal`, edit generated files, `validate` | Fill proposal and tasks, then stop. |
| Review readiness | `specrow_review`, `specrow_validate` | inspect files, `review`, `validate` | Do not implement during review. |
| Implement | `specrow_context`, `specrow_build_start`, `specrow_build_finish` | `context`, `build-start`, `build-finish` | Implement only the approved scope; do not accept. |
| Revise | `specrow_revise`, `specrow_context`, `specrow_validate` | `revise`, `context`, `validate` | Apply requested follow-up work; do not infer acceptance. |
| Accept | `specrow_accept` | `accept --yes` | Requires explicit user acceptance and completed build or follow-up work. |
| Archive | `specrow_archive` | `archive` | Only after acceptance. |

## Proposal

Choose a stable change name using letters, digits, dots, underscores, or hyphens. Create the change through the selected adapter; then edit the generated proposal and task content in the configured workspace language. When estimation is enabled in `.specrow/config.yml`, include an approximate implementation range and its assumptions. Validate and stop for a separate review or build request.

## Review

Review problem framing, scope, risks, decisions, acceptance criteria, and language consistency. Review is required for security, privacy, permissions, data migrations, destructive behavior, public contracts, automation, architecture, localization, or lifecycle changes. Resolve blocking ambiguity before implementation.

## Build and revise

Load context, validate the change through the selected adapter's build-start operation, and implement only the proposed scope. Record relevant verification evidence in the change tasks when useful. Run the adapter's build-finish operation after implementation and verification.

If the user requests changes, run the adapter's revise operation, complete the follow-up work, rerun relevant checks, and leave the change awaiting a new user decision.

## Acceptance and archive

Acceptance must be explicit. Do not infer it from silence, successful tests, approval of the proposal, or completion of code. With MCP, call `specrow_accept` with `explicitUserAcceptance: true`; with the CLI, run `accept <change-name> --yes`. When a revision was requested, confirm completed follow-up work only after that work and its checks are complete. Archive only after acceptance.
