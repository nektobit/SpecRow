# SpecRow

SpecRow: agent-first workflow для спецификаций. Пользователь описывает намерение обычной фразой, например `specrow proposal` или `specrow build`; агент выполняет workflow через MCP-сервер SpecRow.

## Читать на своем языке

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## Документация

GitHub Pages: https://nektobit.github.io/SpecRow/

На сайте описан полный MVP-flow: старт, путь от proposal до accept, MCP-инструменты, шаблоны, локализация, валидация, lifecycle-правила и отличия от OpenSpec.

## Быстрый старт

Начинайте с agent installer. Язык проекта передается явно:

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install language=ru
```

Агент использует MCP-сервер SpecRow, чтобы проверить workspace, при необходимости инициализировать `.specrow` с этим языком, запустить валидацию и сообщить следующий логичный шаг.

Затем скажите агенту, какой workflow SpecRow нужен:

```txt
specrow proposal Опишите нужное изменение
specrow review
specrow build
specrow accept
```

Агент должен считать эти фразы намерениями workflow и выполнять их через MCP-инструменты.

Для автоматизации вне агентной сессии также доступен бинарь `specrow`:

```bash
npm i -g specrow
specrow init --language ru --tools codex,claude,cursor,windsurf,generic
specrow validate
specrow integrations status
```

## Workspace

Инициализация SpecRow создает:

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

Build не обновляет спеки как финальную правду и не архивирует изменение. Спеки и архив обновляются только после явной приемки пользователя через workflow `specrow accept`.

## Migration Notes

Старые локальные прототипы могли использовать CLI `specfly` или директорию `.specfly`. Новые проекты используют бинарь `specrow` и `.specrow/`. Перенесите нужные проектные файлы в соответствующие места внутри `.specrow/`.
