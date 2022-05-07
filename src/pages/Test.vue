<template>
  <div id="test-container">
    <note-base-component
      v-bind:offsetNoteValue="$_offsetNoteValue"
      v-bind:note="$_note"
      v-bind:partType="$_partType"
    />
  </div>
</template>

<style scoped>
#test-container {
  display: flex;
  width: 100%;
  padding-top: 50px;
}
</style>

<script>
import NoteBaseComponent from '../components/NoteBaseComponent.vue'
import PartInBar from '../modules/PartInBar.js'
import Note from '../modules/Note.js'
import NoteValue from '../modules/NoteValue.js'
export default {
  components: {
    NoteBaseComponent,
  },

  computed: {
    $_offsetNoteValue() {
      return new NoteValue(0);
    },

    $_partType() {
      return PartInBar.Type.chord;
    },

    $_note() {
      return new Note(null, NoteValue.divisible.quarter, Note.Type.rest, false);
    },
  },
}
</script>