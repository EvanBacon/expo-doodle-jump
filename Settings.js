import { PixelRatio } from 'react-native';

export default {
  platformCount: 10,
  gravity: 1,
  scale: PixelRatio.get(),
  jumpVelocity: 10,
  springVelocity: 15,
  platformFallingVelocity: 16,
  collisionBuffer: 15,
};
