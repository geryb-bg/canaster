import '../card-collection/card-collection.js';
import '../game-card/game-card.js';

const template = (props) => `
    <style>
      :host {
        flex: 1 1 auto;
        min-width: 200px;
        color: white;
        border-right: 2px solid #005500;
      }

      h3 {
        margin-bottom: 0;
      }

      h3 > span {
        font-weight: lighter;
        font-size: 0.7em;
      }
      
      .cards {
        display: flex;
        flex-direction: row;
      }
      
      .red-threes {
        margin-right: 1.5em;
      }
      
      .canasta-red {
        background-color: red;
        border-radius: 5px;
      }
            
      .canasta-black {
        background-color: black;
        border-radius: 5px;

      }
      
    </style>

    <div>
      <h3>${props.player.myTurn ? '⭐️' : ''} ${props.player.name}: ${props.player.points} <span>(${props.player.cards.length} cards in hand)</span></h3>
      <div class="cards">
        ${renderThrees(props.player)}
        
        ${renderMelds(props.player)}
      </div>

    </div>`;

const renderMeld = (meldCards) => {
  const cards = meldCards.map(
    (card) => ` 
        <game-card colour="${card.colour}" value="${card.value}" icon="${card.icon}" suite="${card.suite}"></game-card>`
  );

  return `<card-collection orientation="vertical" class="meld">
        ${cards.join('')}
    </card-collection>`;
};

const renderCanaster = (canasterCards, colour) => {
  return `
    <div class="canasta-${colour}">
        ${renderMeld(canasterCards)}
    </div>
  `;
};

const meldIsCanaster = (meldKey, player) => {
  return player.canaster.find((c) => c.value === meldKey);
};

const renderMelds = (player) => {
  let canasters = [];
  let melds = [];
  for (let meldKey of Object.keys(player.meld)) {
    const meld = player.meld[meldKey];
    const canasterLabel = meldIsCanaster(meldKey, player);
    if (canasterLabel) {
      canasters.push({ meld: meld, colour: canasterLabel.colour });
    } else {
      melds.push(meld);
    }
  }

  canasters = canasters.sort((a, b) => b.meld.length - a.meld.length);
  melds = melds.sort((a, b) => b.length - a.length);

  let res = '';
  for (let canaster of canasters) {
    res += renderCanaster(canaster.meld, canaster.colour);
  }

  for (let meld of melds) {
    res += renderMeld(meld);
  }

  return res;
};

const renderThrees = (player) => {
  if (player.redThrees && player.redThrees.length > 0) {
    const cards = player.redThrees.map(
      (three) => `<game-card colour="${three.colour}" value="${three.value}" icon="${three.icon}" suite="${three.suite}"></game-card>`
    );
    return `
        <card-collection orientation="vertical" class="red-threes">
            ${cards.join('')}
        </card-collection>
    `;
  }
  return '';
};

customElements.define(
  'game-player',
  class GamePlayer extends HTMLElement {
    static get observedAttributes() {
      return [];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.redThrees = [];
    }

    render() {
      this.shadow.innerHTML = template(this);
    }

    connectedCallback() {
      this.render();
    }

    getPlayer() {
      return this.player();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}
  }
);
