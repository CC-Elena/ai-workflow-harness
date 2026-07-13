import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { stableId } from './ids.mjs';
import { redact } from './security.mjs';

export const EVENT_TYPES = Object.freeze([
  'RunStarted', 'RunFinished', 'TaskStarted', 'TaskFinished', 'AgentStarted', 'AgentFinished', 'RoleBound',
  'HandoffCreated', 'HandoffAccepted', 'ContextSearch', 'ContextRead', 'ContextConflict', 'ToolCallStarted',
  'ToolCallFinished', 'FileChanged', 'ValidationStarted', 'ValidationFinished', 'EvidenceRecorded',
  'ReviewFinished', 'EvaluationFinished', 'HumanIntervention', 'GitBranchCreated', 'GitWorktreeCreated', 'ArtifactCreated'
]);

/**
 * Public Harness API.
 */
export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

export class TraceStore {
  constructor(projectRoot, identity, metadata = {}) {
    this.projectRoot = path.resolve(projectRoot);
    this.identity = identity;
    this.runDir = path.join(this.projectRoot, '.harness', 'runs', identity.runId);
    this.eventsPath = path.join(this.runDir, 'events.jsonl');
    this.artifactsDir = path.join(this.runDir, 'artifacts');
    this.evidenceDir = path.join(this.runDir, 'evidence');
    ensureDir(this.artifactsDir);
    ensureDir(this.evidenceDir);
    if (!fs.existsSync(this.eventsPath)) fs.writeFileSync(this.eventsPath, '');
    const run = redact({
      schemaVersion: '1.0.0', id: identity.runId, status: 'running', extensions: {},
      runId: identity.runId, traceId: identity.traceId, agentId: metadata.agentId || 'orchestrator',
      role: metadata.role || 'orchestrator', parentRunId: metadata.parentRunId || null,
      createdAt: new Date().toISOString(), metadata
    });
    fs.writeFileSync(path.join(this.runDir, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
  }

  append(eventType, payload = {}, links = {}) {
    const event = redact({
      schemaVersion: '1.0.0', id: stableId('event'), status: payload.status || 'running', extensions: {},
      runId: this.identity.runId, traceId: this.identity.traceId, spanId: links.spanId || stableId('span'),
      parentSpanId: links.parentSpanId ?? this.identity.spanId ?? null, eventType,
      timestamp: new Date().toISOString(), agentId: links.agentId || payload.agentId || 'orchestrator',
      role: links.role || payload.role || 'orchestrator', taskId: links.taskId || null,
      handoffId: links.handoffId || null, artifactId: links.artifactId || null, payload
    });
    fs.appendFileSync(this.eventsPath, `${JSON.stringify(event)}\n`);
    return event;
  }

  writeArtifact(name, content, options = {}) {
    const safeName = path.basename(name);
    const body = typeof content === 'string' ? redact(content) : JSON.stringify(redact(content), null, 2);
    const artifactId = stableId('artifact');
    const target = path.join(options.evidence ? this.evidenceDir : this.artifactsDir, safeName);
    fs.writeFileSync(target, `${body}${body.endsWith('\n') ? '' : '\n'}`);
    const record = {
      schemaVersion: '1.0.0', id: artifactId, status: 'pass', extensions: {}, kind: options.kind || 'text',
      path: path.relative(this.runDir, target), sha256: sha256(fs.readFileSync(target)), owner: options.owner || 'harness'
    };
    this.append(options.evidence ? 'EvidenceRecorded' : 'ArtifactCreated', record, { artifactId });
    return record;
  }

  writeResult(name, document) {
    const target = path.join(this.runDir, name);
    fs.writeFileSync(target, `${JSON.stringify(redact(document), null, 2)}\n`);
    return { path: target, sha256: sha256(fs.readFileSync(target)) };
  }

  query(filters = {}) {
    return readEvents(this.eventsPath).events.filter((event) =>
      Object.entries(filters).every(([key, value]) => value === undefined || event[key] === value || event.payload?.[key] === value)
    );
  }

  finalize(status, summary = {}) {
    this.append('RunFinished', { status, summary });
    const runPath = path.join(this.runDir, 'run.json');
    const run = JSON.parse(fs.readFileSync(runPath, 'utf8'));
    run.status = status;
    run.finishedAt = new Date().toISOString();
    run.summary = redact(summary);
    fs.writeFileSync(runPath, `${JSON.stringify(run, null, 2)}\n`);
    const draft = generateRunRecord(run, readEvents(this.eventsPath).events);
    fs.writeFileSync(path.join(this.runDir, 'run-record.md'), draft);
    fs.writeFileSync(path.join(this.runDir, 'report.md'), draft);
    return run;
  }
}

/**
 * Public Harness API.
 */
export function readEvents(eventsPath) {
  if (!fs.existsSync(eventsPath)) return { events: [], errors: [{ line: 0, message: 'events file missing' }] };
  const events = [];
  const errors = [];
  fs.readFileSync(eventsPath, 'utf8').split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    try { events.push(JSON.parse(line)); }
    catch (error) { errors.push({ line: index + 1, message: error.message }); }
  });
  return { events, errors };
}

/**
 * Public Harness API.
 */
export function verifyArtifacts(runDir) {
  const { events, errors } = readEvents(path.join(runDir, 'events.jsonl'));
  const problems = [...errors.map((item) => `corrupt event line ${item.line}: ${item.message}`)];
  events.filter((event) => event.eventType === 'ArtifactCreated' || event.eventType === 'EvidenceRecorded').forEach((event) => {
    const target = path.join(runDir, event.payload.path || '');
    if (!fs.existsSync(target)) problems.push(`missing artifact: ${event.payload.path}`);
    else if (sha256(fs.readFileSync(target)) !== event.payload.sha256) problems.push(`hash mismatch: ${event.payload.path}`);
  });
  return { ok: problems.length === 0, problems };
}

/**
 * Public Harness API.
 */
export function generateRunRecord(run, events) {
  const counts = events.reduce((acc, event) => ({ ...acc, [event.eventType]: (acc[event.eventType] || 0) + 1 }), {});
  const validations = events.filter((event) => event.eventType === 'ValidationFinished');
  return `# Run Record: ${run.runId}\n\n- Trace: ${run.traceId}\n- Status: ${run.status}\n- Agent: ${run.agentId}\n- Role: ${run.role}\n\n## Event Summary\n\n${Object.entries(counts).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\n## Validation Claims\n\n${validations.length ? validations.map((event) => `- ${event.payload.validatorId}: ${event.payload.status}`).join('\n') : '- No validation claim recorded.'}\n\n> Generated from append-only events. Verify artifact hashes before delivery.\n`;
}
