import Bar from './Bar.js'

class Section {
  constructor(name, bars) {
    this.name = name;
    this.bars = bars;
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
