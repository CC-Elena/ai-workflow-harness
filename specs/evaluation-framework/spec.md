# Spec: AI 工作流评估框架

## 1. 可信源

- PRD：`specs/evaluation-framework/prd.md`
- 参考协议：`.ai/workflows/evaluation-metrics.md`、`.ai/workflows/eval-rubric.md`

## 2. 功能需求

1. 在 `.ai/workflows/evaluation-metrics.md` 定义评估分层、100 分模型、投产门槛、阻断项和指标定义。
2. 在 `.ai/workflows/eval-rubric.md` 定义通用 1-5 分 Rubric 与维度 Rubric。
3. 在 `.ai/templates/` 下提供：
   - `evaluation-summary-template.md`
   - `gate-check-template.md`
   - `rubric-template.md`
4. 在 `.ai/workflows/README.md` 中加入评估读取顺序和标准流程。
5. 在 `.ai/templates/run-record-template.md` 中加入评估摘要、投产等级和阻断项字段。
6. 在 `app/workflow-data.ts` 中登记评估相关资产和 T12 任务。

## 3. 约束

- 仅修改 `.ai/`、`specs/`、`app/workflow-data.ts` 等仓库资产。
- 不新增平台、数据库、MCP、Agent Runtime 或模型调度。
- 指标必须能通过人工评审、确定性检查或 LLM-based grader 解释。

## 4. 验收标准映射

| 验收标准 | 实现文件 |
|----------|----------|
| 评估协议入口可读 | `.ai/workflows/README.md` |
| 指标覆盖完整流程 | `.ai/workflows/evaluation-metrics.md` |
| Rubric 可复用 | `.ai/workflows/eval-rubric.md`、`.ai/templates/rubric-template.md` |
| 投产门槛清晰 | `.ai/workflows/evaluation-metrics.md` |
| 首页可检索评估资产 | `app/workflow-data.ts` |

## 5. 风险

1. 评估指标过多可能提高执行成本，因此按小/中/大需求分级使用。
2. 主观 Rubric 可能不稳定，因此优先使用确定性检查，复杂质量判断再用 Rubric。
3. 当前只提供理论和文档层评估，自动统计应作为后续独立需求。

