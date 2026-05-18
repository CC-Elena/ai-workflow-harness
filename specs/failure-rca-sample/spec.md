# Spec: 失败路径与 RCA 样本

## 1. 基本信息

- 需求名称：失败路径与 RCA 样本
- 需求类型：受控失败样本
- 维护日期：2026-05-18

## 2. 背景与目标

该样本用于验证 Harness Gate 对失败交付的处理：失败或 Failure 复杂度记录必须保留 Failed / Partial 状态、引用真实或模拟失败证据，并提供 RCA 文件，避免把失败路径改写成成功。

## 3. 范围

范围内：

1. 失败状态 Run Record。
2. 模拟失败证据。
3. RCA 文件。
4. Evaluation Summary。

范围外：

1. 不制造真实代码失败。
2. 不作为业务功能验收样本。

## 4. 用户故事

作为 Harness 维护者，我希望有一个稳定失败样本，证明门禁能识别 RCA 要求和失败证据要求。

## 5. 功能要求

1. Run Record 状态保持 `Failed`。
2. 任务复杂度保持 `Failure`。
3. Run Record 必须引用 `rca.md`。
4. 失败证据文件必须存在。

## 6. 非功能要求

1. 样本不得破坏 lint、typecheck 或 build。
2. 样本应可被 `npm run harness:check -- specs/failure-rca-sample` 稳定检查。

## 7. 数据与接口

使用现有 Harness Run Record、Evaluation Summary、RCA 和 evidence 文件格式。

## 8. 边界与异常

1. 该样本的 Failed 状态是预期结果，不代表 CI 失败。
2. Harness Check 通过表示失败路径记录完整，不表示业务执行成功。

## 9. 验证方案

运行：

```bash
npm run harness:check -- specs/failure-rca-sample
```

## 10. 交付物

1. `specs/failure-rca-sample/run-record.md`
2. `specs/failure-rca-sample/rca.md`
3. `specs/failure-rca-sample/evidence/mock-verification-failure.log`

## 11. 验收标准

1. Harness Check 能通过该失败样本。
2. RCA 引用存在且文件存在。
3. 失败证据文件存在。

## 12. 风险与待确认问题

无。
