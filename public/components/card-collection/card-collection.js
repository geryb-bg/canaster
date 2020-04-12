const template = (props) => `
    <style>
      :host {
        margin-left: 50px;
        margin-top: 100px;
        padding: 10px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      
    </style>

    <slot></slot>`;

customElements.define(
  "card-collection",
  class CardCollection extends HTMLElement {
    static get observedAttributes() {
      return [];
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
