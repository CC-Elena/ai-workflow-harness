# Prompt: 生成 RCA

## 目标

当 AI 执行失败、验证失败、人工大幅修改或 Review 发现系统性问题时，生成 RCA 并提出可落地的反哺项。

## 必读文件

1. `.ai/templates/rca-template.md`
2. `specs/{feature}/run-record.md`
3. 相关 Spec、Task 和验证日志。
4. `skills/auto-rules/SKILL.md`

## 执行步骤

1. 复盘问题现象。
2. 判断影响范围。
3. 将问题归类为 Spec、上下文、Skill、代码、测试、视觉、环境或模型能力问题。
4. 分析根因，避免只描述表象。
5. 给出修复动作。
6. 给出反哺项，明确应该更新哪个模板、Prompt、Skill 或上下文索引。
7. 如果是机制性、隐蔽性、易复发问题，建议补充到 `skills/auto-rules/RULES.md`。
8. 保存为 `specs/{feature}/rca.md` 或 `.ai/evals/rca/{feature}-{date}.md`。

## 输出要求

1. 使用 `.ai/templates/rca-template.md` 的结构。
2. 每个反哺项必须指向具体文件。
3. 不把一次性失误泛化为规则。

