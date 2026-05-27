# Task List: development-plan

## 1. Spec 来源

- Spec 文件：`开发计划.md`
- 规划日期：2026-05-03
- Planner：Codex

## 2. 任务总览

| ID | 任务 | 交付物 | 状态 |
|----|------|--------|------|
| T0-1 | 梳理 Codex/IDE 已提供能力与本项目不自研边界 | `docs/ai-workflow-boundary.md` | Done |
| T0-2 | 明确 MVP 建设范围和首个试点场景 | `specs/real-pilot-candidates.md` | Done |
| T1-1 | 建立 `.ai/` 工作流目录结构 | `.ai/workflows`、`.ai/prompts`、`.ai/context`、`.ai/evals`、`.ai/templates` | Done |
| T1-2 | 建立基础模板 | `.ai/templates/*` | Done |
| T1-3 | 编写工作流入口说明 | `.ai/workflows/README.md` | Done |
| T2-1 | 定义 PRD 到 Spec 的生成协议 | `.ai/prompts/generate-spec.md` | Done |
| T2-2 | 定义 Spec 审查协议 | `.ai/prompts/review-spec.md` | Done |
| T2-3 | 提供示例 Feature Spec | `specs/examples/example-feature-spec.md` | Done |
| T3-1 | 建设项目结构上下文索引 | `.ai/context/project-map.md` | Done |
| T3-2 | 建设组件、Hook、API 索引 | `.ai/context/component-index.md`、`hook-index.md`、`api-index.md` | Done |
| T3-3 | 建设常见模式与工程规范索引 | `.ai/context/common-patterns.md`、`docs/engineering-rules/README.md` | Done |
| T4-1 | 定义 Planner-Executor 协议 | `.ai/workflows/planner-executor.md` | Done |
| T4-2 | 定义 Planner Prompt | `.ai/prompts/planner.md` | Done |
| T4-3 | 定义 Executor Prompt | `.ai/prompts/executor.md` | Done |
| T5-1 | 整理 Skills 总索引 | `skills/README.md` | Done |
| T5-2 | 定义 Skill 路由说明 | `.ai/context/skill-routing.md` | Done |
| T5-3 | 审查现有 Skills 是否覆盖计划中的缺口 | `.ai/context/skill-gap-map.md` | Done |
| T5-4 | 补齐缺失 Skill 的最小实现 | `skills/workflow-assets/SKILL.md` | Done |
| T6-1 | 定义统一验证协议 | `.ai/workflows/verification.md` | Done |
| T6-2 | 定义验证失败修复 Prompt | `.ai/prompts/fix-verification-failure.md` | Done |
| T6-3 | 补充验证记录模板 | `.ai/templates/verification-record-template.md` | Done |
| T7-1 | 建立 Run Record 与 RCA 归档目录 | `.ai/evals/runs/`、`.ai/evals/rca/` | Done |
| T7-2 | 定义 RCA 生成 Prompt | `.ai/prompts/generate-rca.md` | Done |
| T7-3 | 完成一次模拟执行记录试点 | `specs/ai-run-record-entry/*` | Done |
| T8-1 | 选择 2-3 个真实低风险需求 | `specs/real-pilot-candidates.md` | Done |
| T8-2 | 为真实需求生成 Spec 与 Task List | `specs/asset-catalog-evaluation-filter/spec.md`、`tasks.md` | Done |
| T8-3 | 执行至少一个真实代码修改闭环 | `src/components/views/workflow-workspace.tsx`、`specs/asset-catalog-evaluation-filter/run-record.md` | Done |
| T8-4 | 产出试点复盘报告与优化清单 | `specs/pilot-retrospective.md` | Done |
| T9-1 | 修复 Next 15 lint 验证链路 | `eslint.config.mjs`、`package.json`、`.ai/workflows/verification.md` | Done |
| T9-2 | 完成 P2 Run Record 草稿验证摘要试点 | `specs/run-record-verification-summary/*`、`src/components/views/workflow-workspace.tsx` | Done |
| T9-3 | 完成 P3 首页 MVP 任务完成概览试点 | `specs/mvp-task-overview/*`、`src/components/views/workflow-workspace.tsx`、`src/app/globals.css` | Done |
| T9-4 | 补齐 UI 截图验证记录 | `specs/mvp-task-overview/verification-record.md` | Done |
| T10-1 | 补齐 P1 截图验证记录 | `specs/asset-catalog-evaluation-filter/verification-record.md` | Done |
| T10-2 | 明确下一阶段推广范围和风险边界 | `specs/next-stage-rollout-boundary.md` | Done |
| T11-1 | 集中维护首页工作流数据 | `src/lib/data/workflow-data.ts`、`src/components/views/workflow-workspace.tsx` | Done |
| T11-2 | 用数据计算 MVP 任务和试点指标 | `src/components/views/workflow-workspace.tsx` | Done |
| T12-1 | 定义 AI 工作流评估指标体系和投产门槛 | `.ai/workflows/evaluation-metrics.md` | Done |
| T12-2 | 补齐评估 Rubric 与 grader 输出格式 | `.ai/workflows/eval-rubric.md` | Done |
| T12-3 | 新增 Evaluation Summary、Gate Check 和 Rubric 模板 | `.ai/templates/evaluation-summary-template.md`、`gate-check-template.md`、`rubric-template.md` | Done |
| T12-4 | 将评估层接入工作流入口、记录模板和首页索引 | `.ai/workflows/README.md`、`.ai/templates/run-record-template.md`、`src/lib/data/workflow-data.ts` | Done |
| T13-1 | 记录 AI 工作流缺陷与后续业务迭代优化项 | `specs/workflow-defect-register.md` | Done |
| T14-1 | 增加轻量规则加载策略，降低 token 和 Skill 过载 | `.ai/workflows/rule-loading-policy.md` | Done |
| T14-2 | 增加最小 Skill 路由，默认 1 主 Skill、最多 1 辅 Skill | `.ai/context/skill-routing-minimal.md`、`.ai/context/skill-routing.md` | Done |

