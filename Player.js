import Direction from './constants/Direction';
import Node from './Node';
import Settings from './constants/Settings';

class Player extends Node {
  velocity = {
    x: 0,
    y: 11,
  };

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
    textures,
  }) {
    super(textures.player);
    this.textures = textures;
    this.screenSize = { width, height };
    this.reset();
  }

  reset = () => {
    const { width, height } = this.screenSize;
    this.anchor.x = 0.5;
    this.scale.set(Settings.scale);
    this.x = width / 2;
    this.y = height / 2;
  };

  update(delta) {
    super.update(delta);

    this.x += this.velocity.x;
    this.y += this.velocity.y;

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

  jump = () => (this.velocity.y = -10 * (Settings.scale / 2));

  jumpHigh = () => (this.velocity.y = -16 * (Settings.scale / 2));
}
export default Player;
