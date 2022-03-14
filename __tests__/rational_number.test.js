import RationalNumber from '../src/modules/RationalNumber.js'

test('split into divisible note values 1', () => {
  expect(
    new RationalNumber(5, 3).modulo(new RationalNumber(2, 3))
  ).toStrictEqual(
    new RationalNumber(1, 3)
  );
});

test('construct negative number', () => {
  expect(new RationalNumber(-1, 3).isNegative).toBeTruthy();
});

test('multiply 1', () => {
  expect(new RationalNumber(-1, 3).multiply(-1)).toStrictEqual(new RationalNumber(1, 3));
});

test('multiply 2', () => {
  expect(new RationalNumber(1, 3).multiply(-1)).toStrictEqual(new RationalNumber(-1, 3));
});

test('reduce to common denominator', () => {
  expect(
    RationalNumber.reduceToCommonDenominator(
      new RationalNumber(3, 1),
      new RationalNumber(2, 3),
    )
  ).toStrictEqual([
    new RationalNumber(9, 3),
    new RationalNumber(2, 3),
  ]);
});