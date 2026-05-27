# 通用 Coding Agent 前端开发 Harness 调研与团队工作方式

## 1. 结论摘要

面向前端研发的 AI Harness 不应该绑定某一个 Coding Agent。Claude Code、Codex、Cursor、Windsurf、Trae、Qwen Code 和通义灵码的产品形态不同，但稳定落地时都需要同一组工程能力：

1. 明确的项目规则入口。
2. 可控的上下文加载。
3. 执行前的计划和边界确认。
4. 编码过程中的复用和风格约束。
5. 执行后的验证、Review 和证据归档。
6. 失败后的 RCA 和规则反哺。

因此，团队应把 Harness 设计成两层：

| 层级 | 作用 | 存放位置 |
|------|------|----------|
| Agent 原生层 | 适配不同工具的规则入口、权限、hooks、commands、memories | `CLAUDE.md`、`AGENTS.md`、Cursor Rules、Windsurf Rules、Trae Rules |
| 仓库协议层 | 跨工具通用的 Spec、任务、验证、审计、RCA 和评估 | `.ai/`、`skills/`、`specs/`、`docs/`、`scripts/` |

Agent 原生层负责“让工具听得懂”，仓库协议层负责“让团队可复用、可审计、可进化”。

## 2. 行业 Harness 全景

### 2.1 Claude Code

Claude Code 的 Harness 偏向会话生命周期控制。它的关键机制包括：

| 能力 | 用法 | 对前端团队的价值 |
|------|------|------------------|
| `CLAUDE.md` | 项目记忆和规则入口 | 写入团队前端规范、验证命令、禁止事项 |
| Hooks | `PreToolUse`、`PostToolUse`、`Stop` 等事件 | 写文件前检查 Spec，结束前检查验证和记录 |
| Subagents | planner、reviewer、tester 等角色 | 分离规划、实现、审查和测试职责 |
| Slash commands | `/spec`、`/plan`、`/review` 等命令 | 固化团队流程入口 |
| Permissions | 工具和命令权限控制 | 控制高风险命令、核心文件修改和外部访问 |
| MCP | 连接 GitHub、文档、设计稿、监控等上下文 | 提供受控企业上下文 |

Claude Code 的优势是执行中护栏强，适合做 checkpoint、approval 和 stop gate。

### 2.2 Codex / Qwen Code

Codex 和 Qwen Code 代表 CLI / 云端 Agent 的执行环境型 Harness。关键机制包括：

| 能力 | 用法 | 对前端团队的价值 |
|------|------|------------------|
| `AGENTS.md` | 项目规则和工作方式 | 让 CLI、云端任务和 IDE 扩展共享规则 |
| Sandbox / Approval | 限制文件写入、网络、命令执行 | 控制越界修改和高风险操作 |
| Skills | 把专项能力封装为可复用流程 | 前端开发、组件复用、Review、测试、RCA 可拆成技能 |
| Agent loop | 规划、工具调用、观察、修正 | 支撑长任务迭代执行 |
| Cloud task / CI | 后台任务和 GitHub 集成 | 适合批量改造、CI 检查和 PR 工作流 |

这类工具的优势是环境隔离、自动化和长任务执行，适合把仓库协议与 CI 门禁结合。

### 2.3 Cursor

Cursor 的 Harness 偏 IDE 规则和上下文注入。它通常通过 Rules、Memories、Agent、MCP 和工作区上下文影响 AI 行为。

| 能力 | 用法 | 对前端团队的价值 |
|------|------|------------------|
| Project Rules | 按项目定义代码风格和约束 | 固化组件、样式、状态和测试规则 |
| Memories | 从交互中沉淀偏好 | 保存团队重复偏好，但需要治理避免污染 |
| Agent | 多文件修改和命令执行 | 适合中小前端需求 |
| MCP | 接入外部上下文 | 接设计系统、文档、Issue、接口描述 |

Cursor 的优势是贴近 IDE 和开发者日常编辑，但团队需要把规则版本化，避免只存在个人 IDE 状态里。

