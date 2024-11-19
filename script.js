const canvas = document.getElementById('kaplay-canvas');
let isFirstFloor = true;
let GAME_SPEED = 700;

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

  let floorNumber = 1;
  k.onClick(() => {
    const floor = k.add([
      k.sprite(`floor${floorNumber}`),
      k.pos(canvasWidth / 2, 0),
      k.anchor('center'),
      k.area(),
      k.offscreen({ hide: true, pause: true }),
      'floor',
    ]);
    floorNumber++;
    if (floorNumber === 3) floorNumber = 1;

    floor.onUpdate(() => {
      floor.move(0, GAME_SPEED);
    });
  });

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
  });
});

k.go('game');
