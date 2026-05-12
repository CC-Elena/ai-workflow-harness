# Task List: file-content-tree-view

## 1. Spec 来源

- Spec 文件：`specs/file-content-tree-view/spec.md`
- 规划日期：2026-05-09
- Planner：AI Agent

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 新增受限文件内容 API | `src/app/api/files/content/route.ts` [NEW] | 无 | Done |
| T2 | 扩展文件数据为目录树 | `src/lib/data/file-data.ts` | T1 | Done |
| T3 | 重构文件页交互 | `src/components/views/file-workspace.tsx` | T2 | Done |
| T4 | 增加目录树和预览样式 | `src/app/globals.css` | T3 | Done |
| T5 | 验证并记录执行结果 | `specs/file-content-tree-view/*` | T1-T4 | Done |

## 3. Context Pack

| 等级 | 文件或资产 | 使用原因 | 阶段 | 是否已读取 |
|------|------------|----------|------|------------|
| P0 | `specs/file-content-tree-view/spec.md` | 需求可信源 | Plan / Execute | Yes |
| P1 | `src/components/views/file-workspace.tsx` | 修改目标组件 | Execute | Yes |
| P1 | `src/lib/data/file-data.ts` | 数据构建入口 | Execute | Yes |
| P1 | `src/lib/data/workflow-data.ts` | 资产白名单来源 | Execute | Yes |
| P1 | `src/app/globals.css` | 页面样式 | Execute | Yes |
| P2 | `.ai/workflows/verification.md` | 验证协议 | Verify | Yes |

## 4. 任务详情

### T1. 新增受限文件内容 API

- 目标：提供 `GET /api/files/content?path={assetPath}`。
- 执行动作：使用 `assets[].path` 作为白名单，读取仓库内文本文件并返回 `{ path, content, size }`。
- 验收标准：允许路径返回内容，非白名单路径返回 404。
- 验证方式：curl / 浏览器 API 请求。

### T2. 扩展文件数据为目录树

- 目标：基于 `fileItems.path` 构建 folder/file 节点。
- 执行动作：新增 `FileTreeNode` 类型和 `buildFileTree(files)`。
- 验收标准：路径按目录层级聚合，folder 排在 file 前。
- 验证方式：typecheck 和页面验证。

### T3. 重构文件页交互

- 目标：左侧目录树、右侧内容预览，保留筛选和置顶。
- 执行动作：新增选中文件状态、内容加载状态、API fetch、树节点渲染和预览区。
- 验收标准：点击文件显示内容；筛选联动；置顶仍可用。
- 验证方式：浏览器交互验证。

### T4. 增加目录树和预览样式

- 目标：完成桌面和移动端布局。
- 执行动作：新增 `.files-browser`、`.file-tree-panel`、`.file-preview`、`.file-content` 等样式。
- 验收标准：桌面左右分栏，移动端上下布局，无横向溢出。
- 验证方式：截图检查。

### T5. 验证并记录执行结果

- 目标：完成静态检查、构建、浏览器验证和 harness 门禁。
- 执行动作：运行 lint、typecheck、build、API 验证、浏览器验证和 harness check。
- 验收标准：所有验证通过，Run Record 和 Evaluation Summary 完整。
- 验证方式：命令输出和证据文件。
