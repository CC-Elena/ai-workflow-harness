# PRD：仓库资产检索支持 Evaluation 和 Skill 分类

## 1. 背景

AI Workflow Harness 首页已经支持按 Workflow、Template、Context、Spec 分类检索仓库资产。随着执行记录、RCA、验证记录模板和 Skill 路由资产增多，现有分类无法清晰展示评估类和 Skill 类资产。

## 2. 目标

让使用者在首页资产检索中可以直接筛选：

1. Evaluation：Run Record、RCA、验证记录、试点复盘相关资产。
2. Skill：Skill 路由、Skill 缺口映射和新增工作流资产维护 Skill。

## 3. 功能需求

1. 资产分类新增 `Evaluation` 和 `Skill`。
2. 分类筛选按钮包含新分类。
3. 资产列表加入验证记录模板、Skill 缺口映射、工作流资产维护 Skill、真实试点候选清单。
4. 搜索仍可按标题、路径、描述匹配。

## 4. 非目标

1. 不开发文件系统扫描能力。
2. 不读取真实文件内容。
3. 不开发后端接口。
4. 不改变 localStorage 草稿逻辑。

## 5. 验收标准

1. 首页资产分类按钮包含 `Evaluation` 和 `Skill`。
2. 选择 `Evaluation` 时能看到执行评估相关资产。
3. 选择 `Skill` 时能看到 Skill 路由和工作流资产维护 Skill。
4. `npm run build` 通过。

