const template = (props) => `
    <style>
      :host {
    
      }
      
      #hide-dialog-button {
        align-self: center;
      }
     
      
    </style>
    
    <game-dialog id="dialog">
        <div id="message">${props.message}</div>
        <br>
        <game-button id="hide-dialog-button">OK</game-button>
    </game-dialog>
    `;

customElements.define(
  "error-message",
  class ErrorMessage extends HTMLElement {
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
  const dialog = document.createElement('error-message');
  dialog.message = e.detail.message;

  document.body.appendChild(dialog);
});
