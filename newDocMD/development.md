# Разработка и проверки

## Локальный quality gate

```text
pnpm test
pnpm typecheck
pnpm build
pnpm plugin:validate
pnpm locale:validate
```

`pnpm build` создаёт обычные npm/CLI entrypoints в `dist/` и отдельный автономный MCP runtime в `runtime/specrow-mcp.cjs`.

`pnpm plugin:validate` проверяет закрытые top-level поля манифестов, согласованность версии, структуру `mcpServers`, Agent Skills frontmatter, ссылки skill и наличие runtime bundle.

Перед релизом дополнительно нужно валидировать `plugin.json` и `mcp.json` официальными JSON Schema 1.0.0 и проверять MCP stdio handshake из чистого распакованного artifact без `node_modules`.

## Инварианты релиза

- версии `package.json`, `plugin.json`, skill metadata, CLI и MCP handshake совпадают;
- plugin artifact содержит `plugin.json`, `mcp.json`, `skills/`, runtime и лицензию;
- runtime не импортирует внешние npm-зависимости;
- запуск работает на Windows, macOS и Linux с Node.js 20+;
- tests покрывают single-root, multi-root, явный `projectRoot`, отсутствие roots и выход за объявленный workspace;
- `public/site` не изменяется вместе с новым документным контуром без отдельного согласования.