### 2.4 Windsurf / Cascade

Windsurf / Cascade 强调 agentic IDE、workspace context、rules、memories 和 workflows。

| 能力 | 用法 | 对前端团队的价值 |
|------|------|------------------|
| Rules | 项目或全局规则 | 统一前端编码约束 |
| Memories | 长期偏好和项目知识 | 保存常见实现偏好 |
| Workflows | 固定步骤的自动化流程 | 固化 Spec、Plan、Verify、Review |
| MCP | 外部工具和知识接入 | 连接设计、API、Issue 和代码平台 |

Windsurf 的优势是把上下文和流程放进 IDE 体验，但仍需要仓库协议承接团队审计。

### 2.5 Trae / 通义灵码 / 阿里 SDD 实践

Trae、通义灵码和阿里 SDD / Harness Engineering 实践更强调多 Agent 协作和 SDD 过程控制。常见做法包括：

1. 先写 micro spec 或完整 Spec。
2. 执行前 checkpoint，复述目标、范围和 Done Contract。
3. 人工 approval 后进入实现。
4. 分阶段执行，每阶段都用 evidence 证明完成。
5. 失败或人工大幅修改后做 RCA。
6. 把经验反哺到规则、Prompt、Skill 或上下文索引。

阿里相关实践的启发是：不要让模型一路写到底，长链路任务应通过 checkpoint、approval、evidence 和 reverse sync 控制漂移。

## 3. Coding Agent 能力矩阵

| 维度 | Claude Code | Codex / Qwen Code | Cursor | Windsurf / Cascade | 通用仓库 Harness |
|------|-------------|-------------------|--------|--------------------|------------------|
| 项目规则入口 | `CLAUDE.md` | `AGENTS.md` | Rules | Rules | `.ai/`、`skills/` |
| 个人/团队记忆 | Memory | Memory / context | Memories | Memories | `.ai/context`、Run Record |
| 执行前计划 | Commands / subagents | Plan / skills | Agent planning | Workflows | Spec、Tech Plan、Tasks |
| 写文件护栏 | Hooks / permissions | Sandbox / approval | Rules | Rules | Diff 覆盖表、核心文件边界 |
| 工具权限 | Settings | Sandbox policy | IDE 权限 | IDE 权限 | CI、脚本、人工 gate |
| 前端复用约束 | Rule + hook | Skill + script | Rule | Rule | Component reuse checklist |
| 验证机制 | Hooks + commands | Shell + CI | Terminal + Agent | Terminal + Workflow | Verification Record |
| 审计记录 | 需自建 | 需自建 | 需自建 | 需自建 | Run Record、Evaluation |
| 失败学习 | 需自建 | 需自建 | 需治理 | 需治理 | RCA、Rule Update |

结论：Agent 原生能力能增强执行体验，但审计、复盘和团队资产沉淀必须放到仓库里。

## 4. 通用 Harness 抽象模型

团队应把前端 AI Harness 抽象为五层。

| 层级 | 核心问题 | 典型资产 |
|------|----------|----------|
| L1 需求层 | AI 到底要解决什么问题 | PRD、Spec、验收标准 |
| L2 上下文层 | AI 应该读取哪些代码和规则 | project map、component index、common patterns |
| L3 执行层 | AI 如何改代码且不跑偏 | Tech Plan、Done Contract、Tasks、Checkpoint |
| L4 验证层 | 如何证明功能和质量达标 | lint、typecheck、build、Playwright、截图、Review |
| L5 学习层 | 失败如何变成规则 | Run Record、RCA、Skill update、Rule update |

任何 Coding Agent 都应按这五层工作。工具差异只影响入口，不影响团队协议。

## 5. 当前项目能力对照

当前仓库已有较好的协议底座：

