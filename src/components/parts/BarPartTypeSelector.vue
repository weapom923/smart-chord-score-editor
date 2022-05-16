<template>
  <v-select
    label="Part Type"
    single-line dense hide-details
    v-model="$_partTypeName"
    v-bind:items="$_allPartTypeNames"
    v-bind:disabled="$_isPartEmpty"
    v-on:keydown.stop
  />
</template>

<script>
import PartInBar from '../../modules/PartInBar.js'
import Bar from '../../modules/Bar.js'

const partTypeNameToInstances = {
  'Normal': PartInBar.Type.normal,
  'Rhythm': PartInBar.Type.rhythm,
  'Chord': PartInBar.Type.chord,
};

export default {
  model: {
    prop: 'selectedPartIdx',
    event: 'change',
  },

  props: {
    bar: { type: Bar },
    selectedPartIdx: { type: Number, default: null },
  },

  computed: {
    $_isPartEmpty() {
      return (this.bar.parts.length === 0);
    },

    $_partTypes() {
      return this.bar.parts.map(part => part.type);
    },

    $_allPartTypeNames() {
      return Object.keys(partTypeNameToInstances).filter(
        partTypeName => this.$_partTypes.includes(partTypeNameToInstances[partTypeName]),
      );
    },

    $_partTypeName: {
      get() {
        if (this.$_isPartEmpty) return null;
        let selectedPartIdx = (this.selectedPartIdx === null)? 0 : this.selectedPartIdx;
        return this.$_allPartTypeNames.find(
          partTypeName => (this.$_partTypes[selectedPartIdx] === partTypeNameToInstances[partTypeName]),
        );
      },

      set(partTypeName) {
        this.$emit('change', this.$_allPartTypeNames.findIndex(partTypeName));
      },
    },
  },
}
</script>