/**
 * Public Harness API.
 */
export function shouldShowRevive(group, state) {
  return group === 'revive-treatment' && !state.revived && !state.alive;
}
