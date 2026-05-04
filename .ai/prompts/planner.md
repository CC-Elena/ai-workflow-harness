# Prompt: Planner 任务拆解

## 目标

基于 Spec 和项目上下文，将需求拆解为原子化、可执行、可验证的任务列表。

## 必读文件

1. `specs/{feature}/spec.md`
2. `.ai/templates/task-template.md`
3. `.ai/workflows/planner-executor.md`
4. `.ai/context/project-map.md`
5. `.ai/context/component-index.md`
6. `.ai/context/hook-index.md`
7. `.ai/context/api-index.md`
8. `.ai/context/common-patterns.md`

## 执行步骤

1. 读取 Spec，提取功能点、影响范围和验收标准。
2. 读取上下文索引，判断可能涉及的文件、组件、Hook、API。
3. 拆解为原子任务。
4. 为每个任务明确输入、影响范围、执行动作、验收标准和验证方式。
5. 标注任务依赖和执行顺序。
6. 如发现阻塞问题，停止并列出待确认项。
7. 保存为 `specs/{feature}/tasks.md`。

## 输出要求

1. 使用 `.ai/templates/task-template.md` 的结构。
2. 每个任务都必须可独立验证。
3. 不要把重构、优化、补测试混在同一个大任务中。

