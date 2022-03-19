import Bar from './Bar.js'

class Section {
  constructor(name, bars) {
    this.name = name;
    this.bars = bars;
  }

  static generateNew(name, value, clef, scale, partInBarTypes) {
    return new Section(
      name,
      partInBarTypes.map(
        partInBarType => Bar.generateNew(value, clef, scale, partInBarType),
      ),
    );
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.name = this.name;
    rawObj.bars = this.bars.map(bar => bar.getRawObj());
    return rawObj;
  }

  static loadFromRawObj(rawObj) {
    return new Section(
      rawObj.name,
      rawObj.bars.map(barRawObj => Bar.loadFromRawObj(barRawObj)),
    );
  }
}

export default Section;
