import { Asset } from 'expo';
import AssetUtils from 'expo-asset-utils';
import ExpoPixi, { PIXI } from 'expo-pixi';

import Assets from '../Assets';
import PlatformLevels from '../constants/PlatformLevels';
import PlatformStyle from '../constants/PlatformStyle';
import PlatformType from '../constants/PlatformType';
import Settings from '../constants/Settings';
import SpriteSheet from '../constants/SpriteSheet';
import BrokenPlatform from './BrokenPlatform';
import Platform from './Platform';
import Player from './Player';
import Spring from './Spring';

let broken = 0;
const collisionBuffer = 15;
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
    this.app = ExpoPixi.application({ context });
    this.platformInterval = this.app.renderer.height / Settings.platformCount;
    this.setup();
    this.onScore = onScore;
  }

  setup = async () => {
    await AssetUtils.cacheAssetsAsync({
      files: AssetUtils.arrayFromObject(Assets),
    });
    this.setupTextures();
    this.setupGame();
    this.app.ticker.add(this.update);
  };

  setupTextures = () => {
    const _sprite = Asset.fromModule(Assets.sprite);
    let texture = ExpoPixi.texture(_sprite);

    let textures = {};
    SpriteSheet.forEach(({ name, x, y, width, height }) => {
      textures[name] = new PIXI.Texture(
        texture.baseTexture,
        new PIXI.Rectangle(x, y, width, height),
      );
    });

    this.textures = textures;
  };

  getLevel = score => {
    if (score >= 5000) {
      return 5;
    } else if (score >= 2000 && score < 5000) {
      return 4;
    } else if (score >= 1000 && score < 2000) {
      return 3;
    } else if (score >= 500 && score < 1000) {
      return 2;
    } else if (score >= 100 && score < 500) {
      return 1;
    } else {
      return 0;
    }
  };

  getPlatformForLevel = score => {
    const level = this.getLevel(score);
    const types = PlatformLevels[level].platforms;
    let type = types[Math.floor(Math.random() * types.length)];
    if (type === PlatformType.breakable) {
      if (broken < 1) {
        broken += 1;
      } else if (broken >= 1) {
        type = PlatformType.normal;
        broken = 0;
      }
    }

    const { textures } = this;
    const platform = new Platform({ type, textures });
    platform.x =
      platform.width / 2 + Math.random() * (this.width - platform.width);

    return platform;
  };

  setupGame = () => {
    const { app, textures } = this;

    const background = new PIXI.extras.TilingSprite(
      textures.grid,
      this.width,
      this.height,
    );
    background.tileScale.set(Settings.scale);
    app.stage.addChild(background);

    this.player = new Player({ app, texture: textures.player });
    app.stage.addChild(this.player);
    this.spring = new Spring(textures.spring_closed, textures.spring_open);
    app.stage.addChild(this.spring);

    const config = PlatformStyle[PlatformType.breakable];
    this.brokenPlatform = new BrokenPlatform(
      textures[config.texture],
      config.tint,
    );
    app.stage.addChild(this.brokenPlatform);

    this.setupPlatforms();
  };

  setupPlatforms = () => {
    const { app, textures, score } = this;
    for (let i = 0; i < Settings.platformCount; i++) {
      const platform = this.getPlatformForLevel(score);
      platform.y = this.position;
      this.position += this.platformInterval;
      this.platforms.push(platform);
      app.stage.addChild(platform);
    }
  };

  update = () => {
    this.updatePlatforms();

    this.updateSprings();

    this.updatePlayer();

    this.onScore(this.score);
  };

  updateControls = x => {
    if (this.player) {
      this.player.velocity.x = x * 25;
    }
  };

  updatePlayer = () => {
    const { app, player, height, width, score, textures } = this;

    if (player.y + player.height > height) {
      this.reset();
    }

    //Movement of player affected by gravity
    const middle = height / 2 - player.height / 2;
    if (player.y < middle) {
      const change = (player.y - middle) * 0.1;

      let delta = 0;
      if (player.velocity.y < 0) {
        delta = player.velocity.y;
      }

      this.brokenPlatform.y -= change;

      // When the player reaches half height move everything to make it look like a camera is moving up
      this.platforms.forEach((p, i) => {
        p.y -= delta;
        p.y -= change;

        if (p.y > height) {
          const platform = this.getPlatformForLevel(score);
          platform.y = p.y - height;
          this.app.stage.addChild(platform);
          this.platforms[i] = platform;
        }
      });

      player.y -= change;

      this.score++;
    }

    this.checkPlatformCollision();
    this.checkSpringCollision();

    this.player.update();
  };

  updateSprings = () => {
    const { spring } = this;
    const platform = this.platforms[0];

    if (platform.canHaveSpring) {
      spring.visible = true;
      spring.x = platform.x + platform.width / 2 - spring.width / 2;
      spring.y = platform.y - platform.height - 10;

      if (spring.y > this.height / 1.1) {
        spring.interacted = false;
      }
    } else {
      spring.visible = false;
    }
  };

  updatePlatforms = () => {
    const { brokenPlatform, platforms } = this;

    platforms.forEach(platform => {
      platform.update();
      if (platform.type === PlatformType.moving) {
        if (platform.left < 0 || platform.right > this.width) {
          platform.velocity.x *= -1;
        }
      }

      if (
        platform.interacted === true &&
        brokenPlatform.visible === false &&
        this.jumpCount === 0
      ) {
        brokenPlatform.x = platform.x;
        brokenPlatform.y = platform.y;
        brokenPlatform.visible = true;
        platform.visible = false;
        this.jumpCount++;
      }
    });

    brokenPlatform.update();

    if (brokenPlatform.y > this.height) {
      brokenPlatform.visible = false;
    }
  };

  checkPlatformCollision = () => {
    const { player, platforms } = this;
    //Platforms
    platforms.forEach(platform => {
      if (
        player.velocity.y > 0 &&
        platform.interacted === false &&
        player.left + collisionBuffer < platform.right &&
        player.right - collisionBuffer > platform.left &&
        player.bottom > platform.top &&
        player.bottom < platform.bottom
      ) {
        if (
          platform.type === PlatformType.breakable &&
          platform.interacted === false
        ) {
          platform.interacted = true;
          this.jumpCount = 0;
          return;
        } else if (
          platform.type === PlatformType.vanishable &&
          platform.interacted === false
        ) {
          player.jump();
          platform.interacted = true;
          platform.visible = false;
        } else if (platform.interacted === true) {
          return;
        } else {
          player.jump();
        }
      }
    });
  };

  checkSpringCollision = () => {
    const { player, spring } = this;
    //Springs
    if (
      player.velocity.y > 0 &&
      spring.interacted === false &&
      player.left + collisionBuffer < spring.right &&
      player.right - collisionBuffer > spring.left &&
      player.bottom > spring.top &&
      player.bottom < spring.bottom
    ) {
      spring.interacted = true;
      player.jumpHigh();
    }
  };

  reset = () => {
    this.platforms.forEach(platform => {
      platform.reset();
      this.app.stage.removeChild(platform);
    });
    this.platforms = [];
    this.position = 0;
    this.score = 0;
    this.player.reset();

    this.setupPlatforms();
  };
}

export default DoodleJump;
