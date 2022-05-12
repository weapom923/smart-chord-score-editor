<template>
  <v-select
    label="Bar Line End"
    v-model="$_barLineEndName"
    v-bind:items="$_allBarLineEndNames"
    v-on:keydown.stop
  />
</template>

<script>
import BarLine from '../../modules/BarLine.js'

const barLineEndNameToInstances = {
  'Single': BarLine.End.single,
  'Double': BarLine.End.double,
  'Repeat': BarLine.End.repeatEnd,
  'Great Double': BarLine.End.greatDouble,
};

export default {
  model: {
    prop: 'barLineEnd',
    event: 'change',
  },

  props: {
    barLineEnd: { type: BarLine },
  },

  computed: {
    $_allBarLineEndNames() { return Object.keys(barLineEndNameToInstances) },

    $_barLineEndName: {
      get() {
        return Object.keys(barLineEndNameToInstances).find(
          barLineEndName => (this.barLineEnd.isEqualTo(barLineEndNameToInstances[barLineEndName]))
        );
      },

      set(barLineEndName) {
        this.$emit('change', barLineEndNameToInstances[barLineEndName]);
      },
    },
  },
}
</script>