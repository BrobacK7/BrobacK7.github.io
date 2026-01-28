class AudioEqualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.filters = [];
    this.outputNode = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 24px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          max-width: 520px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .eq-header {
          margin-bottom: 20px;
          text-align: center;
        }

        .eq-title {
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .eq-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin: 0;
        }

        .bands-container {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 18px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-height: 200px;
        }

        .reset-button {
          margin-top: 16px;
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reset-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
      </style>

      <div class="eq-header">
        <h3 class="eq-title">🎛️ Equalizer</h3>
        <p class="eq-subtitle">Ajustez les fréquences</p>
      </div>

      <div class="bands-container">
        <eq-band freq="60"></eq-band>
        <eq-band freq="170"></eq-band>
        <eq-band freq="350"></eq-band>
        <eq-band freq="1000"></eq-band>
        <eq-band freq="3500"></eq-band>
        <eq-band freq="10000"></eq-band>
      </div>

      <button class="reset-button">Reset</button>
    `;

    this.parentAudioPlayer = this.parentNode;
    if (!this.parentAudioPlayer || this.parentAudioPlayer.nodeName.toLowerCase() !== "my-audio-player") {
      console.error("audio-equalizer doit être enfant direct de my-audio-player");
      return;
    }

    this.parentAudioPlayer.addEventListener('audiocontextready', (e) => {
  if (!e.detail.inputNode || !e.detail.audioContext) return; //sécu
  if (this.audioContext) return; //sécu

  this.audioContext = e.detail.audioContext;
  this.inputNode = e.detail.inputNode;

  this.setupFilters();

  this.dispatchEvent(new CustomEvent('equalizerready', {
    bubbles: true,
    composed: true
  }));
});

    // Reset button
    this.shadowRoot.querySelector('.reset-button').addEventListener('click', () => {
      this.shadowRoot.querySelectorAll('eq-band').forEach(band => {
        if (band.reset) band.reset();
      });
    });
  }

  setupFilters() {
    let previousNode = this.inputNode;
    this.filters = [];

    this.shadowRoot.querySelectorAll("eq-band").forEach((band) => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = parseFloat(band.getAttribute("freq")) || 1000;
      filter.gain.value = 0;
      filter.Q.value = 1;

      previousNode.connect(filter);
      previousNode = filter;
      this.filters.push(filter);

      if (typeof band.setFilter === "function") {
        band.setFilter(filter);
      }
    });

    this.outputNode = previousNode;
  }

  getOutputNode() {
    return this.outputNode;
  }
}

customElements.define("audio-equalizer", AudioEqualizer);