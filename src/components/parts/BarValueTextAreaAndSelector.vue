<template>
  <div class="d-flex align-center">
    <v-text-field
      number
      type="number"
      v-model="$data.$_barValueNumerator"
      v-bind="$attrs"
      v-bind:rules="$_rules"
      v-bind:min="$_barValueNumeratorMin"
      v-on:input="$_onInputBarValueNumerator"
      v-on:update:error="$_onUpdateError"
      label="Bar Value"
    />
    <div>/</div>
    <v-select
      v-model="$data.$_barValueDenominator"
      v-bind:items="$_barValueDenominators"
      v-on:input="$_onInputBarValueDenominator"
    />
  </div>
</template>

<script>
import NoteValue from '../../modules/NoteValue.js';
import input_utils from '../../modules/input_utils.js';

const barValueNumeratorMin = 1;

export default {
  model: {
    prop: 'value',
    event: 'update',
  },

  props: {
    value: { type: NoteValue },
  },

  data() {
    return {
      $_barValueNumerator: this.value.numerator,
      $_barValueDenominator: this.value.denominator,
    };
  },

  computed: {
    $_barValueNumeratorMin() { return barValueNumeratorMin },
    $_barValueDenominators() { return [ 4, 8, 16, 32 ] },
    $_rules() {
      return [
        input_utils.isTextFieldNotEmpty,
        barValueNumerator => {
          if (barValueNumerator < barValueNumeratorMin) {
            return 'Bar value numerator must be more than or equal to ' + String(barValueNumeratorMin) + '.';
          }
          return true;
        },
      ];
    },
  },

  methods: {
    $_onInputBarValueNumerator(barValueNumerator) {
      let barValue = new NoteValue(Number(barValueNumerator), this.$data.$_barValueDenominator);
      this.$emit('update', barValue);
    },
    $_onInputBarValueDenominator(barValueDenominator) {
      let barValue = new NoteValue(this.$data.$_barValueNumerator, Number(barValueDenominator));
      this.$emit('update', barValue);
    },
    $_onUpdateError(event) {
      this.$emit('update:error', event);
    },
  },
}
</script>