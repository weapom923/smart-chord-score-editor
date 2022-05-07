const keyEventTypeEnum = {
  key: 'key',
  keyWithCtrl: 'key_with_ctrl',
  keyWithShift: 'key_with_shift',
  keyWithCtrlAndShift: 'key_with_ctrl_and_shift',
  repeatedKey: 'repeated_key',
  repeatedKeyWithCtrl: 'repeated_key_with_ctrl',
  repeatedKeyWithShift: 'repeated_key_with_shift',
  repeatedKeyWithCtrlAndShift: 'repeated_key_with_ctrl_and_shift',
};

function getKeyEventType(event) {
  if (event.repeat) {
    if (event.ctrlKey) {
      return (event.shiftKey)? keyEventTypeEnum.repeatedKeyWithCtrlAndShift : keyEventTypeEnum.repeatedKeyWithCtrl;
    } else {
      return (event.shiftKey)? keyEventTypeEnum.repeatedKeyWithShift : keyEventTypeEnum.repeatedKey;
    }
  } else {
    if (event.ctrlKey) {
      return (event.shiftKey)? keyEventTypeEnum.keyWithCtrlAndShift : keyEventTypeEnum.keyWithCtrl;
    } else {
      return (event.shiftKey)? keyEventTypeEnum.keyWithShift : keyEventTypeEnum.key;
    }
  }
}

export {
  keyEventTypeEnum,
  getKeyEventType,
};
