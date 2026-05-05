# 项目上下文地图

本文件是 Codex 执行任务前的轻量项目地图。更完整的项目规则以 `skills/project/SKILL.md` 为准。

## 1. 技术栈

| 类型 | 内容 |
|------|------|
| 前端框架 | React 17.0.2，函数组件 + Hooks |
| 构建 | Rsbuild + Rspack |
| 状态管理 | Rematch + immer/loading/select |
| UI 库 | Ant Design 4.21.7 |
| 样式 | Less + CSS Modules |
| 国际化 | di18n-react |
| 包管理 | pnpm |


## 4. 核心模块保护

以下文件或目录属于高风险范围，修改前必须在计划中标注“核心模块变更”：

1. `src/model/index.js`
2. `src/routes/route-*.js`
3. `src/utils/request/`


## 5. 常用命令

```bash
pnpm run start
pnpm run qa
```

## 6. Codex 执行前检查

执行代码任务前，至少确认：

1. 是否涉及核心模块。
2. 是否影响多个环境。
3. 是否需要国际化。
4. 是否可以复用现有组件或 Hook。
5. 是否需要补充测试或截图验证。

