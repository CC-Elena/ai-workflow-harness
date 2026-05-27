#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const args = process.argv.slice(2);
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function exists(filePath) {
  return fs.existsSync(path.join(repoRoot, filePath));
}

function usage() {
  console.error(`用法：
  npm run harness:check -- specs/{feature}
  npm run harness:check -- --changed --base <baseRef> --head <headRef>`);
}

function parseArgs(argv) {
  if (argv.includes('--changed')) {
    const baseIndex = argv.indexOf('--base');
    const headIndex = argv.indexOf('--head');
    const base = baseIndex >= 0 ? argv[baseIndex + 1] : '';
    const head = headIndex >= 0 ? argv[headIndex + 1] : '';

    if (!base || !head) {
      usage();
      process.exit(2);
    }

    return { mode: 'changed', base, head };
  }

  const featureArg = argv[0];
  if (!featureArg) {
    usage();
    process.exit(2);
  }

  return { mode: 'feature', featureDir: featureArg.replace(/\/$/, '') };
}

function runGit(argsForGit) {
  return execFileSync('git', ['-c', 'core.quotePath=false', ...argsForGit], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

function splitFileList(output) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueSorted(files) {
  return Array.from(new Set(files)).sort();
}

function listWorkingTreeChangedFiles() {
  const tracked = splitFileList(runGit(['diff', '--name-only']));
  const untracked = splitFileList(runGit(['ls-files', '--others', '--exclude-standard']));

  return uniqueSorted([...tracked, ...untracked]);
}

function listRefChangedFiles(base, head) {
  return uniqueSorted(splitFileList(runGit(['diff', '--name-only', `${base}...${head}`])));
}

function getMetadata(markdown, label) {
  const pattern = new RegExp(`^- ${label}[：:]\\s*(.+)$`, 'm');
  return markdown.match(pattern)?.[1].trim() || '';
}

function getSection(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return '';

  const sectionLines = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) break;
    sectionLines.push(lines[index]);
  }

  return sectionLines.join('\n');
}

function hasHeading(markdown, heading) {
  return markdown.split('\n').some((line) => line.trim() === `## ${heading}`);
}

function requireHeadings(markdown, filePath, headings) {
  headings.forEach((heading) => {
    if (!hasHeading(markdown, heading)) {
      fail(`${filePath} 缺少必需的章节: ## ${heading}`);
    }
  });
}

