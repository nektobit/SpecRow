# Документация нового SpecRow

Эта папка содержит русскоязычную документацию архитектуры SpecRow как переносимого Agent Plugin и skills-only адаптера для Codex. Она не является содержимым текущего сайта и не публикуется автоматически.

Новая модель основана на [Agent Plugins Specification 1.0.0](https://agent-plugins.org/specification) и [Agent Skills](https://agentskills.io/specification):

- `plugin.json` задаёт переносимую идентичность пакета;
- `mcp.json` подключает локальный stdio MCP runtime;
- `skills/specrow/SKILL.md` описывает agent-first workflow;
- `.codex-plugin/plugin.json` регистрирует skills-only пакет в Codex;
- `skills/specrow/scripts/specrow-cli.cjs` даёт Codex автономный локальный CLI-адаптер без глобальной установки;
- standalone CLI остаётся интерфейсом для CI и ручной автоматизации.

## Разделы

- [Установка](installation.md)
- [Архитектура плагина](plugin-architecture.md)
- [Workspace и lifecycle](workflow.md)
- [MCP-инструменты и выбор проекта](mcp-tools.md)
- [Миграция спецификаций](migration.md)
- [Удаление старых интеграций](upgrade-from-legacy-integrations.md)
- [Разработка и проверки](development.md)

## Текущий статус

Сформированы два адаптера над одним lifecycle: переносимый Agent Plugin с автономным MCP bundle и skills-only пакет Codex со встроенным CLI. Генераторы клиентских конфигов, старый installer, дублирующие agent-команды и переходные MCP-инструменты удалены.
