import "../components/game-card/game-card.js";

let hand = [];

async function fetchHand() {
  let playerId = "player";
  let gameId = "game";
  hand = await (await fetch(`/cards/${gameId}/${playerId}`)).json();
}

function renderHand() {
  const cardRow = document.querySelector("#card-row");

  for (let card of hand) {
    const cardElement = document.createElement("game-card");
    cardRow.appendChild(cardElement);
  }
}

fetchHand().then(() => {
  renderHand();
});