function requireOneHeading(markdown, filePath, headings, label) {
  if (!headings.some((heading) => hasHeading(markdown, heading))) {
    fail(`${filePath} 缺少必需的章节: ${label}`);
  }
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTableRows(section) {
  return section
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map(splitTableRow)
    .filter((cells) => cells.length > 1 && !isSeparatorRow(cells))
    .slice(1);
}

function extractBacktickPaths(text) {
  const paths = [];
  const pattern = /`([^`]+)`/g;
  let match = pattern.exec(text);

  while (match) {
    paths.push(match[1].trim());
    match = pattern.exec(text);
  }

  return paths;
}

function hasExistingPathReference(text, featureDir) {
  return extractBacktickPaths(text).some((ref) => evidencePathExists(ref, featureDir));
}

function evidencePathExists(reference, featureDir) {
  if (!reference || /^(n\/a|none|无)$/i.test(reference)) return false;

  const candidates = [];
  if (
    reference.startsWith(featureDir) ||
    reference.startsWith('.ai/') ||
    reference.startsWith('app/') ||
    reference.startsWith('scripts/') ||
    reference.startsWith('src/') ||
    reference.startsWith('docs/') ||
    reference.startsWith('.github/')
  ) {
    candidates.push(reference);
  } else {
    candidates.push(path.join(featureDir, reference));
    candidates.push(path.join(featureDir, 'evidence', reference));
    candidates.push(reference);
  }

  return candidates.some(exists);
}

function featureDirFromChangedFile(filePath) {
  const match = filePath.match(/^specs\/([^/]+)\//);
  return match ? `specs/${match[1]}` : '';
}

function findChangedFeatureDirs(changedFiles) {
  return uniqueSorted(changedFiles.map(featureDirFromChangedFile).filter(Boolean));
}

function getCoveredFiles(runRecord) {
  const diffRows = parseTableRows(getSection(runRecord, '10. 实际 Diff 覆盖表'));
  const coveredFiles = new Map();

  diffRows.forEach((cells) => {
    const filePath = extractBacktickPaths(cells[0] || '')[0];
    if (filePath) {
      coveredFiles.set(filePath, cells);
    }
  });

  return coveredFiles;
}

function checkCoveredChangedFiles(changedFiles, coveredFiles) {
  changedFiles.forEach((filePath) => {
    const row = coveredFiles.get(filePath);
    if (!row) {
      fail(`已更改的文件未包含在 run-record 的 Diff 覆盖表中: ${filePath}`);
      return;
    }

    const scope = row[1] || '';
    const reason = row[2] || '';
    if (/范围外|Out of scope/i.test(scope) && /^(n\/a|none|无|-)?$/i.test(reason)) {
      fail(`范围外的文件缺乏确认原因: ${filePath}`);
    }
  });
}

function validateFeatureRun(featureDir, options = {}) {
  const specPath = path.join(featureDir, 'spec.md');
  const miniSpecPath = path.join(featureDir, 'mini-spec.md');
  const tasksPath = path.join(featureDir, 'tasks.md');
  const runRecordPath = path.join(featureDir, 'run-record.md');
  const evaluationPath = path.join(featureDir, 'evaluation-summary.md');
  const verificationRecordPath = path.join(featureDir, 'verification-record.md');

  if (!exists(runRecordPath)) fail(`缺少必需的文件: ${runRecordPath}`);

  let runRecord = '';
  let spec = '';
  let miniSpec = '';
  let tasks = '';
  let evaluation = '';

  if (exists(runRecordPath)) {
    runRecord = readText(runRecordPath);
  }

  const explicitWorkflowMode =
    getMetadata(runRecord, '工作模式') ||
    getMetadata(runRecord, '流程模式') ||
    getMetadata(runRecord, 'Work Mode') ||
    getMetadata(runRecord, 'Workflow Mode');
  const workflowMode = explicitWorkflowMode || (exists(specPath) ? 'Full Spec' : exists(miniSpecPath) ? 'Mini Spec' : 'Lightweight');
  const isFullSpecRun = /Full Spec|\/spec/i.test(workflowMode);
  const isMiniSpecRun = /Mini Spec|\/mini-spec/i.test(workflowMode);
  const isLightweightRun = /Lightweight|轻量/i.test(workflowMode);

  if (isFullSpecRun && !exists(specPath)) fail(`Full Spec 运行需要 spec 文件: ${specPath}`);
  if (isMiniSpecRun && !exists(miniSpecPath)) fail(`Mini Spec 运行需要 mini-spec 文件: ${miniSpecPath}`);

  if (exists(specPath)) {
    spec = readText(specPath);
    requireHeadings(spec, specPath, [
      '1. 基本信息',
      '2. 背景与目标',
      '3. 范围',
      '11. 验收标准',
      '12. 风险与待确认问题'
    ]);
  }

  if (exists(miniSpecPath)) {
    miniSpec = readText(miniSpecPath);
    requireOneHeading(miniSpec, miniSpecPath, ['1. 基本信息', '基本信息'], '基本信息');
    requireOneHeading(miniSpec, miniSpecPath, ['2. 目标与范围', '背景与目标', '目标'], '目标与范围');
    requireOneHeading(miniSpec, miniSpecPath, ['3. 验收标准', '验收标准'], '验收标准');
  }

  if (runRecord) {
    requireHeadings(runRecord, runRecordPath, [
      '1. 基本信息',
      '2. 输入',
      '4. 执行摘要',
      '5. 任务结果'
    ]);
    requireOneHeading(runRecord, runRecordPath, ['6. 验证记录', '7. 验证记录'], '验证记录');
  }

  const complexity = getMetadata(runRecord, '任务复杂度');
  const status = getMetadata(runRecord, '状态');
  const diffCoverageMode = getMetadata(runRecord, 'Diff 覆盖模式');
  const needsExtendedArtifacts = /^(Medium|Large|Risky|Failure)$/i.test(complexity);
  const needsFullArtifacts = isFullSpecRun || (/^(Large|Risky|Failure)$/i.test(complexity) && !isLightweightRun);
  const needsRca =
    /^(Partial|Failed)$/i.test(status) || /^Failure$/i.test(complexity) || /是否需要 RCA[：:]\s*是/.test(runRecord);

  if (needsFullArtifacts) {
    if (!exists(tasksPath)) fail(`Medium/Large/Risky 运行需要 tasks 文件: ${tasksPath}`);
    if (!exists(evaluationPath)) {
      fail(`Medium/Large/Risky 运行需要评估总结 (evaluation summary): ${evaluationPath}`);
    }
    if (/^(Medium|Large|Risky)$/i.test(complexity) && !exists(verificationRecordPath)) {
      fail(`Medium/Large/Risky 运行需要验证记录 (verification record): ${verificationRecordPath}`);
    }
  }

  if (needsExtendedArtifacts && !needsFullArtifacts && !exists(verificationRecordPath)) {
    const hasInlineVerification =
      getSection(runRecord, '7. 验证记录').trim() || getSection(runRecord, '6. 验证记录').trim();
    if (!hasInlineVerification) {
      fail(`Medium 轻量级/mini-spec 运行需要内联验证或验证记录文件: ${verificationRecordPath}`);
    }
  }

  if (exists(tasksPath)) {
    tasks = readText(tasksPath);
    if (!hasHeading(tasks, '1. 任务列表') && !/\|\s*ID\s*\|\s*任务\s*\|/.test(tasks)) {
      fail(`${tasksPath} 缺少任务表或章节: ## 1. 任务列表`);
    }
    if (/\|\s*Pending\s*\|/.test(tasks) && /^Success$/i.test(status)) {
      fail('run-record 状态为 Success，但 tasks.md 中仍包含 Pending 的任务行.');
    }
  }

  if (exists(evaluationPath)) {
    evaluation = readText(evaluationPath);
    requireHeadings(evaluation, evaluationPath, ['1. 基本信息', '2. 阻断项检查']);
    requireOneHeading(evaluation, evaluationPath, ['4. 总分', '4. 结论', '6. 结论'], '结论或总分');

    const hasScoreSection = hasHeading(evaluation, '3. 总分') || hasHeading(evaluation, '3. 分项评分');
    if (!hasScoreSection) {
      fail(`${evaluationPath} 缺少必需的评分章节: ## 3. 总分 or ## 3. 分项评分`);
    }

    const blockerRows = parseTableRows(getSection(evaluation, '2. 阻断项检查'));
    if (blockerRows.length === 0) {
      fail(`${evaluationPath} 没有阻断项检查行.`);
    }
  }

  if (needsRca) {
    const rcaReferences = extractBacktickPaths(runRecord).filter((ref) => /(^|\/)rca\.md$/i.test(ref));
    if (rcaReferences.length === 0) {
      fail('Failed/Partial/Failure 运行需要在 run-record.md 中引用 RCA 文件。');
    }
    rcaReferences.forEach((ref) => {
      if (!evidencePathExists(ref, featureDir)) {
        fail(`RCA 引用不存在: ${ref}`);
      }
    });
  }

  const coveredFiles = runRecord ? getCoveredFiles(runRecord) : new Map();

  if (runRecord) {
    const verificationSection = getSection(runRecord, '7. 验证记录') || getSection(runRecord, '6. 验证记录');
    const verificationRows = parseTableRows(verificationSection);
    verificationRows.forEach((cells) => {
      const [item, command, result, evidence, skippedReason] = cells;
      const isSuccess = /\b(Pass|Success)\b/i.test(result || '');
      const isSkipped = /\bSkipped\b/i.test(result || '');

      if (isSuccess) {
        const hasCommand = command && !/^(n\/a|none|无|-)?$/i.test(command);
        const refs = extractBacktickPaths(evidence || '');
        const hasEvidence = refs.length > 0 && refs.every((ref) => evidencePathExists(ref, featureDir));

        if (!hasCommand && !hasEvidence) {
          fail(`验证项 "${item}" is ${result} 但没有命令或现有证据文件.`);
        }

        if (refs.some((ref) => !evidencePathExists(ref, featureDir))) {
          fail(`验证项 "${item}" 引用了缺失的证据文件: ${refs.join(', ')}`);
        }
      }

      if (isSkipped && (!skippedReason || /^(n\/a|none|无|-)?$/i.test(skippedReason))) {
        fail(`验证项 "${item}" 状态为 Skipped，但没有提供跳过原因或风险.`);
      }
    });

    const summarySection = getSection(runRecord, '4. 执行摘要');
    if (!summarySection.trim()) {
      fail('run-record.md 的执行摘要为空.');
    }

    const evidenceRows = parseTableRows(getSection(runRecord, '11. 证据文件表'));
    evidenceRows.forEach((cells) => {
      const evidenceRef = extractBacktickPaths(cells.join(' '))[0];
      if (evidenceRef && !evidencePathExists(evidenceRef, featureDir)) {
        fail(`证据表引用了缺失的文件: ${evidenceRef}`);
      }
    });

    const changedFiles = options.changedFiles || listWorkingTreeChangedFiles();
    const scopedChangedFiles =
      options.mode === 'changed' || !/^Feature scope$/i.test(diffCoverageMode)
        ? changedFiles
        : changedFiles.filter((filePath) => filePath.startsWith(`${featureDir}/`));

    if (options.checkDiffCoverage !== false) {
      checkCoveredChangedFiles(scopedChangedFiles, coveredFiles);
    }

    if (/^Success$/i.test(status) && exists(evaluationPath) && !hasExistingPathReference(runRecord, featureDir)) {
      fail('成功的运行应该至少引用一个现有的证据或关联的制品.');
    }
  }

  return { featureDir, coveredFiles };
}

