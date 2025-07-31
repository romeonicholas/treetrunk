import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

import figureData from "./public/js/figureData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.post("/save-photo", (req, res) => {
  const { image } = req.body;
  const matches = image.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!matches) return res.status(400).send("Invalid image data");
  const buffer = Buffer.from(matches[1], "base64");
  const filename = `${Date.now()}.jpg`;
  const filepath = path.join(__dirname, "public/unedited-photos", filename);

  fs.mkdirSync(path.dirname(filepath), { recursive: true });

  fs.writeFile(filepath, buffer, (err) => {
    if (err) return res.status(500).send("Failed to save");
    res.json({ filename });
  });
});

app.get("/", (request, response) => {
  response.render("index", { figureData: figureData });
});

app.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`);
});
