import os from 'node:os';
import path from 'node:path';
import * as fsp from 'node:fs/promises';
import { runProcess } from './tool-policy.mjs';
import { readEvents, verifyArtifacts } from './trace.mjs';
import { stableId } from './ids.mjs';

export const ABLATION_PROFILES = Object.freeze(['native', 'agents', 'spec', 'context-skills', 'full-harness']);

function grader(id, pass, reason, evidenceIds = []) {
  return { schemaVersion: '1.0.0', id: stableId('grader'), status: pass ? 'pass' : 'fail', extensions: {}, graderId: id, score: pass ? 1 : 0, reason, evidenceIds };
}

export const deterministicGraders = {
  behavior: (input) => {
    const transcript = `${input.execution.output || ''}\n${input.execution.errorOutput || ''}`;
    return grader('behavior', input.execution.status === 'pass' && (input.case.goldBehavior || []).every((needle) => transcript.includes(needle)), 'command and gold behavior check');
  },
  scope: (input) => {
    const changed = input.changedFiles || [];
    const allowed = (input.case.allowedScope || []).every((scope) => changed.some((file) => file.startsWith(scope)) || changed.length === 0);
    const forbidden = (input.case.forbiddenScope || []).some((scope) => changed.some((file) => file.startsWith(scope)));
    return grader('scope', allowed && !forbidden, forbidden ? 'forbidden scope changed' : 'scope check');
  },
  validation: (input) => grader('validation', (input.validationResults || []).length > 0 && input.validationResults.every((result) => result.status === 'pass'), 'validation results check'),
  evidence: (input) => grader('evidence', input.runDir ? verifyArtifacts(input.runDir).ok : false, 'artifact existence and hash check'),
  trace: (input) => {
    const parsed = input.runDir ? readEvents(path.join(input.runDir, 'events.jsonl')) : { events: [], errors: [{}] };
    const required = ['RunStarted', 'ValidationFinished', 'EvaluationFinished'];
    return grader('trace', parsed.errors.length === 0 && required.every((name) => parsed.events.some((event) => event.eventType === name)), 'required trace events check');
  }
};

export class ModelGrader {
  constructor(evaluate) { this.evaluate = evaluate; }
  async grade(input) {
    if (!this.evaluate) return { status: 'pending', score: null, reason: 'model grader not configured; subjective item pending' };
    return this.evaluate(input);
  }
}

async function isolatedCopy(target) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'harness-eval-'));
  const workspace = path.join(root, 'workspace');
  await fsp.cp(target, workspace, { recursive: true, filter: (source) => !source.split(path.sep).some((part) => ['.git', '.harness', 'node_modules'].includes(part)) });
  return { root, workspace };
}

/**
 * Public Harness API.
 */
export async function runEvaluationCase(evalCase, options = {}) {
  const isolated = await isolatedCopy(evalCase.target);
  try {
    const execution = await runProcess(evalCase.command, { cwd: isolated.workspace, timeoutMs: evalCase.timeoutMs || 30000, signal: options.signal });
    const input = { case: evalCase, execution, changedFiles: options.changedFiles || [], validationResults: options.validationResults || [], runDir: options.runDir };
    const selected = evalCase.graders || ['behavior', 'scope', 'validation', 'evidence', 'trace'];
    const graderResults = selected.map((name) => deterministicGraders[name](input));
    return {
      schemaVersion: '1.0.0', id: stableId('evaluation'), status: graderResults.every((result) => result.status === 'pass') ? 'pass' : 'fail', extensions: { isolated: true },
      caseId: evalCase.id, profile: options.profile || 'full-harness', attempt: options.attempt || 1, graderResults,
      metrics: {
        passAt1: null, eventualPass: null, firstValidationPassRate: (options.validationResults || []).length ? Number(options.validationResults.every((item) => item.status === 'pass')) : null,
        outOfScopeRate: (options.changedFiles || []).length ? Number((options.changedFiles || []).some((file) => (evalCase.forbiddenScope || []).some((scope) => file.startsWith(scope)))) : 0,
        falseCompletionRate: null, contextRecall: options.contextMetrics?.recall ?? null, contextPrecision: options.contextMetrics?.precision ?? null,
        repeatedOperationRate: options.repeatedOperationRate ?? null, humanInterventionCount: options.humanInterventionCount ?? 0,
        toolCalls: 1, latencyMs: null, tokenCount: null, cost: null, agentExperiment: options.agentExecuted ? 'executed' : 'pending'
      }, execution
    };
  } finally {
    if (!options.keepWorkspace) await fsp.rm(isolated.root, { recursive: true, force: true });
  }
}

/**
 * Public Harness API.
 */
export async function repeatEvaluation(evalCase, options = {}) {
  const attempts = options.attempts || 1;
  const profiles = options.profiles || ['full-harness'];
  const results = [];
  for (const profile of profiles) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) results.push(await runEvaluationCase(evalCase, { ...options, profile, attempt }));
  }
  const byProfile = Object.fromEntries(profiles.map((profile) => {
    const values = results.filter((result) => result.profile === profile);
    const firstPass = values.findIndex((result) => result.status === 'pass');
    return [profile, { passAt1: values[0]?.status === 'pass' ? 1 : 0, eventualPass: firstPass >= 0 ? 1 : 0, firstPassingAttempt: firstPass >= 0 ? firstPass + 1 : null, falseCompletionRate: 0 }];
  }));
  return { schemaVersion: '1.0.0', results, comparison: byProfile };
}
