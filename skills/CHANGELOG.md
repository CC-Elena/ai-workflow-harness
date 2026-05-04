# AI Skills 变更日志

所有 Skill 的重大变更记录于此。

格式参考：
- `feat`: 新增功能/Skill
- `fix`: 修复问题
- `docs`: 文档变更
- `refactor`: 重构或优化

---

## [Unreleased]

## [2026-01-28] - Skill 体系优化

### 全局变更
- **refactor**: 重构所有 Skill 结构以符合 Anthropic 官方规范
  - 移除所有 Skill 内的 `CHANGELOG.md` 文件（统一迁移至此）
  - 将所有 `examples/` 目录重命名为 `references/`
  - 移除 Frontmatter 中的 `triggers` 字段，触发词融入 `description`
- **feat**: 新增 `skill-creator` 工具链
  - 添加 `pnpm create-skill` 命令
  - 添加标准模板 `TEMPLATE.md` 和指南 `SKILL-GUIDE.md`

