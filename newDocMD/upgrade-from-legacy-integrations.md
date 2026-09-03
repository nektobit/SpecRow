# Удаление старых интеграций

Ранние версии SpecRow генерировали отдельные файлы для Codex, Claude, Cursor, Windsurf и generic agents, а также вручную добавляли MCP-конфигурации. Новый пакет заменяет этот primary install path стандартными `plugin.json`, `mcp.json` и `skills/`, а для Codex — skills-only manifest со встроенным CLI.

## Что меняется

- skill поставляется вместе с плагином, а не копируется в каждый проект или home-каталог;
- MCP-сервер обнаруживается из `mcp.json` в Agent Plugins клиентах;
- Codex обнаруживает skill и запускает CLI bundle из его `scripts/`;
- версия skill и обоих runtime поставляется одним plugin artifact;
- workspace выбирается через MCP roots/`projectRoot` либо через рабочий каталог локальной Codex-сессии;
- клиентские command/rule/workflow файлы больше не считаются каноническими.

## Состояние кода

Команды `specrow integrate`, `specrow update`, `specrow integrations status`, MCP-инструмент `specrow_integration_status`, старый удалённый installer и генераторы клиентских файлов удалены. Конфигурация `.specrow/config.yml` больше не содержит метаданные `integrations`.

SpecRow не удаляет автоматически ранее созданные файлы в `.codex`, `.claude`, `.cursor`, `.windsurf`, `AGENTS.md` или пользовательских MCP-конфигах. Такие файлы могут содержать правки пользователя. Их очистка должна быть отдельным явным действием после проверки владельца, managed markers и активного клиента.

## Рекомендуемая проверка

1. Подключить подходящий пакет: Agent Plugin либо skills-only пакет Codex.
2. В новой сессии убедиться, что обнаружен skill `specrow` и доступен его адаптер — MCP tools либо встроенный CLI.
3. Проверить project status на реальном workspace через выбранный адаптер.
4. Сравнить старые generated instructions с plugin skill и сохранить пользовательские дополнения.
5. Удалить старые клиентские конфиги вручную после проверки, что в них нет пользовательских дополнений.
