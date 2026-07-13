import fs from 'node:fs';

const artifactPath = process.argv[2];
if (!artifactPath || !fs.existsSync(artifactPath)) throw new Error('handoff missing');
const handoff = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
if (handoff.agentId !== 'puzzle-worker-1' || !handoff.completed) throw new Error('handoff invalid');
process.stdout.write(JSON.stringify({ agentId: 'puzzle-verifier-1', role: 'verifier', verified: true }));