| 能力 | 当前状态 | 评价 |
|------|----------|------|
| Spec / Tasks / Run Record | 已有模板和多个样本 | 可继续复用 |
| Skills 路由 | 已有 frontend、component、review、test、workflow assets | 需要补前端交付总入口 |
| 验证协议 | 已有 `.ai/workflows/verification.md` | 需要补行为验证模板 |
| Harness Gate | 已有 `scripts/check-harness-run.mjs` | 偏流程证据，缺少前端质量项 |
| RCA / Learning Loop | 已有模板和失败样本 | 可作为自我进化基础 |
| 跨工具适配 | 目前偏仓库协议 | 需要补 `CLAUDE.md`、`AGENTS.md`、Rules 映射模板 |
| Tech Plan / Done Contract | 不完整 | 应新增模板 |
| 前端 Review Checklist | 分散在 Skills 中 | 应抽成独立交付清单 |
| 组件复用审计 | 有规则但缺记录字段 | 应接入 Tech Plan 和 Review |

## 6. 团队 AI 前端开发工作方式

### 6.1 标准流程

```text
需求输入
  ↓
Spec
  ↓
Tech Plan / Done Contract
  ↓
Tasks
  ↓
Execute
  ↓
Verify
  ↓
Review
  ↓
Run Record
  ↓
RCA / Rule Update
```

### 6.2 任务分级

| 等级 | 适用场景 | 必需产物 | 人工 checkpoint |
|------|----------|----------|-----------------|
| Small | 文案、静态 UI、小表单字段、低风险样式 | 轻量 Spec、修改范围、验证记录、Run Record | 可选 |
| Medium | 新页面、复杂交互、多文件前端改动 | Spec、Tasks、Tech Plan、Verification Record、Run Record | 执行前确认 |
| Risky / Large | 核心模块、跨模块、权限、复杂状态、设计系统改动 | 完整 Spec、阶段计划、评估摘要、RCA 条件 | 必须确认 |

### 6.3 前端编码前必须声明

AI 开始写代码前必须输出：

1. 需求目标。
2. 修改范围。
3. 不修改范围。
4. 需要读取的相似实现。
5. 组件 / Hook / API 复用候选。
6. 样式和响应式约束。
7. 验证方式。
8. Done Contract。

### 6.4 前端质量红线

| 红线 | 说明 |
|------|------|
| 不查复用就新建组件 | 新组件必须说明无法复用的原因 |
| 不读相似实现就改风格 | 必须读取同目录或同业务域代码 |
| 验证失败写成成功 | 必须保留失败状态并触发 RCA 条件 |
| 跳过验证不说明风险 | Skipped 必须写原因和风险 |
| 越界改核心文件 | 必须进入人工 checkpoint |
| UI 只通过 build | UI 改动必须验证交互和关键状态 |

## 7. 跨工具适配指南

### 7.1 Claude Code

建议映射：

| 仓库协议 | Claude Code 入口 |
|----------|------------------|
| 团队总规则 | `CLAUDE.md` |
| Spec / Plan / Verify / RCA | `.claude/commands/` |
| Planner / Reviewer / Tester | `.claude/agents/` |
| 写文件前检查 Spec | `PreToolUse` hook |
| 结束前检查验证和 Run Record | `Stop` hook |
| 核心命令和外部访问 | `settings.json` permissions |

### 7.2 Codex / Qwen Code

建议映射：

| 仓库协议 | CLI / Cloud Agent 入口 |
|----------|------------------------|
| 团队总规则 | `AGENTS.md` |
| 专项能力 | `skills/` |
| 验证和门禁 | `scripts/`、CI |
| 风险控制 | sandbox、approval、network allowlist |
| 长任务记录 | Run Record、Evaluation Summary |

### 7.3 Cursor

建议映射：

| 仓库协议 | Cursor 入口 |
|----------|-------------|
| 总规则 | Project Rules |
| 前端风格 | scoped rules |
| 组件复用 | rule + repo search |
| 长期偏好 | Memories，但关键规则必须回写仓库 |
| 外部上下文 | MCP |

### 7.4 Windsurf / Cascade

建议映射：