function validateChangedRun(base, head) {
  const changedFiles = listRefChangedFiles(base, head);
  if (changedFiles.length === 0) {
    console.log(`Harness 更改文件检查已通过： ${base}...${head}: 无更改文件`);
    return false;
  }

  const featureDirs = findChangedFeatureDirs(changedFiles);
  if (featureDirs.length === 0) {
    fail(
      'Changed-file 模式要求至少更改一个 specs/{feature}/run-record.md，以便 PR 文件能映射到 Run Record.'
    );
    changedFiles.forEach((filePath) => fail(`已更改的文件没有候选的 Run Record: ${filePath}`));
    return;
  }

  const aggregateCoverage = new Map();
  featureDirs.forEach((featureDir) => {
    const result = validateFeatureRun(featureDir, {
      changedFiles,
      checkDiffCoverage: false,
      mode: 'changed'
    });

    result.coveredFiles.forEach((row, filePath) => {
      if (!aggregateCoverage.has(filePath)) {
        aggregateCoverage.set(filePath, row);
      }
    });
  });

  checkCoveredChangedFiles(changedFiles, aggregateCoverage);
  return true;
}

const parsedArgs = parseArgs(args);
let checkedChangedFiles = false;
if (parsedArgs.mode === 'changed') {
  checkedChangedFiles = validateChangedRun(parsedArgs.base, parsedArgs.head);
} else {
  validateFeatureRun(parsedArgs.featureDir);
}

if (failures.length > 0) {
  console.error('Harness 检查失败:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

if (parsedArgs.mode === 'changed') {
  if (checkedChangedFiles) {
    console.log(`Harness 更改文件检查已通过： ${parsedArgs.base}...${parsedArgs.head}`);
  }
} else {
  console.log(`Harness 检查已通过： ${parsedArgs.featureDir}`);
}
