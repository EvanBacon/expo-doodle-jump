import PhysicsNode from './PhysicsNode';
import Settings from '../Settings';

class BrokenPlatform extends PhysicsNode {
  constructor(texture, tint) {
    super(texture);
    this.tint = tint;
    this.reset();
  }

  reset() {
    super.reset();
    this.x = 0;
    this.y = 0;
    this.velocity.y = Settings.platformFallingVelocity;
    this.visible = false;
  }
}

export default BrokenPlatform;
