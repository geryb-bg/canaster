const template = (props) => `
    <style>
      :host {
        color: white;
        width: 25px;
        height: 25px;
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
       
       svg {
            ${props.fullscreen ? 'transform: rotate(180deg);' : ''}
       }
      
      
    </style>
    
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             viewBox="0 0 384.97 384.97" style="width: 25px;" xml:space="preserve">
            <g>
                <g>
                    <path style="fill:white;" d="M372.939,216.545c-6.123,0-12.03,5.269-12.03,12.03v132.333H24.061V24.061h132.333c6.388,0,12.03-5.642,12.03-12.03
                        S162.409,0,156.394,0H24.061C10.767,0,0,10.767,0,24.061v336.848c0,13.293,10.767,24.061,24.061,24.061h336.848
                        c13.293,0,24.061-10.767,24.061-24.061V228.395C384.97,221.731,380.085,216.545,372.939,216.545z"/>
                    <path style="fill:white;" d="M372.939,0H252.636c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h91.382L99.635,268.432
                        c-4.668,4.668-4.668,12.235,0,16.903c4.668,4.668,12.235,4.668,16.891,0L360.909,40.951v91.382c0,6.641,5.39,12.03,12.03,12.03
                        s12.03-5.39,12.03-12.03V12.03l0,0C384.97,5.558,379.412,0,372.939,0z"/>
                </g>
            </g>
        </svg>
`;

customElements.define(
  "fullscreen-button",
  class FullscreenButton extends HTMLElement {

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
      this.fullscreen = false;
    }

    render() {
      this.shadow.innerHTML = template(this);
      this.addEventListener('click', this.toggleFullScreen)
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      this[attr] = newValue;
      if (newValue) this.render();
    }

    disconnectedCallback() {}

    toggleFullScreen() {

      const doc = window.document;
      const docEl = doc.documentElement;

      const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
      const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

      if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        this.fullscreen = true;
      }
      else {
        cancelFullScreen.call(doc);
        this.fullscreen = false;
      }

      this.render()
    }
  }
);
