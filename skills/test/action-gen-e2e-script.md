---
name: test-gen-e2e
description: 从测试清单生成 Playwright E2E 脚本
argument-hint: [测试清单路径]
---

# 生成 E2E 脚本，进行E2E测试

从测试清单自动生成 Playwright 测试脚本。

> 依赖 `skills/test/action-gen-checklist.md` 产出的测试清单

## 前置条件

- 已完成 `skills/test/action-gen-checklist.md`
- 存在 `e2e/checklists/{component}/checklist-{component}.md`

## 输入

1. **测试清单路径**：如 `e2e/checklists/header/checklist-header.md`
2. **组件名称**：如 `header`
3. **基础 URL**（可选）：默认 `http://localhost:4001`

## 执行流程

### 阶段一：环境检查与侦察

1. **服务检查**：确认开发服务器是否启动（如 `curl http://localhost:4001`）。
2. **页面检查**（Reconnaissance）：
   - 手动访问页面或使用简单脚本截图
   - 确认关键元素的选择器（ID, Class, TestID）
   - **不要盲写**：不要假设选择器，必须验证

### 阶段二：解析测试清单

提取所有测试项，识别：
- 路由映射表
- UI 测试项
- 交互测试项
- 条件逻辑测试

### 阶段三：生成脚本

生成 `e2e/{component}/{component}.spec.ts`。

**关键规则**：
- 🔴 **必须增加等待**：`await page.wait_for_load_state('networkidle');`
- 使用 `test.describe` 分组
- 每个用例保持独立

```typescript
import { test, expect } from '@playwright/test';

test.describe('{Component} 功能测试', () => {
  test('T001: 元素可见', async ({ page }) => {
    // 1. 访问
    await page.goto('/');
    // 2. 关键等待
    await page.waitForLoadState('networkidle'); 
    
    // 3. 断言
    await expect(page.locator('.element')).toBeVisible();
  });
});
```

## 产出

- `e2e/{component}/{component}.spec.ts` - 主测试脚本
- `e2e/{component}/selectors.ts` - 选择器映射 (推荐)

## 选择器策略

优先级：
1. `data-testid`（最稳定）
2. `aria-label`
3. 语义化 CSS 类名

## 下一步

运行生成的测试：

| 场景 | 命令 |
|------|------|
| 运行所有测试 | `pnpm test:e2e` |
| 可视化调试 | `pnpm test:e2e:ui` |
| 查看报告 | `pnpm test:e2e:report` |
| 只测某组件 | `pnpm test:e2e:{component}` |

