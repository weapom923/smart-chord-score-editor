class BarBreak {
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
      case BarBreak.empty:
        return BarBreak.empty;
      case BarBreak.system:
        return BarBreak.system;
      case BarBreak.page:
        return BarBreak.page;
      default:
        return new BarBreak(String(this.type));
    }
  }

  static loadFromRawObj(rawObj) {
    switch (rawObj.type) {
      case BarBreak.empty.getRawObj().type:
        return BarBreak.empty;
      case BarBreak.system.getRawObj().type:
        return BarBreak.system;
      case BarBreak.page.getRawObj().type:
        return BarBreak.page;
      default:
        return null;
    }
  }
}

Object.defineProperty(BarBreak, 'empty',  { value: new BarBreak('empty'),  writable: false });
Object.defineProperty(BarBreak, 'system', { value: new BarBreak('system'), writable: false });
Object.defineProperty(BarBreak, 'page',   { value: new BarBreak('page'),   writable: false });

export default BarBreak;

