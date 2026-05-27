---
name: test
description: 测试流程，支持 E2E 脚本或 AI 浏览器测试。用于测试、E2E、端到端、自动化测试时。
version: 0.1.0
dependencies: [frontend-dev]
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js test` -->

# 测试工作流

> 测试清单示例参见 [references/example-checklist.md](./references/example-checklist.md)

从功能代码生成测试清单，支持两种测试方式。

> **前置**：[frontend-dev](../frontend-dev/SKILL.md)

---

## 流程概览

```
检查测试清单是否存在
        ↓
   ┌────┴────┐
  不存在    存在
   ↓         ↓
生成清单   跳过
   ↓         ↓
环境探测 (服务器状态?)
   ↓
   └────┬────┘
        ↓
   询问测试方式
        ↓
   ┌────┴────┐
  方式A     方式B
   ↓         ↓
 E2E脚本   AI浏览器
```

---

## 阶段一：检查/生成测试清单

**清单路径**：`e2e/checklists/{component}/checklist-{component}.md`

- 如果**不存在**：按照 `action-gen-checklist.md` 生成测试清单
- 如果**已存在**：跳过，进入阶段二

---

## 阶段二：环境探测与选择方式

1. **环境探测**：检查开发服务器是否已启动（如 `localhost:4001`）。若未启动，优先建议启动，使用脚本命令`npm run lint`。
2. **侦察模式**：在编写任何脚本前，建议先通过截图或 DOM dump 确认页面元素选择器，避免盲猜。

> ⚠️ **必须询问用户选择测试方式**

**询问模板**：

```
环境状态：[已启动/未启动]
请选择测试方式：
- **A. E2E 自动化测试** - 生成 Playwright 脚本 (推荐用于回归)
- **B. AI 浏览器测试** - AI 直接控制浏览器 (推荐用于新功能快速验证)
```

---

## 阶段三：执行测试

### 方式 A：E2E 自动化测试

1. **先侦察**：确认关键元素选择器
2. 按照 `action-gen-e2e-script.md` 生成测试脚本
   - 🔴 **关键**：必须包含 `page.wait_for_load_state('networkidle')` 等待逻辑
3. 运行 `npm run test:e2e`
4. 产出：`e2e/{component}/*.spec.ts`

### 方式 B：AI 浏览器测试

1. 按照 `action-perform-tests.md` 执行测试
2. **先侦察后行动**：先观察页面状态再执行操作
3. 逐项执行并截图
4. 产出：`walkthrough.md`（含嵌入截图）

---

## 子流程文件

- **action-gen-checklist.md** - 生成测试清单
- **action-gen-e2e-script.md** - 生成 Playwright 脚本
- **action-perform-tests.md** - AI 控制浏览器逐项测试
