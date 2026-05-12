# SpecFly

SpecFly es un sistema de especificaciones multilingue donde el idioma del usuario es el idioma principal de interaccion con el sistema y con los agentes, no una capa de traduccion sobre un modelo centrado en ingles.

## Leer En Tu Idioma

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Sitio De Documentacion

GitHub Pages: https://nektobit.github.io/SpecFly/

## Manifiesto

### 1. Idioma Primero Para El Usuario

Las especificaciones se crean en el idioma que resulte comodo para el usuario.
El trabajo con el sistema debe ser transparente y predecible.

### 2. Vocabulario Compartido

El glosario del proyecto forma parte del sistema.
Todos los terminos de dominio se registran y se usan de forma consistente.

### 3. Representacion Dual

Cada especificacion existe en dos representaciones:

- Human view: para personas
- Agent view: para agentes

Son dos proyecciones de una misma especificacion, no dos documentos independientes.

### 4. Flujo Basado En Cambios

Una nueva funcionalidad, correccion o mejora primero existe como un cambio.
Despues de la implementacion y la verificacion, el cambio se integra en la especificacion vigente.

### 5. Derivacion De Tareas

Las tareas deben poder derivarse de la especificacion.
Si una especificacion no permite obtener un plan de trabajo claro, la especificacion no es suficientemente buena.

### 6. Especificaciones Validables

Una especificacion debe poder validarse por maquina.
La estructura, los enlaces, las secciones obligatorias, los conflictos y las tareas deben validarse.

### 7. Decisiones Explicitas

Los agentes no deben tomar decisiones importantes en silencio.
Las decisiones de arquitectura, UX, datos y seguridad deben registrarse explicitamente.

### 8. Contrato Ejecutable

Una especificacion es un contrato ejecutable.
Si la implementacion o la verificacion requieren herramientas, esas herramientas forman parte del sistema.

### 9. AI Opcional

El sistema funciona con AI.
El sistema funciona sin AI.
