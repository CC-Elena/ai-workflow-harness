---
name: test-gen-spec
description: 生成功能测试清单
argument-hint: [组件路径] [设计稿截图]
---

# 步骤一：生成测试清单

根据截图和功能代码，生成标准化的功能测试清单。

> 产出供 `skills/test/action-gen-e2e-script.md` 和 `skills/test/action-perform-tests.md` 使用

## 输入

1. **设计稿截图**：UI 各状态（默认、hover、active、选中等）
2. **功能代码路径**：组件/页面源码路径
3. **测试页面 URL**：如 `http://localhost:4001/`

## 执行流程

### 阶段一：分析输入

1. **截图分析**：识别 UI 元素、交互热点、状态变化
2. **代码分析**：提取事件处理、路由跳转、状态变更逻辑
3. **交叉验证**：确认截图与代码的对应关系

### 阶段二：生成测试清单

按以下结构生成：

```markdown
# [组件名] 交互测试清单

> 组件路径: `src/path/to/component`
> 测试页面: `http://localhost:4001/path`

## 一、UI 测试

| 元素 | 检查项 |
|------|--------|
| xxx | 尺寸、颜色、间距 |

## 二、功能测试

| 交互 | 预期行为 | 测试步骤 |
|------|----------|----------|
| 点击 | xxx | 1. xxx |

## 三、边界场景

| 场景 | 预期结果 |
|------|----------|
| 空数据 | xxx |
```

### 阶段三：用户审阅

> 测试清单必须先通过用户审阅

### 阶段四：输出

保存至 `e2e/checklists/{component}/checklist-{component}.md`

## 产出

- `e2e/checklists/{component}/checklist-{component}.md`

## 下一步
如果是E2E测试执行：
→ `skills/test/action-gen-e2e-script.md`（生成 E2E 脚本）
如果是AI浏览器测试执行：
→ `skills/test/action-perform-tests.md`（执行交互测试）
