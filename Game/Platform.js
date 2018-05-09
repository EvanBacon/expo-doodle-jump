import Node from './Node';

let broken = 0;

class Platform extends Node {
  state = false;
  interacted = false;
  velocity = { x: 0, y: 0 };

  constructor({ textures, type }) {
    const { tint, texture } = Platform.Styles[type];
    super(textures[texture]);
    this.tint = tint;
    this.type = type;

    if (this.type === Platform.Types.moving) {
      this.velocity.x = 1;
    }
  }

  reset() {
    super.reset();
    this.y -= 12;
  }

  get canHaveSpring() {
    return (
      this.type === Platform.Types.normal || this.type === Platform.Types.moving
    );
  }
}

Platform.Types = {
  normal: 'normal',
  moving: 'moving',
  breakable: 'breakable',
  vanishable: 'vanishable',
};

Platform.Colors = {
  brown: 0x8b572a,
  blue: 0x158fbd,
  white: 0xffffff,
  green: 0x89c741,
};

Platform.Styles = {
  [Platform.Types.normal]: { tint: Platform.Colors.green, texture: 'block' },
  [Platform.Types.moving]: { tint: Platform.Colors.blue, texture: 'block' },
  [Platform.Types.breakable]: {
    tint: Platform.Colors.brown,
    texture: 'block_broken',
  },
  [Platform.Types.vanishable]: {
    tint: Platform.Colors.white,
    texture: 'block',
  },
};

Platform.Levels = [
  [Platform.Types.normal],
  [Platform.Types.normal, Platform.Types.moving],
  [
    Platform.Types.normal,
    Platform.Types.normal,
    Platform.Types.moving,
    Platform.Types.breakable,
  ],
  [Platform.Types.moving, Platform.Types.breakable, Platform.Types.breakable],
  [Platform.Types.moving, Platform.Types.breakable, Platform.Types.vanishable],
  [
    Platform.Types.moving,
    Platform.Types.breakable,
    Platform.Types.vanishable,
    Platform.Types.vanishable,
  ],
];

export default Platform;
