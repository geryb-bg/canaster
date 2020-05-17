import { cards } from '../data/cards.js';
import { rules } from '../data/rules.js';
import { getGameAndPlayer } from './player.js';

export const meldCardsWithDiscard = (playerName, gameId, meldedCards, socketio) => {
  const { game, player, errorMessage } = getGameAndPlayer(gameId, playerName);
  if (errorMessage) {
    return { error: errorMessage };
  }
  if (!game.started) {
    return { error: `${gameId} game has not yet started.` };
  }

  if (!player.myTurn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to tried to pick up the discard pile, but it is not their turn.`);
    return { error: 'It is not your turn!' };
  }

  if (player.hasDrawn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to pick up the discard pile.`);
    return { error: 'You have already drawn a card' };
  }

  if (!game.discardPile.length) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to pick up the discard pile, but there is nothing there.`);
    return { error: `Srsly??? What are you doing, that's a black 3` };
  }

  if (!player.cards.length) {
    socketio
      .toHost(gameId)
      .emit('show-message', `${playerName} tried to pick up the discard pile, \nbut is not allowed to as they have no cards in their hand.`);
    return { error: 'You need to have cards in your hand in order to pick up from the discard pile.' };
  }

  const discardCard = game.discardPile[game.discardPile.length - 1];
  if (discardCard.value === '2' || discardCard.value === 'Joker') {
    socketio.toHost(gameId).emit('show-message', `We are sorry, this game can not do Joker canasters yet.`);
    return { error: 'We are sorry, this game can not do Joker canasters yet.' };
  }
  const existingMeld = player.meld[discardCard.value];
  if (!existingMeld) {
    const newMeld = meldedCards.filter((c) => c.value === discardCard.value);
    if (newMeld.length < 2) {
      socketio.toHost(gameId).emit('show-message', `${playerName} tried to pick up the discard pile, but could not meld.`);
      return { error: 'The discard card does not fit into any of your melds.' };
    }
  }

  meldedCards.push(discardCard);

  const result = meldEverything(player, meldedCards, gameId, socketio);
  if (result.error) return result;

  player.hasDrawn = true;

  game.discardPile.pop();
  addCardsToHand(player, game.discardPile);
  const cardsPickedUpFromDiscard = game.discardPile;
  game.discardPile = [];

  // this will only happen on the first meld
  // so technically the draw pile should not be empty
  // this is why we don't care about the return of drawAgain
  if (player.extraFirstTurn) {
    player.extraFirstTurn--;
    drawAgain(game.drawPile, player, cardsPickedUpFromDiscard);
  }

  socketio.toHost(gameId).emit('game-state', game);

  let message = `${playerName} melded with the discard pile and picked up ${cardsPickedUpFromDiscard.length} cards.`;
  message += `\nThey melded: `;
  for (let meldMsg of result.meldsMessage) {
    message += `${meldMsg}s `;
  }
  const numCanasters = Object.keys(player.canaster).length;
  if (numCanasters) {
    message += `\nThey have ${numCanasters} canaster${numCanasters === 1 ? '' : 's'}.`;
  }
  socketio.toHost(gameId).emit('show-message', message);

  const hand = player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    cards: hand,
    new: cardsPickedUpFromDiscard,
  };
};

const addCardsToHand = (player, discardPile) => {
  for (let cardToAdd of discardPile) {
    if (cardToAdd.value === '3' && cardToAdd.colour === 'red') {
      player.redThrees.push(cardToAdd);
    } else {
      player.cards.push(cardToAdd);
    }
  }
};

