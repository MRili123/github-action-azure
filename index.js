const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIX: Use writable directory in Azure
const FILE = path.join("/home", "visits.json");

let lock = false;

// ✅ Better error logging (important for Azure)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

// ✅ Read counter safely
function readCounter() {
  try {
    if (!fs.existsSync(FILE)) {
      fs.writeFileSync(FILE, JSON.stringify({ count: 0 }));
    }
    const data = fs.readFileSync(FILE);
    return JSON.parse(data).count;
  } catch (err) {
    console.error("❌ Erreur lecture JSON:", err);
    return 0;
  }
}

// ✅ Write counter safely
function writeCounter(count) {
  try {
    fs.writeFileSync(FILE, JSON.stringify({ count }, null, 2));
  } catch (err) {
    console.error("❌ Erreur écriture JSON:", err);
  }
}

// ✅ Main route
app.get("/", async (req, res) => {
  while (lock) await new Promise(r => setTimeout(r, 10));
  lock = true;

  try {
    let count = readCounter();
    count++;
    writeCounter(count);

    const hostname = req.hostname;
    const port = req.socket.localPort;
    const serverIP = req.socket.localAddress;
    const clientIP =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    res.send(`
      <h2>🐳 Compteur Docker - Ilias 🚀</h2>
      <p><strong>Nombre de visites :</strong> ${count}</p>
      <hr>
      <h3>📊 Informations serveur</h3>
      <p><strong>Hostname :</strong> ${hostname}</p>
      <p><strong>Port :</strong> ${port}</p>
      <p><strong>IP serveur :</strong> ${serverIP}</p>
      <hr>
      <h3>👤 Informations client</h3>
      <p><strong>IP client :</strong> ${clientIP}</p>
      <hr>
      <p><em>Déployé via Docker sur Azure ☁️</em></p>
    `);
  } catch (err) {
    console.error("❌ Route error:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    lock = false;
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});