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
  { slug: 'knowledge-base' },
] as const

export type PageSlug = (typeof pages)[number]['slug']

export type TextPart = string | { text: string; page: PageSlug }
export type Paragraph = string | TextPart[]

export type Block =
  | { type: 'section'; heading: string; paragraphs: Paragraph[] }
  | { type: 'list-section'; heading: string; intro: string; items: string[]; outro: string }
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
        "SpecRow is a multilingual specification system where the user's language is the primary language of interaction with the system and with agents, not a translation layer on top of an English-first model.",
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
      description: 'The first workflow guide will be added here.',
      blocks: [{ type: 'placeholder', paragraphs: ['This section is a placeholder for the first SpecRow instructions. It will describe the basic workflow: initializing a project, writing a specification, creating a change, deriving tasks, validating, and integrating changes.'] }],
    },
    'knowledge-base': {
      eyebrow: 'Knowledge Base',
      title: 'SpecRow Concepts',
      description: 'Core ideas for working with specifications, changes, and SDD.',
      blocks: [
        { type: 'section', heading: 'What is SpecRow?', paragraphs: ['It is a set of conventions for working with specifications: how to describe features, where to store changes, and how to pass context to a person or an AI agent. SpecRow is needed to make this process more convenient and stable.'] },
        { type: 'section', heading: 'What is a specification?', paragraphs: ['A spec, or specification, is a description of a feature, a change, or a separate part of a system. It usually includes the domain description, goal, expected behavior, important constraints, and readiness criteria.'] },
        { type: 'section', heading: 'What is a domain?', paragraphs: ['A domain is everything that describes the problem being solved in business language, without tying it to technologies. This includes key concepts: entities, actions, and states such as "Order", "Place order", and "Paid"; and the business rules that govern them.'] },
        { type: 'section', heading: 'What advantages does this give compared with prompts and vibe coding?', paragraphs: ['A prompt often lives only in the moment. You write a request, get an answer, clarify it, then revise it again. After several iterations, it becomes hard to remember which requirements were most important, what changed, and why.', 'SDD makes the work more stable. Instead of a long conversation, you get a separate spec that collects the goal, requirements, constraints, and decisions. You can reread it, update it, send it to another person, or give it to an AI agent again as context.'] },
        { type: 'section', heading: 'What is SDD?', paragraphs: ['SDD is spec-driven development. First we describe what should be built, why it is needed, and how to verify the result. Only then do we move to implementation: by ourselves, with a team, or with an AI agent. The philosophy of SDD is: "If it is not written in the documentation, it does not exist." Documentation is the single source of truth.'] },
        { type: 'section', heading: 'What is a "source of truth"?', paragraphs: ["A source of truth is the place we trust when we need to understand how the system should work. In SDD, the spec becomes that place. This does not mean the spec never changes. But changes are recorded explicitly instead of being lost somewhere in a chat thread, a developer's memory, or a prompt history."] },
        { type: 'section', heading: 'Are these strict rules or a general idea of how SDD should work?', paragraphs: ['This is not a rigid rulebook. SpecRow offers a working flow: how to describe changes, where to store specs, how to connect them with tasks, and how to use all of this in development.', 'You can adapt it to your needs. In a small project, short texts and a simple folder structure may be enough. In a team, you may need more formality: statuses, change history, acceptance criteria, and links to tasks.', 'The main point is not to serve the format for its own sake. Specs should help people think, agree, and make the result clearer. If some part of the process gets in the way, it can be simplified.'] },
        { type: 'section', heading: 'How do I start working with SpecRow?', paragraphs: [['Start with the ', { text: 'instructions', page: 'instructions' }, '.']] },
      ],
    },
  },
  ru: {
    manifesto: {
      eyebrow: 'Манифест',
      title: 'SpecRow',
      description: 'SpecRow — мультиязычная спецификационная система, где язык пользователя является первым языком взаимодействия с системой и агентом, а не переводом поверх английской модели.',
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
      description: 'Здесь будет первая инструкция по рабочему процессу.',
      blocks: [{ type: 'placeholder', paragraphs: ['Раздел-заглушка. Здесь будет первая инструкция SpecRow: инициализация проекта, написание спеки, создание изменения, вывод задач, проверка и интеграция изменений.'] }],
    },
    'knowledge-base': {
      eyebrow: 'База знаний',
      title: 'Понятия SpecRow',
      description: 'Основные идеи для работы со спецификациями, изменениями и SDD.',
      blocks: [
        { type: 'section', heading: 'Что такое SpecRow?', paragraphs: ['Это набор соглашений для работы со спецификациями: как описывать фичи, где хранить изменения, как передавать контекст человеку или AI-агенту. SpecRow нужен, чтобы сделать этот процесс удобнее и стабильнее.'] },
        { type: 'section', heading: 'Что такое спецификация?', paragraphs: ['Спека, или спецификация, — это описание фичи, изменения или отдельной части системы. В ней обычно есть описание домена, цель, ожидаемое поведение, важные ограничения и критерии готовности.'] },
        { type: 'section', heading: 'Что такое домен?', paragraphs: ['Домен — это всё, что описывает решаемую задачу на языке бизнеса, без привязки к технологиям. Сюда входят ключевые понятия: сущности, действия, состояния, например «Заказ», «Оформить заказ», «Оплачен»; и бизнес-правила, которые ими управляют.'] },
        { type: 'section', heading: 'Какие плюсы это даёт по сравнению с промптами и вайб-кодингом?', paragraphs: ['Промпт часто живёт только в моменте. Вы написали запрос, получили ответ, уточнили, потом ещё раз поправили. Через несколько итераций уже сложно вспомнить, какие требования были главными, что изменилось и почему.', 'SDD делает работу устойчивее. Вместо длинной переписки появляется отдельная спека, где собраны цель, требования, ограничения и решения. Её можно перечитать, обновить, отправить другому человеку или снова дать AI-агенту как контекст.'] },
        { type: 'section', heading: 'Что такое SDD?', paragraphs: ['SDD — это разработка от спецификации. Сначала мы описываем, что должно получиться, зачем это нужно и как проверить результат. Потом уже переходим к реализации: сами, с командой или с AI-агентом. Философия SDD: «Если этого не написано в документации — этого не существует». Документация — это единственный источник истины.'] },
        { type: 'section', heading: 'Что такое «источник истины»?', paragraphs: ['Источник истины — это место, которому мы доверяем, когда нужно понять, как должна работать система. В SDD таким местом становится спека. Это не значит, что спека никогда не меняется. Но изменения фиксируются явно, а не теряются где-то в переписке, памяти разработчика или ленте промптов.'] },
        { type: 'section', heading: 'Это строгие правила или общее представление о том, как должна работать SDD?', paragraphs: ['Это не жёсткий свод правил. SpecRow предлагает рабочий флоу: как описывать изменения, где хранить спеки, как связывать их с задачами и как использовать всё это в разработке.', 'Вы можете подстроить его под себя. В маленьком проекте хватит коротких текстов и простой структуры папок. В команде может понадобиться больше формальности: статусы, история изменений, критерии приёмки, связь с задачами.', 'Главное — не обслуживать формат ради формата. Спеки должны помогать думать, договариваться и делать результат понятнее. Если какая-то часть процесса мешает, её можно упростить.'] },
        { type: 'section', heading: 'Как начать работать со SpecRow?', paragraphs: [['Начните с ', { text: 'инструкции', page: 'instructions' }, '.']] },
      ],
    },
  },
  es: {
    manifesto: {
      eyebrow: 'Manifiesto',
      title: 'SpecRow',
      description: 'SpecRow es un sistema de especificaciones multilingüe donde el idioma del usuario es el idioma principal de interacción con el sistema y con los agentes, no una capa de traducción sobre un modelo centrado en inglés.',
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
      description: 'Aquí se añadirá la primera guía de trabajo.',
      blocks: [{ type: 'placeholder', paragraphs: ['Esta sección es un archivo provisional para las primeras instrucciones de SpecRow. Describirá el flujo básico: inicializar un proyecto, escribir una especificación, crear un cambio, derivar tareas, validar e integrar cambios.'] }],
    },
    'knowledge-base': {
      eyebrow: 'Base de conocimiento',
      title: 'Conceptos de SpecRow',
      description: 'Ideas principales para trabajar con especificaciones, cambios y SDD.',
      blocks: [
        { type: 'section', heading: '¿Qué es SpecRow?', paragraphs: ['Es un conjunto de acuerdos para trabajar con especificaciones: cómo describir funcionalidades, dónde guardar cambios y cómo pasar contexto a una persona o a un agente de AI. SpecRow existe para hacer este proceso más cómodo y estable.'] },
        { type: 'section', heading: '¿Qué es una especificación?', paragraphs: ['Una spec, o especificación, es una descripción de una funcionalidad, un cambio o una parte independiente del sistema. Normalmente incluye la descripción del dominio, el objetivo, el comportamiento esperado, las restricciones importantes y los criterios de finalización.'] },
        { type: 'section', heading: '¿Qué es un dominio?', paragraphs: ['Un dominio es todo lo que describe el problema que se resuelve en el lenguaje del negocio, sin atarlo a tecnologías. Incluye conceptos clave: entidades, acciones y estados, por ejemplo "Pedido", "Realizar pedido" y "Pagado"; y las reglas de negocio que los gobiernan.'] },
        { type: 'section', heading: '¿Qué ventajas ofrece frente a los prompts y al vibe coding?', paragraphs: ['Un prompt suele vivir solo en el momento. Escribes una solicitud, recibes una respuesta, aclaras algo y luego vuelves a corregir. Después de varias iteraciones, ya es difícil recordar qué requisitos eran los principales, qué cambió y por qué.', 'SDD hace el trabajo más estable. En lugar de una conversación larga, aparece una spec separada donde se reúnen el objetivo, los requisitos, las restricciones y las decisiones. Se puede releer, actualizar, enviar a otra persona o volver a entregar a un agente de AI como contexto.'] },
        { type: 'section', heading: '¿Qué es SDD?', paragraphs: ['SDD es desarrollo guiado por especificaciones. Primero describimos qué debe conseguirse, por qué es necesario y cómo verificar el resultado. Solo después pasamos a la implementación: por nuestra cuenta, con un equipo o con un agente de AI. La filosofía de SDD es: "Si no está escrito en la documentación, no existe". La documentación es la única fuente de verdad.'] },
        { type: 'section', heading: '¿Qué es una "fuente de verdad"?', paragraphs: ['Una fuente de verdad es el lugar en el que confiamos cuando necesitamos entender cómo debe funcionar el sistema. En SDD, ese lugar es la spec. Esto no significa que la spec nunca cambie. Pero los cambios se registran explícitamente y no se pierden en una conversación, en la memoria de un desarrollador o en el historial de prompts.'] },
        { type: 'section', heading: '¿Son reglas estrictas o una idea general de cómo debe funcionar SDD?', paragraphs: ['No es un conjunto rígido de reglas. SpecRow propone un flujo de trabajo: cómo describir cambios, dónde guardar specs, cómo vincularlas con tareas y cómo usar todo eso en el desarrollo.', 'Puedes adaptarlo a tus necesidades. En un proyecto pequeño, bastan textos cortos y una estructura simple de carpetas. En un equipo puede hacer falta más formalidad: estados, historial de cambios, criterios de aceptación y vínculo con tareas.', 'Lo importante es no mantener el formato por el formato. Las specs deben ayudar a pensar, ponerse de acuerdo y hacer el resultado más claro. Si alguna parte del proceso estorba, se puede simplificar.'] },
        { type: 'section', heading: '¿Cómo empezar a trabajar con SpecRow?', paragraphs: [['Empieza con las ', { text: 'instrucciones', page: 'instructions' }, '.']] },
      ],
    },
  },
  'zh-CN': {
    manifesto: {
      eyebrow: '宣言',
      title: 'SpecRow',
      description: 'SpecRow 是一个多语言规格系统。在 SpecRow 中，用户的语言是用户与系统和代理交互的第一语言，而不是建立在英语优先模型之上的翻译层。',
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
      description: '第一份工作流指南将添加在这里。',
      blocks: [{ type: 'placeholder', paragraphs: ['这是 SpecRow 第一份使用说明的占位文件。之后它会描述基础工作流：初始化项目、编写规格、创建变更、推导任务、验证并集成变更。'] }],
    },
    'knowledge-base': {
      eyebrow: '知识库',
      title: 'SpecRow 概念',
      description: '用于处理规格、变更和 SDD 的核心概念。',
      blocks: [
        { type: 'section', heading: '什么是 SpecRow？', paragraphs: ['它是一套用于处理规格说明的约定：如何描述功能、在哪里保存变更、如何把上下文传递给人或 AI 代理。SpecRow 的目的，是让这个过程更方便、更稳定。'] },
        { type: 'section', heading: '什么是规格说明？', paragraphs: ['Spec，或规格说明，是对功能、变更或系统某个独立部分的描述。它通常包含领域描述、目标、预期行为、重要限制和完成标准。'] },
        { type: 'section', heading: '什么是领域？', paragraphs: ['领域是用业务语言描述待解决问题的一切，而不绑定到具体技术。它包括关键概念：实体、动作和状态，例如“订单”“提交订单”“已支付”；以及支配它们的业务规则。'] },
        { type: 'section', heading: '和提示词、vibe coding 相比有什么好处？', paragraphs: ['提示词通常只存在于当下。你写下请求，得到回答，补充说明，然后再次修改。经过几轮迭代后，已经很难记住哪些需求最重要、发生了什么变化，以及为什么变化。', 'SDD 让工作更稳定。相比一长串对话，它会形成一份独立的规格，把目标、需求、限制和决策集中在一起。你可以重新阅读、更新、发给另一个人，或者再次交给 AI 代理作为上下文。'] },
        { type: 'section', heading: '什么是 SDD？', paragraphs: ['SDD 是规格驱动开发。我们先描述要得到什么、为什么需要它，以及如何验证结果。之后才进入实现：可以自己实现，也可以和团队一起实现，或交给 AI 代理实现。SDD 的理念是：“如果没有写进文档，就等于不存在。” 文档是唯一事实来源。'] },
        { type: 'section', heading: '什么是“事实来源”？', paragraphs: ['事实来源是我们在需要理解系统应如何工作时所信任的地方。在 SDD 中，这个地方就是规格。这并不意味着规格永远不会变化。但变化会被明确记录，而不是丢失在聊天记录、开发者记忆或提示词历史里。'] },
        { type: 'section', heading: '这是严格规则，还是对 SDD 工作方式的一般设想？', paragraphs: ['这不是一套僵硬的规则。SpecRow 提供的是一种工作流：如何描述变更、在哪里保存规格、如何把规格与任务关联，以及如何在开发中使用这些内容。', '你可以根据自己的情况调整它。小项目可能只需要短文本和简单的文件夹结构。团队协作时可能需要更多正式性：状态、变更历史、验收标准，以及与任务的关联。', '关键不是为了格式而维护格式。规格应该帮助人思考、达成共识，并让结果更清晰。如果流程中的某一部分造成阻碍，就可以简化它。'] },
        { type: 'section', heading: '如何开始使用 SpecRow？', paragraphs: [['从', { text: '使用说明', page: 'instructions' }, '开始。']] },
      ],
    },
  },
}
