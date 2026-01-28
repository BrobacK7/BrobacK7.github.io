# Lecteur Audio Web Component

Un projet de test utilisant les Web Components et l'API Web Audio pour créer un lecteur audio complet avec effets visuels et fonctionnalités avancées.

## 🎵 Fonctionnalités

- **Lecteur audio** avec barre de progression
- **Égaliseur** graphique interactif
- **Visualisations audio** :
  - Butterchurn (visualisations autonomes)
  - Forme d'onde en temps réel
- **Sampler/Pad** avec support drag & drop
- **Enregistrement microphone**
- **Intégration Freesound** pour importer des samples
- **Playlist** avec 3 modes de lecture :
  - Shuffle (lecture aléatoire)
  - Random (aléatoire)
  - Loop (boucle)

## 🌐 Démo en ligne

Le site est accessible via GitHub Pages :
**[broback7.github.io](https://broback7.github.io)**

> ⚠️ **Note** : La fonctionnalité de sampler n'est pas disponible sur la version en ligne car elle nécessite un serveur API local.

## 🚀 Installation et lancement local

### Prérequis
- Node.js installé sur votre machine
- npm (inclus avec Node.js)

### Installation

1. Installez les dépendances :
```bash
cd PART3_WebComponentClient/lecteurAudioWebComponent/
npm i
```

2. Lancez le serveur API local :
```bash
cd PART3_WebComponentClient/lecteurAudioWebComponent/api
node serveur.js
```

3. Lancez index.html avec Live Server

Le projet est maintenant accessible localement avec toutes les fonctionnalités, y compris le sampler.

## 🎮 Guide d'utilisation

### Lecteur principal
- **Play/Pause** : Cliquez sur le bouton pour lire ou mettre en pause
- **Barre de progression** : Affiche la progression de la lecture

### Égaliseur
- Ajustez les barres de fréquences pour modifier le son selon vos préférences

### Butterchurn
- Visualisations autonomes qui réagissent à la musique en temps réel

### Sampler/Pad
- **Glisser-déposer** : Faites glisser un fichier audio sur un pad pour l'assigner
- **Clic gauche** : Joue le sample une fois
- **Clic droit** : Active/désactive le mode loop pour le sample

### Intégration Freesound
- Utilisez la barre de recherche pour trouver des previews audio depuis Freesound
- Ajoutez-les directement à vos pads

### Enregistreur microphone
- Situé après le Butterchurn
- Permet d'enregistrer et d'ajouter vos propres sons

### Playlist
- Gère vos pistes avec 3 modes :
  - **Shuffle** : Lecture aléatoire de la playlist
  - **Random** : Sélection aléatoire
  - **Loop** : Répétition de la playlist

## 🛠️ Technologies utilisées

- Web Components
- Web Audio API
- Butterchurn (visualisations)
- Freesound API
- Node.js (serveur local)

## 📝 Structure du projet

```
PART3_WebComponentClient/
└── lecteurAudioWebComponent/
    ├── api/
    │   └── serveur.js
    └── [autres fichiers du projet]
```

---

**Projet de test** - Exploration des possibilités de l'API Web Audio Graph avec les Web Components