## 3. 当前执行结果

截至 2026-05-04，`开发计划.md` 中 MVP 所需的仓库资产、工作流协议、Prompt、上下文索引、Skill 路由、验证协议、执行记录和真实需求试点均已形成可读取的仓库文件。

真实需求试点 P1、P2、P3 均已完成 PRD、Spec、Tasks、代码修改、验证和 Run Record。P1、P3 均已补齐截图验证记录。首页展示数据已集中到 `src/lib/data/workflow-data.ts`，MVP 指标由数据计算。MCP 能力按当前范围明确不实现，也不作为剩余任务追踪。

后续可选增强已补齐评估层：新增评估指标体系、投产门槛、阻断项、Rubric、Gate Check 模板和 Evaluation Summary 模板。该层参考 OpenAI Evals / Graders / Trace Grading 与 Anthropic Success Criteria / Evaluation Tool / Test Design 的公开原则，但仍保持仓库资产形态，不新增平台、数据库、MCP 或 Agent Runtime。

工作流自身缺陷和后续业务迭代关注项已沉淀到 `specs/workflow-defect-register.md`，包括读取顺序、Context Pack、指标采集口径、投产枚举、小任务验证、RCA 触发条件和 MCP 当前阶段边界。

为避免规则和 Skill 过载影响 AI Coding 工具的效率与质量，已新增轻量规则加载策略和最小 Skill 路由。默认执行不再读取全部 Skills，而是按任务复杂度渐进加载，并限制为 1 个主 Skill、最多 1 个辅助 Skill。

## 4. 后续建议

1. 每次新增工作流资产时，同步更新首页资产列表和 `skills/workflow-assets/SKILL.md`。
2. 中等及以上需求生成 `evaluation-summary.md`，并按 `.ai/workflows/evaluation-metrics.md` 判断投产等级。
3. 下一阶段推广遵守 `specs/next-stage-rollout-boundary.md`。
4. 出现验证失败或人工大幅修改时，按 `.ai/prompts/generate-rca.md` 生成 RCA。
5. 每次真实业务试点后复查 `specs/workflow-defect-register.md`。
6. 每次执行前优先使用 `.ai/workflows/rule-loading-policy.md` 和 `.ai/context/skill-routing-minimal.md` 控制规则加载成本。
