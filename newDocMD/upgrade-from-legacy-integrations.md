# Удаление старых интеграций

Ранние версии SpecRow генерировали отдельные файлы для Codex, Claude, Cursor, Windsurf и generic agents, а также вручную добавляли MCP-конфигурации. Agent Plugin заменяет этот primary install path стандартными `plugin.json`, `mcp.json` и `skills/`.

## Что меняется

- skill поставляется вместе с плагином, а не копируется в каждый проект или home-каталог;
- MCP-сервер обнаруживается из `mcp.json`;
- версия skill и runtime поставляется одним plugin artifact;
- workspace выбирается на каждый вызов через MCP roots или `projectRoot`;
- клиентские command/rule/workflow файлы больше не считаются каноническими.

## Состояние кода

Команды `specrow integrate`, `specrow update`, `specrow integrations status`, MCP-инструмент `specrow_integration_status`, старый удалённый installer и генераторы клиентских файлов удалены. Конфигурация `.specrow/config.yml` больше не содержит метаданные `integrations`.

SpecRow не удаляет автоматически ранее созданные файлы в `.codex`, `.claude`, `.cursor`, `.windsurf`, `AGENTS.md` или пользовательских MCP-конфигах. Такие файлы могут содержать правки пользователя. Их очистка должна быть отдельным явным действием после проверки владельца, managed markers и активного клиента.

## Рекомендуемая проверка

1. Подключить новый Agent Plugin.
2. В новой сессии убедиться, что обнаружены skill `specrow` и MCP tools.
3. Проверить `specrow_project_status` на реальном workspace.
4. Сравнить старые generated instructions с plugin skill и сохранить пользовательские дополнения.
5. Удалить старые клиентские конфиги вручную после проверки, что в них нет пользовательских дополнений.
