<template>
  <v-btn-toggle
    mandatory tile
    v-model="$_selectedIdx"
  >
    <v-btn
      small
      v-for="(buttonTextAndNoteType, buttonTextAndNoteTypeIdx) in $_buttonTextAndNoteTypes"
      v-bind:key="buttonTextAndNoteTypeIdx"
      v-on:keydown.stop
    >
      {{ buttonTextAndNoteType.buttonText }}
    </v-btn>
  </v-btn-toggle>
</template>

<script>
import Note from '../../modules/Note.js';

class ButtonTextAndNoteType {
  constructor(buttonText, noteType) {
    this.buttonText = buttonText;
    this.noteType = noteType;
  }
}

export default {
  model: {
    prop: 'noteType',
    event: 'change',
  },

  props: {
    noteType: { type: String },
  },

  computed: {
    $_buttonTextAndNoteTypes() {
      return [
        new ButtonTextAndNoteType('Rest', Note.Type.rest),
        new ButtonTextAndNoteType('Note', Note.Type.normal),
      ];
    },

    $_selectedIdx: {
      get() {
        return this.$_buttonTextAndNoteTypes.findIndex(
          buttonTextAndNoteType => { return buttonTextAndNoteType.noteType === this.noteType },
        );
      },

      set(selectedIdx) {
        this.$emit('change', this.$_buttonTextAndNoteTypes[selectedIdx].noteType);
      },
    },
  },
}
</script>