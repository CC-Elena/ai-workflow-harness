# 提交前检查

本文件是代码提交前的检查入口。提交前不只看“能否编译”，还要确认代码没有把底线安全、长期可维护性和业务正确性悄悄腐蚀掉。

## 必跑命令

```bash
npm run lint
npm run quality:gate
npm run typecheck
npm run build
```

## 1. 代码底线检查

目标：发现不能提交的硬红线，任何失败都必须阻断。

执行入口：

```bash
npm run quality:gate
```

当前自动检查：

1. **安全扫描**：禁止硬编码 API key、token、password、secret、private key、服务 URL/endpoint；这些内容必须来自环境变量或明确的配置边界。
2. **错误处理红线**：禁止静默 `catch`；所有 `catch` 必须绑定错误对象，并执行可见处理（记录、抛出、返回错误响应、设置错误态或说明降级动作）。
3. **交付底线**：底线检查不通过时，不进入可交付状态；“编译通过”不等于“可以交付”。

## 2. 代码规范检查

目标：控制代码健康度、复用边界和长期维护成本。

执行入口：

```bash
npm run lint
npm run quality:gate
npm run typecheck
```

当前自动检查：

1. **ESLint**：通过 `npm run lint` 检查 Next/React/TypeScript/项目 ESLint 规则。
2. **TypeScript**：通过 `npm run typecheck` 检查类型边界。
3. **单文件行数**：JS/TS/MJS/TSX 单文件默认不得超过 500 行；确需突破时先拆分职责，或在 `QUALITY_MAX_LINES` 中显式调整并说明原因。
4. **禁止重复造轮子**：新增通用能力前必须先搜索现有组件、Hook、工具函数和 Skill；`debounce`、`throttle`、`classNames/cn`、`deepClone`、日期/查询串工具等基础能力不得随手本地重写。
5. **引用边界**：避免不够好的引用方式，例如跨层深层引用、绕过统一入口、UI 层直接依赖底层服务。当前主要靠 Review 和后续规则补充，新增自动化前必须写明人工检查方式。

## 3. 业务逻辑检查

目标：证明功能行为真的符合需求，而不只是静态检查通过。

执行入口：

```bash
npm run build
```

按变更范围补充：

1. **单元/组件测试**：涉及工具函数、Hook、复杂状态逻辑时补充或运行对应测试。
2. **页面行为验证**：涉及 UI 或交互时启动本地页面，检查关键路径、空态、加载态、错误态和截图。
3. **Harness 验收**：涉及真实需求交付或流程记录时运行 `npm run harness:check -- specs/{feature}`。
4. **人工验收**：业务规则无法自动覆盖时，在 Run Record 或最终说明中记录验收项、结果和风险。

## 维护规则

1. 这里是提交前检查分类的唯一事实来源。
2. `skills/auto-rules/RULES.md` 只沉淀 RCA 或历史 Bug 反哺出的项目规则，不再直接维护通用提交前红线。
3. 新增底线或规范检查时必须同步对应自动化检查，或明确写出人工检查方式和跳过风险。
