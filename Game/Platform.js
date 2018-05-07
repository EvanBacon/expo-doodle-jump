import PlatformTint from '../constants/PlatformTint';
import PlatformType from '../constants/PlatformType';
import Settings from '../constants/Settings';
import Node from './Node';
import PlatformLevels from '../constants/PlatformLevels';

let broken = 0;

class Platform extends Node {
  state = false;
  interacted = false;
  velocity = { x: 0, y: 0 };

  constructor({ textures, type }) {
    const { tint, texture } = PlatformTint[type];
    super(textures[texture]);
    this.tint = tint;
    this.type = type;

    if (this.type === PlatformType.moving) {
      this.velocity.x = 1;
    }
  }

  reset() {
    super.reset();
    this.y -= 12;
  }

  get canHaveSpring() {
    return (
      this.type === PlatformType.normal || this.type === PlatformType.moving
    );
  }
}

export default Platform;
