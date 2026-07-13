import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { stableId } from './ids.mjs';
import { sha256 } from './trace.mjs';

export class AgentAdapter {
  constructor(id) { this.id = id; }
  describe() { throw new Error('describe() must be implemented'); }
  execute() { throw new Error('execute() must be implemented'); }
}

export class GenericProcessAdapter extends AgentAdapter {
  constructor(policyEngine) { super('generic-process'); this.policyEngine = policyEngine; }
  describe() { return { id: this.id, physicalIsolation: 'os-process', capabilities: ['execute', 'handoff', 'cancel', 'timeout'] }; }
  execute(request) { return this.policyEngine.execute(request); }
}

export class CodexAdapter extends AgentAdapter {
  constructor(policyEngine) { super('codex'); this.policyEngine = policyEngine; }
  describe() {
    const available = spawnSync('codex', ['--version'], { encoding: 'utf8' }).status === 0;
    return { id: this.id, available, capabilities: ['external-coding-agent', 'structured-output'], limitations: ['private reasoning is never captured'] };
  }
  execute(request) {
    if (!this.describe().available) return Promise.resolve({ status: 'environment_unavailable', retryable: false, reason: 'codex CLI unavailable' });
    return this.policyEngine.execute({ ...request, command: ['codex', 'exec', '--json', request.prompt] });
  }
}

export const LOGICAL_ROLES = Object.freeze(['orchestrator', 'planner', 'context-scout', 'executor', 'verifier', 'reviewer', 'evaluator']);

/**
 * Public Harness API.
 */
export function bindRoles(bindings) {
  const seen = new Set();
  for (const binding of bindings) {
    if (!LOGICAL_ROLES.includes(binding.role)) throw new Error(`Unknown logical role: ${binding.role}`);
    if (!binding.agentId) throw new Error(`Role ${binding.role} has no physical agent`);
    const key = `${binding.role}:${binding.agentId}`;
    if (seen.has(key)) throw new Error(`Duplicate role binding: ${key}`);
    seen.add(key);
  }
  return bindings;
}

/**
 * Public Harness API.
 */
export function verifyHandoffArtifact(trace, artifact) {
  if (!artifact?.path || !artifact?.sha256) return { ok: false, reason: 'handoff contract missing artifact reference' };
  const artifactPath = path.join(trace.runDir, artifact.path);
  if (!fs.existsSync(artifactPath)) return { ok: false, reason: 'handoff artifact missing' };
  if (sha256(fs.readFileSync(artifactPath)) !== artifact.sha256) return { ok: false, reason: 'handoff artifact hash mismatch' };
  return { ok: true, artifactPath };
}

/**
 * Public Harness API.
 */
export async function runWorkerVerifier({ adapter, trace, worker, verifier, cwd, taskId = stableId('task') }) {
  if (worker.agentId === verifier.agentId) throw new Error('Worker and verifier must have distinct agentId values');
  const parentSpanId = stableId('span');
  trace.append('TaskStarted', { status: 'running', taskId }, { spanId: parentSpanId, taskId, role: 'orchestrator' });
  const workerSpan = stableId('span');
  const workerRunId = stableId('run');
  trace.append('AgentStarted', { status: 'running', adapter: adapter.id, childRunId: workerRunId, parentRunId: trace.identity.runId }, { spanId: workerSpan, parentSpanId, agentId: worker.agentId, role: 'executor', taskId });
  const workerResult = await adapter.execute({ command: worker.command, cwd, idempotencyKey: `${trace.identity.runId}:${taskId}:worker` });
  trace.append('AgentFinished', { ...workerResult, status: workerResult.status }, { spanId: workerSpan, parentSpanId, agentId: worker.agentId, role: 'executor', taskId });
  if (workerResult.status !== 'pass') return { status: 'fail', worker: workerResult, verifier: null };

  const artifact = trace.writeArtifact('worker-output.json', workerResult.output, { kind: 'handoff', owner: worker.agentId });
  const handoffId = stableId('handoff');
  const handoff = {
    schemaVersion: '1.0.0', id: handoffId, status: 'ready', extensions: {}, fromAgentId: worker.agentId,
    toAgentId: verifier.agentId, taskId, artifactIds: [artifact.id], contractHash: sha256(JSON.stringify({ taskId, artifactIds: [artifact.id] }))
  };
  trace.append('HandoffCreated', handoff, { parentSpanId, agentId: worker.agentId, role: 'executor', taskId, handoffId, artifactId: artifact.id });
  const verifierSpan = stableId('span');
  const verifierRunId = stableId('run');
  trace.append('AgentStarted', { status: 'running', adapter: adapter.id, childRunId: verifierRunId, parentRunId: trace.identity.runId }, { spanId: verifierSpan, parentSpanId, agentId: verifier.agentId, role: 'verifier', taskId, handoffId });
  const handoffCheck = verifyHandoffArtifact(trace, artifact);
  if (!handoffCheck.ok) return { status: 'fail', worker: workerResult, verifier: { status: 'fail', reason: handoffCheck.reason } };
  const artifactPath = handoffCheck.artifactPath;
  const verifierResult = await adapter.execute({ command: [...verifier.command, artifactPath], cwd, idempotencyKey: `${trace.identity.runId}:${taskId}:verifier` });
  trace.append('AgentFinished', { ...verifierResult, status: verifierResult.status }, { spanId: verifierSpan, parentSpanId, agentId: verifier.agentId, role: 'verifier', taskId, handoffId });
  trace.append('EvaluationFinished', { status: verifierResult.status, source: 'independent-verifier' }, { parentSpanId, agentId: verifier.agentId, role: 'evaluator', taskId, handoffId });
  return { status: verifierResult.status, worker: workerResult, verifier: verifierResult, handoff, artifact };
}
