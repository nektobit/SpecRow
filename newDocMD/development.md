# Разработка и проверки

## Локальный quality gate

```text
pnpm test
pnpm typecheck
pnpm build
pnpm plugin:validate
pnpm locale:validate
```

`pnpm build` создаёт обычные npm/CLI entrypoints в `dist/`, автономный MCP runtime в `runtime/specrow-mcp.cjs` и автономный Codex CLI adapter в `skills/specrow/scripts/specrow-cli.cjs`.

`pnpm plugin:validate` проверяет закрытые top-level поля переносимых манифестов, skills-only Codex manifest, согласованность версии, структуру `mcpServers`, Agent Skills frontmatter, ссылки skill и наличие обоих runtime bundle.

Перед релизом дополнительно нужно валидировать `plugin.json` и `mcp.json` официальными JSON Schema 1.0.0, проверять MCP stdio handshake и прогонять lifecycle через Codex CLI bundle из чистого распакованного artifact без `node_modules`.

## Инварианты релиза

- версии `package.json`, `plugin.json`, skill metadata, CLI и MCP handshake совпадают;
- plugin artifact содержит `plugin.json`, `mcp.json`, `.codex-plugin/plugin.json`, `skills/`, оба runtime и лицензию;
- оба автономных runtime не импортируют внешние npm-зависимости;
- запуск работает на Windows, macOS и Linux с Node.js 20+;
- tests покрывают single-root, multi-root, явный `projectRoot`, отсутствие roots, выход за объявленный workspace и Codex CLI lifecycle без `node_modules`;
- `public/site` не изменяется вместе с новым документным контуром без отдельного согласования.
