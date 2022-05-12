<template>
  <v-select
    label="Bar Line Start"
    v-model="$_barLineStartName"
    v-bind:items="$_allBarLineStartNames"
  />
</template>

<script>
import BarLine from '../../modules/BarLine.js'

const barLineStartNameToInstances = {
  'Empty': BarLine.Start.empty,
  'Repeat': BarLine.Start.repeatStart,
};

export default {
  model: {
    prop: 'barLineStart',
    event: 'change',
  },

  props: {
    barLineStart: { type: BarLine },
  },

  computed: {
    $_allBarLineStartNames() { return Object.keys(barLineStartNameToInstances) },

    $_barLineStartName: {
      get() {
        return Object.keys(barLineStartNameToInstances).find(
          barLineStartName => (this.barLineStart === barLineStartNameToInstances[barLineStartName])
        );
      },

      set(selectedBarLineStartName) {
        this.$emit('change', barLineStartNameToInstances[selectedBarLineStartName]);
      },
    },
  },
}
</script>