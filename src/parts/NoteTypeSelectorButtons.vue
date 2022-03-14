<template>
  <v-btn-toggle
    mandatory tile
    v-model="$data.$_selectedIdx"
    v-on:change="$_onChangeSelectedIdx"
  >
    <v-btn
      small
      v-for="(buttonTextAndNoteType, buttonTextAndNoteTypeIdx) in $_buttonTextAndNoteTypes"
      v-bind:key="buttonTextAndNoteTypeIdx"
    >
      {{ buttonTextAndNoteType.buttonText }}
    </v-btn>
  </v-btn-toggle>
</template>

<script>
import Note from '../modules/Note.js'

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

  watch: {
    noteType: {
      handler() { this.$_updateSelectedIdx() },
      immediate: true,
    },
  },

  props: {
    noteType: { type: String },
  },

  data() {
    return {
      $_selectedIdx: null,
    };
  },

  computed: {
    $_buttonTextAndNoteTypes() {
      return [
        new ButtonTextAndNoteType('Rest', Note.Type.rest),
        new ButtonTextAndNoteType('Note', Note.Type.normal),
      ];
    },
  },

  methods: {
    $_updateSelectedIdx() {
      this.$data.$_selectedIdx = this.$_buttonTextAndNoteTypes.findIndex(buttonTextAndNoteType => {
        return buttonTextAndNoteType.noteType === this.noteType;
      });
    },

    $_onChangeSelectedIdx(selectedIdx) {
      this.$emit('change', this.$_buttonTextAndNoteTypes[selectedIdx].noteType);
    },
  },
}
</script>