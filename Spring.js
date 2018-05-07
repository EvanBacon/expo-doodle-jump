import Node from './Node';
import Settings from './constants/Settings';

class Spring extends Node {
  constructor({ textures }) {
    super(textures['spring_00']);
    this.textures = textures;
    this.width = 26 * Settings.scale;
    this.height = 30 * Settings.scale;
  }

  get interacted() {
    return this._interacted;
  }
  set interacted(value) {
    if (this._interacted === value) {
      return;
    }
    this._interacted = value;
    this.texture = this.textures[`spring_0${value ? 1 : 0}`];
  }
}

export default Spring;
