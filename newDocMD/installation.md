# Установка

## Сначала выберите агента

Плагин SpecRow — это единый пакет из skill и локального MCP-сервера. Установка только npm-пакета через `npm i -g specrow` добавляет standalone CLI, но не регистрирует плагин в агенте.

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

Для работы полного плагина требуются:

- Node.js 20 или новее, доступный через `PATH`;
- поддержка одновременно Agent Skills и локальных stdio MCP-серверов;
- доступ агента к файловой системе целевого проекта.

Статусы клиентов:

- **Есть простой документированный путь:** GitHub Copilot CLI, GitHub Copilot в VS Code и экспериментальный импорт в Kiro IDE.
- **Пакет совместим, но простая публичная установка зависит от marketplace:** Codex desktop, Codex CLI и Cursor. Codex IDE extension пока не поддержан и не проверен SpecRow. Доступность marketplace в Cursor может зависеть от тарифа или политики администратора; MCP deeplink не подходит, потому что установит MCP без обязательного skill.
- **Совместимы с Agent Plugins по формату, но не проверены SpecRow:** Hermes Agent, OpenClaw, Grok Bot и NanoClaw.
- **Пока нет поддерживаемой установки единым пакетом:** Claude Code, Gemini CLI и Windsurf/Cascade. Им нужны клиентские адаптеры либо раздельная ручная настройка Skill и MCP.

Кнопку установки для Codex или Cursor можно показывать только после реальной публикации SpecRow в соответствующем каталоге. До этого интерфейс не должен создавать впечатление, что такая кнопка работает.

Перечисленные процедуры подтверждены документацией клиентов, однако в репозитории SpecRow пока нет end-to-end тестов установки в конкретные клиенты. Встроенные проверки подтверждают структуру manifest, состав пакета и работу MCP runtime, но не заменяют client smoke test.

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
.mcp.json
```

Agent Plugins стандартизует структуру, но не единый registry или способ установки. Поэтому путь установки должен быть описан отдельно для каждого клиента.

## Локальная сборка из репозитория

Из корня репозитория:

```text
pnpm install --frozen-lockfile
pnpm build
pnpm plugin:validate
```

После сборки локальный корень репозитория можно передать клиенту, который поддерживает установку Agent Plugin из каталога.

## Первый вызов

Начните новый чат и попросите агента проверить SpecRow для нужного проекта. Skill сначала вызывает `specrow_project_status`, затем при необходимости `specrow_init` и `specrow_validate`.

Если клиент не передаёт MCP roots или открыл несколько проектов, агент должен передать абсолютный `projectRoot`. Сервер не использует каталог установки плагина как пользовательский workspace.
