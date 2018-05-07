import ExpoPixi, { PIXI } from 'expo-pixi'; // Version can be specified in package.json
import AssetUtils from 'expo-asset-utils'; // Version can be specified in package.json
import { Asset } from 'expo';

import SpriteSheet from './constants/SpriteSheet';

import Platform from './Platform';
import Player from './Player';
import Spring from './Spring';
import Settings from './constants/Settings';
import Direction from './constants/Direction';
import BrokenPlatform from './BrokenPlatform';
import PlatformType from './constants/PlatformType';
import Assets from './Assets';

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
    this.spring = new Spring(textures['spring_00'], textures['spring_01']);
    app.stage.addChild(this.spring);
    this.brokenPlatform = new BrokenPlatform(textures.block_broken);
    app.stage.addChild(this.brokenPlatform);

    this.setupPlatforms();
  };

  setupPlatforms = () => {
    const { app, textures, score } = this;
    for (let i = 0; i < Settings.platformCount; i++) {
      const platform = new Platform({ app, textures, score });
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
    if (player.y >= middle) {
      player.y += player.velocity.y;
      player.velocity.y += Settings.gravity;
    } else {
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
          const platform = new Platform({
            app,
            textures,
            score,
          });
          this.app.stage.addChild(platform);
          this.platforms[i] = platform;
          this.platforms[i].y = p.y - height;
        }
      });

      player.velocity.y += Settings.gravity;

      player.y -= change;

      if (player.velocity.y >= 0) {
        player.y += player.velocity.y;
        player.velocity.y += Settings.gravity;
      }

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
      if (platform.type === PlatformType.moving) {
        if (platform.left < 0 || platform.right > this.width) {
          platform.velocity.x *= -1;
        }

        platform.x += platform.velocity.x;
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
