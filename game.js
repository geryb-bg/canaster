import cardTypes from 'data/cards.json';
import rules from 'data/rules.json';

const games = [];

export const createGame = () => {
  const newGameId = uuidv4();
  const gameState = {
    gameId: newGameId,
    started: false,
    players: [],
    cards: [],
  };
  games.push(gameState);
};

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const playerJoins = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game) {
    return 'This game does not exist.';
  }
  if (game.started) {
    return 'This game has already started, please join a different game.';
  }
  if (game.players.length === 8) {
    return 'This game has too many players, please join a different game.';
  }

  const playerExists = game.players.find((p) => p.name === playerName);
  if (playerExists) {
    return `This game already contains a player called ${playerName}, please choose a differentName.`;
  }

  const player = {
    name: playerName,
  };
  game.players.push(player);
};

export const startGame = (gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game) {
    return 'This game does not exist.';
  }
  if (game.started) {
    return 'This game has already started, how did you even get here?';
  }
  if (game.players.length < 2) {
    return 'A game needs at least two players.';
  }

  game.started = true;
  dealCards();
};

const dealCards = () => {};
