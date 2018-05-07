import Node from './Node';
import PlatformType from './constants/PlatformType';
import Settings from './constants/Settings';
import PlatformTint from './constants/PlatformTint';

let broken = 0;

class Platform extends Node {
  state = false;
  interacted = false;
  velocity = { x: 1, y: 0 };
  constructor({ app, textures, score }) {
    super(textures.block);
    this.textures = textures;
    this.scale.set(Settings.scale);
    this.x = this.width / 2 + Math.random() * (app.renderer.width - this.width);

    //Setting the probability of which type of platforms should be shown
    if (score >= 5000) {
      this.types = [
        PlatformType.moving,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.vanishable,
        PlatformType.vanishable,
        PlatformType.vanishable,
        PlatformType.vanishable,
      ];
    } else if (score >= 2000 && score < 5000) {
      this.types = [
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.vanishable,
        PlatformType.vanishable,
        PlatformType.vanishable,
        PlatformType.vanishable,
      ];
    } else if (score >= 1000 && score < 2000) {
      this.types = [
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
      ];
    } else if (score >= 500 && score < 1000) {
      this.types = [
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.moving,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
        PlatformType.breakable,
      ];
    } else if (score >= 100 && score < 500) {
      this.types = [
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.normal,
        PlatformType.moving,
        PlatformType.moving,
      ];
    } else {
      this.types = [PlatformType.normal];
    }

    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    if (this.type === PlatformType.breakable) {
      if (broken < 1) {
        this.isBreakable = true;
        broken += 1;
      } else if (broken >= 1) {
        this.type = PlatformType.normal;
        broken = 0;
      }
    }
  }

  reset = () => {
    this.y -= 12;
  };

  set isBreakable(value) {
    if (value) {
      this.texture = this.textures['block_broken'];
    } else {
      this.texture = this.textures['block'];
    }
  }

  get type() {
    return this._type;
  }

  set type(value) {
    if (this._type === value) return;
    this._type = value;
    this.tint = PlatformTint[value];

    // this.texture = this.textures[value];
  }
}

export default Platform;
