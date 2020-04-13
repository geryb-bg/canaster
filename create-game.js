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
    round: 0,
    blackThree: {
      value: '3',
      icon: '♣️',
      colour: 'black',
      suite: 'clubs',
      sortOrder: 2,
    },
  };
  games.push(gameState);
  return gameState;
};

const getName = () => {
  let name = dockerNames.getRandomName();
  name = name.replace('_', '-');
  const game = games.find((g) => g.gameId === name);
  if (game) {
    getName();
  }
  return name;
};

export const playerJoins = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game) {
    return { error: 'This game does not exist.' };
  }

  const playerExists = game.players.find((p) => p.name === playerName);
  if (playerExists) {
    return { msg: 'Player joined' };
  }

  if (game.started) {
    return { error: 'This game has already started, please join a different game.' };
  }
  if (game.players.length === 8) {
    return { error: 'This game has too many players, please join a different game.' };
  }

  const player = {
    name: playerName,
    cards: [],
    meld: {},
    points: 0,
    redThrees: [],
    myTurn: false,
    hasDrawn: false,
    extraFirstTurn: 0,
    canaster: [],
  };
  game.players.push(player);
  return { msg: 'Player joined' };
};

export const startGame = (gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game) {
    return { error: 'This game does not exist.' };
  }
  if (game.players.length < 2) {
    return { error: 'A game needs at least two players.' };
  }
  if (game.round > 0) {
    clearGameBoard(game);
  }

  game.started = true;
  game.round++;
  const playersTurn = game.round % game.players.length;
  game.players[playersTurn].myTurn = true;
  assignPacks(game);
  dealCards(game);
  return game;
};

const clearGameBoard = (game) => {
  game.drawPile = [];
  game.discardPile = [];
  for (let player of game.players) {
    player.cards = [];
    player.meld = {};
    player.redThrees = [];
    player.myTurn = false;
    player.hasDrawn = false;
    player.extraFirstTurn = 0;
  }
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
      const newCard = drawCard(game.drawPile);
      if (newCard.value === '3' && newCard.colour === 'red') {
        player.redThrees.push(newCard);
        player.extraFirstTurn++;
      } else {
        player.cards.push(newCard);
      }
    }
  }
  drawPileTurnOver(game, drawCard(game.drawPile), true);
  drawPileTurnOver(game, drawCard(game.drawPile), true);
  drawPileTurnOver(game, drawCard(game.drawPile), true);
  drawPileTurnOver(game, drawCard(game.drawPile), false);
};

const drawPileTurnOver = (game, card, upsideDown) => {
  game.discardPile.push(card);

  if (upsideDown) return;

  const isSpecialCard = cards.specialCards.find((c) => c === card.value);
  if (isSpecialCard) {
    if (card.value === '3' && card.colour === 'black') {
      game.discardPile = [];
      game.blackThree.icon = card.icon;
      game.blackThree.suite = card.suite;
    } else {
      drawPileTurnOver(game.drawPile, game.discardPile, drawCard(game.drawPile), false);
    }
  }
};
