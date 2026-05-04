# AI Workflow Harness 缺陷与优化跟踪

## 1. 目的

本文档记录 AI Workflow Harness 在理论完善和投产审查中发现的缺陷、已完成修复和后续业务迭代需要持续关注的优化项。

它不是失败记录，而是工作流自身的质量台账。后续每次业务试点、RCA 或评估复盘，都应回看本文档，确认是否出现同类问题。

## 2. 当前缺陷修复清单

| ID | 缺陷 | 风险 | 修复动作 | 状态 | 后续关注 |
|----|------|------|----------|------|----------|
| D1 | 推荐读取顺序过重，简单任务也需要读大量理论协议 | 上下文噪音增大，执行成本上升 | 将 `.ai/workflows/README.md` 改为分层读取：最小必读集、中等任务扩展集、投产评估集、失败复盘集 | Done | 后续业务试点观察是否仍有过度读取 |
| D2 | Context Pack 被定义为门禁，但模板没有强制承载 | 无法证明执行前是否读取必要上下文 | 在 `.ai/templates/task-template.md` 和 `.ai/templates/run-record-template.md` 增加 Context Pack 表 | Done | 后续检查任务是否真实填写 P0/P1 上下文 |
| D3 | 部分评估指标缺少采集口径 | 指标可能变成主观估算，影响说服力 | 在 `.ai/workflows/evaluation-metrics.md` 和 `.ai/templates/evaluation-summary-template.md` 增加采集方式、可为空条件和证据文件 | Done | 后续真实业务中验证采集成本是否合理 |
| D4 | 投产等级在多个文件中命名不一致 | 评估结论可能出现多套状态 | 统一为 `Draft / Internal Trial / Low-risk Production / Controlled Rollout / Failed` | Done | 后续新增 Run Record 时不得使用旧枚举 |
| D5 | 小任务最小产物集可能绕开验证证据 | 代码变更可能被记录为成功但缺验证 | 在 `.ai/workflows/README.md` 和 `run-record-template.md` 中要求代码变更必须记录验证命令、证据或跳过原因 | Done | 后续抽查小任务 Run Record |
| D6 | RCA 触发条件分散，README 表达偏窄 | 只把命令失败当 RCA 条件，漏掉人工大幅修改和系统性 Review 问题 | 由 `.ai/workflows/learning-loop.md` 统一 RCA / 学习闭环触发条件，README 改为引用该规则 | Done | 后续出现人工大幅修改时必须检查是否触发 RCA |
| D7 | 产品说明中的 MCP 容易被理解为当前未完成项 | 业务迭代误把 MCP 当 MVP 缺口 | 将 `自动化工作流产品说明.md` 中 MCP 标记为 Future，当前阶段不实现、不追踪 | Done | 后续若重新启用 MCP，需单独立项 |
| D8 | 规则和 Skill 过多会拖慢 AI Coding 工具并稀释产出质量 | Token 消耗高、执行变慢、上下文噪音影响代码判断 | 新增 `.ai/workflows/rule-loading-policy.md` 和 `.ai/context/skill-routing-minimal.md`，默认 1 主 Skill、最多 1 辅 Skill，按复杂度渐进加载 | Done | 后续业务试点观察规则预算是否仍偏重 |

## 3. 后续业务迭代关注项

| ID | 关注项 | 触发条件 | 建议动作 | 优先级 |
|----|--------|----------|----------|--------|
| O1 | 失败样本 RCA 演练 | 出现验证失败、人工大幅修改、系统性 Review 问题，或需要主动演练失败路径 | 生成 `rca.md`，验证反哺项能更新 Prompt、Skill、上下文或模板 | P1 |
| O2 | 模板填写成本复查 | 新业务试点使用最新版 Task / Run Record / Evaluation Summary 模板 | 记录填写耗时和字段空置情况，必要时简化模板 | P1 |
| O3 | 轻量结构检查器 | 业务试点数量增加，人工检查文件完整性成本上升 | 新增脚本检查 `specs/{feature}/` 是否缺必需文件、验证结果和评估证据 | P2 |
| O4 | 指标采集口径校准 | 真实业务中出现代码采纳率、人工修改率、上下文命中率难以计算 | 允许标记 N/A，但必须写明原因；必要时调整指标定义 | P2 |
| O5 | Context Pack 质量复盘 | 出现漏读关键文件、重复探索或实现跑偏 | 更新 `.ai/context/*`、`.ai/context/skill-routing.md` 或相关 Skill | P1 |
| O6 | 投产等级审查 | 需求从文档/低风险 UI 扩展到多模块改动 | 使用 `production-gates.md` 重新判定风险等级，必要时人工确认 | P1 |
| O7 | 规则加载成本复查 | 业务试点感觉响应慢、输出变差或上下文过载 | 检查 Run Record 中的任务复杂度、主 Skill、辅助 Skill 和跳过协议记录 | P1 |

## 4. 后续复查节奏

建议在以下节点复查本文档：

1. 每完成 1 个真实业务试点。
2. 每次生成 RCA 后。
3. 每次新增或修改工作流协议、Prompt、Skill、模板后。
4. 每次准备从 Internal Trial 扩大到 Low-risk Production 或 Controlled Rollout 前。

## 5. 复查问题清单

1. 是否出现 D1-D8 中任一缺陷复发？
2. 最新业务试点是否完整填写 Context Pack？
3. 验证证据是否足够支撑 Run Record 的 Success / Partial / Failed 状态？
4. Evaluation Summary 的指标是否有证据或明确 N/A 原因？
5. 是否出现应触发但未触发的 RCA？
6. 是否需要把业务试点中的经验反哺到 Prompt、Skill、上下文或模板？
7. 是否遵守 1 个主 Skill、最多 1 个辅助 Skill 的规则加载预算？
