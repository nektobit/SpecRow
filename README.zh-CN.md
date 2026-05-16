# SpecRow

SpecRow 是 agent-first 的规格工作流。用户用自然语言描述意图，例如 `specrow proposal` 或 `specrow build`；代理通过 SpecRow MCP 服务器执行该 workflow。

## 使用你的语言阅读

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

## 文档

GitHub Pages: https://nektobit.github.io/SpecRow/

站点覆盖完整 MVP 流程：开始使用、从 proposal 到 accept、MCP 工具、模板、本地化、验证、生命周期规则，以及与 OpenSpec 的区别。

## 快速开始

优先使用 agent installer。请显式传入项目工作语言：

```txt
apply https://raw.githubusercontent.com/nektobit/SpecRow/refs/heads/main/install language=zh-CN
```

代理使用 SpecRow MCP 服务器检查 workspace，在需要时用该语言初始化 `.specrow`，验证 workspace，并报告下一个合理步骤。

然后告诉代理你想要哪个 SpecRow workflow：

```txt
specrow proposal 描述预期变更
specrow review
specrow build
specrow accept
```

代理应将这些短语视为 workflow 意图，并通过 MCP 工具执行。

对于代理会话之外的自动化，也可以使用 `specrow` 二进制：

```bash
npm i -g specrow
specrow init --language zh-CN --tools codex,claude,cursor,windsurf,generic
specrow validate
specrow integrations status
```

## Workspace

SpecRow 初始化会创建：

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

Build 不会把 specs 更新为最终事实，也不会归档变更。只有用户通过 `specrow accept` workflow 明确验收后，specs 和 archive 才会更新。

## Migration Notes

旧本地原型可能使用过 `specfly` CLI 或 `.specfly` 目录。新项目使用 `specrow` 二进制和 `.specrow/`。把仍然需要的项目文件移动到 `.specrow/` 中对应的位置。
