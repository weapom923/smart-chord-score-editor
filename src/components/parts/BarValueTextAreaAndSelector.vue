<template>
  <div class="d-flex align-center">
    <v-text-field
      number
      type="number"
      label="Bar Value"
      v-model="$_barValueNumerator"
      v-bind="$attrs"
      v-bind:rules="$_rules"
      v-bind:min="$_barValueNumeratorMin"
      v-on:update:error="$_onUpdateError"
      v-on:keydown.stop
    />
    <div>/</div>
    <v-select
      v-model="$_barValueDenominator"
      v-bind:items="$_barValueDenominators"
      v-on:keydown.stop
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

  computed: {
    $_barValueNumeratorMin() { return barValueNumeratorMin },
    $_barValueDenominators() { return [ 4, 8, 16, 32 ] },

    $_barValueNumerator: {
      get() { return this.value.numerator },
      set(barValueNumerator) {
        this.$emit('update', new NoteValue(Number(barValueNumerator), this.$_barValueDenominator));
      },
    },

    $_barValueDenominator: {
      get() { return this.value.denominator },
      set(barValueDenominator) {
        this.$emit('update', new NoteValue(this.$_barValueNumerator, Number(barValueDenominator)));
      },
    },

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
    $_onUpdateError(event) {
      this.$emit('update:error', event);
    },
  },
}
</script>