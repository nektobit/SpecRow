import type { LanguageResources } from "../templates.js";

export const es = {
  templates: {
    project: `# Proyecto

<!-- specrow:section=purpose -->
## Propósito
Describe para qué existe el proyecto, a quién sirve y qué resultados importan.

<!-- specrow:section=working-language -->
## Idioma de trabajo
Español.

Todos los archivos integrados de SpecRow, las propuestas, las especificaciones, las tareas y los mensajes del ciclo de vida escritos por agentes deben usar este idioma, salvo que el usuario pida citar un término en otro idioma.

<!-- specrow:section=domain-vocabulary -->
## Vocabulario del dominio
Enumera términos del proyecto, nombres canónicos, siglas y palabras que no deben traducirse.

- Término:
  - Significado:
  - Notas:

<!-- specrow:section=architecture-notes -->
## Notas de arquitectura
Registra el contexto técnico estable que ayuda al agente a realizar cambios correctos.

- Entorno de ejecución y frameworks:
- Almacenes de datos y sistemas externos:
- Módulos o límites importantes:
- Patrones existentes que se deben preservar:

<!-- specrow:section=constraints -->
## Restricciones
Documenta reglas estrictas, requisitos de compatibilidad, límites de seguridad o privacidad, rendimiento y operación.

- Restricción:
  - Razón:
  - Verificación:

<!-- specrow:section=verification -->
## Verificación
Describe cómo se demuestra normalmente que los cambios son correctos.

- Pruebas unitarias:
- Pruebas de integración:
- Comprobaciones manuales:
- CI o puertas de publicación:
`,
    spec: `# <Nombre de la especificación>

<!-- specrow:section=purpose -->
## Propósito
Indica la capacidad o el comportamiento visible para el usuario que esta especificación controla. Mantén una sola capacidad enfocada por especificación.

<!-- specrow:section=current-behavior -->
## Comportamiento actual
Describe lo que es cierto hoy. Las especificaciones son verdad final solo después de una aceptación explícita.

- Contrato actual:
- Entradas y salidas:
- Manejo de errores:
- Casos límite importantes:

<!-- specrow:section=requirements -->
## Requisitos
Usa requisitos centrados en el comportamiento. Los requisitos describen comportamiento observable, interfaces, restricciones y manejo de errores, no detalles internos de implementación.

### Requisito: <Nombre>
El sistema DEBE <comportamiento observable>.

#### Escenario: <Descripción>
- **DADO** <estado inicial opcional>
- **CUANDO** <disparador o condición>
- **ENTONCES** <resultado esperado>
- **Y** <resultado esperado adicional>

<!-- specrow:section=constraints -->
## Restricciones
Enumera reglas obligatorias para esta capacidad.

<!-- specrow:section=decisions -->
## Decisiones
Registra decisiones aceptadas de producto o técnicas que explican por qué existe el comportamiento actual.

- Decisión:
  - Razón:
  - Fecha:

<!-- specrow:section=verification -->
## Verificación
Enumera comprobaciones que demuestran que esta especificación sigue siendo cierta.

- Automatizada:
- Manual:
- Observabilidad:
`,
    proposal: `# Propuesta: <nombre-del-cambio>

<!-- specrow:section=summary -->
## Resumen
Describe el cambio previsto en unas pocas frases.

<!-- specrow:section=problem -->
## Problema
Explica el dolor actual, el comportamiento ausente, el riesgo o la oportunidad. Incluye el impacto en usuarios y por qué el cambio debe hacerse ahora.

<!-- specrow:section=proposed-change -->
## Cambio propuesto
Describe el comportamiento objetivo. Sé explícito con cada cambio relevante de antes/después.

**<Comportamiento o sección>**
- De: <estado actual>
- A: <estado futuro>
- Razón: <por qué se necesita el cambio>
- Impacto: <rompedor o compatible, quién se ve afectado>

<!-- specrow:section=scope -->
## Alcance
Enumera lo que incluye este cambio.

- 

<!-- specrow:section=out-of-scope -->
## Fuera de alcance
Enumera el trabajo relacionado que este cambio excluye intencionalmente.

- 

<!-- specrow:section=user-impact -->
## Impacto en el usuario
Describe cómo usuarios, agentes, automatización, CI o mantenedores experimentan el cambio.

<!-- specrow:section=risks -->
## Riesgos
Señala riesgos de compatibilidad, migración, seguridad, datos, flujo de trabajo y localización.

- Riesgo:
  - Mitigación:
  - Verificación:

<!-- specrow:section=decisions -->
## Decisiones
Registra decisiones tomadas al definir la propuesta.

- Decisión:
  - Razón:

<!-- specrow:section=estimation -->
## Estimación
Completa esta sección solo cuando .specrow/config.yml tenga estimation.enabled: true.

- Tiempo aproximado de implementación:
- Suposiciones:
- Confianza:

<!-- specrow:section=acceptance-criteria -->
## Criterios de aceptación
Define las comprobaciones explícitas necesarias antes de que el usuario pueda aceptar este cambio.

- [ ] El comportamiento está implementado y verificado.
- [ ] Los archivos integrados están escritos en el idioma del proyecto.
- [ ] Las especificaciones no se actualizan como verdad final antes de specrow accept.

<!-- specrow:section=spec-updates -->
## Actualizaciones de especificación
Cuando cambien requisitos, describe los cambios previstos con esta estructura.

### Requisitos AGREGADOS
### Requisitos MODIFICADOS
### Requisitos ELIMINADOS
### Requisitos RENOMBRADOS
`,
    tasks: `# Tareas: <nombre-del-cambio>

<!-- specrow:section=implementation -->
## Implementación
- [ ] Actualizar el código y los artefactos generados requeridos por la propuesta.
- [ ] Mantener la implementación dentro del alcance de la propuesta aceptada.
- [ ] No actualizar especificaciones como verdad final durante la construcción.

<!-- specrow:section=verification -->
## Verificación
- [ ] Ejecutar pruebas dirigidas para el comportamiento cambiado.
- [ ] Ejecutar la prueba completa o el typecheck relevante.
- [ ] Validar que los archivos SpecRow generados usen el idioma configurado.

<!-- specrow:section=documentation -->
## Documentación
- [ ] Actualizar documentación para usuarios o agentes cuando cambie el comportamiento.
- [ ] Anotar guía de migración si se afectan proyectos existentes.

<!-- specrow:section=acceptance-gate -->
## Puerta de aceptación
- [ ] El resultado de construcción está listo para revisión del usuario.
- [ ] El siguiente paso es specrow accept o specrow revise.
`
  },
  messages: {
    "init.config.created": "Creado {path}",
    "init.config.overwritten": "Sobrescrito {path}",
    "init.config.kept": "Se conservó el existente {path}",
    "init.ready": "Listo {path}",
    "lifecycle.proposed": "El cambio está propuesto.",
    "lifecycle.reviewed": "El cambio está revisado.",
    "lifecycle.built": "La compilación terminó. Esperando aceptación explícita o revisión.",
    "lifecycle.revisionNeeded": "Se necesita una revisión.",
    "lifecycle.accepted": "El cambio está aceptado.",
    "lifecycle.archived": "El cambio está archivado.",
    "build.started": "La construcción puede empezar para {change}.",
    "validate.ok": "La validación pasó.",
    "validate.failed": "La validación falló.",
    "review.warning": "La revisión terminó con advertencias.",
    "status.change": "{change}: {state}; revisión: {review}; aceptado: {accepted}.",
    "list.empty": "No hay cambios activos.",
    "list.warning": "Advertencia: {warning}",
    "next.acceptOrRevise": "Siguiente paso: specrow accept o specrow revise.",
    "migration.completed": "Migración completada para {source}.",
    "migration.dryRun": "Ensayo de migración completado para {source}.",
    "migration.initialized": "Inicializado {path} para la migración.",
    "migration.sourceDetected": "Se detectó fuente {kind} en {source}.",
    "migration.copied": "Archivos de migración copiados: {count}.",
    "migration.converted": "Cambios activos convertidos: {count}.",
    "migration.skipped": "Destinos de migración existentes omitidos: {count}.",
    "migration.warning": "Advertencia de migración: {warning}",
    "migration.warning.noSpecKitFeatures": "No se encontraron directorios de características SpecKit en {path}.",
    "migration.warning.noDocumentationFiles": "No se encontraron archivos de documentación en {path}.",
    "migration.warning.importedDocumentationReview": "La documentación importada se copió como material de origen; revísala antes de tratarla como especificaciones finales de SpecRow.",
    "migration.proposalAppendix": `## Fuente de migración
Migrado desde la fuente {kind}: {source}.
Los artefactos originales se conservan en {path}.`,
    "migration.tasksAppendix": `## Revisión de migración
- [ ] Revisar los artefactos de fuente {kind} conservados en {path}.
- [ ] Confirmar el resultado migrado desde {source} antes de tratarlo como verdad final de SpecRow.`,
    "error.missingTemplate": "Falta la plantilla de SpecRow \"{name}\" para el idioma \"{language}\".",
    "error.missingMessage": "Falta el mensaje de SpecRow \"{name}\" para el idioma \"{language}\"."
  }
} satisfies LanguageResources;
