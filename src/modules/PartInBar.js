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
