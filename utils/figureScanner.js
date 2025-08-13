import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function scanFigureData() {
  const figureResourcesPath = path.join(__dirname, "../public/figureResources");

  if (!fs.existsSync(figureResourcesPath)) {
    console.warn("figureResources directory not found");
    return [];
  }

  const figureData = [];
  const figureFolders = fs
    .readdirSync(figureResourcesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const folderName of figureFolders) {
    const figurePath = path.join(figureResourcesPath, folderName);
    const figureConfig = createFigureConfig(folderName, figurePath);

    if (figureConfig) {
      figureData.push(figureConfig);
    }
  }

  return figureData;
}



function createFigureConfig(name, figurePath) {
  try {
    const files = fs.readdirSync(figurePath);

    // Expected file patterns
    const filePatterns = {
      cutout: /^cutout\.webp$/i,
      cutoutPNG: /^cutout\.png$/i,
      text: /^text\.webp$/i,
      background: /^background\.webp$/i,
      cover: /^cover\.webp$/i,
      selfiePreview: /^selfie_preview\.webp$/i,
      selfieReview: /^selfie_review\.webp$/i,
      selfieFrame: /^selfie_frame\.webp$/i,
      selfieFramePNG: /^selfie_frame\.png$/i
    };

    // Find files matching patterns
    const figureFiles = {};
    for (const [type, pattern] of Object.entries(filePatterns)) {
      const matchingFile = files.find((file) => pattern.test(file));
      if (matchingFile) {
        figureFiles[type] = `/figureResources/${name}/${matchingFile}`;
      }
    }

    // Find pages (numbered files like page1.webp, page2.webp, etc.)
    const pageFiles = files
      .filter((file) => /^page\d+\.(png|webp|jpg)$/i.test(file))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      })
      .map((file) => `/figureResources/${name}/${file}`);

    const pages = [figureFiles.cover, ...pageFiles];

    
    const overlayScript = path.resolve("./create-selfie-overlay.ps1");
    const overlayCommand = `powershell -ExecutionPolicy Bypass -File "${overlayScript}" "${figurePath}"`;

    const selfieFramePath = path.join(figurePath, "selfie_frame.png");
    const cutoutPath = path.join(figurePath, "cutout.png");

    // Only run the overlay script if either file does NOT exist
    if (!fs.existsSync(selfieFramePath) || !fs.existsSync(cutoutPath)) {
      execSync(overlayCommand);
    }

    return {
      name: name,
      cutout: figureFiles.cutout,
      cutoutPNG: figureFiles.cutoutPNG,
      text: figureFiles.text,
      background: figureFiles.background,
      cover: figureFiles.cover,
      pages: pages,
      selfiePreview: figureFiles.selfiePreview,
      selfieReview: figureFiles.selfieReview,
      selfieFrame: figureFiles.selfieFrame,
      selfieFramePNG: figureFiles.selfieFramePNG,
      selfieOverlay: `/figureResources/${name}/overlay.png`
    };
  } catch (error) {
    console.error(`Error processing figure folder ${name}:`, error);
    return null;
  }
}
