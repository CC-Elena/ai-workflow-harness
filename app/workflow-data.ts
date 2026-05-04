export type StageStatus = 'ready' | 'active' | 'pending';

export type Stage = {
  id: string;
  title: string;
  description: string;
  output: string;
  status: StageStatus;
};

export type AssetCategory = 'Workflow' | 'Template' | 'Context' | 'Spec' | 'Evaluation' | 'Skill';

export type Asset = {
  title: string;
  path: string;
  category: AssetCategory;
  description: string;
};

export type PlanTask = {
  id: string;
  title: string;
  status: 'Done';
};

export type Pilot = {
  id: string;
  title: string;
  status: 'Done';
};

export const stages: Stage[] = [
  {
    id: 'prd',
    title: 'PRD Intake',
    description: '收集需求背景、目标、范围和验收标准。',
    output: 'prd.md',
    status: 'ready'
  },
  {
    id: 'spec',
    title: 'Spec',
    description: '将自然语言需求整理为结构化可信源。',
    output: 'spec.md',
    status: 'ready'
  },
  {
    id: 'planner',
    title: 'Planner',
    description: '拆解原子任务，标注影响范围和验证方式。',
    output: 'tasks.md',
    status: 'ready'
  },
  {
    id: 'executor',
    title: 'Executor',
    description: '按任务执行最小修改，并复用 Codex 的代码能力。',
    output: 'code diff',
    status: 'ready'
  },
  {
    id: 'verify',
    title: 'Verify',
    description: '运行 QA、测试、构建或截图验证。',
    output: 'verification',
    status: 'ready'
  },
  {
    id: 'record',
    title: 'Record',
    description: '沉淀 Run Record，必要时生成 RCA。',
    output: 'run-record.md',
    status: 'ready'
  }
];

export const assets: Asset[] = [
  {
    title: '工作流入口',
    path: '.ai/workflows/README.md',
    category: 'Workflow',
    description: '进入仓库后第一份应该读取的 AI 工作流说明。'
  },
  {
    title: 'Planner-Executor 协议',
    path: '.ai/workflows/planner-executor.md',
    category: 'Workflow',
    description: '定义如何从 Spec 拆解任务并执行。'
  },
  {
    title: '验证协议',
    path: '.ai/workflows/verification.md',
    category: 'Workflow',
    description: '定义代码修改后的验证顺序和记录方式。'
  },
  {
    title: '评估指标体系',
    path: '.ai/workflows/evaluation-metrics.md',
    category: 'Evaluation',
    description: '定义工作流质量指标、评分模型、投产门槛和阻断项。'
  },
  {
    title: '评估 Rubric',
    path: '.ai/workflows/eval-rubric.md',
    category: 'Evaluation',
    description: '提供可复制的 1-5 分人工评审或 LLM grader 标准。'
  },
  {
    title: 'Spec 模板',
    path: '.ai/templates/spec-template.md',
    category: 'Template',
    description: '将 PRD 转成结构化需求的标准模板。'
  },
  {
    title: 'Run Record 模板',
    path: '.ai/templates/run-record-template.md',
    category: 'Template',
    description: '记录一次 AI 辅助开发过程和验证结果。'
  },
  {
    title: '验证记录模板',
    path: '.ai/templates/verification-record-template.md',
    category: 'Evaluation',
    description: '单独归档验证范围、跳过项、失败项和结论。'
  },
  {
    title: '评估摘要模板',
    path: '.ai/templates/evaluation-summary-template.md',
    category: 'Evaluation',
    description: '记录评估分数、证据、阻断项和投产判断。'
  },
  {
    title: '门禁检查模板',
    path: '.ai/templates/gate-check-template.md',
    category: 'Evaluation',
    description: '在 Spec、Planner、Executor、Verify、Record 阶段做进入/退出检查。'
  },
  {
    title: 'Rubric 评分模板',
    path: '.ai/templates/rubric-template.md',
    category: 'Evaluation',
    description: '沉淀单项评分证据、理由和改进建议。'
  },
  {
    title: '项目地图',
    path: '.ai/context/project-map.md',
    category: 'Context',
    description: '技术栈、目录结构、多环境入口和核心模块保护。'
  },
  {
    title: 'Skills 路由',
    path: '.ai/context/skill-routing.md',
    category: 'Skill',
    description: '说明不同研发场景应该读取哪些 Skill。'
  },
  {
    title: 'Skill 缺口映射',
    path: '.ai/context/skill-gap-map.md',
    category: 'Skill',
    description: '审查计划中的关键能力由哪些 Prompt、模板或 Skill 承载。'
  },
  {
    title: '工作流资产维护 Skill',
    path: 'skills/workflow-assets/SKILL.md',
    category: 'Skill',
    description: '维护 Run Record、RCA、验证记录、上下文索引和试点复盘。'
  },
  {
    title: '模拟试点',
    path: 'specs/ai-run-record-entry/run-record.md',
    category: 'Evaluation',
    description: '第一条 PRD 到 Run Record 的模拟执行记录。'
  },
  {
    title: '真实试点候选清单',
    path: 'specs/real-pilot-candidates.md',
    category: 'Evaluation',
    description: '2-3 个低风险真实需求候选，以及首个试点选择理由。'
  },
  {
    title: 'P2 草稿验证摘要记录',
    path: 'specs/run-record-verification-summary/run-record.md',
    category: 'Evaluation',
    description: 'Run Record 草稿新增验证摘要字段的真实试点记录。'
  },
  {
    title: 'P3 MVP 概览记录',
    path: 'specs/mvp-task-overview/run-record.md',
    category: 'Evaluation',
    description: '首页 MVP 任务完成概览的真实试点记录。'
  },
  {
    title: '试点复盘报告',
    path: 'specs/pilot-retrospective.md',
    category: 'Evaluation',
    description: 'P1、P2、P3 真实低风险试点的复盘和后续建议。'
  },
  {
    title: '推广范围与风险边界',
    path: 'specs/next-stage-rollout-boundary.md',
    category: 'Evaluation',
    description: '下一阶段可推广范围、暂不推广范围和风险处理边界。'
  },
  {
    title: '工作流数据集中维护记录',
    path: 'specs/workflow-data-registry/run-record.md',
    category: 'Evaluation',
    description: '首页工作流数据模块化和指标计算的可选增强记录。'
  },
  {
    title: '评估框架落地记录',
    path: 'specs/evaluation-framework/run-record.md',
    category: 'Evaluation',
    description: '基于 OpenAI 和 Anthropic 公开评估原则补齐工作流评估层。'
  }
];

