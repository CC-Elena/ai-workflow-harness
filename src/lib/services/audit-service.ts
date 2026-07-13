import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

import type {
  AuditRun,
  ChangedFile,
  EvidenceStatus,
  Intervention,
  ReconciliationEntry,
  ReviewDecision,
  ReviewRecord,
  RiskItem,
  RiskLevel,
  RunSignals,
  TaskResult,
  VerificationClaim
} from '../data/audit-types';

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const specsDir = path.join(repoRoot, 'specs');

/** 读取指定标题（按关键词匹配 `## N. xxx关键词`）下的正文，直到下一个 `## ` 为止。 */
function getSection(markdown: string, keyword: string): string {
  const lines = markdown.split('\n');
  const start = lines.findIndex(
    (line) => /^##\s/.test(line) && line.includes(keyword)
  );
  if (start === -1) return '';

  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ')) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

/** 读取形如 `- 标签：值` 的元数据。 */
function getMetadata(markdown: string, label: string): string {
  const pattern = new RegExp(`^-\\s*${label}[：:]\\s*(.+)$`, 'm');
  return markdown.match(pattern)?.[1].trim() ?? '';
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

/** 解析 Markdown 表格，返回 { header, rows }。 */
function parseTable(section: string): { header: string[]; rows: string[][] } {
  const tableLines = section
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map(splitRow)
    .filter((cells) => cells.length > 1 && !isSeparator(cells));

  if (tableLines.length === 0) return { header: [], rows: [] };
  return { header: tableLines[0], rows: tableLines.slice(1) };
}

function extractPaths(text: string): string[] {
  const paths: string[] = [];
  const pattern = /`([^`]+)`/g;
  let match = pattern.exec(text);
  while (match) {
    paths.push(match[1].trim());
    match = pattern.exec(text);
  }
  return paths;
}

function isBlank(value: string): boolean {
  return !value || /^(n\/a|none|无|-)$/i.test(value.trim());
}

function findColumn(header: string[], ...keywords: string[]): number {
  return header.findIndex((cell) => keywords.some((kw) => cell.includes(kw)));
}

/** 判断一条验证主张的证据状态。 */
function classifyEvidence(result: string, method: string, evidence: string): EvidenceStatus {
  const r = result.toLowerCase();
  if (/fail/.test(r) || result.includes('失败')) return 'failed';
  if (/skip/.test(r) || result.includes('跳过') || (isBlank(result) && isBlank(method))) {
    return 'skipped';
  }

  const hasCommand = /`[^`]+`/.test(method);
  const evidencePaths = extractPaths(evidence).filter((p) => !isBlank(p));
  if (hasCommand || evidencePaths.length > 0) return 'proven';

  return 'gap';
}

function parseTasks(markdown: string): TaskResult[] {
  const { header, rows } = parseTable(getSection(markdown, '任务结果'));
  if (rows.length === 0) return [];

  const idIdx = 0;
  const resultIdx = findColumn(header, '结果') >= 0 ? findColumn(header, '结果') : 1;
  const filesIdx = findColumn(header, '修改文件', '文件') >= 0 ? findColumn(header, '修改文件', '文件') : 2;
  const verifyIdx = findColumn(header, '验证') >= 0 ? findColumn(header, '验证') : 3;
  const noteIdx = findColumn(header, '备注', '说明');

  return rows.map((cells) => ({
    id: cells[idIdx] ?? '',
    result: cells[resultIdx] ?? '',
    files: cells[filesIdx] ?? '',
    verify: cells[verifyIdx] ?? '',
    note: noteIdx >= 0 ? cells[noteIdx] ?? '' : ''
  }));
}

function parseClaims(markdown: string): VerificationClaim[] {
  const { header, rows } = parseTable(getSection(markdown, '验证记录'));
  if (rows.length === 0) return [];

  const methodIdx = findColumn(header, '命令', '方式') >= 0 ? findColumn(header, '命令', '方式') : 1;
  const resultIdx = findColumn(header, '结果') >= 0 ? findColumn(header, '结果') : 2;
  const evidenceIdx = findColumn(header, '证据');
  const noteIdx = findColumn(header, '跳过', '风险', '说明', '备注');

  return rows.map((cells) => {
    const item = cells[0] ?? '';
    const method = cells[methodIdx] ?? '';
    const result = cells[resultIdx] ?? '';
    const evidence = evidenceIdx >= 0 ? cells[evidenceIdx] ?? '' : '';
    const note = noteIdx >= 0 ? cells[noteIdx] ?? '' : '';
    return {
      item,
      method,
      result,
      evidence,
      note,
      status: classifyEvidence(result, method, evidence)
    };
  });
}

/** 合并「修改文件」表和「实际 Diff 覆盖表」，得到影响面地图。 */
function parseChangedFiles(markdown: string): ChangedFile[] {
  const declared = new Map<string, string>();
  const changedTable = parseTable(getSection(markdown, '修改文件'));
  changedTable.rows.forEach((cells) => {
    const filePath = extractPaths(cells[0] ?? '')[0] ?? '';
    if (filePath) declared.set(filePath, cells[1] ?? '');
  });

  const files = new Map<string, ChangedFile>();
  declared.forEach((note, filePath) => {
    files.set(filePath, { path: filePath, note, scope: 'declared', reason: '' });
  });

  const diffTable = parseTable(getSection(markdown, 'Diff 覆盖表'));
  const scopeIdx = findColumn(diffTable.header, '范围');
  const reasonIdx = findColumn(diffTable.header, '确认原因', '原因');
  diffTable.rows.forEach((cells) => {
    const filePath = extractPaths(cells[0] ?? '')[0] ?? '';
    if (!filePath) return;
    const scopeText = scopeIdx >= 0 ? cells[scopeIdx] ?? '' : '';
    const reason = reasonIdx >= 0 ? cells[reasonIdx] ?? '' : '';
    const scope: ChangedFile['scope'] = scopeText.includes('范围外') ? 'out' : 'in';
    const existing = files.get(filePath);
    if (existing) {
      existing.scope = scope;
      existing.reason = reason;
    } else {
      files.set(filePath, { path: filePath, note: '', scope, reason });
    }
  });

  return Array.from(files.values());
}

function parseInterventions(markdown: string): Intervention[] {
  const { rows } = parseTable(getSection(markdown, '人工介入'));
  return rows
    .map((cells) => ({
      type: cells[0] ?? '',
      detail: cells[1] ?? '',
      reason: cells[2] ?? ''
    }))
    .filter((row) => row.type || row.detail);
}

function needsRcaFromEval(markdown: string): boolean {
  const section = getSection(markdown, '效果评估');
  return /是否需要\s*RCA[：:]\s*是/.test(section);
}

const REVIEW_HEADING = '## 审查决定（AI 审计台）';

const reviewDecisionLabel: Record<ReviewDecision, string> = {
  approved: '批准边界',
  changes: '要求补证据',
  rejected: '打回'
};

/** 从 run-record 解析已回写的审查决定（若存在）。 */
function parseReview(markdown: string): ReviewRecord | undefined {
  const decision = getMetadata(markdown, '决定');
  const reviewer = getMetadata(markdown, '审查人');
  const time = getMetadata(markdown, '审查时间');
  const note = getMetadata(markdown, '审查备注');
  if (!markdown.includes(REVIEW_HEADING) || !decision) return undefined;

  const normalized = (Object.keys(reviewDecisionLabel) as ReviewDecision[]).find(
    (key) => reviewDecisionLabel[key] === decision || key === decision
  );
  if (!normalized) return undefined;

  return { decision: normalized, reviewer: reviewer || '未署名', time, note };
}

function buildRisks(
  claims: VerificationClaim[],
  changedFiles: ChangedFile[],
  status: string,
  needsRca: boolean
): RiskItem[] {
  const risks: RiskItem[] = [];

  if (/(fail|失败|partial)/i.test(status)) {
    risks.push({ label: `Run 状态为 ${status}`, severity: 'high', source: '基本信息' });
  }

  claims.forEach((claim) => {
    if (claim.status === 'failed') {
      risks.push({ label: `验证失败：${claim.item}`, severity: 'high', source: '验证记录' });
    } else if (claim.status === 'gap') {
      risks.push({ label: `主张缺证据：${claim.item}（${claim.method || '无命令'}）`, severity: 'high', source: '验证记录' });
    } else if (claim.status === 'skipped') {
      const reason = claim.note || claim.evidence;
      risks.push({
        label: `跳过验证：${claim.item}${reason ? `（${reason}）` : ''}`,
        severity: 'low',
        source: '验证记录'
      });
    }
  });

  changedFiles
    .filter((file) => file.scope === 'out')
    .forEach((file) => {
      risks.push({
        label: `范围外改动：${file.path}${file.reason ? `（已确认：${file.reason}）` : '（未说明）'}`,
        severity: file.reason ? 'medium' : 'high',
        source: 'Diff 覆盖表'
      });
    });

  if (needsRca) {
    risks.push({ label: '本次执行标记为需要 RCA', severity: 'high', source: '效果评估' });
  }

  return risks;
}

function computeSignals(
  claims: VerificationClaim[],
  changedFiles: ChangedFile[],
  interventions: Intervention[],
  status: string,
  needsRca: boolean
): RunSignals {
  const evidenceProven = claims.filter((c) => c.status === 'proven').length;
  const evidenceGap = claims.filter((c) => c.status === 'gap').length;
  const evidenceSkipped = claims.filter((c) => c.status === 'skipped').length;
  const evidenceFailed = claims.filter((c) => c.status === 'failed').length;
  const outOfScopeCount = changedFiles.filter((f) => f.scope === 'out').length;
  const humanConfirmed = interventions.length > 0;
  const statusBad = /(fail|失败|partial)/i.test(status);

  let riskLevel: RiskLevel = 'green';
  if (statusBad || evidenceGap > 0 || evidenceFailed > 0 || needsRca) {
    riskLevel = 'red';
  } else if (outOfScopeCount > 0 || evidenceSkipped > 0 || !humanConfirmed) {
    riskLevel = 'amber';
  }

  return {
    riskLevel,
    evidenceProven,
    evidenceGap,
    evidenceSkipped,
    evidenceTotal: claims.length,
    outOfScopeCount,
    humanConfirmed,
    needsRca
  };
}

/** 将一份 run-record.md 解析为结构化审计模型。 */
export function parseRunRecord(feature: string, markdown: string): AuditRun {
  const status = getMetadata(markdown, '状态') || 'Unknown';
  const tasks = parseTasks(markdown);
  const claims = parseClaims(markdown);
  const changedFiles = parseChangedFiles(markdown);
  const interventions = parseInterventions(markdown);
  const needsRca = needsRcaFromEval(markdown);

  return {
    feature,
    path: `specs/${feature}/run-record.md`,
    title: getMetadata(markdown, '需求名称') || feature,
    tool: getMetadata(markdown, '执行工具') || '未知',
    owner: getMetadata(markdown, '执行人') || '未知',
    date: getMetadata(markdown, '执行日期') || '',
    status,
    summary: getSection(markdown, '执行摘要').trim().split('\n').filter(Boolean)[0] ?? '',
    tasks,
    changedFiles,
    claims,
    risks: buildRisks(claims, changedFiles, status, needsRca),
    interventions,
    signals: computeSignals(claims, changedFiles, interventions, status, needsRca),
    review: parseReview(markdown)
  };
}

const riskWeight: Record<RiskLevel, number> = { red: 0, amber: 1, green: 2 };

/** 扫描 specs 目录下所有 run-record.md，返回按风险优先排序的审计模型列表。 */
export async function loadAuditRuns(): Promise<AuditRun[]> {
  let entries: string[] = [];
  try {
    const dirents = await readdir(specsDir, { withFileTypes: true });
    entries = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }

  const runs: AuditRun[] = [];
  await Promise.all(
    entries.map(async (feature) => {
      const filePath = path.join(specsDir, feature, 'run-record.md');
      try {
        const markdown = await readFile(filePath, 'utf8');
        runs.push(parseRunRecord(feature, markdown));
      } catch {
        // 该 feature 没有 run-record，跳过。
      }
    })
  );

  return runs.sort((a, b) => {
    const byRisk = riskWeight[a.signals.riskLevel] - riskWeight[b.signals.riskLevel];
    if (byRisk !== 0) return byRisk;
    return a.title.localeCompare(b.title);
  });
}

/** 读取工作区当前未提交的改动文件（已跟踪 + 未跟踪）。 */
async function getWorkingTreeChanges(): Promise<string[]> {
  try {
    const [tracked, untracked] = await Promise.all([
      execFileAsync('git', ['-c', 'core.quotePath=false', 'diff', '--name-only'], { cwd: repoRoot }),
      execFileAsync('git', ['-c', 'core.quotePath=false', 'ls-files', '--others', '--exclude-standard'], {
        cwd: repoRoot
      })
    ]);
    const lines = `${tracked.stdout}\n${untracked.stdout}`
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    return Array.from(new Set(lines)).sort();
  } catch {
    return [];
  }
}

/**
 * 用真实 git diff 做工作区对账：列出当前每个未提交改动，
 * 并判断它是否已被某个 Run 的声明覆盖。未被覆盖 = 未披露漂移。
 */
export async function loadReconciliation(runs: AuditRun[]): Promise<ReconciliationEntry[]> {
  const changes = await getWorkingTreeChanges();
  const coverage = new Map<string, string[]>();
  runs.forEach((run) => {
    run.changedFiles.forEach((file) => {
      const owners = coverage.get(file.path) ?? [];
      owners.push(run.feature);
      coverage.set(file.path, owners);
    });
  });

  return changes.map((filePath) => {
    const coveredBy = coverage.get(filePath) ?? [];
    return { path: filePath, covered: coveredBy.length > 0, coveredBy };
  });
}

const textExtensions = new Set([
  '.md',
  '.log',
  '.txt',
  '.json',
  '.csv',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.css',
  '.yml',
  '.yaml'
]);

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

const imageContentType: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

/** 校验请求路径必须落在 specs/ 目录内，防止路径穿越。 */
function resolveEvidencePath(requestedPath: string): string {
  const normalized = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const absolute = path.resolve(repoRoot, normalized);
  const specsRoot = path.resolve(specsDir);
  if (absolute !== specsRoot && !absolute.startsWith(specsRoot + path.sep)) {
    throw new Error('Evidence path not allowed');
  }
  return absolute;
}

export type EvidenceResult =
  | { kind: 'text'; path: string; content: string; size: number }
  | { kind: 'image'; path: string; contentType: string; data: Buffer }
  | { kind: 'unsupported'; path: string };

/** 安全读取 specs/ 下的证据文件（文本或图片）。 */
export async function readEvidence(requestedPath: string): Promise<EvidenceResult> {
  const absolute = resolveEvidencePath(requestedPath);
  const ext = path.extname(absolute).toLowerCase();

  if (textExtensions.has(ext)) {
    const content = await readFile(absolute, 'utf8');
    return { kind: 'text', path: requestedPath, content, size: Buffer.byteLength(content, 'utf8') };
  }

  if (imageExtensions.has(ext)) {
    const data = await readFile(absolute);
    return { kind: 'image', path: requestedPath, contentType: imageContentType[ext], data };
  }

  return { kind: 'unsupported', path: requestedPath };
}

/**
 * 将审查决定回写到 run-record.md 的「审查决定」小节，可追责。
 * 幂等：已存在该小节则整体替换，否则追加到文件末尾。
 */
export async function writeReview(
  feature: string,
  review: { decision: ReviewDecision; reviewer: string; note: string }
): Promise<ReviewRecord> {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(feature)) {
    throw new Error('Invalid feature name');
  }
  const filePath = path.join(specsDir, feature, 'run-record.md');
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(specsDir) + path.sep)) {
    throw new Error('Run record path not allowed');
  }

  const decisionText = reviewDecisionLabel[review.decision];
  const reviewer = review.reviewer.trim() || '未署名';
  const note = review.note.trim() || '无';
  const time = new Date().toISOString();

  const block = [
    REVIEW_HEADING,
    '',
    `- 决定：${decisionText}`,
    `- 审查人：${reviewer}`,
    `- 审查时间：${time}`,
    `- 审查备注：${note}`,
    ''
  ].join('\n');

  const original = await readFile(resolved, 'utf8');
  const headingIndex = original.indexOf(REVIEW_HEADING);
  let next: string;
  if (headingIndex === -1) {
    next = `${original.trimEnd()}\n\n${block}\n`;
  } else {
    const before = original.slice(0, headingIndex).trimEnd();
    const rest = original.slice(headingIndex + REVIEW_HEADING.length);
    const nextHeadingOffset = rest.indexOf('\n## ');
    const after = nextHeadingOffset === -1 ? '' : rest.slice(nextHeadingOffset).trimStart();
    next = `${before}\n\n${block}\n${after ? `\n${after}` : ''}`.trimEnd() + '\n';
  }

  await writeFile(resolved, next, 'utf8');
  return { decision: review.decision, reviewer, time, note };
}
