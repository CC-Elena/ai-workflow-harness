# 上下文与记忆策略

本文档定义 AI Workflow Harness 如何选择上下文、记录记忆和避免上下文污染。

## 1. 目标

上下文策略的目标不是“读得越多越好”，而是让 Codex 在每个阶段读取足够、相关、可证明的上下文。

优秀的上下文包应该满足：

1. 覆盖任务直接修改对象。
2. 覆盖直接依赖和相似实现。
3. 覆盖强制工程规范和 Skill。
4. 不引入大量无关文件干扰判断。
5. 能在 Run Record 中被追溯。

## 2. 上下文分级

| 等级 | 内容 | 是否必须 | 例子 |
|------|------|----------|------|
| P0 | 直接修改文件和 Spec | 必须 | `src/lib/data/workflow-data.ts`、`spec.md` |
| P1 | 直接依赖文件 | 必须 | 调用组件、Hook、API、样式文件 |
| P2 | 同类历史实现 | 推荐 | 相似页面、相似 Run Record |
| P3 | 工程规范和 Skill | 推荐 | `skills/frontend-dev/SKILL.md` |
| P4 | 背景资料 | 可选 | 产品说明、长期规划 |

## 3. Context Pack 格式

中等及以上任务执行前，应在 `tasks.md` 或 Run Record 中记录：

```markdown
## Context Pack

| 等级 | 文件 | 使用原因 | 阶段 |
|------|------|----------|------|
| P0 | `specs/example/spec.md` | 需求可信源 | Plan / Execute |
| P1 | `app/example.tsx` | 直接修改对象 | Execute |
| P3 | `skills/frontend-dev/SKILL.md` | 前端实现规则 | Execute |
```

## 4. 读取策略

1. 先读 Spec，再读任务，不从代码猜需求。
2. 先读索引，再读具体文件，不盲目全量扫描。
3. 先读 Skill，再执行对应场景，不把规则留到 Review 后补救。
4. 先读现有模式，再新增抽象，避免重复创建能力。
5. 变更范围扩大时，必须补读新增影响范围的上下文。

## 5. 记忆分类

| 类型 | 存放位置 | 用途 |
|------|----------|------|
| 项目结构记忆 | `.ai/context/project-map.md` | 帮助快速定位模块 |
| 组件和 Hook 记忆 | `.ai/context/component-index.md`、`hook-index.md` | 约束复用方式 |
| API 记忆 | `.ai/context/api-index.md` | 约束接口调用 |
| 工程模式记忆 | `.ai/context/common-patterns.md` | 复用稳定实现 |
| Skill 记忆 | `skills/*/SKILL.md` | 沉淀可执行规范 |
| 失败记忆 | `.ai/evals/rca/` 或 `specs/{feature}/rca.md` | 防止同类失败 |
| 执行记忆 | `run-record.md` | 支撑评估和复盘 |

## 6. 防污染规则

1. 不把一次性业务细节写进通用 Skill。
2. 不把未验证的经验写进工程规则。
3. 不把失败现象直接当根因沉淀。
4. 不把旧实现当作规范，除非已被上下文索引或 Skill 明确确认。
5. 不把 MCP 或平台能力写入当前 MVP 必选路径。

## 7. 缺口反哺

当出现以下情况，应更新上下文或 Skill：

1. Codex 漏读关键文件。
2. 重复问同一类项目结构问题。
3. 生成代码违反稳定工程模式。
4. 验证失败根因来自上下文不完整。
5. Review 问题可转化为明确规则。

反哺动作必须记录：

```markdown
- 缺口：
- 影响：
- 更新文件：
- 新增规则：
- 验证方式：
```

