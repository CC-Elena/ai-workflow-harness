# Task List: ai-run-record-entry

## 1. Spec 来源

- Spec 文件：`specs/ai-run-record-entry/spec.md`
- 规划日期：2026-05-02
- Planner：Codex

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 创建模拟 PRD | `specs/ai-run-record-entry/prd.md` | 无 | Done |
| T2 | 生成结构化 Spec | `specs/ai-run-record-entry/spec.md` | T1 | Done |
| T3 | 拆解任务列表 | `specs/ai-run-record-entry/tasks.md` | T2 | Done |
| T4 | 补强执行记录入口说明 | `.ai/evals/README.md` | T2 | Done |
| T5 | 生成本次 Run Record | `specs/ai-run-record-entry/run-record.md` | T1-T4 | Done |

## 3. 任务详情

### T1. 创建模拟 PRD

#### 目标

创建一个低风险、与 AI Workflow Harness 项目本身相关的模拟 PRD，用于验证工作流。

#### 输入

1. 用户要求：创建一个模拟 PRD 来执行。
2. 必读上下文：`开发计划.md`、`.ai/workflows/README.md`。
3. 必读 Skills：无强制 Skill，属于文档试点。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/ai-run-record-entry/prd.md` | 新增模拟 PRD |

#### 执行动作

1. 创建需求目录。
2. 编写模拟 PRD。
3. 明确需求目标、功能范围、非目标和验收标准。

#### 验收标准

1. PRD 文件存在。
2. PRD 能支撑 Spec 生成。
3. PRD 明确不修改真实业务代码。

#### 验证方式

1. 文件检查。
2. 文档审查。

#### 风险

1. 模拟 PRD 与真实业务复杂度不同，后续仍需真实需求试点。

### T2. 生成结构化 Spec

#### 目标

基于模拟 PRD 生成结构化 Spec，验证 PRD 到 Spec 的协议。

#### 输入

1. Spec 相关段落：`specs/ai-run-record-entry/prd.md`
2. 必读上下文：`.ai/templates/spec-template.md`
3. 必读 Skills：无强制 Skill，参考 `.ai/prompts/generate-spec.md`

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/ai-run-record-entry/spec.md` | 新增结构化 Spec |

#### 执行动作

1. 提取 PRD 背景、目标、范围和验收标准。
2. 按 Spec 模板补全功能要求、影响范围、约束和风险。
3. 将待确认项显式记录。

#### 验收标准

1. Spec 文件存在。
2. Spec 覆盖模板主要章节。
3. Spec 可用于任务拆解。

#### 验证方式

1. 文档审查。

#### 风险

1. 当前 Spec 仅验证文档链路，不包含真实业务接口或页面路径。

### T3. 拆解任务列表

#### 目标

基于 Spec 拆解可执行任务，验证 Planner 协议。

#### 输入

1. Spec 相关段落：`specs/ai-run-record-entry/spec.md`
2. 必读上下文：`.ai/templates/task-template.md`、`.ai/workflows/planner-executor.md`
3. 必读 Skills：无强制 Skill，参考 `.ai/prompts/planner.md`

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/ai-run-record-entry/tasks.md` | 新增任务列表 |

#### 执行动作

1. 将 Spec 拆成文档创建、入口补强、执行记录生成任务。
2. 标注任务依赖和状态。
3. 明确每个任务的验收标准。

#### 验收标准

1. Tasks 文件存在。
2. 至少包含 3 个任务。
3. 每个任务具备目标、输入、影响范围、执行动作、验收标准和验证方式。

#### 验证方式

1. 文档审查。

#### 风险

1. 文档任务粒度较轻，后续真实开发需求需要更严格的影响范围分析。

### T4. 补强执行记录入口说明

#### 目标

优化 `.ai/evals/README.md`，使其能更直接指导研发同学填写 Run Record 和 RCA。

#### 输入

1. Spec 相关段落：F5、A5。
2. 必读上下文：`.ai/evals/README.md`、`.ai/templates/run-record-template.md`、`.ai/templates/rca-template.md`
3. 必读 Skills：无强制 Skill。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `.ai/evals/README.md` | 补充最小填写示例和常见错误 |

#### 执行动作

1. 补充 Run Record 最小填写示例。
2. 补充 RCA 最小填写示例。
3. 补充常见错误。

#### 验收标准

1. `.ai/evals/README.md` 能说明何时记录、存在哪里、怎么填。
2. 示例简短可复制。
3. 不引入独立平台或脚本要求。

#### 验证方式

1. 文档审查。

#### 风险

1. 入口说明过长会降低可读性，需要保持简洁。

### T5. 生成本次 Run Record

#### 目标

记录本次模拟执行结果，验证 Run Record 模板可用性。

#### 输入

1. Spec 相关段落：A1-A5。
2. 必读上下文：`.ai/templates/run-record-template.md`
3. 必读 Skills：无强制 Skill。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/ai-run-record-entry/run-record.md` | 新增执行记录 |

#### 执行动作

1. 汇总本次创建和修改的文件。
2. 记录任务执行状态。
3. 记录验证方式。
4. 说明未进入真实代码修改的原因。

#### 验收标准

1. Run Record 文件存在。
2. 记录 T1-T5 的执行状态。
3. 明确验证结果和跳过项。
4. 能作为后续需求执行记录参考。

#### 验证方式

1. 文件检查。
2. 文档审查。

#### 风险

1. 没有真实代码验证指标，不能代表最终研发提效效果。

## 4. 执行顺序

1. T1
2. T2
3. T3
4. T4
5. T5

## 5. 当前执行结果

截至 2026-05-03，本次模拟需求的 PRD、Spec、Tasks、Run Record 和 `.ai/evals/README.md` 入口说明均已完成。

本次试点只验证文档工作流链路，未修改业务代码，也未引入独立平台、脚本或运行时能力。
