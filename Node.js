import { PIXI } from 'expo-pixi';

class Node extends PIXI.Sprite {
  constructor(texture) {
    super();
    this.texture = texture;
  }
  
  update() {}
}

export default Node;
