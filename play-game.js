import { games } from './data/game.js';

export const playerCards = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  const player = game.players.find((p) => p.name === playerName);

  return player.cards;
};
