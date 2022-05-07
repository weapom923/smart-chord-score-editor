<template>
  <v-select
    v-bind:value="$data.$_barBreakName"
    v-bind:items="$_allBarBreakNames"
    v-on:input="$_onInput"
    label="Bar Break"
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

  data() {
    let barBreakName = Object.keys(barBreakNameToInstances).find(
      barBreakName => (this.barBreak === barBreakNameToInstances[barBreakName])
    );
    return {
      $_barBreakName: barBreakName,
    };
  },

  computed: {
    $_allBarBreakNames() { return Object.keys(barBreakNameToInstances) },
  },

  methods: {
    $_onInput(selectedBarBreakName) {
      this.$emit('change', barBreakNameToInstances[selectedBarBreakName]);
    },
  },
}
</script>