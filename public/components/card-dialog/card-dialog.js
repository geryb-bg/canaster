const template = (props) => `
    <style>
      :host {

      }
      
      .centre {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
     
      
    </style>
    
    <game-dialog>
        <div id="message">${props.message}</div>
        <div class="centre">
            <card-collection></card-collection>
            <game-button id="hide-dialog-button">OK</game-button>
        </div>


    </game-dialog>


    `;

customElements.define(
  "card-dialog",
  class CardDialog extends HTMLElement {
    static get observedAttributes() {
      return ["message", "cards"];
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
      });

      const cardCollection = this.shadow.querySelector('card-collection');

      for (let card of this.cards) {
        const cardElement = document.createElement("game-card");
        cardElement.setAttribute("colour", card.colour);
        cardElement.setAttribute("value", card.value);
        cardElement.setAttribute("icon", card.icon);
        cardElement.setAttribute("suite", card.suite);
        cardCollection.appendChild(cardElement);
      }

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

document.addEventListener('show-cards', (e) => {
  const dialog = document.createElement('card-dialog');
  dialog.message = e.detail.message;
  dialog.cards = e.detail.cards;

  document.body.appendChild(dialog);
});
