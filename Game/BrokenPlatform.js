import Node from './Node';

class BrokenPlatform extends Node {
  constructor(texture, tint) {
    super(texture);
    this.tint = tint;
    this.reset();
  }

  reset() {
    super.reset();
    this.x = 0;
    this.y = 0;
    this.velocity.y = 8;
    this.visible = false;
  }
}

export default BrokenPlatform;
