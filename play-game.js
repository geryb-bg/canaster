import { games } from './data/game.js';

export const playerCards = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  const player = game.players.find((p) => p.name === playerName);

  return player.cards;
};

export const drawCard = (drawPile) => {
  const randomIndex = Math.floor(Math.random() * drawPile.length);
  const chosenCard = drawPile.splice(randomIndex, 1);
  return chosenCard[0];
};
