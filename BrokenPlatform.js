import Node from './Node';
import Settings from './constants/Settings';
import PlatformType from './constants/PlatformType';
import Colors from './constants/Colors';
import PlatformTint from './constants/PlatformTint';

class BrokenPlatform extends Node {
  constructor({ texture }) {
    super(texture);
    this.tint = PlatformTint[PlatformType.breakable];
    this.scale.set(Settings.scale);
    this.reset();
  }

  reset = () => {
    this.x = 0;
    this.y = 0;
    this.visible = false;
  };
}

export default BrokenPlatform;
