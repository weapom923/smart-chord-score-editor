<template>
  <div
    id="bar-repeat-ending"
    class="pa-1"
    v-bind:style="$_barRepeatEndingNumberStyle"
  >
    <span
      v-for="barRepeatNumber of $_barRepeatEndingNumbers"
      v-bind:key="barRepeatNumber"
    >
      {{ barRepeatNumber }}.
    </span>
  </div>
</template>

<style scoped>
#bar-repeat-ending span:not(:last-child) {
  margin-right: 5px;
}
</style>

<script>
import BarRepeatEnding from '../modules/BarRepeatEnding.js';

export default {
  props: {
    barRepeatEnding: { type: BarRepeatEnding },
  },

  computed: {
    $_barRepeatEndingNumbers() {
      return Array.from(this.barRepeatEnding.numbers).sort((a, b) => (a - b));
    },

    $_barRepeatEndingNumberStyle() {
      return {
        fontSize: String(this.$store.state.config.chordFontSizePx * 0.7) + 'px',
        lineHeight: String(this.$store.state.config.chordFontSizePx * 0.7) + 'px',
      };
    },
  },

  mounted() {
    this.$emit('update-bar-repeat-ending', this.$el);
  },

  destroyed() {
    this.$emit('update-bar-repeat-ending', null);
  },
}
</script>