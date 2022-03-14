class Color {
  constructor(red, green, blue, alpha = 1) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  getRGBA() {
    return [ this.red, this.green, this.blue, this.alpha ];
  }

  getStyleString() {
    return 'rgba(' + this.getRGBA().map(String).join(', ') + ')';
  }
}

Object.defineProperty(Color, 'transparent', { value: new Color(255, 255, 255, 0), writable: false });
Object.defineProperty(Color, 'black', { value: new Color(0, 0, 0, 1), writable: false });
Object.defineProperty(Color, 'red', { value: new Color(255, 0, 0, 1), writable: false });

export default Color;