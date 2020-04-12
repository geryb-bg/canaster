import cardTypes from 'data/cards.json';
import rules from 'data/rules.json';

const games = [];

export const createGame = () => {
  const newGameId = Math.floor(Math.random() * Math.floor(9999));
  const gameState = {
    gameId: newGameId,
    started: false,
    players: [],
  };
  games.push(gameState);
};

export const playerJoins = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (game.started) {
    return 'This game has already started, please join a different game';
  }

  const playerExists = game.players.find((p) => p.name === playerName);
  if (playerExists) {
  }

  const player = {
    name: playerName,
  };
};
