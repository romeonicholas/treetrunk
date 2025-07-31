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
    text.classList.remove("off-left-text", "center-text", "off-right-text");

    const diff = getDiff(i, current);
    if (diff <= -1) text.classList.add("off-left-text", "ease-out-text");
    else if (diff === 0) text.classList.add("center-text", "ease-in-text");
    else if (diff >= 1) text.classList.add("off-right-text", "ease-out-text");
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
