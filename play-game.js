import { games } from './data/game.js';

export const playerCards = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game.' };
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
    return { error: 'This player does not exist in this game.' };
  }
  if (!player.myTurn) {
    return { error: 'It is not your turn!' };
  }

  const newCards = [];
  drawAgain(game.drawPile, player, newCards);

  return {
    cards: player.cards.sort((a, b) => a.sortOrder - b.sortOrder),
    new: newCards,
  };
};

const drawAgain = (drawPile, player, newCards) => {
  const newCard = drawCard(drawPile);
  newCards.push(newCard);

  if (newCard.value === '3' && newCard.colour === 'red') {
    player.redThrees.push(newCard);
  } else {
    player.cards.push(newCard);
  }

  if (player.extraFirstTurn) {
    player.extraFirstTurn--;
    drawAgain(drawPile, player, newCards);
  }
};

export const playerDrawDiscard = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game.' };
  }
  if (!player.myTurn) {
    return { error: 'It is not your turn!' };
  }

  //TODO
};

export const drawCard = (drawPile) => {
  const randomIndex = Math.floor(Math.random() * drawPile.length);
  const chosenCard = drawPile.splice(randomIndex, 1);
  return chosenCard[0];
};
