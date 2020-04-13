import { games } from './data/game.js';
import { cards } from './data/cards.js';
import { rules } from './data/rules.js';

export const playerCards = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game) {
    return { error: 'This game does not exist.' };
  }
  if (!game.started) {
    return { waiting: true };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game.' };
  }

  return player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const playerDraw = (playerName, gameId) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game.' };
  }
  if (!player.myTurn) {
    return { error: 'It is not your turn!' };
  }
  if (player.hasDrawn) {
    return { error: 'You have already drawn a card' };
  }

  const newCards = [];
  drawAgain(game.drawPile, player, newCards);
  player.hasDrawn = true;

  return {
    cards: player.cards.sort((a, b) => a.sortOrder - b.sortOrder),
    new: newCards,
  };
};

const drawAgain = (drawPile, player, newCards) => {
  const newCard = drawCard(drawPile);
  newCards.push(newCard);

  if (newCard.value === '3' && newCard.colour === 'red') {
    player.redThrees.push(newCard);
  } else {
    player.cards.push(newCard);
  }

  if (player.extraFirstTurn) {
    player.extraFirstTurn--;
    drawAgain(drawPile, player, newCards);
  }
};

export const playerDiscard = (playerName, gameId, card) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game.' };
  }
  if (!player.myTurn) {
    return { error: 'It is not your turn!' };
  }
  if (!player.hasDrawn) {
    return { error: 'You must draw a card first' };
  }

  const playerCard = player.cards.find((c) => c.value === card.value && c.suite === card.suite);
  const indexOfDiscarded = player.cards.indexOf(playerCard);
  if (indexOfDiscarded < 0) {
    return { error: 'This card is not in your hand' };
  }

  player.cards.splice(indexOfDiscarded, 1);
  game.discardPile.push(card);

  if (card.value === '3' && card.colour === 'black') {
    game.discardPile = [];
    game.blackThree.icon = card.icon;
    game.blackThree.suite = card.suite;
  }

  player.myTurn = false;
  player.hasDrawn = false;
  let playersTurn = game.players.indexOf(player) + 1;
  if (playersTurn === game.players.length) {
    playersTurn = 0;
  }
  game.players[playersTurn].myTurn = true;

  return player.cards.sort((a, b) => a.sortOrder - b.sortOrder);
};

// export const playerDrawDiscard = (playerName, gameId, meldedCards) => {
//   const game = games.find((g) => g.gameId === gameId);
//   if (!game || !game.started) {
//     return { error: 'This game does not exist or has not yet started.' };
//   }
//   if (!game.discardPile.length) {
//     return { error: 'There is not discard pile to draw from.' };
//   }
//   const player = game.players.find((p) => p.name === playerName);
//   if (!player) {
//     return { error: 'This player does not exist in this game.' };
//   }
//   if (!player.myTurn) {
//     return { error: 'It is not your turn!' };
//   }

//   if (canDraw()) {
//     //give cards
//   } else {
//     return { error: 'You do not meet the requirements to draw from this pile' };
//   }
// };

// const canDraw = () => {
//   //scenario 1 - nothing in meld - must meet required points
//   //scenario 2 - top draw card exists in meld - just adding it
//   //scenrio 3 - top draw card not in meld - creating new group in meld
// };

export const meldCards = (playerName, gameId, meldedCards) => {
  const game = games.find((g) => g.gameId === gameId);
  if (!game || !game.started) {
    return { error: 'This game does not exist or has not yet started.' };
  }
  const player = game.players.find((p) => p.name === playerName);
  if (!player) {
    return { error: 'This player does not exist in this game.' };
  }
  if (!player.myTurn) {
    return { error: 'It is not your turn!' };
  }
  if (!meldedCards.length) {
    return { error: 'Please select cards to meld.' };
  }

  const invalidCards = [];
  const newMeld = groupMeldedCards(meldedCards, invalidCards);
  if (invalidCards.length) {
    return { error: 'You have submitted one or more cards that can not be melded' };
  }

  const canasters = [];
  if (Object.keys(player.meld).length) {
    for (let meldKey of Object.keys(newMeld)) {
      const meld = newMeld[meldKey];
      const existingMeld = player.meld[meldKey];

      if (existingMeld) {
        const combinedMeld = [...existingMeld, ...meld];

        const numJokers = combinedMeld.filter((c) => c.value === 'Joker' || c.value === '2').length;
        if (numJokers >= combinedMeld.length - numJokers) {
          return { error: `${meldKey}s meld has too many jokers` };
        }

        player.meld[meldKey] = combinedMeld;

        if (combinedMeld.length >= 8) {
          canasters.push({ value: meldKey, colour: numJokers ? 'black' : 'red' });
        }
      } else {
        const errorMessage = isValidMeld(meld, meldKey);
        if (errorMessage) {
          return { error: errorMessage };
        }

        player.meld[meldKey] = meld;

        if (meld.length >= 8) {
          const numJokers = meld.filter((c) => c.value === 'Joker' || c.value === '2').length;
          canasters.push({ value: meldKey, colour: numJokers ? 'black' : 'red' });
        }
      }
    }
  } else {
    let totalScore = 0;
    for (let meldKey of Object.keys(newMeld)) {
      const meld = newMeld[meldKey];
      const errorMessage = isValidMeld(meld, meldKey);
      if (errorMessage) {
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

      if (meld.length >= 8) {
        canasters.push({ value: meldKey, colour: numJokers ? 'black' : 'red' });
      }
    }

    const requiredMeldPoints = rules.meldPoints.find((p) => p.moreThan <= player.points && p.lessThan > player.points);
    if (requiredMeldPoints.required > totalScore) {
      return { error: `Your meld only has ${totalScore} points and you require ${requiredMeldPoints.required}` };
    }

    player.meld = newMeld;
  }

  for (let card of meldedCards) {
    const playerCard = player.cards.find((c) => c.value === card.value && c.suite === card.suite);
    const indexOfDiscarded = player.cards.indexOf(playerCard);
    player.cards.splice(indexOfDiscarded, 1);
  }

  player.canaster = canasters;

  return player.cards;
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

export const drawCard = (drawPile) => {
  const randomIndex = Math.floor(Math.random() * drawPile.length);
  const chosenCard = drawPile.splice(randomIndex, 1);
  return chosenCard[0];
};
