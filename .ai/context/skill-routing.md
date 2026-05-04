# Skills 路由说明

本文件说明不同任务应优先读取哪些 Skill。Skill 内容以 `skills/` 目录为准。

## 1. 通用策略

默认优先读取 `.ai/context/skill-routing-minimal.md`，按任务选择 1 个主 Skill，最多 1 个辅助 Skill。

不要因为任务是代码任务就默认读取所有 Skills。`skills/auto-rules/SKILL.md` 和 `skills/auto-rules/RULES.md` 只在失败复盘、规则反哺或明确需要避坑检查时读取。

## 2. 场景路由

| 场景 | 主 Skill |
|------|----------|
| 从 PRD 开始做功能 | `skills/feature-dev/SKILL.md` |
| 前端代码实现 | `skills/frontend-dev/SKILL.md` |
| 新增或选择组件 | `skills/component-reuse/SKILL.md` |
| UI 还原、视觉走查 | `skills/ui-fidelity/SKILL.md` |
| 根据截图实现 | `skills/screenshot-based-dev/SKILL.md` |
| 骨架屏 | `skills/skeleton/SKILL.md` |
| 测试、E2E、验收清单 | `skills/test/SKILL.md` |
| 代码审查 | `skills/code-review/SKILL.md` |
| 规则复盘、防复发 | `skills/auto-rules/SKILL.md` |
| 编写文档、方案、规范 | `skills/doc-coauthoring/SKILL.md` |
| 工作流资产维护、Run Record、RCA、上下文索引 | `skills/workflow-assets/SKILL.md` |

## 3. 与新工作流的关系

`.ai/` 目录负责定义“流程协议”，`skills/` 目录负责定义“专项能力”。

例如：

1. `.ai/prompts/planner.md` 负责规定如何拆任务。
2. `skills/feature-dev/action-split.md` 可作为具体拆解方法参考。
3. `.ai/workflows/verification.md` 负责规定验证顺序。
4. `skills/test/SKILL.md` 可作为测试执行方法参考。
5. `skills/workflow-assets/SKILL.md` 负责维护执行记录、RCA、上下文索引和 Skill 路由。

## 4. 使用记录

如果项目中的 tracking 脚本可用，执行某个 Skill 前应按 Skill 内说明记录使用情况。

如果 tracking 脚本不存在或无法运行，需在 Run Record 中记录使用过的 Skill。

记录时应区分主 Skill 和辅助 Skill，避免事后无法判断规则加载是否过重。
