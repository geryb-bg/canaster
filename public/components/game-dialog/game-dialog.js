const template = (props) => `
    <style>
      :host {
          position: absolute;
          top: 0px;
          left: 0px;
          right: 0px;
          bottom: 0px;
          background-color: rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
      }
      
      #dialog {
          border-radius: 20px;
          color: white;  
          background-color: #2c7e39;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
      }
      
    </style>
    
    <div id="dialog">
        <slot></slot>
    </div>


    `;

customElements.define(
  "game-dialog",
  class GameDialog extends HTMLElement {
    static get observedAttributes() {
      return [];
    }

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

