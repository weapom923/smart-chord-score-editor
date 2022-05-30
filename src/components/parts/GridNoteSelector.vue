<template>
  <v-select
    label="Grid Note Value"
    v-model="$_gridNoteValueName"
    v-bind="$attrs"
    v-bind:items="$_gridNoteValueNames"
    v-on:keydown.stop
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

  computed: {
    $_gridNoteValueNames() {
      return Object.keys(gridNoteValueNameToInstances);
    },

    $_gridNoteValueName: {
      get() {
        return Object.keys(gridNoteValueNameToInstances).find(gritNoteValueName => {
          return (this.value.isEqualTo(gridNoteValueNameToInstances[gritNoteValueName]));
        });
      },

      set(gridNoteValueName) {
        this.$emit('update', gridNoteValueNameToInstances[gridNoteValueName]);
      },
    },
  },
}
</script>