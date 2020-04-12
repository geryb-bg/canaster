const template = (props) => `
    <style>
      :host {
          display: block;

      }
      .player {
        flex: 1 1 auto;
        width: 400px;
      }
      
    </style>

    <div class="player">
      <h2>${props.name}</h2>
      <h3>${props.myturn}</h3>
    </div>`;

customElements.define(
  'game-player',
  class GamePlayer extends HTMLElement {
    static get observedAttributes() {
      return ['name', 'myturn'];
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
        myturn: this.myturn,
      };
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}
  }
);
