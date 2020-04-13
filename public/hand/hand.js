import '../components/game-card/game-card.js';
import '../components/game-button/game-button.js';
import '../components/game-dialog/game-dialog.js';
import '../components/card-collection/card-collection.js';
import '../components/card-dialog/card-dialog.js';

import { fetchJson, getGameId, getPlayerName, setPlayerAndGameInUrl, clearNode, showError } from '../common.js';

let hand = [];

function begin() {
  if (getPlayerName() && getGameId()) {
    fetchHand().then(() => {
      renderHand();
    });
  } else {
    showAddNewPlayer();
  }
}

function showAddNewPlayer() {
  const newPlayer = document.querySelector('#new-player');
  newPlayer.style.display = '';
  const addNewPlayerButton = document.querySelector('#add-new-player-button');
  addNewPlayerButton.addEventListener('click', () => {
    addNewPlayer();
  });
}

function hideAddNewPlayer() {
  const newPlayer = document.querySelector('#new-player');
  newPlayer.style.display = 'none';
}

async function addNewPlayer() {
  const playerNameInput = document.querySelector('#player-name');
  const gameIdInput = document.querySelector('#game-id');
  const playerName = playerNameInput.value;
  const gameId = gameIdInput.value;

  if (!gameId) {
    document.dispatchEvent(
      new CustomEvent('show-message', {
        detail: { message: 'Please enter a game name' },
      })
    );
    return;
  }

  if (!playerName) {
    document.dispatchEvent(
      new CustomEvent('show-message', {
        detail: { message: 'Please enter your name' },
      })
    );
    return;
  }

  const response = await fetchJson(`/player/${playerName}/${gameId}`, {
    method: 'POST',
  });
  if (!response.error && response.msg === 'Player joined') {
    hideAddNewPlayer();
    setPlayerAndGameInUrl(playerName, gameId);
    begin();
  }
}

async function fetchHand() {
  let playerId = getPlayerName();
  let gameId = getGameId();
  const response = await fetchJson(`/cards/${playerId}/${gameId}`);

  if (response.waiting) {
    showWaitForGameToStart();
    setTimeout(fetchHand, 4000);
  } else {
    hideWaitForGameToStart();
    hand = response;
  }
}

function showWaitForGameToStart() {
  document.querySelector('#waiting-overlay').style.display = '';
}

function hideWaitForGameToStart() {
  document.querySelector('#waiting-overlay').style.display = 'none';
}

function renderHand() {
  const cardRow = document.querySelector('#card-row');

  clearNode(cardRow);

  for (let card of hand) {
    const cardElement = document.createElement('game-card');
    cardElement.setAttribute('colour', card.colour);
    cardElement.setAttribute('value', card.value);
    cardElement.setAttribute('icon', card.icon);
    cardElement.setAttribute('suite', card.suite);
    cardElement.selectable = true;
    cardRow.appendChild(cardElement);
  }
}

function getSelectedCards() {
  const cardElements = document.querySelectorAll('game-card[selected]');
  const res = [];
  cardElements.forEach((c) => {
    res.push(c.getCard());
  });
  return res;
}

function showCardsInPopup(cards) {
  const message = cards.length > 1 ? 'Cards drawn:' : 'Card drawn:';
  document.dispatchEvent(
    new CustomEvent('show-cards', {
      detail: { message: message, cards: cards },
    })
  );
}

async function drawACard() {
  const response = await fetchJson(`/draw/${getPlayerName()}/${getGameId()}`);
  if (response.error) {
    return;
  }

  hand = response.cards;
  renderHand();
  showCardsInPopup(response.new);
}

async function discardCard() {
  const cards = getSelectedCards();

  if (cards.length === 0) {
    showError('Please select a card to discard');
    return;
  }

  if (cards.length > 1) {
    showError('You can only discard a single card');
    return;
  }

  const payload = {
    card: cards[0],
  };

  const response = await fetchJson(`/discard/${getPlayerName()}/${getGameId()}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.error) {
    return;
  }

  hand = response;
  renderHand();
}

const drawButton = document.querySelector('#draw');
drawButton.addEventListener('click', async () => drawACard());

const discardButton = document.querySelector('#discard');
discardButton.addEventListener('click', async () => discardCard());

begin();
