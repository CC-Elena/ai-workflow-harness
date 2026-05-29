# AI 工作流评估指标体系

本文档定义 AI Workflow Harness 的评估方案。它参考公开的一手评估原则，并转化为适合仓库内 AI 研发工作流的可执行指标。

## 1. 参考原则

本方案采用以下公开原则：

1. OpenAI Evals：评估应包含任务描述、测试输入、testing criteria，并通过 graders 产生可重复结果。
2. OpenAI Graders：不同指标可使用 string check、text similarity、score model grader、label model grader 或 code execution grader。
3. OpenAI Trace Grading：Agent 评估不只看最终输出，也要评估端到端决策、工具调用和执行轨迹。
4. Anthropic Success Criteria：成功标准应具体、可测、可达到、相关。
5. Anthropic Evaluation Tool：评估应覆盖多个测试场景，支持版本比较和 1-5 分质量评分。
6. Anthropic Test Design：优先自动评分；复杂主观判断使用清晰 rubric 和 LLM-based grading。

参考链接：

1. OpenAI Evals: https://platform.openai.com/docs/guides/evals
2. OpenAI Graders: https://platform.openai.com/docs/guides/graders
3. OpenAI Trace Grading: https://platform.openai.com/docs/guides/trace-grading
4. Anthropic Define Success: https://docs.anthropic.com/en/docs/test-and-evaluate/define-success
5. Anthropic Evaluation Tool: https://docs.anthropic.com/en/docs/test-and-evaluate/eval-tool
6. Anthropic Develop Tests: https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests

## 2. 评估分层

| 层级 | 评估对象 | 核心问题 | 推荐评分方式 |
|------|----------|----------|--------------|
| L1 | 输入需求 | PRD 或用户需求是否足够生成 Spec | Rubric |
| L2 | Spec | 边界、验收、风险是否完整 | Rubric + checklist |
| L3 | Tasks | 是否原子化、可执行、可验证 | Rubric |
| L4 | 上下文召回 | 是否读取了正确上下文，是否漏读关键资产 | Trace review |
| L5 | Skill 路由 | 是否选择了正确 Skill | Rule-based + review |
| L6 | 执行过程 | 是否最小修改、无跑偏、无越界 | Diff review |
| L7 | 验证质量 | 验证是否真实运行并准确记录 | Deterministic |
| L8 | 结果质量 | 是否满足验收标准 | Human / model grader |
| L9 | 复盘质量 | Run Record / RCA 是否能反哺工作流 | Rubric |

## 3. 总分模型

总分为 100 分：

| 维度 | 权重 | 说明 |
|------|------|------|
| Spec 质量 | 15 | 需求结构化、边界、验收、风险 |
| 任务拆解质量 | 15 | 原子化、依赖、影响范围、验证方式 |
| 上下文与 Skill 使用 | 15 | 上下文命中、Skill 路由、约束利用 |
| 执行质量 | 20 | 最小修改、范围控制、代码/文档质量 |
| 验证质量 | 20 | lint、typecheck、build、test、screenshot、记录真实性 |
| 记录与 RCA | 15 | Run Record、RCA、反哺项、可复盘性 |

## 4. 投产门槛

| 等级 | 分数要求 | 附加条件 |
|------|----------|----------|
| Draft | 不要求 | 无代码修改，不做投产判断 |
| Internal Trial | >= 80 | 无阻断项 |
| Low-risk Production | >= 90 | 连续 2 个低风险试点无 P1 问题 |
| Controlled Rollout | >= 95 | 连续 3 个试点无 P1 问题，且至少 1 个 RCA 闭环通过 |
| Failed | < 80 或阻断项触发 | 不允许投产 |

## 5. 阻断项

出现以下任一情况，即使总分达标也不能通过：

1. 没有 Spec 就进入 Executor。
2. 验证未运行却记录为 Pass。
3. 修改超出任务影响范围。
4. 涉及高风险模块但没有人工确认。
5. 失败后没有记录原因。
6. 人工大幅修改后没有 RCA。
7. 使用了不在当前范围内的能力，例如 MCP、平台、数据库、Agent Runtime、无人值守合并或生产环境操作。

## 6. 指标定义

### 6.0 AI 代码质量指标

以下指标用于团队试点和 repo-local 指标采集。首版以仓库记录、Run Record、Evaluation Summary、git diff 和周期手工输入为准；GitHub、CI API、Jira、Sentry 等外部数据源仅作为后续接入来源。

#### Adoption

| 指标 | 计算方式 | 目标 | 数据源 |
|------|----------|------|--------|
| seatActivationRate | activeAiUsers / assignedSeats | 持续提升 | 周期指标文件 |
| activeAiUserRate | activeAiUsers / targetEngineers | 持续提升 | 周期指标文件 |
| workflowAdoptionRate | aiAssistedPrs / totalPrs | 持续提升 | 周期指标文件 |

#### AI Code Share

| 指标 | 计算方式 | 目标 | 数据源 |
|------|----------|------|--------|
| aiAssistedDiffShare | aiChangedLines / totalChangedLines | 观察趋势，不作为质量结论 | 周期指标文件 |
| aiCodeRetention30d | retainedAiLines30d / aiChangedLines | 持续提升 | 周期指标文件或后续代码平台 |

#### Delivery Quality

