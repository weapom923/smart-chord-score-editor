import Note from './Note.js'
import NotePitch from './NotePitch.js'

class PartInBar {
  constructor(notes, type, restNotePitch = null) {
    this.notes = notes;
    this.type = type;
    this.restNotePitch = restNotePitch;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.notes = this.notes.map(note => note.getRawObj());
    rawObj.type = this.type;
    rawObj.rest_note_pitch = (this.restNotePitch === null)? null : this.restNotePitch.getRawObj();
    return rawObj;
  }

  isEqualTo(that) {
    if (this.numNotes !== that.numNotes) return false;
    for (let noteIdx = 0; noteIdx < this.notes.length; ++noteIdx) {
      if (!this.getNote(noteIdx).isEqualTo(that.getNote(noteIdx))) return false;
    }
    if (this.type !== that.type) return false;
    if ((this.restNotePitch !== null) && (this.restNotePitch === null)) return false;
    if ((this.restNotePitch === null) && (this.restNotePitch !== null)) return false;
    if ((this.restNotePitch !== null) && (this.restNotePitch !== null)) {
      if (!this.restNotePitch.isEqualTo(that.restNotePitch)) return false;
    }
    return true;
  }

  clone() {
    return new PartInBar(
      this.notes.map(note => note.clone()),
      this.type,
      (this.restNotePitch === null)? null : this.restNotePitch.clone(),
    );
  }

  generateNewNormalNote(value) {
    switch (this.type) {
      case PartInBar.Type.chord:
        return new Note(
          null,
          value.clone(),
          Note.Type.normal,
          false,
        );
      default:
        return null;
    }
  }

  get numNotes() {
    return this.notes.length;
  }

  getFirstNoteIdx() {
    if (this.numNotes === 0) return null;
    return 0;
  }

  getLastNoteIdx() {
    if (this.numNotes === 0) return null;
    return this.numNotes - 1;
  }

  getNote(noteIdx) {
    if ((noteIdx === null) || (noteIdx < 0) || (noteIdx >= this.numNotes)) return null;
    return this.notes[noteIdx];
  }

  isFirstNoteTied() {
    return this.notes[0].tied;
  }

  static loadFromRawObj(rawObj) {
    return new PartInBar(
      rawObj.notes.map(noteRawObj => Note.loadFromRawObj(noteRawObj)),
      rawObj.type,
      (rawObj.rest_note_pitch === null)? rawObj.rest_note_pitch : NotePitch.loadFromRawObj(rawObj.rest_note_pitch),
    );
  }
}

Object.defineProperty(
  PartInBar,
  'Type',
  {
    value: {
      normal: 'normal',
      rhythm: 'rhythm',
      chord: 'chord',
    },
    writable: false,
  },
);

export default PartInBar;
