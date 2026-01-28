class MicrophoneRecorder extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;
    this.maxDuration = 5000; // 5 secondes max

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; padding: 16px; background: #1e1e2f; color: white; border-radius: 12px; max-width: 400px; font-family: sans-serif; }
        button { padding: 8px 16px; margin: 4px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        #status { margin-top: 8px; }
        audio { display: block; margin-top: 12px; width: 100%; }
      </style>

      <div>
        <button id="startBtn">Start Recording</button>
        <button id="stopBtn" disabled>Stop Recording</button>
        <input type="text" id="filenameInput" placeholder="Enter file name" style="padding:6px 10px; margin:4px; border-radius:6px; border:none; width:calc(100% - 20px);">
        <button type="button" id="saveBtn" disabled>Save Recording</button>
        <div id="status">Idle</div>
        <audio id="playback" controls></audio>
      </div>
    `;

    this.startBtn = this.shadowRoot.querySelector("#startBtn");
    this.stopBtn = this.shadowRoot.querySelector("#stopBtn");
    this.saveBtn = this.shadowRoot.querySelector("#saveBtn");
    this.status = this.shadowRoot.querySelector("#status");
    this.playback = this.shadowRoot.querySelector("#playback");

    this.startBtn.addEventListener("click", () => this.startRecording());
    this.stopBtn.addEventListener("click", () => this.stopRecording());
    this.saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.saveRecording();
    });
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.addEventListener("dataavailable", e => {
        if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
      });

      this.mediaRecorder.addEventListener("start", () => {
        this.status.textContent = "Recording...";
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.saveBtn.disabled = true;

        // Stop automatique après maxDuration
        this.timeout = setTimeout(() => this.stopRecording(), this.maxDuration);
      });

      this.mediaRecorder.addEventListener("stop", () => {
        clearTimeout(this.timeout);
        this.audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.playback.src = this.audioUrl;
        this.status.textContent = `Recorded: ${Math.round(this.audioBlob.size / 1024)} KB`;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.saveBtn.disabled = false;
      });

      this.mediaRecorder.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      this.status.textContent = "Error accessing microphone";
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  async saveRecording() {
    if (!this.audioBlob) return;

    const filenameInput = this.shadowRoot.querySelector("#filenameInput");
    let filename = filenameInput.value.trim();
    if (!filename) filename = "recording";
    filename += ".wav";

    const formData = new FormData();
    formData.append("recording", this.audioBlob, filename);

    try {
      const res = await fetch("http://localhost:3000/api/records", {
        method: "PUT",
        body: formData
      });

      if (res.ok) {
        this.status.textContent = "Recording saved successfully!";
      } else {
        this.status.textContent = "Failed to save recording";
      }
    } catch (err) {
      console.error(err);
      this.status.textContent = "Error saving recording";
    }
  }
}

customElements.define("microphone-recorder", MicrophoneRecorder);
