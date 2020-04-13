const template = (props) => `
    <style>
      :host {
        color: white;
        border: 1px solid black;
        background-color: #005500;
        width: 90px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        text-align: center;
        user-select: none;
      }
      
      :host(:active){
        background-color: #008100;
       }
      
      
    </style>
    <slot></slot>
`;

customElements.define(
  "game-button",
  class GameButton extends HTMLElement {

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
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
