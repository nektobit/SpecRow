# SpecRow Documentation Site

Vue documentation site for SpecRow.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Local development runs from `/`, so open `http://localhost:5173/en/`.

The production build uses `/SpecRow/` as the default base path for GitHub Pages. Set
`BASE_PATH` to override it for another hosting target.

The sitemap and robots files use `https://nektobit.github.io/SpecRow/` by default.
Set `SITE_URL` to change the canonical domain:

```sh
SITE_URL=https://example.com/ pnpm build
```

PowerShell:

```powershell
$env:SITE_URL = 'https://example.com/'
pnpm build
```
