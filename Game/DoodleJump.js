import { Asset } from 'expo';
import { Dimensions, Platform as RNPlatform } from 'react-native';

import * as AssetUtils from 'expo-asset-utils';
// import ExpoPixi, { PIXI } from 'expo-pixi';
import * as PIXI from 'pixi.js';
import SpriteSheetImage from '../spritesheet.png';
import Settings from '../Settings';
import SpriteSheet from '../SpriteSheet';
import BrokenPlatform from './BrokenPlatform';
import Platform from './Platform';
import Player from './Player';
import Spring from './Spring';

let broken = 0;
const levels = [100, 500, 1000, 2000, 5000];

const KEYBOARD_VELOCITY = 1;

async function setupSpriteSheet(resource, spriteSheet) {
  const _sprite = Asset.fromModule(resource);
  await _sprite.downloadAsync();
  const texture = PIXI.Texture.from(resource);
  // const texture = PIXI.Texture.from(_sprite);

  let textures = {};
  for (const sprite of spriteSheet) {
    const { name, x, y, width, height } = sprite;
    textures[name] = new PIXI.Texture(
      texture.baseTexture,
      new PIXI.Rectangle(x, y, width, height),
    );
  }

  return textures;
}

class DoodleJump {
  position = 0;
  score = 0;
  jumpCount = 0;
  platforms = [];

  get width() {
    return this.app.renderer.width;
  }

  get height() {
    return this.app.renderer.height;
  }

  constructor(context, onScore) {
    this.app = new PIXI.Application({
      context,
      autoResize: false,
      width: context.drawingBufferWidth / 1,
      height: context.drawingBufferHeight / 1,
    });

    // this.app.stage.width = window.innerWidth * 3;
    // this.app.stage.height = window.innerHeight;
    this.platformInterval = this.app.renderer.height / Settings.platformCount;
    this.setup();
    this.onScore = onScore;
  }

  deallocate = () => {};

  screenScale = 1;

  // Resize function window
  resize = ({ width, height, scale }) => {
    // Get the p
    const parent = this.app.view.parentNode;
    // Resize the renderer
    this.app.renderer.resize(width * scale, height * scale);

    // Recalculate
    this.screenScale = width * 0.00266666667;
    // console.log('SCREEN SCALE ', this.screenScale);
    // this.app.stage.scale = new PIXI.Point(this.screenScale, this.screenScale);
    this.platformInterval = this.app.renderer.height / Settings.platformCount;

    this.recalculatePlatforms();
    // this.app.stage.updateTransform();
    // for (const child of this.app.stage.children) {
    //   child.scale = this.screenScale;
    //   child.updateTransform();
    // }

    if (RNPlatform.OS === 'web') {
      this.app.view.style.width = width;
      this.app.view.style.height = height;
    }
    if (this.background) {
      this.background.width = this.width;
      this.background.height = this.height;
    }
  };

  setup = async () => {
    await Asset.fromModule(SpriteSheetImage).downloadAsync();
    this.textures = await setupSpriteSheet(SpriteSheetImage, SpriteSheet);
    this.setupGame();
    this.app.ticker.add(this.update);
    this.resize(Dimensions.get('window'));
  };

  getLevel = score => {
    for (const index in levels) {
      if (score < levels[index]) {
        return index;
      }
    }
  };

  getPlatformForLevel = score => {
    const level = this.getLevel(score);
    const types = Platform.Levels[level];
    let type = types[Math.floor(Math.random() * types.length)];
    if (type === Platform.Types.breakable) {
      if (broken < 1) {
        broken += 1;
      } else if (broken >= 1) {
        type = Platform.Types.normal;
        broken = 0;
      }
    }

    const { textures } = this;
    const platform = new Platform({ type, textures });
    platform.x =
      platform.width / 2 + Math.random() * (this.width - platform.width);

    return platform;
  };

  onLeft = () => {
    this.updateControls(KEYBOARD_VELOCITY * -1);
  };

  onRight = () => {
    this.updateControls(KEYBOARD_VELOCITY);
  };

  onKeyUp = () => {
    this.updateControls(0);
  };

  setupGame = () => {
    this.setupBackground();
    this.setupPlayer();
    this.setupSpring();
    this.setupBrokenPlatform();
    this.setupPlatforms();
  };

  setupBackground = () => {
    const background = new PIXI.extras.TilingSprite(
      this.textures.grid,
      this.width,
      this.height,
    );
    background.tileScale.set(Settings.scale);
    this.app.stage.addChild(background);
    this.background = background;
  };

  setupPlayer = () => {
    this.player = new Player({ app: this.app, texture: this.textures.player });
    this.app.stage.addChild(this.player);
  };

  setupSpring = () => {
    this.spring = new Spring(
      this.textures.spring_closed,
      this.textures.spring_open,
    );
    this.app.stage.addChild(this.spring);
  };

