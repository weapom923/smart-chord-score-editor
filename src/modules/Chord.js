import NotePitch from './NotePitch.js';
import TensionNotePitch from './TensionNotePitch.js';

function isHalfDiminished7th(chord) {
  return (chord.triad === Chord.Triad.diminished) && (chord.sixthOrSeventh === Chord.SixthOrSeventh.dominantSeventh);
}

function isDiminished7th(chord) {
  return (chord.triad === Chord.Triad.diminished) && (chord.sixthOrSeventh === Chord.SixthOrSeventh.diminishedSeventh);
}

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

  isEqualTo(that) {
    if (!this.root.isEqualTo(that.root)) return false;
    if (this.triad !== that.triad) return false;
    if (this.sixthOrSeventh !== that.sixthOrSeventh) return false;
    if (this.tensions.size !== that.tensions.size) return false;
    for (let tensionNotePitchOfThis of this.tensions.values()) {
      let isSameTensionNotePitchFound = false;
      for (let tensionNotePitchOfThat of that.tensions.values()) {
        if (tensionNotePitchOfThis.isEqualTo(tensionNotePitchOfThat)) {
          isSameTensionNotePitchFound = true;
          break;
        }
      }
      if (!isSameTensionNotePitchFound) return false;
    }
    if ((this.bass === null) && (that.bass !== null)) return false;
    if ((this.bass !== null) && (that.bass === null)) return false;
    if ((this.bass !== null) && (that.bass !== null)) {
      if (!this.bass.isEqualTo(that.bass)) return false;
    }
    return true;
  }

  clone() {
    let tensions = new Set();
    this.tensions.forEach(tensionNotePitch => {
      tensions.add(tensionNotePitch.clone());
    });
    return new Chord(
      this.root.clone(),
      this.triad,
      this.sixthOrSeventh,
      tensions,
      (this.bass === null)? null : this.bass.clone(),
    );
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

  get sortedTensionNotes() {
    let sortedTensionNotes = new Array();
    if (this.tensions.has(TensionNotePitch.flatNinth)) {
      sortedTensionNotes.push(TensionNotePitch.flatNinth);
    }
    if (this.tensions.has(TensionNotePitch.ninth)) {
      sortedTensionNotes.push(TensionNotePitch.ninth);
    }
    if (this.tensions.has(TensionNotePitch.sharpNinth)) {
      sortedTensionNotes.push(TensionNotePitch.sharpNinth);
    }
    if (this.tensions.has(TensionNotePitch.eleventh)) {
      sortedTensionNotes.push(TensionNotePitch.eleventh);
    }
    if (this.tensions.has(TensionNotePitch.sharpEleventh)) {
      sortedTensionNotes.push(TensionNotePitch.sharpEleventh);
    }
    if (this.tensions.has(TensionNotePitch.flatThirteenth)) {
      sortedTensionNotes.push(TensionNotePitch.flatThirteenth);
    }
    if (this.tensions.has(TensionNotePitch.thirteenth)) {
      sortedTensionNotes.push(TensionNotePitch.thirteenth);
    }
    return (sortedTensionNotes.length > 0)? sortedTensionNotes : null;
  }

  get basicChordText() {
    if (isHalfDiminished7th(this)) {
      return 'm7';
    }
    if (isDiminished7th(this)) {
      return 'dim7';
    }
    let basicChordText = '';
    switch (this.triad) {
      case Chord.Triad.minor:
        basicChordText = 'm';
        break;
      case Chord.Triad.diminished:
        basicChordText = 'dim';
        break;
      case Chord.Triad.augumented:
        basicChordText = 'aug';
        break;
    }
    switch (this.sixthOrSeventh) {
      case Chord.SixthOrSeventh.sixth:
        basicChordText += '6';
        break;
      case Chord.SixthOrSeventh.dominantSeventh:
        basicChordText += '7';
        break;
      case Chord.SixthOrSeventh.majorSeventh:
        basicChordText += 'M7';
        break;
    }
    if (basicChordText.length > 0) {
      return basicChordText;
    }
    return null;
  }

  get additionalChordText() {
    if (isHalfDiminished7th(this)) {
      return '-5';
    }
    switch (this.triad) {
      case Chord.Triad.suspendedFourth:
        return 'sus4';
      case Chord.Triad.suspendedSecond:
        return 'sus2';
    }
    return null;
  }

  toString() {
    let string = '';
    string += String(this.root);
    if (this.basicChordText) string += this.basicChordText;
    if (this.additionalChordText) string += this.additionalChordText;
    if (this.sortedTensionNotes) {
      string += '(';
      string += this.sortedTensionNotes.map(tension => String(tension)).join(' ');
      string += ')';
    }
    return string;
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

Object.defineProperty(
  Chord,
  'default',
  {
    value: new Chord(Chord.Root.a, Chord.Triad.major),
    writable: false,
  },
);

export default Chord;
