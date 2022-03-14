class TensionNotePitch {
  constructor(symbol, flat, sharp) {
    this.symbol = symbol;
    this.isFlat = flat;
    this.isSharp = sharp;
    this.isNatural = !flat && !sharp;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.symbol = this.symbol;
    rawObj.is_flat = this.isFlat;
    rawObj.is_sharp = this.isSharp;
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    return new TensionNotePitch(
      rawObj.symbol,
      rawObj.is_flat,
      rawObj.is_sharp,
    );
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
