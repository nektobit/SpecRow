<!-- specrow:readme-section=title -->
# SpecRow

SpecRow es un flujo de especificaciones agent-first. Los usuarios describen la intención en lenguaje natural, por ejemplo `specrow migrate`, `specrow explore`, `specrow proposal` o `specrow build`; los agentes ejecutan el workflow mediante las herramientas MCP de SpecRow o el adaptador CLI local incluido para Codex.

<!-- specrow:readme-section=language-links -->
## Leer en tu idioma

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

<!-- specrow:readme-section=documentation -->
## Documentación

Sitio web: https://specrow.com/es/

El sitio cubre el flujo MVP completo: primeros pasos, explore, de proposal a accept, adaptadores MCP y CLI local, plantillas, localización, validación, reglas lifecycle y diferencias frente a OpenSpec.

<!-- specrow:readme-section=quick-start -->
## Inicio rápido

Instala el plugin completo en un cliente compatible:

- GitHub Copilot CLI: `copilot plugin install nektobit/SpecRow`.
- GitHub Copilot en VS Code: ejecuta `Chat: Install Plugin From Source` e introduce `https://github.com/nektobit/SpecRow`.
- Kiro IDE (experimental): elige `Powers → Add Custom Power → Import power from GitHub` e introduce la misma URL del repositorio.
- Codex desktop/CLI: el repositorio incluye un adaptador skills-only con una CLI local integrada; la instalación pública con un clic depende de la aprobación en OpenAI Plugins Directory. Cursor todavía requiere su propia publicación en el marketplace.

Hermes Agent, OpenClaw, Grok Bot y NanoClaw son compatibles con el formato Agent Plugins, pero SpecRow aún no los ha probado. Claude Code, Gemini CLI y Windsurf/Cascade no tienen actualmente una instalación de SpecRow compatible en un solo paquete. Se requieren Node.js 20+ y acceso a los archivos del proyecto de destino; los clientes Agent Plugins también necesitan MCP stdio local, mientras que Codex usa su shell local y la CLI incluida. Estos caminos están documentados por los proveedores de los clientes, pero SpecRow todavía no ejecuta pruebas end-to-end de instalación específicas de cada cliente.

`npm i -g specrow` instala solo la CLI independiente; no registra el plugin en un agente. Después de instalar el plugin completo, abre un chat nuevo y pide al agente que compruebe SpecRow para el proyecto previsto.

Luego dile al agente qué workflow de SpecRow quieres:

```txt
specrow migrate openspec
specrow explore Discutir la idea antes de crear un cambio
specrow proposal Describe el cambio previsto
specrow review
specrow build
specrow accept
```

Los agentes deben tratar estas frases como intenciones de workflow y ejecutarlas mediante el adaptador del cliente: herramientas MCP o la CLI local incluida en Codex.

Consejo: usa `brief: texto de la tarea` o `бриф: текст задачи` para marcar la descripción humana original de la tarea. El agente debe usar el brief y sus reglas como punto de partida para preparar el proposal, pero el brief no es el proposal final.

Para automatización fuera de una sesión de agente, también está disponible el binario `specrow`:

```bash
npm i -g specrow
specrow init --language es --estimation
specrow migrate ./docs
specrow validate
```

<!-- specrow:readme-section=workspace -->
## Workspace

La inicialización de SpecRow crea:

```txt
.specrow/
  config.yml
  project.md
  specs/
  changes/
  archive/
```

`config.yml` se mantiene mínimo:

```yml
version: 1
language: es
```

El idioma configurado controla plantillas integradas y mensajes lifecycle/status. Los recursos de idioma ausentes son errores. SpecRow no hace fallback silencioso a inglés.

Agrega `estimation.enabled: true` cuando los agentes deban añadir una estimación aproximada del tiempo de implementación después de formar cada proposal:

```yml
version: 1
language: es
estimation:
  enabled: true
```

<!-- specrow:readme-section=accept-gate -->
## Accept Gate

Build no actualiza specs como verdad final y no archiva un cambio. Las specs y el archivo se actualizan solo después de aceptación explícita del usuario mediante el workflow `specrow accept`.

<!-- specrow:readme-section=migration -->
## Migration Notes

Usa `specrow migrate openspec`, `specrow migrate speckit` o `specrow migrate ./docs` para llevar artefactos de especificación existentes a `.specrow/`. Si falta `.specrow`, la migración lo inicializa primero. El sistema de origen no se elimina, y los registros archivados se copian como historial preservado sin transformación.