| 仓库协议 | Windsurf 入口 |
|----------|---------------|
| 总规则 | Rules |
| 固定流程 | Workflows |
| 项目知识 | Memories |
| 外部上下文 | MCP |
| 审计记录 | 仓库 Run Record |

### 7.5 Trae / 通义灵码

建议映射：

| 仓库协议 | IDE Agent 入口 |
|----------|----------------|
| 总规则 | 项目规则 / workspace instructions |
| 需求执行 | Agent task flow |
| 上下文 | 项目索引、MCP、企业知识库 |
| 审计 | 仓库 Spec、Run Record、RCA |

## 8. 质量评估与自我进化

### 8.1 评估维度

| 维度 | 评分重点 |
|------|----------|
| 需求理解 | 是否准确复述目标、范围和非目标 |
| 上下文命中 | 是否读取了相似实现、组件、Hook、API、样式 |
| 代码风格 | 是否贴合当前代码库命名、结构、抽象和样式 |
| 复用质量 | 是否优先复用稳定组件和 Hook |
| 行为完整性 | 是否覆盖交互、空态、加载态、错误态、响应式 |
| 验证质量 | 是否有真实命令、截图、测试或人工 Review 证据 |
| 审计完整性 | Spec、Tasks、diff、验证、结论是否一致 |
| 学习反哺 | RCA 是否转化为规则、模板、脚本或索引更新 |

### 8.2 RCA 触发条件

以下情况必须 RCA：

1. 验证失败且与本次修改有关。
2. 人工大幅修改 AI 产物。
3. Review 发现系统性问题。
4. AI 误改范围外文件。
5. 组件复用遗漏导致重复实现。
6. UI 行为或设计还原明显偏差。
7. 相同问题重复出现。

### 8.3 反哺路径

| 问题类型 | 反哺位置 |
|----------|----------|
| 需求表达不清 | Spec 模板 |
| 上下文漏读 | `.ai/context/*` |
| 前端风格偏差 | `skills/frontend-dev`、common patterns |
| 组件复用遗漏 | component index、component-reuse skill |
| 验证不足 | verification template、Review checklist |
| 流程逃逸 | `harness:check`、CI |
| Agent 工具适配问题 | Agent rules template |

## 9. 试点与推广路线

### 9.1 第一阶段：2 周内部试点

选择 2 个前端需求：

1. Small：静态 UI、筛选、表单字段或文案调整。
2. Medium：新增页面、复杂交互或多状态组件。

目标：

1. 验证轻量路径是否不过重。
2. 验证完整路径是否能控制质量。
3. 至少沉淀 1 次 Review 问题或 RCA 改进项。

### 9.2 第二阶段：低风险推广

准入条件：

1. 连续 3 个前端需求有完整 Run Record。
2. 验证失败没有被写成成功。
3. 组件复用检查被执行。
4. 至少 1 个失败或 Review 问题完成反哺。

### 9.3 第三阶段：团队标准化

形成：

1. 通用 Agent 规则模板。
2. 前端需求模板。
3. Tech Plan / Done Contract。
4. Review Checklist。
5. 行为验证模板。
6. RCA 反哺机制。
7. CI / Harness Gate。

## 10. 参考资料

1. Claude Code 文档：https://docs.claude.com/en/docs/claude-code/overview
2. Claude Code Hooks：https://docs.claude.com/en/docs/claude-code/hooks
3. Claude Code Subagents：https://docs.claude.com/en/docs/claude-code/sub-agents
4. OpenAI Codex GitHub：https://github.com/openai/codex
5. OpenAI Codex Agent Loop：https://openai.com/index/unrolling-the-codex-agent-loop/
6. Cursor Rules：https://docs.cursor.com/context/rules
7. Windsurf 文档：https://docs.windsurf.com/
8. Qwen Code GitHub：https://github.com/QwenLM/qwen-code
9. 阿里云开发者社区 Harness Engineering：https://developer.aliyun.com/article/1730240
10. sdd-riper-one-light：https://github.com/huisezhiyin/sdd-riper/tree/main/skills/sdd-riper-one-light
