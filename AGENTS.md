# Codex Harness 入口

本文件只做路由，不承载完整规则。不要默认读取全部 `.ai/`、`skills/` 或历史 `specs/`。

## 默认流程

1. 先判断用户是否显式输入 `/spec` 或 `/mini-spec`。
2. 未显式触发时，默认使用 Lightweight Flow：理解目标、声明范围、读取直接相关文件、最小修改、验证、总结。
3. Harness 自身的文档、模板、规则、hook、脚本维护默认仍是 Lightweight；可以提高验证和 approval 要求，但不能自动生成完整 Spec。

## 按需读取

- 启动和普通任务：只读 `.ai/workflows/command-routing.md` 与 `.ai/context/skill-routing-minimal.md`。
- 需要判断复杂度或上下文预算时，再读 `.ai/workflows/rule-loading-policy.md`。
- 修改代码后，最终验证前读 `.ai/workflows/verification.md`。
- 每次只选 1 个主 Skill；确实跨场景时最多再选 1 个辅助 Skill。

## 不要自动做

- 不因任务复杂或 Risky 自动创建 `spec.md`、`tasks.md`、`evaluation-summary.md`。
- 不为普通轻量任务创建 `specs/{feature}` 目录，除非用户要求记录。
- 不读取无关长协议、所有 Skills、历史评估或 RCA。
- 不把失败、跳过验证写成通过。

## 需要确认

修改 `.codex/`、`.ai/`、`scripts/`、CI、包配置、核心配置、依赖、权限、生产相关或不可逆操作前，先确认范围和风险。确认后仍按最轻可行流程执行。
