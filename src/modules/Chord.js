import NotePitch from './NotePitch.js';
import TensionNotePitch from './TensionNotePitch.js';

class Chord {
  constructor(root, triad, sixthOrSeventh = null, tensionNotes = new Set(), bass = null, { makesValid = false } = {}) {
    this.root = root;
    this.triad = triad;
    this.sixthOrSeventh = sixthOrSeventh;
    this.tensionNotes = tensionNotes;
    this.bass = bass;
    if (!this.isValid){
      if (makesValid) {
        this.makeValid();
      } else  {
        throw new Chord.InvalidChordError('Invalid chord.');
      }
    }
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.root = this.root.getRawObj();
    rawObj.triad = this.triad;
    rawObj.sixth_or_seventh = (this.sixthOrSeventh === null)? null : this.sixthOrSeventh;
    rawObj.tension_notes = Array.from(this.tensionNotes).map(tensionNote => tensionNote.getRawObj());
    rawObj.bass = (this.bass === null)? null : this.bass.getRawObj();
    return rawObj;
  }

  isEqualTo(that) {
    if (!this.root.isEqualTo(that.root)) return false;
    if (this.triad !== that.triad) return false;
    if (this.sixthOrSeventh !== that.sixthOrSeventh) return false;
    if (this.tensionNotes.size !== that.tensionNotes.size) return false;
    for (let tensionNotePitchOfThis of this.tensionNotes.values()) {
      let isSameTensionNotePitchFound = false;
      for (let tensionNotePitchOfThat of that.tensionNotes.values()) {
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
    let tensionNotes = new Set();
    this.tensionNotes.forEach(tensionNote => {
      tensionNotes.add(tensionNote.clone());
    });
    return new Chord(
      this.root.clone(),
      this.triad,
      this.sixthOrSeventh,
      tensionNotes,
      (this.bass === null)? null : this.bass.clone(),
    );
  }

  static loadFromRawObj(rawObj) {
    return new Chord(
      NotePitch.loadFromRawObj(rawObj.root),
      rawObj.triad,
      (rawObj.sixth_or_seventh === null)? null : rawObj.sixth_or_seventh,
      new Set(rawObj.tension_notes.map(tensionNoteRawObj => TensionNotePitch.loadFromRawObj(tensionNoteRawObj))),
      (rawObj.bass === null)? null : NotePitch.loadFromRawObj(rawObj.bass),
    );
  }

  get sortedTensionNotes() {
    let allSortedTensionNotes = [
      Chord.TensionNote.flatNinth,
      Chord.TensionNote.ninth,
      Chord.TensionNote.sharpNinth,
      Chord.TensionNote.eleventh,
      Chord.TensionNote.sharpEleventh,
      Chord.TensionNote.flatThirteenth,
      Chord.TensionNote.thirteenth,
    ];
    let sortedTensionNotes = new Array();
    for (let targetTensionNote of allSortedTensionNotes) {
      for (let tensionNote of this.tensionNotes) {
        if (targetTensionNote.isEqualTo(tensionNote)) {
          sortedTensionNotes.push(targetTensionNote);
          break;
        }
      }
    }
    return (sortedTensionNotes.length > 0)? sortedTensionNotes : null;
  }

  get isHalfDiminished7th() {
    return (this.triad === Chord.Triad.diminished) && (this.sixthOrSeventh === Chord.SixthOrSeventh.dominantSeventh);
  }

  get isDiminished7th() {
    return (this.triad === Chord.Triad.diminished) && (this.sixthOrSeventh === Chord.SixthOrSeventh.diminishedSeventh);
  }

  get basicChordText() {
    if (this.isHalfDiminished7th) {
      return 'm7';
    }
    if (this.isDiminished7th) {
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
    if (this.isHalfDiminished7th) {
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
      string += this.sortedTensionNotes.map(tensionNote => String(tensionNote)).join(' ');
      string += ')';
    }
    return string;
  }

  get selectableSixthOrSevenths() {
    let selectableSixthOrSevenths = new Set(Object.values(Chord.SixthOrSeventh));

    switch (this.triad) {
      case Chord.Triad.major:
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.diminishedSeventh);
        break;
      case Chord.Triad.minor:
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.diminishedSeventh);
        break;
      case Chord.Triad.suspendedFourth:
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.sixth);
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.diminishedSeventh);
        break;
      case Chord.Triad.suspendedSecond:
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.sixth);
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.diminishedSeventh);
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.dominantSeventh);
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.majorSeventh);
        break;
      case Chord.Triad.diminished:
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.sixth);
        break;
      case Chord.Triad.augumented:
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.diminishedSeventh);
        selectableSixthOrSevenths.delete(Chord.SixthOrSeventh.sixth);
        break;
    }
    return selectableSixthOrSevenths;
  }

  get selectableTensionNotes() {
    let selectableTensionNotes = new Set(Object.values(Chord.TensionNote));

    switch (this.triad) {
      case Chord.Triad.major:
        selectableTensionNotes.delete(Chord.TensionNote.eleventh);
        break;
      case Chord.Triad.minor:
        selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpEleventh);
        break;
      case Chord.Triad.suspendedFourth:
        selectableTensionNotes.delete(Chord.TensionNote.eleventh);
        selectableTensionNotes.delete(Chord.TensionNote.sharpEleventh);
        break;
      case Chord.Triad.suspendedSecond:
        selectableTensionNotes.delete(Chord.TensionNote.ninth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
        selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
        break;
      case Chord.Triad.diminished:
        selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
        selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpEleventh);
        break;
      case Chord.Triad.augumented:
        selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
        selectableTensionNotes.delete(Chord.TensionNote.eleventh);
        selectableTensionNotes.delete(Chord.TensionNote.flatThirteenth);
        selectableTensionNotes.delete(Chord.TensionNote.thirteenth);
        break;
    }

    switch (this.sixthOrSeventh) {
      case Chord.SixthOrSeventh.sixth:
        selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
        selectableTensionNotes.delete(Chord.TensionNote.flatThirteenth);
        selectableTensionNotes.delete(Chord.TensionNote.thirteenth);
        break;
      case Chord.SixthOrSeventh.diminishedSeventh:
        selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpEleventh);
        selectableTensionNotes.delete(Chord.TensionNote.thirteenth);
        break;
      case Chord.SixthOrSeventh.majorSeventh:
        selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
        selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
        selectableTensionNotes.delete(Chord.TensionNote.eleventh);
        selectableTensionNotes.delete(Chord.TensionNote.flatThirteenth);
        break;
    }

    for (let tensionNote of this.tensionNotes) {
      switch (tensionNote) {
        case Chord.TensionNote.ninth:
          selectableTensionNotes.delete(Chord.TensionNote.flatNinth);
          selectableTensionNotes.delete(Chord.TensionNote.sharpNinth);
          break;
        case Chord.TensionNote.flatNinth:
          selectableTensionNotes.delete(Chord.TensionNote.ninth);
          break;
        case Chord.TensionNote.sharpNinth:
          selectableTensionNotes.delete(Chord.TensionNote.ninth);
          break;
        case Chord.TensionNote.eleventh:
          selectableTensionNotes.delete(Chord.TensionNote.sharpEleventh);
          break;
        case Chord.TensionNote.sharpEleventh:
          selectableTensionNotes.delete(Chord.TensionNote.eleventh);
          break;
        case Chord.TensionNote.thirteenth:
          selectableTensionNotes.delete(Chord.TensionNote.flatThirteenth);
          break;
        case Chord.TensionNote.flatThirteenth:
          selectableTensionNotes.delete(Chord.TensionNote.thirteenth);
          break;
      }
    }
    return selectableTensionNotes;
  }

  get isValid() {
    if (this.sixthOrSeventh !== null) {
      let isSixthOrSeventhSelectable = false;
      for (let selectableSixthOrSeventh of this.selectableSixthOrSevenths) {
        if (selectableSixthOrSeventh === this.sixthOrSeventh) {
          isSixthOrSeventhSelectable = true;
          break;
        }
      }
      if (!isSixthOrSeventhSelectable) return false;
    }
    for (let tensionNote of this.tensionNotes) {
      let isTensionNoteSelectable = false;
      for (let selectableTensionNote of this.selectableTensionNotes) {
        if (selectableTensionNote.isEqualTo(tensionNote)) {
          isTensionNoteSelectable = true;
          break;
        }
      }
      if (!isTensionNoteSelectable) return false;
    }
    return true;
  }

  makeValid() {
    if (this.sixthOrSeventh !== null) {
      let isSixthOrSeventhSelectable = false;
      for (let selectableSixthOrSeventh of this.selectableSixthOrSevenths) {
        if (selectableSixthOrSeventh === this.sixthOrSeventh) {
          isSixthOrSeventhSelectable = true;
          break;
        }
      }
      if (!isSixthOrSeventhSelectable) {
        this.sixthOrSeventh = null;
      }
    }
    for (let tensionNote of this.tensionNotes) {
      let isTensionNoteSelectable = false;
      for (let selectableTensionNote of this.selectableTensionNotes) {
        if (selectableTensionNote.isEqualTo(tensionNote)) {
          isTensionNoteSelectable = true;
          break;
        }
      }
      if (!isTensionNoteSelectable) {
        this.tensionNotes.delete(tensionNote);
      }
    }
    return true;
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
  'TensionNote',
  {
    value: {
      ninth:          TensionNotePitch.ninth,
      flatNinth:      TensionNotePitch.flatNinth,
      sharpNinth:     TensionNotePitch.sharpNinth,
      eleventh:       TensionNotePitch.eleventh,
      sharpEleventh:  TensionNotePitch.sharpEleventh,
      thirteenth:     TensionNotePitch.thirteenth,
      flatThirteenth: TensionNotePitch.flatThirteenth,
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

Object.defineProperty(
  Chord,
  'InvalidChordError',
  {
    value: class extends Error {
      constructor(...args) {
        super(...args);
      }
    },
    writable: false,
  },
);

export default Chord;
