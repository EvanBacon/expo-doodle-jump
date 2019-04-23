import { Sprite } from 'pixi.js';
import Settings from '../Settings';

class Node extends Sprite {
  get left() {
    return this.x;
  }

  set centerX(v) {
    this.x = v - this.width / 2;
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

  update() {}
}

export default Node;
