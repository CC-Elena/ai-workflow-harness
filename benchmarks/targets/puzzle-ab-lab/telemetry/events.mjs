/**
 * Public Harness API.
 */
export function reviveEvent({ playerId, group, price, result }) {
  return { name: 'revive_result', playerId, group, price, result, fields: ['playerId', 'group', 'price', 'result'] };
}
