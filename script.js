const canvas = document.getElementById("kaplay-canvas");

const k = kaplay({
  canvas: canvas,
  // debug: false
});

const canvasWidth = k.width();
const canvasHeight = k.height();

const background = k.add([
  k.rect(canvasWidth, canvasHeight),
  k.color(),
  k.pos(k.center()),
  k.anchor("center"),
]);


