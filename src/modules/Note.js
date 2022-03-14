import NotePitch from "./NotePitch.js";
import NoteValue from "./NoteValue.js";
import Chord from "./Chord.js";

class Note {
  constructor(pitchOrChord, value, type) {
    this.pitchOrChord = pitchOrChord;
    this.value = value;
    this.type = type;
  }

  getRawObj() {
    let rawObj = new Object();
    if (this.pitchOrChord instanceof NotePitch) {
      rawObj.pitch = this.pitchOrChord.getRawObj();
    } else if (this.pitchOrChord instanceof Chord) {
      rawObj.chord = this.pitchOrChord.getRawObj();
    }
    rawObj.value = this.value.getRawObj();
    rawObj.type = this.type;
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    let pitchOrChord = null;
    if (Object.keys(rawObj).includes('pitch')) {
      pitchOrChord = NotePitch.loadFromRawObj(rawObj.pitch);
    } else if (Object.keys(rawObj).includes('chord')) {
      pitchOrChord = Chord.loadFromRawObj(rawObj.chord);
    }
    return new Note(
      pitchOrChord,
      NoteValue.loadFromRawObj(rawObj.value),
      rawObj.type,
    );
  }
}

Object.defineProperty(
  Note,
  'Type',
  {
    value: {
      normal: 'normal',
      rest: 'rest',
    },
    writable: false,
  }
);

export default Note;
