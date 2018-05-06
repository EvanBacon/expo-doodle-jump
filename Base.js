import Node from './Node';

class Base extends Node {
  moved = 0;

  constructor({ app, texture }) {
    super(texture);
    this.height = 5;
    this.width = app.renderer.width;
    this.app = app;
    this.reset()
  }
  
  reset = () => {
    this.x = 0;
    this.y = this.app.renderer.height - this.height;
  }
}
export default Base;
