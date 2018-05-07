import Node from './Node';

class Floor extends Node {
  constructor({ app, texture }) {
    super(texture);
    this.height = 5;
    this.width = app.renderer.width;
    this.app = app;
    this.reset();
  }

  reset = () => {
    this.x = 0;
    this.y = this.app.renderer.height - this.height;
  };
}
export default Floor;
