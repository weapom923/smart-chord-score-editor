<template>
  <v-btn-toggle
    mandatory tile
    v-model="$_selectedIdx"
  >
    <v-btn
      small
      v-for="(buttonTextAndNoteValue, buttonTextAndNoteValueIdx) in $_buttonTextAndNoteValues"
      v-bind:key="buttonTextAndNoteValueIdx"
      v-bind:disabled="!buttonTextAndNoteValue.isSafe"
    >
      {{ buttonTextAndNoteValue.buttonText }}
    </v-btn>
  </v-btn-toggle>
</template>

<script>
import NoteValue from '../../modules/NoteValue.js'

class ButtonTextAndNoteValue {
  constructor(buttonText, unitValue, safeUnitValue) {
    this.buttonText = buttonText;
    this.unitValue = unitValue;
    this.isSafe = (unitValue.isLessThanOrEqualTo(safeUnitValue))
  }
}

export default {
  model: {
    prop: 'unitValue',
    event: 'change',
  },

  props: {
    unitValue: { type: NoteValue, default: () => NoteValue.divisible.eighth },
    safeUnitValue: { type: NoteValue, default: () => NoteValue.divisible.eighth },
  },

  computed: {
    $_buttonTextAndNoteValues() {
      return [
        new ButtonTextAndNoteValue('1', NoteValue.divisible.whole, this.safeUnitValue),
        new ButtonTextAndNoteValue('2', NoteValue.divisible.half, this.safeUnitValue),
        new ButtonTextAndNoteValue('4', NoteValue.divisible.quarter, this.safeUnitValue),
        new ButtonTextAndNoteValue('8', NoteValue.divisible.eighth, this.safeUnitValue),
        new ButtonTextAndNoteValue('16', NoteValue.divisible.sixteenth, this.safeUnitValue),
        new ButtonTextAndNoteValue('32', NoteValue.divisible.thirtySecond, this.safeUnitValue),
        new ButtonTextAndNoteValue('64', NoteValue.divisible.sixtyFourth, this.safeUnitValue),
      ];
    },

    $_selectedIdx: {
      get() {
        return this.$_buttonTextAndNoteValues.findIndex(
          buttonTextAndNoteValue => buttonTextAndNoteValue.unitValue.isEqualTo(this.unitValue)
        );
      },

      set(selectedIdx) {
        this.$emit('change', this.$_buttonTextAndNoteValues[selectedIdx].unitValue);
      },
    },
  },
}
</script>