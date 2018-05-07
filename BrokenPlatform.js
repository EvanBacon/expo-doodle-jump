import Node from './Node';
import Settings from './constants/Settings';
import PlatformType from './constants/PlatformType';

class BrokenPlatform extends Node {
  constructor({ textures }) {
    super(textures[PlatformType.breakable]);
    this.height = 17 * Settings.scale;
    this.width = 70 * Settings.scale;
    this.reset();
  }

  reset = () => {
    this.x = 0;
    this.y = 0;
    this.visible = false;
  };
}

export default BrokenPlatform;
