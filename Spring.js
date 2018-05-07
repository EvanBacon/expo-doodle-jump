import Node from './Node';
import Settings from './constants/Settings';

class Spring extends Node {
  constructor(closed, open) {
    super(closed);
    this.closed = closed;
    this.open = open;
  }

  get interacted() {
    return this._interacted;
  }
  set interacted(value) {
    if (this._interacted === value) {
      return;
    }
    this._interacted = value;
    this.texture = value ? this.open : this.closed;
  }
}

export default Spring;
