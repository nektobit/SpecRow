export const defaultLocale = 'en' as const

export const locales = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
  { code: 'zh-CN', label: '中文' },
] as const

export type LocaleCode = (typeof locales)[number]['code']

export const pages = [
  { slug: 'manifesto' },
  { slug: 'instructions' },
  { slug: 'workflow' },
  { slug: 'agent-commands' },
  { slug: 'mcp-server' },
  { slug: 'cli-reference' },
  { slug: 'migration' },
  { slug: 'templates' },
  { slug: 'localization' },
  { slug: 'validation-lifecycle' },
  { slug: 'sd-development' },
] as const

export type PageSlug = (typeof pages)[number]['slug']

export const pageContracts: Record<PageSlug, { revision: number; sourceLocale: LocaleCode; sectionIds: readonly string[] }> = {
  manifesto: { revision: 2, sourceLocale: 'en', sectionIds: ['language', 'vocabulary', 'shared-model', 'staged-changes', 'derived-tasks', 'structural-validation', 'explicit-decisions', 'tooling', 'human-control'] },
  instructions: { revision: 4, sourceLocale: 'en', sectionIds: ['sdd-introduction', 'requirements', 'choose-client', 'install-copilot', 'install-vscode', 'install-kiro', 'marketplace-clients', 'unsupported-clients', 'package-contents', 'first-check', 'project-selection', 'first-workflow', 'acceptance-boundary', 'cli-automation'] },
  workflow: { revision: 3, sourceLocale: 'en', sectionIds: ['states', 'explore', 'proposal', 'review', 'build', 'revise', 'accept-and-archive'] },
  'agent-commands': { revision: 3, sourceLocale: 'en', sectionIds: ['intent-contract', 'explore', 'proposal', 'review', 'build', 'revise', 'accept-and-archive', 'stop-points'] },
  'mcp-server': { revision: 3, sourceLocale: 'en', sectionIds: ['runtime', 'workspace-selection', 'connection-check', 'inspect-tools', 'setup-tools', 'lifecycle-tools', 'result-contract', 'errors'] },
  'cli-reference': { revision: 3, sourceLocale: 'en', sectionIds: ['setup', 'migration', 'planning', 'implementation', 'acceptance', 'maintenance'] },
  migration: { revision: 1, sourceLocale: 'en', sectionIds: ['choose-path', 'safe-order', 'source-mapping', 'safety-boundaries', 'semantic-review', 'legacy-upgrade'] },
  templates: { revision: 2, sourceLocale: 'en', sectionIds: ['workspace-layout', 'project-context', 'accepted-specs', 'staged-proposal', 'tasks-and-status'] },
  localization: { revision: 3, sourceLocale: 'en', sectionIds: ['config', 'localized-resources', 'no-fallback', 'supported-languages', 'runtime-contract', 'site-contract', 'vocabulary'] },
  'validation-lifecycle': { revision: 2, sourceLocale: 'en', sectionIds: ['validation', 'review-readiness', 'multiple-changes', 'acceptance-gate', 'limits'] },
  'sd-development': { revision: 2, sourceLocale: 'en', sectionIds: ['working-definition'] },
}

export const anchorAliases: Record<PageSlug, Readonly<Record<string, string>>> = {
  manifesto: {}, instructions: {}, workflow: {}, 'agent-commands': {}, 'mcp-server': {}, 'cli-reference': {}, migration: {}, templates: {}, localization: {}, 'validation-lifecycle': {}, 'sd-development': {},
}

export const reviewedContentRevisions: Record<LocaleCode, Record<PageSlug, number>> = {
  en: { manifesto: 2, instructions: 4, workflow: 3, 'agent-commands': 3, 'mcp-server': 3, 'cli-reference': 3, migration: 1, templates: 2, localization: 3, 'validation-lifecycle': 2, 'sd-development': 2 },
  ru: { manifesto: 2, instructions: 4, workflow: 3, 'agent-commands': 3, 'mcp-server': 3, 'cli-reference': 3, migration: 1, templates: 2, localization: 3, 'validation-lifecycle': 2, 'sd-development': 2 },
  es: { manifesto: 2, instructions: 4, workflow: 3, 'agent-commands': 3, 'mcp-server': 3, 'cli-reference': 3, migration: 1, templates: 2, localization: 3, 'validation-lifecycle': 2, 'sd-development': 2 },
  'zh-CN': { manifesto: 2, instructions: 4, workflow: 3, 'agent-commands': 3, 'mcp-server': 3, 'cli-reference': 3, migration: 1, templates: 2, localization: 3, 'validation-lifecycle': 2, 'sd-development': 2 },
}

export const documentedCliCommands = ['init', 'migrate', 'locales', 'mcp', 'proposal', 'validate', 'review', 'status', 'context', 'build-start', 'build-finish', 'revise', 'accept', 'archive', 'list'] as const

export const documentedCliPaths = ['init', 'migrate', 'locales validate', 'mcp', 'proposal', 'validate', 'review', 'status', 'context', 'build-start', 'build-finish', 'revise', 'accept', 'archive', 'list'] as const

export const documentedCliOptions: Record<(typeof documentedCliPaths)[number], readonly string[]> = {
  init: ['--language', '--estimation', '--force'],
  migrate: ['--language', '--source-root', '--force', '--dry-run'],
  'locales validate': [],
  mcp: [],
  proposal: ['--review'],
  validate: [],
  review: [],
  status: [],
  context: [],
  'build-start': [],
  'build-finish': [],
  revise: [],
  accept: ['--yes', '--follow-up-work-completed'],
  archive: [],
  list: [],
}

export const documentedMcpTools = ['specrow_init', 'specrow_project_status', 'specrow_create_proposal', 'specrow_migrate', 'specrow_validate', 'specrow_review', 'specrow_status', 'specrow_context', 'specrow_build_start', 'specrow_build_finish', 'specrow_revise', 'specrow_accept', 'specrow_archive'] as const

export const documentedAgentIntents = ['explore', 'proposal', 'review', 'build', 'revise', 'accept', 'archive'] as const

export type TextPart = string | { text: string; page: PageSlug } | { text: string; marks: readonly ('bold' | 'italic')[] }
export type Paragraph = string | TextPart[]

export type ExampleKind = 'intent' | 'cli' | 'mcp'

export type Block = { id: string; exampleKind?: ExampleKind } & (
  | { type: 'section'; heading: string; headingLevel?: 2 | 3; paragraphs: Paragraph[]; commands?: string[] }
  | { type: 'list-section'; heading: string; headingLevel?: 2 | 3; intro: string; items: string[]; outro: string }
  | { type: 'code-section'; heading: string; headingLevel?: 2 | 3; intro: string; code: string; outro: string }
  | { type: 'command-section'; heading: string; headingLevel?: 2 | 3; intro: string; commands: string[]; outro: string }
)

export interface PageContent {
  eyebrow: string
  title: string
  description: string
  blocks: Block[]
}

