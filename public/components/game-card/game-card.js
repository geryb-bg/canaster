const template = obj => `
    <style>
        .card {
            background-color: white;
            width: 100px;
            height: 150px;
            border-radius: 5px;
            box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.75);
            margin-left: -50px;
        }
    </style>

    <div class="card">
    
    </div>`

customElements.define('game-card', class GameCard extends HTMLElement {
  static get observedAttributes() {
    return ['name'];
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

