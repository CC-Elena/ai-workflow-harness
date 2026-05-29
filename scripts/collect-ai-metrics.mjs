#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_OUT = 'src/lib/data/quality-metrics.generated.json';

const emptyTokens = new Set(['', '-', 'n/a', 'na', 'none', '无', '否']);

const summaryLabels = {
  seatActivationRate: 'Seat activation rate',
  activeAiUserRate: 'Active AI user rate',
  workflowAdoptionRate: 'AI-assisted PR rate',
  aiAssistedDiffShare: 'AI-assisted diff share',
  aiCodeRetention30d: '30-day AI code retention',
  firstPassCiRate: 'First-pass CI pass rate',
  evidenceCompletenessRate: 'Evidence completeness rate',
  scopeDriftRate: 'Scope drift rate',
  largeManualReworkRate: 'Large manual rework rate',
  postMergeDefectRate: 'Post-merge defect rate'
};

const pullRequestLabels = {
  rawChangedLines: 'Raw changed lines',
  effectiveChangedLines: 'Effective changed lines',
  aiEffectiveDiffShare: 'AI effective diff share',
  reviewCommentsPer100EffectiveLines: 'Review comments / 100 effective lines',
  reviewRoundsPerPr: 'Review rounds / PR',
  requestedChangesRate: 'Requested changes rate',
  defectRate7d: '7-day defect rate',
  defectRate14d: '14-day defect rate',
  defectRate30d: '30-day defect rate',
  rollbackRate: 'Rollback rate',
  hotfixRate: 'Hotfix rate'
};

function readMaybe(filePath, root) {
  const fullPath = path.join(root, filePath);
  try {
    return readFileSync(fullPath, 'utf8');
  } catch {
    return '';
  }
}

function listRunRecords(root) {
  const specsDir = path.join(root, 'specs');
  let entries = [];
  try {
    entries = readdirSync(specsDir);
  } catch {
    return [];
  }

  return entries
    .map((entry) => `specs/${entry}/run-record.md`)
    .filter((filePath) => {
      try {
        return statSync(path.join(root, filePath)).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}

function clean(value) {
  return String(value || '').trim();
}

function isBlank(value) {
  return emptyTokens.has(clean(value).toLowerCase());
}

function readMeta(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`^- ${escaped}[：:]\\s*(.+)$`, 'm'));
    if (match) return clean(match[1]);
  }
  return '';
}

function readAnyMeta(text, groups) {
  const out = {};
  Object.entries(groups).forEach(([key, labels]) => {
    out[key] = readMeta(text, labels) || readTableCell(text, labels);
  });
  return out;
}

function readTableCell(text, labels) {
  const labelSet = new Set(labels.map((label) => label.toLowerCase()));
  const found = rows(text).find((cells) => labelSet.has(clean(cells[0]).toLowerCase()));
  return found ? clean(found[1]) : '';
}

function getSection(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => clean(line) === `## ${heading}`);
  if (start < 0) return '';
  const section = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) break;
    section.push(lines[index]);
  }
  return section.join('\n');
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSep(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function rows(section) {
  return section
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map(splitRow)
    .filter((cells) => cells.length > 1 && !isSep(cells))
    .slice(1);
}

function numberValue(value) {
  const text = clean(value).replace(/,/g, '');
  if (!text || isBlank(text)) return null;
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  if (!Number.isFinite(parsed)) return null;
  return /%/.test(text) ? parsed / 100 : parsed;
}

function boolValue(value) {
  const text = clean(value).toLowerCase();
  if (['yes', 'true', 'pass', 'success', '是', '有'].includes(text)) return true;
  if (['no', 'false', 'fail', 'failed', '否', '无'].includes(text)) return false;
  return null;
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((cell) => cell.trim());

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = clean(cells[index]);
    });
    return row;
  });
}

function numericField(row, key) {
  const value = row[key];
  return isBlank(value) ? null : numberValue(value);
}

function booleanField(row, key) {
  return boolValue(row[key]);
}

function metricMap(text) {
  const effect = getSection(text, '9. 效果评估') || getSection(text, '8. 效果评估');
  const map = new Map();

  rows(effect).forEach((cells) => {
    const key = clean(cells[0]);
    const value = clean(cells[1]);
    if (key && value) map.set(key.toLowerCase(), value);
  });

  effect.split('\n').forEach((line) => {
    const match = line.match(/^- ([^：:]+)[：:]\s*(.+)$/);
    if (match) map.set(clean(match[1]).toLowerCase(), clean(match[2]));
  });

  return map;
}

