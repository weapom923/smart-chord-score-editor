export default {
  escapeRegex(string) {
    // return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return string.replace(new RegExp('[-/\\^$*+?.()|[]{}]', 'g'), '\\$&');
  },

  isString(value) {
    return (value instanceof String || typeof value === 'string');
  },

  divMod(divisor, dividend) {
    return [ divisor / dividend, divisor % dividend ];
  },

  max(...values) {
    let maxValue = values[0];
    for (let value of values) {
      if (maxValue < value) maxValue = value;
    }
    return maxValue;
  },

  calculateMinimumPowerOfTwoGreaterThanOrEqualTo(value) {
    if (value < 1) throw 'value less than 1 is not supported.';
    let powerOfTwo = 1;
    while (powerOfTwo < value) powerOfTwo *= 2;
    return powerOfTwo;
  },

  calculateMaximumPowerOfTwoLessThanOrEqualTo(value) {
    if (value < 1) throw 'value less than 1 is not supported.';
    let powerOfTwo = 1;
    while ((powerOfTwo * 2) <= value) powerOfTwo *= 2;
    return powerOfTwo;
  },
}