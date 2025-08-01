import figureData from "./figureData.js";

// Elements
const texts = Array.from(document.querySelectorAll(".carousel-text"));
const figures = Array.from(
  document.querySelectorAll(".figure-transform-wrapper")
);
const figureSelectScreen = document.getElementById("figure-select-screen");
const comicBook = document.getElementById("comic-book");
const photoPreviewScreen = document.getElementById("photo-preview-screen");

const count = figures.length;
let figureIndex = 0;

let currentPage = 0;

// Audio //

const interactSFX = new Audio("/audio/clickButton.wav");
const coverpageSFX = new Audio("/audio/showCover.wav");

const pageFlipSFX = new Audio("/audio/pageFlip.mp3");

const countdownSFX = new Audio("/audio/countdownBeep.mp3");
const photoSFX = new Audio("/audio/photoSnap.mp3");

function playSFX(sfx) {
  sfx.currentTime = 0;
  sfx.play();
}

function playInteractSFX() {
  interactSFX.currentTime = 0;
  interactSFX.play();
}

// Carousel Functionality //

function getDiff(i, center) {
  let diff = i - center;
  if (diff > count / 2) diff -= count;
  else if (diff < -count / 2) diff += count;
  return diff;
}

const Direction = {
  LEFT: Symbol("left"),
  RIGHT: Symbol("right"),
  NONE: Symbol("none"), // For first page load
};

const TransformClass = {
  OFF_LEFT: "off-left-translate",
  FAR_LEFT: "far-left-translate",
  MIDDLE_LEFT: "middle-left-translate",
  CENTER: "center-translate",
  MIDDLE_RIGHT: "middle-right-translate",
  FAR_RIGHT: "far-right-translate",
  OFF_RIGHT: "off-right-translate",
};

const transformClasses = [
  "off-left-translate",
  "off-focus",
  "far-focus",
  "middle-focus",
  "center-focus",
  "middle-focus",
  "far-focus",
  "off-focus",

  "far-left-translate",
  "middle-left-translate",
  "center-translate",
  "middle-right-translate",
  "far-right-translate",
  "off-right-translate",

  "ease-in",
  "ease-out",
];

const ScaleClass = {
  OFF: "off-scale",
  FAR: "far-scale",
  MIDDLE: "middle-scale",
  CENTER: "center-scale",
};

const scaleClasses = [
  "off-scale",
  "far-scale",
  "middle-scale",
  "center-scale",
  "middle-scale",
  "far-scale",
  "off-scale",

  "ease-in",
  "ease-out",
];

const FocusClass = {
  OFF: "off-focus",
  FAR: "far-focus",
  MIDDLE: "middle-focus",
  CENTER: "center-focus",
};

const EaseClass = {
  IN: "ease-in",
  OUT: "ease-out",
};

const carouselFigureClassMap = [
  {
    translate: TransformClass.OFF_LEFT,
    focus: FocusClass.OFF,
    scale: ScaleClass.OFF,
    leftEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
    rightEase: { transform: EaseClass.OUT, scale: EaseClass.IN },
  },
  {
    translate: TransformClass.FAR_LEFT,
    focus: FocusClass.FAR,
    scale: ScaleClass.FAR,
    leftEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
    rightEase: { transform: EaseClass.OUT, scale: EaseClass.IN },
  },
  {
    translate: TransformClass.MIDDLE_LEFT,
    focus: FocusClass.MIDDLE,
    scale: ScaleClass.MIDDLE,
    leftEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
    rightEase: { transform: EaseClass.OUT, scale: EaseClass.IN },
  },
  {
    translate: TransformClass.CENTER,
    focus: FocusClass.CENTER,
    scale: ScaleClass.CENTER,
    leftEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
    rightEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
  },
  {
    translate: TransformClass.MIDDLE_RIGHT,
    focus: FocusClass.MIDDLE,
    scale: ScaleClass.MIDDLE,
    leftEase: { transform: EaseClass.OUT, scale: EaseClass.IN },
    rightEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
  },
  {
    translate: TransformClass.FAR_RIGHT,
    focus: FocusClass.FAR,
    scale: ScaleClass.FAR,
    leftEase: { transform: EaseClass.OUT, scale: EaseClass.IN },
    rightEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
  },
  {
    translate: TransformClass.OFF_RIGHT,
    focus: FocusClass.OFF,
    scale: ScaleClass.OFF,
    leftEase: { transform: EaseClass.OUT, scale: EaseClass.IN },
    rightEase: { transform: EaseClass.IN, scale: EaseClass.OUT },
  },
];