function pickMetric(map, names) {
  for (const name of names) {
    const value = map.get(name.toLowerCase());
    if (value) return value;
  }
  return '';
}

function parsePeriod(root, periodPath) {
  const text = periodPath ? readMaybe(periodPath, root) : '';
  const meta = readAnyMeta(text, {
    name: ['试点周期', '周期', 'Period'],
    team: ['团队', 'Team'],
    targetEngineers: ['目标研发人数', 'Target engineers'],
    assignedSeats: ['已分配席位', 'Assigned seats'],
    activeAiUsers: ['活跃 AI 用户', 'Active AI users'],
    totalPrs: ['总 PR', 'Total PRs'],
    aiAssistedPrs: ['AI-assisted PR', 'AI assisted PRs'],
    totalChangedLines: ['总变更行', 'Total changed lines'],
    aiChangedLines: ['AI 参与变更行', 'AI changed lines'],
    retainedAiLines30d: ['AI 30 天保留行', 'Retained AI lines 30d']
  });

  const nums = {};
  Object.entries(meta).forEach(([key, value]) => {
    nums[key] = ['name', 'team'].includes(key) ? value : numberValue(value);
  });

  return {
    source: periodPath || null,
    name: nums.name || null,
    team: nums.team || null,
    targetEngineers: nums.targetEngineers,
    assignedSeats: nums.assignedSeats,
    activeAiUsers: nums.activeAiUsers,
    totalPrs: nums.totalPrs,
    aiAssistedPrs: nums.aiAssistedPrs,
    totalChangedLines: nums.totalChangedLines,
    aiChangedLines: nums.aiChangedLines,
    retainedAiLines30d: nums.retainedAiLines30d
  };
}

function parseVerification(text) {
  const section = getSection(text, '7. 验证记录') || getSection(text, '6. 验证记录');
  const warnings = [];
  let pass = 0;
  let fail = 0;
  let skipped = 0;
  let skippedWithoutReason = 0;
  let incompletePass = 0;

  rows(section).forEach((cells) => {
    const [item, way, result, evidence, skippedReason] = cells;
    const rowText = cells.join(' ');
    if (/\b(pass|success)\b/i.test(result || '')) {
      pass += 1;
      if (isBlank(way) && isBlank(evidence)) {
        incompletePass += 1;
        warnings.push(`验证项缺少命令或证据: ${item}`);
      }
    }
    if (/\b(fail|failed)\b/i.test(result || '')) fail += 1;
    if (/\bskipped\b/i.test(result || '')) {
      skipped += 1;
      if (isBlank(skippedReason) && !/(原因|风险|未修改|not changed|docs only)/i.test(rowText)) {
        skippedWithoutReason += 1;
        warnings.push(`Skipped 缺少原因: ${item}`);
      }
    }
  });

  return {
    total: pass + fail + skipped,
    pass,
    fail,
    skipped,
    skippedWithoutReason,
    incompletePass,
    complete: incompletePass === 0 && skippedWithoutReason === 0,
    warnings
  };
}

function parseDiff(text) {
  const section = getSection(text, '10. 实际 Diff 覆盖表') || getSection(text, '9. 实际 Diff 覆盖表');
  const diffRows = rows(section);
  const outOfScope = diffRows.filter((cells) => /范围外|out of scope/i.test(cells.join(' '))).length;
  return { count: diffRows.length, outOfScope };
}

function parseRun(root, filePath) {
  const text = readMaybe(filePath, root);
  const meta = readAnyMeta(text, {
    tool: ['执行工具', 'Agent', 'AI tool'],
    status: ['状态', 'Status'],
    complexity: ['任务复杂度', 'Complexity'],
    date: ['执行日期', 'Date']
  });
  const map = metricMap(text);
  const verification = parseVerification(text);
  const diff = parseDiff(text);
  const manualRate = numberValue(pickMetric(map, ['人工修改率', 'Manual rework rate', 'Manual rework']));
  const firstPassRaw = pickMetric(map, ['CI first pass', 'First-pass CI', 'First pass CI']);
  const defectRaw = pickMetric(map, ['Production issue linked', 'Post-merge defect', '线上缺陷']);
  const aiRaw = pickMetric(map, ['AI assisted', 'AI-assisted']);
  const aiAssisted = boolValue(aiRaw) ?? !isBlank(meta.tool);
  const firstPassCi = boolValue(firstPassRaw);
  const postMergeDefect = boolValue(defectRaw) ?? false;
  const manualText = getSection(text, '8. 人工介入') || getSection(text, '7. 人工介入');
  const largeManualRework = (manualRate !== null && manualRate > 0.3) || /大幅|large|medium/i.test(manualText);
  const warnings = [...verification.warnings];

  if (diff.outOfScope > 0) warnings.push('存在范围外变更');
  if (largeManualRework) warnings.push('存在人工中大幅改动');
  if (postMergeDefect) warnings.push('存在合入后缺陷记录');
  if (firstPassCi === null && verification.total > 0) warnings.push('缺少 CI first pass 显式字段，使用验证记录作近似判断');

  const feature = filePath.split('/')[1] || filePath;

  return {
    feature,
    path: filePath,
    aiAssisted,
    tool: meta.tool || null,
    status: meta.status || null,
    complexity: meta.complexity || null,
    date: meta.date || null,
    verification,
    diff,
    firstPassCi: firstPassCi ?? (verification.total > 0 ? verification.fail === 0 : null),
    firstPassCiSource: firstPassCi === null ? 'verificationProxy' : 'explicit',
    evidenceComplete: verification.complete,
    scopeDrift: diff.outOfScope > 0,
    largeManualRework,
    postMergeDefect,
    warnings
  };
}

