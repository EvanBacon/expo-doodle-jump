import Settings from '../constants/Settings';
import Node from './Node';

class Player extends Node {
  get left() {
    return this.x - this.width / 2;
  }
  get right() {
    return this.x + this.width / 2;
  }

  constructor({
    app: {
      renderer: { width, height },
    },
    texture,
  }) {
    super(texture);
    this.screenSize = { width, height };
    this.reset();
  }

  reset() {
    super.reset();
    const { width, height } = this.screenSize;
    this.anchor.x = 0.5;
    this.x = width / 2;
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

  jump = () => (this.velocity.y = -23 * (Settings.scale / 2));

  jumpHigh = () => (this.velocity.y = -32 * (Settings.scale / 2));
}
export default Player;
