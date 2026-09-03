# SpecRow lifecycle workflow

Use this sequence as a stateful workflow, not as a list of interchangeable commands.

| Intent | MCP tools | Required boundary |
| --- | --- | --- |
| Explore an idea | `specrow_project_status`, `specrow_context`, `specrow_validate` | Read-only; do not create a change or implement code. |
| Create a proposal | `specrow_create_proposal`, `specrow_validate`, `specrow_context` | Fill proposal and tasks, then stop. |
| Review readiness | `specrow_review`, `specrow_validate` | Do not implement during review. |
| Implement | `specrow_context`, `specrow_build_start`, `specrow_build_finish` | Implement only the approved scope; do not accept. |
| Revise | `specrow_revise`, `specrow_context`, `specrow_validate` | Apply requested follow-up work; do not infer acceptance. |
| Accept | `specrow_accept` | Requires explicit user acceptance and completed build or follow-up work. |
| Archive | `specrow_archive` | Only after acceptance. |

## Proposal

Choose a stable change name using letters, digits, dots, underscores, or hyphens. Create the change through `specrow_create_proposal`; then edit the generated proposal and task content in the configured workspace language. When estimation is enabled in `.specrow/config.yml`, include an approximate implementation range and its assumptions. Validate and stop for a separate review or build request.

## Review

Review problem framing, scope, risks, decisions, acceptance criteria, and language consistency. Review is required for security, privacy, permissions, data migrations, destructive behavior, public contracts, automation, architecture, localization, or lifecycle changes. Resolve blocking ambiguity before implementation.

## Build and revise

Load `specrow_context`, validate the change through `specrow_build_start`, and implement only the proposed scope. Record relevant verification evidence in the change tasks when useful. Call `specrow_build_finish` after implementation and verification.

If the user requests changes, call `specrow_revise`, complete the follow-up work, rerun relevant checks, and leave the change awaiting a new user decision.

## Acceptance and archive

Acceptance must be explicit. Do not infer it from silence, successful tests, approval of the proposal, or completion of code. Call `specrow_accept` with `explicitUserAcceptance: true` only when the user accepts the completed result. When a revision was requested, set `followUpWorkCompleted: true` only after that work and its checks are complete. Archive only after acceptance.
