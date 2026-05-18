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
  console.error(`Usage:
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
      fail(`${filePath} is missing required section: ## ${heading}`);
    }
  });
}

function requireOneHeading(markdown, filePath, headings, label) {
  if (!headings.some((heading) => hasHeading(markdown, heading))) {
    fail(`${filePath} is missing required section: ${label}`);
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
      fail(`Changed file is not covered by run-record diff table: ${filePath}`);
      return;
    }

    const scope = row[1] || '';
    const reason = row[2] || '';
    if (/范围外|Out of scope/i.test(scope) && /^(n\/a|none|无|-)?$/i.test(reason)) {
      fail(`Out-of-scope file lacks confirmation reason: ${filePath}`);
    }
  });
}

function validateFeatureRun(featureDir, options = {}) {
  const specPath = path.join(featureDir, 'spec.md');
  const tasksPath = path.join(featureDir, 'tasks.md');
  const runRecordPath = path.join(featureDir, 'run-record.md');
  const evaluationPath = path.join(featureDir, 'evaluation-summary.md');
  const verificationRecordPath = path.join(featureDir, 'verification-record.md');

  if (!exists(specPath)) fail(`Missing required file: ${specPath}`);
  if (!exists(runRecordPath)) fail(`Missing required file: ${runRecordPath}`);

  let runRecord = '';
  let spec = '';
  let tasks = '';
  let evaluation = '';

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

  if (exists(runRecordPath)) {
    runRecord = readText(runRecordPath);
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
  const needsRca =
    /^(Partial|Failed)$/i.test(status) || /^Failure$/i.test(complexity) || /是否需要 RCA[：:]\s*是/.test(runRecord);

  if (needsExtendedArtifacts) {
    if (!exists(tasksPath)) fail(`Medium/Large/Risky run requires tasks file: ${tasksPath}`);
    if (!exists(evaluationPath)) {
      fail(`Medium/Large/Risky run requires evaluation summary: ${evaluationPath}`);
    }
    if (/^(Medium|Large|Risky)$/i.test(complexity) && !exists(verificationRecordPath)) {
      fail(`Medium/Large/Risky run requires verification record: ${verificationRecordPath}`);
    }
  }

  if (exists(tasksPath)) {
    tasks = readText(tasksPath);
    if (!hasHeading(tasks, '1. 任务列表') && !/\|\s*ID\s*\|\s*任务\s*\|/.test(tasks)) {
      fail(`${tasksPath} is missing a task table or section: ## 1. 任务列表`);
    }
    if (/\|\s*Pending\s*\|/.test(tasks) && /^Success$/i.test(status)) {
      fail('tasks.md still contains Pending rows while run-record status is Success.');
    }
  }

  if (exists(evaluationPath)) {
    evaluation = readText(evaluationPath);
    requireHeadings(evaluation, evaluationPath, ['1. 基本信息', '2. 阻断项检查']);
    requireOneHeading(evaluation, evaluationPath, ['4. 总分', '4. 结论', '6. 结论'], '结论或总分');

    const hasScoreSection = hasHeading(evaluation, '3. 总分') || hasHeading(evaluation, '3. 分项评分');
    if (!hasScoreSection) {
      fail(`${evaluationPath} is missing required score section: ## 3. 总分 or ## 3. 分项评分`);
    }

    const blockerRows = parseTableRows(getSection(evaluation, '2. 阻断项检查'));
    if (blockerRows.length === 0) {
      fail(`${evaluationPath} has no blocker check rows.`);
    }
  }

  if (needsRca) {
    const rcaReferences = extractBacktickPaths(runRecord).filter((ref) => /(^|\/)rca\.md$/i.test(ref));
    if (rcaReferences.length === 0) {
      fail('Failed/Partial/Failure run requires an RCA file reference in run-record.md.');
    }
    rcaReferences.forEach((ref) => {
      if (!evidencePathExists(ref, featureDir)) {
        fail(`RCA reference does not exist: ${ref}`);
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
          fail(`Verification row "${item}" is ${result} but has no command or existing evidence file.`);
        }

        if (refs.some((ref) => !evidencePathExists(ref, featureDir))) {
          fail(`Verification row "${item}" references missing evidence: ${refs.join(', ')}`);
        }
      }

      if (isSkipped && (!skippedReason || /^(n\/a|none|无|-)?$/i.test(skippedReason))) {
        fail(`Verification row "${item}" is Skipped without a skip reason or risk.`);
      }
    });

    const summarySection = getSection(runRecord, '4. 执行摘要');
    if (!summarySection.trim()) {
      fail('run-record.md has an empty execution summary.');
    }

    const evidenceRows = parseTableRows(getSection(runRecord, '11. 证据文件表'));
    evidenceRows.forEach((cells) => {
      const evidenceRef = extractBacktickPaths(cells.join(' '))[0];
      if (evidenceRef && !evidencePathExists(evidenceRef, featureDir)) {
        fail(`Evidence table references missing file: ${evidenceRef}`);
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
      fail('Successful run should reference at least one existing evidence or linked artifact.');
    }
  }

  return { featureDir, coveredFiles };
}

function validateChangedRun(base, head) {
  const changedFiles = listRefChangedFiles(base, head);
  if (changedFiles.length === 0) {
    console.log(`Harness changed-file check passed for ${base}...${head}: no changed files`);
    return false;
  }

  const featureDirs = findChangedFeatureDirs(changedFiles);
  if (featureDirs.length === 0) {
    fail(
      'Changed-file mode requires at least one specs/{feature}/run-record.md change so PR files can be mapped to a Run Record.'
    );
    changedFiles.forEach((filePath) => fail(`Changed file has no candidate Run Record: ${filePath}`));
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
  console.error('Harness check failed:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

if (parsedArgs.mode === 'changed') {
  if (checkedChangedFiles) {
    console.log(`Harness changed-file check passed for ${parsedArgs.base}...${parsedArgs.head}`);
  }
} else {
  console.log(`Harness check passed for ${parsedArgs.featureDir}`);
}
