class Clef {
  constructor(name) {
    this.name = name;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.name = this.name;
    return rawObj;
  }

  isEqualTo(that) {
    return this.name === that.name;
  }

  clone() {
    switch (this) {
      case Clef.treble:
        return Clef.treble;
      case Clef.bass:
        return Clef.bass;
      default:
        return new Clef(this.name);
    }
  }

  static loadFromRawObj(rawObj) {
    switch (rawObj.name) {
      case Clef.treble.getRawObj().name:
        return Clef.treble;
      case Clef.bass.getRawObj().name:
        return Clef.bass;
      default:
        return new Clef(rawObj.name);
    }
  }
}

Object.defineProperty(Clef, 'treble', { value: new Clef('treble'), writable: false });
Object.defineProperty(Clef, 'bass',   { value: new Clef('bass'),   writable: false });

export default Clef;