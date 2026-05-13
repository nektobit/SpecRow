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

Empieza con comandos de agente:

```txt
/specrow:init language=es
/specrow:proposal Describe el cambio previsto
/specrow:review
/specrow:build
/specrow:accept
```

El agente puede llamar a `specrow init`, `specrow proposal`, `specrow validate`, `specrow context` y `specrow build-finish` como detalles de implementación.

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

El idioma configurado controla plantillas integradas y mensajes lifecycle/status. Los recursos de idioma ausentes son errores. SpecRow no hace fallback silencioso a inglés.

## Accept Gate

Build no actualiza specs como verdad final y no archiva un cambio. Las specs y el archivo se actualizan solo después de aceptación explícita del usuario mediante `/specrow:accept`.

## Migration Notes

Prototipos locales antiguos pueden haber usado la CLI `specfly` o el directorio `.specfly`. Los proyectos nuevos usan el binario `specrow` y `.specrow/`. Mueve los archivos específicos del proyecto que aún necesites a las ubicaciones equivalentes dentro de `.specrow/`.
