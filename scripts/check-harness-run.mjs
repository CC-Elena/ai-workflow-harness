#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const featureArg = process.argv[2];
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

function listChangedFiles() {
  const tracked = execFileSync('git', ['diff', '--name-only'], {
    cwd: repoRoot,
    encoding: 'utf8'
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
    cwd: repoRoot,
    encoding: 'utf8'
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return Array.from(new Set([...tracked, ...untracked])).sort();
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

function evidencePathExists(reference, featureDir) {
  if (!reference || /^(n\/a|none|无)$/i.test(reference)) return false;

  const candidates = [];
  if (
    reference.startsWith(featureDir) ||
    reference.startsWith('.ai/') ||
    reference.startsWith('app/') ||
    reference.startsWith('scripts/')
  ) {
    candidates.push(reference);
  } else {
    candidates.push(path.join(featureDir, reference));
    candidates.push(path.join(featureDir, 'evidence', reference));
    candidates.push(reference);
  }

  return candidates.some(exists);
}

if (!featureArg) {
  console.error('Usage: npm run harness:check -- specs/{feature}');
  process.exit(2);
}

const featureDir = featureArg.replace(/\/$/, '');
const specPath = path.join(featureDir, 'spec.md');
const tasksPath = path.join(featureDir, 'tasks.md');
const runRecordPath = path.join(featureDir, 'run-record.md');
const evaluationPath = path.join(featureDir, 'evaluation-summary.md');

if (!exists(specPath)) fail(`Missing required file: ${specPath}`);
if (!exists(runRecordPath)) fail(`Missing required file: ${runRecordPath}`);

let runRecord = '';
if (exists(runRecordPath)) {
  runRecord = readText(runRecordPath);
}

const complexity = getMetadata(runRecord, '任务复杂度');
const status = getMetadata(runRecord, '状态');
const needsExtendedArtifacts = /^(Medium|Large|Risky)$/i.test(complexity);

if (needsExtendedArtifacts) {
  if (!exists(tasksPath)) fail(`Medium/Large/Risky run requires tasks file: ${tasksPath}`);
  if (!exists(evaluationPath)) {
    fail(`Medium/Large/Risky run requires evaluation summary: ${evaluationPath}`);
  }
}

if (exists(tasksPath)) {
  const tasks = readText(tasksPath);
  if (/\|\s*Pending\s*\|/.test(tasks) && /^Success$/i.test(status)) {
    fail('tasks.md still contains Pending rows while run-record status is Success.');
  }
}

if (runRecord) {
  const verificationRows = parseTableRows(getSection(runRecord, '7. 验证记录'));
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

  const evidenceRows = parseTableRows(getSection(runRecord, '11. 证据文件表'));
  evidenceRows.forEach((cells) => {
    const evidenceRef = extractBacktickPaths(cells.join(' '))[0];
    if (evidenceRef && !evidencePathExists(evidenceRef, featureDir)) {
      fail(`Evidence table references missing file: ${evidenceRef}`);
    }
  });

  const changedFiles = listChangedFiles();
  const diffRows = parseTableRows(getSection(runRecord, '10. 实际 Diff 覆盖表'));
  const coveredFiles = new Map();
  diffRows.forEach((cells) => {
    const filePath = extractBacktickPaths(cells[0] || '')[0];
    if (filePath) {
      coveredFiles.set(filePath, cells);
    }
  });

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

if (failures.length > 0) {
  console.error('Harness check failed:');
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Harness check passed for ${featureDir}`);
