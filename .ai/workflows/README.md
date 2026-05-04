# AI 研发工作流入口

本目录定义仓库内 AI 研发自动化工作流协议。Codex 等 Coding IDE 负责执行代码读取、编辑、命令运行和验证；本仓库负责提供结构化输入、上下文索引、Skills 路由、校验协议和 RCA 记录。

## 执行原则

1. 不自研 Agent Runtime，复用 Codex 的代码理解、编辑、终端、验证和 Review 能力。
2. 以 Spec 作为需求到代码的唯一可信源。
3. 先规划，再执行；中等及以上复杂度需求必须拆任务。
4. 每个任务必须有影响范围、执行动作和验收标准。
5. 每次代码变更后必须按 `.ai/workflows/verification.md` 验证。
6. 中等及以上需求必须按 `.ai/workflows/evaluation-metrics.md` 生成评估摘要。
7. 触发 `.ai/workflows/learning-loop.md` 中的 RCA 条件时，必须按 `.ai/prompts/generate-rca.md` 生成 RCA。
8. 默认使用 `.ai/workflows/rule-loading-policy.md` 控制规则加载，不为简单任务读取全部协议或 Skills。

## 推荐读取顺序

Codex 执行需求前，按任务复杂度读取。不要为简单任务一次性读取全部理论协议。

### 最小必读集

所有任务都读取：

1. `.ai/workflows/rule-loading-policy.md`
2. `.ai/context/skill-routing-minimal.md`
3. `.ai/context/project-map.md`
4. `.ai/workflows/verification.md`
5. 用户需求或对应 `spec.md`
6. 直接修改文件
7. 1 个主 Skill

### 中等及以上任务扩展集

需要拆解任务、修改多文件、影响 UI 或跨模块时，追加读取：

1. `.ai/workflows/operating-model.md`
2. `.ai/workflows/end-to-end-lifecycle.md`
3. `.ai/workflows/context-memory-policy.md`
4. `.ai/workflows/explainability-trace.md`
5. `.ai/workflows/production-gates.md`
6. 最多 1 个辅助 Skill

### 投产评估集

需要判断是否可内部试运行、低风险投产或受控推广时，追加读取：

1. `.ai/workflows/evaluation-metrics.md`
2. `.ai/workflows/eval-rubric.md`
3. `.ai/templates/evaluation-summary-template.md`
4. `.ai/templates/gate-check-template.md`

### 失败复盘集

触发 RCA 或学习闭环时，追加读取：

1. `.ai/workflows/learning-loop.md`
2. `.ai/prompts/generate-rca.md`
3. `.ai/templates/rca-template.md`

## 标准流程

```text
用户需求 / PRD
   ↓
生成或补全 Spec
   ↓
人工审查 Spec
   ↓
Planner 拆解任务
   ↓
按任务读取上下文和 Skills
   ↓
Executor 修改代码
   ↓
验证命令 / 截图 / Review
   ↓
按评估指标生成 Gate Check / Evaluation Summary
   ↓
记录 Run Record
   ↓
触发 RCA 条件时生成 RCA 并反哺规则
```

## 核心文件

| 文件 | 作用 |
|------|------|
| `.ai/templates/spec-template.md` | 需求 Spec 模板 |
| `.ai/templates/task-template.md` | 任务拆解模板 |
| `.ai/templates/run-record-template.md` | 执行记录模板 |
| `.ai/templates/rca-template.md` | RCA 复盘模板 |
| `.ai/templates/gate-check-template.md` | 阶段门禁检查模板 |
| `.ai/templates/evaluation-summary-template.md` | 评估摘要模板 |
| `.ai/templates/rubric-template.md` | 人工或 LLM 评分模板 |
| `.ai/workflows/rule-loading-policy.md` | 轻量规则加载、任务复杂度和 token 预算策略 |
| `.ai/prompts/generate-spec.md` | PRD 到 Spec 的提示协议 |
| `.ai/prompts/review-spec.md` | Spec 审查协议 |
| `.ai/prompts/planner.md` | 任务规划协议 |
| `.ai/prompts/executor.md` | 单任务执行协议 |
| `.ai/prompts/fix-verification-failure.md` | 验证失败修复协议 |
| `.ai/prompts/generate-rca.md` | RCA 生成协议 |
| `.ai/context/project-map.md` | 项目上下文地图 |
| `.ai/context/common-patterns.md` | 常见实现模式 |
| `.ai/context/skill-routing-minimal.md` | 最小 Skill 路由，限制默认 Skill 数量 |
| `.ai/workflows/operating-model.md` | 工作流理论操作模型 |
| `.ai/workflows/end-to-end-lifecycle.md` | 需求到关闭的端到端生命周期 |
| `.ai/workflows/context-memory-policy.md` | 上下文选择、记忆沉淀和防污染策略 |
| `.ai/workflows/explainability-trace.md` | 可解释性和执行追踪协议 |
| `.ai/workflows/production-gates.md` | 投产门禁、风险分级和人工确认边界 |
| `.ai/workflows/learning-loop.md` | RCA、反哺和持续学习闭环 |
| `.ai/workflows/evaluation-metrics.md` | 评估指标、投产门槛和阻断项 |
| `.ai/workflows/eval-rubric.md` | 1-5 分评分 Rubric |

## 产物存放规范

每个需求建议使用一个独立目录：

```text
specs/{feature-name}/
├── spec.md
├── tasks.md
├── evaluation-summary.md
├── run-record.md
└── rca.md
```

如需求很小，也可以只保留 `spec.md` 和 `run-record.md`。但只要发生代码变更，`run-record.md` 必须记录验证命令、结果、截图或跳过原因。
