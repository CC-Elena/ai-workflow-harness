# Task List: asset-catalog-evaluation-filter

## 1. Spec 来源

- Spec 文件：`specs/asset-catalog-evaluation-filter/spec.md`
- 规划日期：2026-05-03
- Planner：Codex

## 2. 任务总览

| ID | 任务 | 影响范围 | 依赖 | 状态 |
|----|------|----------|------|------|
| T1 | 扩展资产分类类型和筛选按钮 | `src/components/views/workflow-workspace.tsx` | 无 | Done |
| T2 | 补充 Evaluation 与 Skill 资产条目 | `src/components/views/workflow-workspace.tsx` | T1 | Done |
| T3 | 验证构建并记录执行结果 | `specs/asset-catalog-evaluation-filter/run-record.md` | T1-T2 | Done |

## 3. 任务详情

### T1. 扩展资产分类类型和筛选按钮

#### 目标

让资产分类支持 `Evaluation` 和 `Skill`。

#### 输入

1. Spec 相关段落：F1、F2、A1。
2. 必读上下文：`src/components/views/workflow-workspace.tsx`。
3. 必读 Skills：`skills/frontend-dev/SKILL.md`、`skills/workflow-assets/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `src/components/views/workflow-workspace.tsx` | 更新 Asset 类型和分类数组 |

#### 执行动作

1. 扩展 `Asset.category` union。
2. 将分类按钮数组加入 `Evaluation` 和 `Skill`。
3. 确认现有筛选逻辑无需变更。

#### 验收标准

1. 类型检查不报错。
2. 页面按钮包含新分类。

#### 验证方式

1. 命令：`npm run build`
2. 手工检查：阅读 JSX 分类数组。

#### 风险

1. 静态分类和资产数据需要保持同步。

### T2. 补充 Evaluation 与 Skill 资产条目

#### 目标

让首页能检索新增的验证记录模板、Skill 缺口映射、workflow-assets Skill 和真实试点候选清单。

#### 输入

1. Spec 相关段落：F3、A2、A3。
2. 必读上下文：`.ai/context/skill-gap-map.md`、`.ai/templates/verification-record-template.md`、`specs/real-pilot-candidates.md`。
3. 必读 Skills：`skills/workflow-assets/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `src/components/views/workflow-workspace.tsx` | 增加静态资产条目 |

#### 执行动作

1. 增加 Evaluation 资产。
2. 增加 Skill 资产。
3. 确认搜索字段覆盖标题、路径、描述。

#### 验收标准

1. Evaluation 分类至少包含 2 个资产。
2. Skill 分类至少包含 2 个资产。

#### 验证方式

1. 命令：`npm run build`
2. 手工检查：阅读 `assets` 数组。

#### 风险

1. 后续新增资产需要继续维护静态列表。

### T3. 验证构建并记录执行结果

#### 目标

完成真实试点闭环，记录代码修改和验证结果。

#### 输入

1. Spec 相关段落：A4。
2. 必读上下文：`.ai/templates/run-record-template.md`、`.ai/workflows/verification.md`。
3. 必读 Skills：`skills/workflow-assets/SKILL.md`。

#### 影响范围

| 类型 | 路径或名称 | 说明 |
|------|------------|------|
| 文件 | `specs/asset-catalog-evaluation-filter/run-record.md` | 记录执行结果 |

#### 执行动作

1. 运行 `npm run build`。
2. 记录修改文件和验证结果。
3. 标注跳过项和风险。

#### 验收标准

1. Run Record 存在。
2. 构建结果被真实记录。

#### 验证方式

1. 文件检查。
2. 文档审查。

#### 风险

1. 本次未做浏览器截图验证，需要在后续 UI 试点补充。

## 4. 执行顺序

1. T1
2. T2
3. T3

