<template>
  <div
    id="chord-container"
    v-on:click="$emit('click')"
  >
    <div id="chord">
      <note-pitch-component
        v-bind:note="$_rootNote"
        v-bind:base-font-size-px="$_fontSizePx"
      />
      <div
        class="chord-text"
        v-if="$_basicChordText"
        v-bind:style="$_chordTextStyle"
      >
        {{ $_basicChordText }}
      </div>
      <div id="additionals" v-if="$_sortedTensionNotes || $_additionalChordText">
        <div v-if="$_sortedTensionNotes" id="tensions-container">
          (
          <div id="tensions">
            <tension-note-pitch-component
              v-for="(tensionNote, tensionNoteIdx) in $_sortedTensionNotes"
              v-bind:key="tensionNoteIdx"
              v-bind:tension-note="tensionNote"
              v-bind:base-font-size-px="$_fontSizePx"
            />
          </div>
          )
        </div>
        <div
          class="chord-text"
          v-if="$_additionalChordText"
          v-bind:style="$_chordTextStyle"
        >
          {{ $_additionalChordText }}
        </div>
      </div>
    </div>
    <hr id="bass-separator" v-if="$_isOnChord" />
    <div id="bass-text-container" v-if="$_isOnChord">
      <note-pitch-component
        v-bind:note="$_bassNote"
        v-bind:base-font-size-px="$_fontSizePx"
      />
    </div>
  </div>
</template>

<style scoped>
#chord-container {
  overflow-y: visible;
  display: flex;
  width: fit-content;
  flex-flow: column;
  align-items: center;
  justify-content: flex-end;
}

#chord-container > * {
  text-transform: none;
}

#chord {
  display: flex;
  flex-flow: row;
  align-items: flex-end;
}

#additionals {
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
}

#tensions-container {
  display: flex;
  flex-flow: row;
  align-items: center;
}

#tensions {
  display: flex;
  flex-flow: column-reverse;
  align-items: center;
}

.chord-text {
  position: relative;
  margin-left: 2px;
}

#bass-separator {
  border-color: black;
  border-style: solid;
  border-width: 1px 0 0;
  width: 100%;
  margin: 2px 0;
}

#bass-text-container {
  position: relative;
}
</style>

<script>
import Chord from '../modules/Chord.js';
import TensionNotePitch from '../modules/TensionNotePitch.js';
import NotePitchComponent from './NotePitchComponent.vue'
import TensionNotePitchComponent from './TensionNotePitchComponent.vue'

function isHalfDiminished7th(chord) {
  return (chord.triad === Chord.Triad.diminished) && (chord.sixthOrSeventh === Chord.SixthOrSeventh.dominantSeventh);
}
function isDiminished7th(chord) {
  return (chord.triad === Chord.Triad.diminished) && (chord.sixthOrSeventh === Chord.SixthOrSeventh.diminishedSeventh);
}

export default {
  components: {
    NotePitchComponent,
    TensionNotePitchComponent,
  },

  watch: {
    chord: {
      handler() {
        this.$emit('note-element-update', this.$el);
      },
      deep: true,
    },
  },

  props: {
    chord: { type: Chord, default: null },
    fontSizePx: { type: Number, default: null }
  },

  data() {
    return {
      $_resizeObverber: null,
    };
  },

  mounted() {
    this.$data.$_resizeObverber = new ResizeObserver(() => {
      this.$emit('note-element-update', this.$el);
    });
    this.$data.$_resizeObverber.observe(this.$el);
    this.$emit('note-element-update', this.$el);
  },

  destroyed() {
    this.$data.$_resizeObverber.unobserve(this.$el);
    this.$data.$_resizeObverber.disconnect();
    this.$emit('note-element-update', null);
  },

  computed: {
    $_isOnChord() {
      return (this.$_bassNote !== null);
    },

    $_rootNote() {
      if (this.chord === null) return null;
      return this.chord.root;
    },

    $_bassNote() {
      if (this.chord === null) return null;
      return this.chord.bass;
    },

    $_basicChordText() {
      if (this.chord !== null) {
        if (isHalfDiminished7th(this.chord)) {
          return 'm7';
        }
        if (isDiminished7th(this.chord)) {
          return 'dim7';
        }
        let basicChordText = '';
        switch (this.chord.triad) {
          case Chord.Triad.minor:
            basicChordText = 'm';
            break;
          case Chord.Triad.diminished:
            basicChordText = 'dim';
            break;
          case Chord.Triad.augumented:
            basicChordText = 'aug';
            break;
        }
        switch (this.chord.sixthOrSeventh) {
          case Chord.SixthOrSeventh.sixth:
            basicChordText += '6';
            break;
          case Chord.SixthOrSeventh.dominantSeventh:
            basicChordText += '7';
            break;
          case Chord.SixthOrSeventh.majorSeventh:
            basicChordText += 'M7';
            break;
        }
        if (basicChordText.length > 0) {
          return basicChordText;
        }
      }
      return null;
    },

    $_additionalChordText() {
      if (this.chord !== null) {
        if (isHalfDiminished7th(this.chord)) {
          return '-5';
        }
        switch (this.chord.triad) {
          case Chord.Triad.suspendedFourth:
            return 'sus4';
          case Chord.Triad.suspendedSecond:
            return 'sus2';
        }
      }
      return null;
    },

    $_sortedTensionNotes() {
      let sortedTensionNotes = new Array();
      if (this.chord !== null) {
        if (this.chord.tensions.has(TensionNotePitch.flatNinth)) {
          sortedTensionNotes.push(TensionNotePitch.flatNinth);
        }
        if (this.chord.tensions.has(TensionNotePitch.ninth)) {
          sortedTensionNotes.push(TensionNotePitch.ninth);
        }
        if (this.chord.tensions.has(TensionNotePitch.sharpNinth)) {
          sortedTensionNotes.push(TensionNotePitch.sharpNinth);
        }
        if (this.chord.tensions.has(TensionNotePitch.eleventh)) {
          sortedTensionNotes.push(TensionNotePitch.eleventh);
        }
        if (this.chord.tensions.has(TensionNotePitch.sharpEleventh)) {
          sortedTensionNotes.push(TensionNotePitch.sharpEleventh);
        }
        if (this.chord.tensions.has(TensionNotePitch.flatThirteenth)) {
          sortedTensionNotes.push(TensionNotePitch.flatThirteenth);
        }
        if (this.chord.tensions.has(TensionNotePitch.thirteenth)) {
          sortedTensionNotes.push(TensionNotePitch.thirteenth);
        }
        return (sortedTensionNotes.length > 0)? sortedTensionNotes : null;
      }
      return null;
    },

    $_fontSizePx() {
      return (this.fontSizePx === null)? this.$store.state.config.chordFontSizePx : this.fontSizePx;
    },

    $_chordTextStyle() {
      return {
        fontSize: String(this.$_fontSizePx * 0.8) + 'px',
        lineHeight: String(this.$_fontSizePx * 0.8) + 'px',
      };
    },
  },
};
</script>
