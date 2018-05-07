import { PIXI } from 'expo-pixi';

import Settings from '../constants/Settings';

class Node extends PIXI.Sprite {
  velocity = { x: 0, y: 0 };
  get left() {
    return this.x;
  }
  get right() {
    return this.x + this.width;
  }
  get top() {
    return this.y;
  }
  get bottom() {
    return this.y + this.height;
  }
  constructor(texture) {
    super();
    this.texture = texture;
    this.scale.set(Settings.scale);
  }

  reset() {
    this.scale.set(Settings.scale);
  }

  update() {
    if (this.visible) {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
  }
}

export default Node;
