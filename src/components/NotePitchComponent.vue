<template>
  <div id="note" v-bind="$attrs">
    <div
      id="note-text"
      v-bind:style="$_noteTextStyle"
    >
      {{ $_noteText }}
    </div>
    <div
      id="note-sharp-or-flat-text"
      v-if="$_noteFlatOrSharpText"
      v-bind:style="$_noteFlatOrSharpTextStyle"
    >
      {{ $_noteFlatOrSharpText }}
    </div>
  </div>
</template>

<style scoped>
#note {
  display: flex;
  align-items: flex-end;
  position: relative;
}

#note-text {
  position: relative;
  display: inline-block;
}

#note-sharp-or-flat-text {
  position: relative;
  display: inline-block;
  margin-right: -5px;
}
</style>

<script>
import NotePitch from '../modules/NotePitch.js';
import NotePitchSymbol from '../modules/NotePitchSymbol.js'

function getNoteSymbolText(note) {
  switch (note.symbol) {
    case NotePitchSymbol.a: return 'A';
    case NotePitchSymbol.b: return 'B';
    case NotePitchSymbol.c: return 'C';
    case NotePitchSymbol.d: return 'D';
    case NotePitchSymbol.e: return 'E';
    case NotePitchSymbol.f: return 'F';
    case NotePitchSymbol.g: return 'G';
    default:                return null;
  }
}

function getNoteFlatOrSharpText(note) {
  if (note.isSharp) return '♯';
  if (note.isFlat) return '♭';
  return null;
}

export default {
  props: {
    note: { type: NotePitch, default: null },
    baseFontSizePx: { type: Number, default: 18 },
  },

  computed: {
    $_noteText() {
      if (this.note === null) return '';
      return getNoteSymbolText(this.note);
    },

    $_noteFlatOrSharpText() {
      if (this.note === null) return null;
      return getNoteFlatOrSharpText(this.note);
    },

    $_noteTextStyle() {
      return {
        fontSize: String(this.baseFontSizePx) + 'px',
        lineHeight: String(this.baseFontSizePx) + 'px',
      };
    },

    $_noteFlatOrSharpTextStyle() {
      return {
        fontSize: String(Math.floor(this.baseFontSizePx * 0.6)) + 'px',
        lineHeight: String(Math.floor(this.baseFontSizePx * 0.6)) + 'px',
        top: String(-this.baseFontSizePx * 0.5) + 'px',
      };
    },
  },
};
</script>

