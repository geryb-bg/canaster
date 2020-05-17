import { getGameAndPlayer } from './player.js';
import { endRound } from './end-game.js';

export const playerDraw = (playerName, gameId, socketio) => {
  const { game, player, errorMessage } = getGameAndPlayer(gameId, playerName);
  if (errorMessage) {
    return { error: errorMessage };
  }
  if (!game.started) {
    return { error: `${gameId} game has not yet started.` };
  }

  if (!player.myTurn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to draw a card, but it is not their turn.`);
    return { error: 'It is not your turn!' };
  }
  if (player.hasDrawn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to draw another card.`);
    return { error: 'You have already drawn a card' };
  }
  if (!game.drawPile.length) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to draw a card.`);
    return { error: 'There are no cards in the draw pile, you must either pick up the discard pile or end your turn.' };
  }

  const newCards = [];
  const drawResult = drawAgain(game.drawPile, player, newCards);

  if (drawResult.endGame) {
    const cards = endRound('', gameId, socketio);
    return { cards, new: newCards };
  }

  player.hasDrawn = true;

  let message = `${playerName} has drawn a card.`;
  if (newCards.length > 1) {
    message = `${playerName} has drawn a card\nand ${newCards.length - 1} card${newCards.length === 2 ? '' : 's'} for their red three${
      newCards.length === 2 ? '' : 's'
    }`;
  }

  socketio.toHost(gameId).emit('game-state', game);
  socketio.toHost(gameId).emit('show-message', message);

  const hand = player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    cards: hand,
    new: newCards,
  };
};

const drawAgain = (drawPile, player, newCards) => {
  const newCard = drawCard(drawPile);
  newCards.push(newCard);

  if (newCard.value === '3' && newCard.colour === 'red') {
    player.redThrees.push(newCard);
    player.extraFirstTurn++;
    if (drawPile.length === 0) {
      return { endGame: true };
    }
  } else {
    player.cards.push(newCard);
    if (drawPile.length === 0) {
      return { endGame: false };
    }
  }

  if (player.extraFirstTurn) {
    player.extraFirstTurn--;
    return drawAgain(drawPile, player, newCards);
  }

  return { endGame: false };
};

export const drawCard = (drawPile) => {
  const randomIndex = Math.floor(Math.random() * drawPile.length);
  const chosenCard = drawPile.splice(randomIndex, 1);
  return chosenCard[0];
};
