import { games } from '../data/game.js';

export const playerCards = (playerName, gameId) => {
  const { game, player, errorMessage } = getGameAndPlayer(gameId, playerName);
  if (errorMessage) {
    return { error: errorMessage };
  }
  if (!game.started || !game.roundStarted) {
    return { waiting: true };
  }

  const hand = player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
  return hand;
};

export const getGameAndPlayer = (gameId, playerName) => {
  const game = games.find((g) => g.gameId === gameId.toLowerCase());
  if (!game) {
    return { errorMessage: `${gameId} game does not exist.` };
  }
  const player = game.players.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
  if (!player) {
    return { errorMessage: `${playerName} player does not exist in this game.` };
  }

  return { game, player };
};

export const getTurn = (gameId) => {
  const game = games.find((g) => g.gameId === gameId.toLowerCase());
  return game.players.find((p) => p.myTurn);
};
