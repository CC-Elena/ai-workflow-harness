# AI 前端 Review Checklist: {feature_name}

## 1. 基本信息

- 需求名称：
- 关联 Spec：
- 关联 Tech Plan：
- 关联 Run Record：
- Review 日期：
- Reviewer：

## 2. 需求与范围

| 检查项 | 结果 | 证据或问题 |
|--------|------|------------|
| 实现符合 Spec 和验收标准 | Pass / Fail / N/A | |
| 没有越界修改 | Pass / Fail / N/A | |
| 非目标没有被顺手实现 | Pass / Fail / N/A | |
| 核心文件修改已被确认 | Pass / Fail / N/A | |

## 3. 代码风格

| 检查项 | 结果 | 证据或问题 |
|--------|------|------------|
| 文件结构符合当前目录风格 | Pass / Fail / N/A | |
| 命名符合当前代码库习惯 | Pass / Fail / N/A | |
| 抽象层次不过度也不重复 | Pass / Fail / N/A | |
| 状态管理方式与相似实现一致 | Pass / Fail / N/A | |
| 错误处理与现有模式一致 | Pass / Fail / N/A | |

## 4. 复用与一致性

| 检查项 | 结果 | 证据或问题 |
|--------|------|------------|
| 新增组件前做过复用检查 | Pass / Fail / N/A | |
| 已复用合适组件 / Hook / API | Pass / Fail / N/A | |
| 新建组件有不可复用理由 | Pass / Fail / N/A | |
| 样式使用现有变量、布局和响应式模式 | Pass / Fail / N/A | |
| 没有复制粘贴已有复杂逻辑 | Pass / Fail / N/A | |

## 5. 前端行为

| 检查项 | 结果 | 证据或问题 |
|--------|------|------------|
| 主路径交互可用 | Pass / Fail / N/A | |
| 空态处理完整 | Pass / Fail / N/A | |
| 加载态处理完整 | Pass / Fail / N/A | |
| 错误态处理完整 | Pass / Fail / N/A | |
| 桌面和移动端布局无明显问题 | Pass / Fail / N/A | |
| 可访问性基础要求满足 | Pass / Fail / N/A | |

## 6. 验证与证据

| 检查项 | 结果 | 证据或问题 |
|--------|------|------------|
| lint / typecheck / build 已运行或有跳过理由 | Pass / Fail / N/A | |
| 测试或浏览器验证覆盖关键路径 | Pass / Fail / N/A | |
| Run Record 记录真实证据 | Pass / Fail / N/A | |
| 失败或跳过项没有被写成成功 | Pass / Fail / N/A | |
| 需要 RCA 的问题已触发 RCA | Pass / Fail / N/A | |

## 7. Review 结论

- 结论：Approve / Request Changes / Needs RCA
- 必改项：
- 建议项：
- 是否需要更新规则、模板或上下文索引：
