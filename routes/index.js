import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
// import figureData from "../public/js/figureData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/save-photo", (req, res) => {
  const { image, figureIndex } = req.body;
  const matches = image.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!matches) return res.status(400).send("Invalid image data");

  const buffer = Buffer.from(matches[1], "base64");
  const filename = `${Date.now()}.jpg`;
  const originalFilepath = path.join(
    __dirname,
    "../public/originalUserPhotos",
    filename
  );
  const editedFilepath = path.join(
    __dirname,
    "../public/editedUserPhotos",
    filename
  );

  fs.mkdirSync(path.dirname(originalFilepath), { recursive: true });

  const figureData = req.app.locals.figureData;
  const figure = figureData[figureIndex];
  if (!figure) return res.status(400).send("Invalid figure index");

  const overlayPath = path.join(__dirname, "../public", figure.selfieOverlay);
  const script = path.resolve("./edit-user-photo.ps1");
  const command = `powershell -ExecutionPolicy Bypass -File "${script}" "${originalFilepath}" "${editedFilepath}" "${overlayPath}"`;

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

router.get("/", (request, response) => {
  const HOST = process.env.HOST || "localhost";
  const PORT = process.env.PORT || 3000;

  const figureData = request.app.locals.figureData;

  response.render("index", {
    figureData: figureData,
    appHost: HOST,
    appPort: PORT,
  });
});

router.get("/download/:filename", (req, response) => {
  const { filename } = req.params;
  const imagePath = `/editedUserPhotos/${filename}`;
  response.render("download", { imagePath });
});

export default router;
