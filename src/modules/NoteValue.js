import RationalNumber from './RationalNumber.js';
import utils from './utils.js';

class NoteValue extends RationalNumber {
  constructor(unitValueRatio, unitValueNumber = 1) {
    super(unitValueRatio, unitValueNumber);
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.numerator = this.numerator;
    rawObj.denominator = this.denominator;
    return rawObj;
  }

  clone() {
    return new NoteValue(
      this.numerator,
      this.denominator,
    );
  }

  static loadFromRawObj(rawObj) {
    return new NoteValue(
      rawObj.numerator,
      rawObj.denominator,
    );
  }

  isDivisible() {
    for (let divisibleNoteValue of Object.values(NoteValue.divisible)) {
      if (this.isEqualTo(divisibleNoteValue)) {
        return true;
      }
    }
    return false;
  }

  isDottedOfDivisible() {
    return (this.undot() !== null);
  }

  undot() {
    let undottedNoteValue = this.multiply(new NoteValue(2, 3));
    return (undottedNoteValue.isDivisible())? undottedNoteValue : null;
  }

  dot() {
    if (this.isEqualTo(NoteValue.divisible.sixtyFourth)) return null;
    return (this.isDivisible())? this.multiply(new NoteValue(3, 2)) : null;
  }

  getRate(barValue) {
    return this.toNumber() / barValue.toNumber();
  }

  splitIntoDivisibleNoteValues(offsetNoteValue, globalGridNoteValue = NoteValue.divisible.half) {
    let divisibleNoteValues = new Array();
    let remainingNoteValue = this;
    let offsetNoteValueInGlobalGrid = offsetNoteValue.modulo(globalGridNoteValue);
    if (offsetNoteValueInGlobalGrid.isGreaterThan(0)) {
      let remainingNoteValueInGlobalGrid = globalGridNoteValue.subtract(offsetNoteValueInGlobalGrid);
      if (remainingNoteValueInGlobalGrid.isGreaterThan(remainingNoteValue)) {
        remainingNoteValueInGlobalGrid = remainingNoteValue;
      }
      if (remainingNoteValueInGlobalGrid.isLessThanOrEqualTo(remainingNoteValue) && 
        (remainingNoteValueInGlobalGrid.isDivisible() || remainingNoteValueInGlobalGrid.isDottedOfDivisible())) {
        divisibleNoteValues.push(remainingNoteValueInGlobalGrid);
      } else {
        let remainingNoteValueRatioInGlobalGrid =
          NoteValue.reduceTo(remainingNoteValueInGlobalGrid, NoteValue.divisible.sixtyFourth.denominator).numerator;
        while (remainingNoteValueRatioInGlobalGrid > 0) {
          let divisibleNoteValueRatio = utils.calculateMaximumPowerOfTwoLessThanOrEqualTo(remainingNoteValueRatioInGlobalGrid);
          divisibleNoteValues.unshift(NoteValue.divisible.sixtyFourth.multiply(divisibleNoteValueRatio));
          remainingNoteValueRatioInGlobalGrid -= divisibleNoteValueRatio;
        }
      }
      remainingNoteValue = remainingNoteValue.subtract(remainingNoteValueInGlobalGrid);
    }
    if (remainingNoteValue.isDivisible() || remainingNoteValue.isDottedOfDivisible()) {
      divisibleNoteValues.push(remainingNoteValue);
    } else {
      while (remainingNoteValue.isGreaterThan(0)) {
        if (remainingNoteValue.isDivisible() || remainingNoteValue.isDottedOfDivisible()) {
          divisibleNoteValues.push(remainingNoteValue);
          break;
        } else {
          if (remainingNoteValue.isGreaterThan(globalGridNoteValue)) {
            divisibleNoteValues.push(globalGridNoteValue);
            remainingNoteValue = remainingNoteValue.subtract(globalGridNoteValue);
          } else {
            let remainingNoteValueRatio =
              NoteValue.reduceTo(remainingNoteValue, NoteValue.divisible.sixtyFourth.denominator).numerator;
            while (remainingNoteValueRatio > 0) {
              let divisibleNoteValueRatio = utils.calculateMaximumPowerOfTwoLessThanOrEqualTo(remainingNoteValueRatio);
              divisibleNoteValues.push(NoteValue.divisible.sixtyFourth.multiply(divisibleNoteValueRatio));
              remainingNoteValueRatio -= divisibleNoteValueRatio;
            }
            break;
          }
        }
      }
    }
    return divisibleNoteValues.map(noteValue => (noteValue.reduce()));
  }
}

Object.defineProperty(
  NoteValue,
  'Error',
  {
    value: class NoteValueError extends Error {
      constructor(...args) {
        super(...args)
      }
    },
    writable: false,
  },
);

Object.defineProperty(
  NoteValue,
  'divisible',
  {
    value: {
      whole:        new NoteValue(1, 1),
      half:         new NoteValue(1, 2),
      quarter:      new NoteValue(1, 4),
      eighth:       new NoteValue(1, 8),
      sixteenth:    new NoteValue(1, 16),
      thirtySecond: new NoteValue(1, 32),
      sixtyFourth:  new NoteValue(1, 64),
    },
    writable: false,
  },
);

export default NoteValue;
