import ExpoPixi, { PIXI } from 'expo-pixi'; // Version can be specified in package.json
import AssetUtils from 'expo-asset-utils'; // Version can be specified in package.json
import { Asset } from 'expo';

import SpriteSheet from './constants/SpriteSheet';

import Platform from './Platform';
import Player from './Player';
import Spring from './Spring';
import Floor from './Floor';
import Settings from './constants/Settings';
import Direction from './constants/Direction';
import BrokenPlatform from './BrokenPlatform';
import PlatformType from './constants/PlatformType';
import Assets from './Assets';

class DoodleJump {
  position = 0;
  interacted = false;
  score = 0;
  dir = Direction.left;
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
    this.setup();
    this.onScore = onScore;
  }

  setup = async () => {
    await AssetUtils.cacheAssetsAsync({
      files: AssetUtils.arrayFromObject(Assets),
    });

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
    this.init();
    this.app.ticker.add(this.update);
  };

  update = delta => {
    this.updatePlatforms();

    this.updateSprings();

    this.updatePlayer();

    this.player.update(delta);

    this.onScore(this.score);
  };

  updateControls = x => {
    const { player } = this;
    if (!player) {
      return;
    }

    if (x < 0) {
      this.dir = Direction.left;
    } else {
      this.dir = Direction.right;
    }
    this.player.velocity.x = x * 10;
  };

  updatePlayer = () => {
    const { player, floor, height, width } = this;

    if (this.dir == Direction.left) {
      player.dir = Direction.left;
      if (player.velocity.y < -7 && player.velocity.y > -15) {
        player.dir = Direction.leftLand;
      }
    } else if (this.dir == Direction.right) {
      player.dir = Direction.right;
      if (player.velocity.y < -7 && player.velocity.y > -15) {
        player.dir = Direction.rightLand;
      }
    }

    //Accelerations produces when the user hold the keys
    if (player.isMovingLeft === true) {
      player.x += player.velocity.x;
      player.velocity.x -= 0.15;
    } else {
      player.x += player.velocity.x;
      if (player.velocity.x < 0) {
        player.velocity.x += 0.1;
      }
    }

    if (player.isMovingRight === true) {
      player.x += player.velocity.x;
      player.velocity.x += 0.15;
    } else {
      player.x += player.velocity.x;
      if (player.velocity.x > 0) {
        player.velocity.x -= 0.1;
      }
    }

    //Jump the player when it hits the floor
    if (player.bottom > floor.y && floor.y < this.height) {
      player.jump();
    }
    //Gameover if it hits the bottom
    if (
      floor.y > height &&
      player.y + player.height > height &&
      player.isDead != true
    ) {
      player.isDead = true;
    }
    //Make the player move through walls
    if (player.x > width) {
      player.x = 0 - player.width;
    } else if (player.x < 0 - player.width) {
      player.x = width;
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

      //When the player reaches half height, move the platforms to create the illusion of scrolling and recreate the platforms that are out of viewport...
      this.platforms.forEach((p, i) => {
        p.y -= delta;
        p.y -= change;

        if (p.y > height) {
          let platform = new Platform({
            app: this.app,
            textures: this.textures,
            score: this.score,
          });
          this.app.stage.addChild(platform);
          this.platforms[i] = platform;
          this.platforms[i].y = p.y - height;
        }
      });

      floor.y -= player.velocity.y;
      player.velocity.y += Settings.gravity;

      player.y -= change;

      if (player.velocity.y >= 0) {
        player.y += player.velocity.y;
        player.velocity.y += Settings.gravity;
      }

      this.score++;
    }

    //Make the player jump when it collides with platforms
    this.collides();

    if (this.player.isDead === true) {
      this.gameOver();
    }
  };

  updateSprings = () => {
    const s = this.spring;
    const p = this.platforms[0];

    if (p.type === PlatformType.normal || p.type === PlatformType.moving) {
      s.x = p.x + p.width / 2 - s.width / 2;
      s.y = p.y - p.height - 10;

      if (s.y > this.height / 1.1) {
        s.interacted = false;
      }
    } else {
      s.x = 0 - s.width;
      s.y = 0 - s.height;
    }
  };

  updatePlatforms = () => {
    let subs = this.brokenPlatform;

    this.platforms.forEach(p => {
      if (p.type === PlatformType.moving) {
        if (p.left < 0 || p.right > this.width) {
          p.velocity.x *= -1;
        }

        p.x += p.velocity.x;
      }

      if (
        p.interacted === true &&
        subs.visible === false &&
        this.jumpCount === 0
      ) {
        subs.x = p.x;
        subs.y = p.y;
        subs.visible = true;
        p.visible = false;
        this.jumpCount++;
      }
    });

    if (subs.visible === true) {
      subs.update();
      subs.y += 8;
    }

    if (subs.y > this.height) {
      subs.visible = false;
    }
  };

  collides = () => {
    const { player, spring, platforms } = this;
    //Platforms
    platforms.forEach(platform => {
      if (
        player.velocity.y > 0 &&
        platform.interacted === false &&
        player.left + 15 < platform.right &&
        player.right - 15 > platform.left &&
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

    //Springs
    if (
      player.velocity.y > 0 &&
      spring.interacted === false &&
      player.left + 15 < spring.right &&
      player.right - 15 > spring.left &&
      player.bottom > spring.top &&
      player.bottom < spring.bottom
    ) {
      spring.interacted = true;
      player.jumpHigh();
    }
  };

  gameOver = () => {
    this.platforms.forEach(p => p.reset());

    if (this.player.top > this.height / 2 && this.interacted === false) {
      this.player.y -= 8;
      this.player.velocity.y = 0;
    } else if (this.player.top < this.height / 2) {
      this.interacted = true;
    } else if (this.player.bottom > this.height) {
      this.player.isDead = true;
    }
    this.reset();
  };

  init = () => {
    const { app, textures } = this;

    app.renderer.backgroundColor = 0xf5e9de;
    // const background = new PIXI.extras.TilingSprite(textures.background, this.width, this.height);
    // app.stage.addChild(background)

    this.floor = new Floor({ app, texture: textures.line });
    app.stage.addChild(this.floor);
    this.player = new Player({ app, textures });
    app.stage.addChild(this.player);
    this.spring = new Spring({ textures });
    app.stage.addChild(this.spring);

    this.brokenPlatform = new BrokenPlatform({ textures });
    app.stage.addChild(this.brokenPlatform);

    this.setupPlatforms();
  };

  setupPlatforms = () => {
    const { app, textures } = this;
    for (let i = 0; i < Settings.platformCount; i++) {
      const platform = new Platform({ app, textures });
      platform.y = this.position;
      this.position += app.renderer.height / Settings.platformCount;
      this.platforms.push(platform);
      app.stage.addChild(platform);
    }
  };

  reset = () => {
    this.player.isDead = false;

    this.platforms.forEach(p => this.app.stage.removeChild(p));
    this.platforms = [];

    this.floor.y = 0;
    this.interacted = false;
    this.position = 0;
    this.score = 0;
    this.player.reset();
    this.floor.reset();

    this.setupPlatforms();
  };
}

export default DoodleJump;
