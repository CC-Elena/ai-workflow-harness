# Planner-Executor 工作流协议

本协议定义 Codex 在本仓库中执行需求开发时的标准方式。Planner 和 Executor 不对应独立程序，由 Codex 在不同阶段扮演不同角色完成。

## 1. 适用场景

适用于中等及以上复杂度需求，包括：

1. 涉及多个文件修改。
2. 涉及新增页面、组件、Hook 或接口。
3. 需要从 PRD 拆解任务。
4. 需要测试、截图或 Review 验证。
5. 需要沉淀执行记录或 RCA。

小型单点修改可以跳过完整 Planner 阶段，但仍需遵守验证协议。

## 2. Planner 阶段

Planner 只回答“做什么、按什么顺序做、如何验收”，不直接修改代码。

### 输入

1. 用户需求或 PRD。
2. `specs/{feature}/spec.md` 或 `.ai/templates/spec-template.md`。
3. `.ai/context/project-map.md`。
4. `.ai/context/common-patterns.md`。
5. 相关 Skills。

### 步骤

1. 确认需求是否已经有 Spec。
2. 如果没有 Spec，先按 `.ai/prompts/generate-spec.md` 生成 Spec。
3. 读取项目上下文索引，判断影响范围。
4. 将需求拆解为原子任务。
5. 为每个任务标注输入、输出、影响文件、依赖关系和验收标准。
6. 生成 `specs/{feature}/tasks.md`。
7. 如存在未确认问题，先向用户确认，不进入 Executor。

### 输出

1. 任务列表。
2. 执行顺序。
3. 每个任务的影响范围。
4. 每个任务的验收标准。
5. 风险和待确认问题。

## 3. Executor 阶段

Executor 只处理单个任务，严格按 Planner 输出执行。

### 输入

1. `specs/{feature}/spec.md`
2. `specs/{feature}/tasks.md`
3. 当前任务详情。
4. 必要上下文索引。
5. 匹配的 Skills。

### 步骤

1. 读取当前任务的目标和验收标准。
2. 读取对应上下文索引和 Skill。
3. 使用 `rg` 或文件读取确认真实代码结构。
4. 执行最小必要修改。
5. 按 `.ai/workflows/verification.md` 执行验证。
6. 记录结果到 `specs/{feature}/run-record.md`。
7. 失败时按 `.ai/prompts/fix-verification-failure.md` 处理。
8. 若仍失败，生成 RCA 或标记人工介入。

## 4. 任务粒度要求

一个任务应该满足：

1. 可独立理解。
2. 可独立验证。
3. 影响范围明确。
4. 不同时修改多个无关模块。
5. 失败后可定位原因。

不合格任务示例：

1. “完成整个优惠券需求”。
2. “优化页面所有样式”。
3. “顺便重构组件”。

合格任务示例：

1. “新增批量发券入口路由和菜单配置”。
2. “复用现有 Upload 组件实现 CSV 上传弹窗”。
3. “为批量发券接口补充失败态和空态处理”。

## 5. 停止条件

出现以下情况时，Codex 应停止执行并向用户确认：

1. Spec 存在核心歧义。
2. 涉及核心模块且缺少明确授权。
3. 需要新增依赖但没有确认。
4. 验证命令持续失败且无法判断是否与本次修改有关。
5. 上下文索引与真实代码明显不一致。

