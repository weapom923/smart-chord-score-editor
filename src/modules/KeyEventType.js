const keyEventTypeEnum = {
  key: 'key',
  keyWithCtrl: 'key_with_ctrl',
  keyWithCtrlAndShift: 'key_with_ctrl_and_shift',
  keyWithAlt: 'key_with_alt',
  keyWithAltAndShift: 'key_with_alt_and_shift',
  keyWithShift: 'key_with_shift',
  repeatedKey: 'repeated_key',
  repeatedKeyWithCtrl: 'repeated_key_with_ctrl',
  repeatedKeyWithCtrlAndShift: 'repeated_key_with_ctrl_and_shift',
  repeatedKeyWithAlt: 'repeated_key_with_alt',
  repeatedKeyWithAltAndShift: 'repeated_key_with_alt_and_shift',
  repeatedKeyWithShift: 'repeated_key_with_shift',
};

function getKeyEventType(event) {
  if (event.repeat) {
    if (event.ctrlKey) {
      return (event.shiftKey)? keyEventTypeEnum.repeatedKeyWithCtrlAndShift : keyEventTypeEnum.repeatedKeyWithCtrl;
    } else if (event.altKey) {
      return (event.shiftKey)? keyEventTypeEnum.repeatedKeyWithAltAndShift : keyEventTypeEnum.repeatedKeyWithAlt;
    } else if (event.shiftKey) {
      return keyEventTypeEnum.repeatedKeyWithShift;
    } else {
      return keyEventTypeEnum.repeatedKey;
    }
  } else {
    if (event.ctrlKey) {
      return (event.shiftKey)? keyEventTypeEnum.keyWithCtrlAndShift : keyEventTypeEnum.keyWithCtrl;
    } else if (event.altKey) {
      return (event.shiftKey)? keyEventTypeEnum.keyWithAltAndShift : keyEventTypeEnum.keyWithAlt;
    } else if (event.shiftKey) {
      return keyEventTypeEnum.keyWithShift;
    } else {
      return keyEventTypeEnum.key;
    }
  }
}

export {
  keyEventTypeEnum,
  getKeyEventType,
};
