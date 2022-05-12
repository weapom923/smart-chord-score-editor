<template>
  <v-select
    label="Bar Break"
    v-model="$_barBreakName"
    v-bind:items="$_allBarBreakNames"
  />
</template>

<script>
import BarBreak from '../../modules/BarBreak.js'

const barBreakNameToInstances = {
  'Empty': BarBreak.empty,
  'System Break': BarBreak.system,
  'Page Break': BarBreak.page,
};

export default {
  model: {
    prop: 'barBreak',
    event: 'change',
  },

  props: {
    barBreak: { type: BarBreak },
  },

  computed: {
    $_allBarBreakNames() { return Object.keys(barBreakNameToInstances) },

    $_barBreakName: {
      get() {
        return Object.keys(barBreakNameToInstances).find(
          barBreakName => (this.barBreak.isEqualTo(barBreakNameToInstances[barBreakName]))
        );
      },
      set(barBreakName) {
        this.$emit('change', barBreakNameToInstances[barBreakName]);
      },
    },
  },
}
</script>