<template>
  <v-select
    multiple
    v-model="$_barRepeatEndingNumbers"
    v-bind:items="$_allBarRepeatEndingNumbers"
    label="Bar Repeat Ending"
  />
</template>

<script>
import BarRepeatEnding from '../../modules/BarRepeatEnding.js'

const barRepeatEndingNumberMax = 5;

export default {
  model: {
    prop: 'barRepeatEnding',
    event: 'change',
  },

  props: {
    barRepeatEnding: { type: BarRepeatEnding },
  },

  computed: {
    $_allBarRepeatEndingNumbers() {
      return [ ...Array(barRepeatEndingNumberMax).keys() ].map(idx => idx + 1);
    },

    $_barRepeatEndingNumbers: {
      get() {
        return Array.from(this.barRepeatEnding.numbers);
      },

      set(barRepeatEndingNumbers) {
        this.$emit('change', new BarRepeatEnding(new Set(barRepeatEndingNumbers)));
      },
    }
  },
}
</script>