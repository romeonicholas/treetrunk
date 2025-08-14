// import figureData from "./figureData.js";
const figureData = window.figureData;

// Figure Select Elements //

const figureSelectScreen = document.getElementById("figure-select-screen");
const figures = Array.from(
  document.querySelectorAll(".figure-transform-wrapper")
);
const texts = Array.from(document.querySelectorAll(".carousel-text"));

// Comic Book Elements //

const comicBookScreen = document.getElementById("comic-book-screen");
const comicPages = document.getElementById("comic-pages");
const pageFlip = document.getElementById("page-flip");

// Photo Preview Elements //

const photoPreviewScreen = document.getElementById("photo-preview-screen");
const photoPreviewBackground = document.getElementById(
  "photo-preview-background"
);
const countdown = document.getElementById("countdown");
// const spinner = document.getElementById("spinner");
const selfieCutout = document.getElementById("selfie-cutout");
const video = document.getElementById("video-element");
const photoCanvas = document.getElementById("canvas-element");

// Photo Review Elements //

const photoReviewScreen = document.getElementById("photo-review-screen");
const photoReviewBackground = document.getElementById(
  "photo-review-background"
);
const qrCodeCanvas = document.getElementById("qr-code");
const editedPhoto = document.getElementById("edited-photo");

// Functions //

function sendTTT(value) {
  fetch("/send-ttt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value }),
  }).catch((error) => {
    console.error("Failed to send TTT message:", error);
  });
}

// Initialization //

const figurecount = figures.length;
let figureIndex = 0;
let isAnimating = false;
let currentPage = 0;
let webcamStream = null;
let latestPhotoFilename = "";
window.addEventListener("load", initializeWebSocket);

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

// Carousel Functionality

function getDiff(i, center) {
  let diff = i - center;
  if (diff > figurecount / 2) diff -= figurecount;
  else if (diff < -figurecount / 2) diff += figurecount;
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
  if (isAnimating) {
    console.log("Animation in progress, ignoring input");
    return;
  }

  isAnimating = true;

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

  setTimeout(() => {
    isAnimating = false;
  }, 1000);
}

function prev() {
  if (isAnimating) return;

  playInteractSFX();
  figureIndex = (figureIndex - 1 + figurecount) % figurecount;
  updateCarousel(Direction.LEFT);
}

function next() {
  if (isAnimating) return;

  playInteractSFX();
  figureIndex = (figureIndex + 1) % figurecount;
  updateCarousel(Direction.RIGHT);
}

function loadPages() {
  const currentFigure = figureData[figureIndex];
  const pages = currentFigure.pages;
  currentPage = 0;

  comicPages.innerHTML = "";

  let index = 0;
  pages.forEach((page) => {
    const img = document.createElement("img");
    img.classList.add("comic-page");
    img.src = page;
    img.style.zIndex = 12 - index;
    if (index === 0) {
      img.style.display = "block";
    }
    index++;
    comicPages.appendChild(img);
  });


  const previewImg = document.createElement("img");
  previewImg.src = currentFigure.selfiePreview;
  previewImg.classList.add("comic-page");
  previewImg.style.zIndex = 12 - index;
  index++;
  comicPages.appendChild(previewImg);

  const reviewImg = document.createElement("img");
  reviewImg.src = currentFigure.selfieReview;
  reviewImg.classList.add("comic-page");
  reviewImg.style.zIndex = 12 - index;
  comicPages.appendChild(reviewImg);
}

function flipPageForward() {
  if (isAnimating) return;
  isAnimating = true;
  
  playSFX(pageFlipSFX);
  
  
  const pages = comicPages.querySelectorAll("img");
  pages[currentPage].classList.remove("back");
  currentPage++;


  if (currentPage < pages.length) {
    pages[currentPage].style.display = "block";
    if (pageFlip.classList.contains("turned")) {
      pageFlip.classList.add("page-flip-reset");
      pageFlip.classList.remove("turned");
      pageFlip.offsetHeight;
      pageFlip.classList.remove("page-flip-reset");
      pageFlip.classList.add("turned");
    } else {
      pageFlip.classList.add("turned");
    }

    if (currentPage > 0) {
      // pages[currentPage - 1].style.display = "none";
      pages[currentPage - 1].classList.add("turned");
    }
  }

  setTimeout(() => {
    isAnimating = false;
  }, 750);
}

