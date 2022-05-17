<template>
  <dialog-base
    v-model="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:initialize-callback="$_initialize"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Chord Text</v-card-title>

      <v-card-text>
        <chord-component
          v-if="$data.$_parsedChord"
          v-bind:chord="$data.$_parsedChord"
          v-bind:font-size-px="12"
        />
        <v-form v-model="$data.$_valid">
          <v-text-field
            autofocus
            v-model="$data.$_chordText"
            v-bind:error="$_hasError"
            v-bind:error-messages="$data.$_parseErrorMessage"
            v-on:input="$_tryParseChordText"
            label="Chord Text"
          />
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script>
import DialogBase from './DialogBase.vue';
import Chord from '../../modules/Chord.js';
import ChordComponent from '../ChordComponent.vue';
import ChordTextParser from '../../modules/ChordTextParser.js';

export default {
  model: {
    prop: 'shows',
    event: 'update',
  },

  components: {
    DialogBase,
    ChordComponent,
  },

  props: {
    shows: { type: Boolean, default: false },
    callback: { type: Function, default: null },
    chord: { type: Chord },
  },

  data() {
    return {
      $_valid: true,
      $_chordText: '',
      $_parsedChord: null,
      $_parseErrorMessage: null,
    };
  },

  computed: {
    $_shows: {
      get()      { return this.shows },
      set(shows) { this.$emit('update', shows) },
    },

    $_hasError() {
      return (this.$data.$_parseErrorMessage !== null);
    },
  },

  methods: {
    $_initialize() {
      this.$data.$_chordText = String(this.chord);
    },

    $_ok() {
      if (this.callback) {
        this.callback({ chord: this.$data.$_chord });
      }
    },

    $_tryParseChordText(chordText) {
      try {
        this.$data.$_chord = ChordTextParser.parse(chordText);
        this.$data.$_parseErrorMessage = null;
      } catch (error) {
        this.$data.$_chord = null;
        if (error instanceof ChordTextParser.ParseError) {
          this.$data.$_parseErrorMessage = 'Invalid chord text.';
        } else {
          this.$data.$_parseErrorMessage = 'Unexpected error.';
        }
      }
    }
  },
}
</script>