class AudioPlaylist extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.currentIndex = 0;

    // Mode actif : 'loop', 'shuffle', 'random', ou null
    this.activeMode = null;

    this.playlist = [
      { title: "Roxas", src: "../assets/playlist/roxas.mp3" },
      { title: "pdc", src: "../assets/playlist/pdc.mp3" },
      { title: "example", src: "../assets/playlist/example.mp3" },
      { title: "Sonic", src: "../assets/playlist/sonic.mp3" },
    ];

    // Pour shuffle
    this.shuffledPlaylist = [];
  }

  connectedCallback() {
    this.audioPlayer = this.closest('my-audio-player');
    if (!this.audioPlayer) {
      console.error('audio-playlist doit être enfant de my-audio-player');
      return;
    }
    this.render();
    this.setupListeners();
    // Charge la première piste au départ
    this.playTrack(this.currentIndex);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 380px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
          overflow: hidden;
          user-select: none;
          padding: 20px;
           border: 2px solid black; 
           box-sizing: border-box;
        }

        .playlist-header {
          color: white;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .playlist-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }

        .playlist-count {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 320px;
          overflow-y: auto;      /* scroll vertical pour la playlist */
          overflow-x: hidden;    /* bloque le scroll horizontal */
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
        ul::-webkit-scrollbar {
          width: 6px;
        }

        ul::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        ul::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }

        li {
          cursor: pointer;
          padding: 14px 16px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: white;
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        li .track-number {
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        li .track-title {
          flex: 1;
        }

        li.playing {
          background: rgba(255, 255, 255, 0.25);
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        li.playing::before {
          transform: scaleY(1);
        }

        li.playing .track-number {
          background: white;
          color: #667eea;
        }

        li:hover:not(.playing) {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(2px);
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .controls button {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          color: white;
          font-size: 14px;
          transition: all 0.2s;
        }

        .controls button.active {
          background: white;
          color: #667eea;
          font-weight: 700;
        }
      </style>

      <div class="playlist-header">
        <h3 class="playlist-title">Ma Playlist</h3>
        <p class="playlist-count">${this.playlist.length} morceaux</p>
      </div>

      <div class="controls">
        <button id="loopBtn">Loop</button>
        <button id="shuffleBtn">Shuffle</button>
        <button id="randomBtn">Random</button>
      </div>

      <ul>
        ${this.playlist.map((track, i) => `<li data-index="${i}">${track.title}</li>`).join('')}
      </ul>
    `;
  }

  setupListeners() {
    this.shadowRoot.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', e => {
        this.playTrack(parseInt(e.target.dataset.index));
      });
    });

    // Fin de morceau
    this.audioPlayer.audioElement.addEventListener('ended', () => {
      this.handleTrackEnd();
    });

    // Boutons
    this.shadowRoot.querySelector('#loopBtn').addEventListener('click', () => this.setMode('loop'));
    this.shadowRoot.querySelector('#shuffleBtn').addEventListener('click', () => this.setMode('shuffle'));
    this.shadowRoot.querySelector('#randomBtn').addEventListener('click', () => this.setMode('random'));
  }

  setMode(mode) {
  // Un seul mode actif à la fois ou normal si on reclique
  if (this.activeMode === mode) {
    this.activeMode = null; // passe en mode normal
  } else {
    this.activeMode = mode; // active le nouveau mode
  }

  // Visuel des boutons
  this.shadowRoot.querySelector('#loopBtn').classList.toggle('active', this.activeMode === 'loop');
  this.shadowRoot.querySelector('#shuffleBtn').classList.toggle('active', this.activeMode === 'shuffle');
  this.shadowRoot.querySelector('#randomBtn').classList.toggle('active', this.activeMode === 'random');

  // Si shuffle activé, mélange la playlist
  if (this.activeMode === 'shuffle') {
    this.shuffledPlaylist = this.playlist.map((t, i) => i);
    this.shuffleArray(this.shuffledPlaylist);
    this.renderPlaylistOrder(false); // <-- false = ne réattache pas les listeners des boutons
  } else {
    this.renderPlaylistOrder(false); // remet ordre normal si pas shuffle
  }
}


  renderPlaylistOrder() {
  const ul = this.shadowRoot.querySelector('ul');
  const order = this.activeMode === 'shuffle' ? this.shuffledPlaylist : this.playlist.map((t,i) => i);
  
  // Recrée la liste
  ul.innerHTML = order.map(i => `<li data-index="${i}">${this.playlist[i].title}</li>`).join('');

  // Réattache les listeners uniquement pour les li
  this.shadowRoot.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', e => {
      this.playTrack(parseInt(e.target.dataset.index));
    });
  });

  this.updateUI();
}


  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  handleTrackEnd() {
    if (this.activeMode === 'loop') {
      this.playTrack(this.currentIndex);
    } else if (this.activeMode === 'shuffle') {
      let currentPos = this.shuffledPlaylist.indexOf(this.currentIndex);
      let nextPos = (currentPos + 1) % this.shuffledPlaylist.length;
      this.playTrack(this.shuffledPlaylist[nextPos]);
    } else if (this.activeMode === 'random') {
        let randIndex;
        do {
          randIndex = Math.floor(Math.random() * this.playlist.length);
        } while (randIndex === this.currentIndex); // tant que c’est le morceau courant, on tire un autre
        this.playTrack(randIndex);
      } else {
      // Playback normal
      if (this.currentIndex < this.playlist.length - 1) this.nextTrack();
    }
  }

  playTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    this.currentIndex = index;
    const track = this.playlist[index];
    this.audioPlayer.loadAndPlay(track.src);
    this.updateUI();
  }

  nextTrack() {
    const nextIndex = (this.currentIndex + 1) % this.playlist.length;
    this.playTrack(nextIndex);
  }

  updateUI() {
    this.shadowRoot.querySelectorAll('li').forEach(li => li.classList.remove('playing'));
    const currentLi = this.shadowRoot.querySelector(`li[data-index="${this.currentIndex}"]`);
    if (currentLi) currentLi.classList.add('playing');
  }
}

customElements.define('audio-playlist', AudioPlaylist);
