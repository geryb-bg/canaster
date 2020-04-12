const template = (props) => `
    <style>
      :host {
          display: block;
      }
      .card {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        background-color: white;
        color: ${props.colour};
        width: 100px;
        height: 150px;
        border-radius: 5px;
        box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.75);
        padding: 0.5em;
        
        margin-top: -100px;
        margin-left: -50px;

      }
    </style>

    <div class="card">
        <div>${props.value}</div>
        <div>${props.icon}</div>
    </div>`;

customElements.define('game-card', class GameCard extends HTMLElement {
  static get observedAttributes() {
    return ['colour', 'value', 'icon', 'suite'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  render() {
    //this.innerHTML = template(this) // style affects whole page
    this.shadow.innerHTML = template(this)
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    console.log(attr, newValue)
    this[attr] = newValue
    if (newValue) this.render()
  }

  disconnectedCallback() {
  }
})

