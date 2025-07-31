import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { exec } from "child_process";

import figureData from "./public/js/figureData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.post("/save-photo", (req, res) => {
  const { image, figureIndex } = req.body;
  const matches = image.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!matches) return res.status(400).send("Invalid image data");
  const buffer = Buffer.from(matches[1], "base64");
  const filename = `${Date.now()}.jpg`;
  const originalFilepath = path.join(
    __dirname,
    "public/originalUserPhotos",
    filename
  );
  const editedFilepath = path.join(
    __dirname,
    "public/editedUserPhotos",
    filename
  );

  fs.mkdirSync(path.dirname(originalFilepath), { recursive: true });

  const figure = figureData[figureIndex];
  if (!figure) return res.status(400).send("Invalid figure index");
  const cutoutPath = path.join(__dirname, "public", figure.cutout);
  const script = `powershell.exe -File ./edit-photo.ps1 "${originalFilepath}" "${editedFilepath}" "${cutoutPath}"`;
  const command = `powershell -ExecutionPolicy Bypass -File "${script}" "${originalFilepath}" "${editedFilepath}" "${cutoutPath}"`;

  fs.writeFile(originalFilepath, buffer, (err) => {
    if (err) return res.status(500).send("Failed to save");

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("PowerShell error:", error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ filename });
    });
  });
});

app.get("/", (request, response) => {
  response.render("index", { figureData: figureData });
});

app.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`);
});
