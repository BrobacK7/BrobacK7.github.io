// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const cors = require("cors");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Dossier de sauvegarde
const recordsDir = path.join(__dirname, "assets/records");
if (!fs.existsSync(recordsDir)) fs.mkdirSync(recordsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, recordsDir),
  filename: (req, file, cb) => {
    // Utilise le nom envoyé par le client
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Route PUT pour recevoir l’enregistrement
app.put("/api/records", upload.single("recording"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  res.status(200).send("File saved");
});

app.get("/api/records", (req, res) => {
  fs.readdir(recordsDir, (err, files) => {
    if (err) return res.status(500).send("Unable to list files");
    // Garde seulement wav ou mp3
    const audioFiles = files.filter(f => f.endsWith(".wav") || f.endsWith(".mp3"));
    res.json(audioFiles);
  });
});



app.use("/assets/records", express.static(recordsDir));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