function applyFigureClasses(
  figure,
  direction = Direction.NONE,
  translateClass,
  focusClass,
  scaleClass,
  leftEase,
  rightEase
) {
  figure.classList.add(translateClass, focusClass);
  figure.firstElementChild.classList.add(scaleClass);

  if (direction === Direction.LEFT) {
    figure.classList.add(leftEase.transform);
    figure.firstElementChild.classList.add(leftEase.scale);
  } else if (direction === Direction.RIGHT) {
    figure.classList.add(rightEase.transform);
    figure.firstElementChild.classList.add(rightEase.scale);
  } else if (direction === Direction.NONE) {
    console.log("Applying startup classes");
  } else {
    console.error("Invalid direction provided to applyFigureClasses");
  }
}

function updateCarousel(direction) {
  figures.forEach((figure, i) => {
    figure.classList.remove(...transformClasses);
    figure.firstElementChild.classList.remove(...scaleClasses);

    const diff = getDiff(i, figureIndex);
    const mapIndex = Math.max(-3, Math.min(3, diff)) + 3;
    const config = carouselFigureClassMap[mapIndex];

    applyFigureClasses(
      figure,
      direction,
      config.translate,
      config.focus,
      config.scale,
      config.leftEase,
      config.rightEase
    );
  });

  texts.forEach((text, i) => {
    text.classList.remove("off-left-text", "center-text", "off-right-text");

    const diff = getDiff(i, figureIndex);
    if (diff <= -1) text.classList.add("off-left-text", "ease-out-text");
    else if (diff === 0) text.classList.add("center-text", "ease-in-text");
    else if (diff >= 1) text.classList.add("off-right-text", "ease-out-text");
  });
}

function prev() {
  playInteractSFX();
  figureIndex = (figureIndex - 1 + count) % count;
  updateCarousel(Direction.LEFT);
}

function next() {
  playInteractSFX();
  figureIndex = (figureIndex + 1) % count;
  updateCarousel(Direction.RIGHT);
}

function loadPages() {
  const currentFigure = figureData[figureIndex];
  const pages = currentFigure.pages;
  currentPage = 0;

  const comicPages = document.getElementById("comic-pages");
  comicPages.innerHTML = ""; 

  pages.forEach((page, index) => {
    const img = document.createElement("img");
    img.src = page;
    img.style.zIndex = 12 - index; 
    comicPages.appendChild(img);
  });
}

function flipPageForward() {
  playSFX(pageFlipSFX);

  currentPage++;
  const comicPages = document.getElementById("comic-pages");
  const pages = comicPages.querySelectorAll("img");
  if (currentPage < pages.length) {
    pages[currentPage].style.display = "block";
    if (currentPage > 0) {
      pages[currentPage - 1].style.display = "none"; 
    }
  }
}

function flipPageBackward() {
  if (currentPage > 0) {
    playSFX(pageFlipSFX);

    const comicPages = document.getElementById("comic-pages");
    const pages = comicPages.querySelectorAll("img");
    pages[currentPage].style.display = "none"; 
    currentPage--;
    pages[currentPage].style.display = "block";
  }
}

function showCountdownTimer() {
  let countdownElement = document.getElementById("countdown");

  return new Promise((resolve) => {
    let timeleft = 2;
    countdownElement.innerHTML = 3;

    countdownSFX.currentTime = 0;
    countdownSFX.play();

    let photoTimer = setInterval(function () {
      if (timeleft <= 0) {
        clearInterval(photoTimer);
        countdownElement.innerHTML = "";
        photoSFX.currentTime = 0;
        photoSFX.play();
        resolve();
      } else {
        countdownElement.innerHTML = timeleft;
        countdownSFX.currentTime = 0;
        countdownSFX.play();
      }
      timeleft -= 1;
    }, 1150);
  });
}

let webcamStream = null;

