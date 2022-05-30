import Bar from './Bar.js'

class Section {
  constructor(name, bars) {
    this.name = name;
    this.bars = bars;
  }

  static generateNew(name, value, clef, scale, partInBarTypes, gridNoteValue) {
    return new Section(
      name,
      partInBarTypes.map(
        partInBarType => Bar.generateNew(value, clef, scale, partInBarType, gridNoteValue),
      ),
    );
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.name = this.name;
    rawObj.bars = this.bars.map(bar => bar.getRawObj());
    return rawObj;
  }

  isEqualTo(that) {
    if (this.name !== that.name) return false;
    if (this.bars.length !== that.bars.length) return false;
    for (let barIdx = 0; barIdx < this.bars.length; ++barIdx) {
      if (!this.bars[barIdx].isEqualTo(that.bars[barIdx])) return false;
    }
    return true;
  }

  clone() {
    return new Section(
      this.name,
      this.bars.map(bar => bar.clone()),
    );
  }

  static loadFromRawObj(rawObj) {
    return new Section(
      rawObj.name,
      rawObj.bars.map(barRawObj => Bar.loadFromRawObj(barRawObj)),
    );
  }

  getNumBars() {
    return this.bars.length;
  }

  getFirstBarIdx() {
    let numBars = this.getNumBars();
    if (numBars === 0) return null;
    return 0;
  }

  getLastBarIdx() {
    let numBars = this.getNumBars();
    if (numBars === 0) return null;
    return numBars - 1;
  }

  getBar(barIdx) {
    let numBars = this.getNumBars();
    if ((barIdx === null) || (barIdx < 0) || (barIdx >= numBars)) return null;
    return this.bars[barIdx];
  }
}

export default Section;
