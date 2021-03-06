import '../components/error-message/error-message.js';

export async function fetchJson(url, options = {}) {
  try {
    const response = await (await fetch(url, options)).json();
    if (response.error) {
      document.dispatchEvent(
        new CustomEvent('show-message', {
          detail: { message: response.error },
        })
      );
    }
    return response;
  } catch (e) {
    document.dispatchEvent(
      new CustomEvent('show-message', {
        detail: { message: e.message },
      })
    );
  }
}

function getUrlHashParams() {
  return new URLSearchParams(
    window.location.hash.substr(1) // skip the first char (#)
  );
}

export function setPlayerAndGameInUrl(playerName, gameId) {
  window.location.hash = `player_name=${playerName}&game_id=${gameId}`;
}

export function setGameInUrl(gameId) {
  window.location.hash = `game_id=${gameId}`;
}

export function getPlayerName() {
  return getUrlHashParams().get('player_name');
}

export function getGameId() {
  return getUrlHashParams().get('game_id');
}

export function clearNode(node) {
  while (node.lastElementChild) {
    node.removeChild(node.lastElementChild);
  }
}

export function showError(msg) {
  document.dispatchEvent(
    new CustomEvent('show-message', {
      detail: { message: msg },
    })
  );
}

export function groupCards(cardPoints) {
  return Object.keys(cardPoints).reduce((group, currentCardValue) => {
    const currentPointsValue = cardPoints[currentCardValue];
    let currentGroup = group[currentPointsValue] || [];

    currentGroup.push(currentCardValue);

    group[currentPointsValue] = currentGroup;

    return group;
  }, {});
}

import './libs/NoSleep.js'

export const requestWakeLock = async () => {
  const noSleep = new NoSleep();
  document.addEventListener('click', function enableNoSleep() {
    console.log('Wake lock enabled');
    document.removeEventListener('click', enableNoSleep, false);
    noSleep.enable();
  }, false);
};
