class AudioVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.animationId = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        canvas {
          width: 600px;
          height: 200px;
          background: black;
          display: block;
          margin-top: 10px;
        }
      </style>
      <canvas width="600" height="200"></canvas>
    `;

    this.canvas = this.shadowRoot.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.parentAudioPlayer = this.parentNode;
    if (!this.parentAudioPlayer || this.parentAudioPlayer.nodeName.toLowerCase() !== "my-audio-player") {
        console.error("audio-visualizer doit être enfant direct de my-audio-player");
        return;
    }

    this.parentAudioPlayer.addEventListener('audiocontextready', (e) => {
      if (!e.detail.masterGain) return; // sécu

      this.audioContext = e.detail.audioContext;
      this.sourceNode = e.detail.masterGain;

      if (!this.analyser) {
        this.setupAnalyser();
      }
    });
  }

  setupAnalyser() {
    if (!this.sourceNode || !this.audioContext) return;

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.sourceNode.connect(this.analyser);

    this.draw();
  }

  draw = () => {
    this.animationId = requestAnimationFrame(this.draw);

    this.analyser.getByteFrequencyData(this.dataArray);

    const { width, height } = this.canvas;
    const barWidth = width / this.bufferLength;

    this.ctx.fillStyle = "rgba(0,0,0,0.2)";
    this.ctx.fillRect(0, 0, width, height);

    let x = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = this.dataArray[i] * 0.6;

      this.ctx.fillStyle = `hsl(${(i / this.bufferLength) * 360}, 100%, 50%)`;
      this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth;
    }
  };

  disconnectedCallback() {
    cancelAnimationFrame(this.animationId);
  }
}

customElements.define("audio-visualizer", AudioVisualizer);
