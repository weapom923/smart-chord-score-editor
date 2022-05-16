<template>
  <div
    id="tension-note" v-bind="$attrs"
    v-bind:style="$_tensionNoteStyle"
  >
    <div
      id="tension-note-sharp-or-flat-text"
      v-if="$_tensionNoteFlatOrSharpText"
      v-bind:style="$_tensionNoteSharpOrFlatStyle"
    >
      {{ $_tensionNoteFlatOrSharpText }}
    </div>
    <div id="tension-note-text">{{ $_tensionNoteText }}</div>
  </div>
</template>

<style scoped>
#tension-note {
  display: inline-block;
  width: fit-content;
  height: fit-content;
  line-height: 10px;
}

#tension-note-text {
  display: inline-block;
  font-size: 10px;
}

#tension-note-sharp-or-flat-text {
  display: inline-block;
  font-size: 8px;
}
</style>

<script>
import TensionNotePitch from '../modules/TensionNotePitch.js';

export default {
  props: {
    tensionNote: { type: TensionNotePitch, default: null },
    baseFontSizePx: { type: Number, default: 18 },
  },

  computed: {
    $_tensionNoteText() {
      if (this.tensionNote === null) return '';
      return this.tensionNote.symbolText;
    },

    $_tensionNoteFlatOrSharpText() {
      if (this.tensionNote === null) return null;
      return this.tensionNote.flatOrSharpText;
    },

    $_tensionNoteStyle() {
      return {
        fontSize: String(this.baseFontSizePx * 0.5) + 'px',
        lineHeight: String(this.baseFontSizePx * 0.5) + 'px',
      };
    },

    $_tensionNoteSharpOrFlatStyle() {
      return {
        fontSize: String(Math.floor(this.baseFontSizePx * 0.4)) + 'px',
      };
    },
  },
};
</script>

