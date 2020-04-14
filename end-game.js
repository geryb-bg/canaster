import { games } from './data/game.js';
import { rules } from './data/rules.js';

export const endRound = (playerName, gameId, socketio) => {
  const game = games.find((g) => g.gameId === gameId);

  for (let player of game.players) {
    //addPoints
    //winner
    if (player.name === playerName) {
      player.points += rules.otherPoints.win;
    }
    //canasters
    for (let canaster of player.canaster) {
      player.points += rules.otherPoints.canaster[canaster.colour];
    }
    //red threes
    if (player.meld !== {}) {
      player.points += player.redThrees.length * rules.otherPoints.redThree;
    }
    //cards
    for (let meldKey of Object.keys(player.meld)) {
      const meld = player.meld[meldKey];

      const jokers = meld.filter((c) => c.value === 'Joker');
      const twos = meld.filter((c) => c.value === '2');
      const numJokers = jokers.length + twos.length;
      //joker
      player.points += rules.cardPoints['Joker'] * jokers.length;
      //two
      player.points += rules.cardPoints['2'] * twos.length;
      //remainder
      player.points += rules.cardPoints[meldKey] * (meld.length - numJokers);
    }

    //subtractPoints
    //red threes
    if (player.meld === {}) {
      player.points -= player.redThrees.length * rules.otherPoints.redThree;
    }
    //other cards
    for (let card of player.cards) {
      if ((card.value === '3') & (card.colour === 'black')) {
        player.points -= rules.otherPoints.blackThree;
      } else {
        player.points -= rules.cardPoints[card.value];
      }
    }

    if (player.points >= rules.winningPoints) {
      if (game.gameOver && player.points < game.winningScore) {
        continue;
      }
      game.winner = player.name;
      game.winningScore = player.points;
      game.gameOver = true;
    }
  }

  game.roundStarted = false;

  socketio.toHost(gameId).emit('game-state', game);

  return game.winner;
};
