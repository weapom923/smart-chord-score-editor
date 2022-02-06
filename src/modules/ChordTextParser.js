import utils from './utils.js'

class ChordTextParser {
  static parseTensionNotes(chordText) {
    const validTensionNotes = {
      '9': ChordTextParser.ParseResult.TensionNote.ninth,
      'b9': ChordTextParser.ParseResult.TensionNote.flatNinth,
      '#9': ChordTextParser.ParseResult.TensionNote.sharpNinth,
      '11': ChordTextParser.ParseResult.TensionNote.eleventh,
      '#11': ChordTextParser.ParseResult.TensionNote.sharpEleventh,
      '13': ChordTextParser.ParseResult.TensionNote.thirteenth,
      'b13': ChordTextParser.ParseResult.TensionNote.flatThirteenth,
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
        throw RuntimeError();
      }
      for (let tensionNotationCandidate of tensionNotationCandidates) {
        if (!validTensionNotations.includes(tensionNotationCandidate)) {
          throw RuntimeError();
        }
      }
      let tensionNotes = tensionNotationCandidates.map(tensionNotation => validTensionNotes[tensionNotation])
      return [ remainingChordText, tensionNotes ];
    }
  }

  static parseOtherTension(chordText) {
    const validOtherTensionNotes = {
      'add9': ChordTextParser.ParseResult.TensionNote.ninth,
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
        ChordTextParser.ParseResult.Triad.major,
        ChordTextParser.ParseResult.SixthOrSeventh.dominantSeventh,
        ChordTextParser.ParseResult.TensionNote.ninth,
      ],
      'm9': [
        ChordTextParser.ParseResult.Triad.minor,
        ChordTextParser.ParseResult.SixthOrSeventh.dominantSeventh,
        ChordTextParser.ParseResult.TensionNote.ninth,
      ],
      'M9': [
        ChordTextParser.ParseResult.Triad.major,
        ChordTextParser.ParseResult.SixthOrSeventh.majorSeventh,
        ChordTextParser.ParseResult.TensionNote.ninth,
      ],
      'mM9': [
        ChordTextParser.ParseResult.Triad.major,
        ChordTextParser.ParseResult.SixthOrSeventh.majorSeventh,
        ChordTextParser.ParseResult.TensionNote.ninth,
      ],
      'dim9': [
        ChordTextParser.ParseResult.Triad.diminished,
        ChordTextParser.ParseResult.SixthOrSeventh.diminishedSeventh,
        ChordTextParser.ParseResult.TensionNote.ninth,
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
        ChordTextParser.ParseResult.Triad.diminished,
        ChordTextParser.ParseResult.SixthOrSeventh.diminishedSeventh,
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
      '6': ChordTextParser.ParseResult.SixthOrSeventh.sixth,
      '7': ChordTextParser.ParseResult.SixthOrSeventh.dominantSeventh,
      'M7': ChordTextParser.ParseResult.SixthOrSeventh.majorSeventh,
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
      'sus4': ChordTextParser.ParseResult.Triad.suspendedFourth,
      'sus2': ChordTextParser.ParseResult.Triad.suspendedSecond,
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
      'M': ChordTextParser.ParseResult.Triad.major,
      'm': ChordTextParser.ParseResult.Triad.minor,
      '-': ChordTextParser.ParseResult.Triad.minor,
      'aug': ChordTextParser.ParseResult.Triad.augumented,
      '+': ChordTextParser.ParseResult.Triad.augumented,
      'dim': ChordTextParser.ParseResult.Triad.diminished,
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
      'A': ChordTextParser.ParseResult.Root.a,
      'Ab': ChordTextParser.ParseResult.Root.aFlat,
      'A#': ChordTextParser.ParseResult.Root.aSharp,
      'B': ChordTextParser.ParseResult.Root.b,
      'Bb': ChordTextParser.ParseResult.Root.bFlat,
      'B#': ChordTextParser.ParseResult.Root.bSharp,
      'C': ChordTextParser.ParseResult.Root.c,
      'Cb': ChordTextParser.ParseResult.Root.cFlat,
      'C#': ChordTextParser.ParseResult.Root.cSharp,
      'D': ChordTextParser.ParseResult.Root.d,
      'Db': ChordTextParser.ParseResult.Root.dFlat,
      'D#': ChordTextParser.ParseResult.Root.dSharp,
      'E': ChordTextParser.ParseResult.Root.e,
      'Eb': ChordTextParser.ParseResult.Root.eFlat,
      'E#': ChordTextParser.ParseResult.Root.eSharp,
      'F': ChordTextParser.ParseResult.Root.f,
      'Fb': ChordTextParser.ParseResult.Root.fFlat,
      'F#': ChordTextParser.ParseResult.Root.fSharp,
      'G': ChordTextParser.ParseResult.Root.g,
      'Gb': ChordTextParser.ParseResult.Root.gFlat,
      'G#': ChordTextParser.ParseResult.Root.gSharp,
    };
    const validRootNotations = Object.keys(validRoots);
    const escapedValidRootNotations = validRootNotations.map(x => utils.escapeRegex(x));
    let chordWithRootRegexp = new RegExp('(?<remaining>.*)(?<rootNotation>' + escapedValidRootNotations.join('|') + ')');
    let chordWithRoot = chordWithRootRegexp.exec(chordText);
    if (chordWithRoot === null) {
      return [ chordText, null ];
    } else {
      let remainingChordText = chordWithRoot.groups.remaining;
      let rootNotationCandidate = chordWithRoot.groups.rootNotation;
      if (!validRootNotations.includes(rootNotationCandidate)) {
        throw RuntimeError();
      }
      let root = validRoots[rootNotationCandidate];
      return [ remainingChordText, root ];
    }
  }

  static parse(chordText) {
    let root = undefined;
    let triad = undefined;
    let sixthOrSeventh = undefined;
    let tensions = new Set();
    // let bass = undefined;

    {
      let result = ChordTextParser.parseTensionNotes(chordText);
      chordText = result[0];
      let tensionsTemp = result[1];
      if (tensionsTemp !== null) {
        tensionsTemp.forEach(tension => { tensions.add(tension) })
      }
    }

    {
      let result = ChordTextParser.parseOtherTension(chordText);
      chordText = result[0];
      let otherTension = result[1];
      if (otherTension !== null) {
        tensions.add(otherTension);
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
        tensions.add(ninth);
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

    {
      let result = ChordTextParser.parseTriad(chordText);
      chordText = result[0];
      let triadTemp = result[1];
      if (triadTemp !== null) {
        if (triad === undefined) triad = triadTemp;
      }
    }

    {
      let result = ChordTextParser.parseRoot(chordText);
      chordText = result[0];
      root = result[1];
    }

    if (triad === undefined) triad = ChordTextParser.ParseResult.Triad.major;

    return new this.ParseResult(root, triad, sixthOrSeventh, tensions, null);
  }
}

Object.defineProperty(
  ChordTextParser,
  'ParseResult',
  {
    value: class {
      constructor(root, triad, sixthOrSeventh, tension, bass) {
        this.root = root;
        this.triad = triad;
        this.sixthOrSeventh = sixthOrSeventh;
        this.tension = tension;
        this.bass = bass;
      }
    },
    writable: false,
  },
);

Object.defineProperty(
  ChordTextParser.ParseResult,
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
  ChordTextParser.ParseResult,
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
  ChordTextParser.ParseResult,
  'TensionNote',
  {
    value: {
      ninth: 'ninth',
      flatNinth: 'flatNinth',
      sharpNinth: 'sharpNinth',
      eleventh: 'eleventh',
      sharpEleventh: 'flatEleventh',
      thirteenth: 'thirteenth',
      flatThirteenth: 'flatThirteenth',
    },
    writable: false,
  },
);

Object.defineProperty(
  ChordTextParser.ParseResult,
  'Root',
  {
    value: {
      a: 'a',
      aFlat: 'aFlat',
      aSharp: 'aSharp',
      b: 'b',
      bFlat: 'bFlat',
      bSharp: 'bSharp',
      c: 'c',
      cFlat: 'cFlat',
      cSharp: 'cSharp',
      d: 'd',
      dFlat: 'dFlat',
      dSharp: 'dSharp',
      e: 'e',
      eFlat: 'eFlat',
      eSharp: 'eSharp',
      f: 'f',
      fFlat: 'fFlat',
      fSharp: 'fSharp',
      g: 'g',
      gFlat: 'gFlat',
      gSharp: 'gSharp',
    },
    writable: false,
  },
);


export default ChordTextParser;
