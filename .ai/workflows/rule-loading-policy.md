# 规则加载策略

本文档定义 AI Workflow Harness 的轻量规则加载策略，目标是在不牺牲质量和安全边界的前提下，降低 token 消耗、减少上下文噪音，并提高 AI Coding 工具的执行速度。

## 1. 核心原则

1. 默认轻量执行，不全量注入规则。
2. 先加载索引，再按需打开正文。
3. 每个任务只选择 1 个主 Skill，最多 1 个辅助 Skill。
4. Spec 流程只由用户显式命令触发，不因任务复杂度自动进入。
5. 规则按用户命令、任务复杂度、风险等级和失败状态逐层加载。
6. 评估、投产、RCA 类协议只在触发条件满足时读取。
7. Harness 自身的文档、模板、规则、hook、脚本维护默认走轻量流程；可以提高验证和确认要求，但不能因此自动进入完整 Spec。

## 2. 任务复杂度分级

| 复杂度 | 判断标准 | 规则预算 | 是否需要 Spec | 是否需要 Evaluation |
|--------|----------|----------|----------------|---------------------|
| Small | 单文件、小文档、低风险样式或静态文案 | 最多 3-5 个文件，1 个主 Skill | 不需要，除非用户 `/mini-spec` 或 `/spec` | 不需要，除非用户要求 |
| Medium | 多文件、UI 行为、需要截图或测试 | 最多 6-10 个文件，1 主 + 1 辅 Skill | 建议 `/mini-spec`，但必须用户确认 | 可选 |
| Large | 跨模块、影响用户流程、复杂状态或接口 | 按 Context Pack 分批读取 | 建议 `/spec`，但必须用户确认 | 用户确认 `/spec` 后必须 |
| Risky | 权限、数据写入、核心链路、生产相关 | 先人工确认，再分阶段读取 | 强烈建议 `/spec`，用户确认后进入 | 用户确认 `/spec` 后必须 |
| Failure | 验证失败、人工大改、系统性 Review 问题 | 只加载失败复盘集 | 视情况 | 必须记录结论 |

## 3. 默认加载集

### Small Task

读取：

1. 用户需求
2. 直接修改文件
3. `.ai/context/skill-routing-minimal.md`
4. 1 个主 Skill
5. `.ai/workflows/verification.md`

跳过：

1. `evaluation-metrics.md`
2. `production-gates.md`
3. `learning-loop.md`
4. `eval-rubric.md`
5. 非相关 Skills

### Medium Task

读取：

1. 用户需求
2. P0/P1 Context Pack
3. `.ai/context/skill-routing-minimal.md`
4. 1 个主 Skill，必要时 1 个辅助 Skill
5. `.ai/workflows/verification.md`

按需读取：

1. `.ai/workflows/explainability-trace.md`
2. `.ai/templates/evaluation-summary-template.md`
3. 用户显式 `/mini-spec` 时读取 `.ai/templates/mini-spec-template.md`
4. 用户显式 `/spec` 时读取 `.ai/templates/spec-template.md` 和 `.ai/templates/task-template.md`

### Large / Risky Task

仅当用户确认 `/spec`、任务影响真实业务核心链路、或涉及生产/权限/数据风险时，才读取本扩展集。Harness 规则维护优先保持轻量，只补读直接相关协议。

读取：

1. `operating-model.md`
2. `end-to-end-lifecycle.md`
3. `context-memory-policy.md`
4. `production-gates.md`
5. `evaluation-metrics.md`
6. 对应主 Skill 和辅助 Skill

要求：

1. 先建议用户使用 `/spec`，等待确认。
2. 用户确认 `/spec` 后必须拆 Tasks。
3. 用户确认 `/spec` 后必须填写 Context Pack。
4. 用户确认 `/spec` 后必须生成 Verification Record。
5. 用户确认 `/spec` 后必须生成 Evaluation Summary。

### Failure / RCA

读取：

1. `.ai/workflows/learning-loop.md`
2. `.ai/prompts/generate-rca.md`
3. `.ai/templates/rca-template.md`
4. 失败相关 Run Record、Verification Record 和 diff

跳过：

1. 与失败无关的业务背景。
2. 与失败无关的 Skills。

## 4. 渐进加载规则

只有出现以下信号才升级加载：

| 信号 | 升级动作 |
|------|----------|
| 任务影响范围从单文件变为多文件 | Small -> Medium |
| 需要改接口、状态、权限或核心流程 | Medium -> Risky |
| 验证失败且无法一次修复 | 加载 Failure / RCA 集 |
| 用户要求投产判断 | 加载 Evaluation / Production Gate |
| 缺上下文导致实现不确定 | 只补读缺失的 P0/P1 文件 |
| Skill 规则冲突 | 停止扩展读取，优先人工确认 |
| 用户输入 `/mini-spec` | 进入 Mini Spec Flow |
| 用户输入 `/spec` | 进入 Full Spec Flow |

## 5. Token 预算规则

| 项目 | 建议上限 |
|------|----------|
| Small Task 读取文件数 | 3-5 |
| Medium Task 读取文件数 | 6-10 |
| 单次 Skill 数 | 1 主 + 1 辅 |
| 长协议读取 | 仅在触发条件满足时 |
| Context Pack | 先 P0/P1，P2/P3 按需 |

如果超过预算，应先说明原因，再继续读取。

## 6. 禁止事项

1. 不因“可能有用”读取所有 Skills。
2. 不在 Small Task 中生成完整 Evaluation Summary。
3. 不把投产门禁用于纯文档草稿。
4. 不为了形式完整而读取与任务无关的理论协议。
5. 不用大 Prompt 替代 Skill 路由。
6. 不在用户未触发 `/spec` 或 `/mini-spec` 时自动生成 Spec。

## 7. Run Record 记录要求

Run Record 中应记录本次加载策略：

```markdown
- 任务复杂度：Small / Medium / Large / Risky / Failure
- 规则预算：
- 主 Skill：
- 辅助 Skill：
- 跳过的协议：
- 升级加载原因：
```
