/**
 * Public Harness API.
 */
export function assignExperiment(playerId) {
  let hash = 0;
  for (const char of playerId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 2 === 0 ? 'revive-treatment' : 'control';
}
