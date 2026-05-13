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
    "next.acceptOrRevise": "Siguiente paso: /specrow:accept o /specrow:revise.",
    "error.missingTemplate": "Falta la plantilla de SpecRow \"{name}\" para el idioma \"{language}\".",
    "error.missingMessage": "Falta el mensaje de SpecRow \"{name}\" para el idioma \"{language}\"."
  }
} satisfies LanguageResources;
