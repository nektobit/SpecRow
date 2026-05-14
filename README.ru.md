# SpecRow

SpecRow: agent-first workflow для спецификаций. Пользователь описывает намерение через команды `/specrow:*`, а CLI `specrow` остается техническим ядром для агентов, CI, автоматизации и ручного fallback.

## Читать на своем языке

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Документация

GitHub Pages: https://nektobit.github.io/SpecRow/

На сайте описан полный MVP-flow: старт, путь от proposal до accept, команды агента, CLI core, шаблоны, локализация, валидация, lifecycle-правила и отличия от OpenSpec.

## Быстрый старт

Установите CLI глобально:

```bash
npm i -g specrow
```

Проверьте установку:

```bash
specrow --version
specrow --help
```

Начинайте с команд агента:

```txt
/specrow:init language=ru
/specrow:proposal Опишите нужное изменение
/specrow:review
/specrow:build
/specrow:accept
```

Агент может вызывать `specrow init`, `specrow proposal`, `specrow validate`, `specrow context` и `specrow build-finish` как детали реализации.

## Workspace

`/specrow:init` создает:

```txt
.specrow/
  config.yml
  project.md
  specs/
  changes/
  archive/
```

`config.yml` остается минимальным:

```yml
version: 1
language: ru
```

Настроенный язык управляет встроенными шаблонами и lifecycle/status-сообщениями. Отсутствующие языковые ресурсы являются ошибкой. SpecRow не делает silent fallback на английский.

## Accept Gate

Build не обновляет спеки как финальную правду и не архивирует изменение. Спеки и архив обновляются только после явной приемки пользователя через `/specrow:accept`.

## Migration Notes

Старые локальные прототипы могли использовать CLI `specfly` или директорию `.specfly`. Новые проекты используют бинарь `specrow` и `.specrow/`. Перенесите нужные проектные файлы в соответствующие места внутри `.specrow/`.
