# 常见实现模式

本文件记录 Codex 在本仓库中应优先遵循的常见实现模式。

## 1. React 组件

1. 优先使用函数组件和 Hooks。
2. 页面入口遵循 Next.js App Router：

```text
app/
├── page.tsx
├── layout.tsx
├── workflow-workspace.tsx
└── files/
    ├── page.tsx
    ├── file-data.ts
    └── file-workspace.tsx
```

3. 使用浏览器状态、事件或 `localStorage` 的组件必须声明 `'use client';`。
4. 用户可见文案当前直接维护在组件或数据模块中。
5. 组件导出优先保持与同目录现有风格一致。

## 2. 样式

1. 使用 `app/globals.css` 中已有 class 和布局约定。
2. 优先复用已有颜色、间距、卡片和表单样式。
3. 不随意引入新的样式体系或 UI 库。
4. UI 需求需要截图或设计稿对齐时，读取 `skills/ui-fidelity/SKILL.md`。

## 3. 国际化

1. 当前仓库未接入国际化系统。
2. 新增文案保持页面内语言、大小写和命名一致。
3. 若未来接入国际化，需单独立项并更新本文件。

## 4. 组件复用

1. 创建新组件前必须查询复用候选。
2. 复用判断参考 `skills/component-reuse/SKILL.md`。
3. 无法复用时，在任务记录中说明原因。

## 5. 任务执行

1. 先声明影响文件和影响环境。
2. 一次只处理一个明确任务。
3. 修改后运行 `npm run lint`、`npm run typecheck`、`npm run build` 或记录无法运行的原因。
4. 不做与任务无关的重构。
