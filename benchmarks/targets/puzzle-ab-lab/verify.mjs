import fs from 'node:fs';
import { verifyInvariants } from './tests/invariants.mjs';

verifyInvariants();
const cases = JSON.parse(fs.readFileSync(new URL('./cases/cases.json', import.meta.url), 'utf8'));
if (cases.length < 8 || cases.some((item) => !item.successCase || !item.failureCase || !item.limitations)) throw new Error('benchmark cases lack success/failure/limitations');
process.stdout.write(`PUZZLE_OK cases=${cases.length}\n`);
