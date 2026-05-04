# Prompt: Executor 单任务执行

## 目标

严格执行 Planner 拆解出的单个任务，完成最小必要代码修改，并验证结果。

## 必读文件

1. `specs/{feature}/spec.md`
2. `specs/{feature}/tasks.md`
3. `.ai/workflows/verification.md`
4. `skills/project/SKILL.md`
5. `skills/frontend-dev/SKILL.md`
6. 与任务匹配的具体 Skill

## 执行步骤

1. 确认当前任务 ID 和验收标准。
2. 读取任务指定上下文。
3. 使用 `rg` 查找真实代码位置，确认索引是否准确。
4. 执行最小必要修改。
5. 如需新增组件，先读取 `skills/component-reuse/SKILL.md`。
6. 如涉及 UI，读取 `skills/ui-fidelity/SKILL.md`。
7. 如涉及测试，读取 `skills/test/SKILL.md`。
8. 运行验证命令。
9. 更新 `specs/{feature}/run-record.md`。

## 输出要求

1. 说明完成了哪个任务。
2. 说明修改了哪些文件。
3. 说明验证结果。
4. 说明风险或未完成项。

