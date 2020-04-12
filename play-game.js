import { games } from './data/game.js';

export const playerCards = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game' };
  }

  return player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const playerDraw = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game' };
  }

  const newCard = drawCard(game.drawPile);
  player.cards.push(newCard);
  return {
    cards: player.cards.sort((a, b) => a.sortOrder - b.sortOrder),
    new: [newCard],
  };
};

export const playerDrawDiscard = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game' };
  }
};

export const drawCard = (drawPile) => {
  const randomIndex = Math.floor(Math.random() * drawPile.length);
  const chosenCard = drawPile.splice(randomIndex, 1);
  return chosenCard[0];
};
