import Direction from './constants/Direction';
import Node from './Node';
import Settings from './constants/Settings';

const spriteMap = {
  [Direction.left]: 'player_00',
  [Direction.right]: 'player_01',
  [Direction.leftLand]: 'player_02',
  [Direction.rightLand]: 'player_03',
};

class Player extends Node {
  vy = 11;
  vx = 0;
  isDead = false;

  set dir(value) {
    if (this._dir === value) return;
    this._dir = value;
    this.texture = this.textures[value];
  }

  constructor({ app: { renderer: { width, height } }, textures }) {
    super(textures[spriteMap[Direction.left]]);
    this.textures = textures;
    this.screenSize = { width, height };
    this.reset()
  }
  
  reset = () => {
    const {width, height } = this.screenSize
    this.width = 55 * Settings.scale;
    this.height = 40 * Settings.scale;
    this.x = width / 2;
    this.y = height / 2;
  }

  update(delta) {
    super.update(delta);

    this.y += this.vy;
    this.vy += Settings.gravity;

    if (
      this.vy > 0 &&
      this.x + 15 < 260 &&
      this.x + this.width - 15 > 155 &&
      this.y + this.height > 475 &&
      this.y + this.height < 500
    ) {
      this.jump();
    }
    //Accelerations produces when the user hold the keys
    
    this.x += this.vx;
  
    //Make the player move through walls
    if (this.x > this.screenSize.width) {
      this.x = 0 - this.width;
    } else if (this.x < 0 - this.width) {
      this.x = this.screenSize.width;
    }
  }

  jump = () => (this.vy = -10 * (Settings.scale/2));
  jumpHigh = () => (this.vy = -16 * (Settings.scale/2) );
}
export default Player;
