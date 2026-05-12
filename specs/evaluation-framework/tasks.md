# Tasks: AI 工作流评估框架

| ID | 任务 | 输入 | 影响范围 | 验收 | 状态 |
|----|------|------|----------|------|------|
| T12-1 | 定义评估指标体系和投产门槛 | OpenAI / Anthropic 公开评估原则、现有工作流协议 | `.ai/workflows/evaluation-metrics.md` | 包含分层、总分、指标、阻断项和投产等级 | Done |
| T12-2 | 补齐 Rubric 与 grader 输出格式 | 评估指标体系 | `.ai/workflows/eval-rubric.md` | 包含 1-5 分标准、维度 Rubric 和 JSON 输出示例 | Done |
| T12-3 | 新增评估相关模板 | 评估指标体系、Rubric | `.ai/templates/*` | Evaluation Summary、Gate Check、Rubric 模板存在且可复用 | Done |
| T12-4 | 接入工作流入口和 Run Record | README、Run Record 模板 | `.ai/workflows/README.md`、`.ai/templates/run-record-template.md` | 标准流程包含评估，Run Record 包含评估字段 | Done |
| T12-5 | 更新首页资产索引和任务状态 | 工作流数据模块 | `src/lib/data/workflow-data.ts` | 首页能检索评估文件，MVP 指标同步 | Done |
| T12-6 | 记录本次评估框架试点 | 本任务 Spec 和验证结果 | `specs/evaluation-framework/*` | Run Record 与 Evaluation Summary 存在 | Done |