| 指标 | 计算方式 | 目标 | 数据源 |
|------|----------|------|--------|
| firstPassCiRate | firstPassCiPassRuns / aiAssistedRuns | 持续提升 | Run Record 指标快照或验证记录近似 |
| evidenceCompletenessRate | completeEvidenceRuns / aiAssistedRuns | 100% | Run Record 验证记录 |
| scopeDriftRate | scopeDriftRuns / aiAssistedRuns | 0% | Run Record Diff 覆盖表 |
| largeManualReworkRate | mediumOrLargeManualReworkRuns / aiAssistedRuns | 持续下降 | Run Record 人工介入与指标快照 |
| postMergeDefectRate | runsWithPostMergeDefect / aiAssistedRuns | 持续下降 | Run Record 指标快照 |

缺少分母或字段时必须输出 `N/A` 和原因，不得用 0% 代替未知值。AI 生成代码占比只能说明参与程度，不能单独代表质量；质量判断必须结合 CI、Review、返工、缺陷、证据完整度和范围漂移。

### 6.1 完成度指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| Spec 完整度 | 已填写必填章节 / 必填章节总数 | >= 90% |
| Task 完整度 | 有目标、输入、影响范围、动作、验收、验证的任务数 / 总任务数 | 100% |
| 验收覆盖率 | 已映射到任务或验证项的验收标准数 / 验收标准总数 | >= 90% |
| Run Record 完整度 | 已填写必填章节 / 必填章节总数 | 100% |

### 6.2 过程质量指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| 任务原子化得分 | Rubric 1-5 分 | >= 4 |
| 上下文命中率 | 使用的必要上下文数 / 应使用上下文数 | >= 80% |
| Skill 路由准确率 | 正确命中的 Skill 数 / 应命中 Skill 数 | >= 90% |
| 最小修改遵守率 | 符合任务范围的变更数 / 总变更数 | 100% |
| 人工介入次数 | Run Record 中人工介入记录数 | 越少越好，但必须真实记录 |

### 6.3 验证质量指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| Lint 通过率 | Pass 次数 / 应运行次数 | 100% |
| Typecheck 通过率 | Pass 次数 / 应运行次数 | 100% |
| Build 通过率 | Pass 次数 / 应运行次数 | 100% |
| Screenshot 覆盖率 | 已截图 UI 任务数 / UI 任务总数 | 100% |
| Skipped 解释合规率 | 有明确原因的 Skipped 数 / Skipped 总数 | 100% |

### 6.4 结果质量指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| 需求验收通过率 | Pass 验收项 / 总验收项 | >= 90% |
| Review 问题数 | P0/P1/P2 问题数量 | P0=0，P1=0 |
| 代码采纳率 | 保留的 AI 代码 / AI 生成代码 | >= 70% |
| 人工修改率 | 人工修改行数 / 总修改行数 | <= 30% |
| 回归问题数 | 本次修改引入的问题数 | 0 |

### 6.5 复盘改进指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| RCA 触发准确率 | 应触发且已触发 RCA 数 / 应触发 RCA 数 | 100% |
| 根因分类准确率 | 分类被 Review 接受的 RCA 数 / RCA 总数 | >= 90% |
| 反哺项可执行率 | 有明确文件和动作的反哺项 / 反哺项总数 | 100% |
| Prompt/Skill/Context 更新率 | 已落地反哺项 / 应落地反哺项 | >= 80% |
| 同类问题复发率 | 同类 RCA 重复出现次数 | 持续下降 |

## 7. 推荐评分方式

| 指标类型 | 推荐方式 | 示例 |
|----------|----------|------|
| 精确结果 | String / rule check | 文件是否存在、命令是否 Pass |
| 结构完整性 | Code / parser check | Markdown 章节是否齐全 |
| 文本相似或覆盖 | Text similarity | Spec 是否覆盖 PRD 验收项 |
| 主观质量 | 1-5 rubric | 任务原子化、上下文充分性 |
| 过程轨迹 | Trace review | 是否按读取顺序和 Skill 路由执行 |

## 8. 指标采集口径

| 指标 | 采集方式 | 可为空条件 | 证据文件 |
|------|----------|------------|----------|
| Spec 完整度 | 已填写必填章节 / 模板必填章节 | 无 Spec 时触发阻断项 | `spec.md` |
| Task 完整度 | 有目标、输入、影响、动作、验收、验证的任务数 / 总任务数 | 小任务无 Tasks 时可空 | `tasks.md` |
| 验收覆盖率 | 已映射到任务或验证项的验收标准数 / 总验收标准数 | 无验收标准时需要回补 Spec | `spec.md`、`tasks.md` |
| 上下文命中率 | 已读取必要上下文 / Context Pack 必要上下文 | 小任务无 Context Pack 时可空 | `tasks.md`、`run-record.md` |
| Skill 路由准确率 | 已读取匹配 Skill / 应读取 Skill | 纯文档小改无专用 Skill 时可空 | `.ai/context/skill-routing.md`、`run-record.md` |
| 最小修改遵守率 | 符合任务范围的变更数 / 总变更数 | 无代码变更时可空 | diff、`run-record.md` |
| 代码采纳率 | 保留的 AI 修改 / AI 总修改 | 无代码变更时可空 | diff、Review 记录 |
| 人工修改率 | 人工修改量 / 总修改量 | 无人工修改时填 0 | 人工介入记录 |
| 同类问题复发率 | 同类 RCA 重复次数 / RCA 总数 | 无 RCA 样本时可空 | `.ai/evals/rca/`、`specs/*/rca.md` |

## 9. 使用规则

1. 每个真实试点必须在 Run Record 中填写效果评估。
2. 中等及以上需求必须额外生成 `evaluation-summary.md`。
3. 出现阻断项时，总分记为 Failed，不进入投产判断。
4. 评估结果低于门槛时，必须补充改进项。
5. 改进项应指向具体文件：Prompt、Skill、上下文索引、模板或工作流协议。
