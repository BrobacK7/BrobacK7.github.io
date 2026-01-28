class Sampler extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.samples = []; // fichiers audio locaux
    this.buttonAssignments = Array(16).fill(null); // assignation des pads
    this.padAudio = Array(16).fill(null);
    this.padLoop = Array(16).fill(false);

    this.freesoundResults = []; // résultats Freesound
  }

  connectedCallback() {
    this.render();
    this.fetchSamples();
  }

  // -------------------- Fetch samples locaux --------------------
  async fetchSamples() {
  try {
    const res = await fetch("http://localhost:3000/api/records");
    if (!res.ok) throw new Error("Cannot fetch samples");
    const files = await res.json();
    this.samples = files;

    // Auto-assigner les premiers fichiers aux pads pour pouvoir cliquer
    files.forEach((file, i) => {
      if (i < this.buttonAssignments.length) {
        this.buttonAssignments[i] = file;
      }
    });

    this.assignSamples();
    this.populateSampleList();
  } catch (err) {
    console.error(err);
  }
}


  // -------------------- Assignation des pads --------------------
  assignSamples() {
  const buttons = this.shadowRoot.querySelectorAll(".sample-btn");
  buttons.forEach((btn, i) => {
    const file = this.buttonAssignments[i];
    if (file) {
      btn.textContent = file.replace(/\.(wav|mp3)$/, "");
      // Utilise toujours une URL complète : fichiers locaux ou Freesound
      btn.dataset.src = file.startsWith("http")
        ? file // Freesound URL
        : `http://localhost:3000/assets/records/${file}`; // fichiers locaux
      btn.disabled = false;
    } else {
      btn.textContent = "-";
      btn.dataset.src = "";
      btn.disabled = true;
    }
    if (!this.padAudio[i]) btn.style.background = "#3b82f6";
  });
}


  // -------------------- Populate list des samples locaux --------------------
  populateSampleList() {
    const listContainer = this.shadowRoot.querySelector("#sampleList");
    listContainer.innerHTML = this.samples.map(file => `
      <div class="sample-item" draggable="true" data-file="${file}">
        ${file.replace(/\.(wav|mp3)$/, "")}
      </div>
    `).join('');

    listContainer.querySelectorAll(".sample-item").forEach(item => {
      item.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", e.target.dataset.file);
      });
    });
  }

  // -------------------- Freesound search --------------------
  async searchFreesound(query) {
    const apiKey = "DQbV143fIsXQs0ISR1slBc0nDB0EhM7l7a67PpCz"; // TODO
    try {
      const res = await fetch(`https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&fields=name,previews,url&filter=duration:[0 TO 10]&page_size=5`, {
        headers: { "Authorization": `Token ${apiKey}` }
      });
      if (!res.ok) throw new Error("Freesound API error");
      const data = await res.json();
      this.freesoundResults = data.results.map(r => ({
        name: r.name,
        url: r.previews['preview-hq-mp3']
      }));
      this.populateFreesoundList();
    } catch (err) {
      console.error(err);
    }
  }

  populateFreesoundList() {
    const freesoundContainer = this.shadowRoot.querySelector("#freesoundList");
    if (!this.freesoundResults.length) {
      freesoundContainer.innerHTML = "<div>Aucun résultat</div>";
      return;
    }
    freesoundContainer.innerHTML = this.freesoundResults.map(s => `
      <div class="freesound-item" draggable="true" data-file="${s.url}">
        ${s.name}
      </div>
    `).join('');

    freesoundContainer.querySelectorAll(".freesound-item").forEach(item => {
      item.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", e.target.dataset.file);
      });
    });
  }

  // -------------------- Jouer un pad --------------------
  playPad(index, loop = false) {
  const btn = this.shadowRoot.querySelector(`.sample-btn[data-index='${index}']`);
  const src = btn.dataset.src;
  if (!src) return;

  // Stop si déjà en cours
  if (this.padAudio[index]) {
    this.padAudio[index].pause();
    this.padAudio[index] = null;
    btn.style.background = "#3b82f6";
    this.padLoop[index] = false;
    return;
  }

  const audio = new Audio(src);
  this.padAudio[index] = audio;
  this.padLoop[index] = loop;
  btn.style.background = loop ? "#f59e0b" : "#10b981";

  audio.addEventListener("ended", () => {
    if (this.padLoop[index]) {
      audio.currentTime = 0;
      audio.play();
    } else {
      btn.style.background = "#3b82f6";
      this.padAudio[index] = null;
    }
  });

  audio.play();
}


  // -------------------- Render --------------------
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: flex; gap: 16px; font-family: sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 8px; }
        button { padding: 16px; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold; text-align: center; }
        button:disabled { background: #555; cursor: not-allowed; }
        #sampleList, #freesoundList { flex-shrink: 0; max-height: 400px; overflow-y: auto; width: 200px; background: #222; padding: 8px; border-radius: 8px; }
        .sample-item, .freesound-item { padding: 8px; background: #444; border-radius: 6px; cursor: grab; margin-bottom: 4px; }
        .sample-item:active, .freesound-item:active { cursor: grabbing; }
        #freesoundSearch { margin-bottom: 8px; padding: 6px; border-radius: 6px; border: none; width: 100%; }
      </style>

      <div>
        <div class="grid">
          ${Array(16).fill(0).map((_, i) => `<button class="sample-btn" disabled data-index="${i}">Loading...</button>`).join('')}
        </div>
      </div>

      <div>
        <h3>Samples locaux</h3>
        <div id="sampleList"><div>Loading...</div></div>

        <h3>Freesound</h3>
        <input id="freesoundSearch" type="text" placeholder="Chercher un son">
        <div id="freesoundList"></div>
      </div>
    `;

    // pads
    const buttons = this.shadowRoot.querySelectorAll(".sample-btn");
    buttons.forEach(btn => {
      const index = parseInt(btn.dataset.index, 10);
      btn.addEventListener("click", () => this.playPad(index, false));
      btn.addEventListener("contextmenu", e => { e.preventDefault(); this.playPad(index, true); });

      // drag & drop pour assigner
      btn.addEventListener("dragover", e => e.preventDefault());
      btn.addEventListener("drop", e => {
        e.preventDefault();
        const file = e.dataTransfer.getData("text/plain");
        this.buttonAssignments[index] = file;
        this.assignSamples();
      });
    });

    // recherche Freesound
    const searchInput = this.shadowRoot.querySelector("#freesoundSearch");
    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") this.searchFreesound(searchInput.value);
    });
  }
}

customElements.define("sampler-grid", Sampler);
