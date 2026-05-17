# SpecRow

SpecRow es un flujo de especificaciones agent-first. Los usuarios describen la intención en lenguaje natural, por ejemplo `specrow explore`, `specrow proposal` o `specrow build`; los agentes ejecutan el workflow mediante el servidor MCP de SpecRow.

## Leer en tu idioma

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Documentación

GitHub Pages: https://nektobit.github.io/SpecRow/

El sitio cubre el flujo MVP completo: primeros pasos, explore, de proposal a accept, herramientas MCP, plantillas, localización, validación, reglas lifecycle y diferencias frente a OpenSpec.

## Inicio rápido

Empieza con el agent installer. Pasa explícitamente el idioma de trabajo del proyecto:

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install language=es
```

El agente usa el servidor MCP de SpecRow para inspeccionar el workspace, inicializar `.specrow` con ese idioma cuando haga falta, validar el workspace e informar el siguiente paso lógico.

Luego dile al agente qué workflow de SpecRow quieres:

```txt
specrow explore Discutir la idea antes de crear un cambio
specrow proposal Describe el cambio previsto
specrow review
specrow build
specrow accept
```

Los agentes deben tratar estas frases como intenciones de workflow y ejecutarlas mediante herramientas MCP.

Para automatización fuera de una sesión de agente, también está disponible el binario `specrow`:

```bash
npm i -g specrow
specrow init --language es --tools codex,claude,cursor,windsurf,generic
specrow validate
specrow integrations status
```

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

## Accept Gate

Build no actualiza specs como verdad final y no archiva un cambio. Las specs y el archivo se actualizan solo después de aceptación explícita del usuario mediante el workflow `specrow accept`.

## Migration Notes

Prototipos locales antiguos pueden haber usado la CLI `specfly` o el directorio `.specfly`. Los proyectos nuevos usan el binario `specrow` y `.specrow/`. Mueve los archivos específicos del proyecto que aún necesites a las ubicaciones equivalentes dentro de `.specrow/`.