function ratio(numerator, denominator, label, reason, source = 'repoLocal', partial = false, partialNote = '部分记录缺少显式字段，已使用仓库记录近似统计') {
  if (numerator === null || numerator === undefined || denominator === null || denominator === undefined || denominator <= 0) {
    return {
      label,
      value: null,
      display: 'N/A',
      status: 'N/A',
      numerator: numerator ?? null,
      denominator: denominator ?? null,
      reason,
      source
    };
  }
  const value = numerator / denominator;
  return {
    label,
    value,
    display: `${Math.round(value * 100)}%`,
    status: partial ? 'Partial' : 'Ready',
    numerator,
    denominator,
    reason: partial ? partialNote : '',
    source
  };
}

function statNumber(value, label, reason, source = 'prExport', partial = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return {
      label,
      value: null,
      display: 'N/A',
      status: 'N/A',
      reason,
      source
    };
  }

  return {
    label,
    value,
    display: Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10),
    status: partial ? 'Partial' : 'Ready',
    reason: partial ? '部分字段缺失，已使用近似口径' : '',
    source
  };
}

function countRuns(runs, test) {
  return runs.filter((run) => run.aiAssisted && test(run)).length;
}

function parsePullExport(root, csvPath) {
  const text = csvPath ? readMaybe(csvPath, root) : '';
  const inputRows = parseCsv(text);

  return inputRows.map((row) => {
    const additions = numericField(row, 'additions');
    const deletions = numericField(row, 'deletions');
    const effectiveAdditions = numericField(row, 'effectiveAdditions');
    const effectiveDeletions = numericField(row, 'effectiveDeletions');
    const usesRawEffective = effectiveAdditions === null || effectiveDeletions === null;
    const rawChangedLines = (additions ?? 0) + (deletions ?? 0);
    const effectiveChangedLines = usesRawEffective ? rawChangedLines : effectiveAdditions + effectiveDeletions;

    return {
      number: row.number || '',
      title: row.title || '',
      mergedAt: row.mergedAt || '',
      taskType: row.taskType || 'unknown',
      riskLevel: row.riskLevel || 'unknown',
      aiAssisted: booleanField(row, 'aiAssisted') ?? false,
      additions,
      deletions,
      rawChangedLines,
      effectiveAdditions,
      effectiveDeletions,
      effectiveChangedLines,
      usesRawEffective,
      reviewComments: numericField(row, 'reviewComments'),
      reviewRounds: numericField(row, 'reviewRounds'),
      requestedChanges: numericField(row, 'requestedChanges'),
      defects7d: numericField(row, 'defects7d'),
      defects14d: numericField(row, 'defects14d'),
      defects30d: numericField(row, 'defects30d'),
      rollback: booleanField(row, 'rollback'),
      hotfix: booleanField(row, 'hotfix')
    };
  });
}

function sum(items, getter) {
  return items.reduce((total, item) => total + (getter(item) ?? 0), 0);
}

function available(items, key) {
  return items.filter((item) => item[key] !== null && item[key] !== undefined);
}

function shareByCount(items, key, label, reason) {
  const present = available(items, key);
  return ratio(
    present.filter((item) => Boolean(item[key])).length,
    present.length,
    label,
    reason,
    'prExport',
    present.length !== items.length,
    '部分 PR 字段缺失，已按可用字段统计'
  );
}

function average(items, key, label) {
  const present = available(items, key);
  return statNumber(
    present.length > 0 ? sum(present, (item) => item[key]) / present.length : null,
    label,
    `缺少 ${key} 字段`,
    'prExport',
    present.length !== items.length
  );
}

