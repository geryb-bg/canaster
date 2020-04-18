import '../components/game-card/game-card.js';
import '../components/game-button/game-button.js';
import '../components/game-dialog/game-dialog.js';
import '../components/card-collection/card-collection.js';
import '../components/card-dialog/card-dialog.js';

import { fetchJson, getGameId, getPlayerName, setPlayerAndGameInUrl, clearNode, showError, groupCards } from '../common.js';

let hand = [];
let rules = undefined;
let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('game-started', () => {
  tryFetchHand().then(() => {
    renderHand();
  });
});

socket.on('game-over', (msg) => {
  showMessageOverlay(msg)
});

socket.on('round-over', (msg) => {
  showMessageOverlay(msg)
});

socket.on('turn-change', (player) => {
  setPlayerTurn(player);
});

function begin() {
  if (!rules) {
    fetchRules();
  }
  if (getPlayerName() && getGameId()) {
    socket.emit('join-game-player', getGameId());
    tryFetchHand().then(() => {
      renderHand();
    });
    getPlayerTurn();
  } else {
    showAddNewPlayer();
  }
}

async function fetchRules() {
  const response = await fetchJson(`/allrules`, {
    method: 'GET',
  });
  if (!response.error) {
    rules = response;
  }
}

async function getPlayerTurn() {
  const response = await fetchJson(`/turn/${getPlayerName()}/${getGameId()}`);
  if (!response.error) {
    setPlayerTurn(response.player);
  }
}

function setPlayerTurn(player) {
  if (player === getPlayerName()) {
    document.querySelector('#buttons').style.display = '';
    document.querySelector('#message').innerText = 'It is your turn';
  } else {
    document.querySelector('#buttons').style.display = 'none';
    document.querySelector('#message').innerText = `It is ${player}'s turn`;
  }
}

function showAddNewPlayer() {
  const newPlayer = document.querySelector('#new-player');
  newPlayer.style.display = '';
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

async function tryFetchHand() {
  let playerId = getPlayerName();
  let gameId = getGameId();
  const response = await fetchJson(`/cards/${playerId}/${gameId}`);

  if (response.waiting) {
    showMessageOverlay("Waiting for game to start");
  } else {
    hideMessageOverlay();
    hand = response;
  }
}

function showMessageOverlay(msg) {
  const overlay = document.querySelector('#waiting-overlay');
  overlay.innerText = msg;
  overlay.style.display = '';
}

function hideMessageOverlay() {
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

async function meld() {
  const selectedCards = getSelectedCards();
  if (selectedCards.length === 0) {
    showError('You must have at least one card selected');
    return;
  }

  const payload = {
    cards: selectedCards,
  };

  const response = await fetchJson(`/meld/${getPlayerName()}/${getGameId()}`, {
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

async function meldDiscard() {
  const payload = {
    cards: getSelectedCards(),
  };

  const response = await fetchJson(`/melddiscard/${getPlayerName()}/${getGameId()}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.error) {
    return;
  }

  hand = response.cards;
  renderHand();

  if (response.new && response.new.length > 0) {
    showCardsInPopup(response.new);
  }
}

function showInfo() {
  let message = '<h4>Melds</h4><ul>';
  for (let points of rules.meldPoints) {
    message += `<li>From ${points.moreThan} up to ${points.lessThan - 1}, you require ${points.required} points.</li>`;
  }
  message += '</ul><h4>Card Points</h4><ul>';
  const groupedPoints = groupCards(rules.cardPoints);
  for (let points of Object.keys(groupedPoints)) {
    message += `<li>${points} for `;
    for (let cardValues of groupedPoints[points]) {
      message += `${cardValues}, `;
    }
    message = message.substr(0, message.length - 2);
    message += '</li>';
  }
  message += '</ul>';
  document.dispatchEvent(
    new CustomEvent('show-message', {
      detail: { message },
    })
  );
}

const addNewPlayerButton = document.querySelector('#add-new-player-button');
addNewPlayerButton.onclick = () => addNewPlayer();

const drawButton = document.querySelector('#draw');
drawButton.onclick = async () => drawACard();

const discardButton = document.querySelector('#discard');
discardButton.onclick = async () => discardCard();

const meldButton = document.querySelector('#meld');
meldButton.onclick = async () => meld();

const meldDiscardButton = document.querySelector('#meld-discard');
meldDiscardButton.onclick = async () => meldDiscard();

const infoButton = document.querySelector('#info-button');
infoButton.onclick = async () => showInfo();

begin();
