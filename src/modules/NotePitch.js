import NotePitchSymbol from './NotePitchSymbol.js'

const numPitchesInOctave = 12;

class NotePitch {
  constructor(noteNumber, symbol) {
    let cyclicNoteNumberBySymbol = symbol.cyclicNoteNumber();
    let octaveOffset = Math.floor(noteNumber / numPitchesInOctave);
    let cyclicNoteNumber = noteNumber % numPitchesInOctave;
    let sharpShiftAmount = cyclicNoteNumber - cyclicNoteNumberBySymbol;
    let flatShiftAmount = cyclicNoteNumberBySymbol - cyclicNoteNumber;
    if (sharpShiftAmount < 0) sharpShiftAmount += numPitchesInOctave;
    if (flatShiftAmount < 0) flatShiftAmount += numPitchesInOctave;
    let isShiftDirectionSharp = (sharpShiftAmount <= 2);
    let isShiftDirectionFlat = (flatShiftAmount <= 2);
    if (!isShiftDirectionSharp && !isShiftDirectionFlat) {
      throw 'too many sharps or flats.';
    }
    this.baseNoteNumber = octaveOffset * numPitchesInOctave + cyclicNoteNumberBySymbol;
    this.symbol = symbol;
    if (isShiftDirectionSharp) {
      this.shift = sharpShiftAmount;
    } else if (isShiftDirectionFlat) {
      this.shift = -flatShiftAmount;
    }
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.note_number = this.noteNumber;
    rawObj.symbol = this.symbol.getRawObj();
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    let notePitch = new NotePitch(
      rawObj.note_number,
      NotePitchSymbol.loadFromRawObj(rawObj.symbol),
    );
    let predefinedNotePitch = NotePitch.findPredefinedNotePitch(notePitch.symbol, notePitch.shift);
    return (predefinedNotePitch === null)? notePitch : predefinedNotePitch;
  }

  get noteNumber() {
    return this.baseNoteNumber + this.shift;
  }

  get cyclicNoteNumber() {
    return this.noteNumber % numPitchesInOctave;
  }

  get isDoubleFlat() {
    return (this.shift === -2);
  }

  get isFlat() {
    return (this.shift === -1);
  }

  get isNatural() {
    return (this.shift === 0);
  }

  get isSharp() {
    return (this.shift === 1);
  }

  get isDoubleSharp() {
    return (this.shift === 2);
  }

  toString() {
    let notePitchString = this.symbol.toString();
    if (this.isFlat) notePitchString += '♭';
    if (this.isSharp) notePitchString += '♯';
    return notePitchString;
  }

  static findPredefinedNotePitch(symbol, shift) {
    switch (symbol) {
      case NotePitchSymbol.a:
        switch (shift) {
          case -1: return NotePitch.aFlat;
          case 0:  return NotePitch.a;
          case 1:  return NotePitch.aSharp;
        }
        break;
      case NotePitchSymbol.b:
        switch (shift) {
          case -1: return NotePitch.bFlat;
          case 0:  return NotePitch.b;
          case 1:  return NotePitch.bSharp;
        }
        break;
      case NotePitchSymbol.c:
        switch (shift) {
          case -1: return NotePitch.cFlat;
          case 0:  return NotePitch.c;
          case 1:  return NotePitch.cSharp;
        }
        break;
      case NotePitchSymbol.d:
        switch (shift) {
          case -1: return NotePitch.dFlat;
          case 0:  return NotePitch.d;
          case 1:  return NotePitch.dSharp;
        }
        break;
      case NotePitchSymbol.e:
        switch (shift) {
          case -1: return NotePitch.eFlat;
          case 0:  return NotePitch.e;
          case 1:  return NotePitch.eSharp;
        }
        break;
      case NotePitchSymbol.f:
        switch (shift) {
          case -1: return NotePitch.fFlat;
          case 0:  return NotePitch.f;
          case 1:  return NotePitch.fSharp;
        }
        break;
      case NotePitchSymbol.g:
        switch (shift) {
          case -1: return NotePitch.gFlat;
          case 0:  return NotePitch.g;
          case 1:  return NotePitch.gSharp;
        }
        break;
    }
    return null;
  }
}

Object.defineProperty(
  NotePitch,
  'Symbol',
  {
    value: {
      a: new NotePitchSymbol('A'),
      b: new NotePitchSymbol('B'),
      c: new NotePitchSymbol('C'),
      d: new NotePitchSymbol('D'),
      e: new NotePitchSymbol('E'),
      f: new NotePitchSymbol('F'),
      g: new NotePitchSymbol('G'),
    },
    writable: false,
  },
);

Object.defineProperty(NotePitch, 'a',      { value: new NotePitch(9,  NotePitchSymbol.a), writable: false });
Object.defineProperty(NotePitch, 'aFlat',  { value: new NotePitch(8,  NotePitchSymbol.a), writable: false });
Object.defineProperty(NotePitch, 'aSharp', { value: new NotePitch(10, NotePitchSymbol.a), writable: false });
Object.defineProperty(NotePitch, 'b',      { value: new NotePitch(11, NotePitchSymbol.b), writable: false });
Object.defineProperty(NotePitch, 'bFlat',  { value: new NotePitch(10, NotePitchSymbol.b), writable: false });
Object.defineProperty(NotePitch, 'bSharp', { value: new NotePitch(0,  NotePitchSymbol.b), writable: false });
Object.defineProperty(NotePitch, 'c',      { value: new NotePitch(0,  NotePitchSymbol.c), writable: false });
Object.defineProperty(NotePitch, 'cFlat',  { value: new NotePitch(11, NotePitchSymbol.c), writable: false });
Object.defineProperty(NotePitch, 'cSharp', { value: new NotePitch(1,  NotePitchSymbol.c), writable: false });
Object.defineProperty(NotePitch, 'd',      { value: new NotePitch(2,  NotePitchSymbol.d), writable: false });
Object.defineProperty(NotePitch, 'dFlat',  { value: new NotePitch(1,  NotePitchSymbol.d), writable: false });
Object.defineProperty(NotePitch, 'dSharp', { value: new NotePitch(3,  NotePitchSymbol.d), writable: false });
Object.defineProperty(NotePitch, 'e',      { value: new NotePitch(4,  NotePitchSymbol.e), writable: false });
Object.defineProperty(NotePitch, 'eFlat',  { value: new NotePitch(3,  NotePitchSymbol.e), writable: false });
Object.defineProperty(NotePitch, 'eSharp', { value: new NotePitch(5,  NotePitchSymbol.e), writable: false });
Object.defineProperty(NotePitch, 'f',      { value: new NotePitch(5,  NotePitchSymbol.f), writable: false });
Object.defineProperty(NotePitch, 'fFlat',  { value: new NotePitch(4,  NotePitchSymbol.f), writable: false });
Object.defineProperty(NotePitch, 'fSharp', { value: new NotePitch(6,  NotePitchSymbol.f), writable: false });
Object.defineProperty(NotePitch, 'g',      { value: new NotePitch(7,  NotePitchSymbol.g), writable: false });
Object.defineProperty(NotePitch, 'gFlat',  { value: new NotePitch(6,  NotePitchSymbol.g), writable: false });
Object.defineProperty(NotePitch, 'gSharp', { value: new NotePitch(8,  NotePitchSymbol.g), writable: false });

export default NotePitch;
