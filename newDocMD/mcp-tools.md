# MCP-инструменты и выбор проекта

## Почему больше нельзя полагаться на `cwd`

По Agent Plugins 1.0.0 stdio-процесс по умолчанию запускается из корня установленного плагина. Поэтому `process.cwd()` не указывает на проект пользователя. Плагин выбирает workspace из MCP roots или явного `projectRoot`.

## Выбор workspace

Каждый workspace-зависимый MCP-инструмент принимает необязательный абсолютный `projectRoot`.

Порядок выбора:

1. явно переданный `projectRoot` внутри root, объявленного клиентом;
2. единственный файловый MCP root клиента;
3. единственный инициализированный SpecRow workspace среди нескольких roots;
4. для прямого CLI-запуска MCP — явно переданный startup root.

В Agent Plugin mode отсутствие roots и `projectRoot` возвращает `INVALID_PROJECT_ROOT`. Это защищает каталог плагина от ошибочной инициализации `.specrow`.

## Основные группы инструментов

- inspect: `specrow_project_status`, `specrow_status`, `specrow_context`, `specrow_validate`;
- setup/import: `specrow_init`, `specrow_migrate`;
- proposal/review: `specrow_create_proposal`, `specrow_review`;
- implementation: `specrow_build_start`, `specrow_build_finish`, `specrow_revise`;
- acceptance: `specrow_accept`, `specrow_archive`.

Skill является единственным каноническим agent-readable описанием последовательности. MCP API не дублирует workflow guide, шаблоны или отдельный список изменений: эти данные доступны через skill, ресурсы, `specrow_status` и `specrow_context`.

## Ошибки

- `INVALID_PROJECT_ROOT` — выбрать workspace или явно передать `projectRoot`;
- `UNSAFE_PATH` — прекратить вызов с traversal или внешним source;
- `INVALID_STATE` — соблюдать lifecycle-переход, а не форсировать его;
- `VALIDATION_FAILED` — исправить перечисленные проблемы;
- `MISSING_LANGUAGE_RESOURCE` — остановиться без fallback;
- `NOT_FOUND` — проверить инициализацию и имя change.