export const docContent: Record<LocaleCode, Record<PageSlug, PageContent>> = {
  en: {
    manifesto: {
      eyebrow: 'Manifesto',
      title: 'SpecRow',
      description:
        "Agent-first specification process where the user's language = the language of the project, agent, templates, and lifecycle messages.",
      blocks: [
        { id: 'language', type: 'section', heading: '1. User-First Language', paragraphs: ['Project context, templates, and lifecycle messages use the selected project language. Missing resources fail clearly instead of silently falling back to English.'] },
        { id: 'vocabulary', type: 'section', heading: '2. Shared Vocabulary', paragraphs: ['project.md records canonical product names, acronyms, and domain terms so people and agents use the same vocabulary.'] },
        { id: 'shared-model', type: 'list-section', heading: '3. One Model, Two Time Horizons', intro: 'SpecRow separates accepted truth from proposed work:', items: ['Current specs describe accepted behavior.', 'A change stages the proposal, tasks, status, and intended spec updates.'], outro: 'Archive joins them only after explicit acceptance.' },
        { id: 'staged-changes', type: 'section', heading: '4. Change-First Workflow', paragraphs: ['A feature, fix, or improvement begins as a named change. Implementation can be revised or accepted; only archive integrates its staged specs into current truth.'] },
        { id: 'derived-tasks', type: 'section', heading: '5. Traceable Tasks', paragraphs: ['Tasks must trace back to the proposal and its acceptance criteria. If the plan cannot explain how the intended behavior will be implemented and verified, the proposal needs revision.'] },
        { id: 'structural-validation', type: 'section', heading: '6. Structural Validation', paragraphs: ['Automation checks files, required sections, status shape, placeholders, and locale topology. It catches structural drift; people and agents still review meaning, feasibility, and risk.'] },
        { id: 'explicit-decisions', type: 'section', heading: '7. Explicit Decisions', paragraphs: ['Agents must not silently make consequential architecture, UX, data, or security decisions. Record the decision or stop for user input.'] },
        { id: 'tooling', type: 'section', heading: '8. Tools Serve The Contract', paragraphs: ['CLI and MCP expose the same lifecycle operations so agents, people, and CI can inspect and advance work predictably. Tool success never replaces validation or acceptance.'] },
        { id: 'human-control', type: 'section', heading: '9. Human Control', paragraphs: ['The user owns the acceptance boundary. SpecRow may prepare, validate, and record work, but it cannot infer approval or archive unaccepted changes.'] },
      ],
    },
    instructions: {
      eyebrow: 'Start',
      title: 'Install And Start',
      description: 'Choose a supported agent, install the complete plugin, then initialize the intended project.',
      blocks: [
        { id: 'sdd-introduction',
          type: 'section',
          heading: 'What Is Spec-Driven Development?',
          paragraphs: [
            [
              'If you have not worked with SDD (Spec-Driven Development) before, read ',
              { text: 'this article', page: 'sd-development' },
              '. It will help you understand the basics of the method. After that, build a small project with SpecRow to practice.',
            ],
          ],
        },
        { id: 'requirements', type: 'list-section', heading: 'Requirements', intro: 'The complete plugin needs:', items: ['Node.js 20 or newer available on PATH.', 'An agent client that loads both Agent Skills and local stdio MCP servers.', 'Filesystem access to the target project.'], outro: 'Installing the SpecRow CLI alone does not register the plugin in an agent.' },
        { id: 'choose-client', type: 'list-section', heading: 'Choose Your Agent', intro: 'Installation support is intentionally explicit:', items: ['GitHub Copilot CLI: direct one-command installation from GitHub.', 'GitHub Copilot in VS Code: install from the repository in the Plugins UI.', 'Kiro IDE: import the repository as a custom Power.', 'Codex desktop/CLI and Cursor: compatible packages are included, but the simple public install path depends on marketplace publication.', 'Hermes Agent, OpenClaw, Grok Bot, and NanoClaw: compatible with the Agent Plugins format, but not yet tested by SpecRow.'], outro: 'These paths are documented by their client vendors, but SpecRow does not yet run client-specific end-to-end installation tests.' },
        { id: 'install-copilot', exampleKind: 'cli', type: 'command-section', heading: 'GitHub Copilot CLI — Recommended', intro: 'Install the complete plugin from the repository with one command:', commands: ['copilot plugin install nektobit/SpecRow'], outro: 'The package contains both the SpecRow skill and its MCP server. It is different from npm i -g specrow, which installs only the standalone CLI.' },
        { id: 'install-vscode', type: 'code-section', heading: 'GitHub Copilot In VS Code', intro: 'Open the Command Palette, run “Chat: Install Plugin From Source”, and enter:', code: 'https://github.com/nektobit/SpecRow', outro: 'Review the repository trust prompt, install, and start a new chat so the skill and MCP tools are discovered.' },
        { id: 'install-kiro', type: 'code-section', heading: 'Kiro IDE — Experimental', intro: 'Open Powers → Add Custom Power → Import power from GitHub, enter this repository, and click Install:', code: 'https://github.com/nektobit/SpecRow', outro: 'Kiro documents this Agent Plugins path; SpecRow has not yet completed its own Kiro client smoke test.' },
        { id: 'marketplace-clients', type: 'list-section', heading: 'Codex And Cursor', intro: 'The repository includes the portable package and a Codex manifest, but public one-click installation still requires listing:', items: ['Codex desktop and Codex CLI are the supported and documented SpecRow targets after directory publication. The Codex IDE extension is not yet supported or tested by SpecRow.', 'Cursor: install from Customize or its marketplace after SpecRow is listed. Availability can depend on the Cursor plan or administrator policy. An MCP-only deep link is not a complete SpecRow install because it omits the skill.'], outro: 'Until those listings exist, do not present a marketplace button as working.' },
        { id: 'unsupported-clients', type: 'list-section', heading: 'Not Yet A One-Package Install', intro: 'Do not promise automatic SpecRow plugin installation for:', items: ['Claude Code, which uses its own plugin manifest and marketplace format.', 'Gemini CLI, which requires a Gemini extension manifest.', 'Windsurf/Cascade, where only separate Skill and MCP setup is documented.'], outro: 'Adapters can be added later. Today these clients are outside the supported simple-install path.' },
        { id: 'package-contents', type: 'code-section', heading: 'What Gets Installed', intro: 'A complete SpecRow package contains:', code: 'plugin.json\nmcp.json\n.codex-plugin/plugin.json\n.mcp.json\nskills/specrow/SKILL.md\nruntime/specrow-mcp.cjs', outro: 'Agent Plugins standardizes the portable package; each client still controls discovery and installation.' },
        { id: 'first-check', exampleKind: 'intent', type: 'section', heading: 'First Check', paragraphs: ['Ask the agent to check SpecRow for the intended project. The skill starts with project status, then initializes and validates the workspace when needed.'], commands: ['Check SpecRow for this project'] },
        { id: 'project-selection', type: 'section', heading: 'Select The Correct Project', paragraphs: ['When the client exposes no MCP roots or multiple roots remain ambiguous, the agent must pass the absolute projectRoot. If exactly one initialized SpecRow workspace exists among several roots, the server selects it automatically. The plugin installation directory is never a user workspace.'] },
        { id: 'first-workflow', exampleKind: 'intent', type: 'section', heading: 'First Workflow', paragraphs: ['Explore an unclear idea without creating a change. When the desired outcome is clear, ask for a proposal. Review risky work before implementation.'], commands: ['specrow explore Discuss passwordless sign-in', 'specrow proposal Add passwordless sign-in', 'specrow review <change-name>'] },
        { id: 'acceptance-boundary', exampleKind: 'intent', type: 'section', heading: 'Acceptance Boundary', paragraphs: ['Build stops in the built state. Accept requires an explicit user decision and only records acceptance. Archive is a separate step that integrates staged specs and moves the accepted change into history.'], commands: ['specrow build <change-name>', 'specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'cli-automation', exampleKind: 'cli', type: 'section', heading: 'CLI Automation', paragraphs: ['Outside an agent session, install and use the CLI for CI, scripts, or direct automation.'], commands: ['npm i -g specrow', 'specrow init --language en --estimation', 'specrow validate'] },
      ],
    },
    workflow: {
      eyebrow: 'Workflow',
      title: 'Proposal To Accept',
      description: 'The MVP workflow is explore, proposal, review, build, revise when needed, accept, and archive.',
      blocks: [
        { id: 'states', type: 'section', heading: 'Lifecycle States', paragraphs: ['Every change has status.yml with one state: proposed, reviewed, built, revision-needed, accepted, or archived. It also records review tracking, explicit acceptance, createdAt, and updatedAt.'] },
        { id: 'explore', type: 'section', heading: '0. Explore', paragraphs: ['Explore is pre-proposal discovery. The agent reads project status and context, investigates options and risks, asks focused questions, and does not create a change directory or lifecycle state.'] },
        { id: 'proposal', type: 'section', heading: '1. Proposal', paragraphs: ['The agent turns user intent into a concrete proposal and task skeleton. This creates a change directory under .specrow/changes/<change-name>/ and leaves the change in proposed state.'] },
        { id: 'review', type: 'section', heading: '2. Review', paragraphs: ['Review is recommended by default and required only for risky changes. It checks proposal readiness, weak acceptance criteria, required files, and required sections. Review is not acceptance.'] },
        { id: 'build', type: 'section', heading: '3. Build', paragraphs: ['Build reads proposal, tasks, status, and active-change warnings. It implements the scoped work and then marks the change as built. Build must not archive, accept, or update specs as final truth.'] },
        { id: 'revise', type: 'section', heading: '4. Revise', paragraphs: ['If the user requests changes after build, the change moves to revision-needed. Follow-up work can update the proposal, tasks, implementation, or verification evidence, but it still does not accept the change.'] },
        { id: 'accept-and-archive', type: 'section', heading: '5. Accept And Archive', paragraphs: ['Acceptance requires an explicit user decision and only records that decision in status.yml. Archive is a separate action: it copies staged spec updates into .specrow/specs/ and moves the accepted change into .specrow/archive/. Existing archive folders are never overwritten.'] },
      ],
    },
    'agent-commands': {
      eyebrow: 'Agent Use',
      title: 'Intent, Not CLI',
      description: 'Short SpecRow phrases are workflow requests. The agent maps them to MCP tools; they are not literal CLI commands.',
      blocks: [
        { id: 'intent-contract', type: 'section', heading: 'Intent Contract', paragraphs: ['A phrase such as specrow build asks the agent to perform the corresponding workflow through MCP. It is not a shell command.'] },
        { id: 'explore', exampleKind: 'intent', type: 'section', heading: 'specrow explore', paragraphs: ['Uses project status, context, and validation for read-only discovery. It does not create a change or implement code.'], commands: ['specrow explore Discuss passwordless sign-in'] },
        { id: 'proposal', exampleKind: 'intent', type: 'section', heading: 'specrow proposal', paragraphs: ['Creates staged proposal.md, tasks.md, and status.yml. It does not authorize implementation.'], commands: ['specrow proposal Add passwordless sign-in'] },
        { id: 'review', exampleKind: 'intent', type: 'section', heading: 'specrow review', paragraphs: ['Checks readiness before implementation. Review is required for security, privacy, permissions, migrations, destructive behavior, public contracts, automation, architecture, localization, or lifecycle changes.'], commands: ['specrow review <change-name>'] },
        { id: 'build', exampleKind: 'intent', type: 'section', heading: 'specrow build', paragraphs: ['Loads context, checks readiness, implements only the proposed scope, verifies it, and records built without accepting it.'], commands: ['specrow build <change-name>'] },
        { id: 'revise', exampleKind: 'intent', type: 'section', heading: 'specrow revise', paragraphs: ['Records that follow-up work is needed. The work and its checks must finish before acceptance.'], commands: ['specrow revise <change-name>'] },
        { id: 'accept-and-archive', exampleKind: 'intent', type: 'section', heading: 'specrow accept And archive', paragraphs: ['Accept requires an explicit user decision and records acceptance. Archive separately integrates staged specs and moves the accepted change into history.'], commands: ['specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'stop-points', type: 'section', heading: 'Required Stop Points', paragraphs: ['The agent stops after proposal when implementation was not requested, on blocking validation or lifecycle errors, and before acceptance until the user explicitly accepts the completed result. Passing tests are not acceptance.'] },
      ],
    },
    'mcp-server': {
      eyebrow: 'Reference',
      title: 'MCP Server',
      description: 'The bundled stdio server exposes request-scoped operations and safely selects the project workspace for every call.',
      blocks: [
        { id: 'runtime', type: 'section', heading: 'Bundled Runtime', paragraphs: ['The plugin starts runtime/specrow-mcp.cjs as an agent-managed stdio process. The installation directory is not treated as a user project.'] },
        { id: 'workspace-selection', type: 'section', heading: 'Workspace Selection', paragraphs: ['Each workspace-dependent tool accepts an optional absolute projectRoot. Resolution uses an explicit valid root, the only client filesystem root, the only initialized SpecRow workspace among several roots, or an explicit startup root for direct CLI MCP mode.'] },
        { id: 'connection-check', exampleKind: 'mcp', type: 'section', heading: 'Connection Check', paragraphs: ['Start with project status. Confirm the returned projectRoot before any mutation.'], commands: ['specrow_project_status'] },
        { id: 'inspect-tools', exampleKind: 'mcp', type: 'section', heading: 'Inspect Tools', paragraphs: ['Read project state, active changes, validation results, and agent-readable context.'], commands: ['specrow_project_status', 'specrow_status', 'specrow_context', 'specrow_validate'] },
        { id: 'setup-tools', exampleKind: 'mcp', type: 'section', heading: 'Setup And Import Tools', paragraphs: ['Initialization and migration can write files and require a verified project root.'], commands: ['specrow_init', 'specrow_migrate'] },
        { id: 'lifecycle-tools', exampleKind: 'mcp', type: 'section', heading: 'Lifecycle Tools', paragraphs: ['Create and review proposals, control implementation state, record acceptance, and archive accepted work.'], commands: ['specrow_create_proposal', 'specrow_review', 'specrow_build_start', 'specrow_build_finish', 'specrow_revise', 'specrow_accept', 'specrow_archive'] },
        { id: 'result-contract', type: 'section', heading: 'Result Contract', paragraphs: ['Tool results use success or failure envelopes. For specrow_validate, success means the call completed; always inspect valid and issue severities.'] },
        { id: 'errors', type: 'section', heading: 'Errors', paragraphs: ['Expected failures include INVALID_PROJECT_ROOT, UNSAFE_PATH, INVALID_STATE, VALIDATION_FAILED, MISSING_LANGUAGE_RESOURCE, NOT_FOUND, and INTERNAL_ERROR. Stop and fix the reported condition rather than substituting the plugin directory.'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI Reference',
      description: 'The CLI is available for CI, scripts, and automation outside agent sessions.',
      blocks: [
        { id: 'setup', exampleKind: 'cli', type: 'section', heading: 'Setup', paragraphs: ['Initialize the workspace with a project language and optional estimation settings.'], commands: ['specrow init --language en [--estimation] [--force]'] },
        { id: 'migration', exampleKind: 'cli', type: 'section', heading: 'Migration', paragraphs: ['Import OpenSpec, SpecKit, or a documentation folder. CLI sources may be outside the project; MCP migration keeps sources inside the selected workspace. Use --language when migration initializes SpecRow and preview risky writes first.'], commands: ['specrow migrate [source] [--source-root <path>] [--language <code>] [--dry-run] [--force]'] },
        { id: 'planning', exampleKind: 'cli', type: 'section', heading: 'Planning And Inspection', paragraphs: ['Create and inspect staged changes without conflating them with implementation.'], commands: ['specrow proposal <change-name> [--review required|recommended]', 'specrow validate [change-name]', 'specrow review <change-name>', 'specrow status [change-name]', 'specrow context [change-name]', 'specrow list'] },
        { id: 'implementation', exampleKind: 'cli', type: 'section', heading: 'Implementation State', paragraphs: ['CLI automation splits build into a readiness check and an explicit finish transition.'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>'] },
        { id: 'acceptance', exampleKind: 'cli', type: 'section', heading: 'Acceptance And Archive', paragraphs: ['The --yes flag confirms explicit user acceptance. A corrected revision-needed change also requires --follow-up-work-completed. Archive remains a separate command that integrates staged specs.'], commands: ['specrow accept <change-name> --yes', 'specrow accept <change-name> --yes --follow-up-work-completed', 'specrow archive <change-name>'] },
        { id: 'maintenance', exampleKind: 'cli', type: 'section', heading: 'Maintenance', paragraphs: ['Validate locale coverage or start the stdio server directly.'], commands: ['specrow locales validate', 'specrow mcp [project-path]'] },
      ],
    },
    migration: {
      eyebrow: 'Migration',
      title: 'Migrate To The Current SpecRow',
      description: 'Import existing specification artifacts safely and replace legacy client-specific integrations with the portable Agent Plugin.',
      blocks: [
        { id: 'choose-path', type: 'section', heading: 'Choose The Path', paragraphs: ['Content migration moves OpenSpec, SpecKit, or documentation-folder artifacts into .specrow. Plugin upgrade replaces the old client-specific installation model. They solve different problems and can be performed independently.'] },
        { id: 'safe-order', exampleKind: 'cli', type: 'section', heading: 'Safe Migration Order', paragraphs: ['Confirm the target workspace, detect the source, and preview the plan. Migration is an explicit trust boundary because it writes imported material directly into current specs; obtain user approval before the non-dry-run operation. Then migrate without force, validate, and review every warning.'], commands: ['specrow migrate <source> --dry-run', 'specrow migrate <source>', 'specrow validate'] },
        { id: 'source-mapping', type: 'section', heading: 'How Sources Are Mapped', paragraphs: ['OpenSpec specs become current specs and active changes keep their source artifacts. SpecKit feature directories become active changes. A regular documentation folder is copied into imported specs. Archives are preserved as history.'] },
        { id: 'safety-boundaries', type: 'section', heading: 'Safety Boundaries', paragraphs: ['The source must stay inside the selected project for MCP migration and cannot be inside .specrow. Migration copies data; it does not delete, move, or rewrite the source. Existing target files are not overwritten unless force is explicit.'] },
        { id: 'semantic-review', type: 'section', heading: 'Semantic Review Is Required', paragraphs: ['Automatic conversion proves neither equivalent meaning nor correct acceptance criteria. Review headings, requirements, lifecycle state, links, and warnings before migration. After import, validate again and create follow-up changes for any corrections.'] },
        { id: 'legacy-upgrade', type: 'section', heading: 'Upgrade Legacy Integrations', paragraphs: ['The Agent Plugin now ships plugin.json, mcp.json, the specrow skill, and its MCP runtime together. Old generated client commands, rules, workflows, and manually added MCP entries are no longer canonical. SpecRow does not delete them automatically because they may contain user edits; compare and remove them explicitly only after checking ownership and active clients.'] },
      ],
    },
    templates: {
      eyebrow: 'Templates',
      title: 'Built-In Files',
      description: 'SpecRow generates a small set of localized Markdown files instead of cloning a large spec system.',
      blocks: [
        { id: 'workspace-layout', type: 'code-section', heading: '.specrow Structure', intro: 'Initialization creates this workspace.', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml records the workspace format version, project language, and optional estimation preference.' },
        { id: 'project-context', type: 'section', heading: 'project.md', paragraphs: ['project.md records the project purpose, working language, domain vocabulary, architecture notes, constraints, and verification practices. Agents read it before creating or revising built-in files.'] },
        { id: 'accepted-specs', type: 'section', heading: 'Specs', paragraphs: ['Specs describe accepted behavior and contain purpose, current behavior, requirements, constraints, decisions, and verification. Normal changes update them only through accept followed by archive. Explicit migration is the exception: approved source material is imported directly and must be reviewed as a trust boundary.'] },
        { id: 'staged-proposal', type: 'section', heading: 'proposal.md', paragraphs: ['A proposal describes the intended change: summary, problem, proposed change, scope, out of scope, user impact, risks, decisions, acceptance criteria, and intended spec updates.'] },
        { id: 'tasks-and-status', exampleKind: 'cli', type: 'section', heading: 'tasks.md', paragraphs: ['Tasks split work into implementation, verification, documentation, and the acceptance gate. The template reminds agents that build ends with revise or accept.'], commands: ['specrow revise', 'specrow accept'] },
      ],
    },
    localization: {
      eyebrow: 'Localization',
      title: 'Project Language',
      description: 'The language field in .specrow/config.yml controls built-in templates and lifecycle messages.',
      blocks: [
        { id: 'config', type: 'code-section', heading: 'Config', intro: 'The MVP config is intentionally small.', code: 'version: 1\nlanguage: en', outro: 'Supported built-in languages are en, ru, es, and zh-CN.' },
        { id: 'localized-resources', type: 'section', heading: 'What Uses The Language', paragraphs: ['The CLI uses language for project.md, specs, proposals, tasks, and lifecycle/status messages. MCP workflows use the same language when creating or revising built-in files.'] },
        { id: 'no-fallback', type: 'section', heading: 'No Silent Fallback', paragraphs: ['If a requested language, template, or message is missing, SpecRow stops with a clear error. It must not silently generate English files for a non-English project.'] },
        { id: 'supported-languages', exampleKind: 'cli', type: 'section', heading: 'Adding A Language', paragraphs: ['Add the language to the runtime registry, README set, site content, and shell messages. Provide every template marker, message placeholder, page ID, and review digest. The language is complete only when locale validation and tests pass.'], commands: ['npm run locale:validate'] },
        { id: 'runtime-contract', exampleKind: 'cli', type: 'section', heading: 'Changing Text', paragraphs: ['English is the declared source locale for site pages. Change the source, raise the page revision, apply the same meaning to every locale, then refresh each content digest and reviewed source digest. Runtime messages must keep identical placeholders; template sections keep semantic markers.'], commands: ['npm run locale:validate', 'npm run typecheck', 'npm run test'] },
        { id: 'site-contract', exampleKind: 'cli', type: 'section', heading: 'Removing Text', paragraphs: ['Remove unused text from every locale and its reader. Do not rely on English fallback. Preserve published section IDs; if an ID must change, add an anchor alias so existing links still resolve. Digests detect unreviewed edits, but human review remains responsible for semantic equivalence.'], commands: ['npm run locale:validate'] },
        { id: 'vocabulary', type: 'section', heading: 'Domain Terms', paragraphs: ['Use project.md to record words that should stay unchanged, canonical product names, acronyms, and domain vocabulary. This keeps localization predictable without hiding business terms.'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: 'Validation',
      title: 'Validation And Lifecycle Rules',
      description: 'Validation protects the workflow from missing files, incomplete sections, weak proposals, and unsafe archive actions.',
      blocks: [
        { id: 'validation', exampleKind: 'cli', type: 'section', heading: 'Validation', paragraphs: ['Validation checks project.md and active changes. For each change it verifies proposal.md, tasks.md, required sections, and status.yml shape. Missing files and missing sections are errors.'], commands: ['specrow validate [change-name]'] },
        { id: 'review-readiness', exampleKind: 'cli', type: 'section', heading: 'Review Warnings', paragraphs: ['Review adds proposal readiness checks. Empty acceptance criteria or acceptance text without a checklist are warnings so the agent can ask for clarification before implementation.'], commands: ['specrow review <change-name>'] },
        { id: 'multiple-changes', exampleKind: 'cli', type: 'section', heading: 'Multiple Active Changes', paragraphs: ['Status and list expose all active changes. When more than one is open, the list result emits a generic warning to review likely spec or workflow conflicts; it does not calculate file-level conflicts.'], commands: ['specrow status', 'specrow list'] },
        { id: 'acceptance-gate', exampleKind: 'cli', type: 'section', heading: 'Accept Gate', paragraphs: ['Acceptance requires an explicit user decision. In the CLI that decision is confirmed with --yes; MCP callers pass the corresponding explicit acceptance input. Archive is blocked until accepted state records that decision.'], commands: ['specrow accept <change-name> --yes'] },
        { id: 'limits', type: 'section', heading: 'Limits And Archive Safety', paragraphs: ['Validation proves structure, not correctness, completeness, security, or semantic parity between translations. Archive separately copies staged spec updates only after acceptance, then retains the change as history and refuses an existing archive name.'] },
      ],
    },
    'sd-development': {
      eyebrow: 'More Info',
      title: 'SD Development',
      description: 'Spec-Driven Development and how SpecRow applies it in agent workflows.',
      blocks: [
        { id: 'working-definition',
          type: 'section',
          heading: 'What Is Spec-Driven Development?',
          paragraphs: [
            'Spec-Driven Development (SDD) is a way of working in which an agreed specification guides implementation and verification. The specification describes observable behavior, constraints, decisions, and evidence of completion.',
            '“Spec first” does not mean describing every implementation detail before learning starts. It means making intent and acceptance criteria explicit before code changes, then revising the proposal when implementation reveals a better decision.',
            'This is especially useful with coding agents: a durable project context reduces repeated explanations, while a change-scoped proposal keeps one session focused and reviewable. The specification is shared context, not a substitute for tests, code review, or engineering judgment.',
            'SpecRow separates current truth from proposed work. project.md and .specrow/specs describe the project and accepted behavior; each directory in .specrow/changes stages a proposal, tasks, status, and intended spec updates.',
            'The lifecycle adds explicit boundaries: inspect, propose, review, build, revise or accept, then archive. Accept records the user decision. Archive is the separate operation that integrates staged spec updates into current specs.',
            'SDD helps when requirements, risks, or multiple contributors make implicit context expensive. For tiny or exploratory work, keep the specification proportional: record only the decisions and checks needed to make the result understandable and verifiable.',
          ],
        },
      ],
    },
  },
  ru: {
    manifesto: {
      eyebrow: 'Манифест',
      title: 'SpecRow',
      description: 'Agent-first процесс спецификаций, где язык пользователя = языку проекта, агента, шаблонов и сообщений жизненного цикла.',
      blocks: [
        { id: 'language', type: 'section', heading: '1. Язык пользователя прежде всего', paragraphs: ['Контекст проекта, шаблоны и lifecycle-сообщения используют выбранный язык проекта. Отсутствующий ресурс вызывает понятную ошибку, а не скрытый fallback на английский.'] },
        { id: 'vocabulary', type: 'section', heading: '2. Общий словарь', paragraphs: ['project.md фиксирует канонические названия продуктов, сокращения и доменные термины, чтобы люди и агенты использовали один словарь.'] },
        { id: 'shared-model', type: 'list-section', heading: '3. Одна модель, два горизонта', intro: 'SpecRow разделяет принятую правду и предлагаемую работу:', items: ['Актуальные specs описывают принятое поведение.', 'Change хранит proposal, tasks, status и подготовленные обновления specs.'], outro: 'Archive объединяет их только после явной приёмки.' },
        { id: 'staged-changes', type: 'section', heading: '4. Сначала изменение', paragraphs: ['Фича, исправление или улучшение начинается как именованный change. Реализацию можно доработать или принять; только archive интегрирует staged specs в актуальную правду.'] },
        { id: 'derived-tasks', type: 'section', heading: '5. Трассируемые задачи', paragraphs: ['Tasks должны быть связаны с proposal и его acceptance criteria. Если план не объясняет реализацию и проверку ожидаемого поведения, proposal нужно доработать.'] },
        { id: 'structural-validation', type: 'section', heading: '6. Структурная валидация', paragraphs: ['Автоматизация проверяет файлы, обязательные секции, структуру status, placeholder-ы и топологию локалей. Она ловит структурный drift; смысл, реализуемость и риски всё равно проверяют люди и агенты.'] },
        { id: 'explicit-decisions', type: 'section', heading: '7. Явные решения', paragraphs: ['Агент не должен молча принимать существенные архитектурные, UX, data или security-решения. Решение нужно зафиксировать либо остановиться и запросить пользователя.'] },
        { id: 'tooling', type: 'section', heading: '8. Инструменты обслуживают контракт', paragraphs: ['CLI и MCP дают одинаковые lifecycle-операции, чтобы агенты, люди и CI предсказуемо проверяли и продвигали работу. Успех tool-вызова не заменяет валидацию или приёмку.'] },
        { id: 'human-control', type: 'section', heading: '9. Контроль у человека', paragraphs: ['Граница приёмки принадлежит пользователю. SpecRow может подготовить, проверить и записать работу, но не может вывести согласие из контекста или архивировать непринятый change.'] },
      ],
    },
    instructions: {
      eyebrow: 'Старт',
      title: 'Установка и первый запуск',
      description: 'Выберите поддерживаемого агента, установите полный плагин и инициализируйте нужный проект.',
      blocks: [
        { id: 'sdd-introduction',
          type: 'section',
          heading: 'Что такое Spec-Driven Development?',
          paragraphs: [
            [
              'Если вы ранее не сталкивались со SDD (Spec-Driven Development), прочтите ',
              { text: 'эту статью', page: 'sd-development' },
              '. Это поможет разобраться с основами методики. После этого напишите небольшой проект, используя SpecRow, чтобы потренироваться.',
            ],
          ],
        },
        { id: 'requirements', type: 'list-section', heading: 'Требования', intro: 'Для полного плагина потребуются:', items: ['Node.js 20 или новее, доступный через PATH.', 'Агент, который загружает и Agent Skills, и локальные stdio MCP-серверы.', 'Доступ к файловой системе целевого проекта.'], outro: 'Установка только SpecRow CLI не регистрирует плагин в агенте.' },
        { id: 'choose-client', type: 'list-section', heading: 'Выберите агента', intro: 'Поддержка установки разделена явно:', items: ['GitHub Copilot CLI: прямая установка из GitHub одной командой.', 'GitHub Copilot в VS Code: установка из репозитория через интерфейс Plugins.', 'Kiro IDE: импорт репозитория как custom Power.', 'Codex desktop/CLI и Cursor: совместимые пакеты уже входят в репозиторий, но простой публичный путь зависит от публикации в marketplace.', 'Hermes Agent, OpenClaw, Grok Bot и NanoClaw: совместимы с форматом Agent Plugins, но пока не проверены командой SpecRow.'], outro: 'Эти пути описаны разработчиками клиентов, но SpecRow пока не запускает клиентские end-to-end тесты установки.' },
        { id: 'install-copilot', exampleKind: 'cli', type: 'command-section', heading: 'GitHub Copilot CLI — рекомендуемый путь', intro: 'Установите полный плагин из репозитория одной командой:', commands: ['copilot plugin install nektobit/SpecRow'], outro: 'Пакет содержит и skill SpecRow, и MCP-сервер. Это не то же самое, что npm i -g specrow: npm-команда устанавливает только отдельный CLI.' },
        { id: 'install-vscode', type: 'code-section', heading: 'GitHub Copilot в VS Code', intro: 'Откройте Command Palette, выполните “Chat: Install Plugin From Source” и укажите:', code: 'https://github.com/nektobit/SpecRow', outro: 'Проверьте источник в окне доверия, установите пакет и начните новый чат, чтобы клиент обнаружил skill и MCP tools.' },
        { id: 'install-kiro', type: 'code-section', heading: 'Kiro IDE — экспериментально', intro: 'Откройте Powers → Add Custom Power → Import power from GitHub, укажите репозиторий и нажмите Install:', code: 'https://github.com/nektobit/SpecRow', outro: 'Kiro документирует этот путь Agent Plugins, но SpecRow пока не выполнил собственный smoke-тест клиента Kiro.' },
        { id: 'marketplace-clients', type: 'list-section', heading: 'Codex и Cursor', intro: 'В репозитории есть переносимый пакет и Codex manifest, но публичная установка одной кнопкой требует публикации:', items: ['Codex desktop и Codex CLI — поддерживаемые и документированные цели SpecRow после публикации в каталоге. Codex IDE extension пока не поддержан и не проверен SpecRow.', 'Cursor: установка через Customize или marketplace станет доступна после публикации SpecRow. Доступность может зависеть от тарифа Cursor или политики администратора. MCP-only deeplink не является полной установкой — он не добавляет skill.'], outro: 'Пока публикации нет, нельзя показывать marketplace-кнопку как рабочую.' },
        { id: 'unsupported-clients', type: 'list-section', heading: 'Пока нет установки единым пакетом', intro: 'Не обещайте автоматическую установку плагина SpecRow для:', items: ['Claude Code: у него собственные manifest и формат marketplace.', 'Gemini CLI: требуется manifest расширения Gemini.', 'Windsurf/Cascade: официально описана только раздельная настройка Skill и MCP.'], outro: 'Адаптеры можно добавить позже. Сейчас эти клиенты не входят в поддерживаемый простой путь установки.' },
        { id: 'package-contents', type: 'code-section', heading: 'Что устанавливается', intro: 'Полный пакет SpecRow содержит:', code: 'plugin.json\nmcp.json\n.codex-plugin/plugin.json\n.mcp.json\nskills/specrow/SKILL.md\nruntime/specrow-mcp.cjs', outro: 'Agent Plugins стандартизует переносимый пакет, но обнаружением и установкой управляет конкретный клиент.' },
        { id: 'first-check', exampleKind: 'intent', type: 'section', heading: 'Первая проверка', paragraphs: ['Попросите агента проверить SpecRow для нужного проекта. Skill начинает с project status, затем при необходимости инициализирует и валидирует workspace.'], commands: ['Проверь SpecRow для этого проекта'] },
        { id: 'project-selection', type: 'section', heading: 'Выбор правильного проекта', paragraphs: ['Если клиент не передаёт MCP roots или несколько roots остаются неоднозначными, агент обязан передать абсолютный projectRoot. Если среди нескольких roots есть ровно один инициализированный SpecRow workspace, сервер выберет его автоматически. Каталог установки плагина никогда не считается пользовательским workspace.'] },
        { id: 'first-workflow', exampleKind: 'intent', type: 'section', heading: 'Первый workflow', paragraphs: ['Неясную идею сначала исследуйте без создания change. Когда результат понятен, попросите подготовить proposal. Рискованные изменения проверяйте до реализации.'], commands: ['specrow explore Обсуди вход без пароля', 'specrow proposal Добавь вход без пароля', 'specrow review <change-name>'] },
        { id: 'acceptance-boundary', exampleKind: 'intent', type: 'section', heading: 'Граница приёмки', paragraphs: ['Build останавливается в состоянии built. Accept требует явного решения пользователя и только фиксирует приёмку. Archive — отдельный шаг: он интегрирует staged specs и переносит принятый change в историю.'], commands: ['specrow build <change-name>', 'specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'cli-automation', exampleKind: 'cli', type: 'section', heading: 'Автоматизация через CLI', paragraphs: ['Вне агентной сессии установите и используйте CLI для CI, скриптов или прямой автоматизации.'], commands: ['npm i -g specrow', 'specrow init --language ru --estimation', 'specrow validate'] },
      ],
    },
    workflow: {
      eyebrow: 'Workflow',
      title: 'От предложения к приемке',
      description: 'MVP-процесс: explore, proposal, review, build, revise при необходимости, accept и archive.',
      blocks: [
        { id: 'states', type: 'section', heading: 'Состояния жизненного цикла', paragraphs: ['У каждого изменения есть status.yml с одним состоянием: proposed, reviewed, built, revision-needed, accepted или archived. Там же хранятся review tracking, явная приемка, createdAt и updatedAt.'] },
        { id: 'explore', type: 'section', heading: '0. Explore', paragraphs: ['Explore — это исследование до proposal. Агент читает статус и контекст проекта, разбирает варианты и риски, задает точные вопросы и не создает директорию изменения или lifecycle-состояние.'] },
        { id: 'proposal', type: 'section', heading: '1. Proposal', paragraphs: ['Агент превращает намерение пользователя в конкретное предложение и каркас задач. Создается директория .specrow/changes/<change-name>/, состояние изменения: proposed.'] },
        { id: 'review', type: 'section', heading: '2. Review', paragraphs: ['Review рекомендуется по умолчанию и обязателен только для рискованных изменений. Он проверяет готовность предложения, слабые критерии приемки, обязательные файлы и обязательные секции. Review не является приемкой.'] },
        { id: 'build', type: 'section', heading: '3. Build', paragraphs: ['Build читает proposal, tasks, status и предупреждения об активных изменениях. Он реализует ограниченный scope и переводит изменение в built. Build не должен архивировать, принимать или обновлять спецификации как финальную правду.'] },
        { id: 'revise', type: 'section', heading: '4. Revise', paragraphs: ['Если пользователь просит изменения после build, состояние становится revision-needed. Доработка может менять предложение, задачи, реализацию или evidence проверки, но все еще не принимает изменение.'] },
        { id: 'accept-and-archive', type: 'section', heading: '5. Accept и Archive', paragraphs: ['Приёмка требует явного решения пользователя и только записывает его в status.yml. Archive выполняется отдельно: копирует staged spec updates в .specrow/specs/ и перемещает принятый change в .specrow/archive/. Существующие архивные папки не перезаписываются.'] },
      ],
    },
    'agent-commands': {
      eyebrow: 'Работа с агентом',
      title: 'Намерения, а не CLI',
      description: 'Короткие фразы SpecRow — запросы workflow. Агент сопоставляет их с MCP tools; это не буквальные CLI-команды.',
      blocks: [
        { id: 'intent-contract', type: 'section', heading: 'Контракт намерений', paragraphs: ['Фраза вроде specrow build просит агента выполнить соответствующий workflow через MCP. Это не shell-команда.'] },
        { id: 'explore', exampleKind: 'intent', type: 'section', heading: 'specrow explore', paragraphs: ['Использует project status, context и validation для исследования только для чтения. Не создаёт change и не реализует код.'], commands: ['specrow explore Обсуди вход без пароля'] },
        { id: 'proposal', exampleKind: 'intent', type: 'section', heading: 'specrow proposal', paragraphs: ['Создаёт staged proposal.md, tasks.md и status.yml. Не разрешает реализацию.'], commands: ['specrow proposal Добавь вход без пароля'] },
        { id: 'review', exampleKind: 'intent', type: 'section', heading: 'specrow review', paragraphs: ['Проверяет готовность до реализации. Обязателен для security, privacy, permissions, migrations, destructive behavior, public contracts, automation, architecture, localization и lifecycle.'], commands: ['specrow review <change-name>'] },
        { id: 'build', exampleKind: 'intent', type: 'section', heading: 'specrow build', paragraphs: ['Загружает контекст, проверяет готовность, реализует только предложенный scope, проверяет результат и фиксирует built без приёмки.'], commands: ['specrow build <change-name>'] },
        { id: 'revise', exampleKind: 'intent', type: 'section', heading: 'specrow revise', paragraphs: ['Фиксирует необходимость доработки. Работу и проверки нужно завершить до приёмки.'], commands: ['specrow revise <change-name>'] },
        { id: 'accept-and-archive', exampleKind: 'intent', type: 'section', heading: 'specrow accept и archive', paragraphs: ['Accept требует явного решения и фиксирует приёмку. Archive отдельно интегрирует staged specs и переносит принятый change в историю.'], commands: ['specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'stop-points', type: 'section', heading: 'Обязательные остановки', paragraphs: ['Агент останавливается после proposal без запроса реализации, при блокирующих validation/lifecycle errors и перед accept до явной приёмки результата. Зелёные тесты не являются приёмкой.'] },
      ],
    },
    'mcp-server': {
      eyebrow: 'Справочник',
      title: 'MCP-сервер',
      description: 'Встроенный stdio-сервер предоставляет request-scoped операции и безопасно выбирает workspace проекта для каждого вызова.',
      blocks: [
        { id: 'runtime', type: 'section', heading: 'Встроенный runtime', paragraphs: ['Плагин запускает runtime/specrow-mcp.cjs как управляемый агентом stdio-процесс. Каталог установки не считается пользовательским проектом.'] },
        { id: 'workspace-selection', type: 'section', heading: 'Выбор workspace', paragraphs: ['Каждый workspace-dependent tool принимает необязательный абсолютный projectRoot. Выбор идёт через явный валидный root, единственный файловый root клиента, единственный инициализированный SpecRow workspace среди нескольких roots или startup root прямого CLI MCP mode.'] },
        { id: 'connection-check', exampleKind: 'mcp', type: 'section', heading: 'Проверка подключения', paragraphs: ['Начните с project status. Подтвердите возвращённый projectRoot перед любым изменением файлов.'], commands: ['specrow_project_status'] },
        { id: 'inspect-tools', exampleKind: 'mcp', type: 'section', heading: 'Inspect tools', paragraphs: ['Читают состояние проекта, активные changes, результаты validation и agent-readable context.'], commands: ['specrow_project_status', 'specrow_status', 'specrow_context', 'specrow_validate'] },
        { id: 'setup-tools', exampleKind: 'mcp', type: 'section', heading: 'Setup и import tools', paragraphs: ['Инициализация и миграция могут записывать файлы и требуют проверенного project root.'], commands: ['specrow_init', 'specrow_migrate'] },
        { id: 'lifecycle-tools', exampleKind: 'mcp', type: 'section', heading: 'Lifecycle tools', paragraphs: ['Создают и проверяют proposals, управляют состоянием реализации, фиксируют accept и архивируют принятую работу.'], commands: ['specrow_create_proposal', 'specrow_review', 'specrow_build_start', 'specrow_build_finish', 'specrow_revise', 'specrow_accept', 'specrow_archive'] },
        { id: 'result-contract', type: 'section', heading: 'Контракт результата', paragraphs: ['Tools возвращают success/failure envelope. Для specrow_validate success означает завершение вызова; всегда проверяйте valid и severity issues.'] },
        { id: 'errors', type: 'section', heading: 'Ошибки', paragraphs: ['Ожидаемые ошибки: INVALID_PROJECT_ROOT, UNSAFE_PATH, INVALID_STATE, VALIDATION_FAILED, MISSING_LANGUAGE_RESOURCE, NOT_FOUND и INTERNAL_ERROR. Исправьте условие ошибки и не подставляйте каталог плагина вместо project root.'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI-справочник',
      description: 'CLI повторяет lifecycle SpecRow для CI, скриптов и ручной диагностики вне агентной сессии.',
      blocks: [
        { id: 'setup', exampleKind: 'cli', type: 'section', heading: 'Инициализация', paragraphs: ['Создайте .specrow workspace и выберите язык шаблонов. --estimation добавляет запрос оценки после создания proposal, а --force заново записывает config.yml, поэтому повторите нужный язык и настройку estimation.'], commands: ['specrow init --language ru', 'specrow init --language ru --estimation', 'specrow init --language ru --estimation --force'] },
        { id: 'migration', exampleKind: 'cli', type: 'section', heading: 'Миграция', paragraphs: ['Импортируйте OpenSpec, SpecKit или папку документации. CLI разрешает внешний источник, а MCP ограничивает его выбранным workspace. Сначала используйте dry run; --source-root задаёт корень поиска, --language применяется при инициализации, --force разрешает перезапись целевых файлов.'], commands: ['specrow migrate openspec --dry-run', 'specrow migrate speckit --source-root <path>', 'specrow migrate <docs-folder> --language ru --force'] },
        { id: 'planning', exampleKind: 'cli', type: 'section', heading: 'Планирование и проверка', paragraphs: ['Создайте change, проверьте структуру, выполните review и получите контекст или список активных изменений.'], commands: ['specrow proposal <change-name> --review required', 'specrow validate [change-name]', 'specrow review <change-name>', 'specrow status [change-name]', 'specrow context [change-name]', 'specrow list'] },
        { id: 'implementation', exampleKind: 'cli', type: 'section', heading: 'Реализация', paragraphs: ['build-start проверяет готовность, но не меняет lifecycle state. build-finish фиксирует завершение реализации; revise возвращает изменение на доработку.'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>'] },
        { id: 'acceptance', exampleKind: 'cli', type: 'section', heading: 'Приёмка и архив', paragraphs: ['accept требует подтверждения --yes и только записывает явную приёмку. archive отдельной командой применяет staged spec updates к актуальным specs и переносит change в archive. Для принятия исправленного revision-needed change подтвердите завершение follow-up work.'], commands: ['specrow accept <change-name> --yes', 'specrow accept <change-name> --yes --follow-up-work-completed', 'specrow archive <change-name>'] },
        { id: 'maintenance', exampleKind: 'cli', type: 'section', heading: 'Обслуживание', paragraphs: ['Проверяйте полноту runtime-локалей и документации либо запускайте локальный stdio MCP-сервер для агента.'], commands: ['specrow locales validate', 'specrow mcp [project-path]'] },
      ],
    },
    migration: {
      eyebrow: 'Миграция',
      title: 'Переход на актуальный SpecRow',
      description: 'Безопасно импортируйте существующие артефакты спецификаций и замените старые клиентские интеграции переносимым Agent Plugin.',
      blocks: [
        { id: 'choose-path', type: 'section', heading: 'Выберите сценарий', paragraphs: ['Миграция контента переносит артефакты OpenSpec, SpecKit или папки документации в .specrow. Обновление плагина заменяет прежнюю модель установки под конкретный клиент. Это разные задачи, их можно выполнять независимо.'] },
        { id: 'safe-order', exampleKind: 'cli', type: 'section', heading: 'Безопасный порядок миграции', paragraphs: ['Подтвердите целевой workspace, определите источник и просмотрите план. Миграция — явная граница доверия: она записывает импортированный материал прямо в актуальные specs, поэтому до запуска без dry-run получите согласие пользователя. Затем мигрируйте без force, провалидируйте результат и разберите все предупреждения.'], commands: ['specrow migrate <source> --dry-run', 'specrow migrate <source>', 'specrow validate'] },
        { id: 'source-mapping', type: 'section', heading: 'Как переносятся источники', paragraphs: ['Спеки OpenSpec становятся актуальными specs, а активные changes сохраняют исходные артефакты. Feature-папки SpecKit становятся активными changes. Обычная папка документации копируется в импортированные specs. Архивы сохраняются как история.'] },
        { id: 'safety-boundaries', type: 'section', heading: 'Границы безопасности', paragraphs: ['Для MCP-миграции источник должен находиться внутри выбранного проекта и не может лежать в .specrow. Миграция копирует данные, но не удаляет, не перемещает и не переписывает источник. Целевые файлы не перезаписываются без явного force.'] },
        { id: 'semantic-review', type: 'section', heading: 'Нужна смысловая проверка', paragraphs: ['Автоконвертация не доказывает эквивалентность смысла или корректность acceptance criteria. До миграции проверьте заголовки, требования, lifecycle state, ссылки и предупреждения. После импорта снова запустите валидацию, а исправления оформляйте отдельными changes.'] },
        { id: 'legacy-upgrade', type: 'section', heading: 'Обновление старых интеграций', paragraphs: ['Теперь Agent Plugin поставляет вместе plugin.json, mcp.json, skill specrow и MCP runtime. Старые сгенерированные команды, rules, workflows и вручную добавленные MCP-записи больше не каноничны. SpecRow не удаляет их автоматически: они могут содержать правки пользователя. Сравнивайте и удаляйте их явно только после проверки владельца и активных клиентов.'] },
      ],
    },
    templates: {
      eyebrow: 'Шаблоны',
      title: 'Встроенные файлы',
      description: 'SpecRow генерирует небольшой набор локализованных Markdown-файлов вместо большой spec-системы.',
      blocks: [
        { id: 'workspace-layout', type: 'code-section', heading: 'Структура .specrow', intro: 'Инициализация создаёт это рабочее пространство.', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml хранит версию формата workspace, язык проекта и необязательную настройку estimation.' },
        { id: 'project-context', type: 'section', heading: 'project.md', paragraphs: ['project.md фиксирует назначение проекта, рабочий язык, доменный словарь, архитектурные заметки, ограничения и практики проверки. Агенты читают его перед созданием или ревизией встроенных файлов.'] },
        { id: 'accepted-specs', type: 'section', heading: 'Спецификации', paragraphs: ['Specs описывают принятое поведение: назначение, текущее поведение, требования, ограничения, решения и проверки. Обычные changes обновляют их только через accept и последующий archive. Явная миграция — исключение: одобренные исходные материалы импортируются напрямую и требуют проверки как граница доверия.'] },
        { id: 'staged-proposal', type: 'section', heading: 'proposal.md', paragraphs: ['Proposal описывает предполагаемое изменение: summary, problem, proposed change, scope, out of scope, user impact, risks, decisions, acceptance criteria и planned spec updates.'] },
        { id: 'tasks-and-status', exampleKind: 'cli', type: 'section', heading: 'tasks.md', paragraphs: ['Tasks делит работу на implementation, verification, documentation и acceptance gate. Шаблон напоминает агенту, что build заканчивается revise или accept.'], commands: ['specrow revise', 'specrow accept'] },
      ],
    },
    localization: {
      eyebrow: 'Локализация',
      title: 'Язык проекта',
      description: 'Поле language в .specrow/config.yml управляет встроенными шаблонами и lifecycle-сообщениями.',
      blocks: [
        { id: 'config', type: 'code-section', heading: 'Config', intro: 'MVP-конфиг намеренно мал.', code: 'version: 1\nlanguage: ru', outro: 'Поддерживаемые встроенные языки: en, ru, es и zh-CN.' },
        { id: 'localized-resources', type: 'section', heading: 'Что использует language', paragraphs: ['CLI использует language для project.md, specs, proposals, tasks и lifecycle/status-сообщений. MCP-workflow используют тот же язык при создании или ревизии встроенных файлов.'] },
        { id: 'no-fallback', type: 'section', heading: 'Без silent fallback', paragraphs: ['Если запрошенный язык, шаблон или сообщение отсутствует, SpecRow останавливается с понятной ошибкой. Он не должен молча генерировать английские файлы для неанглийского проекта.'] },
        { id: 'supported-languages', exampleKind: 'cli', type: 'section', heading: 'Добавление языка', paragraphs: ['Добавьте язык в runtime registry, набор README, контент сайта и shell-сообщения. Подготовьте все маркеры шаблонов, placeholder-ы сообщений, ID страниц и review digest. Язык готов только после успешной locale validation и тестов.'], commands: ['npm run locale:validate'] },
        { id: 'runtime-contract', exampleKind: 'cli', type: 'section', heading: 'Изменение текста', paragraphs: ['Для страниц сайта исходной локалью объявлен английский. Измените источник, поднимите ревизию страницы, перенесите тот же смысл во все локали, затем обновите content digest и reviewed source digest каждого перевода. Runtime-сообщения сохраняют одинаковые placeholder-ы, а секции шаблонов — смысловые маркеры.'], commands: ['npm run locale:validate', 'npm run typecheck', 'npm run test'] },
        { id: 'site-contract', exampleKind: 'cli', type: 'section', heading: 'Удаление текста', paragraphs: ['Удалите неиспользуемый текст из каждой локали и читающего его кода. Не полагайтесь на английский fallback. Сохраняйте опубликованные ID секций; при необходимой замене добавьте anchor alias для старых ссылок. Digests находят непроверенные правки, но смысловую эквивалентность по-прежнему подтверждает человек.'], commands: ['npm run locale:validate'] },
        { id: 'vocabulary', type: 'section', heading: 'Доменные термины', paragraphs: ['Используйте project.md, чтобы фиксировать слова, которые не нужно переводить, канонические названия продуктов, сокращения и доменный словарь. Это делает локализацию предсказуемой и не прячет бизнес-термины.'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: 'Валидация',
      title: 'Валидация и lifecycle-правила',
      description: 'Валидация защищает workflow от отсутствующих файлов, неполных секций, слабых предложений и небезопасного архива.',
      blocks: [
        { id: 'validation', exampleKind: 'cli', type: 'section', heading: 'Валидация', paragraphs: ['Валидация проверяет project.md и активные изменения. Для каждого изменения проверяются proposal.md, tasks.md, обязательные секции и структура status.yml. Отсутствующие файлы и секции являются ошибками.'], commands: ['specrow validate [change-name]'] },
        { id: 'review-readiness', exampleKind: 'cli', type: 'section', heading: 'Review warnings', paragraphs: ['Review добавляет readiness-проверки предложения. Пустые acceptance criteria или текст приемки без checklist являются предупреждениями, чтобы агент мог уточнить требования до реализации.'], commands: ['specrow review <change-name>'] },
        { id: 'multiple-changes', exampleKind: 'cli', type: 'section', heading: 'Несколько активных изменений', paragraphs: ['Status и list показывают все активные changes. Если открыто больше одного, list возвращает общее предупреждение проверить вероятные конфликты specs или workflow; конфликты на уровне файлов не вычисляются.'], commands: ['specrow status', 'specrow list'] },
        { id: 'acceptance-gate', exampleKind: 'cli', type: 'section', heading: 'Граница приёмки', paragraphs: ['Приёмка требует явного решения пользователя. В CLI оно подтверждается флагом --yes, а MCP-клиент передаёт соответствующий признак явной приёмки. Archive блокируется, пока это решение не записано в состоянии accepted.'], commands: ['specrow accept <change-name> --yes'] },
        { id: 'limits', type: 'section', heading: 'Ограничения и безопасность архива', paragraphs: ['Валидация доказывает структуру, но не корректность, полноту, безопасность или смысловую эквивалентность переводов. Archive отдельно копирует staged spec updates только после приёмки, сохраняет change как историю и отказывается перезаписывать существующее имя архива.'] },
      ],
    },
    'sd-development': {
      eyebrow: 'Доп. информация',
      title: 'SD разработка',
      description: 'Spec-Driven Development и роль SpecRow в разработке через спецификации.',
      blocks: [
        { id: 'working-definition',
          type: 'section',
          heading: 'Что такое Spec-Driven Development?',
          paragraphs: [
            'Spec-Driven Development (SDD) — подход, в котором согласованная спецификация направляет реализацию и проверку. В ней описываются наблюдаемое поведение, ограничения, решения и подтверждение готовности.',
            '«Сначала спецификация» не означает, что до начала работы нужно угадать каждую деталь реализации. Важно зафиксировать намерение и критерии приёмки до изменения кода, а если реализация открыла лучшее решение — обновить proposal.',
            'Это особенно полезно при работе с кодовыми агентами: долгоживущий контекст проекта сокращает повторные объяснения, а proposal конкретного change удерживает сессию в проверяемых границах. Спецификация дополняет, но не заменяет тесты, code review и инженерные решения.',
            'SpecRow разделяет актуальную правду и предлагаемую работу. project.md и .specrow/specs описывают проект и принятое поведение; каждая папка в .specrow/changes хранит proposal, tasks, status и подготовленные обновления specs.',
            'Lifecycle задаёт явные границы: изучить, предложить, проверить, реализовать, отправить на доработку или принять, затем архивировать. accept фиксирует решение пользователя. archive отдельно применяет подготовленные обновления к актуальным specs.',
            'SDD особенно полезен, когда неявный контекст дорог из-за требований, рисков или нескольких участников. Для маленьких и исследовательских задач спецификация должна быть соразмерной: достаточно решений и проверок, которые делают результат понятным и проверяемым.',
          ],
        },
      ],
    },
  },
  es: {
    manifesto: {
      eyebrow: 'Manifiesto',
      title: 'SpecRow',
      description: 'Proceso agent-first de especificaciones, donde el idioma del usuario = el idioma del proyecto, del agente, de las plantillas y de los mensajes del ciclo de vida.',
      blocks: [
        { id: 'language', type: 'section', heading: '1. Idioma del usuario primero', paragraphs: ['El contexto, las plantillas y los mensajes lifecycle usan el idioma elegido para el proyecto. Un recurso ausente produce un error claro en vez de fallback silencioso al inglés.'] },
        { id: 'vocabulary', type: 'section', heading: '2. Vocabulario compartido', paragraphs: ['project.md registra nombres canónicos, siglas y términos de dominio para que personas y agentes compartan vocabulario.'] },
        { id: 'shared-model', type: 'list-section', heading: '3. Un modelo, dos horizontes', intro: 'SpecRow separa la verdad aceptada del trabajo propuesto:', items: ['Las specs actuales describen comportamiento aceptado.', 'Un cambio prepara propuesta, tareas, estado y actualizaciones de specs.'], outro: 'Archive solo los une después de una aceptación explícita.' },
        { id: 'staged-changes', type: 'section', heading: '4. Flujo basado en cambios', paragraphs: ['Una funcionalidad, corrección o mejora empieza como cambio con nombre. La implementación puede revisarse o aceptarse; solo archive integra sus specs preparadas en la verdad actual.'] },
        { id: 'derived-tasks', type: 'section', heading: '5. Tareas trazables', paragraphs: ['Las tareas deben remontarse a la propuesta y sus criterios de aceptación. Si el plan no explica cómo implementar y verificar el comportamiento previsto, la propuesta debe revisarse.'] },
        { id: 'structural-validation', type: 'section', heading: '6. Validación estructural', paragraphs: ['La automatización comprueba archivos, secciones obligatorias, forma de status, placeholders y topología de locales. Detecta drift estructural; personas y agentes siguen revisando significado, viabilidad y riesgo.'] },
        { id: 'explicit-decisions', type: 'section', heading: '7. Decisiones explícitas', paragraphs: ['Los agentes no deben tomar en silencio decisiones importantes de arquitectura, UX, datos o seguridad. Registra la decisión o detente para consultar al usuario.'] },
        { id: 'tooling', type: 'section', heading: '8. Las herramientas sirven al contrato', paragraphs: ['CLI y MCP exponen las mismas operaciones lifecycle para que agentes, personas y CI inspeccionen y avancen el trabajo de forma predecible. El éxito de una tool no sustituye validación ni aceptación.'] },
        { id: 'human-control', type: 'section', heading: '9. Control humano', paragraphs: ['El usuario controla el límite de aceptación. SpecRow puede preparar, validar y registrar trabajo, pero no puede inferir aprobación ni archivar cambios no aceptados.'] },
      ],
    },
    instructions: {
      eyebrow: 'Inicio',
      title: 'Instalar y empezar',
      description: 'Elige un agente compatible, instala el plugin completo e inicializa el proyecto previsto.',
      blocks: [
        { id: 'sdd-introduction',
          type: 'section',
          heading: '¿Qué es Spec-Driven Development?',
          paragraphs: [
            [
              'Si nunca has trabajado con SDD (Spec-Driven Development), lee ',
              { text: 'este artículo', page: 'sd-development' },
              '. Te ayudará a entender los fundamentos de la metodología. Después, crea un proyecto pequeño con SpecRow para practicar.',
            ],
          ],
        },
        { id: 'requirements', type: 'list-section', heading: 'Requisitos', intro: 'El plugin completo necesita:', items: ['Node.js 20 o posterior disponible en PATH.', 'Un agente que cargue Agent Skills y servidores MCP stdio locales.', 'Acceso al sistema de archivos del proyecto de destino.'], outro: 'Instalar solo la CLI de SpecRow no registra el plugin en un agente.' },
        { id: 'choose-client', type: 'list-section', heading: 'Elige tu agente', intro: 'El soporte de instalación se indica de forma explícita:', items: ['GitHub Copilot CLI: instalación directa desde GitHub con un comando.', 'GitHub Copilot en VS Code: instalación desde el repositorio en la interfaz Plugins.', 'Kiro IDE: importa el repositorio como Power personalizado.', 'Codex desktop/CLI y Cursor: los paquetes compatibles ya están incluidos, pero la instalación pública sencilla depende de su publicación en el marketplace.', 'Hermes Agent, OpenClaw, Grok Bot y NanoClaw: compatibles con el formato Agent Plugins, pero aún no probados por SpecRow.'], outro: 'Estos caminos están documentados por los proveedores de los clientes, pero SpecRow todavía no ejecuta pruebas end-to-end de instalación específicas de cada cliente.' },
        { id: 'install-copilot', exampleKind: 'cli', type: 'command-section', heading: 'GitHub Copilot CLI — recomendado', intro: 'Instala el plugin completo desde el repositorio con un comando:', commands: ['copilot plugin install nektobit/SpecRow'], outro: 'El paquete contiene tanto la skill de SpecRow como su servidor MCP. No equivale a npm i -g specrow, que solo instala la CLI independiente.' },
        { id: 'install-vscode', type: 'code-section', heading: 'GitHub Copilot en VS Code', intro: 'Abre la paleta de comandos, ejecuta “Chat: Install Plugin From Source” e introduce:', code: 'https://github.com/nektobit/SpecRow', outro: 'Revisa la solicitud de confianza, instala y abre un chat nuevo para que se descubran la skill y las herramientas MCP.' },
        { id: 'install-kiro', type: 'code-section', heading: 'Kiro IDE — experimental', intro: 'Abre Powers → Add Custom Power → Import power from GitHub, introduce el repositorio y selecciona Install:', code: 'https://github.com/nektobit/SpecRow', outro: 'Kiro documenta este camino de Agent Plugins; SpecRow aún no ha completado su propia prueba del cliente Kiro.' },
        { id: 'marketplace-clients', type: 'list-section', heading: 'Codex y Cursor', intro: 'El repositorio incluye el paquete portátil y un manifest de Codex, pero la instalación pública con un clic requiere publicación:', items: ['Codex desktop y Codex CLI son los objetivos compatibles y documentados por SpecRow después de la publicación en el directorio. La extensión Codex para IDE aún no está soportada ni probada por SpecRow.', 'Cursor: instala desde Customize o su marketplace cuando SpecRow esté publicado. La disponibilidad puede depender del plan de Cursor o de la política del administrador. Un deeplink solo de MCP no es una instalación completa porque omite la skill.'], outro: 'Hasta entonces, no presentes un botón de marketplace como si funcionara.' },
        { id: 'unsupported-clients', type: 'list-section', heading: 'Aún sin instalación en un solo paquete', intro: 'No prometas instalación automática de SpecRow para:', items: ['Claude Code, que usa su propio manifest y formato de marketplace.', 'Gemini CLI, que requiere un manifest de extensión Gemini.', 'Windsurf/Cascade, donde solo está documentada la configuración separada de Skill y MCP.'], outro: 'Se podrán añadir adaptadores más adelante. Hoy estos clientes quedan fuera del camino de instalación simple compatible.' },
        { id: 'package-contents', type: 'code-section', heading: 'Qué se instala', intro: 'Un paquete completo de SpecRow contiene:', code: 'plugin.json\nmcp.json\n.codex-plugin/plugin.json\n.mcp.json\nskills/specrow/SKILL.md\nruntime/specrow-mcp.cjs', outro: 'Agent Plugins estandariza el paquete portátil; cada cliente controla su descubrimiento e instalación.' },
        { id: 'first-check', exampleKind: 'intent', type: 'section', heading: 'Primera comprobación', paragraphs: ['Pide al agente que compruebe SpecRow para el proyecto deseado. La skill empieza por el estado del proyecto y después inicializa y valida el workspace cuando sea necesario.'], commands: ['Comprueba SpecRow para este proyecto'] },
        { id: 'project-selection', type: 'section', heading: 'Seleccionar el proyecto correcto', paragraphs: ['Si el cliente no expone raíces MCP o varias raíces siguen siendo ambiguas, el agente debe pasar el projectRoot absoluto. Si entre varias raíces existe un solo workspace SpecRow inicializado, el servidor puede elegirlo automáticamente. El directorio del plugin nunca es un workspace del usuario.'] },
        { id: 'first-workflow', exampleKind: 'intent', type: 'section', heading: 'Primer workflow', paragraphs: ['Explora una idea poco clara sin crear un cambio. Cuando el resultado esperado esté claro, pide una proposal. Revisa el trabajo de riesgo antes de implementarlo.'], commands: ['specrow explore Analiza el acceso sin contraseña', 'specrow proposal Añade acceso sin contraseña', 'specrow review <change-name>'] },
        { id: 'acceptance-boundary', exampleKind: 'intent', type: 'section', heading: 'Límite de aceptación', paragraphs: ['Build termina en estado built. Accept requiere una decisión explícita del usuario y solo registra la aceptación. Archive es un paso separado que integra las specs preparadas y mueve el cambio aceptado al historial.'], commands: ['specrow build <change-name>', 'specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'cli-automation', exampleKind: 'cli', type: 'section', heading: 'Automatización con CLI', paragraphs: ['Fuera de una sesión con agente, instala y usa la CLI para CI, scripts o automatización directa.'], commands: ['npm i -g specrow', 'specrow init --language es --estimation', 'specrow validate'] },
      ],
    },
    workflow: {
      eyebrow: 'Flujo',
      title: 'De propuesta a aceptación',
      description: 'El flujo MVP es explore, proposal, review, build, revise si hace falta, accept y archive.',
      blocks: [
        { id: 'states', type: 'section', heading: 'Estados del ciclo de vida', paragraphs: ['Cada cambio tiene status.yml con un estado: proposed, reviewed, built, revision-needed, accepted o archived. También registra seguimiento de revisión, aceptación explícita, createdAt y updatedAt.'] },
        { id: 'explore', type: 'section', heading: '0. Explore', paragraphs: ['Explore es descubrimiento antes de proposal. El agente lee estado y contexto del proyecto, investiga opciones y riesgos, hace preguntas enfocadas y no crea directorio de cambio ni estado de ciclo de vida.'] },
        { id: 'proposal', type: 'section', heading: '1. Proposal', paragraphs: ['El agente convierte la intención del usuario en una propuesta concreta y un esqueleto de tareas. Esto crea un directorio bajo .specrow/changes/<change-name>/ y deja el cambio en proposed.'] },
        { id: 'review', type: 'section', heading: '2. Review', paragraphs: ['Review se recomienda por defecto y solo es obligatorio para cambios riesgosos. Comprueba preparación de la propuesta, criterios de aceptación débiles, archivos requeridos y secciones requeridas. Review no es aceptación.'] },
        { id: 'build', type: 'section', heading: '3. Build', paragraphs: ['Build lee proposal, tasks, status y advertencias de cambios activos. Implementa el trabajo acotado y marca el cambio como built. Build no debe archivar, aceptar ni actualizar specs como verdad final.'] },
        { id: 'revise', type: 'section', heading: '4. Revise', paragraphs: ['Si el usuario pide cambios después de build, el cambio pasa a revision-needed. El trabajo posterior puede actualizar propuesta, tareas, implementación o evidencia de verificación, pero aún no acepta el cambio.'] },
        { id: 'accept-and-archive', type: 'section', heading: '5. Accept y Archive', paragraphs: ['La aceptación exige una decisión explícita del usuario y solo registra esa decisión en status.yml. Archive es una acción separada: copia las spec updates preparadas a .specrow/specs/ y mueve el cambio aceptado a .specrow/archive/. No sobrescribe carpetas de archivo existentes.'] },
      ],
    },
    'agent-commands': {
      eyebrow: 'Uso con agente',
      title: 'Intenciones, no CLI',
      description: 'Las frases cortas de SpecRow son solicitudes de workflow. El agente las traduce a herramientas MCP; no son comandos CLI literales.',
      blocks: [
        { id: 'intent-contract', type: 'section', heading: 'Contrato de intención', paragraphs: ['Una frase como specrow build pide al agente ejecutar el workflow mediante MCP. No es un comando shell.'] },
        { id: 'explore', exampleKind: 'intent', type: 'section', heading: 'specrow explore', paragraphs: ['Usa estado, contexto y validación para descubrimiento de solo lectura. No crea un cambio ni implementa código.'], commands: ['specrow explore Analiza el acceso sin contraseña'] },
        { id: 'proposal', exampleKind: 'intent', type: 'section', heading: 'specrow proposal', paragraphs: ['Crea proposal.md, tasks.md y status.yml preparados. No autoriza implementación.'], commands: ['specrow proposal Añade acceso sin contraseña'] },
        { id: 'review', exampleKind: 'intent', type: 'section', heading: 'specrow review', paragraphs: ['Comprueba la preparación antes de implementar. Es obligatorio para seguridad, privacidad, permisos, migraciones, comportamiento destructivo, contratos públicos, automatización, arquitectura, localización y lifecycle.'], commands: ['specrow review <change-name>'] },
        { id: 'build', exampleKind: 'intent', type: 'section', heading: 'specrow build', paragraphs: ['Carga contexto, comprueba preparación, implementa solo el alcance propuesto, verifica y registra built sin aceptar.'], commands: ['specrow build <change-name>'] },
        { id: 'revise', exampleKind: 'intent', type: 'section', heading: 'specrow revise', paragraphs: ['Registra que hace falta trabajo adicional. El trabajo y sus comprobaciones deben terminar antes de aceptar.'], commands: ['specrow revise <change-name>'] },
        { id: 'accept-and-archive', exampleKind: 'intent', type: 'section', heading: 'specrow accept y archive', paragraphs: ['Accept requiere una decisión explícita y registra aceptación. Archive integra por separado las specs preparadas y mueve el cambio aceptado al historial.'], commands: ['specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'stop-points', type: 'section', heading: 'Paradas obligatorias', paragraphs: ['El agente se detiene tras proposal sin solicitud de implementación, ante errores bloqueantes y antes de accept hasta la aceptación explícita. Los tests correctos no son aceptación.'] },
      ],
    },
    'mcp-server': {
      eyebrow: 'Referencia',
      title: 'Servidor MCP',
      description: 'El servidor stdio incluido expone operaciones por solicitud y selecciona de forma segura el workspace de cada llamada.',
      blocks: [
        { id: 'runtime', type: 'section', heading: 'Runtime incluido', paragraphs: ['El plugin inicia runtime/specrow-mcp.cjs como proceso stdio gestionado por el agente. El directorio de instalación no es un proyecto del usuario.'] },
        { id: 'workspace-selection', type: 'section', heading: 'Selección del workspace', paragraphs: ['Cada tool dependiente del workspace acepta un projectRoot absoluto opcional. Se usa una raíz explícita válida, la única raíz del cliente, el único workspace SpecRow inicializado entre varias raíces o una raíz de inicio para MCP directo por CLI.'] },
        { id: 'connection-check', exampleKind: 'mcp', type: 'section', heading: 'Comprobar conexión', paragraphs: ['Empieza por project status. Confirma el projectRoot devuelto antes de cualquier mutación.'], commands: ['specrow_project_status'] },
        { id: 'inspect-tools', exampleKind: 'mcp', type: 'section', heading: 'Herramientas de inspección', paragraphs: ['Leen estado, cambios activos, resultados de validación y contexto para agentes.'], commands: ['specrow_project_status', 'specrow_status', 'specrow_context', 'specrow_validate'] },
        { id: 'setup-tools', exampleKind: 'mcp', type: 'section', heading: 'Herramientas de setup e importación', paragraphs: ['Inicialización y migración pueden escribir archivos y requieren un project root verificado.'], commands: ['specrow_init', 'specrow_migrate'] },
        { id: 'lifecycle-tools', exampleKind: 'mcp', type: 'section', heading: 'Herramientas de lifecycle', paragraphs: ['Crean y revisan proposals, controlan implementación, registran aceptación y archivan trabajo aceptado.'], commands: ['specrow_create_proposal', 'specrow_review', 'specrow_build_start', 'specrow_build_finish', 'specrow_revise', 'specrow_accept', 'specrow_archive'] },
        { id: 'result-contract', type: 'section', heading: 'Contrato de resultado', paragraphs: ['En specrow_validate, success indica que la llamada terminó; revisa siempre valid y la severidad de issues.'] },
        { id: 'errors', type: 'section', heading: 'Errores', paragraphs: ['Los fallos esperados incluyen INVALID_PROJECT_ROOT, UNSAFE_PATH, INVALID_STATE, VALIDATION_FAILED, MISSING_LANGUAGE_RESOURCE, NOT_FOUND e INTERNAL_ERROR. Corrige la causa y no uses el directorio del plugin como project root.'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'Referencia CLI',
      description: 'La CLI refleja el lifecycle de SpecRow para CI, scripts y diagnóstico manual fuera de una sesión de agente.',
      blocks: [
        { id: 'setup', exampleKind: 'cli', type: 'section', heading: 'Inicialización', paragraphs: ['Crea el workspace .specrow y elige el idioma. --estimation solicita una estimación tras crear una propuesta; --force vuelve a escribir config.yml, así que repite el idioma y la opción de estimation deseados.'], commands: ['specrow init --language es', 'specrow init --language es --estimation', 'specrow init --language es --estimation --force'] },
        { id: 'migration', exampleKind: 'cli', type: 'section', heading: 'Migración', paragraphs: ['Importa OpenSpec, SpecKit o una carpeta de documentación. CLI permite un origen externo; MCP lo limita al workspace elegido. Empieza con dry run; --source-root fija la raíz de detección, --language se usa al inicializar y --force permite sobrescribir destinos.'], commands: ['specrow migrate openspec --dry-run', 'specrow migrate speckit --source-root <path>', 'specrow migrate <docs-folder> --language es --force'] },
        { id: 'planning', exampleKind: 'cli', type: 'section', heading: 'Planificación e inspección', paragraphs: ['Crea un cambio, valida su estructura, completa la revisión y consulta contexto, estado o cambios activos.'], commands: ['specrow proposal <change-name> --review required', 'specrow validate [change-name]', 'specrow review <change-name>', 'specrow status [change-name]', 'specrow context [change-name]', 'specrow list'] },
        { id: 'implementation', exampleKind: 'cli', type: 'section', heading: 'Implementación', paragraphs: ['build-start comprueba preparación sin cambiar el estado. build-finish registra que la implementación terminó; revise devuelve el cambio para correcciones.'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>'] },
        { id: 'acceptance', exampleKind: 'cli', type: 'section', heading: 'Aceptación y archivo', paragraphs: ['accept requiere --yes y solo registra aceptación explícita. archive aplica por separado las spec updates preparadas a las specs actuales y mueve el cambio al archivo. Para aceptar un cambio revision-needed corregido, confirma el follow-up work.'], commands: ['specrow accept <change-name> --yes', 'specrow accept <change-name> --yes --follow-up-work-completed', 'specrow archive <change-name>'] },
        { id: 'maintenance', exampleKind: 'cli', type: 'section', heading: 'Mantenimiento', paragraphs: ['Valida la cobertura de locales del runtime y la documentación, o inicia el servidor MCP stdio local para un agente.'], commands: ['specrow locales validate', 'specrow mcp [project-path]'] },
      ],
    },
    migration: {
      eyebrow: 'Migración',
      title: 'Migrar Al SpecRow Actual',
      description: 'Importa con seguridad artefactos de especificación existentes y sustituye integraciones antiguas por el Agent Plugin portátil.',
      blocks: [
        { id: 'choose-path', type: 'section', heading: 'Elige el camino', paragraphs: ['La migración de contenido mueve artefactos de OpenSpec, SpecKit o una carpeta de documentación a .specrow. La actualización del plugin reemplaza el modelo anterior específico de cada cliente. Son problemas distintos y pueden resolverse por separado.'] },
        { id: 'safe-order', exampleKind: 'cli', type: 'section', heading: 'Orden seguro de migración', paragraphs: ['Confirma el workspace, detecta el origen y revisa el plan. La migración es un límite de confianza porque escribe el material importado directamente en las specs actuales; obtén aprobación del usuario antes de ejecutarla sin dry-run. Después migra sin force, valida y revisa todos los avisos.'], commands: ['specrow migrate <source> --dry-run', 'specrow migrate <source>', 'specrow validate'] },
        { id: 'source-mapping', type: 'section', heading: 'Cómo se mapean los orígenes', paragraphs: ['Las specs de OpenSpec pasan a ser specs actuales y los cambios activos conservan sus artefactos fuente. Los directorios de features de SpecKit se convierten en cambios activos. Una carpeta de documentación se copia a specs importadas. Los archivos históricos se conservan.'] },
        { id: 'safety-boundaries', type: 'section', heading: 'Límites de seguridad', paragraphs: ['En una migración MCP, el origen debe estar dentro del proyecto seleccionado y fuera de .specrow. La migración copia datos; no elimina, mueve ni reescribe el origen. No sobrescribe destinos existentes sin force explícito.'] },
        { id: 'semantic-review', type: 'section', heading: 'La revisión semántica es obligatoria', paragraphs: ['La conversión automática no demuestra equivalencia de significado ni criterios de aceptación correctos. Antes de migrar, revisa títulos, requisitos, estado lifecycle, enlaces y avisos. Después de importar, valida de nuevo y crea cambios posteriores para cualquier corrección.'] },
        { id: 'legacy-upgrade', type: 'section', heading: 'Actualizar integraciones antiguas', paragraphs: ['El Agent Plugin distribuye juntos plugin.json, mcp.json, el skill specrow y su runtime MCP. Los antiguos comandos, reglas, workflows y entradas MCP generados por cliente ya no son canónicos. SpecRow no los elimina automáticamente porque pueden contener cambios del usuario; compáralos y elimínalos de forma explícita solo después de comprobar propiedad y clientes activos.'] },
      ],
    },
    templates: {
      eyebrow: 'Plantillas',
      title: 'Archivos integrados',
      description: 'SpecRow genera un conjunto pequeño de archivos Markdown localizados en lugar de clonar un sistema grande de specs.',
      blocks: [
        { id: 'workspace-layout', type: 'code-section', heading: 'Estructura .specrow', intro: 'La inicialización crea este workspace.', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml registra la versión del formato, el idioma del proyecto y la preferencia opcional de estimation.' },
        { id: 'project-context', type: 'section', heading: 'project.md', paragraphs: ['project.md registra propósito del proyecto, idioma de trabajo, vocabulario de dominio, notas de arquitectura, restricciones y prácticas de verificación. Los agentes lo leen antes de crear o revisar archivos integrados.'] },
        { id: 'accepted-specs', type: 'section', heading: 'Specs', paragraphs: ['Las specs describen comportamiento aceptado con propósito, estado actual, requisitos, restricciones, decisiones y verificación. Los cambios normales solo las actualizan mediante accept y archive. La migración explícita es la excepción: importa directamente material aprobado y debe revisarse como límite de confianza.'] },
        { id: 'staged-proposal', type: 'section', heading: 'proposal.md', paragraphs: ['Una propuesta describe el cambio previsto: summary, problem, proposed change, scope, out of scope, user impact, risks, decisions, acceptance criteria y spec updates previstos.'] },
        { id: 'tasks-and-status', exampleKind: 'cli', type: 'section', heading: 'tasks.md', paragraphs: ['Tasks divide el trabajo en implementation, verification, documentation y acceptance gate. La plantilla recuerda al agente que build termina con revise o accept.'], commands: ['specrow revise', 'specrow accept'] },
      ],
    },
    localization: {
      eyebrow: 'Localización',
      title: 'Idioma del proyecto',
      description: 'El campo language en .specrow/config.yml controla plantillas integradas y mensajes lifecycle.',
      blocks: [
        { id: 'config', type: 'code-section', heading: 'Config', intro: 'La configuración MVP es intencionalmente pequeña.', code: 'version: 1\nlanguage: es', outro: 'Los idiomas integrados soportados son en, ru, es y zh-CN.' },
        { id: 'localized-resources', type: 'section', heading: 'Qué usa language', paragraphs: ['La CLI usa language para project.md, specs, proposals, tasks y mensajes lifecycle/status. Los workflows MCP usan el mismo idioma al crear o revisar archivos integrados.'] },
        { id: 'no-fallback', type: 'section', heading: 'Sin fallback silencioso', paragraphs: ['Si falta el idioma, plantilla o mensaje solicitado, SpecRow se detiene con un error claro. No debe generar silenciosamente archivos en inglés para un proyecto no inglés.'] },
        { id: 'supported-languages', exampleKind: 'cli', type: 'section', heading: 'Añadir un idioma', paragraphs: ['Añade el idioma al registro runtime, conjunto de README, contenido del sitio y mensajes shell. Proporciona todos los marcadores de plantilla, placeholders, IDs de página y digests de revisión. Solo está completo cuando validación y tests pasan.'], commands: ['npm run locale:validate'] },
        { id: 'runtime-contract', exampleKind: 'cli', type: 'section', heading: 'Cambiar texto', paragraphs: ['El inglés es la locale fuente declarada para el sitio. Cambia la fuente, aumenta la revisión, aplica el mismo significado a todas las locales y actualiza cada content digest y reviewed source digest. Los mensajes runtime conservan placeholders idénticos y las secciones de plantilla sus marcadores semánticos.'], commands: ['npm run locale:validate', 'npm run typecheck', 'npm run test'] },
        { id: 'site-contract', exampleKind: 'cli', type: 'section', heading: 'Eliminar texto', paragraphs: ['Elimina texto sin uso de cada locale y del código lector. No dependas del fallback inglés. Conserva IDs publicados; si uno debe cambiar, añade un alias para que los enlaces antiguos resuelvan. Los digests detectan ediciones sin revisar, pero la equivalencia semántica sigue requiriendo revisión humana.'], commands: ['npm run locale:validate'] },
        { id: 'vocabulary', type: 'section', heading: 'Términos de dominio', paragraphs: ['Usa project.md para registrar palabras que deben quedar sin traducir, nombres canónicos de producto, siglas y vocabulario de dominio. Esto hace predecible la localización sin ocultar términos de negocio.'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: 'Validación',
      title: 'Reglas de validación y lifecycle',
      description: 'La validación protege el flujo de archivos ausentes, secciones incompletas, propuestas débiles y acciones de archivo inseguras.',
      blocks: [
        { id: 'validation', exampleKind: 'cli', type: 'section', heading: 'Validación', paragraphs: ['La validación comprueba project.md y cambios activos. Para cada cambio verifica proposal.md, tasks.md, secciones requeridas y forma de status.yml. Archivos o secciones ausentes son errores.'], commands: ['specrow validate [change-name]'] },
        { id: 'review-readiness', exampleKind: 'cli', type: 'section', heading: 'Advertencias de review', paragraphs: ['Review añade comprobaciones de preparación de la propuesta. Acceptance criteria vacíos o texto de aceptación sin checklist son advertencias para que el agente pida aclaración antes de implementar.'], commands: ['specrow review <change-name>'] },
        { id: 'multiple-changes', exampleKind: 'cli', type: 'section', heading: 'Varios cambios activos', paragraphs: ['Status y list muestran todos los cambios activos. Si hay más de uno, list emite un aviso genérico para revisar posibles conflictos de specs o workflow; no calcula conflictos por archivo.'], commands: ['specrow status', 'specrow list'] },
        { id: 'acceptance-gate', exampleKind: 'cli', type: 'section', heading: 'Límite de aceptación', paragraphs: ['La aceptación exige una decisión explícita del usuario. En CLI se confirma con --yes; un cliente MCP pasa la entrada equivalente. Archive queda bloqueado hasta que el estado accepted registre esa decisión.'], commands: ['specrow accept <change-name> --yes'] },
        { id: 'limits', type: 'section', heading: 'Límites y seguridad de archive', paragraphs: ['La validación demuestra estructura, no corrección, completitud, seguridad ni paridad semántica entre traducciones. Archive copia por separado las spec updates solo tras aceptación, conserva el cambio como historial y rechaza un directorio archivado con el mismo nombre.'] },
      ],
    },
    'sd-development': {
      eyebrow: 'Más información',
      title: 'Desarrollo SD',
      description: 'Spec-Driven Development y cómo SpecRow lo aplica en workflows con agentes.',
      blocks: [
        { id: 'working-definition',
          type: 'section',
          heading: '¿Qué es Spec-Driven Development?',
          paragraphs: [
            'Spec-Driven Development (SDD) es una forma de trabajo en la que una especificación acordada guía la implementación y la verificación. Describe comportamiento observable, restricciones, decisiones y evidencia de finalización.',
            '“Primero la spec” no significa adivinar cada detalle de implementación antes de aprender. Significa explicitar intención y criterios de aceptación antes de cambiar código, y revisar la propuesta si la implementación revela una decisión mejor.',
            'Es especialmente útil con agentes de código: el contexto duradero del proyecto reduce explicaciones repetidas y una propuesta acotada mantiene cada sesión enfocada y revisable. La spec complementa, no sustituye, tests, code review ni criterio técnico.',
            'SpecRow separa la verdad actual del trabajo propuesto. project.md y .specrow/specs describen el proyecto y el comportamiento aceptado; cada directorio de .specrow/changes prepara una propuesta, tareas, estado y actualizaciones de specs.',
            'El lifecycle añade límites explícitos: inspeccionar, proponer, revisar, implementar, corregir o aceptar y después archivar. accept registra la decisión del usuario. archive integra por separado las actualizaciones preparadas en las specs actuales.',
            'SDD ayuda cuando requisitos, riesgos o varios colaboradores hacen costoso el contexto implícito. En trabajo pequeño o exploratorio, mantén la spec proporcional: registra solo decisiones y comprobaciones necesarias para entender y verificar el resultado.',
          ],
        },
      ],
    },
  },
  'zh-CN': {
    manifesto: {
      eyebrow: '宣言',
      title: 'SpecRow',
      description: 'Agent-first 规格流程，其中用户语言 = 项目、代理、模板和生命周期消息的语言。',
      blocks: [
        { id: 'language', type: 'section', heading: '1. 用户语言优先', paragraphs: ['项目上下文、模板和生命周期消息使用所选项目语言。资源缺失时明确报错，不会静默回退到英文。'] },
        { id: 'vocabulary', type: 'section', heading: '2. 共享词汇', paragraphs: ['project.md 记录规范产品名、缩写和领域术语，让人和代理使用同一套词汇。'] },
        { id: 'shared-model', type: 'list-section', heading: '3. 一个模型，两个时间范围', intro: 'SpecRow 将已验收事实与拟议工作分开：', items: ['当前 specs 描述已验收行为。', '变更暂存提案、任务、状态和预期 specs 更新。'], outro: '只有在明确验收后，archive 才会合并两者。' },
        { id: 'staged-changes', type: 'section', heading: '4. 变更优先流程', paragraphs: ['功能、修复或改进先作为命名变更存在。实现可以修订或验收；只有 archive 会把暂存 specs 合并到当前事实。'] },
        { id: 'derived-tasks', type: 'section', heading: '5. 可追溯任务', paragraphs: ['任务必须能追溯到提案及其验收标准。如果计划不能说明预期行为如何实现和验证，就需要修订提案。'] },
        { id: 'structural-validation', type: 'section', heading: '6. 结构验证', paragraphs: ['自动化检查文件、必需章节、status 结构、placeholder 和 locale 拓扑。它能发现结构漂移；含义、可行性和风险仍需人和代理评审。'] },
        { id: 'explicit-decisions', type: 'section', heading: '7. 明确决策', paragraphs: ['代理不能静默做出重要的架构、UX、数据或安全决策。应记录决策，或停下来请求用户输入。'] },
        { id: 'tooling', type: 'section', heading: '8. 工具服务于契约', paragraphs: ['CLI 和 MCP 提供相同的生命周期操作，让代理、人和 CI 能够可预测地检查并推进工作。工具调用成功不能替代验证或验收。'] },
        { id: 'human-control', type: 'section', heading: '9. 人工控制', paragraphs: ['验收边界由用户掌控。SpecRow 可以准备、验证和记录工作，但不能推断批准，也不能归档未验收变更。'] },
      ],
    },
    instructions: {
      eyebrow: '开始',
      title: '安装并开始',
      description: '选择受支持的代理，安装完整插件，然后初始化目标项目。',
      blocks: [
        { id: 'sdd-introduction',
          type: 'section',
          heading: '什么是 Spec-Driven Development？',
          paragraphs: [
            [
              '如果你之前没有接触过 SDD (Spec-Driven Development)，请先阅读',
              { text: '这篇文章', page: 'sd-development' },
              '。它会帮助你理解该方法的基础。之后，用 SpecRow 写一个小项目来练习。',
            ],
          ],
        },
        { id: 'requirements', type: 'list-section', heading: '要求', intro: '完整插件需要：', items: ['PATH 中可用的 Node.js 20 或更高版本。', '能够同时加载 Agent Skills 和本地 stdio MCP 服务器的代理客户端。', '能够访问目标项目的文件系统。'], outro: '仅安装 SpecRow CLI 不会在代理中注册插件。' },
        { id: 'choose-client', type: 'list-section', heading: '选择代理', intro: '安装支持范围明确如下：', items: ['GitHub Copilot CLI：一条命令直接从 GitHub 安装。', 'VS Code 中的 GitHub Copilot：通过 Plugins 界面从仓库安装。', 'Kiro IDE：将仓库导入为 custom Power。', 'Codex desktop/CLI 和 Cursor：仓库已包含兼容包，但简单的公开安装方式取决于 marketplace 发布。', 'Hermes Agent、OpenClaw、Grok Bot 和 NanoClaw：格式兼容 Agent Plugins，但尚未经过 SpecRow 测试。'], outro: '这些路径由客户端厂商提供文档，但 SpecRow 尚未运行特定客户端的端到端安装测试。' },
        { id: 'install-copilot', exampleKind: 'cli', type: 'command-section', heading: 'GitHub Copilot CLI — 推荐', intro: '使用一条命令从仓库安装完整插件：', commands: ['copilot plugin install nektobit/SpecRow'], outro: '该包同时包含 SpecRow skill 和 MCP 服务器。这不同于 npm i -g specrow，后者只安装独立 CLI。' },
        { id: 'install-vscode', type: 'code-section', heading: 'VS Code 中的 GitHub Copilot', intro: '打开命令面板，运行“Chat: Install Plugin From Source”，然后输入：', code: 'https://github.com/nektobit/SpecRow', outro: '检查仓库信任提示、完成安装，并新建聊天以发现 skill 和 MCP 工具。' },
        { id: 'install-kiro', type: 'code-section', heading: 'Kiro IDE — 实验性', intro: '打开 Powers → Add Custom Power → Import power from GitHub，输入仓库地址并点击 Install：', code: 'https://github.com/nektobit/SpecRow', outro: 'Kiro 已记录此 Agent Plugins 安装路径；SpecRow 尚未完成自己的 Kiro 客户端冒烟测试。' },
        { id: 'marketplace-clients', type: 'list-section', heading: 'Codex 和 Cursor', intro: '仓库包含可移植包和 Codex manifest，但公开的一键安装仍需先发布：', items: ['Codex desktop 和 Codex CLI 是 SpecRow 在目录发布后支持并记录的目标。Codex IDE 扩展尚未得到 SpecRow 支持或测试。', 'Cursor：SpecRow 上架后可从 Customize 或 marketplace 安装。可用性可能取决于 Cursor 套餐或管理员策略。仅安装 MCP 的 deeplink 会遗漏 skill，因此不是完整安装。'], outro: '上架之前，不应把 marketplace 按钮展示为可用。' },
        { id: 'unsupported-clients', type: 'list-section', heading: '尚不支持单包安装', intro: '不要承诺以下客户端可自动安装 SpecRow：', items: ['Claude Code：使用自己的 plugin manifest 和 marketplace 格式。', 'Gemini CLI：需要 Gemini extension manifest。', 'Windsurf/Cascade：官方仅说明分别配置 Skill 和 MCP。'], outro: '之后可以增加适配器；目前这些客户端不属于受支持的简单安装路径。' },
        { id: 'package-contents', type: 'code-section', heading: '安装内容', intro: '完整 SpecRow 包包含：', code: 'plugin.json\nmcp.json\n.codex-plugin/plugin.json\n.mcp.json\nskills/specrow/SKILL.md\nruntime/specrow-mcp.cjs', outro: 'Agent Plugins 标准化可移植包；具体发现和安装仍由各客户端控制。' },
        { id: 'first-check', exampleKind: 'intent', type: 'section', heading: '首次检查', paragraphs: ['让代理检查目标项目的 SpecRow。skill 会先检查项目状态，并在需要时初始化和验证工作区。'], commands: ['检查这个项目的 SpecRow'] },
        { id: 'project-selection', type: 'section', heading: '选择正确的项目', paragraphs: ['如果客户端未提供 MCP roots，或多个 roots 仍然无法消除歧义，代理必须传入绝对 projectRoot。如果多个 roots 中只有一个已初始化的 SpecRow 工作区，服务器可以自动选择它。插件安装目录绝不是用户工作区。'] },
        { id: 'first-workflow', exampleKind: 'intent', type: 'section', heading: '第一个工作流', paragraphs: ['先在不创建变更的情况下探索不清晰的想法。目标明确后再请求 proposal。高风险工作应在实现前评审。'], commands: ['specrow explore 讨论无密码登录', 'specrow proposal 添加无密码登录', 'specrow review <change-name>'] },
        { id: 'acceptance-boundary', exampleKind: 'intent', type: 'section', heading: '验收边界', paragraphs: ['Build 停在 built 状态。Accept 需要用户明确决定，并且只记录验收。Archive 是单独步骤：它整合暂存规格并把已验收变更移入历史。'], commands: ['specrow build <change-name>', 'specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'cli-automation', exampleKind: 'cli', type: 'section', heading: 'CLI 自动化', paragraphs: ['在代理会话之外安装并使用 CLI 进行 CI、脚本或直接自动化。'], commands: ['npm i -g specrow', 'specrow init --language zh-CN --estimation', 'specrow validate'] },
      ],
    },
    workflow: {
      eyebrow: '工作流',
      title: '从提案到验收',
      description: 'MVP 工作流是 explore、proposal、review、build、必要时 revise、accept 和 archive。',
      blocks: [
        { id: 'states', type: 'section', heading: '生命周期状态', paragraphs: ['每个变更都有 status.yml，状态为 proposed、reviewed、built、revision-needed、accepted 或 archived。它还记录评审跟踪、明确验收、createdAt 和 updatedAt。'] },
        { id: 'explore', type: 'section', heading: '0. Explore', paragraphs: ['Explore 是 proposal 之前的发现阶段。代理读取项目状态和上下文，调查选项和风险，提出聚焦问题，并且不创建变更目录或生命周期状态。'] },
        { id: 'proposal', type: 'section', heading: '1. Proposal', paragraphs: ['代理把用户意图转成具体提案和任务骨架。这会在 .specrow/changes/<change-name>/ 下创建目录，并让变更处于 proposed 状态。'] },
        { id: 'review', type: 'section', heading: '2. Review', paragraphs: ['默认建议 review，只有高风险变更才强制要求。它检查提案准备度、薄弱验收标准、必需文件和必需章节。Review 不是验收。'] },
        { id: 'build', type: 'section', heading: '3. Build', paragraphs: ['Build 读取 proposal、tasks、status 和活跃变更警告。它实现限定范围内的工作，并将变更标记为 built。Build 不得归档、验收或把规格更新为最终事实。'] },
        { id: 'revise', type: 'section', heading: '4. Revise', paragraphs: ['如果用户在 build 后要求修改，变更进入 revision-needed。后续工作可以更新提案、任务、实现或验证证据，但仍然不验收该变更。'] },
        { id: 'accept-and-archive', type: 'section', heading: '5. Accept 和 Archive', paragraphs: ['验收需要用户明确决定，并且只把该决定写入 status.yml。Archive 是独立操作：它把暂存 spec updates 复制到 .specrow/specs/，并将已验收变更移到 .specrow/archive/。现有归档目录不会被覆盖。'] },
      ],
    },
    'agent-commands': {
      eyebrow: '与代理协作',
      title: '意图，而非 CLI',
      description: '简短的 SpecRow 短语是工作流请求。代理将其映射到 MCP 工具；它们不是字面 CLI 命令。',
      blocks: [
        { id: 'intent-contract', type: 'section', heading: '意图约定', paragraphs: ['像 specrow build 这样的短语要求代理通过 MCP 执行对应工作流，并非 shell 命令。'] },
        { id: 'explore', exampleKind: 'intent', type: 'section', heading: 'specrow explore', paragraphs: ['使用项目状态、上下文和验证进行只读探索。不会创建变更或实现代码。'], commands: ['specrow explore 讨论无密码登录'] },
        { id: 'proposal', exampleKind: 'intent', type: 'section', heading: 'specrow proposal', paragraphs: ['创建暂存的 proposal.md、tasks.md 和 status.yml，但不授权实现。'], commands: ['specrow proposal 添加无密码登录'] },
        { id: 'review', exampleKind: 'intent', type: 'section', heading: 'specrow review', paragraphs: ['实现前检查就绪度。安全、隐私、权限、迁移、破坏性行为、公共契约、自动化、架构、本地化和生命周期变更必须评审。'], commands: ['specrow review <change-name>'] },
        { id: 'build', exampleKind: 'intent', type: 'section', heading: 'specrow build', paragraphs: ['加载上下文、检查就绪度、只实现提议范围、验证结果并记录 built，不进行验收。'], commands: ['specrow build <change-name>'] },
        { id: 'revise', exampleKind: 'intent', type: 'section', heading: 'specrow revise', paragraphs: ['记录仍需后续工作。工作及检查必须在验收前完成。'], commands: ['specrow revise <change-name>'] },
        { id: 'accept-and-archive', exampleKind: 'intent', type: 'section', heading: 'specrow accept 与 archive', paragraphs: ['Accept 需要明确决定并记录验收。Archive 单独整合暂存规格并把已验收变更移入历史。'], commands: ['specrow accept <change-name>', 'specrow archive <change-name>'] },
        { id: 'stop-points', type: 'section', heading: '必须停止的边界', paragraphs: ['未请求实现时在 proposal 后停止；遇到阻塞错误时停止；在用户明确验收前不得 accept。测试通过不等于验收。'] },
      ],
    },
    'mcp-server': {
      eyebrow: '参考',
      title: 'MCP 服务器',
      description: '内置 stdio 服务器提供请求级操作，并为每次调用安全选择项目工作区。',
      blocks: [
        { id: 'runtime', type: 'section', heading: '内置 Runtime', paragraphs: ['插件将 runtime/specrow-mcp.cjs 作为代理管理的 stdio 进程启动。安装目录不会被视为用户项目。'] },
        { id: 'workspace-selection', type: 'section', heading: '工作区选择', paragraphs: ['每个依赖工作区的工具都接受可选绝对 projectRoot。解析使用显式有效 root、唯一客户端文件 root、多个 roots 中唯一已初始化的 SpecRow 工作区，或直接 CLI MCP 模式的启动 root。'] },
        { id: 'connection-check', exampleKind: 'mcp', type: 'section', heading: '连接检查', paragraphs: ['先调用 project status。任何写入前都要确认返回的 projectRoot。'], commands: ['specrow_project_status'] },
        { id: 'inspect-tools', exampleKind: 'mcp', type: 'section', heading: '检查工具', paragraphs: ['读取项目状态、活动变更、验证结果和代理可读上下文。'], commands: ['specrow_project_status', 'specrow_status', 'specrow_context', 'specrow_validate'] },
        { id: 'setup-tools', exampleKind: 'mcp', type: 'section', heading: '设置与导入工具', paragraphs: ['初始化和迁移可能写入文件，因此需要已确认的 project root。'], commands: ['specrow_init', 'specrow_migrate'] },
        { id: 'lifecycle-tools', exampleKind: 'mcp', type: 'section', heading: '生命周期工具', paragraphs: ['创建和评审 proposals、控制实现状态、记录验收并归档已验收工作。'], commands: ['specrow_create_proposal', 'specrow_review', 'specrow_build_start', 'specrow_build_finish', 'specrow_revise', 'specrow_accept', 'specrow_archive'] },
        { id: 'result-contract', type: 'section', heading: '结果约定', paragraphs: ['对 specrow_validate 而言，success 只表示调用完成；必须检查 valid 和问题严重级别。'] },
        { id: 'errors', type: 'section', heading: '错误', paragraphs: ['预期错误包括 INVALID_PROJECT_ROOT、UNSAFE_PATH、INVALID_STATE、VALIDATION_FAILED、MISSING_LANGUAGE_RESOURCE、NOT_FOUND 和 INTERNAL_ERROR。应修复原因，不能用插件目录替代 project root。'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI 参考',
      description: 'CLI 在代理会话之外为 CI、脚本和手动诊断提供与 SpecRow 生命周期一致的能力。',
      blocks: [
        { id: 'setup', exampleKind: 'cli', type: 'section', heading: '初始化', paragraphs: ['创建 .specrow 工作区并选择模板语言。--estimation 会在创建提案后要求估算；--force 会重写 config.yml，因此要重复指定所需语言和 estimation 设置。'], commands: ['specrow init --language zh-CN', 'specrow init --language zh-CN --estimation', 'specrow init --language zh-CN --estimation --force'] },
        { id: 'migration', exampleKind: 'cli', type: 'section', heading: '迁移', paragraphs: ['导入 OpenSpec、SpecKit 或文档目录。CLI 允许外部来源，MCP 则把来源限制在所选工作区内。先使用 dry run；--source-root 指定检测根目录，--language 用于初始化，--force 允许覆盖目标文件。'], commands: ['specrow migrate openspec --dry-run', 'specrow migrate speckit --source-root <path>', 'specrow migrate <docs-folder> --language zh-CN --force'] },
        { id: 'planning', exampleKind: 'cli', type: 'section', heading: '规划与检查', paragraphs: ['创建变更、验证结构、完成评审，并读取上下文、状态或活动变更列表。'], commands: ['specrow proposal <change-name> --review required', 'specrow validate [change-name]', 'specrow review <change-name>', 'specrow status [change-name]', 'specrow context [change-name]', 'specrow list'] },
        { id: 'implementation', exampleKind: 'cli', type: 'section', heading: '实现', paragraphs: ['build-start 检查就绪状态但不改变生命周期状态。build-finish 记录实现完成；revise 将变更退回修订。'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>'] },
        { id: 'acceptance', exampleKind: 'cli', type: 'section', heading: '验收与归档', paragraphs: ['accept 需要 --yes，并且只记录明确验收。archive 会单独把暂存的 spec updates 合并到当前 specs，并把变更移入归档。接受已修复的 revision-needed 变更时，还需确认 follow-up work 已完成。'], commands: ['specrow accept <change-name> --yes', 'specrow accept <change-name> --yes --follow-up-work-completed', 'specrow archive <change-name>'] },
        { id: 'maintenance', exampleKind: 'cli', type: 'section', heading: '维护', paragraphs: ['验证 runtime 与文档的 locale 覆盖，或为代理启动本地 stdio MCP 服务器。'], commands: ['specrow locales validate', 'specrow mcp [project-path]'] },
      ],
    },
    migration: {
      eyebrow: '迁移',
      title: '迁移到当前 SpecRow',
      description: '安全导入已有规格产物，并用可移植的 Agent Plugin 替换旧的客户端专用集成。',
      blocks: [
        { id: 'choose-path', type: 'section', heading: '选择路径', paragraphs: ['内容迁移把 OpenSpec、SpecKit 或文档目录中的产物移入 .specrow。插件升级替换旧的客户端专用安装模型。两者解决不同问题，可以独立进行。'] },
        { id: 'safe-order', exampleKind: 'cli', type: 'section', heading: '安全迁移顺序', paragraphs: ['确认目标工作区，检测来源并预览计划。迁移是一条明确的信任边界，因为它会把导入材料直接写入当前 specs；在执行非 dry-run 操作前应先取得用户批准。然后不使用 force 迁移、验证并检查所有警告。'], commands: ['specrow migrate <source> --dry-run', 'specrow migrate <source>', 'specrow validate'] },
        { id: 'source-mapping', type: 'section', heading: '来源映射方式', paragraphs: ['OpenSpec specs 会成为当前 specs，活动 changes 会保留源产物。SpecKit feature 目录会成为活动 changes。普通文档目录会复制为导入 specs。归档会作为历史保留。'] },
        { id: 'safety-boundaries', type: 'section', heading: '安全边界', paragraphs: ['通过 MCP 迁移时，来源必须位于所选项目内部，且不能位于 .specrow 中。迁移只复制数据，不删除、移动或重写来源。除非明确使用 force，否则不会覆盖已有目标文件。'] },
        { id: 'semantic-review', type: 'section', heading: '必须进行语义评审', paragraphs: ['自动转换不能证明含义等价或验收标准正确。迁移前应检查标题、需求、生命周期状态、源材料链接和警告。导入后再次验证，并为任何修正创建后续变更。'] },
        { id: 'legacy-upgrade', type: 'section', heading: '升级旧集成', paragraphs: ['Agent Plugin 现在一起提供 plugin.json、mcp.json、specrow skill 和 MCP runtime。旧的客户端生成命令、规则、工作流和手动 MCP 条目不再是规范来源。SpecRow 不会自动删除它们，因为其中可能有用户修改；只有在确认所有权和活跃客户端后才应显式比较并删除。'] },
      ],
    },
    templates: {
      eyebrow: '模板',
      title: '内置文件',
      description: 'SpecRow 生成少量本地化 Markdown 文件，而不是复制大型规格系统。',
      blocks: [
        { id: 'workspace-layout', type: 'code-section', heading: '.specrow 结构', intro: '初始化会创建此工作区。', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml 记录工作区格式版本、项目语言和可选的 estimation 偏好。' },
        { id: 'project-context', type: 'section', heading: 'project.md', paragraphs: ['project.md 记录项目目的、工作语言、领域词汇、架构说明、约束和验证实践。代理在创建或修订内置文件前读取它。'] },
        { id: 'accepted-specs', type: 'section', heading: 'Specs', paragraphs: ['Specs 描述已验收行为，包括目的、当前行为、需求、约束、决策和验证。普通变更只有通过 accept 和 archive 才会更新 specs。显式迁移是例外：它直接导入已获批准的源材料，必须作为信任边界进行评审。'] },
        { id: 'staged-proposal', type: 'section', heading: 'proposal.md', paragraphs: ['提案描述预期变更：summary、problem、proposed change、scope、out of scope、user impact、risks、decisions、acceptance criteria 和预期 spec updates。'] },
        { id: 'tasks-and-status', exampleKind: 'cli', type: 'section', heading: 'tasks.md', paragraphs: ['Tasks 将工作拆分为 implementation、verification、documentation 和 acceptance gate。模板提醒代理 build 结束后下一步是 revise 或 accept。'], commands: ['specrow revise', 'specrow accept'] },
      ],
    },
    localization: {
      eyebrow: '本地化',
      title: '项目语言',
      description: '.specrow/config.yml 中的 language 字段控制内置模板和生命周期消息。',
      blocks: [
        { id: 'config', type: 'code-section', heading: 'Config', intro: 'MVP 配置有意保持很小。', code: 'version: 1\nlanguage: zh-CN', outro: '支持的内置语言是 en、ru、es 和 zh-CN。' },
        { id: 'localized-resources', type: 'section', heading: '哪些内容使用 language', paragraphs: ['CLI 将 language 用于 project.md、specs、proposals、tasks 以及 lifecycle/status 消息。MCP workflow在创建或修订内置文件时使用相同语言。'] },
        { id: 'no-fallback', type: 'section', heading: '没有静默 fallback', paragraphs: ['如果请求的语言、模板或消息缺失，SpecRow 会以清晰错误停止。它不得为非英文项目静默生成英文文件。'] },
        { id: 'supported-languages', exampleKind: 'cli', type: 'section', heading: '添加语言', paragraphs: ['将语言加入 runtime registry、README 集合、站点内容和 shell 消息。提供全部模板标记、消息 placeholder、页面 ID 和评审 digest。只有 locale 验证和测试通过后，该语言才算完整。'], commands: ['npm run locale:validate'] },
        { id: 'runtime-contract', exampleKind: 'cli', type: 'section', heading: '修改文本', paragraphs: ['站点页面声明英文为源 locale。先修改源内容并提高页面修订号，再把相同含义应用到所有 locale，最后更新每个 content digest 和 reviewed source digest。Runtime 消息保持相同 placeholder，模板章节保留语义标记。'], commands: ['npm run locale:validate', 'npm run typecheck', 'npm run test'] },
        { id: 'site-contract', exampleKind: 'cli', type: 'section', heading: '删除文本', paragraphs: ['从每个 locale 和读取代码中删除未使用文本，不要依赖英文 fallback。保留已发布章节 ID；如果必须更换，应添加 anchor alias 以保持旧链接可用。Digest 能发现未经评审的编辑，但语义等价仍需人工确认。'], commands: ['npm run locale:validate'] },
        { id: 'vocabulary', type: 'section', heading: '领域术语', paragraphs: ['使用 project.md 记录应保持不翻译的词、规范产品名、缩写和领域词汇。这让本地化可预测，同时不隐藏业务术语。'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: '验证',
      title: '验证和生命周期规则',
      description: '验证保护工作流，避免缺失文件、不完整章节、薄弱提案和不安全归档。',
      blocks: [
        { id: 'validation', exampleKind: 'cli', type: 'section', heading: '验证', paragraphs: ['验证会检查 project.md 和活跃变更。对每个变更，它验证 proposal.md、tasks.md、必需章节和 status.yml 结构。缺失文件和缺失章节是错误。'], commands: ['specrow validate [change-name]'] },
        { id: 'review-readiness', exampleKind: 'cli', type: 'section', heading: 'Review 警告', paragraphs: ['Review 增加提案准备度检查。空的 acceptance criteria 或没有 checklist 的验收文本会产生警告，让代理在实现前请求澄清。'], commands: ['specrow review <change-name>'] },
        { id: 'multiple-changes', exampleKind: 'cli', type: 'section', heading: '多个活跃变更', paragraphs: ['Status 和 list 显示所有活动变更。存在多个变更时，list 会给出通用警告，要求检查可能的 specs 或工作流冲突；它不会计算文件级冲突。'], commands: ['specrow status', 'specrow list'] },
        { id: 'acceptance-gate', exampleKind: 'cli', type: 'section', heading: '验收边界', paragraphs: ['验收需要用户明确决定。CLI 使用 --yes 确认；MCP 客户端传入对应的明确验收参数。在 accepted 状态记录该决定之前，archive 会被阻止。'], commands: ['specrow accept <change-name> --yes'] },
        { id: 'limits', type: 'section', heading: '限制与归档安全', paragraphs: ['验证只能证明结构，不能证明正确性、完整性、安全性或翻译间语义一致。Archive 在验收后单独复制暂存 spec updates，保留变更作为历史，并拒绝覆盖已有同名归档。'] },
      ],
    },
    'sd-development': {
      eyebrow: '更多信息',
      title: 'SD 开发',
      description: 'Spec-Driven Development 以及 SpecRow 如何在代理工作流中应用它。',
      blocks: [
        { id: 'working-definition',
          type: 'section',
          heading: '什么是 Spec-Driven Development？',
          paragraphs: [
            'Spec-Driven Development（SDD）是一种由已达成共识的规格指导实现和验证的工作方式。规格描述可观察行为、约束、决策和完成证据。',
            '“规格优先”并不要求在学习开始前猜出所有实现细节，而是要在修改代码前明确意图和验收标准；如果实现过程发现更好的方案，就修订提案。',
            '这对编码代理尤其有用：持久的项目上下文减少重复说明，限定到单个变更的提案让每次会话保持聚焦且可评审。规格是共享上下文，不能替代测试、代码评审或工程判断。',
            'SpecRow 将当前事实与拟议工作分开。project.md 和 .specrow/specs 描述项目及已验收行为；.specrow/changes 中的每个目录暂存提案、任务、状态和预期 specs 更新。',
            '生命周期提供明确边界：检查、提议、评审、实现、修订或验收，然后归档。accept 只记录用户决定；archive 是把暂存 specs 更新合并到当前 specs 的独立操作。',
            '当需求、风险或多人协作让隐式上下文代价较高时，SDD 很有帮助。对于小型或探索性工作，应让规格与任务规模相称：只记录让结果可理解、可验证所需的决策和检查。',
          ],
        },
      ],
    },
  },
}

export const sourceContentDigests: Record<PageSlug, string> = {
  manifesto: 'b38eef9f', instructions: '684822a0', workflow: '3f59002d', 'agent-commands': 'f7fca6f9', 'mcp-server': 'a9cc9ee3', 'cli-reference': '46758e8f', migration: '2eeb3564', templates: 'f728d486', localization: 'e048c514', 'validation-lifecycle': '7b34c10b', 'sd-development': '1ff632c0',
}

export const reviewedContentDigests: Record<LocaleCode, Record<PageSlug, string>> = {
  en: { manifesto: 'b38eef9f', instructions: '684822a0', workflow: '3f59002d', 'agent-commands': 'f7fca6f9', 'mcp-server': 'a9cc9ee3', 'cli-reference': '46758e8f', migration: '2eeb3564', templates: 'f728d486', localization: 'e048c514', 'validation-lifecycle': '7b34c10b', 'sd-development': '1ff632c0' },
  ru: { manifesto: 'a2f81a18', instructions: '95a08f1c', workflow: '99fa35e1', 'agent-commands': 'f2e5e313', 'mcp-server': '771d52f6', 'cli-reference': 'df9e9e0e', migration: 'fc64ac2c', templates: '932fbef2', localization: '72bcdd02', 'validation-lifecycle': '98028ab5', 'sd-development': '8c43a099' },
  es: { manifesto: '4ab5377a', instructions: '6a3d7993', workflow: '948685ec', 'agent-commands': 'de0058e3', 'mcp-server': 'd70d9b93', 'cli-reference': '764b41a2', migration: 'be78a0cf', templates: '0ede6928', localization: 'f8b58b84', 'validation-lifecycle': 'd1ff75a2', 'sd-development': 'bf4f5f0b' },
  'zh-CN': { manifesto: 'a97db9a6', instructions: 'f69dad01', workflow: 'a30c3c0a', 'agent-commands': '89084a51', 'mcp-server': '3f087378', 'cli-reference': '5297f92d', migration: '16f66eae', templates: '56f5c4b8', localization: 'dc01c907', 'validation-lifecycle': '890beab7', 'sd-development': '62636763' },
}

export const reviewedSourceDigests: Record<LocaleCode, Record<PageSlug, string>> = {
  en: { manifesto: 'b38eef9f', instructions: '684822a0', workflow: '3f59002d', 'agent-commands': 'f7fca6f9', 'mcp-server': 'a9cc9ee3', 'cli-reference': '46758e8f', migration: '2eeb3564', templates: 'f728d486', localization: 'e048c514', 'validation-lifecycle': '7b34c10b', 'sd-development': '1ff632c0' },
  ru: { manifesto: 'b38eef9f', instructions: '684822a0', workflow: '3f59002d', 'agent-commands': 'f7fca6f9', 'mcp-server': 'a9cc9ee3', 'cli-reference': '46758e8f', migration: '2eeb3564', templates: 'f728d486', localization: 'e048c514', 'validation-lifecycle': '7b34c10b', 'sd-development': '1ff632c0' },
  es: { manifesto: 'b38eef9f', instructions: '684822a0', workflow: '3f59002d', 'agent-commands': 'f7fca6f9', 'mcp-server': 'a9cc9ee3', 'cli-reference': '46758e8f', migration: '2eeb3564', templates: 'f728d486', localization: 'e048c514', 'validation-lifecycle': '7b34c10b', 'sd-development': '1ff632c0' },
  'zh-CN': { manifesto: 'b38eef9f', instructions: '684822a0', workflow: '3f59002d', 'agent-commands': 'f7fca6f9', 'mcp-server': 'a9cc9ee3', 'cli-reference': '46758e8f', migration: '2eeb3564', templates: 'f728d486', localization: 'e048c514', 'validation-lifecycle': '7b34c10b', 'sd-development': '1ff632c0' },
}

export interface SiteContentIssue {
  path: string
  message: string
}

export function contentDigest(page: PageContent): string {
  const source = JSON.stringify(page)
  let hash = 0x811c9dc5

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

const removedCommandPatterns = [
  /^specrow integrate(?:\s|$)/,
  /^specrow update(?:\s|$)/,
  /^specrow integrations status(?:\s|$)/,
  /^specrow_(?:template_context|language_status|integration_status|list|workflow_guide)$/,
]

export function validateSiteContent(
  content: Record<LocaleCode, Record<PageSlug, PageContent>> = docContent,
  revisions: Record<LocaleCode, Record<PageSlug, number>> = reviewedContentRevisions,
  contentDigests: Record<LocaleCode, Record<PageSlug, string>> = reviewedContentDigests,
  sourceDigests: Record<PageSlug, string> = sourceContentDigests,
  translationSourceDigests: Record<LocaleCode, Record<PageSlug, string>> = reviewedSourceDigests,
): SiteContentIssue[] {
  const issues: SiteContentIssue[] = []
  const expectedLocales = locales.map(({ code }) => code)
  const expectedPages = pages.map(({ slug }) => slug)
  const contentRecord = content as Record<string, Record<string, PageContent> | undefined>
  const revisionRecord = revisions as Record<string, Record<string, number> | undefined>
  const contentDigestRecord = contentDigests as Record<string, Record<string, string> | undefined>
  const translationSourceDigestRecord = translationSourceDigests as Record<string, Record<string, string> | undefined>

  pushKeySetIssues(issues, 'content', Object.keys(contentRecord), expectedLocales)
  pushKeySetIssues(issues, 'revisions', Object.keys(revisionRecord), expectedLocales)
  pushKeySetIssues(issues, 'contentDigests', Object.keys(contentDigestRecord), expectedLocales)
  pushKeySetIssues(issues, 'translationSourceDigests', Object.keys(translationSourceDigestRecord), expectedLocales)
  pushKeySetIssues(issues, 'sourceDigests', Object.keys(sourceDigests), expectedPages)

  for (const locale of expectedLocales) {
    const localePages = contentRecord[locale]
    const localeRevisions = revisionRecord[locale]
    const localeDigests = contentDigestRecord[locale]
    const localeSourceDigests = translationSourceDigestRecord[locale]

    if (localePages === undefined || localeRevisions === undefined || localeDigests === undefined || localeSourceDigests === undefined) continue

    pushKeySetIssues(issues, `content.${locale}`, Object.keys(localePages), expectedPages)
    pushKeySetIssues(issues, `revisions.${locale}`, Object.keys(localeRevisions), expectedPages)
    pushKeySetIssues(issues, `contentDigests.${locale}`, Object.keys(localeDigests), expectedPages)
    pushKeySetIssues(issues, `translationSourceDigests.${locale}`, Object.keys(localeSourceDigests), expectedPages)

    for (const slug of expectedPages) {
      const page = localePages[slug]
      const contract = pageContracts[slug]
      const basePage = contentRecord[defaultLocale]?.[slug]
      const pagePath = `content.${locale}.${slug}`

      if (page === undefined || basePage === undefined) continue

      const actualDigest = contentDigest(page)
      if (localeDigests[slug] !== actualDigest) {
        issues.push({ path: `contentDigests.${locale}.${slug}`, message: `Content changed after review. Expected digest ${String(localeDigests[slug])}, got ${actualDigest}.` })
      }

      const sourcePage = contentRecord[contract.sourceLocale]?.[slug]
      if (sourcePage !== undefined) {
        const actualSourceDigest = contentDigest(sourcePage)
        if (sourceDigests[slug] !== actualSourceDigest) {
          issues.push({ path: `sourceDigests.${slug}`, message: `Source content changed. Expected digest ${String(sourceDigests[slug])}, got ${actualSourceDigest}.` })
        }
        if (localeSourceDigests[slug] !== sourceDigests[slug]) {
          issues.push({ path: `translationSourceDigests.${locale}.${slug}`, message: `Translation was reviewed against source ${String(localeSourceDigests[slug])}, current source is ${String(sourceDigests[slug])}.` })
        }
      }

      if (localeRevisions[slug] !== contract.revision) {
        issues.push({ path: `revisions.${locale}.${slug}`, message: `Expected reviewed revision ${contract.revision}, got ${String(localeRevisions[slug])}.` })
      }

      for (const [field, value] of [['eyebrow', page.eyebrow], ['title', page.title], ['description', page.description]] as const) {
        if (value.trim().length === 0) issues.push({ path: `${pagePath}.${field}`, message: 'Required text is empty.' })
      }

      if (page.blocks.length !== contract.sectionIds.length) {
        issues.push({ path: `${pagePath}.blocks`, message: `Expected ${contract.sectionIds.length} blocks, got ${page.blocks.length}.` })
      }

      if (new Set(contract.sectionIds).size !== contract.sectionIds.length || contract.sectionIds.some((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) {
        issues.push({ path: `pageContracts.${slug}.sectionIds`, message: 'Section IDs must be unique lowercase kebab-case values.' })
      }

      for (const alias of Object.keys(anchorAliases[slug])) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alias) || contract.sectionIds.includes(alias)) {
          issues.push({ path: `anchorAliases.${slug}.${alias}`, message: 'Anchor alias must be kebab-case and must not shadow a current section ID.' })
        }
        if (resolveAnchorTarget(alias, anchorAliases[slug], contract.sectionIds) === undefined) {
          issues.push({ path: `anchorAliases.${slug}.${alias}`, message: `Anchor alias chain from ${alias} is cyclic or does not resolve to a current section.` })
        }
      }

      page.blocks.forEach((block, index) => {
        const blockPath = `${pagePath}.blocks.${index}`
        const baseBlock = basePage.blocks[index]

        if (block.id !== contract.sectionIds[index]) {
          issues.push({ path: `${blockPath}.id`, message: `Expected semantic section ID ${String(contract.sectionIds[index])}, got ${block.id}.` })
        }

        if (!('heading' in block) || block.heading.trim().length === 0) {
          issues.push({ path: blockPath, message: 'Every contracted block needs a localized heading.' })
        }

        if (baseBlock !== undefined && (block.type !== baseBlock.type || blockHeadingLevel(block) !== blockHeadingLevel(baseBlock))) {
          issues.push({ path: blockPath, message: `Block topology differs from ${defaultLocale}.` })
        }

        for (const linkedPage of linkedPages(block)) {
          if (!expectedPages.includes(linkedPage)) issues.push({ path: blockPath, message: `Unknown internal page link: ${linkedPage}.` })
        }

        const examples = blockExamples(block)
        if (examples.length > 0 && block.exampleKind === undefined) {
          issues.push({ path: blockPath, message: 'Executable examples require an explicit exampleKind.' })
        }
        if (examples.length === 0 && block.exampleKind !== undefined) {
          issues.push({ path: blockPath, message: 'exampleKind is set but the block has no executable examples.' })
        }
        for (const command of examples) {
          validateExample(issues, blockPath, command, block.exampleKind)
        }
      })
    }

    validateCommandCatalogs(issues, locale, localePages)
  }

  return issues
}

function pushKeySetIssues(issues: SiteContentIssue[], path: string, actual: readonly string[], expected: readonly string[]): void {
  const actualSet = new Set(actual)
  const expectedSet = new Set<string>(expected)
  for (const key of expected) if (!actualSet.has(key)) issues.push({ path, message: `Missing key: ${key}.` })
  for (const key of actual) if (!expectedSet.has(key)) issues.push({ path, message: `Unexpected key: ${key}.` })
}

function blockHeadingLevel(block: Block): number | undefined {
  return 'heading' in block ? (block.headingLevel ?? 2) : undefined
}

function blockCommands(block: Block): readonly string[] {
  if (block.type === 'command-section') return block.commands
  if (block.type === 'section') return block.commands ?? []
  return []
}

function blockExamples(block: Block): readonly string[] {
  const commands = blockCommands(block)
  if (commands.length > 0) return commands
  if (block.type !== 'code-section') return []
  return block.code.split(/\r?\n/).map((line) => line.trim()).filter(isExecutableExample)
}

function isExecutableExample(command: string): boolean {
  return /^(?:specrow(?:\s|_)|npm\s|pnpm\s|npx\s)/.test(command)
}

function validateExample(issues: SiteContentIssue[], path: string, command: string, kind: ExampleKind | undefined): void {
  const trimmed = command.trim()
  const cliInvocation = normalizeCliInvocation(trimmed)
  const normalized = cliInvocation ?? trimmed
  if (normalized.length === 0) issues.push({ path, message: 'Command examples cannot be empty.' })
  if (removedCommandPatterns.some((pattern) => pattern.test(normalized))) {
    issues.push({ path, message: `Removed command or tool is still presented as executable: ${command}.` })
  }

  if (kind === 'cli') {
    const containsSpecRowToken = /(?:^|\s)specrow(?=\s|$)/.test(trimmed)
    const isPackageInstall = /^(?:npm\s+(?:i|install)|pnpm\s+(?:add|install)|yarn\s+add|bun\s+add)\b/.test(trimmed)
    if (cliInvocation === undefined && containsSpecRowToken && !isPackageInstall) {
      issues.push({ path, message: `Unsupported SpecRow CLI wrapper in executable example: ${command}.` })
      return
    }

    if (cliInvocation !== undefined) {
      const tokens = cliInvocation.match(/^specrow\s+([a-z-]+)(?:\s+([a-z-]+))?/)?.slice(1)
      const commandName = tokens?.[0]
      const commandPath = commandName === 'locales' ? `${commandName} ${tokens?.[1] ?? ''}`.trim() : commandName
      if (commandPath === undefined || !(documentedCliPaths as readonly string[]).includes(commandPath)) {
        issues.push({ path, message: `Unknown CLI command path in executable example: ${commandPath ?? command}.` })
      } else {
        const allowedOptions = documentedCliOptions[commandPath as keyof typeof documentedCliOptions]
        for (const option of cliInvocation.match(/--[a-z-]+/g) ?? []) {
          if (!allowedOptions.includes(option)) {
            issues.push({ path, message: `Unknown option ${option} for CLI command path ${commandPath}.` })
          }
        }
      }
    }
  } else if (kind === 'mcp') {
    const name = normalized.match(/^(specrow_[a-z_]+)/)?.[1]
    if (name === undefined || !(documentedMcpTools as readonly string[]).includes(name)) {
      issues.push({ path, message: `Unknown MCP tool in executable example: ${command}.` })
    }
  } else if (kind === 'intent') {
    const name = normalized.match(/^specrow\s+([a-z-]+)/)?.[1]
    if (name !== undefined && !(documentedAgentIntents as readonly string[]).includes(name)) {
      issues.push({ path, message: `Unknown agent intent in example: ${name}.` })
    }
  }
}

function normalizeCliInvocation(command: string): string | undefined {
  if (/^specrow(?:\s|$)/.test(command)) return command

  const isExecutionWrapper = /^(?:npx\b|npm\b.*\bexec\b|pnpm\b.*\b(?:exec|dlx)\b|yarn\b.*\bdlx\b|bunx\b|bun\b.*\bx\b)/.test(command)
  if (!isExecutionWrapper) return undefined

  const invocationIndex = command.search(/\bspecrow(?=\s|$)/)
  return invocationIndex < 0 ? undefined : command.slice(invocationIndex)
}

function resolveAnchorTarget(alias: string, aliases: Readonly<Record<string, string>>, sectionIds: readonly string[]): string | undefined {
  const visited = new Set<string>()
  let current = alias

  while (!sectionIds.includes(current)) {
    if (visited.has(current)) return undefined
    visited.add(current)
    const target = aliases[current]
    if (target === undefined) return undefined
    current = target
  }

  return current
}

export function resolvedAnchorAliases(page: PageSlug, sectionId: string): string[] {
  const aliases = anchorAliases[page]
  return Object.keys(aliases).filter((alias) => resolveAnchorTarget(alias, aliases, pageContracts[page].sectionIds) === sectionId)
}

function linkedPages(block: Block): PageSlug[] {
  if (block.type !== 'section') return []
  return block.paragraphs.flatMap((paragraph) => {
    if (typeof paragraph === 'string') return []
    return paragraph.flatMap((part) => (typeof part !== 'string' && 'page' in part ? [part.page] : []))
  })
}

function validateCommandCatalogs(issues: SiteContentIssue[], locale: LocaleCode, localePages: Record<string, PageContent>): void {
  const cliCommands = new Set(
    localePages['cli-reference'].blocks
      .flatMap(blockExamples)
      .map((command) => command.match(/^specrow\s+([a-z-]+)/)?.[1])
      .filter((command): command is string => command !== undefined),
  )
  const mcpTools = new Set(localePages['mcp-server'].blocks.flatMap(blockExamples).filter((command) => /^specrow_[a-z_]+$/.test(command)))

  compareCatalog(issues, `content.${locale}.cli-reference`, cliCommands, documentedCliCommands)
  compareCatalog(issues, `content.${locale}.mcp-server`, mcpTools, documentedMcpTools)
}

function compareCatalog(issues: SiteContentIssue[], path: string, actual: Set<string>, expected: readonly string[]): void {
  const expectedSet = new Set<string>(expected)
  for (const name of expected) if (!actual.has(name)) issues.push({ path, message: `Documented catalog is missing ${name}.` })
  for (const name of actual) if (!expectedSet.has(name)) issues.push({ path, message: `Documented catalog contains unknown entry ${name}.` })
}
