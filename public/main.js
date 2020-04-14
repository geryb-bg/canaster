import '../components/game-button/game-button.js';
import '../components/game-dialog/game-dialog.js';
import '../components/game-player/game-player.js';

import { fetchJson, getGameId, setGameInUrl, clearNode } from './common.js';

let game;
let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

function begin() {
  const gameId = getGameId();
  if (gameId) {
    showCurrentGame(gameId);
  } else {
    showCreateGame();
  }
}

function showCurrentGame(gameId) {
  getGameState(gameId);
}

async function getGameState(gameId) {
  const response = await fetchJson(`/game/${gameId}`, { method: 'GET' });
  if (!response.error) {
    game = response;

    loadGameDetails();

    socket.emit('join-game-host', game.gameId);

    socket.on('game-state', (gameState) => {
      game = gameState;
      loadGameDetails();
    });
  }
}

function loadGameDetails() {
  const gameName = document.querySelector('#game-name');
  gameName.innerText = game.gameId;
  const gameDetails = document.querySelector('#game-details');
  const startGameButton = document.querySelector('#start-game');

  const drawPile = document.querySelector('#draw-pile');
  clearNode(drawPile);
  const discardPile = document.querySelector('#discard-pile');
  clearNode(discardPile);

  if (game.started) {
    gameDetails.innerText = `Round: ${game.round}`;
    startGameButton.style.display = 'none';

    const drawPileCard = document.createElement('game-card');
    drawPileCard.stacked = true;
    drawPileCard.upsideDown = true;
    drawPile.appendChild(drawPileCard);

    const cardElement = document.createElement('game-card');

    let topCard;
    if (game.discardPile.length) {
      topCard = game.discardPile[game.discardPile.length - 1];
      cardElement.stacked = true;
    } else {
      topCard = game.blackThree;
      if (!topCard.suite) {
        topCard.value = '';
      }
    }
    cardElement.setAttribute('colour', topCard.colour);
    cardElement.setAttribute('value', topCard.value);
    cardElement.setAttribute('icon', topCard.icon);
    cardElement.setAttribute('suite', topCard.suite);
    discardPile.appendChild(cardElement);
  } else {
    gameDetails.innerText = `Waiting to start`;
    startGameButton.style.display = '';
    startGameButton.addEventListener('click', () => {
      startGame();
    });
  }

  addPlayers('players-top', 0, Math.floor(game.players.length / 2));
  addPlayers('players-bot', Math.floor(game.players.length / 2), game.players.length);
}

async function startGame() {
  const response = await fetchJson(`/game/${game.gameId}`, {
    method: 'PUT',
  });
  if (!response.error) {
    game = response;
    loadGameDetails();
  }
}

function addPlayers(container, start, end) {
  const playersContainer = document.querySelector(`#${container}`);
  clearNode(playersContainer);

  for (let i = start; i < end; i++) {
    const player = game.players[i];
    const playerElement = document.createElement('game-player');
    playerElement.setAttribute('name', player.name);
    playerElement.setAttribute('points', player.points);
    if (player.myTurn) {
      playerElement.setAttribute('turn', player.myTurn);
    }
    playerElement.redThrees = player.redThrees;
    //TODO: add melds
    playersContainer.appendChild(playerElement);
  }
}

function showCreateGame() {
  const createGameComponent = document.querySelector('#new-game');
  createGameComponent.style.display = '';

  const createGameButton = document.querySelector('#create-game');
  createGameButton.addEventListener('click', () => {
    createGame();
  });

  const joinGameButton = document.querySelector('#join-game');
  joinGameButton.addEventListener('click', () => {
    window.location = '/hand';
  });
}

async function createGame() {
  const response = await fetchJson(`/game`, {
    method: 'POST',
  });
  if (!response.error) {
    game = response;
    hideCreateGame();
    setGameInUrl(response.gameId);
    begin();
  }
}

function hideCreateGame() {
  const createGameComponent = document.querySelector('#new-game');
  createGameComponent.style.display = 'none';
}

begin();
