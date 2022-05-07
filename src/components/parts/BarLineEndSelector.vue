<template>
  <v-select
    v-bind:value="$data.$_barLineEndName"
    v-bind:items="$_allBarLineEndNames"
    v-on:input="$_onInput"
    label="Bar Line End"
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

  data() {
    let barLineEndName = Object.keys(barLineEndNameToInstances).find(
      barLineEndName => (this.barLineEnd === barLineEndNameToInstances[barLineEndName])
    );
    return {
      $_barLineEndName: barLineEndName,
    };
  },

  computed: {
    $_allBarLineEndNames() { return Object.keys(barLineEndNameToInstances) },
  },

  methods: {
    $_onInput(selectedBarLineEndName) {
      this.$emit('change', barLineEndNameToInstances[selectedBarLineEndName]);
    },
  },
}
</script>