export const meldCards = (playerName, gameId, meldedCards, socketio) => {
  const { game, player, errorMessage } = getGameAndPlayer(gameId, playerName);
  if (errorMessage) {
    return { error: errorMessage };
  }
  if (!game.started) {
    return { error: `${gameId} game has not yet started.` };
  }

  if (!player.myTurn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to meld, but it is not their turn.`);
    return { error: 'It is not your turn!' };
  }
  if (!player.hasDrawn) {
    socketio.toHost(gameId).emit('show-message', `${playerName} tried to meld, but has not picked up a card yet.`);
    return { error: 'You must draw a card first' };
  }

  const result = meldEverything(player, meldedCards, gameId, socketio);
  if (result.error) return result;

  let message = `${playerName} has melded successfully.`;
  message += `\nThey melded: `;
  for (let meldMsg of result.meldsMessage) {
    message += `${meldMsg}s `;
  }

  const numCanasters = Object.keys(player.canaster).length;
  if (numCanasters) {
    message += `\nThey have ${numCanasters} canaster${numCanasters === 1 ? '' : 's'} already.`;
  }
  socketio.toHost(gameId).emit('show-message', message);
  socketio.toHost(gameId).emit('game-state', game);

  return result.hand;
};

const meldEverything = (player, meldedCards, gameId, socketio) => {
  if (!meldedCards.length) {
    socketio.toHost(gameId).emit('show-message', `${player.name} tried to meld without any cards.`);
    return { error: 'Please select cards to meld.' };
  }

  const invalidCards = [];
  const newMeld = groupMeldedCards(meldedCards, invalidCards);
  if (invalidCards.length) {
    socketio.toHost(gameId).emit('show-message', `${player.name} tried to meld with invalid cards.`);
    return { error: 'You have submitted one or more cards that can not be melded' };
  }

  const newCanasters = {};
  const meldsMessage = [];
  if (Object.keys(player.meld).length) {
    for (let meldKey of Object.keys(newMeld)) {
      const meld = newMeld[meldKey];
      const existingMeld = player.meld[meldKey];

      if (existingMeld) {
        const combinedMeld = [...existingMeld, ...meld];

        const numJokers = combinedMeld.filter((c) => c.value === 'Joker' || c.value === '2').length;
        if (numJokers >= combinedMeld.length - numJokers) {
          socketio.toHost(gameId).emit('show-message', `${player.name} tried to meld with too many jokers.`);
          return { error: `${meldKey}s meld has too many jokers` };
        }

        player.meld[meldKey] = combinedMeld;

        if (combinedMeld.length >= 7) {
          newCanasters[meldKey] = { value: meldKey, colour: numJokers ? 'black' : 'red' };
        }
      } else {
        const errorMessage = isValidMeld(meld, meldKey);
        if (errorMessage) {
          socketio.toHost(gameId).emit('show-message', `${player.name} tried to meld, but made a mistake.`);
          return { error: errorMessage };
        }

        player.meld[meldKey] = meld;

        if (meld.length >= 7) {
          const numJokers = meld.filter((c) => c.value === 'Joker' || c.value === '2').length;
          newCanasters[meldKey] = { value: meldKey, colour: numJokers ? 'black' : 'red' };
        }
      }
      meldsMessage.push(meldKey);
    }
  } else {
    let totalScore = 0;
    for (let meldKey of Object.keys(newMeld)) {
      const meld = newMeld[meldKey];
      const errorMessage = isValidMeld(meld, meldKey);
      if (errorMessage) {
        socketio.toHost(gameId).emit('show-message', `${player.name} tried to meld, but made a mistake.`);
        return { error: errorMessage };
      }

      const jokers = meld.filter((c) => c.value === 'Joker');
      const twos = meld.filter((c) => c.value === '2');
      const numJokers = jokers.length + twos.length;
      //joker
      totalScore += rules.cardPoints['Joker'] * jokers.length;
      //two
      totalScore += rules.cardPoints['2'] * twos.length;
      //remainder
      totalScore += rules.cardPoints[meldKey] * (meld.length - numJokers);

      if (meld.length >= 7) {
        newCanasters[meldKey] = { value: meldKey, colour: numJokers ? 'black' : 'red' };
      }
      meldsMessage.push(meldKey);
    }

    const requiredMeldPoints = rules.meldPoints.find((p) => p.moreThan <= player.points && p.lessThan > player.points);
    if (requiredMeldPoints.required > totalScore) {
      socketio.toHost(gameId).emit('show-message', `${player.name} tried to meld with ${totalScore},\nbut requires ${requiredMeldPoints.required}.`);
      return { error: `Your meld only has ${totalScore} points and you require ${requiredMeldPoints.required}` };
    }

    player.meld = newMeld;
  }

  for (let card of meldedCards) {
    const playerCard = player.cards.find((c) => c.value === card.value && c.suite === card.suite);
    const indexOfDiscarded = player.cards.indexOf(playerCard);
    if (indexOfDiscarded > -1) {
      player.cards.splice(indexOfDiscarded, 1);
    }
  }

  player.canaster = { ...player.canaster, ...newCanasters };

  const hand = player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
  return { hand, meldsMessage };
};

const groupMeldedCards = (meldedCards, invalidCards) => {
  return meldedCards.reduce((group, card) => {
    const isSpecialCard = cards.specialCards.find((c) => c === card.value);
    if (isSpecialCard) {
      if (card.value === '3') {
        invalidCards.push(card);
      } else {
        if (!card.actingAs) {
          invalidCards.push(card);
        }
        addCardToMeld(group, card.actingAs, card);
      }
    } else {
      addCardToMeld(group, card.value, card);
    }

    return group;
  }, {});
};

const addCardToMeld = (group, key, card) => {
  let currentMeld = group[key] || [];

  currentMeld = [...currentMeld, card];

  group[key] = currentMeld;
};

const isValidMeld = (meld, meldKey) => {
  if (meld.length < 3) {
    return `${meldKey}s meld does not have enough cards to meld`;
  }
  const numJokers = meld.filter((c) => c.value === 'Joker' || c.value === '2').length;
  if (numJokers >= meld.length - numJokers) {
    return `${meldKey}s meld has too many jokers`;
  }
};
