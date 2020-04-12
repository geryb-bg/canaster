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
    console.log(card)
    const cardElement = document.createElement("game-card");
    cardElement.setAttribute('colour', card.colour);
    cardElement.setAttribute('value', card.value);
    cardElement.setAttribute('icon', card.icon);
    cardElement.setAttribute('suite', card.suite);
    cardRow.appendChild(cardElement);
  }
}

fetchHand().then(() => {
  renderHand();
});