function showPhotoPreviewScreen() {
  const photoPreviewBackground = document.getElementById(
    "photo-preview-background"
  );
  photoPreviewBackground.src = figureData[figureIndex].selfie;
  const spinner = document.getElementById("spinner");
  spinner.style.display = "none";

  const selfieCutout = document.getElementById("selfie-cutout");
  selfieCutout.src = figureData[figureIndex].selfieCutout;

  let photoCanvas = document.getElementById("canvas-element");
  photoCanvas.style.display = "none";
  let video = document.querySelector("#video-element");
  video.style.display = "block";

  if (navigator.mediaDevices.getUserMedia) {
    video.onloadedmetadata = () => {
      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    };
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
      })
      .then(function (stream) {
        video.srcObject = stream;
        webcamStream = stream;
      })
      .catch(function (err) {
        console.log("Something went wrong!");
      });
  }
}

function stopWebcam() {
  const video = document.getElementById("video-element");
  const canvas = document.getElementById("canvas-element");
  if (video && canvas && video.videoWidth && video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.style.display = "block";
    video.style.display = "none";
  }

  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
    webcamStream = null;
  }
  if (video) {
    video.srcObject = null;
  }
}

function capturePhoto() {
  const videoElement = document.getElementById("video-element");
  const canvasElement = document.getElementById("canvas-element");

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  canvasElement.getContext("2d").drawImage(videoElement, 0, 0);
  const photoDataUrl = canvasElement.toDataURL("image/jpeg");

  stopWebcam();
  document.getElementById("spinner").style.display = "block";

  return fetch("/save-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: photoDataUrl, figureIndex }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Saved as:", data.filename);
      URL.revokeObjectURL(photoDataUrl);
      return data.filename;
    });
}

// QR Code Generation //

function drawCanvas(qr, scale, border, lightColor, darkColor, canvas) {
  if (scale <= 0 || border < 0) throw new RangeError("Value out of range");
  const width = (qr.size + border * 2) * scale;
  canvas.width = width;
  canvas.height = width;
  let ctx = canvas.getContext("2d");
  for (let y = -border; y < qr.size + border; y++) {
    for (let x = -border; x < qr.size + border; x++) {
      ctx.fillStyle = qr.getModule(x, y) ? darkColor : lightColor;
      ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    }
  }
}

function generateQRCode(filename) {
  const qr = qrcodegen.QrCode.encodeText(filename, qrcodegen.QrCode.Ecc.LOW);

  const canvas = document.getElementById("qr-code");
  if (!canvas) {
    console.error("No canvas element with id 'qr-canvas' found.");
    return;
  }

  const outputElem = document.getElementById("output");
  drawCanvas(qr, 13, 1, "#FFFFFF", "#000000", canvas);
}

async function showPhotoReviewScreen(latestPhotoFilename) {
  const photoReviewBackground = document.getElementById(
    "photo-review-background"
  );
  photoReviewBackground.src = figureData[figureIndex].selfieReview;

  const editedPhoto = document.getElementById("edited-photo");
  editedPhoto.src = `/editedUserPhotos/${latestPhotoFilename}`;
  try {
    const photoPath = await latestPhotoFilename;
    generateQRCode(`http://10.62.0.227:4000/download/${photoPath}`);
  } catch (error) {
    console.error("Error resolving photo promise:", error);
  }
}

let latestPhotoFilename = "";

// State Control //

const AppState = {
  FIGURE_SELECT: "FIGURE_SELECT",
  COMIC_BOOK: "COMIC_BOOK",
  PHOTO_PREVIEW: "PHOTO_PREVIEW",
  PHOTO_COUNTDOWN: "PHOTO_COUNTDOWN",
  PHOTO_REVIEW: "PHOTO_REVIEW",
};

let currentState = AppState.FIGURE_SELECT;

