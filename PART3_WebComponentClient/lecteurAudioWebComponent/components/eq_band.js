class EqBand extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  get freq() {
    return parseFloat(this.getAttribute('freq'));
  }

  connectedCallback() {
    const freqLabel = this.freq >= 1000 
      ? `${(this.freq / 1000).toFixed(1)}k` 
      : `${this.freq}`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 60px;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          user-select: none;
        }

        .freq-label {
          margin-bottom: 10px;
          font-weight: 600;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .slider-container {
          position: relative;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slider-track {
          position: absolute;
          width: 4px;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          pointer-events: none;
        }

        .slider-fill {
          position: absolute;
          width: 4px;
          background: linear-gradient(180deg, #00f5ff 0%, #0066ff 100%);
          border-radius: 2px;
          bottom: 50%;
          transition: height 0.1s ease;
          pointer-events: none;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 140px;
          height: 4px;
          background: transparent;
          transform: rotate(-90deg);
          cursor: pointer;
          outline: none;
          z-index: 2;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #00f5ff, #0066ff);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        input[type="range"]:hover::-webkit-slider-thumb {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.9);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #00f5ff, #0066ff);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.6);
          transition: all 0.3s ease;
        }

        input[type="range"]:hover::-moz-range-thumb {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.9);
        }

        .gain-value {
          margin-top: 10px;
          font-weight: 700;
          font-size: 12px;
          color: #00f5ff;
          min-height: 18px;
          width: 50px;
          text-align: center;
          text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }
      </style>

      <div class="freq-label">${freqLabel}</div>
      
      <div class="slider-container">
        <div class="slider-track"></div>
        <div class="slider-fill"></div>
        <input type="range" min="-12" max="12" step="0.5" value="0" />
      </div>

      <div class="gain-value">0 dB</div>
    `;

    this.inputEl = this.shadowRoot.querySelector('input');
    this.gainValueEl = this.shadowRoot.querySelector('.gain-value');
    this.sliderFillEl = this.shadowRoot.querySelector('.slider-fill');

    this.inputEl.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      this.updateDisplay(val);
      if (this.filter) this.filter.gain.value = val;
    });

    this.updateDisplay(0);
  }

  updateDisplay(val) {
    this.gainValueEl.textContent = (val > 0 ? '+' : '') + val.toFixed(1) + " dB";
    
    // Update visual fill
    const percentage = ((val + 12) / 24) * 100;
    const height = (Math.abs(val) / 12) * 50; // 50% de la hauteur max
    
    if (val >= 0) {
      this.sliderFillEl.style.bottom = '50%';
      this.sliderFillEl.style.height = height + '%';
    } else {
      this.sliderFillEl.style.bottom = (50 - height) + '%';
      this.sliderFillEl.style.height = height + '%';
    }
  }

  setFilter(filter) {
    this.filter = filter;
    this.inputEl.value = filter.gain.value;
    this.updateDisplay(filter.gain.value);
  }

  reset() {
    this.inputEl.value = 0;
    this.updateDisplay(0);
    if (this.filter) this.filter.gain.value = 0;
  }
}

customElements.define('eq-band', EqBand);
