#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectProject, initProject, doctorProject } from './core/migration.mjs';
import { createRunIdentity } from './core/ids.mjs';
import { TraceStore, readEvents, verifyArtifacts } from './core/trace.mjs';
import { ToolPolicyEngine } from './core/tool-policy.mjs';
import { GenericProcessAdapter, runWorkerVerifier } from './core/runtime.mjs';
import { runEvaluationCase } from './core/evaluation.mjs';

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { root: process.cwd() };
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === '--dry-run') options.dryRun = true;
    else if (value === '--keep-failed') options.keepFailed = true;
    else if (value.startsWith('--')) options[value.slice(2)] = rest[++index];
    else positional.push(value);
  }
  options.root = path.resolve(options.root);
  return { command, options, positional };
}

function output(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function latestRun(root) {
  const runs = path.join(root, '.harness', 'runs');
  if (!fs.existsSync(runs)) return null;
  return fs.readdirSync(runs).map((name) => path.join(runs, name)).filter((entry) => fs.statSync(entry).isDirectory()).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || null;
}

/**
 * Public Harness API.
 */
export async function validateProject(root, trace = null) {
  const manifestPath = path.join(root, '.harness', 'validation.json');
  if (!fs.existsSync(manifestPath)) return { status: 'fail', results: [], issues: ['validation manifest missing'] };
  const manifest = readJson(manifestPath);
  const policy = new ToolPolicyEngine({ allowed: (manifest.validators || []).map((item) => item.command.join(' ')), protectedPaths: manifest.protectedPaths || [], timeoutMs: 30000 });
  const adapter = new GenericProcessAdapter(policy);
  const results = [];
  for (const validator of manifest.validators || []) {
    trace?.append('ValidationStarted', { status: 'running', validatorId: validator.id }, { role: 'verifier', agentId: 'validator-process' });
    const result = await adapter.execute({ command: validator.command, cwd: root, timeoutMs: validator.timeoutMs });
    results.push({ validatorId: validator.id, ...result });
    trace?.append('ValidationFinished', { validatorId: validator.id, ...result, status: result.status }, { role: 'verifier', agentId: 'validator-process' });
  }
  return { status: results.length > 0 && results.every((item) => item.status === 'pass') ? 'pass' : 'fail', results, issues: results.length ? [] : ['no validators configured'] };
}

/**
 * Public Harness API.
 */
export async function controlledRun(root) {
  const projectPath = path.join(root, '.harness', 'project.json');
  if (!fs.existsSync(projectPath)) throw new Error('project manifest missing; run init first');
  const project = readJson(projectPath);
  const identity = createRunIdentity();
  const trace = new TraceStore(root, identity, { agentId: 'orchestrator-1', role: 'orchestrator', projectId: project.id });
  trace.append('RunStarted', { status: 'running', projectId: project.id });
  const collaborationPath = path.join(root, '.harness', 'collaboration.json');
  const collaboration = fs.existsSync(collaborationPath) ? readJson(collaborationPath) : null;
  const allowed = [project.execution?.command, collaboration?.worker?.command, collaboration?.verifier?.command].filter(Boolean).map((command) => command.join(' '));
  const policy = new ToolPolicyEngine({ allowed, protectedPaths: project.protectedPaths || [], timeoutMs: 30000, retries: 1 });
  const adapter = new GenericProcessAdapter(policy);
  let execution;
  if (fs.existsSync(collaborationPath)) {
    execution = await runWorkerVerifier({ adapter, trace, worker: collaboration.worker, verifier: collaboration.verifier, cwd: root });
  } else {
    trace.append('AgentStarted', { status: 'running', adapter: adapter.id }, { agentId: 'generic-worker-1', role: 'executor' });
    trace.append('ToolCallStarted', { status: 'running', command: project.execution?.command }, { agentId: 'generic-worker-1', role: 'executor' });
    execution = project.execution?.command ? await adapter.execute({ command: project.execution.command, cwd: root, idempotencyKey: `${identity.runId}:execute` }) : { status: 'fail', reason: 'controlled command missing' };
    trace.append('ToolCallFinished', { ...execution, status: execution.status }, { agentId: 'generic-worker-1', role: 'executor' });
    trace.append('AgentFinished', { ...execution, status: execution.status }, { agentId: 'generic-worker-1', role: 'executor' });
  }
  const evidence = trace.writeArtifact('execution.log', JSON.stringify(execution, null, 2), { evidence: true, kind: 'command-output', owner: 'validator-process' });
  const validation = await validateProject(root, trace);
  const evaluation = {
    schemaVersion: '1.0.0', id: `evaluation-${identity.runId}`, status: execution.status === 'pass' && validation.status === 'pass' ? 'pass' : 'fail', extensions: {},
    caseId: project.id, profile: 'full-harness', attempt: 1,
    graderResults: [
      { graderId: 'behavior', status: execution.status === 'pass' ? 'pass' : 'fail', score: execution.status === 'pass' ? 1 : 0 },
      { graderId: 'validation', status: validation.status, score: validation.status === 'pass' ? 1 : 0 },
      { graderId: 'evidence', status: verifyArtifacts(trace.runDir).ok ? 'pass' : 'fail', score: verifyArtifacts(trace.runDir).ok ? 1 : 0 }
    ],
    metrics: { passAt1: execution.status === 'pass' ? 1 : 0, eventualPass: execution.status === 'pass' ? 1 : 0, toolCalls: collaboration ? 2 : 1, tokenCount: null, cost: null, agentExperiment: collaboration ? 'fixture-process-executed' : 'pending' }
  };
  trace.append('EvaluationFinished', { ...evaluation, status: evaluation.status }, { agentId: 'evaluator-1', role: 'evaluator' });
  fs.writeFileSync(path.join(trace.runDir, 'patch.diff'), '');
  trace.writeResult('validation.json', validation);
  trace.writeResult('evaluation.json', evaluation);
  const status = evaluation.status;
  trace.finalize(status, { evidenceId: evidence.id, validation: validation.status, evaluation: evaluation.status });
  return { runId: identity.runId, traceId: identity.traceId, runDir: trace.runDir, status, execution, validation, evaluation };
}

async function evaluateProject(root, options) {
  const casesPath = path.join(root, '.harness', 'eval-cases.json');
  if (!fs.existsSync(casesPath)) return { status: 'pending', reason: 'eval cases not configured' };
  const last = latestRun(root);
  const validation = last && fs.existsSync(path.join(last, 'validation.json')) ? readJson(path.join(last, 'validation.json')).results : [];
  const cases = readJson(casesPath);
  const results = [];
  for (const item of cases) results.push(await runEvaluationCase({ ...item, target: root }, { runDir: last, validationResults: validation, profile: options.profile || 'full-harness' }));
  return { status: results.every((item) => item.status === 'pass') ? 'pass' : 'fail', results };
}

function reportProject(root, runId) {
  const runDir = runId ? path.join(root, '.harness', 'runs', runId) : latestRun(root);
  if (!runDir) return { status: 'pending', reason: 'no run found' };
  const run = readJson(path.join(runDir, 'run.json'));
  const validation = fs.existsSync(path.join(runDir, 'validation.json')) ? readJson(path.join(runDir, 'validation.json')) : null;
  const evaluation = fs.existsSync(path.join(runDir, 'evaluation.json')) ? readJson(path.join(runDir, 'evaluation.json')) : null;
  return { runDir, run, validation, evaluation, integrity: verifyArtifacts(runDir) };
}

function traceProject(root, options) {
  const runDir = options['run-id'] ? path.join(root, '.harness', 'runs', options['run-id']) : latestRun(root);
  if (!runDir) return { events: [], errors: [{ line: 0, message: 'no run found' }] };
  const parsed = readEvents(path.join(runDir, 'events.jsonl'));
  parsed.events = parsed.events.filter((event) => ['agentId', 'role', 'taskId', 'eventType', 'status'].every((key) => !options[key] || event[key] === options[key] || event.payload?.[key] === options[key]));
  return { runDir, ...parsed };
}

/**
 * Public Harness API.
 */
export async function main(argv = process.argv.slice(2)) {
  const { command, options, positional } = parseArgs(argv);
  let result;
  if (command === 'inspect') result = inspectProject(options.root);
  else if (command === 'init') result = initProject(options.root, options);
  else if (command === 'doctor') result = doctorProject(options.root);
  else if (command === 'validate') result = await validateProject(options.root);
  else if (command === 'run') result = await controlledRun(options.root);
  else if (command === 'eval') result = await evaluateProject(options.root, options);
  else if (command === 'report') result = reportProject(options.root, options['run-id'] || positional[0]);
  else if (command === 'trace') result = traceProject(options.root, options);
  else throw new Error('Usage: harness <inspect|init|doctor|validate|run|eval|report|trace> [--root PATH]');
  output(result);
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
