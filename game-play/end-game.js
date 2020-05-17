import { games } from '../data/game.js';
import { rules } from '../data/rules.js';

export const endRound = (winnerName, gameId, socketio) => {
  const game = games.find((g) => g.gameId === gameId.toLowerCase());

  let roundScores = {};

  for (let player of game.players) {
    const pointsAtStartOfRound = player.points;
    //addPoints
    //winner
    if (player.name.toLowerCase() === winnerName.toLowerCase()) {
      player.points += rules.otherPoints.win;
    }
    //canasters
    for (let canasterId of Object.keys(player.canaster)) {
      const canaster = player.canaster[canasterId];
      player.points += rules.otherPoints.canaster[canaster.colour];
    }
    //red threes
    if (Object.keys(player.meld).length) {
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
    if (!Object.keys(player.meld).length) {
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

    roundScores[player.name] = player.points - pointsAtStartOfRound;

    if (player.points >= rules.winningPoints) {
      if (game.gameOver && player.points < game.winningScore) {
        continue;
      }
      game.winner = player.name;
      game.winningScore = player.points;
      game.gameOver = true;
    }
  }

  // If game is over show total scores
  if (game.winner) {
    for (let player of game.players) {
      roundScores[player.name] = player.points;
    }
    socketio.toPlayers(gameId).emit('game-over', { winner: game.winner, round: game.round, scores: roundScores });
  } else {
    socketio.toPlayers(gameId).emit('round-over', { winner: winnerName, round: game.round, scores: roundScores });
  }

  game.roundStarted = false;

  socketio.toHost(game.gameId).emit('game-state', game);

  return [];
};
