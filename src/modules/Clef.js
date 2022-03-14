class Clef {
  constructor(name) {
    this.name = name;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.name = this.name;
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    return new Clef(
      rawObj.name,
    );
  }
}

Object.defineProperty(
  Clef,
  'Type',
  {
    value: {
      treble: new Clef('treble'),
      bass: new Clef('bass'),
    },
    writable: false,
  }
);

export default Clef;