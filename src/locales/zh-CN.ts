import type { LanguageResources } from "../templates.js";

export const zhCN = {
  templates: {
    project: `# 项目

## 目的
说明项目的用途、服务对象以及重要成果。

## 工作语言
简体中文。

所有内置 SpecRow 文件、代理编写的提案、规格、任务和生命周期消息都应使用该语言，除非用户明确要求引用其他语言术语。

## 领域词汇
列出项目专用术语、规范名称、缩写以及不能翻译的词。

- 术语：
  - 含义：
  - 备注：

## 架构说明
记录稳定的技术上下文，帮助代理做出正确更改。

- 运行时和框架：
- 数据存储和外部系统：
- 重要模块或边界：
- 需要保留的既有模式：

## 约束
记录硬性规则、兼容性要求、安全或隐私边界、性能限制和运维约束。

- 约束：
  - 原因：
  - 验证：

## 验证
说明通常如何证明更改是正确的。

- 单元测试：
- 集成测试：
- 手动检查：
- CI 或发布门禁：
`,
    spec: `# <规格名称>

## 目的
说明此规格负责的用户可见能力或行为。每个规格只关注一个明确能力。

## 当前行为
描述当前真实行为。只有经过明确验收后，规格才成为最终事实。

- 当前契约：
- 输入和输出：
- 错误处理：
- 重要边界情况：

## 需求
使用行为优先的需求。需求描述可观察行为、接口、约束和错误处理，而不是内部实现细节。

### 需求：<名称>
系统必须<可观察行为>。

#### 场景：<描述>
- **给定** <可选初始状态>
- **当** <触发器或条件>
- **则** <预期结果>
- **并且** <其他预期结果>

## 约束
列出适用于此能力的不可违反规则。

## 决策
记录已接受的产品或技术决策，解释当前行为存在的原因。

- 决策：
  - 原因：
  - 日期：

## 验证
列出证明此规格仍然成立的检查。

- 自动化：
- 手动：
- 可观测性：
`,
    proposal: `# 提案：<变更名称>

## 摘要
用几句话描述预期变更。

## 问题
说明当前痛点、缺失行为、风险或机会。包括用户影响以及为什么现在需要更改。

## 提议的变更
描述目标行为。明确列出每个重要的前后变化。

**<行为或章节名称>**
- 从：<当前状态>
- 到：<未来状态>
- 原因：<为什么需要此变更>
- 影响：<破坏性或兼容性，影响对象>

## 范围
列出此变更包含的内容。

- 

## 范围之外
列出此变更有意不包含的相关工作。

- 

## 用户影响
描述用户、代理、自动化、CI 或维护者将如何感知此变更。

## 风险
列出兼容性、迁移、安全、数据、工作流和本地化风险。

- 风险：
  - 缓解：
  - 验证：

## 决策
记录形成提案时做出的决策。

- 决策：
  - 原因：

## 验收标准
定义用户接受此变更前必须完成的明确检查。

- [ ] 行为已实现并验证。
- [ ] 内置文件使用项目工作语言编写。
- [ ] 在 /specrow:accept 之前，规格不会作为最终事实被更新。

## 规格更新
当需求发生变化时，使用此结构描述预期规格更改。

### 新增需求
### 修改需求
### 删除需求
### 重命名需求
`,
    tasks: `# 任务：<变更名称>

## 实现
- [ ] 更新提案所需的代码和生成产物。
- [ ] 将实现范围限制在已接受的提案内。
- [ ] 构建期间不要把规格更新为最终事实。

## 验证
- [ ] 为变更行为运行针对性测试。
- [ ] 运行相关的完整测试或 typecheck。
- [ ] 验证生成的 SpecRow 文件使用配置的语言。

## 文档
- [ ] 行为变化时更新面向用户或代理的文档。
- [ ] 如果影响现有项目，记录迁移指南。

## 验收门禁
- [ ] 构建结果已准备好供用户审查。
- [ ] 下一步是 /specrow:accept 或 /specrow:revise。
`
  },
  messages: {
    "init.config.created": "已创建 {path}",
    "init.config.overwritten": "已覆盖 {path}",
    "init.config.kept": "已保留现有 {path}",
    "init.ready": "已就绪 {path}",
    "lifecycle.proposed": "变更已提出。",
    "lifecycle.reviewed": "变更已评审。",
    "lifecycle.built": "构建已完成。正在等待明确验收或修订。",
    "lifecycle.revisionNeeded": "需要修订。",
    "lifecycle.accepted": "变更已验收。",
    "lifecycle.archived": "变更已归档。",
    "build.started": "可以开始构建变更 {change}。",
    "validate.ok": "验证已通过。",
    "validate.failed": "验证失败。",
    "review.warning": "评审已完成，但有警告。",
    "status.change": "{change}: {state}; 评审: {review}; 已验收: {accepted}。",
    "list.empty": "没有活跃变更。",
    "list.warning": "警告：{warning}",
    "next.acceptOrRevise": "下一步：/specrow:accept 或 /specrow:revise。",
    "error.missingTemplate": "语言 \"{language}\" 缺少 SpecRow 模板 \"{name}\"。",
    "error.missingMessage": "语言 \"{language}\" 缺少 SpecRow 消息 \"{name}\"。"
  },
  agentCommands: {
    "/specrow:init": {
      userIntent: "为当前项目设置 SpecRow，用户无需记住 CLI 参数或文件。",
      agentBehavior: [
        "从用户意图确定项目工作语言，存在歧义时询问。",
        "将 CLI init 命令作为实现细节执行。",
        "确认 .specrow/config.yml、project.md、specs/、changes/ 和 archive/ 已存在。"
      ],
      forbiddenActions: ["不要创建旧版工作目录。", "请求语言资源缺失时不要继续。"],
      languageRules: [
        "创建或修改内置 SpecRow 文件前读取 .specrow/config.yml。",
        "对 project.md、规格、提案、任务和生命周期/状态响应使用配置语言。",
        "必需模板或消息不可用时，以明确的缺失资源错误停止。",
        "不要静默 fallback 到英文。"
      ],
      stopConditions: ["请求语言缺少模板或消息资源。"]
    },
    "/specrow:proposal": {
      userIntent: "将用户意图转为具体变更提案和任务骨架。",
      agentBehavior: [
        "根据用户意图选择稳定的变更名称。",
        "通过 CLI core 创建 proposal.md、tasks.md 和 status.yml。",
        "使用配置的项目语言填写提案和任务内容。",
        "验证变更，并在开始实现前暴露阻塞问题。"
      ],
      forbiddenActions: ["创建提案时不要实现代码。", "不要接受、归档或将规格更新为最终事实。"],
      languageRules: [
        "创建或修改内置 SpecRow 文件前读取 .specrow/config.yml。",
        "对 project.md、规格、提案、任务和生命周期/状态响应使用配置语言。",
        "必需模板或消息不可用时，以明确的缺失资源错误停止。",
        "不要静默 fallback 到英文。"
      ],
      stopConditions: ["项目未初始化。", "配置语言缺少模板或生命周期消息。", "无法生成必需的提案或任务章节。"]
    },
    "/specrow:review": {
      userIntent: "在编写代码前检查提案准备度；默认建议使用，仅对高风险变更强制。",
      agentBehavior: [
        "检查问题表述、范围、风险、决策、验收标准和语言一致性。",
        "将 review 视为高风险变更的必需步骤、普通变更的建议步骤。",
        "当 review 发现阻塞性歧义时，询问用户或修订提案。"
      ],
      forbiddenActions: ["review 期间不要实现代码。", "不要将 review 当作验收。"],
      languageRules: [
        "创建或修改内置 SpecRow 文件前读取 .specrow/config.yml。",
        "对 project.md、规格、提案、任务和生命周期/状态响应使用配置语言。",
        "必需模板或消息不可用时，以明确的缺失资源错误停止。",
        "不要静默 fallback 到英文。"
      ],
      stopConditions: [
        "缺少验收标准或验收标准过弱。",
        "高风险变更缺少关于风险、迁移、安全、数据或兼容性的明确决策。",
        "配置语言缺少模板或生命周期消息。"
      ],
      reviewPolicyRequiredWhen: [
        "安全、隐私或权限行为变更。",
        "数据模型、迁移、持久化或破坏性操作变更。",
        "公共 API、CLI 契约、自动化或 CI 行为变更。",
        "架构、跨模块 workflow、本地化或用户可见生命周期变更。"
      ]
    },
    "/specrow:build": {
      userIntent: "实现并验证已批准的变更，但不将其变成最终事实。",
      agentBehavior: [
        "使用 CLI context 加载提案、任务、状态和活跃变更警告。",
        "只实现变更描述的工作。",
        "运行相关验证，并在适当时用实现证据更新变更任务。",
        "结束时让变更等待 /specrow:accept 或 /specrow:revise。"
      ],
      forbiddenActions: ["不要执行验收。", "不要归档变更。", "不要将规格更新为最终事实。"],
      languageRules: [
        "创建或修改内置 SpecRow 文件前读取 .specrow/config.yml。",
        "对 project.md、规格、提案、任务和生命周期/状态响应使用配置语言。",
        "必需模板或消息不可用时，以明确的缺失资源错误停止。",
        "不要静默 fallback 到英文。"
      ],
      stopConditions: ["实现前验证失败。", "提案过于含糊，无法安全实现。", "配置语言缺少模板或生命周期消息。"]
    },
    "/specrow:revise": {
      userIntent: "在 build 后处理用户请求的修改，不接受也不归档变更。",
      agentBehavior: [
        "将变更标记为需要修订。",
        "按需将用户请求的后续修改应用到提案、任务、实现或验证证据。",
        "重新运行相关验证，并让变更准备好等待用户下一次决定。"
      ],
      forbiddenActions: ["不要将修订视为验收。", "不要归档变更。", "不要将规格更新为最终事实。"],
      languageRules: [
        "创建或修改内置 SpecRow 文件前读取 .specrow/config.yml。",
        "对 project.md、规格、提案、任务和生命周期/状态响应使用配置语言。",
        "必需模板或消息不可用时，以明确的缺失资源错误停止。",
        "不要静默 fallback 到英文。"
      ],
      stopConditions: ["请求的修订与提案范围冲突，需要新的用户决策。", "配置语言缺少模板或生命周期消息。"]
    },
    "/specrow:accept": {
      userIntent: "记录用户明确验收，并允许最终规格集成和归档。",
      agentBehavior: [
        "仅当用户明确接受已构建或已完成修订的工作时继续。",
        "通过 CLI core 记录明确验收。",
        "将此路径作为规格成为最终事实和归档的唯一用户授权。"
      ],
      forbiddenActions: ["不要从沉默、测试成功或实现完成推断验收。", "不要接受尚未构建或修订未完成的变更。"],
      languageRules: [
        "创建或修改内置 SpecRow 文件前读取 .specrow/config.yml。",
        "对 project.md、规格、提案、任务和生命周期/状态响应使用配置语言。",
        "必需模板或消息不可用时，以明确的缺失资源错误停止。",
        "不要静默 fallback 到英文。"
      ],
      stopConditions: ["用户尚未明确接受变更。", "变更未构建或修订未完成。", "配置语言缺少模板或生命周期消息。"]
    }
  },
  integration: {
    managedHeader: "此文件或章节由 SpecRow 管理。请使用以下命令重新生成：\nspecrow update",
    commandSections: {
      invocation: "调用",
      userIntent: "用户意图",
      toolCore: "工具核心",
      agentBehavior: "代理行为",
      forbiddenActions: "禁止操作",
      languageRules: "语言规则",
      stopConditions: "停止条件",
      nextCommands: "下一步命令",
      none: "无。"
    },
    invocationTemplate: "当用户写入 `{command}` 或表达相同意图时，使用此 workflow。",
    agentInstructions: {
      title: "SpecRow 代理说明",
      overview: "SpecRow 是 agent-first 的规格 workflow。将用户的 `/specrow:*` 消息视为 workflow 意图。可用时优先使用 SpecRow MCP 工具，并把 `specrow` CLI 作为 fallback 实现细节使用。",
      languageRule: "创建或修改内置 SpecRow 文件前，读取 `.specrow/config.yml` 并使用其中配置的 `language`。不要静默 fallback 到英文。",
      toolCore: "工具核心：",
      forbidden: "禁止："
    },
    toolCoreFallback: "可用时优先使用 SpecRow MCP 工具。如果 MCP 不可用，使用以下 CLI fallback 命令：",
    skill: {
      description: "当用户提到 SpecRow 或 /specrow:* 命令时，使用 SpecRow workflow。",
      whenToUse: "何时使用",
      instructions: "说明",
      triggers: [
        "用户调用 `/specrow:*` 命令。",
        "用户要求初始化 SpecRow、创建提案、review、build、revise 或 accept 一个 SpecRow 变更。"
      ]
    }
  }
} satisfies LanguageResources;
