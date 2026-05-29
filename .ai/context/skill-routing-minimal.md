# 最小 Skill 路由

本文档用于降低 AI Coding 工具的规则加载成本。执行任务时优先读取本文件，再决定是否打开具体 Skill 正文。

## 1. 路由原则

1. 每个任务只选择 1 个主 Skill。
2. 只有在任务确实跨场景时，才选择 1 个辅助 Skill。
3. 不因为任务是代码任务就默认读取所有前端、测试、Review、规则 Skill。
4. Skill 正文只在需要执行对应动作时读取。
5. 失败或复盘场景才读取 RCA / auto-rules 相关内容。

## 2. 主 Skill 选择

| 任务场景 | 主 Skill | 何时读取正文 |
|----------|----------|--------------|
| 从 PRD / 需求做功能 | `skills/feature-dev/SKILL.md` | 需要生成 Spec、拆 Tasks 或实现功能时 |
| 普通前端代码修改 | `skills/frontend-dev/SKILL.md` | 需要改 React / CSS / 状态 / 交互时 |
| 组件复用或新增组件 | `skills/component-reuse/SKILL.md` | 需要判断是否复用已有组件时 |
| UI 视觉还原或截图对比 | `skills/ui-fidelity/SKILL.md` | 需要对比截图、设计稿或视觉偏差时 |
| 根据截图实现页面 | `skills/screenshot-based-dev/SKILL.md` | 需求输入主要是截图时 |
| 测试、E2E、验收清单 | `skills/test/SKILL.md` | 需要生成、执行或解释测试时 |
| npm 包安装与初始化 | `skills/package-install/SKILL.md` | 需要执行 install/setup/init/check 时 |
| 代码审查 | `skills/code-review/SKILL.md` | 用户明确要求 review / 审查时 |
| 文档、方案、规范 | `skills/doc-coauthoring/SKILL.md` | 主要产物是文档时 |
| 工作流资产维护 | `skills/workflow-assets/SKILL.md` | 修改 `.ai/`、`specs/`、`skills/` 工作流资产时 |
| 创建或更新 Skill | `skills/skill-creator/SKILL.md` | 需要新增或重写 Skill 时 |

## 3. 辅助 Skill 选择

| 触发条件 | 辅助 Skill |
|----------|------------|
| 前端实现中需要选择组件 | `skills/component-reuse/SKILL.md` |
| 前端实现后需要视觉检查 | `skills/ui-fidelity/SKILL.md` |
| 功能实现后需要补测试 | `skills/test/SKILL.md` |
| 工作流资产修改后需要复盘记录 | `skills/workflow-assets/SKILL.md` |
| 验证失败、人工大改、系统性 Review 问题 | `skills/auto-rules/SKILL.md` |

## 4. 默认不读

默认不读取以下 Skill，除非场景命中：

1. `skills/auto-rules/SKILL.md`
2. `skills/auto-rules/RULES.md`
3. `skills/code-review/SKILL.md`
4. `skills/ui-fidelity/SKILL.md`
5. `skills/test/SKILL.md`
6. `skills/screenshot-based-dev/SKILL.md`
7. `skills/skeleton/SKILL.md`

## 5. 使用记录格式

```markdown
## Skill Loading

- 主 Skill：
- 辅助 Skill：
- 未读取但相关的 Skill：
- 跳过原因：
```

