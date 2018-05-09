import PlatformType from './PlatformType';

export default [
  {
    platforms: [PlatformType.normal],
  },
  {
    platforms: [
      PlatformType.normal,
      PlatformType.moving,
    ],
  },
  {
    platforms: [
      PlatformType.normal,
      PlatformType.normal,
      PlatformType.moving,
      PlatformType.breakable,
    ],
  },
  {
    platforms: [
      PlatformType.moving,
      PlatformType.breakable,
      PlatformType.breakable,
    ],
  },
  {
    platforms: [
      PlatformType.moving,
      PlatformType.breakable,
      PlatformType.vanishable,
    ],
  },
  {
    platforms: [
      PlatformType.moving,
      PlatformType.breakable,
      PlatformType.vanishable,
      PlatformType.vanishable,
    ],
  },
];
