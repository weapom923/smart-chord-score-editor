<template>
  <v-select
    multiple
    v-bind:value="$data.$_partInBarTypeNameArray"
    v-bind:items="$_allPartInBarTypeNames"
    v-bind:rules="$_rules"
    v-on:input="$_onInput"
    label="Part Type"
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

  data() {
    let partInBarTypeNameArray = this.value.map(
      partInBarType => {
        return Object.keys(partInBarTypeNameToInstances).find(
          partInBarTypeName => (partInBarType === partInBarTypeNameToInstances[partInBarTypeName])
        )
      },
    );
    return {
      $_partInBarTypeNameArray: partInBarTypeNameArray,
    };
  },

  computed: {
    $_allPartInBarTypeNames() { return Object.keys(partInBarTypeNameToInstances) },
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

  methods: {
    $_onInput(partInBarTypeNames) {
      this.$emit('update', partInBarTypeNames.map(partInBarTypeName => partInBarTypeNameToInstances[partInBarTypeName]));
    },
  },
}
</script>