function getGCD(x, y) {
  return (y === 0)? x : getGCD(y, x % y);
}

class RationalNumber {
  constructor(numerator, denominator) {
    if (!Number.isSafeInteger(numerator)) {
        throw new this.constructor.TypeError('numerator(' + String(numerator) + ') is not a safe integer');
    }
    if (!Number.isSafeInteger(denominator)) {
        throw new this.constructor.TypeError('denominator(' + String(denominator) + ') is not a safe integer');
    }
    let isNumeratorNegative = (numerator < 0);
    let isDenominatorNegative = (denominator < 0);
    this._isNegative = (isNumeratorNegative !== isDenominatorNegative);
    this._numerator = (isNumeratorNegative)? -numerator : numerator;
    this._denominator = (isDenominatorNegative)? -denominator : denominator;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.numerator = this.numeratorWithSign;
    rawObj.denominator = this.denominator;
    return rawObj;
  }

  loadFromRawObj(rawObj) {
    return new RationalNumber(
      rawObj.numerator,
      rawObj.denominator,
    );
  }

  get isNegative() { return this._isNegative }
  get numerator() { return this._numerator }
  get numeratorWithSign() { return (this.isNegative)? -this.numerator : this.numerator }
  get denominator() { return this._denominator }

  reduce() {
    let gcd = getGCD(this.numerator, this.denominator);
    return new this.constructor(this.numeratorWithSign / gcd, this.denominator / gcd);
  }

  static reduceTo(x, denominator) {
    let y = new x.constructor(1, denominator);
    return x.constructor.reduceToCommonDenominator(x, y)[0];
  }

  static reduceToCommonDenominator(x, y) {
    let gcd = getGCD(x.denominator, y.denominator);
    let xScale = y.denominator / gcd;
    let yScale = x.denominator / gcd;
    let commonDenominator = gcd * xScale * yScale;
    let reducedXNominator = x.numeratorWithSign * xScale;
    let reducedYNominator = y.numeratorWithSign * yScale;
    return [
      new x.constructor(reducedXNominator, commonDenominator),
      new y.constructor(reducedYNominator, commonDenominator),
    ];
  }

  toNumber() {
    let reducedRationalNumber = this.reduce();
    return reducedRationalNumber.numeratorWithSign / reducedRationalNumber.denominator;
  }

  toString() {
    return String(this.numeratorWithSign) + '/' + String(this.denominator);
  }

  invertSign() {
    return new this.constructor(-this.numeratorWithSign, this.denominator);
  }

  add(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [reducedThis, reducedThat] = this.constructor.reduceToCommonDenominator(this, that);
    return new this.constructor(
      reducedThis.numeratorWithSign + reducedThat.numeratorWithSign,
      reducedThis.denominator,
    );
  }

  subtract(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    return this.add(that.invertSign());
  }

  multiply(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    return new this.constructor(this.numeratorWithSign * that.numeratorWithSign, this.denominator * that.denominator).reduce();
  }

  divide(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    return new this.constructor(this.numeratorWithSign * that.denominator, this.denominator * that.numeratorWithSign).reduce();
  }

  modulo(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [reducedThis, reducedThat] = this.constructor.reduceToCommonDenominator(this, that);
    return new this.constructor(reducedThis.numeratorWithSign % reducedThat.numeratorWithSign, reducedThis.denominator).reduce();
  }

  isEqualTo(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [ reducedThis, reducedThat ] = this.constructor.reduceToCommonDenominator(this, that);
    return (reducedThis.numeratorWithSign === reducedThat.numeratorWithSign);
  }

  isLessThan(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [ reducedThis, reducedThat ] = this.constructor.reduceToCommonDenominator(this, that);
    return (reducedThis.numeratorWithSign < reducedThat.numeratorWithSign);
  }

  isGreaterThan(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [ reducedThis, reducedThat ] = this.constructor.reduceToCommonDenominator(this, that);
    return (reducedThis.numeratorWithSign > reducedThat.numeratorWithSign);
  }

  isLessThanOrEqualTo(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [ reducedThis, reducedThat ] = this.constructor.reduceToCommonDenominator(this, that);
    return (reducedThis.numeratorWithSign <= reducedThat.numeratorWithSign);
  }

  isGreaterThanOrEqualTo(that) {
    if (Number.isSafeInteger(that)) that = new this.constructor(that, 1);
    let [ reducedThis, reducedThat ] = this.constructor.reduceToCommonDenominator(this, that);
    return (reducedThis.numeratorWithSign >= reducedThat.numeratorWithSign);
  }
}

Object.defineProperty(
  RationalNumber,
  'TypeError',
  {
    value: class RationalNumberTypeError extends Error {
      constructor(...args) {
        super(...args);
      }
    },
    writable: false,
  }
);

export default RationalNumber;