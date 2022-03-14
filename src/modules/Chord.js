import NotePitch from './NotePitch.js';
import TensionNotePitch from './TensionNotePitch.js';

class Chord {
  constructor(root, triad, sixthOrSeventh = null, tensions = new Set(), bass = null) {
    this.root = root;
    this.triad = triad;
    this.sixthOrSeventh = sixthOrSeventh;
    this.tensions = tensions;
    this.bass = bass;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.root = this.root.getRawObj();
    rawObj.triad = this.triad;
    rawObj.sixth_or_seventh = (this.sixthOrSeventh === null)? null : this.sixthOrSeventh;
    rawObj.tensions = Array.from(this.tensions).map(tension => tension.getRawObj());
    rawObj.bass = (this.bass === null)? null : this.bass.getRawObj();
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    return new Chord(
      NotePitch.loadFromRawObj(rawObj.root),
      rawObj.triad,
      (rawObj.sixth_or_seventh === null)? null : rawObj.sixth_or_seventh,
      new Set(rawObj.tensions.map(tensionRawObj => TensionNotePitch.loadFromRawObj(tensionRawObj))),
      (rawObj.bass === null)? null : NotePitch.loadFromRawObj(rawObj.bass),
    );
  }
}

Object.defineProperty(
  Chord,
  'Triad',
  {
    value: {
      major: 'major',
      minor: 'minor',
      suspendedFourth: 'suspendedFourth',
      suspendedSecond: 'suspendedSecond',
      diminished: 'diminished',
      augumented: 'augumented',
    },
    writable: false,
  },
);

Object.defineProperty(
  Chord,
  'SixthOrSeventh',
  {
    value: {
      dominantSeventh: 'dominantSeventh',
      majorSeventh: 'majorSeventh',
      diminishedSeventh: 'diminishedSeventh',
      sixth: 'sixth',
    },
    writable: false,
  },
);

Object.defineProperty(
  Chord,
  'Root',
  {
    value: {
      a: NotePitch.a,
      aFlat: NotePitch.aFlat,
      aSharp: NotePitch.aSharp,
      b: NotePitch.b,
      bFlat: NotePitch.bFlat,
      bSharp: NotePitch.bSharp,
      c: NotePitch.c,
      cFlat: NotePitch.cFlat,
      cSharp: NotePitch.cSharp,
      d: NotePitch.d,
      dFlat: NotePitch.dFlat,
      dSharp: NotePitch.dSharp,
      e: NotePitch.e,
      eFlat: NotePitch.eFlat,
      eSharp: NotePitch.eSharp,
      f: NotePitch.f,
      fFlat: NotePitch.fFlat,
      fSharp: NotePitch.fSharp,
      g: NotePitch.g,
      gFlat: NotePitch.gFlat,
      gSharp: NotePitch.gSharp,
    },
    writable: false,
  },
);

export default Chord;