export const planTasks: PlanTask[] = [
  { id: 'T0-1', title: '梳理 Codex/IDE 已提供能力与本项目不自研边界', status: 'Done' },
  { id: 'T0-2', title: '明确 MVP 建设范围和首个试点场景', status: 'Done' },
  { id: 'T1-1', title: '建立 .ai 工作流目录结构', status: 'Done' },
  { id: 'T1-2', title: '建立基础模板', status: 'Done' },
  { id: 'T1-3', title: '编写工作流入口说明', status: 'Done' },
  { id: 'T2-1', title: '定义 PRD 到 Spec 的生成协议', status: 'Done' },
  { id: 'T2-2', title: '定义 Spec 审查协议', status: 'Done' },
  { id: 'T2-3', title: '提供示例 Feature Spec', status: 'Done' },
  { id: 'T3-1', title: '建设项目结构上下文索引', status: 'Done' },
  { id: 'T3-2', title: '建设组件、Hook、API 索引', status: 'Done' },
  { id: 'T3-3', title: '建设常见模式与工程规范索引', status: 'Done' },
  { id: 'T4-1', title: '定义 Planner-Executor 协议', status: 'Done' },
  { id: 'T4-2', title: '定义 Planner Prompt', status: 'Done' },
  { id: 'T4-3', title: '定义 Executor Prompt', status: 'Done' },
  { id: 'T5-1', title: '整理 Skills 总索引', status: 'Done' },
  { id: 'T5-2', title: '定义 Skill 路由说明', status: 'Done' },
  { id: 'T5-3', title: '审查现有 Skills 是否覆盖计划中的缺口', status: 'Done' },
  { id: 'T5-4', title: '补齐缺失 Skill 的最小实现', status: 'Done' },
  { id: 'T6-1', title: '定义统一验证协议', status: 'Done' },
  { id: 'T6-2', title: '定义验证失败修复 Prompt', status: 'Done' },
  { id: 'T6-3', title: '补充验证记录模板', status: 'Done' },
  { id: 'T7-1', title: '建立 Run Record 与 RCA 归档目录', status: 'Done' },
  { id: 'T7-2', title: '定义 RCA 生成 Prompt', status: 'Done' },
  { id: 'T7-3', title: '完成一次模拟执行记录试点', status: 'Done' },
  { id: 'T8-1', title: '选择 2-3 个真实低风险需求', status: 'Done' },
  { id: 'T8-2', title: '为真实需求生成 Spec 与 Task List', status: 'Done' },
  { id: 'T8-3', title: '执行至少一个真实代码修改闭环', status: 'Done' },
  { id: 'T8-4', title: '产出试点复盘报告与优化清单', status: 'Done' },
  { id: 'T9-1', title: '修复 Next 15 lint 验证链路', status: 'Done' },
  { id: 'T9-2', title: '完成 P2 Run Record 草稿验证摘要试点', status: 'Done' },
  { id: 'T9-3', title: '完成 P3 首页 MVP 任务完成概览试点', status: 'Done' },
  { id: 'T9-4', title: '补齐 UI 截图验证记录', status: 'Done' },
  { id: 'T10-1', title: '补齐 P1 截图验证记录', status: 'Done' },
  { id: 'T10-2', title: '明确下一阶段推广范围和风险边界', status: 'Done' },
  { id: 'T11-1', title: '集中维护首页工作流数据', status: 'Done' },
  { id: 'T11-2', title: '用数据计算 MVP 任务和试点指标', status: 'Done' },
  { id: 'T12-1', title: '定义 AI 工作流评估指标体系和投产门槛', status: 'Done' },
  { id: 'T12-2', title: '补齐评估 Rubric 与 grader 输出格式', status: 'Done' },
  { id: 'T12-3', title: '新增 Evaluation Summary、Gate Check 和 Rubric 模板', status: 'Done' },
  { id: 'T12-4', title: '将评估层接入工作流入口、记录模板和首页索引', status: 'Done' }
];

export const pilots: Pilot[] = [
  { id: 'P1', title: '仓库资产检索支持 Evaluation 和 Skill 分类', status: 'Done' },
  { id: 'P2', title: 'Run Record 草稿增加验证摘要字段', status: 'Done' },
  { id: 'P3', title: '首页展示 MVP 任务完成概览', status: 'Done' }
];