function flipPageBackward() {
  if (currentPage > 0) {
    playSFX(pageFlipSFX);

    if (pageFlip.classList.contains("turned")) {
      pageFlip.classList.remove("turned");
    } else {
      pageFlip.classList.add("page-flip-reset");
      pageFlip.classList.add("turned");
      pageFlip.offsetHeight; // Trigger reflow
      pageFlip.classList.remove("page-flip-reset");
      pageFlip.classList.remove("turned");
    }
    const pages = comicPages.querySelectorAll("img");
    // pages[currentPage].style.display = "none";
    currentPage--;
    pages[currentPage].classList.add("back");
    pages[currentPage].style.display = "block";
    pages[currentPage].classList.remove("turned");
  }
}

function showCountdownTimer() {
  return new Promise((resolve) => {
    let timeleft = 4;
    countdown.src = `/images/ui/countdown/countdown_5.webp`;

    countdownSFX.currentTime = 0;
    countdownSFX.play();

    let photoTimer = setInterval(function () {
      if (timeleft <= 0) {
        clearInterval(photoTimer);
        countdown.src = "/images/ui/countdown/countdown_click.webp";
        photoSFX.currentTime = 0;
        photoSFX.play();
        resolve();
      } else {
        countdown.src = `/images/ui/countdown/countdown_${timeleft}.webp`;
        countdownSFX.currentTime = 0;
        countdownSFX.play();
      }
      timeleft -= 1;
    }, 1000);
  });
}

