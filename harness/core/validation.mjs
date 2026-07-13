import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { sha256 } from './trace.mjs';
import { stableId } from './ids.mjs';

export class Validator {
  constructor(descriptor) { this.descriptor = descriptor; this.id = descriptor.id; }
  run(options) { return runValidator(this.descriptor, options); }
}

/**
 * Public Harness API.
 */
export function classifyChanges(files) {
  return [...new Set(files.flatMap((file) => {
    const classes = [];
    if (/\.(?:ts|tsx|js|mjs|cjs|py|go)$/.test(file)) classes.push('code');
    if (/(?:^|\/)(?:test|tests|__tests__|fixtures?)\//.test(file) || /\.test\./.test(file)) classes.push('test');
    if (/\.(?:md|mdx)$/.test(file)) classes.push('docs');
    if (/\.(?:css|scss|png|jpg|svg)$/.test(file)) classes.push('ui');
    if (/(?:package\.json|lock|\.github\/|Dockerfile|config)/.test(file)) classes.push('infrastructure');
    return classes.length ? classes : ['other'];
  }))];
}

/**
 * Public Harness API.
 */
export function resolveValidators(files, manifest) {
  const classes = classifyChanges(files);
  const ids = new Set();
  (manifest.changeRules || []).forEach((rule) => {
    if (rule.changeClasses.some((name) => classes.includes(name)) || rule.patterns?.some((pattern) => files.some((file) => new RegExp(pattern).test(file)))) {
      rule.validators.forEach((id) => ids.add(id));
    }
  });
  return { classes, validators: (manifest.validators || []).filter((validator) => ids.has(validator.id)) };
}

/**
 * Public Harness API.
 */
export function runValidator(validator, options = {}) {
  const startedAt = new Date().toISOString();
  return new Promise((resolve) => {
    const child = spawn(validator.command[0], validator.command.slice(1), { cwd: options.cwd, env: { ...process.env, ...(validator.env || {}) }, stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    const errors = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => errors.push(chunk));
    const timeout = setTimeout(() => child.kill('SIGTERM'), validator.timeoutMs || options.timeoutMs || 30000);
    child.on('close', (code, signal) => {
      clearTimeout(timeout);
      const timedOut = signal === 'SIGTERM';
      resolve({
        schemaVersion: '1.0.0', id: stableId('validation'), status: timedOut ? 'fail' : code === 0 ? 'pass' : 'fail', extensions: { signal },
        validatorId: validator.id, startedAt, endedAt: new Date().toISOString(), evidenceIds: [],
        exitCode: code, output: Buffer.concat(chunks).toString('utf8'), errorOutput: Buffer.concat(errors).toString('utf8'), timedOut
      });
    });
  });
}

/**
 * Public Harness API.
 */
export function verifyEvidence(projectRoot, records, options = {}) {
  const now = options.now || Date.now();
  const maxAgeMs = options.maxAgeMs || 24 * 60 * 60 * 1000;
  const issues = [];
  records.forEach((record) => {
    const target = path.resolve(projectRoot, record.path || '');
    if (!target.startsWith(path.resolve(projectRoot) + path.sep)) issues.push(`evidence escapes project: ${record.path}`);
    else if (!fs.existsSync(target)) issues.push(`missing evidence: ${record.path}`);
    else if (record.sha256 !== sha256(fs.readFileSync(target))) issues.push(`evidence hash mismatch: ${record.path}`);
    if (!record.recordedAt || now - Date.parse(record.recordedAt) > maxAgeMs) issues.push(`stale evidence: ${record.path}`);
    if (record.status === 'skipped' && !record.reason) issues.push(`skipped evidence lacks reason: ${record.path}`);
  });
  return { ok: issues.length === 0, issues };
}

/**
 * Public Harness API.
 */
export function deliveryGate(input) {
  const blockers = [];
  const requiredIds = new Set(input.requiredValidators || []);
  const results = new Map((input.validationResults || []).map((result) => [result.validatorId, result]));
  requiredIds.forEach((id) => {
    const result = results.get(id);
    if (!result) blockers.push(`validator not run: ${id}`);
    else if (result.status !== 'pass') blockers.push(`validator did not pass: ${id} (${result.status})`);
  });
  (input.acceptanceIds || []).forEach((id) => {
    if (!(input.evidence || []).some((record) => record.acceptanceIds?.includes(id))) blockers.push(`acceptance has no evidence: ${id}`);
  });
  if (input.testFilesChanged && !input.independentTestReview) blockers.push('test changes require independent review');
  if (input.hiddenValidatorFilesChanged) blockers.push('executor modified hidden validators');
  if (input.runRecordStatus === 'pass' && (input.validationResults || []).some((result) => result.status !== 'pass')) blockers.push('run record contradicts validation trace');
  return { ok: blockers.length === 0, status: blockers.length ? 'fail' : 'pass', blockers };
}
