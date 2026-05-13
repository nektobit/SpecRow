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
  | { type: 'section'; heading: string; paragraphs: Paragraph[] }
  | { type: 'list-section'; heading: string; intro: string; items: string[]; outro: string }
  | { type: 'code-section'; heading: string; intro: string; code: string; outro: string }
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
        "SpecRow is an agent-first specification workflow where the project language is the working language for users, agents, templates, and lifecycle messages.",
      blocks: [
        { type: 'section', heading: '1. User Intent First', paragraphs: ['Users work through clear intentions such as /specrow:proposal and /specrow:accept. CLI commands remain available as the technical core for agents, CI, automation, and manual fallback.'] },
        { type: 'section', heading: '2. Project Language First', paragraphs: ['The language in .specrow/config.yml is the language of built-in files, proposals, tasks, specs, and lifecycle output. Missing language resources are errors, not English fallback cases.'] },
        { type: 'section', heading: '3. Shared Vocabulary', paragraphs: ['The project glossary is part of the system. Domain terms, canonical names, acronyms, and words that must not be translated live in project.md.'] },
        { type: 'section', heading: '4. Change-First Workflow', paragraphs: ['A feature, fix, or improvement starts as a change. It becomes final project truth only after implementation, verification, and explicit user acceptance.'] },
        { type: 'section', heading: '5. Explicit Decisions', paragraphs: ['Agents must not silently make important decisions. Scope, risk, architecture, UX, data, security, and localization decisions are recorded in the proposal or spec.'] },
        { type: 'section', heading: '6. Accept Gate', paragraphs: ['Build is not acceptance. Passing tests is not acceptance. Specs and archive are updated only when the user explicitly accepts the work.'] },
      ],
    },
    instructions: {
      eyebrow: 'Instructions',
      title: 'Getting Started',
      description: 'Use SpecRow through agent commands first. Use the CLI when you need automation or a manual fallback.',
      blocks: [
        { type: 'section', heading: 'Normal Use', paragraphs: ['In regular work, tell the agent what you want with /specrow:* commands. The agent may call the CLI, read .specrow files, run validation, and prepare context, but you do not need to memorize the CLI.'] },
        { type: 'code-section', heading: 'Initialize A Project', intro: 'Ask the agent to set up SpecRow and choose the project working language.', code: '/specrow:init language=en', outro: 'The result is .specrow/config.yml, project.md, specs/, changes/, and archive/. The language field becomes the default language for built-in files and lifecycle output.' },
        { type: 'code-section', heading: 'Create The First Change', intro: 'Describe the intended outcome, not CLI mechanics.', code: '/specrow:proposal Add passwordless sign-in', outro: 'The agent creates .specrow/changes/<change-name>/proposal.md, tasks.md, and status.yml, then validates the change before implementation.' },
        { type: 'section', heading: 'Build And Stop', paragraphs: ['Use /specrow:review when the change is risky or when you want a readiness check. Use /specrow:build to implement. Build ends in the built state and waits for /specrow:accept or /specrow:revise.'] },
        { type: 'section', heading: 'Accept Or Revise', paragraphs: ['Use /specrow:revise when the result needs follow-up work. Use /specrow:accept only when you explicitly accept the built result. Only the accept path may update specs as final truth and archive the change.'] },
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
        { type: 'section', heading: '/specrow:init', paragraphs: ['Sets up the .specrow workspace. The agent determines the intended language, asks when it is ambiguous, and stops if required templates or messages are missing.'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['Turns user intent into proposal.md, tasks.md, and status.yml. It does not implement code, accept the change, archive the change, or update specs as final truth.'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['Checks proposal readiness before code. It is recommended for ordinary changes and required for risky work such as security, data migrations, public contracts, CI, localization, or lifecycle behavior.'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['Implements the approved scope. It may use specrow context, specrow build-start, and specrow build-finish. The final state waits for /specrow:accept or /specrow:revise.'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['Handles requested follow-up work after build. Revision is not acceptance and must not archive the change.'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['Records explicit user acceptance. This is the only user-facing command that authorizes final spec integration and archive. Silence, passing tests, or completed code are not acceptance.'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI Reference',
      description: 'The CLI is the technical core used by agents, CI, automation, and manual fallback.',
      blocks: [
        { type: 'section', heading: 'Setup And Creation', paragraphs: ['specrow init creates .specrow and the minimal workspace. specrow proposal <change-name> creates proposal.md, tasks.md, and status.yml for a new change.'] },
        { type: 'section', heading: 'Validation And Context', paragraphs: ['specrow validate [change-name] checks required files and sections. specrow review <change-name> adds readiness warnings and marks review complete when there are no blocking errors. specrow context [change-name] prints agent-readable JSON.'] },
        { type: 'section', heading: 'Lifecycle Commands', paragraphs: ['specrow build-start <change-name> checks readiness. specrow build-finish <change-name> marks the change built and prints the next step. specrow revise <change-name> marks revision-needed. specrow accept <change-name> --yes records explicit acceptance. specrow archive <change-name> archives only accepted changes.'] },
        { type: 'section', heading: 'Status Commands', paragraphs: ['specrow status [change-name] prints one change or all active changes. specrow list lists active changes and warns when multiple changes may conflict.'] },
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
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks split work into implementation, verification, documentation, and the acceptance gate. The template reminds agents that build ends with /specrow:accept or /specrow:revise.'] },
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
        { type: 'section', heading: 'Validation', paragraphs: ['specrow validate checks project.md and active changes. For each change it verifies proposal.md, tasks.md, required sections, and status.yml shape. Missing files and missing sections are errors.'] },
        { type: 'section', heading: 'Review Warnings', paragraphs: ['specrow review adds proposal readiness checks. Empty acceptance criteria or acceptance text without a checklist are warnings so the agent can ask for clarification before implementation.'] },
        { type: 'section', heading: 'Multiple Active Changes', paragraphs: ['specrow list and validation keep active changes visible. When more than one active change exists, SpecRow warns about likely spec or workflow conflicts.'] },
        { type: 'section', heading: 'Accept Gate', paragraphs: ['accept requires --yes through the CLI core and an explicit user acceptance decision through the agent command. Archive is blocked until the accepted state records explicit acceptance.'] },
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
      description: 'SpecRow: agent-first процесс спецификаций, где язык проекта является рабочим языком пользователя, агента, шаблонов и сообщений жизненного цикла.',
      blocks: [
        { type: 'section', heading: '1. Сначала намерение пользователя', paragraphs: ['Пользователь работает через понятные намерения: /specrow:proposal, /specrow:accept и другие команды агента. CLI остается техническим ядром для агентов, CI, автоматизации и ручного fallback.'] },
        { type: 'section', heading: '2. Сначала язык проекта', paragraphs: ['Язык в .specrow/config.yml используется для встроенных файлов, предложений, задач, спецификаций и lifecycle-вывода. Отсутствующие языковые ресурсы являются ошибкой, а не поводом перейти на английский.'] },
        { type: 'section', heading: '3. Общий словарь', paragraphs: ['Проектный глоссарий является частью системы. Доменные термины, канонические названия, сокращения и слова, которые нельзя переводить, фиксируются в project.md.'] },
        { type: 'section', heading: '4. Сначала изменение', paragraphs: ['Фича, исправление или улучшение сначала существуют как изменение. Финальной правдой проекта они становятся только после реализации, проверки и явной приемки пользователем.'] },
        { type: 'section', heading: '5. Явные решения', paragraphs: ['Агент не должен молча принимать важные решения. Область, риски, архитектура, UX, данные, безопасность и локализация фиксируются в предложении или спецификации.'] },
        { type: 'section', heading: '6. Шлюз приемки', paragraphs: ['Сборка не является приемкой. Успешные тесты не являются приемкой. Спецификации и архив обновляются только после явной приемки пользователем.'] },
      ],
    },
    instructions: {
      eyebrow: 'Инструкция',
      title: 'Начало работы',
      description: 'Используйте SpecRow в первую очередь через команды агента. CLI нужен для автоматизации и ручного fallback.',
      blocks: [
        { type: 'section', heading: 'Обычная работа', paragraphs: ['В обычной работе формулируйте задачу агенту через команды /specrow:*. Агент может вызывать CLI, читать файлы .specrow, запускать валидацию и готовить контекст, но пользователю не нужно запоминать CLI.'] },
        { type: 'code-section', heading: 'Инициализация проекта', intro: 'Попросите агента настроить SpecRow и выбрать рабочий язык проекта.', code: '/specrow:init language=ru', outro: 'Результат: .specrow/config.yml, project.md, specs/, changes/ и archive/. Поле language задает язык встроенных файлов и lifecycle-вывода.' },
        { type: 'code-section', heading: 'Первое изменение', intro: 'Описывайте желаемый результат, а не CLI-механику.', code: '/specrow:proposal Добавить вход без пароля', outro: 'Агент создает .specrow/changes/<change-name>/proposal.md, tasks.md и status.yml, затем валидирует изменение до реализации.' },
        { type: 'section', heading: 'Сборка и остановка', paragraphs: ['Используйте /specrow:review для рискованных изменений или когда нужен readiness check. Используйте /specrow:build для реализации. Сборка завершается состоянием built и ждет /specrow:accept или /specrow:revise.'] },
        { type: 'section', heading: 'Принять или доработать', paragraphs: ['Используйте /specrow:revise, если результат требует доработки. Используйте /specrow:accept только когда вы явно принимаете результат. Только accept-путь может обновлять спецификации как финальную правду и архивировать изменение.'] },
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
        { type: 'section', heading: '/specrow:init', paragraphs: ['Настраивает рабочее пространство .specrow. Агент определяет язык проекта, уточняет его при неоднозначности и останавливается, если нужных шаблонов или сообщений нет.'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['Превращает намерение пользователя в proposal.md, tasks.md и status.yml. Не реализует код, не принимает изменение, не архивирует и не обновляет спеки как финальную правду.'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['Проверяет готовность предложения до кода. Рекомендуется для обычных изменений и обязателен для security, миграций данных, публичных контрактов, CI, локализации или lifecycle-поведения.'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['Реализует согласованный scope. Может использовать specrow context, specrow build-start и specrow build-finish. Финальное состояние ждет /specrow:accept или /specrow:revise.'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['Обрабатывает запрошенные доработки после build. Revision не является приемкой и не должен архивировать изменение.'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['Фиксирует явную приемку пользователя. Это единственная user-facing команда, которая разрешает финальную интеграцию спецификаций и архив. Молчание, зеленые тесты или готовый код не являются приемкой.'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI-справочник',
      description: 'CLI является техническим ядром для агентов, CI, автоматизации и ручного fallback.',
      blocks: [
        { type: 'section', heading: 'Setup и создание', paragraphs: ['specrow init создает .specrow и минимальное рабочее пространство. specrow proposal <change-name> создает proposal.md, tasks.md и status.yml для нового изменения.'] },
        { type: 'section', heading: 'Валидация и контекст', paragraphs: ['specrow validate [change-name] проверяет обязательные файлы и секции. specrow review <change-name> добавляет readiness-предупреждения и отмечает review completed, если нет блокирующих ошибок. specrow context [change-name] печатает agent-readable JSON.'] },
        { type: 'section', heading: 'Lifecycle-команды', paragraphs: ['specrow build-start <change-name> проверяет готовность. specrow build-finish <change-name> переводит изменение в built и печатает следующий шаг. specrow revise <change-name> ставит revision-needed. specrow accept <change-name> --yes записывает явную приемку. specrow archive <change-name> архивирует только принятые изменения.'] },
        { type: 'section', heading: 'Status-команды', paragraphs: ['specrow status [change-name] показывает одно изменение или все активные. specrow list выводит активные изменения и предупреждает, когда несколько изменений могут конфликтовать.'] },
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
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks делит работу на implementation, verification, documentation и acceptance gate. Шаблон напоминает агенту, что build заканчивается /specrow:accept или /specrow:revise.'] },
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
        { type: 'section', heading: 'Валидация', paragraphs: ['specrow validate проверяет project.md и активные изменения. Для каждого изменения проверяются proposal.md, tasks.md, обязательные секции и структура status.yml. Отсутствующие файлы и секции являются ошибками.'] },
        { type: 'section', heading: 'Review warnings', paragraphs: ['specrow review добавляет readiness-проверки предложения. Пустые acceptance criteria или текст приемки без checklist являются предупреждениями, чтобы агент мог уточнить требования до реализации.'] },
        { type: 'section', heading: 'Несколько активных изменений', paragraphs: ['specrow list и validation держат активные изменения видимыми. Когда открыто больше одного активного изменения, SpecRow предупреждает о вероятных конфликтах спецификаций или процесса.'] },
        { type: 'section', heading: 'Accept gate', paragraphs: ['accept требует --yes через CLI core и явного решения пользователя через agent command. Archive блокируется, пока состояние accepted не содержит записанную явную приемку.'] },
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
      description: 'SpecRow es un flujo de especificaciones agent-first donde el idioma del proyecto es el idioma de trabajo para usuarios, agentes, plantillas y mensajes del ciclo de vida.',
      blocks: [
        { type: 'section', heading: '1. Primero la intención del usuario', paragraphs: ['Los usuarios trabajan con intenciones claras como /specrow:proposal y /specrow:accept. La CLI queda disponible como núcleo técnico para agentes, CI, automatización y fallback manual.'] },
        { type: 'section', heading: '2. Primero el idioma del proyecto', paragraphs: ['El idioma en .specrow/config.yml se usa para archivos integrados, propuestas, tareas, especificaciones y salida del ciclo de vida. Los recursos de idioma ausentes son errores, no casos de fallback a inglés.'] },
        { type: 'section', heading: '3. Vocabulario compartido', paragraphs: ['El glosario del proyecto forma parte del sistema. Términos de dominio, nombres canónicos, siglas y palabras que no deben traducirse viven en project.md.'] },
        { type: 'section', heading: '4. Flujo basado en cambios', paragraphs: ['Una funcionalidad, corrección o mejora empieza como un cambio. Solo se convierte en verdad final del proyecto después de implementación, verificación y aceptación explícita del usuario.'] },
        { type: 'section', heading: '5. Decisiones explícitas', paragraphs: ['Los agentes no deben tomar decisiones importantes en silencio. Alcance, riesgos, arquitectura, UX, datos, seguridad y localización se registran en la propuesta o la especificación.'] },
        { type: 'section', heading: '6. Puerta de aceptación', paragraphs: ['Build no es aceptación. Pruebas exitosas no son aceptación. Las especificaciones y el archivo solo se actualizan cuando el usuario acepta explícitamente el trabajo.'] },
      ],
    },
    instructions: {
      eyebrow: 'Instrucciones',
      title: 'Primeros pasos',
      description: 'Usa SpecRow primero con comandos de agente. Usa la CLI para automatización o fallback manual.',
      blocks: [
        { type: 'section', heading: 'Uso normal', paragraphs: ['En el trabajo normal, dile al agente lo que quieres con comandos /specrow:*. El agente puede llamar a la CLI, leer archivos .specrow, ejecutar validación y preparar contexto, pero no necesitas memorizar la CLI.'] },
        { type: 'code-section', heading: 'Inicializar un proyecto', intro: 'Pide al agente que configure SpecRow y elija el idioma de trabajo del proyecto.', code: '/specrow:init language=es', outro: 'El resultado es .specrow/config.yml, project.md, specs/, changes/ y archive/. El campo language se convierte en el idioma por defecto para archivos integrados y salida del ciclo de vida.' },
        { type: 'code-section', heading: 'Crear el primer cambio', intro: 'Describe el resultado esperado, no la mecánica de CLI.', code: '/specrow:proposal Añadir inicio de sesión sin contraseña', outro: 'El agente crea .specrow/changes/<change-name>/proposal.md, tasks.md y status.yml, y luego valida el cambio antes de implementar.' },
        { type: 'section', heading: 'Construir y detenerse', paragraphs: ['Usa /specrow:review cuando el cambio sea riesgoso o quieras una comprobación de preparación. Usa /specrow:build para implementar. Build termina en estado built y espera /specrow:accept o /specrow:revise.'] },
        { type: 'section', heading: 'Aceptar o revisar', paragraphs: ['Usa /specrow:revise cuando el resultado necesite trabajo adicional. Usa /specrow:accept solo cuando aceptes explícitamente el resultado construido. Solo la ruta de aceptación puede actualizar specs como verdad final y archivar el cambio.'] },
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
        { type: 'section', heading: '/specrow:init', paragraphs: ['Configura el workspace .specrow. El agente determina el idioma esperado, pregunta si es ambiguo y se detiene si faltan plantillas o mensajes requeridos.'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['Convierte intención del usuario en proposal.md, tasks.md y status.yml. No implementa código, no acepta el cambio, no archiva ni actualiza specs como verdad final.'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['Comprueba preparación antes de código. Se recomienda para cambios comunes y es obligatorio para seguridad, migraciones de datos, contratos públicos, CI, localización o comportamiento de ciclo de vida.'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['Implementa el alcance aprobado. Puede usar specrow context, specrow build-start y specrow build-finish. El estado final espera /specrow:accept o /specrow:revise.'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['Gestiona trabajo adicional solicitado después de build. Revision no es aceptación y no debe archivar el cambio.'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['Registra aceptación explícita del usuario. Es el único comando user-facing que autoriza integración final de specs y archive. Silencio, pruebas verdes o código terminado no son aceptación.'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'Referencia CLI',
      description: 'La CLI es el núcleo técnico para agentes, CI, automatización y fallback manual.',
      blocks: [
        { type: 'section', heading: 'Setup y creación', paragraphs: ['specrow init crea .specrow y el workspace mínimo. specrow proposal <change-name> crea proposal.md, tasks.md y status.yml para un nuevo cambio.'] },
        { type: 'section', heading: 'Validación y contexto', paragraphs: ['specrow validate [change-name] comprueba archivos y secciones requeridas. specrow review <change-name> añade advertencias de preparación y marca review completed si no hay errores bloqueantes. specrow context [change-name] imprime JSON legible para agentes.'] },
        { type: 'section', heading: 'Comandos lifecycle', paragraphs: ['specrow build-start <change-name> comprueba preparación. specrow build-finish <change-name> marca built e imprime el siguiente paso. specrow revise <change-name> marca revision-needed. specrow accept <change-name> --yes registra aceptación explícita. specrow archive <change-name> archiva solo cambios aceptados.'] },
        { type: 'section', heading: 'Comandos status', paragraphs: ['specrow status [change-name] imprime un cambio o todos los activos. specrow list lista cambios activos y advierte cuando varios cambios pueden entrar en conflicto.'] },
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
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks divide el trabajo en implementation, verification, documentation y acceptance gate. La plantilla recuerda al agente que build termina con /specrow:accept o /specrow:revise.'] },
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
        { type: 'section', heading: 'Validación', paragraphs: ['specrow validate comprueba project.md y cambios activos. Para cada cambio verifica proposal.md, tasks.md, secciones requeridas y forma de status.yml. Archivos o secciones ausentes son errores.'] },
        { type: 'section', heading: 'Advertencias de review', paragraphs: ['specrow review añade comprobaciones de preparación de la propuesta. Acceptance criteria vacíos o texto de aceptación sin checklist son advertencias para que el agente pida aclaración antes de implementar.'] },
        { type: 'section', heading: 'Varios cambios activos', paragraphs: ['specrow list y validation mantienen visibles los cambios activos. Cuando hay más de un cambio activo, SpecRow advierte sobre posibles conflictos de specs o flujo.'] },
        { type: 'section', heading: 'Accept gate', paragraphs: ['accept requiere --yes mediante CLI core y una decisión explícita del usuario mediante comando de agente. Archive queda bloqueado hasta que el estado accepted registre aceptación explícita.'] },
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
      description: 'SpecRow 是 agent-first 的规格工作流。项目语言就是用户、代理、模板和生命周期消息的工作语言。',
      blocks: [
        { type: 'section', heading: '1. 用户意图优先', paragraphs: ['用户通过 /specrow:proposal、/specrow:accept 等明确意图工作。CLI 仍然作为代理、CI、自动化和手动 fallback 的技术核心。'] },
        { type: 'section', heading: '2. 项目语言优先', paragraphs: ['.specrow/config.yml 中的 language 用于内置文件、提案、任务、规格和生命周期输出。缺少语言资源是错误，不是回退到英文的情况。'] },
        { type: 'section', heading: '3. 共享词汇', paragraphs: ['项目术语表是系统的一部分。领域术语、规范名称、缩写和不能翻译的词记录在 project.md 中。'] },
        { type: 'section', heading: '4. 变更优先流程', paragraphs: ['功能、修复或改进首先作为变更存在。只有实现、验证并经过用户明确验收后，它才成为项目最终事实。'] },
        { type: 'section', heading: '5. 明确决策', paragraphs: ['代理不能静默做出重要决策。范围、风险、架构、UX、数据、安全和本地化决策都要记录在提案或规格中。'] },
        { type: 'section', heading: '6. 验收门禁', paragraphs: ['构建不是验收。测试通过不是验收。只有用户明确验收后，规格和归档才会更新。'] },
      ],
    },
    instructions: {
      eyebrow: '使用说明',
      title: '开始使用',
      description: '优先通过代理命令使用 SpecRow。需要自动化或手动 fallback 时再使用 CLI。',
      blocks: [
        { type: 'section', heading: '常规使用', paragraphs: ['日常工作中，用 /specrow:* 命令告诉代理你的意图。代理可以调用 CLI、读取 .specrow 文件、运行验证并准备上下文，但用户不需要记住 CLI。'] },
        { type: 'code-section', heading: '初始化项目', intro: '让代理设置 SpecRow，并选择项目工作语言。', code: '/specrow:init language=zh-CN', outro: '结果是 .specrow/config.yml、project.md、specs/、changes/ 和 archive/。language 字段成为内置文件和生命周期输出的默认语言。' },
        { type: 'code-section', heading: '创建第一个变更', intro: '描述期望结果，而不是 CLI 机制。', code: '/specrow:proposal 添加无密码登录', outro: '代理会创建 .specrow/changes/<change-name>/proposal.md、tasks.md 和 status.yml，然后在实现前验证该变更。' },
        { type: 'section', heading: '构建并停止', paragraphs: ['当变更有风险或需要 readiness check 时使用 /specrow:review。使用 /specrow:build 进行实现。Build 结束于 built 状态，并等待 /specrow:accept 或 /specrow:revise。'] },
        { type: 'section', heading: '接受或修订', paragraphs: ['如果结果需要后续修改，使用 /specrow:revise。只有在你明确接受构建结果时，才使用 /specrow:accept。只有 accept 路径可以把规格更新为最终事实并归档变更。'] },
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
        { type: 'section', heading: '/specrow:init', paragraphs: ['设置 .specrow 工作区。代理确定目标语言，遇到歧义时询问，并在缺少必需模板或消息时停止。'] },
        { type: 'section', heading: '/specrow:proposal', paragraphs: ['把用户意图转成 proposal.md、tasks.md 和 status.yml。它不实现代码、不验收变更、不归档，也不把规格更新为最终事实。'] },
        { type: 'section', heading: '/specrow:review', paragraphs: ['在写代码前检查提案准备度。普通变更建议使用；安全、数据迁移、公共契约、CI、本地化或生命周期行为等高风险工作必须使用。'] },
        { type: 'section', heading: '/specrow:build', paragraphs: ['实现已批准范围。可使用 specrow context、specrow build-start 和 specrow build-finish。最终状态等待 /specrow:accept 或 /specrow:revise。'] },
        { type: 'section', heading: '/specrow:revise', paragraphs: ['处理 build 后请求的后续修改。Revision 不是验收，也不得归档变更。'] },
        { type: 'section', heading: '/specrow:accept', paragraphs: ['记录用户明确验收。这是唯一允许最终规格集成和 archive 的 user-facing 命令。沉默、测试通过或代码完成都不是验收。'] },
      ],
    },
    'cli-reference': {
      eyebrow: 'CLI Core',
      title: 'CLI 参考',
      description: 'CLI 是代理、CI、自动化和手动 fallback 使用的技术核心。',
      blocks: [
        { type: 'section', heading: 'Setup 和创建', paragraphs: ['specrow init 创建 .specrow 和最小工作区。specrow proposal <change-name> 为新变更创建 proposal.md、tasks.md 和 status.yml。'] },
        { type: 'section', heading: '验证和上下文', paragraphs: ['specrow validate [change-name] 检查必需文件和章节。specrow review <change-name> 增加准备度警告，并在没有阻塞错误时标记 review completed。specrow context [change-name] 输出代理可读 JSON。'] },
        { type: 'section', heading: '生命周期命令', paragraphs: ['specrow build-start <change-name> 检查准备度。specrow build-finish <change-name> 标记 built 并输出下一步。specrow revise <change-name> 标记 revision-needed。specrow accept <change-name> --yes 记录明确验收。specrow archive <change-name> 只归档已验收变更。'] },
        { type: 'section', heading: 'Status 命令', paragraphs: ['specrow status [change-name] 输出单个变更或所有活跃变更。specrow list 列出活跃变更，并在多个变更可能冲突时发出警告。'] },
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
        { type: 'section', heading: 'tasks.md', paragraphs: ['Tasks 将工作拆分为 implementation、verification、documentation 和 acceptance gate。模板提醒代理 build 结束后下一步是 /specrow:accept 或 /specrow:revise。'] },
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
        { type: 'section', heading: '验证', paragraphs: ['specrow validate 检查 project.md 和活跃变更。对每个变更，它验证 proposal.md、tasks.md、必需章节和 status.yml 结构。缺失文件和缺失章节是错误。'] },
        { type: 'section', heading: 'Review 警告', paragraphs: ['specrow review 增加提案准备度检查。空的 acceptance criteria 或没有 checklist 的验收文本会产生警告，让代理在实现前请求澄清。'] },
        { type: 'section', heading: '多个活跃变更', paragraphs: ['specrow list 和 validation 让活跃变更保持可见。当存在多个活跃变更时，SpecRow 会警告可能的规格或流程冲突。'] },
        { type: 'section', heading: 'Accept gate', paragraphs: ['accept 需要通过 CLI core 的 --yes，以及通过代理命令得到用户明确验收决定。在 accepted 状态记录明确验收前，archive 会被阻止。'] },
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
