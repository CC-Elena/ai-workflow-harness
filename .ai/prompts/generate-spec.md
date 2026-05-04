# Prompt: 生成结构化 Spec

## 目标

将用户提供的 PRD、需求描述或截图说明，转换为符合本仓库规范的结构化 Spec。

## 必读文件

1. `.ai/templates/spec-template.md`
2. `skills/project/SKILL.md`
3. `.ai/context/project-map.md`
4. `.ai/context/common-patterns.md`

## 执行步骤

1. 提取需求背景、目标用户、业务目标和核心功能。
2. 识别本次包含和不包含的范围。
3. 识别页面、组件、Hook、API 和数据影响。
4. 明确权限、异常、空态、加载态和错误态。
5. 明确设计稿、截图或 UI 约束。
6. 补充工程约束和验收标准。
7. 标注风险和待确认问题。
8. 保存为 `specs/{feature-name}/spec.md`。

## 输出要求

1. 使用 `.ai/templates/spec-template.md` 的结构。
2. 不确定的信息必须写入“待确认问题”，不能编造。
3. Spec 应能被 Planner 直接用于任务拆解。
4. 文件名使用英文短横线命名。

