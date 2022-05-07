<template>
  <v-select
    v-model="$data.$_gridNoteValueName"
    v-bind="$attrs"
    v-bind:items="$_gridNoteValueNames"
    v-on:input="$_onInput"
    label="Grid Note Value"
  />
</template>

<script>
import NoteValue from '../../modules/NoteValue.js';

const gridNoteValueNameToInstances = {
  'Whole': NoteValue.divisible.whole,
  'Half': NoteValue.divisible.half,
  'Quarter': NoteValue.divisible.quarter,
};

export default {
  model: {
    prop: 'value',
    event: 'update',
  },

  props: {
    value: { type: NoteValue },
  },

  data() {
    let gridNoteValueName = Object.keys(gridNoteValueNameToInstances)
      .find(gritNoteValueName => {
        let gridNoteValue = gridNoteValueNameToInstances[gritNoteValueName];
        return (this.$store.state.config.gridNoteValue === gridNoteValue);
      });
    return {
      $_gridNoteValueName: gridNoteValueName,
    };
  },

  computed: {
    $_gridNoteValueNames() {
      return Object.keys(gridNoteValueNameToInstances);
    },
  },

  methods: {
    $_onInput(gridNoteValueName) {
      this.$emit('update', gridNoteValueNameToInstances[gridNoteValueName]);
    },
  },
}
</script>