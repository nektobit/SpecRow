import type { LanguageResources } from "../templates.js";

export const es = {
  templates: {
    project: `# Proyecto

## Propósito
Describe para qué existe el proyecto, a quién sirve y qué resultados importan.

## Idioma de trabajo
Español.

Todos los archivos integrados de SpecRow, las propuestas, las especificaciones, las tareas y los mensajes del ciclo de vida escritos por agentes deben usar este idioma, salvo que el usuario pida citar un término en otro idioma.

## Vocabulario del dominio
Enumera términos del proyecto, nombres canónicos, siglas y palabras que no deben traducirse.

- Término:
  - Significado:
  - Notas:

## Notas de arquitectura
Registra el contexto técnico estable que ayuda al agente a realizar cambios correctos.

- Entorno de ejecución y frameworks:
- Almacenes de datos y sistemas externos:
- Módulos o límites importantes:
- Patrones existentes que se deben preservar:

## Restricciones
Documenta reglas estrictas, requisitos de compatibilidad, límites de seguridad o privacidad, rendimiento y operación.

- Restricción:
  - Razón:
  - Verificación:

## Verificación
Describe cómo se demuestra normalmente que los cambios son correctos.

- Pruebas unitarias:
- Pruebas de integración:
- Comprobaciones manuales:
- CI o puertas de publicación:
`,
    spec: `# <Nombre de la especificación>

## Propósito
Indica la capacidad o el comportamiento visible para el usuario que esta especificación controla. Mantén una sola capacidad enfocada por especificación.

## Comportamiento actual
Describe lo que es cierto hoy. Las especificaciones son verdad final solo después de una aceptación explícita.

- Contrato actual:
- Entradas y salidas:
- Manejo de errores:
- Casos límite importantes:

## Requisitos
Usa requisitos centrados en el comportamiento. Los requisitos describen comportamiento observable, interfaces, restricciones y manejo de errores, no detalles internos de implementación.

### Requisito: <Nombre>
El sistema DEBE <comportamiento observable>.

#### Escenario: <Descripción>
- **DADO** <estado inicial opcional>
- **CUANDO** <disparador o condición>
- **ENTONCES** <resultado esperado>
- **Y** <resultado esperado adicional>

## Restricciones
Enumera reglas obligatorias para esta capacidad.

## Decisiones
Registra decisiones aceptadas de producto o técnicas que explican por qué existe el comportamiento actual.

- Decisión:
  - Razón:
  - Fecha:

## Verificación
Enumera comprobaciones que demuestran que esta especificación sigue siendo cierta.

- Automatizada:
- Manual:
- Observabilidad:
`,
    proposal: `# Propuesta: <nombre-del-cambio>

## Resumen
Describe el cambio previsto en unas pocas frases.

## Problema
Explica el dolor actual, el comportamiento ausente, el riesgo o la oportunidad. Incluye el impacto en usuarios y por qué el cambio debe hacerse ahora.

## Cambio propuesto
Describe el comportamiento objetivo. Sé explícito con cada cambio relevante de antes/después.

**<Comportamiento o sección>**
- De: <estado actual>
- A: <estado futuro>
- Razón: <por qué se necesita el cambio>
- Impacto: <rompedor o compatible, quién se ve afectado>

## Alcance
Enumera lo que incluye este cambio.

- 

## Fuera de alcance
Enumera el trabajo relacionado que este cambio excluye intencionalmente.

- 

## Impacto en el usuario
Describe cómo usuarios, agentes, automatización, CI o mantenedores experimentan el cambio.

## Riesgos
Señala riesgos de compatibilidad, migración, seguridad, datos, flujo de trabajo y localización.

- Riesgo:
  - Mitigación:
  - Verificación:

## Decisiones
Registra decisiones tomadas al definir la propuesta.

- Decisión:
  - Razón:

## Criterios de aceptación
Define las comprobaciones explícitas necesarias antes de que el usuario pueda aceptar este cambio.

- [ ] El comportamiento está implementado y verificado.
- [ ] Los archivos integrados están escritos en el idioma del proyecto.
- [ ] Las especificaciones no se actualizan como verdad final antes de /specrow:accept.

## Actualizaciones de especificación
Cuando cambien requisitos, describe los cambios previstos con esta estructura.

### Requisitos AGREGADOS
### Requisitos MODIFICADOS
### Requisitos ELIMINADOS
### Requisitos RENOMBRADOS
`,
    tasks: `# Tareas: <nombre-del-cambio>

## Implementación
- [ ] Actualizar el código y los artefactos generados requeridos por la propuesta.
- [ ] Mantener la implementación dentro del alcance de la propuesta aceptada.
- [ ] No actualizar especificaciones como verdad final durante la construcción.

## Verificación
- [ ] Ejecutar pruebas dirigidas para el comportamiento cambiado.
- [ ] Ejecutar la prueba completa o el typecheck relevante.
- [ ] Validar que los archivos SpecRow generados usen el idioma configurado.

## Documentación
- [ ] Actualizar documentación para usuarios o agentes cuando cambie el comportamiento.
- [ ] Anotar guía de migración si se afectan proyectos existentes.

## Puerta de aceptación
- [ ] El resultado de construcción está listo para revisión del usuario.
- [ ] El siguiente paso es /specrow:accept o /specrow:revise.
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
    "next.acceptOrRevise": "Siguiente paso: /specrow:accept o /specrow:revise.",
    "error.missingTemplate": "Falta la plantilla de SpecRow \"{name}\" para el idioma \"{language}\".",
    "error.missingMessage": "Falta el mensaje de SpecRow \"{name}\" para el idioma \"{language}\"."
  },
  agentCommands: {
    "/specrow:init": {
      userIntent: "Configurar SpecRow para el proyecto actual sin exigir que el usuario recuerde flags o archivos de CLI.",
      agentBehavior: [
        "Determinar el idioma de trabajo del proyecto desde el usuario o preguntarlo si es ambiguo.",
        "Ejecutar la orden init de CLI como detalle técnico.",
        "Confirmar que existen .specrow/config.yml, project.md, specs/, changes/ y archive/."
      ],
      forbiddenActions: ["No crear directorios de trabajo heredados.", "No continuar si faltan recursos del idioma solicitado."],
      languageRules: [
        "Leer .specrow/config.yml antes de crear o revisar archivos integrados de SpecRow.",
        "Usar el idioma configurado para project.md, especificaciones, propuestas, tareas y mensajes de ciclo de vida.",
        "Detenerse con un error claro de recurso faltante cuando no esté disponible una plantilla o mensaje requerido.",
        "No hacer fallback silencioso al inglés."
      ],
      stopConditions: ["Faltan plantillas o mensajes para el idioma solicitado."]
    },
    "/specrow:proposal": {
      userIntent: "Convertir la intención del usuario en una propuesta de cambio concreta y un esqueleto de tareas.",
      agentBehavior: [
        "Elegir un nombre estable para el cambio a partir de la intención del usuario.",
        "Crear proposal.md, tasks.md y status.yml mediante CLI core.",
        "Completar la propuesta y las tareas en el idioma configurado del proyecto.",
        "Validar el cambio y mostrar problemas bloqueantes antes de iniciar la implementación."
      ],
      forbiddenActions: ["No implementar código durante la creación de la propuesta.", "No aceptar, archivar ni actualizar especificaciones como verdad final."],
      languageRules: [
        "Leer .specrow/config.yml antes de crear o revisar archivos integrados de SpecRow.",
        "Usar el idioma configurado para project.md, especificaciones, propuestas, tareas y mensajes de ciclo de vida.",
        "Detenerse con un error claro de recurso faltante cuando no esté disponible una plantilla o mensaje requerido.",
        "No hacer fallback silencioso al inglés."
      ],
      stopConditions: [
        "El proyecto no está inicializado.",
        "Al idioma configurado le faltan plantillas o mensajes de ciclo de vida.",
        "No se pueden producir secciones requeridas de propuesta o tareas."
      ]
    },
    "/specrow:review": {
      userIntent: "Comprobar la preparación de la propuesta antes del código; se recomienda por defecto y solo es obligatoria para cambios riesgosos.",
      agentBehavior: [
        "Revisar planteamiento del problema, alcance, riesgos, decisiones, criterios de aceptación y coherencia de idioma.",
        "Tratar review como obligatoria para cambios riesgosos y recomendada para cambios ordinarios.",
        "Preguntar al usuario o revisar la propuesta cuando review encuentre ambigüedad bloqueante."
      ],
      forbiddenActions: ["No implementar código durante review.", "No usar review como aceptación."],
      languageRules: [
        "Leer .specrow/config.yml antes de crear o revisar archivos integrados de SpecRow.",
        "Usar el idioma configurado para project.md, especificaciones, propuestas, tareas y mensajes de ciclo de vida.",
        "Detenerse con un error claro de recurso faltante cuando no esté disponible una plantilla o mensaje requerido.",
        "No hacer fallback silencioso al inglés."
      ],
      stopConditions: [
        "Faltan criterios de aceptación o son demasiado débiles.",
        "Los cambios riesgosos carecen de decisiones explícitas sobre riesgo, migración, seguridad, datos o compatibilidad.",
        "Al idioma configurado le faltan plantillas o mensajes de ciclo de vida."
      ],
      reviewPolicyRequiredWhen: [
        "Cambios de seguridad, privacidad o permisos.",
        "Cambios de modelo de datos, migración, persistencia u operaciones destructivas.",
        "Cambios de API pública, contrato CLI, automatización o CI.",
        "Cambios de arquitectura, workflow entre módulos, localización o ciclo de vida visible para usuarios."
      ]
    },
    "/specrow:build": {
      userIntent: "Implementar y verificar un cambio aprobado sin convertirlo en verdad final.",
      agentBehavior: [
        "Usar CLI context para cargar propuesta, tareas, estado y advertencias de cambios activos.",
        "Implementar solo el trabajo descrito por el cambio.",
        "Ejecutar verificación relevante y actualizar tareas con evidencia cuando corresponda.",
        "Terminar dejando el cambio en espera de /specrow:accept o /specrow:revise."
      ],
      forbiddenActions: ["No ejecutar aceptación.", "No archivar el cambio.", "No actualizar especificaciones como verdad final."],
      languageRules: [
        "Leer .specrow/config.yml antes de crear o revisar archivos integrados de SpecRow.",
        "Usar el idioma configurado para project.md, especificaciones, propuestas, tareas y mensajes de ciclo de vida.",
        "Detenerse con un error claro de recurso faltante cuando no esté disponible una plantilla o mensaje requerido.",
        "No hacer fallback silencioso al inglés."
      ],
      stopConditions: [
        "La validación falla antes de implementar.",
        "La propuesta es demasiado ambigua para implementarla con seguridad.",
        "Al idioma configurado le faltan plantillas o mensajes de ciclo de vida."
      ]
    },
    "/specrow:revise": {
      userIntent: "Gestionar cambios solicitados por el usuario después de build sin aceptar ni archivar el cambio.",
      agentBehavior: [
        "Marcar el cambio como pendiente de revisión.",
        "Aplicar los ajustes solicitados a la propuesta, tareas, implementación o evidencia de verificación.",
        "Volver a ejecutar la verificación relevante y dejar el cambio listo para otra decisión del usuario."
      ],
      forbiddenActions: ["No tratar la revisión como aceptación.", "No archivar el cambio.", "No actualizar especificaciones como verdad final."],
      languageRules: [
        "Leer .specrow/config.yml antes de crear o revisar archivos integrados de SpecRow.",
        "Usar el idioma configurado para project.md, especificaciones, propuestas, tareas y mensajes de ciclo de vida.",
        "Detenerse con un error claro de recurso faltante cuando no esté disponible una plantilla o mensaje requerido.",
        "No hacer fallback silencioso al inglés."
      ],
      stopConditions: [
        "La revisión solicitada entra en conflicto con el alcance de la propuesta y requiere una nueva decisión del usuario.",
        "Al idioma configurado le faltan plantillas o mensajes de ciclo de vida."
      ]
    },
    "/specrow:accept": {
      userIntent: "Registrar la aceptación explícita del usuario y permitir la integración final de especificaciones y archivo.",
      agentBehavior: [
        "Continuar solo cuando el usuario acepte claramente el trabajo construido o la revisión completada.",
        "Registrar la aceptación explícita mediante CLI core.",
        "Usar esta ruta como la única autorización de usuario para que las especificaciones sean verdad final y para archivar."
      ],
      forbiddenActions: [
        "No inferir aceptación por silencio, pruebas exitosas o implementación terminada.",
        "No aceptar un cambio que no esté construido o completo tras revisión."
      ],
      languageRules: [
        "Leer .specrow/config.yml antes de crear o revisar archivos integrados de SpecRow.",
        "Usar el idioma configurado para project.md, especificaciones, propuestas, tareas y mensajes de ciclo de vida.",
        "Detenerse con un error claro de recurso faltante cuando no esté disponible una plantilla o mensaje requerido.",
        "No hacer fallback silencioso al inglés."
      ],
      stopConditions: [
        "El usuario no ha aceptado explícitamente el cambio.",
        "El cambio no está construido o la revisión no está completa.",
        "Al idioma configurado le faltan plantillas o mensajes de ciclo de vida."
      ]
    }
  },
  integration: {
    managedHeader: "Este archivo o sección está gestionado por SpecRow. Regenéralo con:\nspecrow update",
    commandSections: {
      invocation: "Invocación",
      userIntent: "Intención del usuario",
      toolCore: "Nucleo de herramientas",
      agentBehavior: "Comportamiento del agente",
      forbiddenActions: "Acciones prohibidas",
      languageRules: "Reglas de idioma",
      stopConditions: "Condiciones de parada",
      nextCommands: "Siguientes comandos",
      none: "Ninguno."
    },
    invocationTemplate: "Usa este workflow cuando el usuario escriba `{command}` o pida la misma intención.",
    agentInstructions: {
      title: "Instrucciones del agente SpecRow",
      overview: "SpecRow es un workflow de especificaciones agent-first. Trata los mensajes `/specrow:*` como intenciones de workflow. Usa primero las herramientas MCP de SpecRow cuando esten disponibles y usa la CLI `specrow` como fallback de implementacion.",
      languageRule: "Antes de crear o revisar archivos integrados de SpecRow, lee `.specrow/config.yml` y usa su `language` configurado. No hagas fallback silencioso al inglés.",
      toolCore: "Nucleo de herramientas:",
      forbidden: "Prohibido:"
    },
    toolCoreFallback: "Usa primero las herramientas MCP de SpecRow cuando esten disponibles. Si MCP no esta disponible, usa estos comandos CLI de fallback:",
    skill: {
      description: "Usa workflows de SpecRow cuando el usuario mencione SpecRow o comandos /specrow:*.",
      whenToUse: "Cuándo usar",
      instructions: "Instrucciones",
      triggers: [
        "El usuario invoca un comando `/specrow:*`.",
        "El usuario pide inicializar SpecRow, crear una propuesta, revisar, construir, revisar cambios o aceptar un cambio SpecRow."
      ]
    }
  }
} satisfies LanguageResources;
