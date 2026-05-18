# Spec: PR 级 Harness Gate

## 1. 基本信息

- 需求名称：PR 级 Harness Gate
- 需求来源：用户要求将 CI 中固定样例门禁升级为真实 PR diff 门禁
- 执行日期：2026-05-18
- 负责人：Codex

## 2. 背景与目标

当前 CI 的 `harness:check` 固定检查 `specs/failure-rca-sample`，只能证明样例仍然有效，不能判断当前 PR 的真实变更是否有 Run Record、验证证据和 diff 覆盖。目标是保留本地单 feature 检查能力，同时新增 PR 级 changed-file 模式，让 CI 根据 `base...head` 的实际 diff 执行门禁。

## 3. 范围

范围内：

1. 扩展 `scripts/check-harness-run.mjs`，新增 `--changed --base <baseRef> --head <headRef>` 模式。
2. 更新 GitHub Actions，PR 事件使用真实 diff 门禁，非 PR 事件保留固定样例回归。
3. 增加脚本级测试，覆盖无 Run Record、覆盖真实 PR 文件、多 feature 校验和旧命令兼容。
4. 更新验证协议和 Quick Start 文档，说明 PR 模式与固定样例的边界。

范围外：

1. 不替代业务测试、截图验证或代码审查。
2. 不引入外部测试框架或独立 CI 平台。
3. 不要求历史 Run Record 全量迁移到 PR 模式。

## 4. 用户故事

作为维护者，我希望 PR CI 能检查当前 PR 的真实变更是否被 Run Record 覆盖，而不是只检查一个稳定样例。

作为执行者，我希望本地仍可运行 `npm run harness:check -- specs/{feature}`，避免破坏现有工作流。

## 5. 功能要求

1. 单 feature 模式保持兼容，默认读取工作区 changed files。
2. PR 模式必须从 `git diff --name-only <base>...<head>` 读取真实变更。
3. PR 模式自动从 changed files 中识别 `specs/<feature>` 候选目录。
4. PR 模式要求所有 changed files 被至少一个候选 Run Record 的“实际 Diff 覆盖表”覆盖。
5. PR 模式不允许 `Diff 覆盖模式：Feature scope` 静默忽略跨目录变更。
6. PR 模式缺少候选 Run Record 时必须失败。

## 6. 非功能要求

1. 脚本保持 Node.js 标准库实现。
2. 错误输出必须说明缺失的文件或覆盖关系。
3. CI 配置需要支持完整 git 历史，保证 base/head diff 可用。

## 7. 数据与接口

新增命令接口：

```bash
npm run harness:check -- --changed --base <baseRef> --head <headRef>
```

保留命令接口：

```bash
npm run harness:check -- specs/{feature}
```

## 8. 边界与异常

1. PR 没有 changed files 时，PR 模式通过并输出 no changed files。
2. PR 有 changed files 但没有任何 `specs/<feature>/...` 变更时，PR 模式失败。
3. 任一候选 Run Record 结构不合规时，PR 模式失败。
4. 任一 changed file 没被聚合覆盖表覆盖时，PR 模式失败。

## 9. 验证方案

1. 运行新增脚本级测试。
2. 运行 lint、typecheck、build。
3. 运行本需求单 feature harness check。
4. 使用当前分支与 base commit 模拟 PR diff，运行 changed-file 模式。

## 10. 交付物

1. PR 模式脚本实现。
2. CI workflow 更新。
3. 脚本级测试。
4. 文档更新。
5. 本需求 Run Record、Verification 和 Evaluation。

## 11. 验收标准

1. `npm run harness:check -- specs/failure-rca-sample` 继续通过。
2. `npm run harness:test` 覆盖计划中的核心 PR 模式场景并通过。
3. PR 模式能用真实 `base...head` diff 检查本次变更。
4. CI PR 事件不再固定只检查 `specs/failure-rca-sample`。

## 12. 风险与待确认问题

1. 如果 PR 只修改代码但没有新增或修改任何 `specs/<feature>` 记录，新门禁会失败，这是预期行为。
2. 历史轻量维护记录如果没有完整 Spec，继续使用旧样例或补齐记录后再纳入 PR 模式。