  setupBrokenPlatform = () => {
    const { texture, tint } = Platform.Styles[Platform.Types.breakable];
    this.brokenPlatform = new BrokenPlatform(this.textures[texture], tint);
    this.app.stage.addChild(this.brokenPlatform);
  };

  setupPlatforms = () => {
    for (let i = 0; i < Settings.platformCount; i++) {
      const platform = this.getPlatformForLevel(this.score);
      if (i === Settings.platformCount - 1) {
        platform.centerX = this.width / 2;
      }
      platform.y = this.position;
      this.position += this.platformInterval;
      this.platforms.push(platform);
      this.app.stage.addChild(platform);
    }
  };

  recalculatePlatforms = () => {
    let lastPlatform;
    for (const platform of this.platforms) {
      // const platform = this.getPlatformForLevel(this.score);
      if (lastPlatform) {
        platform.y = lastPlatform.y + this.platformInterval;
      }
      lastPlatform = platform;
    }
    this.position =
      this.platforms[this.platforms.length - 1].y + this.platformInterval;
  };

  update = () => {
    this.updatePlatforms();

    this.updateSprings();

    this.updatePlayer();
    this.updateCollisions();

    this.onScore(this.score);
  };

  updateControls = x => {
    if (this.player) {
      this.player.velocity.x = x * 25;
    }
  };

  updatePlayer = () => {
    const { player, height } = this;

    if (player.y + player.height > height) {
      this.reset();
    }

    //Movement of player affected by gravity
    const middle = height / 2 - player.height / 2;
    if (player.y < middle) {
      const change = (player.y - middle) * 0.1;
      let delta = player.velocity.y < 0 ? player.velocity.y : 0;

      this.brokenPlatform.y -= change;

      // When the player reaches half height move everything to make it look like a camera is moving up
      for (let index in this.platforms) {
        const platform = this.platforms[index];
        platform.y -= delta;
        platform.y -= change;

        if (platform.y > height) {
          const nextPlatform = this.getPlatformForLevel(this.score);
          nextPlatform.y = platform.y - height;
          this.app.stage.addChild(nextPlatform);
          this.platforms[index] = nextPlatform;
          this.app.stage.removeChild(platform);
        }
      }

      player.y -= change;

      this.score++;
    }

    this.player.update();
  };

  updateCollisions = () => {
    if (this.player.velocity.y <= 0) {
      return;
    }
    this.checkPlatformCollision();
    this.checkSpringCollision();
  };

  updateSprings = () => {
    const { spring } = this;
    const platform = this.platforms[0];

    if (platform.canHaveSpring) {
      spring.visible = true;
      spring.x = platform.x + platform.width / 2 - spring.width / 2;
      spring.y = platform.y - spring.height;

      if (spring.y > this.height / 1.1) {
        spring.interacted = false;
      }
    } else {
      spring.visible = false;
    }
  };

  updatePlatforms = () => {
    const { brokenPlatform, platforms } = this;

    for (let platform of platforms) {
      platform.update();
      if (platform.type === Platform.Types.moving) {
        if (platform.left < 0 || platform.right > this.width) {
          platform.velocity.x *= -1;
        }
      }

      if (
        platform.interacted &&
        !brokenPlatform.visible &&
        this.jumpCount === 0
      ) {
        brokenPlatform.x = platform.x;
        brokenPlatform.y = platform.y;
        brokenPlatform.visible = true;
        platform.visible = false;
        this.jumpCount++;
      }
    }

    brokenPlatform.update();

    if (brokenPlatform.y > this.height) {
      brokenPlatform.visible = false;
    }
  };

  checkPlatformCollision = () => {
    const { player, platforms } = this;

    for (let platform of platforms) {
      if (
        !platform.interacted &&
        player.left + Settings.collisionBuffer < platform.right &&
        player.right - Settings.collisionBuffer > platform.left &&
        player.bottom > platform.top &&
        player.bottom < platform.bottom
      ) {
        if (platform.type === Platform.Types.breakable) {
          platform.interacted = true;
          this.jumpCount = 0;
          return;
        } else if (platform.type === Platform.Types.vanishable) {
          platform.interacted = true;
          platform.visible = false;
        }
        player.jump();
        return;
      }
    }
  };

  checkSpringCollision = () => {
    const { player, spring } = this;

    if (
      !spring.interacted &&
      player.left + Settings.collisionBuffer < spring.right &&
      player.right - Settings.collisionBuffer > spring.left &&
      player.bottom > spring.top &&
      player.bottom < spring.bottom
    ) {
      spring.interacted = true;
      player.jumpHigh();
    }
  };

  reset = () => {
    this.position = 0;
    this.score = 0;
    this.player.reset();

    this.resetPlatforms();
    this.setupPlatforms();
  };

  resetPlatforms = () => {
    for (const platform of this.platforms) {
      platform.reset();
      this.app.stage.removeChild(platform);
    }
    this.platforms = [];
  };
}

export default DoodleJump;
