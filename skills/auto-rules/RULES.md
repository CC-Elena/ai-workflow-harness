# 🛡️ 自动生成的规则库

> 此文件由 `scripts/harvest-rules.js` 自动维护。
> 包含项目历史 Bug 提炼出的铁律。
>
> 提交前分类检查已迁移到 `docs/engineering-rules/pre-commit-redlines.md`。

<!-- RULES_START -->

### 危险命令检测必须按命令词匹配 (2026-07-13)

**规则**: 安全护栏不得用无边界子串匹配危险命令；必须按独立命令词或解析后的 argv 匹配，并同时测试真实危险命令被阻断、普通单词不误报。

> 上下文: scripts/codex-hooks/pre-tool-policy.mjs; test/harness-beta.test.mjs

---

<!-- RULES_END -->
