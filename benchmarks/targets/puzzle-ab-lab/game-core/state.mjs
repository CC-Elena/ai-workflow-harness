/**
 * Public Harness API.
 */
export function createState({ coins = 100, board = 'seeded-board', score = 42 } = {}) {
  return { coins, board, score, alive: false, revived: false };
}
