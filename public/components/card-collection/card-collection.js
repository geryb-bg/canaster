const template = (props) => `
    <style>
      :host {
        margin-left: 50px;
        margin-top: ${props.orientation === 'vertical' ? '120px' : '100px'};
        padding: 10px;
        display: flex;
        flex-direction: ${props.orientation === 'vertical' ? 'column' : 'row'};
        flex-wrap: wrap;
      }
      
      ::slotted(game-card) {
        margin-top: ${props.orientation === 'vertical' ? '-120px' : '-100px'};
        margin-left: -50px;
      }
      
    </style>

    <slot></slot>`;

customElements.define(
  "card-collection",
  class CardCollection extends HTMLElement {
    static get observedAttributes() {
      return ['orientation'];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.selected = false;
    }

    render() {
      this.shadow.innerHTML = template(this);
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}
  }
);
