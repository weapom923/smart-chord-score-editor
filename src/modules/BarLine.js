class BarLine {
  constructor(type) {
    this.type = type;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.type = this.type;
    return rawObj;
  }

  isEqualTo(that) {
    return this.type === that.type;
  }

  clone() {
    switch (this) {
      case BarLine.Start.empty:
        return BarLine.Start.empty;
      case BarLine.Start.repeatStart:
        return BarLine.Start.repeatStart;
      case BarLine.End.single:
        return BarLine.End.single;
      case BarLine.End.double:
        return BarLine.End.double;
      case BarLine.End.repeatEnd:
        return BarLine.End.repeatEnd;
      case BarLine.End.greatDouble:
        return BarLine.End.greatDouble;
      default:
        return new BarLine(String(this.type));
    }
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
      case BarLine.End.greatDouble.getRawObj().type:
        return BarLine.End.greatDouble;
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
      greatDouble: new BarLine('greatDouble'),
    },
    writable: false,
  }
);

export default BarLine;
