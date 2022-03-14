<template>
  <v-btn-toggle
    mandatory tile
    id="bar-line-end-selector-buttons"
    v-model="$data.$_selectedIdx"
    v-on:change="$_onChangeSelectedIdx"
  >
    <v-btn
      small
      v-for="(buttonTextAndBarLineEnd, buttonTextAndBarLineEndIdx) in $_buttonTextAndBarLineEndArray"
      v-bind:key="buttonTextAndBarLineEndIdx"
    >
      {{ buttonTextAndBarLineEnd.buttonText }}
    </v-btn>
  </v-btn-toggle>
</template>

<style scoped>
#bar-line-end-selector-buttons {
  display: flex;
  flex-direction: column;
}
</style>

<script>
import BarLine from '../modules/BarLine.js'

class ButtonTextAndBarLineEnd {
  constructor(buttonText, barLineEnd) {
    this.buttonText = buttonText;
    this.barLineEnd = barLineEnd;
  }
}

export default {
  model: {
    prop: 'barLineEnd',
    event: 'change',
  },

  watch: {
    barLineEnd: {
      handler() { this.$_updateSelectedIdx() },
      deep: true,
      immediate: true,
    },
  },

  props: {
    barLineEnd: { type: BarLine },
  },

  data() {
    return {
      $_selectedIdx: null,
    };
  },

  computed: {
    $_buttonTextAndBarLineEndArray() {
      return [
        new ButtonTextAndBarLineEnd('Single', BarLine.End.single),
        new ButtonTextAndBarLineEnd('Double', BarLine.End.double),
        new ButtonTextAndBarLineEnd('Repeat', BarLine.End.repeatEnd),
      ];
    },
  },

  methods: {
    $_updateSelectedIdx() {
      this.$data.$_selectedIdx = this.$_buttonTextAndBarLineEndArray.findIndex(buttonTextAndBarLineEnd => {
        return buttonTextAndBarLineEnd.barLineEnd == this.barLineEnd;
      });
    },

    $_onChangeSelectedIdx(selectedIdx) {
      this.$emit('change', this.$_buttonTextAndBarLineEndArray[selectedIdx].barLineEnd);
    },
  },
}
</script>