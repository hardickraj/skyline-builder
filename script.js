import shiftColor from './utils/shiftColor.js';
window.scrollTo(0, 0);

const canvas = document.getElementById('kaplay-canvas');
let isFirstFloor = true;
let GAME_SPEED = 220;
let ROTATION_SPEED = 1;
let MAX_ROTATION = 45;
let FLOOR_COUNT = 0;
let SCORE = 0;
let LIVES = 3;
const k = kaplay({
  canvas: canvas,
  // debug: false
  background: [250, 250, 250],
  backgroundAudio: true,
  focus: false,
});

const canvasWidth = k.width();
const canvasHeight = k.height();

k.scene('game', async () => {
  await k.loadSprite('balloon1', './assets/images/balloon-1.svg');
  await k.loadSprite('balloon2', './assets/images/balloon-2.svg');
  await k.loadSprite('airplane1', './assets/images/airplane-1.svg');
  await k.loadSprite('airplane2', './assets/images/airplane-2.svg');
  await k.loadSprite('birds1', './assets/images/birds-1.svg');
  await k.loadSprite('birds2', './assets/images/birds-2.svg');
  await k.loadSprite('base', './assets/images/base-0.png');
  await k.loadSprite('floor1', './assets/images/floor-1.png');
  await k.loadSprite('floor2', './assets/images/floor-2.png');
  await k.loadSprite('hook', './assets/images/hook.png');
  await k.loadSprite('startButton', './assets/images/click-button.svg');
  await k.loadSprite('heart', './assets/images/heart.svg');
  await k.loadSprite('scoreBox', './assets/images/score-box.svg');
  await k.loadSprite('floorBox', './assets/images/floor-box.svg');
  await k.loadSprite('arrow', './assets/images/arrow.png');

  await k.loadFont('bagelFatOne', './assets/fonts/BagelFatOne.ttf');

  await k.loadSound('bgMusic', './assets/sounds/bg-music.mp3');
  await k.loadSound('fall', './assets/sounds/fall.mp3');
  await k.loadSound('perfectScore', './assets/sounds/perfect-score.mp3');
  await k.loadSound('pop', './assets/sounds/pop.mp3');
  await k.loadSound('thud', './assets/sounds/thud.mp3');

  // CREATING GRADIENT BACKGROUND

  const gradientCanvas = document.createElement('canvas');
  gradientCanvas.width = canvasWidth;
  gradientCanvas.height = canvasHeight;

  const ctx = gradientCanvas.getContext('2d');

  let bgColorOne = '#7bbcff';
  let bgColorTwo = '#b8fdfd';

  const drawGradient = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, bgColorOne);
    gradient.addColorStop(1, bgColorTwo);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  };

  drawGradient();

  const loadBackground = () => {
    const gradientBgDataUrl = gradientCanvas.toDataURL();
    k.loadSprite('gradientBg', gradientBgDataUrl);
    const background = k.add([k.sprite('gradientBg'), k.z(0)]);
  };

  loadBackground();

  // METHOD TO CHANGE GRADIENT COLOR

  const updateBackground = () => {
    0.1;
    bgColorOne = shiftColor(bgColorOne, 2, 0.008, -0.008);
    bgColorTwo = shiftColor(bgColorTwo, 2, 0.008, -0.008);
    drawGradient();
    loadBackground();
  };

  // ADDING HUD

  const renderHearts = () => {
    const container = document.getElementById('hearts-container');
    container.innerHTML = '';
    for (let i = 0; i < LIVES; i++) {
      const heart = document.createElement('img');
      heart.src = './assets/images/heart.svg';
      heart.className = 'heart';
      container.appendChild(heart);
    }
  };

  renderHearts();

  const startButton = k.add([
    k.sprite('startButton'),
    k.pos(canvasWidth / 2, canvasHeight / 2 + 80),
    k.anchor('center'),
    k.timer(),
    // k.scale(0.9),
    k.z(50),
  ]);

  const startButtonPos = startButton.worldPos();

  const arrow = k.add([
    k.sprite('arrow'),
    k.pos(startButtonPos.x, startButtonPos.y - startButton.height * 1.2),
    k.anchor('bot'),
    k.timer(),
    k.z(50),
  ]);

  const animateArrow = () => {
    arrow
      .tween(
        arrow.pos.y,
        arrow.pos.y + 35,
        0.5,
        (value) => (arrow.pos.y = value),
        k.easings.easeInOutSine
      )
      .onEnd(() => {
        arrow
          .tween(
            arrow.pos.y,
            arrow.pos.y - 35,
            0.5,
            (value) => (arrow.pos.y = value),
            k.easings.easeInOutSine
          )
          .onEnd(() => animateArrow());
      });
  };

  // const animateStartButton = () => {
  //   startButton
  //     .tween(
  //       startButton.scale,
  //       k.vec2(1, 1),
  //       1,
  //       (value) => (startButton.scale = value),
  //       k.easings.easeInOutSine
  //     )
  //     .onEnd(() => {
  //       startButton
  //         .tween(
  //           startButton.scale,
  //           k.vec2(0.9, 0.9),
  //           1,
  //           (value) => (startButton.scale = value),
  //           k.easings.easeInOutSine
  //         )
  //         .onEnd(() => animateStartButton());
  //     });
  // };

  animateArrow();
  // animateStartButton();

  // ADDING BASE, CRANE-HOOK
  const base = k.add([
    k.sprite('base'),
    k.pos(canvasWidth / 2, canvasHeight + 50),
    k.anchor('bot'),
    k.area({ shape: new k.Rect(k.vec2(0, -230), 180, 100) }),
    k.timer(),
    k.z(10),
    'base',
  ]);

  const hook = k.add([
    k.sprite('hook'),
    k.pos(canvasWidth / 2, 0),
    k.anchor('top'),
    k.area(),
    k.animate(),
    k.timer(),
    k.rotate(0),
    k.z(10),
    'hook',
  ]);

  // adding floor to hook
  let floorNumber = 1;
  let fakeFloor;

  fakeFloor = k.make([
    k.sprite(`floor${floorNumber}`),
    k.pos(0, hook.height),
    k.anchor('top'),
    k.area(),
    k.z(10),
  ]);

  hook.add(fakeFloor);

  // MOVE DOWN METHOD

  function moveDown(distance = fakeFloor.height) {
    base.wait(0.5, () => {
      base
        .tween(
          vec2(base.pos.x, base.pos.y),
          vec2(base.pos.x, base.pos.y + distance),
          0.6,
          (value) => (base.pos = value)
        )
        .onEnd(() => updateBackground());
    });
  }

  // ANIMATING THE HOOK
  const animateHook = () => {
    let hookDirection = 1;
    hook.onUpdate(() => {
      if (hook.pos.x <= 0 - fakeFloor.width / 2 || hook.angle > MAX_ROTATION)
        hookDirection = 1;
      if (
        hook.pos.x >= canvasWidth + fakeFloor.width / 2 ||
        hook.angle < -MAX_ROTATION
      )
        hookDirection = -1;

      hook.angle += -hookDirection * ROTATION_SPEED;
      hook.move(hookDirection * GAME_SPEED, 0);
    });
  };

  // CLICK AND SPACE BAR LOGIC

  let isHookAnimating = false;

  const clickLogic = () => {
    if (isHookAnimating) return;

    if (isFirstFloor) {
      if (startButton.parent) startButton.destroy();
      if (arrow.parent) arrow.destroy();
      k.play('bgMusic', {
        volume: 0.2,
        loop: true,
        speed: 1,
        detune: 100,
      });
      animateHook();
    }

    if (fakeFloor.parent) {
      isHookAnimating = true;
      const globalPos = fakeFloor.worldPos();

      // hook.tween(
      //   vec2(hook.pos.x, hook.pos.y),
      //   vec2(hook.pos.x, -hook.height),
      //   0.25,
      //   (value) => (hook.pos = value)
      // );

      fakeFloor.destroy();

      const floor = k.add([
        k.sprite(`floor${floorNumber}`),
        k.pos(globalPos.x, globalPos.y),
        k.anchor('top'),
        k.area(),
        k.offscreen({ destroy: true, distance: 1 }),
        k.z(10),
        'floor',
      ]);
      floorNumber++;
      if (floorNumber === 3) floorNumber = 1;

      floor.onUpdate(() => {
        floor.move(0, 750);
      });

      floor.onDestroy(() => {
        if (floor.pos.y > canvasHeight - floor.height) {
          LIVES--;
          k.play('thud');
          k.play('fall');
          updateHeartsUi();
        }
      });
    }

    if (!fakeFloor.parent) {
      isHookAnimating = true;
      k.wait(1.1, () => {
        // hook.tween(
        //   vec2(hook.pos.x, hook.pos.y),
        //   vec2(hook.pos.x, -40),
        //   0.4,
        //   (value) => (hook.pos = value)
        // );
        fakeFloor = k.make([
          k.sprite(`floor${floorNumber}`),
          k.pos(0, hook.height),
          k.anchor('top'),
          k.area(),
          k.z(10),
        ]);
        hook.add(fakeFloor);

        k.wait(0.35, () => {
          isHookAnimating = false;
        });
      });
    }
  };

  k.onClick(() => {
    clickLogic();
  });
  k.onKeyDown((key) => {
    if (key === 'space') {
      clickLogic();
    }
  });

  // COLLIDE LOGICS

  base.onCollide('floor', (floor) => {
    floor.destroy();
    if (isFirstFloor) {
      isFirstFloor = false;
      base.add([
        k.sprite(floor.sprite),
        k.pos(0, -325),
        k.anchor('bot'),
        k.area(),
        k.z(10),
        'fake-floor',
      ]);
      FLOOR_COUNT++;
      SCORE += 25;
      document.getElementById('floor-number').textContent = FLOOR_COUNT;
      document.getElementById('score-number').textContent = SCORE;
      moveDown();
    }
  });

  k.onCollide('fake-floor', 'floor', (fakeFloor, floor, col) => {
    const fakeFloorPos = fakeFloor.worldPos();
    const attachmentPos = col.target.pos.x - fakeFloorPos.x;

    floor.destroy();

    if (
      Math.abs(attachmentPos) <= fakeFloor.width / 2 &&
      floor.pos.x > 0 &&
      floor.pos.x < canvasWidth
    ) {
      const newFloor = fakeFloor.add([
        k.sprite(floor.sprite),
        k.pos(attachmentPos, -fakeFloor.height),
        k.anchor('bot'),
        k.color(),
        k.area(),
        k.z(10),
        'fake-floor',
      ]);

      // LOGICS IF ATTACHMENT POSITION IS VERY CLOSE
      if (Math.abs(attachmentPos) <= 5) {
        k.play('perfectScore');
        newFloor.color = k.rgb('#fcd34d');
        SCORE += 25;
      } else {
        k.play('pop');
        SCORE += 10;
      }

      FLOOR_COUNT++;
      document.getElementById('floor-number').textContent = FLOOR_COUNT;
      document.getElementById('score-number').textContent = SCORE;
      document.getElementById('floor-score-text').textContent =
        FLOOR_COUNT > 1 ? 'Floors' : 'Floor';

      // INCREASING GAME SPEED
      if (FLOOR_COUNT % 2 === 1) {
        ROTATION_SPEED += 0.3;
        MAX_ROTATION = ROTATION_SPEED * 45;
        GAME_SPEED = ROTATION_SPEED * 220;
      }

      moveDown();
      return;
    }

    // FLOOR COLLIDES OUTSIDE ATTACHMENT POSITION
    const fallingFloor = k.add([
      k.sprite(floor.sprite),
      k.pos(col.target.pos.x, col.target.pos.y + floor.height),
      k.anchor('bot'),
      k.rotate(),
      k.timer(),
      k.offscreen({ destroy: true }),
      k.z(10),
      'falling-floor',
    ]);
    k.play('thud');
    fallingFloor.onUpdate(() => {
      fallingFloor.angle += attachmentPos >= 0 ? 3 : -3;
      fallingFloor.wait(0.2, () => {
        fallingFloor.move(0, 750);
      });
    });
    k.wait(0.4, () => {
      k.play('fall');
    });
    LIVES--;

    updateHeartsUi();
  });

  const updateHeartsUi = () => {
    if (LIVES <= 0) {
      k.wait(1, () => {
        window.location.href = `result.html?score=${SCORE}&floor=${FLOOR_COUNT}`;
        k.quit();
      });
    }
    const totalHearts = document.querySelectorAll('.heart');
    totalHearts.forEach((heart, index) => {
      heart.style.opacity = index < LIVES ? 1 : 0.3;
    });
  };
});

k.go('game');
