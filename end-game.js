import { games } from './data/game.js';
import { rules } from './data/rules.js';

export const endRound = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);

  //   for (let player of game.players) {
  //     //addPoints
  //     //winner
  //     if (player.name === playerName) {
  //       player.points +=
  //     }
  //     //canasters
  //     //red threes
  //     //cards

  //     //subtractPoints
  //     //red threes
  //     //black threes
  //     //cards
  //   }

  return '';
};
