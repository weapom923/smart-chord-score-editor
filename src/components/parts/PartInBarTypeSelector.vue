<template>
  <v-select
    multiple
    label="Part Type"
    v-model="$_partInBarTypeNames"
    v-bind:items="$_allPartInBarTypeNames"
    v-bind:rules="$_rules"
    v-on:keydown.stop
  />
</template>

<script>
import PartInBar from '../..//modules/PartInBar.js';

const partInBarTypeNameToInstances = {
  // 'Normal': PartInBar.Type.normal,
  // 'Rhythm': PartInBar.Type.rhythm,
  'Chord': PartInBar.Type.chord,
};

export default {
  model: {
    prop: 'value',
    event: 'update',
  },

  props: {
    value: { type: Array },
  },

  computed: {
    $_allPartInBarTypeNames() { return Object.keys(partInBarTypeNameToInstances) },

    $_partInBarTypeNames: {
      get() {
        return this.value.map(
          partInBarType => Object.keys(partInBarTypeNameToInstances).find(
            partInBarTypeName => (partInBarType === partInBarTypeNameToInstances[partInBarTypeName])
          )
        );
      },

      set(partInBarTypeNames) {
        this.$emit('update', partInBarTypeNames.map(partInBarTypeName => partInBarTypeNameToInstances[partInBarTypeName]));
      },
    },

    $_rules() {
      return [
        partInBarTypeNameArray => {
          if (partInBarTypeNameArray.length === 0) {
            return 'At least 1 part type must be selected.';
          }
          return true;
        },
      ];
    },
  },
}
</script>