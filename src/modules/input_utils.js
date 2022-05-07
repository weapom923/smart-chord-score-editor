export default {
  anythingIsOk() {
    return true;
  },

  isTextFieldNotEmpty(value) {
    if ((typeof(value) === 'string') && (value.length === 0)) return 'Value must not be empty.';
    return true;
  },
};
