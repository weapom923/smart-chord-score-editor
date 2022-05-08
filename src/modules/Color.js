class Color {
  constructor(red, green, blue, alpha = 1) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.red = this.red;
    rawObj.green = this.green;
    rawObj.blue = this.blue;
    rawObj.alpha = this.alpha;
    return rawObj;
  }

  isEqualTo(that) {
    if (this.red !== that.red) return false;
    if (this.green !== that.green) return false;
    if (this.blue !== that.blue) return false;
    if (this.alpha !== that.alpha) return false;
    return true;
  }

  clone() {
    return new Color(this.red, this.green, this.blue, this.alpha);
  }

  static loadFromRawObj(rawObj) {
    return new Color(rawObj.red, rawObj.green, rawObj.blue, rawObj.alpha);
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