<template>
  <v-btn-toggle
    mandatory tile
    id="bar-line-start-selector-buttons"
    v-model="$data.$_selectedIdx"
    v-on:change="$_onChangeSelectedIdx"
  >
    <v-btn
      small
      v-for="(buttonTextAndBarLineStart, buttonTextAndBarLineStartIdx) in $_buttonTextAndBarLineStartArray"
      v-bind:key="buttonTextAndBarLineStartIdx"
    >
      {{ buttonTextAndBarLineStart.buttonText }}
    </v-btn>
  </v-btn-toggle>
</template>

<style scoped>
#bar-line-start-selector-buttons {
  display: flex;
  flex-direction: column;
}
</style>

<script>
import BarLine from '@/modules/BarLine.js'

class ButtonTextAndBarLineStart {
  constructor(buttonText, barLineStart) {
    this.buttonText = buttonText;
    this.barLineStart = barLineStart;
  }
}

export default {
  model: {
    prop: 'barLineStart',
    event: 'change',
  },

  watch: {
    barLineStart: {
      handler() { this.$_updateSelectedIdx() },
      deep: true,
      immediate: true,
    },
  },

  props: {
    barLineStart: { type: BarLine },
  },

  data() {
    return {
      $_selectedIdx: null,
    };
  },

  computed: {
    $_buttonTextAndBarLineStartArray() {
      return [
        new ButtonTextAndBarLineStart('Empty', BarLine.Start.empty),
        new ButtonTextAndBarLineStart('Repeat', BarLine.Start.repeatStart),
      ];
    },
  },

  methods: {
    $_updateSelectedIdx() {
      this.$data.$_selectedIdx = this.$_buttonTextAndBarLineStartArray.findIndex(buttonTextAndBarLineStart => {
        return buttonTextAndBarLineStart.barLineStart == this.barLineStart;
      });
    },

    $_onChangeSelectedIdx(selectedIdx) {
      this.$emit('change', this.$_buttonTextAndBarLineStartArray[selectedIdx].barLineStart);
    },
  },
}
</script>