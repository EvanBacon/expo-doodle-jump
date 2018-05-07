import PlatformType from './PlatformType';
import Colors from './Colors';

export default {
  [PlatformType.normal]: Colors.green,
  [PlatformType.moving]: Colors.blue,
  [PlatformType.breakable]: Colors.brown,
  [PlatformType.vanishable]: Colors.white,
};
