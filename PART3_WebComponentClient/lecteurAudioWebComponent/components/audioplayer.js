class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.src = this.getAttribute("src");
    this.audioContext = null;
    this.sourceNode = null;
    this.masterGain = null;
    this.stereoPanner = null;

    this.activePlayState = 'paused';

    this.updateProgress = this.updateProgress.bind(this);
    this.seek = this.seek.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .player-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          margin: 0 auto;
        }

        audio {
          display: none;
        }

        .controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        button {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 28px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        button:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        button:active {
          transform: translateY(0);
        }

        #progressContainer {
          position: relative;
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          cursor: pointer;
          margin: 20px 0;
          overflow: hidden;
        }

        #progressBar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #fff 0%, #f0f0f0 100%);
          border-radius: 10px;
          transition: width 0.1s linear;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        #time {
          font-family: 'Courier New', monospace;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }

        .knob-section {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 30px;
          margin-top: 25px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .control-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 120px;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          margin: 25px 0;
        }

        button.active {
          background: white;
          color: #667eea;
          font-weight: 700;
        }

        ::slotted(*) {
          color: white;
        }
      </style>

      <div class="player-container">
        <audio id="myplayer" src="${this.src}"></audio>
        
        <div id="time">0:00 / 0:00</div>

        <div id="progressContainer" title="Cliquez ou glissez pour changer la position">
          <div id="progressBar"></div>
        </div>

        <div class="controls">
          <button id="playbtn">▶ Play</button>
          <button id="pausebtn">⏸ Pause</button>
        </div>
        
        <div class="knob-section">
          <div class="control-group">
            <span class="control-label">Balance stéréo</span>
            <input type="range" id="balanceslider" min="-1" max="1" step="0.01" value="0">
          </div>
          <div class="control-group">
            <span class="control-label">Volume</span>
            <webaudio-knob id="knobVolume" min="0" max="1" step="0.01" value="0.5"></webaudio-knob>
          </div>
        </div>

        <hr>
        <slot></slot>
      </div>
    `;

    this.audioElement = this.shadowRoot.querySelector("#myplayer");
    this.playBtn = this.shadowRoot.querySelector("#playbtn");
    this.pauseBtn = this.shadowRoot.querySelector("#pausebtn");
    this.volumeKnob = this.shadowRoot.querySelector("#knobVolume");
    this.balanceSlider = this.shadowRoot.querySelector("#balanceslider");
    this.progressContainer = this.shadowRoot.querySelector("#progressContainer");
    this.progressBar = this.shadowRoot.querySelector("#progressBar");
    this.timeDisplay = this.shadowRoot.querySelector("#time");

    this.defineListeners();

    this.updatePlayButtonUI();

    this.audioElement.addEventListener('timeupdate', this.updateProgress);
    this.audioElement.addEventListener('progress', this.updateProgress);
    this.audioElement.addEventListener('loadedmetadata', this.updateProgress);
  }

  async initAudioGraph() {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();

    this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);

    this.stereoPanner = this.audioContext.createStereoPanner();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;

    this.sourceNode.connect(this.stereoPanner);

    let lastNode = this.stereoPanner;

    const eq = this.querySelector('audio-equalizer');

    if (eq) {
      await new Promise((resolve) => {
        const onEqualizerReady = () => {
          eq.removeEventListener('equalizerready', onEqualizerReady);
          resolve();
        };

        eq.addEventListener('equalizerready', onEqualizerReady);

        this.dispatchEvent(new CustomEvent('audiocontextready', {
          bubbles: true,
          composed: true,
          detail: {
            audioContext: this.audioContext,
            inputNode: lastNode
          }
        }));
      });

      const eqOutput = eq.getOutputNode();
      if (eqOutput) {
        lastNode = eqOutput;
      }
    }

    
    lastNode.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
  }

  getAudioContext() {
    return this.audioContext;
  }

  getSourceNode() {
    return this.masterGain;
  }

  updatePlayButtonUI() {
  this.playBtn.classList.toggle('active', this.activePlayState === 'playing');
  this.pauseBtn.classList.toggle('active', this.activePlayState === 'paused');
}

  defineListeners() {
  // Etat actif : 'playing' ou 'paused'
  this.activePlayState = 'paused'; // par défaut pause/stop

  // Fonction pour mettre à jour le style des boutons
  const updatePlayButtonUI = () => {
    this.playBtn.classList.toggle('active', this.activePlayState === 'playing');
    this.pauseBtn.classList.toggle('active', this.activePlayState === 'paused');
  };

  // Initialisation de l'UI
  updatePlayButtonUI();

  // Play
  this.playBtn.addEventListener("click", async () => {
    await this.initAudioGraph();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
      console.log("AudioContext resumed after user gesture");
    }
    this.audioElement.play();
    this.activePlayState = 'playing';
    updatePlayButtonUI();
  });

  // Pause
  this.pauseBtn.addEventListener("click", () => {
    this.audioElement.pause();
    this.activePlayState = 'paused';
    updatePlayButtonUI();
  });

  // Volume
  this.volumeKnob.addEventListener("input", (e) => {
    if (this.masterGain) this.masterGain.gain.value = e.target.value;
  });

  // Balance / Pan
  this.balanceSlider.addEventListener("input", (e) => {
    if (this.stereoPanner) this.stereoPanner.pan.value = e.target.value;
  });

  // Progress bar click
  this.progressContainer.addEventListener('click', this.seek);

  // Drag to seek
  let isDragging = false;
  this.progressContainer.addEventListener('mousedown', e => {
    isDragging = true;
    this.seek(e);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (isDragging) this.seek(e);
  });
}


  updateProgress() {
    const current = this.audioElement.currentTime;
    const duration = this.audioElement.duration || 0;

    this.timeDisplay.textContent = `${this.formatTime(current)} / ${this.formatTime(duration)}`;

    if (duration > 0) {
      const progressPercent = (current / duration) * 100;
      this.progressBar.style.width = `${progressPercent}%`;
    } else {
      this.progressBar.style.width = `0%`;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  seek(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const duration = this.audioElement.duration;
    if (!duration) return;

    const newTime = (clickX / width) * duration;
    this.audioElement.currentTime = newTime;
  }

  async loadAndPlay(src) {
    this.audioElement.src = src;
    
    await new Promise(resolve => {
      this.audioElement.onloadedmetadata = () => {
        resolve();
      };
    });
    
    await this.initAudioGraph();

    if (this.audioContext.state === "suspended") await this.audioContext.resume();

    this.audioElement.play();

    this.dispatchEvent(new CustomEvent('audiocontextready', {
      bubbles: true,
      composed: true,
      detail: {
        audioContext: this.audioContext,
        sourceNode: this.sourceNode,
        masterGain: this.masterGain
      }
    }));
  }
}

customElements.define("my-audio-player", MyAudioPlayer);