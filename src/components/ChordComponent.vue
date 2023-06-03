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
        <div v-if="$_sortedTensionNotes" id="tension-notes-container">
          (
          <div id="tension-notes">
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
@import url('https://fonts.googleapis.com/css2?family=Yusei+Magic:wght@400&display=swap');

#chord-container {
  font-family: 'Yusei Magic';
  color: #2c3e50;
  border-color: #2c3e50;
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

#tension-notes-container {
  display: flex;
  flex-flow: row;
  align-items: center;
}

#tension-notes {
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
import NotePitchComponent from './NotePitchComponent.vue'
import TensionNotePitchComponent from './TensionNotePitchComponent.vue'

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

    $_basicChordText() { return this.chord.basicChordText },

    $_additionalChordText() { return this.chord.additionalChordText },

    $_sortedTensionNotes() { return this.chord.sortedTensionNotes },

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
