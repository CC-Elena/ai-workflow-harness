# Team AI Frontend Pilot Metrics

## 1. 基本信息

- 试点周期：
- 团队：
- 参与 Agent：
- 需求数量：
- 评估人：
- PR 导出文件：

> PR 导出文件应使用 `.ai/templates/pr-export-template.csv` 的表头。`aiAssisted` 来自 PR label `ai-assisted` 或导出时人工标记；没有标记默认 `no`，不猜测。

## 2. 周期分母

| 字段 | 数值 | 说明 |
|------|------|------|
| 目标研发人数 | | targetEngineers |
| 已分配席位 | | assignedSeats |
| 活跃 AI 用户 | | activeAiUsers |
| 总 PR | | totalPrs |
| AI-assisted PR | | aiAssistedPrs |
| 总变更行 | | totalChangedLines |
| AI 参与变更行 | | aiChangedLines |
| AI 30 天保留行 | | retainedAiLines30d |

## 3. PR 导出口径

| 字段 | 说明 |
|------|------|
| additions / deletions | PR 原始新增行和删除行 |
| effectiveAdditions / effectiveDeletions | 排除 lock、generated、vendor、纯格式化等噪音后的有效变更行 |
| taskType | docs / test / bugfix / frontend-ui / frontend-state / refactor / infra-config / risky-core |
| riskLevel | Small / Medium / Large / Risky |
| reviewComments | Review comment 数 |
| reviewRounds | Review 轮次 |
| requestedChanges | 是否出现 requested changes，0 / 1 或次数 |
| defects7d / defects14d / defects30d | 合入后固定窗口内归因缺陷数 |
| rollback / hotfix | 是否发生回滚或热修 |

## 4. 需求列表

| 需求 | 复杂度 | Agent | 状态 | Run Record | RCA |
|------|--------|-------|------|------------|-----|
|      | Small / Medium / Risky | | Success / Partial / Failed | | |

## 5. 质量指标

| 指标 | 目标 | 实际 | 说明 |
|------|------|------|------|
| seatActivationRate | 持续提升 | | activeAiUsers / assignedSeats |
| activeAiUserRate | 持续提升 | | activeAiUsers / targetEngineers |
| workflowAdoptionRate | 持续提升 | | aiAssistedPrs / totalPrs |
| aiAssistedDiffShare | 观察趋势 | | aiChangedLines / totalChangedLines |
| aiCodeRetention30d | 持续提升 | | retainedAiLines30d / aiChangedLines |
| firstPassCiRate | 持续提升 | | firstPassCiPassRuns / aiAssistedRuns |
| evidenceCompletenessRate | 100% | | completeEvidenceRuns / aiAssistedRuns |
| scopeDriftRate | 0% | | scopeDriftRuns / aiAssistedRuns |
| largeManualReworkRate | 持续下降 | | mediumOrLargeManualReworkRuns / aiAssistedRuns |
| postMergeDefectRate | 持续下降 | | runsWithPostMergeDefect / aiAssistedRuns |
| reviewCommentsPer100EffectiveLines | 持续下降 | | reviewComments / effectiveChangedLines * 100 |
| reviewRoundsPerPr | 持续下降 | | reviewRounds / totalPrs |
| requestedChangesRate | 持续下降 | | requestedChangesPrs / totalPrs |
| defectRate7d | 持续下降 | | defects7dPrs / totalPrs |
| defectRate14d | 持续下降 | | defects14dPrs / totalPrs |
| defectRate30d | 持续下降 | | defects30dPrs / totalPrs |
| rollbackRate | 0% | | rollbackPrs / totalPrs |
| hotfixRate | 持续下降 | | hotfixPrs / totalPrs |
| Spec 完整率 | >= 90% | | |
| 修改范围命中率 | >= 95% | | |
| 组件复用检查率 | 100% | | |
| 验证证据完整率 | >= 90% | | |
| Review 一次通过率 | 持续提升 | | |
| 人工大幅修改率 | 持续下降 | | |
| RCA 触发准确率 | 100% | | |
| 同类问题复发率 | 持续下降 | | |

## 6. 问题归因

| 问题 | 分类 | 影响 | 反哺位置 | 状态 |
|------|------|------|----------|------|
|      | Spec / Context / Skill / Verification / Review / Tool | | | |

## 7. 推广判断

- 结论：Not Ready / Internal Trial / Low-risk Production / Controlled Rollout
- 依据：
- 下一步：
