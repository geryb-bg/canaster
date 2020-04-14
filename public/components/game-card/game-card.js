const template = (props) => `
    <style>
      :host {
          display: block;
      }
      .card {
        user-select: none;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        background-color: ${props.upsideDown ? `lightblue;` : `white;`}
        color: ${props.colour};
        width: 100px;
        height: 150px;
        border-radius: 5px;
        ${
          props.stacked
            ? `border: 1px solid black;
           box-shadow: 2px 2px ${props.upsideDown ? `lightblue` : `white`},
                       3px 3px black,
                       5px 5px ${props.upsideDown ? `lightblue` : `white`},
                       6px 6px black;`
            : `box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.75);`
        }
        padding: 0.5em;
        justify-content: space-between;
        
        ${
          props.selected &&
          `
          border: 3px solid #2fdced;
          background-color: aliceblue;
        `
        }

      }

      #top-left {
        align-self: flex-start;
      }

      #bottom-right {
        align-self: flex-end;
      }
      
      #joker-selection {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: 276px;
      }
      
      .acting-as {
        font-size: 0.8em;
        color: gray;
        vertical-align: super;
      }
      
    </style>

    <div class="card">
      ${
        props.upsideDown
          ? `<h4>Awesome Friends Canaster Online ♥️♠️♦️♣️</h4>`
          : `
        <div id="top-left">
            <div>${props.actingAs ? `<span class="acting-as">${props.actingAs}</span>` : ''} ${props.value}</div>
            <div>${props.icon}</div>
        </div>
        <div id="bottom-right">
            <div>${props.icon}</div>
            <div>${props.value}</div>
        </div>`
      }
        
    </div>
    <game-dialog style="display: none">
        <div>What card will your ${props.value} be acting as?</div>
        <br>
        <div id="joker-selection">
            <game-button class="joker-button">4</game-button>
            <game-button class="joker-button">5</game-button>
            <game-button class="joker-button">6</game-button>
            <game-button class="joker-button">7</game-button>
            <game-button class="joker-button">8</game-button>
            <game-button class="joker-button">9</game-button>
            <game-button class="joker-button">10</game-button>
            <game-button class="joker-button">J</game-button>
            <game-button class="joker-button">Q</game-button>
            <game-button class="joker-button">K</game-button>
            <game-button class="joker-button">A</game-button>
        </div>
    </game-dialog>
`;

customElements.define(
  'game-card',
  class GameCard extends HTMLElement {
    static get observedAttributes() {
      return ['colour', 'value', 'icon', 'suite'];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.selected = false;
      this.selectable = false;
      this.stacked = false;
      this.upsideDown = false;
      this.actingAs = null;
    }

    render() {
      this.shadow.innerHTML = template(this);
      this.dialog = this.shadow.querySelector('game-dialog');


      this.shadow.querySelector('.card').addEventListener('click',() => {
        if (this.selectable) {
          this.toggleSelected();
        }
      });

      const jokerButtons = this.shadow.querySelectorAll('.joker-button');

      jokerButtons.forEach((button) => {
        button.addEventListener('click', () => {
          this.actingAs = button.innerText;
          this.closeDialog();
        })
      })

    }

    connectedCallback() {
      this.render();
    }

    getCard() {
      const card = {
        colour: this.colour,
        value: this.value,
        icon: this.icon,
        suite: this.suite,
      };

      if (this.actingAs) {
        card.actingAs = this.actingAs;
      }

      return card;
    }

    async askForJokerValue() {
      return new Promise((resolve) => {
        this.closeDialog = resolve;
        this.dialog.style.display = '';
      })
    }

    async toggleSelected() {

      if (!this.selected && (this.value === '2' || this.value === 'Joker')) {
        await this.askForJokerValue();
        this.dialog.style.display = 'none';
      }

      this.selected = !this.selected;
      if (this.selected) {
        this.setAttribute('selected', '');
      } else {
        this.removeAttribute('selected');
        this.actingAs = null;
      }
      this.render();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}
  }
);
