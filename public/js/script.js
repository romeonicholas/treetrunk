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

  const comicPages = document.getElementById("comic-pages");
  comicPages.innerHTML = ""; // Clear existing pages

  pages.forEach((page, index) => {
    const img = document.createElement("img");
    img.src = page;
    img.style.zIndex = 12 - index; // Descending z-index
    comicPages.appendChild(img);
  });
}

function flipPageForward() {
  playSFX(pageFlipSFX);

  currentPage++;
  const comicPages = document.getElementById("comic-pages");
  const pages = comicPages.querySelectorAll("img");
  if (currentPage < pages.length) {
    pages[currentPage].style.display = "block"; // Show the next page
    if (currentPage > 0) {
      pages[currentPage - 1].style.display = "none"; // Hide the previous page
    }
  }
}

function flipPageBackward() {
  if (currentPage > 0) {
    playSFX(pageFlipSFX);

    const comicPages = document.getElementById("comic-pages");
    const pages = comicPages.querySelectorAll("img");
    pages[currentPage].style.display = "none"; // Hide the current page
    currentPage--;
    pages[currentPage].style.display = "block"; // Show the previous page
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

  const selfieCutout = document.getElementById("selfie-cutout");
  selfieCutout.src = figureData[figureIndex].cutout;

  let video = document.querySelector("#video-element");

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        webcamStream = stream; // Store the stream
      })
      .catch(function (err) {
        console.log("Something went wrong!");
      });
  }
}

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
    webcamStream = null;
  }
  const video = document.getElementById("video-element");
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

  return fetch("/save-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: photoDataUrl }),
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
  // const photoPreviewScreen = document.getElementById("photo-preview-screen");
  // const photoReview = document.getElementById("photo-review-screen");
  const editedPhoto = document.getElementById("edited-photo");

  // photoPreviewScreen.classList.toggle("inactive");
  // photoReview.classList.toggle("show");

  try {
    const photoPath = await latestPhotoFilename;
    const imageUrl = `/unedited-photos/${photoPath}`;
    editedPhoto.src = imageUrl;
    generateQRCode(`localhost:3000${imageUrl}`);
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
      // Go back to last page of comic book screen
      transitionToScreen(photoPreviewScreen, comicBook);
      currentState = AppState.COMIC_BOOK;
    },
    right: () => {
      // Maybe do nothing or same as enter
    },
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
    // During countdown, keys are disabled
    left: () => {},
    right: () => {},
    enter: () => {},
  },

  [AppState.PHOTO_REVIEW]: {
    left: () => {
      // Go back to photo booth
      const photoPreviewScreen = document.getElementById(
        "photo-preview-screen"
      );
      const photoReview = document.getElementById("photo-review-screen");
      photoPreviewScreen.classList.remove("inactive");
      photoReview.classList.remove("show");
      currentState = AppState.PHOTO_BOOTH;
    },
    right: () => {
      // Go to figure select
      const figureSelectScreen = document.getElementById(
        "figure-select-screen"
      );
      const photoReview = document.getElementById("photo-review-screen");
      figureSelectScreen.classList.remove("inactive");
      photoReview.classList.remove("show");
      currentState = AppState.FIGURE_SELECT;
    },
    enter: () => {
      // Same as right - go to figure select
      const figureSelectScreen = document.getElementById(
        "figure-select-screen"
      );
      const photoReview = document.getElementById("photo-review-screen");
      figureSelectScreen.classList.remove("inactive");
      photoReview.classList.remove("show");
      currentState = AppState.FIGURE_SELECT;
    },
  },
};

// State Management //
window.addEventListener("keydown", async (e) => {
  const handler = stateHandlers[currentState];

  if (!handler) {
    console.error(`No handler for state: ${currentState}`);
    return;
  }

  switch (e.key) {
    case "ArrowLeft":
      console.log("Left key pressed");
      console.log("Current state:", currentState);
      handler.left();
      console.log("Updated state:", currentState);
      break;
    case "ArrowRight":
      console.log("Right key pressed");
      console.log("Current state:", currentState);
      handler.right();
      console.log("Updated state:", currentState);
      break;
    case "Enter":
      console.log("Enter key pressed");
      console.log("Current state:", currentState);
      handler.enter();
      console.log("Updated state:", currentState);
      break;
    default:
      break;
  }
});

function transitionToScreen(currentScreen, newScreen) {
  currentScreen.classList.remove("active");
  newScreen.classList.add("active");
}

// Initialize
updateCarousel();
