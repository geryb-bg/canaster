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
      
      #hide-dialog-button {
        align-self: center;
      }
     
      
    </style>
    
    <div id="dialog">
        <div id="message">${props.message}</div>
        <br>
        <game-button id="hide-dialog-button">OK</game-button>
    </div>


    `;

customElements.define(
  "game-dialog",
  class GameDialog extends HTMLElement {
    static get observedAttributes() {
      return ["message"];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    render() {
      this.shadow.innerHTML = template(this);
      const button = this.shadow.querySelector('#hide-dialog-button');
      button.addEventListener('click', () => {
        this.parentNode.removeChild(this)
      })
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

document.addEventListener('show-message', (e) => {
  const dialog = document.createElement('game-dialog');
  dialog.message = e.detail.message;

  document.body.appendChild(dialog);
});
