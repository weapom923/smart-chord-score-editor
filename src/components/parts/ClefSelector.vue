<template>
  <v-select
    v-model="$data.$_clefTypeName"
    v-bind="$attrs"
    v-bind:items="$_clefTypeNames"
    v-on:input="$_onInput"
    label="Clef Sign"
  />
</template>

<script>
import Clef from '../../modules/Clef.js';

const clefTypeNameToInstances = {
  treble: Clef.treble,
  bass:   Clef.bass,
};

export default {
  model: {
    prop: 'value',
    event: 'update',
  },

  props: {
    value: { type: Clef },
  },

  data() {
      let clefTypeName = Object.keys(clefTypeNameToInstances).find(
        clefTypeName => (clefTypeNameToInstances[clefTypeName] === this.value),
      );
    return {
      $_clefTypeName: clefTypeName,
    };
  },

  computed: {
    $_clefTypeNames() { return Object.keys(clefTypeNameToInstances) },
  },

  methods: {
    $_onInput(clefTypeName) {
      this.$emit('update', clefTypeNameToInstances[clefTypeName]);
    },
  },
}
</script>