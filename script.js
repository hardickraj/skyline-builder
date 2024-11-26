import shiftColor from './utils/shiftColor.js';

const canvas = document.getElementById('kaplay-canvas');
let isFirstFloor = true;
let GAME_SPEED = 200;
let ROTATION_SPEED = GAME_SPEED / 150;
let MAX_ROTATION = GAME_SPEED / 10;
let FLOOR_COUNT = 0;
let SCORE = 0;
const k = kaplay({
  canvas: canvas,
  // debug: false
  background: [250, 250, 250],
});

// k.setGravity(1400);

const canvasWidth = k.width();
const canvasHeight = k.height();

k.scene('game', async () => {
  await k.loadSprite('balloon1', '/assets/images/balloon-1.svg');
  await k.loadSprite('balloon2', '/assets/images/balloon-2.svg');
  await k.loadSprite('airplane1', '/assets/images/airplane-1.svg');
  await k.loadSprite('airplane2', '/assets/images/airplane-2.svg');
  await k.loadSprite('birds1', '/assets/images/birds-1.svg');
  await k.loadSprite('birds2', '/assets/images/birds-2.svg');
  await k.loadSprite('base', '/assets/images/base-0.png');
  await k.loadSprite('floor1', '/assets/images/floor-1.png');
  await k.loadSprite('floor2', '/assets/images/floor-2.png');
  await k.loadSprite('hook', '/assets/images/hook.png');

  // CREATING GRADIENT BACKGROUND

  const gradientCanvas = document.createElement('canvas');
  gradientCanvas.width = canvasWidth;
  gradientCanvas.height = canvasHeight;

  const ctx = gradientCanvas.getContext('2d');

  let bgColorOne = '#FFFAAA';
  let bgColorTwo = '#96C8CD';

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
    bgColorOne = shiftColor(bgColorOne, 5);
    bgColorTwo = shiftColor(bgColorTwo, 5);
    drawGradient();
    loadBackground();
  };

  // ADDING BASE, CRANE-HOOK
  const base = k.add([
    k.sprite('base'),
    k.pos(canvasWidth / 2, canvasHeight),
    k.anchor('bot'),
    k.area({ shape: new k.Rect(k.vec2(0, -290), 180, 100) }),
    k.scale(),
    k.timer(),
    k.z(10),
    'base',
  ]);
  base.scaleTo(canvasWidth / base.width);

  const hook = k.add([
    k.sprite('hook'),
    k.pos(canvasWidth / 2, -40),
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

  const fakeFloor = k.make([
    k.sprite(`floor${floorNumber}`),
    k.pos(0, hook.height),
    k.anchor('top'),
    k.area(),
    k.z(10),
  ]);

  hook.add(fakeFloor);

  // MOVE DOWN METHOD

  function moveDown() {
    base.wait(0.5, () => {
      base.tween(
        vec2(base.pos.x, base.pos.y),
        vec2(base.pos.x, base.pos.y + 100),
        0.6,
        (value) => (base.pos = value)
      );
    });
  }

  // ANIMATING THE HOOK
  const animateHook = () => {
    let hookDirection = 1;
    // hook.onUpdate(() => {
    //   if (hook.pos.x <= 0 - fakeFloor.width / 2 || hook.angle > MAX_ROTATION)
    //     hookDirection = 1; // Checking if the hook reaches the left side
    //   if (
    //     hook.pos.x >= canvasWidth + fakeFloor.width / 2 ||
    //     hook.angle < -MAX_ROTATION
    //   )
    //     hookDirection = -1;

    //   hook.angle += -hookDirection * ROTATION_SPEED; // Rotate the hook
    //   hook.move(hookDirection * GAME_SPEED, 0); // Move the hook based on the updated speed
    // });

    hook.onUpdate(() => {
      if (hook.pos.x <= 0 - fakeFloor.width) hookDirection = 1; // Checking if the hook reaches the left side
      if (hook.pos.x >= canvasWidth + fakeFloor.width) hookDirection = -1;

      // hook.angle += -hookDirection * 1); // Rotate the hook
      hook.move(hookDirection * GAME_SPEED, 0); // Move the hook based on the updated speed
    });
  };

  // CLICK AND SPACE BAR LOGIC

  let isHookAnimating = false;
  const clickLogic = () => {
    if (isHookAnimating) return;
    if (isFirstFloor) animateHook();
    console.log(GAME_SPEED);
    if (FLOOR_COUNT % 5 === 4) {
      GAME_SPEED += 100;
      // ROTATION_SPEED += 0.3;
      console.log(GAME_SPEED);
    }

    if (fakeFloor.parent) {
      isHookAnimating = true;
      const globalPos = fakeFloor.worldPos();

      hook.tween(
        vec2(hook.pos.x, hook.pos.y),
        vec2(hook.pos.x, -hook.height),
        0.25,
        (value) => (hook.pos = value)
      );

      fakeFloor.destroy();

      const floor = k.add([
        k.sprite(`floor${floorNumber}`),
        k.pos(globalPos.x, globalPos.y),
        k.anchor('top'),
        k.area(),
        k.offscreen({ hide: true, pause: true }),
        k.z(10),
        'floor',
      ]);
      floorNumber++;
      if (floorNumber === 3) floorNumber = 1;

      floor.onUpdate(() => {
        floor.move(0, 750);
      });
    }

    if (!fakeFloor.parent) {
      isHookAnimating = true;
      k.wait(1.1, () => {
        hook.tween(
          vec2(hook.pos.x, hook.pos.y),
          vec2(hook.pos.x, -40),
          0.25,
          (value) => (hook.pos = value)
        );
        hook.add(fakeFloor);

        k.wait(0.25, () => {
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
        k.pos(0, -390),
        k.anchor('bot'),
        k.area(),
        k.scale(1 + canvasWidth / base.width / 2),
        k.z(10),
        'fake-floor',
      ]);
      FLOOR_COUNT++;
      k.debug.log(`Floor count: ${FLOOR_COUNT}`);
    }
  });

  k.onCollide('fake-floor', 'floor', (fakeFloor, floor, col) => {
    const fakeFloorPos = fakeFloor.worldPos();
    const attachmentPos = col.target.pos.x - fakeFloorPos.x;

    floor.destroy();

    if (Math.abs(attachmentPos) <= fakeFloor.width / 2) {
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
        newFloor.color = k.rgb('#ffd52d');
        SCORE += 25;
      } else {
        SCORE += 10;
      }

      FLOOR_COUNT++;
      updateBackground();
      k.debug.log(`Floor count: ${FLOOR_COUNT}`);
      k.debug.log(`Score: ${SCORE}`);

      moveDown();
      return;
    }

    // CREATING FALLING FLOOR IF OUT OF ATTACHMENT POSITION
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

    fallingFloor.onUpdate(() => {
      fallingFloor.angle += attachmentPos >= 0 ? 3 : -3;
      fallingFloor.wait(0.2, () => {
        fallingFloor.move(0, 750);
      });
    });
  });
});

k.go('game');
