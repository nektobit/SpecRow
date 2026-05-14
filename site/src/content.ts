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
  { slug: 'cli-reference' },
  { slug: 'templates' },
  { slug: 'localization' },
  { slug: 'validation-lifecycle' },
  { slug: 'knowledge-base' },
] as const

export type PageSlug = (typeof pages)[number]['slug']

export type TextPart = string | { text: string; page: PageSlug }
export type Paragraph = string | TextPart[]

export type Block =
  | { type: 'section'; heading: string; paragraphs: Paragraph[]; commands?: string[] }
  | { type: 'list-section'; heading: string; intro: string; items: string[]; outro: string }
  | { type: 'code-section'; heading: string; intro: string; code: string; outro: string }
  | { type: 'command-section'; heading: string; intro: string; commands: string[]; outro: string }
  | { type: 'placeholder'; paragraphs: Paragraph[] }

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
        { type: 'section', heading: '1. User-First Language', paragraphs: ['Specifications are created in the language that is convenient for the user. Working with the system must be transparent and predictable.'] },
        { type: 'section', heading: '2. Shared Vocabulary', paragraphs: ['The project glossary is part of the system. All domain terms are recorded and used consistently.'] },
        { type: 'list-section', heading: '3. Dual Representation', intro: 'Each specification exists in two representations:', items: ['Human view: for people', 'Agent view: for agents'], outro: 'These are two projections of the same specification, not two independent documents.' },
        { type: 'section', heading: '4. Change-First Workflow', paragraphs: ['A new feature, fix, or improvement first exists as a change. After implementation and verification, the change is integrated into the current specification.'] },
        { type: 'section', heading: '5. Task Derivation', paragraphs: ['Tasks must be derivable from the specification. If a specification cannot produce a clear work plan, the specification is not good enough.'] },
        { type: 'section', heading: '6. Validatable Specs', paragraphs: ['A specification must be machine-validatable. Structure, links, required sections, conflicts, and tasks must be validated.'] },
        { type: 'section', heading: '7. Explicit Decisions', paragraphs: ['Agents must not silently make important decisions. Architecture, UX, data, and security decisions must be recorded explicitly.'] },
        { type: 'section', heading: '8. Executable Contract', paragraphs: ['A specification is an executable contract. If implementation or verification requires tools, those tools are part of the system.'] },
        { type: 'section', heading: '9. AI-Optional', paragraphs: ['The system works with AI. The system works without AI.'] },
      ],
    },
    instructions: {
      eyebrow: 'Instructions',
      title: 'Getting Started',
      description: 'Use SpecRow through agent commands first. Use the CLI when you need automation or a manual fallback.',
      blocks: [
        { type: 'section', heading: 'Normal Use', paragraphs: ['In regular work, tell the agent what you want with SpecRow agent commands. The agent may call the CLI, read .specrow files, run validation, and prepare context, but you do not need to memorize the CLI.'] },
        { type: 'code-section', heading: 'Initialize A Project', intro: 'Ask the agent to set up SpecRow and choose the project working language.', code: '/specrow:init language=en', outro: 'The result is .specrow/config.yml, project.md, specs/, changes/, and archive/. The language field becomes the default language for built-in files and lifecycle output.' },
        { type: 'code-section', heading: 'Create The First Change', intro: 'Describe the intended outcome, not CLI mechanics.', code: '/specrow:proposal Add passwordless sign-in', outro: 'The agent creates .specrow/changes/<change-name>/proposal.md, tasks.md, and status.yml, then validates the change before implementation.' },
        { type: 'section', heading: 'Build And Stop', paragraphs: ['Use review when the change is risky or when you want a readiness check. Use build to implement. Build ends in the built state and waits for revise or accept.'], commands: ['/specrow:review', '/specrow:build', '/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: 'Revise Or Accept', paragraphs: ['Use revise when the result needs follow-up work. Use accept only when you explicitly accept the built result. Only the accept path may update specs as final truth and archive the change.'], commands: ['/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: 'Older Local Structures', paragraphs: ['Older prototypes may have used the specfly binary or .specfly workspace. New projects use specrow and .specrow. Move any project-specific files you still need into the matching .specrow locations.'] },
      ],
    },
    workflow: {
      eyebrow: 'Workflow',
      title: 'Proposal To Accept',
      description: 'The MVP workflow is proposal, review, build, revise when needed, accept, and archive.',
      blocks: [
        { type: 'section', heading: 'Lifecycle States', paragraphs: ['Every change has status.yml with one state: proposed, reviewed, built, revision-needed, accepted, or archived. It also records review tracking, explicit acceptance, createdAt, and updatedAt.'] },
        { type: 'section', heading: '1. Proposal', paragraphs: ['The agent turns user intent into a concrete proposal and task skeleton. This creates a change directory under .specrow/changes/<change-name>/ and leaves the change in proposed state.'] },
        { type: 'section', heading: '2. Review', paragraphs: ['Review is recommended by default and required only for risky changes. It checks proposal readiness, weak acceptance criteria, required files, and required sections. Review is not acceptance.'] },
        { type: 'section', heading: '3. Build', paragraphs: ['Build reads proposal, tasks, status, and active-change warnings. It implements the scoped work and then marks the change as built. Build must not archive, accept, or update specs as final truth.'] },
        { type: 'section', heading: '4. Revise', paragraphs: ['If the user requests changes after build, the change moves to revision-needed. Follow-up work can update the proposal, tasks, implementation, or verification evidence, but it still does not accept the change.'] },
        { type: 'section', heading: '5. Accept And Archive', paragraphs: ['Acceptance requires an explicit user decision. After acceptance, the archive command may copy staged spec updates into .specrow/specs/ and move the accepted change into .specrow/archive/. Existing archive folders are never overwritten.'] },
      ],
    },
    'agent-commands': {
      eyebrow: 'Agent UX',
      title: 'Agent Command Reference',
      description: 'These are the commands users should remember. The agent handles CLI details as implementation work.',
      blocks: [
        { type: 'section', heading: '/specrow:init', paragraphs: ['Sets up the .specrow workspace. The agent determines the intended language, asks when it is ambiguous, and stops if required templates or messages are missing.'], commands: ['/specrow:init English', '// agent will run:', '// specrow init --language <language>'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['Turns user intent into proposal.md, tasks.md, and status.yml. It does not implement code, accept the change, archive the change, or update specs as final truth.'], commands: ['/specrow:proposal Add passwordless sign-in', '// agent will run:', '// specrow proposal <change-name>', '// specrow validate <change-name>', '// specrow context <change-name>'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['Checks proposal readiness before code. It is recommended for ordinary changes and required for risky work such as security, data migrations, public contracts, CI, localization, or lifecycle behavior.'], commands: ['/specrow:review <change-name>', '// agent will run:', '// specrow review <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['Implements the approved scope. It may load context, check readiness, and finish by marking the change built. The final state waits for revise or accept.'], commands: ['/specrow:build <change-name>', '// agent will run:', '// specrow context <change-name>', '// specrow build-start <change-name>', '// specrow build-finish <change-name>'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['Handles requested follow-up work after build. Revision is not acceptance and must not archive the change.'], commands: ['/specrow:revise <change-name>', '// agent will run:', '// specrow revise <change-name>', '// specrow context <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['Records explicit user acceptance. This is the only user-facing command that authorizes final spec integration and archive. Silence, passing tests, or completed code are not acceptance.'], commands: ['/specrow:accept <change-name>', '// agent will run:', '// specrow accept <change-name> --yes', '// specrow archive <change-name>'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI Reference',
      description: 'The CLI is the technical core used by agents, CI, automation, and manual fallback.',
      blocks: [
        { type: 'section', heading: 'Setup And Creation', paragraphs: ['Initialize the workspace first, then create a named change when the user intent is clear.'], commands: ['specrow init', 'specrow proposal <change-name>'] },
        { type: 'section', heading: 'Validation And Context', paragraphs: ['Validate required files and sections, review proposal readiness, and print agent-readable context.'], commands: ['specrow validate [change-name]', 'specrow review <change-name>', 'specrow context [change-name]'] },
        { type: 'section', heading: 'Lifecycle Commands', paragraphs: ['Use lifecycle commands to start implementation, finish build, request revision, record explicit acceptance, and archive only accepted work.'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>', 'specrow accept <change-name> --yes', 'specrow archive <change-name>'] },
        { type: 'section', heading: 'Status Commands', paragraphs: ['Show one change, all active changes, and warnings when multiple changes may conflict.'], commands: ['specrow status [change-name]', 'specrow list'] },
        { type: 'section', heading: 'Automation Contract', paragraphs: ['CLI output is concise so an agent or CI job can decide the next workflow step. Built-in status messages use the configured project language. Missing language resources fail clearly.'] },
      ],
    },
    templates: {
      eyebrow: 'Templates',
      title: 'Built-In Files',
      description: 'SpecRow generates a small set of localized Markdown files instead of cloning a large spec system.',
      blocks: [
        { type: 'code-section', heading: '.specrow Structure', intro: 'Initialization creates this workspace.', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml stays minimal for MVP: version and language.' },
        { type: 'section', heading: 'project.md', paragraphs: ['project.md records the project purpose, working language, domain vocabulary, architecture notes, constraints, and verification practices. Agents read it before creating or revising built-in files.'] },
        { type: 'section', heading: 'Specs', paragraphs: ['Specs describe final accepted behavior. A spec contains purpose, current behavior, requirements, constraints, decisions, and verification. Specs become final truth only through explicit acceptance.'] },
        { type: 'section', heading: 'proposal.md', paragraphs: ['A proposal describes the intended change: summary, problem, proposed change, scope, out of scope, user impact, risks, decisions, acceptance criteria, and intended spec updates.'] },
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks split work into implementation, verification, documentation, and the acceptance gate. The template reminds agents that build ends with revise or accept.'], commands: ['/specrow:revise', '/specrow:accept'] },
      ],
    },
    localization: {
      eyebrow: 'Localization',
      title: 'Project Language',
      description: 'The language field in .specrow/config.yml controls built-in templates and lifecycle messages.',
      blocks: [
        { type: 'code-section', heading: 'Config', intro: 'The MVP config is intentionally small.', code: 'version: 1\nlanguage: en', outro: 'Supported built-in languages are en, ru, es, and zh-CN.' },
        { type: 'section', heading: 'What Uses The Language', paragraphs: ['The CLI uses language for project.md, specs, proposals, tasks, and lifecycle/status messages. Agent commands use the same language when creating or revising built-in files.'] },
        { type: 'section', heading: 'No Silent Fallback', paragraphs: ['If a requested language, template, or message is missing, SpecRow stops with a clear error. It must not silently generate English files for a non-English project.'] },
        { type: 'section', heading: 'Domain Terms', paragraphs: ['Use project.md to record words that should stay unchanged, canonical product names, acronyms, and domain vocabulary. This keeps localization predictable without hiding business terms.'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: 'Validation',
      title: 'Validation And Lifecycle Rules',
      description: 'Validation protects the workflow from missing files, incomplete sections, weak proposals, and unsafe archive actions.',
      blocks: [
        { type: 'section', heading: 'Validation', paragraphs: ['Validation checks project.md and active changes. For each change it verifies proposal.md, tasks.md, required sections, and status.yml shape. Missing files and missing sections are errors.'], commands: ['specrow validate [change-name]'] },
        { type: 'section', heading: 'Review Warnings', paragraphs: ['Review adds proposal readiness checks. Empty acceptance criteria or acceptance text without a checklist are warnings so the agent can ask for clarification before implementation.'], commands: ['specrow review <change-name>'] },
        { type: 'section', heading: 'Multiple Active Changes', paragraphs: ['The list command and validation keep active changes visible. When more than one active change exists, SpecRow warns about likely spec or workflow conflicts.'], commands: ['specrow list'] },
        { type: 'section', heading: 'Accept Gate', paragraphs: ['Acceptance requires a confirmation flag through the CLI core and an explicit user acceptance decision through the agent command. Archive is blocked until the accepted state records explicit acceptance.'], commands: ['specrow accept <change-name> --yes'] },
        { type: 'section', heading: 'Archive Safety', paragraphs: ['Archive copies staged spec updates only after acceptance, keeps the accepted change auditable, and refuses to overwrite an existing archive folder with the same change name.'] },
      ],
    },
    'knowledge-base': {
      eyebrow: 'Knowledge Base',
      title: 'SpecRow Concepts',
      description: 'Core ideas for working with specifications, changes, agents, and SDD.',
      blocks: [
        { type: 'section', heading: 'What Is SpecRow?', paragraphs: ['SpecRow is a small workflow for describing changes, storing specs, passing context to an AI agent, and keeping acceptance explicit. It is designed for projects where the user works through intent before CLI mechanics.'] },
        { type: 'section', heading: 'What Is A Specification?', paragraphs: ['A spec describes accepted behavior for a focused part of a system. It includes the purpose, current behavior, requirements, constraints, decisions, and verification checks.'] },
        { type: 'section', heading: 'What Is A Change?', paragraphs: ['A change is proposed work before it becomes final truth. It has a proposal, tasks, status, and optional staged spec updates. A change remains active until it is accepted and archived.'] },
        { type: 'section', heading: 'How SpecRow Differs From OpenSpec', paragraphs: ['SpecRow keeps the MVP smaller. It does not clone the full OpenSpec surface, complex delta engine, or automatic conflict resolver. It emphasizes agent-first UX, user intent before CLI mechanics, explicit accept gates, project-native working language, and fully localized built-in templates.'] },
        { type: 'section', heading: 'When To Use CLI Directly', paragraphs: ['Use the CLI directly for CI, scripts, automation, or manual fallback. For normal product work, prefer agent commands so the conversation stays focused on user intent and acceptance decisions.'] },
      ],
    },
  },
  ru: {
    manifesto: {
      eyebrow: 'Манифест',
      title: 'SpecRow',
      description: 'Agent-first процесс спецификаций, где язык пользователя = языку проекта, агента, шаблонов и сообщений жизненного цикла.',
      blocks: [
        { type: 'section', heading: '1. Язык пользователя прежде всего', paragraphs: ['Спецификации создаются на языке, удобном пользователю. Работа с системой должна быть прозрачной и предсказуемой.'] },
        { type: 'section', heading: '2. Общий словарь', paragraphs: ['Проектный глоссарий — часть системы. Все доменные термины фиксируются и используются последовательно.'] },
        { type: 'list-section', heading: '3. Двойное представление', intro: 'Каждая спецификация существует в двух представлениях:', items: ['Human view — для человека', 'Agent view — для агента'], outro: 'Это две проекции одной спецификации, а не два независимых документа.' },
        { type: 'section', heading: '4. Сначала изменение', paragraphs: ['Новая фича, исправление или улучшение сначала живут как изменение. После реализации и проверки изменение интегрируется в актуальную спецификацию.'] },
        { type: 'section', heading: '5. Выведение задач', paragraphs: ['Задачи должны выводиться из спецификации. Если из спеки нельзя получить понятный план работ, значит она недостаточно качественная.'] },
        { type: 'section', heading: '6. Проверяемые спеки', paragraphs: ['Спецификация должна быть машинно проверяемой. Структура, ссылки, обязательные секции, конфликты и задачи должны валидироваться.'] },
        { type: 'section', heading: '7. Явные решения', paragraphs: ['Агент не должен молча принимать важные решения. Архитектурные, UX, data и security-решения должны фиксироваться явно.'] },
        { type: 'section', heading: '8. Исполняемый контракт', paragraphs: ['Спецификация — это исполняемый контракт. Если для реализации или проверки нужны инструменты, они являются частью системы.'] },
        { type: 'section', heading: '9. AI не обязателен', paragraphs: ['Система работает с AI. Система работает без AI.'] },
      ],
    },
    instructions: {
      eyebrow: 'Инструкция',
      title: 'Начало работы',
      description: 'Используйте SpecRow в первую очередь через команды агента. CLI нужен для автоматизации и ручного fallback.',
      blocks: [
        { type: 'section', heading: 'Установка CLI', paragraphs: ['Установите пакет глобально через npm. После установки команда specrow должна быть доступна из терминала.'], commands: ['npm i -g specrow', 'specrow --version', 'specrow --help'] },
        { type: 'section', heading: 'Обычная работа', paragraphs: ['В обычной работе формулируйте задачу агенту через команды SpecRow. Агент может вызывать CLI, читать файлы .specrow, запускать валидацию и готовить контекст, но пользователю не нужно запоминать CLI.'] },
        { type: 'code-section', heading: 'Инициализация проекта', intro: 'Попросите агента настроить SpecRow и выбрать рабочий язык проекта.', code: '/specrow:init language=ru', outro: 'Результат: .specrow/config.yml, project.md, specs/, changes/ и archive/. Поле language задает язык встроенных файлов и lifecycle-вывода.' },
        { type: 'code-section', heading: 'Первое изменение', intro: 'Описывайте желаемый результат, а не CLI-механику.', code: '/specrow:proposal Добавить вход без пароля', outro: 'Агент создает .specrow/changes/<change-name>/proposal.md, tasks.md и status.yml, затем валидирует изменение до реализации.' },
        { type: 'section', heading: 'Сборка и остановка', paragraphs: ['Используйте review для рискованных изменений или когда нужен readiness check. Используйте build для реализации. Сборка завершается состоянием built и ждет revise или accept.'], commands: ['/specrow:review', '/specrow:build', '/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: 'Доработать или принять', paragraphs: ['Используйте revise, если результат требует доработки. Используйте accept только когда вы явно принимаете результат. Только accept-путь может обновлять спецификации как финальную правду и архивировать изменение.'], commands: ['/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: 'Старые локальные структуры', paragraphs: ['Старые прототипы могли использовать бинарь specfly или папку .specfly. Новые проекты используют specrow и .specrow. Перенесите нужные проектные файлы в соответствующие места внутри .specrow.'] },
      ],
    },
    workflow: {
      eyebrow: 'Workflow',
      title: 'От предложения к приемке',
      description: 'MVP-процесс: proposal, review, build, revise при необходимости, accept и archive.',
      blocks: [
        { type: 'section', heading: 'Состояния жизненного цикла', paragraphs: ['У каждого изменения есть status.yml с одним состоянием: proposed, reviewed, built, revision-needed, accepted или archived. Там же хранятся review tracking, явная приемка, createdAt и updatedAt.'] },
        { type: 'section', heading: '1. Proposal', paragraphs: ['Агент превращает намерение пользователя в конкретное предложение и каркас задач. Создается директория .specrow/changes/<change-name>/, состояние изменения: proposed.'] },
        { type: 'section', heading: '2. Review', paragraphs: ['Review рекомендуется по умолчанию и обязателен только для рискованных изменений. Он проверяет готовность предложения, слабые критерии приемки, обязательные файлы и обязательные секции. Review не является приемкой.'] },
        { type: 'section', heading: '3. Build', paragraphs: ['Build читает proposal, tasks, status и предупреждения об активных изменениях. Он реализует ограниченный scope и переводит изменение в built. Build не должен архивировать, принимать или обновлять спецификации как финальную правду.'] },
        { type: 'section', heading: '4. Revise', paragraphs: ['Если пользователь просит изменения после build, состояние становится revision-needed. Доработка может менять предложение, задачи, реализацию или evidence проверки, но все еще не принимает изменение.'] },
        { type: 'section', heading: '5. Accept и Archive', paragraphs: ['Приемка требует явного решения пользователя. После приемки archive может перенести staged spec updates в .specrow/specs/ и переместить принятое изменение в .specrow/archive/. Существующие архивные папки не перезаписываются.'] },
      ],
    },
    'agent-commands': {
      eyebrow: 'Agent UX',
      title: 'Команды агента',
      description: 'Это команды, которые должен помнить пользователь. CLI-детали агент берет на себя.',
      blocks: [
        { type: 'section', heading: '/specrow:init', paragraphs: ['Настраивает рабочее пространство .specrow. Агент определяет язык проекта, уточняет его при неоднозначности и останавливается, если нужных шаблонов или сообщений нет.'], commands: ['/specrow:init русский', '// агент выполнит:', '// specrow init --language <language>'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['Превращает намерение пользователя в proposal.md, tasks.md и status.yml. Не реализует код, не принимает изменение, не архивирует и не обновляет спеки как финальную правду.'], commands: ['/specrow:proposal Добавить вход без пароля', '// агент выполнит:', '// specrow proposal <change-name>', '// specrow validate <change-name>', '// specrow context <change-name>'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['Проверяет готовность предложения до кода. Рекомендуется для обычных изменений и обязателен для security, миграций данных, публичных контрактов, CI, локализации или lifecycle-поведения.'], commands: ['/specrow:review <change-name>', '// агент выполнит:', '// specrow review <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['Реализует согласованный scope. Может загрузить контекст, проверить готовность и завершить работу переводом изменения в built. Финальное состояние ждет revise или accept.'], commands: ['/specrow:build <change-name>', '// агент выполнит:', '// specrow context <change-name>', '// specrow build-start <change-name>', '// specrow build-finish <change-name>'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['Обрабатывает запрошенные доработки после build. Revision не является приемкой и не должен архивировать изменение.'], commands: ['/specrow:revise <change-name>', '// агент выполнит:', '// specrow revise <change-name>', '// specrow context <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['Фиксирует явную приемку пользователя. Это единственная user-facing команда, которая разрешает финальную интеграцию спецификаций и архив. Молчание, зеленые тесты или готовый код не являются приемкой.'], commands: ['/specrow:accept <change-name>', '// агент выполнит:', '// specrow accept <change-name> --yes', '// specrow archive <change-name>'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI-справочник',
      description: 'CLI является техническим ядром для агентов, CI, автоматизации и ручного fallback.',
      blocks: [
        { type: 'section', heading: 'Setup и создание', paragraphs: ['Сначала инициализируйте workspace, затем создайте именованное изменение, когда намерение пользователя понятно.'], commands: ['specrow init', 'specrow proposal <change-name>'] },
        { type: 'section', heading: 'Валидация и контекст', paragraphs: ['Проверяйте обязательные файлы и секции, готовность предложения и agent-readable контекст.'], commands: ['specrow validate [change-name]', 'specrow review <change-name>', 'specrow context [change-name]'] },
        { type: 'section', heading: 'Lifecycle-команды', paragraphs: ['Используйте lifecycle-команды, чтобы начать реализацию, завершить build, запросить доработку, записать явную приемку и архивировать только принятую работу.'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>', 'specrow accept <change-name> --yes', 'specrow archive <change-name>'] },
        { type: 'section', heading: 'Status-команды', paragraphs: ['Показывайте одно изменение, все активные изменения и предупреждения, когда несколько изменений могут конфликтовать.'], commands: ['specrow status [change-name]', 'specrow list'] },
        { type: 'section', heading: 'Контракт автоматизации', paragraphs: ['CLI-вывод короткий, чтобы агент или CI мог определить следующий шаг workflow. Встроенные status-сообщения используют язык проекта. Отсутствующие языковые ресурсы завершают команду понятной ошибкой.'] },
      ],
    },
    templates: {
      eyebrow: 'Шаблоны',
      title: 'Встроенные файлы',
      description: 'SpecRow генерирует небольшой набор локализованных Markdown-файлов вместо большой spec-системы.',
      blocks: [
        { type: 'code-section', heading: 'Структура .specrow', intro: 'Инициализация создает это рабочее пространство.', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml остается минимальным для MVP: version и language.' },
        { type: 'section', heading: 'project.md', paragraphs: ['project.md фиксирует назначение проекта, рабочий язык, доменный словарь, архитектурные заметки, ограничения и практики проверки. Агенты читают его перед созданием или ревизией встроенных файлов.'] },
        { type: 'section', heading: 'Спецификации', paragraphs: ['Спеки описывают финально принятое поведение. Спека содержит назначение, текущее поведение, требования, ограничения, решения и проверки. Финальной правдой спеки становятся только через явную приемку.'] },
        { type: 'section', heading: 'proposal.md', paragraphs: ['Proposal описывает предполагаемое изменение: summary, problem, proposed change, scope, out of scope, user impact, risks, decisions, acceptance criteria и planned spec updates.'] },
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks делит работу на implementation, verification, documentation и acceptance gate. Шаблон напоминает агенту, что build заканчивается revise или accept.'], commands: ['/specrow:revise', '/specrow:accept'] },
      ],
    },
    localization: {
      eyebrow: 'Локализация',
      title: 'Язык проекта',
      description: 'Поле language в .specrow/config.yml управляет встроенными шаблонами и lifecycle-сообщениями.',
      blocks: [
        { type: 'code-section', heading: 'Config', intro: 'MVP-конфиг намеренно мал.', code: 'version: 1\nlanguage: ru', outro: 'Поддерживаемые встроенные языки: en, ru, es и zh-CN.' },
        { type: 'section', heading: 'Что использует language', paragraphs: ['CLI использует language для project.md, specs, proposals, tasks и lifecycle/status-сообщений. Команды агента используют тот же язык при создании или ревизии встроенных файлов.'] },
        { type: 'section', heading: 'Без silent fallback', paragraphs: ['Если запрошенный язык, шаблон или сообщение отсутствует, SpecRow останавливается с понятной ошибкой. Он не должен молча генерировать английские файлы для неанглийского проекта.'] },
        { type: 'section', heading: 'Доменные термины', paragraphs: ['Используйте project.md, чтобы фиксировать слова, которые не нужно переводить, канонические названия продуктов, сокращения и доменный словарь. Это делает локализацию предсказуемой и не прячет бизнес-термины.'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: 'Валидация',
      title: 'Валидация и lifecycle-правила',
      description: 'Валидация защищает workflow от отсутствующих файлов, неполных секций, слабых предложений и небезопасного архива.',
      blocks: [
        { type: 'section', heading: 'Валидация', paragraphs: ['Валидация проверяет project.md и активные изменения. Для каждого изменения проверяются proposal.md, tasks.md, обязательные секции и структура status.yml. Отсутствующие файлы и секции являются ошибками.'], commands: ['specrow validate [change-name]'] },
        { type: 'section', heading: 'Review warnings', paragraphs: ['Review добавляет readiness-проверки предложения. Пустые acceptance criteria или текст приемки без checklist являются предупреждениями, чтобы агент мог уточнить требования до реализации.'], commands: ['specrow review <change-name>'] },
        { type: 'section', heading: 'Несколько активных изменений', paragraphs: ['List-команда и validation держат активные изменения видимыми. Когда открыто больше одного активного изменения, SpecRow предупреждает о вероятных конфликтах спецификаций или процесса.'], commands: ['specrow list'] },
        { type: 'section', heading: 'Accept gate', paragraphs: ['Accept требует флаг подтверждения через CLI core и явного решения пользователя через agent command. Archive блокируется, пока состояние accepted не содержит записанную явную приемку.'], commands: ['specrow accept <change-name> --yes'] },
        { type: 'section', heading: 'Безопасность архива', paragraphs: ['Archive копирует staged spec updates только после приемки, сохраняет принятое изменение для аудита и отказывается перезаписывать существующую архивную папку с тем же именем.'] },
      ],
    },
    'knowledge-base': {
      eyebrow: 'База знаний',
      title: 'Понятия SpecRow',
      description: 'Основные идеи для работы со спецификациями, изменениями, агентами и SDD.',
      blocks: [
        { type: 'section', heading: 'Что такое SpecRow?', paragraphs: ['SpecRow: небольшой workflow для описания изменений, хранения спецификаций, передачи контекста AI-агенту и явной приемки. Он создан для проектов, где пользователь работает через намерение до CLI-механики.'] },
        { type: 'section', heading: 'Что такое спецификация?', paragraphs: ['Спецификация описывает принятое поведение сфокусированной части системы. В ней есть назначение, текущее поведение, требования, ограничения, решения и проверки.'] },
        { type: 'section', heading: 'Что такое изменение?', paragraphs: ['Изменение: предложенная работа до того, как она станет финальной правдой. У него есть proposal, tasks, status и опциональные staged spec updates. Изменение остается активным до приемки и архива.'] },
        { type: 'section', heading: 'Чем SpecRow отличается от OpenSpec', paragraphs: ['SpecRow держит MVP меньше. Он не клонирует весь surface OpenSpec, сложный delta engine или автоматический resolver конфликтов. Фокус: agent-first UX, намерение пользователя до CLI-механики, явный accept gate, рабочий язык проекта и полностью локализованные встроенные шаблоны.'] },
        { type: 'section', heading: 'Когда использовать CLI напрямую', paragraphs: ['Используйте CLI напрямую для CI, скриптов, автоматизации или ручного fallback. Для обычной продуктовой работы предпочтительнее команды агента, чтобы разговор оставался про намерение пользователя и решения по приемке.'] },
      ],
    },
  },
  es: {
    manifesto: {
      eyebrow: 'Manifiesto',
      title: 'SpecRow',
      description: 'Proceso agent-first de especificaciones, donde el idioma del usuario = el idioma del proyecto, del agente, de las plantillas y de los mensajes del ciclo de vida.',
      blocks: [
        { type: 'section', heading: '1. Idioma del usuario primero', paragraphs: ['Las especificaciones se crean en el idioma que resulte cómodo para el usuario. El trabajo con el sistema debe ser transparente y predecible.'] },
        { type: 'section', heading: '2. Vocabulario compartido', paragraphs: ['El glosario del proyecto forma parte del sistema. Todos los términos de dominio se registran y se usan de forma consistente.'] },
        { type: 'list-section', heading: '3. Representación dual', intro: 'Cada especificación existe en dos representaciones:', items: ['Human view: para personas', 'Agent view: para agentes'], outro: 'Son dos proyecciones de una misma especificación, no dos documentos independientes.' },
        { type: 'section', heading: '4. Flujo basado en cambios', paragraphs: ['Una nueva funcionalidad, corrección o mejora primero existe como un cambio. Después de la implementación y la verificación, el cambio se integra en la especificación vigente.'] },
        { type: 'section', heading: '5. Derivación de tareas', paragraphs: ['Las tareas deben poder derivarse de la especificación. Si una especificación no permite obtener un plan de trabajo claro, la especificación no es suficientemente buena.'] },
        { type: 'section', heading: '6. Especificaciones validables', paragraphs: ['Una especificación debe poder validarse por máquina. La estructura, los enlaces, las secciones obligatorias, los conflictos y las tareas deben validarse.'] },
        { type: 'section', heading: '7. Decisiones explícitas', paragraphs: ['Los agentes no deben tomar decisiones importantes en silencio. Las decisiones de arquitectura, UX, datos y seguridad deben registrarse explícitamente.'] },
        { type: 'section', heading: '8. Contrato ejecutable', paragraphs: ['Una especificación es un contrato ejecutable. Si la implementación o la verificación requieren herramientas, esas herramientas forman parte del sistema.'] },
        { type: 'section', heading: '9. AI opcional', paragraphs: ['El sistema funciona con AI. El sistema funciona sin AI.'] },
      ],
    },
    instructions: {
      eyebrow: 'Instrucciones',
      title: 'Primeros pasos',
      description: 'Usa SpecRow primero con comandos de agente. Usa la CLI para automatización o fallback manual.',
      blocks: [
        { type: 'section', heading: 'Uso normal', paragraphs: ['En el trabajo normal, dile al agente lo que quieres con comandos de SpecRow. El agente puede llamar a la CLI, leer archivos .specrow, ejecutar validación y preparar contexto, pero no necesitas memorizar la CLI.'] },
        { type: 'code-section', heading: 'Inicializar un proyecto', intro: 'Pide al agente que configure SpecRow y elija el idioma de trabajo del proyecto.', code: '/specrow:init language=es', outro: 'El resultado es .specrow/config.yml, project.md, specs/, changes/ y archive/. El campo language se convierte en el idioma por defecto para archivos integrados y salida del ciclo de vida.' },
        { type: 'code-section', heading: 'Crear el primer cambio', intro: 'Describe el resultado esperado, no la mecánica de CLI.', code: '/specrow:proposal Añadir inicio de sesión sin contraseña', outro: 'El agente crea .specrow/changes/<change-name>/proposal.md, tasks.md y status.yml, y luego valida el cambio antes de implementar.' },
        { type: 'section', heading: 'Construir y detenerse', paragraphs: ['Usa review cuando el cambio sea riesgoso o quieras una comprobación de preparación. Usa build para implementar. Build termina en estado built y espera revise o accept.'], commands: ['/specrow:review', '/specrow:build', '/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: 'Revisar o aceptar', paragraphs: ['Usa revise cuando el resultado necesite trabajo adicional. Usa accept solo cuando aceptes explícitamente el resultado construido. Solo la ruta de aceptación puede actualizar specs como verdad final y archivar el cambio.'], commands: ['/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: 'Estructuras locales antiguas', paragraphs: ['Prototipos antiguos pueden haber usado el binario specfly o el workspace .specfly. Los proyectos nuevos usan specrow y .specrow. Mueve los archivos específicos del proyecto que aún necesites a las ubicaciones equivalentes en .specrow.'] },
      ],
    },
    workflow: {
      eyebrow: 'Flujo',
      title: 'De propuesta a aceptación',
      description: 'El flujo MVP es proposal, review, build, revise si hace falta, accept y archive.',
      blocks: [
        { type: 'section', heading: 'Estados del ciclo de vida', paragraphs: ['Cada cambio tiene status.yml con un estado: proposed, reviewed, built, revision-needed, accepted o archived. También registra seguimiento de revisión, aceptación explícita, createdAt y updatedAt.'] },
        { type: 'section', heading: '1. Proposal', paragraphs: ['El agente convierte la intención del usuario en una propuesta concreta y un esqueleto de tareas. Esto crea un directorio bajo .specrow/changes/<change-name>/ y deja el cambio en proposed.'] },
        { type: 'section', heading: '2. Review', paragraphs: ['Review se recomienda por defecto y solo es obligatorio para cambios riesgosos. Comprueba preparación de la propuesta, criterios de aceptación débiles, archivos requeridos y secciones requeridas. Review no es aceptación.'] },
        { type: 'section', heading: '3. Build', paragraphs: ['Build lee proposal, tasks, status y advertencias de cambios activos. Implementa el trabajo acotado y marca el cambio como built. Build no debe archivar, aceptar ni actualizar specs como verdad final.'] },
        { type: 'section', heading: '4. Revise', paragraphs: ['Si el usuario pide cambios después de build, el cambio pasa a revision-needed. El trabajo posterior puede actualizar propuesta, tareas, implementación o evidencia de verificación, pero aún no acepta el cambio.'] },
        { type: 'section', heading: '5. Accept y Archive', paragraphs: ['La aceptación requiere una decisión explícita del usuario. Después de aceptar, archive puede copiar staged spec updates a .specrow/specs/ y mover el cambio aceptado a .specrow/archive/. Las carpetas de archivo existentes no se sobrescriben.'] },
      ],
    },
    'agent-commands': {
      eyebrow: 'Agent UX',
      title: 'Referencia de comandos de agente',
      description: 'Estos son los comandos que el usuario debe recordar. El agente maneja los detalles de CLI como trabajo de implementación.',
      blocks: [
        { type: 'section', heading: '/specrow:init', paragraphs: ['Configura el workspace .specrow. El agente determina el idioma esperado, pregunta si es ambiguo y se detiene si faltan plantillas o mensajes requeridos.'], commands: ['/specrow:init español', '// el agente ejecutará:', '// specrow init --language <language>'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['Convierte intención del usuario en proposal.md, tasks.md y status.yml. No implementa código, no acepta el cambio, no archiva ni actualiza specs como verdad final.'], commands: ['/specrow:proposal Añadir inicio de sesión sin contraseña', '// el agente ejecutará:', '// specrow proposal <change-name>', '// specrow validate <change-name>', '// specrow context <change-name>'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['Comprueba preparación antes de código. Se recomienda para cambios comunes y es obligatorio para seguridad, migraciones de datos, contratos públicos, CI, localización o comportamiento de ciclo de vida.'], commands: ['/specrow:review <change-name>', '// el agente ejecutará:', '// specrow review <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['Implementa el alcance aprobado. Puede cargar contexto, comprobar preparación y terminar marcando el cambio como built. El estado final espera revise o accept.'], commands: ['/specrow:build <change-name>', '// el agente ejecutará:', '// specrow context <change-name>', '// specrow build-start <change-name>', '// specrow build-finish <change-name>'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['Gestiona trabajo adicional solicitado después de build. Revision no es aceptación y no debe archivar el cambio.'], commands: ['/specrow:revise <change-name>', '// el agente ejecutará:', '// specrow revise <change-name>', '// specrow context <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['Registra aceptación explícita del usuario. Es el único comando user-facing que autoriza integración final de specs y archive. Silencio, pruebas verdes o código terminado no son aceptación.'], commands: ['/specrow:accept <change-name>', '// el agente ejecutará:', '// specrow accept <change-name> --yes', '// specrow archive <change-name>'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'Referencia CLI',
      description: 'La CLI es el núcleo técnico para agentes, CI, automatización y fallback manual.',
      blocks: [
        { type: 'section', heading: 'Setup y creación', paragraphs: ['Inicializa el workspace primero y luego crea un cambio con nombre cuando la intención del usuario esté clara.'], commands: ['specrow init', 'specrow proposal <change-name>'] },
        { type: 'section', heading: 'Validación y contexto', paragraphs: ['Valida archivos y secciones requeridas, revisa preparación de la propuesta e imprime contexto legible para agentes.'], commands: ['specrow validate [change-name]', 'specrow review <change-name>', 'specrow context [change-name]'] },
        { type: 'section', heading: 'Comandos lifecycle', paragraphs: ['Usa comandos lifecycle para iniciar implementación, terminar build, pedir revisión, registrar aceptación explícita y archivar solo trabajo aceptado.'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>', 'specrow accept <change-name> --yes', 'specrow archive <change-name>'] },
        { type: 'section', heading: 'Comandos status', paragraphs: ['Muestra un cambio, todos los cambios activos y advertencias cuando varios cambios pueden entrar en conflicto.'], commands: ['specrow status [change-name]', 'specrow list'] },
        { type: 'section', heading: 'Contrato de automatización', paragraphs: ['La salida CLI es concisa para que un agente o CI decida el siguiente paso. Los mensajes integrados usan el idioma configurado del proyecto. Recursos de idioma ausentes fallan con un error claro.'] },
      ],
    },
    templates: {
      eyebrow: 'Plantillas',
      title: 'Archivos integrados',
      description: 'SpecRow genera un conjunto pequeño de archivos Markdown localizados en lugar de clonar un sistema grande de specs.',
      blocks: [
        { type: 'code-section', heading: 'Estructura .specrow', intro: 'La inicialización crea este workspace.', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'config.yml sigue siendo mínimo para MVP: version y language.' },
        { type: 'section', heading: 'project.md', paragraphs: ['project.md registra propósito del proyecto, idioma de trabajo, vocabulario de dominio, notas de arquitectura, restricciones y prácticas de verificación. Los agentes lo leen antes de crear o revisar archivos integrados.'] },
        { type: 'section', heading: 'Specs', paragraphs: ['Las specs describen comportamiento final aceptado. Una spec contiene propósito, comportamiento actual, requisitos, restricciones, decisiones y verificación. Las specs se vuelven verdad final solo mediante aceptación explícita.'] },
        { type: 'section', heading: 'proposal.md', paragraphs: ['Una propuesta describe el cambio previsto: summary, problem, proposed change, scope, out of scope, user impact, risks, decisions, acceptance criteria y spec updates previstos.'] },
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks divide el trabajo en implementation, verification, documentation y acceptance gate. La plantilla recuerda al agente que build termina con revise o accept.'], commands: ['/specrow:revise', '/specrow:accept'] },
      ],
    },
    localization: {
      eyebrow: 'Localización',
      title: 'Idioma del proyecto',
      description: 'El campo language en .specrow/config.yml controla plantillas integradas y mensajes lifecycle.',
      blocks: [
        { type: 'code-section', heading: 'Config', intro: 'La configuración MVP es intencionalmente pequeña.', code: 'version: 1\nlanguage: es', outro: 'Los idiomas integrados soportados son en, ru, es y zh-CN.' },
        { type: 'section', heading: 'Qué usa language', paragraphs: ['La CLI usa language para project.md, specs, proposals, tasks y mensajes lifecycle/status. Los comandos de agente usan el mismo idioma al crear o revisar archivos integrados.'] },
        { type: 'section', heading: 'Sin fallback silencioso', paragraphs: ['Si falta el idioma, plantilla o mensaje solicitado, SpecRow se detiene con un error claro. No debe generar silenciosamente archivos en inglés para un proyecto no inglés.'] },
        { type: 'section', heading: 'Términos de dominio', paragraphs: ['Usa project.md para registrar palabras que deben quedar sin traducir, nombres canónicos de producto, siglas y vocabulario de dominio. Esto hace predecible la localización sin ocultar términos de negocio.'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: 'Validación',
      title: 'Reglas de validación y lifecycle',
      description: 'La validación protege el flujo de archivos ausentes, secciones incompletas, propuestas débiles y acciones de archivo inseguras.',
      blocks: [
        { type: 'section', heading: 'Validación', paragraphs: ['La validación comprueba project.md y cambios activos. Para cada cambio verifica proposal.md, tasks.md, secciones requeridas y forma de status.yml. Archivos o secciones ausentes son errores.'], commands: ['specrow validate [change-name]'] },
        { type: 'section', heading: 'Advertencias de review', paragraphs: ['Review añade comprobaciones de preparación de la propuesta. Acceptance criteria vacíos o texto de aceptación sin checklist son advertencias para que el agente pida aclaración antes de implementar.'], commands: ['specrow review <change-name>'] },
        { type: 'section', heading: 'Varios cambios activos', paragraphs: ['El comando de lista y validation mantienen visibles los cambios activos. Cuando hay más de un cambio activo, SpecRow advierte sobre posibles conflictos de specs o flujo.'], commands: ['specrow list'] },
        { type: 'section', heading: 'Accept gate', paragraphs: ['Accept requiere una bandera de confirmación mediante CLI core y una decisión explícita del usuario mediante comando de agente. Archive queda bloqueado hasta que el estado accepted registre aceptación explícita.'], commands: ['specrow accept <change-name> --yes'] },
        { type: 'section', heading: 'Seguridad de archive', paragraphs: ['Archive copia staged spec updates solo después de aceptación, mantiene auditable el cambio aceptado y rechaza sobrescribir una carpeta de archivo existente con el mismo nombre.'] },
      ],
    },
    'knowledge-base': {
      eyebrow: 'Base de conocimiento',
      title: 'Conceptos de SpecRow',
      description: 'Ideas principales para trabajar con especificaciones, cambios, agentes y SDD.',
      blocks: [
        { type: 'section', heading: '¿Qué es SpecRow?', paragraphs: ['SpecRow es un flujo pequeño para describir cambios, guardar specs, pasar contexto a un agente de AI y mantener aceptación explícita. Está diseñado para proyectos donde el usuario trabaja con intención antes que con mecánica CLI.'] },
        { type: 'section', heading: '¿Qué es una especificación?', paragraphs: ['Una especificación describe comportamiento aceptado para una parte enfocada del sistema. Incluye propósito, comportamiento actual, requisitos, restricciones, decisiones y comprobaciones de verificación.'] },
        { type: 'section', heading: '¿Qué es un cambio?', paragraphs: ['Un cambio es trabajo propuesto antes de convertirse en verdad final. Tiene proposal, tasks, status y spec updates staged opcionales. Permanece activo hasta que se acepta y archiva.'] },
        { type: 'section', heading: 'Cómo difiere SpecRow de OpenSpec', paragraphs: ['SpecRow mantiene el MVP más pequeño. No clona toda la superficie OpenSpec, un delta engine complejo ni un resolver automático de conflictos. Enfatiza UX agent-first, intención del usuario antes de CLI, accept gate explícito, idioma nativo del proyecto y plantillas integradas totalmente localizadas.'] },
        { type: 'section', heading: 'Cuándo usar CLI directamente', paragraphs: ['Usa la CLI directamente para CI, scripts, automatización o fallback manual. Para trabajo normal de producto, prefiere comandos de agente para que la conversación se centre en intención del usuario y decisiones de aceptación.'] },
      ],
    },
  },
  'zh-CN': {
    manifesto: {
      eyebrow: '宣言',
      title: 'SpecRow',
      description: 'Agent-first 规格流程，其中用户语言 = 项目、代理、模板和生命周期消息的语言。',
      blocks: [
        { type: 'section', heading: '1. 用户语言优先', paragraphs: ['规格使用用户方便使用的语言创建。系统的工作方式必须透明且可预测。'] },
        { type: 'section', heading: '2. 共享词汇', paragraphs: ['项目术语表是系统的一部分。所有领域术语都必须被记录，并保持一致使用。'] },
        { type: 'list-section', heading: '3. 双重表示', intro: '每份规格都有两种表示：', items: ['Human view：面向人', 'Agent view：面向代理'], outro: '它们是同一份规格的两个投影，而不是两个相互独立的文档。' },
        { type: 'section', heading: '4. 变更优先流程', paragraphs: ['新的功能、修复或改进首先以变更的形式存在。在实现和验证之后，该变更会被集成到当前规格中。'] },
        { type: 'section', heading: '5. 任务推导', paragraphs: ['任务必须能够从规格中推导出来。如果无法从规格得到清晰的工作计划，说明这份规格还不够好。'] },
        { type: 'section', heading: '6. 可验证规格', paragraphs: ['规格必须可以被机器验证。结构、链接、必需章节、冲突和任务都必须能够被验证。'] },
        { type: 'section', heading: '7. 明确决策', paragraphs: ['代理不能默默做出重要决策。架构、UX、数据和安全决策都必须被明确记录。'] },
        { type: 'section', heading: '8. 可执行契约', paragraphs: ['规格是一份可执行契约。如果实现或验证需要工具，这些工具就是系统的一部分。'] },
        { type: 'section', heading: '9. AI 可选', paragraphs: ['系统可以与 AI 一起工作。系统也可以在没有 AI 的情况下工作。'] },
      ],
    },
    instructions: {
      eyebrow: '使用说明',
      title: '开始使用',
      description: '优先通过代理命令使用 SpecRow。需要自动化或手动 fallback 时再使用 CLI。',
      blocks: [
        { type: 'section', heading: '常规使用', paragraphs: ['日常工作中，用 SpecRow 代理命令告诉代理你的意图。代理可以调用 CLI、读取 .specrow 文件、运行验证并准备上下文，但用户不需要记住 CLI。'] },
        { type: 'code-section', heading: '初始化项目', intro: '让代理设置 SpecRow，并选择项目工作语言。', code: '/specrow:init language=zh-CN', outro: '结果是 .specrow/config.yml、project.md、specs/、changes/ 和 archive/。language 字段成为内置文件和生命周期输出的默认语言。' },
        { type: 'code-section', heading: '创建第一个变更', intro: '描述期望结果，而不是 CLI 机制。', code: '/specrow:proposal 添加无密码登录', outro: '代理会创建 .specrow/changes/<change-name>/proposal.md、tasks.md 和 status.yml，然后在实现前验证该变更。' },
        { type: 'section', heading: '构建并停止', paragraphs: ['当变更有风险或需要 readiness check 时使用 review。使用 build 进行实现。Build 结束于 built 状态，并等待 revise 或 accept。'], commands: ['/specrow:review', '/specrow:build', '/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: '修订或接受', paragraphs: ['如果结果需要后续修改，使用 revise。只有在你明确接受构建结果时，才使用 accept。只有 accept 路径可以把规格更新为最终事实并归档变更。'], commands: ['/specrow:revise', '/specrow:accept'] },
        { type: 'section', heading: '旧本地结构', paragraphs: ['旧原型可能使用过 specfly 二进制或 .specfly 工作区。新项目使用 specrow 和 .specrow。把仍然需要的项目文件移动到 .specrow 中对应的位置。'] },
      ],
    },
    workflow: {
      eyebrow: '工作流',
      title: '从提案到验收',
      description: 'MVP 工作流是 proposal、review、build、必要时 revise、accept 和 archive。',
      blocks: [
        { type: 'section', heading: '生命周期状态', paragraphs: ['每个变更都有 status.yml，状态为 proposed、reviewed、built、revision-needed、accepted 或 archived。它还记录评审跟踪、明确验收、createdAt 和 updatedAt。'] },
        { type: 'section', heading: '1. Proposal', paragraphs: ['代理把用户意图转成具体提案和任务骨架。这会在 .specrow/changes/<change-name>/ 下创建目录，并让变更处于 proposed 状态。'] },
        { type: 'section', heading: '2. Review', paragraphs: ['默认建议 review，只有高风险变更才强制要求。它检查提案准备度、薄弱验收标准、必需文件和必需章节。Review 不是验收。'] },
        { type: 'section', heading: '3. Build', paragraphs: ['Build 读取 proposal、tasks、status 和活跃变更警告。它实现限定范围内的工作，并将变更标记为 built。Build 不得归档、验收或把规格更新为最终事实。'] },
        { type: 'section', heading: '4. Revise', paragraphs: ['如果用户在 build 后要求修改，变更进入 revision-needed。后续工作可以更新提案、任务、实现或验证证据，但仍然不验收该变更。'] },
        { type: 'section', heading: '5. Accept 和 Archive', paragraphs: ['验收需要用户明确决定。验收后，archive 可以把 staged spec updates 复制到 .specrow/specs/，并把已验收变更移动到 .specrow/archive/。现有归档目录不会被覆盖。'] },
      ],
    },
    'agent-commands': {
      eyebrow: '代理 UX',
      title: '代理命令参考',
      description: '这些是用户需要记住的命令。CLI 细节由代理作为实现工作处理。',
      blocks: [
        { type: 'section', heading: '/specrow:init', paragraphs: ['设置 .specrow 工作区。代理确定目标语言，遇到歧义时询问，并在缺少必需模板或消息时停止。'], commands: ['/specrow:init 简体中文', '// 代理将执行：', '// specrow init --language <language>'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['把用户意图转成 proposal.md、tasks.md 和 status.yml。它不实现代码、不验收变更、不归档，也不把规格更新为最终事实。'], commands: ['/specrow:proposal 添加无密码登录', '// 代理将执行：', '// specrow proposal <change-name>', '// specrow validate <change-name>', '// specrow context <change-name>'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['在写代码前检查提案准备度。普通变更建议使用；安全、数据迁移、公共契约、CI、本地化或生命周期行为等高风险工作必须使用。'], commands: ['/specrow:review <change-name>', '// 代理将执行：', '// specrow review <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['实现已批准范围。它可以加载上下文、检查准备度，并在结束时将变更标记为 built。最终状态等待 revise 或 accept。'], commands: ['/specrow:build <change-name>', '// 代理将执行：', '// specrow context <change-name>', '// specrow build-start <change-name>', '// specrow build-finish <change-name>'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['处理 build 后请求的后续修改。Revision 不是验收，也不得归档变更。'], commands: ['/specrow:revise <change-name>', '// 代理将执行：', '// specrow revise <change-name>', '// specrow context <change-name>', '// specrow validate <change-name>'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['记录用户明确验收。这是唯一允许最终规格集成和 archive 的 user-facing 命令。沉默、测试通过或代码完成都不是验收。'], commands: ['/specrow:accept <change-name>', '// 代理将执行：', '// specrow accept <change-name> --yes', '// specrow archive <change-name>'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI 参考',
      description: 'CLI 是代理、CI、自动化和手动 fallback 使用的技术核心。',
      blocks: [
        { type: 'section', heading: 'Setup 和创建', paragraphs: ['先初始化工作区，然后在用户意图明确时创建命名变更。'], commands: ['specrow init', 'specrow proposal <change-name>'] },
        { type: 'section', heading: '验证和上下文', paragraphs: ['验证必需文件和章节、检查提案准备度，并输出代理可读上下文。'], commands: ['specrow validate [change-name]', 'specrow review <change-name>', 'specrow context [change-name]'] },
        { type: 'section', heading: '生命周期命令', paragraphs: ['使用生命周期命令开始实现、完成 build、请求修订、记录明确验收，并只归档已验收工作。'], commands: ['specrow build-start <change-name>', 'specrow build-finish <change-name>', 'specrow revise <change-name>', 'specrow accept <change-name> --yes', 'specrow archive <change-name>'] },
        { type: 'section', heading: 'Status 命令', paragraphs: ['显示单个变更、所有活跃变更，以及多个变更可能冲突时的警告。'], commands: ['specrow status [change-name]', 'specrow list'] },
        { type: 'section', heading: '自动化契约', paragraphs: ['CLI 输出保持简洁，便于代理或 CI 判断下一步。内置状态消息使用项目配置语言。缺少语言资源会以清晰错误失败。'] },
      ],
    },
    templates: {
      eyebrow: '模板',
      title: '内置文件',
      description: 'SpecRow 生成少量本地化 Markdown 文件，而不是复制大型规格系统。',
      blocks: [
        { type: 'code-section', heading: '.specrow 结构', intro: '初始化会创建此工作区。', code: '.specrow/\n  config.yml\n  project.md\n  specs/\n  changes/\n  archive/', outro: 'MVP 中 config.yml 保持最小：version 和 language。' },
        { type: 'section', heading: 'project.md', paragraphs: ['project.md 记录项目目的、工作语言、领域词汇、架构说明、约束和验证实践。代理在创建或修订内置文件前读取它。'] },
        { type: 'section', heading: 'Specs', paragraphs: ['Specs 描述最终接受的行为。一份 spec 包含目的、当前行为、需求、约束、决策和验证。只有明确验收后，specs 才成为最终事实。'] },
        { type: 'section', heading: 'proposal.md', paragraphs: ['提案描述预期变更：summary、problem、proposed change、scope、out of scope、user impact、risks、decisions、acceptance criteria 和预期 spec updates。'] },
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks 将工作拆分为 implementation、verification、documentation 和 acceptance gate。模板提醒代理 build 结束后下一步是 revise 或 accept。'], commands: ['/specrow:revise', '/specrow:accept'] },
      ],
    },
    localization: {
      eyebrow: '本地化',
      title: '项目语言',
      description: '.specrow/config.yml 中的 language 字段控制内置模板和生命周期消息。',
      blocks: [
        { type: 'code-section', heading: 'Config', intro: 'MVP 配置有意保持很小。', code: 'version: 1\nlanguage: zh-CN', outro: '支持的内置语言是 en、ru、es 和 zh-CN。' },
        { type: 'section', heading: '哪些内容使用 language', paragraphs: ['CLI 将 language 用于 project.md、specs、proposals、tasks 以及 lifecycle/status 消息。代理命令在创建或修订内置文件时使用相同语言。'] },
        { type: 'section', heading: '没有静默 fallback', paragraphs: ['如果请求的语言、模板或消息缺失，SpecRow 会以清晰错误停止。它不得为非英文项目静默生成英文文件。'] },
        { type: 'section', heading: '领域术语', paragraphs: ['使用 project.md 记录应保持不翻译的词、规范产品名、缩写和领域词汇。这让本地化可预测，同时不隐藏业务术语。'] },
      ],
    },
    'validation-lifecycle': {
      eyebrow: '验证',
      title: '验证和生命周期规则',
      description: '验证保护工作流，避免缺失文件、不完整章节、薄弱提案和不安全归档。',
      blocks: [
        { type: 'section', heading: '验证', paragraphs: ['验证会检查 project.md 和活跃变更。对每个变更，它验证 proposal.md、tasks.md、必需章节和 status.yml 结构。缺失文件和缺失章节是错误。'], commands: ['specrow validate [change-name]'] },
        { type: 'section', heading: 'Review 警告', paragraphs: ['Review 增加提案准备度检查。空的 acceptance criteria 或没有 checklist 的验收文本会产生警告，让代理在实现前请求澄清。'], commands: ['specrow review <change-name>'] },
        { type: 'section', heading: '多个活跃变更', paragraphs: ['List 命令和 validation 让活跃变更保持可见。当存在多个活跃变更时，SpecRow 会警告可能的规格或流程冲突。'], commands: ['specrow list'] },
        { type: 'section', heading: 'Accept gate', paragraphs: ['Accept 需要通过 CLI core 的确认标志，以及通过代理命令得到用户明确验收决定。在 accepted 状态记录明确验收前，archive 会被阻止。'], commands: ['specrow accept <change-name> --yes'] },
        { type: 'section', heading: 'Archive 安全', paragraphs: ['Archive 只在验收后复制 staged spec updates，保留已验收变更以便审计，并拒绝覆盖同名的现有归档目录。'] },
      ],
    },
    'knowledge-base': {
      eyebrow: '知识库',
      title: 'SpecRow 概念',
      description: '处理规格、变更、代理和 SDD 的核心概念。',
      blocks: [
        { type: 'section', heading: '什么是 SpecRow？', paragraphs: ['SpecRow 是一个小型工作流，用于描述变更、保存规格、向 AI 代理传递上下文，并保持明确验收。它适合用户先表达意图、再处理 CLI 机制的项目。'] },
        { type: 'section', heading: '什么是规格？', paragraphs: ['规格描述系统某个聚焦部分的已接受行为。它包含目的、当前行为、需求、约束、决策和验证检查。'] },
        { type: 'section', heading: '什么是变更？', paragraphs: ['变更是在成为最终事实之前的提议工作。它包含 proposal、tasks、status 和可选 staged spec updates。变更在验收并归档前保持活跃。'] },
        { type: 'section', heading: 'SpecRow 与 OpenSpec 的区别', paragraphs: ['SpecRow 保持 MVP 更小。它不复制完整 OpenSpec surface、复杂 delta engine 或自动冲突 resolver。它强调 agent-first UX、先用户意图后 CLI、明确 accept gate、项目原生工作语言，以及完全本地化的内置模板。'] },
        { type: 'section', heading: '何时直接使用 CLI', paragraphs: ['在 CI、脚本、自动化或手动 fallback 中直接使用 CLI。日常产品工作优先使用代理命令，让对话聚焦于用户意图和验收决策。'] },
      ],
    },
  },
}
