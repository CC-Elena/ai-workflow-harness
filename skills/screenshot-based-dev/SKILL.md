---
name: screenshot-based-dev
description: 基于截图的功能开发规范，从设计稿到代码的 SOP。用于截图开发、按设计稿实现。
version: 0.1.0
dependencies: [frontend-dev]
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js screenshot-based-dev` -->

# 基于截图的功能开发规范

> 详细检查清单和模板参见 [REFERENCE.md](./REFERENCE.md)

## 流程概览

```
需求分析 → 代码调研 → 方案设计 → 确认对齐 → 编码实现 → 验证交付
```

---

## 阶段一：需求分析

**必需输入**：
- 截图集（默认、hover、active、空态、异常态）
- 目标入口与路由
- 交互说明
- 数据契约或 Mock 策略
- 复用策略
- i18n 范围

---

## 阶段二：代码调研

- 定位参考实现
- 识别可复用组件（FoldTree、CooperTabs、Tips 等）
- 确认路由/Aside 接入模式
- 确认样式变量策略

---

## 阶段三：方案设计

- 组件树与复用边界
- 接口/Mock/降级策略
- 路由/懒加载/Skeleton 策略
- 样式/i18n 策略

---

## 阶段四：确认对齐

暂停编码，等待确认：
- 复用 vs Copy 决策
- 列表组件选型
- 风险与验收标准

---

## 阶段五：编码实现

> **必须遵循** [frontend-dev](../frontend-dev/SKILL.md) 规范进行编码

**页面级功能目录结构**：
- 页面目录：`src/pages/<entry>/<FeatureName>/`
- 样式文件：`style.module.less`（CSS Modules）

---

## 阶段六：验证交付

- 渲染/滚动/批量/空态/权限 验证
- 样式对照截图
- i18n 覆盖
- 回归无影响

---

## 决策树

### 组件复用/复制/新建

1. 公共组件能力覆盖？→ 直接复用
2. 业务差异大但核心相同？→ 复制顶层包装隔离
3. 能否页面侧适配层？→ 新增适配层
4. 否则 → 评估新内核组件

### 列表组件选型

- **FoldTree**：树/层级/文件/回收站/批量操作
- **ScrollTableList**：纯表格、轻交互
- **自定义**：谨慎评估
