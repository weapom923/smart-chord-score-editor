import BarBreak from './BarBreak.js'
import BarLine from './BarLine.js'
import NoteValue from './NoteValue.js'
import Clef from './Clef.js'
import Scale from './Scale.js'
import PartInBar from './PartInBar.js'
import BarRepeatEnding from './BarRepeatEnding.js'

class Bar {
  constructor(value, partsInBar, clef, scale, barBreak, barLineStart, barLineEnd, barRepeatEnding, gridNoteValue) {
    this.value = value;
    this.parts = partsInBar;
    this.clef = clef;
    this.scale = scale;
    this.break = barBreak;
    this.lineStart = barLineStart;
    this.lineEnd = barLineEnd;
    this.repeatEnding = barRepeatEnding;
    this.gridNoteValue = gridNoteValue;
  }

  static generateNew(value, clef, scale, partInBarType, gridNoteValue) {
    return new Bar(
      value,
      [ new PartInBar([], partInBarType, null) ],
      clef,
      scale,
      BarBreak.empty,
      BarLine.Start.empty,
      BarLine.End.single,
      BarRepeatEnding.empty,
      gridNoteValue,
    );
  }

  isEqualTo(that) {
    if (!this.value.isEqualTo(that.value)) return false;
    if (this.parts.length !== that.parts.length) return false;
    for (let partIdx = 0; partIdx < this.numParts; ++partIdx) {
      if (!this.getPart(partIdx).isEqualTo(that.getPart(partIdx))) return false;
    }
    if (!this.clef.isEqualTo(that.clef)) return false;
    if (!this.break.isEqualTo(that.break)) return false;
    if (!this.lineStart.isEqualTo(that.lineStart)) return false;
    if (!this.lineEnd.isEqualTo(that.lineEnd)) return false;
    if (!this.repeatEnding.isEqualTo(that.repeatEnding)) return false;
    return true;
  }

  clone() {
    return new Bar(
      this.value.clone(),
      this.parts.map(part => part.clone()),
      this.clef.clone(),
      this.scale.clone(),
      this.break.clone(),
      this.lineStart.clone(),
      this.lineEnd.clone(),
      this.repeatEnding.clone(),
      this.gridNoteValue.clone(),
    );
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.value = this.value.getRawObj();
    rawObj.parts = this.parts.map(part => part.getRawObj());
    rawObj.clef = this.clef.getRawObj();
    rawObj.scale = this.scale.getRawObj();
    rawObj.break = this.break.getRawObj();
    rawObj.line_start = this.lineStart.getRawObj();
    rawObj.line_end = this.lineEnd.getRawObj();
    rawObj.repeat_ending = this.repeatEnding.getRawObj();
    rawObj.grid_note_value = this.gridNoteValue.getRawObj();
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    return new Bar(
      NoteValue.loadFromRawObj(rawObj.value),
      rawObj.parts.map(partRawObj => PartInBar.loadFromRawObj(partRawObj)),
      Clef.loadFromRawObj(rawObj.clef),
      Scale.loadFromRawObj(rawObj.scale),
      BarBreak.loadFromRawObj(rawObj.break),
      BarLine.loadFromRawObj(rawObj.line_start),
      BarLine.loadFromRawObj(rawObj.line_end),
      BarRepeatEnding.loadFromRawObj(rawObj.repeat_ending),
      NoteValue.loadFromRawObj(rawObj.grid_note_value),
    );
  }

  get numParts() {
    return this.parts.length;
  }

  getPart(partIdx) {
    if ((partIdx === null) || (partIdx < 0) || (partIdx >= this.numParts)) return null;
    return this.parts[partIdx];
  }
}

export default Bar;
