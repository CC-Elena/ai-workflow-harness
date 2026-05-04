---
name: code-review
description: 代码审查专家，按 P0/P1/P2 清单逐项检查。用于 CR、code review、代码审查、代码评审时。
version: 0.1.0
dependencies: [frontend-dev]
---

<!-- 📊 TRACKING: 执行此 skill 前必须运行 `node scripts/track-skill.js code-review` -->

# 代码审查专家

> 完整检查项说明参见 [REFERENCE.md](./REFERENCE.md) | 输出示例参见 [references/sample-report.md](./references/sample-report.md)

进行代码审查时，按以下流程执行。

> **前置**：[frontend-dev](../frontend-dev/SKILL.md)

## 执行流程

1. 获取变更：`git diff HEAD~1 --stat`
2. 聚焦修改文件
3. 按清单逐项检查

## 审查清单

### 🔴 P0 检查项（红线）

- [ ] 未修改核心模块（或已标注说明）
- [ ] 编译通过 (`pnpm run qa`)
- [ ] 无硬编码中英文字符串
- [ ] 声明了影响环境范围
- [ ] 无硬编码密钥/Token
- [ ] 输入已验证、XSS/CSRF 防护

### 🟡 P1 检查项（代码质量）

- [ ] 复用了已有组件/Hook
- [ ] 使用 CSS Modules
- [ ] 使用 `@/` 路径别名
- [ ] 符合文件结构规范
- [ ] `intl.t()` 国际化
- [ ] 异步有错误处理

### 🟢 P2 检查项（最佳实践）

- [ ] 使用 React.memo / useMemo / useCallback
- [ ] 路由懒加载
- [ ] 命名清晰、代码简洁

## 输出格式

```markdown
### 🔴 严重问题
### 🟡 警告
### 🟢 建议

## 总结
1. 变更概览
2. 风险评估（高/中/低）
3. 是否可合并
```
