import ExpoPixi, { PIXI } from 'expo-pixi'; // Version can be specified in package.json
import AssetUtils from 'expo-asset-utils'; // Version can be specified in package.json
import { Asset } from 'expo';

import SpriteSheet from './constants/SpriteSheet';

import Platform from './Platform';
import Player from './Player';
import Spring from './Spring';
import Base from './Base';
import Settings from './constants/Settings';
import Direction from './constants/Direction';
import PlatformBrokenSubstitute from './PlatformBrokenSubstitute';
import PlatformType from './constants/PlatformType';
import Assets from './Assets';

class DoodleJump {
  position = 0;
  flag = 0;
  broken = 0;
  score = 0;
  firstRun = true;

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
    this.platformCalc();

    this.springCalc();

    this.playerCalc();

    this.player && this.player.update(delta);

    this.updateScore();
  };

  onPress = () => {
    if (this.player.isDead) {
      this.reset();
    }
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
    this.player.vx = x * 10;
  };

  playerCalc = () => {
    const { player, base, height, width } = this;

    if (this.dir == Direction.left) {
      player.dir = Direction.left;
      if (player.vy < -7 && player.vy > -15) player.dir = Direction.leftLand;
    } else if (this.dir == Direction.right) {
      player.dir = Direction.right;
      if (player.vy < -7 && player.vy > -15) player.dir = Direction.rightLand;
    }

    //Accelerations produces when the user hold the keys
    if (player.isMovingLeft === true) {
      player.x += player.vx;
      player.vx -= 0.15;
    } else {
      player.x += player.vx;
      if (player.vx < 0) player.vx += 0.1;
    }

    if (player.isMovingRight === true) {
      player.x += player.vx;
      player.vx += 0.15;
    } else {
      player.x += player.vx;
      if (player.vx > 0) player.vx -= 0.1;
    }

    //Jump the player when it hits the base
    if (player.y + player.height > base.y && base.y < this.height)
      player.jump();

    //Gameover if it hits the bottom
    if (
      base.y > height &&
      player.y + player.height > height &&
      player.isDead != true
    )
      player.isDead = true;

    //Make the player move through walls
    if (player.x > width) player.x = 0 - player.width;
    else if (player.x < 0 - player.width) player.x = width;

    //Movement of player affected by gravity

    const middle = height / 2 - player.height / 2;
    if (player.y >= middle) {
      player.y += player.vy;
      player.vy += Settings.gravity;
    } else {
      const change = (player.y - middle) * 0.1;

      let delta = 0;
      if (player.vy < 0) {
        delta = player.vy;
      }

      this.platformBrokenSubstitute.y -= change;

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

      base.y -= player.vy;
      player.vy += Settings.gravity;

      player.y -= change;

      if (player.vy >= 0) {
        player.y += player.vy;
        player.vy += Settings.gravity;
      }

      this.score++;
    }

    //Make the player jump when it collides with platforms
    this.collides();

    if (this.player.isDead === true) {
      this.gameOver();
    }
  };

  springCalc = () => {
    const s = this.spring;
    const p = this.platforms[0];

    if (p.type === PlatformType.normal || p.type === PlatformType.moving) {
      s.x = p.x + p.width / 2 - s.width / 2;
      s.y = p.y - p.height - 10;

      if (s.y > this.height / 1.1) {
        s.state = 0;
      }
    } else {
      s.x = 0 - s.width;
      s.y = 0 - s.height;
    }
  };

  get width() {
    return this.app.renderer.width;
  }
  get height() {
    return this.app.renderer.height;
  }

  //Platform's horizontal movement (and falling) algo
  platformCalc = () => {
    var subs = this.platformBrokenSubstitute;

    this.platforms.forEach(p => {
      if (p.type === PlatformType.moving) {
        if (p.x < 0 || p.x + p.width > this.width) p.vx *= -1;

        p.x += p.vx;
      }

      if (p.flag == 1 && subs.visible === false && this.jumpCount === 0) {
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
    platforms.forEach(p => {
      if (
        player.vy > 0 &&
        p.state === 0 &&
        player.x + 15 < p.x + p.width &&
        player.x + player.width - 15 > p.x &&
        player.y + player.height > p.y &&
        player.y + player.height < p.y + p.height
      ) {
        if (p.type === PlatformType.breakable && p.flag === 0) {
          p.flag = 1;
          this.jumpCount = 0;
          return;
        } else if (p.type === PlatformType.vanishable && p.state === 0) {
          player.jump();
          p.state = 1;
          p.visible = false;
        } else if (p.flag == 1) {
          return;
        } else {
          player.jump();
        }
      }
    });

    //Springs
    if (
      player.vy > 0 &&
      spring.state === 0 &&
      player.x + 15 < spring.x + spring.width &&
      player.x + player.width - 15 > spring.x &&
      player.y + player.height > spring.y &&
      player.y + player.height < spring.y + spring.height
    ) {
      spring.state = 1;
      player.jumpHigh();
    }
  };

  updateScore = () => {
    // const scoreText = document.getElementById('score');
    // scoreText.innerHTML = score;
    this.onScore(this.score);
  };

  gameOver = () => {
    this.platforms.forEach(p => p.reset());

    if (this.player.y > this.height / 2 && this.flag === 0) {
      this.player.y -= 8;
      this.player.vy = 0;
    } else if (this.player.y < this.height / 2) {
      this.flag = 1;
    } else if (this.player.y + this.player.height > this.height) {
      this.showGoMenu();
      this.hideScore();
      this.player.isDead = true;
    }
    this.reset();
  };

  hideScore = () => {};
  showGoMenu = () => {};

  dir = Direction.left;
  jumpCount = 0;
  platforms = [];

  init = () => {
    this.firstRun = false;

    const { app, textures } = this;

    app.renderer.backgroundColor = 0xf5e9de;
    // const background = new PIXI.extras.TilingSprite(textures.background, this.width, this.height);
    // app.stage.addChild(background)

    this.base = new Base({ app, texture: textures.line });
    app.stage.addChild(this.base);
    this.player = new Player({ app, textures });
    app.stage.addChild(this.player);
    this.spring = new Spring({ textures });
    app.stage.addChild(this.spring);

    this.platformBrokenSubstitute = new PlatformBrokenSubstitute({ textures });
    app.stage.addChild(this.platformBrokenSubstitute);

    this.setupPlatforms();

    this.hideMenu();
    this.showScore();
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

  showScore = () => {};
  hideMenu = () => {};
  hideGoMenu = () => {};

  reset = () => {
    this.hideGoMenu();
    this.showScore();
    this.player.isDead = false;

    this.platforms.forEach(p => this.app.stage.removeChild(p));
    this.platforms = [];

    this.base.y = 0;
    this.flag = 0;
    this.position = 0;
    this.score = 0;
    this.player.reset();
    this.base.reset();

    this.setupPlatforms();
  };
}

export default DoodleJump;
