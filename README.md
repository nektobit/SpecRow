# SpecRow

SpecRow is a multilingual specification system where the user's language is the primary language of interaction with the system and with agents, not a translation layer on top of an English-first model.

## Read This In Your Language

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Documentation Site

GitHub Pages: https://nektobit.github.io/SpecRow/

## Manifesto

### 1. User-First Language

Specifications are created in the language that is convenient for the user.
Working with the system must be transparent and predictable.

### 2. Shared Vocabulary

The project glossary is part of the system.
All domain terms are recorded and used consistently.

### 3. Dual Representation

Each specification exists in two representations:

- Human view: for people
- Agent view: for agents

These are two projections of the same specification, not two independent documents.

### 4. Change-First Workflow

A new feature, fix, or improvement first exists as a change.
After implementation and verification, the change is integrated into the current specification.

### 5. Task Derivation

Tasks must be derivable from the specification.
If a specification cannot produce a clear work plan, the specification is not good enough.

### 6. Validatable Specs

A specification must be machine-validatable.
Structure, links, required sections, conflicts, and tasks must be validated.

### 7. Explicit Decisions

Agents must not silently make important decisions.
Architecture, UX, data, and security decisions must be recorded explicitly.

### 8. Executable Contract

A specification is an executable contract.
If implementation or verification requires tools, those tools are part of the system.

### 9. AI-Optional

The system works with AI.
The system works without AI.
