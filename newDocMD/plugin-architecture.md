# Архитектура плагина

## Переносимый пакет

```text
public/
├── plugin.json
├── mcp.json
├── .codex-plugin/
│   └── plugin.json
├── skills/
│   └── specrow/
│       ├── SKILL.md
│       ├── references/
│       └── scripts/
│           └── specrow-cli.cjs
├── runtime/
│   └── specrow-mcp.cjs
├── src/
├── tests/
└── newDocMD/
```

`plugin.json` содержит только поля, разрешённые закрытой схемой Agent Plugins 1.0.0. MCP-конфигурация вынесена в фиксированный корневой `mcp.json`, а agent-инструкции — в один обнаруживаемый skill.

Codex использует отдельный `.codex-plugin/plugin.json` без MCP-регистрации. Тот же skill выбирает доступный адаптер: MCP tools в Agent Plugins клиенте или локальный встроенный CLI в Codex. Оба пути вызывают одну доменную реализацию lifecycle.

## Почему один skill

SpecRow представляет один связный lifecycle. Отдельный skill для каждой фазы увеличил бы discovery-контекст и повторял общие ограничения. Поэтому `skills/specrow/SKILL.md` работает как короткий router, а подробности загружаются по необходимости из `references/`.

## Runtime

`runtime/specrow-mcp.cjs` — автономная CommonJS-сборка MCP-сервера. В неё включены runtime-зависимости, поэтому установленному плагину не нужен собственный `node_modules`. CommonJS выбран для совместимости со смешанными ESM/CJS-зависимостями внутри единого файла. Внешним системным требованием остаётся Node.js 20+.

`mcp.json` запускает runtime одним executable token `node`, а путь к bundle передаёт отдельным аргументом через `${PLUGIN_ROOT}`. Это одинаково работает на Windows, macOS и Linux и не требует shell-команды.

`skills/specrow/scripts/specrow-cli.cjs` — отдельная автономная CommonJS-сборка команд lifecycle без MCP SDK и команды запуска MCP. Skill разрешает её относительно собственного каталога и всегда запускает с целевым проектом как рабочим каталогом. Глобальный `specrow` и `node_modules` для этого пути не нужны.

## Слои кода

Граница модулей:

- domain — lifecycle-состояния, переходы и инварианты без MCP/CLI;
- application — операции init, proposal, validation, build, accept, archive и migration;
- adapters — MCP и CLI parsing/presentation;
- infrastructure — безопасная работа с workspace и файлами.

В коде используются единый источник версии, resolver корня MCP workspace, общий workspace-context и централизованные lifecycle guards. Отдельного workflow engine для CLI, MCP или конкретного клиента нет.
