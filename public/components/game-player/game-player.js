import '../card-collection/card-collection.js';
import '../game-card/game-card.js';

const template = (props) => `
    <style>
      :host {
          display: block;

      }
      .player {
        flex: 1 1 auto;
        width: 500px;
      }
      
    </style>

    <div class="player">
      <h2>${props.name} ${props.turn ? '⭐️' : ''}</h2>
      <card-collection>
        ${props.redThrees.map((three) => `<game-card colour="${three.colour}" value="${three.value}" icon="${three.icon}" suite="${three.suite}"></game-card>`)}
      </card-collection>
    </div>`;

customElements.define(
  'game-player',
  class GamePlayer extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'turn'];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
    }

    render() {
      this.shadow.innerHTML = template(this);
    }

    connectedCallback() {
      this.render();
    }

    getPlayer() {
      return {
        name: this.name,
        turn: this.turn,
        redThrees: this.redThrees,
      };
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      console.log(newValue);
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}
  }
);
