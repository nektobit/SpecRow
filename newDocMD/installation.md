# Установка

## Сначала выберите агента

SpecRow поставляет два совместимых клиентских адаптера над одним lifecycle: переносимый Agent Plugin из skill и локального MCP-сервера, а также skills-only пакет Codex со встроенным CLI. Установка npm-пакета через `npm i -g specrow` добавляет только standalone CLI и не регистрирует плагин в агенте.

### Codex desktop и Codex CLI — установка одной кнопкой

После одобрения SpecRow в каталоге OpenAI откройте карточку SpecRow и нажмите Install. Codex установит skill вместе со встроенным локальным CLI-адаптером; отдельный MCP-сервер, публичный endpoint и глобальная установка CLI не нужны.

До публикации в каталоге рабочую кнопку установки показывать нельзя. Codex IDE extension пока не поддержан и не проверен SpecRow.

### GitHub Copilot CLI — рекомендуемый путь

После попадания реализации Agent Plugin в основную ветку установите полный плагин одной командой:

```text
copilot plugin install nektobit/SpecRow
```

Copilot устанавливает пакет непосредственно из корня GitHub-репозитория.

### GitHub Copilot в VS Code

1. Откройте Command Palette.
2. Выполните `Chat: Install Plugin From Source`.
3. Укажите `https://github.com/nektobit/SpecRow`.
4. Проверьте источник в окне доверия и начните новый чат после установки.

### Kiro IDE — экспериментальный путь

Откройте `Powers → Add Custom Power → Import power from GitHub`, укажите `https://github.com/nektobit/SpecRow` и нажмите Install. Kiro документирует импорт Agent Plugin из публичного GitHub URL, но SpecRow пока не выполнил собственный client smoke test.

## Ограничения поддержки

Для любого поддерживаемого способа установки требуются:

- Node.js 20 или новее, доступный через `PATH`;
- доступ агента к файловой системе целевого проекта.

Дополнительно:

- Agent Plugins клиентам нужны одновременно Agent Skills и локальные stdio MCP-серверы;
- Codex desktop и Codex CLI нужен локальный shell для запуска встроенного CLI-адаптера.

Статусы клиентов:

- **Есть простой документированный путь:** GitHub Copilot CLI, GitHub Copilot в VS Code и экспериментальный импорт в Kiro IDE.
- **Skills-only пакет готов, установка одной кнопкой зависит от одобрения в каталоге OpenAI:** Codex desktop и Codex CLI. Codex IDE extension пока не поддержан и не проверен SpecRow.
- **Agent Plugins пакет готов, простой публичный путь зависит от marketplace:** Cursor. Доступность marketplace может зависеть от тарифа или политики администратора; MCP deeplink не подходит, потому что установит MCP без обязательного skill.
- **Совместимы с Agent Plugins по формату, но не проверены SpecRow:** Hermes Agent, OpenClaw, Grok Bot и NanoClaw.
- **Пока нет поддерживаемой установки единым пакетом:** Claude Code, Gemini CLI и Windsurf/Cascade. Им нужны клиентские адаптеры либо раздельная ручная настройка Skill и MCP.

Кнопку установки для Codex или Cursor можно показывать только после реальной публикации SpecRow в соответствующем каталоге. До этого интерфейс не должен создавать впечатление, что такая кнопка работает.

Перечисленные процедуры подтверждены документацией клиентов, однако в репозитории SpecRow пока нет end-to-end тестов установки в конкретные клиенты. Встроенные проверки подтверждают структуру manifest, состав пакета, работу MCP runtime и изолированный lifecycle через Codex CLI bundle, но не заменяют client smoke test.

## Состав пакета

Portable Agent Plugins 1.0:

```text
plugin.json
mcp.json
skills/specrow/SKILL.md
runtime/specrow-mcp.cjs
```

Codex adapter:

```text
.codex-plugin/plugin.json
skills/specrow/SKILL.md
skills/specrow/scripts/specrow-cli.cjs
```

Agent Plugins стандартизует структуру, но не единый registry или способ установки. Поэтому путь установки должен быть описан отдельно для каждого клиента.

## Локальная сборка из репозитория

Из корня репозитория:

```text
pnpm install --frozen-lockfile
pnpm build
pnpm plugin:validate
```

После сборки локальный корень репозитория можно передать клиенту, который поддерживает установку Agent Plugin из каталога. Каталог `skills/specrow/` образует автономный bundle для загрузки в каталог Codex.

## Первый вызов

Начните новый чат и попросите агента проверить SpecRow для нужного проекта. Skill сначала использует доступный адаптер: `specrow_project_status` через MCP либо `status` через встроенный CLI. Затем он при необходимости выполняет init и validate тем же адаптером.

Если MCP-клиент не передаёт roots или открыл несколько проектов, агент должен передать абсолютный `projectRoot`. В Codex встроенный CLI запускается с целевым проектом как рабочим каталогом. Ни один адаптер не использует каталог установки плагина как пользовательский workspace.
