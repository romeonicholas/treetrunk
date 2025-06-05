// Elements
const figureFooter = document.getElementById("figure-footer");
const carousel = document.getElementById("figure-carousel");
const comicBook = document.getElementById("comic-book");
// const comicCover = document.getElementById("comic-cover");
const figures = Array.from(
  document.querySelectorAll(".figure-transform-wrapper")
);
const texts = Array.from(document.querySelectorAll(".carousel-text"));

const count = figures.length;
let current = 0;

// Audio
const interactSFX = new Audio("/audio/select.mp3");
const backgroundSFX = new Audio("/audio/background.mp3");
const countdownSFX = new Audio("/audio/countdownBeep.mp3");
const photoSFX = new Audio("/audio/photo.mp3");
const coverpageSFX = new Audio("/audio/coverpage.mp3");

function playSFX(sfx) {
  sfx.currentTime = 0;
  sfx.play();
}

function playInteractSFX() {
  interactSFX.currentTime = 0;
  interactSFX.play();
}

function playBackgroundSFX() {
  backgroundSFX.currentTime = 0;
  backgroundSFX.loop = true;
  backgroundSFX.volume = 0.5;
  backgroundSFX.play();
}

function stopBackgroundSFX() {
  backgroundSFX.pause();
  backgroundSFX.currentTime = 0;
}

function getDiff(i, center) {
  let diff = i - center;
  if (diff > count / 2) diff -= count;
  else if (diff < -count / 2) diff += count;
  return diff;
}

const Direction = {
  LEFT: "left",
  RIGHT: "right",
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
  direction,
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
  } else {
    console.error("Invalid direction provided to applyFigureClasses");
    return;
  }
}

function updateCarousel(direction) {
  figures.forEach((figure, i) => {
    figure.classList.remove(...transformClasses);
    figure.firstElementChild.classList.remove(...scaleClasses);

    const diff = getDiff(i, current);
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
    text.classList.remove("off-left-text", "center-text", "right-text");

    const diff = getDiff(i, current);
    if (diff <= -1) text.classList.add("off-left-text");
    else if (diff === 0) text.classList.add("center-text");
    else if (diff >= 1) text.classList.add("right-text");
  });
}

function prev() {
  playInteractSFX();
  current = (current - 1 + count) % count;
  updateCarousel(Direction.LEFT);
}

function next() {
  playInteractSFX();
  current = (current + 1) % count;
  updateCarousel(Direction.RIGHT);
}

function showCover() {
  if (comicBook.classList.contains("show")) {
    playSFX(interactSFX);
  } else {
    playSFX(coverpageSFX);
  }

  carousel.classList.toggle("show");
  figureFooter.classList.toggle("show");

  comicBook.classList.toggle("show");
}

// function flipPage() {
//   const comicCover = document.getElementById("comic-cover");
//   const page1 = document.getElementById("comic-1");
// }

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

function showPhotoBooth() {
  stopBackgroundSFX();
  const figureSelectScreen = document.getElementById("figure-select-screen");
  const photoBooth = document.getElementById("photo-booth-screen");
  // const comicCover = document.getElementById("comic-cover");

  figureSelectScreen.classList.toggle("inactive");
  // comicCover.classList.toggle("show");
  photoBooth.classList.toggle("show");

  let video = document.querySelector("#video-element");

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
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

async function showPhotoReview(latestPhotoFilename) {
  stopWebcam();
  const photoBooth = document.getElementById("photo-booth-screen");
  const photoReview = document.getElementById("photo-review-screen");
  const editedPhoto = document.getElementById("edited-photo");

  photoBooth.classList.toggle("inactive");
  photoReview.classList.toggle("show");

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

window.addEventListener("keydown", async (e) => {
  if (e.key === "a") prev();
  if (e.key === "d") next();
  if (e.key === "s") showCover();
  if (e.key === "f") flipPage();
  if (e.key === "j") showPhotoBooth();
  if (e.key === "k") {
    await showCountdownTimer();
    latestPhotoFilename = await capturePhoto();
    showPhotoReview(latestPhotoFilename);
  }
});

updateCarousel();
