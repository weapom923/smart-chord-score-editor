import BarLine from './BarLine.js'
import NoteValue from './NoteValue.js'
import Clef from './Clef.js'
import Scale from './Scale.js'
import PartInBar from './PartInBar.js'

class Bar {
  constructor(value, partsInBar, clef, scale, terminatesSystem, barLineStart, barLineEnd) {
    this.value = value;
    this.parts = partsInBar;
    this.clef = clef;
    this.scale = scale;
    this.terminatesSystem = terminatesSystem;
    this.lineStart = barLineStart;
    this.lineEnd = barLineEnd;
  }

  static generateNew(value, clef, scale, partInBarType) {
    return new Bar(
      value,
      [ new PartInBar([], partInBarType, null) ],
      clef,
      scale,
      false,
      BarLine.Start.empty,
      BarLine.End.single,
    );
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.value = this.value.getRawObj();
    rawObj.parts = this.parts.map(part => part.getRawObj());
    rawObj.clef = this.clef.getRawObj();
    rawObj.scale = this.scale.getRawObj();
    rawObj.terminates_system = this.terminatesSystem;
    rawObj.line_start = this.lineStart.getRawObj();
    rawObj.line_end = this.lineEnd.getRawObj();
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    return new Bar(
      NoteValue.loadFromRawObj(rawObj.value),
      rawObj.parts.map(partRawObj => PartInBar.loadFromRawObj(partRawObj)),
      Clef.loadFromRawObj(rawObj.clef),
      Scale.loadFromRawObj(rawObj.scale),
      rawObj.terminates_system,
      BarLine.loadFromRawObj(rawObj.line_start),
      BarLine.loadFromRawObj(rawObj.line_end),
    );
  }
}

export default Bar;
