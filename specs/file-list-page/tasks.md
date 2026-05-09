# Task List: file-list-page

## 1. Spec 来源

- Spec 文件：`specs/file-list-page/spec.md`
- 规划日期：2026-05-09
- Planner：AI Agent

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 创建文件数据模块 | `app/files/file-data.ts` [NEW] | 无 | Done |
| T2 | 创建文件列表页主组件 | `app/files/file-workspace.tsx` [NEW] | T1 | Done |
| T3 | 追加文件列表页和导航栏样式 | `app/globals.css` | T2 | Done |
| T4 | 创建路由页面入口 | `app/files/page.tsx` [NEW] | T2 | Done |
| T5 | 添加全局导航栏 | `app/layout.tsx` | T3 | Done |
| T6 | 验证并记录执行结果 | `specs/file-list-page/run-record.md` | T1-T5 | Done |

## 3. Context Pack

| 等级 | 文件或资产 | 使用原因 | 阶段 | 是否已读取 |
|------|------------|----------|------|------------|
| P0 | `specs/file-list-page/spec.md` | 需求可信源 | Plan / Execute | ✅ |
| P0 | `specs/file-list-page/prd.md` | 需求背景 | Plan | ✅ |
| P1 | `app/workflow-data.ts` | 复用数据源和类型 | Execute | ✅ |
| P1 | `app/workflow-workspace.tsx` | 参考组件实现模式 | Execute | ✅ |
| P1 | `app/globals.css` | 参考样式和复用变量 | Execute | ✅ |
| P1 | `app/layout.tsx` | 修改全局布局 | Execute | ✅ |
| P3 | `skills/project/SKILL.md` | 工程规范 | Plan / Execute | ✅ |
| P3 | `.ai/context/common-patterns.md` | 实现模式参考 | Plan | ✅ |

## 4. 任务详情

### T1. 创建文件数据模块

#### 目标

为文件列表页创建数据模块，从 `workflow-data.ts` 导入现有 `assets` 数据，并扩展文件项类型。

#### 输入

1. Spec 相关段落：F1。
2. 必读上下文：`app/workflow-data.ts`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/files/file-data.ts` [NEW] | 文件列表数据和类型定义 |

#### 执行动作

1. 创建 `app/files/file-data.ts`。
2. 定义 `FileItem` 类型（扩展 `Asset`，增加 `icon` 字段）。
3. 从 `workflow-data.ts` 导入 `assets` 和 `AssetCategory` 类型。
4. 导出 `fileItems` 数组，映射 `assets` 数据并根据分类设定图标。

#### 验收标准

1. 类型定义正确，导出 `FileItem` 和 `fileItems`。
2. `fileItems` 包含所有 23 个资产。

#### 验证方式

1. 命令：`npm run typecheck`
2. 手工检查：阅读导出类型。

#### 风险

1. 无。

---

### T2. 创建文件列表页主组件

#### 目标

创建 `FileWorkspace` 组件，实现置顶卡片区、搜索/筛选工具栏和文件列表表格。

#### 输入

1. Spec 相关段落：F1-F5、F7、F8、A1-A5。
2. 必读上下文：`app/workflow-workspace.tsx`（参考组件模式）、`app/files/file-data.ts`（数据源）。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/files/file-workspace.tsx` [NEW] | 文件列表页主组件 |

#### 执行动作

1. 创建 `app/files/file-workspace.tsx`，标记 `'use client'`。
2. 实现 `pinnedPaths` 状态管理（`useState` + `localStorage`）。
3. 实现 `useEffect` 从 `localStorage` 恢复置顶状态。
4. 实现 `togglePin` 函数：添加/移除路径并同步 `localStorage`。
5. 实现搜索和分类筛选（`query` + `selectedCategory` + `useMemo`）。
6. 渲染置顶卡片区：有置顶文件时显示 4 列 grid 卡片。
7. 渲染工具栏：搜索框 + 分类标签按钮。
8. 渲染文件列表：表格行，含名称/分类/路径/置顶按钮。

#### 验收标准

1. 组件正确渲染列表和卡片。
2. 置顶/取消置顶交互正常。
3. 搜索和分类筛选正常。
4. `localStorage` 读写正常。

