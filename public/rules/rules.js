import '../components/game-dialog/game-dialog.js';

import { fetchJson, clearNode } from '../common.js';

const cardDeckList = document.querySelector('#card-deck');
const meldPointsList = document.querySelector('#meld-points');
const otherPointsList = document.querySelector('#other-points');
const cardPointsList = document.querySelector('#card-points');

const startingHand = document.querySelector('#starting-hand');
const roundWinPoints = document.querySelector('#win-points');
const gameWinPoints = document.querySelector('#winning-points');

async function begin() {
  const response = await fetchJson(`/allrules`, {
    method: 'GET',
  });
  if (!response.error) {
    const rules = response;
    startingHand.innerText = rules.startingHand;
    roundWinPoints.innerText = rules.otherPoints.win;
    gameWinPoints.innerText = rules.winningPoints;

    clearNode(cardDeckList);
    for (let deck of rules.packs) {
      const deckElement = document.createElement('li');
      deckElement.innerText = `Players: ${deck.players} Decks: ${deck.packs}`;
      cardDeckList.appendChild(deckElement);
    }

    clearNode(meldPointsList);
    for (let points of rules.meldPoints) {
      const pointsElement = document.createElement('li');
      pointsElement.innerText = `From ${points.moreThan} up to ${points.lessThan - 1}, you require ${points.required} points.`;
      meldPointsList.appendChild(pointsElement);
    }

    clearNode(otherPointsList);
    for (let points of Object.keys(rules.otherPoints)) {
      const pointsElement = document.createElement('li');
      let text = '';
      switch (points) {
        case 'blackThree':
          text = `${rules.otherPoints[points]} points for a black 3`;
          break;
        case 'redThree':
          text = `${rules.otherPoints[points]} points for a red 3`;
          break;
        case 'canaster':
          const anotherElement = document.createElement('li');
          anotherElement.innerText = `${rules.otherPoints[points].black} points for a black canaster`;
          otherPointsList.appendChild(anotherElement);
          text = `${rules.otherPoints[points].red} points for a red canaster`;
          break;
      }
      if (text) {
        pointsElement.innerText = text;
        otherPointsList.appendChild(pointsElement);
      }
    }

    clearNode(cardPointsList);
    for (let points of Object.keys(rules.cardPoints)) {
      const pointsElement = document.createElement('li');
      pointsElement.innerText = `${rules.cardPoints[points]} for a ${points}`;
      cardPointsList.appendChild(pointsElement);
    }
  }
}

begin();
