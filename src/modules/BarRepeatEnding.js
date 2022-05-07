class BarRepeatEnding {
  constructor(numbers = new Set()) {
    this.numbers = numbers;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.numbers = Array.from(this.numbers);
    return rawObj;
  }

  isEqualTo(that) {
    let numNumbers = this.numbers.length;
    for (let numberIdx = 0; numberIdx < numNumbers; ++numberIdx) {
      if (!this.numbers[numberIdx].isEqualTo(that.numbers[numberIdx])) return false;
    }
    for (let numberOfThis of this.numbers.values()) {
      let isSameNumberFound = false;
      for (let numberOfThat of that.numbers.values()) {
        if (numberOfThis === numberOfThat) {
          isSameNumberFound = true;
          break;
        }
      }
      if (!isSameNumberFound) return false;
    }
    return true;
  }

  clone() {
    return new BarRepeatEnding(new Set(Array.from(this.numbers)));
  }

  static loadFromRawObj(rawObj) {
    return new BarRepeatEnding(new Set(rawObj.numbers));
  }
}

Object.defineProperty(BarRepeatEnding, 'empty', { value: new BarRepeatEnding(), writable: false });

export default BarRepeatEnding;