function reviewCommentsPer100(items) {
  const present = items.filter((item) => item.reviewComments !== null && item.effectiveChangedLines > 0);
  const lines = sum(present, (item) => item.effectiveChangedLines);
  const comments = sum(present, (item) => item.reviewComments);
  return statNumber(
    lines > 0 ? (comments / lines) * 100 : null,
    pullRequestLabels.reviewCommentsPer100EffectiveLines,
    '缺少 reviewComments 或 effective changed lines',
    'prExport',
    present.length !== items.length || items.some((item) => item.usesRawEffective)
  );
}

function summarizePulls(pulls) {
  const totalPrs = pulls.length;
  const aiPulls = pulls.filter((pull) => pull.aiAssisted);
  const rawChangedLines = sum(pulls, (pull) => pull.rawChangedLines);
  const effectiveChangedLines = sum(pulls, (pull) => pull.effectiveChangedLines);
  const aiRawChangedLines = sum(aiPulls, (pull) => pull.rawChangedLines);
  const aiEffectiveChangedLines = sum(aiPulls, (pull) => pull.effectiveChangedLines);
  const effectiveFallbackPrs = pulls.filter((pull) => pull.usesRawEffective).length;

  return {
    source: 'prExport',
    totalPrs,
    aiAssistedPrs: aiPulls.length,
    rawChangedLines,
    effectiveChangedLines,
    aiRawChangedLines,
    aiEffectiveChangedLines,
    effectiveFallbackPrs,
    status: totalPrs === 0 ? 'N/A' : effectiveFallbackPrs > 0 ? 'Partial' : 'Ready',
    reason: totalPrs === 0 ? '缺少 PR 导出文件' : effectiveFallbackPrs > 0 ? '部分 PR 缺少 effective 字段，已回退 raw changed lines' : ''
  };
}

function groupPulls(pulls, key) {
  const groups = {};
  pulls.forEach((pull) => {
    const groupKey = pull[key] || 'unknown';
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(pull);
  });

  return Object.fromEntries(
    Object.entries(groups).map(([groupKey, items]) => {
      const summary = summarizePulls(items);
      return [
        groupKey,
        {
          prCount: summary.totalPrs,
          aiAssistedPrs: summary.aiAssistedPrs,
          rawChangedLines: summary.rawChangedLines,
          effectiveChangedLines: summary.effectiveChangedLines,
          aiEffectiveChangedLines: summary.aiEffectiveChangedLines,
          aiEffectiveDiffShare: ratio(
            summary.aiEffectiveChangedLines,
            summary.effectiveChangedLines,
            pullRequestLabels.aiEffectiveDiffShare,
            '缺少 effective changed lines',
            'prExport',
            summary.effectiveFallbackPrs > 0,
            '部分 PR 缺少 effective 字段，已使用 raw changed lines'
          )
        }
      ];
    })
  );
}

function buildPullStats(pulls) {
  const prSummary = summarizePulls(pulls);

  return {
    prSummary,
    groups: {
      byTaskType: groupPulls(pulls, 'taskType'),
      byRiskLevel: groupPulls(pulls, 'riskLevel')
    },
    reviewQuality: {
      reviewCommentsPer100EffectiveLines: reviewCommentsPer100(pulls),
      reviewRoundsPerPr: average(pulls, 'reviewRounds', pullRequestLabels.reviewRoundsPerPr),
      requestedChangesRate: shareByCount(pulls, 'requestedChanges', pullRequestLabels.requestedChangesRate, '缺少 requestedChanges 字段')
    },
    defectWindows: {
      defectRate7d: shareByCount(pulls, 'defects7d', pullRequestLabels.defectRate7d, '缺少 defects7d 字段'),
      defectRate14d: shareByCount(pulls, 'defects14d', pullRequestLabels.defectRate14d, '缺少 defects14d 字段'),
      defectRate30d: shareByCount(pulls, 'defects30d', pullRequestLabels.defectRate30d, '缺少 defects30d 字段'),
      rollbackRate: shareByCount(pulls, 'rollback', pullRequestLabels.rollbackRate, '缺少 rollback 字段'),
      hotfixRate: shareByCount(pulls, 'hotfix', pullRequestLabels.hotfixRate, '缺少 hotfix 字段')
    }
  };
}

const sourceAdapters = {
  repoLocal: {
    listRunRecords,
    parseRun
  },
  prExport: {
    parse: parsePullExport
  }
};

