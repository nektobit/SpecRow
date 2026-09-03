<!-- specrow:readme-section=title -->
# SpecRow

SpecRow: agent-first workflow для спецификаций. Пользователь описывает намерение обычной фразой, например `specrow migrate`, `specrow explore`, `specrow proposal` или `specrow build`; агент выполняет workflow через MCP-сервер SpecRow.

<!-- specrow:readme-section=language-links -->
## Читать на своем языке

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

<!-- specrow:readme-section=documentation -->
## Документация

GitHub Pages: https://nektobit.github.io/SpecRow/

На сайте описан полный MVP-flow: старт, explore, путь от proposal до accept, MCP-инструменты, шаблоны, локализация, валидация, lifecycle-правила и отличия от OpenSpec.

<!-- specrow:readme-section=quick-start -->
## Быстрый старт

Установите полный плагин в поддерживаемом клиенте:

- GitHub Copilot CLI: `copilot plugin install nektobit/SpecRow`.
- GitHub Copilot в VS Code: выполните `Chat: Install Plugin From Source` и укажите `https://github.com/nektobit/SpecRow`.
- Kiro IDE (экспериментально): выберите `Powers → Add Custom Power → Import power from GitHub` и укажите тот же URL репозитория.
- Codex desktop/CLI и Cursor: совместимый пакет уже входит в репозиторий, но публичная установка одной кнопкой зависит от публикации SpecRow в marketplace каждого клиента.

Hermes Agent, OpenClaw, Grok Bot и NanoClaw совместимы с форматом Agent Plugins, но пока не проверены командой SpecRow. Для Claude Code, Gemini CLI и Windsurf/Cascade сейчас нет поддерживаемой установки SpecRow единым пакетом. Требуются Node.js 20+, локальный stdio MCP и доступ к файлам целевого проекта. Эти пути описаны разработчиками клиентов, но SpecRow пока не запускает клиентские end-to-end тесты установки.

`npm i -g specrow` устанавливает только отдельный CLI и не регистрирует плагин в агенте. После полной установки плагина начните новый чат и попросите агента проверить SpecRow для нужного проекта.

Затем скажите агенту, какой workflow SpecRow нужен:

```txt
specrow migrate openspec
specrow explore Обсудить идею до создания изменения
specrow proposal Опишите нужное изменение
specrow review
specrow build
specrow accept
```

Агент должен считать эти фразы намерениями workflow и выполнять их через MCP-инструменты.

Совет: используйте `brief: текст задачи` или `бриф: текст задачи`, чтобы указать исходное человеческое описание задачи. Агент должен отталкиваться от брифа и его правил при подготовке proposal, но сам бриф не является конечным proposal.

Для автоматизации вне агентной сессии также доступен бинарь `specrow`:

```bash
npm i -g specrow
specrow init --language ru --estimation
specrow migrate ./docs
specrow validate
```

<!-- specrow:readme-section=workspace -->
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

Добавьте `estimation.enabled: true`, если агент должен добавлять примерную оценку времени реализации после формирования каждого proposal:

```yml
version: 1
language: ru
estimation:
  enabled: true
```

<!-- specrow:readme-section=accept-gate -->
## Accept Gate

Build не обновляет спеки как финальную правду и не архивирует изменение. Спеки и архив обновляются только после явной приемки пользователя через workflow `specrow accept`.

<!-- specrow:readme-section=migration -->
## Migration Notes

Используйте `specrow migrate openspec`, `specrow migrate speckit` или `specrow migrate ./docs`, чтобы перенести существующие артефакты спецификаций в `.specrow/`. Если `.specrow` отсутствует, миграция сначала инициализирует его. Исходная система не удаляется, а архивные записи копируются как сохранённая история без преобразования.
