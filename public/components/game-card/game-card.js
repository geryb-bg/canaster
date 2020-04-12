const template = (props) => `
    <style>
      :host {
          display: block;

      }
      .card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        background-color: white;
        color: ${props.colour};
        width: 100px;
        height: 150px;
        border-radius: 5px;
        box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.75);
        padding: 0.5em;
        justify-content: space-between;
        
        margin-top: -100px;
        margin-left: -50px;
        
        ${props.selected &&
          `
          border: 3px solid #2fdced;
          background-color: aliceblue;
        `}

      }
      
      #bottom-right {
        align-self: flex-end;
        text-align: center;
      }
      
    </style>

    <div class="card">
        <div id="top-left">
            <div>${props.value}</div>
            <div>${props.icon}</div>
        </div>
        <div id="bottom-right">
            <div>${props.icon}</div>
            <div>${props.value}</div>
        </div>
        
    </div>`;

customElements.define(
  "game-card",
  class GameCard extends HTMLElement {
    static get observedAttributes() {
      return ["colour", "value", "icon", "suite"];
    }

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.selected = false;
    }

    render() {
      //this.innerHTML = template(this) // style affects whole page
      this.shadow.innerHTML = template(this);

      this.onclick = () => {
        this.toggleSelected();
      };
    }

    connectedCallback() {
      this.render();
    }

    getCard() {
      return {
        colour: this.colour,
        value: this.value,
        icon: this.icon,
        suite: this.suite
      }
    }

    toggleSelected() {
      this.selected = !this.selected;
      if (this.selected) {
        this.setAttribute('selected', '');
      } else {
        this.removeAttribute('selected')
      }
      this.render();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      console.log(attr, newValue);
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}
  }
);
