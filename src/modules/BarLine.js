class BarLine {
  constructor(type) {
    this.type = type;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.type = this.type;
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    switch (rawObj.type) {
      case BarLine.Start.empty.getRawObj().type:
        return BarLine.Start.empty;
      case BarLine.Start.repeatStart.getRawObj().type:
        return BarLine.Start.repeatStart;
      case BarLine.End.single.getRawObj().type:
        return BarLine.End.single;
      case BarLine.End.double.getRawObj().type:
        return BarLine.End.double;
      case BarLine.End.repeatEnd.getRawObj().type:
        return BarLine.End.repeatEnd;
      default:
        return null;
    }
  }
}

Object.defineProperty(
  BarLine,
  'Start',
  {
    value: {
      empty: new BarLine('empty'),
      repeatStart: new BarLine('repeatStart'),
    },
    writable: false,
  },
);

Object.defineProperty(
  BarLine,
  'End',
  {
    value: {
      single: new BarLine('single'),
      double: new BarLine('double'),
      repeatEnd: new BarLine('repeatEnd'),
    },
    writable: false,
  }
);

export default BarLine;
