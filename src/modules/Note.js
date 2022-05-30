import NotePitch from "./NotePitch.js";
import NoteValue from "./NoteValue.js";
import Chord from "./Chord.js";

class Note {
  constructor(pitchOrChord, value, type, tied) {
    this.pitchOrChord = pitchOrChord;
    this.value = value;
    this.type = type;
    this.tied = (type === Note.Type.rest)? false : tied;
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
    rawObj.tied = this.tied;
    return rawObj;
  }

  isEqualTo(that) {
    if (this.type !== that.type) return false;
    switch (this.type) {
      case Note.Type.normal:
        if ((this.pitchOrChord !== null) && (that.pitchOrChord !== null)) {
          if (!this.pitchOrChord.isEqualTo(that.pitchOrChord)) return false;
        } else {
          if (this.pitchOrChord !== that.pitchOrChord) return false;
        }
        break;
    }
    if (!this.value.isEqualTo(that.value)) return false;
    if (this.tied !== that.tied) return false;
    return true;
  }

  clone() {
    return new Note(
      (this.pitchOrChord === null)? null : this.pitchOrChord.clone(),
      this.value.clone(),
      String(this.type),
      this.tied,
    );
  }

  generateNewRestNote() {
    return new Note(
      null,
      this.value.clone(),
      Note.Type.rest,
      false,
    );
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
      rawObj.tied,
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
