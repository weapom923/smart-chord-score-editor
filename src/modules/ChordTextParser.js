import Chord from './Chord.js'
import NotePitch from './NotePitch.js'

class ChordTextParser {
  static parseBassNote(chordText) {
    const validBassNotes = {
      'A':  NotePitch.a,
      'Ab': NotePitch.aFlat,
      'A#': NotePitch.aSharp,
      'B':  NotePitch.b,
      'Bb': NotePitch.bFlat,
      'B#': NotePitch.bSharp,
      'C':  NotePitch.c,
      'Cb': NotePitch.cFlat,
      'C#': NotePitch.cSharp,
      'D':  NotePitch.d,
      'Db': NotePitch.dFlat,
      'D#': NotePitch.dSharp,
      'E':  NotePitch.e,
      'Eb': NotePitch.eFlat,
      'E#': NotePitch.eSharp,
      'F':  NotePitch.f,
      'Fb': NotePitch.fFlat,
      'F#': NotePitch.fSharp,
      'G':  NotePitch.g,
      'Gb': NotePitch.gFlat,
      'G#': NotePitch.gSharp,
    };
    const validBassNoteNotations = Object.keys(validBassNotes);
    let chordWithBassNoteNotationRegexp = new RegExp('(?<remaining>.+)( on |/)(?<bassNoteNotation>.+)');
    let chordWithBassNoteNotation = chordWithBassNoteNotationRegexp.exec(chordText);
    if (chordWithBassNoteNotation === null) {
      return [ chordText, null ];
    } else {
      let remainingChordText = chordWithBassNoteNotation.groups.remaining;
      let bassNoteNotationCandidate = chordWithBassNoteNotation.groups.bassNoteNotation;
      if (!validBassNoteNotations.includes(bassNoteNotationCandidate)) {
        throw new ChordTextParser.ParseError(bassNoteNotationCandidate);
      }
      let bassNote = validBassNotes[bassNoteNotationCandidate];
      return [ remainingChordText, bassNote ];
    }
  }

  static parseTensionNotes(chordText) {
    const validTensionNotes = {
      '9': Chord.TensionNote.ninth,
      'b9': Chord.TensionNote.flatNinth,
      '#9': Chord.TensionNote.sharpNinth,
      '11': Chord.TensionNote.eleventh,
      '#11': Chord.TensionNote.sharpEleventh,
      '13': Chord.TensionNote.thirteenth,
      'b13': Chord.TensionNote.flatThirteenth,
    };
    const validTensionNotations = Object.keys(validTensionNotes);
    let chordWithTensionNotationRegexp = new RegExp('(?<remaining>.+)\\((?<tensionNotations>.+)\\)');
    let chordWithTensionNotation = chordWithTensionNotationRegexp.exec(chordText);
    if (chordWithTensionNotation === null) {
      return [ chordText, null ];
    } else {
      let remainingChordText = chordWithTensionNotation.groups.remaining;
      let tensionNotations = chordWithTensionNotation.groups.tensionNotations;
      let tensionNotationCandidates = tensionNotations.split(' ').filter(x => x.length);
      let tensionNotationCandidateSet = new Set(tensionNotationCandidates);
      if (tensionNotationCandidateSet.size !== tensionNotationCandidates.length) {
        throw new ChordTextParser.ParseError(tensionNotationCandidateSet);
      }
      for (let tensionNotationCandidate of tensionNotationCandidates) {
        if (!validTensionNotations.includes(tensionNotationCandidate)) {
          throw new ChordTextParser.ParseError(tensionNotationCandidate);
        }
      }
      let tensionNotes = tensionNotationCandidates.map(tensionNotation => validTensionNotes[tensionNotation])
      return [ remainingChordText, tensionNotes ];
    }
  }

  static parseOtherTension(chordText) {
    const validOtherTensionNotes = {
      'add9': Chord.TensionNote.ninth,
    };
    let indexOfOtherTensionNotesNotation = chordText.length;
    if (chordText.endsWith('add9')) {
      indexOfOtherTensionNotesNotation = chordText.lastIndexOf('add9');
    } else {
      return [ chordText, null ];
    }
    let remainingChordText = chordText.slice(0, indexOfOtherTensionNotesNotation);
    let otherTensionNote = validOtherTensionNotes[chordText.slice(indexOfOtherTensionNotesNotation)];
    return [ remainingChordText, otherTensionNote ];
  }