export function collectAiMetrics(options = {}) {
  const root = options.repoRoot || process.cwd();
  const period = parsePeriod(root, options.periodPath || '');
  const runFiles = sourceAdapters.repoLocal.listRunRecords(root);
  const runs = runFiles.map((filePath) => sourceAdapters.repoLocal.parseRun(root, filePath));
  const pulls = sourceAdapters.prExport.parse(root, options.prExportPath || '');
  const pullStats = buildPullStats(pulls);
  const aiRuns = runs.filter((run) => run.aiAssisted);
  const aiRunCount = aiRuns.length;
  const warnings = runs.flatMap((run) => run.warnings.map((warning) => `${run.feature}: ${warning}`));
  if (pullStats.prSummary.effectiveFallbackPrs > 0) {
    warnings.push(`prExport: ${pullStats.prSummary.effectiveFallbackPrs} PR 缺少 effective 字段，已回退 raw changed lines`);
  }
  const firstPassProxy = aiRuns.some((run) => run.firstPassCiSource === 'verificationProxy');
  const workflowAdoption = period.aiAssistedPrs !== null && period.totalPrs !== null
    ? ratio(period.aiAssistedPrs, period.totalPrs, summaryLabels.workflowAdoptionRate, '缺少 AI-assisted PR 或总 PR', 'period')
    : ratio(pullStats.prSummary.aiAssistedPrs, pullStats.prSummary.totalPrs, summaryLabels.workflowAdoptionRate, '缺少 AI-assisted PR 或总 PR', 'prExport');
  const aiDiffShare = period.aiChangedLines !== null && period.totalChangedLines !== null
    ? ratio(period.aiChangedLines, period.totalChangedLines, summaryLabels.aiAssistedDiffShare, '缺少 AI 参与变更行或总变更行', 'period')
    : ratio(
        pullStats.prSummary.aiEffectiveChangedLines,
        pullStats.prSummary.effectiveChangedLines,
        summaryLabels.aiAssistedDiffShare,
        '缺少 AI 参与变更行或总变更行',
        'prExport',
        pullStats.prSummary.effectiveFallbackPrs > 0,
        '部分 PR 缺少 effective 字段，已使用 raw changed lines'
      );

  const summary = {
    seatActivationRate: ratio(period.activeAiUsers, period.assignedSeats, summaryLabels.seatActivationRate, '缺少活跃 AI 用户或已分配席位', 'period'),
    activeAiUserRate: ratio(period.activeAiUsers, period.targetEngineers, summaryLabels.activeAiUserRate, '缺少活跃 AI 用户或目标研发人数', 'period'),
    workflowAdoptionRate: workflowAdoption,
    aiAssistedDiffShare: aiDiffShare,
    aiCodeRetention30d: ratio(period.retainedAiLines30d, period.aiChangedLines, summaryLabels.aiCodeRetention30d, '缺少 30 天保留行或 AI 参与变更行', 'period'),
    firstPassCiRate: ratio(countRuns(runs, (run) => run.firstPassCi === true), aiRunCount, summaryLabels.firstPassCiRate, '缺少 AI Run Record', 'repoLocal', firstPassProxy),
    evidenceCompletenessRate: ratio(countRuns(runs, (run) => run.evidenceComplete), aiRunCount, summaryLabels.evidenceCompletenessRate, '缺少 AI Run Record'),
    scopeDriftRate: ratio(countRuns(runs, (run) => run.scopeDrift), aiRunCount, summaryLabels.scopeDriftRate, '缺少 AI Run Record'),
    largeManualReworkRate: ratio(countRuns(runs, (run) => run.largeManualRework), aiRunCount, summaryLabels.largeManualReworkRate, '缺少 AI Run Record'),
    postMergeDefectRate: ratio(countRuns(runs, (run) => run.postMergeDefect), aiRunCount, summaryLabels.postMergeDefectRate, '缺少 AI Run Record')
  };

  return {
    generatedAt: new Date().toISOString(),
    period,
    summary,
    prSummary: pullStats.prSummary,
    groups: pullStats.groups,
    reviewQuality: pullStats.reviewQuality,
    defectWindows: pullStats.defectWindows,
    runs,
    pulls,
    warnings
  };
}

function parseArgs(argv) {
  const out = { periodPath: '', prExportPath: '', write: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--period') out.periodPath = argv[index + 1] || '';
    if (arg === '--pr-export') out.prExportPath = argv[index + 1] || '';
    if (arg === '--write') out.write = true;
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const snapshot = collectAiMetrics(options);
  const json = `${JSON.stringify(snapshot, null, 2)}\n`;

  if (options.write) {
    writeFileSync(path.join(process.cwd(), DEFAULT_OUT), json);
  } else {
    process.stdout.write(json);
  }
}