// State transition handlers
const stateHandlers = {
  [AppState.FIGURE_SELECT]: {
    left: () => prev(),
    right: () => next(),
    enter: () => {
      if (figureIndex != 0) {
        const message = document.createElement("div");
        message.textContent =
          "Only Yvonne Chouteau's comic is available in this hardware validation build";
        message.style.position = "fixed";
        message.style.top = "50%";
        message.style.left = "50%";
        message.style.transform = "translate(-50%, -50%)";
        message.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        message.style.color = "white";
        message.style.padding = "100px";
        message.style.borderRadius = "50px";
        message.style.fontSize = "5em";
        message.style.zIndex = "1000";
        document.body.appendChild(message);

        setTimeout(() => {
          document.body.removeChild(message);
        }, 2000);
      } else {
        playSFX(coverpageSFX);
        loadPages();
        transitionToScreen(figureSelectScreen, comicBook);
        currentState = AppState.COMIC_BOOK;
      }
    },
  },

  [AppState.COMIC_BOOK]: {
    left: () => {
      if (currentPage <= 0) {
        transitionToScreen(comicBook, figureSelectScreen);
        currentState = AppState.FIGURE_SELECT;
      } else {
        flipPageBackward();
      }
    },
    right: () => {
      if (currentPage >= figureData[figureIndex].pages.length - 1) {
        currentState = AppState.PHOTO_PREVIEW;
        showPhotoPreviewScreen();
        transitionToScreen(comicBook, photoPreviewScreen);
      } else {
        flipPageForward();
      }
    },
    enter: () => {
      transitionToScreen(comicBook, figureSelectScreen);
      currentState = AppState.FIGURE_SELECT;
    },
  },

  [AppState.PHOTO_PREVIEW]: {
    left: () => {
      transitionToScreen(photoPreviewScreen, comicBook);
      currentState = AppState.COMIC_BOOK;
    },
    right: () => {},
    enter: async () => {
      currentState = AppState.PHOTO_COUNTDOWN;
      await showCountdownTimer();

      latestPhotoFilename = await capturePhoto();

      photoPreviewScreen.classList.remove("active");
      const photoReviewScreen = document.getElementById("photo-review-screen");
      photoReviewScreen.classList.add("active");
      showPhotoReviewScreen(latestPhotoFilename);
      currentState = AppState.PHOTO_REVIEW;
    },
  },

  [AppState.PHOTO_COUNTDOWN]: {
    left: () => {},
    right: () => {},
    enter: () => {},
  },

  [AppState.PHOTO_REVIEW]: {
    left: () => {
      showPhotoPreviewScreen();
      const photoReviewScreen = document.getElementById("photo-review-screen");
      transitionToScreen(photoReviewScreen, photoPreviewScreen);
      currentState = AppState.PHOTO_PREVIEW;

    },
    right: () => {
      const figureSelectScreen = document.getElementById(
        "figure-select-screen"
      );
      const photoReview = document.getElementById("photo-review-screen");
      photoReview.classList.remove("active");
      figureSelectScreen.classList.add("active");
      currentState = AppState.FIGURE_SELECT;
    },
    enter: () => {
      const figureSelectScreen = document.getElementById(
        "figure-select-screen"
      );
      const photoReview = document.getElementById("photo-review-screen");
      photoReview.classList.remove("active");
      figureSelectScreen.classList.add("active");
      currentState = AppState.FIGURE_SELECT;
    },
  },
};

// WebSocket connection for Phidget button presses
let ws = null;

function initializeWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = function () {
    console.log("Connected to WebSocket server for button input");
  };

  ws.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "button-press") {
        console.log(`Received button press: ${data.action}`);
        handleInput(data.action);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onclose = function () {
    console.log("WebSocket connection closed");
    setTimeout(initializeWebSocket, 1000);
  };

  ws.onerror = function (error) {
    console.error("WebSocket error:", error);
  };
}

async function handleInput(action) {
  const handler = stateHandlers[currentState];

  if (!handler) {
    console.error(`No handler for state: ${currentState}`);
    return;
  }

  switch (action) {
    case "left":
      handler.left();
      break;
    case "right":
      handler.right();
      break;
    case "enter":
      handler.enter();
      break;
    default:
      console.log("Unknown action:", action);
      break;
  }
}

// Keep keyboard fallback for development
window.addEventListener("keydown", async (e) => {
  switch (e.key) {
    case "ArrowLeft":
      handleInput("left");
      break;
    case "ArrowRight":
      handleInput("right");
      break;
    case "Enter":
      handleInput("enter");
      break;
  }
});

// Initialize WebSocket when page loads
window.addEventListener("load", initializeWebSocket);

function transitionToScreen(currentScreen, newScreen) {
  currentScreen.classList.remove("active");
  newScreen.classList.add("active");
}

// Initialize
updateCarousel();
