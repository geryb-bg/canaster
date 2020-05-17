import { endRound } from './end-game.js';
import { getGameAndPlayer } from './player.js';

export const playerDiscard = (playerName, gameId, card, socketio) => {
  const { game, player, errorMessage } = getGameAndPlayer(gameId, playerName);
  if (errorMessage) {
    return { error: errorMessage };
  }
  if (!game.started) {
    return { error: `${gameId} game has not yet started.` };
  }

  if (!player.myTurn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to discard a card, but it is not their turn.`);
    return { error: 'It is not your turn!' };
  }
  if (!player.hasDrawn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to discard a card before drawing one.`);
    return { error: 'You must draw a card first' };
  }

  if (!card) {
    endPlayerTurn(player, game, socketio);
    return [];
  }

  const playerCard = player.cards.find((c) => c.value === card.value && c.suite === card.suite);
  const indexOfDiscarded = player.cards.indexOf(playerCard);
  if (indexOfDiscarded < 0) {
    socketio
      .toHost(gameId)
      .emit('show-message', `Not sure how, but ${playerName} tried to discard a card they don't have. Could you please stop trying to cheat?`);
    return { error: 'This card is not in your hand' };
  }

  player.cards.splice(indexOfDiscarded, 1);

  if (!player.cards.length && Object.keys(player.canaster).length) {
    endRound(playerName, gameId, socketio);
    return [];
  } else {
    game.discardPile.push(card);

    if (card.value === '3' && card.colour === 'black') {
      game.discardPile = [];
      game.blackThree.icon = card.icon;
      game.blackThree.suite = card.suite;
    }

    endPlayerTurn(player, game, socketio);

    const hand = player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
    return hand;
  }
};

const endPlayerTurn = (player, game, socketio) => {
  player.myTurn = false;
  player.hasDrawn = false;
  let playersTurn = game.players.indexOf(player) + 1;
  if (playersTurn === game.players.length) {
    playersTurn = 0;
  }
  game.players[playersTurn].myTurn = true;

  socketio.toHost(game.gameId).emit('game-state', game);
  socketio.toHost(game.gameId).emit('show-message', `${player.name}'s turn has ended.\nIt is now ${game.players[playersTurn].name}'s turn.`);

  socketio.toPlayers(game.gameId).emit('turn-change', game.players[playersTurn].name);
};
