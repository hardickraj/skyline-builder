const canvas = document.getElementById('kaplay-canvas');

const k = kaplay({
  canvas: canvas,
  // debug: false
});

k.setGravity(1400);

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
    k.body({ isStatic: true }),
    k.offscreen({ hide: true }),
    k.animate(),
    k.timer(),
    'base',
  ]);
  base.scaleTo(canvasWidth / base.width);

  k.onClick(() => {
    console.log('Canvas clicked!');
    const floor = k.add([
      k.sprite(`floor${Math.floor(Math.random() * 2) + 1}`),
      k.pos(canvasWidth / 2, 0),
      k.anchor('center'),
      k.area(),
      k.scale(),
      k.body(),
      k.offscreen({ hide: true, pause: true }),
      'floor',
    ]);
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

  k.onCollide('floor', 'base', (floor, base) => {
    // if (!floor.isStatic) {
    //   floor.body.isStatic = true; // Stabilize the floor
    // }
    moveDown();
  });

  k.onCollide('floor', 'floor', (floor1, floor2) => {
    moveDown();
    // floor1.add([
    //   k.sprite(floor2.sprite),
    //   k.pos(0, 0),
    //   k.anchor('center'),
    //   k.area(),
    //   k.offscreen({ hide: true, pause: true }),
    //   'floor',
    // ]);
    // floor1.destroy();
    // floor1.move(0, 0); // Stop movement
    // floor1.drag(10);
    // floor1.addForce(k.vec2(0, 0));
    console.log(floor1);

    // floor1.body.isStatic = true; // Make floor static
  });
});

k.go('game');
