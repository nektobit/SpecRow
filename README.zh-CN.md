# SpecRow

SpecRow 是 agent-first 的规格工作流。用户通过 `/specrow:*` 命令描述意图，而 `specrow` CLI 仍然是代理、CI、自动化和手动 fallback 的技术核心。

## 使用你的语言阅读

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## 文档

GitHub Pages: https://nektobit.github.io/SpecRow/

站点覆盖完整 MVP 流程：开始使用、从 proposal 到 accept、代理命令、CLI core、模板、本地化、验证、生命周期规则，以及与 OpenSpec 的区别。

## 快速开始

优先使用代理命令：

```txt
/specrow:init language=zh-CN
/specrow:proposal 描述预期变更
/specrow:review
/specrow:build
/specrow:accept
```

代理可以把 `specrow init`、`specrow proposal`、`specrow validate`、`specrow context` 和 `specrow build-finish` 作为实现细节调用。

## Workspace

`/specrow:init` 创建：

```txt
.specrow/
  config.yml
  project.md
  specs/
  changes/
  archive/
```

`config.yml` 保持最小：

```yml
version: 1
language: zh-CN
```

配置语言控制内置模板和 lifecycle/status 消息。缺少语言资源是错误。SpecRow 不会静默回退到英文。

## Accept Gate

Build 不会把 specs 更新为最终事实，也不会归档变更。只有用户通过 `/specrow:accept` 明确验收后，specs 和 archive 才会更新。

## Migration Notes

旧本地原型可能使用过 `specfly` CLI 或 `.specfly` 目录。新项目使用 `specrow` 二进制和 `.specrow/`。把仍然需要的项目文件移动到 `.specrow/` 中对应的位置。
