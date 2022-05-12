<template>
  <v-select
    label="Clef Sign"
    v-model="$_clefTypeName"
    v-bind="$attrs"
    v-bind:items="$_clefTypeNames"
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

  computed: {
    $_clefTypeNames() { return Object.keys(clefTypeNameToInstances) },

    $_clefTypeName: {
      get() {
        return Object.keys(clefTypeNameToInstances).find(
          clefTypeName => (clefTypeNameToInstances[clefTypeName] === this.value),
        );
      },

      set(clefTypeName) {
        this.$emit('update', clefTypeNameToInstances[clefTypeName]);
      },
    },
  },
}
</script>