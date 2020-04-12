import dockerNames from 'docker-names';
import cards from './data/cards.json';
import rules from './data/rules.json';
import { games } from './game';

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
};

const assignPacks = (game) => {
  const numPacks = rules.packs.find((p) => p.players === game.players.length);
  for (const i = 0; i < numPacks.packs; i++) {
    game.cards.push(cards.onePack);
  }
};

const dealCards = (game) => {
  for (const player of players) {
    for (const i = 0; i < rules.startingHand; i++) {
      player.cards.push(drawCard(game.drawPile));
    }
  }
  discardCard(game.drawPile, game.discardPile, drawCard(game.drawPile), false, true);
  discardCard(game.drawPile, game.discardPile, drawCard(game.drawPile), false, true);
  discardCard(game.drawPile, game.discardPile, drawCard(game.drawPile), false, true);
  discardCard(game.drawPile, game.discardPile, drawCard(game.drawPile), true, false);
};

const drawCard = (drawPile) => {
  const randomIndex = Math.floor(Math.random() * drawPile.length);
  const chosenCard = drawPile.splice(randomIndex, 1);
  return chosenCard[0];
};

const discardCard = (drawPile, discardPile, card, firstTurn, upsideDown) => {
  discardPile.push(card);

  if (upsideDown) return;

  const isSpecialCard = cards.specialCards.find((c) => c === card.value);
  if (firstTurn) {
    discardCard(drawPile, discardPile, drawCard(drawPile), true, false);
  } else if (card.value === '3' && card.colour === 'black') {
    discardPile = [];
  }
};
