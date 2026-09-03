# Архитектура плагина

## Переносимый пакет

```text
public/
├── plugin.json
├── mcp.json
├── skills/
│   └── specrow/
│       ├── SKILL.md
│       └── references/
├── runtime/
│   └── specrow-mcp.cjs
├── src/
├── tests/
└── newDocMD/
```

`plugin.json` содержит только поля, разрешённые закрытой схемой Agent Plugins 1.0.0. MCP-конфигурация вынесена в фиксированный корневой `mcp.json`, а agent-инструкции — в один обнаруживаемый skill.

## Почему один skill

SpecRow представляет один связный lifecycle. Отдельный skill для каждой фазы увеличил бы discovery-контекст и повторял общие ограничения. Поэтому `skills/specrow/SKILL.md` работает как короткий router, а подробности загружаются по необходимости из `references/`.

## Runtime

`runtime/specrow-mcp.cjs` — автономная CommonJS-сборка MCP-сервера. В неё включены runtime-зависимости, поэтому установленному плагину не нужен собственный `node_modules`. CommonJS выбран для совместимости со смешанными ESM/CJS-зависимостями внутри единого файла. Внешним системным требованием остаётся Node.js 20+.

`mcp.json` запускает runtime одним executable token `node`, а путь к bundle передаёт отдельным аргументом через `${PLUGIN_ROOT}`. Это одинаково работает на Windows, macOS и Linux и не требует shell-команды.

## Слои кода

Граница модулей:

- domain — lifecycle-состояния, переходы и инварианты без MCP/CLI;
- application — операции init, proposal, validation, build, accept, archive и migration;
- adapters — MCP и CLI parsing/presentation;
- infrastructure — безопасная работа с workspace и файлами.

В коде используются единый источник версии, resolver корня MCP workspace, общий workspace-context и централизованные lifecycle guards. Отдельного workflow engine для CLI, MCP или конкретного клиента нет.
