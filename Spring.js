import Node from './Node';
import Settings from './constants/Settings';
class Spring extends Node {
  constructor({ textures }) {
    super(textures['spring_00']);
    this.textures = textures;
    this.width = 26 * Settings.scale;
    this.height = 30 * Settings.scale;
  }

  get state() {
    return this._state;
  }
  set state(value) {
    if (this._state === value) {
      return;
    }
    this._state = value;
    this.texture = this.textures[`spring_0${value}`];
  }
}

export default Spring;
