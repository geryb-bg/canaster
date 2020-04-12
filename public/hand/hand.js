import "../components/game-card/game-card.js";
import "../components/game-dialog/game-dialog.js";
import "../components/game-button/game-button.js";

let hand = [];

function onLoad() {
  if (getPlayerName() && getGameId()) {
    fetchHand().then(() => {
      renderHand();
    });
  } else {
    showAddNewPlayer();
  }
}

function showAddNewPlayer() {
  const newPlayer = document.querySelector("#new-player");
  newPlayer.style.display = "";
  const addNewPlayerButton = document.querySelector("#add-new-player-button");
  addNewPlayerButton.addEventListener("click", () => {
    addNewPlayer();
  });
}

function hideAddNewPlayer() {
  const newPlayer = document.querySelector("#new-player");
  newPlayer.style.display = "none";
}

async function addNewPlayer() {
  const playerNameInput = document.querySelector("#player-name");
  const gameIdInput = document.querySelector("#game-id");
  const playerName = playerNameInput.value;
  const gameId = gameIdInput.value;

  if (!gameId) {
    document.dispatchEvent(
      new CustomEvent("show-message", {
        detail: { message: "Please enter a game name" },
      })
    );
    return;
  }

  if (!playerName) {
    document.dispatchEvent(
      new CustomEvent("show-message", {
        detail: { message: "Please enter your name" },
      })
    );
    return;
  }

  const response = await fetchJson(`/player/${playerName}/${gameId}`, {
    method: "POST",
  });
  if (!response.error && response.msg === "Added") {
    hideAddNewPlayer();
    setPlayerAndGameInUrl(playerName, gameId);
    onLoad();
  }
}

async function fetchHand() {
  let playerId = getPlayerName();
  let gameId = getGameId();
  const response = await fetchJson(`/cards/${playerId}/${gameId}`);

  if (response.waiting) {
    showWaitForGameToStart();
    setTimeout(fetchHand, 4000)
  } else {
    hideWaitForGameToStart();
    hand = response;
  }
}

function showWaitForGameToStart() {
  document.querySelector('#waiting-overlay').style.display = "";
}

function hideWaitForGameToStart() {
  document.querySelector('#waiting-overlay').style.display = "none";
}

function clearNode(node) {
  while (node.lastElementChild) {
    node.removeChild(node.lastElementChild);
  }
}

function renderHand() {
  const cardRow = document.querySelector("#card-row");

  clearNode(cardRow);

  for (let card of hand) {
    const cardElement = document.createElement("game-card");
    cardElement.setAttribute("colour", card.colour);
    cardElement.setAttribute("value", card.value);
    cardElement.setAttribute("icon", card.icon);
    cardElement.setAttribute("suite", card.suite);
    cardRow.appendChild(cardElement);
  }
}

function getSelectedCards() {
  const cardElements = document.querySelectorAll("game-card[selected]");
  const res = [];
  cardElements.forEach((c) => {
    res.push(c.getCard());
  });
  return res;
}

function getUrlHashParams() {
  return new URLSearchParams(
    window.location.hash.substr(1) // skip the first char (#)
  );
}

function setPlayerAndGameInUrl(playerName, gameId) {
  window.location.hash = `player_name=${playerName}&game_id=${gameId}`;
}

function getPlayerName() {
  return getUrlHashParams().get("player_name");
}

function getGameId() {
  return getUrlHashParams().get("game_id");
}

async function fetchJson(url, options = {}) {
  try {
    const response = await (await fetch(url, options)).json();
    if (response.error) {
      document.dispatchEvent(
        new CustomEvent("show-message", {
          detail: { message: response.error },
        })
      );
    }
    return response;
  } catch (e) {
    document.dispatchEvent(
      new CustomEvent("show-message", {
        detail: { message: e.message },
      })
    );
  }
}

const drawButton = document.querySelector("#draw");
drawButton.addEventListener("click", () => {
  console.log(getSelectedCards());
});

onLoad();
