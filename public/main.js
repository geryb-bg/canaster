import '../components/game-button/game-button.js';
import '../components/game-dialog/game-dialog.js';
import '../components/game-player/game-player.js';

import { fetchJson, getGameId, setGameInUrl, clearNode } from './common.js';

let game;

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

    //setTimeout(() => getGameState(gameId), 5000);
  }
}

function loadGameDetails() {
  const gameName = document.querySelector('#game-name');
  gameName.innerText = game.gameId;

  const playersContainer = document.querySelector('#players');

  clearNode(playersContainer);

  for (let player of game.players) {
    const playerElement = document.createElement('game-player');
    playerElement.setAttribute('name', player.name);
    if (player.myTurn) {
      playerElement.setAttribute('turn', player.myTurn);
    }
    playerElement.redThrees = player.redThrees;
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