  static parseTriadSeventhAndNinth(chordText) {
    const validTriadSeventhAndNinths = {
      '9': [
        Chord.Triad.major,
        Chord.SixthOrSeventh.dominantSeventh,
        Chord.TensionNote.ninth,
      ],
      'm9': [
        Chord.Triad.minor,
        Chord.SixthOrSeventh.dominantSeventh,
        Chord.TensionNote.ninth,
      ],
      'M9': [
        Chord.Triad.major,
        Chord.SixthOrSeventh.majorSeventh,
        Chord.TensionNote.ninth,
      ],
      'mM9': [
        Chord.Triad.major,
        Chord.SixthOrSeventh.majorSeventh,
        Chord.TensionNote.ninth,
      ],
      'dim9': [
        Chord.Triad.diminished,
        Chord.SixthOrSeventh.diminishedSeventh,
        Chord.TensionNote.ninth,
      ],
    };
    let indexOfTriadSeventhAndNinthNotation = chordText.length;
    if (chordText.endsWith('dim9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('dim9');
    } else if (chordText.endsWith('m9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('m9');
    } else if (chordText.endsWith('mM9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('mM9');
    } else if (chordText.endsWith('M9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('M9');
    } else if (chordText.endsWith('9')) {
      indexOfTriadSeventhAndNinthNotation = chordText.lastIndexOf('9');
    } else {
      return [ chordText, null ];
    }
    let remainingChordText = chordText.slice(0, indexOfTriadSeventhAndNinthNotation);
    let triadSeventhAndNinth = validTriadSeventhAndNinths[chordText.slice(indexOfTriadSeventhAndNinthNotation)];
    return [ remainingChordText, triadSeventhAndNinth ];
  }

  static parseTriadAndSeventh(chordText) {
    const validTriadAndSevenths = {
      'dim7': [
        Chord.Triad.diminished,
        Chord.SixthOrSeventh.diminishedSeventh,
      ],
    };
    let indexOfTriadAndSeventhNotation = chordText.length;
    if (chordText.endsWith('dim7')) {
      indexOfTriadAndSeventhNotation = chordText.lastIndexOf('dim7');
    } else {
      return [ chordText, null ];
    }
    let remainingChordText = chordText.slice(0, indexOfTriadAndSeventhNotation);
    let triadAndSeventh = validTriadAndSevenths[chordText.slice(indexOfTriadAndSeventhNotation)];
    return [ remainingChordText, triadAndSeventh ];
  }

  static parseSixthOrSeventh(chordText) {
    const validSixthAndSevenths = {
      '6': Chord.SixthOrSeventh.sixth,
      '7': Chord.SixthOrSeventh.dominantSeventh,
      'M7': Chord.SixthOrSeventh.majorSeventh,
    };
    let indexOfSixthOrSeventhNotation = chordText.length;
    if (chordText.endsWith('M7')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('M7');
    } else if (chordText.endsWith('7')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('7');
    } else if (chordText.endsWith('6')) {
      indexOfSixthOrSeventhNotation = chordText.lastIndexOf('6');
    } else {
      return [ chordText, null ];
    }
    let remainingChordText = chordText.slice(0, indexOfSixthOrSeventhNotation);
    let sixthOrSeventh = validSixthAndSevenths[chordText.slice(indexOfSixthOrSeventhNotation)];
    return [ remainingChordText, sixthOrSeventh ];
  }

  static parsePostTriad(chordText) {
    const validPostTriads = {
      'sus4': Chord.Triad.suspendedFourth,
      'sus2': Chord.Triad.suspendedSecond,
    };
    let indexOfPostTriadNotation = chordText.length;
    if (chordText.endsWith('sus4')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('sus4');
    } else if (chordText.endsWith('sus2')) {
      indexOfPostTriadNotation = chordText.lastIndexOf('sus2');
    } else {
      return [ chordText, null ];
    }
    let remainingChordText = chordText.slice(0, indexOfPostTriadNotation);
    let postTriad = validPostTriads[chordText.slice(indexOfPostTriadNotation)];
    return [ remainingChordText, postTriad ];
  }

  static parseTriad(chordText) {
    const validTriads = {
      'M': Chord.Triad.major,
      'm': Chord.Triad.minor,
      '-': Chord.Triad.minor,
      'aug': Chord.Triad.augumented,
      '+': Chord.Triad.augumented,
      'dim': Chord.Triad.diminished,
    };
    let indexOfTriadNotation = chordText.length;
    if (chordText.endsWith('dim')) {
      indexOfTriadNotation = chordText.lastIndexOf('dim');
    } else if (chordText.endsWith('m')) {
      indexOfTriadNotation = chordText.lastIndexOf('m');
    } else if (chordText.endsWith('M')) {
      indexOfTriadNotation = chordText.lastIndexOf('M');
    } else if (chordText.endsWith('aug')) {
      indexOfTriadNotation = chordText.lastIndexOf('aug');
    } else if (chordText.endsWith('+')) {
      indexOfTriadNotation = chordText.lastIndexOf('+');
    } else if (chordText.endsWith('-')) {
      indexOfTriadNotation = chordText.lastIndexOf('-');
    } else {
      return [ chordText, null ];
    }
    let remainingChordText = chordText.slice(0, indexOfTriadNotation);
    let triad = validTriads[chordText.slice(indexOfTriadNotation)];
    return [ remainingChordText, triad ];
  }

  static parseRoot(chordText) {
    const validRoots = {
      'A': Chord.Root.a,
      'Ab': Chord.Root.aFlat,
      'A#': Chord.Root.aSharp,
      'B': Chord.Root.b,
      'Bb': Chord.Root.bFlat,
      'B#': Chord.Root.bSharp,
      'C': Chord.Root.c,
      'Cb': Chord.Root.cFlat,
      'C#': Chord.Root.cSharp,
      'D': Chord.Root.d,
      'Db': Chord.Root.dFlat,
      'D#': Chord.Root.dSharp,
      'E': Chord.Root.e,
      'Eb': Chord.Root.eFlat,
      'E#': Chord.Root.eSharp,
      'F': Chord.Root.f,
      'Fb': Chord.Root.fFlat,
      'F#': Chord.Root.fSharp,
      'G': Chord.Root.g,
      'Gb': Chord.Root.gFlat,
      'G#': Chord.Root.gSharp,
    };
    let rootNotationCandidate = chordText;
    const validRootNotations = Object.keys(validRoots);
    if (!validRootNotations.includes(rootNotationCandidate)) {
      throw new ChordTextParser.ParseError(rootNotationCandidate);
    }
    let root = validRoots[rootNotationCandidate];
    return root;
  }

  static parse(chordText) {
    let triad = undefined;
    let sixthOrSeventh = undefined;
    let tensionNotes = new Set();
    let bass = undefined;

    chordText = chordText.trim();

    {
      let result = ChordTextParser.parseBassNote(chordText);
      chordText = result[0];
      bass = result[1];
    }

    {
      let result = ChordTextParser.parseTensionNotes(chordText);
      chordText = result[0];
      let tensionNotesTemp = result[1];
      if (tensionNotesTemp !== null) {
        tensionNotesTemp.forEach(tensionNote => { tensionNotes.add(tensionNote) })
      }
    }

    {
      let result = ChordTextParser.parseOtherTension(chordText);
      chordText = result[0];
      let otherTension = result[1];
      if (otherTension !== null) {
        tensionNotes.add(otherTension);
      }
    }

    {
      let result =  ChordTextParser.parsePostTriad(chordText);
      chordText = result[0];
      let triadTemp = result[1];
      if (triadTemp !== null) {
        triad = triadTemp;
      }
    }

    {
      let result = ChordTextParser.parseTriadSeventhAndNinth(chordText);
      chordText = result[0];
      let triadSeventhAndNinth = result[1];
      if (triadSeventhAndNinth !== null) {
        if (triad === undefined) triad = triadSeventhAndNinth[0];
        sixthOrSeventh = triadSeventhAndNinth[1];
        let ninth = triadSeventhAndNinth[2];
        tensionNotes.add(ninth);
      }
    }

    {
      let result = ChordTextParser.parseTriadAndSeventh(chordText);
      chordText = result[0];
      let triadAndSeventh = result[1];
      if (triadAndSeventh !== null) {
        if (triad === undefined) triad = triadAndSeventh[0];
        sixthOrSeventh = triadAndSeventh[1];
      }
    }

    {
      let result = ChordTextParser.parseSixthOrSeventh(chordText);
      chordText = result[0];
      let sixthOrSeventhTemp = result[1];
      if (sixthOrSeventhTemp !== null) {
        sixthOrSeventh = sixthOrSeventhTemp;
      }
    }

    if (sixthOrSeventh === undefined) sixthOrSeventh = null;

    {
      let result = ChordTextParser.parseTriad(chordText);
      chordText = result[0];
      let triadTemp = result[1];
      if (triadTemp !== null) {
        if (triad === undefined) triad = triadTemp;
      }
    }

    let root = ChordTextParser.parseRoot(chordText);

    if (triad === undefined) triad = Chord.Triad.major;

    return new Chord(root, triad, sixthOrSeventh, tensionNotes, bass);
  }
}

Object.defineProperty(
  ChordTextParser,
  'ParseError',
  {
    value: class extends Error {
      constructor(...args) {
        super(...args);
      }
    },
    writable: false,
  },
);

export default ChordTextParser;
