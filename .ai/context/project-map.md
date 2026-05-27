# 项目上下文地图

本文件是 Codex 执行任务前的轻量项目地图。更完整的项目规则以 `skills/project/SKILL.md` 为准。

## 1. 技术栈

| 类型 | 内容 |
|------|------|
| 前端框架 | Next.js 15 App Router |
| 运行时 | React 19 + TypeScript |
| 数据来源 | 静态 TypeScript 数据模块 |
| UI 库 | 无外部 UI 库 |
| 样式 | `app/globals.css` 全局 CSS |
| 国际化 | 未接入国际化系统 |
| 包管理 | npm |


## 4. 核心模块保护

以下文件或目录属于高风险范围，修改前必须在计划中标注“核心模块变更”：

1. `scripts/check-harness-run.mjs`
2. `.ai/templates/`
3. `.ai/workflows/`
4. `app/api/files/content/route.ts`


## 5. 常用命令

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run harness:check -- specs/{feature}
```

## 6. Codex 执行前检查

执行代码任务前，至少确认：

1. 是否涉及核心模块。
2. 是否影响多个环境。
3. 是否需要更新 `app/workflow-data.ts` 或 `app/files/file-data.ts`。
4. 是否可以复用现有组件、样式和数据结构。
5. 是否需要补充测试或截图验证。
