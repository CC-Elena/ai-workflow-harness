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

## 2. 主要目录

| 目录 | 作用 |
|------|------|
| `src/components/` | 业务组件 |
| `src/componentsUI/` | 基础 UI 组件，通常是 Ant Design 封装 |
| `src/baseComponents/` | 可复用业务组件 |
| `src/pages/` | 页面组件 |
| `src/routes/` | 路由配置 |
| `src/model/` | Rematch 状态管理 |
| `src/service/` | API 模块 |
| `src/hooks/` | 自定义 Hooks |
| `src/utils/` | 工具函数 |
| `src/language/` | 国际化资源 |
| `shimo/` | shimo 环境 |
| `shimo2/` | shimo2 环境 |
| `skills/` | AI Coding Skills |

## 3. 多环境入口

修改 `src/` 下共享代码时，需要考虑多环境影响。

| 环境 | 入口 |
|------|------|
| cooper | `src/cooper.js` |
| knowledge | `src/knowledge.js` |
| shimo | `shimo/app/index.js` |
| shimo2 | `shimo2/app/index.js` |

## 4. 核心模块保护

以下文件或目录属于高风险范围，修改前必须在计划中标注“核心模块变更”：

1. `src/model/index.js`
2. `src/routes/route-*.js`
3. `src/utils/request/`
4. `src/assets/style/variable-global.less`

## 5. 常用命令

```bash
pnpm run start:cooper
pnpm run start:dk
pnpm run qa
```

## 6. Codex 执行前检查

执行代码任务前，至少确认：

1. 是否涉及核心模块。
2. 是否影响多个环境。
3. 是否需要国际化。
4. 是否可以复用现有组件或 Hook。
5. 是否需要补充测试或截图验证。

