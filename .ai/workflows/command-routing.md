# 命令路由协议

本文档定义 AI Workflow Harness 如何根据用户输入选择工作模式。默认原则是：**默认轻量执行，显式进入 Spec**。

## 1. 核心原则

1. 普通自然语言请求不进入 Spec 流程。
2. 只有用户显式使用 `/spec`、`/mini-spec` 或等价触发词时，才生成对应 Spec 产物。
3. Agent 可以建议使用 `/spec` 或 `/mini-spec`，但不能擅自进入。
4. 高风险任务应暂停并建议 `/spec`，等待用户确认。
5. 不设置 `/maintenance`；Harness 文档、模板、规则维护默认走轻量流程。

## 2. 路由表

| 输入 | 模式 | 适用场景 | 产物 |
|------|------|----------|------|
| 普通请求 | Lightweight Flow | 文档、规则、Harness 维护、小型代码修改、明确 bugfix | 修改说明、验证结果、最终总结 |
| `/mini-spec` | Mini Spec Flow | 中等复杂前端需求、轻量交互、多文件但边界清楚 | `mini-spec.md`、必要任务、验证记录 |
| `/spec` | Full Spec Flow | 复杂前端需求、需求边界不清、高风险或用户明确要求 SDD | `spec.md`、`tasks.md`、验证记录、Run Record、必要时 Evaluation / RCA |

## 3. 触发词

### Full Spec Flow

以下输入视为 `/spec`：

1. `/spec`
2. `走 spec`
3. `进入 spec`
4. `按 spec 流程`
5. `生成 spec`
6. `用 SDD`
7. `走完整需求流程`

### Mini Spec Flow

以下输入视为 `/mini-spec`：

1. `/mini-spec`
2. `走 mini spec`
3. `轻量 spec`
4. `简单 spec`

## 4. Lightweight Flow

普通请求默认走轻量流程：

```text
理解目标
  ↓
声明修改范围和非范围
  ↓
读取直接相关上下文
  ↓
执行最小修改
  ↓
运行相关验证
  ↓
总结修改、验证、风险和后续建议
```

轻量流程不要求 `spec.md`、`tasks.md`、`evaluation-summary.md` 或完整 Run Record。若发生代码变更，最终说明必须包含验证结果或跳过原因。

## 5. Mini Spec Flow

`/mini-spec` 适用于中等复杂但边界清楚的前端需求：

```text
用户需求
  ↓
生成 mini-spec.md
  ↓
确认目标、范围、验收和验证计划
  ↓
执行修改
  ↓
验证
  ↓
记录结果
```

Mini Spec 不要求完整 PRD、Evaluation Summary 或 RCA，除非验证失败或用户要求投产判断。

## 6. Full Spec Flow

`/spec` 适用于复杂、高风险或用户希望严格审计的需求：

```text
用户需求 / PRD
  ↓
生成或补全 spec.md
  ↓
用户确认
  ↓
拆解 tasks.md
  ↓
Tech Plan / Done Contract
  ↓
执行
  ↓
验证
  ↓
Run Record
  ↓
Evaluation / RCA
```

Full Spec Flow 必须先生成 Spec 并等待用户确认，再进入代码修改。

## 7. Agent 建议规则

Agent 可以在以下场景建议 `/spec`：

1. 涉及核心模块、权限、支付、生产数据或不可逆操作。
2. 涉及跨模块重构或复杂状态。
3. 需求目标、范围或验收标准明显不清。
4. 失败风险高且回滚成本高。

建议话术：

```text
这个需求涉及较高风险或边界不清，我建议使用 /spec 先明确范围和验收。是否按 /spec 模式处理？
```

在用户确认前，不生成完整 Spec。
