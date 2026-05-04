---
name: test-run
description: 按测试清单逐项执行交互测试
argument-hint: [测试清单路径] [测试页面 URL]
---

# AI 浏览器测试

严格按照测试清单逐项执行自动化测试。

> 依赖 `skills/test/action-gen-checklist.md` 产出的测试清单

## 工具要求

> ⚠️ 本流程需要 AI 工具具备浏览器控制能力

**支持的工具**：
- Antigravity（支持 browser_subagent）
- 其他支持 Browser 工具的 AI coding 工具

**如果工具不支持**：
请提醒用户进行配置。
或者询问是否使用 `skills/test/action-gen-e2e-script.md` 生成 E2E 脚本的方式

## 前置条件

- 已完成 `skills/test/action-gen-checklist.md`
## 输入

1. **测试清单路径**：如 `e2e/checklists/header/checklist-header.md`
2. **测试页面 URL**：如 `http://localhost:4001/`

## 核心原则

> ⚠️ 必须严格按照测试清单逐项执行，不可跳过任何测试项

## 执行流程

### 阶段一：准备工作 (Reconnaissance)

1. **服务检查**：确认页面可访问
2. **页面检查**：截图并观察页面状态，确认与清单描述一致

### 阶段二：逐项执行

创建执行状态表：
```markdown
| 编号 | 测试项 | 类型 | 状态 | 备注 |
|------|--------|------|------|------|
| T001 | xxx | UI | ⏳ 待测 | |
```

状态枚举：⏳ 待测 | ✅ 通过 | ❌ 失败 | ⚠️ 跳过

**执行规则**：
1. **按编号顺序执行**，不可跳跃
2. 每完成一项，**立即更新状态表**
3. 每个测试项必须有**截图证据**

### 阶段三：生成测试报告

测试完成后，生成 Markdown 报告保存至 `e2e/reports/{component}/walkthrough-{timestamp}.md`：

```markdown
# {组件名} 交互测试报告

> 时间: {timestamp}
> 组件: {component}

## 覆盖率统计

| 指标 | 数值 |
|------|------|
| 测试项总数 | X |
| 通过 | X |
| 失败 | X |
| 覆盖率 | X% |

## 测试详情

### T001：xxx ✅

![截图描述](./screenshots/T001.png)

## ❌ 失败项详情（如有）

| 编号 | 预期 | 实际 |
|------|------|------|
```

## 禁止行为

1. **禁止批量概括**：不可用"测试了 XX 功能"替代逐项记录
2. **禁止跳过**：每项必须有明确状态
3. **禁止无截图**：每项测试必须有截图证据

## 产出

- `e2e/reports/{component}/walkthrough-{timestamp}.md`
- `e2e/reports/{component}/screenshots/*.png` (若工具支持保存图片)

## 质量检查

- [ ] 报告保存在 `e2e/reports/` 下？
- [ ] 每个测试项都有状态？
- [ ] 覆盖率达到 100%？
- [ ] 每项都有截图？
