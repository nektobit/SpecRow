# SpecRow

SpecRow es un flujo de especificaciones agent-first. Los usuarios describen intención con comandos `/specrow:*`, mientras que la CLI `specrow` sigue siendo el núcleo técnico para agentes, CI, automatización y fallback manual.

## Leer en tu idioma

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Documentación

GitHub Pages: https://nektobit.github.io/SpecRow/

El sitio cubre el flujo MVP completo: primeros pasos, de proposal a accept, comandos de agente, CLI core, plantillas, localización, validación, reglas lifecycle y diferencias frente a OpenSpec.

## Inicio rápido

Empieza con el agent installer. Pasa explícitamente el idioma de trabajo del proyecto:

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install language=es
```

El agente comprueba o instala la CLI, inicializa `.specrow` con ese idioma, instala integraciones de agentes, valida el workspace e informa si el IDE o agente necesita reinicio.

Luego usa los comandos SpecRow:

```txt
/specrow:proposal Describe el cambio previsto
/specrow:review
/specrow:build
/specrow:accept
```

Fallback manual con CLI:

```bash
npm i -g specrow
specrow init --language es --tools codex,claude,cursor,windsurf,generic
specrow integrate --detect
specrow update
specrow integrations status
```

Sin `--tools`, `specrow init` solo crea el workspace `.specrow`.

## Workspace

`/specrow:init` crea:

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

Cuando hay integraciones instaladas, `config.yml` también registra las tools elegidas y los managed files para que `specrow update` pueda regenerarlos.

El idioma configurado controla plantillas integradas y mensajes lifecycle/status. Los recursos de idioma ausentes son errores. SpecRow no hace fallback silencioso a inglés.

## Accept Gate

Build no actualiza specs como verdad final y no archiva un cambio. Las specs y el archivo se actualizan solo después de aceptación explícita del usuario mediante `/specrow:accept`.

## Migration Notes

Prototipos locales antiguos pueden haber usado la CLI `specfly` o el directorio `.specfly`. Los proyectos nuevos usan el binario `specrow` y `.specrow/`. Mueve los archivos específicos del proyecto que aún necesites a las ubicaciones equivalentes dentro de `.specrow/`.
