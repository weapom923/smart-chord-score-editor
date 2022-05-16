class TensionNotePitch {
  constructor(symbol, flat, sharp) {
    this.symbol = symbol;
    this.isFlat = flat;
    this.isSharp = sharp;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.symbol = this.symbol;
    rawObj.is_flat = this.isFlat;
    rawObj.is_sharp = this.isSharp;
    return rawObj;
  }

  isEqualTo(that) {
    if (this.symbol !== that.symbol) return false;
    if (this.isFlat !== that.isFlat) return false;
    if (this.isSharp !== that.isSharp) return false;
    return true;
  }

  clone() {
    return new TensionNotePitch(
      this.symbol,
      this.isFlat,
      this.isSharp,
    );
  }

  static loadFromRawObj(rawObj) {
    return new TensionNotePitch(
      rawObj.symbol,
      rawObj.is_flat,
      rawObj.is_sharp,
    );
  }

  get isNatural() {
    if (Object.keys(this).includes('_isNatural')) return this._isNatural;
    this._isNatural = !this.isFlat && !this.isSharp;
    return this._isNatural;
  }

  get symbolText() {
    switch (this.symbol) {
      case TensionNotePitch.Symbol.ninth:      return '9';
      case TensionNotePitch.Symbol.eleventh:   return '11';
      case TensionNotePitch.Symbol.thirteenth: return '13';
      default:                                 return null;
    }
  }

  get flatOrSharpText() {
    if (this.isSharp) return '♯';
    if (this.isFlat) return '♭';
    return null;
  }

  toString() {
    let string = '';
    if (this.flatOrSharpText) string += this.flatOrSharpText;
    if (this.symbolText) string += this.symbolText;
    return string;
  }
}

Object.defineProperty(
  TensionNotePitch,
  'Symbol',
  {
    value: {
      ninth: 'ninth',
      eleventh: 'eleventh',
      thirteenth: 'thirteenth',
    },
    writable: false,
  },
);


Object.defineProperty(TensionNotePitch, 'ninth',          { value: new TensionNotePitch(TensionNotePitch.Symbol.ninth,      false, false), writable: false });
Object.defineProperty(TensionNotePitch, 'flatNinth',      { value: new TensionNotePitch(TensionNotePitch.Symbol.ninth,      true,  false), writable: false });
Object.defineProperty(TensionNotePitch, 'sharpNinth',     { value: new TensionNotePitch(TensionNotePitch.Symbol.ninth,      false, true),  writable: false });
Object.defineProperty(TensionNotePitch, 'eleventh',       { value: new TensionNotePitch(TensionNotePitch.Symbol.eleventh,   false, false), writable: false });
Object.defineProperty(TensionNotePitch, 'sharpEleventh',  { value: new TensionNotePitch(TensionNotePitch.Symbol.eleventh,   false, true),  writable: false });
Object.defineProperty(TensionNotePitch, 'thirteenth',     { value: new TensionNotePitch(TensionNotePitch.Symbol.thirteenth, false, false), writable: false });
Object.defineProperty(TensionNotePitch, 'flatThirteenth', { value: new TensionNotePitch(TensionNotePitch.Symbol.thirteenth, true,  false), writable: false });

export default TensionNotePitch;
