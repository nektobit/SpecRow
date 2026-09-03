<!-- specrow:readme-section=title -->
# SpecRow

SpecRow 是 agent-first 的规格工作流。用户用自然语言描述意图，例如 `specrow migrate`、`specrow explore`、`specrow proposal` 或 `specrow build`；代理通过 SpecRow MCP 服务器执行该 workflow。

<!-- specrow:readme-section=language-links -->
## 使用你的语言阅读

- [English](README.md)
- [Русский](README.ru.md)
- [Español](README.es.md)
- [中文](README.zh-CN.md)

<!-- specrow:readme-section=documentation -->
## 文档

网站：https://specrow.com/zh-CN/

站点覆盖完整 MVP 流程：开始使用、explore、从 proposal 到 accept、MCP 工具、模板、本地化、验证、生命周期规则，以及与 OpenSpec 的区别。

<!-- specrow:readme-section=quick-start -->
## 快速开始

在受支持的客户端中安装完整插件：

- GitHub Copilot CLI：`copilot plugin install nektobit/SpecRow`。
- VS Code 中的 GitHub Copilot：运行 `Chat: Install Plugin From Source`，然后输入 `https://github.com/nektobit/SpecRow`。
- Kiro IDE（实验性）：选择 `Powers → Add Custom Power → Import power from GitHub`，然后输入同一仓库 URL。
- Codex desktop/CLI 和 Cursor：兼容包已包含在仓库中，但公开的一键安装需要先在各客户端 marketplace 发布 SpecRow。

Hermes Agent、OpenClaw、Grok Bot 和 NanoClaw 与 Agent Plugins 格式兼容，但尚未经过 SpecRow 测试。Claude Code、Gemini CLI 和 Windsurf/Cascade 目前没有受支持的 SpecRow 单包安装方式。运行环境需要 Node.js 20+、本地 stdio MCP 和目标项目文件访问权限。这些路径由客户端厂商提供文档，但 SpecRow 尚未运行特定客户端的端到端安装测试。

`npm i -g specrow` 只安装独立 CLI，不会在代理中注册插件。完整安装插件后，请新建聊天并让代理检查目标项目的 SpecRow。

然后告诉代理你想要哪个 SpecRow workflow：

```txt
specrow migrate openspec
specrow explore 创建变更前先讨论想法
specrow proposal 描述预期变更
specrow review
specrow build
specrow accept
```

代理应将这些短语视为 workflow 意图，并通过 MCP 工具执行。

提示：使用 `brief: 任务文本` 或 `бриф: текст задачи` 标记原始的人类侧任务描述。代理应以 brief 及其中规则为出发点来准备 proposal，但 brief 本身不是最终 proposal。

对于代理会话之外的自动化，也可以使用 `specrow` 二进制：

```bash
npm i -g specrow
specrow init --language zh-CN --estimation
specrow migrate ./docs
specrow validate
```

<!-- specrow:readme-section=workspace -->
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

当代理应在每个 proposal 形成后添加大致实现时间估算时，添加 `estimation.enabled: true`：

```yml
version: 1
language: zh-CN
estimation:
  enabled: true
```

<!-- specrow:readme-section=accept-gate -->
## Accept Gate

Build 不会把 specs 更新为最终事实，也不会归档变更。只有用户通过 `specrow accept` workflow 明确验收后，specs 和 archive 才会更新。

<!-- specrow:readme-section=migration -->
## Migration Notes

使用 `specrow migrate openspec`、`specrow migrate speckit` 或 `specrow migrate ./docs` 将现有规格产物迁移到 `.specrow/`。如果缺少 `.specrow`，迁移会先初始化它。源系统不会被删除，归档记录会作为保留历史原样复制。
