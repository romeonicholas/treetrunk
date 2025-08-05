import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

    // Define expected file patterns
    const filePatterns = {
      cutout: /^cutout\.(png|webp|jpg)$/i,
      text: /^text\.(png|webp|jpg)$/i,
      background: /^background\.(png|webp|jpg)$/i,
      cover: /^cover\.(png|webp|jpg)$/i,
      selfiePreview: /^selfie_preview\.(png|webp|jpg)$/i,
      selfieReview: /^selfie_review\.(png|webp|jpg)$/i,
      selfieCutout: /^selfie_cutout\.(png|webp|jpg)$/i,
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

    // Add cover as first page if it exists
    const pages = figureFiles.cover
      ? [figureFiles.cover, ...pageFiles]
      : pageFiles;

    return {
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize name
      cutout: figureFiles.cutout || null,
      text: figureFiles.text || null,
      background: figureFiles.background || null,
      cover: figureFiles.cover || null,
      pages: pages,
      selfiePreview: figureFiles.selfiePreview || null,
      selfieReview: figureFiles.selfieReview || null,
      selfieCutout: figureFiles.selfieCutout || null,
    };
  } catch (error) {
    console.error(`Error processing figure folder ${name}:`, error);
    return null;
  }
}
