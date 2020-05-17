import '../components/game-button/game-button.js';
import '../components/game-dialog/game-dialog.js';
import '../components/game-player/game-player.js';

import { fetchJson, getGameId, setGameInUrl, clearNode } from './common.js';

const startGameButton = document.querySelector('#start-game');
startGameButton.onclick = () => {
  startGame();
};

const gameOptions = document.querySelector('#game-options');

const createGameButton = document.querySelector('#create-game');
createGameButton.onclick = () => {
  createGame();
};
const joinGameButton = document.querySelector('#join-game');
joinGameButton.onclick = () => {
  window.location = '/hand';
};
const rulesPageButton = document.querySelector('#rules-page');
rulesPageButton.onclick = () => {
  window.open('/rules');
};

let game;
let socket = io();

socket.on('connect', () => {
  hideConnectionError();
  console.log('connected to server');
});

socket.on('game-state', (gameState) => {
  game = gameState;
  loadGameDetails();
});

socket.on('disconnect', (reason) => {
  showConnectionError();
  console.log('disconnect');
});

socket.on('reconnect', (attemptNumber) => {
  hideConnectionError();
  console.log('reconnected');
  begin();
});

let hideMsgTimeout;

socket.on('show-message', (msg) => {
  clearTimeout(hideMsgTimeout);
  const msgElement = document.querySelector('#show-message');
  msgElement.innerText = msg;
  hideMsgTimeout = setTimeout(() => {
    msgElement.innerText = '';
  }, 20000);
});

function begin() {
  const gameId = getGameId();
  if (gameId) {
    showCurrentGame(gameId);
  } else {
    showCreateGame();
  }
}

function showConnectionError() {
  const connectionOverlay = document.querySelector('#connection-overlay');
  connectionOverlay.style.display = '';
}

function hideConnectionError() {
  const connectionOverlay = document.querySelector('#connection-overlay');
  connectionOverlay.style.display = 'none';
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

  const msgElement = document.querySelector('#show-message');
  msgElement.innerText = "";

  if (game.gameOver) {
    gameDetails.innerText = `Game Over! The winner is ${game.winner}`;
    startGameButton.style.display = 'none';
    renderPlayers(game);
    return;
  }

  if (!game.started) {
    gameDetails.innerText = `Waiting to start`;
    startGameButton.style.display = '';
    gameOptions.style.display = '';
  } else if (game.roundStarted) {
    gameDetails.innerText = `Round: ${game.round}`;
    startGameButton.style.display = 'none';
    gameOptions.style.display = 'none';

    const drawPileCard = document.createElement('game-card');
    drawPileCard.stacked = true;
    drawPileCard.upsideDown = true;
    if (game.drawPile.length === 1) {
      drawPileCard.stacked = false;
    }
    if (game.drawPile.length === 0) {
      drawPileCard.empty = true;
    }
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
    cardElement.setAttribute('sortOrder', topCard.sortOrder);
    discardPile.appendChild(cardElement);

    setRemainingCardsLeft(game)
  } else {
    gameDetails.innerText = `End of round ${game.round}, click to start the next round.`;
    startGameButton.style.display = '';
    gameOptions.style.display = 'none';
  }

  renderPlayers(game);
}

function setRemainingCardsLeft(game) {
  const cardsRemainingElement = document.querySelector('#cards-remaining');

  const cardsLeft = game.drawPile.length;
  if (cardsLeft <= 10) {
    if (cardsLeft === 1) {
      cardsRemainingElement.innerText = `${cardsLeft} card left`
    } else {
      cardsRemainingElement.innerText = `${cardsLeft} cards left`
    }
    cardsRemainingElement.style.display = '';
  } else {
    cardsRemainingElement.innerText = ``;
    cardsRemainingElement.style.display = 'none';
  }


}

function renderPlayers(game) {
  addPlayers('players-top', 0, Math.floor(game.players.length / 2));
  addPlayers('players-bot', Math.floor(game.players.length / 2), game.players.length);
}

async function startGame() {
  const response = await fetchJson(`/game/${game.gameId}`, {
    method: 'PUT',
    body: JSON.stringify(getGameOptions()),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.error) {
    game = response;
    loadGameDetails();
  }
}

function getGameOptions() {
  const shufflePlayersCheckbox = document.querySelector('#option-shuffle-players');
  return {
    shufflePlayers: shufflePlayersCheckbox.checked
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
