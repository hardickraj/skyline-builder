const canvas = document.getElementById('kaplay-canvas');
let isFirstFloor = true;
let GAME_SPEED = 50;
let ROTATION_SPEED = GAME_SPEED / 50;
let MAX_ROTATION = 45;
let FLOOR_COUNT = 0;

const k = kaplay({
  canvas: canvas,
  // debug: false
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

  // ADDING BG, BASE, CRANE HOOK

  const background = k.add([
    k.rect(canvasWidth, canvasHeight),
    k.color(220, 240, 255),
    k.pos(k.center()),
    k.anchor('center'),
  ]);

  const base = k.add([
    k.sprite('base'),
    k.pos(canvasWidth / 2, canvasHeight),
    k.anchor('bot'),
    k.area({ shape: new k.Rect(k.vec2(0, -290), 180, 100) }),
    k.scale(),
    k.timer(),
    'base',
  ]);
  base.scaleTo(canvasWidth / base.width);

  const hook = k.add([
    // k.rect(50, 50),
    k.sprite('hook'),
    // k.color(255, 0, 0),
    k.pos(canvasWidth / 2, -40),
    k.anchor('top'),
    k.area(),
    k.animate(),
    k.timer(),
    k.rotate(0),
    'hook',
  ]);

  // adding floor to hook
  let floorNumber = 1;

  const fakeFloor = k.make([
    k.sprite(`floor${floorNumber}`),
    k.pos(0, hook.height),
    k.anchor('top'),
    k.area(),
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

  function animateHook() {
    let hookDirection = 1;

    hook.onUpdate(() => {
      if (hook.angle > MAX_ROTATION) hookDirection = -1;
      if (hook.angle < -MAX_ROTATION) hookDirection = 1;
      hook.angle += hookDirection * ROTATION_SPEED;
      hook.move(-hookDirection * GAME_SPEED, 0);
    });
  }

  animateHook();

  // CLICK AND SPACE BAR LOGIC
  let isHookAnimating = false;
  const releaseFloor = () => {
    if (isHookAnimating) return;

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
          vec2(hook.pos.x, 0),
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
    releaseFloor();
  });
  k.onKeyDown((key) => {
    if (key === 'space') {
      releaseFloor();
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
        'fake-floor',
      ]);
      FLOOR_COUNT++;
      k.debug.log(`Floor count: ${FLOOR_COUNT}`);

      // moveDown();
    }
  });

  k.onCollide('fake-floor', 'floor', (fakeFloor, floor) => {
    moveDown();
    floor.destroy();
    fakeFloor.add([
      k.sprite(floor.sprite),
      k.pos(0, -fakeFloor.height),
      k.anchor('bot'),
      k.area(),
      'fake-floor',
    ]);

    FLOOR_COUNT++;
    k.debug.log(`Floor count: ${FLOOR_COUNT}`);
  });
});

k.go('game');
