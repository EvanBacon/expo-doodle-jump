import Colors from './Colors';
import PlatformType from './PlatformType';

export default {
  [PlatformType.normal]: { tint: Colors.green, texture: 'block' },
  [PlatformType.moving]: { tint: Colors.blue, texture: 'block' },
  [PlatformType.breakable]: { tint: Colors.brown, texture: 'block_broken' },
  [PlatformType.vanishable]: { tint: Colors.white, texture: 'block' },
};
