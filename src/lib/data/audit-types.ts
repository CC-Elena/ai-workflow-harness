/**
 * AI 审计视图共享类型
 *
 * 这些类型描述从 `specs/{feature}/run-record.md` 解析出的结构化审计模型，
 * 供服务层（解析器）与客户端 Review Packet 视图共同使用。
 * 本文件不依赖 node API，可安全在浏览器端引用。
 */

/** 单条验证主张的证据状态 */
export type EvidenceStatus = 'proven' | 'gap' | 'skipped' | 'failed';

/** Run 的整体风险灯 */
export type RiskLevel = 'green' | 'amber' | 'red';

/** 改动文件相对声明范围的状态 */
export type FileScope = 'in' | 'out' | 'declared';

/** 风险 / 未决项严重度 */
export type RiskSeverity = 'high' | 'medium' | 'low';

/** 一条验证主张与其证据 */
export type VerificationClaim = {
  item: string;
  method: string;
  result: string;
  evidence: string;
  note: string;
  status: EvidenceStatus;
};

/** 一个改动文件在影响面地图中的表示 */
export type ChangedFile = {
  path: string;
  note: string;
  scope: FileScope;
  reason: string;
};

/** 一条风险 / 未决项 */
export type RiskItem = {
  label: string;
  severity: RiskSeverity;
  source: string;
};

/** 一条任务结果 */
export type TaskResult = {
  id: string;
  result: string;
  files: string;
  verify: string;
  note: string;
};

/** 一条人工介入记录 */
export type Intervention = {
  type: string;
  detail: string;
  reason: string;
};

/** 审查决定（回写到 run-record 后可追责） */
export type ReviewDecision = 'approved' | 'changes' | 'rejected';

/** 已回写的审查记录 */
export type ReviewRecord = {
  decision: ReviewDecision;
  reviewer: string;
  time: string;
  note: string;
};

/** 工作区实时 Diff 对账中的一条改动 */
export type ReconciliationEntry = {
  path: string;
  covered: boolean;
  coveredBy: string[];
};

/** 汇总信号：驱动分诊列表的信号灯 */
export type RunSignals = {
  riskLevel: RiskLevel;
  evidenceProven: number;
  evidenceGap: number;
  evidenceSkipped: number;
  evidenceTotal: number;
  outOfScopeCount: number;
  humanConfirmed: boolean;
  needsRca: boolean;
};

/** 一次可审计的 AI 执行记录 */
export type AuditRun = {
  feature: string;
  path: string;
  title: string;
  tool: string;
  owner: string;
  date: string;
  status: string;
  summary: string;
  tasks: TaskResult[];
  changedFiles: ChangedFile[];
  claims: VerificationClaim[];
  risks: RiskItem[];
  interventions: Intervention[];
  signals: RunSignals;
  review?: ReviewRecord;
};
