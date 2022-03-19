<template>
  <div id="part-in-bar">
    <note-base-component
      v-for="(note, noteIdx) in part.notes"
      v-bind:key="noteIdx"
      v-bind:offset-note-value="$_offsetNoteValues[noteIdx]"
      v-bind:note="note"
      v-bind:part-type="part.type"
      v-bind:rest-note-pitch="part.restNotePitch"
      v-bind:is-selected="$_isNoteSelected(noteIdx)"
      v-on:note-elements-update="$_onNoteElementsUpdate(noteIdx, $event)"
      v-on:select-note="$_onSelectNote(noteIdx)"
    />
  </div>
</template>

<style scoped>
#part-in-bar {
  display: flex;
  flex-direction: row;
}
</style>

<script>
import NoteBaseComponent from './NoteBaseComponent.vue'
import NoteValue from '../modules/NoteValue.js'
import PartInBar from '../modules/PartInBar.js'

export default {
  components: {
    NoteBaseComponent,
  },

  props: {
    part: { type: PartInBar },
    selectedNoteIdx: { type: Number, default: null },
  },

  data() {
    return {
      $_resizeObserver: null,
      $_noteElements: new Object(),
    };
  },

  computed: {
    $_offsetNoteValues() {
      let offsetNoteValues = new Array();
      let accumulatedNoteValue = new NoteValue(0);
      for (let note of this.part.notes) {
        offsetNoteValues.push(accumulatedNoteValue);
        accumulatedNoteValue = accumulatedNoteValue.add(note.value);
      }
      return offsetNoteValues;
    },
  },

  methods: {
    $_isNoteSelected(noteIdx) {
      if (this.selectedNoteIdx === null) return false;
      return this.selectedNoteIdx === noteIdx;
    },

    $_onNoteElementsUpdate(noteIdx, noteElements) {
      if (noteElements === null) {
        this.$delete(this.$data.$_noteElements, noteIdx);
      } else {
        this.$set(this.$data.$_noteElements, noteIdx, noteElements);
      }
      this.$emit('note-elements-update', this.$data.$_noteElements);
    },

    $_onSelectNote(noteIdx) {
      this.$emit('select-note', noteIdx);
    },
  },
}
</script>