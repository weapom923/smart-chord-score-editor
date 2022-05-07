<template>
  <v-select
    v-bind:value="$data.$_barLineStartName"
    v-bind:items="$_allBarLineStartNames"
    v-on:input="$_onInput"
    label="Bar Line Start"
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

  data() {
    let barLineStartName = Object.keys(barLineStartNameToInstances).find(
      barLineStartName => (this.barLineStart === barLineStartNameToInstances[barLineStartName])
    );
    return {
      $_barLineStartName: barLineStartName,
    };
  },

  computed: {
    $_allBarLineStartNames() { return Object.keys(barLineStartNameToInstances) },
  },

  methods: {
    $_onInput(selectedBarLineStartName) {
      this.$emit('change', barLineStartNameToInstances[selectedBarLineStartName]);
    },
  },
}
</script>