#### 验证方式

1. 命令：`npm run typecheck`
2. 浏览器手工测试。

#### 风险

1. 无。

---

### T3. 追加文件列表页和导航栏样式

#### 目标

在 `globals.css` 中追加文件列表页专用样式和全局导航栏样式。

#### 输入

1. Spec 相关段落：设计约束。
2. 必读上下文：`app/globals.css`（现有样式和变量）。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/globals.css` | 追加样式 |

#### 执行动作

1. 追加 `.nav-bar` 全局导航栏样式。
2. 追加 `.pinned-section` 置顶区域样式。
3. 追加 `.pinned-grid` 4 列卡片网格样式。
4. 追加 `.pinned-card` 单个卡片样式。
5. 追加 `.file-table-header` 表头样式。
6. 追加 `.file-row` 文件行样式。
7. 追加 `.pin-button` 置顶按钮样式。
8. 追加 `.category-badge` 分类标签样式。
9. 追加响应式降级规则。

#### 验收标准

1. 样式复用现有 CSS 变量。
2. 不影响现有页面样式。
3. 响应式适配正常。

#### 验证方式

1. 命令：`npm run build`
2. 浏览器视觉检查。

#### 风险

1. 需确保新增类名不与现有类名冲突。

---

### T4. 创建路由页面入口

#### 目标

创建 `/files` 路由页面。

#### 输入

1. 参考 `app/page.tsx` 现有模式。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/files/page.tsx` [NEW] | 路由入口 |

#### 执行动作

1. 创建 `app/files/page.tsx`。
2. 导入并渲染 `FileWorkspace` 组件。

#### 验收标准

1. 访问 `/files` 可看到页面。

#### 验证方式

1. 浏览器手工验证。

#### 风险

1. 无。

---

### T5. 添加全局导航栏

#### 目标

在 `layout.tsx` 中添加全局导航栏组件。

#### 输入

1. Spec 相关段落：F6、A6。
2. 必读上下文：`app/layout.tsx`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `app/layout.tsx` | 添加导航栏 |
| 组件 | `app/nav-bar.tsx` [NEW] | 导航栏客户端组件 |

#### 执行动作

1. 创建 `app/nav-bar.tsx`，使用 `'use client'` 和 `usePathname`。
2. 渲染导航链接：首页 (`/`) 和文件列表 (`/files`)。
3. 当前路径高亮对应链接。
4. 在 `layout.tsx` 的 `<body>` 中引入导航栏组件。

#### 验收标准

1. 导航栏在所有页面显示。
2. 当前页面对应链接高亮。
3. 点击可切换页面。

#### 验证方式

1. 浏览器手工验证导航。

#### 风险

1. 导航栏会改变首页的视觉外观（新增顶部元素）。设计为轻量级以减少影响。

---

### T6. 验证并记录执行结果

#### 目标

完成静态检查、构建验证、浏览器截图验证和 harness 门禁，记录执行结果。

#### 输入

1. Spec 相关段落：A7。
2. 必读上下文：`.ai/templates/run-record-template.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/file-list-page/run-record.md` [NEW] | 执行记录 |

#### 执行动作

1. 运行 `npm run lint`。
2. 运行 `npm run typecheck`。
3. 运行 `npm run build`。
4. 启动 `npm run dev` 并浏览器验证。
5. 截图记录页面效果。
6. 运行 `npm run harness:check -- specs/file-list-page`。
7. 记录修改文件和验证结果。

#### 验收标准

1. `npm run lint`、`npm run typecheck`、`npm run build` 通过。
2. 浏览器关键交互通过并保存证据。
3. `npm run harness:check -- specs/file-list-page` 通过。
4. Run Record 完整。

#### 验证方式

1. 静态检查和构建命令输出。
2. 浏览器截图和交互记录。
3. Harness 门禁输出。

#### 风险

1. 无。

## 5. 执行顺序

1. T1 — 数据层
2. T2 — 主组件
3. T3 — 样式
4. T4 — 路由入口
5. T5 — 全局导航
6. T6 — 验证记录
