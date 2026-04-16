const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

let count = 0;

app.get("/", (req, res) => {
  count++;
  res.send(`Nombre de visites : ${count}`);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});