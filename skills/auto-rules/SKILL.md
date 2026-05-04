---
name: auto-rules
description: 自愈免疫系统。既是项目避坑指南（Read），也是尸检根因分析专家（Write）。
version: 0.1.0
---

<!--  TRACKING: 执行分析前必须运行 `node scripts/track-skill.js auto-rules` -->

# 自愈免疫系统 (Self-Healing System)

此 Skill 有两个作用：
1. **READ**: 失败复盘、规则反哺或高风险变更时读取的避坑指南。
2. **WRITE**: Bug 修复后的根因分析与规则录入。

---

## 🛡️ READ: 自动生成的规则

> **核心数据**: 本 Skill 的规则存储在单独的 **[RULES.md](./RULES.md)** 文件中。
> 
> AI 注意：不要在所有代码任务前默认读取全部规则。只有在 `.ai/workflows/rule-loading-policy.md` 或 `.ai/context/skill-routing-minimal.md` 命中失败复盘、规则反哺、高风险变更或明确避坑检查时，才读取 `skills/auto-rules/RULES.md`。

---

## 🔬 WRITE: 如何录入新规则

在修复 Bug 后，运行此 Skill 进行"尸检"，将教训转化为永久规则。

### 分析步骤

1. **回顾变更**: `git diff HEAD~1`，对比修复前后的代码。
2. **根因分类**: 
   - 忽略拼写错误等一次性问题。
   - 重点关注**机制性、隐蔽性、易复发**的问题（如 API 误用、时序依赖）。
3. **收割规则**: 使用脚本将规则写入库。

### 录入命令

```bash
node skills/auto-rules/scripts/harvest-rules.js "<标题>" "<规则详情>" "<上下文>"
```

**示例**:
```bash
node skills/auto-rules/scripts/harvest-rules.js "禁止直接对 State 数组排序" "Array.sort() 会修改原数组，导致 React 无法检测 State 变化。必须先拷贝：[...arr].sort()" "src/utils/table.js"
```
