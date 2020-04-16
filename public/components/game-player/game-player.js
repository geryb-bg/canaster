import '../card-collection/card-collection.js';
import '../game-card/game-card.js';

const template = (props) => `
    <style>
      :host {
        flex: 1 1 auto;
        min-width: 200px;
      }
      
      .cards {
        display: flex;
        flex-direction: row;
      }
      
    </style>

    <div>
      <h2>${props.player.myTurn ? "⭐️" : ""} ${props.player.name}: ${props.player.points} </h2>
      <div class="cards">
        ${renderThrees(props.player)}
        ${renderMelds(props.player)}
      </div>

    </div>`;

const renderMeld = (meldCards) =>  {
  const cards = meldCards.map((card) => ` 
        <game-card colour="${card.colour}" value="${card.value}" icon="${card.icon}" suite="${card.suite}"></game-card>`)

  return `<card-collection orientation="vertical">
        ${cards.join('')}
    </card-collection>`;
};

const renderMelds = (player) => {
  let res = "";
  for (let meldKey of Object.keys(player.meld)) {
    res += renderMeld(player.meld[meldKey]);
  }
  return res;
};

const renderThrees = (player) => {
  if (player.redThrees && player.redThrees.length > 0) {
    return `
        <card-collection orientation="vertical">
            ${player.redThrees.map((three) => `<game-card colour="${three.colour}" value="${three.value}" icon="${three.icon}" suite="${three.suite}"></game-card>`)}
        </card-collection>
    `
  }
  return "";
};

customElements.define(
  "game-player",
  class GamePlayer extends HTMLElement {
    static get observedAttributes() {
      return [];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
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

    disconnectedCallback() {
    }
  }
);
