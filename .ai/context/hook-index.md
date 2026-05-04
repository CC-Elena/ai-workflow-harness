# Hook 索引

本文件是轻量 Hook 索引入口。真实 Hook 列表以仓库搜索结果为准。

## 1. 搜索位置

1. `hooks-catalog.json`
2. `src/hooks/`
3. `src/shared/`
4. 业务页面目录中的局部 Hooks

## 2. 搜索策略

1. 根据业务名搜索，例如 `coupon`、`file`、`permission`。
2. 根据动作搜索，例如 `useLoad`、`useFetch`、`useUpload`、`usePermission`。
3. 根据接口或状态关键词搜索。
4. 读取 Hook 定义和调用方，确认入参、出参、副作用。

## 3. 复用判断

优先复用已有 Hook，除非：

1. 现有 Hook 与业务语义明显冲突。
2. 现有 Hook 副作用过重，无法安全复用。
3. 现有 Hook 只服务特定页面且耦合严重。
4. 新需求需要更清晰的抽象边界。

## 4. 新增 Hook 要求

1. 命名使用 `useXxx`。
2. 入参和返回值保持稳定。
3. 不直接耦合 UI 文案。
4. 网络请求优先复用 `src/service/`。
5. 复杂逻辑需要补充测试或至少补充验证说明。

