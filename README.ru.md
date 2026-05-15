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

Начинайте с agent installer. Язык проекта передается явно:

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install language=ru
```

Агент проверит или установит CLI, инициализирует `.specrow` с этим языком, автоматически настроит MCP-интеграцию по умолчанию, если она поддерживается, установит fallback-инструкции агента при необходимости, запустит валидацию и сообщит, нужно ли перезапустить IDE или агента.

Затем используйте команды SpecRow:

```txt
/specrow:proposal Опишите нужное изменение
/specrow:review
/specrow:build
/specrow:accept
```

CLI остается fallback и ядром автоматизации:

```bash
npm i -g specrow
specrow init --language ru --tools codex,claude,cursor,windsurf,generic
specrow integrate --detect
specrow update
specrow integrations status
```

Без `--tools` команда `specrow init` создает только workspace `.specrow`.

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

Когда интеграции установлены, `config.yml` также хранит выбранные tools и managed files, чтобы `specrow update` мог их регенерировать.

Настроенный язык управляет встроенными шаблонами и lifecycle/status-сообщениями. Отсутствующие языковые ресурсы являются ошибкой. SpecRow не делает silent fallback на английский.

## Accept Gate

Build не обновляет спеки как финальную правду и не архивирует изменение. Спеки и архив обновляются только после явной приемки пользователя через `/specrow:accept`.

## Migration Notes

Старые локальные прототипы могли использовать CLI `specfly` или директорию `.specfly`. Новые проекты используют бинарь `specrow` и `.specrow/`. Перенесите нужные проектные файлы в соответствующие места внутри `.specrow/`.
