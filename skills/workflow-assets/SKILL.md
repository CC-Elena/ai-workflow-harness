---
name: workflow-assets
description: 维护 AI Workflow Harness 的仓库资产。用于更新 Run Record、RCA、验证记录、上下文索引、Skill 路由、试点复盘和工作流文档时。
version: 0.1.0
dependencies: [project, auto-rules]
---

# Workflow Assets

使用本 Skill 维护 `.ai/`、`specs/`、`docs/` 和 `skills/` 中的 AI 工作流资产。

## 适用场景

1. 创建或更新 Run Record、RCA、验证记录。
2. 维护 `.ai/context/` 下的上下文索引。
3. 更新 Skill 路由、Skill 缺口映射或试点复盘。
4. 将真实需求试点结果反哺到 Prompt、模板或 Skill。

## 必读文件

1. `.ai/workflows/README.md`
2. `.ai/workflows/planner-executor.md`
3. `.ai/workflows/verification.md`
4. `.ai/evals/README.md`
5. `.ai/context/skill-routing.md`
6. `.ai/context/skill-gap-map.md`

## 执行步骤

1. 先确认本次修改属于工作流资产维护，不是业务代码开发。
2. 读取对应模板或 Prompt，不新建重复格式。
3. 最小范围更新相关资产。
4. 如果更新 Skill 或路由，同步 `skills/README.md` 和 `.ai/context/skill-routing.md`。
5. 如果更新执行记录，明确写入验证命令、跳过项和风险。
6. 如果发现机制性问题，补充到 RCA 或 auto-rules，而不是只写在聊天记录里。

## 输出要求

1. 文档必须能被 Codex 后续直接读取使用。
2. 状态必须真实，不把未运行的验证写成通过。
3. 不引入独立平台、数据库、后台服务或 Agent Runtime。
4. 不重复 Codex、Cursor、Claude Code 已经具备的代码读写和执行能力。

