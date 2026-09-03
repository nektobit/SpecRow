import type { LanguageResources } from "../templates.js";

export const zhCN = {
  templates: {
    project: `# 项目

<!-- specrow:section=purpose -->
## 目的
说明项目的用途、服务对象以及重要成果。

<!-- specrow:section=working-language -->
## 工作语言
简体中文。

所有内置 SpecRow 文件、代理编写的提案、规格、任务和生命周期消息都应使用该语言，除非用户明确要求引用其他语言术语。

<!-- specrow:section=domain-vocabulary -->
## 领域词汇
列出项目专用术语、规范名称、缩写以及不能翻译的词。

- 术语：
  - 含义：
  - 备注：

<!-- specrow:section=architecture-notes -->
## 架构说明
记录稳定的技术上下文，帮助代理做出正确更改。

- 运行时和框架：
- 数据存储和外部系统：
- 重要模块或边界：
- 需要保留的既有模式：

<!-- specrow:section=constraints -->
## 约束
记录硬性规则、兼容性要求、安全或隐私边界、性能限制和运维约束。

- 约束：
  - 原因：
  - 验证：

<!-- specrow:section=verification -->
## 验证
说明通常如何证明更改是正确的。

- 单元测试：
- 集成测试：
- 手动检查：
- CI 或发布门禁：
`,
    spec: `# <规格名称>

<!-- specrow:section=purpose -->
## 目的
说明此规格负责的用户可见能力或行为。每个规格只关注一个明确能力。

<!-- specrow:section=current-behavior -->
## 当前行为
描述当前真实行为。只有经过明确验收后，规格才成为最终事实。

- 当前契约：
- 输入和输出：
- 错误处理：
- 重要边界情况：

<!-- specrow:section=requirements -->
## 需求
使用行为优先的需求。需求描述可观察行为、接口、约束和错误处理，而不是内部实现细节。

### 需求：<名称>
系统必须<可观察行为>。

#### 场景：<描述>
- **给定** <可选初始状态>
- **当** <触发器或条件>
- **则** <预期结果>
- **并且** <其他预期结果>

<!-- specrow:section=constraints -->
## 约束
列出适用于此能力的不可违反规则。

<!-- specrow:section=decisions -->
## 决策
记录已接受的产品或技术决策，解释当前行为存在的原因。

- 决策：
  - 原因：
  - 日期：

<!-- specrow:section=verification -->
## 验证
列出证明此规格仍然成立的检查。

- 自动化：
- 手动：
- 可观测性：
`,
    proposal: `# 提案：<变更名称>

<!-- specrow:section=summary -->
## 摘要
用几句话描述预期变更。

<!-- specrow:section=problem -->
## 问题
说明当前痛点、缺失行为、风险或机会。包括用户影响以及为什么现在需要更改。

<!-- specrow:section=proposed-change -->
## 提议的变更
描述目标行为。明确列出每个重要的前后变化。

**<行为或章节名称>**
- 从：<当前状态>
- 到：<未来状态>
- 原因：<为什么需要此变更>
- 影响：<破坏性或兼容性，影响对象>

<!-- specrow:section=scope -->
## 范围
列出此变更包含的内容。

- 

<!-- specrow:section=out-of-scope -->
## 范围之外
列出此变更有意不包含的相关工作。

- 

<!-- specrow:section=user-impact -->
## 用户影响
描述用户、代理、自动化、CI 或维护者将如何感知此变更。

<!-- specrow:section=risks -->
## 风险
列出兼容性、迁移、安全、数据、工作流和本地化风险。

- 风险：
  - 缓解：
  - 验证：

<!-- specrow:section=decisions -->
## 决策
记录形成提案时做出的决策。

- 决策：
  - 原因：

<!-- specrow:section=estimation -->
## 估算
仅当 .specrow/config.yml 中设置 estimation.enabled: true 时填写此章节。

- 大致实现时间：
- 假设：
- 置信度：

<!-- specrow:section=acceptance-criteria -->
## 验收标准
定义用户接受此变更前必须完成的明确检查。

- [ ] 行为已实现并验证。
- [ ] 内置文件使用项目工作语言编写。
- [ ] 在 specrow accept 之前，规格不会作为最终事实被更新。

<!-- specrow:section=spec-updates -->
## 规格更新
当需求发生变化时，使用此结构描述预期规格更改。

### 新增需求
### 修改需求
### 删除需求
### 重命名需求
`,
    tasks: `# 任务：<变更名称>

<!-- specrow:section=implementation -->
## 实现
- [ ] 更新提案所需的代码和生成产物。
- [ ] 将实现范围限制在已接受的提案内。
- [ ] 构建期间不要把规格更新为最终事实。

<!-- specrow:section=verification -->
## 验证
- [ ] 为变更行为运行针对性测试。
- [ ] 运行相关的完整测试或 typecheck。
- [ ] 验证生成的 SpecRow 文件使用配置的语言。

<!-- specrow:section=documentation -->
## 文档
- [ ] 行为变化时更新面向用户或代理的文档。
- [ ] 如果影响现有项目，记录迁移指南。

<!-- specrow:section=acceptance-gate -->
## 验收门禁
- [ ] 构建结果已准备好供用户审查。
- [ ] 下一步是 specrow accept 或 specrow revise。
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
    "next.acceptOrRevise": "下一步：specrow accept 或 specrow revise。",
    "migration.completed": "{source} 的迁移已完成。",
    "migration.dryRun": "{source} 的迁移 dry-run 已完成。",
    "migration.initialized": "已为迁移初始化 {path}。",
    "migration.sourceDetected": "已在 {source} 检测到 {kind} 来源。",
    "migration.copied": "已复制迁移文件：{count}。",
    "migration.converted": "已转换活跃变更：{count}。",
    "migration.skipped": "已跳过现有迁移目标：{count}。",
    "migration.warning": "迁移警告：{warning}",
    "migration.warning.noSpecKitFeatures": "在 {path} 下未找到 SpecKit 功能目录。",
    "migration.warning.noDocumentationFiles": "在 {path} 下未找到文档文件。",
    "migration.warning.importedDocumentationReview": "导入的文档已作为来源材料复制；在将其视为最终 SpecRow 规格前请先审查。",
    "migration.proposalAppendix": `## 迁移来源
已从 {kind} 来源 {source} 迁移。
原始产物保存在 {path}。`,
    "migration.tasksAppendix": `## 迁移审查
- [ ] 审查保存在 {path} 的 {kind} 来源产物。
- [ ] 在将其视为 SpecRow 最终事实前，确认来自 {source} 的迁移结果。`,
    "error.missingTemplate": "语言 \"{language}\" 缺少 SpecRow 模板 \"{name}\"。",
    "error.missingMessage": "语言 \"{language}\" 缺少 SpecRow 消息 \"{name}\"。"
  }
} satisfies LanguageResources;
