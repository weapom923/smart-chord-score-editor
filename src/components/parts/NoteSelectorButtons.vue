<template>
  <v-btn-toggle
    mandatory tile
    v-model="$_noteIdx"
  >
    <v-btn
      small
      v-for="(note, noteIdx) in notes"
      v-bind:key="noteIdx"
    >
      <template
        v-if="$_isPartTypeChord"
      >
        <chord-component
          v-if="note.pitchOrChord"
          v-bind:chord="note.pitchOrChord"
          v-bind:font-size-px="12"
        />
        <template v-else>(Rest)</template>
      </template>
    </v-btn>
  </v-btn-toggle>
</template>

<script>
import PartInBar from '../../modules/PartInBar.js'
import ChordComponent from '../../components/ChordComponent.vue';

export default {
  components: {
    ChordComponent,
  },

  model: {
    prop: 'noteIdx',
    event: 'change',
  },

  props: {
    noteIdx: { type: Number },
    partType: { type: String },
    notes: { type: Array },
  },

  computed: {
    $_isPartTypeChord() {
      return (this.partType === PartInBar.Type.chord);
    },

    $_noteIdx: {
      get() { return this.noteIdx },
      set(noteIdx) { this.$emit('change', noteIdx) },
    },
  },
}
</script>