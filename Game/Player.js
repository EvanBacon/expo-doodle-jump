import Settings from '../Settings';
import PhysicsNode from './PhysicsNode';

class Player extends PhysicsNode {
  get left() {
    return this.x - this.width / 2;
  }
  set centerX(v) {
    this.x = v;
  }

  get right() {
    return this.x + this.width / 2;
  }

  get screenSize() {
    if (this.app) {
      return this.app.renderer;
    }
    return { width: 0, height: 0 };
  }

  constructor({ app, texture }) {
    super(texture);
    this.app = app;
    const {
      renderer: { width, height },
    } = app;
    this.reset();
  }

  reset() {
    super.reset();
    const { width, height } = this.screenSize;
    this.anchor.x = 0.5;
    this.centerX = width / 2;
    this.y = height / 2;
  }

  update() {
    super.update();

    this.velocity.y += Settings.gravity;

    // To avoid jitter
    if (Math.abs(this.velocity.x) > 1) {
      this.scale.x = this.velocity.x < 0 ? -Settings.scale : Settings.scale;
    }

    //Make the player move through walls
    if (this.left > this.screenSize.width) {
      this.x = this.width * -0.5;
    } else if (this.right < 0) {
      this.x = this.screenSize.width;
    }
  }

  jump = () => (this.velocity.y = this.jumpVelocity() * -Settings.scale);

  jumpVelocity = () => {
    return 15; // (this.app.renderer.width / Settings.scale) * 0.025;
  };

  springVelocity = () => {
    return this.jumpVelocity() * 1.5;
  };
  jumpHigh = () => (this.velocity.y = this.springVelocity() * -Settings.scale);
}
export default Player;
