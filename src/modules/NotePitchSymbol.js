class NotePitchSymbol {
  constructor(name) {
    this.name = name;
  }

  cyclicNoteNumber() {
    switch (this.name) {
      case NotePitchSymbol.c.name:
        return 0;
      case NotePitchSymbol.d.name:
        return 2;
      case NotePitchSymbol.e.name:
        return 4;
      case NotePitchSymbol.f.name:
        return 5;
      case NotePitchSymbol.g.name:
        return 7;
      case NotePitchSymbol.a.name:
        return 9;
      case NotePitchSymbol.b.name:
        return 11;
    }
    return null;
  }

  toString() {
    return this.name;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.name = this.name;
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    switch (rawObj.name) {
      case NotePitchSymbol.c.name:
        return NotePitchSymbol.c;
      case NotePitchSymbol.d.name:
        return NotePitchSymbol.d;
      case NotePitchSymbol.e.name:
        return NotePitchSymbol.e;
      case NotePitchSymbol.f.name:
        return NotePitchSymbol.f;
      case NotePitchSymbol.g.name:
        return NotePitchSymbol.g;
      case NotePitchSymbol.a.name:
        return NotePitchSymbol.a;
      case NotePitchSymbol.b.name:
        return NotePitchSymbol.b;
    }
    return null;
  }
}

Object.defineProperty(NotePitchSymbol, 'a', { value: new NotePitchSymbol('A'), writable: false });
Object.defineProperty(NotePitchSymbol, 'b', { value: new NotePitchSymbol('B'), writable: false });
Object.defineProperty(NotePitchSymbol, 'c', { value: new NotePitchSymbol('C'), writable: false });
Object.defineProperty(NotePitchSymbol, 'd', { value: new NotePitchSymbol('D'), writable: false });
Object.defineProperty(NotePitchSymbol, 'e', { value: new NotePitchSymbol('E'), writable: false });
Object.defineProperty(NotePitchSymbol, 'f', { value: new NotePitchSymbol('F'), writable: false });
Object.defineProperty(NotePitchSymbol, 'g', { value: new NotePitchSymbol('G'), writable: false });

export default NotePitchSymbol;
