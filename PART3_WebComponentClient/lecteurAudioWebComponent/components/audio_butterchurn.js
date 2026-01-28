class AudioButterchurn extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        canvas {
          width: 100%;
          height: 300px;
          background: black;
          display: block;
        }
      </style>
      <canvas></canvas>
    `;

    this.parentAudioPlayer = this.parentNode;
    if (!this.parentAudioPlayer || this.parentAudioPlayer.nodeName.toLowerCase() !== "my-audio-player") {
      console.error("audio-butterchurn doit être enfant direct de my-audio-player");
      return;
    }

    this.parentAudioPlayer.addEventListener('audiocontextready', (e) => {
      if (!e.detail.audioContext || !e.detail.masterGain) return; //sécu

      this.audioContext = e.detail.audioContext;
      this.sourceNode = e.detail.masterGain;

      this.setupVisualizer();
});
  }

  setupVisualizer() {
    const bc = window.butterchurn?.default;
    const presetsModule = window.butterchurnPresets;

    if (!bc || typeof bc.createVisualizer !== "function") {
      console.error("Butterchurn not properly loaded");
      return;
    }

    if (!presetsModule || typeof presetsModule.getPresets !== "function") {
      console.error("Butterchurn presets not properly loaded");
      return;
    }

    const canvas = this.shadowRoot.querySelector("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    this.visualizer = bc.createVisualizer(this.audioContext, canvas, {
      width: canvas.width,
      height: canvas.height,
    });

    const presets = presetsModule.getPresets();
    const presetList = Object.values(presets);

    if (!presetList.length) {
      console.error("No presets found for Butterchurn");
      return;
    }

    const randomPreset = presetList[Math.floor(Math.random() * presetList.length)];
    this.visualizer.loadPreset(randomPreset, 0);

    this.visualizer.connectAudio(this.sourceNode);

    this.render();
  }

  render() {
    const loop = () => {
      this.visualizer.render();
      requestAnimationFrame(loop);
    };
    loop();
  }
}

customElements.define("audio-butterchurn", AudioButterchurn);
