# PRD: AI 工作流评估框架

## 1. 背景

当前 AI Workflow Harness 已具备 PRD、Spec、Tasks、Executor、Verification、Run Record 和 RCA 闭环。为了判断该工作流是否具备投产可信度，需要补齐可复用的评估指标、Rubric、门禁模板和评估摘要模板。

## 2. 目标

1. 定义可解释、可审查、可复用的 AI 工作流评估指标。
2. 参考 OpenAI 和 Anthropic 公开的一手评估原则，形成有说服力的评分模型。
3. 明确投产门槛和阻断项，避免只看“任务完成”而忽略过程质量。
4. 保持仓库资产形态，不新增平台、数据库、MCP、Agent Runtime 或模型调度能力。

## 3. 范围

- 新增评估指标体系文档。
- 新增 1-5 分 Rubric。
- 新增 Gate Check、Evaluation Summary、Rubric 模板。
- 将评估层接入工作流入口、Run Record 模板和首页资产索引。

## 4. 非目标

- 不实现自动评分平台。
- 不接入 MCP。
- 不新增后端接口或数据库。
- 不实现无人值守发布、合并或生产操作。

## 5. 验收标准

1. 能从 `.ai/workflows/README.md` 读取到评估协议入口。
2. 评估指标覆盖 Spec、Tasks、上下文/Skill、执行、验证、记录/RCA。
3. 投产门槛包含 Draft、Internal Trial、Low-risk Production、Controlled Rollout 和 Failed。
4. 模板能直接复制到 `specs/{feature}/` 使用。
5. 首页资产检索能定位评估相关文件。
