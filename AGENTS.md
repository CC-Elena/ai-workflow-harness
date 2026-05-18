
## 阅读顺序

1. `.ai/workflows/rule-loading-policy.md`
2. `.ai/workflows/command-routing.md`
3. `.ai/context/skill-routing-minimal.md`
4. 用户请求和直接受影响的文件
5. 一个主 Skill，需要时最多附加一个辅助 Skill
6. 在最终验证前阅读 `.ai/workflows/verification.md`

## 工作模式

- 默认的自然语言任务使用**轻量级流程 (Lightweight Flow)**：理解目标，声明范围，阅读聚焦的上下文，进行最小的安全更改，验证并总结证据。
- `/mini-spec` 或类似措辞使用**微型 Spec 流程 (Mini Spec Flow)**，可能会创建轻量的 spec 记录。
- `/spec` 或类似措辞使用**完整 Spec 流程 (Full Spec Flow)**，必须创建或更新 `spec.md`、`tasks.md`、验证证据以及 Run Record（运行记录）。
- 不要为普通请求自动创建 Spec 制品。对于高风险或不明确的工作，建议使用 `/spec` 并等待用户确认。
- Harness 自身的文档、模板、规则、hook、脚本维护默认仍使用轻量级流程；可以提高验证和 approval 要求，但不能因此自动进入完整 Spec。

## 复杂度级别

- **Small (小)**：单文件、文档、文案、低风险样式或静态数据。将上下文保持在 3-5 个文件和一个主 Skill 范围内。
- **Medium (中)**：多文件更改、UI 行为、截图、测试或非平凡状态。使用 6-10 个文件，可选择附加一个辅助 Skill。
- **Large (大)**：跨模块行为、复杂状态、接口或用户流更改。建议使用 `/spec` 并在 Context Pack（上下文包）中工作。
- **Risky (高风险)**：权限、生产数据、鉴权、依赖项更改、不可逆命令、核心工作流文件、CI、部署或代码库策略。在编辑前暂停并等待确认。
- **Failure (失败)**：验证失败、部分结果、系统性审查问题或大量人工修正。仅加载失败/RCA 上下文并记录结论。

## 运行时护栏

- 将 `.codex/config.toml`、`.codex/hooks.json`、`.ai/**`、`scripts/**`、包清单 (package manifests)、CI 和根配置视为受保护文件。
- 添加依赖、启用网络访问、删除文件或更改受保护文件需要用户的明确批准，除非用户已经明确要求执行该操作。
- 永远不要将跳过或失败的验证标记为通过。
- 如果进行了代码更改，最终输出必须包含验证结果或明确的跳过原因。
- 对于 `/spec`、用户要求记录或 PR 门禁 (PR-gate) 工作，确保 Run Record 的 diff 覆盖表涵盖了实际更改的文件。

## 必需证据

- **Small/Lightweight (小/轻量级)**：最终总结包含范围、验证和剩余风险即可，除非用户要求记录。
- **Medium 或 `/mini-spec` (中/微型 Spec)**：当工作改变了行为时，包含 Run Record 或等效的验证记录。
- **Large/Risky (大/高风险)**：需要更完整的确认、验证和风险说明；只有用户确认 `/spec` 时才要求完整 Spec 制品。
- **`/spec` (完整 Spec)**：包含 Spec、Tasks、Run Record、验证证据和评估总结；对于失败或部分结果，必须提供 RCA（根本原因分析）。
