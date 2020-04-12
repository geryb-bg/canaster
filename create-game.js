import dockerNames from 'docker-names';
import { cards } from './data/cards.js';
import { rules } from './data/rules.js';
import { games } from './data/game.js';
import { drawCard } from './play-game.js';

export const createGame = () => {
  const newGameId = getName();
  const gameState = {
    gameId: newGameId,
    started: false,
    players: [],
    drawPile: [],
    discardPile: [],
  };
  games.push(gameState);
  return gameState;
};

const getName = () => {
  const name = dockerNames.getRandomName();
  const game = games.find((g) => g.gameId === name);
  if (game) {
    getName();
  }
  return name;
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
    cards: [],
    meld: [],
    points: 0,
  };
  game.players.push(player);
  return 'Added';
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
  assignPacks(game);
  dealCards(game);
  return game;
};

const assignPacks = (game) => {
  const numPacks = rules.packs.find((p) => p.players === game.players.length);
  for (let i = 0; i < numPacks.packs; i++) {
    game.drawPile = game.drawPile.concat(cards.onePack);
  }
};

const dealCards = (game) => {
  for (let player of game.players) {
    for (let i = 0; i < rules.startingHand; i++) {
      player.cards.push(drawCard(game.drawPile));
    }
  }
  drawPileTurnOver(game.drawPile, game.discardPile, drawCard(game.drawPile), true);
  drawPileTurnOver(game.drawPile, game.discardPile, drawCard(game.drawPile), true);
  drawPileTurnOver(game.drawPile, game.discardPile, drawCard(game.drawPile), true);
  drawPileTurnOver(game.drawPile, game.discardPile, drawCard(game.drawPile), false);
};

const drawPileTurnOver = (drawPile, discardPile, card, upsideDown) => {
  discardPile.push(card);

  if (upsideDown) return;

  const isSpecialCard = cards.specialCards.find((c) => c === card.value);
  if (isSpecialCard) {
    if (card.value === '3' && card.colour === 'black') {
      discardPile = [];
    } else {
      drawPileTurnOver(drawPile, discardPile, drawCard(drawPile), false);
    }
  }
};