function updatePhotoPreviewScreen() {
  photoPreviewBackground.src = figureData[figureIndex].selfiePreview;
  selfieCutout.src = figureData[figureIndex].cutout;

  // spinner.style.display = "none";
  photoCanvas.style.display = "none";

  video.style.display = "block";

  if (navigator.mediaDevices.getUserMedia) {
    video.onloadedmetadata = () => {
      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    };
    navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: 9 / 16
        }
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
  if (video && photoCanvas && video.videoWidth && video.videoHeight) {
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    photoCanvas.getContext("2d").drawImage(video, 0, 0);
    photoCanvas.style.display = "block";
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
  photoCanvas.width = video.videoWidth;
  photoCanvas.height = video.videoHeight;
  photoCanvas.getContext("2d").drawImage(video, 0, 0);
  const photoDataUrl = photoCanvas.toDataURL("image/png");

  stopWebcam();
  // spinner.style.display = "block";

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

function drawCanvas(qr, scale, border, lightColor, darkColor, qrCodeCanvas) {
  if (scale <= 0 || border < 0) throw new RangeError("Value out of range");
  const width = (qr.size + border * 2) * scale;
  qrCodeCanvas.width = width;
  qrCodeCanvas.height = width;
  let ctx = qrCodeCanvas.getContext("2d");
  for (let y = -border; y < qr.size + border; y++) {
    for (let x = -border; x < qr.size + border; x++) {
      ctx.fillStyle = qr.getModule(x, y) ? darkColor : lightColor;
      ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    }
  }
}

function generateQRCode(filename) {
  const qr = qrcodegen.QrCode.encodeText(filename, qrcodegen.QrCode.Ecc.LOW);

  if (!qrCodeCanvas) {
    console.error("No canvas element with id 'qr-canvas' found.");
    return;
  }

  drawCanvas(qr, 13, 1, "#c2cae9", "#000000", qrCodeCanvas);
}

async function updatePhotoReviewScreen(latestPhotoFilename) {
  photoReviewBackground.src = figureData[figureIndex].selfieReview;
  editedPhoto.src = `/editedUserPhotos/${latestPhotoFilename}`;

  
  editedPhoto.classList.add("show");
  qrCodeCanvas.classList.add("show");


  try {
    const photoPath = await latestPhotoFilename;
    generateQRCode(
      `http://${window.appHost}:${window.appPort}/download/${photoPath}`
    );
  } catch (error) {
    console.error("Error resolving photo promise:", error);
  }
}

// State Control //

const LightingScene = {
  FIGURE_SELECT: 1,
  COMIC_BOOK: 2,
  PHOTO_PREVIEW: 3,
};

const AppState = {
  FIGURE_SELECT: "FIGURE_SELECT",
  COMIC_BOOK: "COMIC_BOOK",
  PHOTO_PREVIEW: "PHOTO_PREVIEW",
  PHOTO_COUNTDOWN: "PHOTO_COUNTDOWN",
  PHOTO_REVIEW: "PHOTO_REVIEW",
};

// State transition handlers
const stateHandlers = {
  [AppState.FIGURE_SELECT]: {
    left: () => prev(),
    right: () => next(),
    enter: () => {
      playSFX(coverpageSFX);
      loadPages();
      transitionAppState(
        figureSelectScreen,
        comicBookScreen,
        AppState.COMIC_BOOK,
        LightingScene.COMIC_BOOK
      );
    },
  },

  [AppState.COMIC_BOOK]: {
    left: () => {
      if (currentPage <= 0) {
        transitionAppState(
          comicBookScreen,
          figureSelectScreen,
          AppState.FIGURE_SELECT,
          LightingScene.FIGURE_SELECT
        );
      } else {
        flipPageBackward();
      }
    },
    right: () => {
      if (currentPage >= figureData[figureIndex].pages.length - 2) {
        updatePhotoPreviewScreen();
      }
      if (currentPage >= figureData[figureIndex].pages.length - 1) {
        updatePhotoPreviewScreen();
        flipPageForward()
        
          // transitionAppState(
          //   comicBookScreen,
          //   photoPreviewScreen,
          //   AppState.PHOTO_PREVIEW,
          //   LightingScene.PHOTO_PREVIEW
          // );
        photoPreviewScreen.classList.add("active");
        currentAppState = AppState.PHOTO_PREVIEW;
        sendTTT(LightingScene.PHOTO_PREVIEW);
      } else {
        flipPageForward();
      }
    },
    enter: () => {
      transitionAppState(
        comicBookScreen,
        figureSelectScreen,
        AppState.FIGURE_SELECT,
        LightingScene.FIGURE_SELECT
      );
    },
  },

  [AppState.PHOTO_PREVIEW]: {
    left: () => {
      stopWebcam();
      currentAppState = AppState.COMIC_BOOK;
      sendTTT(LightingScene.COMIC_BOOK);
      // transitionAppState(
      //   photoPreviewScreen,
      //   comicBookScreen,
      //   AppState.COMIC_BOOK,
      //   LightingScene.COMIC_BOOK
      // );
    },
    right: () => {},
    enter: async () => {
      currentAppState = AppState.PHOTO_COUNTDOWN;
      await showCountdownTimer();
      latestPhotoFilename = await capturePhoto();
      await updatePhotoReviewScreen(latestPhotoFilename);
      photoReviewScreen.classList.add("active");
      flipPageForward();
      photoPreviewScreen.classList.remove("active");

      

      currentAppState = AppState.PHOTO_REVIEW;
      sendTTT(LightingScene.COMIC_BOOK);
      // transitionAppState(
      //   photoPreviewScreen,
      //   photoReviewScreen,
      //   AppState.PHOTO_REVIEW,
      //   LightingScene.COMIC_BOOK
      // );
      
    },
  },

  [AppState.PHOTO_COUNTDOWN]: {
    left: () => {},
    right: () => {},
    enter: () => {},
  },

  [AppState.PHOTO_REVIEW]: {
    left: () => {
      updatePhotoPreviewScreen();
      currentAppState = AppState.PHOTO_PREVIEW;
      sendTTT(LightingScene.PHOTO_PREVIEW);
      // transitionAppState(
      //   photoReviewScreen,
      //   photoPreviewScreen,
      //   AppState.PHOTO_PREVIEW,
      //   LightingScene.PHOTO_PREVIEW
      // );
      comicBookScreen.classList.remove("active");
      photoPreviewScreen.classList.add("active");
    },
    right: () => {
      transitionAppState(
        photoReviewScreen,
        figureSelectScreen,
        AppState.FIGURE_SELECT,
        LightingScene.FIGURE_SELECT
      );
    },
    enter: () => {
      transitionAppState(
        photoReviewScreen,
        figureSelectScreen,
        AppState.FIGURE_SELECT,
        LightingScene.FIGURE_SELECT
      );
    },
  },
};

// WebSocket connection for Phidget buttons //
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
  if (isAnimating) {
    console.log("Animation in progress, ignoring input");
    return;
  }

  const handler = stateHandlers[currentAppState];

  if (!handler) {
    console.error(`No handler for state: ${currentAppState}`);
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

// Keyboard input handling for development //
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

function transitionAppState(currentScreen, newScreen, appState, lightingScene) {
  currentScreen.classList.remove("active");
  newScreen.classList.add("active");
  currentAppState = appState;
  sendTTT(lightingScene || 0);
}

// Initial setup //
updateCarousel();
sendTTT(LightingScene.FIGURE_SELECT);
let currentAppState = AppState.FIGURE_SELECT;
