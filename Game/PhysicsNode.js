import Node from './Node';

class PhysicsNode extends Node {
  velocity = { x: 0, y: 0 };

  reset() {
    super.reset();
    this.velocity = { x: 0, y: 0 };
  }

  update() {
    super.update();
    if (this.visible) {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
  }
}

export default PhysicsNode;
