import Encoding from 'encoding-japanese';

export default {
  escapeRegex(string) {
    // return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return string.replace(new RegExp('[-/\\^$*+?.()|[]{}]', 'g'), '\\$&');
  },

  isNullOrUndefined(value) {
    return ((value === null) || (value === undefined));
  },

  isString(value) {
    return (value instanceof String || typeof value === 'string');
  },

  divMod(divisor, dividend) {
    return [ divisor / dividend, divisor % dividend ];
  },

  min(...values) {
    let minValue = values[0];
    for (let value of values) {
      if (minValue > value) minValue = value;
    }
    return minValue;
  },

  max(...values) {
    let maxValue = values[0];
    for (let value of values) {
      if (maxValue < value) maxValue = value;
    }
    return maxValue;
  },

  clamp(x, min, max) {
    x = (x > max)? max : x;
    x = (x < min)? min : x;
    return x;
  },

  isInRect(rect, x, y) {
    if (rect.x > x) {
      return false;
    }
    if (rect.y > y) {
      return false;
    }
    if ((rect.x + rect.width) < x) {
      return false;
    }
    if ((rect.y + rect.height) < y) {
      return false;
    }
    return true;
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

  async getFileInterface(accept = null) {
    return new Promise(resolve => {
      let inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.onchange = (event) => { resolve(event.target.files[0]) };
      if (accept) inputElement.accept = accept;
      let windowFocusEventHandler = () => {
        let timeoutId = window.setTimeout(
          () => {
            window.removeEventListener('focus', windowFocusEventHandler);
            window.clearTimeout(timeoutId);
            resolve(null);
          },
          10000,
        );
      };
      window.addEventListener('focus', windowFocusEventHandler);
      inputElement.click();
    })
  },

  async loadFileAsUint8Array(fileInterface) {
    let arrayBuffer = await new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = (event) => { resolve(event.target.result) };
      fileReader.onabort = () => { reject(null) };
      fileReader.readAsArrayBuffer(fileInterface);
    })
    if (arrayBuffer === null) return null;
    return new Uint8Array(arrayBuffer);
  },

  async loadFileAsUTF8Text(fileInterface) {
    let textUtf8Array = await this.loadFileAsUint8Array(fileInterface);
    let textEncoding = Encoding.detect(textUtf8Array);
    let textUint8Array = new Uint8Array(Encoding.convert(textUtf8Array, 'UTF8', textEncoding));
    let textDecoder = new TextDecoder();
    return textDecoder.decode(textUint8Array.buffer);
  },
}