import '../components/game-button/game-button.js';
import '../components/game-dialog/game-dialog.js';
import '../components/game-player/game-player.js';

import { fetchJson, getGameId, setGameInUrl, clearNode } from './common.js';

const startGameButton = document.querySelector('#start-game');
startGameButton.onclick = () => {
  startGame();
};
const createGameButton = document.querySelector('#create-game');
createGameButton.onclick = () => {
  createGame();
};
const joinGameButton = document.querySelector('#join-game');
joinGameButton.onclick = () => {
  window.location = '/hand';
};

let game;
let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('game-state', (gameState) => {
  game = gameState;
  loadGameDetails();
});

let hideMsgTimeout;

socket.on('show-message', (msg) => {
  clearTimeout(hideMsgTimeout);
  const msgElement = document.querySelector('#show-message');
  msgElement.innerText = msg;
  hideMsgTimeout = setTimeout(() => {
    msgElement.innerText = '';
  }, 5000);
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
  }
}

function loadGameDetails() {
  const gameName = document.querySelector('#game-name');
  gameName.innerText = game.gameId;
  const gameDetails = document.querySelector('#game-details');

  const drawPile = document.querySelector('#draw-pile');
  clearNode(drawPile);
  const discardPile = document.querySelector('#discard-pile');
  clearNode(discardPile);

  if (game.gameOver) {
    gameDetails.innerText = `Game Over! The winner is ${game.winner}`;
    startGameButton.style.display = 'none';
    return;
  }

  if (!game.started) {
    gameDetails.innerText = `Waiting to start`;
    startGameButton.style.display = '';
  } else if (game.roundStarted) {
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
    gameDetails.innerText = `End of round ${game.round}, click to start the next round.`;
    startGameButton.style.display = '';
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
    playerElement.player = player;
    playersContainer.appendChild(playerElement);
  }
}

function showCreateGame() {
  const createGameComponent = document.querySelector('#new-game');
  createGameComponent.style.display = '';
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
